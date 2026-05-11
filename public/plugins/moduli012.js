// public/plugins/moduli012.js
// Plugin: Sukupolvien välinen tasapaino
// Ikäpyramidi (1980–2040), huoltosuhde-aikasarja, rahavirrat ikäryhmittäin, simulaattori

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const ID = "moduli012";

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;600&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');

.plugin-${ID} {
  --bg:        #141210;
  --bg2:       #1E1B18;
  --bg3:       #272320;
  --border:    rgba(255,255,255,0.07);
  --text:      #EDE8E0;
  --muted:     #7A7570;
  --gold:      #C8A84B;
  --gold2:     #E8C87A;
  --red:       #B54040;
  --green:     #3A7D62;
  --blue:      #4A7AA8;
  --young:     #4A7AA8;
  --working:   #3A7D62;
  --elderly:   #B54040;

  background: var(--bg);
  color: var(--text);
  font-family: 'Lora', Georgia, serif;
  max-width: 980px;
  margin: 0 auto;
  padding: 32px 28px 24px;
  border: 1px solid var(--border);
  border-radius: 4px;
  opacity: 0;
  transition: opacity .5s ease;
  box-sizing: border-box;
}
.plugin-${ID}.is-mounted { opacity: 1; }

/* ── Otsikkoalue ── */
.plugin-${ID} .kicker {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 8px;
}
.plugin-${ID} h3 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px;
  line-height: 1.15;
  color: var(--text);
}
.plugin-${ID} .lead {
  color: var(--muted);
  font-size: 13.5px;
  margin: 0 0 28px;
  line-height: 1.65;
  font-style: italic;
  max-width: 620px;
  border-bottom: 0.5px solid var(--border);
  padding-bottom: 20px;
}

/* ── Sektiootsikot ── */
.plugin-${ID} .section-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8.5px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.plugin-${ID} .section-label::after {
  content: '';
  flex: 1;
  height: 0.5px;
  background: var(--border);
}

/* ── Yläosa: pyramidi + huoltosuhde ── */
.plugin-${ID} .top-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 20px;
  margin-bottom: 20px;
  align-items: start;
}
@media (max-width: 740px) {
  .plugin-${ID} .top-grid { grid-template-columns: 1fr; }
}

/* ── Pyramidin kontti ── */
.plugin-${ID} .pyramid-wrap {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 18px 16px 14px;
}
.plugin-${ID} .pyramid-wrap svg {
  width: 100%;
  height: auto;
  display: block;
  overflow: visible;
}

/* ── Vuosisäädin ── */
.plugin-${ID} .year-control {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 14px;
}
.plugin-${ID} .year-display {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 36px;
  font-weight: 700;
  color: var(--gold);
  min-width: 72px;
  line-height: 1;
}
.plugin-${ID} .year-slider-wrap {
  flex: 1;
}
.plugin-${ID} input[type="range"] {
  width: 100%;
  accent-color: var(--gold);
  cursor: pointer;
  height: 3px;
}
.plugin-${ID} .year-ticks {
  display: flex;
  justify-content: space-between;
  font-family: 'JetBrains Mono', monospace;
  font-size: 8px;
  color: var(--muted);
  margin-top: 4px;
}
.plugin-${ID} .pyramid-legend {
  display: flex;
  gap: 18px;
  margin-top: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: var(--muted);
}
.plugin-${ID} .pyramid-legend span {
  display: flex;
  align-items: center;
  gap: 5px;
}
.plugin-${ID} .pyramid-legend i {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 1px;
  flex-shrink: 0;
}

/* ── Oikea kolumni: huoltosuhde + kortit ── */
.plugin-${ID} .right-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.plugin-${ID} .ratio-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 18px;
}
.plugin-${ID} .ratio-big {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 52px;
  font-weight: 700;
  line-height: 1;
  color: var(--text);
}
.plugin-${ID} .ratio-unit {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--muted);
  margin-top: 4px;
}
.plugin-${ID} .ratio-desc {
  font-size: 12px;
  color: var(--muted);
  margin-top: 8px;
  line-height: 1.5;
  font-style: italic;
}
.plugin-${ID} .ratio-bar-wrap {
  margin-top: 12px;
  height: 6px;
  background: var(--bg3);
  border-radius: 3px;
  overflow: hidden;
}
.plugin-${ID} .ratio-bar {
  height: 100%;
  border-radius: 3px;
  transition: width .4s ease, background .4s ease;
}

/* ── Kolme statistiikkalaatikkoa ── */
.plugin-${ID} .stat-trio {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.plugin-${ID} .stat-mini {
  background: var(--bg3);
  border-radius: 3px;
  padding: 10px;
  border-top: 2px solid var(--border);
  transition: border-color .3s;
}
.plugin-${ID} .stat-mini.young-color  { border-top-color: var(--young); }
.plugin-${ID} .stat-mini.work-color   { border-top-color: var(--working); }
.plugin-${ID} .stat-mini.elder-color  { border-top-color: var(--elderly); }
.plugin-${ID} .stat-mini .sm-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 7.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 4px;
}
.plugin-${ID} .stat-mini .sm-val {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.1;
}
.plugin-${ID} .stat-mini .sm-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8px;
  color: var(--muted);
  margin-top: 2px;
}
.plugin-${ID} .stat-mini.young-color  .sm-val { color: var(--young); }
.plugin-${ID} .stat-mini.work-color   .sm-val { color: var(--working); }
.plugin-${ID} .stat-mini.elder-color  .sm-val { color: var(--elderly); }

/* ── Huoltosuhde-aikasarja ── */
.plugin-${ID} .trend-wrap {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 18px 16px 14px;
  margin-bottom: 20px;
}
.plugin-${ID} .trend-wrap svg {
  width: 100%;
  height: auto;
  display: block;
}

/* ── Rahavirta-palkit (yksinkertaistettu sankey) ── */
.plugin-${ID} .flow-wrap {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 20px;
  margin-bottom: 20px;
}
.plugin-${ID} .flow-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 0;
  align-items: center;
  margin-top: 14px;
}
.plugin-${ID} .flow-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.plugin-${ID} .flow-col.right { text-align: right; }
.plugin-${ID} .flow-mid {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  gap: 10px;
}
.plugin-${ID} .flow-center-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  writing-mode: vertical-rl;
  transform: rotate(180deg);
}
.plugin-${ID} .flow-pipe {
  width: 3px;
  border-radius: 2px;
  transition: height .4s ease, background .3s;
}
.plugin-${ID} .flow-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.plugin-${ID} .flow-row.right { flex-direction: row-reverse; }
.plugin-${ID} .flow-bar {
  height: 22px;
  border-radius: 2px;
  transition: width .4s ease;
  min-width: 4px;
}
.plugin-${ID} .flow-bar-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: var(--muted);
  white-space: nowrap;
  flex-shrink: 0;
}
.plugin-${ID} .flow-bar-val {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── Simulaattori ── */
.plugin-${ID} .sim-wrap {
  background: var(--bg2);
  border: 1px solid var(--gold);
  border-opacity: 0.3;
  border-radius: 3px;
  padding: 20px;
  margin-bottom: 20px;
  border-color: rgba(200,168,75,0.25);
}
.plugin-${ID} .sim-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 14px;
}
@media (max-width: 600px) {
  .plugin-${ID} .sim-grid { grid-template-columns: 1fr; }
}
.plugin-${ID} .sim-ctrl {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.plugin-${ID} .sim-item label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  display: block;
  margin-bottom: 6px;
}
.plugin-${ID} .sim-item .val-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 5px;
}
.plugin-${ID} .sim-item .val-current {
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  font-weight: 700;
  color: var(--gold2);
}
.plugin-${ID} .sim-result {
  background: var(--bg3);
  border-radius: 3px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
}
.plugin-${ID} .sim-result-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 0.5px solid var(--border);
  padding-bottom: 10px;
}
.plugin-${ID} .sim-result-row:last-child { border-bottom: none; padding-bottom: 0; }
.plugin-${ID} .sim-result-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.plugin-${ID} .sim-result-val {
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
}
.plugin-${ID} .sim-result-val.good  { color: var(--green); }
.plugin-${ID} .sim-result-val.bad   { color: var(--red); }
.plugin-${ID} .sim-result-val.warn  { color: var(--gold); }

/* ── Insight-boksi ── */
.plugin-${ID} .insight {
  border-left: 2px solid var(--gold);
  padding: 14px 18px;
  font-size: 13px;
  line-height: 1.7;
  color: rgba(237,232,224,0.8);
  margin-bottom: 16px;
  background: rgba(200,168,75,0.05);
  border-radius: 0 3px 3px 0;
}
.plugin-${ID} .insight strong { color: var(--text); }

/* ── Tooltip ── */
.plugin-${ID}-tip {
  position: fixed;
  background: var(--bg2, #1E1B18);
  color: #EDE8E0;
  border: 1px solid rgba(200,168,75,0.3);
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  padding: 7px 11px;
  border-radius: 3px;
  pointer-events: none;
  opacity: 0;
  transition: opacity .12s;
  z-index: 9999;
  line-height: 1.55;
}

/* ── Lähde ── */
.plugin-${ID} .source {
  color: var(--muted);
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-style: italic;
  margin-top: 4px;
}

/* ── Loading ── */
.plugin-${ID} .loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: var(--muted);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  gap: 12px;
}
.plugin-${ID} .spinner {
  width: 18px; height: 18px;
  border: 1.5px solid #3A3630;
  border-top-color: var(--gold, #C8A84B);
  border-radius: 50%;
  animation: spin-${ID} .75s linear infinite;
}
@keyframes spin-${ID} { to { transform: rotate(360deg); } }

/* ── SVG akselit ── */
.plugin-${ID} .axis path,
.plugin-${ID} .axis line { stroke: rgba(255,255,255,0.08); }
.plugin-${ID} .axis text {
  fill: #7A7570;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
}
`;

// ─── Demo-data: ikäpyramidit 1980–2040 ────────────────────────────────────
// Ikäryhmät: 0-4, 5-9, ..., 80-84, 85+  (18 ryhmää)
// Arvot: 1000 henkilöä per sukupuoli
// Lähde: Tilastokeskus + projektiomalli
const AGE_GROUPS = [
  "0–4","5–9","10–14","15–19","20–24","25–29","30–34","35–39",
  "40–44","45–49","50–54","55–59","60–64","65–69","70–74","75–79","80–84","85+"
];

// [miehet, naiset] per ikäryhmä, 1000 henkilöä
const PYRAMID_DATA = {
  1980: [
    [183,175],[202,193],[190,182],[192,184],[170,163],[152,145],[149,143],[172,165],
    [167,163],[138,137],[116,118],[103,109],[ 87, 96],[ 64, 78],[ 48, 66],[ 29, 48],[15,31],[5,14]
  ],
  1990: [
    [163,156],[162,155],[185,177],[205,196],[194,185],[172,164],[153,146],[150,144],
    [172,166],[168,164],[139,138],[117,119],[104,110],[ 88, 97],[ 64, 79],[ 46, 65],[27,46],[10,22]
  ],
  2000: [
    [152,145],[157,150],[161,154],[165,158],[165,158],[195,187],[208,199],[196,188],
    [175,167],[156,149],[152,146],[173,167],[170,166],[140,140],[117,120],[102,110],[82,95],[24,44]
  ],
  2010: [
    [145,138],[151,144],[153,146],[155,148],[163,156],[163,156],[159,152],[167,160],
    [196,188],[208,200],[197,190],[176,169],[157,151],[153,147],[172,168],[166,163],[121,131],[70,104]
  ],
  2020: [
    [126,120],[141,135],[148,141],[151,145],[148,141],[156,149],[160,153],[156,149],
    [162,155],[161,154],[162,156],[162,156],[193,186],[207,199],[193,187],[168,163],[133,139],[114,153]
  ],
  2030: [  // projektio
    [113,108],[124,118],[132,126],[145,138],[149,142],[148,141],[152,145],[158,151],
    [154,147],[158,151],[158,152],[160,154],[158,152],[158,152],[180,174],[192,186],[171,167],[172,205]
  ],
  2040: [  // projektio
    [102, 98],[111,106],[121,115],[131,125],[140,133],[147,140],[145,138],[149,142],
    [145,138],[150,143],[155,148],[154,148],[153,147],[154,148],[152,146],[170,165],[170,167],[211,240]
  ],
};

// Interpoloi datan kahden vuoden välille
function interpolatePyramid(year) {
  const years = [1980,1990,2000,2010,2020,2030,2040];
  if (PYRAMID_DATA[year]) return PYRAMID_DATA[year];
  const lo = years.filter(y => y <= year).pop() || 1980;
  const hi = years.filter(y => y >= year)[0] || 2040;
  if (lo === hi) return PYRAMID_DATA[lo];
  const t = (year - lo) / (hi - lo);
  return PYRAMID_DATA[lo].map((row, i) => [
    Math.round(row[0] + (PYRAMID_DATA[hi][i][0] - row[0]) * t),
    Math.round(row[1] + (PYRAMID_DATA[hi][i][1] - row[1]) * t),
  ]);
}

// ─── Huoltosuhde-data (historiallinen + projektio) ─────────────────────────
const RATIO_SERIES = [
  { year:1980, ratio: 49.3 },
  { year:1985, ratio: 48.1 },
  { year:1990, ratio: 47.6 },
  { year:1995, ratio: 48.8 },
  { year:2000, ratio: 48.5 },
  { year:2005, ratio: 48.1 },
  { year:2010, ratio: 51.6 },
  { year:2015, ratio: 57.1 },
  { year:2020, ratio: 63.4 },
  { year:2025, ratio: 68.2 },
  { year:2030, ratio: 74.5 },
  { year:2035, ratio: 79.8 },
  { year:2040, ratio: 82.6 },
];

// ─── Rahavirrat ikäryhmittäin (Mrd € / v) ─────────────────────────────────
const TRANSFERS = {
  // Saa: [alle25, 25-64, yli65]
  receives: [
    { label: "Lastensuojelu & päivähoito", values: [1.8, 0.1, 0.0], color: "#4A7AA8" },
    { label: "Perusopetus & toinen aste",  values: [4.2, 0.3, 0.0], color: "#5A9AC8" },
    { label: "Korkeakoulutus",             values: [1.2, 0.8, 0.0], color: "#3A6A98" },
    { label: "Työttömyysturva",            values: [0.2, 3.8, 0.3], color: "#3A7D62" },
    { label: "Eläkkeet",                  values: [0.0, 0.2, 15.8], color: "#B54040" },
    { label: "Vanhushoiva & palvelut",    values: [0.0, 0.0,  4.2], color: "#A03030" },
    { label: "Terveydenhuolto (yleinen)", values: [0.8, 4.2,  5.8], color: "#6A6090" },
  ],
};

// ─── Tooltip ─────────────────────────────────────────────────────────────────
function makeTip() {
  const el = document.createElement("div");
  el.className = `plugin-${ID}-tip`;
  document.body.appendChild(el);
  return {
    show(html, ev) {
      el.innerHTML = html;
      const x = ev.clientX + 14, y = ev.clientY + 14;
      el.style.left = x + "px";
      el.style.top  = y + "px";
      el.style.opacity = 1;
    },
    hide() { el.style.opacity = 0; },
    destroy() { el.remove(); },
  };
}

// ─── Ikäpyramidi ─────────────────────────────────────────────────────────────
function drawPyramid(container, year, tip) {
  const data = interpolatePyramid(year);
  const W = 520, H = 380;
  const M = { t: 10, r: 50, b: 24, l: 50 };
  const midX = W / 2;
  const rowH = (H - M.t - M.b) / AGE_GROUPS.length;

  const maxVal = d3.max(data.flat()) * 1.05;
  const xLeft  = d3.scaleLinear().domain([0, maxVal]).range([0, midX - M.l - 10]);
  const xRight = d3.scaleLinear().domain([0, maxVal]).range([0, midX - M.r - 10]);

  // Väri ikäryhmän mukaan
  function rowColor(i, side) {
    if (i <= 3)  return side === "m" ? "#3A6080" : "#4A7AA8";  // nuoret
    if (i <= 11) return side === "m" ? "#2A6045" : "#3A7D62";  // työikäiset
    return side === "m" ? "#903030" : "#B54040";                // eläkeläiset
  }

  const svg = d3.select(container).append("svg")
    .attr("viewBox", `0 0 ${W} ${H}`);

  // Tausta-ruudukko
  svg.append("line")
    .attr("x1", midX).attr("y1", M.t).attr("x2", midX).attr("y2", H - M.b)
    .attr("stroke", "rgba(255,255,255,0.1)").attr("stroke-width", 1);

  // Piirretään rivit
  data.forEach(([m, f], i) => {
    const y = M.t + i * rowH;
    const barH = rowH - 2;

    // Miehet (vasen)
    svg.append("rect")
      .attr("x", midX - M.l - xLeft(m) - 10)
      .attr("y", y + 1)
      .attr("width", xLeft(m))
      .attr("height", barH)
      .attr("fill", rowColor(i, "m"))
      .attr("rx", 1)
      .attr("opacity", 0.85)
      .on("mousemove", ev => tip.show(
        `<b>${AGE_GROUPS[i]}</b> · Miehet<br>${m.toLocaleString("fi-FI")} 000 henkilöä`,
        ev
      ))
      .on("mouseleave", () => tip.hide());

    // Naiset (oikea)
    svg.append("rect")
      .attr("x", midX + M.r + 10)
      .attr("y", y + 1)
      .attr("width", xRight(f))
      .attr("height", barH)
      .attr("fill", rowColor(i, "f"))
      .attr("rx", 1)
      .attr("opacity", 0.85)
      .on("mousemove", ev => tip.show(
        `<b>${AGE_GROUPS[i]}</b> · Naiset<br>${f.toLocaleString("fi-FI")} 000 henkilöä`,
        ev
      ))
      .on("mouseleave", () => tip.hide());

    // Ikäryhmäteksti keskellä
    if (i % 2 === 0) {
      svg.append("text")
        .attr("x", midX)
        .attr("y", y + rowH / 2 + 3)
        .attr("text-anchor", "middle")
        .attr("fill", "rgba(255,255,255,0.25)")
        .style("font-family", "'JetBrains Mono', monospace")
        .style("font-size", "7px")
        .text(AGE_GROUPS[i]);
    }
  });

  // Ikäryhmäotsikot
  svg.append("text").attr("x", M.l * 0.5).attr("y", M.t - 2)
    .attr("text-anchor","middle").attr("fill","rgba(255,255,255,0.4)")
    .style("font-size","9px").style("font-family","'JetBrains Mono',monospace")
    .text("MIEHET");
  svg.append("text").attr("x", W - M.r * 0.5).attr("y", M.t - 2)
    .attr("text-anchor","middle").attr("fill","rgba(255,255,255,0.4)")
    .style("font-size","9px").style("font-family","'JetBrains Mono',monospace")
    .text("NAISET");

  // Projektiomerkintä
  if (year > 2024) {
    svg.append("text").attr("x", midX).attr("y", H - M.b + 14)
      .attr("text-anchor","middle").attr("fill","rgba(200,168,75,0.6)")
      .style("font-size","8px").style("font-family","'JetBrains Mono',monospace")
      .text("↑ PROJEKTIO");
  }
}

// ─── Huoltosuhde-aikasarja ────────────────────────────────────────────────────
function drawRatioTrend(container, currentYear, tip) {
  const W = 880, H = 130;
  const M = { t: 12, r: 20, b: 28, l: 48 };

  const svg = d3.select(container).append("svg").attr("viewBox", `0 0 ${W} ${H}`);

  const x = d3.scaleLinear()
    .domain([1980, 2040])
    .range([M.l, W - M.r]);
  const y = d3.scaleLinear()
    .domain([40, 90])
    .nice()
    .range([H - M.b, M.t]);

  // Kriisivyöhyke (yli 70)
  svg.append("rect")
    .attr("x", x(1980)).attr("y", y(90))
    .attr("width", x(2040) - x(1980))
    .attr("height", y(70) - y(90))
    .attr("fill", "rgba(181,64,64,0.08)");
  svg.append("text")
    .attr("x", W - M.r - 4).attr("y", y(88))
    .attr("text-anchor","end").attr("fill","rgba(181,64,64,0.4)")
    .style("font-size","8px").style("font-family","'JetBrains Mono',monospace")
    .text("KRIITTINEN ALUE");

  // Historia vs. projektio erottelu
  const histData = RATIO_SERIES.filter(d => d.year <= 2024);
  const projData = RATIO_SERIES.filter(d => d.year >= 2024);

  const lineGen = d3.line().x(d => x(d.year)).y(d => y(d.ratio)).curve(d3.curveCatmullRom);
  const areaGen = d3.area().x(d => x(d.year)).y0(H - M.b).y1(d => y(d.ratio)).curve(d3.curveCatmullRom);

  // Historiatäyttö
  svg.append("path").datum(histData)
    .attr("d", areaGen)
    .attr("fill", "rgba(58,125,98,0.12)");
  svg.append("path").datum(histData)
    .attr("d", lineGen)
    .attr("fill","none").attr("stroke","#3A7D62").attr("stroke-width", 2);

  // Projektiotäyttö
  svg.append("path").datum(projData)
    .attr("d", areaGen)
    .attr("fill", "rgba(181,64,64,0.10)");
  svg.append("path").datum(projData)
    .attr("d", lineGen)
    .attr("fill","none").attr("stroke","#B54040")
    .attr("stroke-width", 2).attr("stroke-dasharray","5,3");

  // Nykyhetki-merkki
  const cy = y(RATIO_SERIES.find(d => d.year === 2020)?.ratio || 63);
  svg.append("line")
    .attr("x1", x(2024)).attr("y1", M.t)
    .attr("x2", x(2024)).attr("y2", H - M.b)
    .attr("stroke","rgba(200,168,75,0.3)").attr("stroke-dasharray","3,3");
  svg.append("text")
    .attr("x", x(2024) + 4).attr("y", M.t + 10)
    .attr("fill","rgba(200,168,75,0.6)")
    .style("font-size","7.5px").style("font-family","'JetBrains Mono',monospace")
    .text("NYT →");

  // Nykyinen vuosi korostus
  const nearestData = RATIO_SERIES.reduce((prev, curr) =>
    Math.abs(curr.year - currentYear) < Math.abs(prev.year - currentYear) ? curr : prev
  );
  svg.append("circle")
    .attr("cx", x(nearestData.year)).attr("cy", y(nearestData.ratio))
    .attr("r", 5)
    .attr("fill","var(--gold, #C8A84B)")
    .attr("stroke","#141210").attr("stroke-width", 2);

  // Akselit
  svg.append("g").attr("class","axis")
    .attr("transform",`translate(0,${H-M.b})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(7).tickSize(3));
  svg.append("g").attr("class","axis")
    .attr("transform",`translate(${M.l},0)`)
    .call(d3.axisLeft(y).ticks(5).tickFormat(d => d).tickSize(3));

  // Y-akselin teksti
  svg.append("text")
    .attr("x", -H/2).attr("y", 12)
    .attr("transform","rotate(-90)")
    .attr("text-anchor","middle")
    .attr("fill","rgba(122,117,112,0.8)")
    .style("font-size","8px").style("font-family","'JetBrains Mono',monospace")
    .text("huoltosuhde (eläkeläiset+lapset / 100 työikäistä)");

  // Interaktiiviset pisteet
  RATIO_SERIES.forEach(d => {
    svg.append("circle")
      .attr("cx", x(d.year)).attr("cy", y(d.ratio))
      .attr("r", 4).attr("fill","transparent")
      .attr("stroke","transparent")
      .style("cursor","crosshair")
      .on("mousemove", ev => tip.show(
        `<b>${d.year}</b>${d.year > 2024 ? " (proj.)" : ""}<br>Huoltosuhde: <b>${d.ratio.toFixed(1)}</b><br>100 työllistä / ${d.ratio.toFixed(0)} huollettavaa`,
        ev
      ))
      .on("mouseleave", () => tip.hide());
  });
}

// ─── Rahavirta-visualisointi ──────────────────────────────────────────────────
function drawFlows(container, year) {
  const wrap = d3.select(container);
  wrap.selectAll(".flow-grid").remove();

  // Ikäryhmien suhteellinen koko vuoden mukaan
  const data = interpolatePyramid(year);
  const youngPop  = data.slice(0,4).reduce((s,r)=>s+r[0]+r[1],0);  // 0-19
  const workPop   = data.slice(4,13).reduce((s,r)=>s+r[0]+r[1],0); // 20-64
  const elderPop  = data.slice(13).reduce((s,r)=>s+r[0]+r[1],0);   // 65+

  // Skaalaa siirrot väestöosuuden mukaan (yksinkertainen malli)
  const youngShare  = youngPop  / (youngPop+workPop+elderPop);
  const elderShare  = elderPop  / (youngPop+workPop+elderPop);
  const scaleFactor = 1 + (elderShare - 0.22) * 2; // kasvu ikääntyessä

  const items = TRANSFERS.receives.map(t => ({
    ...t,
    values: t.values.map((v,i) => i===2 ? v * scaleFactor : v)
  }));

  const maxBar = 180;
  const totalByGroup = [0,1,2].map(g =>
    items.reduce((s,t) => s + t.values[g], 0)
  );
  const absMax = Math.max(...totalByGroup);

  const grid = wrap.append("div").attr("class","flow-grid");

  // Vasen sarake: alle 25-vuotiaat
  const leftCol = grid.append("div").attr("class","flow-col");
  leftCol.append("div").style("font-family","'JetBrains Mono', monospace")
    .style("font-size","8.5px").style("letter-spacing","0.1em")
    .style("color","var(--muted)").style("text-transform","uppercase")
    .style("margin-bottom","8px").style("color","var(--young, #4A7AA8)")
    .text("0–24 v. · nuoret");

  items.filter(t => t.values[0] > 0.05).forEach(t => {
    const row = leftCol.append("div").attr("class","flow-row");
    const pct = (t.values[0] / absMax * maxBar);
    row.append("div").attr("class","flow-bar")
      .style("width", pct + "px").style("background", t.color);
    const lblGroup = row.append("div").style("display","flex").style("flex-direction","column").style("gap","1px");
    lblGroup.append("div").attr("class","flow-bar-val")
      .style("color",t.color).text(`${t.values[0].toFixed(1)} Mrd €`);
    lblGroup.append("div").attr("class","flow-bar-label").text(t.label);
  });
  leftCol.append("div")
    .style("margin-top","8px")
    .style("font-family","'Playfair Display', serif")
    .style("font-size","18px").style("font-weight","700")
    .style("color","var(--young, #4A7AA8)")
    .text(`yht. ${totalByGroup[0].toFixed(1)} Mrd €`);

  // Keskikohta
  const mid = grid.append("div").attr("class","flow-mid");
  mid.append("div").style("font-family","'JetBrains Mono', monospace")
    .style("font-size","8px").style("letter-spacing","0.12em")
    .style("text-transform","uppercase").style("color","var(--muted)")
    .style("text-align","center").style("writing-mode","vertical-rl")
    .style("transform","rotate(180deg)").style("height","80px")
    .text("← JULKISET TULONSIIRROT →");

  mid.append("div").style("font-family","'Playfair Display', serif")
    .style("font-size","11px").style("color","var(--gold, #C8A84B)")
    .style("text-align","center")
    .html(`<div style="font-size:20px;font-weight:700">${(totalByGroup[0]+totalByGroup[2]).toFixed(0)}</div><div style="font-size:9px;font-family:'JetBrains Mono',monospace;color:var(--muted)">Mrd € huollettaville</div>`);

  // Oikea sarake: yli 65-vuotiaat
  const rightCol = grid.append("div").attr("class","flow-col right");
  rightCol.append("div").style("font-family","'JetBrains Mono', monospace")
    .style("font-size","8.5px").style("letter-spacing","0.1em")
    .style("color","var(--elderly, #B54040)").style("text-transform","uppercase")
    .style("margin-bottom","8px").style("text-align","right")
    .text("65+ v. · eläkeläiset");

  items.filter(t => t.values[2] > 0.05).forEach(t => {
    const row = rightCol.append("div").attr("class","flow-row right");
    const pct = (t.values[2] / absMax * maxBar);
    row.append("div").attr("class","flow-bar")
      .style("width", pct + "px").style("background", t.color);
    const lblGroup = row.append("div").style("display","flex").style("flex-direction","column")
      .style("gap","1px").style("text-align","right");
    lblGroup.append("div").attr("class","flow-bar-val")
      .style("color",t.color).text(`${t.values[2].toFixed(1)} Mrd €`);
    lblGroup.append("div").attr("class","flow-bar-label").text(t.label);
  });
  rightCol.append("div")
    .style("margin-top","8px")
    .style("font-family","'Playfair Display', serif")
    .style("font-size","18px").style("font-weight","700")
    .style("color","var(--elderly, #B54040)")
    .style("text-align","right")
    .text(`yht. ${totalByGroup[2].toFixed(1)} Mrd €`);
}

// ─── Laske huoltosuhde ja väestöosuudet ───────────────────────────────────
function calcStats(year) {
  const data = interpolatePyramid(year);
  const total = data.reduce((s,r)=>s+r[0]+r[1],0);
  const young  = data.slice(0,4).reduce((s,r)=>s+r[0]+r[1],0);   // 0–19
  const work   = data.slice(4,13).reduce((s,r)=>s+r[0]+r[1],0);  // 20–64
  const elder  = data.slice(13).reduce((s,r)=>s+r[0]+r[1],0);    // 65+
  const ratio  = ((young+elder)/work*100);
  return {
    total, young, work, elder,
    youngPct: (young/total*100).toFixed(1),
    workPct:  (work /total*100).toFixed(1),
    elderPct: (elder/total*100).toFixed(1),
    ratio: ratio.toFixed(1),
    isProjection: year > 2024,
  };
}

// ─── Simulaattori ────────────────────────────────────────────────────────────
function calcSimulator(retireAgeDelta, tfrDelta, immigrationK) {
  // Perusennuste 2040: huoltosuhde 82.6
  const baseRatio = 82.6;
  const baseWork  = 2780;  // 1000 henkilöä

  // Eläkeiän nosto vähentää eläkeläisiä, lisää työikäisiä
  const retireEffect   = -retireAgeDelta * 28;       // -28 per +1 vuosi eläkeikä
  // TFR-muutos vaikuttaa hitaasti (20v viive) — maltillinen vaikutus 2040 mennessä
  const tfrEffect      = -tfrDelta * 35;             // -35 per +0.1 TFR
  // Nettomaahanmuutto: suuri vaikutus, pääosin työikäisiä
  const immigEffect    = -(immigrationK / 10) * 4.5; // per 1000 muuttajaa/v
  const totalEffect    = retireEffect + tfrEffect + immigEffect;
  const newRatio       = Math.max(45, baseRatio + totalEffect);

  // Uudet työikäiset
  const extraWorkers   = Math.round(-totalEffect * 0.3);
  const eläkekestävyys = newRatio < 70 ? "good" : newRatio < 78 ? "warn" : "bad";

  return {
    ratio: newRatio.toFixed(1),
    statusClass: eläkekestävyys,
    extraWorkers,
    label: eläkekestävyys === "good" ? "Kestävä" : eläkekestävyys === "warn" ? "Haastava" : "Kriittinen",
  };
}

// ─── Päämoduuli ──────────────────────────────────────────────────────────────
let _tips = [];

async function mount(host, core) {
  console.log("[moduli012] mount kutsuttu");

  if (!document.getElementById("style-" + ID)) {
    const s = document.createElement("style");
    s.id = "style-" + ID;
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  host.innerHTML = `
    <section class="plugin-${ID}" aria-label="Sukupolvien välinen tasapaino">
      <div class="kicker">TTT-analyysi · Väestödynamiikka</div>
      <h3>Sukupolvien välinen tasapaino</h3>
      <p class="lead">
        Suomen väestö ikääntyy — ja jokainen ikäluokka siirtyy huollettavaksi.
        Ikäpyramidi muuttuu rakenteeltaan: leveä pohja kapenee, yläpää paisuu.
        Mitä tämä tarkoittaa julkiselle taloudelle ja kenen harteilla paino lepää?
      </p>

      <div class="section-label">01 · Ikäpyramidi</div>
      <div class="top-grid">
        <div class="pyramid-wrap">
          <div id="pyramid-svg-${ID}"></div>
          <div class="year-control">
            <div class="year-display" id="year-disp-${ID}">2024</div>
            <div class="year-slider-wrap">
              <input type="range" id="year-slider-${ID}"
                min="1980" max="2040" step="1" value="2024"
                aria-label="Vuosi">
              <div class="year-ticks">
                <span>1980</span><span>1990</span><span>2000</span>
                <span>2010</span><span>2020</span><span>2030</span><span>2040</span>
              </div>
            </div>
          </div>
          <div class="pyramid-legend">
            <span><i style="background:#4A7AA8"></i>0–19 v. (nuoret)</span>
            <span><i style="background:#3A7D62"></i>20–64 v. (työikäiset)</span>
            <span><i style="background:#B54040"></i>65+ v. (eläkeläiset)</span>
            <span style="color:rgba(200,168,75,0.7)">— — projektio (2025→)</span>
          </div>
        </div>

        <div class="right-col">
          <div class="ratio-card" id="ratio-card-${ID}">
            <div class="section-label" style="margin-bottom:10px">Huoltosuhde</div>
            <div class="ratio-big" id="ratio-val-${ID}">—</div>
            <div class="ratio-unit">eläkeläistä + lasta per 100 työikäistä</div>
            <div class="ratio-bar-wrap">
              <div class="ratio-bar" id="ratio-bar-${ID}"></div>
            </div>
            <div class="ratio-desc" id="ratio-desc-${ID}"></div>
          </div>

          <div class="stat-trio" id="stat-trio-${ID}">
            <div class="stat-mini young-color">
              <div class="sm-label">0–19 v.</div>
              <div class="sm-val" id="young-pct-${ID}">—</div>
              <div class="sm-sub">väestöstä</div>
            </div>
            <div class="stat-mini work-color">
              <div class="sm-label">20–64 v.</div>
              <div class="sm-val" id="work-pct-${ID}">—</div>
              <div class="sm-sub">väestöstä</div>
            </div>
            <div class="stat-mini elder-color">
              <div class="sm-label">65+ v.</div>
              <div class="sm-val" id="elder-pct-${ID}">—</div>
              <div class="sm-sub">väestöstä</div>
            </div>
          </div>
        </div>
      </div>

      <div class="section-label">02 · Huoltosuhteen kehitys 1980–2040</div>
      <div class="trend-wrap">
        <div id="trend-svg-${ID}"></div>
      </div>

      <div class="section-label">03 · Julkiset tulonsiirrot ikäryhmittäin</div>
      <div class="flow-wrap" id="flow-wrap-${ID}">
        <p style="font-size:12px;color:var(--muted);font-style:italic;margin:0 0 4px">
          Karkeasti arvioitu jakauma vuoden väestörakenteen mukaan. Siirrä pyramidin liukusäädintä nähdäksesi muutos.
        </p>
      </div>

      <div class="section-label">04 · Simulaattori: muuta rakennetta</div>
      <div class="sim-wrap">
        <p style="font-size:12px;color:var(--muted);font-style:italic;margin:0 0 4px">
          Miten eri muuttujat vaikuttavat huoltosuhteeseen vuoteen 2040 mennessä?
        </p>
        <div class="sim-grid">
          <div class="sim-ctrl">

            <div class="sim-item">
              <label>Eläkeiän muutos (nykyisestä 65 v.)</label>
              <div class="val-row">
                <span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted)">+0 v.</span>
                <span class="val-current" id="sim-retire-val-${ID}">+0 vuotta</span>
              </div>
              <input type="range" id="sim-retire-${ID}" min="0" max="5" step="0.5" value="0"
                aria-label="Eläkeiän muutos">
            </div>

            <div class="sim-item">
              <label>Syntyvyysmuutos (TFR nyt ~1.26)</label>
              <div class="val-row">
                <span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted)">+0.0</span>
                <span class="val-current" id="sim-tfr-val-${ID}">+0.0</span>
              </div>
              <input type="range" id="sim-tfr-${ID}" min="0" max="0.5" step="0.05" value="0"
                aria-label="TFR-muutos">
            </div>

            <div class="sim-item">
              <label>Nettomaahanmuutto (1000 hlö/v lisää)</label>
              <div class="val-row">
                <span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted)">+0k</span>
                <span class="val-current" id="sim-imm-val-${ID}">+0 000 / v</span>
              </div>
              <input type="range" id="sim-imm-${ID}" min="0" max="30" step="2" value="0"
                aria-label="Nettomaahanmuutto">
            </div>

          </div>

          <div class="sim-result" id="sim-result-${ID}">
            <div class="sim-result-row">
              <span class="sim-result-label">Huoltosuhde 2040</span>
              <span class="sim-result-val" id="sr-ratio-${ID}">82.6</span>
            </div>
            <div class="sim-result-row">
              <span class="sim-result-label">Tilanne</span>
              <span class="sim-result-val bad" id="sr-label-${ID}">Kriittinen</span>
            </div>
            <div class="sim-result-row">
              <span class="sim-result-label">Vertailu: perusennuste</span>
              <span class="sim-result-val" id="sr-delta-${ID}">—</span>
            </div>
          </div>
        </div>
      </div>

      <div class="insight" id="insight-${ID}"></div>
      <div class="source" id="source-${ID}"></div>
    </section>
  `;

  const root = host.querySelector(`.plugin-${ID}`);

  try {
    // Yritä ladata oikeaa dataa
    let popData = null;
    try {
      popData = await core.data.load("population_pyramid_historical.json");
      if (popData) console.log("[moduli012] väestödata ladattu:", popData.length);
    } catch(e) { console.warn("[moduli012] käytetään sisäänrakennettua dataa"); }

    // Tooltip
    const tip = makeTip();
    _tips.push(tip);

    // ── Pyramidi ──
    let currentYear = 2024;
    const pyramidContainer = root.querySelector(`#pyramid-svg-${ID}`);
    const yearDisp  = root.querySelector(`#year-disp-${ID}`);
    const yearSlider = root.querySelector(`#year-slider-${ID}`);
    const ratioVal  = root.querySelector(`#ratio-val-${ID}`);
    const ratioBar  = root.querySelector(`#ratio-bar-${ID}`);
    const ratioDesc = root.querySelector(`#ratio-desc-${ID}`);
    const youngPct  = root.querySelector(`#young-pct-${ID}`);
    const workPct   = root.querySelector(`#work-pct-${ID}`);
    const elderPct  = root.querySelector(`#elder-pct-${ID}`);

    function updatePyramid(year) {
      pyramidContainer.innerHTML = "";
      drawPyramid(pyramidContainer, year, tip);

      const stats = calcStats(year);
      yearDisp.textContent = year + (stats.isProjection ? "*" : "");
      ratioVal.textContent = stats.ratio;

      // Väri huoltosuhteen mukaan
      const ratioNum = parseFloat(stats.ratio);
      const barColor = ratioNum > 75 ? "#B54040" : ratioNum > 60 ? "#C8A84B" : "#3A7D62";
      const barWidth = Math.min(100, ratioNum / 90 * 100);
      ratioBar.style.width = barWidth + "%";
      ratioBar.style.background = barColor;

      ratioDesc.textContent = ratioNum > 75
        ? "Kriittinen: liian harva kantaa liian monen taakkaa."
        : ratioNum > 60
        ? "Haastava: kasvava paine julkiselle taloudelle."
        : "Kohtuullinen: väestörakenne vielä tasapainossa.";

      youngPct.textContent  = stats.youngPct + " %";
      workPct.textContent   = stats.workPct  + " %";
      elderPct.textContent  = stats.elderPct + " %";

      // Päivitä rahavirrat samalla
      const flowWrap = root.querySelector(`#flow-wrap-${ID}`);
      drawFlows(d3.select(flowWrap), year);

      // Insight
      updateInsight(year, stats);
    }

    function updateInsight(year, stats) {
      const el = root.querySelector(`#insight-${ID}`);
      const ratio = parseFloat(stats.ratio);
      const proj  = year > 2024 ? " (projektio)" : "";
      el.innerHTML = `
        <strong>Analyysi · ${year}${proj}:</strong>
        Suomessa on ${year}${proj} arviolta <strong>${Math.round(parseFloat(stats.elderPct))} % yli 65-vuotiaita</strong>
        — kun vuonna 1980 luku oli noin 12 %. Huoltosuhde on <strong>${ratio}</strong>,
        eli jokaista 100 työikäistä kohden on ${ratio} lasta tai eläkeläistä.
        ${ratio > 75
          ? `Tämä on <strong>kriittinen taso</strong>: pohjoismainen normi on noin 50–60. Eläkejärjestelmä ja hoivapalvelut ovat kasvavassa paineessa.`
          : ratio > 60
          ? `Taso on <strong>kohonnut</strong> mutta vielä hallittavissa — jos tuottavuus ja työllisyysaste pysyvät korkeina.`
          : `Rakenne on <strong>kohtuullisen tasapainossa</strong> — suurten ikäluokkien eläköityminen on vielä edessä.`
        }
      `;
    }

    // ── Huoltosuhde-trendi ──
    const trendContainer = root.querySelector(`#trend-svg-${ID}`);
    drawRatioTrend(trendContainer, currentYear, tip);

    // ── Simulaattori ──
    function updateSim() {
      const retireAge  = parseFloat(root.querySelector(`#sim-retire-${ID}`).value);
      const tfrChange  = parseFloat(root.querySelector(`#sim-tfr-${ID}`).value);
      const immigr     = parseFloat(root.querySelector(`#sim-imm-${ID}`).value);

      root.querySelector(`#sim-retire-val-${ID}`).textContent =
        retireAge === 0 ? "ei muutosta" : `+${retireAge} vuotta`;
      root.querySelector(`#sim-tfr-val-${ID}`).textContent =
        tfrChange === 0 ? "ei muutosta" : `+${tfrChange.toFixed(2)}`;
      root.querySelector(`#sim-imm-val-${ID}`).textContent =
        immigr === 0 ? "ei muutosta" : `+${immigr} 000 / vuosi`;

      const result = calcSimulator(retireAge, tfrChange, immigr);
      root.querySelector(`#sr-ratio-${ID}`).textContent  = result.ratio;
      root.querySelector(`#sr-ratio-${ID}`).className    = `sim-result-val ${result.statusClass}`;
      root.querySelector(`#sr-label-${ID}`).textContent  = result.label;
      root.querySelector(`#sr-label-${ID}`).className    = `sim-result-val ${result.statusClass}`;

      const delta = (parseFloat(result.ratio) - 82.6).toFixed(1);
      const dEl   = root.querySelector(`#sr-delta-${ID}`);
      dEl.textContent  = `${delta > 0 ? "+" : ""}${delta} vs. 82.6`;
      dEl.className    = `sim-result-val ${parseFloat(delta) < 0 ? "good" : "bad"}`;
    }

    ["sim-retire","sim-tfr","sim-imm"].forEach(id => {
      root.querySelector(`#${id}-${ID}`)?.addEventListener("input", updateSim);
    });
    updateSim();

    // ── Vuosisäädin ──
    yearSlider.addEventListener("input", e => {
      currentYear = parseInt(e.target.value, 10);
      updatePyramid(currentYear);
    });

    updatePyramid(currentYear);

    // Lähde
    root.querySelector(`#source-${ID}`).textContent =
      `Lähteet: Tilastokeskus · THL · Kelan tilastot · Eläketurvakeskus · ` +
      `Väestöennuste: SVT / Tilastokeskus 2024 · * = projektio · Rahavirrat suuntaa-antavia arvioita`;

    requestAnimationFrame(() => root.classList.add("is-mounted"));

  } catch(err) {
    console.error("[moduli012] virhe:", err);
    root.innerHTML = `<div style="padding:24px;color:#B54040;font-family:'JetBrains Mono',monospace">
      <strong>Virhe lisäosassa:</strong><br>${err.message}
    </div>`;
  }
}

function unmount(host) {
  _tips.forEach(t => { try { t.destroy(); } catch {} });
  _tips = [];
  if (host) host.innerHTML = "";
}

export default { id: ID, mount, unmount };
