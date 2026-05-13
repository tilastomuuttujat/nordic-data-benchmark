"""
lifecycle_pipeline.py
─────────────────────
Vie elinkaarianalyysin tarvitsemat JSON-tiedostot.

Tuotettu tiedosto (→ public/data/):
  lifecycle.json — lifecycle_groups, population_by_age_band,
                   hoiva_aalto_yearly, j_code_lifecycle + cofog_jcode_amounts

Käyttö:
  python lifecycle_pipeline.py
  python lifecycle_pipeline.py --dry-run
"""
from __future__ import annotations
import argparse, hashlib, json, logging, os
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from supabase import Client, create_client
from tenacity import retry, stop_after_attempt, wait_exponential

load_dotenv()

logging.basicConfig(level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s", datefmt="%H:%M:%S")
log = logging.getLogger("lifecycle")

SUPABASE_URL = os.environ.get("TTT_SB_URL") or os.environ.get("SUPABASE_URL","")
SUPABASE_KEY = os.environ.get("TTT_SB_SERVICE_KEY") or os.environ.get("SUPABASE_SERVICE_KEY","")
EXPORT_DIR   = os.environ.get("TTT_EXPORT_DIR","public/data")

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

def _num(v, d=4):
    try: return round(float(v), d) if v is not None else None
    except: return None

def export_lifecycle(client: Client, dry_run=False):
    log.info("Haetaan lifecycle_groups…")
    lg_rows  = fetch_all(client, "lifecycle_groups",
        "id,label,age_min,age_max,age_label,phase,theme,sort_order,supa_weights")

    log.info("Haetaan population_by_age_band…")
    pop_rows = fetch_all(client, "population_by_age_band",
        "age_band,year,population,pct_total,source")

    log.info("Haetaan hoiva_aalto_yearly…")
    hay_rows = fetch_all(client, "hoiva_aalto_yearly",
        "year,population_75plus,tehoasuminen_tarve,kotihoito_tarve,teho_share,koti_share")

    log.info("Haetaan hoiva_aalto_projection…")
    hap_rows = fetch_all(client, "hoiva_aalto_projection",
        "year,age85plus_count,aalto_id,birth_cohort,notes")

    log.info("Haetaan j_code_lifecycle…")
    jcl_rows = fetch_all(client, "j_code_lifecycle",
        "j_code,lifecycle_primary,lifecycle_group_id,wake_lag_years,"
        "angle_struct,angle_econ,angle_cult,angle_subj,lifecycle_tags")

    log.info("Haetaan j_codes…")
    jc_rows  = fetch_all(client, "j_codes", "code,name,level,parent_code")
    jc_map   = {r["code"]: r["name"] for r in jc_rows}

    log.info("Haetaan cofog_jcode_amounts (viimeisin vuosi per j_code)…")
    cja_rows = fetch_all(client, "cofog_jcode_amounts",
        "j_code,year,value_meur")

    # Viimeisin cofog-arvo per j_code
    cja_latest: dict[str, float] = {}
    for r in cja_rows:
        code = r["j_code"]
        yr   = int(r["year"]) if r.get("year") else 0
        val  = _num(r.get("value_meur"))
        if val is None: continue
        if code not in cja_latest or yr > cja_latest.get(f"_yr_{code}", 0):
            cja_latest[code]           = val
            cja_latest[f"_yr_{code}"]  = yr
    # Siivoa yr-avaimet
    spending = {k: v for k, v in cja_latest.items() if not k.startswith("_yr_")}

    # ── lifecycle_groups järjestyksessä ──────────────────────
    groups = sorted(lg_rows, key=lambda r: r.get("sort_order") or 99)
    groups_out = []
    for g in groups:
        gid = g["id"]
        # j_koodit tähän ryhmään
        jcodes = [r for r in jcl_rows if r.get("lifecycle_group_id") == gid]
        jcodes_out = []
        for jc in jcodes:
            code = jc["j_code"]
            jcodes_out.append({
                "code":             code,
                "name":             jc_map.get(code, code),
                "lifecycle_primary":jc.get("lifecycle_primary"),
                "wake_lag_years":   jc.get("wake_lag_years"),
                "angles": {
                    "struct": _num(jc.get("angle_struct")),
                    "econ":   _num(jc.get("angle_econ")),
                    "cult":   _num(jc.get("angle_cult")),
                    "subj":   _num(jc.get("angle_subj")),
                },
                "spending_meur": spending.get(code),
            })
        # Kokonaismenot tälle ryhmälle
        total_spending = sum(
            j["spending_meur"] for j in jcodes_out
            if j["spending_meur"] is not None
        )
        groups_out.append({
            "id":          gid,
            "label":       g["label"],
            "age_min":     g["age_min"],
            "age_max":     g["age_max"],
            "age_label":   g["age_label"],
            "phase":       g["phase"],
            "theme":       g["theme"],
            "sort_order":  g.get("sort_order"),
            "supa_weights":g.get("supa_weights"),
            "jcodes":      jcodes_out,
            "total_spending_meur": round(total_spending, 1) if total_spending else None,
        })

    # ── Väestödata pivot: age_band → year → {pop, pct} ──────
    pop_pivot: dict[str, dict] = {}
    pop_years: set = set()
    for r in pop_rows:
        band = r["age_band"]
        yr   = int(r["year"])
        pop_pivot.setdefault(band, {})[yr] = {
            "population": r["population"],
            "pct_total":  _num(r.get("pct_total"), 1),
        }
        pop_years.add(yr)

    # ── Huoltosuhde per vuosi ────────────────────────────────
    WORKING = {"itsenaistymine_18_24","perustaminen_25_34",
               "rakentaminen_35_54","siirtuma_55_64"}
    DEPENDENT= {"lapsuus_0_12","murrosika_13_17",
                "vapautuminen_65_74","sopeutuminen_75_84","riippuvuus_85_plus"}

    dependency: list[dict] = []
    for yr in sorted(pop_years):
        w = sum(pop_pivot.get(b,{}).get(yr,{}).get("population",0) or 0 for b in WORKING)
        d = sum(pop_pivot.get(b,{}).get(yr,{}).get("population",0) or 0 for b in DEPENDENT)
        dependency.append({
            "year":             yr,
            "working_age":      w,
            "dependent":        d,
            "dependency_ratio": round(d/w, 3) if w else None,
        })

    # ── Hoiva-aalto ─────────────────────────────────────────
    hoiva_yearly = sorted([{
        "year":               int(r["year"]),
        "population_75plus":  r["population_75plus"],
        "tehoasuminen_tarve": r["tehoasuminen_tarve"],
        "kotihoito_tarve":    r["kotihoito_tarve"],
        "teho_share":         _num(r.get("teho_share")),
        "koti_share":         _num(r.get("koti_share")),
    } for r in hay_rows], key=lambda x: x["year"])

    hoiva_projection = sorted([{
        "year":           int(r["year"]),
        "age85plus_count":r["age85plus_count"],
        "aalto_id":       r["aalto_id"],
        "birth_cohort":   r.get("birth_cohort"),
    } for r in hap_rows], key=lambda x: x["year"])

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "groups":       groups_out,
        "population": {
            "years":    sorted(pop_years),
            "age_bands": pop_pivot,
        },
        "dependency_ratio": dependency,
        "hoiva_aalto_yearly":     hoiva_yearly,
        "hoiva_aalto_projection": hoiva_projection,
    }

    out = Path(EXPORT_DIR) / "lifecycle.json"
    sha = write_json(out, payload, dry_run)
    log.info(f"  ✓ {len(groups_out)} ryhmää · {len(pop_years)} vuotta · "
             f"{len(hoiva_yearly)} hoiva-aaltovuotta (sha={sha})")

def main():
    p = argparse.ArgumentParser(description="Lifecycle pipeline")
    p.add_argument("--dry-run", action="store_true")
    a, _ = p.parse_known_args()
    client = get_client()
    log.info("═"*50)
    log.info(f"LIFECYCLE PIPELINE  {'[DRY-RUN]' if a.dry_run else ''}")
    log.info("═"*50)
    export_lifecycle(client, a.dry_run)
    log.info("Valmis.")

if __name__ == "__main__":
    main()
