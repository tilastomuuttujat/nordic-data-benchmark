"""
budjetti_pipeline.py
────────────────────
Vie budjetti.html:n tarvitsemat JSON-tiedostot Supabasesta.

Tuotetut tiedostot (→ public/data/):
  sector_series.json   — sektorimenot kaikilla basis-arvoilla 1975–2025
  cofog_amounts.json   — j-koodikohtaiset menot vuosittain 2001–2024

Käyttö:
  python budjetti_pipeline.py
  python budjetti_pipeline.py --dry-run

Ympäristömuuttujat:
  TTT_SB_URL / SUPABASE_URL
  TTT_SB_SERVICE_KEY / SUPABASE_SERVICE_KEY
  TTT_EXPORT_DIR=public/data   (oletus)
"""
from __future__ import annotations
import argparse, hashlib, json, logging, os
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from supabase import Client, create_client
from tenacity import retry, stop_after_attempt, wait_exponential

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(levelname)-8s  %(message)s", datefmt="%H:%M:%S")
log = logging.getLogger("budjetti")

SUPABASE_URL = os.environ.get("TTT_SB_URL") or os.environ.get("SUPABASE_URL","")
SUPABASE_KEY = os.environ.get("TTT_SB_SERVICE_KEY") or os.environ.get("SUPABASE_SERVICE_KEY","")
EXPORT_DIR   = os.environ.get("TTT_EXPORT_DIR","public/data")

def get_client() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise EnvironmentError("TTT_SB_URL ja TTT_SB_SERVICE_KEY täytyy asettaa.")
    return create_client(SUPABASE_URL, SUPABASE_KEY)

_R = retry(stop=stop_after_attempt(4), wait=wait_exponential(multiplier=1,min=1,max=10), reraise=True)

@_R
def _exec(q): return q.execute()

def fetch_all(client: Client, table: str, cols: str="*", limit:int=5000):
    rows, offset = [], 0
    while True:
        res = _exec(client.table(table).select(cols).range(offset, offset+999)).data or []
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

# ─────────────────────────────────────────────
# ASKEL 1: sector_series.json
# ─────────────────────────────────────────────
def export_sector_series(client: Client, dry_run=False):
    log.info("ASKEL 1: sector_series.json")

    ss_rows  = fetch_all(client, "sector_series", "sector_key,year,basis,value")
    sec_rows = fetch_all(client, "sectors",       "key,name,metadata")

    # Sektori-metadata
    sectors = {}
    for s in sec_rows:
        sectors[s["key"]] = {"name": s["name"]}

    # Pivot: data[sector_key][basis][year] = value
    data: dict = {}
    years_set: set = set()
    bases_set: set = set()

    for row in ss_rows:
        sk  = row["sector_key"]
        yr  = int(row["year"])
        bas = row["basis"]
        val = float(row["value"]) if row["value"] is not None else None
        data.setdefault(sk, {}).setdefault(bas, {})[yr] = val
        years_set.add(yr)
        bases_set.add(bas)

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "years":  sorted(years_set),
        "bases":  sorted(bases_set),
        "sectors": sectors,
        "data":   data,
    }

    out = Path(EXPORT_DIR) / "sector_series.json"
    sha = write_json(out, payload, dry_run)
    n   = sum(len(v) for v in data.values())
    log.info(f"  ✓ {len(data)} sektoria · {len(years_set)} vuotta · {n} datapistettä (sha={sha})")
    return payload

# ─────────────────────────────────────────────
# ASKEL 2: cofog_amounts.json
# ─────────────────────────────────────────────
def export_cofog_amounts(client: Client, dry_run=False):
    log.info("ASKEL 2: cofog_amounts.json")

    cja_rows = fetch_all(client, "cofog_jcode_amounts", "j_code,year,value_meur,method")
    jc_rows  = fetch_all(client, "j_codes",            "code,name,level,parent_code")

    # J-koodien metadata
    jcodes = {}
    for jc in jc_rows:
        jcodes[jc["code"]] = {
            "name":        jc["name"],
            "level":       jc["level"],
            "parent_code": jc["parent_code"],
        }

    # Pivot: data[year][j_code] = value_meur
    data: dict = {}
    for row in cja_rows:
        yr   = int(row["year"])
        code = row["j_code"]
        val  = float(row["value_meur"]) if row["value_meur"] is not None else None
        data.setdefault(yr, {})[code] = val

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "years":  sorted(data.keys()),
        "jcodes": jcodes,
        "data":   {str(y): v for y,v in sorted(data.items())},
    }

    out = Path(EXPORT_DIR) / "cofog_amounts.json"
    sha = write_json(out, payload, dry_run)
    n   = sum(len(v) for v in data.values())
    log.info(f"  ✓ {len(data)} vuotta · {len(jcodes)} j-koodia · {n} datapistettä (sha={sha})")
    return payload

# ─────────────────────────────────────────────
# PÄÄOHJELMA
# ─────────────────────────────────────────────
def main():
    p = argparse.ArgumentParser(description="Budjetti-pipeline")
    p.add_argument("--dry-run", action="store_true")
    a, _ = p.parse_known_args()

    client = get_client()
    log.info("═" * 50)
    log.info(f"BUDJETTI-PIPELINE  {'[DRY-RUN]' if a.dry_run else ''}")
    log.info("═" * 50)

    export_sector_series(client, a.dry_run)
    export_cofog_amounts(client, a.dry_run)

    log.info("═" * 50)
    log.info("Valmis.")

if __name__ == "__main__":
    main()
