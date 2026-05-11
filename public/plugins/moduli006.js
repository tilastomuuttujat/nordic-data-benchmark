// public/plugins/moduli006.js
// Plugin: Asumisen ja syntyvyyden trendi-indeksi
// Yhdistää vuokrarasituksen, käyttövaran ja TFR:n yhdeksi indeksiksi

const ID = "moduli006";

const CSS = `
.plugin-${ID} {
  background: #F8F4EE;
  color: #1A1814;
  font-family: 'Source Serif 4', Georgia, serif;
  max-width: 1000px;
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
.plugin-${ID} .index-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
@media (max-width: 640px) {
  .plugin-${ID} .index-summary { grid-template-columns: 1fr 1fr; }
}
.plugin-${ID} .index-card {
  background: #EDE8E0;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: transform .2s, box-shadow .2s;
}
.plugin-${ID} .index-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.08);
}
.plugin-${ID} .index-card.highlight {
  background: #1A1814;
  color: #F8F4EE;
}
.plugin-${ID} .generation-name {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
}
.plugin-${ID} .index-card.highlight .generation-name {
  color: #F8F4EE;
}
.plugin-${ID} .index-value {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 42px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 8px;
}
.plugin-${ID} .index-value.red { color: #8B1A1A; }
.plugin-${ID} .index-value.yellow { color: #D4A017; }
.plugin-${ID} .index-value.green { color: #1D6B5A; }
.plugin-${ID} .index-card.highlight .index-value { color: #F8F4EE; }
.plugin-${ID} .index-change {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  margin-bottom: 8px;
}
.plugin-${ID} .index-change.up { color: #1D6B5A; }
.plugin-${ID} .index-change.down { color: #8B1A1A; }
.plugin-${ID} .index-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: #8A8680;
}
.plugin-${ID} .index-card.highlight .index-sub {
  color: rgba(248,244,238,0.6);
}
.plugin-${ID} .chart-container {
  background: #F8F4EE;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
}
.plugin-${ID} .chart-canvas {
  width: 100%;
  height: 350px;
}
.plugin-${ID} .legend {
  display: flex;
  gap: 24px;
  justify-content: center;
  margin-top: 16px;
  flex-wrap: wrap;
}
.plugin-${ID} .legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
}
.plugin-${ID} .legend-color {
  width: 20px;
  height: 3px;
  border-radius: 2px;
}
.plugin-${ID} .pillar-section {
  margin: 20px 0;
}
.plugin-${ID} .pillar-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
}
.plugin-${ID} .pillar-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
@media (max-width: 640px) {
  .plugin-${ID} .pillar-grid { grid-template-columns: 1fr; }
}
.plugin-${ID} .pillar-card {
  background: #EDE8E0;
  border-radius: 10px;
  padding: 14px;
}
.plugin-${ID} .pillar-name {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8A8680;
  margin-bottom: 8px;
}
.plugin-${ID} .pillar-value {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}
.plugin-${ID} .pillar-bar {
  height: 4px;
  background: rgba(26,24,20,0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 8px;
}
.plugin-${ID} .pillar-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width .5s ease;
}
.plugin-${ID} .insight {
  background: #1A1814;
  border-radius: 12px;
  padding: 20px;
  color: #F8F4EE;
  margin-top: 20px;
}
.plugin-${ID} .insight-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
}
.plugin-${ID} .insight-text {
  font-size: 14px;
  line-height: 1.6;
  color: rgba(248,244,238,0.8);
}
.plugin-${ID} .insight-text strong {
  color: #F8F4EE;
}
.plugin-${ID} .source {
  color: #8A8680;
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  margin-top: 20px;
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
`;

function ensureStyles() {
  if (document.getElementById("style-" + ID)) return;
  const s = document.createElement("style");
  s.id = "style-" + ID;
  s.textContent = CSS;
  document.head.appendChild(s);
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

// Lasketaan "hyvinvointi-indeksi" (0-100) vuokrarasituksen, käyttövaran ja TFR:n perusteella
// Mitä korkeampi indeksi, sitä parempi tilanne
function calculateWellbeingIndex(row) {
  if (!row) return null;
  
  // TFR-indeksi (0-100, korkeampi on parempi)
  const tfr = row.fi_tfr || 0;
  const tfrIndex = Math.min(100, Math.max(0, (tfr / 1.8) * 100));
  
  // Vuokrarasitus-indeksi (0-100, matalampi on parempi → käännetään)
  const rentBurden = row.vuokra_yh_rasitus_pct || 30;
  const rentIndex = Math.min(100, Math.max(0, (1 - (rentBurden - 20) / 30) * 100));
  
  // Käyttövara-indeksi (0-100, korkeampi on parempi)
  const incomeLeft = row.vuokra_yh_jaljella_eur || 10000;
  const incomeIndex = Math.min(100, Math.max(0, (incomeLeft / 20000) * 100));
  
  // Keskiarvo
  const total = (tfrIndex + rentIndex + incomeIndex) / 3;
  return Math.round(total);
}

function getIndexColor(index) {
  if (index >= 60) return 'green';
  if (index >= 35) return 'yellow';
  return 'red';
}

let chartInstance = null;

async function mount(host, core) {
  console.log("[moduli006] mount kutsuttu");
  ensureStyles();

  host.innerHTML = `
    <section class="plugin-${ID}" aria-label="Asumisen ja syntyvyyden trendi-indeksi">
      <div class="kicker">TTT-analyysi · Trendi-indeksi</div>
      <h3>Asumisen ja syntyvyyden <span style="color:#1D6B5A">trendi-indeksi</span></h3>
      <p class="lead">Yhdistää vuokrarasituksen, käyttövaran ja syntyvyyden yhdeksi pisteeksi (0–100). Mitä korkeampi indeksi, sitä parempi tilanne.</p>
      
      <div class="index-summary" id="index-summary-${ID}">
        <div class="loading"><span class="spinner"></span>Ladataan indeksejä…</div>
      </div>
      
      <div class="chart-container">
        <canvas id="trend-chart-${ID}" class="chart-canvas" height="350"></canvas>
        <div class="legend">
          <div class="legend-item"><div class="legend-color" style="background:#1D6B5A"></div>Hyvinvointi-indeksi (0–100)</div>
          <div class="legend-item"><div class="legend-color" style="background:#8B1A1A"></div>TFR (syntymät / 1000)</div>
          <div class="legend-item"><div class="legend-color" style="background:#D4A017"></div>Vuokrarasitus % (käänteinen)</div>
        </div>
      </div>
      
      <div class="pillar-section">
        <div class="pillar-title">📊 Indikaattorit (2024)</div>
        <div class="pillar-grid" id="indicator-grid-${ID}">
          <div class="loading"><span class="spinner"></span>Ladataan…</div>
        </div>
      </div>
      
      <div class="insight" id="insight-${ID}">
        <div class="insight-title">💡 Mitä tämä kertoo</div>
        <div class="insight-text">Ladataan analyysiä…</div>
      </div>
      
      <div class="source" id="source-${ID}"></div>
    </section>
  `;

  const root = host.querySelector(`.plugin-${ID}`);

  try {
    console.log("[moduli006] ladataan dataa…");
    
    await loadChartJs();
    
    let housingData = [];
    try {
      housingData = await core.data.load("v_housing_fertility_chain.json");
      console.log("[moduli006] data ladattu:", housingData?.length);
    } catch(e) { 
      console.warn("Ei housing dataa");
      housingData = [];
    }
    
    if (!housingData || !housingData.length) {
      throw new Error("v_housing_fertility_chain.json dataa ei löytynyt");
    }
    
    // Järjestä vuosiluvun mukaan
    const sorted = [...housingData].sort((a,b) => a.year - b.year);
    const latest = sorted[sorted.length - 1];
    
    // Laske indeksit jokaiselle vuodelle
    const yearlyData = sorted.map(row => ({
      year: row.year,
      tfr: row.fi_tfr ? (row.fi_tfr * 1000).toFixed(0) : null,
      rentBurden: row.vuokra_yh_rasitus_pct || null,
      incomeLeft: row.vuokra_yh_jaljella_eur || null,
      index: calculateWellbeingIndex(row)
    }));
    
    const latestIndex = yearlyData[yearlyData.length - 1].index;
    
    renderIndexSummary(root, yearlyData, latestIndex);
    renderChart(root, yearlyData);
    renderIndicators(root, latest);
    renderInsight(root, yearlyData, latest);
    
    const sourceEl = root.querySelector(`#source-${ID}`);
    sourceEl.textContent = `Lähteet: v_housing_fertility_chain.json · Indeksi = (TFR-indeksi + vuokrarasitus-indeksi + käyttövara-indeksi) / 3 · Päivitetty ${new Date().toLocaleDateString('fi-FI')}`;
    
    requestAnimationFrame(() => root.classList.add("is-mounted"));
    
  } catch (err) {
    console.error("[moduli006] virhe:", err);
    root.innerHTML = `<div style="padding:24px; color:#8B1A1A; font-family:monospace;">
      <strong>Virhe lisäosassa:</strong><br>${err.message}
      <br><br>Varmista että v_housing_fertility_chain.json on ladattavissa.
    </div>`;
  }
}

function renderIndexSummary(root, yearlyData, latestIndex) {
  const container = root.querySelector(`#index-summary-${ID}`);
  
  const first = yearlyData[0];
  const last = yearlyData[yearlyData.length - 1];
  const change = last.index - first.index;
  const colorClass = getIndexColor(latestIndex);
  const changeClass = change >= 0 ? 'up' : 'down';
  const changeSign = change >= 0 ? '+' : '';
  
  container.innerHTML = `
    <div class="index-card ${latestIndex < 35 ? 'highlight' : ''}">
      <div class="generation-name">Hyvinvointi-indeksi</div>
      <div class="index-value ${colorClass}">${latestIndex}</div>
      <div class="index-change ${changeClass}">${changeSign}${change} pistettä (${first.year} → ${last.year})</div>
      <div class="index-sub">0–100, korkeampi = parempi</div>
    </div>
    <div class="index-card">
      <div class="generation-name">TFR (2024)</div>
      <div class="index-value red">${last.tfr}</div>
      <div class="index-sub">syntymää / 1000 naista</div>
    </div>
    <div class="index-card">
      <div class="generation-name">Vuokrarasitus</div>
      <div class="index-value ${last.rentBurden > 30 ? 'red' : (last.rentBurden > 25 ? 'yellow' : 'green')}">${last.rentBurden}%</div>
      <div class="index-sub">YH alle 35v, netto</div>
    </div>
    <div class="index-card">
      <div class="generation-name">Käyttövara</div>
      <div class="index-value ${last.incomeLeft < 10000 ? 'red' : 'green'}">${last.incomeLeft.toLocaleString('fi-FI')} €</div>
      <div class="index-sub">vuokran jälkeen / vuosi</div>
    </div>
  `;
}

function renderChart(root, yearlyData) {
  const canvas = document.getElementById(`trend-chart-${ID}`);
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const years = yearlyData.map(d => d.year);
  const indices = yearlyData.map(d => d.index);
  const tfrValues = yearlyData.map(d => d.tfr ? parseInt(d.tfr) : null);
  const rentInverse = yearlyData.map(d => d.rentBurden ? 100 - d.rentBurden : null);
  
  if (chartInstance) {
    try { chartInstance.destroy(); } catch(e) {}
    chartInstance = null;
  }
  
  if (typeof Chart === 'undefined') {
    console.error("Chart.js ei ole ladattuna");
    return;
  }
  
  try {
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            label: 'Hyvinvointi-indeksi',
            data: indices,
            borderColor: '#1D6B5A',
            backgroundColor: 'rgba(29,107,90,0.1)',
            borderWidth: 3,
            pointRadius: 5,
            pointBackgroundColor: '#1D6B5A',
            pointBorderColor: '#F8F4EE',
            pointBorderWidth: 2,
            tension: 0.2,
            fill: true,
            yAxisID: 'y'
          },
          {
            label: 'TFR (syntymät / 1000)',
            data: tfrValues,
            borderColor: '#8B1A1A',
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: '#8B1A1A',
            pointBorderColor: '#F8F4EE',
            tension: 0.2,
            fill: false,
            yAxisID: 'y1'
          },
          {
            label: 'Käänteinen vuokrarasitus (100 - %)',
            data: rentInverse,
            borderColor: '#D4A017',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 3,
            pointBackgroundColor: '#D4A017',
            tension: 0.2,
            fill: false,
            yAxisID: 'y'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          tooltip: {
            backgroundColor: '#1A1814',
            titleFont: { family: 'JetBrains Mono', size: 10 },
            bodyFont: { family: 'Source Serif 4', size: 12 }
          },
          legend: { position: 'top', labels: { font: { family: 'JetBrains Mono', size: 10 }, color: '#4A4640', boxWidth: 12 } }
        },
        scales: {
          x: {
            ticks: { font: { family: 'JetBrains Mono', size: 10 }, color: '#8A8680', callback: (v, i) => years[i] % 4 === 0 ? years[i] : '' },
            grid: { color: 'rgba(26,24,20,0.06)' }
          },
          y: {
            position: 'left',
            min: 0,
            max: 100,
            ticks: { font: { family: 'JetBrains Mono', size: 10 }, color: '#8A8680' },
            grid: { color: 'rgba(26,24,20,0.06)' },
            title: { display: true, text: 'Indeksi (0–100)', font: { family: 'JetBrains Mono', size: 9 }, color: '#8A8680' }
          },
          y1: {
            position: 'right',
            min: 40,
            max: 100,
            ticks: { font: { family: 'JetBrains Mono', size: 10 }, color: '#8A8680' },
            grid: { display: false },
            title: { display: true, text: 'TFR (syntymät / 1000)', font: { family: 'JetBrains Mono', size: 9 }, color: '#8A8680' }
          }
        }
      }
    });
  } catch (err) {
    console.error("Chart.js virhe:", err);
  }
}

function renderIndicators(root, latest) {
  const container = root.querySelector(`#indicator-grid-${ID}`);
  
  const tfrIndex = Math.min(100, Math.max(0, (latest.fi_tfr / 1.8) * 100));
  const rentIndex = Math.min(100, Math.max(0, (1 - (latest.vuokra_yh_rasitus_pct - 20) / 30) * 100));
  const incomeIndex = Math.min(100, Math.max(0, (latest.vuokra_yh_jaljella_eur / 20000) * 100));
  
  container.innerHTML = `
    <div class="pillar-card">
      <div class="pillar-name">TFR (syntyvyys)</div>
      <div class="pillar-value">${(latest.fi_tfr * 1000).toFixed(0)}</div>
      <div class="pillar-bar"><div class="pillar-bar-fill" style="width: ${tfrIndex}%; background: #8B1A1A"></div></div>
      <div class="pillar-name" style="margin-top:8px">indeksi: ${Math.round(tfrIndex)}/100</div>
    </div>
    <div class="pillar-card">
      <div class="pillar-name">Vuokrarasitus</div>
      <div class="pillar-value">${latest.vuokra_yh_rasitus_pct}%</div>
      <div class="pillar-bar"><div class="pillar-bar-fill" style="width: ${rentIndex}%; background: #D4A017"></div></div>
      <div class="pillar-name" style="margin-top:8px">indeksi: ${Math.round(rentIndex)}/100</div>
    </div>
    <div class="pillar-card">
      <div class="pillar-name">Käyttövara</div>
      <div class="pillar-value">${Math.round(latest.vuokra_yh_jaljella_eur).toLocaleString('fi-FI')} €</div>
      <div class="pillar-bar"><div class="pillar-bar-fill" style="width: ${incomeIndex}%; background: #1D6B5A"></div></div>
      <div class="pillar-name" style="margin-top:8px">indeksi: ${Math.round(incomeIndex)}/100</div>
    </div>
  `;
}

function renderInsight(root, yearlyData, latest) {
  const container = root.querySelector(`#insight-${ID}`);
  
  const firstYear = yearlyData[0];
  const lastYear = yearlyData[yearlyData.length - 1];
  const indexChange = lastYear.index - firstYear.index;
  const tfrChange = (lastYear.tfr - firstYear.tfr);
  const rentChange = (lastYear.rentBurden - firstYear.rentBurden);
  
  container.innerHTML = `
    <div class="insight-title">💡 Mitä tämä kertoo</div>
    <div class="insight-text">
      <strong>📊 20 vuoden kehitys (${firstYear.year} → ${lastYear.year}):</strong><br>
      • Hyvinvointi-indeksi on ${indexChange >= 0 ? 'noussut' : 'laskenut'} <strong>${Math.abs(indexChange)} pistettä</strong>.<br>
      • TFR on ${tfrChange >= 0 ? 'noussut' : 'laskenut'} <strong>${Math.abs(Math.floor(tfrChange))} syntymää / 1000 naista</strong>.<br>
      • Vuokrarasitus on ${rentChange >= 0 ? 'noussut' : 'laskenut'} <strong>${Math.abs(rentChange).toFixed(1)} prosenttiyksikköä</strong>.<br><br>
      <strong>⚖️ Tulkintaohje:</strong><br>
      Indeksi perustuu kolmeen indikaattoriin (TFR, vuokrarasitus, käyttövara). 
      Korkea indeksi tarkoittaa parempaa kokonaistilannetta. Vuoden 2024 indeksi on <strong>${lastYear.index}</strong>, 
      luokitus: ${lastYear.index >= 60 ? 'hyvä (vihreä)' : (lastYear.index >= 35 ? 'tyydyttävä (keltainen)' : 'heikko (punainen)')}.
    </div>
  `;
}

function unmount(host) {
  if (chartInstance) {
    try { chartInstance.destroy(); } catch(e) {}
    chartInstance = null;
  }
  if (host) host.innerHTML = "";
}

export default { id: ID, mount, unmount };