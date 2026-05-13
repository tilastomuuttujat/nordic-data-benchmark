"""
nordic_pipeline.py
──────────────────
Vie pohjoismainen vertailu -näkymän tarvitsemat JSON-tiedostot.

Tuotettu tiedosto (→ public/data/):
  nordic_comparison.json — kaikki kategoriat, maakohtaiset aikasarjat,
                           FI-gap vs. mediaani(SE,NO,DK), korrelaatiot

Käyttö:
  python nordic_pipeline.py
  python nordic_pipeline.py --dry-run

Ympäristömuuttujat:
  TTT_SB_URL / SUPABASE_URL
  TTT_SB_SERVICE_KEY / SUPABASE_SERVICE_KEY
  TTT_EXPORT_DIR=public/data
"""
from __future__ import annotations
import argparse, hashlib, json, logging, os
from datetime import datetime, timezone
from pathlib import Path
import statistics

from dotenv import load_dotenv
from supabase import Client, create_client
from tenacity import retry, stop_after_attempt, wait_exponential

load_dotenv()

logging.basicConfig(level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s", datefmt="%H:%M:%S")
log = logging.getLogger("nordic")

SUPABASE_URL = os.environ.get("TTT_SB_URL") or os.environ.get("SUPABASE_URL","")
SUPABASE_KEY = os.environ.get("TTT_SB_SERVICE_KEY") or os.environ.get("SUPABASE_SERVICE_KEY","")
EXPORT_DIR   = os.environ.get("TTT_EXPORT_DIR","public/data")

COUNTRIES    = ["Finland","Sweden","Norway","Denmark"]
PEERS        = ["Sweden","Norway","Denmark"]
COUNTRY_CODE = {"Finland":"FI","Sweden":"SE","Norway":"NO","Denmark":"DK"}

# Suodatus: vain "kaikki sukupuolet, kaikki ikäryhmät" -rivit
SEX_ALL  = {None,"","T","Total","total","Both sexes","Both","TOTAL"}
AGE_ALL  = {None,"","TOTAL","Total","total","All ages","All","AGE_TOTAL"}

def get_client() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise EnvironmentError("TTT_SB_URL ja TTT_SB_SERVICE_KEY täytyy asettaa.")
    return create_client(SUPABASE_URL, SUPABASE_KEY)

_R = retry(stop=stop_after_attempt(4),
           wait=wait_exponential(multiplier=1, min=1, max=10), reraise=True)

@_R
def _exec(q): return q.execute()

def fetch_all(client: Client, table: str, cols: str="*") -> list[dict]:
    rows, offset = [], 0
    while True:
        res = (_exec(client.table(table).select(cols).range(offset, offset+999)).data) or []
        rows.extend(res)
        if len(res) < 1000: break
        offset += 1000
    return rows

def write_json(path: Path, data, dry_run: bool) -> str:
    payload = json.dumps(data, ensure_ascii=False, separators=(",",":"), default=str)
    if not dry_run:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(payload, encoding="utf-8")
    return hashlib.sha256(payload.encode()).hexdigest()[:16]

def _num(v):
    try: return round(float(v), 4) if v is not None else None
    except: return None

# ─────────────────────────────────────────────────────────
# PÄÄVIENTI
# ─────────────────────────────────────────────────────────
def export_nordic(client: Client, dry_run=False):
    log.info("Haetaan nordic_indicators…")
    ni_rows = fetch_all(client, "nordic_indicators",
        "category,subcategory,country,sex,age_group,unit,year,value,dataset_code,dataset_title,source")
    log.info(f"  {len(ni_rows)} riviä haettu")

    log.info("Haetaan nordic_correlations…")
    nc_rows = fetch_all(client, "nordic_correlations",
        "j_code,sector_key,category,subcategory,country,n,r,p_adjusted,significant_fdr,"
        "r_diff,ci_low,ci_high,year_min,year_max")
    log.info(f"  {len(nc_rows)} korrelaatioita haettu")

    # ── Suodatetaan kokonaisrivit ──────────────────────────────
    def is_total_row(r):
        return (r.get("sex") in SEX_ALL and r.get("age_group") in AGE_ALL)

    ni_total = [r for r in ni_rows if is_total_row(r) and r.get("country") in COUNTRIES]

    # ── Korrelaatiokartta: (category, subcategory, country) → row ──
    corr_map: dict[tuple, dict] = {}
    for r in nc_rows:
        key = (r["category"], r.get("subcategory"), r["country"])
        # Pidä paras (korkein |r|)
        if key not in corr_map or abs(r.get("r") or 0) > abs(corr_map[key].get("r") or 0):
            corr_map[key] = r

    # ── Pivot: cat → subcat → country → year → value ──────────
    # Myös: kerää unit per category
    pivot: dict = {}
    units: dict = {}

    for r in ni_total:
        cat    = r["category"]
        subcat = r.get("subcategory") or ""
        ctry   = r["country"]
        yr     = int(r["year"]) if r.get("year") is not None else None
        val    = _num(r.get("value"))
        unit   = r.get("unit") or ""
        if yr is None or val is None:
            continue
        pivot.setdefault(cat, {}).setdefault(subcat, {}).setdefault(ctry, {})[yr] = val
        if unit:
            units.setdefault(cat, {}).setdefault(subcat, unit)

    # ── Rakenna categories-lista ───────────────────────────────
    categories = []

    for cat, subcats in pivot.items():
        for subcat, countries_data in subcats.items():
            # Kaikki vuodet tässä kategoria+subcat -yhdistelmässä
            all_years = sorted(set(
                yr for ctry_data in countries_data.values() for yr in ctry_data
            ))
            if not all_years:
                continue

            # Maakohtaiset aikasarjat koodattuina (FI, SE, NO, DK)
            series: dict[str, dict[int, float | None]] = {}
            for ctry in COUNTRIES:
                code = COUNTRY_CODE[ctry]
                series[code] = {yr: countries_data.get(ctry, {}).get(yr) for yr in all_years}

            # Gap-analyysi: viimeisin vuosi per maa
            latest_vals: dict[str, float | None] = {}
            for ctry in COUNTRIES:
                code = COUNTRY_CODE[ctry]
                ctry_data = countries_data.get(ctry, {})
                # Viimeisin ei-None arvo
                for yr in reversed(all_years):
                    v = ctry_data.get(yr)
                    if v is not None:
                        latest_vals[code] = v
                        break

            fi_val    = latest_vals.get("FI")
            peer_vals = [v for c, v in latest_vals.items() if c != "FI" and v is not None]
            peer_med  = round(statistics.median(peer_vals), 4) if peer_vals else None
            gap       = round(fi_val - peer_med, 4) if fi_val is not None and peer_med is not None else None

            # Korrelaatio FI:lle
            corr_key = (cat, subcat if subcat else None, "Finland")
            corr     = corr_map.get(corr_key)

            # Viimeisin vuosi per maa (näytetään UI:ssa)
            latest_year = max(
                (max(d.keys()) for d in countries_data.values() if d),
                default=None
            )

            categories.append({
                "category":     cat,
                "subcategory":  subcat or None,
                "unit":         units.get(cat, {}).get(subcat, ""),
                "years":        all_years,
                "latest_year":  latest_year,
                "latest_vals":  latest_vals,
                "peer_median":  peer_med,
                "fi_gap":       gap,
                "fi_gap_pct":   round(gap / peer_med * 100, 2) if gap is not None and peer_med else None,
                "gap_direction": (
                    "yli"        if gap and gap > 0 else
                    "ali"        if gap and gap < 0 else
                    "tasapaino"
                ),
                "series":      {
                    code: [series[code].get(yr) for yr in all_years]
                    for code in ["FI","SE","NO","DK"]
                },
                "correlation": {
                    "r":              _num(corr.get("r"))            if corr else None,
                    "p_adjusted":     _num(corr.get("p_adjusted"))   if corr else None,
                    "significant_fdr":corr.get("significant_fdr")    if corr else None,
                    "ci_low":         _num(corr.get("ci_low"))       if corr else None,
                    "ci_high":        _num(corr.get("ci_high"))      if corr else None,
                    "n":              corr.get("n")                  if corr else None,
                    "year_min":       corr.get("year_min")           if corr else None,
                    "year_max":       corr.get("year_max")           if corr else None,
                } if corr else None,
            })

    # Lajittele absoluuttisen gapin mukaan
    categories.sort(key=lambda x: -(abs(x["fi_gap"] or 0)))

    # ── Yhteenvetotilastot ─────────────────────────────────────
    with_gap    = [c for c in categories if c["fi_gap"] is not None]
    yli_peers   = [c for c in with_gap if c["gap_direction"] == "yli"]
    ali_peers   = [c for c in with_gap if c["gap_direction"] == "ali"]

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "countries":    ["FI","SE","NO","DK"],
        "peers":        ["SE","NO","DK"],
        "country_names":{"FI":"Suomi","SE":"Ruotsi","NO":"Norja","DK":"Tanska"},
        "meta": {
            "total_categories":    len(categories),
            "with_gap":            len(with_gap),
            "fi_yli_peers":        len(yli_peers),
            "fi_ali_peers":        len(ali_peers),
            "significant_corr":    sum(1 for c in categories
                                       if c.get("correlation",{}) and
                                       c["correlation"].get("significant_fdr")),
        },
        "categories": categories,
    }

    out = Path(EXPORT_DIR) / "nordic_comparison.json"
    sha = write_json(out, payload, dry_run)
    log.info(f"  ✓ {len(categories)} kategoriaa · {len(yli_peers)} FI yli · "
             f"{len(ali_peers)} FI ali (sha={sha})")
    return payload

# ─────────────────────────────────────────────────────────
def main():
    p = argparse.ArgumentParser(description="Nordic comparison pipeline")
    p.add_argument("--dry-run", action="store_true")
    a, _ = p.parse_known_args()

    client = get_client()
    log.info("═" * 50)
    log.info(f"NORDIC PIPELINE  {'[DRY-RUN]' if a.dry_run else ''}")
    log.info("═" * 50)
    export_nordic(client, a.dry_run)
    log.info("Valmis.")

if __name__ == "__main__":
    main()
