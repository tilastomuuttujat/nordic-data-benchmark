// public/plugins/moduli011.js
// Plugin: Alueellinen eriarvoisuuskartta
// Näyttää hyvinvointi-indikaattorit maakunnittain, vertailee kansalliseen mediaaniin ja pohjoismaihin

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { feature } from "https://cdn.jsdelivr.net/npm/topojson-client@3/+esm";

const ID = "moduli011";

// ─── Tyyli ────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=JetBrains+Mono:wght@400;600&family=Source+Serif+4:ital,wght@0,300;0,600;1,300&display=swap');

.plugin-${ID} {
  background: #F4F0E8;
  color: #1A1814;
  font-family: 'Source Serif 4', Georgia, serif;
  max-width: 980px;
  margin: 0 auto;
  padding: 28px 28px 20px;
  border: 1px solid rgba(26,24,20,0.10);
  border-radius: 4px;
  opacity: 0;
  transition: opacity .5s ease;
  box-sizing: border-box;
}
.plugin-${ID}.is-mounted { opacity: 1; }

/* ── Otsikko ── */
.plugin-${ID} .kicker {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #9A8F80;
  margin-bottom: 6px;
}
.plugin-${ID} h3 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 6px;
  line-height: 1.2;
}
.plugin-${ID} .lead {
  color: #4A4640;
  font-size: 13.5px;
  margin: 0 0 22px;
  line-height: 1.6;
  font-style: italic;
  max-width: 640px;
  border-bottom: 0.5px solid rgba(26,24,20,0.12);
  padding-bottom: 16px;
}

/* ── Kontrollit ── */
.plugin-${ID} .controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
}
.plugin-${ID} .ctrl-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.plugin-${ID} .ctrl-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8A8070;
}
.plugin-${ID} select {
  font-family: 'Source Serif 4', Georgia, serif;
  font-size: 13px;
  color: #1A1814;
  background: #FDFAF4;
  border: 1px solid rgba(26,24,20,0.18);
  border-radius: 3px;
  padding: 7px 28px 7px 10px;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239A8F80'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  cursor: pointer;
}
.plugin-${ID} select:focus { outline: 1.5px solid #1D6B5A; }

/* ── Layout: kartta + sivupalkki ── */
.plugin-${ID} .map-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  align-items: start;
}
@media (max-width: 720px) {
  .plugin-${ID} .map-layout { grid-template-columns: 1fr; }
}

/* ── Karttakontti ── */
.plugin-${ID} .map-wrap {
  background: #FDFAF4;
  border: 1px solid rgba(26,24,20,0.08);
  border-radius: 3px;
  padding: 12px;
  position: relative;
  min-height: 460px;
}
.plugin-${ID} .map-wrap svg {
  width: 100%;
  height: auto;
  display: block;
}
.plugin-${ID} .map-wrap path {
  cursor: pointer;
  transition: filter .12s, stroke-width .12s;
  stroke: #F4F0E8;
  stroke-width: 1;
}
.plugin-${ID} .map-wrap path:hover {
  filter: brightness(1.12);
  stroke-width: 2;
}
.plugin-${ID} .map-wrap path.selected {
  stroke: #1A1814;
  stroke-width: 2.5;
}

/* ── Legenda ── */
.plugin-${ID} .legend-wrap {
  margin-top: 12px;
}
.plugin-${ID} .legend-label-row {
  display: flex;
  justify-content: space-between;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: #8A8070;
  margin-top: 3px;
}
.plugin-${ID} .legend-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.1em;
  color: #8A8070;
  margin-bottom: 4px;
  text-transform: uppercase;
}

/* ── Sivupalkki: valittu maakunta ── */
.plugin-${ID} .sidebar {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.plugin-${ID} .region-card {
  background: #1A1814;
  border-radius: 4px;
  padding: 18px 16px;
  color: #F4F0E8;
  min-height: 120px;
  transition: opacity .2s;
}
.plugin-${ID} .region-card .rname {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
  line-height: 1.2;
}
.plugin-${ID} .region-card .rval-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
  border-bottom: 0.5px solid rgba(244,240,232,0.1);
  padding-bottom: 8px;
}
.plugin-${ID} .region-card .rval-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.08em;
  color: rgba(244,240,232,0.5);
  text-transform: uppercase;
}
.plugin-${ID} .region-card .rval-num {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 22px;
  font-weight: 700;
}
.plugin-${ID} .region-card .rval-unit {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: rgba(244,240,232,0.5);
  margin-left: 4px;
}
.plugin-${ID} .region-card .vsMedian {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  margin-top: 10px;
  padding: 6px 8px;
  border-radius: 2px;
}
.plugin-${ID} .region-card .vsMedian.better { background: rgba(29,107,90,0.25); color: #6ECEB2; }
.plugin-${ID} .region-card .vsMedian.worse  { background: rgba(139,26,26,0.25); color: #E07070; }
.plugin-${ID} .region-card .vsMedian.neutral { background: rgba(212,160,23,0.20); color: #D4A017; }
.plugin-${ID} .region-card .hint {
  font-size: 12px;
  color: rgba(244,240,232,0.4);
  font-style: italic;
  margin-top: 8px;
}

/* ── Ranking-lista ── */
.plugin-${ID} .ranking-card {
  background: #EDE8E0;
  border-radius: 4px;
  padding: 14px;
}
.plugin-${ID} .ranking-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8A8070;
  margin-bottom: 10px;
}
.plugin-${ID} .rank-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  border-bottom: 0.5px solid rgba(26,24,20,0.07);
  cursor: pointer;
  transition: background .1s;
  border-radius: 2px;
  padding: 5px 4px;
}
.plugin-${ID} .rank-row:hover { background: rgba(26,24,20,0.05); }
.plugin-${ID} .rank-row.selected-rank { background: rgba(29,107,90,0.12); }
.plugin-${ID} .rank-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: #9A8F80;
  width: 16px;
  text-align: right;
  flex-shrink: 0;
}
.plugin-${ID} .rank-bar-wrap {
  flex: 1;
  height: 6px;
  background: rgba(26,24,20,0.1);
  border-radius: 2px;
  overflow: hidden;
}
.plugin-${ID} .rank-bar {
  height: 100%;
  border-radius: 2px;
  transition: width .3s ease;
}
.plugin-${ID} .rank-name {
  font-family: 'Source Serif 4', Georgia, serif;
  font-size: 11px;
  width: 96px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
}
.plugin-${ID} .rank-val {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: #4A4640;
  width: 44px;
  text-align: right;
  flex-shrink: 0;
}

/* ── Tilastoboksi alla ── */
.plugin-${ID} .stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 16px;
}
@media (max-width: 600px) {
  .plugin-${ID} .stats-row { grid-template-columns: repeat(2, 1fr); }
}
.plugin-${ID} .stat-box {
  background: #EDE8E0;
  border-radius: 3px;
  padding: 10px 12px;
}
.plugin-${ID} .stat-box .sb-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #8A8070;
  margin-bottom: 4px;
}
.plugin-${ID} .stat-box .sb-val {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 20px;
  font-weight: 700;
}
.plugin-${ID} .stat-box .sb-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: #8A8070;
  margin-top: 2px;
}

/* ── Insight ── */
.plugin-${ID} .insight {
  background: #fff;
  border-left: 3px solid #1D6B5A;
  padding: 12px 16px;
  margin-top: 16px;
  font-size: 13px;
  line-height: 1.6;
  border-radius: 2px;
  color: #2A2620;
}
.plugin-${ID} .insight strong { color: #1A1814; }

/* ── Tooltip ── */
.plugin-${ID}-tip {
  position: fixed;
  background: #1A1814;
  color: #F4F0E8;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  padding: 7px 10px;
  border-radius: 3px;
  pointer-events: none;
  opacity: 0;
  transition: opacity .12s;
  z-index: 9999;
  max-width: 200px;
  line-height: 1.5;
}

/* ── Latausanimaatio ── */
.plugin-${ID} .loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #9A8F80;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  gap: 12px;
}
.plugin-${ID} .spinner {
  width: 20px; height: 20px;
  border: 1.5px solid #D4CFC6;
  border-top-color: #1A1814;
  border-radius: 50%;
  animation: spin-${ID} .8s linear infinite;
}
@keyframes spin-${ID} { to { transform: rotate(360deg); } }

/* ── Lähde ── */
.plugin-${ID} .source {
  color: #9A8F80;
  font-size: 10.5px;
  margin-top: 16px;
  font-style: italic;
  font-family: 'JetBrains Mono', monospace;
}
`;

// ─── Indikaattorimäärittelyt ────────────────────────────────────────────────
const INDICATORS = {
  unemployment: {
    label: "Työttömyysaste",
    unit: "%",
    format: v => v.toFixed(1) + " %",
    lowerBetter: true,
    colorScheme: "RdYlGn",    // korkea = huono = punainen
    description: "Työttömien osuus työvoimasta (%)",
    nationalMedian: 7.2,
    nordicAvg: 5.8,
  },
  poverty_risk: {
    label: "Köyhyysriski",
    unit: "%",
    format: v => v.toFixed(1) + " %",
    lowerBetter: true,
    colorScheme: "RdYlGn",
    description: "Pienituloisuusrajan alapuolella olevien osuus (%)",
    nationalMedian: 12.5,
    nordicAvg: 10.2,
  },
  tfr: {
    label: "Kokonaishedelmällisyys",
    unit: "TFR",
    format: v => v.toFixed(2),
    lowerBetter: false,
    colorScheme: "RdYlGn_rev",  // korkea = hyvä = vihreä
    description: "Kokonaishedelmällisyysluku (TFR)",
    nationalMedian: 1.26,
    nordicAvg: 1.55,
  },
  net_migration: {
    label: "Nettomuutto / 1000 as.",
    unit: "‰",
    format: v => (v >= 0 ? "+" : "") + v.toFixed(1) + " ‰",
    lowerBetter: false,
    colorScheme: "RdYlGn_rev",
    description: "Kuntien nettomaahanmuutto per 1000 asukasta",
    nationalMedian: 0.8,
    nordicAvg: null,
  },
  health_access: {
    label: "Hoitoonpääsy (vrk)",
    unit: "vrk",
    format: v => Math.round(v) + " vrk",
    lowerBetter: true,
    colorScheme: "RdYlGn",
    description: "Lääkärin vastaanotolle odotusaika (mediaani vrk)",
    nationalMedian: 18,
    nordicAvg: 12,
  },
  education_index: {
    label: "Koulutusindeksi",
    unit: "pistettä",
    format: v => v.toFixed(0) + " p.",
    lowerBetter: false,
    colorScheme: "RdYlGn_rev",
    description: "Korkea-asteen koulutuksen saavuttaneiden osuus (indeksi 0–100)",
    nationalMedian: 52,
    nordicAvg: 58,
  },
};

// ─── Demo-data: Suomen maakunnat ────────────────────────────────────────────
// Oikea implementaatio lataa regional_welfare_indicators.json core.data.load():lla
// Fallback-data kattaa kaikki 19 maakuntaa realistisilla arvoilla
const DEMO_REGIONS = [
  { id: "01", name: "Uusimaa",             unemployment: 6.8,  poverty_risk: 10.2, tfr: 1.15, net_migration:  5.2, health_access: 14, education_index: 68 },
  { id: "02", name: "Varsinais-Suomi",     unemployment: 7.1,  poverty_risk: 11.8, tfr: 1.22, net_migration:  1.8, health_access: 17, education_index: 57 },
  { id: "04", name: "Satakunta",           unemployment: 8.9,  poverty_risk: 13.2, tfr: 1.31, net_migration: -1.4, health_access: 21, education_index: 44 },
  { id: "05", name: "Kanta-Häme",          unemployment: 7.6,  poverty_risk: 12.4, tfr: 1.28, net_migration:  0.3, health_access: 18, education_index: 49 },
  { id: "06", name: "Pirkanmaa",           unemployment: 7.4,  poverty_risk: 11.5, tfr: 1.24, net_migration:  2.4, health_access: 16, education_index: 59 },
  { id: "07", name: "Päijät-Häme",         unemployment: 9.2,  poverty_risk: 14.6, tfr: 1.19, net_migration: -0.8, health_access: 22, education_index: 45 },
  { id: "08", name: "Kymenlaakso",         unemployment: 9.8,  poverty_risk: 14.9, tfr: 1.23, net_migration: -2.1, health_access: 23, education_index: 43 },
  { id: "09", name: "Etelä-Karjala",       unemployment: 8.4,  poverty_risk: 13.5, tfr: 1.21, net_migration: -1.6, health_access: 20, education_index: 47 },
  { id: "10", name: "Etelä-Savo",          unemployment: 10.1, poverty_risk: 15.8, tfr: 1.29, net_migration: -3.4, health_access: 26, education_index: 39 },
  { id: "11", name: "Pohjois-Savo",        unemployment: 9.3,  poverty_risk: 14.1, tfr: 1.34, net_migration: -0.9, health_access: 24, education_index: 48 },
  { id: "12", name: "Pohjois-Karjala",     unemployment: 11.2, poverty_risk: 16.2, tfr: 1.36, net_migration: -2.8, health_access: 28, education_index: 41 },
  { id: "13", name: "Keski-Suomi",         unemployment: 9.1,  poverty_risk: 13.8, tfr: 1.32, net_migration:  0.2, health_access: 22, education_index: 50 },
  { id: "14", name: "Etelä-Pohjanmaa",     unemployment: 6.4,  poverty_risk: 11.4, tfr: 1.55, net_migration: -0.6, health_access: 20, education_index: 40 },
  { id: "15", name: "Pohjanmaa",           unemployment: 5.8,  poverty_risk: 9.8,  tfr: 1.48, net_migration:  1.1, health_access: 17, education_index: 52 },
  { id: "16", name: "Keski-Pohjanmaa",     unemployment: 6.9,  poverty_risk: 11.2, tfr: 1.62, net_migration: -0.4, health_access: 22, education_index: 38 },
  { id: "17", name: "Pohjois-Pohjanmaa",   unemployment: 9.4,  poverty_risk: 12.8, tfr: 1.68, net_migration:  0.8, health_access: 25, education_index: 50 },
  { id: "18", name: "Kainuu",              unemployment: 11.8, poverty_risk: 16.8, tfr: 1.41, net_migration: -4.2, health_access: 30, education_index: 36 },
  { id: "19", name: "Lappi",               unemployment: 10.4, poverty_risk: 14.4, tfr: 1.38, net_migration: -2.6, health_access: 31, education_index: 42 },
  { id: "21", name: "Ahvenanmaa",          unemployment: 3.8,  poverty_risk: 7.6,  tfr: 1.44, net_migration:  2.8, health_access: 12, education_index: 55 },
];

// ─── Väripaletti divergoiva ────────────────────────────────────────────────
function makeColorScale(values, lowerBetter) {
  const [min, max] = [Math.min(...values), Math.max(...values)];
  const mid = (min + max) / 2;

  // Punainen (huono) → Keltainen (keski) → Vihreä (hyvä)
  const bad   = "#8B1A1A";
  const mid_c = "#D4A017";
  const good  = "#1D6B5A";

  const scale = d3.scaleLinear()
    .domain(lowerBetter ? [min, mid, max] : [max, mid, min])
    .range([good, mid_c, bad])
    .clamp(true);
  return { scale, min, max, mid };
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────
function makeTip() {
  const el = document.createElement("div");
  el.className = `plugin-${ID}-tip`;
  document.body.appendChild(el);
  return {
    show(html, ev) {
      el.innerHTML = html;
      el.style.left = (ev.clientX + 14) + "px";
      el.style.top  = (ev.clientY + 14) + "px";
      el.style.opacity = 1;
    },
    hide() { el.style.opacity = 0; },
    destroy() { el.remove(); },
  };
}

// ─── SVG-kartta (yksinkertaistettu polygonikartta ilman TopoJSON-tiedostoa) ──
// Tuotantoversiossa: ladataan finland_regions.topojson core.data.load():lla
// Tässä käytetään approksimatiivisia koordinaatteja visualisoinnin demonstroimiseksi
const REGION_PATHS = {
  "01": "M 195,380 L 220,360 L 240,355 L 260,365 L 270,390 L 255,415 L 230,425 L 205,415 Z",          // Uusimaa
  "02": "M 120,340 L 160,320 L 195,330 L 205,355 L 195,380 L 165,390 L 135,385 L 115,365 Z",          // Varsinais-Suomi
  "04": "M 100,280 L 140,270 L 165,280 L 170,305 L 160,330 L 120,340 L 95,325 L 88,300 Z",            // Satakunta
  "05": "M 205,340 L 230,325 L 255,330 L 265,350 L 260,370 L 240,375 L 215,370 L 205,355 Z",          // Kanta-Häme
  "06": "M 160,295 L 195,280 L 220,285 L 235,305 L 230,325 L 205,340 L 175,340 L 155,320 Z",          // Pirkanmaa
  "07": "M 235,305 L 260,295 L 280,300 L 290,320 L 285,345 L 265,350 L 245,345 L 235,325 Z",          // Päijät-Häme
  "08": "M 275,310 L 305,295 L 325,305 L 330,330 L 315,350 L 290,355 L 275,340 L 270,320 Z",          // Kymenlaakso
  "09": "M 320,295 L 350,280 L 370,285 L 375,310 L 360,335 L 335,340 L 318,325 L 315,305 Z",          // Etelä-Karjala
  "10": "M 290,240 L 330,225 L 360,230 L 370,255 L 360,280 L 330,290 L 300,285 L 285,260 Z",          // Etelä-Savo
  "11": "M 250,185 L 290,170 L 325,175 L 335,200 L 330,225 L 295,235 L 260,235 L 245,210 Z",          // Pohjois-Savo
  "12": "M 320,155 L 365,140 L 395,148 L 400,175 L 390,205 L 355,215 L 325,208 L 308,178 Z",          // Pohjois-Karjala
  "13": "M 190,215 L 230,200 L 265,208 L 275,235 L 265,260 L 230,270 L 195,265 L 178,238 Z",          // Keski-Suomi
  "14": "M 120,195 L 160,180 L 195,188 L 205,215 L 195,240 L 158,248 L 125,242 L 112,218 Z",          // Etelä-Pohjanmaa
  "15": "M 78,210 L 115,195 L 135,205 L 140,230 L 130,252 L 100,260 L 75,250 L 65,228 Z",             // Pohjanmaa
  "16": "M 100,165 L 135,155 L 162,162 L 168,188 L 158,210 L 128,218 L 100,212 L 88,185 Z",           // Keski-Pohjanmaa
  "17": "M 105,110 L 155,90  L 195,98  L 205,128 L 195,158 L 155,168 L 118,162 L 100,132 Z",          // Pohjois-Pohjanmaa
  "18": "M 195,72  L 245,55  L 280,62  L 290,92  L 280,118 L 245,128 L 208,120 L 192,92 Z",           // Kainuu
  "19": "M 155,18  L 215,8   L 265,20  L 278,52  L 268,80  L 225,90  L 180,82  L 155,52 Z",           // Lappi
  "21": "M 45,310  L 75,305  L 82,320  L 75,338  L 55,342  L 42,328 Z",                                // Ahvenanmaa
};

// Maakuntien keskipisteet labeleja varten
const REGION_CENTROIDS = {
  "01": [232, 390], "02": [160, 355], "04": [130, 305], "05": [235, 355],
  "06": [195, 315], "07": [262, 325], "08": [302, 325], "09": [346, 312],
  "10": [328, 258], "11": [290, 202], "12": [358, 178], "13": [228, 238],
  "14": [160, 218], "15": [103, 228], "16": [130, 188], "17": [152, 130],
  "18": [240, 92],  "19": [210, 48],  "21": [62, 322],
};

// ─── Pää: piirto ─────────────────────────────────────────────────────────────
function renderMap(root, regions, indicatorKey, selectedId, onSelect) {
  const ind = INDICATORS[indicatorKey];
  const values = regions.map(r => r[indicatorKey]);
  const { scale, min, max } = makeColorScale(values, ind.lowerBetter);

  const mapWrap = root.querySelector(".map-wrap");
  mapWrap.innerHTML = "";

  const W = 420, H = 500;
  const svg = d3.select(mapWrap).append("svg")
    .attr("viewBox", `0 0 ${W} ${H}`)
    .attr("aria-label", `Suomen kartta: ${ind.label} maakunnittain`);

  // Pohjavesi-tekstuuri
  svg.append("rect").attr("width", W).attr("height", H)
    .attr("fill", "#E8E4DC").attr("rx", 2);

  const tip = makeTip();
  const regionMap = Object.fromEntries(regions.map(r => [r.id, r]));

  // Piirrä maakunnat
  Object.entries(REGION_PATHS).forEach(([id, pathD]) => {
    const region = regionMap[id];
    if (!region) return;
    const val = region[indicatorKey];
    const fillColor = scale(val);

    svg.append("path")
      .attr("d", pathD)
      .attr("fill", fillColor)
      .attr("class", id === selectedId ? "selected" : "")
      .attr("data-id", id)
      .on("click", () => onSelect(id))
      .on("mousemove", (ev) => {
        tip.show(
          `<b>${region.name}</b><br>${ind.label}: <b>${ind.format(val)}</b><br>` +
          `Mediaani: ${ind.format(ind.nationalMedian)}`,
          ev
        );
      })
      .on("mouseleave", () => tip.hide());
  });

  // Labelit isoille maakunnille
  const bigRegions = ["01","02","17","19","18","06","13"];
  bigRegions.forEach(id => {
    const c = REGION_CENTROIDS[id];
    const region = regionMap[id];
    if (!c || !region) return;
    const shortName = region.name.split("-")[0];
    svg.append("text")
      .attr("x", c[0]).attr("y", c[1])
      .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
      .attr("fill", "rgba(255,255,255,0.85)")
      .style("font-size", "7px")
      .style("font-family", "'JetBrains Mono', monospace")
      .style("pointer-events", "none")
      .text(shortName);
  });

  // Legenda (gradientti)
  const legendW = 160, legendH = 8;
  const lx = W - legendW - 12, ly = H - 30;
  const defs = svg.append("defs");
  const grad = defs.append("linearGradient").attr("id", `leg-grad-${ID}`);
  const stops = d3.range(0, 1.01, 0.1);
  stops.forEach(t => {
    const v = min + t * (max - min);
    grad.append("stop")
      .attr("offset", t)
      .attr("stop-color", scale(v));
  });
  svg.append("rect")
    .attr("x", lx).attr("y", ly)
    .attr("width", legendW).attr("height", legendH)
    .attr("rx", 2)
    .attr("fill", `url(#leg-grad-${ID})`);
  svg.append("text").attr("x", lx).attr("y", ly + legendH + 10)
    .attr("fill", "#6A6460").style("font-size", "8px")
    .style("font-family", "'JetBrains Mono', monospace")
    .text(ind.lowerBetter ? `${ind.format(min)} (paras)` : `${ind.format(min)} (heikoin)`);
  svg.append("text").attr("x", lx + legendW).attr("y", ly + legendH + 10)
    .attr("text-anchor", "end")
    .attr("fill", "#6A6460").style("font-size", "8px")
    .style("font-family", "'JetBrains Mono', monospace")
    .text(ind.lowerBetter ? `${ind.format(max)} (heikoin)` : `${ind.format(max)} (paras)`);

  // Palautus cleanup-funktio
  return () => tip.destroy();
}

function renderSidebar(root, regions, indicatorKey, selectedId, onSelect) {
  const ind = INDICATORS[indicatorKey];
  const values = regions.map(r => r[indicatorKey]);
  const { scale, min, max } = makeColorScale(values, ind.lowerBetter);

  // ── Valittu maakunta -kortti ──
  const card = root.querySelector(".region-card");
  const region = regions.find(r => r.id === selectedId);

  if (!region) {
    card.innerHTML = `<div class="hint">Klikkaa maakuntaa kartalta.</div>`;
  } else {
    const val = region[indicatorKey];
    const diff = val - ind.nationalMedian;
    const isBetter = ind.lowerBetter ? diff < 0 : diff > 0;
    const isNeutral = Math.abs(diff) < 0.05 * ind.nationalMedian;
    const vsClass = isNeutral ? "neutral" : (isBetter ? "better" : "worse");
    const vsText = isNeutral
      ? `≈ kansallinen mediaani (${ind.format(ind.nationalMedian)})`
      : `${isBetter ? "▲ Parempi" : "▼ Heikompi"} kuin mediaani: ${diff > 0 ? "+" : ""}${ind.format(Math.abs(diff))} ero`;
    const nordicLine = ind.nordicAvg != null
      ? `<div class="vsMedian neutral">Pohjoismaat: ${ind.format(ind.nordicAvg)}</div>`
      : "";

    card.innerHTML = `
      <div class="rname">${region.name}</div>
      <div class="rval-row">
        <div class="rval-label">${ind.label}</div>
        <div><span class="rval-num">${ind.format(val)}</span></div>
      </div>
      <div class="vsMedian ${vsClass}">${vsText}</div>
      ${nordicLine}
    `;
  }

  // ── Ranking-lista ──
  const rankCard = root.querySelector(".ranking-card");
  const sorted = [...regions].sort((a, b) =>
    ind.lowerBetter
      ? a[indicatorKey] - b[indicatorKey]
      : b[indicatorKey] - a[indicatorKey]
  );

  rankCard.querySelector(".ranking-title").textContent =
    `Ranking: ${ind.label} ${ind.lowerBetter ? "(pienin = paras)" : "(suurin = paras)"}`;

  const listEl = rankCard.querySelector(".rank-list");
  listEl.innerHTML = "";
  sorted.forEach((r, i) => {
    const val = r[indicatorKey];
    const pct = ((val - min) / (max - min)) * 100;
    const barPct = ind.lowerBetter ? (100 - pct) : pct; // käänteinen jos pienempi = parempi
    const color = scale(val);
    const row = document.createElement("div");
    row.className = "rank-row" + (r.id === selectedId ? " selected-rank" : "");
    row.innerHTML = `
      <span class="rank-num">${i + 1}</span>
      <span class="rank-name">${r.name}</span>
      <div class="rank-bar-wrap"><div class="rank-bar" style="width:${barPct}%;background:${color}"></div></div>
      <span class="rank-val">${ind.format(val)}</span>
    `;
    row.addEventListener("click", () => onSelect(r.id));
    listEl.appendChild(row);
  });
}

function renderStats(root, regions, indicatorKey) {
  const ind = INDICATORS[indicatorKey];
  const values = regions.map(r => r[indicatorKey]);
  const sorted = [...values].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const best = ind.lowerBetter ? Math.min(...values) : Math.max(...values);
  const worst = ind.lowerBetter ? Math.max(...values) : Math.min(...values);

  const bestRegion = regions.find(r => r[indicatorKey] === best);
  const worstRegion = regions.find(r => r[indicatorKey] === worst);

  const statsRow = root.querySelector(".stats-row");
  statsRow.innerHTML = `
    <div class="stat-box">
      <div class="sb-label">Mediaani</div>
      <div class="sb-val">${ind.format(median)}</div>
      <div class="sb-sub">kansallinen</div>
    </div>
    <div class="stat-box">
      <div class="sb-label">Paras</div>
      <div class="sb-val">${ind.format(best)}</div>
      <div class="sb-sub">${bestRegion?.name ?? "—"}</div>
    </div>
    <div class="stat-box">
      <div class="sb-label">Heikoin</div>
      <div class="sb-val">${ind.format(worst)}</div>
      <div class="sb-sub">${worstRegion?.name ?? "—"}</div>
    </div>
    <div class="stat-box">
      <div class="sb-label">Hajonta (max−min)</div>
      <div class="sb-val">${ind.format(Math.abs(worst - best))}</div>
      <div class="sb-sub">vaihteluväli</div>
    </div>
  `;
}

function renderInsight(root, regions, indicatorKey) {
  const ind = INDICATORS[indicatorKey];
  const values = regions.map(r => r[indicatorKey]);
  const best = ind.lowerBetter ? Math.min(...values) : Math.max(...values);
  const worst = ind.lowerBetter ? Math.max(...values) : Math.min(...values);
  const bestR = regions.find(r => r[indicatorKey] === best);
  const worstR = regions.find(r => r[indicatorKey] === worst);
  const spread = Math.abs(worst - best);
  const spreadPct = (spread / Math.abs(ind.nationalMedian) * 100).toFixed(0);

  // Laske kuinka moni on yli/alle mediaanin
  const aboveMedian = regions.filter(r =>
    ind.lowerBetter
      ? r[indicatorKey] > ind.nationalMedian
      : r[indicatorKey] < ind.nationalMedian
  ).length;

  root.querySelector(".insight").innerHTML = `
    <strong>Analyysi · ${ind.label}:</strong>
    Parhaan ja heikoimpaan maakunnan välinen ero on <strong>${ind.format(spread)}</strong>
    — noin <strong>${spreadPct}%</strong> kansallisesta mediaanista.
    <strong>${bestR?.name}</strong> on paras (${ind.format(best)}),
    <strong>${worstR?.name}</strong> heikoin (${ind.format(worst)}).
    ${aboveMedian} maakunnassa ${19} tilanne on mediaania heikompi —
    alueellinen eriarvoisuus on merkittävä tällä indikaattorilla.
    ${ind.nordicAvg ? `Pohjoismainen keskiarvo (${ind.format(ind.nordicAvg)}) on vertailuna.` : ""}
  `;
}

// ─── Päämoduuli ──────────────────────────────────────────────────────────────
let _mapCleanup = null;

async function mount(host, core) {
  console.log("[moduli011] mount kutsuttu");

  // Tyylien injektio
  if (!document.getElementById("style-" + ID)) {
    const s = document.createElement("style");
    s.id = "style-" + ID;
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  host.innerHTML = `
    <section class="plugin-${ID}" aria-label="Alueellinen eriarvoisuuskartta">
      <div class="kicker">TTT-analyysi · Alueellinen vertailu</div>
      <h3>Hyvinvointi maakunnittain</h3>
      <p class="lead">
        Suomi ei ole homogeeninen — hyvinvoinnin indikaattorit vaihtelevat merkittävästi
        maakunnasta toiseen. Valitse indikaattori ja klikkaa maakuntaa nähdäksesi tarkemmat tiedot.
      </p>

      <div class="controls">
        <div class="ctrl-group">
          <span class="ctrl-label">Indikaattori</span>
          <select id="ind-select-${ID}">
            ${Object.entries(INDICATORS).map(([k, v]) =>
              `<option value="${k}">${v.label}</option>`
            ).join("")}
          </select>
        </div>
      </div>

      <div class="map-layout">
        <div>
          <div class="map-wrap">
            <div class="loading-state">
              <div class="spinner"></div>
              Ladataan karttaa…
            </div>
          </div>
        </div>

        <div class="sidebar">
          <div class="region-card">
            <div class="hint">Klikkaa maakuntaa kartalta.</div>
          </div>
          <div class="ranking-card">
            <div class="ranking-title"></div>
            <div class="rank-list"></div>
          </div>
        </div>
      </div>

      <div class="stats-row"></div>
      <div class="insight"></div>
      <div class="source"></div>
    </section>
  `;

  const root = host.querySelector(`.plugin-${ID}`);

  try {
    // Yritä ladata oikeaa dataa — fallback demo-dataan
    let regions = DEMO_REGIONS;
    let dataSource = "demo-data (regional_welfare_indicators.json ei löytynyt)";

    try {
      const loaded = await core.data.load("regional_welfare_indicators.json");
      if (loaded && loaded.length > 0) {
        regions = loaded;
        dataSource = "regional_welfare_indicators.json";
        console.log("[moduli011] oikea data ladattu:", regions.length, "maakuntaa");
      }
    } catch (e) {
      console.warn("[moduli011] käytetään demo-dataa:", e.message);
    }

    let selectedIndicator = "unemployment";
    let selectedRegionId = "01"; // Uusimaa oletuksena

    function refresh() {
      if (_mapCleanup) { _mapCleanup(); _mapCleanup = null; }
      _mapCleanup = renderMap(root, regions, selectedIndicator, selectedRegionId,
        (id) => { selectedRegionId = id; refresh(); }
      );
      renderSidebar(root, regions, selectedIndicator, selectedRegionId,
        (id) => { selectedRegionId = id; refresh(); }
      );
      renderStats(root, regions, selectedIndicator);
      renderInsight(root, regions, selectedIndicator);
    }

    // Indikaattorivaihto
    root.querySelector(`#ind-select-${ID}`).addEventListener("change", (e) => {
      selectedIndicator = e.target.value;
      refresh();
    });

    refresh();

    root.querySelector(".source").textContent =
      `Lähde: ${dataSource} · Tilastokeskus, THL, Kela · Vuosi 2023 · ` +
      `Reaaliset arvot, maakuntajako 2023`;

    requestAnimationFrame(() => root.classList.add("is-mounted"));

  } catch (err) {
    console.error("[moduli011] virhe:", err);
    root.innerHTML = `<div style="padding:24px;color:#8B1A1A;font-family:monospace">
      <strong>Virhe lisäosassa:</strong><br>${err.message}
    </div>`;
  }
}

function unmount(host) {
  if (_mapCleanup) { _mapCleanup(); _mapCleanup = null; }
  if (host) host.innerHTML = "";
}

export default { id: ID, mount, unmount };
