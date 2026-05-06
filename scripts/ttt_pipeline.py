"""
TTT-analyysipipeline v3
=======================
Päivittää Supabase-laskennat. v3-muutokset (vrt. v2):

  KORJAUKSET
  ──────────
  * `tfr_forecast`-skeemamatch korjattu: pipeline kirjoittaa nyt erilliseen
    `tfr_forecast_yearly`-tauluun (vuositaso) ja jättää `tfr_forecast`-taulun
    skenaariotauluksi (model_id, scenario, naiset_osa_pct, ...).
  * `hoiva_aalto_projection`-skeemamatch korjattu: kirjoitetaan
    `hoiva_aalto_yearly`-tauluun (population_75plus + tarve-ennusteet),
    alkuperäinen taulu jätetään käsin ylläpidettäväksi 85+-aalloille.

  UUDET ASKELEET
  ──────────────
  * step_nordic_correlations  — käyttää `nordic_category_map`-taulua ja laskee
    Suomen sektorimenojen ja muiden Pohjoismaiden vastaavien indikaattoreiden
    väliset korrelaatiot. Ratkaisee suurimman analyyttisen aukon.
  * step_cofog_link            — käyttää `j_code_cofog`-taulua: laskee
    j_code-tasoiset summat `cofog_amounts`-datasta, kirjoittaa
    `cofog_jcode_amounts` (uusi taulu / view-tyyppinen aggregaatti).
  * step_causal_chains_sync    — päivittää `causal_chains`-taulun rivit
    elasticities-tuloksista: jokainen vahva/kohtalainen elasticity → ketjun
    ehdotus-taso ("auto"-confidence). Käsin verified-rivejä ei kosketa.
  * step_regression_results_sync — synkronoi `ols_coefficients` →
    `regression_results` (vanha päällekkäinen taulu pidetään ajan tasalla
    kunnes voidaan poistaa).
  * step_export_views          — vie `v_*`-näkymät JSONiksi
    `public/data/views/<view>.json`. Avaa 40 valmista analyysiä
    lukijaversiolle.

  PARANNUKSET
  ───────────
  * `j_code_indicator.weight` ja `relation_type` käytössä elasticities-
    rivien painotuksessa: pipeline tallentaa nyt `expected_direction` ja
    merkitsee `direction_match` jos tulos vastaa odotusta.
  * Kaikki v2:n tilastolaajennukset säilyvät (FDR, ADF, bootstrap, Granger,
    detrend, diff).

Käyttö:
    python ttt_pipeline.py
    python ttt_pipeline.py --step nordic_correlations
    python ttt_pipeline.py --dry-run
    python ttt_pipeline.py --since 2024-01-01

Ympäristömuuttujat:
    TTT_SB_URL                  (Supabase-projektin URL)
    TTT_SB_SERVICE_KEY          (service-key, secrets-tools kautta)
    TTT_EXPORT_DIR=public/data
    TTT_FDR_ALPHA=0.05
    TTT_BOOTSTRAP_N=2000

Huom: Tämä versio on yhteensopiva v2:n kanssa — kaikki v2-askeleet löytyvät
edelleen, ja DEFAULT_ORDER on järjestetty uusien jälkeen niin että
elasticities ajetaan ennen causal_chains_sync.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import logging
import os
import subprocess
import sys
import traceback
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd
from dotenv import load_dotenv
from scipy import stats
from scipy.stats import pearsonr, shapiro
from sklearn.preprocessing import StandardScaler
from statsmodels.regression.linear_model import OLS
from statsmodels.stats.multitest import multipletests
from statsmodels.stats.outliers_influence import variance_inflation_factor
from statsmodels.tools import add_constant
from statsmodels.tsa.stattools import adfuller, grangercausalitytests
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
log = logging.getLogger("ttt")

# Tukee sekä TTT_SB_*- että SUPABASE_*-nimiä (taaksepäin yhteensopivuus)
SUPABASE_URL = os.environ.get("TTT_SB_URL") or os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = (os.environ.get("TTT_SB_SERVICE_KEY")
                or os.environ.get("SUPABASE_SERVICE_KEY", ""))

MIN_OBSERVATIONS = 10
LAG_RANGE = range(0, 11)
FDR_ALPHA = float(os.environ.get("TTT_FDR_ALPHA", "0.05"))
BOOTSTRAP_N = int(os.environ.get("TTT_BOOTSTRAP_N", "2000"))
BOOTSTRAP_THRESHOLD_N = 50
EXPORT_DIR = os.environ.get("TTT_EXPORT_DIR", "public/data")

CONFIDENCE_THRESHOLDS = {
    "vahva":       0.70,
    "kohtalainen": 0.45,
    "heikko":      0.0,
}

# Kaikki v_* + per_capita_trend näkymät jotka viedään JSONiksi
EXPORT_VIEWS = [
    "v_signal", "v_signal_full_chain", "v_signal_funding_paradox",
    "v_signal_leverage", "v_signal_policy_lag", "v_signal_counterfactual",
    "v_signal_counterfactual_v2", "v_signal_drift", "v_policy_signal",
    "v_causal_chain_full", "v_causal_chain_summary",
    "v_crisis_chain_timeline", "v_crisis_lifecycle", "v_crisis_summary",
    "v_crisis_timeseries", "v_crisis_wake",
    "v_demographic_pressure", "v_fertility_housing", "v_housing_fertility_chain",
    "v_population_trend", "v_population_weighted", "v_fi_tfr",
    "v_funding_by_jcode", "v_spending_by_age_band",
    "v_hoiva_aalto_summary", "v_intervention_simulation",
    "v_interventions_by_lifecycle", "v_lag_analysis_osa_aikatyo",
    "v_regression_syntyvyys", "v_segment_panel",
    "v_nordic_alcohol", "v_nordic_fertility", "v_nordic_fertility_trend",
    "v_nordic_fi_comparison", "v_nordic_finland_gap",
    "v_nordic_finland_vs_peers", "v_nordic_health_expenditure",
    "v_nordic_health_spending", "v_nordic_health_workforce",
    "v_nordic_mental_health", "v_nordic_paradox_benchmark",
    "v_nordic_socexp_by_lifecycle", "v_nordic_social_spending",
    "v_nordic_suicide",
    "per_capita_trend", "sector_efficiency_snapshot",
    "sector_spending_per_capita",
]

EXPORT_TABLES = {
    "sectors": "sectors",
    "sector_series": "sector_series",
    "sector_target_population": "sector_target_population",
    "sector_jcode_map": "sector_jcode_map",
    "j_codes": "j_codes",
    "j_code_indicator": "j_code_indicator",
    "j_code_cofog": "j_code_cofog",
    "j_code_lifecycle": "j_code_lifecycle",
    "lifecycle_groups": "lifecycle_groups",
    "indicators_ref": "indicators_ref",
    "time_series": "time_series",
    "elasticities": "elasticities",
    "ols_models": "ols_models",
    "ols_coefficients": "ols_coefficients",
    "statistical_tests": "statistical_tests",
    "regression_results": "regression_results",
    "panel_datasets": "panel_datasets",
    "panel_heterogeneity": "panel_heterogeneity",
    "tfr_forecast": "tfr_forecast",
    "hoiva_aalto_projection": "hoiva_aalto_projection",
    "nordic_indicators": "nordic_indicators",
    "nordic_category_map": "nordic_category_map",
    "ttt_essays": "ttt_essays",
    "ttt_chapters": "ttt_chapters",
    "ttt_blocks": "ttt_blocks",
    "amounts": "amounts",
    "cofog_amounts": "cofog_amounts",
    "cofog_codes": "cofog_codes",
    "causal_chains": "causal_chains",
    "crisis_events": "crisis_events",
    "policy_decisions": "policy_decisions",
    "intervention_definitions": "intervention_definitions",
    "prevention_package": "prevention_package",
    "fact_intervention_evidence": "fact_intervention_evidence",
}


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
        )


def _git_sha() -> str:
    try:
        return subprocess.check_output(
            ["git", "rev-parse", "--short", "HEAD"],
            stderr=subprocess.DEVNULL, text=True
        ).strip() or "nogit"
    except Exception:
        return "nogit"


RUN_ID = f"{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}_{_git_sha()}"


# ──────────────────────────────────────────────────────────────
# TILASTOAPUFUNKTIOT (v2:sta)
# ──────────────────────────────────────────────────────────────

def confidence_label(r: float, p_adj: float) -> Optional[str]:
    if p_adj >= 0.05 or np.isnan(p_adj):
        return None
    absr = abs(r)
    if absr >= CONFIDENCE_THRESHOLDS["vahva"] and p_adj < 0.01:
        return "vahva"
    if absr >= CONFIDENCE_THRESHOLDS["kohtalainen"]:
        return "kohtalainen"
    return "heikko"


def detrend(series: np.ndarray) -> np.ndarray:
    t = np.arange(len(series))
    slope, intercept, *_ = stats.linregress(t, series)
    return series - (slope * t + intercept)


def adf_pvalue(series: np.ndarray) -> Optional[float]:
    if len(series) < 8:
        return None
    try:
        return float(adfuller(series, autolag="AIC")[1])
    except Exception:
        return None


def diff_pearson(x, y):
    if len(x) < 3:
        return (np.nan, np.nan)
    dx, dy = np.diff(x), np.diff(y)
    if np.std(dx) == 0 or np.std(dy) == 0:
        return (np.nan, np.nan)
    try:
        r, p = pearsonr(dx, dy)
        return (float(r), float(p))
    except Exception:
        return (np.nan, np.nan)


def detrended_pearson(x, y):
    if len(x) < 4:
        return (np.nan, np.nan)
    try:
        r, p = pearsonr(detrend(x), detrend(y))
        return (float(r), float(p))
    except Exception:
        return (np.nan, np.nan)


def bootstrap_ci_r(x, y, n_boot=BOOTSTRAP_N, alpha=0.05, seed=42):
    rng = np.random.default_rng(seed)
    n = len(x)
    if n < 4:
        return (np.nan, np.nan)
    rs = np.empty(n_boot)
    for i in range(n_boot):
        idx = rng.integers(0, n, n)
        xs, ys = x[idx], y[idx]
        if np.std(xs) == 0 or np.std(ys) == 0:
            rs[i] = np.nan
            continue
        rs[i] = np.corrcoef(xs, ys)[0, 1]
    rs = rs[~np.isnan(rs)]
    if len(rs) < 10:
        return (np.nan, np.nan)
    return (float(np.percentile(rs, 100 * alpha / 2)),
            float(np.percentile(rs, 100 * (1 - alpha / 2))))


def granger_min_p(x, y, maxlag=4):
    if len(x) < maxlag * 3 + 5:
        return None
    df = pd.DataFrame({"y": y, "x": x}).dropna()
    if len(df) < maxlag * 3 + 5:
        return None
    try:
        res = grangercausalitytests(df[["y", "x"]].values, maxlag=maxlag, verbose=False)
        return float(min(res[lag][0]["ssr_ftest"][1] for lag in res))
    except Exception:
        return None


# ──────────────────────────────────────────────────────────────
# YHTEYS
# ──────────────────────────────────────────────────────────────

def get_client() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise EnvironmentError(
            "TTT_SB_URL ja TTT_SB_SERVICE_KEY täytyy asettaa."
        )
    return create_client(SUPABASE_URL, SUPABASE_KEY)


_RETRY = retry(stop=stop_after_attempt(4),
               wait=wait_exponential(multiplier=1, min=1, max=10),
               reraise=True)


@_RETRY
def _exec(query):
    return query.execute()


def fetch_df(client: Client, table: str, columns: str = "*",
             filters: Optional[dict] = None) -> pd.DataFrame:
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


def upsert(client: Client, table: str, rows: list[dict],
           on_conflict: str, dry_run: bool = False, chunk: int = 500) -> int:
    if not rows:
        return 0
    if dry_run:
        log.info(f"  [dry-run] {table}: {len(rows)} riviä")
        return 0
    total = 0
    for i in range(0, len(rows), chunk):
        ch = rows[i:i + chunk]
        resp = _exec(client.table(table).upsert(ch, on_conflict=on_conflict))
        total += len(resp.data or ch)
    return total


def table_exists(client: Client, table: str) -> bool:
    try:
        _exec(client.table(table).select("*").limit(1))
        return True
    except Exception:
        return False


# ──────────────────────────────────────────────────────────────
# ASKEL 1: PER-CAPITA
# ──────────────────────────────────────────────────────────────

def step_per_capita(client, dry_run=False, since=None) -> PipelineResult:
    result = PipelineResult("per_capita")
    log.info("ASKEL 1: Per-capita")

    nom_df = fetch_df(client, "sector_series", "sector_key,year,value",
                      {"basis": "nominal"})
    if nom_df.empty:
        result.errors.append("sector_series nominal tyhjä")
        return result

    pop_df = fetch_df(client, "sector_target_population",
                      "sector_id,year,population")
    if pop_df.empty:
        result.warnings.append("sector_target_population tyhjä")
        return result

    sec_df = fetch_df(client, "sectors", "id,key")
    sec_map = dict(zip(sec_df["id"], sec_df["key"]))
    pop_df["sector_key"] = pop_df["sector_id"].map(sec_map)

    pop_interp = {}
    for sk, grp in pop_df.dropna(subset=["sector_key"]).groupby("sector_key"):
        s = grp.sort_values("year").set_index("year")["population"].astype(float)
        full_idx = range(int(s.index.min()), int(s.index.max()) + 1)
        pop_interp[sk] = s.reindex(full_idx).interpolate("linear").to_dict()

    year_filter = int(since[:4]) if since else 0
    rows = []
    for _, row in nom_df.iterrows():
        sk, yr = row["sector_key"], int(row["year"])
        if yr < year_filter:
            continue
        nom = row["value"]
        if nom is None or pd.isna(nom):
            continue
        pop = pop_interp.get(sk, {}).get(yr)
        if not pop:
            result.rows_skipped += 1
            continue
        rows.append({"sector_key": sk, "year": yr, "basis": "per_capita_target",
                     "value": round(float(nom) * 1_000_000 / float(pop), 2)})

    n = upsert(client, "sector_series", rows,
               on_conflict="sector_key,year,basis", dry_run=dry_run)
    result.rows_updated = n
    log.info(f"  ✓ {n} per-capita")
    return result


# ──────────────────────────────────────────────────────────────
# ASKEL 2: ELASTICITIES (FDR + stationaarisuus + bootstrap + Granger
#           + j_code_indicator.weight & relation_type huomioitu)
# ──────────────────────────────────────────────────────────────

def _best_lag(x_series, y_series):
    best = (0.0, 1.0, 0, 0)
    for lag in LAG_RANGE:
        x_shift = x_series.copy()
        x_shift.index = x_shift.index + lag
        common = x_shift.index.intersection(y_series.index)
        if len(common) < MIN_OBSERVATIONS:
            continue
        xv = x_shift.loc[common].values
        yv = y_series.loc[common].values
        if np.std(xv) == 0 or np.std(yv) == 0:
            continue
        try:
            r, p = pearsonr(xv, yv)
        except Exception:
            continue
        if abs(r) > abs(best[0]):
            best = (float(r), float(p), lag, len(common))
    return best


def step_elasticities(client, dry_run=False, since=None) -> PipelineResult:
    result = PipelineResult("elasticities")
    log.info("ASKEL 2: Elasticities (FDR + stationaarisuus + Granger)")

    links_df = fetch_df(client, "j_code_indicator",
                        "j_code,indicator_id,relation_type,weight,notes")
    if links_df.empty:
        result.warnings.append("j_code_indicator tyhjä")
        return result

    ind_df = fetch_df(client, "indicators_ref", "id,external_id,name")
    ind_map = dict(zip(ind_df["id"], ind_df["external_id"]))

    ts_df = fetch_df(client, "time_series", "j_code,year,value")
    ts_pivot = ts_df.pivot_table(index="year", columns="j_code",
                                 values="value", aggfunc="mean")

    sec_df = fetch_df(client, "sector_series", "sector_key,year,value",
                     {"basis": "nominal"})
    sec_pivot = sec_df.pivot_table(index="year", columns="sector_key",
                                   values="value", aggfunc="mean")

    sec_jmap = fetch_df(client, "sector_jcode_map", "j_code,sector_key,weight")
    jcode_sector = dict(zip(sec_jmap["j_code"], sec_jmap["sector_key"]))

    existing = fetch_df(client, "elasticities",
                        "j_code,indicator_id,lag_years,verified")
    verified = set()
    if not existing.empty and "verified" in existing.columns:
        verified = {(r.j_code, r.indicator_id, int(r.lag_years))
                    for _, r in existing.iterrows() if bool(r.get("verified"))}

    year_filter = int(since[:4]) if since else None
    candidates = []

    for _, link in links_df.iterrows():
        j_code = link["j_code"]
        ind_id = link["indicator_id"]
        ext_id = ind_map.get(ind_id)
        rel_type = link.get("relation_type")  # esim. "outcome", "input"
        link_weight = link.get("weight")
        if not ext_id:
            continue

        if ext_id in ts_pivot.columns:
            y_series = ts_pivot[ext_id].dropna()
        elif j_code in ts_pivot.columns:
            y_series = ts_pivot[j_code].dropna()
        else:
            result.rows_skipped += 1
            continue

        sector_key = jcode_sector.get(j_code)
        if sector_key and sector_key in sec_pivot.columns:
            x_series = sec_pivot[sector_key].dropna()
        elif j_code in sec_pivot.columns:
            x_series = sec_pivot[j_code].dropna()
        else:
            result.rows_skipped += 1
            continue

        if year_filter:
            x_series = x_series[x_series.index >= year_filter]
            y_series = y_series[y_series.index >= year_filter]

        r, p, lag, n_obs = _best_lag(x_series, y_series)
        if n_obs < MIN_OBSERVATIONS:
            result.rows_skipped += 1
            continue

        x_shift = x_series.copy()
        x_shift.index = x_shift.index + lag
        common = x_shift.index.intersection(y_series.index)
        xv = x_shift.loc[common].values.astype(float)
        yv = y_series.loc[common].values.astype(float)

        adf_x = adf_pvalue(xv)
        adf_y = adf_pvalue(yv)
        r_diff, p_diff = diff_pearson(xv, yv)
        r_dt, p_dt = detrended_pearson(xv, yv)
        ci_lo, ci_hi = (bootstrap_ci_r(xv, yv) if n_obs < BOOTSTRAP_THRESHOLD_N
                        else (np.nan, np.nan))
        granger_p = granger_min_p(xv, yv, maxlag=min(4, max(1, n_obs // 4)))

        if (j_code, ind_id, lag) in verified:
            result.rows_skipped += 1
            continue

        # Suunnan odotus j_code_indicator.relation_type:stä
        # outcome → odotamme vahvaa korrelaatiota (suunta riippuu indikaattorista)
        # input   → odotamme positiivista (rahoitus auttaa)
        expected = None
        if rel_type and "input" in str(rel_type).lower():
            expected = "positiivinen"
        direction = "positiivinen" if r > 0 else "negatiivinen"

        candidates.append({
            "j_code": j_code, "indicator_id": ind_id,
            "lag_years": int(lag),
            "r": round(r, 4), "p_value": round(p, 6),
            "n": int(n_obs), "direction": direction,
            "verified": False,
            "r_diff": None if np.isnan(r_diff) else round(r_diff, 4),
            "p_diff": None if np.isnan(p_diff) else round(p_diff, 6),
            "r_detrended": None if np.isnan(r_dt) else round(r_dt, 4),
            "p_detrended": None if np.isnan(p_dt) else round(p_dt, 6),
            "adf_p_x": None if adf_x is None else round(adf_x, 4),
            "adf_p_y": None if adf_y is None else round(adf_y, 4),
            "ci_low": None if np.isnan(ci_lo) else round(ci_lo, 4),
            "ci_high": None if np.isnan(ci_hi) else round(ci_hi, 4),
            "granger_p": None if granger_p is None else round(granger_p, 6),
            "link_weight": float(link_weight) if link_weight is not None else None,
            "expected_direction": expected,
            "direction_match": (expected == direction) if expected else None,
            "model_run_id": RUN_ID,
            "notes": (
                f"v3 auto {datetime.now(timezone.utc).date()} | "
                f"lag={lag} |r|={abs(r):.3f} n={n_obs}"
            ),
        })

    if candidates:
        ps = np.array([c["p_value"] for c in candidates])
        try:
            reject, p_adj, _, _ = multipletests(ps, alpha=FDR_ALPHA, method="fdr_bh")
        except Exception:
            p_adj, reject = ps, ps < FDR_ALPHA
        for c, pa, rej in zip(candidates, p_adj, reject):
            c["p_adjusted"] = round(float(pa), 6)
            c["significant_fdr"] = bool(rej)
            c["confidence"] = confidence_label(c["r"], float(pa))

    rows = [c for c in candidates if c.get("confidence") is not None]
    result.rows_skipped += len(candidates) - len(rows)

    n = upsert(client, "elasticities", rows,
               on_conflict="j_code,indicator_id,lag_years", dry_run=dry_run)
    result.rows_inserted = n
    log.info(f"  ✓ {n} elasticities (FDR α={FDR_ALPHA})")
    return result


# ──────────────────────────────────────────────────────────────
# ASKEL 3: OLS (v2:sta — paneelilaajennus TODO v4)
# ──────────────────────────────────────────────────────────────

DEFAULT_MODELS = [
    {"model_id": "tfr_selittajat_2010_2024", "outcome": "syntyvyys_tfr",
     "predictors": ["nuorisotyottomyys_1524", "asumiskustannusten_tulo_osuus",
                    "naiset_osaaikatyo_pct_2534"],
     "period": "2010-2024", "notes": "TFR-selittäjämalli"},
    {"model_id": "mt_panos_tuotos", "outcome": "mt_itsemurhat",
     "predictors": ["mt_avohoito_kaynteja", "mt_tyokyvyttomyyselakkeet"],
     "period": "2003-2023", "notes": "MT-panos-tuotos"},
    {"model_id": "lastensuojelu_ennuste", "outcome": "huostassa_olevat_lapset",
     "predictors": ["lastensuojelu_avohuolto", "lapsikoyhyysaste",
                    "mt_oireilu_nuoret"],
     "period": "2003-2023", "notes": "Lastensuojelun selittäjät"},
]


def _load_models(client):
    if not table_exists(client, "model_specs"):
        return DEFAULT_MODELS
    df = fetch_df(client, "model_specs",
                  "model_id,outcome,predictors,period,notes")
    if df.empty:
        return DEFAULT_MODELS
    out = []
    for _, r in df.iterrows():
        preds = r["predictors"]
        if isinstance(preds, str):
            try:
                preds = json.loads(preds)
            except Exception:
                preds = [p.strip() for p in preds.split(",")]
        out.append({"model_id": r["model_id"], "outcome": r["outcome"],
                    "predictors": preds, "period": r["period"],
                    "notes": r.get("notes") or ""})
    return out


def step_ols(client, dry_run=False, since=None) -> PipelineResult:
    result = PipelineResult("ols")
    log.info("ASKEL 3: OLS-regressiot")

    ts_df = fetch_df(client, "time_series", "j_code,year,value")
    if ts_df.empty:
        result.warnings.append("time_series tyhjä")
        return result
    pivot = ts_df.pivot_table(index="year", columns="j_code",
                              values="value", aggfunc="mean")

    models_spec = _load_models(client)
    model_rows, coef_rows, test_rows = [], [], []
    scaler = StandardScaler()

    for spec in models_spec:
        outcome = spec["outcome"]
        if outcome not in pivot.columns:
            result.warnings.append(f"{spec['model_id']}: outcome puuttuu")
            continue
        avail = [p for p in spec["predictors"] if p in pivot.columns]
        if not avail:
            result.warnings.append(f"{spec['model_id']}: ei selittäjiä")
            continue

        data = pivot[[outcome] + avail].dropna()
        if "-" in spec["period"]:
            y1, y2 = [int(x) for x in spec["period"].split("-")]
            data = data[(data.index >= y1) & (data.index <= y2)]
        if len(data) < MIN_OBSERVATIONS:
            result.warnings.append(f"{spec['model_id']}: vain {len(data)} hav.")
            continue

        Y = data[outcome].values.astype(float)
        X_raw = data[avail].values.astype(float)
        X_std = scaler.fit_transform(X_raw)
        try:
            X_sm = add_constant(X_std)
            m = OLS(Y, X_sm).fit()
        except Exception as e:
            result.errors.append(f"{spec['model_id']}: {e}")
            continue

        try:
            psum = m.get_prediction(X_sm).summary_frame(alpha=0.05)
            ci_lo_mean = float(psum["mean_ci_lower"].mean())
            ci_hi_mean = float(psum["mean_ci_upper"].mean())
        except Exception:
            ci_lo_mean = ci_hi_mean = None

        model_rows.append({
            "model_id": spec["model_id"], "outcome": outcome,
            "period": spec["period"], "n": len(data),
            "r2": round(float(m.rsquared), 4),
            "r2_adj": round(float(m.rsquared_adj), 4),
            "f_stat": round(float(m.fvalue), 4),
            "f_p": round(float(m.f_pvalue), 6),
            "aic": round(float(m.aic), 2), "bic": round(float(m.bic), 2),
            "ci_low_mean": ci_lo_mean, "ci_high_mean": ci_hi_mean,
            "model_run_id": RUN_ID, "notes": spec.get("notes", ""),
        })

        per_p, per_idx = [], []
        for i, pred in enumerate(avail):
            idx = i + 1
            vif = (float(variance_inflation_factor(X_sm, idx))
                   if len(avail) > 1 else None)
            p_val = float(m.pvalues[idx])
            per_p.append(p_val)
            coef_rows.append({
                "model_id": spec["model_id"], "predictor": pred,
                "beta_std": round(float(m.params[idx]), 4),
                "beta_raw": round(float(m.params[idx] / scaler.scale_[i]), 6),
                "std_error": round(float(m.bse[idx]), 6),
                "t_stat": round(float(m.tvalues[idx]), 4),
                "p_value": round(p_val, 6),
                "vif": round(vif, 2) if vif else None,
                "significant": bool(p_val < 0.05),
                "model_run_id": RUN_ID,
            })
            per_idx.append(len(coef_rows) - 1)

        if per_p:
            try:
                _, padj, _, _ = multipletests(per_p, alpha=0.05, method="fdr_bh")
                for j, pa in zip(per_idx, padj):
                    coef_rows[j]["p_adjusted"] = round(float(pa), 6)
                    coef_rows[j]["significant_fdr"] = bool(pa < 0.05)
                    coef_rows[j]["sig_level"] = (
                        "***" if pa < 0.001 else "**" if pa < 0.01
                        else "*" if pa < 0.05 else "ns")
            except Exception:
                pass

        if len(m.resid) >= 3:
            sw_s, sw_p = shapiro(m.resid)
            test_rows.append({
                "test_name": "Shapiro-Wilk (residuaalit)",
                "model_id": spec["model_id"], "outcome": outcome,
                "predictor": "residuaalit", "period": spec["period"],
                "statistic": round(float(sw_s), 4),
                "p_value": round(float(sw_p), 6),
                "df": str(len(m.resid)),
                "significant": bool(sw_p < 0.05),
                "interpretation": ("Residuaalit ei-normaaleja"
                                   if sw_p < 0.05 else "Normaalit"),
                "model_run_id": RUN_ID, "is_current": True,
            })
        adf_p = adf_pvalue(m.resid)
        if adf_p is not None:
            test_rows.append({
                "test_name": "ADF (residuaalit)",
                "model_id": spec["model_id"], "outcome": outcome,
                "predictor": "residuaalit", "period": spec["period"],
                "statistic": None,
                "p_value": round(adf_p, 6),
                "df": str(len(m.resid)),
                "significant": bool(adf_p < 0.05),
                "interpretation": ("Stationaariset residuaalit"
                                   if adf_p < 0.05
                                   else "Ei-stationaariset — varo spurious"),
                "model_run_id": RUN_ID, "is_current": True,
            })

    if model_rows:
        result.rows_updated += upsert(client, "ols_models", model_rows,
                                      on_conflict="model_id", dry_run=dry_run)
    if coef_rows:
        result.rows_inserted += upsert(client, "ols_coefficients", coef_rows,
                                       on_conflict="model_id,predictor",
                                       dry_run=dry_run)
    if test_rows:
        if not dry_run:
            for spec in models_spec:
                try:
                    _exec(client.table("statistical_tests")
                          .update({"is_current": False})
                          .eq("model_id", spec["model_id"]))
                except Exception:
                    pass
        for r in test_rows:
            r["id"] = str(uuid.uuid4())
        result.rows_inserted += upsert(client, "statistical_tests", test_rows,
                                       on_conflict="id", dry_run=dry_run)

    log.info(f"  ✓ {len(model_rows)} mallia, {len(coef_rows)} kerrointa")
    return result


# ──────────────────────────────────────────────────────────────
# ASKEL 4: TFR-ENNUSTE — vuosittainen (uusi taulu, EI tfr_forecast)
# ──────────────────────────────────────────────────────────────

def step_forecasts(client, dry_run=False, since=None) -> PipelineResult:
    result = PipelineResult("forecasts")
    log.info("ASKEL 4: TFR-vuosiennuste")

    if not table_exists(client, "tfr_forecast_yearly"):
        result.warnings.append(
            "tfr_forecast_yearly-tauluttuottu ei ole — luo migraatiolla. "
            "tfr_forecast varataan skenaariotauluksi."
        )
        return result

    ts_df = fetch_df(client, "time_series", "j_code,year,value",
                     {"j_code": "syntyvyys_tfr"})
    if ts_df.empty:
        result.warnings.append("syntyvyys_tfr puuttuu")
        return result

    ts = ts_df.sort_values("year").set_index("year")["value"].astype(float)
    last_year = int(ts.index.max())
    recent = ts[ts.index >= last_year - 10]
    t = np.arange(len(recent)).reshape(-1, 1)
    X = add_constant(t)
    m = OLS(recent.values, X).fit()

    horizon = 10
    future_t = np.arange(len(recent), len(recent) + horizon).reshape(-1, 1)
    Xf = add_constant(future_t, has_constant="add")
    pf = m.get_prediction(Xf).summary_frame(alpha=0.05)

    rows = []
    for i, yr in enumerate(range(last_year + 1, last_year + horizon + 1)):
        base = float(pf["mean"].iloc[i])
        lo = float(pf["obs_ci_lower"].iloc[i])
        hi = float(pf["obs_ci_upper"].iloc[i])
        for scen, delta, floor in [("baseline", 0.0, 0.5),
                                    ("optimistinen", 0.03 * (i + 1), 0.5),
                                    ("pessimistinen", -0.03 * (i + 1), 0.4)]:
            rows.append({
                "year": yr, "scenario": scen,
                "tfr": round(max(base + delta, floor), 3),
                "ci_low": round(max(lo + delta, floor), 3),
                "ci_high": round(hi + delta, 3),
                "method": (f"OLS 10v + obs-CI 95%; slope={m.params[1]:.4f}, "
                           f"R²={m.rsquared:.3f}"),
                "model_run_id": RUN_ID,
            })

    n = upsert(client, "tfr_forecast_yearly", rows,
               on_conflict="year,scenario", dry_run=dry_run)
    result.rows_updated = n
    log.info(f"  ✓ {n} ennusteriviä")
    return result


# ──────────────────────────────────────────────────────────────
# ASKEL 5: HOIVA-AALTO (vuositaso uuteen tauluun, ei sotke 85+ aaltoja)
# ──────────────────────────────────────────────────────────────

def step_hoiva_aalto(client, dry_run=False, since=None) -> PipelineResult:
    result = PipelineResult("hoiva_aalto")
    log.info("ASKEL 5: Hoiva-aalto (75+ vuosittain)")

    if not table_exists(client, "hoiva_aalto_yearly"):
        result.warnings.append(
            "hoiva_aalto_yearly-taulu puuttuu — luo migraatiolla. "
            "hoiva_aalto_projection jätetään 85+-aaltoja varten."
        )
        return result

    pop_df = fetch_df(client, "sector_target_population",
                      "sector_id,year,population")
    sec_df = fetch_df(client, "sectors", "id,key")
    sec_map = dict(zip(sec_df["id"], sec_df["key"]))
    pop_df["sector_key"] = pop_df["sector_id"].map(sec_map)
    vanhus = pop_df[pop_df["sector_key"] == "vanhus_vammais"].copy()
    if vanhus.empty:
        result.warnings.append("vanhus_vammais-väestö puuttuu")
        return result

    teho_k, koti_k = 0.085, 0.135  # TODO v4: lue hoiva_parameters-taulusta
    rows = []
    for _, row in vanhus.iterrows():
        yr, pop = int(row["year"]), int(row["population"])
        rows.append({
            "year": yr,
            "population_75plus": pop,
            "tehoasuminen_tarve": round(pop * teho_k),
            "kotihoito_tarve": round(pop * koti_k),
            "teho_share": teho_k, "koti_share": koti_k,
            "param_source": "fallback",
            "model_run_id": RUN_ID,
        })
    n = upsert(client, "hoiva_aalto_yearly", rows,
               on_conflict="year", dry_run=dry_run)
    result.rows_updated = n
    log.info(f"  ✓ {n} riviä")
    return result


# ──────────────────────────────────────────────────────────────
# ASKEL 6: NORDIC-LINKITYS (meta) — säilyy v2:sta
# ──────────────────────────────────────────────────────────────

def step_nordic_sync(client, dry_run=False, since=None) -> PipelineResult:
    result = PipelineResult("nordic_sync")
    log.info("ASKEL 6: Nordic indicators_ref-meta")

    # Selvitetään saatavilla olevat sarakkeet (skeemavaihtelut: indicator_name
    # voi olla esim. "indicator", "subcategory" tai puuttua kokonaan)
    candidate_name_cols = ["indicator_name", "indicator", "subcategory", "sub_category", "name"]
    name_col = None
    for c in candidate_name_cols:
        try:
            probe = fetch_df(client, "nordic_indicators", f"category,{c}").head(1)
            name_col = c
            break
        except Exception:
            continue

    select_cols = "category,unit" + (f",{name_col}" if name_col else "")
    try:
        nordic_df = fetch_df(client, "nordic_indicators", select_cols)
    except Exception:
        nordic_df = fetch_df(client, "nordic_indicators", "category")

    if nordic_df.empty:
        result.warnings.append("nordic_indicators tyhjä")
        return result

    ind_df = fetch_df(client, "indicators_ref", "external_id,name")
    existing = set(ind_df["external_id"].dropna())

    def norm(s):
        return s.lower().replace(" ", "_").replace("-", "_").replace("/", "_")

    new = []
    cols = nordic_df.columns
    keep = ["category"] + ([name_col] if name_col and name_col in cols else []) \
                       + (["unit"] if "unit" in cols else [])
    src = nordic_df[keep].drop_duplicates()
    for _, r in src.iterrows():
        cat = str(r.get("category", "")) if pd.notna(r.get("category")) else ""
        nm_raw = r.get(name_col) if name_col and name_col in cols else None
        name = str(nm_raw) if (nm_raw is not None and pd.notna(nm_raw)) else cat
        ext_id = f"nordic_{norm(cat)}_{norm(name)}"[:80]
        if ext_id not in existing:
            new.append({
                "external_id": ext_id,
                "name": f"{name} (pohjoismaat)",
                "category_name": f"Nordic — {cat}",
                "unit": str(r.get("unit")) if "unit" in cols and pd.notna(r.get("unit")) else None,
                "ttt_pilari": "vertailu",
            })
            existing.add(ext_id)

    n = upsert(client, "indicators_ref", new,
               on_conflict="external_id", dry_run=dry_run)
    result.rows_inserted = n
    log.info(f"  ✓ {n} uutta nordic-meta" if n else "  ✓ kaikki linkitetty")
    return result


# ──────────────────────────────────────────────────────────────
# ASKEL 7 (UUSI): NORDIC-KORRELAATIOT
# Käyttää nordic_category_map → j_code → sector_series
# ──────────────────────────────────────────────────────────────

def step_nordic_correlations(client, dry_run=False, since=None) -> PipelineResult:
    result = PipelineResult("nordic_correlations")
    log.info("ASKEL 7: Nordic-korrelaatiot (FI vs muut Pohjoismaat)")

    if not table_exists(client, "nordic_category_map"):
        result.warnings.append("nordic_category_map puuttuu")
        return result
    if not table_exists(client, "nordic_correlations"):
        result.warnings.append(
            "nordic_correlations-taulu puuttuu — luo migraatiolla"
        )
        return result

    nmap = fetch_df(client, "nordic_category_map",
                    "category,subcategory,j_code,weight")
    if nmap.empty:
        result.warnings.append("nordic_category_map tyhjä")
        return result

    nordic = fetch_df(client, "nordic_indicators",
                      "country,category,subcategory,year,value")
    sec_df = fetch_df(client, "sector_series", "sector_key,year,value",
                      {"basis": "nominal"})

    sec_jmap = fetch_df(client, "sector_jcode_map", "j_code,sector_key,weight")
    jcode_to_sector = dict(zip(sec_jmap["j_code"], sec_jmap["sector_key"]))

    rows = []
    for _, m in nmap.iterrows():
        j_code = m["j_code"]
        sector = jcode_to_sector.get(j_code)
        if not sector:
            result.rows_skipped += 1
            continue

        fi = sec_df[sec_df["sector_key"] == sector].set_index("year")["value"]
        if len(fi) < MIN_OBSERVATIONS:
            result.rows_skipped += 1
            continue

        nrows = nordic[(nordic["category"] == m["category"])]
        if pd.notna(m.get("subcategory")):
            nrows = nrows[nrows["subcategory"] == m["subcategory"]]
        if nrows.empty:
            result.rows_skipped += 1
            continue

        for country, grp in nrows.groupby("country"):
            if str(country).lower().startswith("finland"):
                continue
            other = grp.groupby("year")["value"].mean()
            common = fi.index.intersection(other.index)
            if len(common) < MIN_OBSERVATIONS:
                continue
            xv = fi.loc[common].values.astype(float)
            yv = other.loc[common].values.astype(float)
            if np.std(xv) == 0 or np.std(yv) == 0:
                continue
            try:
                r, p = pearsonr(xv, yv)
            except Exception:
                continue
            r_diff, p_diff = diff_pearson(xv, yv)
            ci_lo, ci_hi = (bootstrap_ci_r(xv, yv)
                            if len(common) < BOOTSTRAP_THRESHOLD_N
                            else (np.nan, np.nan))
            rows.append({
                "j_code": j_code,
                "sector_key": sector,
                "category": m["category"],
                "subcategory": m.get("subcategory"),
                "country": country,
                "n": len(common),
                "r": round(float(r), 4),
                "p_value": round(float(p), 6),
                "r_diff": None if np.isnan(r_diff) else round(r_diff, 4),
                "p_diff": None if np.isnan(p_diff) else round(p_diff, 6),
                "ci_low": None if np.isnan(ci_lo) else round(ci_lo, 4),
                "ci_high": None if np.isnan(ci_hi) else round(ci_hi, 4),
                "year_min": int(common.min()),
                "year_max": int(common.max()),
                "model_run_id": RUN_ID,
            })

    if rows:
        ps = np.array([r["p_value"] for r in rows])
        try:
            _, padj, _, _ = multipletests(ps, alpha=FDR_ALPHA, method="fdr_bh")
            for r, pa in zip(rows, padj):
                r["p_adjusted"] = round(float(pa), 6)
                r["significant_fdr"] = bool(pa < FDR_ALPHA)
        except Exception:
            pass

    n = upsert(client, "nordic_correlations", rows,
               on_conflict="j_code,country,category", dry_run=dry_run)
    result.rows_inserted = n
    log.info(f"  ✓ {n} nordic-korrelaatiota")
    return result


# ──────────────────────────────────────────────────────────────
# ASKEL 8 (UUSI): COFOG-LINKITYS
# Käyttää j_code_cofog → cofog_amounts → j_code-tasoinen aggregaatti
# ──────────────────────────────────────────────────────────────

def step_cofog_link(client, dry_run=False, since=None) -> PipelineResult:
    result = PipelineResult("cofog_link")
    log.info("ASKEL 8: COFOG → j_code aggregaatti")

    if not table_exists(client, "j_code_cofog"):
        result.warnings.append("j_code_cofog puuttuu")
        return result
    if not table_exists(client, "cofog_jcode_amounts"):
        result.warnings.append(
            "cofog_jcode_amounts-taulu puuttuu — luo migraatiolla"
        )
        return result

    map_df = fetch_df(client, "j_code_cofog", "j_code,cofog_code,weight")
    cof_df = fetch_df(client, "cofog_amounts",
                      "year,cofog_code,level,field,value,unit")

    # Suodata vain GG-tason total_expenditure jos saatavilla
    if "level" in cof_df.columns:
        gg = cof_df[(cof_df["level"] == "GG")
                    & (cof_df["field"] == "total_expenditure")].copy()
        if not gg.empty:
            cof_df = gg

    rows = []
    merged = map_df.merge(cof_df, on="cofog_code", how="inner")
    merged["weighted"] = merged["value"].astype(float) * merged["weight"].astype(float)
    agg = merged.groupby(["j_code", "year"])["weighted"].sum().reset_index()
    for _, r in agg.iterrows():
        rows.append({
            "j_code": r["j_code"],
            "year": int(r["year"]),
            "value_meur": round(float(r["weighted"]), 4),
            "method": "cofog_weighted_sum_GG_total",
            "model_run_id": RUN_ID,
        })

    n = upsert(client, "cofog_jcode_amounts", rows,
               on_conflict="j_code,year", dry_run=dry_run)
    result.rows_inserted = n
    log.info(f"  ✓ {n} cofog→j_code-aggregaattia")
    return result


# ──────────────────────────────────────────────────────────────
# ASKEL 9 (UUSI): CAUSAL CHAINS — synkronointi elasticities-tuloksista
# ──────────────────────────────────────────────────────────────

def step_causal_chains_sync(client, dry_run=False, since=None) -> PipelineResult:
    result = PipelineResult("causal_chains_sync")
    log.info("ASKEL 9: Causal chains -synkronointi")

    if not table_exists(client, "causal_chains"):
        result.warnings.append("causal_chains puuttuu")
        return result

    el = fetch_df(client, "elasticities",
                  "j_code,indicator_id,lag_years,r,confidence,verified")
    if el.empty:
        result.warnings.append("elasticities tyhjä")
        return result

    # Vain vahvat ja kohtalaiset, ei verified-rivien päälle
    el = el[el["confidence"].isin(["vahva", "kohtalainen"])]
    el = el[~el["verified"].astype(bool)]

    ind_df = fetch_df(client, "indicators_ref", "id,external_id,name")
    ind_map = dict(zip(ind_df["id"], ind_df["external_id"]))

    rows = []
    for _, r in el.iterrows():
        ext = ind_map.get(r["indicator_id"], r["indicator_id"])
        chain_id = f"auto_{r['j_code']}_{ext}"[:80]
        rows.append({
            "chain_id": chain_id,
            "chain_name": f"AUTO: {r['j_code']} → {ext}",
            "step_order": 1,
            "from_indicator": f"jcode.{r['j_code']}",
            "to_indicator": f"indicator.{ext}",
            "lag_years": int(r["lag_years"]),
            "mechanism": "Automaattinen ehdotus elasticities-tuloksesta",
            "r": float(r["r"]),
            "confidence": r["confidence"],
            "j_code": r["j_code"],
            "notes": f"v3 auto run_id={RUN_ID}",
        })

    n = upsert(client, "causal_chains", rows,
               on_conflict="chain_id,step_order", dry_run=dry_run)
    result.rows_inserted = n
    log.info(f"  ✓ {n} ehdotettua ketjua (verified-rivit suojattu)")
    return result


# ──────────────────────────────────────────────────────────────
# ASKEL 10 (UUSI): regression_results-synkronointi (poistaa päällekkäisyyden)
# ──────────────────────────────────────────────────────────────

def step_regression_results_sync(client, dry_run=False, since=None) -> PipelineResult:
    result = PipelineResult("regression_results_sync")
    log.info("ASKEL 10: regression_results-synkronointi (vanha taulu)")

    if not table_exists(client, "regression_results"):
        result.warnings.append("regression_results puuttuu")
        return result

    coef = fetch_df(client, "ols_coefficients",
                    "model_id,predictor,beta_std,p_value,p_adjusted,"
                    "significant_fdr,sig_level")
    mod = fetch_df(client, "ols_models", "model_id,outcome,n")
    if coef.empty or mod.empty:
        result.warnings.append("ols_* tyhjä")
        return result
    merged = coef.merge(mod, on="model_id", how="left")

    rows = []
    for _, r in merged.iterrows():
        beta = r.get("beta_std")
        if beta is None or pd.isna(beta):
            continue
        rows.append({
            "model_id": r["model_id"],
            "outcome": r.get("outcome"),
            "predictor": r["predictor"],
            "pearson_r": round(float(beta), 4),  # standardoitu beta ≈ r yksinkertaisessa OLS:ssa
            "abs_r": round(abs(float(beta)), 4),
            "lag_years": 0,
            "n": int(r.get("n") or 0),
            "interpretation": (
                f"v3 sync run_id={RUN_ID} — OLS β_std, "
                f"p_adj={r.get('p_adjusted')}, sig={r.get('sig_level')}"
            ),
            # HUOM: "strength" on generated column tietokannassa — älä lähetä
            "direction": "positiivinen" if float(beta) > 0 else "negatiivinen",
        })

    n = upsert(client, "regression_results", rows,
               on_conflict="model_id,predictor", dry_run=dry_run)
    result.rows_updated = n
    log.info(f"  ✓ {n} synkronoitu vanhaan tauluun")
    return result


# ──────────────────────────────────────────────────────────────
# ASKEL 11: ANALYTICS SNAPSHOT
# ──────────────────────────────────────────────────────────────

def step_analytics_snapshot(client, dry_run=False, since=None) -> PipelineResult:
    result = PipelineResult("analytics_snapshot")
    log.info("ASKEL 11: Analytics snapshot")

    counts = {}
    for tbl in list(EXPORT_TABLES.values()) + EXPORT_VIEWS:
        try:
            r = _exec(client.table(tbl).select("*", count="exact", head=True).limit(1))
            counts[tbl] = r.count or 0
        except Exception:
            counts[tbl] = -1

    now = datetime.now(timezone.utc).isoformat()
    row = {
        "event_type": "db_snapshot_v3",
        "metadata": {"model_run_id": RUN_ID, "row_counts": counts,
                     "recorded_at": now},
        "created_at": now,
    }
    if dry_run:
        log.info(f"  [dry-run] analytics_events: {len(counts)} taulua")
    else:
        try:
            _exec(client.table("analytics_events").insert(row))
            result.rows_inserted = 1
        except Exception as e:
            result.warnings.append(f"analytics_events: {e}")
    log.info(f"  ✓ snapshot ({len(counts)} taulua)")
    return result


# ──────────────────────────────────────────────────────────────
# ASKEL 12: JSON-EXPORT (taulut + näkymät)
# ──────────────────────────────────────────────────────────────

def step_export_json(client, dry_run=False, since=None) -> PipelineResult:
    result = PipelineResult("export_json")
    log.info("ASKEL 12: JSON-export (taulut + näkymät)")

    out_dir = Path(EXPORT_DIR)
    views_dir = out_dir / "views"
    if not dry_run:
        out_dir.mkdir(parents=True, exist_ok=True)
        views_dir.mkdir(parents=True, exist_ok=True)

    manifest = {"generated_at": datetime.now(timezone.utc).isoformat(),
                "model_run_id": RUN_ID, "tables": {}, "views": {}}

    def _write(target_dir, fname, table, bucket_key):
        try:
            df = fetch_df(client, table, "*")
        except Exception as e:
            result.warnings.append(f"{table}: {e}")
            return
        rows = df.to_dict(orient="records") if not df.empty else []
        for row in rows:
            for k, v in list(row.items()):
                if isinstance(v, float) and (pd.isna(v) or v != v):
                    row[k] = None
        target = target_dir / f"{fname}.json"
        payload = json.dumps(rows, ensure_ascii=False,
                             separators=(",", ":"), default=str)
        if not dry_run:
            target.write_text(payload, encoding="utf-8")
        sha = hashlib.sha256(payload.encode("utf-8")).hexdigest()[:16]
        manifest[bucket_key][fname] = {"file": str(target.relative_to(out_dir)),
                                        "rows": len(rows), "sha256_16": sha}
        result.rows_inserted += len(rows)

    for fname, table in EXPORT_TABLES.items():
        _write(out_dir, fname, table, "tables")
    for view in EXPORT_VIEWS:
        _write(views_dir, view, view, "views")

    if not dry_run:
        (out_dir / "manifest.json").write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2, default=str),
            encoding="utf-8")
    log.info(f"  ✓ {len(manifest['tables'])} taulua + "
             f"{len(manifest['views'])} näkymää → {EXPORT_DIR}")
    return result


# ──────────────────────────────────────────────────────────────
# PÄÄOHJELMA
# ──────────────────────────────────────────────────────────────

STEPS = {
    "per_capita":              step_per_capita,
    "elasticities":            step_elasticities,
    "ols":                     step_ols,
    "forecasts":               step_forecasts,
    "hoiva_aalto":             step_hoiva_aalto,
    "nordic_sync":             step_nordic_sync,
    "nordic_correlations":     step_nordic_correlations,
    "cofog_link":              step_cofog_link,
    "causal_chains_sync":      step_causal_chains_sync,
    "regression_results_sync": step_regression_results_sync,
    "analytics_snapshot":      step_analytics_snapshot,
    "export_json":             step_export_json,
}

DEFAULT_ORDER = [
    "per_capita",
    "nordic_sync",
    "cofog_link",
    "elasticities",
    "ols",
    "forecasts",
    "hoiva_aalto",
    "nordic_correlations",
    "causal_chains_sync",
    "regression_results_sync",
    "analytics_snapshot",
    "export_json",
]


def run_pipeline(steps, dry_run=False, since=None):
    client = get_client()
    log.info("=" * 60)
    log.info(f"TTT-PIPELINE v3  run_id={RUN_ID}  "
             f"{'[DRY-RUN] ' if dry_run else ''}"
             f"{'since='+since if since else ''}")
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
    log.info(f"Valmis {elapsed:.1f}s — {len(results)} askelta")
    for r in results:
        log.info(f"  {'✓' if r.ok() else '✗'} {r.summary()}")
    log.info("=" * 60)

    if any(not r.ok() for r in results):
        sys.exit(1)


def main():
    p = argparse.ArgumentParser(description="TTT-pipeline v3")
    p.add_argument("--step", choices=list(STEPS.keys()))
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--since", metavar="YYYY-MM-DD")
    a = p.parse_args()
    run_pipeline([a.step] if a.step else DEFAULT_ORDER,
                 dry_run=a.dry_run, since=a.since)


if __name__ == "__main__":
    main()
