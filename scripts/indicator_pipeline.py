"""
Indikaattoripipeline v1
=======================
Ryhmittelee ja analysoi indikaattorit suhteessa Suomen hyvinvointijärjestelmän
analyysiteemoihin. Tuottaa JSON-tiedostoja public/data/indicators/-hakemistoon.

ASKELET
───────
  1. theme_classify     – Luokittelee indicators_ref-taulun indikaattorit
                          teemoihin ja rooleihin (panos/tuotos/vaikuttavuus)
                          ja tallentaa metatiedot indicators_ref.metadata-kenttään.

  2. suitability_score  – Laskee jokaiselle indikaattorille soveltuvuuspisteet
                          suhteessa neljään analyysityyppiin:
                          aikasarja | pohjoismainen vertailu |
                          panos-tuotos | järjestelmävinouma

  3. export_indicators  – Vie teemakohtaiset JSON-tiedostot
                          public/data/indicators/<teema>.json sekä
                          yhteenvetotiedoston indicators_meta.json.

  4. export_theme_map   – Vie visualisointivalmiin teemakartan
                          public/data/indicators/theme_map.json
                          (D3-verkon lähde: teemat → j-koodit → indikaattorit).

  5. export_suitability – Vie soveltuvuusmatriisin
                          public/data/indicators/suitability_matrix.json.

Käyttö:
    python indicator_pipeline.py
    python indicator_pipeline.py --step theme_classify
    python indicator_pipeline.py --step export_indicators
    python indicator_pipeline.py --dry-run

Ympäristömuuttujat:
    TTT_SB_URL              (Supabase-projektin URL)
    TTT_SB_SERVICE_KEY      (service-key)
    TTT_EXPORT_DIR=public/data
"""

from __future__ import annotations

import argparse
import hashlib
import json
import logging
import math
import os
import sys
import traceback
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import pandas as pd
from dotenv import load_dotenv
from supabase import Client, create_client
from tenacity import retry, stop_after_attempt, wait_exponential

load_dotenv()

# ──────────────────────────────────────────────────────────────
# KONFIGURAATIO
# ──────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("ind")

SUPABASE_URL = os.environ.get("TTT_SB_URL") or os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = (os.environ.get("TTT_SB_SERVICE_KEY")
                or os.environ.get("SUPABASE_SERVICE_KEY", ""))

EXPORT_DIR = os.environ.get("TTT_EXPORT_DIR", "public/data")
INDICATORS_DIR = "indicators"  # alakansio EXPORT_DIR:n alla


# ──────────────────────────────────────────────────────────────
# TEEMALUOKITTELU
# ──────────────────────────────────────────────────────────────
#
# Rakenne:
#   teema_id   : lyhyt tunniste (käytetään tiedostonnimissä ja D3:ssa)
#   label      : suomenkielinen nimi
#   kuvaus     : lyhyt kuvaus analyyttisestä roolista
#   avainsanat : lista merkkijonoista joita etsitään indikaattorin nimestä,
#                external_id:stä ja category_name:sta (case-insensitive)
#   rooli      : oletus panos/tuotos/vaikuttavuus/rakenne jos ei muuta löydy

TEEMAT: list[dict] = [
    {
        "teema_id": "resurssit",
        "label": "Resurssit & Panostukset",
        "kuvaus": "Julkiset menot, henkilöstö ja rahoitusrakenne",
        "avainsanat": [
            "menot", "spending", "expenditure", "rahoitus", "funding",
            "budjetti", "budget", "henkilöstö", "staff", "workforce",
            "voimavara", "panostus", "investointi", "investment",
            "kustannus", "cost", "meur", "eur", "euro",
        ],
        "rooli": "panos",
    },
    {
        "teema_id": "saavutettavuus",
        "label": "Tuotokset & Saavutettavuus",
        "kuvaus": "Palvelujen käyttöaste, jonotusajat ja väestön peitto",
        "avainsanat": [
            "käynnit", "visit", "jonotus", "wait", "saatavuus", "access",
            "peitto", "coverage", "palvelut", "service", "käyttö", "utilization",
            "asiakkaat", "clients", "potilaat", "patients", "hoitopäivä",
            "asiakasmäärä", "volyymi", "volume", "suorite", "output",
        ],
        "rooli": "tuotos",
    },
    {
        "teema_id": "vaikuttavuus",
        "label": "Vaikuttavuus & Tulokset",
        "kuvaus": "Terveys-, koulutus- ja hyvinvointitulokset",
        "avainsanat": [
            "terveys", "health", "elinajanodote", "life expectancy",
            "kuolleisuus", "mortality", "syntyvyys", "fertility", "tfr",
            "koulutus", "education", "pisa", "osaaminen", "learning",
            "köyhyys", "poverty", "gini", "eriarvoisuus", "inequality",
            "hyvinvointi", "wellbeing", "onnellisuus", "happiness",
            "mielenterveys", "mental", "itsemurha", "suicide",
            "sairaus", "disease", "tautitaakka", "burden",
        ],
        "rooli": "vaikuttavuus",
    },
    {
        "teema_id": "tehokkuus",
        "label": "Tehokkuus & Panos-tuotos",
        "kuvaus": "Kustannus per yksikkö, tuottavuus ja vertailut",
        "avainsanat": [
            "tehokkuus", "efficiency", "tuottavuus", "productivity",
            "per capita", "asukasta kohti", "per asukas",
            "per opiskelija", "per potilas", "yksikkökustannus",
            "unit cost", "roi", "vaikuttavuussuhde",
        ],
        "rooli": "tuotos",
    },
    {
        "teema_id": "vinouma",
        "label": "Järjestelmän Vinouma & Oikeudenmukaisuus",
        "kuvaus": "Sosioekonominen gradientti, sukupuoli-, ikä- ja aluevinouma",
        "avainsanat": [
            "vinouma", "bias", "eriarvoisuus", "inequality", "gradientti",
            "sukupuoli", "gender", "ikä", "age", "alue", "regional",
            "sosioekonominen", "socioeconomic", "maahanmuuttaja", "immigrant",
            "yksityinen", "private", "julkinen", "public", "segregaatio",
            "oikeudenmukaisuus", "equity", "fairness",
        ],
        "rooli": "rakenne",
    },
    {
        "teema_id": "kestävyys",
        "label": "Kestävyys & Rakenne",
        "kuvaus": "Demografinen paine, rahoituksen kestävyys ja henkilöstön saatavuus",
        "avainsanat": [
            "huoltosuhde", "dependency ratio", "ikärakenne", "age structure",
            "väestö", "population", "ennuste", "forecast", "projection",
            "kestävyys", "sustainability", "eläke", "pension",
            "hoivatarve", "care need", "hoiva-aalto",
        ],
        "rooli": "rakenne",
    },
    {
        "teema_id": "pohjoismainen",
        "label": "Pohjoismaiset Vertailumittarit",
        "kuvaus": "OECD/Eurostat/Nordic Council -yhteismitalliset indikaattorit",
        "avainsanat": [
            "nordic", "pohjoismai", "ruotsi", "norja", "tanska",
            "sweden", "norway", "denmark", "oecd", "eurostat",
            "nomesco", "nososco", "vertailu", "comparison", "benchmark",
        ],
        "rooli": "vaikuttavuus",
    },
    {
        "teema_id": "elinkaari",
        "label": "Elinkaari & Väestöryhmät",
        "kuvaus": "Lapset, nuoret, työikäiset ja ikääntyneet palveluryhmittäin",
        "avainsanat": [
            "lapsi", "child", "nuori", "youth", "vanhus", "elderly",
            "ikääntyn", "aged", "perhe", "family", "äitiys", "maternity",
            "päivähoito", "daycare", "koulu", "school", "opiskelu",
            "lastensuojelu", "child protection", "elinkaari", "lifecycle",
        ],
        "rooli": "rakenne",
    },
    {
        "teema_id": "politiikka",
        "label": "Politiikka & Kausaalisuus",
        "kuvaus": "Poliittiset päätökset, viiveet ja kausaaliketjut",
        "avainsanat": [
            "laki", "law", "asetus", "decree", "hallitus", "government",
            "reformi", "reform", "uudistus", "muutos", "change",
            "viive", "lag", "kausaali", "causal", "vaikutus", "impact",
            "politiikka", "policy", "päätös", "decision",
        ],
        "rooli": "rakenne",
    },
]

# ──────────────────────────────────────────────────────────────
# ANALYYSITYYPIT
# ──────────────────────────────────────────────────────────────

ANALYYSITYYPIT = [
    "aikasarja",
    "pohjoismainen_vertailu",
    "panos_tuotos",
    "jarjestelmavinouma",
]


# ──────────────────────────────────────────────────────────────
# SOVELTUVUUSPISTEYTYSFUNKTIOT
# ──────────────────────────────────────────────────────────────

def score_aikasarja(row: dict, ts_j_codes: set, year_span: dict) -> float:
    """Soveltuvuus aikasarja-analyysiin (0.0–1.0).

    Kriteerit:
    - Indikaattorilla aikasarjadata (+0.4 + aikasarjan pituusbonus max +0.3)
    - ttt_pilari asetettu (+0.1)
    - year_start ja year_end asetettu (+0.2)
    """
    score = 0.0
    ext_id = row.get("external_id", "")
    if ext_id in ts_j_codes:
        score += 0.4
        span = year_span.get(ext_id, 0)
        score += min(span / 30.0, 1.0) * 0.3
    if row.get("ttt_pilari"):
        score += 0.1
    if row.get("year_start") and row.get("year_end"):
        try:
            span = int(row["year_end"]) - int(row["year_start"])
            score += min(span / 20.0, 1.0) * 0.2
        except (ValueError, TypeError):
            pass
    return round(min(score, 1.0), 3)


def score_pohjoismainen(row: dict, nordic_ids: set) -> float:
    """Soveltuvuus pohjoismaiseen vertailuun (0.0–1.0).

    Kriteerit:
    - Nordic-datassa mukana (+0.5)
    - Teema on 'pohjoismainen' (+0.2)
    - Nimi/kategoria sisältää nordic-avainsanan (+0.2)
    - Yksikkö on vertailukelpoinen (%, per 1000 jne.) (+0.1)
    """
    score = 0.0
    ext_id = row.get("external_id", "")
    if ext_id in nordic_ids:
        score += 0.5
    if "pohjoismainen" in row.get("_teemat", []):
        score += 0.2
    name_cat = (str(row.get("name", "")) + " " +
                str(row.get("category_name", ""))).lower()
    for kw in ["nordic", "pohjoismai", "oecd", "nomesco", "eurostat"]:
        if kw in name_cat:
            score += 0.2
            break
    unit = str(row.get("unit", "")).lower()
    if any(u in unit for u in ["%", "per 1000", "per 100000", "index", "indeksi"]):
        score += 0.1
    return round(min(score, 1.0), 3)


def score_panos_tuotos(row: dict, elasticity_ids: set) -> float:
    """Soveltuvuus panos-tuotos-analyysiin (0.0–1.0).

    Kriteerit:
    - Elasticities-dataa saatavilla (+0.4)
    - ROI asetettu ja positiivinen (+0.2)
    - Teema on 'resurssit' tai 'tehokkuus' (+0.2)
    - Rooli on 'panos' tai 'tuotos' (+0.2)
    """
    score = 0.0
    ext_id = row.get("external_id", "")
    if ext_id in elasticity_ids:
        score += 0.4
    roi = row.get("roi")
    if roi is not None:
        try:
            if float(roi) > 0:
                score += 0.2
        except (ValueError, TypeError):
            pass
    teemat = row.get("_teemat", [])
    if "resurssit" in teemat or "tehokkuus" in teemat:
        score += 0.2
    if row.get("_rooli") in ("panos", "tuotos"):
        score += 0.2
    return round(min(score, 1.0), 3)


def score_jarjestelmavinouma(row: dict) -> float:
    """Soveltuvuus järjestelmävinouma-analyysiin (0.0–1.0).

    Kriteerit:
    - Teema on 'vinouma' (+0.4)
    - Nimi sisältää vinouma-avainsanan (+0.3)
    - Yksikkö tai nimi viittaa eriteltyyn ryhmään (+0.2)
    - Teema on 'elinkaari' (+0.1)
    """
    score = 0.0
    teemat = row.get("_teemat", [])
    if "vinouma" in teemat:
        score += 0.4
    name_all = (str(row.get("name", "")) + " " +
                str(row.get("category_name", ""))).lower()
    vinouma_kw = [
        "sukupuoli", "gender", "alue", "region", "ikä", "age",
        "sosioekonominen", "maahanmuuttaja", "eriarvoisuus",
        "inequality", "gini", "gradientti",
    ]
    for kw in vinouma_kw:
        if kw in name_all:
            score += 0.3
            break
    unit = str(row.get("unit", "")).lower()
    if any(u in unit for u in ["sukupuoli", "gender", "alue", "ikäryhmä"]):
        score += 0.2
    if "elinkaari" in teemat:
        score += 0.1
    return round(min(score, 1.0), 3)


# ──────────────────────────────────────────────────────────────
# APULUOKAT
# ──────────────────────────────────────────────────────────────

@dataclass
class PipelineResult:
    step: str
    rows_updated: int = 0
    rows_inserted: int = 0
    rows_skipped: int = 0
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)

    def ok(self) -> bool:
        return len(self.errors) == 0

    def summary(self) -> str:
        return (
            f"{self.step}: +{self.rows_inserted} ins, "
            f"~{self.rows_updated} upd, "
            f"{self.rows_skipped} skip"
            + (f", {len(self.errors)} err" if self.errors else "")
            + (f", {len(self.warnings)} warn" if self.warnings else "")
        )


# ──────────────────────────────────────────────────────────────
# YHTEYS & APUFUNKTIOT
# ──────────────────────────────────────────────────────────────

def get_client() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise EnvironmentError(
            "TTT_SB_URL ja TTT_SB_SERVICE_KEY täytyy asettaa."
        )
    return create_client(SUPABASE_URL, SUPABASE_KEY)


_RETRY = retry(
    stop=stop_after_attempt(4),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    reraise=True,
)


@_RETRY
def _exec(query):
    return query.execute()


def fetch_df(client: Client, table: str, columns: str = "*",
             filters: Optional[dict] = None) -> pd.DataFrame:
    """Hakee taulun kaikki rivit sivuttaen (1000/pyyntö)."""
    all_rows: list[dict] = []
    offset, limit = 0, 1000
    while True:
        q = client.table(table).select(columns)
        if filters:
            for c, v in filters.items():
                q = q.eq(c, v)
        q = q.range(offset, offset + limit - 1)
        rows = (_exec(q).data) or []
        all_rows.extend(rows)
        if len(rows) < limit:
            break
        offset += limit
    return pd.DataFrame(all_rows)


def table_exists(client: Client, table: str) -> bool:
    try:
        _exec(client.table(table).select("*").limit(1))
        return True
    except Exception:
        return False


def upsert_metadata(client: Client, ind_id: str,
                    patch: dict, dry_run: bool) -> bool:
    """Päivittää indicators_ref.metadata jsonb-kentän merge-semantiikalla."""
    if dry_run:
        return True
    try:
        existing = _exec(
            client.table("indicators_ref")
            .select("metadata")
            .eq("id", ind_id)
            .limit(1)
        ).data
        current: dict = {}
        if existing and existing[0].get("metadata"):
            current = existing[0]["metadata"]
            if isinstance(current, str):
                current = json.loads(current)
        current.update(patch)
        _exec(
            client.table("indicators_ref")
            .update({"metadata": current})
            .eq("id", ind_id)
        )
        return True
    except Exception as e:
        log.warning(f"  metadata-päivitys epäonnistui {ind_id}: {e}")
        return False


def _sanitize(obj):
    """Muuntaa NaN/inf → None rekursiivisesti."""
    if isinstance(obj, float):
        return None if (math.isnan(obj) or math.isinf(obj)) else obj
    if isinstance(obj, dict):
        return {k: _sanitize(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_sanitize(v) for v in obj]
    return obj


def write_json(path: Path, data, dry_run: bool) -> str:
    """Kirjoittaa JSON-tiedoston ja palauttaa sha256[:16]."""
    payload = json.dumps(_sanitize(data), ensure_ascii=False,
                         indent=2, default=str)
    sha = hashlib.sha256(payload.encode("utf-8")).hexdigest()[:16]
    if not dry_run:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(payload, encoding="utf-8")
    return sha


# ──────────────────────────────────────────────────────────────
# ASKEL 1: TEEMALUOKITTELU
# ──────────────────────────────────────────────────────────────

def _classify_indicator(row: dict) -> tuple[list[str], str]:
    """Palauttaa (teemalista, rooli) indikaattorille avainsanahakuna."""
    haystack = " ".join([
        str(row.get("name", "")),
        str(row.get("external_id", "")),
        str(row.get("category_name", "")),
        str(row.get("ttt_pilari", "")),
    ]).lower()

    osuneet: list[str] = []
    for teema in TEEMAT:
        for kw in teema["avainsanat"]:
            if kw.lower() in haystack:
                osuneet.append(teema["teema_id"])
                break  # yksi osuma per teema riittää

    if not osuneet:
        osuneet = ["muu"]

    # Rooli ensimmäisestä osuneesta teemasta
    rooli = "rakenne"
    for teema in TEEMAT:
        if teema["teema_id"] in osuneet:
            rooli = teema["rooli"]
            break

    # ttt_pilari voi ylikirjoittaa roolin
    pilari = str(row.get("ttt_pilari", "")).lower()
    if "panos" in pilari or "input" in pilari:
        rooli = "panos"
    elif "tuotos" in pilari or "output" in pilari:
        rooli = "tuotos"
    elif "vaikuttavuus" in pilari or "outcome" in pilari:
        rooli = "vaikuttavuus"

    return osuneet, rooli


def step_theme_classify(client: Client, dry_run=False, since=None) -> PipelineResult:
    """Askel 1: Luokittelee indikaattorit teemoihin, tallentaa metadata-kenttään."""
    result = PipelineResult("theme_classify")
    log.info("ASKEL 1: Teemaluokittelu")

    df = fetch_df(client, "indicators_ref",
                  "id,external_id,name,category_id,category_name,"
                  "unit,ttt_pilari,roi,status,year_start,year_end,metadata")
    if df.empty:
        result.errors.append("indicators_ref tyhjä")
        return result

    log.info(f"  Luokitellaan {len(df)} indikaattoria...")
    teema_counts: dict[str, int] = {}

    for _, row in df.iterrows():
        row_dict = row.to_dict()
        teemat, rooli = _classify_indicator(row_dict)

        patch = {
            "ind_teemat": teemat,
            "ind_rooli": rooli,
            "ind_classified_at": datetime.now(timezone.utc).isoformat(),
        }
        ok = upsert_metadata(client, str(row["id"]), patch, dry_run)
        if ok:
            result.rows_updated += 1
        else:
            result.rows_skipped += 1

        for t in teemat:
            teema_counts[t] = teema_counts.get(t, 0) + 1

    log.info("  Teemajakauma:")
    for tid, cnt in sorted(teema_counts.items(), key=lambda x: -x[1]):
        log.info(f"    {tid:25s}: {cnt:4d}")

    log.info(f"  ✓ {result.rows_updated} päivitetty, {result.rows_skipped} ohitettu")
    return result


# ──────────────────────────────────────────────────────────────
# ASKEL 2: SOVELTUVUUSPISTEET
# ──────────────────────────────────────────────────────────────

def step_suitability_score(client: Client, dry_run=False, since=None) -> PipelineResult:
    """Askel 2: Laskee soveltuvuuspisteet neljälle analyysityypille."""
    result = PipelineResult("suitability_score")
    log.info("ASKEL 2: Soveltuvuuspisteet")

    df = fetch_df(client, "indicators_ref",
                  "id,external_id,name,category_name,unit,"
                  "ttt_pilari,roi,year_start,year_end,metadata")
    if df.empty:
        result.errors.append("indicators_ref tyhjä")
        return result

    # Referenssidata pisteytykseen
    ts_df = fetch_df(client, "time_series", "j_code,year")
    ts_j_codes: set = (set(ts_df["j_code"].dropna().unique())
                       if not ts_df.empty else set())
    year_span: dict[str, int] = {}
    if not ts_df.empty:
        for jc, grp in ts_df.groupby("j_code"):
            years = grp["year"].dropna()
            if len(years) > 1:
                year_span[jc] = int(years.max()) - int(years.min())

    nordic_ids: set = set()
    if table_exists(client, "nordic_indicators"):
        n_df = fetch_df(client, "nordic_indicators", "dataset_code")
        nordic_ids = set(n_df["dataset_code"].dropna().unique())
    if table_exists(client, "nordic_category_map"):
        nc_df = fetch_df(client, "nordic_category_map", "j_code")
        nordic_ids |= set(nc_df["j_code"].dropna().unique())

    elasticity_ids: set = set()
    if table_exists(client, "elasticities"):
        e_df = fetch_df(client, "elasticities", "j_code")
        elasticity_ids = set(e_df["j_code"].dropna().unique())

    log.info(f"  Referenssidata: {len(ts_j_codes)} ts j-koodia, "
             f"{len(nordic_ids)} nordic id:tä, "
             f"{len(elasticity_ids)} elasticity j-koodia")

    for _, row in df.iterrows():
        row_dict = row.to_dict()
        meta = row_dict.get("metadata") or {}
        if isinstance(meta, str):
            try:
                meta = json.loads(meta)
            except Exception:
                meta = {}
        row_dict["_teemat"] = meta.get("ind_teemat", [])
        row_dict["_rooli"] = meta.get("ind_rooli", "")

        scores = {
            "aikasarja":              score_aikasarja(row_dict, ts_j_codes, year_span),
            "pohjoismainen_vertailu": score_pohjoismainen(row_dict, nordic_ids),
            "panos_tuotos":           score_panos_tuotos(row_dict, elasticity_ids),
            "jarjestelmavinouma":     score_jarjestelmavinouma(row_dict),
        }
        paras = max(scores, key=lambda k: scores[k])

        patch = {
            "ind_suitability": scores,
            "ind_best_analysis": paras,
            "ind_scored_at": datetime.now(timezone.utc).isoformat(),
        }
        ok = upsert_metadata(client, str(row["id"]), patch, dry_run)
        if ok:
            result.rows_updated += 1
        else:
            result.rows_skipped += 1

    log.info(f"  ✓ {result.rows_updated} pisteytetty")
    return result


# ──────────────────────────────────────────────────────────────
# ASKEL 3: VIENTI – TEEMAKOHTAISET JSON:T
# ──────────────────────────────────────────────────────────────

def step_export_indicators(client: Client, dry_run=False, since=None) -> PipelineResult:
    """Askel 3: Vie teemakohtaiset JSON-tiedostot ja indicators_meta.json."""
    result = PipelineResult("export_indicators")
    log.info("ASKEL 3: Vie indikaattori-JSON:t")

    out_dir = Path(EXPORT_DIR) / INDICATORS_DIR

    df = fetch_df(client, "indicators_ref",
                  "id,external_id,name,category_id,category_name,"
                  "unit,ttt_pilari,roi,status,year_start,year_end,metadata")
    if df.empty:
        result.errors.append("indicators_ref tyhjä")
        return result

    rows_by_theme: dict[str, list] = {t["teema_id"]: [] for t in TEEMAT}
    rows_by_theme["muu"] = []
    all_rows: list[dict] = []

    for _, row in df.iterrows():
        row_dict = _sanitize(row.to_dict())
        meta = row_dict.get("metadata") or {}
        if isinstance(meta, str):
            try:
                meta = json.loads(meta)
            except Exception:
                meta = {}

        teemat = meta.get("ind_teemat") or []
        rooli = meta.get("ind_rooli", "")
        suitability = meta.get("ind_suitability", {})
        best_analysis = meta.get("ind_best_analysis", "")

        # Lennossa-luokittelu jos metadata puuttuu
        if not teemat:
            teemat, rooli = _classify_indicator(row_dict)

        enriched = {
            "id":            row_dict.get("id"),
            "external_id":   row_dict.get("external_id"),
            "name":          row_dict.get("name"),
            "category_name": row_dict.get("category_name"),
            "unit":          row_dict.get("unit"),
            "ttt_pilari":    row_dict.get("ttt_pilari"),
            "roi":           row_dict.get("roi"),
            "status":        row_dict.get("status"),
            "year_start":    row_dict.get("year_start"),
            "year_end":      row_dict.get("year_end"),
            "teemat":        teemat,
            "rooli":         rooli,
            "suitability":   suitability,
            "best_analysis": best_analysis,
        }
        all_rows.append(enriched)
        for t in (teemat if teemat else ["muu"]):
            rows_by_theme.setdefault(t, []).append(enriched)

    manifest_entries: dict[str, dict] = {}
    for teema_id, ind_list in rows_by_theme.items():
        if not ind_list:
            continue
        teema_label = next(
            (t["label"] for t in TEEMAT if t["teema_id"] == teema_id),
            teema_id,
        )
        payload = {
            "teema_id":     teema_id,
            "label":        teema_label,
            "count":        len(ind_list),
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "indicators":   ind_list,
        }
        fpath = out_dir / f"{teema_id}.json"
        sha = write_json(fpath, payload, dry_run)
        manifest_entries[teema_id] = {
            "file":      f"{INDICATORS_DIR}/{teema_id}.json",
            "label":     teema_label,
            "count":     len(ind_list),
            "sha256_16": sha,
        }
        result.rows_inserted += len(ind_list)
        log.info(f"    · {teema_id}.json ({len(ind_list)} indikaattoria)")

    # Yhteenvetotiedosto
    meta_payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total":        len(all_rows),
        "teemat": [
            {
                "teema_id":     t["teema_id"],
                "label":        t["label"],
                "kuvaus":       t["kuvaus"],
                "rooli_oletus": t["rooli"],
                "count":        len(rows_by_theme.get(t["teema_id"], [])),
            }
            for t in TEEMAT
        ],
        "analyysityypit": ANALYYSITYYPIT,
        "files":          manifest_entries,
    }
    sha = write_json(out_dir / "indicators_meta.json", meta_payload, dry_run)
    log.info(f"    · indicators_meta.json (sha={sha})")
    log.info(f"  ✓ {len(all_rows)} indikaattoria, "
             f"{len(manifest_entries)} teematiedostoa")
    return result


# ──────────────────────────────────────────────────────────────
# ASKEL 4: VIENTI – TEEMAKARTTA (D3-VERKKO)
# ──────────────────────────────────────────────────────────────

def step_export_theme_map(client: Client, dry_run=False, since=None) -> PipelineResult:
    """Askel 4: Vie D3-verkon lähdetiedosto theme_map.json.

    Solmutyypit:
      teema    – analyysiteema (9 kpl)
      jcode    – j-koodi (palvelusektori)
      indicator – yksittäinen indikaattori

    Linkkityypit:
      teema_jcode  – teema viittaa j-koodiin (teemaluokittelun kautta)
      jcode_ind    – j-koodi liittyy indikaattoriin (j_code_indicator-taulu)
    """
    result = PipelineResult("export_theme_map")
    log.info("ASKEL 4: Teemakartta (D3)")

    out_dir = Path(EXPORT_DIR) / INDICATORS_DIR

    ind_df  = fetch_df(client, "indicators_ref", "id,external_id,name,metadata")
    jci_df  = fetch_df(client, "j_code_indicator",
                       "j_code,indicator_id,relation_type,weight")
    jcm_df  = fetch_df(client, "j_codes", "code,name,level")

    if ind_df.empty:
        result.errors.append("indicators_ref tyhjä")
        return result

    id_to_ext  = dict(zip(ind_df["id"].astype(str), ind_df["external_id"]))
    id_to_name = dict(zip(ind_df["id"].astype(str), ind_df["name"]))
    id_to_meta: dict[str, dict] = {}
    for _, row in ind_df.iterrows():
        meta = row.get("metadata") or {}
        if isinstance(meta, str):
            try:
                meta = json.loads(meta)
            except Exception:
                meta = {}
        id_to_meta[str(row["id"])] = meta

    jc_name_map: dict[str, str] = {}
    if not jcm_df.empty:
        jc_name_map = dict(zip(jcm_df["code"], jcm_df["name"]))

    nodes: list[dict] = []
    links: list[dict] = []
    seen_nodes: set = set()
    seen_links: set = set()

    def add_node(nid: str, label: str, ntype: str, group: str = "", **kw):
        if nid not in seen_nodes:
            nodes.append({"id": nid, "label": label,
                          "type": ntype, "group": group, **kw})
            seen_nodes.add(nid)

    def add_link(src: str, tgt: str, ltype: str, weight: float = 1.0):
        key = f"{src}→{tgt}:{ltype}"
        if key not in seen_links:
            links.append({"source": src, "target": tgt,
                          "type": ltype, "weight": weight})
            seen_links.add(key)

    # Teema-solmut
    for t in TEEMAT:
        add_node(f"teema_{t['teema_id']}", t["label"], "teema",
                 group=t["teema_id"], kuvaus=t["kuvaus"])

    # J-koodi- ja indikaattorisolmut + linkit
    if not jci_df.empty:
        for _, link in jci_df.iterrows():
            ind_id  = str(link["indicator_id"])
            j_code  = str(link["j_code"])
            ext_id  = id_to_ext.get(ind_id, "")
            ind_name = id_to_name.get(ind_id, ext_id)
            teemat  = id_to_meta.get(ind_id, {}).get("ind_teemat", ["muu"])
            primary  = teemat[0] if teemat else "muu"

            add_node(f"jcode_{j_code}",
                     jc_name_map.get(j_code, j_code), "jcode", group=primary)
            add_node(f"ind_{ext_id}", ind_name, "indicator",
                     group=primary, external_id=ext_id)

            for t in teemat:
                add_link(f"teema_{t}", f"jcode_{j_code}", "teema_jcode", 0.5)

            w = float(link.get("weight") or 1.0)
            rt = str(link.get("relation_type") or "affects")
            add_link(f"jcode_{j_code}", f"ind_{ext_id}", rt, w)

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "node_count":   len(nodes),
        "link_count":   len(links),
        "node_types":   ["teema", "jcode", "indicator"],
        "link_types":   ["teema_jcode", "affects", "outcome", "input"],
        "nodes":        nodes,
        "links":        links,
    }
    sha = write_json(out_dir / "theme_map.json", payload, dry_run)
    result.rows_inserted = len(nodes) + len(links)
    log.info(f"  ✓ theme_map.json: {len(nodes)} solmua, "
             f"{len(links)} linkkiä (sha={sha})")
    return result


# ──────────────────────────────────────────────────────────────
# ASKEL 5: VIENTI – SOVELTUVUUSMATRIISI
# ──────────────────────────────────────────────────────────────

def step_export_suitability(client: Client, dry_run=False, since=None) -> PipelineResult:
    """Askel 5: Vie soveltuvuusmatriisi suitability_matrix.json."""
    result = PipelineResult("export_suitability")
    log.info("ASKEL 5: Soveltuvuusmatriisi")

    out_dir = Path(EXPORT_DIR) / INDICATORS_DIR

    df = fetch_df(client, "indicators_ref",
                  "external_id,name,category_name,ttt_pilari,metadata")
    if df.empty:
        result.errors.append("indicators_ref tyhjä")
        return result

    matrix_rows: list[dict] = []
    for _, row in df.iterrows():
        meta = row.get("metadata") or {}
        if isinstance(meta, str):
            try:
                meta = json.loads(meta)
            except Exception:
                meta = {}

        suitability = meta.get("ind_suitability", {})
        if not suitability:
            continue  # pisteytyaskel ei ole ajettu → ohita

        matrix_rows.append({
            "external_id":   row.get("external_id"),
            "name":          row.get("name"),
            "category_name": row.get("category_name"),
            "teemat":        meta.get("ind_teemat", []),
            "rooli":         meta.get("ind_rooli", ""),
            "best_analysis": meta.get("ind_best_analysis", ""),
            **{f"score_{k}": v for k, v in suitability.items()},
        })

    # Järjestä parhaan yksittäispisteen mukaan
    matrix_rows.sort(
        key=lambda r: max((r.get(f"score_{a}", 0) or 0) for a in ANALYYSITYYPIT),
        reverse=True,
    )

    payload = {
        "generated_at":  datetime.now(timezone.utc).isoformat(),
        "analyysityypit": ANALYYSITYYPIT,
        "count":         len(matrix_rows),
        "matrix":        matrix_rows,
    }
    sha = write_json(out_dir / "suitability_matrix.json", payload, dry_run)
    result.rows_inserted = len(matrix_rows)
    log.info(f"  ✓ suitability_matrix.json: "
             f"{len(matrix_rows)} indikaattoria (sha={sha})")
    return result


# ──────────────────────────────────────────────────────────────
# PÄÄOHJELMA
# ──────────────────────────────────────────────────────────────

STEPS = {
    "theme_classify":     step_theme_classify,
    "suitability_score":  step_suitability_score,
    "export_indicators":  step_export_indicators,
    "export_theme_map":   step_export_theme_map,
    "export_suitability": step_export_suitability,
}

DEFAULT_ORDER = [
    "theme_classify",       # 1. Luokittele teemat → indicators_ref.metadata
    "suitability_score",    # 2. Laske soveltuvuuspisteet → metadata
    "export_indicators",    # 3. Vie teemakohtaiset JSON:t
    "export_theme_map",     # 4. Vie D3-verkko
    "export_suitability",   # 5. Vie soveltuvuusmatriisi
]


def run_pipeline(steps: list[str], dry_run: bool = False, since=None):
    client = get_client()
    run_id = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    log.info("=" * 60)
    log.info(f"INDIKAATTORIPIPELINE v1  run_id={run_id}  "
             f"{'[DRY-RUN] ' if dry_run else ''}"
             f"{'since=' + since if since else ''}")
    log.info("=" * 60)

    results, start = [], datetime.now()
    for s in steps:
        fn = STEPS.get(s)
        if not fn:
            log.warning(f"Tuntematon askel: {s}")
            continue
        try:
            res = fn(client, dry_run=dry_run, since=since)
            results.append(res)
            log.info(f"  → {res.summary()}")
        except Exception as e:
            log.error(f"  ASKEL {s} kaatui: {e}")
            log.debug(traceback.format_exc())
            results.append(PipelineResult(s, errors=[str(e)]))

    elapsed = (datetime.now() - start).total_seconds()
    log.info("=" * 60)
    log.info(f"Valmis {elapsed:.1f}s -- {len(results)} askelta")
    for r in results:
        log.info(f"  {'✓' if r.ok() else '✗'} {r.summary()}")
    log.info("=" * 60)

    if any(not r.ok() for r in results):
        sys.exit(1)


def main():
    p = argparse.ArgumentParser(description="Indikaattoripipeline v1")
    p.add_argument("--step", choices=list(STEPS.keys()),
                   help="Aja vain yksi askel")
    p.add_argument("--dry-run", action="store_true",
                   help="Ei kirjoita tietokantaan eikä tiedostoihin")
    p.add_argument("--since", metavar="YYYY-MM-DD",
                   help="Suodata muuttuneet rivit tämän päivämäärän jälkeen")
    a, _ = p.parse_known_args()
    run_pipeline(
        [a.step] if a.step else DEFAULT_ORDER,
        dry_run=a.dry_run,
        since=a.since,
    )


if __name__ == "__main__":
    main()
