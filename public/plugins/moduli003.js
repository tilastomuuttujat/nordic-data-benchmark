// public/plugins/moduli003.js
// Plugin: Päätös → Asuminen → Syntyvyys -- TTT-analyysi
// Käyttää dataa: v_fertility_housing.json, v_signal_full_chain.json, v_signal_funding_paradox.json

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const ID = "moduli003";

const CSS = `
.plugin-${ID} {
  background: #F8F4EE;
  color: #1A1814;
  font-family: 'Source Serif 4', Georgia, serif;
  max-width: 1160px;
  margin: 0 auto;
  padding: 20px 24px;
  border: 1px solid rgba(26,24,20,0.12);
  border-radius: 4px;
  opacity: 0;
  transition: opacity .4s ease;
}
.plugin-${ID}.is-mounted { opacity: 1; }

.plugin-${ID} h3 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px;
  color: #1A1814;
}
.plugin-${ID} .kicker {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #8A8680;
  margin-bottom: 8px;
}
.plugin-${ID} .lead {
  color: #4A4640;
  font-size: 14px;
  margin: 0 0 20px;
  line-height: 1.5;
  font-style: italic;
  border-bottom: 0.5px solid rgba(26,24,20,0.12);
  padding-bottom: 16px;
}

/* Stat cards */
.plugin-${ID} .stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: rgba(26,24,20,0.12);
  border: 1px solid rgba(26,24,20,0.12);
  margin-bottom: 24px;
}
.plugin-${ID} .stat-card {
  background: #F8F4EE;
  padding: 16px 20px;
}
.plugin-${ID} .stat-card.accent-bg {
  background: #1A1814;
  color: #F8F4EE;
}
.plugin-${ID} .stat-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8A8680;
  margin-bottom: 8px;
}
.plugin-${ID} .accent-bg .stat-label {
  color: rgba(248,244,238,0.5);
}
.plugin-${ID} .stat-value {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
  color: #1A1814;
}
.plugin-${ID} .stat-value.negative { color: #8B1A1A; }
.plugin-${ID} .stat-value.positive { color: #1D6B5A; }
.plugin-${ID} .accent-bg .stat-value { color: #F8F4EE; }
.plugin-${ID} .stat-sub {
  font-size: 10px;
  color: #8A8680;
  margin-top: 4px;
  font-family: 'JetBrains Mono', monospace;
}

/* Chart legend */
.plugin-${ID} .chart-legend {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin: 16px 0 12px;
  font-size: 11px;
}
.plugin-${ID} .legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.plugin-${ID} .legend-line {
  width: 28px;
  height: 2px;
  display: inline-block;
}
.plugin-${ID} .chart-canvas {
  width: 100%;
  height: auto;
}

/* Chain diagram */
.plugin-${ID} .chain-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  margin: 8px 0 16px;
}
.plugin-${ID} .chain-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 0;
  border-bottom: 0.5px solid rgba(26,24,20,0.12);
}
.plugin-${ID} .chain-year {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 28px;
  font-weight: 700;
  padding: 16px 12px 16px 0;
  border-right: 2px solid #1A1814;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 4px;
}
.plugin-${ID} .chain-year-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: #8A8680;
}
.plugin-${ID} .chain-content {
  padding: 16px 0 16px 20px;
}
.plugin-${ID} .chain-decision {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 8px;
}
.plugin-${ID} .chain-decision.paradox { color: #8B1A1A; }
.plugin-${ID} .chain-meta-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.plugin-${ID} .chain-pill {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  padding: 2px 8px;
  border-radius: 2px;
}
.plugin-${ID} .pill-red { background: #F5E0E0; color: #8B1A1A; }
.plugin-${ID} .pill-green { background: #E8F4F0; color: #1D6B5A; }
.plugin-${ID} .pill-amber { background: #FDF3E0; color: #8B5E0A; }
.plugin-${ID} .pill-gray { background: #EDE8E0; color: #4A4640; }
.plugin-${ID} .chain-indicators {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  margin: 8px 0;
}
.plugin-${ID} .chain-ind {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.plugin-${ID} .chain-ind-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8px;
  color: #8A8680;
}
.plugin-${ID} .chain-ind-val {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 18px;
  font-weight: 700;
}
.plugin-${ID} .chain-ind-val.neg { color: #8B1A1A; }
.plugin-${ID} .chain-ind-val.pos { color: #1D6B5A; }
.plugin-${ID} .chain-arrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: #8A8680;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.plugin-${ID} .chain-arrow::before {
  content: '';
  width: 24px;
  height: 1px;
  background: #8A8680;
}

/* Table */
.plugin-${ID} .paradox-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  margin: 12px 0;
}
.plugin-${ID} .paradox-table th {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8A8680;
  text-align: left;
  padding: 10px 12px;
  border-bottom: 2px solid #1A1814;
}
.plugin-${ID} .paradox-table td {
  padding: 10px 12px;
  border-bottom: 0.5px solid rgba(26,24,20,0.12);
}
.plugin-${ID} .td-num {
  text-align: right;
  font-family: 'Playfair Display', Georgia, serif;
  font-weight: 700;
}
.plugin-${ID} .td-num.neg { color: #8B1A1A; }
.plugin-${ID} .td-num.pos { color: #1D6B5A; }

/* Forecast strip */
.plugin-${ID} .forecast-strip {
  background: #1A1814;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1px;
  margin: 16px 0 8px;
}
.plugin-${ID} .forecast-cell {
  background: #1A1814;
  padding: 16px 20px;
}
.plugin-${ID} .forecast-cell:first-child { background: #8B1A1A; }
.plugin-${ID} .forecast-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(248,244,238,0.5);
  margin-bottom: 8px;
}
.plugin-${ID} .forecast-value {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 34px;
  font-weight: 700;
  color: #F8F4EE;
  line-height: 1;
  margin-bottom: 4px;
}
.plugin-${ID} .forecast-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: rgba(248,244,238,0.5);
}

/* Insight */
.plugin-${ID} .insight {
  background: #EDE8E0;
  border-left: 3px solid #1D6B5A;
  padding: 14px 18px;
  margin: 20px 0 12px;
  font-size: 13px;
  line-height: 1.5;
}
.plugin-${ID} .insight strong {
  font-family: 'Playfair Display', Georgia, serif;
}
.plugin-${ID} .insight ul {
  margin: 8px 0 0;
  padding-left: 20px;
}
.plugin-${ID} .source {
  color: #8A8680;
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 0.5px solid rgba(26,24,20,0.12);
}
.plugin-${ID} .loading {
  text-align: center;
  padding: 40px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #8A8680;
}
.plugin-${ID} .spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 1.5px solid #C4C0BA;
  border-top-color: #1A1814;
  border-radius: 50%;
  animation: spin-${ID} 0.8s linear infinite;
  margin-right: 8px;
  vertical-align: middle;
}
@keyframes spin-${ID} {
  to { transform: rotate(360deg); }
}
@media (max-width: 700px) {
  .plugin-${ID} .stat-row { grid-template-columns: 1fr 1fr; }
  .plugin-${ID} .forecast-strip { grid-template-columns: 1fr; }
  .plugin-${ID} .chain-row { grid-template-columns: 1fr; }
  .plugin-${ID} .chain-year { border-right: none; border-bottom: 1px solid #1A1814; align-items: flex-start; flex-direction: row; justify-content: space-between; }
}
`;

function ensureStyles() {
  if (document.getElementById("style-" + ID)) return;
  const s = document.createElement("style");
  s.id = "style-" + ID;
  s.textContent = CSS;
  document.head.appendChild(s);
}

let _cleanups = [];
let mainChartCanvas = null;

async function mount(host, core) {
  console.log("[moduli003] mount kutsuttu");
  ensureStyles();
  
  host.innerHTML = `
    <section class="plugin-${ID}" aria-label="Päätös → Asuminen → Syntyvyys -analyysi">
      <div class="kicker">TTT-analyysi · Ketjuanalyysi</div>
      <h3>Päätös → Asuminen → <span style="color:#8B1A1A">Syntyvyys</span></h3>
      <p class="lead">Kolme poliittista päätöstä, yksi rahoitusparadoksi ja yksi mitattava tulos: miten asuntopolitiikan laiminlyönti ja leikkaukset muodostavat ketjun, jonka lopussa on Euroopan matalimpia syntyvyyslukuja.</p>
      
      <div class="stat-row" id="stat-row-${ID}">
        <div class="loading"><span class="spinner"></span>Ladataan avainlukuja…</div>
      </div>
      
      <div class="chart-legend" id="legend-${ID}">
        <span class="legend-item"><span class="legend-line" style="background:#8B1A1A"></span>TFR Suomi</span>
        <span class="legend-item"><span class="legend-line" style="background:#1D6B5A"></span>TFR Pohjoismaat ka.</span>
        <span class="legend-item"><span class="legend-line" style="background:#8B5E0A; border-top:2px dashed #8B5E0A;"></span>Vuokrarasitus % (YH)</span>
      </div>
      <div class="chart-wrap">
        <canvas id="main-chart-${ID}" class="chart-canvas" height="320"></canvas>
      </div>
      
      <div class="chain-grid" id="chain-grid-${ID}">
        <div class="loading"><span class="spinner"></span>Ladataan päätösketjua…</div>
      </div>
      
      <h3 style="font-size:18px; margin:24px 0 12px 0;">Rahoitusparadoksi</h3>
      <table class="paradox-table" id="paradox-table-${ID}">
        <thead><tr><th>J-koodi</th><th>Nimi</th><th style="text-align:right">Rahoitus +%</th><th style="text-align:right">Elastisuus r</th><th style="text-align:right">Paradoksi M€</th><th>Luokka</th></tr></thead>
        <tbody><tr><td colspan="6" class="loading"><span class="spinner"></span>Ladataan…</td></tr></tbody>
       </table>
      
      <div class="forecast-strip" id="forecast-${ID}">
        <div class="loading" style="grid-column:1/-1; background:#1A1814; color:rgba(248,244,238,0.5);"><span class="spinner"></span>Lasketaan ennustetta…</div>
      </div>
      
      <div class="insight" id="insight-${ID}">
        <strong>Mitä tämä kertoo:</strong>
        <ul><li>Ladataan analyysiä…</li></ul>
      </div>
      <div class="source" id="source-${ID}"></div>
    </section>
  `;
  
  const root = host.querySelector(`.plugin-${ID}`);
  
  try {
    console.log("[moduli003] ladataan dataa…");
    
    const [fertilityData, chainData, paradoxData] = await Promise.all([
      core.data.load("v_fertility_housing.json"),
      core.data.load("v_signal_full_chain.json"),
      core.data.load("v_signal_funding_paradox.json")
    ]);
    
    console.log("[moduli003] data ladattu:", 
      fertilityData?.length, "v_fertility_housing riviä,", 
      chainData?.length, "v_signal_full_chain riviä,", 
      paradoxData?.length, "v_signal_funding_paradox riviä");
    
    if (!fertilityData || !fertilityData.length) {
      throw new Error("v_fertility_housing.json dataa ei löytynyt");
    }
    
    // Piirrä stat-kortit
    renderStats(root, fertilityData);
    
    // Piirrä pääkaavio
    renderMainChart(root, fertilityData);
    
    // Piirrä ketjuanalyysi
    renderChain(root, chainData, fertilityData);
    
    // Piirrä paradoksitaulu
    renderParadox(root, paradoxData);
    
    // Piirrä ennuste
    renderForecast(root, fertilityData);
    
    // Päivitä insighthit
    renderInsight(root, fertilityData, chainData, paradoxData);
    
    // Lähdeinfo
    const sourceEl = root.querySelector(`#source-${ID}`);
    sourceEl.textContent = `Lähteet: v_fertility_housing.json, v_signal_full_chain.json, v_signal_funding_paradox.json · TFR = kokonaishedelmällisyysluku (syntymät / nainen) · Päivitetty ${new Date().toLocaleDateString('fi-FI')}`;
    
    requestAnimationFrame(() => root.classList.add("is-mounted"));
    
  } catch (err) {
    console.error("[moduli003] virhe:", err);
    root.innerHTML = `<div style="padding:24px; color:#8B1A1A; font-family:monospace;">
      <strong>Virhe lisäosassa:</strong><br>${err.message}
      <br><br>Varmista että seuraavat data-viewt ovat olemassa:
      <br>• v_fertility_housing.json
      <br>• v_signal_full_chain.json  
      <br>• v_signal_funding_paradox.json
    </div>`;
  }
}

// ── APUFUNKTIOT ──────────────────────────────────────────────────

function renderStats(root, data) {
  const latest = data.find(d => d.year === 2024) || data[data.length - 1];
  
  // TFR on kerroin (esim. 0.903), muutetaan syntymiksi/1000 naista
  const tfrValue = latest.fi_tfr ? (latest.fi_tfr * 1000).toFixed(1) : '--';
  const rentBurden = latest.vuokra_yh_rasitus_pct ? latest.vuokra_yh_rasitus_pct + '%' : '--';
  const incomeLeft = latest.vuokra_yh_jaljella_eur 
    ? (latest.vuokra_yh_jaljella_eur / 1000).toFixed(1) + 'k€' 
    : '--';
  
  // Laske pohjoismainen keskiarvo ja vaje
  let nordicGap = '--';
  if (latest.se_tfr && latest.no_tfr && latest.dk_tfr && latest.fi_tfr) {
    const nordicAvg = (latest.se_tfr + latest.no_tfr + latest.dk_tfr) / 3;
    const gap = (nordicAvg - latest.fi_tfr) * 1000;
    nordicGap = (gap > 0 ? '+' : '') + gap.toFixed(0);
  }
  
  const stats = [
    { label: 'TFR 2024', value: tfrValue, sub: 'syntymää / 1000 naista', bg: true, cls: tfrValue !== '--' && parseFloat(tfrValue) < 50 ? 'negative' : '' },
    { label: 'Syntyvyysvaje', value: nordicGap, sub: 'vs. pohjoismaat (2024)', bg: false, cls: nordicGap !== '--' && parseFloat(nordicGap) > 0 ? 'negative' : '' },
    { label: 'Vuokrarasitus', value: rentBurden, sub: 'YH alle 35v, netto', bg: false, cls: latest.vuokra_yh_rasitus_pct > 30 ? 'negative' : '' },
    { label: 'Käyttövara', value: incomeLeft, sub: 'vuokran jälkeen / v', bg: false }
  ];
  
  const statRow = root.querySelector(`#stat-row-${ID}`);
  statRow.innerHTML = stats.map(s => `
    <div class="stat-card${s.bg ? ' accent-bg' : ''}">
      <div class="stat-label">${s.label}</div>
      <div class="stat-value ${s.cls || ''}">${s.value}</div>
      <div class="stat-sub">${s.sub}</div>
    </div>
  `).join('');
}

function renderMainChart(root, data) {
  // Suodatetaan vuodet 2002-2024
  const sorted = data.filter(d => d.year >= 2002 && d.year <= 2024).sort((a,b) => a.year - b.year);
  const labels = sorted.map(d => d.year);
  
  // TFR × 1000 = syntymät / 1000 naista
  const fiTfr = sorted.map(d => d.fi_tfr ? d.fi_tfr * 1000 : null);
  
  // Pohjoismaiden keskiarvo (SE, NO, DK)
  const nordicAvg = sorted.map(d => {
    const vals = [d.se_tfr, d.no_tfr, d.dk_tfr].filter(v => v != null && v > 0);
    return vals.length ? (vals.reduce((a,b) => a + b, 0) / vals.length) * 1000 : null;
  });
  
  const rentBurden = sorted.map(d => d.vuokra_yh_rasitus_pct || null);
  
  const canvas = document.getElementById(`main-chart-${ID}`);
  if (!canvas) return;
  
  canvas.width = canvas.offsetWidth;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  if (!fiTfr.length) return;
  
  const W = canvas.width - 80;
  const H = canvas.height - 60;
  const M = { l: 55, r: 55, t: 20, b: 40 };
  
  // Skaalaukset
  const x = d3.scaleLinear().domain([2002, 2024]).range([M.l, canvas.width - M.r]);
  const y1 = d3.scaleLinear().domain([40, 75]).range([M.t, canvas.height - M.b]);
  const y2 = d3.scaleLinear().domain([20, 35]).range([canvas.height - M.b, M.t]);
  
  // Grid
  ctx.beginPath();
  ctx.strokeStyle = '#C4C0BA';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= 5; i++) {
    const yVal = 40 + i * 7;
    const yPos = y1(yVal);
    ctx.beginPath();
    ctx.moveTo(M.l, yPos);
    ctx.lineTo(canvas.width - M.r, yPos);
    ctx.stroke();
  }
  
  // Piirrä viivat
  function drawLine(data, color, width, dash = []) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    if (dash.length) ctx.setLineDash(dash);
    let started = false;
    data.forEach((val, i) => {
      if (val === null || val === undefined) { started = false; return; }
      const year = labels[i];
      const xPos = x(year);
      const yPos = y1(val);
      if (!started) {
        ctx.moveTo(xPos, yPos);
        started = true;
      } else {
        ctx.lineTo(xPos, yPos);
      }
    });
    ctx.stroke();
    ctx.setLineDash([]);
  }
  
  function drawLineY2(data, color, width, dash = []) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    if (dash.length) ctx.setLineDash(dash);
    let started = false;
    data.forEach((val, i) => {
      if (val === null || val === undefined) { started = false; return; }
      const year = labels[i];
      const xPos = x(year);
      const yPos = y2(val);
      if (!started) {
        ctx.moveTo(xPos, yPos);
        started = true;
      } else {
        ctx.lineTo(xPos, yPos);
      }
    });
    ctx.stroke();
    ctx.setLineDash([]);
  }
  
  drawLine(fiTfr, '#8B1A1A', 2.5);
  drawLine(nordicAvg, '#1D6B5A', 2);
  drawLineY2(rentBurden, '#8B5E0A', 2, [6, 4]);
  
  // Akselitekstit
  ctx.fillStyle = '#8A8680';
  ctx.font = '9px "JetBrains Mono", monospace';
  labels.forEach(year => {
    if (year % 4 === 0) {
      ctx.fillText(year, x(year) - 8, canvas.height - M.b + 15);
    }
  });
  
  // Y-akseli vasen (TFR)
  for (let i = 0; i <= 5; i++) {
    const val = 40 + i * 7;
    if (val <= 75) {
      ctx.fillText(val.toFixed(0), M.l - 28, y1(val) + 3);
    }
  }
  
  // Y-akseli oikea (vuokrarasitus)
  for (let i = 0; i <= 3; i++) {
    const val = 20 + i * 5;
    ctx.fillText(val + '%', canvas.width - M.r + 10, y2(val) + 3);
  }
  
  // Akselien otsikot
  ctx.fillStyle = '#8A8680';
  ctx.font = '8px "JetBrains Mono", monospace';
  ctx.save();
  ctx.translate(18, canvas.height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('TFR (syntymät / 1000 naista)', 0, 0);
  ctx.restore();
  
  ctx.fillStyle = '#8A8680';
  ctx.fillText('Vuokrarasitus %', canvas.width - 45, 15);
  
  // Päivitä legend nykyisillä arvoilla
  const legendEl = root.querySelector(`#legend-${ID}`);
  if (legendEl) {
    const lastTfr = fiTfr[fiTfr.length-1]?.toFixed(1) || '--';
    const lastNordic = nordicAvg[nordicAvg.length-1]?.toFixed(1) || '--';
    const lastRent = rentBurden[rentBurden.length-1]?.toFixed(1) || '--';
    legendEl.innerHTML = `
      <span class="legend-item"><span class="legend-line" style="background:#8B1A1A; height:2px;"></span>TFR Suomi (${lastTfr})</span>
      <span class="legend-item"><span class="legend-line" style="background:#1D6B5A; height:2px;"></span>TFR Pohjoismaat ka. (${lastNordic})</span>
      <span class="legend-item"><span class="legend-line" style="background:#8B5E0A; border-top:2px dashed #8B5E0A;"></span>Vuokrarasitus ${lastRent}%</span>
    `;
  }
}

function renderChain(root, chainData, fertilityData) {
  if (!chainData || !chainData.length) {
    root.querySelector(`#chain-grid-${ID}`).innerHTML = '<div class="loading">Ei päätösdataa</div>';
    return;
  }
  
  // Näytetään viimeisimmät päätökset (vuosilta 2023, 2021, 2015)
  const decisions = chainData.filter(d => d.vuosi >= 2015).sort((a,b) => b.vuosi - a.vuosi);
  
  const fmt = (v) => v != null && !isNaN(v) ? Math.abs(v).toLocaleString('fi-FI') : '--';
  
  const chainHtml = decisions.map(d => {
    const isLeikkaus = d.budjettivaikutus_meur != null && d.budjettivaikutus_meur < 0;
    
    let pillClass = 'pill-gray';
    let pillText = d.paradox_relevance || '--';
    if (d.paradox_relevance === 'true_paradox') { pillClass = 'pill-red'; pillText = 'rahoitusparadoksi'; }
    else if (d.paradox_relevance === 'weak_return') { pillClass = 'pill-amber'; pillText = 'heikko tuotto'; }
    else if (d.paradox_relevance === 'no_paradox') { pillClass = 'pill-green'; pillText = 'ei paradoksia'; }
    
    // Hae asumisdata kyseiseltä vuodelta
    const housingYear = fertilityData.find(h => h.year === d.vuosi);
    const rentAtDecision = housingYear?.vuokra_yh_rasitus_pct || '--';
    
    // TFR-muutos (tfr_at_outcome_year on kerroin)
    const tfrChange = d.tfr_change_decision_to_outcome;
    const tfrChangeDisplay = tfrChange != null ? (tfrChange * 1000).toFixed(0) : '--';
    
    return `
    <div class="chain-row">
      <div class="chain-year">
        ${d.vuosi}
        <span class="chain-year-sub">${isLeikkaus ? '−' + fmt(d.budjettivaikutus_meur) + ' M€' : '+' + fmt(d.budjettivaikutus_meur) + ' M€'}</span>
      </div>
      <div class="chain-content">
        <div class="chain-decision${pillClass === 'pill-red' ? ' paradox' : ''}">${d.decision_title || 'Päätös'}</div>
        <div class="chain-meta-row">
          <span class="chain-pill ${pillClass}">${pillText}</span>
          ${isLeikkaus ? `<span class="chain-pill pill-red">leikkaus</span>` : `<span class="chain-pill pill-green">investointi</span>`}
        </div>
        <div class="chain-indicators">
          <div class="chain-ind"><span class="chain-ind-label">Vuokrarasitus</span><span class="chain-ind-val">${rentAtDecision}%</span></div>
          <div class="chain-ind"><span class="chain-ind-label">TFR päätös</span><span class="chain-ind-val">${d.fi_tfr ? (d.fi_tfr * 1000).toFixed(0) : '--'}</span></div>
          <div class="chain-ind"><span class="chain-ind-label">TFR muutos</span><span class="chain-ind-val ${tfrChange < 0 ? 'neg' : 'pos'}">${tfrChangeDisplay !== '--' ? (tfrChange > 0 ? '+' : '') + tfrChangeDisplay : '--'}</span></div>
        </div>
        <div class="chain-arrow">${d.chain_interpretation || 'Ketjuvaikutus ei tiedossa'}</div>
      </div>
    </div>`;
  }).join('');
  
  root.querySelector(`#chain-grid-${ID}`).innerHTML = chainHtml || '<div class="loading">Ei päätösdataa</div>';
}

function renderParadox(root, data) {
  if (!data || !data.length) {
    root.querySelector(`#paradox-table-${ID} tbody`).innerHTML = '<tr><td colspan="6">Ei paradoksidataa</td></tr>';
    return;
  }
  
  // Suodatetaan true_paradox ja weak_return, järjestetään magnitudin mukaan
  const rows = data
    .filter(d => d.paradox_class === 'true_paradox' || d.paradox_class === 'weak_return')
    .sort((a,b) => (b.paradox_magnitude_meur || 0) - (a.paradox_magnitude_meur || 0))
    .slice(0, 8);
  
  const classLabel = {
    true_paradox: '<span class="chain-pill pill-red">paradoksi</span>',
    weak_return: '<span class="chain-pill pill-amber">heikko tuotto</span>'
  };
  
  const tbody = rows.map(r => `
    <tr>
      <td class="td-code">${r.j_code || '--'}</td>
      <td style="max-width:250px;">${r.j_name || '--'}</td>
      <td class="td-num ${r.funding_change_pct > 0 ? 'pos' : 'neg'}">${r.funding_change_pct != null ? (r.funding_change_pct > 0 ? '+' : '') + r.funding_change_pct + '%' : '--'}</td>
      <td class="td-num ${r.elasticity_r < 0 ? 'neg' : 'pos'}">${r.elasticity_r != null ? r.elasticity_r.toFixed(3) : '--'}</td>
      <td class="td-num">${r.paradox_magnitude_meur != null ? r.paradox_magnitude_meur.toLocaleString('fi-FI', {maximumFractionDigits:0}) + ' M€' : '--'}</td>
      <td>${classLabel[r.paradox_class] || r.paradox_class || '--'}</td>
    </tr>
  `).join('');
  
  root.querySelector(`#paradox-table-${ID} tbody`).innerHTML = tbody || '<tr><td colspan="6">Ei paradoksidataa</td></tr>';
}

function renderForecast(root, data) {
  const latest = data.find(d => d.year === 2024) || data[data.length - 1];
  if (!latest) return;
  
  const tfrNow = latest.fi_tfr ? (latest.fi_tfr * 1000).toFixed(0) : '--';
  
  // Yksinkertainen trendiennuste vuosille 2015-2024
  const recentYears = data.filter(d => d.year >= 2015 && d.fi_tfr).sort((a,b) => a.year - b.year);
  let forecast = '--';
  if (recentYears.length >= 3) {
    const years = recentYears.map(d => d.year);
    const tfrs = recentYears.map(d => d.fi_tfr * 1000);
    const n = years.length;
    const sumX = years.reduce((a,b) => a + b, 0);
    const sumY = tfrs.reduce((a,b) => a + b, 0);
    const sumXY = years.reduce((a,b,i) => a + b * tfrs[i], 0);
    const sumX2 = years.reduce((a,b) => a + b * b, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    const f = slope * 2029 + intercept;
    forecast = f.toFixed(1);
  }
  
  // Pohjoismainen taso (vuoden 2024 pohjoismainen keskiarvo)
  let nordicTarget = '--';
  if (latest.se_tfr && latest.no_tfr && latest.dk_tfr) {
    const nordicAvg = (latest.se_tfr + latest.no_tfr + latest.dk_tfr) * 1000;
    nordicTarget = nordicAvg.toFixed(0);
  }
  
  const forecastEl = root.querySelector(`#forecast-${ID}`);
  forecastEl.innerHTML = `
    <div class="forecast-cell">
      <div class="forecast-label">TFR-ennuste 2029</div>
      <div class="forecast-value">${forecast}</div>
      <div class="forecast-sub">trendiennuste 2015–2024</div>
    </div>
    <div class="forecast-cell">
      <div class="forecast-label">TFR nyt (2024)</div>
      <div class="forecast-value">${tfrNow}</div>
      <div class="forecast-sub">syntymää / 1000 naista</div>
    </div>
    <div class="forecast-cell">
      <div class="forecast-label">Pohjoismainen taso</div>
      <div class="forecast-value">${nordicTarget}</div>
      <div class="forecast-sub">SE+NO+DK ka. 2024</div>
    </div>
  `;
}

function renderInsight(root, fertilityData, chainData, paradoxData) {
  const first = fertilityData.find(d => d.year === 2002) || fertilityData[0];
  const latest = fertilityData.find(d => d.year === 2024) || fertilityData[fertilityData.length - 1];
  
  const tfrChange = (first.fi_tfr && latest.fi_tfr) 
    ? ((latest.fi_tfr - first.fi_tfr) * 1000).toFixed(0)
    : '--';
  
  const rentChange = (first.vuokra_yh_rasitus_pct && latest.vuokra_yh_rasitus_pct)
    ? (latest.vuokra_yh_rasitus_pct - first.vuokra_yh_rasitus_pct).toFixed(0)
    : '--';
  
  const paradoxCount = paradoxData?.filter(d => d.paradox_class === 'true_paradox' || d.paradox_class === 'weak_return').length || 0;
  const decisionCount = chainData?.length || 0;
  
  const insightEl = root.querySelector(`#insight-${ID}`);
  insightEl.innerHTML = `
    <strong>Mitä tämä kertoo:</strong>
    <ul>
      <li>Vuokrarasitus on kasvanut <strong>${Math.abs(parseFloat(rentChange))} prosenttiyksikköä</strong> (${first.year} → 2024) -- nuorten aikuisten asumiskustannukset ovat nousseet merkittävästi.</li>
      <li>TFR on laskenut samana aikana <strong>${Math.abs(parseFloat(tfrChange))} syntymää / 1000 naista</strong> (${first.year} → 2024).</li>
      <li><strong>${paradoxCount} rahoitusparadoksia</strong> havaittu: lisärahoitus ei ole tuottanut odotettuja tuloksia.</li>
      <li><strong>${decisionCount} keskeistä päätöstä</strong> muodostavat ketjun, jossa asuntopolitiikan laiminlyönti heijastuu syntyvyyteen.</li>
      <li>Ilman rakenteellisia muutoksia syntyvyysvaje pohjoismaihin verrattuna syvenee edelleen.</li>
    </ul>
  `;
}

function unmount(host) {
  _cleanups.forEach(fn => { try { fn && fn(); } catch {} });
  _cleanups = [];
  if (host) host.innerHTML = "";
}

export default { id: ID, mount, unmount };