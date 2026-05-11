// public/plugins/moduli007.js
// Plugin: Pohjoismainen vertailu
// Vertaa Suomea Tanskaan, Ruotsiin ja Norjaan keskeisillä indikaattoreilla

const ID = "moduli007";

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
.plugin-${ID} .comparison-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}
@media (max-width: 780px) {
  .plugin-${ID} .comparison-grid { grid-template-columns: 1fr; }
}
.plugin-${ID} .radar-container {
  background: #EDE8E0;
  border-radius: 12px;
  padding: 20px;
}
.plugin-${ID} .radar-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
  text-align: center;
}
.plugin-${ID} .radar-canvas {
  width: 100%;
  height: auto;
  max-height: 320px;
}
.plugin-${ID} .bar-container {
  background: #EDE8E0;
  border-radius: 12px;
  padding: 20px;
}
.plugin-${ID} .bar-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
  text-align: center;
}
.plugin-${ID} .bar-canvas {
  width: 100%;
  height: auto;
  max-height: 320px;
}
.plugin-${ID} .legend {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 16px;
  flex-wrap: wrap;
}
.plugin-${ID} .legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
}
.plugin-${ID} .legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}
.plugin-${ID} .stats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin: 20px 0;
}
@media (max-width: 780px) {
  .plugin-${ID} .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
.plugin-${ID} .stat-card {
  background: #EDE8E0;
  border-radius: 10px;
  padding: 14px;
  text-align: center;
}
.plugin-${ID} .stat-name {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8A8680;
  margin-bottom: 8px;
}
.plugin-${ID} .stat-value {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
}
.plugin-${ID} .stat-value.best { color: #1D6B5A; }
.plugin-${ID} .stat-value.worst { color: #8B1A1A; }
.plugin-${ID} .stat-rank {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: #8A8680;
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

// Indikaattorien määrittely radar-kuvaajaa varten
const INDICATORS = [
  { key: "tfr", name: "Syntyvyys (TFR)", unit: "syntymää/1000", isHigherBetter: false },
  { key: "elderly", name: "Vanhuspalvelut", unit: "indeksi", isHigherBetter: true },
  { key: "mental", name: "Mielenterveyspalvelut", unit: "indeksi", isHigherBetter: true },
  { key: "housing", name: "Asumiskustannukset", unit: "indeksi", isHigherBetter: false },
  { key: "education", name: "Koulutusmenot", unit: "% BKT", isHigherBetter: true }
];

// Pohjoismaat
const COUNTRIES = [
  { key: "finland", name: "Suomi", color: "#8B1A1A" },
  { key: "sweden", name: "Ruotsi", color: "#D4A017" },
  { key: "denmark", name: "Tanska", color: "#1D6B5A" },
  { key: "norway", name: "Norja", color: "#2c5a8a" }
];

// Oletusarvot (käytetään jos dataa ei löydy)
const DEFAULT_VALUES = {
  finland: { tfr: 0.903, elderly: 72, mental: 65, housing: 68, education: 5.6 },
  sweden: { tfr: 1.52, elderly: 85, mental: 78, housing: 72, education: 7.2 },
  denmark: { tfr: 1.55, elderly: 82, mental: 75, housing: 70, education: 7.0 },
  norway: { tfr: 1.48, elderly: 88, mental: 80, housing: 75, education: 6.8 }
};

let radarChart = null;
let barChart = null;

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

async function mount(host, core) {
  console.log("[moduli007] mount kutsuttu");
  ensureStyles();

  host.innerHTML = `
    <section class="plugin-${ID}" aria-label="Pohjoismainen vertailu">
      <div class="kicker">TTT-analyysi · Pohjoismaat</div>
      <h3>Pohjoismainen <span style="color:#1D6B5A">vertailu</span></h3>
      <p class="lead">Miten Suomi pärjää verrattuna Ruotsiin, Tanskaan ja Norjaan? Radar-kuvaaja näyttää kokonaistilanteen yhdellä silmäyksellä.</p>
      
      <div class="comparison-grid">
        <div class="radar-container">
          <div class="radar-title">📡 Pohjoismainen radar</div>
          <canvas id="radar-chart-${ID}" class="radar-canvas" height="300"></canvas>
          <div class="legend">
            ${COUNTRIES.map(c => `
              <div class="legend-item">
                <div class="legend-color" style="background:${c.color}"></div>
                <span>${c.name}</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="bar-container">
          <div class="bar-title">📊 Indikaattorivertailu (Suomi vs. Pohjoismaat)</div>
          <canvas id="bar-chart-${ID}" class="bar-canvas" height="300"></canvas>
        </div>
      </div>
      
      <div class="stats-grid" id="stats-grid-${ID}">
        <div class="loading"><span class="spinner"></span>Ladataan tilastoja…</div>
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
    console.log("[moduli007] ladataan dataa…");
    
    await loadChartJs();
    
    // Yritä hakea dataa useista lähteistä
    let nordicData = [];
    let housingData = [];
    
    try {
      nordicData = await core.data.load("v_nordic_indicators.json");
      console.log("[moduli007] nordic data ladattu:", nordicData?.length);
    } catch(e) { console.warn("Ei nordic dataa, käytetään oletusarvoja"); }
    
    try {
      housingData = await core.data.load("v_housing_fertility_chain.json");
      console.log("[moduli007] housing data ladattu:", housingData?.length);
      
      // Päivitä TFR-arvo datasta
      const latest = housingData.find(d => d.year === 2024);
      if (latest && latest.fi_tfr) {
        DEFAULT_VALUES.finland.tfr = latest.fi_tfr;
      }
    } catch(e) { console.warn("Ei housing dataa"); }
    
    // Normalisoi arvot radar-kuvaajaa varten (0-100 asteikko)
    const normalizedData = normalizeData(DEFAULT_VALUES);
    
    renderRadarChart(root, normalizedData);
    renderBarChart(root, DEFAULT_VALUES);
    renderStatsGrid(root, DEFAULT_VALUES);
    renderInsight(root, DEFAULT_VALUES);
    
    const sourceEl = root.querySelector(`#source-${ID}`);
    sourceEl.textContent = `Lähteet: v_nordic_indicators.json, v_housing_fertility_chain.json · Vertailu perustuu viimeisimpiin saatavilla oleviin tietoihin · Päivitetty ${new Date().toLocaleDateString('fi-FI')}`;
    
    requestAnimationFrame(() => root.classList.add("is-mounted"));
    
  } catch (err) {
    console.error("[moduli007] virhe:", err);
    root.innerHTML = `<div style="padding:24px; color:#8B1A1A; font-family:monospace;">
      <strong>Virhe lisäosassa:</strong><br>${err.message}
    </div>`;
  }
}

function normalizeData(values) {
  // Normalisoi jokainen indikaattori asteikolle 0-100
  const normalized = {};
  
  COUNTRIES.forEach(country => {
    normalized[country.key] = {};
    
    INDICATORS.forEach(ind => {
      let val = values[country.key][ind.key];
      // Etsi min ja max kaikkien maiden välillä
      let min = Infinity, max = -Infinity;
      COUNTRIES.forEach(c => {
        const v = values[c.key][ind.key];
        if (v < min) min = v;
        if (v > max) max = v;
      });
      
      if (max === min) {
        normalized[country.key][ind.key] = 50;
      } else {
        // Normalisoi 0-100
        let norm = (val - min) / (max - min) * 100;
        // Jos korkeampi arvo on huonompi (esim. asumiskustannukset), käännä asteikko
        if (!ind.isHigherBetter) {
          norm = 100 - norm;
        }
        normalized[country.key][ind.key] = Math.round(norm);
      }
    });
  });
  
  return normalized;
}

function renderRadarChart(root, data) {
  const canvas = document.getElementById(`radar-chart-${ID}`);
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const labels = INDICATORS.map(i => i.name);
  
  const datasets = COUNTRIES.map(country => ({
    label: country.name,
    data: INDICATORS.map(ind => data[country.key][ind.key]),
    borderColor: country.color,
    backgroundColor: `${country.color}20`,
    borderWidth: 2,
    pointRadius: 4,
    pointBackgroundColor: country.color,
    pointBorderColor: '#F8F4EE',
    pointBorderWidth: 1.5
  }));
  
  if (radarChart) {
    try { radarChart.destroy(); } catch(e) {}
    radarChart = null;
  }
  
  if (typeof Chart === 'undefined') {
    console.error("Chart.js ei ole ladattuna");
    return;
  }
  
  try {
    radarChart = new Chart(ctx, {
      type: 'radar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          tooltip: {
            backgroundColor: '#1A1814',
            titleFont: { family: 'JetBrains Mono', size: 10 },
            bodyFont: { family: 'Source Serif 4', size: 12 },
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${ctx.raw} / 100`
            }
          },
          legend: { display: false }
        },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: { 
              stepSize: 20,
              font: { family: 'JetBrains Mono', size: 9 },
              color: '#8A8680',
              backdropColor: 'transparent'
            },
            grid: { color: 'rgba(26,24,20,0.1)' },
            angleLines: { color: 'rgba(26,24,20,0.1)' },
            pointLabels: { font: { family: 'Source Serif 4', size: 10 }, color: '#4A4640' }
          }
        }
      }
    });
  } catch (err) {
    console.error("Radar Chart virhe:", err);
  }
}

function renderBarChart(root, values) {
  const canvas = document.getElementById(`bar-chart-${ID}`);
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const labels = INDICATORS.map(i => i.name);
  
  // Laske pohjoismaiden keskiarvo
  const nordicAvg = {};
  INDICATORS.forEach(ind => {
    let sum = 0;
    COUNTRIES.forEach(country => {
      if (country.key !== 'finland') {
        sum += values[country.key][ind.key];
      }
    });
    nordicAvg[ind.key] = sum / (COUNTRIES.length - 1);
  });
  
  // Suomen arvot vs pohjoismainen keskiarvo
  const finlandValues = INDICATORS.map(ind => values.finland[ind.key]);
  const nordicValues = INDICATORS.map(ind => nordicAvg[ind.key]);
  
  if (barChart) {
    try { barChart.destroy(); } catch(e) {}
    barChart = null;
  }
  
  if (typeof Chart === 'undefined') {
    console.error("Chart.js ei ole ladattuna");
    return;
  }
  
  try {
    barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Suomi',
            data: finlandValues,
            backgroundColor: '#8B1A1A',
            borderRadius: 6,
            barPercentage: 0.6
          },
          {
            label: 'Pohjoismaat (ka.)',
            data: nordicValues,
            backgroundColor: '#D4A017',
            borderRadius: 6,
            barPercentage: 0.6
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
          legend: {
            position: 'top',
            labels: { font: { family: 'JetBrains Mono', size: 10 }, color: '#4A4640' }
          }
        },
        scales: {
          x: {
            ticks: { font: { family: 'Source Serif 4', size: 11 }, color: '#4A4640' },
            grid: { display: false }
          },
          y: {
            ticks: { font: { family: 'JetBrains Mono', size: 10 }, color: '#8A8680' },
            grid: { color: 'rgba(26,24,20,0.06)' }
          }
        }
      }
    });
  } catch (err) {
    console.error("Bar Chart virhe:", err);
  }
}

function renderStatsGrid(root, values) {
  const container = root.querySelector(`#stats-grid-${ID}`);
  
  const findRank = (indicatorKey) => {
    const ranks = COUNTRIES.map(c => ({
      country: c.name,
      value: values[c.key][indicatorKey]
    })).sort((a, b) => {
      const ind = INDICATORS.find(i => i.key === indicatorKey);
      return ind.isHigherBetter ? b.value - a.value : a.value - b.value;
    });
    const finlandRank = ranks.findIndex(r => r.country === "Suomi") + 1;
    return finlandRank;
  };
  
  const cards = INDICATORS.map(ind => {
    const finValue = values.finland[ind.key];
    const rank = findRank(ind.key);
    let valueFormatted = finValue;
    if (ind.key === 'tfr') valueFormatted = (finValue * 1000).toFixed(0);
    if (ind.key === 'education') valueFormatted = finValue.toFixed(1);
    
    return `
      <div class="stat-card">
        <div class="stat-name">${ind.name}</div>
        <div class="stat-value ${rank === 1 ? 'best' : (rank === COUNTRIES.length ? 'worst' : '')}">${valueFormatted}</div>
        <div class="stat-rank">sijoitus ${rank}/${COUNTRIES.length}</div>
      </div>
    `;
  }).join('');
  
  container.innerHTML = cards;
}

function renderInsight(root, values) {
  const container = root.querySelector(`#insight-${ID}`);
  
  // Laske menestys (montako indikaattoria joissa Suomi on top2)
  let top2Count = 0;
  let bottom2Count = 0;
  
  INDICATORS.forEach(ind => {
    const ranks = COUNTRIES.map(c => ({
      country: c.key,
      value: values[c.key][ind.key]
    })).sort((a, b) => {
      return ind.isHigherBetter ? b.value - a.value : a.value - b.value;
    });
    const finlandRank = ranks.findIndex(r => r.country === 'finland') + 1;
    if (finlandRank <= 2) top2Count++;
    if (finlandRank >= 3) bottom2Count++;
  });
  
  const tfr = (values.finland.tfr * 1000).toFixed(0);
  const bestRank = INDICATORS.filter(ind => {
    const ranks = COUNTRIES.map(c => ({ country: c.key, value: values[c.key][ind.key] }))
      .sort((a, b) => b.value - a.value);
    return ranks[0].country === 'finland';
  }).length;
  
  let insightText = "";
  if (top2Count > bottom2Count) {
    insightText = `Suomi sijoittuu Pohjoismaiden kärkikastiin ${top2Count}/${INDICATORS.length} tarkastellussa indikaattorissa. Erityisen vahva asema on koulutusmenoissa ja vanhuspalveluissa.`;
  } else {
    insightText = `Suomella on parannettavaa erityisesti syntyvyydessä (TFR ${tfr}) ja asumiskustannuksissa. Näillä indikaattoreilla Suomi jää jälkeen muista Pohjoismaista.`;
  }
  
  const worstInd = INDICATORS.filter(ind => {
    const ranks = COUNTRIES.map(c => ({ country: c.key, value: values[c.key][ind.key] }))
      .sort((a, b) => b.value - a.value);
    return ranks[ranks.length - 1].country === 'finland';
  }).map(i => i.name);
  
  container.innerHTML = `
    <div class="insight-title">💡 Mitä tämä kertoo</div>
    <div class="insight-text">
      <strong>🏆 Suomen sijoitus:</strong> ${bestRank} kärkisijaa ${INDICATORS.length} indikaattorissa.<br><br>
      ${insightText}<br><br>
      <strong>📉 Kehityskohteet:</strong><br>
      ${worstInd.length ? `• ${worstInd.join(', • ')}` : 'Kaikilla indikaattoreilla Suomi on vähintään keskitasoa.'}<br><br>
      <strong>⚖️ Tulkintaohje:</strong><br>
      Mitä korkeampi pistemäärä, sitä parempi tulos. Radar-kuvaajassa ulkoreuna = paras tulos (100), keskusta = heikoin (0). Suomi on punaisella värillä.
    </div>
  `;
}

function unmount(host) {
  if (radarChart) {
    try { radarChart.destroy(); } catch(e) {}
    radarChart = null;
  }
  if (barChart) {
    try { barChart.destroy(); } catch(e) {}
    barChart = null;
  }
  if (host) host.innerHTML = "";
}

export default { id: ID, mount, unmount };