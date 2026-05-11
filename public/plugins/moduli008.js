// public/plugins/moduli008.js
// Plugin: Kriisisignaalien varoitusvalo
// Näyttää keskeiset indikaattorit liikennevaloina (punainen/keltainen/vihreä)

const ID = "moduli008";

const CSS = `
.plugin-${ID} {
  background: #F8F4EE;
  color: #1A1814;
  font-family: 'Source Serif 4', Georgia, serif;
  max-width: 900px;
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
.plugin-${ID} .traffic-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
@media (max-width: 640px) {
  .plugin-${ID} .traffic-grid { grid-template-columns: 1fr; }
}
.plugin-${ID} .traffic-card {
  background: #EDE8E0;
  border-radius: 12px;
  padding: 20px;
  transition: transform .2s, box-shadow .2s;
}
.plugin-${ID} .traffic-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.plugin-${ID} .card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.plugin-${ID} .card-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 18px;
  font-weight: 700;
  color: #1A1814;
}
.plugin-${ID} .traffic-light {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
.plugin-${ID} .traffic-light.red {
  background: #8B1A1A;
  color: white;
  box-shadow: 0 0 8px rgba(139,26,26,0.5);
}
.plugin-${ID} .traffic-light.yellow {
  background: #D4A017;
  color: #1A1814;
  box-shadow: 0 0 8px rgba(212,160,23,0.5);
}
.plugin-${ID} .traffic-light.green {
  background: #1D6B5A;
  color: white;
  box-shadow: 0 0 8px rgba(29,107,90,0.5);
}
.plugin-${ID} .card-value {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 32px;
  font-weight: 700;
  margin: 12px 0 8px;
}
.plugin-${ID} .card-compare {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #8A8680;
  margin-bottom: 12px;
}
.plugin-${ID} .card-trend {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  padding-top: 12px;
  border-top: 0.5px solid rgba(26,24,20,0.1);
}
.plugin-${ID} .card-trend.up { color: #1D6B5A; }
.plugin-${ID} .card-trend.down { color: #8B1A1A; }
.plugin-${ID} .summary {
  background: #1A1814;
  border-radius: 12px;
  padding: 20px;
  color: #F8F4EE;
  margin-top: 8px;
}
.plugin-${ID} .summary-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
}
.plugin-${ID} .summary-text {
  font-size: 14px;
  line-height: 1.6;
  color: rgba(248,244,238,0.8);
}
.plugin-${ID} .summary-text strong {
  color: #F8F4EE;
}
.plugin-${ID} .warning {
  background: #FDF3E0;
  border-left: 3px solid #D4A017;
  padding: 12px 16px;
  margin-top: 16px;
  font-size: 12px;
  color: #8B5E0A;
  font-family: 'JetBrains Mono', monospace;
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

// Indikaattorien määrittely
const INDICATORS = [
  {
    id: "tfr",
    name: "Kokonaishedelmällisyys",
    unit: "syntymää / 1000 naista",
    baseline: 903,
    threshold_green: 1600,    // yli 1.6 -> vihreä
    threshold_yellow: 1400,   // 1.4-1.6 -> keltainen
    isLowerBetter: false,
    nordicAvg: 1550,
    description: "Syntyvyyden taso. Pohjoismainen keskiarvo ~1.55."
  },
  {
    id: "rent",
    name: "Vuokrarasitus",
    unit: "% tuloista",
    baseline: 29,
    threshold_green: 25,
    threshold_yellow: 30,
    isLowerBetter: true,
    nordicAvg: 22,
    description: "Alle 35-vuotiaiden yksinasuvien vuokramenot suhteessa nettotuloihin."
  },
  {
    id: "mental",
    name: "Mielenterveyspalvelut",
    unit: "hoitoonpääsy (vrk)",
    baseline: 45,
    threshold_green: 30,
    threshold_yellow: 45,
    isLowerBetter: true,
    nordicAvg: 28,
    description: "Keskimääräinen odotusaika mielenterveyspalveluihin."
  },
  {
    id: "employment",
    name: "Työllisyysaste",
    unit: "%",
    baseline: 72,
    threshold_green: 75,
    threshold_yellow: 70,
    isLowerBetter: false,
    nordicAvg: 78,
    description: "15–64-vuotiaiden työllisyysaste."
  }
];

async function mount(host, core) {
  console.log("[moduli008] mount kutsuttu");
  ensureStyles();

  host.innerHTML = `
    <section class="plugin-${ID}" aria-label="Kriisisignaalien varoitusvalo">
      <div class="kicker">TTT-analyysi · Tilannekuva</div>
      <h3>Kriisisignaalien <span style="color:#8B1A1A">varoitusvalo</span></h3>
      <p class="lead">Nopea tilannekuva: mitkä hyvinvoinnin osa-alueet ovat kriittisimmät juuri nyt. Vertailukohtana pohjoismainen keskiarvo.</p>
      
      <div class="traffic-grid" id="traffic-grid-${ID}">
        <div class="loading"><span class="spinner"></span>Ladataan indikaattoreita…</div>
      </div>
      
      <div class="summary" id="summary-${ID}">
        <div class="loading"><span class="spinner"></span>Lasketaan yhteenvetoa…</div>
      </div>
      
      <div class="warning">
        ⚠️ Liikennevalot perustuvat vertailuun pohjoismaiden keskiarvoon. Punainen = kriittinen, keltainen = varautuminen, vihreä = hyvä.
      </div>
      
      <div class="source" id="source-${ID}"></div>
    </section>
  `;

  const root = host.querySelector(`.plugin-${ID}`);

  try {
    console.log("[moduli008] ladataan dataa…");
    
    // Yritä ladata dataa useista lähteistä
    let housingData = [];
    let nordicData = [];
    
    try {
      housingData = await core.data.load("v_housing_fertility_chain.json");
      console.log("[moduli008] housing data ladattu:", housingData?.length);
    } catch(e) { console.warn("Ei housing dataa"); }
    
    try {
      nordicData = await core.data.load("v_nordic_indicators.json");
      console.log("[moduli008] nordic data ladattu:", nordicData?.length);
    } catch(e) { console.warn("Ei nordic dataa, käytetään oletusarvoja"); }
    
    // Hae viimeisin vuosi
    const latest = housingData?.length 
      ? housingData.sort((a,b) => b.year - a.year)[0] 
      : null;
    
    // Päivitä indikaattorien arvot datasta
    if (latest) {
      if (latest.fi_tfr) INDICATORS.find(i => i.id === "tfr").baseline = latest.fi_tfr * 1000;
      if (latest.vuokra_yh_rasitus_pct) INDICATORS.find(i => i.id === "rent").baseline = latest.vuokra_yh_rasitus_pct;
      
      // Pohjoismaiset vertailuarvot
      if (latest.se_tfr && latest.dk_tfr) {
        const nordicTfr = (latest.se_tfr + latest.dk_tfr) / 2 * 1000;
        INDICATORS.find(i => i.id === "tfr").nordicAvg = nordicTfr;
      }
    }
    
    renderTrafficLights(root);
    renderSummary(root);
    
    const sourceEl = root.querySelector(`#source-${ID}`);
    sourceEl.textContent = `Lähteet: v_housing_fertility_chain.json, v_nordic_indicators.json · Liikennevalot perustuvat pohjoismaiden keskiarvoon · Päivitetty ${new Date().toLocaleDateString('fi-FI')}`;
    
    requestAnimationFrame(() => root.classList.add("is-mounted"));
    
  } catch (err) {
    console.error("[moduli008] virhe:", err);
    root.innerHTML = `<div style="padding:24px; color:#8B1A1A; font-family:monospace;">
      <strong>Virhe lisäosassa:</strong><br>${err.message}
    </div>`;
  }
}

function renderTrafficLights(root) {
  const grid = root.querySelector(`#traffic-grid-${ID}`);
  
  const cards = INDICATORS.map(ind => {
    const value = ind.baseline;
    let status, color, emoji;
    
    // Määritä tila vertailuarvon perusteella
    if (ind.isLowerBetter) {
      if (value <= ind.threshold_green) {
        status = "green";
        emoji = "🟢";
        color = "green";
      } else if (value <= ind.threshold_yellow) {
        status = "yellow";
        emoji = "🟡";
        color = "yellow";
      } else {
        status = "red";
        emoji = "🔴";
        color = "red";
      }
    } else {
      if (value >= ind.threshold_green) {
        status = "green";
        emoji = "🟢";
        color = "green";
      } else if (value >= ind.threshold_yellow) {
        status = "yellow";
        emoji = "🟡";
        color = "yellow";
      } else {
        status = "red";
        emoji = "🔴";
        color = "red";
      }
    }
    
    // Laske ero pohjoismaiseen keskiarvoon
    const diff = value - ind.nordicAvg;
    const diffText = diff > 0 
      ? `+${diff.toFixed(1)} vs. pohjoismaat` 
      : `${diff.toFixed(1)} vs. pohjoismaat`;
    const isBetter = (ind.isLowerBetter && diff < 0) || (!ind.isLowerBetter && diff > 0);
    
    return `
      <div class="traffic-card">
        <div class="card-header">
          <span class="card-title">${ind.name}</span>
          <div class="traffic-light ${status}">${emoji}</div>
        </div>
        <div class="card-value">${typeof value === 'number' ? value.toFixed(1) : value} <span style="font-size:14px">${ind.unit}</span></div>
        <div class="card-compare">${diffText} (pohj. ka. ${ind.nordicAvg.toFixed(1)})</div>
        <div class="card-trend ${isBetter ? 'up' : 'down'}">
          ${isBetter ? '📈 Parempi' : '📉 Heikompi'} kuin pohjoismainen keskiarvo
        </div>
      </div>
    `;
  }).join('');
  
  grid.innerHTML = cards;
}

function renderSummary(root) {
  const summaryEl = root.querySelector(`#summary-${ID}`);
  
  // Laske kuinka monta punaista, keltaista ja vihreää
  let reds = 0, yellows = 0, greens = 0;
  
  INDICATORS.forEach(ind => {
    const value = ind.baseline;
    if (ind.isLowerBetter) {
      if (value <= ind.threshold_green) greens++;
      else if (value <= ind.threshold_yellow) yellows++;
      else reds++;
    } else {
      if (value >= ind.threshold_green) greens++;
      else if (value >= ind.threshold_yellow) yellows++;
      else reds++;
    }
  });
  
  const total = INDICATORS.length;
  const crisisLevel = reds >= 2 ? "kriittinen" : (reds >= 1 ? "varautuminen" : "vakaa");
  const crisisColor = reds >= 2 ? "#8B1A1A" : (reds >= 1 ? "#D4A017" : "#1D6B5A");
  
  let crisisText = "";
  if (reds >= 2) {
    crisisText = `⚠️ Järjestelmässä on ${reds} kriittistä hälytystä. Erityisesti syntyvyys ja asumiskustannukset vaativat välittömiä toimia.`;
  } else if (reds >= 1) {
    crisisText = `🟡 Varautuminen suositeltavaa. ${reds} indikaattori on keltaisella vyöhykkeellä -- kehitystä on seurattava.`;
  } else {
    crisisText = `🟢 Tilanne on vakaa. Kaikki indikaattorit ovat vihreällä vyöhykkeellä suhteessa pohjoismaihin.`;
  }
  
  summaryEl.innerHTML = `
    <div class="summary-title">📋 YHTEENVETO</div>
    <div class="summary-text">
      <strong>Kriisitaso:</strong> <span style="color:${crisisColor}">${crisisLevel.toUpperCase()}</span><br>
      🟢 Vihreä: ${greens}/${total} · 🟡 Keltainen: ${yellows}/${total} · 🔴 Punainen: ${reds}/${total}<br><br>
      ${crisisText}
    </div>
  `;
}

function unmount(host) {
  if (host) host.innerHTML = "";
}

export default { id: ID, mount, unmount };