"""
TTT-analyysipipeline v4
=======================
Päivittää Supabase-laskennat. v4-muutokset (vrt. v3):

  UUDET ASKELEET
  ──────────────
  * step_export_supabase_views (askel 15) -- hakee automaattisesti kaikki
    public-skeeman v_*-näkymät tietokannasta ja vie ne
    public/data/views/<nimi>.json. Uudet kannan näkymät tulevat mukaan
    ilman koodimuutoksia. Käyttää information_schema-taulua tai
    'list_public_views()' RPC-funktiota.

  PARANNUKSET
  ───────────
  * EXPORT_TABLES päivitetty: lisätty uudet v3-taulut
    (tfr_forecast_yearly, hoiva_aalto_yearly, nordic_correlations,
    cofog_jcode_amounts).
  * step_export_json: table_exists-tarkistus ennen vientiä (ohittaa
    puuttuvat taulut varoituksella eikä kaadu), skipped_tables ja
    skipped_views kirjataan manifest.json:iin, per-tiedosto-logitus.
  * EXPORT_VIEWS järjestetty teemoittain, kaksoiskappaleet poistettu.
  * DEFAULT_ORDER: export_supabase_views ajetaan viimeisenä jotta
    manifest.json on jo olemassa päivitettäväksi.

Käyttö:
    python ttt_pipeline.py
    python ttt_pipeline.py --step export_supabase_views
    python ttt_pipeline.py --step export_json
    python ttt_pipeline.py --dry-run
    python ttt_pipeline.py --since 2024-01-01

Ympäristömuuttujat:
    TTT_SB_URL                  (Supabase-projektin URL)
    TTT_SB_SERVICE_KEY          (service-key, secrets-tools kautta)
    TTT_EXPORT_DIR=public/data
    TTT_FDR_ALPHA=0.05
    TTT_BOOTSTRAP_N=2000

Tietokantavaatimukset (valinnainen RPC automaattinäkymälistaukselle):
    CREATE OR REPLACE FUNCTION list_public_views()
    RETURNS TABLE(view_name text) LANGUAGE sql SECURITY DEFINER AS $$
      SELECT table_name::text
      FROM   information_schema.views
      WHERE  table_schema = 'public'
      ORDER  BY table_name;
    $$;
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

# Kaikki v_* + muut näkymät jotka viedään JSONiksi public/data/views/-hakemistoon.
# Järjestys: aakkosjärjestys teemoittain → helpompi ylläpitää.
EXPORT_VIEWS = [
    # ── Signaalit & politiikka ──────────────────────────────────
    "v_signal",
    "v_signal_full_chain",
    "v_signal_funding_paradox",
    "v_signal_leverage",
    "v_signal_policy_lag",
    "v_signal_counterfactual",
    "v_signal_counterfactual_v2",
    "v_signal_drift",
    "v_policy_signal",
    # ── Kausaaliketjut ──────────────────────────────────────────
    "v_causal_chain_full",
    "v_causal_chain_summary",
    # ── Kriisit ─────────────────────────────────────────────────
    "v_crisis_chain_timeline",
    "v_crisis_lifecycle",
    "v_crisis_summary",
    "v_crisis_timeseries",
    "v_crisis_wake",
    # ── Väestö & syntyvyys ──────────────────────────────────────
    "v_demographic_pressure",
    "v_fertility_housing",
    "v_housing_fertility_chain",
    "v_population_trend",
    "v_population_weighted",
    "v_fi_tfr",
    # ── Rahoitus & menot ────────────────────────────────────────
    "v_funding_by_jcode",
    "v_spending_by_age_band",
    # ── Hoiva & interventiot ────────────────────────────────────
    "v_hoiva_aalto_summary",
    "v_intervention_simulation",
    "v_interventions_by_lifecycle",
    # ── Osa-aikatyö & TFR (plugin-näkymät) ─────────────────────
    "v_lag_analysis_osa_aikatyo",
    "v_osa_aikatyo_sukupuoli",
    # ── Regressiot & korrelaatiot ───────────────────────────────
    "v_regression_syntyvyys",
    "v_segment_panel",
    "v_detrended_correlation",
    "v_spuriousness_test",
    # ── Pohjoismaat ─────────────────────────────────────────────
    "v_nordic_alcohol",
    "v_nordic_fertility",
    "v_nordic_fertility_trend",
    "v_nordic_fi_comparison",
    "v_nordic_finland_gap",
    "v_nordic_finland_vs_peers",
    "v_nordic_health_expenditure",
    "v_nordic_health_spending",
    "v_nordic_health_workforce",
    "v_nordic_med_finland_gap",
    "v_nordic_med_summary",
    "v_nordic_mental_health",
    "v_nordic_paradox_benchmark",
    "v_nordic_socexp_by_lifecycle",
    "v_nordic_social_spending",
    "v_nordic_suicide",
    # ── Sektorianalyysi ─────────────────────────────────────────
    "per_capita_trend",
    "sector_efficiency_snapshot",
    "sector_spending_per_capita",
]

EXPORT_TABLES = {
    # ── Sektorit & rahoitus ─────────────────────────────────────
    "sectors": "sectors",
    "sector_series": "sector_series",
    "sector_target_population": "sector_target_population",
    "sector_jcode_map": "sector_jcode_map",
    # ── J-koodit & indikaattorit ────────────────────────────────
    "j_codes": "j_codes",
    "j_code_indicator": "j_code_indicator",
    "j_code_cofog": "j_code_cofog",
    "j_code_lifecycle": "j_code_lifecycle",
    "lifecycle_groups": "lifecycle_groups",
    "indicators_ref": "indicators_ref",
    "time_series": "time_series",
    # ── Tilasto- ja regressiomallit ─────────────────────────────
    "elasticities": "elasticities",
    "ols_models": "ols_models",
    "ols_coefficients": "ols_coefficients",
    "statistical_tests": "statistical_tests",
    "regression_results": "regression_results",
    "panel_datasets": "panel_datasets",
    "panel_heterogeneity": "panel_heterogeneity",
    # ── Ennusteet ───────────────────────────────────────────────
    "tfr_forecast": "tfr_forecast",
    "tfr_forecast_yearly": "tfr_forecast_yearly",          # v3 uusi
    "hoiva_aalto_projection": "hoiva_aalto_projection",
    "hoiva_aalto_yearly": "hoiva_aalto_yearly",            # v3 uusi
    # ── Pohjoismaat ─────────────────────────────────────────────
    "nordic_indicators": "nordic_indicators",
    "nordic_category_map": "nordic_category_map",
    "nordic_correlations": "nordic_correlations",          # v3 uusi
    # ── COFOG ───────────────────────────────────────────────────
    "amounts": "amounts",
    "cofog_amounts": "cofog_amounts",
    "cofog_codes": "cofog_codes",
    "cofog_jcode_amounts": "cofog_jcode_amounts",          # v3 uusi
    # ── Kausaaliketjut & kriisit ────────────────────────────────
    "causal_chains": "causal_chains",
    "crisis_events": "crisis_events",
    "policy_decisions": "policy_decisions",
    "intervention_definitions": "intervention_definitions",
    "prevention_package": "prevention_package",
    "fact_intervention_evidence": "fact_intervention_evidence",
    # ── Sisältö ─────────────────────────────────────────────────
    "ttt_essays": "ttt_essays",
    "ttt_chapters": "ttt_chapters",
    "ttt_blocks": "ttt_blocks",
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
# ASKEL 3: OLS (v2:sta -- paneelilaajennus TODO v4)
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
                # HUOM: "significant" on generated column -- älä lähetä
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
                # HUOM: "significant" on generated column -- älä lähetä
                "interpretation": ("Stationaariset residuaalit"
                                   if adf_p < 0.05
                                   else "Ei-stationaariset -- varo spurious"),
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
# ASKEL 4: TFR-ENNUSTE -- vuosittainen (uusi taulu, EI tfr_forecast)
# ──────────────────────────────────────────────────────────────

def step_forecasts(client, dry_run=False, since=None) -> PipelineResult:
    result = PipelineResult("forecasts")
    log.info("ASKEL 4: TFR-vuosiennuste")

    if not table_exists(client, "tfr_forecast_yearly"):
        result.warnings.append(
            "tfr_forecast_yearly-tauluttuottu ei ole -- luo migraatiolla. "
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
            "hoiva_aalto_yearly-taulu puuttuu -- luo migraatiolla. "
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
# ASKEL 6: NORDIC-LINKITYS (meta) -- säilyy v2:sta
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
                "category_name": f"Nordic -- {cat}",
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
            "nordic_correlations-taulu puuttuu -- luo migraatiolla"
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
            "cofog_jcode_amounts-taulu puuttuu -- luo migraatiolla"
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
# ASKEL 9 (UUSI): CAUSAL CHAINS -- synkronointi elasticities-tuloksista
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
    seen = set()
    for _, r in el.iterrows():
        ext = ind_map.get(r["indicator_id"], r["indicator_id"])
        chain_id = f"auto_{r['j_code']}_{ext}"[:80]
        key = (chain_id, 1)
        if key in seen:
            continue
        seen.add(key)
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
                f"v3 sync run_id={RUN_ID} -- OLS β_std, "
                f"p_adj={r.get('p_adjusted')}, sig={r.get('sig_level')}"
            ),
            # HUOM: "strength" JA "direction" ovat generated columns -- älä lähetä
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

    manifest = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "model_run_id": RUN_ID,
        "tables": {},
        "views": {},
        "skipped_tables": [],
        "skipped_views": [],
    }

    def _write(target_dir: Path, fname: str, table: str, bucket_key: str,
               is_view: bool = False) -> bool:
        """Hakee taulun/näkymän ja kirjoittaa JSON-tiedostoon.
        Palauttaa True jos onnistui, False jos ohitettiin/epäonnistui."""
        try:
            df = fetch_df(client, table, "*")
        except Exception as e:
            msg = f"{table}: {e}"
            result.warnings.append(msg)
            log.debug(f"    ✗ {fname}: {e}")
            manifest.setdefault(
                "skipped_views" if is_view else "skipped_tables", []
            ).append({"name": fname, "reason": str(e)})
            return False

        rows = df.to_dict(orient="records") if not df.empty else []

        # Sanitoi NaN → None JSON-serialisointia varten
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
        rel = str(target.relative_to(out_dir))
        manifest[bucket_key][fname] = {
            "file": rel,
            "rows": len(rows),
            "sha256_16": sha,
        }
        result.rows_inserted += len(rows)
        log.info(f"    · {rel} ({len(rows)} riviä)")
        return True

    # ── Taulut ──────────────────────────────────────────────────
    log.info(f"  Viedään {len(EXPORT_TABLES)} taulua → {EXPORT_DIR}/")
    for fname, table in EXPORT_TABLES.items():
        if not table_exists(client, table):
            log.debug(f"    – {table}: taulu puuttuu, ohitetaan")
            manifest["skipped_tables"].append(
                {"name": fname, "reason": "table_not_found"})
            continue
        _write(out_dir, fname, table, "tables", is_view=False)

    # Vie myös moduli011–020 lähdetaulut, jos olemassa mutta ei vielä EXPORT_TABLES:ssa
    extra_tables = [t for t in MODULE_SOURCE_TABLES
                    if t not in EXPORT_TABLES and table_exists(client, t)]
    if extra_tables:
        log.info(f"  Viedään {len(extra_tables)} lisätaulua (module_source_tables)")
        for tbl in extra_tables:
            _write(out_dir, tbl, tbl, "tables", is_view=False)

    # ── Näkymät ─────────────────────────────────────────────────
    log.info(f"  Viedään {len(EXPORT_VIEWS)} näkymää → {EXPORT_DIR}/views/")
    views_ok, views_skipped = 0, 0
    for view in EXPORT_VIEWS:
        if not table_exists(client, view):
            log.debug(f"    – {view}: näkymä puuttuu, ohitetaan")
            manifest["skipped_views"].append(
                {"name": view, "reason": "view_not_found"})
            views_skipped += 1
            continue
        ok = _write(views_dir, view, view, "views", is_view=True)
        if ok:
            views_ok += 1
        else:
            views_skipped += 1

    # ── Manifest ────────────────────────────────────────────────
    if not dry_run:
        manifest_path = out_dir / "manifest.json"
        manifest_path.write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2, default=str),
            encoding="utf-8")

    n_tables = len(manifest["tables"])
    n_views  = len(manifest["views"])
    log.info(
        f"  ✓ {n_tables} taulua + {n_views} näkymää kirjoitettu "
        f"({views_skipped} näkymää ohitettu) → {EXPORT_DIR}"
    )
    return result


# ──────────────────────────────────────────────────────────────
# ASKEL 13: PLUGIN-NÄKYMÄT (osa-aikatyö-analyysi pluginia varten)
# ──────────────────────────────────────────────────────────────
# Tuottaa neljä JSON-tiedostoa public/data/views/-hakemistoon, joita
# `vaesto-huoltosuhde` (ja vastaavat) pluginit voivat lukea suoraan ilman
# Supabase-yhteyttä:
#   v_osa_aikatyo_sukupuoli.json   -- vuosittain naiset/miehet osa-aikatyö% (1990–2024)
#   v_lag_analysis_osa_aikatyo.json -- TFR vs naiset_osaaikatyo_pct_2534, lag 0–10v
#   v_detrended_correlation.json    -- trendipoistettu r samojen sarjojen välillä
#   v_spuriousness_test.json        -- falsifiointi vuosikymmenittäin (R²)

def _pv_num(v):
    if v is None:
        return None
    try:
        f = float(v)
        if f != f:
            return None
        return round(f, 4)
    except Exception:
        return None


def _pv_write(out_dir: Path, fname: str, rows: list, dry_run: bool,
              result: PipelineResult, written: list):
    payload = json.dumps(rows, ensure_ascii=False,
                         separators=(",", ":"), default=str)
    if not dry_run:
        (out_dir / f"{fname}.json").write_text(payload, encoding="utf-8")
    result.rows_inserted += len(rows)
    written.append(fname)
    log.info(f"    · {fname}.json ({len(rows)} riviä)")


def step_plugin_views(client, dry_run=False, since=None) -> PipelineResult:
    result = PipelineResult("plugin_views")
    log.info("ASKEL 13: Plugin-näkymät (osa-aikatyö & TFR)")

    out_dir = Path(EXPORT_DIR) / "views"
    if not dry_run:
        out_dir.mkdir(parents=True, exist_ok=True)

    ts = fetch_df(client, "time_series", "j_code,year,value")
    if ts.empty:
        result.warnings.append("time_series tyhjä")
        return result

    pivot = (ts.pivot_table(index="year", columns="j_code",
                            values="value", aggfunc="mean")
               .sort_index())

    TFR = "syntyvyys_tfr"
    NAI = "naiset_osaaikatyo_pct_2534"
    MIE = "miehet_osaaikatyo_pct_2534"

    written: list[str] = []

    # 1) Osa-aikatyö sukupuolittain
    if NAI in pivot.columns or MIE in pivot.columns:
        rows = []
        for yr, r in pivot.iterrows():
            try:
                yi = int(yr)
            except Exception:
                continue
            if 1990 <= yi <= 2024:
                rows.append({
                    "year": yi,
                    "naiset_osa_pct": _pv_num(r.get(NAI)) if NAI in pivot.columns else None,
                    "miehet_osa_pct": _pv_num(r.get(MIE)) if MIE in pivot.columns else None,
                })
        _pv_write(out_dir, "v_osa_aikatyo_sukupuoli", rows, dry_run,
                  result, written)
    else:
        result.warnings.append(
            "naiset/miehet_osaaikatyo_pct_2534 puuttuu time_series:stä")

    # 2) Lag-analyysi (korvaa nykyiset nolla-rivit)
    if TFR in pivot.columns and NAI in pivot.columns:
        s = pivot[[TFR, NAI]].dropna().sort_index()
        rows = []
        for lag in range(0, 11):
            if lag == 0:
                x, y = s[NAI].values, s[TFR].values
            else:
                x = s[NAI].values[:-lag]
                y = s[TFR].values[lag:]
            n = len(x)
            if n >= 5 and np.std(x) > 0 and np.std(y) > 0:
                r, p = pearsonr(x, y)
                rows.append({"lag_years": lag,
                             "pearson_r": round(float(r), 4),
                             "p_value": round(float(p), 4),
                             "n": int(n)})
            else:
                rows.append({"lag_years": lag, "pearson_r": None,
                             "p_value": None, "n": int(n)})
        _pv_write(out_dir, "v_lag_analysis_osa_aikatyo", rows, dry_run,
                  result, written)

    # 3) Detrendattu korrelaatio
    if TFR in pivot.columns and NAI in pivot.columns:
        s = pivot[[TFR, NAI]].dropna().sort_index()
        if len(s) >= 5:
            from scipy.signal import detrend as _detrend
            tfr_d = _detrend(s[TFR].values)
            osa_d = _detrend(s[NAI].values)
            r_raw, p_raw = pearsonr(s[TFR].values, s[NAI].values)
            r_det, p_det = pearsonr(tfr_d, osa_d)
            payload = [{
                "n": int(len(s)),
                "year_min": int(s.index.min()),
                "year_max": int(s.index.max()),
                "raw_r": round(float(r_raw), 4),
                "raw_p": round(float(p_raw), 4),
                "detrended_r": round(float(r_det), 4),
                "detrended_p": round(float(p_det), 4),
                "tulkinta": ("Trendipoiston jälkeen jäävä yhteys: mitä lähempänä "
                             "nollaa detrended_r on, sitä todennäköisemmin alkuperäinen "
                             "korrelaatio selittyi yhteisellä aikatrendillä.")
            }]
            _pv_write(out_dir, "v_detrended_correlation", payload, dry_run,
                      result, written)

    # 4) Spuriousness-testi (falsifiointi vuosikymmenittäin)
    if TFR in pivot.columns and NAI in pivot.columns:
        s = pivot[[TFR, NAI]].dropna().sort_index()
        rows = []
        windows = [
            ("1990-luku", 1990, 1999),
            ("2000-luku", 2000, 2009),
            ("2010-luku", 2010, 2019),
            ("2020-luku", 2020, 2029),
            ("Koko jakso", int(s.index.min()) if len(s) else 1990,
                            int(s.index.max()) if len(s) else 2024),
        ]
        for label, lo, hi in windows:
            sub = s[(s.index >= lo) & (s.index <= hi)]
            if len(sub) >= 5 and sub[NAI].std() > 0 and sub[TFR].std() > 0:
                r, p = pearsonr(sub[NAI].values, sub[TFR].values)
                rows.append({"jakso": label, "year_min": int(lo), "year_max": int(hi),
                             "n": int(len(sub)),
                             "pearson_r": round(float(r), 4),
                             "r_squared": round(float(r * r), 4),
                             "p_value": round(float(p), 4)})
            else:
                rows.append({"jakso": label, "year_min": int(lo), "year_max": int(hi),
                             "n": int(len(sub)), "pearson_r": None,
                             "r_squared": None, "p_value": None})
        _pv_write(out_dir, "v_spuriousness_test", rows, dry_run,
                  result, written)

    # Päivitä manifest, jos export_json on jo ajettu samassa ajossa
    manifest_path = Path(EXPORT_DIR) / "manifest.json"
    if not dry_run and manifest_path.exists() and written:
        try:
            mf = json.loads(manifest_path.read_text(encoding="utf-8"))
            mf.setdefault("views", {})
            for fname in written:
                fp = out_dir / f"{fname}.json"
                if not fp.exists():
                    continue
                payload = fp.read_text(encoding="utf-8")
                rows = json.loads(payload)
                sha = hashlib.sha256(payload.encode("utf-8")).hexdigest()[:16]
                mf["views"][fname] = {
                    "file": f"views/{fname}.json",
                    "rows": len(rows),
                    "sha256_16": sha,
                }
            manifest_path.write_text(
                json.dumps(mf, ensure_ascii=False, indent=2, default=str),
                encoding="utf-8")
        except Exception as e:
            result.warnings.append(f"manifest-päivitys epäonnistui: {e}")

    log.info(f"  ✓ {len(written)} plugin-näkymää → {EXPORT_DIR}/views")
    return result


# ──────────────────────────────────────────────────────────────
# ASKEL 14: MODULE-VIEWS (moduli011–020 plugin-kontraktit)
# ──────────────────────────────────────────────────────────────
# Tuottaa kunkin modulin JSON-näkymän public/data/views/-kansioon.
# Jokainen builder hakee oikeat taulut Supabasesta kehityssuunnitelman
# mukaisesti. Jos taulu puuttuu tai on tyhjä → status="stub".
# Jos osa lähteistä saatavilla → status="partial".
# Kaikki lähteet saatavilla → status="ready".

# Taulut joita module_views tarvitsee (lisätään EXPORT_TABLES:iin
# automaattisesti jos niitä ei ole vielä siellä)
MODULE_SOURCE_TABLES = [
    "regional_welfare_indicators",
    "population_pyramid_historical",
    "population_projection_2040",
    "transfers_by_age_group",
    "mental_health_diagnoses_by_age",
    "mental_health_waiting_times_regional",
    "sick_leave_mental_health",
    "mental_health_nordic_comparison",
    "education_outcomes_by_cohort",
    "pisa_finland_trend",
    "early_childhood_roi_estimates",
    "migration_net_flows",
    "immigrant_employment_integration",
    "fiscal_impact_immigration",
    "housing_price_income_ratio",
    "segregation_index_cities",
    "homelessness_trend",
    "gini_pretax_posttax",
    "effective_tax_rate_by_decile",
    "corporate_tax_trend_eu",
    "world_happiness_nordic",
    "institutional_trust_survey",
    "loneliness_statistics",
    "climate_policy_distributional_impact",
    "energy_poverty_finland",
    "green_transition_jobs",
    "realtime_indicators",        # moduli020: Tilastokeskus + Kela snapshot
]


def _mw_fetch(client: Client, table: str,
              result: PipelineResult) -> pd.DataFrame:
    """Hakee taulun; palauttaa tyhjän DataFramen ja kirjaa varoituksen jos epäonnistuu."""
    try:
        df = fetch_df(client, table, "*")
        return df
    except Exception as e:
        result.warnings.append(f"{table}: {e}")
        return pd.DataFrame()


def _mw_nan(rows: list[dict]) -> list[dict]:
    """Korvaa NaN-arvot None:lla JSON-serialisointia varten."""
    for row in rows:
        for k, v in list(row.items()):
            if isinstance(v, float) and (pd.isna(v) or v != v):
                row[k] = None
    return rows


def _mw_payload(module_id: str, title: str, priority: int,
                sources_used: list[str], sources_missing: list[str],
                data: list[dict], note: str = "") -> dict:
    if sources_missing and not data:
        status = "stub"
    elif sources_missing:
        status = "partial"
    else:
        status = "ready"
    return {
        "status": status,
        "module_id": module_id,
        "title": title,
        "priority": priority,
        "sources_used": sources_used,
        "sources_missing": sources_missing,
        "data": data,
        "note": note,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def _mw_write(out_dir: Path, fname: str, payload: dict,
              dry_run: bool, result: PipelineResult,
              written: list, index_entries: list) -> None:
    body = json.dumps(payload, ensure_ascii=False,
                      separators=(",", ":"), default=str)
    if not dry_run:
        (out_dir / f"{fname}.json").write_text(body, encoding="utf-8")
    written.append((fname, payload["status"]))
    result.rows_inserted += len(payload["data"]) or 1
    index_entries.append({
        "module_id": payload["module_id"],
        "title": payload["title"],
        "priority": payload["priority"],
        "view": f"views/{fname}.json",
        "status": payload["status"],
        "sources_used": payload["sources_used"],
        "sources_missing": payload["sources_missing"],
    })
    log.info(f"    · {fname}.json [{payload['status']}, "
             f"{len(payload['data'])} riviä]")


# ── Builder-funktiot per moduli ──────────────────────────────

def _build_moduli011(client, result) -> dict:
    """Hyvinvointi maakunnittain — alueellinen eriarvoisuuskartta.

    Lähde: regional_welfare_indicators (kunta_id/maakunta_id, year,
    indicator_code, value). Moduli odottaa tämän rakenteen suoraan.
    """
    df = _mw_fetch(client, "regional_welfare_indicators", result)
    used, missing = [], []
    if df.empty:
        missing.append("regional_welfare_indicators")
        return _mw_payload(
            "moduli011_alueellinen_eriarvoisuus",
            "Hyvinvointi maakunnittain — alueellinen eriarvoisuuskartta",
            1, used, missing, [])

    used.append("regional_welfare_indicators")
    # Normalisoi sarakenimet joustavasti
    col_map = {}
    for c in df.columns:
        lc = c.lower()
        if lc in ("kunta_id", "kunta", "region_id", "maakunta_id", "alue_id"):
            col_map[c] = "alue_id"
        elif lc in ("maakunta", "maakunta_nimi", "region_name", "alue_nimi"):
            col_map[c] = "alue_nimi"
        elif lc in ("indicator_code", "indikaattori", "indicator"):
            col_map[c] = "indikaattori"
        elif lc in ("indicator_label", "indicator_name", "nimi", "label"):
            col_map[c] = "indikaattori_nimi"
        elif lc == "year":
            col_map[c] = "year"
        elif lc == "value":
            col_map[c] = "value"
    df = df.rename(columns=col_map)

    rows = _mw_nan(df.to_dict(orient="records"))
    return _mw_payload(
        "moduli011_alueellinen_eriarvoisuus",
        "Hyvinvointi maakunnittain — alueellinen eriarvoisuuskartta",
        1, used, missing, rows)


def _build_moduli012(client, result) -> dict:
    """Sukupolvien välinen tasapaino.

    Lähteet:
      population_pyramid_historical  → ikäryhmä × sukupuoli × vuosi
      population_projection_2040     → Tilastokeskuksen ennuste 2025–2040
      transfers_by_age_group         → julkiset tulonsiirrot ikäryhmittäin
    Yhdistetään vuosi + age_group -avaimella.
    """
    used, missing = [], []

    df_hist = _mw_fetch(client, "population_pyramid_historical", result)
    df_proj = _mw_fetch(client, "population_projection_2040", result)
    df_tr   = _mw_fetch(client, "transfers_by_age_group", result)

    if not df_hist.empty:
        used.append("population_pyramid_historical")
    else:
        missing.append("population_pyramid_historical")
    if not df_proj.empty:
        used.append("population_projection_2040")
    else:
        missing.append("population_projection_2040")
    if not df_tr.empty:
        used.append("transfers_by_age_group")
    else:
        missing.append("transfers_by_age_group")

    if df_hist.empty and df_proj.empty:
        return _mw_payload(
            "moduli012_sukupolvien_tasapaino",
            "Sukupolvien välinen tasapaino",
            1, used, missing, [])

    # Yhdistä historialliset + ennuste, merkitse tyyppi
    frames = []
    if not df_hist.empty:
        df_hist = df_hist.copy()
        df_hist["data_type"] = "historical"
        frames.append(df_hist)
    if not df_proj.empty:
        df_proj = df_proj.copy()
        df_proj["data_type"] = "projection"
        frames.append(df_proj)

    pop_df = pd.concat(frames, ignore_index=True)

    # Liitä tulonsiirrot jos saatavilla
    if not df_tr.empty:
        join_cols = [c for c in ("year", "age_group") if c in pop_df.columns and c in df_tr.columns]
        if join_cols:
            pop_df = pop_df.merge(df_tr, on=join_cols, how="left", suffixes=("", "_tr"))

    rows = _mw_nan(pop_df.to_dict(orient="records"))
    note = ("Tulonsiirtoja ei voitu liittää (transfers_by_age_group puuttuu)."
            if "transfers_by_age_group" in missing else "")
    return _mw_payload(
        "moduli012_sukupolvien_tasapaino",
        "Sukupolvien välinen tasapaino",
        1, used, missing, rows, note)


def _build_moduli013(client, result) -> dict:
    """Mielenterveyskriisin syvyys.

    Lähteet:
      mental_health_diagnoses_by_age         → diagnoositrendi ikäryhmittäin
      mental_health_waiting_times_regional   → hoitoonpääsy maakunnittain
      sick_leave_mental_health               → sairauspoissaolot + talousvaikutus
      mental_health_nordic_comparison        → kansainvälinen vertailu
    Palautetaan rakenteinen dict neljällä osa-alueella.
    """
    used, missing = [], []

    dfs = {}
    sources = {
        "diagnoses":  "mental_health_diagnoses_by_age",
        "waiting":    "mental_health_waiting_times_regional",
        "sick_leave": "sick_leave_mental_health",
        "nordic":     "mental_health_nordic_comparison",
    }
    for key, tbl in sources.items():
        df = _mw_fetch(client, tbl, result)
        if not df.empty:
            used.append(tbl)
            dfs[key] = _mw_nan(df.to_dict(orient="records"))
        else:
            missing.append(tbl)
            dfs[key] = []

    data = [{"section": k, "rows": v} for k, v in dfs.items()]
    return _mw_payload(
        "moduli013_mielenterveyskriisi",
        "Mielenterveyskriisin syvyys",
        1, used, missing, data)


def _build_moduli014(client, result) -> dict:
    """Koulutus–tuottavuus–hyvinvointi -ketju.

    Lähteet:
      education_outcomes_by_cohort   → koulutusaste → mediaanipalkka per kohortti
      pisa_finland_trend             → PISA-pisteet 2000–2025
      early_childhood_roi_estimates  → varhaiskasvatus-ROI-estimaatit
    """
    used, missing = [], []
    dfs = {}
    sources = {
        "education_outcomes": "education_outcomes_by_cohort",
        "pisa":               "pisa_finland_trend",
        "roi":                "early_childhood_roi_estimates",
    }
    for key, tbl in sources.items():
        df = _mw_fetch(client, tbl, result)
        if not df.empty:
            used.append(tbl)
            dfs[key] = _mw_nan(df.to_dict(orient="records"))
        else:
            missing.append(tbl)
            dfs[key] = []

    data = [{"section": k, "rows": v} for k, v in dfs.items()]
    return _mw_payload(
        "moduli014_koulutus_tuottavuus",
        "Koulutus–tuottavuus–hyvinvointi -ketju",
        2, used, missing, data)


def _build_moduli015(client, result) -> dict:
    """Maahanmuutto ja väestödynamiikka.

    Lähteet:
      migration_net_flows               → nettomaahanmuutto vs. luonnollinen kasvu
      immigrant_employment_integration  → työllisyysaste maassaoloajan mukaan
      fiscal_impact_immigration         → fiskaalinen nettovaikutus per ryhmä
    Jos lähdetaulut puuttuvat, täydennetään time_series-pivotista.
    """
    used, missing = [], []

    df_flows = _mw_fetch(client, "migration_net_flows", result)
    df_empl  = _mw_fetch(client, "immigrant_employment_integration", result)
    df_fisc  = _mw_fetch(client, "fiscal_impact_immigration", result)

    dfs: dict[str, list] = {}
    for key, df, tbl in [
        ("net_flows",    df_flows, "migration_net_flows"),
        ("employment",   df_empl,  "immigrant_employment_integration"),
        ("fiscal",       df_fisc,  "fiscal_impact_immigration"),
    ]:
        if not df.empty:
            used.append(tbl)
            dfs[key] = _mw_nan(df.to_dict(orient="records"))
        else:
            missing.append(tbl)
            dfs[key] = []

    # Fallback: time_series-pivot migraatiomuuttujille
    if not dfs["net_flows"]:
        try:
            ts = fetch_df(client, "time_series", "j_code,year,value")
            if not ts.empty:
                pivot = ts.pivot_table(
                    index="year", columns="j_code",
                    values="value", aggfunc="mean").sort_index()
                candidates = [c for c in pivot.columns
                              if "maahanmuutt" in str(c).lower()
                              or "migration" in str(c).lower()
                              or "nettomig" in str(c).lower()]
                if candidates:
                    rows = []
                    for col in candidates:
                        for yr, v in pivot[col].dropna().items():
                            try:
                                rows.append({"year": int(yr), "indicator": col,
                                             "value": round(float(v), 4),
                                             "source": "time_series_fallback"})
                            except Exception:
                                continue
                    if rows:
                        dfs["net_flows"] = rows
                        if "migration_net_flows" in missing:
                            missing.remove("migration_net_flows")
                        used.append("time_series[migration_fallback]")
        except Exception as e:
            result.warnings.append(f"moduli015 time_series-fallback epäonnistui: {e}")

    data = [{"section": k, "rows": v} for k, v in dfs.items()]
    return _mw_payload(
        "moduli015_maahanmuutto",
        "Maahanmuutto ja väestödynamiikka",
        2, used, missing, data)


def _build_moduli016(client, result) -> dict:
    """Asuntomarkkinat ja segregaatio.

    Lähteet:
      housing_price_income_ratio  → hintakehitys suhteessa ansiotasoon alueittain
      segregation_index_cities    → segregaatioindeksi kaupungeittain
      homelessness_trend          → asunnottomuuden trendi
    """
    used, missing = [], []
    dfs = {}
    sources = {
        "price_income": "housing_price_income_ratio",
        "segregation":  "segregation_index_cities",
        "homelessness": "homelessness_trend",
    }
    for key, tbl in sources.items():
        df = _mw_fetch(client, tbl, result)
        if not df.empty:
            used.append(tbl)
            dfs[key] = _mw_nan(df.to_dict(orient="records"))
        else:
            missing.append(tbl)
            dfs[key] = []

    data = [{"section": k, "rows": v} for k, v in dfs.items()]
    return _mw_payload(
        "moduli016_asuntomarkkinat",
        "Asuntomarkkinat ja segregaatio",
        3, used, missing, data)


def _build_moduli017(client, result) -> dict:
    """Verojärjestelmä ja redistributio.

    Lähteet:
      gini_pretax_posttax           → Gini ennen/jälkeen verotuksen 1990–2025
      effective_tax_rate_by_decile  → efektiivinen veroaste tulodesiileittäin
      corporate_tax_trend_eu        → yhteisövero vs. EU-keskiarvo
    Gini-data yhdistetään desiilidataan year-avaimella.
    """
    used, missing = [], []

    df_gini  = _mw_fetch(client, "gini_pretax_posttax", result)
    df_decil = _mw_fetch(client, "effective_tax_rate_by_decile", result)
    df_corp  = _mw_fetch(client, "corporate_tax_trend_eu", result)

    dfs: dict[str, list] = {}
    for key, df, tbl in [
        ("gini",          df_gini,  "gini_pretax_posttax"),
        ("decile_rates",  df_decil, "effective_tax_rate_by_decile"),
        ("corporate_tax", df_corp,  "corporate_tax_trend_eu"),
    ]:
        if not df.empty:
            used.append(tbl)
            dfs[key] = _mw_nan(df.to_dict(orient="records"))
        else:
            missing.append(tbl)
            dfs[key] = []

    # Yhdistetty gini+desiilinäkymä jos molemmat saatavilla
    if not df_gini.empty and not df_decil.empty:
        try:
            if "year" in df_gini.columns and "year" in df_decil.columns:
                merged = df_decil.merge(
                    df_gini[["year"] + [c for c in df_gini.columns if c != "year"]],
                    on="year", how="left")
                dfs["merged_year"] = _mw_nan(merged.to_dict(orient="records"))
        except Exception as e:
            result.warnings.append(f"moduli017 merge epäonnistui: {e}")

    data = [{"section": k, "rows": v} for k, v in dfs.items()]
    return _mw_payload(
        "moduli017_verojarjestelma",
        "Verojärjestelmä ja redistributio",
        2, used, missing, data)


def _build_moduli018(client, result) -> dict:
    """Subjektiivinen hyvinvointi ja luottamus.

    Lähteet:
      world_happiness_nordic       → WHR-pisteet Pohjoismaille 2012–2025
      institutional_trust_survey   → luottamus instituutioihin, trendi
      loneliness_statistics        → yksinäisyys % väestöstä ikäryhmittäin
    Täydennetään nordic_indicators-taulusta jos omat taulut puuttuvat.
    """
    used, missing = [], []

    df_hap  = _mw_fetch(client, "world_happiness_nordic", result)
    df_tr   = _mw_fetch(client, "institutional_trust_survey", result)
    df_lone = _mw_fetch(client, "loneliness_statistics", result)

    dfs: dict[str, list] = {}
    for key, df, tbl in [
        ("happiness", df_hap,  "world_happiness_nordic"),
        ("trust",     df_tr,   "institutional_trust_survey"),
        ("loneliness",df_lone, "loneliness_statistics"),
    ]:
        if not df.empty:
            used.append(tbl)
            dfs[key] = _mw_nan(df.to_dict(orient="records"))
        else:
            missing.append(tbl)
            dfs[key] = []

    # Fallback: nordic_indicators → happiness / trust -indikaattorit
    if not dfs["happiness"] or not dfs["trust"]:
        try:
            nd = fetch_df(client, "nordic_indicators",
                          "country_code,indicator_code,year,value")
            if not nd.empty:
                for key, pattern, missing_tbl in [
                    ("happiness", "happiness",    "world_happiness_nordic"),
                    ("trust",     "luottamus|trust", "institutional_trust_survey"),
                ]:
                    if not dfs[key]:
                        mask = nd["indicator_code"].astype(str).str.contains(
                            pattern, case=False, na=False)
                        sub = nd[mask]
                        if not sub.empty:
                            dfs[key] = _mw_nan(sub.rename(
                                columns={"country_code": "country"}).to_dict(orient="records"))
                            if missing_tbl in missing:
                                missing.remove(missing_tbl)
                            used.append(f"nordic_indicators[{pattern}_fallback]")
        except Exception as e:
            result.warnings.append(f"moduli018 nordic_indicators-fallback epäonnistui: {e}")

    data = [{"section": k, "rows": v} for k, v in dfs.items()]
    return _mw_payload(
        "moduli018_subjektiivinen_hyvinvointi",
        "Subjektiivinen hyvinvointi ja luottamus",
        3, used, missing, data)


def _build_moduli019(client, result) -> dict:
    """Ilmasto–hyvinvointikytkentä.

    Lähteet:
      climate_policy_distributional_impact  → kustannusjako tulodesiileittäin
      energy_poverty_finland                → energiaköyhyys % kotitalouksista
      green_transition_jobs                 → vihreän siirtymän työpaikkamuutos alueittain
    """
    used, missing = [], []
    dfs = {}
    sources = {
        "distributional": "climate_policy_distributional_impact",
        "energy_poverty": "energy_poverty_finland",
        "jobs":           "green_transition_jobs",
    }
    for key, tbl in sources.items():
        df = _mw_fetch(client, tbl, result)
        if not df.empty:
            used.append(tbl)
            dfs[key] = _mw_nan(df.to_dict(orient="records"))
        else:
            missing.append(tbl)
            dfs[key] = []

    data = [{"section": k, "rows": v} for k, v in dfs.items()]
    return _mw_payload(
        "moduli019_ilmasto_hyvinvointi",
        "Ilmasto–hyvinvointikytkentä",
        3, used, missing, data)


def _build_moduli020(client, result) -> dict:
    """Reaaliaikadashboard (API-integraatio).

    Lähde: realtime_indicators — taulu jota ulkoinen etl-prosessi
    (Tilastokeskus StatFin + Kela API) täyttää. Sarakkeet:
      indicator_code, indicator_label, value, unit,
      fetched_at (ISO-8601), source_api, yoy_change_pct

    Jos taulu löytyy ja on tuore (viimeinen rivi < 24h vanha) → "ready".
    Jos löytyy mutta vanha → "partial" + varoitus.
    Jos puuttuu → "stub".
    """
    used, missing = [], []

    df = _mw_fetch(client, "realtime_indicators", result)
    if df.empty:
        missing.append("realtime_indicators")
        return _mw_payload(
            "moduli020_realtime_dashboard",
            "Reaaliaikadashboard (API-integraatio)",
            3, used, missing, [],
            note=("realtime_indicators-taulu puuttuu tai on tyhjä. "
                  "Käynnistä StatFin+Kela ETL-prosessi täyttämään taulu "
                  "ennen module_views-askelta."))

    used.append("realtime_indicators")

    # Tarkista tuoreus
    note = ""
    if "fetched_at" in df.columns:
        try:
            latest = pd.to_datetime(df["fetched_at"], utc=True).max()
            age_h = (datetime.now(timezone.utc) -
                     latest.to_pydatetime()).total_seconds() / 3600
            if age_h > 24:
                missing.append("realtime_indicators[stale]")
                note = (f"Data on {age_h:.0f} tuntia vanhaa (> 24h). "
                        "Päivitä StatFin/Kela ETL.")
            elif age_h > 1:
                note = f"Data päivitetty {age_h:.0f} tuntia sitten."
        except Exception:
            pass

    rows = _mw_nan(df.to_dict(orient="records"))
    return _mw_payload(
        "moduli020_realtime_dashboard",
        "Reaaliaikadashboard (API-integraatio)",
        3, used, missing, rows, note)


# ── Pääfunktio ───────────────────────────────────────────────

def step_module_views(client, dry_run=False, since=None) -> PipelineResult:
    result = PipelineResult("module_views")
    log.info("ASKEL 14: Module-views (moduli011–020 plugin-kontraktit)")

    out_dir = Path(EXPORT_DIR) / "views"
    if not dry_run:
        out_dir.mkdir(parents=True, exist_ok=True)

    # (kanoninen_nimi, builder, [alias-nimet joita index.json odottaa])
    # Alias-tiedostot kirjoitetaan samaan views/-kansioon identtisellä sisällöllä,
    # jotta plugin-host voi hakea ne index.json:n views-listan nimillä.
    builders = [
        ("v_moduli011_alueellinen_eriarvoisuus",  _build_moduli011,
         ["regional_welfare_indicators"]),
        ("v_moduli012_sukupolvien_tasapaino",     _build_moduli012,
         ["population_pyramid_historical", "population_projection_2040"]),
        ("v_moduli013_mielenterveyskriisi",       _build_moduli013,
         ["mental_health_diagnoses_by_age", "mental_health_waiting_times_regional",
          "sick_leave_mental_health", "mental_health_nordic_comparison"]),
        ("v_moduli014_koulutus_tuottavuus",       _build_moduli014,
         ["education_outcomes_by_cohort", "pisa_finland_trend",
          "early_childhood_roi_estimates"]),
        ("v_moduli015_maahanmuutto",              _build_moduli015,
         ["migration_net_flows", "immigrant_employment_integration",
          "fiscal_impact_immigration"]),
        ("v_moduli016_asuntomarkkinat",           _build_moduli016,
         ["housing_price_income_ratio", "segregation_index_cities",
          "homelessness_trend"]),
        ("v_moduli017_verojarjestelma",           _build_moduli017,
         ["gini_pretax_posttax", "effective_tax_rate_by_decile",
          "corporate_tax_trend_eu"]),
        ("v_moduli018_subjektiivinen_hyvinvointi",_build_moduli018,
         ["world_happiness_nordic", "institutional_trust_survey",
          "loneliness_statistics"]),
        ("v_moduli019_ilmasto_hyvinvointi",       _build_moduli019,
         ["climate_policy_distributional_impact", "energy_poverty_finland",
          "green_transition_jobs"]),
        ("v_moduli020_realtime_dashboard",        _build_moduli020,
         ["realtime_indicators"]),
    ]

    written: list[tuple[str, str]] = []
    index_entries: list[dict] = []

    for fname, builder, aliases in builders:
        try:
            payload = builder(client, result)
        except Exception as e:
            result.errors.append(f"{fname}: odottamaton virhe: {e}")
            log.error(f"    ✗ {fname}: {e}")
            continue
        _mw_write(out_dir, fname, payload, dry_run, result, written, index_entries)

        # Kirjoita alias-nimet (index.json:n views-lista käyttää lähdetaulun nimeä)
        if not dry_run and aliases:
            body = json.dumps(payload, ensure_ascii=False,
                              separators=(",", ":"), default=str)
            for alias in aliases:
                alias_path = out_dir / f"{alias}.json"
                # Kirjoita vain jos tiedosto puuttuu tai on vanhempi
                if not alias_path.exists():
                    alias_path.write_text(body, encoding="utf-8")
                    log.info(f"      alias: {alias}.json")

    # Module-indeksi: yksi tiedosto plugin-hostille
    if not dry_run:
        idx = {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "modules": index_entries,
        }
        (out_dir / "_modules_index.json").write_text(
            json.dumps(idx, ensure_ascii=False, indent=2, default=str),
            encoding="utf-8")

    # Päivitä manifest, jos export_json on jo ajettu samassa ajossa
    manifest_path = Path(EXPORT_DIR) / "manifest.json"
    if not dry_run and manifest_path.exists() and written:
        try:
            mf = json.loads(manifest_path.read_text(encoding="utf-8"))
            mf.setdefault("views", {})
            mf.setdefault("modules", {})
            for fname, status in written:
                fp = out_dir / f"{fname}.json"
                if not fp.exists():
                    continue
                payload_str = fp.read_text(encoding="utf-8")
                sha = hashlib.sha256(payload_str.encode("utf-8")).hexdigest()[:16]
                mf["views"][fname] = {
                    "file": f"views/{fname}.json",
                    "sha256_16": sha,
                    "status": status,
                }
            mf["modules"] = {e["module_id"]: e for e in index_entries}
            manifest_path.write_text(
                json.dumps(mf, ensure_ascii=False, indent=2, default=str),
                encoding="utf-8")
        except Exception as e:
            result.warnings.append(f"manifest-päivitys epäonnistui: {e}")

    ready   = sum(1 for _, s in written if s == "ready")
    partial = sum(1 for _, s in written if s == "partial")
    stubs   = sum(1 for _, s in written if s == "stub")
    log.info(f"  ✓ {len(written)} module-näkymää "
             f"(ready={ready}, partial={partial}, stub={stubs}) "
             f"+ _modules_index.json")
    return result


# ──────────────────────────────────────────────────────────────
# ASKEL 15 (UUSI): SUPABASE-NÄKYMIEN AUTOMAATTIHAKU
# Kyselee tietokannalta kaikki v_* -näkymät, vertaa EXPORT_VIEWS-
# listaan ja vie puuttuvat automaattisesti public/data/views/-kansioon.
# Näin uudet näkymät tulevat mukaan ilman koodimuutoksia.
# ──────────────────────────────────────────────────────────────

def _fetch_db_views(client: Client) -> list[str]:
    """Hakee kaikki public-skeeman v_* ja muut näkymät tietokannasta
    käyttäen information_schema-taulua Supabase RPC:n kautta."""
    try:
        resp = _exec(
            client.rpc("list_public_views", {})
        )
        if resp.data:
            return [r["view_name"] if isinstance(r, dict) else str(r)
                    for r in resp.data]
    except Exception:
        pass

    # Fallback: yritä information_schema suoraan
    try:
        resp = _exec(
            client.from_("information_schema.views")
            .select("table_name")
            .eq("table_schema", "public")
        )
        if resp.data:
            return [r["table_name"] for r in resp.data]
    except Exception:
        pass

    return []


def step_export_supabase_views(client, dry_run=False, since=None) -> PipelineResult:
    """Askel 15: Vie kaikki Supabasen public-skeeman näkymät automaattisesti.

    Logiikka:
    1. Hakee kaikki näkymät tietokannasta (information_schema / RPC).
    2. Vie näkymät jotka a) ovat jo EXPORT_VIEWS-listassa TAI b) alkavat 'v_'.
    3. Tallentaa tiedostot public/data/views/<nimi>.json.
    4. Päivittää manifest.json:n views-osion.
    5. Kirjaa skipping_list.json jos näkymiä löytyy kannasta mutta ei viedy.
    """
    result = PipelineResult("export_supabase_views")
    log.info("ASKEL 15: Automaattinen Supabase-näkymävienti")

    out_dir = Path(EXPORT_DIR)
    views_dir = out_dir / "views"
    if not dry_run:
        out_dir.mkdir(parents=True, exist_ok=True)
        views_dir.mkdir(parents=True, exist_ok=True)

    # 1) Hae kaikki kannassa olevat näkymät
    db_views = _fetch_db_views(client)
    if not db_views:
        result.warnings.append(
            "Ei pystytty listaamaan tietokannan näkymiä. "
            "Luo RPC-funktio 'list_public_views()' tai tarkista "
            "information_schema-oikeudet."
        )
        log.warning("  ⚠ Näkymälistaus epäonnistui -- "
                    "viedään vain EXPORT_VIEWS-listan näkymät")
        db_views = []

    # 2) Yhdistä: EXPORT_VIEWS + kannasta löytyvät v_*-näkymät
    known_set = set(EXPORT_VIEWS)
    auto_views = [v for v in db_views
                  if v.startswith("v_") and v not in known_set]
    all_views = list(EXPORT_VIEWS) + auto_views

    if auto_views:
        log.info(f"  Löytyi {len(auto_views)} uutta automaattivientiä: "
                 f"{', '.join(auto_views[:5])}"
                 + (" ..." if len(auto_views) > 5 else ""))

    # 3) Vie näkymät
    written: dict[str, dict] = {}
    skipped: list[dict] = []

    for view in all_views:
        # Tarkista ensin että näkymä on olemassa
        if not table_exists(client, view):
            skipped.append({"name": view, "reason": "view_not_found"})
            continue
        try:
            df = fetch_df(client, view, "*")
        except Exception as e:
            skipped.append({"name": view, "reason": str(e)})
            result.warnings.append(f"{view}: {e}")
            continue

        rows = df.to_dict(orient="records") if not df.empty else []
        # Sanitoi NaN → None
        for row in rows:
            for k, v in list(row.items()):
                if isinstance(v, float) and (pd.isna(v) or v != v):
                    row[k] = None

        payload_str = json.dumps(rows, ensure_ascii=False,
                                 separators=(",", ":"), default=str)
        if not dry_run:
            (views_dir / f"{view}.json").write_text(
                payload_str, encoding="utf-8")

        sha = hashlib.sha256(payload_str.encode("utf-8")).hexdigest()[:16]
        written[view] = {
            "file": f"views/{view}.json",
            "rows": len(rows),
            "sha256_16": sha,
            "auto": view in auto_views,
        }
        result.rows_inserted += len(rows)
        log.info(f"    · views/{view}.json "
                 f"({len(rows)} riviä)"
                 + (" [auto]" if view in auto_views else ""))

    # 4) Päivitä manifest
    manifest_path = out_dir / "manifest.json"
    if not dry_run:
        mf: dict = {}
        if manifest_path.exists():
            try:
                mf = json.loads(manifest_path.read_text(encoding="utf-8"))
            except Exception:
                mf = {}
        mf.setdefault("views", {}).update(written)
        mf["skipped_views"] = skipped
        mf["export_supabase_views_run"] = datetime.now(timezone.utc).isoformat()
        manifest_path.write_text(
            json.dumps(mf, ensure_ascii=False, indent=2, default=str),
            encoding="utf-8")

        # 5) Erillinen ohitusraportti debuggausta varten
        if skipped:
            (out_dir / "skipped_views.json").write_text(
                json.dumps(skipped, ensure_ascii=False, indent=2),
                encoding="utf-8")

    result.rows_updated = len(written)
    result.rows_skipped = len(skipped)
    log.info(f"  ✓ {len(written)} näkymää viety "
             f"({len(auto_views)} automaattista, "
             f"{len(skipped)} ohitettu)")
    return result


# ──────────────────────────────────────────────────────────────
# PÄÄOHJELMA
# ──────────────────────────────────────────────────────────────

STEPS = {
    "per_capita":               step_per_capita,
    "elasticities":             step_elasticities,
    "ols":                      step_ols,
    "forecasts":                step_forecasts,
    "hoiva_aalto":              step_hoiva_aalto,
    "nordic_sync":              step_nordic_sync,
    "nordic_correlations":      step_nordic_correlations,
    "cofog_link":               step_cofog_link,
    "causal_chains_sync":       step_causal_chains_sync,
    "regression_results_sync":  step_regression_results_sync,
    "analytics_snapshot":       step_analytics_snapshot,
    "export_json":              step_export_json,
    "plugin_views":             step_plugin_views,
    "module_views":             step_module_views,
    "export_supabase_views":    step_export_supabase_views,   # v4 uusi
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
    "export_json",              # taulut + EXPORT_VIEWS-lista
    "plugin_views",             # osa-aikatyö & TFR plugin-näkymät
    "module_views",             # moduli011–020 kontraktit
    "export_supabase_views",    # automaattinen v_*-näkymävienti (ajetaan viimeisenä)
]


def run_pipeline(steps, dry_run=False, since=None):
    client = get_client()
    log.info("=" * 60)
    log.info(f"TTT-PIPELINE v4  run_id={RUN_ID}  "
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
    log.info(f"Valmis {elapsed:.1f}s -- {len(results)} askelta")
    for r in results:
        log.info(f"  {'✓' if r.ok() else '✗'} {r.summary()}")
    log.info("=" * 60)

    if any(not r.ok() for r in results):
        sys.exit(1)


def main():
    p = argparse.ArgumentParser(description="TTT-pipeline v4")
    p.add_argument("--step", choices=list(STEPS.keys()))
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--since", metavar="YYYY-MM-DD")
    a, _ = p.parse_known_args()  # parse_known_args ignores Jupyter/Colab kernel args
    run_pipeline([a.step] if a.step else DEFAULT_ORDER,
                 dry_run=a.dry_run, since=a.since)


if __name__ == "__main__":
    main()
