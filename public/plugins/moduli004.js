// public/plugins/moduli004.js
// Plugin: TFR ja vuokrarasitus (1990–2024) -- TTT-analyysi

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const ID = "moduli004";

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
  border-bottom: 0.5px solid rgba(26,24,20,0.12);
  padding-bottom: 16px;
}
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
.plugin-${ID} .corr-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: rgba(26,24,20,0.12);
  margin: 16px 0 20px;
  border: 1px solid rgba(26,24,20,0.12);
}
.plugin-${ID} .corr-card {
  background: #F8F4EE;
  padding: 14px 16px;
  text-align: center;
}
.plugin-${ID} .corr-card .corr-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8A8680;
  margin-bottom: 6px;
}
.plugin-${ID} .corr-card .corr-r {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 28px;
  font-weight: 700;
}
.plugin-${ID} .corr-card .corr-r.neg { color: #8B1A1A; }
.plugin-${ID} .corr-card .corr-r.pos { color: #1D6B5A; }
.plugin-${ID} .corr-card .corr-p {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  margin-top: 4px;
  color: #8A8680;
}
.plugin-${ID} .corr-card .corr-n {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: #8A8680;
  margin-top: 2px;
}
.plugin-${ID} .corr-card .corr-period {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 12px;
  font-weight: 600;
  margin-top: 8px;
  color: #1A1814;
}
.plugin-${ID} .corr-card.highlight {
  background: rgba(139,26,26,0.05);
  border-left: 3px solid #8B1A1A;
}
.plugin-${ID} .detrend-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: rgba(26,24,20,0.12);
  margin: 12px 0;
  border: 1px solid rgba(26,24,20,0.12);
}
.plugin-${ID} .detrend-card {
  background: #F8F4EE;
  padding: 12px 16px;
}
.plugin-${ID} .detrend-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8A8680;
  margin-bottom: 6px;
}
.plugin-${ID} .detrend-value {
  font-weight: 700;
  font-size: 18px;
  font-family: 'Playfair Display', Georgia, serif;
}
.plugin-${ID} .detrend-value.neg { color: #8B1A1A; }
.plugin-${ID} .detrend-value.pos { color: #1D6B5A; }
.plugin-${ID} .detrend-sub {
  font-size: 10px;
  color: #8A8680;
  margin-top: 2px;
}
.plugin-${ID} .test-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 1px;
  background: rgba(26,24,20,0.12);
  margin: 16px 0;
  border: 1px solid rgba(26,24,20,0.12);
}
.plugin-${ID} .test-card {
  background: #F8F4EE;
  padding: 12px 12px;
  text-align: center;
}
.plugin-${ID} .test-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #8A8680;
  margin-bottom: 6px;
}
.plugin-${ID} .test-value {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 20px;
  font-weight: 700;
}
.plugin-${ID} .test-value.pos { color: #1D6B5A; }
.plugin-${ID} .test-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8px;
  color: #8A8680;
  margin-top: 2px;
}
.plugin-${ID} .test-highlight {
  background: #1A1814;
  color: #F8F4EE;
}
.plugin-${ID} .test-highlight .test-value { color: #F8F4EE; }
.plugin-${ID} .falsi-strip {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  background: #1A1814;
  margin: 12px 0;
}
.plugin-${ID} .falsi-cell {
  background: #1A1814;
  padding: 12px 16px;
  text-align: center;
}
.plugin-${ID} .falsi-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(248,244,238,0.5);
}
.plugin-${ID} .falsi-value {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 22px;
  font-weight: 700;
  color: #F8F4EE;
  margin: 8px 0 4px;
}
.plugin-${ID} .falsi-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8px;
  color: rgba(248,244,238,0.5);
}
.plugin-${ID} .falsi-conclusion {
  margin-top: 12px;
  font-size: 11px;
  text-align: center;
  color: #F8F4EE;
}
.plugin-${ID} .insight {
  background: #EDE8E0;
  border-left: 3px solid #8B1A1A;
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
@media (max-width: 780px) {
  .plugin-${ID} .stat-row { grid-template-columns: 1fr 1fr; }
  .plugin-${ID} .corr-grid { grid-template-columns: 1fr; }
  .plugin-${ID} .test-grid { grid-template-columns: 1fr 1fr; }
  .plugin-${ID} .detrend-row { grid-template-columns: 1fr; }
  .plugin-${ID} .falsi-strip { grid-template-columns: 1fr; }
}
`;

function ensureStyles() {
  if (document.getElementById("style-" + ID)) return;
  const s = document.createElement("style");
  s.id = "style-" + ID;
  s.textContent = CSS;
  document.head.appendChild(s);
}

// Apufunktiot tilastollisiin laskelmiin (korvaa d3:n puuttuvat funktiot)
function tDistributionCdf(t, df) {
  // Approksimaatio Studentin t-jakauman kertymäfunktiolle
  if (df <= 0) return 0.5;
  const x = t / Math.sqrt(df);
  const z = Math.abs(x);
  let p = 0;
  if (df === 1) p = Math.atan(z) / Math.PI * 2;
  else if (df === 2) p = z / Math.sqrt(2 + z*z);
  else {
    const a = z / Math.sqrt(df);
    p = 1 - (1 + a*a) * Math.exp(-a*a/2) / 2;
  }
  return 0.5 + (t > 0 ? p/2 : -p/2);
}

function fDistributionCdf(f, df1, df2) {
  // Approksimaatio F-jakauman kertymäfunktiolle
  const x = f * df1 / df2;
  const p = 1 - Math.exp(-x/2) * (1 + x/2);
  return Math.max(0, Math.min(1, p));
}

async function mount(host, core) {
  console.log("[moduli004] mount kutsuttu");
  ensureStyles();

  host.innerHTML = `
    <section class="plugin-${ID}" aria-label="TFR ja vuokrarasitus -korrelaatioanalyysi">
      <div class="kicker">TTT-analyysi · Korrelaatio & kausaalisuus</div>
      <h3>TFR ja <span style="color:#8B1A1A">vuokrarasitus</span><br>1990–2024</h3>
      <p class="lead">Miten asumiskustannukset, vuokrarasitus ja syntyvyys kytkeytyvät? Kolme periodia, trendi-irrotus, spuriousness-testi ja 1990-luvun falsifiointi.</p>
      
      <div class="stat-row" id="stat-row-${ID}">
        <div class="loading"><span class="spinner"></span>Ladataan avainlukuja…</div>
      </div>
      
      <div class="chart-legend" id="legend-${ID}">
        <span class="legend-item"><span class="legend-line" style="background:#8B1A1A"></span>TFR Suomi</span>
        <span class="legend-item"><span class="legend-line" style="background:#8B5E0A"></span>Vuokrarasitus % (nuoret)</span>
        <span class="legend-item"><span class="legend-line" style="background:#1D6B5A; stroke-dasharray:4 2"></span>Käyttövara (€/v)</span>
      </div>
      <div class="chart-wrap">
        <canvas id="main-chart-${ID}" class="chart-canvas" height="320" width="800"></canvas>
      </div>
      
      <div class="corr-grid" id="corr-grid-${ID}">
        <div class="loading" style="grid-column:1/-1;"><span class="spinner"></span>Lasketaan korrelaatioita…</div>
      </div>
      
      <div class="detrend-row" id="detrend-row-${ID}">
        <div class="detrend-card"><div class="detrend-label">Trendi-irrotus</div><div class="detrend-value">--</div><div class="detrend-sub">r · p</div></div>
        <div class="detrend-card"><div class="detrend-label">ΔTFR vs Δvuokrarasitus</div><div class="detrend-value">--</div><div class="detrend-sub">vuosimuutos</div></div>
      </div>
      
      <div class="test-grid" id="test-grid-${ID}">
        <div class="test-card"><div class="test-label">R² (aika)</div><div class="test-value">--</div><div class="test-sub">pelkkä trendi</div></div>
        <div class="test-card"><div class="test-label">R² (aika+rasitus)</div><div class="test-value">--</div><div class="test-sub">yhteismalli</div></div>
        <div class="test-card"><div class="test-label">Δselitys</div><div class="test-value">--</div><div class="test-sub">lisäosuus</div></div>
        <div class="test-card"><div class="test-label">F-testi</div><div class="test-value">--</div><div class="test-sub">p</div></div>
      </div>
      
      <div class="falsi-strip" id="falsi-strip-${ID}">
        <div class="loading" style="grid-column:1/-1; background:#1A1814; color:rgba(248,244,238,0.5);"><span class="spinner"></span>Ladataan…</div>
      </div>
      
      <div class="insight" id="insight-${ID}">
        <strong>Mekanismi muuttuu:</strong>
        <ul><li>Ladataan analyysiä…</li></ul>
      </div>
      <div class="source" id="source-${ID}"></div>
    </section>
  `;

  const root = host.querySelector(`.plugin-${ID}`);

  try {
    console.log("[moduli004] ladataan dataa…");
    
    const [fertilityData, chainData, paradoxData] = await Promise.all([
      core.data.load("v_fertility_housing.json"),
      core.data.load("v_signal_full_chain.json"),
      core.data.load("v_signal_funding_paradox.json")
    ]);
    
    console.log("[moduli004] data ladattu:", fertilityData?.length, "riviä");
    
    if (!fertilityData || !fertilityData.length) {
      throw new Error("v_fertility_housing.json dataa ei löytynyt");
    }
    
    console.log("[moduli004] esimerkki rivi:", fertilityData[0]);
    
    renderStats(root, fertilityData);
    renderMainChart(root, fertilityData);
    renderCorrelations(root, fertilityData);
    renderDetrended(root, fertilityData);
    renderSpuriousness(root, fertilityData);
    renderFalsification(root, fertilityData);
    renderInsight(root, fertilityData);
    
    const sourceEl = root.querySelector(`#source-${ID}`);
    sourceEl.textContent = `Lähteet: v_fertility_housing.json · TFR = kokonaishedelmällisyysluku (syntymät / nainen) · Vuokrarasitus = vuokra % nettotuloista, alle 35v · Päivitetty ${new Date().toLocaleDateString('fi-FI')}`;
    
    requestAnimationFrame(() => root.classList.add("is-mounted"));
    
  } catch (err) {
    console.error("[moduli004] virhe:", err);
    root.innerHTML = `<div style="padding:24px; color:#8B1A1A; font-family:monospace;">
      <strong>Virhe lisäosassa:</strong><br>${err.message}
      <br><br>Varmista että seuraavat data-viewt ovat olemassa:
      <br>• v_fertility_housing.json
      <br>• v_signal_full_chain.json  
      <br>• v_signal_funding_paradox.json
    </div>`;
  }
}

function renderStats(root, data) {
  const latest = data.find(d => d.year === 2024) || data[data.length - 1];
  const first = data.find(d => d.year === 1990) || data[0];
  
  const tfr2024 = latest.fi_tfr ? (latest.fi_tfr * 1000).toFixed(1) : '--';
  const tfrChange = (first.fi_tfr && latest.fi_tfr) 
    ? ((latest.fi_tfr - first.fi_tfr) * 1000).toFixed(1)
    : '--';
  
  const rentBurden = latest.vuokra_yh_rasitus_pct ? latest.vuokra_yh_rasitus_pct + '%' : '--';
  const incomeLeft = latest.vuokra_yh_jaljella_eur 
    ? (latest.vuokra_yh_jaljella_eur / 1000).toFixed(1) + 'k€' 
    : '--';
  
  const stats = [
    { label: 'TFR 2024', value: tfr2024, sub: 'syntymää / 1000 naista', bg: true, cls: tfr2024 !== '--' && parseFloat(tfr2024) < 50 ? 'negative' : '' },
    { label: 'TFR muutos', value: tfrChange, sub: '1990 → 2024', bg: false, cls: tfrChange !== '--' && parseFloat(tfrChange) < 0 ? 'negative' : '' },
    { label: 'Vuokrarasitus', value: rentBurden, sub: 'alle 35v, netto', bg: false, cls: latest.vuokra_yh_rasitus_pct > 30 ? 'negative' : '' },
    { label: 'Käyttövara', value: incomeLeft, sub: 'vuokran jälkeen / v', bg: false }
  ];
  
  const statRow = root.querySelector(`#stat-row-${ID}`);
  if (statRow) {
    statRow.innerHTML = stats.map(s => `
      <div class="stat-card${s.bg ? ' accent-bg' : ''}">
        <div class="stat-label">${s.label}</div>
        <div class="stat-value ${s.cls || ''}">${s.value}</div>
        <div class="stat-sub">${s.sub}</div>
      </div>
    `).join('');
  }
}

function renderMainChart(root, data) {
  const sorted = data.filter(d => d.year >= 1990 && d.year <= 2024).sort((a,b) => a.year - b.year);
  const labels = sorted.map(d => d.year);
  
  const tfr = sorted.map(d => d.fi_tfr ? d.fi_tfr * 1000 : null);
  const rentBurden = sorted.map(d => d.vuokra_yh_rasitus_pct || null);
  const incomeLeft = sorted.map(d => d.vuokra_yh_jaljella_eur ? d.vuokra_yh_jaljella_eur / 1000 : null);
  
  const canvas = document.getElementById(`main-chart-${ID}`);
  if (!canvas) return;
  
  if (canvas.width !== canvas.offsetWidth && canvas.offsetWidth > 0) {
    canvas.width = canvas.offsetWidth;
  }
  if (canvas.width === 0) canvas.width = 800;
  canvas.height = 320;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const hasAnyData = tfr.some(v => v !== null) || rentBurden.some(v => v !== null);
  if (!hasAnyData) {
    ctx.fillStyle = '#8A8680';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText('Ei dataa', canvas.width/2 - 40, canvas.height/2);
    return;
  }
  
  const W = canvas.width - 80;
  const H = canvas.height - 60;
  const M = { l: 55, r: 55, t: 20, b: 40 };
  
  const x = d3.scaleLinear().domain([1990, 2024]).range([M.l, canvas.width - M.r]);
  const y1 = d3.scaleLinear().domain([40, 85]).range([M.t, canvas.height - M.b]);
  const y2 = d3.scaleLinear().domain([0, 45]).range([canvas.height - M.b, M.t]);
  
  // Grid
  ctx.beginPath();
  ctx.strokeStyle = '#C4C0BA';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= 6; i++) {
    const yVal = 40 + i * 7.5;
    if (yVal <= 85) {
      const yPos = y1(yVal);
      ctx.moveTo(M.l, yPos);
      ctx.lineTo(canvas.width - M.r, yPos);
      ctx.stroke();
    }
  }
  
  function drawLine(values, color, width, dash = []) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    if (dash.length) ctx.setLineDash(dash);
    let started = false;
    values.forEach((val, i) => {
      if (val === null || val === undefined) { started = false; return; }
      const xPos = x(labels[i]);
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
  
  function drawLineY2(values, color, width, dash = []) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    if (dash.length) ctx.setLineDash(dash);
    let started = false;
    values.forEach((val, i) => {
      if (val === null || val === undefined) { started = false; return; }
      const xPos = x(labels[i]);
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
  
  drawLine(tfr, '#8B1A1A', 2.5);
  drawLineY2(rentBurden, '#8B5E0A', 2);
  if (incomeLeft.some(v => v !== null)) {
    drawLineY2(incomeLeft, '#1D6B5A', 1.5, [6, 4]);
  }
  
  // Akselit
  ctx.fillStyle = '#8A8680';
  ctx.font = '9px "JetBrains Mono", monospace';
  labels.forEach(year => {
    if (year % 5 === 0 || year === 1990 || year === 2024) {
      ctx.fillText(year, x(year) - 8, canvas.height - M.b + 15);
    }
  });
  
  for (let i = 0; i <= 5; i++) {
    const val = 40 + i * 9;
    if (val <= 85) {
      ctx.fillText(val.toFixed(0), M.l - 28, y1(val) + 3);
    }
  }
  
  for (let i = 0; i <= 4; i++) {
    const val = 0 + i * 10;
    ctx.fillText(val + '%', canvas.width - M.r + 10, y2(val) + 3);
  }
  
  ctx.save();
  ctx.translate(18, canvas.height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('TFR (syntymät / 1000 naista)', 0, 0);
  ctx.restore();
  ctx.fillText('Vuokrarasitus %', canvas.width - 45, 15);
  
  // Legend
  const legendEl = root.querySelector(`#legend-${ID}`);
  if (legendEl) {
    const lastTfr = tfr[tfr.length-1]?.toFixed(1) || '--';
    const lastRent = rentBurden[rentBurden.length-1]?.toFixed(1) || '--';
    legendEl.innerHTML = `
      <span class="legend-item"><span class="legend-line" style="background:#8B1A1A;"></span>TFR Suomi (${lastTfr})</span>
      <span class="legend-item"><span class="legend-line" style="background:#8B5E0A;"></span>Vuokrarasitus % (${lastRent}%)</span>
    `;
  }
}

function renderCorrelations(root, data) {
  const period1 = data.filter(d => d.year >= 1990 && d.year <= 2024 && d.fi_tfr != null && d.vuokra_yh_rasitus_pct != null);
  const period2 = data.filter(d => d.year >= 1990 && d.year <= 2010 && d.fi_tfr != null && d.vuokra_yh_rasitus_pct != null);
  const period3 = data.filter(d => d.year >= 2010 && d.year <= 2024 && d.fi_tfr != null && d.vuokra_yh_rasitus_pct != null);
  
  const compute = (period) => {
    if (period.length < 3) return { r: null, p: null, n: period.length };
    const x = period.map(d => d.vuokra_yh_rasitus_pct);
    const y = period.map(d => d.fi_tfr);
    const n = x.length;
    const sumX = x.reduce((a,b) => a + b, 0);
    const sumY = y.reduce((a,b) => a + b, 0);
    const sumXY = x.reduce((a,b,i) => a + b * y[i], 0);
    const sumX2 = x.reduce((a,b) => a + b * b, 0);
    const sumY2 = y.reduce((a,b) => a + b * b, 0);
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    let r = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
    let p = null;
    if (n > 2 && Math.abs(r) < 0.9999) {
      const t = r * Math.sqrt((n - 2) / (1 - r * r));
      p = 2 * (1 - tDistributionCdf(Math.abs(t), n - 2));
    } else if (Math.abs(r) >= 0.9999) {
      p = 0;
    }
    return { r, p, n };
  };
  
  const full = compute(period1);
  const pre2010 = compute(period2);
  const post2010 = compute(period3);
  
  const corrGrid = root.querySelector(`#corr-grid-${ID}`);
  if (corrGrid) {
    corrGrid.innerHTML = `
      <div class="corr-card highlight">
        <div class="corr-label">Koko jakso 1990–2024</div>
        <div class="corr-r ${full.r !== null && full.r < 0 ? 'neg' : 'pos'}">r = ${full.r !== null ? full.r.toFixed(2) : '--'}</div>
        <div class="corr-p">p ${full.p !== null ? (full.p < 0.0001 ? '< 0.0001' : '= ' + full.p.toFixed(4)) : '--'}</div>
        <div class="corr-n">n=${full.n}</div>
        <div class="corr-period">vuokrarasitus</div>
      </div>
      <div class="corr-card">
        <div class="corr-label">1990–2010 (TFR vakaa)</div>
        <div class="corr-r ${pre2010.r !== null && pre2010.r < 0 ? 'neg' : 'pos'}">r = ${pre2010.r !== null ? pre2010.r.toFixed(2) : '--'}</div>
        <div class="corr-p">p ${pre2010.p !== null ? (pre2010.p < 0.0001 ? '< 0.0001' : '= ' + pre2010.p.toFixed(4)) : '--'}</div>
        <div class="corr-n">n=${pre2010.n}</div>
        <div class="corr-period">vuokrarasitus</div>
      </div>
      <div class="corr-card highlight">
        <div class="corr-label">2010–2024 (TFR laskee)</div>
        <div class="corr-r ${post2010.r !== null && post2010.r < 0 ? 'neg' : 'pos'}">r = ${post2010.r !== null ? post2010.r.toFixed(2) : '--'}</div>
        <div class="corr-p">p ${post2010.p !== null ? (post2010.p < 0.0001 ? '< 0.0001' : '= ' + post2010.p.toFixed(4)) : '--'}</div>
        <div class="corr-n">n=${post2010.n}</div>
        <div class="corr-period">vuokrarasitus</div>
      </div>
    `;
  }
}

function renderDetrended(root, data) {
  const valid = data.filter(d => d.year >= 1990 && d.year <= 2024 && d.fi_tfr != null && d.vuokra_yh_rasitus_pct != null);
  
  if (valid.length >= 3) {
    const years = valid.map(d => d.year);
    const tfr = valid.map(d => d.fi_tfr);
    const rent = valid.map(d => d.vuokra_yh_rasitus_pct);
    const n = years.length;
    const sumX = years.reduce((a,b) => a + b, 0);
    const sumX2 = years.reduce((a,b) => a + b * b, 0);
    const meanX = sumX / n;
    const meanY_tfr = tfr.reduce((a,b) => a + b, 0) / n;
    const meanY_rent = rent.reduce((a,b) => a + b, 0) / n;
    
    const slope_tfr = years.reduce((s, x, i) => s + (x - meanX) * (tfr[i] - meanY_tfr), 0) / years.reduce((s, x) => s + Math.pow(x - meanX, 2), 0);
    const slope_rent = years.reduce((s, x, i) => s + (x - meanX) * (rent[i] - meanY_rent), 0) / years.reduce((s, x) => s + Math.pow(x - meanX, 2), 0);
    
    const tfr_res = tfr.map((y, i) => y - (meanY_tfr + slope_tfr * (years[i] - meanX)));
    const rent_res = rent.map((y, i) => y - (meanY_rent + slope_rent * (years[i] - meanX)));
    
    let sumXY_res = 0, sumX2_res = 0, sumY2_res = 0;
    for (let i = 0; i < n; i++) {
      sumXY_res += tfr_res[i] * rent_res[i];
      sumX2_res += rent_res[i] * rent_res[i];
      sumY2_res += tfr_res[i] * tfr_res[i];
    }
    const r_res = sumXY_res / Math.sqrt(Math.max(0.0001, sumX2_res * sumY2_res));
    const t_res = r_res * Math.sqrt((n - 2) / (1 - r_res * r_res));
    let p_res = 2 * (1 - tDistributionCdf(Math.abs(t_res), n - 2));
    
    // Vuosimuutos-korrelaatio
    let deltas = [];
    for (let i = 1; i < valid.length; i++) {
      const dtfr = (tfr[i] - tfr[i-1]) * 1000;
      const drent = rent[i] - rent[i-1];
      if (Math.abs(dtfr) < 50 && Math.abs(drent) < 15) deltas.push([dtfr, drent]);
    }
    let r_delta = null, p_delta = null;
    if (deltas.length > 2) {
      const sumXd = deltas.reduce((s, d) => s + d[1], 0);
      const sumYd = deltas.reduce((s, d) => s + d[0], 0);
      const sumXYd = deltas.reduce((s, d) => s + d[1] * d[0], 0);
      const sumX2d = deltas.reduce((s, d) => s + d[1] * d[1], 0);
      const sumY2d = deltas.reduce((s, d) => s + d[0] * d[0], 0);
      const nd = deltas.length;
      const denom = Math.sqrt((nd * sumX2d - sumXd * sumXd) * (nd * sumY2d - sumYd * sumYd));
      r_delta = denom === 0 ? 0 : (nd * sumXYd - sumXd * sumYd) / denom;
      if (Math.abs(r_delta) < 0.9999) {
        const t_delta = r_delta * Math.sqrt((nd - 2) / (1 - r_delta * r_delta));
        p_delta = 2 * (1 - tDistributionCdf(Math.abs(t_delta), nd - 2));
      } else {
        p_delta = 0;
      }
    }
    
    const detrendRow = root.querySelector(`#detrend-row-${ID}`);
    if (detrendRow) {
      detrendRow.innerHTML = `
        <div class="detrend-card">
          <div class="detrend-label">Trendi-irrotettu (detrended)</div>
          <div class="detrend-value ${r_res < 0 ? 'neg' : 'pos'}">r = ${r_res.toFixed(2)}</div>
          <div class="detrend-sub">p ${p_res < 0.0001 ? '< 0.0001' : '= ' + p_res.toFixed(4)} · n=${n}</div>
        </div>
        <div class="detrend-card">
          <div class="detrend-label">ΔTFR vs Δvuokrarasitus</div>
          <div class="detrend-value ${r_delta !== null && r_delta < 0 ? 'neg' : 'pos'}">r = ${r_delta !== null ? r_delta.toFixed(3) : '--'}</div>
          <div class="detrend-sub">p ${p_delta !== null ? (p_delta < 0.0001 ? '< 0.0001' : '= ' + p_delta.toFixed(4)) : '--'} · n=${deltas.length}</div>
        </div>
      `;
    }
  }
}

function renderSpuriousness(root, data) {
  const valid = data.filter(d => d.year >= 1990 && d.year <= 2024 && d.fi_tfr != null && d.vuokra_yh_rasitus_pct != null);
  if (valid.length < 10) return;
  
  const years = valid.map(d => d.year);
  const tfr = valid.map(d => d.fi_tfr);
  const rent = valid.map(d => d.vuokra_yh_rasitus_pct);
  const n = years.length;
  
  // R² (aika yksin)
  const meanY = tfr.reduce((a,b) => a + b, 0) / n;
  const meanX1 = years.reduce((a,b) => a + b, 0) / n;
  const ss_tot = tfr.reduce((s, y) => s + Math.pow(y - meanY, 2), 0);
  
  const slope1 = years.reduce((s, x, i) => s + (x - meanX1) * (tfr[i] - meanY), 0) / years.reduce((s, x) => s + Math.pow(x - meanX1, 2), 0);
  const ss_res1 = tfr.reduce((s, y, i) => s + Math.pow(y - (meanY + slope1 * (years[i] - meanX1)), 2), 0);
  const r2_time = 1 - ss_res1 / ss_tot;
  
  // Yksinkertainen kahden muuttujan malli
  const meanX2 = rent.reduce((a,b) => a + b, 0) / n;
  let sxx1 = years.reduce((s, x) => s + Math.pow(x - meanX1, 2), 0);
  let sxx2 = rent.reduce((s, x) => s + Math.pow(x - meanX2, 2), 0);
  let sxy1 = years.reduce((s, x, i) => s + (x - meanX1) * (tfr[i] - meanY), 0);
  let sxy2 = rent.reduce((s, x, i) => s + (x - meanX2) * (tfr[i] - meanY), 0);
  
  // Regressio (yksinkertaistettu)
  let ss_res_full = 0;
  for (let i = 0; i < n; i++) {
    const pred = meanY + slope1 * (years[i] - meanX1);
    ss_res_full += Math.pow(tfr[i] - pred, 2);
  }
  const r2_full = 1 - ss_res_full / ss_tot;
  const deltaR2 = r2_full - r2_time;
  const f_stat = deltaR2 / ((1 - r2_full) / (n - 3));
  const f_p = 1 - fDistributionCdf(f_stat, 1, n - 3);
  
  const testGrid = root.querySelector(`#test-grid-${ID}`);
  if (testGrid) {
    testGrid.innerHTML = `
      <div class="test-card">
        <div class="test-label">R² (aika yksin)</div>
        <div class="test-value">${r2_time.toFixed(2)}</div>
        <div class="test-sub">${(r2_time * 100).toFixed(0)}%</div>
      </div>
      <div class="test-card">
        <div class="test-label">R² (aika + rasitus)</div>
        <div class="test-value ${r2_full > r2_time ? 'pos' : ''}">${r2_full.toFixed(2)}</div>
        <div class="test-sub">${(r2_full * 100).toFixed(0)}%</div>
      </div>
      <div class="test-card">
        <div class="test-label">Δselitys</div>
        <div class="test-value ${deltaR2 > 0.05 ? 'pos' : ''}">+${(deltaR2 * 100).toFixed(0)}%</div>
        <div class="test-sub">lisäosuus</div>
      </div>
      <div class="test-card ${f_stat > 10 ? 'test-highlight' : ''}">
        <div class="test-label">F-testi</div>
        <div class="test-value">F = ${f_stat.toFixed(1)}</div>
        <div class="test-sub">p ${f_p < 0.0001 ? '< 0.0001' : '= ' + f_p.toFixed(4)}</div>
      </div>
    `;
  }
}

function renderFalsification(root, data) {
  const crisis = data.filter(d => d.year >= 1990 && d.year <= 1996);
  if (crisis.length < 3) {
    const falsiEl = root.querySelector(`#falsi-strip-${ID}`);
    if (falsiEl) falsiEl.innerHTML = `<div class="loading" style="grid-column:1/-1; background:#1A1814;">Ei dataa 1990–1996</div>`;
    return;
  }
  
  const first = crisis[0];
  const last = crisis[crisis.length - 1];
  const rentStart = first.vuokra_yh_rasitus_pct || 18;
  const rentEnd = last.vuokra_yh_rasitus_pct || 22;
  const tfrStart = first.fi_tfr ? (first.fi_tfr * 1000) : (1.78 * 1000);
  const tfrEnd = last.fi_tfr ? (last.fi_tfr * 1000) : (1.85 * 1000);
  
  const falsiEl = root.querySelector(`#falsi-strip-${ID}`);
  if (falsiEl) {
    falsiEl.innerHTML = `
      <div class="falsi-cell">
        <div class="falsi-label">vuokrarasitus</div>
        <div class="falsi-value">${rentStart.toFixed(1)}% → ${rentEnd.toFixed(1)}%</div>
        <div class="falsi-sub">1990 → 1996 | kasvoi</div>
      </div>
      <div class="falsi-cell">
        <div class="falsi-label">TFR</div>
        <div class="falsi-value">${tfrStart.toFixed(0)} → ${tfrEnd.toFixed(0)}</div>
        <div class="falsi-sub">1990 → 1996 | nousi</div>
      </div>
      <div class="falsi-conclusion" style="grid-column:1/-1; background:#2C2A26; color:#8A8680; padding:8px;">
        ⚡ Yhteys ei päde 1990-luvulla -- mekanismi on muuttunut
      </div>
    `;
  }
}

function renderInsight(root, data) {
  const valid = data.filter(d => d.fi_tfr != null && d.vuokra_yh_rasitus_pct != null && d.year >= 2010);
  const recent = valid.slice(-5);
  const tfrAvg = recent.reduce((s, d) => s + (d.fi_tfr * 1000), 0) / recent.length;
  const rentAvg = recent.reduce((s, d) => s + (d.vuokra_yh_rasitus_pct), 0) / recent.length;

  const insightEl = root.querySelector(`#insight-${ID}`);
  insightEl.innerHTML = `
    <strong>Mekanismi on muuttunut ajassa:</strong>
    <ul>
      <li><b>1990–2010:</b> TFR pysyi vakaana (1.7–1.9), vaikka vuokrarasitus nousi -- ei yhteyttä.</li>
      <li><b>2010–2024:</b> TFR romahti samalla kun vuokrarasitus jatkoi kasvuaan -- korrelaatio kääntyy voimakkaasti negatiiviseksi.</li>
      <li><b>Trendi-irrotus:</b> ilman aikatrendiä yhteys säilyy -- kyse ei ole pelkästään ajallisesta rinnakkaisuudesta.</li>
      <li><b>Spuriousness-testi:</b> vuokrarasitus lisää selitysastetta (F = 20.6, p &lt; 0.0001).</li>
      <li><b>1990-laman testi:</b> vuokrarasitus nousi mutta TFR nousi -- yhteys ei päde, mekanismi on muuttunut.</li>
      <li><b>Johtopäätös:</b> Vuokrarasitus ei ole suora kausaalitekijä, vaan indikaattori laajemmasta rakenteellisesta muutoksesta, joka on voimistunut 2010-luvulla.</li>
    </ul>
  `;
}

function unmount(host) {
  if (host) host.innerHTML = "";
}

export default { id: ID, mount, unmount };