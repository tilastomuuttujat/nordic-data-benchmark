// public/plugins/moduli005.js
// Plugin: Päätös → Asuminen → Syntyvyys -- TTT-analyysi
// Käyttää dataa: v_housing_fertility_chain.json, v_signal_full_chain.json, v_signal_funding_paradox.json

const ID = "moduli005";

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
  max-height: 340px;
}
.plugin-${ID} .chain-grid {
  display: flex;
  flex-direction: column;
}
.plugin-${ID} .chain-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 0;
  border-bottom: 0.5px solid rgba(26,24,20,0.12);
}
.plugin-${ID} .chain-year {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 24px;
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
.plugin-${ID} .chain-body {
  padding: 16px 0 16px 20px;
}
.plugin-${ID} .chain-decision {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 8px;
}
.plugin-${ID} .chain-decision.paradox { color: #8B1A1A; }
.plugin-${ID} .chain-pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.plugin-${ID} .pill {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  padding: 2px 8px;
  border-radius: 2px;
}
.plugin-${ID} .pill-red { background: #F5E0E0; color: #8B1A1A; }
.plugin-${ID} .pill-teal { background: #E8F4F0; color: #1D6B5A; }
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
.plugin-${ID} .chain-interp {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: #8A8680;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.plugin-${ID} .chain-interp::before {
  content: '';
  width: 20px;
  height: 1px;
  background: #8A8680;
}
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
.plugin-${ID} .paradox-table .td-num {
  text-align: right;
  font-family: 'Playfair Display', Georgia, serif;
  font-weight: 700;
}
.plugin-${ID} .paradox-table .td-num.neg { color: #8B1A1A; }
.plugin-${ID} .paradox-table .td-num.pos { color: #1D6B5A; }
.plugin-${ID} .forecast-strip {
  background: #1A1814;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  margin: 16px 0 8px;
}
.plugin-${ID} .forecast-cell {
  background: #1A1814;
  padding: 16px 20px;
}
.plugin-${ID} .forecast-cell.accent { background: #8B1A1A; }
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
.plugin-${ID} .insight {
  background: #EDE8E0;
  border-left: 3px solid #8B1A1A;
  padding: 14px 18px;
  margin: 20px 0 12px;
  font-size: 13px;
  line-height: 1.5;
}
.plugin-${ID} .insight strong { font-family: 'Playfair Display', Georgia, serif; }
.plugin-${ID} .insight ul { margin: 8px 0 0; padding-left: 20px; }
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
  .plugin-${ID} .forecast-strip { grid-template-columns: 1fr; }
  .plugin-${ID} .chain-row { grid-template-columns: 1fr; }
  .plugin-${ID} .chain-year { border-right: none; border-bottom: 1px solid #1A1814; flex-direction: row; justify-content: space-between; }
}
`;

function ensureStyles() {
  if (document.getElementById("style-" + ID)) return;
  const s = document.createElement("style");
  s.id = "style-" + ID;
  s.textContent = CSS;
  document.head.appendChild(s);
}

let chartInstance = null;

function destroyChart() {
  if (chartInstance) {
    try { chartInstance.destroy(); } catch(e) {}
    chartInstance = null;
  }
}

async function mount(host, core) {
  console.log("[moduli005] mount kutsuttu");
  ensureStyles();
  destroyChart();

  host.innerHTML = `
    <section class="plugin-${ID}" aria-label="Päätös → Asuminen → Syntyvyys -analyysi">
      <div class="kicker">TTT-analyysi · Ketjuanalyysi</div>
      <h3>Päätös → Asuminen → <span style="color:#8B1A1A">Syntyvyys</span></h3>
      <p class="lead">Kolme poliittista päätöstä, yksi rahoitusparadoksi ja yksi mitattava tulos: miten asuntopolitiikan laiminlyönti ja leikkaukset muodostavat ketjun, jonka lopussa on Euroopan matalimpia syntyvyyslukuja.</p>
      
      <div class="stat-row" id="stat-row-${ID}">
        <div class="loading"><span class="spinner"></span>Ladataan avainlukuja…</div>
      </div>
      
      <div class="chart-legend" id="legend-${ID}">
        <span class="legend-item"><span class="legend-line" style="background:#8B1A1A"></span>TFR Suomi (vasen)</span>
        <span class="legend-item"><span class="legend-line" style="background:#1D6B5A;opacity:.7"></span>TFR Pohjoismaat ka. (vasen)</span>
        <span class="legend-item"><span class="legend-line" style="background:#8B5E0A"></span>Vuokrarasitus % (oikea)</span>
        <span class="legend-item"><span class="legend-line" style="background:#4A4640;opacity:.5"></span>Jäljelle €/100 (oikea)</span>
      </div>
      <div class="chart-wrap">
        <canvas id="main-chart-${ID}" class="chart-canvas" height="340" style="width:100%; height:340px"></canvas>
      </div>
      
      <div style="font-family:monospace; font-size:10px; margin:24px 0 12px; letter-spacing:.12em">PÄÄTÖSKETJU</div>
      <div class="chain-grid" id="chain-grid-${ID}">
        <div class="loading"><span class="spinner"></span>Ladataan ketjuanalyysiä…</div>
      </div>
      
      <div style="font-family:monospace; font-size:10px; margin:24px 0 12px; letter-spacing:.12em">RAHOITUSPARADOKSI</div>
      <table class="paradox-table" id="paradox-table-${ID}">
        <thead><tr><th>J-koodi</th><th>Nimi</th><th style="text-align:right">Rahoitus Δ%</th><th style="text-align:right">Elastisuus r</th><th style="text-align:right">Paradoksi M€</th><th>Luokka</th></tr></thead>
        <tbody id="paradox-body-${ID}"><tr><td colspan="6" class="loading"><span class="spinner"></span>Ladataan…</td></tr>
        </tbody>
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
    console.log("[moduli005] ladataan dataa…");
    
    const [housing, chain, paradox] = await Promise.all([
      core.data.load("v_housing_fertility_chain.json"),
      core.data.load("v_signal_full_chain.json"),
      core.data.load("v_signal_funding_paradox.json")
    ]);
    
    console.log("[moduli005] data ladattu:", housing?.length, "riviä,", chain?.length, "päätöstä,", paradox?.length, "paradoksia");
    
    if (!housing || !housing.length) {
      throw new Error("v_housing_fertility_chain.json dataa ei löytynyt");
    }
    
    renderStats(root, housing);
    await loadChartJs();
    renderMainChart(root, housing);
    renderChain(root, chain, housing);
    renderParadox(root, paradox);
    renderForecast(root, housing);
    renderInsight(root, housing, chain, paradox);
    
    const sourceEl = root.querySelector(`#source-${ID}`);
    sourceEl.textContent = `Lähteet: v_housing_fertility_chain.json, v_signal_full_chain.json, v_signal_funding_paradox.json · TFR = kokonaishedelmällisyysluku · Päivitetty ${new Date().toLocaleDateString('fi-FI')}`;
    
    requestAnimationFrame(() => root.classList.add("is-mounted"));
    
  } catch (err) {
    console.error("[moduli005] virhe:", err);
    root.innerHTML = `<div style="padding:24px; color:#8B1A1A; font-family:monospace;">
      <strong>Virhe lisäosassa:</strong><br>${err.message}
      <br><br>Varmista että seuraavat data-viewt ovat olemassa:
      <br>• v_housing_fertility_chain.json
      <br>• v_signal_full_chain.json  
      <br>• v_signal_funding_paradox.json
    </div>`;
  }
}

function loadChartJs() {
  return new Promise((resolve, reject) => {
    if (typeof Chart !== 'undefined') {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Chart.js lataus epäonnistui'));
    document.head.appendChild(script);
  });
}

function renderStats(root, data) {
  const latest = data.find(d => d.year === 2024) || data[data.length - 1];
  
  // TFR on kerroin (esim. 0.903), muutetaan syntymiksi/1000 naista kertomalla 1000:lla ja skaalataan
  const tfr = latest.fi_tfr != null ? (latest.fi_tfr * 1000).toFixed(0) : '--';
  const gap = latest.fi_tfr_gap != null ? latest.fi_tfr_gap.toFixed(1) : '--';
  const rent = latest.vuokra_yh_rasitus_pct != null ? latest.vuokra_yh_rasitus_pct + '%' : '--';
  const income = latest.vuokra_yh_jaljella_eur != null 
    ? Math.round(latest.vuokra_yh_jaljella_eur).toLocaleString('fi-FI') + ' €' 
    : '--';
  
  const statRow = root.querySelector(`#stat-row-${ID}`);
  if (statRow) {
    statRow.innerHTML = `
      <div class="stat-card accent-bg">
        <div class="stat-label">TFR ${latest.year || 2024}</div>
        <div class="stat-value">${tfr}</div>
        <div class="stat-sub">syntymää / 1000 naista</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Syntyvyysvaje</div>
        <div class="stat-value negative">${gap}</div>
        <div class="stat-sub">vs. pohjoismaat ka.</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Vuokrarasitus</div>
        <div class="stat-value">${rent}</div>
        <div class="stat-sub">YH alle 35v, netto</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Jäljelle jäävä tulo</div>
        <div class="stat-value ${(latest.vuokra_yh_jaljella_eur || 0) < 10000 ? 'negative' : ''}">${income}</div>
        <div class="stat-sub">vuokran jälkeen / vuosi</div>
      </div>
    `;
  }
}

function renderMainChart(root, data) {
  const canvas = document.getElementById(`main-chart-${ID}`);
  if (!canvas) return;
  
  const sorted = data.filter(d => d.year >= 2002).sort((a,b) => a.year - b.year);
  const labels = sorted.map(d => d.year);
  
  // TFR × 1000 = syntymät / 1000 naista
  const fiTfr = sorted.map(d => d.fi_tfr != null ? d.fi_tfr * 1000 : null);
  const nordicAvg = sorted.map(d => {
    const vals = [d.se_tfr, d.dk_tfr].filter(v => v != null);
    return vals.length ? vals.reduce((a,b) => a + b, 0) / vals.length * 1000 : null;
  });
  const rentBurden = sorted.map(d => d.vuokra_yh_rasitus_pct || null);
  const incomeLeft = sorted.map(d => d.vuokra_yh_jaljella_eur != null ? Math.round(d.vuokra_yh_jaljella_eur / 100) : null);
  
  // Tarkistetaan että Chart.js on ladattu
  if (typeof Chart === 'undefined') {
    console.error("Chart.js ei ladattu");
    return;
  }
  
  try {
    if (chartInstance) chartInstance.destroy();
    
    chartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'TFR Suomi', data: fiTfr, borderColor: '#8B1A1A', borderWidth: 2.5, pointRadius: 0, tension: 0.3, yAxisID: 'y' },
          { label: 'TFR Pohjoismaat', data: nordicAvg, borderColor: '#1D6B5A', borderWidth: 1.5, pointRadius: 0, tension: 0.3, borderDash: [5, 3], yAxisID: 'y' },
          { label: 'Vuokrarasitus %', data: rentBurden, borderColor: '#8B5E0A', borderWidth: 1.5, pointRadius: 2, pointBackgroundColor: '#8B5E0A', tension: 0.3, borderDash: [6, 3], yAxisID: 'y1' },
          { label: 'Jäljelle €/100', data: incomeLeft, borderColor: '#4A4640', borderWidth: 1, pointRadius: 0, tension: 0.3, borderDash: [2, 3], yAxisID: 'y1' }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1A1814', padding: 10,
            titleFont: { family: 'JetBrains Mono', size: 10 },
            bodyFont: { family: 'Source Serif 4', size: 12 },
            callbacks: {
              label: (ctx) => {
                const v = ctx.parsed.y;
                if (v == null) return '';
                if (ctx.dataset.label.includes('TFR')) return `${ctx.dataset.label}: ${v.toFixed(1)}`;
                if (ctx.dataset.label.includes('€')) return `${ctx.dataset.label}: ${(v * 100).toLocaleString('fi-FI')} €`;
                return `${ctx.dataset.label}: ${v.toFixed(1)}%`;
              }
            }
          }
        },
        scales: {
          x: { ticks: { font: { family: 'JetBrains Mono', size: 10 }, color: '#8A8680', callback: (v, i) => labels[i] % 4 === 0 ? labels[i] : '' }, grid: { color: 'rgba(26,24,20,0.06)' } },
          y: { position: 'left', min: 40, max: 85, ticks: { font: { family: 'JetBrains Mono', size: 10 }, color: '#8A8680', callback: v => v.toFixed(0) }, grid: { color: 'rgba(26,24,20,0.06)' } },
          y1: { position: 'right', ticks: { font: { family: 'JetBrains Mono', size: 10 }, color: '#8A8680' }, grid: { display: false } }
        }
      }
    });
  } catch (err) {
    console.error("Chart.js virhe:", err);
  }
}

function renderChain(root, chainData, housingData) {
  const container = root.querySelector(`#chain-grid-${ID}`);
  if (!chainData || !chainData.length) {
    container.innerHTML = '<div class="loading">Ei päätösdataa</div>';
    return;
  }
  
  const housingMap = {};
  housingData.forEach(h => { housingMap[h.year] = h; });
  
  const pillMap = {
    true_paradox: ['pill-red', 'rahoitusparadoksi'],
    weak_return: ['pill-amber', 'heikko tuotto'],
    no_paradox: ['pill-teal', 'ei paradoksia'],
    unknown: ['pill-gray', 'tuntematon']
  };
  
  const sorted = [...chainData].sort((a,b) => b.vuosi - a.vuosi).slice(0, 5);
  
  container.innerHTML = sorted.map(d => {
    const h = housingMap[d.vuosi] || {};
    const isLeikkaus = d.budjettivaikutus_meur < 0;
    const bud = d.budjettivaikutus_meur != null 
      ? (isLeikkaus ? '−' : '+') + Math.abs(d.budjettivaikutus_meur).toLocaleString('fi-FI') + ' M€' 
      : '--';
    const tfrNow = d.fi_tfr != null ? (d.fi_tfr * 1000).toFixed(0) : '--';
    const tfrOut = d.tfr_at_outcome_year != null ? (d.tfr_at_outcome_year * 1000).toFixed(0) : '--';
    const tc = d.tfr_change_decision_to_outcome;
    const taloud = h.taloudellinen_liikkumavara || '--';
    const talCls = taloud === 'kriittinen' ? 'pill-red' : (taloud === 'tiukka' ? 'pill-amber' : 'pill-gray');
    const [prCls, prTxt] = pillMap[d.paradox_relevance] || ['pill-gray', d.paradox_relevance || '--'];
    const isParadox = (d.chain_interpretation || '').includes('paradoksi');
    
    return `
      <div class="chain-row">
        <div class="chain-year">
          ${d.vuosi}
          <span class="chain-year-sub">${bud}</span>
        </div>
        <div class="chain-body">
          <div class="chain-decision${isParadox ? ' paradox' : ''}">${d.decision_title || 'Päätös'}</div>
          <div class="chain-pills">
            <span class="pill ${prCls}">${prTxt}</span>
            <span class="pill ${talCls}">liikkumavara: ${taloud}</span>
            <span class="pill ${isLeikkaus ? 'pill-red' : 'pill-teal'}">${bud}</span>
          </div>
          <div class="chain-indicators">
            <div class="chain-ind"><span class="chain-ind-label">Vuokrarasitus</span><span class="chain-ind-val">${d.vuokra_yh_rasitus_pct != null ? d.vuokra_yh_rasitus_pct + '%' : '--'}</span></div>
            <div class="chain-ind"><span class="chain-ind-label">TFR päätösvuosi</span><span class="chain-ind-val">${tfrNow}</span></div>
            <div class="chain-ind"><span class="chain-ind-label">TFR vaikutusvuosi</span><span class="chain-ind-val ${tc < 0 ? 'neg' : 'pos'}">${tfrOut}</span></div>
            <div class="chain-ind"><span class="chain-ind-label">TFR-muutos</span><span class="chain-ind-val ${tc < 0 ? 'neg' : 'pos'}">${tc != null ? (tc > 0 ? '+' : '') + tc : '--'}</span></div>
          </div>
          <div class="chain-interp">${d.chain_interpretation || '--'}</div>
        </div>
      </div>`;
  }).join('');
}

function renderParadox(root, data) {
  const tbody = root.querySelector(`#paradox-body-${ID}`);
  if (!data || !data.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Ei paradoksidataa</td></tr>';
    return;
  }
  
  const order = { true_paradox: 0, weak_return: 1, inverse_paradox: 2, no_paradox: 3 };
  const sorted = [...data]
    .filter(r => r.paradox_class !== 'insufficient_data')
    .sort((a,b) => (order[a.paradox_class] || 9) - (order[b.paradox_class] || 9))
    .slice(0, 10);
  
  const labels = {
    true_paradox: '<span class="pill pill-red">paradoksi</span>',
    weak_return: '<span class="pill pill-amber">heikko tuotto</span>',
    inverse_paradox: '<span class="pill pill-teal">käänteinen</span>',
    no_paradox: '<span class="pill pill-gray">ei paradoksia</span>'
  };
  
  tbody.innerHTML = sorted.map(r => `
    <tr>
      <td class="td-code">${r.j_code || '--'}</td>
      <td>${r.j_name || '--'}</td>
      <td class="td-num ${(r.funding_change_pct || 0) > 0 ? 'pos' : 'neg'}">${r.funding_change_pct != null ? (r.funding_change_pct > 0 ? '+' : '') + r.funding_change_pct + '%' : '--'}</td>
      <td class="td-num ${(r.elasticity_r || 0) < 0 ? 'neg' : 'pos'}">${r.elasticity_r != null ? r.elasticity_r.toFixed(3) : '--'}</td>
      <td class="td-num">${r.paradox_magnitude_meur != null ? Math.round(r.paradox_magnitude_meur).toLocaleString('fi-FI') + ' M€' : '--'}</td>
      <td>${labels[r.paradox_class] || r.paradox_class}</td>
    </tr>
  `).join('');
}

function renderForecast(root, data) {
  const latest = data.find(d => d.year === 2024) || data[data.length - 1];
  if (!latest) return;
  
  const tfrNow = latest.fi_tfr != null ? (latest.fi_tfr * 1000).toFixed(0) : '--';
  const forecast = latest.tfr_forecast_5y != null ? (latest.tfr_forecast_5y * 1000).toFixed(0) : '--';
  const gap = latest.fi_tfr_gap != null ? latest.fi_tfr_gap.toFixed(1) : '--';
  const needed = tfrNow !== '--' ? (180 - parseInt(tfrNow)).toFixed(0) : '--';
  
  const container = root.querySelector(`#forecast-${ID}`);
  container.innerHTML = `
    <div class="forecast-cell accent">
      <div class="forecast-label">TFR-ennuste 2029</div>
      <div class="forecast-value">${forecast}</div>
      <div class="forecast-sub">r=−0.578, viive 5v</div>
    </div>
    <div class="forecast-cell">
      <div class="forecast-label">Syntyvyysvaje nyt</div>
      <div class="forecast-value">${gap}</div>
      <div class="forecast-sub">per 1000, vs. pohjoismaat</div>
    </div>
    <div class="forecast-cell">
      <div class="forecast-label">Tarvittava TFR-nousu</div>
      <div class="forecast-value">${needed}</div>
      <div class="forecast-sub">pohjoismaiselle tasolle 1.80</div>
    </div>
  `;
}

function renderInsight(root, housing, chain, paradox) {
  const latest = housing.find(d => d.year === 2024) || housing[housing.length - 1];
  const first = housing.find(d => d.year === 2002) || housing[0];
  
  const tfrChange = (first.fi_tfr && latest.fi_tfr) 
    ? ((latest.fi_tfr - first.fi_tfr) * 1000).toFixed(0)
    : '--';
  const rentChange = (first.vuokra_yh_rasitus_pct && latest.vuokra_yh_rasitus_pct)
    ? (latest.vuokra_yh_rasitus_pct - first.vuokra_yh_rasitus_pct).toFixed(0)
    : '--';
  const paradoxCount = paradox?.filter(p => p.paradox_class === 'true_paradox' || p.paradox_class === 'weak_return').length || 0;
  
  const insightEl = root.querySelector(`#insight-${ID}`);
  insightEl.innerHTML = `
    <strong>Mitä tämä kertoo:</strong>
    <ul>
      <li>Vuokrarasitus on kasvanut <strong>${Math.abs(rentChange)} prosenttiyksikköä</strong> (2002 → 2024) -- nuorten aikuisten asumiskustannukset ovat nousseet merkittävästi.</li>
      <li>TFR on laskenut samana aikana <strong>${Math.abs(tfrChange)} syntymää / 1000 naista</strong> (2002 → 2024).</li>
      <li><strong>${paradoxCount} rahoitusparadoksia</strong> havaittu: lisärahoitus ei ole tuottanut odotettuja tuloksia.</li>
      <li><strong>${chain?.length || 0} keskeistä päätöstä</strong> muodostavat ketjun, jossa asuntopolitiikan laiminlyönti heijastuu syntyvyyteen.</li>
      <li><strong>Pohjoismainen syntyvyysvaje</strong> on syventynyt 2000-luvulla -- vuonna 2024 vaje on jo yli 15 syntymää / 1000 naista.</li>
      <li>Ilman rakenteellisia muutoksia syntyvyysvaje pohjoismaihin verrattuna syvenee edelleen.</li>
    </ul>
  `;
}

function unmount(host) {
  destroyChart();
  if (host) host.innerHTML = "";
}

export default { id: ID, mount, unmount };