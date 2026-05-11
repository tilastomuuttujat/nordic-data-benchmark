// public/plugins/moduli009.js
// Plugin: "Mitä jos" -skenaariotyökalu
// Käyttäjä voi lisätä rahoitusta sektoriin ja nähdä vaikutuksen viiveellä

const ID = "moduli009";

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
.plugin-${ID} .sim-card {
  background: #EDE8E0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}
.plugin-${ID} .sim-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8A8680;
  margin-bottom: 12px;
}
.plugin-${ID} .selector-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  align-items: flex-end;
}
.plugin-${ID} .selector-group {
  flex: 1;
  min-width: 180px;
}
.plugin-${ID} .selector-group label {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.08em;
  color: #8A8680;
  margin-bottom: 6px;
}
.plugin-${ID} select, .plugin-${ID} input {
  width: 100%;
  padding: 10px 12px;
  background: #F8F4EE;
  border: 1px solid rgba(26,24,20,0.15);
  border-radius: 6px;
  font-family: 'Source Serif 4', Georgia, serif;
  font-size: 14px;
  color: #1A1814;
}
.plugin-${ID} input[type="range"] {
  padding: 0;
  accent-color: #1D6B5A;
}
.plugin-${ID} .value-display {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #1D6B5A;
  margin-top: 6px;
  text-align: right;
}
.plugin-${ID} .impact-card {
  background: #1A1814;
  border-radius: 8px;
  padding: 20px;
  color: #F8F4EE;
  margin-top: 20px;
}
.plugin-${ID} .impact-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
}
.plugin-${ID} .impact-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}
.plugin-${ID} .impact-item {
  text-align: center;
}
.plugin-${ID} .impact-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 8px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(248,244,238,0.5);
  margin-bottom: 6px;
}
.plugin-${ID} .impact-value {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 28px;
  font-weight: 700;
  color: #F8F4EE;
}
.plugin-${ID} .impact-unit {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: rgba(248,244,238,0.5);
}
.plugin-${ID} .impact-desc {
  font-size: 12px;
  line-height: 1.5;
  color: rgba(248,244,238,0.7);
  margin-top: 16px;
  padding-top: 16px;
  border-top: 0.5px solid rgba(248,244,238,0.2);
}
.plugin-${ID} .warning {
  background: #FDF3E0;
  border-left: 3px solid #8B5E0A;
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
@media (max-width: 680px) {
  .plugin-${ID} .impact-grid { grid-template-columns: 1fr; gap: 12px; }
  .plugin-${ID} .selector-row { flex-direction: column; }
}
`;

function ensureStyles() {
  if (document.getElementById("style-" + ID)) return;
  const s = document.createElement("style");
  s.id = "style-" + ID;
  s.textContent = CSS;
  document.head.appendChild(s);
}

// Sektorit ja niiden elastisuudet (demo-data, korvataan oikealla datalla)
const SECTORS = {
  varhaiskasvatus: { name: "Varhaiskasvatus", indicator: "TFR (syntyvyys)", baseline: 903, unit: "syntymää / 1000 naista", lag: 8, r: 0.52 },
  perusopetus: { name: "Perusopetus", indicator: "Oppimistulokset (PISA)", baseline: 510, unit: "pistettä", lag: 6, r: 0.48 },
  mielenterveys: { name: "Mielenterveyspalvelut", indicator: "Nuorten masennusdiagnoosit", baseline: 8.2, unit: "%", lag: 3, r: -0.67 },
  asuminen: { name: "Asumistuki", indicator: "Vuokrarasitus %", baseline: 29, unit: "%", lag: 2, r: -0.58 },
  terveys: { name: "Somaattinen terveydenhuolto", indicator: "Hoitoonpääsy (vrk)", baseline: 45, unit: "vrk", lag: 4, r: -0.41 },
  elakkeet: { name: "Eläkemenot", indicator: "Eläkeläisten köyhyysriski", baseline: 12.5, unit: "%", lag: 10, r: -0.35 }
};

async function mount(host, core) {
  console.log("[moduli009] mount kutsuttu");
  ensureStyles();

  host.innerHTML = `
    <section class="plugin-${ID}" aria-label="Mitä jos -skenaariotyökalu">
      <div class="kicker">TTT-analyysi · Skenaariotyökalu</div>
      <h3>Miten jos <span style="color:#1D6B5A">lisäisimme rahoitusta</span>?</h3>
      <p class="lead">Valitse sektori ja säädä rahoituksen lisäystä. Laskuri näyttää olemassa olevien elastisuuksien perusteella, millä viiveellä ja kuinka paljon indikaattori muuttuu.</p>
      
      <div class="sim-card">
        <div class="sim-label">⚙️ VALITSE SKENAARIO</div>
        <div class="selector-row">
          <div class="selector-group">
            <label>Sektori</label>
            <select id="sector-select-${ID}">
              ${Object.entries(SECTORS).map(([key, s]) => `<option value="${key}">${s.name}</option>`).join('')}
            </select>
          </div>
          <div class="selector-group">
            <label>Rahoituksen lisäys (%)</label>
            <input type="range" id="investment-slider-${ID}" min="0" max="100" step="5" value="20">
            <div class="value-display" id="investment-value-${ID}">+20%</div>
          </div>
        </div>
        
        <div class="impact-card" id="impact-card-${ID}">
          <div class="loading"><span class="spinner"></span>Lasketaan vaikutusta…</div>
        </div>
      </div>
      
      <div class="warning" id="warning-${ID}">
        ⚠️ Laskelma perustuu tilastollisiin elastisuuksiin (korrelaatio, ei välttämättä kausaalisuhde). Todellinen vaikutus voi poiketa.
      </div>
      
      <div class="source" id="source-${ID}"></div>
    </section>
  `;

  const root = host.querySelector(`.plugin-${ID}`);
  
  // Hae oikeaa elastisuusdataa jos mahdollista
  let elasticities = [];
  try {
    const elastData = await core.data.load("v_signal_elasticities.json");
    if (elastData && elastData.length) {
      elasticities = elastData;
      console.log("[moduli009] ladattu", elasticities.length, "elastisuutta");
    }
  } catch(e) { console.warn("Ei elastisuusdataa, käytetään oletusarvoja"); }
  
  function updateImpact() {
    const sectorKey = document.getElementById(`sector-select-${ID}`).value;
    const sector = SECTORS[sectorKey];
    const investPct = parseInt(document.getElementById(`investment-slider-${ID}`).value, 10);
    
    document.getElementById(`investment-value-${ID}`).innerHTML = `+${investPct}%`;
    
    // Etsi oikea elastisuus datasta tai käytä oletusta
    let elasticity = sector.r;
    let lag = sector.lag;
    let confidence = "kohtalainen";
    let n = 0;
    
    if (elasticities.length) {
      const match = elasticities.find(e => 
        e.j_code && e.j_code.toLowerCase().includes(sectorKey) ||
        e.indicator_name && e.indicator_name.toLowerCase().includes(sector.indicator.toLowerCase())
      );
      if (match) {
        elasticity = match.r;
        lag = match.lag_years || lag;
        confidence = match.confidence || confidence;
        n = match.n || 0;
      }
    }
    
    // Laske vaikutus
    const effect = (elasticity * investPct / 100);
    const newValue = sector.baseline * (1 + effect);
    const change = newValue - sector.baseline;
    const isPositive = (sector.indicator.includes("TFR") || sector.indicator.includes("PISA") || sector.indicator.includes("hoitoon")) 
      ? change > 0 
      : change < 0;
    
    const impactCard = document.getElementById(`impact-card-${ID}`);
    impactCard.innerHTML = `
      <div class="impact-title">📊 Vaikutusarvio</div>
      <div class="impact-grid">
        <div class="impact-item">
          <div class="impact-label">Nykyarvo</div>
          <div class="impact-value">${sector.baseline}<span class="impact-unit">${sector.unit === 'syntymää / 1000 naista' ? '‰' : sector.unit}</span></div>
          <div class="impact-label" style="margin-top:4px">${sector.indicator}</div>
        </div>
        <div class="impact-item">
          <div class="impact-label">Muutos</div>
          <div class="impact-value ${isPositive ? '' : 'negative'}" style="color:${isPositive ? '#1D6B5A' : '#8B1A1A'}">${change > 0 ? '+' : ''}${change.toFixed(1)}</div>
          <div class="impact-label" style="margin-top:4px">${isPositive ? 'paranee' : 'heikkenee'}</div>
        </div>
        <div class="impact-item">
          <div class="impact-label">Uusi arvo</div>
          <div class="impact-value">${newValue.toFixed(1)}<span class="impact-unit">${sector.unit === 'syntymää / 1000 naista' ? '‰' : sector.unit}</span></div>
          <div class="impact-label" style="margin-top:4px">${investPct}% lisärahoitus</div>
        </div>
      </div>
      <div class="impact-desc">
        <strong>⏱️ Viive: ${lag} vuotta</strong><br>
        Elastisuus r = ${elasticity.toFixed(3)} ${confidence ? `· ${confidence} näyttö` : ''}${n ? ` · n=${n}` : ''}<br>
        Lisäys ${investPct}% → ${sector.indicator.toLowerCase()} ${change > 0 ? 'nousee' : 'laskee'} ${Math.abs(change).toFixed(1)} yksikköä ${lag} vuoden kuluttua.
      </div>
    `;
  }
  
  // Tapahtumakuuntelijat
  document.getElementById(`sector-select-${ID}`).addEventListener('change', updateImpact);
  document.getElementById(`investment-slider-${ID}`).addEventListener('input', updateImpact);
  
  // Alustus
  updateImpact();
  
  const sourceEl = root.querySelector(`#source-${ID}`);
  sourceEl.textContent = `Lähteet: v_signal_elasticities.json · Elastisuus kertoo prosenttimuutoksen vaikutuksen indikaattoriin · Laskelma on suuntaa-antava eikä ota huomioon rakenteellisia muutoksia · Päivitetty ${new Date().toLocaleDateString('fi-FI')}`;
  
  requestAnimationFrame(() => root.classList.add("is-mounted"));
}

function unmount(host) {
  if (host) host.innerHTML = "";
}

export default { id: ID, mount, unmount };