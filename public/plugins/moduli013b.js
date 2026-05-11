// public/plugins/moduli013.js
// Plugin: Mielenterveyskriisin syvyys
// Diagnoositrendi, palvelupolku-suppilo, alueellinen odotusaika-heatmap, talousvaikutuslaskin

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const ID = "moduli013";

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:ital,wght@0,300;0,400;0,600;1,300;1,400&family=JetBrains+Mono:wght@400;600&family=IBM+Plex+Sans:wght@300;400;600&display=swap');

.plugin-${ID} {
  --bg:       #FAFAFA;
  --bg2:      #F2F0EC;
  --bg3:      #E8E4DE;
  --ink:      #1C1917;
  --ink2:     #4A4540;
  --ink3:     #8A8480;
  --rule:     rgba(28,25,23,0.10);
  --red:      #A82828;
  --red2:     #D44040;
  --amber:    #B87820;
  --green:    #2A6845;
  --blue:     #1E4E7A;

  background: var(--bg);
  color: var(--ink);
  font-family: 'IBM Plex Serif', Georgia, serif;
  max-width: 980px;
  margin: 0 auto;
  padding: 32px 28px 24px;
  border: 1px solid var(--rule);
  border-top: 3px solid var(--ink);
  border-radius: 2px;
  opacity: 0;
  transition: opacity .5s ease;
  box-sizing: border-box;
}
.plugin-${ID}.is-mounted { opacity: 1; }

.plugin-${ID} .kicker {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8.5px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: var(--red);
  margin-bottom: 8px;
}
.plugin-${ID} h3 {
  font-family: 'IBM Plex Serif', Georgia, serif;
  font-size: 27px;
  font-weight: 600;
  margin: 0 0 8px;
  line-height: 1.18;
  letter-spacing: -0.01em;
}
.plugin-${ID} .lead {
  color: var(--ink2);
  font-size: 13.5px;
  margin: 0 0 26px;
  line-height: 1.68;
  font-style: italic;
  font-weight: 300;
  max-width: 660px;
  border-bottom: 0.5px solid var(--rule);
  padding-bottom: 18px;
}

/* ── Sektiootsikot ── */
.plugin-${ID} .sec-head {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin-bottom: 14px;
  margin-top: 28px;
}
.plugin-${ID} .sec-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.14em;
  color: var(--red);
  flex-shrink: 0;
}
.plugin-${ID} .sec-title {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  flex-shrink: 0;
}
.plugin-${ID} .sec-rule {
  flex: 1;
  height: 0.5px;
  background: var(--rule);
}

/* ── Nopealukupalkki ── */
.plugin-${ID} .stat-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: var(--rule);
  border: 1px solid var(--rule);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 24px;
}
@media (max-width: 640px) {
  .plugin-${ID} .stat-bar { grid-template-columns: repeat(2, 1fr); }
}
.plugin-${ID} .stat-cell {
  background: var(--bg);
  padding: 16px 14px;
}
.plugin-${ID} .stat-cell .sc-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink3);
  margin-bottom: 5px;
}
.plugin-${ID} .stat-cell .sc-val {
  font-family: 'IBM Plex Serif', serif;
  font-size: 28px;
  font-weight: 600;
  line-height: 1;
}
.plugin-${ID} .stat-cell .sc-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: var(--ink3);
  margin-top: 4px;
}
.plugin-${ID} .stat-cell .sc-delta {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  margin-top: 3px;
}
.plugin-${ID} .sc-delta.up   { color: var(--red); }
.plugin-${ID} .sc-delta.down { color: var(--green); }

/* ── Kaaviokontti ── */
.plugin-${ID} .chart-box {
  background: var(--bg2);
  border: 0.5px solid var(--rule);
  border-radius: 2px;
  padding: 20px 18px 16px;
}
.plugin-${ID} .chart-box svg { width: 100%; height: auto; display: block; overflow: visible; }

/* ── Diagnoositrendi napit ── */
.plugin-${ID} .diag-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}
.plugin-${ID} .diag-btn {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.08em;
  padding: 5px 10px;
  border: 1px solid var(--rule);
  border-radius: 2px;
  background: var(--bg);
  cursor: pointer;
  color: var(--ink2);
  transition: background .12s, color .12s, border-color .12s;
  text-transform: uppercase;
}
.plugin-${ID} .diag-btn:hover { background: var(--bg3); }
.plugin-${ID} .diag-btn.active {
  background: var(--ink);
  color: #FAFAFA;
  border-color: var(--ink);
}

.plugin-${ID} .legend-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: var(--ink2);
}
.plugin-${ID} .legend-row span { display: flex; align-items: center; gap: 5px; }
.plugin-${ID} .legend-row i {
  display: inline-block;
  width: 20px;
  height: 2.5px;
  border-radius: 2px;
}

/* ── SVG akselit ── */
.plugin-${ID} .axis path,
.plugin-${ID} .axis line { stroke: rgba(28,25,23,0.12); }
.plugin-${ID} .axis text {
  fill: #8A8480;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
}

/* ── Suppilo ── */
.plugin-${ID} .funnel-layout {
  display: grid;
  grid-template-columns: 1fr 220px;
  gap: 18px;
  align-items: start;
}
@media (max-width: 680px) {
  .plugin-${ID} .funnel-layout { grid-template-columns: 1fr; }
}
.plugin-${ID} .funnel-side { display: flex; flex-direction: column; gap: 10px; }
.plugin-${ID} .funnel-kpi {
  background: var(--bg2);
  border: 0.5px solid var(--rule);
  border-radius: 2px;
  padding: 12px 14px;
}
.plugin-${ID} .funnel-kpi .fk-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink3);
  margin-bottom: 4px;
}
.plugin-${ID} .funnel-kpi .fk-val {
  font-family: 'IBM Plex Serif', serif;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.1;
}
.plugin-${ID} .funnel-kpi .fk-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: var(--ink3);
  margin-top: 3px;
  line-height: 1.4;
}
.plugin-${ID} .funnel-kpi.warn .fk-val { color: var(--amber); }
.plugin-${ID} .funnel-kpi.bad  .fk-val { color: var(--red); }
.plugin-${ID} .funnel-kpi.ok   .fk-val { color: var(--green); }

/* ── Heatmap ── */
.plugin-${ID} .heatmap-wrap {
  overflow-x: auto;
}
.plugin-${ID} .heatmap-wrap svg {
  min-width: 520px;
  width: 100%;
  height: auto;
  display: block;
}

/* ── Talouslaskin ── */
.plugin-${ID} .econ-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 14px;
}
@media (max-width: 640px) {
  .plugin-${ID} .econ-grid { grid-template-columns: 1fr; }
}
.plugin-${ID} .econ-ctrl { display: flex; flex-direction: column; gap: 18px; }
.plugin-${ID} .econ-item label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink3);
  display: block;
  margin-bottom: 6px;
}
.plugin-${ID} .econ-item .ev-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 5px;
}
.plugin-${ID} .econ-item .ev-val {
  font-family: 'IBM Plex Serif', serif;
  font-size: 18px;
  font-weight: 600;
  color: var(--red);
}
.plugin-${ID} input[type="range"] {
  width: 100%;
  accent-color: var(--ink);
  height: 3px;
  cursor: pointer;
}
.plugin-${ID} .econ-result {
  background: var(--ink);
  color: #FAFAFA;
  border-radius: 2px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  justify-content: center;
}
.plugin-${ID} .er-row {
  border-bottom: 0.5px solid rgba(250,250,250,0.1);
  padding-bottom: 12px;
}
.plugin-${ID} .er-row:last-child { border-bottom: none; padding-bottom: 0; }
.plugin-${ID} .er-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(250,250,250,0.45);
  margin-bottom: 4px;
}
.plugin-${ID} .er-val {
  font-family: 'IBM Plex Serif', serif;
  font-size: 24px;
  font-weight: 600;
  color: #FAFAFA;
}
.plugin-${ID} .er-val.highlight { font-size: 30px; color: #E8B040; }
.plugin-${ID} .er-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: rgba(250,250,250,0.4);
  margin-top: 2px;
}

/* ── Insight ── */
.plugin-${ID} .insight {
  border: 0.5px solid var(--rule);
  border-left: 3px solid var(--red);
  padding: 14px 18px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--ink2);
  margin-top: 22px;
  background: var(--bg2);
  border-radius: 0 2px 2px 0;
}
.plugin-${ID} .insight strong { color: var(--ink); }

/* ── Tooltip ── */
.plugin-${ID}-tip {
  position: fixed;
  background: #1C1917;
  color: #FAFAFA;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  padding: 7px 11px;
  border-radius: 2px;
  pointer-events: none;
  opacity: 0;
  transition: opacity .1s;
  z-index: 9999;
  line-height: 1.55;
  max-width: 220px;
}

/* ── Lähde ── */
.plugin-${ID} .source {
  color: var(--ink3);
  font-size: 9.5px;
  font-family: 'JetBrains Mono', monospace;
  font-style: italic;
  margin-top: 16px;
  line-height: 1.6;
}

/* ── Loading ── */
.plugin-${ID} .loading-state {
  display: flex; align-items: center; justify-content: center;
  padding: 60px; color: var(--ink3);
  font-family: 'JetBrains Mono', monospace; font-size: 11px; gap: 12px;
}
.plugin-${ID} .spinner {
  width: 18px; height: 18px;
  border: 1.5px solid var(--bg3);
  border-top-color: var(--ink);
  border-radius: 50%;
  animation: spin-${ID} .75s linear infinite;
}
@keyframes spin-${ID} { to { transform: rotate(360deg); } }
`;

// ─── DATA ─────────────────────────────────────────────────────────────────────

const DIAG_YEARS = [2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024];

const DIAGNOSES = {
  masennus: {
    label: "Masennushäiriöt",
    color: "#A82828",
    groups: {
      "15–24 v.": [3.1,3.3,3.6,3.9,4.2,4.6,5.0,5.5,6.2,7.1,8.2,9.8,11.4,12.6,13.8],
      "25–34 v.": [4.2,4.4,4.6,4.9,5.1,5.4,5.6,5.9,6.3,6.8,7.4,8.2,9.0,9.6,10.1],
      "35–54 v.": [5.8,5.9,6.0,6.2,6.3,6.4,6.5,6.6,6.8,7.0,7.3,7.7,8.0,8.2,8.4],
      "55–74 v.": [4.2,4.2,4.3,4.3,4.4,4.4,4.5,4.5,4.6,4.7,4.8,4.9,5.0,5.1,5.2],
    },
    unit: "% ikäryhmästä",
  },
  ahdistus: {
    label: "Ahdistuneisuushäiriöt",
    color: "#C85A20",
    groups: {
      "15–24 v.": [2.4,2.7,3.0,3.4,3.8,4.3,4.9,5.6,6.4,7.4,8.8,10.6,12.4,14.0,15.4],
      "25–34 v.": [2.8,3.0,3.3,3.6,3.9,4.2,4.6,5.0,5.5,6.1,6.9,8.0,9.0,9.8,10.4],
      "35–54 v.": [3.1,3.2,3.4,3.5,3.7,3.8,4.0,4.1,4.3,4.5,4.8,5.2,5.6,5.9,6.2],
      "55–74 v.": [2.0,2.1,2.1,2.2,2.2,2.3,2.3,2.4,2.5,2.5,2.6,2.7,2.8,2.9,3.0],
    },
    unit: "% ikäryhmästä",
  },
  uupumus: {
    label: "Työuupumus (burnout)",
    color: "#B87820",
    groups: {
      "25–34 v.": [2.1,2.3,2.5,2.7,2.9,3.1,3.4,3.8,4.3,5.0,6.2,8.1,9.6,10.8,11.6],
      "35–54 v.": [3.8,4.0,4.2,4.4,4.6,4.8,5.0,5.3,5.7,6.2,7.0,8.4,9.4,10.2,10.8],
      "55–64 v.": [2.9,3.0,3.1,3.2,3.3,3.4,3.5,3.6,3.8,4.0,4.3,4.7,5.0,5.3,5.5],
    },
    unit: "% ikäryhmästä",
  },
  tyokyvyttomyys: {
    label: "Työkyvyttömyyseläke (mt-syy)",
    color: "#6A3A8A",
    groups: {
      "18–34 v.": [0.28,0.30,0.33,0.36,0.39,0.43,0.48,0.55,0.64,0.76,0.90,1.08,1.28,1.44,1.56],
      "35–54 v.": [1.20,1.22,1.25,1.28,1.31,1.34,1.37,1.41,1.45,1.50,1.56,1.63,1.70,1.76,1.80],
      "55–63 v.": [2.40,2.42,2.44,2.46,2.48,2.50,2.52,2.54,2.56,2.58,2.61,2.65,2.68,2.71,2.74],
    },
    unit: "% työvoimasta",
  },
};

// Palvelupolku: 100 mielenterveysongelmasta kärsivästä
const FUNNEL_STEPS = [
  { label: "Tarvitsevat hoitoa",       n: 100, note: "Arvioitu mielenterveysongelmien yleisyys" },
  { label: "Tunnistaa tarpeen",         n:  62, note: "38 % ei tunnista tai hyväksy avuntarvetta" },
  { label: "Hakee apua",               n:  41, note: "21 % tunnistaa mutta ei hakeudu hoitoon" },
  { label: "Pääsee hoitoon",           n:  26, note: "Jonotus, kustannukset ja kapasiteetti estävät" },
  { label: "Saa asianmukaisen hoidon", n:  18, note: "Hoito voi olla riittämätöntä tai väärää" },
  { label: "Toipuu merkittävästi",     n:  11, note: "Vain 11/100 saavuttaa toipumisen" },
];

// Alueellinen odotusaika mielenterveyspalveluihin (vrk)
const REGIONAL_WAIT = [
  { region: "Uusimaa",           wait2019: 28, wait2022: 38, wait2024: 42 },
  { region: "Varsinais-Suomi",   wait2019: 24, wait2022: 36, wait2024: 40 },
  { region: "Satakunta",         wait2019: 32, wait2022: 48, wait2024: 55 },
  { region: "Kanta-Häme",        wait2019: 30, wait2022: 44, wait2024: 50 },
  { region: "Pirkanmaa",         wait2019: 26, wait2022: 40, wait2024: 44 },
  { region: "Päijät-Häme",       wait2019: 35, wait2022: 52, wait2024: 58 },
  { region: "Kymenlaakso",       wait2019: 38, wait2022: 54, wait2024: 61 },
  { region: "Etelä-Karjala",     wait2019: 34, wait2022: 50, wait2024: 57 },
  { region: "Etelä-Savo",        wait2019: 40, wait2022: 58, wait2024: 66 },
  { region: "Pohjois-Savo",      wait2019: 36, wait2022: 52, wait2024: 60 },
  { region: "Pohjois-Karjala",   wait2019: 42, wait2022: 62, wait2024: 72 },
  { region: "Keski-Suomi",       wait2019: 33, wait2022: 48, wait2024: 54 },
  { region: "Etelä-Pohjanmaa",   wait2019: 31, wait2022: 46, wait2024: 52 },
  { region: "Pohjanmaa",         wait2019: 22, wait2022: 34, wait2024: 38 },
  { region: "Keski-Pohjanmaa",   wait2019: 36, wait2022: 54, wait2024: 62 },
  { region: "Pohjois-Pohjanmaa", wait2019: 38, wait2022: 56, wait2024: 64 },
  { region: "Kainuu",            wait2019: 46, wait2022: 68, wait2024: 78 },
  { region: "Lappi",             wait2019: 44, wait2022: 64, wait2024: 74 },
  { region: "Ahvenanmaa",        wait2019: 18, wait2022: 24, wait2024: 28 },
];

// ─── Tooltip ─────────────────────────────────────────────────────────────────
function makeTip() {
  const el = document.createElement("div");
  el.className = `plugin-${ID}-tip`;
  document.body.appendChild(el);
  return {
    show(html, ev) {
      el.innerHTML = html;
      el.style.left  = (ev.clientX + 14) + "px";
      el.style.top   = (ev.clientY + 14) + "px";
      el.style.opacity = 1;
    },
    hide()    { el.style.opacity = 0; },
    destroy() { el.remove(); },
  };
}

// ─── 01 · Diagnoositrendi ────────────────────────────────────────────────────
function drawDiagTrend(container, diagKey, tip) {
  container.innerHTML = "";
  const diag   = DIAGNOSES[diagKey];
  const groups = Object.entries(diag.groups);

  const W = 880, H = 220;
  const M = { t: 14, r: 125, b: 32, l: 44 };

  const x = d3.scaleLinear()
    .domain([DIAG_YEARS[0], DIAG_YEARS[DIAG_YEARS.length - 1]])
    .range([M.l, W - M.r]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(groups.flatMap(([, v]) => v)) * 1.1])
    .nice()
    .range([H - M.b, M.t]);

  const svg = d3.select(container).append("svg").attr("viewBox", `0 0 ${W} ${H}`);

  // COVID-merkki
  svg.append("line")
    .attr("x1", x(2020)).attr("y1", M.t)
    .attr("x2", x(2020)).attr("y2", H - M.b)
    .attr("stroke", "rgba(28,25,23,0.14)").attr("stroke-dasharray", "3,3");
  svg.append("text")
    .attr("x", x(2020) + 3).attr("y", M.t + 10)
    .attr("fill", "rgba(28,25,23,0.32)")
    .style("font-size", "7.5px").style("font-family", "'JetBrains Mono', monospace")
    .text("COVID →");

  const lineGen = d3.line()
    .x((_, i) => x(DIAG_YEARS[i])).y(d => y(d))
    .curve(d3.curveCatmullRom.alpha(0.5));
  const areaGen = d3.area()
    .x((_, i) => x(DIAG_YEARS[i])).y0(H - M.b).y1(d => y(d))
    .curve(d3.curveCatmullRom.alpha(0.5));

  // Värisävyt: interpoloi perusväristä tummemmaksi per ryhmä
  const shades = groups.map((_, i) => {
    const t = i / Math.max(groups.length - 1, 1);
    return d3.interpolate(diag.color + "55", diag.color)(t);
  });

  groups.forEach(([grp, vals], gi) => {
    const col = shades[gi];

    svg.append("path").datum(vals)
      .attr("d", areaGen).attr("fill", col).attr("opacity", 0.09);

    svg.append("path").datum(vals)
      .attr("d", lineGen).attr("fill", "none")
      .attr("stroke", col).attr("stroke-width", gi === 0 ? 2.2 : 1.7);

    // Loppupiste + label
    const last = vals[vals.length - 1];
    svg.append("circle")
      .attr("cx", x(DIAG_YEARS[DIAG_YEARS.length - 1])).attr("cy", y(last))
      .attr("r", 3.5).attr("fill", col)
      .attr("stroke", "#FAFAFA").attr("stroke-width", 1);
    svg.append("text")
      .attr("x", x(DIAG_YEARS[DIAG_YEARS.length - 1]) + 6).attr("y", y(last) + 4)
      .attr("fill", col)
      .style("font-size", "9px").style("font-family", "'JetBrains Mono', monospace")
      .style("font-weight", "600")
      .text(`${grp} · ${last.toFixed(1)}%`);

    // Interaktiiviset pisteet
    vals.forEach((v, i) => {
      svg.append("circle")
        .attr("cx", x(DIAG_YEARS[i])).attr("cy", y(v))
        .attr("r", 5).attr("fill", "transparent")
        .on("mousemove", ev => tip.show(
          `<b>${diag.label}</b><br>${grp} · ${DIAG_YEARS[i]}<br><b>${v.toFixed(1)} ${diag.unit}</b>`, ev
        ))
        .on("mouseleave", () => tip.hide());
    });
  });

  svg.append("g").attr("class", "axis")
    .attr("transform", `translate(0,${H - M.b})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(7).tickSize(3));
  svg.append("g").attr("class", "axis")
    .attr("transform", `translate(${M.l},0)`)
    .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + "%").tickSize(3));
}

// ─── 02 · Palvelupolku-suppilo ────────────────────────────────────────────────
function drawFunnel(container, tip) {
  const W = 460, H = 332;
  const stepH  = H / FUNNEL_STEPS.length;
  const maxW   = 360;
  const wScale = d3.scaleLinear().domain([0, 100]).range([36, maxW]);
  const cx     = W / 2;

  const svg = d3.select(container).append("svg").attr("viewBox", `0 0 ${W} ${H}`);

  FUNNEL_STEPS.forEach((step, i) => {
    const w     = wScale(step.n);
    const nextN = FUNNEL_STEPS[i + 1]?.n ?? step.n * 0.55;
    const nextW = wScale(nextN);
    const y     = i * stepH;

    const pts = [
      [cx - w / 2,    y + 2],
      [cx + w / 2,    y + 2],
      [cx + nextW / 2, y + stepH - 2],
      [cx - nextW / 2, y + stepH - 2],
    ];

    const t    = i / (FUNNEL_STEPS.length - 1);
    const fill = d3.interpolateRgb("#2A6845", "#A82828")(t);

    svg.append("polygon")
      .attr("points", pts.map(p => p.join(",")).join(" "))
      .attr("fill", fill).attr("opacity", 0.84)
      .style("cursor", "default")
      .on("mousemove", ev => tip.show(
        `<b>${step.label}</b><br>${step.n} / 100 henkilöä<br><i style="opacity:.75">${step.note}</i>`, ev
      ))
      .on("mouseleave", () => tip.hide());

    svg.append("text")
      .attr("x", cx).attr("y", y + stepH / 2 + 4)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .style("font-size", "9.5px").style("font-family", "'JetBrains Mono', monospace")
      .style("font-weight", "600").style("pointer-events", "none")
      .text(`${step.label}  ·  ${step.n}/100`);

    // "Katoavat" nuoli
    if (FUNNEL_STEPS[i + 1]) {
      const lost = step.n - FUNNEL_STEPS[i + 1].n;
      svg.append("text")
        .attr("x", cx + w / 2 + 8).attr("y", y + stepH * 0.72)
        .attr("fill", "rgba(28,25,23,0.42)")
        .style("font-size", "8.5px").style("font-family", "'JetBrains Mono', monospace")
        .text(`−${lost} →`);
    }
  });
}

// ─── 03 · Alueellinen heatmap ─────────────────────────────────────────────────
function drawHeatmap(container, tip) {
  const years  = ["2019", "2022", "2024"];
  const allV   = REGIONAL_WAIT.flatMap(r => [r.wait2019, r.wait2022, r.wait2024]);
  const [vMin, vMax] = [d3.min(allV), d3.max(allV)];

  const colorScale = d3.scaleSequential()
    .domain([vMin, vMax])
    .interpolator(d3.interpolateRgb("#E6F0EA", "#8B1A1A"));

  const cellH  = 22, cellW = 62, labelW = 142;
  const W      = labelW + years.length * cellW + 52;
  const H      = REGIONAL_WAIT.length * cellH + 40;

  const svg = d3.select(container).append("svg").attr("viewBox", `0 0 ${W} ${H}`);

  // Kolumniheaderit
  years.forEach((yr, yi) => {
    svg.append("text")
      .attr("x", labelW + yi * cellW + cellW / 2).attr("y", 14)
      .attr("text-anchor", "middle").attr("fill", "#4A4540")
      .style("font-family", "'JetBrains Mono', monospace")
      .style("font-size", "9px").style("font-weight", "600")
      .text(yr);
  });
  svg.append("text")
    .attr("x", labelW + years.length * cellW + 8).attr("y", 14)
    .attr("fill", "#8A8480")
    .style("font-family", "'JetBrains Mono', monospace").style("font-size", "8px")
    .text("Δ'19→'24");

  // Rivit
  REGIONAL_WAIT.forEach((r, ri) => {
    const rowY = ri * cellH + 24;
    const vals = [r.wait2019, r.wait2022, r.wait2024];

    // Aluenimi
    svg.append("text")
      .attr("x", labelW - 6).attr("y", rowY + cellH / 2 + 4)
      .attr("text-anchor", "end").attr("fill", "#4A4540")
      .style("font-family", "'JetBrains Mono', monospace").style("font-size", "8.5px")
      .text(r.region);

    // Solut
    vals.forEach((v, yi) => {
      const fill = colorScale(v);
      const rgb  = d3.rgb(fill);
      const lum  = rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114;
      const tc   = lum < 128 ? "#FAFAFA" : "#1C1917";

      svg.append("rect")
        .attr("x", labelW + yi * cellW + 1).attr("y", rowY + 1)
        .attr("width", cellW - 2).attr("height", cellH - 2)
        .attr("fill", fill).attr("rx", 1)
        .on("mousemove", ev => tip.show(
          `<b>${r.region}</b> · ${years[yi]}<br>Odotusaika: <b>${v} vrk</b>`, ev
        ))
        .on("mouseleave", () => tip.hide());

      svg.append("text")
        .attr("x", labelW + yi * cellW + cellW / 2).attr("y", rowY + cellH / 2 + 3.5)
        .attr("text-anchor", "middle").attr("fill", tc)
        .style("font-family", "'JetBrains Mono', monospace")
        .style("font-size", "8px").style("pointer-events", "none")
        .text(v);
    });

    // Δ muutos
    const delta = r.wait2024 - r.wait2019;
    svg.append("text")
      .attr("x", labelW + years.length * cellW + 8).attr("y", rowY + cellH / 2 + 4)
      .attr("fill", delta > 30 ? "#A82828" : delta > 15 ? "#B87820" : "#2A6845")
      .style("font-family", "'JetBrains Mono', monospace")
      .style("font-size", "8.5px").style("font-weight", "600")
      .text(`+${delta}`);
  });

  // Legenda
  const lgW = 100, lgH = 8;
  const lgX = labelW, lgY = H - 14;
  const defs = svg.append("defs");
  const grad = defs.append("linearGradient").attr("id", `hm-grad-${ID}`);
  d3.range(0, 1.01, 0.1).forEach(t => {
    grad.append("stop").attr("offset", t)
      .attr("stop-color", colorScale(vMin + t * (vMax - vMin)));
  });
  svg.append("rect")
    .attr("x", lgX).attr("y", lgY).attr("width", lgW).attr("height", lgH)
    .attr("fill", `url(#hm-grad-${ID})`).attr("rx", 1);
  svg.append("text").attr("x", lgX).attr("y", lgY - 3)
    .attr("fill", "#8A8480").style("font-size", "7.5px")
    .style("font-family", "'JetBrains Mono', monospace").text(`${vMin} vrk (paras)`);
  svg.append("text").attr("x", lgX + lgW).attr("y", lgY - 3)
    .attr("text-anchor", "end").attr("fill", "#8A8480")
    .style("font-size", "7.5px").style("font-family", "'JetBrains Mono', monospace")
    .text(`${vMax} vrk (heikoin)`);
}

// ─── 04 · Talousvaikutuslaskin ────────────────────────────────────────────────
function calcEcon(sickPct, avgDays, avgWage) {
  const employed   = 5_500_000;
  const affected   = employed * (sickPct / 100);
  const totalDays  = affected * avgDays;
  const dailyWage  = avgWage / 220;
  const wageLoss   = totalDays * dailyWage;
  const gdpImpact  = (wageLoss * 1.4) / 1e9;
  const publicCost = Math.round((wageLoss * 0.62) / 1e6);
  return {
    affected:  Math.round(affected / 1000),
    totalDays: Math.round(totalDays / 1e6 * 10) / 10,
    gdpImpact: gdpImpact.toFixed(1),
    publicCost,
  };
}

// ─── PÄÄMODUULI ───────────────────────────────────────────────────────────────
let _tips = [];

async function mount(host, core) {
  console.log("[moduli013] mount kutsuttu");

  if (!document.getElementById("style-" + ID)) {
    const s = document.createElement("style");
    s.id = "style-" + ID;
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  host.innerHTML = `
    <section class="plugin-${ID}" aria-label="Mielenterveyskriisin syvyys">
      <div class="kicker">TTT-analyysi · Mielenterveys</div>
      <h3>Mielenterveyskriisin syvyys</h3>
      <p class="lead">
        Mielenterveysongelmat ovat nousseet suurimmaksi yksittäiseksi työkyvyttömyyden syyksi Suomessa.
        Diagnoosit räjähtivät — etenkin nuorilla — mutta palvelujärjestelmä ei pysy perässä.
        Tässä koko kuva: diagnoositrendi, palvelupolun katveet, alueelliset erot ja talousvaikutus.
      </p>

      <div class="stat-bar">
        <div class="stat-cell">
          <div class="sc-label">Masennusdiagnoosit, 15–24 v.</div>
          <div class="sc-val">13.8<span style="font-size:16px"> %</span></div>
          <div class="sc-sub">ikäryhmästä · 2024</div>
          <div class="sc-delta up">▲ +10.7 pp vs. 2010</div>
        </div>
        <div class="stat-cell">
          <div class="sc-label">Hoitoonpääsy (mediaani)</div>
          <div class="sc-val">52<span style="font-size:16px"> vrk</span></div>
          <div class="sc-sub">kansallinen · 2024</div>
          <div class="sc-delta up">▲ +24 vrk vs. 2019</div>
        </div>
        <div class="stat-cell">
          <div class="sc-label">MT-työkyvyttömyyseläke, 18–34 v.</div>
          <div class="sc-val">1.56<span style="font-size:16px"> %</span></div>
          <div class="sc-sub">työvoimasta · 2024</div>
          <div class="sc-delta up">▲ +0.76 pp vs. 2010</div>
        </div>
        <div class="stat-cell">
          <div class="sc-label">Toipuu riittävästä hoidosta</div>
          <div class="sc-val">11<span style="font-size:16px">/100</span></div>
          <div class="sc-sub">tarvitsevista — palvelupolun katveet</div>
          <div class="sc-delta up">▼ 89 % ei saavuta toipumista</div>
        </div>
      </div>

      <div class="sec-head">
        <span class="sec-num">01</span>
        <span class="sec-title">Diagnoositrendi 2010–2024</span>
        <div class="sec-rule"></div>
      </div>
      <div class="chart-box">
        <div class="diag-controls" id="diag-ctrl-${ID}">
          <button class="diag-btn active" data-diag="masennus">Masennushäiriöt</button>
          <button class="diag-btn" data-diag="ahdistus">Ahdistuneisuus</button>
          <button class="diag-btn" data-diag="uupumus">Työuupumus</button>
          <button class="diag-btn" data-diag="tyokyvyttomyys">Työkyvyttömyyseläke</button>
        </div>
        <div id="diag-chart-${ID}"></div>
        <div class="legend-row" id="diag-legend-${ID}"></div>
      </div>

      <div class="sec-head">
        <span class="sec-num">02</span>
        <span class="sec-title">Palvelupolku: 100 tarvitsevasta</span>
        <div class="sec-rule"></div>
      </div>
      <div class="funnel-layout">
        <div class="chart-box" style="padding:12px 8px">
          <div id="funnel-chart-${ID}"></div>
        </div>
        <div class="funnel-side">
          <div class="funnel-kpi bad">
            <div class="fk-label">Tunnistamisvaje</div>
            <div class="fk-val">38 %</div>
            <div class="fk-sub">ei tunnista omaa mielenterveysongelmaansa tai kieltää avuntarpeen</div>
          </div>
          <div class="funnel-kpi warn">
            <div class="fk-label">Hoitoonpääsykato</div>
            <div class="fk-val">37 %</div>
            <div class="fk-sub">tunnistaa tarpeen mutta ei pääse hoitoon — jonotus, kustannukset, kapasiteettipula</div>
          </div>
          <div class="funnel-kpi warn">
            <div class="fk-label">Hoidon laadun puutteet</div>
            <div class="fk-val">8 / 18</div>
            <div class="fk-sub">hoitoon päässeistä alle puolet saa näyttöön perustuvaa riittävää hoitoa</div>
          </div>
          <div class="funnel-kpi bad">
            <div class="fk-label">Kokonaishäviö</div>
            <div class="fk-val">89 %</div>
            <div class="fk-sub">tarvitsevista ei saavuta merkittävää toipumista</div>
          </div>
        </div>
      </div>

      <div class="sec-head">
        <span class="sec-num">03</span>
        <span class="sec-title">Hoitoonpääsy alueittain (vrk)</span>
        <div class="sec-rule"></div>
      </div>
      <div class="chart-box">
        <p style="font-size:11px;color:var(--ink3);font-family:'JetBrains Mono',monospace;margin:0 0 10px">
          Mielenterveyspalveluihin odotusaika (mediaani vrk) — punaisempi = pidempi odotus · Δ = muutos 2019→2024
        </p>
        <div class="heatmap-wrap" id="heatmap-${ID}"></div>
      </div>

      <div class="sec-head">
        <span class="sec-num">04</span>
        <span class="sec-title">Talousvaikutuslaskin</span>
        <div class="sec-rule"></div>
      </div>
      <div class="chart-box">
        <p style="font-size:11px;color:var(--ink3);font-family:'JetBrains Mono',monospace;margin:0 0 4px">
          Arvioi mielenterveysperusteisten sairauspoissaolojen taloudellinen kokonaiskustannus.
        </p>
        <div class="econ-grid">
          <div class="econ-ctrl">
            <div class="econ-item">
              <label>Sairauspoissaoloihin johtava osuus (% työvoimasta)</label>
              <div class="ev-row">
                <span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--ink3)">0.5 %</span>
                <span class="ev-val" id="ec-sick-val-${ID}">3.2 %</span>
              </div>
              <input type="range" id="ec-sick-${ID}" min="0.5" max="8" step="0.1" value="3.2">
            </div>
            <div class="econ-item">
              <label>Poissaolon kesto (vrk / henkilö / v)</label>
              <div class="ev-row">
                <span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--ink3)">5 vrk</span>
                <span class="ev-val" id="ec-days-val-${ID}">28 vrk</span>
              </div>
              <input type="range" id="ec-days-${ID}" min="5" max="90" step="1" value="28">
            </div>
            <div class="econ-item">
              <label>Keskipalkka (€ / vuosi brutto)</label>
              <div class="ev-row">
                <span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--ink3)">25 000 €</span>
                <span class="ev-val" id="ec-wage-val-${ID}">42 000 €</span>
              </div>
              <input type="range" id="ec-wage-${ID}" min="25000" max="70000" step="1000" value="42000">
            </div>
          </div>
          <div class="econ-result" id="econ-result-${ID}">
            <div class="er-row">
              <div class="er-label">Henkilöitä poissa töistä</div>
              <div class="er-val" id="er-aff-${ID}">—</div>
              <div class="er-sub">tuhatta työllistä / vuosi</div>
            </div>
            <div class="er-row">
              <div class="er-label">Sairauspoissaolopäiviä</div>
              <div class="er-val" id="er-days-${ID}">—</div>
              <div class="er-sub">miljoonaa päivää / vuosi</div>
            </div>
            <div class="er-row">
              <div class="er-label">BKT-vaikutus (arvio)</div>
              <div class="er-val highlight" id="er-gdp-${ID}">—</div>
              <div class="er-sub">miljardia euroa / vuosi</div>
            </div>
            <div class="er-row">
              <div class="er-label">Julkinen kustannus (Kela + hoiva)</div>
              <div class="er-val" id="er-pub-${ID}">—</div>
              <div class="er-sub">miljoonaa euroa / vuosi</div>
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
    try {
      const mt = await core.data.load("mental_health_diagnoses_by_age.json");
      if (mt?.length) console.log("[moduli013] ladattu", mt.length, "riviä");
    } catch(e) { console.warn("[moduli013] käytetään sisäistä dataa"); }

    const tip = makeTip();
    _tips.push(tip);

    // ── Diagnoositrendi ──
    let activeDiag = "masennus";

    function updateDiag(key) {
      activeDiag = key;
      root.querySelectorAll(".diag-btn").forEach(btn =>
        btn.classList.toggle("active", btn.dataset.diag === key)
      );
      drawDiagTrend(root.querySelector(`#diag-chart-${ID}`), key, tip);

      const diag   = DIAGNOSES[key];
      const groups = Object.entries(diag.groups);
      root.querySelector(`#diag-legend-${ID}`).innerHTML = groups.map(([grp], i) => {
        const t   = i / Math.max(groups.length - 1, 1);
        const col = d3.interpolate(diag.color + "55", diag.color)(t);
        return `<span><i style="background:${col}"></i>${grp}</span>`;
      }).join("");
    }

    root.querySelector(`#diag-ctrl-${ID}`).addEventListener("click", e => {
      const btn = e.target.closest(".diag-btn");
      if (btn) updateDiag(btn.dataset.diag);
    });
    updateDiag("masennus");

    // ── Suppilo ──
    drawFunnel(root.querySelector(`#funnel-chart-${ID}`), tip);

    // ── Heatmap ──
    drawHeatmap(root.querySelector(`#heatmap-${ID}`), tip);

    // ── Talouslaskin ──
    function updateEcon() {
      const sick = parseFloat(root.querySelector(`#ec-sick-${ID}`).value);
      const days = parseFloat(root.querySelector(`#ec-days-${ID}`).value);
      const wage = parseFloat(root.querySelector(`#ec-wage-${ID}`).value);

      root.querySelector(`#ec-sick-val-${ID}`).textContent = sick.toFixed(1) + " %";
      root.querySelector(`#ec-days-val-${ID}`).textContent = Math.round(days) + " vrk";
      root.querySelector(`#ec-wage-val-${ID}`).textContent = wage.toLocaleString("fi-FI") + " €";

      const r = calcEcon(sick, days, wage);
      root.querySelector(`#er-aff-${ID}`).textContent  = r.affected.toLocaleString("fi-FI");
      root.querySelector(`#er-days-${ID}`).textContent = r.totalDays.toLocaleString("fi-FI");
      root.querySelector(`#er-gdp-${ID}`).textContent  = r.gdpImpact + " Mrd €";
      root.querySelector(`#er-pub-${ID}`).textContent  = r.publicCost.toLocaleString("fi-FI") + " M€";

      root.querySelector(`#insight-${ID}`).innerHTML = `
        <strong>Analyysi:</strong>
        Mielenterveysperusteisten sairauspoissaolojen kasvu on rakenteellinen ilmiö — ei koronaan liittyvä piikki.
        Nuorten (15–24 v.) masennusdiagnoosit ovat <strong>yli nelinkertaistuneet</strong> vuodesta 2010.
        Hoitoon pääseminen vie kansallisesti keskimäärin yli 7 viikkoa — Kainuussa ja Lapissa jopa
        <strong>yli 10 viikkoa</strong>. Palvelupolun suppilo paljastaa, että
        <strong>89 % tarvitsevista</strong> ei saavuta toipumista.
        Laskurin perusoletuksilla (${sick.toFixed(1)} % työvoimasta,
        ${r.totalDays} milj. poissaolopäivää) arvioitu BKT-menetys on
        <strong>${r.gdpImpact} miljardia euroa</strong> vuodessa.
      `;
    }

    ["ec-sick", "ec-days", "ec-wage"].forEach(base =>
      root.querySelector(`#${base}-${ID}`)?.addEventListener("input", updateEcon)
    );
    updateEcon();

    root.querySelector(`#source-${ID}`).textContent =
      `Lähteet: THL Terveytemme-rekisteri · Kela tilastotietokanta · ETK työkyvyttömyystilasto · ` +
      `WHO Mental Health Atlas 2023 · THL hoitoonpääsytilasto 2019–2024 · ` +
      `Luvut ovat arvioita ja suuntaa-antavia.`;

    requestAnimationFrame(() => root.classList.add("is-mounted"));

  } catch(err) {
    console.error("[moduli013] virhe:", err);
    root.innerHTML = `<div style="padding:24px;color:#A82828;font-family:'JetBrains Mono',monospace">
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
