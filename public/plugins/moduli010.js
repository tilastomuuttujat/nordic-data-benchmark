// public/plugins/moduli010.js
// Plugin: Suomen syntyvyyskriisin aikajana
// Interaktiivinen aikajana yhdistää päätökset, kriisit ja TFR-muutokset

const ID = "moduli010";

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
.plugin-${ID} .timeline-container {
  position: relative;
  margin: 30px 0 20px;
  padding: 20px 0;
}
.plugin-${ID} .timeline-line {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 2px;
  background: linear-gradient(90deg, #1D6B5A, #8B5E0A, #8B1A1A);
  transform: translateY(-50%);
  z-index: 1;
}
.plugin-${ID} .timeline-track {
  position: relative;
  display: flex;
  justify-content: space-between;
  z-index: 2;
  cursor: pointer;
  flex-wrap: wrap;
}
.plugin-${ID} .timeline-node {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 90px;
  cursor: pointer;
  transition: transform .2s;
}
.plugin-${ID} .timeline-node:hover {
  transform: translateY(-4px);
}
.plugin-${ID} .node-year {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  background: #F8F4EE;
  padding: 4px 8px;
  border-radius: 4px;
  margin-bottom: 8px;
}
.plugin-${ID} .node-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #8A8680;
  transition: all .2s;
  box-shadow: 0 0 0 4px #F8F4EE;
}
.plugin-${ID} .timeline-node.active .node-dot {
  width: 24px;
  height: 24px;
  background: #8B1A1A;
  box-shadow: 0 0 0 6px rgba(139,26,26,0.2);
}
.plugin-${ID} .node-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: #8A8680;
  margin-top: 8px;
  text-align: center;
  max-width: 100px;
}
.plugin-${ID} .event-card {
  background: #EDE8E0;
  border-radius: 12px;
  padding: 24px;
  margin: 20px 0 30px;
  transition: opacity .3s;
}
.plugin-${ID} .event-year {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 48px;
  font-weight: 700;
  color: #8B1A1A;
  line-height: 1;
  margin-bottom: 8px;
}
.plugin-${ID} .event-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 16px;
}
.plugin-${ID} .event-desc {
  font-size: 15px;
  line-height: 1.6;
  color: #4A4640;
  margin-bottom: 20px;
}
.plugin-${ID} .event-stats {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  padding: 16px 0;
  border-top: 1px solid rgba(26,24,20,0.1);
  border-bottom: 1px solid rgba(26,24,20,0.1);
}
.plugin-${ID} .event-stat {
  flex: 1;
  min-width: 120px;
}
.plugin-${ID} .stat-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #8A8680;
  margin-bottom: 4px;
}
.plugin-${ID} .stat-value {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 24px;
  font-weight: 700;
}
.plugin-${ID} .stat-value.red { color: #8B1A1A; }
.plugin-${ID} .stat-value.green { color: #1D6B5A; }
.plugin-${ID} .stat-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: #8A8680;
}
.plugin-${ID} .event-chain {
  margin-top: 16px;
  font-size: 12px;
  color: #8A8680;
  font-style: italic;
}
.plugin-${ID} .chart-container {
  margin-top: 20px;
  padding: 16px;
  background: #F8F4EE;
  border-radius: 8px;
}
.plugin-${ID} .chart-canvas {
  width: 100%;
  height: 200px;
}
.plugin-${ID} .legend {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 16px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
}
.plugin-${ID} .legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  display: inline-block;
  margin-right: 4px;
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
  .plugin-${ID} .timeline-track { justify-content: center; gap: 16px; }
  .plugin-${ID} .timeline-line { display: none; }
  .plugin-${ID} .event-stats { flex-direction: column; gap: 12px; }
}
`;

// Aikajanan tapahtumat
const EVENTS = [
  { year: 1990, title: "1990-luvun lama", type: "crisis", desc: "Syvä talouskriisi, työttömyys nousi 15%:iin.", tfr: 1.78, tfrChange: -0.13, chain: "Taloudellinen epävarmuus → lykätty perheenperustaminen" },
  { year: 1995, title: "EU-jäsenyys", type: "policy", desc: "Suomi liittyi Euroopan unioniin. Rakennemuutos vauhdittui.", tfr: 1.71, tfrChange: -0.07, chain: "Markkinoiden avautuminen → kilpailu → epävarmuus" },
  { year: 2000, title: "Varhaiskasvatuksen laajennus", type: "policy", desc: "Subjektiivinen päivähoito-oikeus laajeni.", tfr: 1.85, tfrChange: +0.12, chain: "Päivähoito → työn ja perheen yhteensovittaminen → syntyvyys" },
  { year: 2008, title: "Finanssikriisi", type: "crisis", desc: "Globaali talouskriisi.", tfr: 1.80, tfrChange: -0.05, chain: "Työttömyys → epävarmuus → lykätty perheenperustaminen" },
  { year: 2010, title: "Säästöt opetuksessa", type: "policy", desc: "Leikkaukset koulutukseen. Ryhmäkoot kasvoivat.", tfr: 1.80, tfrChange: -0.05, chain: "Koulutusleikkaukset → nuorten epävarmuus → syntyvyys" },
  { year: 2015, title: "Sote-valmistelu", type: "policy", desc: "Sote-uudistuksen valmistelu alkoi.", tfr: 1.65, tfrChange: -0.15, chain: "Palvelujen uudelleenorganisointi → epävarmuus" },
  { year: 2019, title: "Marinin hallitus", type: "policy", desc: "Hallitusohjelma painotti perhepolitiikkaa.", tfr: 1.35, tfrChange: -0.30, chain: "Koronan varjostama kausi → vaikutukset jäävät nähtäväksi" },
  { year: 2020, title: "Koronapandemia", type: "crisis", desc: "Poikkeusolot, etätyö, rajoitukset.", tfr: 1.30, tfrChange: -0.05, chain: "Poikkeusolot → epävarmuus → syntyvyyslasku" },
  { year: 2024, title: "Nykyhetki", type: "now", desc: "TFR historiallisen matalalla tasolla", tfr: 0.903, tfrChange: -0.40, chain: "Rakenteellinen muutos → nuorten epävarmuus → syntyvyys" }
];

let chartInstance = null;

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
  console.log("[moduli010] mount kutsuttu");
  ensureStyles();

  host.innerHTML = `
    <section class="plugin-${ID}" aria-label="Suomen syntyvyyskriisin aikajana">
      <div class="kicker">TTT-analyysi · Aikajana</div>
      <h3>Suomen syntyvyyskriisin <span style="color:#8B1A1A">aikajana</span></h3>
      <p class="lead">1990–2024: päätökset, kriisit ja muutokset -- ja miten ne ovat yhteydessä syntyvyyteen.</p>
      
      <div class="timeline-container" id="timeline-${ID}">
        <div class="timeline-line"></div>
        <div class="timeline-track" id="timeline-track-${ID}">
          <div class="loading"><span class="spinner"></span>Ladataan aikajanaa…</div>
        </div>
      </div>
      
      <div id="event-card-${ID}" class="event-card">
        <div class="loading"><span class="spinner"></span>Ladataan tapahtumaa…</div>
      </div>
      
      <div class="chart-container">
        <canvas id="timeline-chart-${ID}" class="chart-canvas" height="200"></canvas>
        <div class="legend">
          <span><span class="legend-color" style="background:#8B1A1A"></span>TFR (syntyvyys)</span>
          <span><span class="legend-color" style="background:#D4A017"></span>Aktiivinen tapahtuma</span>
        </div>
      </div>
      
      <div class="source" id="source-${ID}"></div>
    </section>
  `;

  const root = host.querySelector(`.plugin-${ID}`);

  try {
    console.log("[moduli010] ladataan dataa…");
    
    // Lataa Chart.js
    await loadChartJs();
    
    // Yritä hakea oikeaa TFR-dataa jos saatavilla
    let housingData = [];
    try {
      housingData = await core.data.load("v_housing_fertility_chain.json");
      console.log("[moduli010] housing data ladattu:", housingData?.length);
      
      if (housingData && housingData.length) {
        EVENTS.forEach(event => {
          const dataPoint = housingData.find(d => d.year === event.year);
          if (dataPoint && dataPoint.fi_tfr) {
            event.tfr = dataPoint.fi_tfr;
          }
        });
      }
    } catch(e) { console.warn("Ei housing dataa, käytetään oletusarvoja"); }
    
    renderTimeline(root);
    renderChart(root);
    
    const sourceEl = root.querySelector(`#source-${ID}`);
    sourceEl.textContent = `Lähteet: v_housing_fertility_chain.json · Tapahtumat perustuvat historialliseen analyysiin · Päivitetty ${new Date().toLocaleDateString('fi-FI')}`;
    
    requestAnimationFrame(() => root.classList.add("is-mounted"));
    
  } catch (err) {
    console.error("[moduli010] virhe:", err);
    root.innerHTML = `<div style="padding:24px; color:#8B1A1A; font-family:monospace;">
      <strong>Virhe lisäosassa:</strong><br>${err.message}
    </div>`;
  }
}

function renderTimeline(root) {
  const track = root.querySelector(`#timeline-track-${ID}`);
  
  const nodes = EVENTS.map(event => `
    <div class="timeline-node" data-year="${event.year}">
      <div class="node-year">${event.year}</div>
      <div class="node-dot"></div>
      <div class="node-label">${event.title.substring(0, 20)}${event.title.length > 20 ? '…' : ''}</div>
    </div>
  `).join('');
  
  track.innerHTML = nodes;
  
  // Lisää klikkikäsittelijät
  document.querySelectorAll(`#timeline-track-${ID} .timeline-node`).forEach(node => {
    node.addEventListener('click', () => {
      const year = parseInt(node.dataset.year, 10);
      const event = EVENTS.find(e => e.year === year);
      if (event) {
        document.querySelectorAll(`#timeline-track-${ID} .timeline-node`).forEach(n => n.classList.remove('active'));
        node.classList.add('active');
        renderEventCard(root, event);
        highlightChart(year);
      }
    });
  });
  
  // Aktivoi ensimmäinen tapahtuma
  const firstNode = document.querySelector(`#timeline-track-${ID} .timeline-node`);
  if (firstNode) {
    firstNode.classList.add('active');
    renderEventCard(root, EVENTS[0]);
  }
}

function renderEventCard(root, event) {
  const card = root.querySelector(`#event-card-${ID}`);
  const tfrValue = (event.tfr * 1000).toFixed(0);
  const changeClass = event.tfrChange >= 0 ? 'green' : 'red';
  const changeSign = event.tfrChange >= 0 ? '+' : '';
  
  card.innerHTML = `
    <div class="event-year">${event.year}</div>
    <div class="event-title">${event.title}</div>
    <div class="event-desc">${event.desc}</div>
    <div class="event-stats">
      <div class="event-stat">
        <div class="stat-label">TFR</div>
        <div class="stat-value">${tfrValue}</div>
        <div class="stat-sub">syntymää / 1000 naista</div>
      </div>
      <div class="event-stat">
        <div class="stat-label">Muutos</div>
        <div class="stat-value ${changeClass}">${changeSign}${(event.tfrChange * 1000).toFixed(0)}</div>
        <div class="stat-sub">syntymää / 1000 naista</div>
      </div>
      <div class="event-stat">
        <div class="stat-label">Tyyppi</div>
        <div class="stat-value">${event.type === 'crisis' ? '⚠️ Kriisi' : (event.type === 'policy' ? '📋 Päätös' : '📍 Nykyhetki')}</div>
        <div class="stat-sub"></div>
      </div>
    </div>
    <div class="event-chain">🔗 Mekanismi: ${event.chain}</div>
  `;
}

function renderChart(root) {
  const canvas = document.getElementById(`timeline-chart-${ID}`);
  if (!canvas) return;
  
  // Aseta canvas mitat
  const container = canvas.parentElement;
  canvas.width = container.clientWidth || 800;
  canvas.height = 200;
  
  const ctx = canvas.getContext('2d');
  const years = EVENTS.map(e => e.year);
  const tfrValues = EVENTS.map(e => e.tfr * 1000);
  
  if (chartInstance) {
    try { chartInstance.destroy(); } catch(e) {}
    chartInstance = null;
  }
  
  // Tarkista että Chart on ladattu
  if (typeof Chart === 'undefined') {
    console.error("Chart.js ei ole ladattuna");
    return;
  }
  
  try {
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: years,
        datasets: [{
          label: 'TFR (syntymää / 1000 naista)',
          data: tfrValues,
          borderColor: '#8B1A1A',
          backgroundColor: 'rgba(139,26,26,0.05)',
          borderWidth: 2.5,
          pointRadius: 5,
          pointBackgroundColor: years.map(y => y === 2024 ? '#8B1A1A' : '#D4A017'),
          pointBorderColor: '#F8F4EE',
          pointBorderWidth: 2,
          tension: 0.2,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1A1814',
            titleFont: { family: 'JetBrains Mono', size: 10 },
            bodyFont: { family: 'Source Serif 4', size: 12 },
            callbacks: {
              label: (ctx) => `TFR: ${ctx.parsed.y.toFixed(0)} / 1000 naista`
            }
          }
        },
        scales: {
          x: {
            ticks: { font: { family: 'JetBrains Mono', size: 10 }, color: '#8A8680' },
            grid: { display: false }
          },
          y: {
            ticks: { font: { family: 'JetBrains Mono', size: 10 }, color: '#8A8680' },
            grid: { color: 'rgba(26,24,20,0.06)' },
            title: { display: true, text: 'syntymää / 1000 naista', font: { family: 'JetBrains Mono', size: 9 }, color: '#8A8680' }
          }
        }
      }
    });
  } catch (err) {
    console.error("Chart.js virhe:", err);
  }
}

function highlightChart(year) {
  if (!chartInstance || !chartInstance.data) return;
  
  const years = EVENTS.map(e => e.year);
  const highlightIndex = years.indexOf(year);
  
  chartInstance.data.datasets[0].pointBackgroundColor = years.map((_, i) => 
    i === highlightIndex ? '#8B1A1A' : '#D4A017'
  );
  chartInstance.update();
}

function unmount(host) {
  if (chartInstance) {
    try { chartInstance.destroy(); } catch(e) {}
    chartInstance = null;
  }
  if (host) host.innerHTML = "";
}

export default { id: ID, mount, unmount };