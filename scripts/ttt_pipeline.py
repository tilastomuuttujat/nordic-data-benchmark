"""
TTT-analyysipipeline
====================
Päivittää kaikki laskennat Supabase-tietokannassa kun dataa
lisätään tai muokataan.

Käyttö:
    python ttt_pipeline.py                    # ajaa kaiken
    python ttt_pipeline.py --step elasticities
    python ttt_pipeline.py --step per_capita
    python ttt_pipeline.py --step forecasts
    python ttt_pipeline.py --dry-run          # ei kirjoita kantaan
    python ttt_pipeline.py --since 2024-01-01 # vain muutokset tämän jälkeen

Ympäristömuuttujat (.env tai export):
    SUPABASE_URL=https://yjkabgtbcgvrfqtewtna.supabase.co
    SUPABASE_SERVICE_KEY=eyJ...   (service role key, ei anon)
"""

from __future__ import annotations

import argparse
import logging
import os
import sys
import traceback
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional

import numpy as np
import pandas as pd
from scipy import stats
from scipy.stats import pearsonr, spearmanr, shapiro
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from statsmodels.regression.linear_model import OLS
from statsmodels.tools import add_constant
from statsmodels.stats.outliers_influence import variance_inflation_factor
from supabase import create_client, Client
from dotenv import load_dotenv

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

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

# Vähimmäishavainnot korrelaatiolaskentaan
MIN_OBSERVATIONS = 10

# Confidence-kynnykset Pearson r:lle
CONFIDENCE_THRESHOLDS = {
    "vahva":      0.70,   # |r| >= 0.70 ja p < 0.01
    "kohtalainen":0.45,   # |r| >= 0.45 ja p < 0.05
    "heikko":     0.0,    # kaikki muut merkitsevät
}

# Lag-arvot joita testataan korrelaatioissa (vuotta)
LAG_RANGE = range(0, 11)


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
            + (f", {len(self.errors)} virheitä" if self.errors else "")
        )


def confidence_label(r: float, p: float) -> str:
    """Palauttaa confidence-luokan r- ja p-arvon perusteella."""
    if p >= 0.05:
        return None  # ei merkitsevä
    absr = abs(r)
    if absr >= CONFIDENCE_THRESHOLDS["vahva"] and p < 0.01:
        return "vahva"
    if absr >= CONFIDENCE_THRESHOLDS["kohtalainen"]:
        return "kohtalainen"
    return "heikko"


def detrend(series: np.ndarray) -> np.ndarray:
    """Poistaa lineaarisen trendin aikasarjasta."""
    t = np.arange(len(series))
    slope, intercept, _, _, _ = stats.linregress(t, series)
    return series - (slope * t + intercept)


# ──────────────────────────────────────────────────────────────
# YHTEYS
# ──────────────────────────────────────────────────────────────

def get_client() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise EnvironmentError(
            "SUPABASE_URL ja SUPABASE_SERVICE_KEY täytyy asettaa ympäristömuuttujiksi."
        )
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def fetch_df(client: Client, table: str, columns: str = "*",
             filters: dict | None = None) -> pd.DataFrame:
    """Hakee taulun DataFrameksi. Käsittelee Supabase-sivutuksen."""
    query = client.table(table).select(columns)
    if filters:
        for col, val in filters.items():
            query = query.eq(col, val)
    # Supabase palauttaa max 1000 kerralla — sivutetaan
    all_rows = []
    offset = 0
    limit = 1000
    while True:
        resp = query.range(offset, offset + limit - 1).execute()
        rows = resp.data or []
        all_rows.extend(rows)
        if len(rows) < limit:
            break
        offset += limit
    return pd.DataFrame(all_rows)


def upsert(client: Client, table: str, rows: list[dict],
           on_conflict: str, dry_run: bool = False) -> int:
    """Upsertaa rivit. Palauttaa päivitettyjen/lisättyjen rivien lukumäärän."""
    if not rows:
        return 0
    if dry_run:
        log.info(f"  [dry-run] {table}: {len(rows)} riviä ei kirjoitettu")
        return 0
    resp = client.table(table).upsert(rows, on_conflict=on_conflict).execute()
    return len(resp.data or rows)


# ──────────────────────────────────────────────────────────────
# ASKEL 1: PER-CAPITA PÄIVITYS
# ──────────────────────────────────────────────────────────────

def step_per_capita(client: Client, dry_run: bool = False,
                    since: Optional[str] = None) -> PipelineResult:
    """
    Päivittää sector_series.basis='per_capita_target' kaikille sektoreille
    joilla on väestödata sector_target_population-taulussa.

    Laskentakaava: nominal_meur * 1_000_000 / interpoloitu_väestö
    """
    result = PipelineResult("per_capita")
    log.info("ASKEL 1: Per-capita päivitys")

    # Hae nominal-data
    nom_df = fetch_df(client, "sector_series", "sector_key,year,value",
                      {"basis": "nominal"})
    if nom_df.empty:
        result.errors.append("sector_series nominal-data tyhjä")
        return result

    # Hae väestödata
    pop_df = fetch_df(client, "sector_target_population",
                      "sector_id,year,population")
    if pop_df.empty:
        result.warnings.append("sector_target_population tyhjä — per-capita ei laskettavissa")
        return result

    # Hae sektori-id → key mapping
    sec_df = fetch_df(client, "sectors", "id,key")
    sec_map = dict(zip(sec_df["id"], sec_df["key"]))
    pop_df["sector_key"] = pop_df["sector_id"].map(sec_map)

    # Interpoloi väestö puuttuville vuosille lineaarisesti
    pop_interp = {}
    for sk, grp in pop_df.groupby("sector_key"):
        grp = grp.sort_values("year").set_index("year")["population"]
        full_idx = range(int(grp.index.min()), int(grp.index.max()) + 1)
        interp = grp.reindex(full_idx).interpolate("linear")
        pop_interp[sk] = interp.to_dict()

    # Laske per-capita ja valmistele upsert
    rows_to_upsert = []
    year_filter = int(since[:4]) if since else 0

    for _, row in nom_df.iterrows():
        sk = row["sector_key"]
        yr = int(row["year"])
        nom = float(row["value"]) if row["value"] is not None else None

        if nom is None:
            continue
        if yr < year_filter:
            continue

        pop = pop_interp.get(sk, {}).get(yr)
        if not pop or pop == 0:
            result.rows_skipped += 1
            continue

        per_cap = round(nom * 1_000_000 / pop, 2)
        rows_to_upsert.append({
            "sector_key": sk,
            "year": yr,
            "basis": "per_capita_target",
            "value": per_cap,
        })

    n = upsert(client, "sector_series", rows_to_upsert,
               on_conflict="sector_key,year,basis", dry_run=dry_run)
    result.rows_updated = n
    log.info(f"  ✓ {n} per-capita-riviä päivitetty, {result.rows_skipped} ohitettu")
    return result


# ──────────────────────────────────────────────────────────────
# ASKEL 2: KORRELAATIOT JA ELASTICITIES
# ──────────────────────────────────────────────────────────────

def step_elasticities(client: Client, dry_run: bool = False,
                      since: Optional[str] = None) -> PipelineResult:
    """
    Laskee Pearson-korrelaatiot (r, p) j_code_indicator-linkeille
    käyttäen time_series- ja sector_series-dataa.

    Jokainen linkki: j_code → indicator_id, lag 0–10 vuotta
    Tallentaa parhaaksi löydetyn lag-arvon elasticities-tauluun.
    Laskee myös detrended-version pitkille sarjoille (n >= 20).
    """
    result = PipelineResult("elasticities")
    log.info("ASKEL 2: Korrelaatiolaskenta (elasticities)")

    # Hae j_code_indicator-linkit
    links_df = fetch_df(client, "j_code_indicator",
                        "j_code,indicator_id,relation_type,weight,notes")
    if links_df.empty:
        result.warnings.append("j_code_indicator tyhjä")
        return result

    # Hae indikaattorit → external_id mapping
    ind_df = fetch_df(client, "indicators_ref", "id,external_id,name")
    ind_map = dict(zip(ind_df["id"], ind_df["external_id"]))
    ind_name_map = dict(zip(ind_df["id"], ind_df["name"]))

    # Hae time_series (indikaattoridata)
    ts_df = fetch_df(client, "time_series", "j_code,year,value")
    ts_pivot = ts_df.pivot_table(
        index="year", columns="j_code", values="value", aggfunc="mean"
    )

    # Hae rahoitusdata (sector_series nominal)
    sec_df = fetch_df(client, "sector_series", "sector_key,year,value",
                      {"basis": "nominal"})
    sec_pivot = sec_df.pivot_table(
        index="year", columns="sector_key", values="value", aggfunc="mean"
    )

    # Hae j_codes → sektori mapping
    jcs_df = fetch_df(client, "j_codes", "code,name")
    sec_jmap = fetch_df(client, "sector_jcode_map", "j_code,sector_key")
    jcode_sector = dict(zip(sec_jmap["j_code"], sec_jmap["sector_key"]))

    # Hae olemassa olevat elasticities (ei ylikirjoiteta verified=true)
    existing = fetch_df(client, "elasticities",
                        "j_code,indicator_id,lag_years,verified,r")
    verified_set = set(
        zip(existing["j_code"], existing["indicator_id"], existing["lag_years"])
        if not existing.empty else []
    )
    verified_set = {
        (row.j_code, row.indicator_id, row.lag_years)
        for _, row in existing.iterrows()
        if row.get("verified") is True
    }

    rows_to_upsert = []

    for _, link in links_df.iterrows():
        j_code = link["j_code"]
        ind_id = link["indicator_id"]
        ext_id = ind_map.get(ind_id)
        if not ext_id:
            continue

        # Hae rahoitussarja: ensin time_series, sitten sector_series
        if ext_id in ts_pivot.columns:
            y_series = ts_pivot[ext_id].dropna()
        elif j_code in ts_pivot.columns:
            y_series = ts_pivot[j_code].dropna()
        else:
            result.rows_skipped += 1
            continue

        # Rahoitussarja x: sektori-nimellinen tai j_code suoraan
        sector_key = jcode_sector.get(j_code)
        if sector_key and sector_key in sec_pivot.columns:
            x_series = sec_pivot[sector_key].dropna()
        elif j_code in sec_pivot.columns:
            x_series = sec_pivot[j_code].dropna()
        else:
            result.rows_skipped += 1
            continue

        # Testaa eri lag-arvot, löydä paras
        best_r, best_p, best_lag = 0.0, 1.0, 0
        for lag in LAG_RANGE:
            # x[t] vs y[t+lag]
            if lag == 0:
                common = x_series.index.intersection(y_series.index)
            else:
                x_shifted = x_series.copy()
                x_shifted.index = x_shifted.index + lag
                common = x_shifted.index.intersection(y_series.index)
                x_series_lag = x_shifted.loc[common]
                y_series_lag = y_series.loc[common]
                if len(common) < MIN_OBSERVATIONS:
                    continue
                try:
                    r, p = pearsonr(x_series_lag.values, y_series_lag.values)
                except Exception:
                    continue
                if abs(r) > abs(best_r):
                    best_r, best_p, best_lag = r, p, lag
                continue

            # lag == 0 erikoistapaus
            x_use = x_series.loc[common]
            y_use = y_series.loc[common]
            if len(common) < MIN_OBSERVATIONS:
                continue
            try:
                r, p = pearsonr(x_use.values, y_use.values)
            except Exception:
                continue
            if abs(r) > abs(best_r):
                best_r, best_p, best_lag = r, p, lag

        if best_p >= 0.05:
            result.rows_skipped += 1
            continue

        conf = confidence_label(best_r, best_p)
        if conf is None:
            result.rows_skipped += 1
            continue

        # Älä ylikirjoita verified-merkintöjä
        key = (j_code, ind_id, best_lag)
        if key in verified_set:
            result.rows_skipped += 1
            continue

        # n = havaintojen määrä
        if best_lag == 0:
            common = x_series.index.intersection(y_series.index)
            n_obs = len(common)
        else:
            x_shifted = x_series.copy()
            x_shifted.index = x_shifted.index + best_lag
            common = x_shifted.index.intersection(y_series.index)
            n_obs = len(common)

        rows_to_upsert.append({
            "j_code": j_code,
            "indicator_id": ind_id,
            "lag_years": best_lag,
            "r": round(float(best_r), 4),
            "p_value": round(float(best_p), 6),
            "n": int(n_obs),
            "direction": "positiivinen" if best_r > 0 else "negatiivinen",
            "confidence": conf,
            "verified": False,
            "notes": (
                f"Laskettu automaattisesti {datetime.now(timezone.utc).date()}. "
                f"Paras lag={best_lag}v, |r|={abs(best_r):.3f}. "
                f"Lähde: time_series+sector_series."
            ),
        })

    n = upsert(client, "elasticities", rows_to_upsert,
               on_conflict="j_code,indicator_id,lag_years", dry_run=dry_run)
    result.rows_inserted = n
    log.info(f"  ✓ {n} elasticities upserted, {result.rows_skipped} ohitettu")
    return result


# ──────────────────────────────────────────────────────────────
# ASKEL 3: OLS-REGRESSIOT
# ──────────────────────────────────────────────────────────────

def step_ols(client: Client, dry_run: bool = False,
             since: Optional[str] = None) -> PipelineResult:
    """
    Ajaa OLS-regressiot ennalta määritellyille malleille.

    Mallimäärittelyt:
      - TFR-malli: nuorisotyöttömyys, osa-aikatyö, asumiskustannukset
      - MT-malli: mielenterveys_menot vs avohoitokäynnit, itsemurhat
      - Vanhuspalvelu-malli: menot/capita vs toimintakyky
      - Lastensuojelu-malli: avohuolto vs huostaanotot

    Kirjoittaa tulokset: ols_models, ols_coefficients, statistical_tests
    """
    result = PipelineResult("ols")
    log.info("ASKEL 3: OLS-regressiot")

    ts_df = fetch_df(client, "time_series", "j_code,year,value")
    if ts_df.empty:
        result.warnings.append("time_series tyhjä — OLS ei ajettavissa")
        return result

    pivot = ts_df.pivot_table(
        index="year", columns="j_code", values="value", aggfunc="mean"
    )

    # Hae myös sector_series per_capita_target
    sec_df = fetch_df(client, "sector_series", "sector_key,year,value",
                      {"basis": "per_capita_target"})
    sec_pivot = sec_df.pivot_table(
        index="year", columns="sector_key", values="value", aggfunc="mean"
    )

    # Mallimäärittelyt — lisää malleja tänne kun dataa karttuu
    MODELS = [
        {
            "model_id": "tfr_selittajat_2010_2024",
            "outcome": "syntyvyys_tfr",
            "predictors": [
                "nuorisotyottomyys_1524",
                "asumiskustannusten_tulo_osuus",   # lisätään kun data saatavilla
                "naiset_osaaikatyo_pct_2534",
            ],
            "period": "2010-2024",
            "notes": "TFR-selittäjämalli, laskeva jakso",
        },
        {
            "model_id": "mt_panos_tuotos",
            "outcome": "mt_itsemurhat",
            "predictors": [
                "mt_avohoito_kaynteja",
                "mt_tyokyvyttomyyselakkeet",
            ],
            "period": "2003-2023",
            "notes": "MT-palveluiden panos-tuotos",
        },
        {
            "model_id": "lastensuojelu_ennuste",
            "outcome": "huostassa_olevat_lapset",
            "predictors": [
                "lastensuojelu_avohuolto",
                "lapsikoyhyysaste",
                "mt_oireilu_nuoret",
            ],
            "period": "2003-2023",
            "notes": "Lastensuojelun tarpeen selittäjät",
        },
    ]

    model_rows, coef_rows, test_rows = [], [], []
    scaler = StandardScaler()

    for spec in MODELS:
        outcome = spec["outcome"]
        predictors = spec["predictors"]

        # Kerää saatavilla olevat sarakkeet
        avail = [p for p in predictors if p in pivot.columns]
        if outcome not in pivot.columns:
            result.warnings.append(f"Malli {spec['model_id']}: outcome '{outcome}' ei kannassa")
            continue
        if len(avail) < 1:
            result.warnings.append(f"Malli {spec['model_id']}: ei yhtään selittäjää kannassa")
            continue

        # Rakenna datasetti, poista puuttuvat
        cols = [outcome] + avail
        data = pivot[cols].dropna()
        if len(data) < MIN_OBSERVATIONS:
            result.warnings.append(
                f"Malli {spec['model_id']}: liian vähän havaintoja ({len(data)})"
            )
            continue

        # Aikarajaus
        if "-" in spec["period"]:
            y1, y2 = [int(x) for x in spec["period"].split("-")]
            data = data[(data.index >= y1) & (data.index <= y2)]

        Y = data[outcome].values
        X_raw = data[avail].values
        X_std = scaler.fit_transform(X_raw)

        # OLS statsmodels — antaa VIF, t-stat, p-arvo
        try:
            X_sm = add_constant(X_std)
            model = OLS(Y, X_sm).fit()
        except Exception as e:
            result.errors.append(f"Malli {spec['model_id']} OLS epäonnistui: {e}")
            continue

        r2 = round(float(model.rsquared), 4)
        r2_adj = round(float(model.rsquared_adj), 4)
        f_stat = round(float(model.fvalue), 4)
        f_p = round(float(model.f_pvalue), 6)
        aic = round(float(model.aic), 2)
        bic = round(float(model.bic), 2)

        model_rows.append({
            "model_id": spec["model_id"],
            "outcome": outcome,
            "period": spec["period"],
            "n": len(data),
            "r2": r2,
            "r2_adj": r2_adj,
            "f_stat": f_stat,
            "f_p": f_p,
            "aic": aic,
            "bic": bic,
            "notes": spec["notes"],
        })

        # Kertoimet
        X_for_vif = add_constant(X_std)
        for i, pred in enumerate(avail):
            idx = i + 1  # +1 koska const on indeksi 0
            vif = float(variance_inflation_factor(X_for_vif, idx)) if len(avail) > 1 else None
            coef_rows.append({
                "model_id": spec["model_id"],
                "predictor": pred,
                "beta_std": round(float(model.params[idx]), 4),
                "beta_raw": round(float(
                    model.params[idx] / scaler.scale_[i]
                ), 6),
                "std_error": round(float(model.bse[idx]), 6),
                "t_stat": round(float(model.tvalues[idx]), 4),
                "p_value": round(float(model.pvalues[idx]), 6),
                "vif": round(vif, 2) if vif is not None else None,
                "significant": bool(model.pvalues[idx] < 0.05),
                "sig_level": (
                    "***" if model.pvalues[idx] < 0.001 else
                    "**"  if model.pvalues[idx] < 0.01  else
                    "*"   if model.pvalues[idx] < 0.05  else
                    "ns"
                ),
            })

        # Tilastolliset testit
        # Shapiro-Wilk residuaaleille
        if len(model.resid) >= 3:
            sw_stat, sw_p = shapiro(model.resid)
            test_rows.append({
                "test_name": "Shapiro-Wilk (residuaalit)",
                "model_id": spec["model_id"],
                "outcome": outcome,
                "predictor": "residuaalit",
                "period": spec["period"],
                "statistic": round(float(sw_stat), 4),
                "p_value": round(float(sw_p), 6),
                "df": str(len(model.resid)),
                "significant": bool(sw_p < 0.05),
                "interpretation": (
                    "Residuaalit eivät normaalisti jakautuneita (p<0.05)"
                    if sw_p < 0.05 else
                    "Residuaalit normaalisti jakautuneita"
                ),
            })

    # Kirjoita kantaan
    if model_rows:
        n = upsert(client, "ols_models", model_rows,
                   on_conflict="model_id", dry_run=dry_run)
        result.rows_upserted_models = n

    if coef_rows:
        n = upsert(client, "ols_coefficients", coef_rows,
                   on_conflict="model_id,predictor", dry_run=dry_run)
        result.rows_inserted += n

    if test_rows:
        # statistical_tests ei välttämättä ole uniikki — poista vanhat ensin
        if not dry_run:
            for spec in MODELS:
                client.table("statistical_tests").delete().eq(
                    "model_id", spec["model_id"]
                ).execute()
        n = upsert(client, "statistical_tests", test_rows,
                   on_conflict="test_name,model_id,predictor", dry_run=dry_run)

    log.info(f"  ✓ {len(model_rows)} mallia, {len(coef_rows)} kerrointa, "
             f"{len(test_rows)} testiä kirjoitettu")
    return result


# ──────────────────────────────────────────────────────────────
# ASKEL 4: TFR-ENNUSTEET
# ──────────────────────────────────────────────────────────────

def step_forecasts(client: Client, dry_run: bool = False,
                   since: Optional[str] = None) -> PipelineResult:
    """
    Päivittää TFR-ennusteet tfr_forecast-tauluun kolmella skenaariolla:
      - baseline:    lineaarinen trendi jatkuu
      - optimistinen: trendi taittuu 0.03/v ylöspäin 2027 alkaen
      - pessimistinen: trendi jatkuu 0.03/v alaspäin

    Pidentää ennustehorisonttia automaattisesti kun uutta dataa tulee.
    """
    result = PipelineResult("forecasts")
    log.info("ASKEL 4: TFR-ennustepäivitys")

    ts_df = fetch_df(client, "time_series", "j_code,year,value",
                     {"j_code": "syntyvyys_tfr"})
    if ts_df.empty:
        result.warnings.append("syntyvyys_tfr ei löydy time_series-taulusta")
        return result

    ts = ts_df.sort_values("year").set_index("year")["value"].astype(float)
    last_year = int(ts.index.max())
    last_val = float(ts.iloc[-1])

    # Sovita lineaarinen trendi viimeisille 10 vuodelle
    recent = ts[ts.index >= last_year - 10]
    t = np.arange(len(recent))
    slope, intercept, r2, _, se = stats.linregress(t, recent.values)

    forecast_years = range(last_year + 1, last_year + 11)
    rows = []

    for i, yr in enumerate(forecast_years, start=1):
        base = last_val + slope * i

        rows.extend([
            {
                "year": yr,
                "scenario": "baseline",
                "tfr": round(max(base, 0.5), 3),
                "method": f"OLS trendi 10v (slope={slope:.4f}/v, R²={r2:.3f})",
                "ci_low": round(max(base - 1.96 * se * np.sqrt(i), 0.5), 3),
                "ci_high": round(base + 1.96 * se * np.sqrt(i), 3),
            },
            {
                "year": yr,
                "scenario": "optimistinen",
                "tfr": round(max(base + 0.03 * i, 0.5), 3),
                "method": "Baseline + 0.03/v politiikkatoimet 2027–",
                "ci_low": round(max(base + 0.03 * i - 1.96 * se * np.sqrt(i), 0.5), 3),
                "ci_high": round(base + 0.03 * i + 1.96 * se * np.sqrt(i), 3),
            },
            {
                "year": yr,
                "scenario": "pessimistinen",
                "tfr": round(max(base - 0.03 * i, 0.4), 3),
                "method": "Baseline - 0.03/v trendi kiihtyy",
                "ci_low": round(max(base - 0.03 * i - 1.96 * se * np.sqrt(i), 0.4), 3),
                "ci_high": round(base - 0.03 * i + 1.96 * se * np.sqrt(i), 3),
            },
        ])

    n = upsert(client, "tfr_forecast", rows,
               on_conflict="year,scenario", dry_run=dry_run)
    result.rows_updated = n
    log.info(f"  ✓ {n} ennusteriviä päivitetty (horisontti: {last_year+1}–{last_year+10})")
    return result


# ──────────────────────────────────────────────────────────────
# ASKEL 5: HOIVA-AALTO-PROJEKTIO
# ──────────────────────────────────────────────────────────────

def step_hoiva_aalto(client: Client, dry_run: bool = False,
                     since: Optional[str] = None) -> PipelineResult:
    """
    Päivittää hoiva_aalto_projection-taulun kun väestödata muuttuu.
    Laskee 75+-vuotiaiden määrän ja arvioitu kotihoidon/tehoasumisen tarve.

    Kaava: tehoasuminen_tarve = 75+_väestö * 0.085 (nykytaso ~8.5%)
           kotihoito_tarve    = 75+_väestö * 0.135 (nykytaso ~13.5%)
    """
    result = PipelineResult("hoiva_aalto")
    log.info("ASKEL 5: Hoiva-aalto-projektio")

    # Hae 75+ väestödata
    pop_df = fetch_df(client, "sector_target_population", "sector_id,year,population")
    sec_df = fetch_df(client, "sectors", "id,key")
    sec_map = dict(zip(sec_df["id"], sec_df["key"]))
    pop_df["sector_key"] = pop_df["sector_id"].map(sec_map)

    vanhus = pop_df[pop_df["sector_key"] == "vanhus_vammais"].copy()
    if vanhus.empty:
        result.warnings.append("vanhus_vammais-sektori puuttuu sector_target_population")
        return result

    # Hae olemassa oleva projektiodata laskentaparametreja varten
    proj_df = fetch_df(client, "hoiva_aalto_projection")

    rows = []
    for _, row in vanhus.iterrows():
        yr = int(row["year"])
        pop = int(row["population"])

        # Laske tarpeet
        teho = round(pop * 0.085)
        koti = round(pop * 0.135)

        rows.append({
            "year": yr,
            "population_75plus": pop,
            "tehoasuminen_tarve": teho,
            "kotihoito_tarve": koti,
            "notes": (
                f"Laskettu {datetime.now(timezone.utc).date()}. "
                f"Kerroin: teho=8.5%, koti=13.5% (2023-taso)."
            ),
        })

    n = upsert(client, "hoiva_aalto_projection", rows,
               on_conflict="year", dry_run=dry_run)
    result.rows_updated = n
    log.info(f"  ✓ {n} projektioriviiä päivitetty")
    return result


# ──────────────────────────────────────────────────────────────
# ASKEL 6: NORDIC-LINKITYS (kun uutta dataa tulee)
# ──────────────────────────────────────────────────────────────

def step_nordic_sync(client: Client, dry_run: bool = False,
                     since: Optional[str] = None) -> PipelineResult:
    """
    Synkronoi nordic_indicators → indicators_ref-viittaukset.
    Tarkistaa löytyykö jokaiselle nordic-kategorialle vastaava
    external_id indicators_ref-taulussa ja luo puuttuvat.

    Tämä on se linkitysaskel joka muuttaa nordic-datan analyyttiseksi.
    """
    result = PipelineResult("nordic_sync")
    log.info("ASKEL 6: Nordic-synkronointi")

    nordic_df = fetch_df(client, "nordic_indicators",
                         "category,indicator_name,unit")
    if nordic_df.empty:
        result.warnings.append("nordic_indicators tyhjä")
        return result

    ind_df = fetch_df(client, "indicators_ref", "external_id,name")
    existing_ext_ids = set(ind_df["external_id"].dropna())

    # Rakenna mapping: nordic category → indicators_ref external_id
    # Normisointi: välilyönnit → alaviivat, lowercase
    def normalize(s: str) -> str:
        return s.lower().replace(" ", "_").replace("-", "_").replace("/", "_")

    nordic_cats = nordic_df[["category", "indicator_name", "unit"]].drop_duplicates()
    new_indicators = []

    for _, row in nordic_cats.iterrows():
        cat = str(row["category"]) if pd.notna(row["category"]) else ""
        name = str(row["indicator_name"]) if pd.notna(row["indicator_name"]) else ""
        ext_id = f"nordic_{normalize(cat)}_{normalize(name)}"[:80]

        if ext_id not in existing_ext_ids:
            new_indicators.append({
                "external_id": ext_id,
                "name": f"{name} (pohjoismaat)",
                "category_name": f"Nordic — {cat}",
                "unit": str(row["unit"]) if pd.notna(row["unit"]) else None,
                "ttt_pilari": "vertailu",
            })
            existing_ext_ids.add(ext_id)

    if new_indicators:
        n = upsert(client, "indicators_ref", new_indicators,
                   on_conflict="external_id", dry_run=dry_run)
        result.rows_inserted = n
        log.info(f"  ✓ {n} uutta nordic-indikaattoria lisätty indicators_ref-tauluun")
    else:
        log.info("  ✓ Kaikki nordic-kategoriat jo linkitetty")

    return result


# ──────────────────────────────────────────────────────────────
# ASKEL 7: ANALYTICS EVENTS — TIETOKANNAN KÄYTTÖTILASTO
# ──────────────────────────────────────────────────────────────

def step_analytics_snapshot(client: Client, dry_run: bool = False,
                              since: Optional[str] = None) -> PipelineResult:
    """
    Kirjaa tietokannan datamäärät analytics_events-tauluun
    päivittäiseksi snapshot-merkinnäksi.

    Tämä aktivoi analytics_events-taulun joka on tällä hetkellä tyhjä.
    Seuraa: rivimäärät tauluittain, laskettujen analyysien määrä.
    """
    result = PipelineResult("analytics_snapshot")
    log.info("ASKEL 7: Analytics snapshot")

    # Laske rivimäärät keskeisistä tauluista
    tables_to_count = [
        "amounts", "cofog_amounts", "time_series", "elasticities",
        "j_code_indicator", "sector_target_population",
        "nordic_indicators", "ttt_essays",
    ]

    now = datetime.now(timezone.utc).isoformat()
    rows = []

    for tbl in tables_to_count:
        try:
            resp = client.table(tbl).select("id", count="exact").limit(1).execute()
            cnt = resp.count or 0
        except Exception:
            cnt = -1

        rows.append({
            "event_type": "db_snapshot",
            "event_data": {
                "table": tbl,
                "row_count": cnt,
                "recorded_at": now,
            },
            "created_at": now,
        })

    n = upsert(client, "analytics_events", rows,
               on_conflict="event_type,created_at", dry_run=dry_run)
    result.rows_inserted = n
    log.info(f"  ✓ {len(rows)} snapshot-merkintää analytics_events-tauluun")
    return result


# ──────────────────────────────────────────────────────────────
# PÄÄOHJELMA
# ──────────────────────────────────────────────────────────────

# ──────────────────────────────────────────────────────────────
# ASKEL 8: JSON-EXPORT — LUKIJAVERSION DATA
# ──────────────────────────────────────────────────────────────

# Taulut jotka viedään JSON-tiedostoiksi lukijaversiota varten.
# Avain = tiedoston nimi (public/data/<key>.json), arvo = Supabase-taulun nimi.
EXPORT_TABLES = {
    "sectors": "sectors",
    "sector_series": "sector_series",
    "sector_target_population": "sector_target_population",
    "sector_jcode_map": "sector_jcode_map",
    "j_codes": "j_codes",
    "j_code_indicator": "j_code_indicator",
    "indicators_ref": "indicators_ref",
    "time_series": "time_series",
    "elasticities": "elasticities",
    "ols_models": "ols_models",
    "ols_coefficients": "ols_coefficients",
    "statistical_tests": "statistical_tests",
    "tfr_forecast": "tfr_forecast",
    "hoiva_aalto_projection": "hoiva_aalto_projection",
    "nordic_indicators": "nordic_indicators",
    "ttt_essays": "ttt_essays",
    "amounts": "amounts",
    "cofog_amounts": "cofog_amounts",
}

# Hakemisto johon JSON-tiedostot kirjoitetaan (suhteessa repon juureen)
EXPORT_DIR = os.environ.get("TTT_EXPORT_DIR", "public/data")


def step_export_json(client: Client, dry_run: bool = False,
                     since: Optional[str] = None) -> PipelineResult:
    """
    Vie keskeiset taulut JSON-tiedostoiksi public/data/-hakemistoon.
    Lukijaversio (staattinen sivusto) lukee nämä tiedostot eikä ole
    riippuvainen Supabase-tietokannasta ajon aikana.

    Tuottaa:
      - public/data/<table>.json   (taulun rivit listana)
      - public/data/manifest.json  (yhteenveto: taulut, rivimäärät, aikaleima)
    """
    import json
    from pathlib import Path

    result = PipelineResult("export_json")
    log.info("ASKEL 8: JSON-export lukijaversiolle")

    out_dir = Path(EXPORT_DIR)
    if not dry_run:
        out_dir.mkdir(parents=True, exist_ok=True)

    manifest = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": "ttt_pipeline.step_export_json",
        "tables": {},
    }

    for fname, table in EXPORT_TABLES.items():
        try:
            df = fetch_df(client, table, "*")
        except Exception as exc:
            result.warnings.append(f"{table}: {exc}")
            log.warning(f"  ! {table} ohitettu: {exc}")
            continue

        rows = df.to_dict(orient="records") if not df.empty else []
        # JSON-yhteensopivuus: NaN → None
        for row in rows:
            for k, v in list(row.items()):
                if isinstance(v, float) and (pd.isna(v) or v != v):
                    row[k] = None

        target = out_dir / f"{fname}.json"
        if dry_run:
            log.info(f"  [dry-run] {target} ({len(rows)} riviä)")
        else:
            with open(target, "w", encoding="utf-8") as f:
                json.dump(rows, f, ensure_ascii=False, separators=(",", ":"), default=str)
        manifest["tables"][fname] = {"file": f"{fname}.json", "rows": len(rows)}
        result.rows_inserted += len(rows)

    if not dry_run:
        with open(out_dir / "manifest.json", "w", encoding="utf-8") as f:
            json.dump(manifest, f, ensure_ascii=False, indent=2, default=str)
    log.info(f"  ✓ {len(manifest['tables'])} taulua viety hakemistoon {EXPORT_DIR}")
    return result


STEPS = {
    "per_capita":        step_per_capita,
    "elasticities":      step_elasticities,
    "ols":               step_ols,
    "forecasts":         step_forecasts,
    "hoiva_aalto":       step_hoiva_aalto,
    "nordic_sync":       step_nordic_sync,
    "analytics_snapshot":step_analytics_snapshot,
    "export_json":       step_export_json,
}

# Suorituksen oletusjärjestys — riippuvuudet huomioitu
DEFAULT_ORDER = [
    "per_capita",        # Ensin: väestödata → per-capita-luvut
    "nordic_sync",       # Linkitä nordic-data
    "elasticities",      # Korrelaatiot (tarvitsee per-capita-datan)
    "ols",               # Regressiot (tarvitsee time_series-datan)
    "forecasts",         # Ennusteet (tarvitsee TFR-datan)
    "hoiva_aalto",       # Projektiot (tarvitsee väestödatan)
    "analytics_snapshot",# Tallenna tilasto ajosta
    "export_json",       # Viimeisenä: vie kaikki JSON-tiedostoiksi
]


def run_pipeline(steps: list[str], dry_run: bool = False,
                 since: Optional[str] = None) -> None:
    client = get_client()
    log.info(f"{'='*55}")
    log.info(f"TTT-ANALYYSIPIPELINE  {'[DRY-RUN] ' if dry_run else ''}{'since='+since if since else ''}")
    log.info(f"{'='*55}")

    results: list[PipelineResult] = []
    start = datetime.now()

    for step_name in steps:
        fn = STEPS.get(step_name)
        if not fn:
            log.warning(f"Tuntematon askel: {step_name} — ohitetaan")
            continue
        try:
            res = fn(client, dry_run=dry_run, since=since)
            results.append(res)
            if res.ok():
                log.info(f"  → {res.summary()}")
            else:
                log.error(f"  → VIRHEITÄ: {res.errors}")
        except Exception as exc:
            log.error(f"  → ASKEL {step_name} kaatui: {exc}")
            log.debug(traceback.format_exc())

    elapsed = (datetime.now() - start).total_seconds()
    log.info(f"{'='*55}")
    log.info(f"Valmis {elapsed:.1f}s — {len(results)} askelta ajettu")
    for r in results:
        icon = "✓" if r.ok() else "✗"
        log.info(f"  {icon} {r.summary()}")
    log.info(f"{'='*55}")

    # Palauta exit-koodi 1 jos virheitä
    if any(not r.ok() for r in results):
        sys.exit(1)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="TTT-analyysipipeline — päivittää Supabase-laskennat"
    )
    parser.add_argument(
        "--step", choices=list(STEPS.keys()),
        help="Aja vain yksi askel (default: kaikki)",
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Laske mutta älä kirjoita kantaan",
    )
    parser.add_argument(
        "--since", metavar="YYYY-MM-DD",
        help="Päivitä vain rivit tämän päivämäärän jälkeen",
    )
    args = parser.parse_args()

    steps = [args.step] if args.step else DEFAULT_ORDER
    run_pipeline(steps, dry_run=args.dry_run, since=args.since)


if __name__ == "__main__":
    main()
