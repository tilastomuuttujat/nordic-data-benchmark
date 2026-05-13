"""
causal_pipeline.py
──────────────────
Vie kausaaliverkko-näkymän tarvitsemat JSON-tiedostot.

Tuotettu tiedosto (→ public/data/):
  causal_network.json — nodes + links D3 force-graphille,
                        crisis_events aikajanalle,
                        fact_policy_decisions päätöspisteille

Käyttö:
  python causal_pipeline.py
  python causal_pipeline.py --dry-run
"""
from __future__ import annotations
import argparse, hashlib, json, logging, os, re
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from supabase import Client, create_client
from tenacity import retry, stop_after_attempt, wait_exponential

load_dotenv()

logging.basicConfig(level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s", datefmt="%H:%M:%S")
log = logging.getLogger("causal")

SUPABASE_URL = os.environ.get("TTT_SB_URL") or os.environ.get("SUPABASE_URL","")
SUPABASE_KEY = os.environ.get("TTT_SB_SERVICE_KEY") or os.environ.get("SUPABASE_SERVICE_KEY","")
EXPORT_DIR   = os.environ.get("TTT_EXPORT_DIR","public/data")

def get_client() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise EnvironmentError("TTT_SB_URL ja TTT_SB_SERVICE_KEY täytyy asettaa.")
    return create_client(SUPABASE_URL, SUPABASE_KEY)

_R = retry(stop=stop_after_attempt(4),
           wait=wait_exponential(multiplier=1,min=1,max=10), reraise=True)

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

def _num(v, d=3):
    try: return round(float(v),d) if v is not None else None
    except: return None

def _clean_id(raw: str) -> str:
    """Normalisoi node-id: poistaa 'indicator.' ja 'jcode.' prefiksit."""
    return re.sub(r'^(indicator\.|jcode\.)', '', raw or "")

def export_causal(client: Client, dry_run=False):
    log.info("Haetaan causal_chains…")
    cc_rows = fetch_all(client, "causal_chains",
        "chain_id,chain_name,crisis_id,step_order,from_indicator,to_indicator,"
        "lag_years,mechanism,r,confidence,j_code,lifecycle_group,notes")

    log.info("Haetaan crisis_events…")
    cr_rows = fetch_all(client, "crisis_events",
        "crisis_id,name,crisis_type,year_start,year_peak,year_end,"
        "severity,gdp_impact_pct,unemployment_peak_pct,"
        "affected_lifecycle,wake_j_codes,description,mechanism,policy_response")

    log.info("Haetaan fact_policy_decisions…")
    pd_rows = fetch_all(client, "fact_policy_decisions",
        "decision_id,decision_year,sector,decision_title,indicator_id")

    log.info("Haetaan indicators_ref (nimet)…")
    ir_rows = fetch_all(client, "indicators_ref", "external_id,name,ttt_pilari")
    ir_map  = {r["external_id"]: r for r in ir_rows}

    log.info("Haetaan j_codes (nimet)…")
    jc_rows = fetch_all(client, "j_codes", "code,name")
    jc_map  = {r["code"]: r["name"] for r in jc_rows}

    # ── Erottele manuaaliset ja automaattiset ketjut ──────────
    manual_rows = [r for r in cc_rows if not r["chain_id"].startswith("auto_")]
    auto_rows   = [r for r in cc_rows if r["chain_id"].startswith("auto_")]

    # ── Rakenna graafi: nodes + links ─────────────────────────
    nodes: dict[str, dict] = {}
    links: list[dict]      = []

    def add_node(raw_id: str, is_jcode=False, j_code_ref=None):
        nid = _clean_id(raw_id)
        if nid in nodes:
            return nid
        name = nid
        node_type = "indicator"
        if raw_id.startswith("jcode.") or is_jcode:
            node_type = "jcode"
            name = jc_map.get(nid, nid)
        elif raw_id.startswith("indicator."):
            ir = ir_map.get(nid)
            name = ir["name"] if ir else nid
            node_type = "indicator"
        nodes[nid] = {
            "id":         nid,
            "name":       name,
            "type":       node_type,
            "pilari":     ir_map.get(nid,{}).get("ttt_pilari"),
            "group":      None,  # täytetään alla
        }
        return nid

    # Manuaaliset linkit (korostettu)
    chain_meta: dict[str, dict] = {}
    for r in manual_rows:
        src = add_node(r["from_indicator"])
        tgt = add_node(r["to_indicator"])
        cid = r["chain_id"]

        if cid not in chain_meta:
            chain_meta[cid] = {
                "chain_id":   cid,
                "chain_name": r["chain_name"],
                "crisis_id":  r.get("crisis_id"),
                "manual":     True,
            }

        links.append({
            "source":    src,
            "target":    tgt,
            "chain_id":  cid,
            "step_order":r["step_order"],
            "lag_years": r.get("lag_years"),
            "r":         _num(r.get("r")),
            "confidence":r.get("confidence"),
            "mechanism": (r.get("mechanism") or "").strip()[:200],
            "j_code":    r.get("j_code"),
            "lifecycle_group": r.get("lifecycle_group"),
            "manual":    True,
            "auto":      False,
        })

    # Automaattiset linkit (tausta-aste)
    for r in auto_rows:
        src = add_node(r["from_indicator"])
        tgt = add_node(r["to_indicator"])
        cid = r["chain_id"]
        links.append({
            "source":    src,
            "target":    tgt,
            "chain_id":  cid,
            "step_order":r["step_order"],
            "lag_years": r.get("lag_years"),
            "r":         _num(r.get("r")),
            "confidence":r.get("confidence"),
            "mechanism": "Automaattinen elasticities-linkki",
            "j_code":    r.get("j_code"),
            "lifecycle_group": None,
            "manual":    False,
            "auto":      True,
        })

    # Laske group (lifecycle) nodelle eniten esiintyvän linkin perusteella
    node_groups: dict[str,dict[str,int]] = {}
    for lnk in links:
        if lnk.get("lifecycle_group"):
            for nid in [lnk["source"], lnk["target"]]:
                node_groups.setdefault(nid, {})
                lg = lnk["lifecycle_group"]
                node_groups[nid][lg] = node_groups[nid].get(lg,0)+1
    for nid, grp_counts in node_groups.items():
        if grp_counts and nid in nodes:
            nodes[nid]["group"] = max(grp_counts, key=grp_counts.get)

    # Laske in/out-degree per node
    degree: dict[str,int] = {}
    for lnk in links:
        degree[lnk["source"]] = degree.get(lnk["source"],0)+1
        degree[lnk["target"]] = degree.get(lnk["target"],0)+1
    for nid in nodes:
        nodes[nid]["degree"] = degree.get(nid,0)

    # ── Crisis events ──────────────────────────────────────────
    crises = []
    for r in sorted(cr_rows, key=lambda x: x["year_start"]):
        crises.append({
            "crisis_id":           r["crisis_id"],
            "name":                r["name"],
            "crisis_type":         r["crisis_type"],
            "year_start":          r["year_start"],
            "year_peak":           r.get("year_peak"),
            "year_end":            r.get("year_end"),
            "severity":            r["severity"],
            "gdp_impact_pct":      _num(r.get("gdp_impact_pct"),1),
            "unemployment_peak":   _num(r.get("unemployment_peak_pct"),1),
            "affected_lifecycle":  r.get("affected_lifecycle") or [],
            "wake_j_codes":        r.get("wake_j_codes") or [],
            "description":         (r.get("description") or "")[:300],
            "mechanism":           (r.get("mechanism") or "")[:200],
            "policy_response":     (r.get("policy_response") or "")[:200],
        })

    # ── Policy decisions ───────────────────────────────────────
    decisions = []
    for r in sorted(pd_rows, key=lambda x: x.get("decision_year") or 0):
        decisions.append({
            "decision_id":    r["decision_id"],
            "decision_year":  r.get("decision_year"),
            "sector":         r.get("sector"),
            "title":          r.get("decision_title"),
            "indicator_id":   r.get("indicator_id"),
        })

    # ── Payload ────────────────────────────────────────────────
    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "meta": {
            "total_nodes":    len(nodes),
            "total_links":    len(links),
            "manual_links":   sum(1 for l in links if l["manual"]),
            "auto_links":     sum(1 for l in links if l["auto"]),
            "chains":         len(chain_meta),
            "crises":         len(crises),
            "decisions":      len(decisions),
        },
        "nodes":      list(nodes.values()),
        "links":      links,
        "chains":     list(chain_meta.values()),
        "crises":     crises,
        "decisions":  decisions,
    }

    out = Path(EXPORT_DIR) / "causal_network.json"
    sha = write_json(out, payload, dry_run)
    log.info(f"  ✓ {len(nodes)} nodea · {len(links)} linkkiä · "
             f"{len(crises)} kriisiä · {len(decisions)} päätöstä (sha={sha})")

def main():
    p = argparse.ArgumentParser(description="Causal network pipeline")
    p.add_argument("--dry-run", action="store_true")
    a, _ = p.parse_known_args()
    client = get_client()
    log.info("═"*50)
    log.info(f"CAUSAL PIPELINE  {'[DRY-RUN]' if a.dry_run else ''}")
    log.info("═"*50)
    export_causal(client, a.dry_run)
    log.info("Valmis.")

if __name__ == "__main__":
    main()
