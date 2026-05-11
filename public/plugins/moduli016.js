// public/plugins/moduli016.js
// Plugin: Elinkaarikoordinaatisto — TTT-analyysi
// Generoitu koordinaatisto-v23.html:stä.
// CSS scopattu .plugin-moduli016-juureen, DOM-viittaukset root-pohjaisiksi.

const ID = "moduli016";

const CSS = `.plugin-moduli016 {
  --bg:       #F2EFE8;
  --paper:    #FAF8F3;
  --ink:      #1C1C1A;
  --ink-2:    #4A4A46;
  --ink-3:    #8A8A84;
  --ink-4:    #BDBDB6;
  --gold:     #8A6510;
  --gold-bg:  rgba(138,101,16,0.10);
  --purple:   #534AB7;
  --purple-bg:#EEEDFE;
  --teal:     #1D9E75;
  --teal-bg:  #E1F5EE;
  --amber:    #BA7517;
  --amber-bg: #FAEEDA;
  --coral:    #D85A30;
  --coral-bg: #FAECE7;
  --border:   rgba(28,28,26,0.10);
  --border-md:rgba(28,28,26,0.18);
  --r:        6px;
  --r-lg:     12px;
  --serif:    'Instrument Serif', Georgia, serif;
  --mono:     'JetBrains Mono', monospace;
  --sans:     'DM Sans', ui-sans-serif, system-ui, sans-serif;
}

.plugin-moduli016 *, .plugin-moduli016 *::before, .plugin-moduli016 *::after { box-sizing: border-box; margin: 0; padding: 0; }
.plugin-moduli016 { scroll-behavior: smooth; }
.plugin-moduli016 {
  background: var(--bg);
  color: var(--ink);
  font-family: var(--sans);
  font-size: 14px;
  line-height: 1.6;
  min-height: 100vh;
}

/* ── HEADER ─────────────────────────── */
.plugin-moduli016 header {
  background: var(--paper);
  border-bottom: 0.5px solid var(--border-md);
  padding: 1.25rem 2rem;
  display: flex;
  align-items: baseline;
  gap: 1.5rem;
  position: sticky;
  top: 0;
  z-index: 100;
}
.plugin-moduli016 .h-eyebrow {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink-3);
}
.plugin-moduli016 .h-title {
  font-family: var(--serif);
  font-size: 20px;
  color: var(--ink);
  line-height: 1.2;
}
.plugin-moduli016 .h-status {
  margin-left: auto;
  font-family: var(--mono);
  font-size: 10px;
  color: var(--ink-4);
  display: flex;
  align-items: center;
  gap: 6px;
}
.plugin-moduli016 .h-dot { width:6px;height:6px;border-radius:50%;background:var(--ink-4); }
.plugin-moduli016 .h-dot.live { background: var(--teal); }

/* ── MAIN ────────────────────────────── */
.plugin-moduli016 main { max-width: 1200px; margin: 0 auto; padding: 2rem 2rem 4rem; }

.plugin-moduli016 .lede {
  font-family: var(--serif);
  font-style: italic;
  font-size: 15px;
  color: var(--ink-2);
  max-width: 680px;
  margin-bottom: 2rem;
  line-height: 1.6;
}

/* ── LEGEND ──────────────────────────── */
.plugin-moduli016 .legend {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
  padding: 0 0 0 110px;
}
.plugin-moduli016 .legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-3);
}
.plugin-moduli016 .legend-bar { width: 8px; height: 12px; border-radius: 2px; }

/* ── AXIS LABELS ─────────────────────── */
.plugin-moduli016 .axis-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  padding: 0 0 0 110px;
}
.plugin-moduli016 .axis-label {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-4);
}

/* ── GRID WRAP ───────────────────────── */
.plugin-moduli016 .grid-outer {
  display: grid;
  grid-template-columns: 106px 1fr;
  grid-template-rows: 1fr 44px;
  gap: 0;
  margin-bottom: 1.5rem;
}

.plugin-moduli016 .y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 0 10px 0 0;
  border-right: 0.5px solid var(--border-md);
}
.plugin-moduli016 .y-label {
  font-family: var(--sans);
  font-size: 10px;
  font-weight: 500;
  color: var(--ink-2);
  text-align: right;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--r);
  transition: background 0.12s, color 0.12s;
  line-height: 1.25;
}
.plugin-moduli016 .y-label:hover { background: var(--gold-bg); color: var(--gold); }
.plugin-moduli016 .y-label .age-tag {
  display: block;
  font-size: 9px;
  color: var(--ink-4);
  font-family: var(--mono);
  letter-spacing: 0.05em;
}

.plugin-moduli016 .cells {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(9, 1fr);
  gap: 3px;
  padding-left: 10px;
  min-height: 540px;
}

.plugin-moduli016 .cell {
  border-radius: var(--r);
  border: 0.5px solid var(--border);
  background: var(--paper);
  cursor: pointer;
  transition: all 0.14s;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  min-height: 52px;
}
.plugin-moduli016 .cell:hover { border-color: var(--gold); background: var(--gold-bg); z-index: 2; }
.plugin-moduli016 .cell.selected { border-color: var(--ink); background: var(--ink); z-index: 3; }
.plugin-moduli016 .cell.has-data::after {
  content:'';
  position:absolute;
  top:4px;right:4px;
  width:5px;height:5px;
  border-radius:50%;
  background:var(--teal);
}
.plugin-moduli016 .cell.live-data::before {
  content:'';
  position:absolute;
  bottom:4px;right:4px;
  width:4px;height:4px;
  border-radius:50%;
  background:var(--purple);
  opacity:0.7;
}
.plugin-moduli016 .cell-angles {
  display:flex;
  gap:2px;
  align-items:flex-end;
  height:16px;
}
.plugin-moduli016 .cell-bar {
  width:4px;
  border-radius:2px;
  display:block;
}

.plugin-moduli016 .x-axis {
  grid-column:2;
  display:flex;
  padding-left:10px;
  border-top:0.5px solid var(--border-md);
  padding-top:6px;
}
.plugin-moduli016 .x-label {
  font-family:var(--mono);
  font-size:10px;
  color:var(--ink-3);
  flex:1;
  text-align:center;
  letter-spacing:0.04em;
}

/* ── PHASE BANDS ─────────────────────── */
.plugin-moduli016 .phase-band {
  position: absolute;
  left: 0; right: 0; top: 0; bottom: 0;
  border-radius: var(--r);
  pointer-events: none;
  opacity: 0.06;
}

/* ── DETAIL PANEL ────────────────────── */
.plugin-moduli016 .detail {
  background: var(--paper);
  border: 0.5px solid var(--border-md);
  border-radius: var(--r-lg);
  overflow: hidden;
  margin-bottom: 1.5rem;
  animation: slideIn 0.18s ease;
}
@keyframes slideIn {
  from { opacity:0; transform:translateY(6px); }
  to   { opacity:1; transform:translateY(0); }
}
.plugin-moduli016 .detail-header {
  padding: 0.875rem 1.25rem;
  background: var(--ink);
  color: #FAF8F3;
  display: flex;
  align-items: baseline;
  gap: 1rem;
  flex-wrap: wrap;
}
.plugin-moduli016 .detail-title { font-family:var(--serif); font-size:18px; line-height:1.2; }
.plugin-moduli016 .detail-sub { font-family:var(--mono); font-size:10px; color:rgba(250,248,243,0.55); letter-spacing:0.06em; }
.plugin-moduli016 .detail-meta {
  margin-left: auto;
  display: flex;
  gap: 10px;
  align-items: center;
}
.plugin-moduli016 .detail-signal {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.06em;
  color: rgba(250,248,243,0.4);
}

.plugin-moduli016 .detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:0; }
.plugin-moduli016 .angle-block {
  padding:1rem 1.25rem;
  border-right:0.5px solid var(--border);
  border-bottom:0.5px solid var(--border);
  cursor:pointer;
  transition:background 0.1s;
}
.plugin-moduli016 .angle-block:hover { background:rgba(28,28,26,0.025); }
.plugin-moduli016 .angle-block:nth-child(2n) { border-right:none; }
.plugin-moduli016 .angle-block:nth-child(3),
.plugin-moduli016 .angle-block:nth-child(4) { border-bottom:none; }
.plugin-moduli016 .angle-pill {
  display:inline-flex;
  align-items:center;
  gap:5px;
  font-family:var(--mono);
  font-size:9px;
  letter-spacing:0.08em;
  text-transform:uppercase;
  padding:3px 8px;
  border-radius:20px;
  margin-bottom:0.5rem;
}
.plugin-moduli016 .pill-s { background:var(--purple-bg); color:var(--purple); }
.plugin-moduli016 .pill-e { background:var(--teal-bg);   color:var(--teal); }
.plugin-moduli016 .pill-c { background:var(--amber-bg);  color:var(--amber); }
.plugin-moduli016 .pill-u { background:var(--coral-bg);  color:var(--coral); }
.plugin-moduli016 .angle-q {
  font-family:var(--serif);
  font-size:13px;
  font-style:italic;
  color:var(--ink);
  margin-bottom:0.4rem;
  line-height:1.4;
}
.plugin-moduli016 .angle-body { font-size:12.5px; color:var(--ink-2); line-height:1.55; margin-bottom:0.5rem; }
.plugin-moduli016 .angle-example {
  font-family:var(--mono);
  font-size:10px;
  color:var(--ink-3);
  border-left:2px solid var(--border-md);
  padding-left:0.5rem;
  line-height:1.4;
}

/* Live signal strip */
.plugin-moduli016 .signal-strip {
  display: flex;
  gap: 0;
  border-top: 0.5px solid var(--border);
  background: rgba(28,28,26,0.02);
}
.plugin-moduli016 .signal-item {
  flex: 1;
  padding: 0.6rem 1rem;
  border-right: 0.5px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.plugin-moduli016 .signal-item:last-child { border-right: none; }
.plugin-moduli016 .signal-label { font-family:var(--mono); font-size:9px; color:var(--ink-4); text-transform:uppercase; letter-spacing:0.08em; }
.plugin-moduli016 .signal-value { font-family:var(--mono); font-size:12px; color:var(--ink-2); font-weight:500; }
.plugin-moduli016 .signal-bar-wrap { height:3px; background:var(--border); border-radius:2px; margin-top:3px; }
.plugin-moduli016 .signal-bar-fill { height:3px; border-radius:2px; transition: width 0.4s ease; }

.plugin-moduli016 .empty-state {
  padding: 2rem;
  text-align: center;
  color: var(--ink-4);
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.06em;
}

/* ── KRIISIKERROS ────────────────────────────────────────────────── */
.plugin-moduli016 .cell.crisis-hit  { box-shadow: inset 0 0 0 1.5px rgba(200,60,30,0.40); }
.plugin-moduli016 .cell.crisis-wake { box-shadow: inset 0 0 0 1.5px rgba(180,120,20,0.40); }
.plugin-moduli016 .cell.crisis-hit::before  { content:''; position:absolute; inset:0; background:rgba(200,60,30,0.06); border-radius:var(--r); pointer-events:none; }
.plugin-moduli016 .cell.crisis-wake::before { content:''; position:absolute; inset:0; background:rgba(180,120,20,0.06); border-radius:var(--r); pointer-events:none; }

.plugin-moduli016 .crisis-panel {
  background:var(--paper); border:0.5px solid var(--border-md);
  border-radius:var(--r-lg); overflow:hidden; margin-bottom:1.5rem;
}
.plugin-moduli016 .crisis-tabs {
  display:flex; gap:0; border-bottom:0.5px solid var(--border-md);
  background:rgba(28,28,26,0.03); overflow-x:auto;
}
.plugin-moduli016 .crisis-tab {
  font-family:var(--mono); font-size:10px; letter-spacing:0.06em;
  color:var(--ink-3); padding:0.6rem 1rem; cursor:pointer;
  border:none; border-bottom:2px solid transparent;
  white-space:nowrap; background:none;
  transition:color 0.1s, border-color 0.1s;
}
.plugin-moduli016 .crisis-tab:hover { color:var(--ink); }
.plugin-moduli016 .crisis-tab.active { color:var(--ink); border-bottom-color:#C0392B; }
.plugin-moduli016 .sev { display:inline-block; width:7px; height:7px; border-radius:50%; margin-right:4px; vertical-align:middle; }
.plugin-moduli016 .sev-5{background:#C0392B;} .sev-4{background:#E67E22;}
.plugin-moduli016 .sev-3{background:#F1C40F;} .sev-2{background:#2ECC71;}

.plugin-moduli016 .crisis-body { padding:1.25rem; display:none; }
.plugin-moduli016 .crisis-body.active { display:block; }
.plugin-moduli016 .crisis-meta { display:flex; gap:1.5rem; flex-wrap:wrap; margin-bottom:0.875rem; }
.plugin-moduli016 .crisis-stat { display:flex; flex-direction:column; gap:2px; }
.plugin-moduli016 .crisis-stat-label { font-family:var(--mono); font-size:9px; color:var(--ink-4); text-transform:uppercase; letter-spacing:0.08em; }
.plugin-moduli016 .crisis-stat-value { font-family:var(--mono); font-size:13px; color:var(--ink); font-weight:500; }
.plugin-moduli016 .crisis-text { font-size:13px; color:var(--ink-2); line-height:1.6; margin-bottom:0.75rem; }
.plugin-moduli016 .crisis-mechanism { font-family:var(--mono); font-size:11px; color:var(--ink-3); border-left:2px solid #C0392B; padding-left:0.75rem; line-height:1.5; margin-bottom:0.75rem; }
.plugin-moduli016 .crisis-policy { font-size:12px; color:var(--ink-3); line-height:1.5; }

.plugin-moduli016 .chain-list { display:flex; flex-direction:column; gap:0.5rem; margin-top:0.875rem; }
.plugin-moduli016 .chain-item { background:rgba(28,28,26,0.03); border-radius:var(--r); padding:0.6rem 0.875rem; }
.plugin-moduli016 .chain-title { font-size:12px; font-weight:500; color:var(--ink); margin-bottom:0.35rem; }
.plugin-moduli016 .chain-steps { display:flex; align-items:center; gap:4px; flex-wrap:wrap; margin-bottom:0.25rem; }
.plugin-moduli016 .chain-step { font-family:var(--mono); font-size:9px; color:var(--ink-3); background:var(--paper); border:0.5px solid var(--border-md); border-radius:4px; padding:2px 6px; }
.plugin-moduli016 .chain-arrow { color:var(--ink-4); font-size:10px; }
.plugin-moduli016 .chain-lag { font-family:var(--mono); font-size:9px; color:var(--amber); background:var(--amber-bg); border-radius:4px; padding:2px 5px; }
.plugin-moduli016 .chain-meta { display:flex; gap:6px; align-items:center; }
.plugin-moduli016 .chain-conf { font-family:var(--mono); font-size:9px; padding:2px 6px; border-radius:4px; }
.plugin-moduli016 .conf-vahva{background:var(--teal-bg);color:var(--teal);}
.plugin-moduli016 .conf-kohtalainen{background:var(--amber-bg);color:var(--amber);}
.plugin-moduli016 .conf-heikko{background:var(--coral-bg);color:var(--coral);}
.plugin-moduli016 .chain-lag-total { font-family:var(--mono); font-size:9px; color:var(--ink-4); }

/* Phase color coding on y-labels */
.plugin-moduli016 .phase-lapsuus .y-label-inner        { border-left: 2px solid #3A9AD9; padding-left:4px; }
.plugin-moduli016 .phase-murrosika .y-label-inner      { border-left: 2px solid #5B8FC9; padding-left:4px; }
.plugin-moduli016 .phase-itsenaistymine .y-label-inner { border-left: 2px solid #7C6AB5; padding-left:4px; }
.plugin-moduli016 .phase-perustaminen .y-label-inner   { border-left: 2px solid #2A9E7A; padding-left:4px; }
.plugin-moduli016 .phase-rakentaminen .y-label-inner   { border-left: 2px solid #C07020; padding-left:4px; }
.plugin-moduli016 .phase-siirtuma .y-label-inner       { border-left: 2px solid #C05A30; padding-left:4px; }
.plugin-moduli016 .phase-vapautuminen .y-label-inner   { border-left: 2px solid #7C8A30; padding-left:4px; }
.plugin-moduli016 .phase-sopeutuminen .y-label-inner   { border-left: 2px solid #5A7A9A; padding-left:4px; }
.plugin-moduli016 .phase-riippuvuus .y-label-inner     { border-left: 2px solid #8A5A7A; padding-left:4px; }
`;

const HTML = `<div class="plugin-moduli016">
<header>
  <div>
    <div class="h-eyebrow">TTT-analyysi · Elinkaarikoordinaatisto</div>
    <div class="h-title">Suomalainen hyvinvointi elämänvaiheittain</div>
  </div>
  <div class="h-status">
    <span class="h-dot" id="statusDot"></span>
    <span id="statusText">Ladataan…</span>
  </div>
</header>

<main>
  <p class="lede">Koordinaatisto tarkastelee suomalaista hyvinvointijärjestelmää seitsemän elämänvaiheen ja kuuden aikakauden risteyspisteissä — neljästä tulokulmasta: rakenteellinen, taloudellinen, kulttuurinen ja subjektiivinen.</p>

  <!-- Väestöpainepalkki -->
  <div id="demoPressureBar" style="margin-bottom:1.5rem;"></div>

  <div class="legend">
    <div class="legend-item"><span class="legend-bar" style="background:#534AB7"></span>Rakenteellinen</div>
    <div class="legend-item"><span class="legend-bar" style="background:#1D9E75"></span>Taloudellinen</div>
    <div class="legend-item"><span class="legend-bar" style="background:#BA7517"></span>Kulttuurinen</div>
    <div class="legend-item"><span class="legend-bar" style="background:#D85A30"></span>Subjektiivinen</div>
    <div class="legend-item" style="margin-left:auto"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#1D9E75;margin-right:4px;"></span>Sisältöä</div>
    <div class="legend-item"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#534AB7;margin-right:4px;"></span>Live-data</div>
  </div>

  <div class="axis-label-row">
    <div class="axis-label">← Elinkaaren vaihe (y)</div>
    <div class="axis-label">Aikakausi (x) →</div>
  </div>

  <div class="grid-outer">
    <div class="y-axis" id="yAxis"></div>
    <div class="cells" id="cells"></div>
    <div></div>
    <div class="x-axis" id="xAxis"></div>
  </div>

  <div id="crisisPanel"></div>
  <div id="detailMount"></div>
</main>

</div>`;

let _instance = null;

async function mount(host, core) {
  if (!document.getElementById("style-" + ID)) {
    const s = document.createElement("style");
    s.id = "style-" + ID;
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  host.innerHTML = HTML;
  const root = host.querySelector(".plugin-" + ID);
  if (!root) {
    console.error("[" + ID + "] root puuttuu");
    return;
  }

  try {
    (function() {

// ── SUPABASE (sama konfiguraatio kuin alkuperäisessä) ─────────────
const SUPA_URL = 'https://yjkabgtbcgvrfqtewtna.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlqa2FiZ3RiY2d2cmZxdGV3dG5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MDc4MDYsImV4cCI6MjA2MDk4MzgwNn0.t0wex7sGsFGC_NNRoAz1Y7dNYWLxQq9JksTN0R_U8Oo';

// ── ELÄMÄNVAIHEET (9 kpl) ─────────────────────────────────────────
const CLUSTERS = [
  {
    id: 'lapsuus',
    label: 'Lapsuus',
    age: '0–12 v',
    phase: 'lapsuus',
    supaWeights: { lapsuus: 0.95, kaikille: 0.05 },
    theme: 'Kasvu, varhaiskasvatus, koulu'
  },
  {
    id: 'murrosika',
    label: 'Murrosikä',
    age: '13–17 v',
    phase: 'murrosika',
    supaWeights: { lapsuus: 0.50, nuoruus: 0.45, kaikille: 0.05 },
    theme: 'Identiteetti, koulu, vertaissuhteet'
  },
  {
    id: 'itsenaistymine',
    label: 'Itsenäistyminen',
    age: '18–24 v',
    phase: 'itsenaistymine',
    supaWeights: { nuoruus: 0.75, tyoika: 0.20, lapsuus: 0.05 },
    theme: 'Koulutus, ammatti, ensiaskeleet'
  },
  {
    id: 'perustaminen',
    label: 'Perustaminen',
    age: '25–34 v',
    phase: 'perustaminen',
    supaWeights: { nuoruus: 0.35, tyoika: 0.60, lapsuus: 0.05 },
    theme: 'Perhe, asunto, vakiintuminen'
  },
  {
    id: 'rakentaminen',
    label: 'Rakentaminen',
    age: '35–54 v',
    phase: 'rakentaminen',
    supaWeights: { tyoika: 0.90, nuoruus: 0.05, vanhuus: 0.05 },
    theme: 'Ura, vauraus, vastuut'
  },
  {
    id: 'siirtuma',
    label: 'Siirtymä',
    age: '55–64 v',
    phase: 'siirtuma',
    supaWeights: { tyoika: 0.60, vanhuus: 0.40 },
    theme: 'Työkyvyn muutos, varhe'
  },
  {
    id: 'vapautuminen',
    label: 'Vapautuminen',
    age: '65–74 v',
    phase: 'vapautuminen',
    supaWeights: { vanhuus: 0.70, tyoika: 0.20, kaikille: 0.10 },
    theme: 'Aktiivinen eläkeläisyys'
  },
  {
    id: 'sopeutuminen',
    label: 'Sopeutuminen',
    age: '75–84 v',
    phase: 'sopeutuminen',
    supaWeights: { vanhuus: 0.85, kaikille: 0.15 },
    theme: 'Ikääntyminen, palvelutarve'
  },
  {
    id: 'riippuvuus',
    label: 'Riippuvuus',
    age: '85+ v',
    phase: 'riippuvuus',
    supaWeights: { vanhuus: 0.95, kaikille: 0.05 },
    theme: 'Hoiva, elämän päätös'
  },
];

const PERIODS = [
  { id:'p1', label:'1960–70', desc:'Rakentaminen',  years:[1960,1979] },
  { id:'p2', label:'1980-l.', desc:'Ekspansio',     years:[1980,1989] },
  { id:'p3', label:'90-lama', desc:'Kriisi',        years:[1990,1999] },
  { id:'p4', label:'2000-l.', desc:'Uudistukset',   years:[2000,2009] },
  { id:'p5', label:'2010-l.', desc:'Sote-uudistus', years:[2010,2019] },
  { id:'p6', label:'2020→',   desc:'Nykytila',      years:[2020,2026] },
];

// ── SISÄLTÖ ───────────────────────────────────────────────────────
const CONTENT = {

  // ── LAPSUUS (0–12) ───────────────────────────────────────────────
  lapsuus_p1: {
    has: true,
    struct: { q:'Mitkä rakenteet luotiin lapsuuden tueksi?', body:'Neuvolajärjestelmä laajeni kattamaan koko ikäluokan. Lastensuojelulaki uudistettiin. Lapsilisälaki 1948 oli ensimmäinen universaali perhe-etuus. Päivähoitolaki 1973 toi subjektiivisen hoito-oikeuden.', example:'Äitiyspakkaus 1938 → neuvolajärjestelmä → päivähoidon laajennus 1973: valtio kantoi vastuun portaittain.' },
    econ: { q:'Miten lapsuus rahoitettiin?', body:'Lapsilisä merkittävin suora tulonsiirto. Kuntien vastuu varhaiskasvatuksen rahoituksesta kasvoi. Äitiysraha kehittyi. Päiväkoti-investoinnit suhteessa BKT:hen korkeimmat koskaan.', example:'Lapsilisä 1948: ensimmäinen universaali etuus — kaikille lapsille taustasta riippumatta.' },
    cult: { q:'Mitä lapsuudessa pidettiin normaalina?', body:'Äitiys yhdistyi tiukasti kodin piiriin. Isyys etäinen rooli. Lapsi perheen yksityisasiana — julkinen vastuu vasta muotoutumassa. Suuret ikäluokat syntyivät.', example:'Sota-ajan jälkeen syntyi 100 000+ lasta vuodessa — lapsuus kollektiivinen kokemus.' },
    subj: { q:'Miltä lapsuus tuntui?', body:'Sota-ajan jälkeinen lapsuus niukkaa mutta yhteisöllistä. Lapsikuolleisuus laski dramaattisesti. Ulkoleikkiminen, naapurusto ja kylä olivat lapsuuden ympäristö.', example:'1950-luvun lapsi eli todennäköisemmin aikuiseksi kuin koskaan — neuvolajärjestelmä pelasti.' },
  },
  lapsuus_p2: {
    has: true,
    struct: { q:'Miten lapsuuden rakenteet vakiintuivat?', body:'Subjektiivinen päivähoito-oikeus valmisteltiin. Koululainsäädäntö uudistui. Lastensuojelu professionalisoitui. Peruskoulussa alettiin kiinnittää huomiota erityisoppilaiden tarpeisiin.', example:'Subjektiivinen päivähoito-oikeus toteutui 1996 — mutta valmistelu alkoi jo 1980-luvulla.' },
    econ: { q:'Lapsiperheet 1980-luvun vauraudessa?', body:'Lapsilisät nousivat reaalisesti. Kotihoidontuki luotiin 1985 — arvopoliittisesti latautunut valinta. Päiväkodin maksut kohtuulliset. Omistusasunto perheillä yleistyi.', example:'Kotihoidontuki 1985: konservatiivinen valinta vai feministinen rakenne? Debatti jatkuu edelleen.' },
    cult: { q:'Muuttuivatko lapsuuden normit?', body:'Naisten työssäkäynti normalisoitui — lapsi ei sitonut äitiä kotiin. Keskiluokkaistumisen lapsuus: harrastukset, lomamatkat, omat huoneet. Lapsikeskeisyys kasvoi.', example:'1980-luvulla syntynyt lapsi kasvoi todennäköisemmin kahden ansaitsijan perheessä kuin koskaan aiemmin.' },
    subj: { q:'Miltä 1980-luvun lapsuus tuntui?', body:'Turvallisin ja vauraimmin aika suomalaisen lapsen historiassa. Eriarvoisuus vielä maltillista. Ulkona leikkiminen ja naapuruston lapset keskeinen osa arkea.', example:'Tutkimukset: 1980-luvulla syntyneet kokevat lapsuutensa poikkeuksellisen turvalliseksi.' },
  },
  lapsuus_p3: {
    has: true,
    struct: { q:'Miten lama muutti lapsuuden rakenteita?', body:'Subjektiivinen päivähoito-oikeus säilyi poliittisena prioriteettina. Kouluterveydenhuolto supistui. Lastensuojelun asiakasmäärät kasvoivat rajusti. Lapsilisäleikkaukset 1992–1995.', example:'Lapsiköyhyys kaksinkertaistui 1990-luvulla: 5% → 12% vuosikymmenessä.' },
    econ: { q:'Lama lapsen näkökulmasta?', body:'Vanhempien pitkäaikaistyöttömyys siirtyi lasten arkeen. Kuntien talous romahtia vaikutti koulujen resursseihin. Kirpputorit ja ruokapankki palasivat perheisiin.', example:'1990-luvun lapset kertovat tutkimuksissa vanhempien ahdingon näkymisestä konkreettisesti arjessa.' },
    cult: { q:'Muuttuiko käsitys lapsuudesta lamassa?', body:'Lama synnytti pelon tulevaisuudesta. Lasten mahdollisuuksien kaventuminen koettiin häpeällisenä. "Epävarmuuden sukupolvi" — isovanhempien sota-ajan kokemus palasi.', example:'Sanonta: "sota-ajan lapset ja lamasukupolven lapset" — yhteinen kokemus niukkuudesta.' },
    subj: { q:'Miltä lapsuus tuntui lamassa?', body:'Konkreettinen niukkuus: harrastusten lopettaminen, pienemmät joululahjat, vanhempien ahdistuksen aistiminen. Lapsilla ei ollut sanoja tälle, mutta keho muisti.', example:'Neuropsykologinen tutkimus: 1990-luvun lama jätti mitattavan stressijäljen 1985–1995 syntyneiden aivoihin.' },
  },
  lapsuus_p4: {
    has: true,
    struct: { q:'Miten lapsuuden palvelut uudistuivat 2000-luvulla?', body:'Lastensuojelulaki uudistui 2007 — ehkäisevä ote vahvistui. Neuvolatoiminta yhtenäistettiin. Varhaiskasvatuksen laatu nousi agendalle. Aamu- ja iltapäivätoiminta koululaisille.', example:'Lastensuojelulaki 2007: ennaltaehkäisy reaktiivisuuden rinnalle — iso periaatteellinen muutos.' },
    econ: { q:'Lapsiperheet talouskasvun vuosina?', body:'Lapsilisät nousivat. Päivähoidon maksujen asteikko uudistui. Yksityinen päivähoito yleistyi palvelusetelin myötä. Perheen tulot kasvoivat — lapsuus materiaalisesti turvatumpaa.', example:'Palveluseteli 2004: markkinalogiikka tuli varhaiskasvatukseen ensimmäistä kertaa.' },
    cult: { q:'Mikä muuttui lapsuuden kulttuurissa?', body:'"Helicopter parenting" rantautui. Lapsen oikeudet nousivat diskurssiin. Isät alkoivat olla läsnä arjessa. Digisukupolvi: internet alkoi muovata lapsuutta.', example:'2000-luvulla syntyneet: ensimmäinen sukupolvi jonka lapsuudessa älypuhelin oli läsnä.' },
    subj: { q:'Miltä 2000-luvun lapsuus tuntui?', body:'Turvallisuudentunne palasi laman jälkeen. Materiaalisesti paras lapsuus ikinä — mutta screen time alkoi korvata ulkoleikin. Harrastuksista tuli yhä organisoidumpia.', example:'Tutkimus 2008: lasten ulkoleikkiaika puolittunut 20 vuodessa — strukturoitu tekeminen lisääntyi.' },
  },
  lapsuus_p5: {
    has: true,
    struct: { q:'Varhaiskasvatuslaki 2018 — mitä muuttui?', body:'Varhaiskasvatuslaki uudistettiin kokonaan. Pedagoginen painotus vahvistui. Henkilöstön kelpoisuusvaatimukset tiukentuivat. Kaksivuotinen esiopetus käynnistyi kokeiluna.', example:'Subjektiivinen päivähoito-oikeus palautettiin 2016 — 2010-luvun leikkauksesta peruttiin.' },
    econ: { q:'Lapsiperheet 2010-luvun säästökuureissa?', body:'Päivähoidon ryhmäkokoja kasvatettiin. Lapsilisät leikattiin 2015. Koulujen ryhmäkoot kasvoivat — resurssit vähenivät. Erityisopetuksen saatavuus heikkeni.', example:'Lapsilisäleikkaukset 2015: -8% reaaliarvosta. Vastus oli voimakasta mutta enemmistö löytyi.' },
    cult: { q:'Mikä oli lapsuuden kulttuurinen paikka 2010-luvulla?', body:'Mielenterveysongelmat lapsilla alkoivat kasvaa. Somen paine nuoriin konkretisoitui jo ala-asteella. Yksinäisyys nousi huolestuttavaksi trendiksi.', example:'THL 2017: Kouluterveyskysely osoitti ahdistuksen ja masennuksen kasvua jo peruskouluikäisillä.' },
    subj: { q:'Miltä 2010-luvun lapsuus tuntui?', body:'Tabletti ja älypuhelin normalisoituivat jo alle kouluikäisillä. Sosiaalinen media muutti vertaissuhteita. Toisaalta: materiaalisesti parempi lapsuus kuin koskaan.', example:'Ruutuaika 2015: 7–12-vuotiaat viettivät keskimäärin 3h/pv ruudun edessä — enemmän kuin ulkona.' },
  },
  lapsuus_p6: {
    has: true,
    struct: { q:'Missä lapsuuden rakenteet ovat nyt?', body:'Sote-uudistus 2023 siirsi lastensuojelun hyvinvointialueille. Perhevapaaremuraus 2022. Kaksivuotinen esiopetus laajenee. Neuvolat säilyivät kunnilla — rakenteellinen ristiriita.', example:'Hyvinvointialueet 2023: lastensuojelu siirtyi kunnilta — koordinaatio-ongelmat alkoivat välittömästi.' },
    econ: { q:'Lapsiperheet 2020-luvulla?', body:'COVID-19 iski: etäkoulu, sulkutoimet, mielenterveysongelmat. Inflaatio 2022–2023 söi ostovoimaa. Lasten mielenterveyspalveluiden jonot yli 6 kk yleistyivät.', example:'Suomen syntyvyys 2023: 1,26 — alhaisin koskaan. Lapsiperheiden poliittinen paino vähenee.' },
    cult: { q:'Mikä on lapsuuden kulttuurinen asema nyt?', body:'Lapsuus harvinaistuva — syntyvyys ennätysalhainen. Lapsiperheiden poliittinen paino vähenee kun heitä on vähemmän. Ilmastoahdistus jo lasten kokemana.', example:'Tutkimus 2023: 40% lapsista huolissaan ilmastonmuutoksesta — uusi lapsuuden ahdistuksen lähde.' },
    subj: { q:'Miltä lapsuus tuntuu nyt?', body:'Lasten mielenterveyskriisi on konkreettinen. Materiaaliset olot paremmat kuin koskaan — mutta psyykkinen kuorma kasvussa. Yksinäisyys, some-paine, ilmastoahdistus.', example:'Lasten mielenterveyspalvelut 2024: resurssit eivät vastaa kysyntää millään hyvinvointialueella.' },
  },

  // ── MURROSIKÄ (13–17) ────────────────────────────────────────────
  murrosika_p1: {
    has: true,
    struct: { q:'Miten murrosikäisten polkuja rakennettiin?', body:'Peruskouluuudistus 1972 yhtenäisti yläkoulun kaikille. Ennen rinnakkaiskoulujärjestelmä erotti oppikoulun ja kansalaiskoulun — se poistui. Ammatilliset polut avautuivat laajemmin.', example:'Peruskoulu 1972: radikaali tasa-arvoteko — sama koulu kaikille 7.–9.-luokalle taustasta riippumatta.' },
    econ: { q:'Miten murrosiän koulutus rahoitettiin?', body:'Maksuton peruskoulu universaali. Oppikirjat ja kouluateria maksuttomia. Koululaisen arki ei vaatinut perheen rahaa — tasa-arvon käytännön toteutus.', example:'Maksuton kouluateria 1948 alkaen: yksi konkreettisimmista tasa-arvoratkaisuista.' },
    cult: { q:'Mitä teini-ikäisiltä odotettiin?', body:'Teinikulttuurin käsite puuttui — nuori oli matkalla aikuisuuteen, ei omassa vaiheessaan. Sukupuoliroolit tiukat. Nuorisotyö kirkon ja järjestöjen käsissä.', example:'1960-luvun 15-vuotias: monessa perheessä jo töissä tai ammattikouluun menossa.' },
    subj: { q:'Miltä murrosikä tuntui?', body:'Ei käsitteenä tunnistettu — "teini" oli amerikkalainen ilmiö. Nopea siirtymä lapsuudesta aikuisuuteen. Vapaa-aika vähäistä, vastuu suuri. Nuorisokulttuuri syntyi 1960-luvun lopulla.', example:'Beat-sukupolvi rantautui Suomeen 1960-luvun lopulla — ensimmäinen teinikulttuurin aalto.' },
  },
  murrosika_p3: {
    has: true,
    struct: { q:'Miten lama vaikutti murrosikäisiin?', body:'Kouluterveydenhuolto supistui rajusti. Nuorisotyö kunnissa leikattiin. Oppilaanohjauksesta tingittiin. Syrjäytymisriski kasvoi — mutta palvelut pienenivät samaan aikaan.', example:'"Menetty sukupolvi": 13–17-vuotiaat lamavuosina näkivät vanhempiensa ahdingon läheltä.' },
    econ: { q:'Lama murrosikäisen arjessa?', body:'Harrastukset lopetettiin. Taskuraha pieneni tai loppui. Kodin ilmapiiri kiristyi vanhempien taloushuolien vuoksi. Monet tekivät töitä välittömästi koulun jälkeen.', example:'Tutkimus: 1990-luvun lamateineillä selvästi matalampi harrastustaso kuin ennen tai jälkeen laman.' },
    cult: { q:'Mitä lama teki murrosiän normeihin?', body:'Tulevaisuususko mureni. "Miksi opiskella jos ei ole töitä?" -asenne levisi. Nihilismi ja alakulttuurit (punk, skinhead) edustivat nuorten protestia.', example:'Nuorisorikollisuus kasvoi 1990-luvun alussa — kytkös lamaan ja tulevaisuudenuskon menetykseen.' },
    subj: { q:'Miltä murrosikä tuntui lamassa?', body:'Vanhempien stressi näkyi kotona. Oma tulevaisuus epävarma. Moni nuori haaveili pakenemisesta — ulkomaille, opiskelemaan, muualle. Osa ajautui marginaaliin.', example:'Pitkittäistutkimus: 1990-luvun lamateineillä kohonnut riski mielenterveysongelmiin myöhemmin elämässä.' },
  },
  murrosika_p5: {
    has: true,
    struct: { q:'Miten murrosikäisten rakenteet kehittyivät 2010-luvulla?', body:'Oppilashuoltolaki 2014 vahvisti kuraattori- ja psykologipalveluja. Nuorisotakuu 2013. Mielenterveyspalveluita kehitettiin mutta resurssit jäivät vajaaksi. Digitaalinen oppiminen yleistyi.', example:'Oppilashuoltolaki 2014: ensimmäistä kertaa lakisääteinen oikeus koulukuraattoriin ja -psykologiin.' },
    econ: { q:'Murrosikäiset 2010-luvun taloudessa?', body:'Maksuton perusopetus ja toinen aste säilyivät. Harrastusten hinnat nousivat — eriarvoisuus kasvoi vapaa-ajan mahdollisuuksissa. Puhelimesta tuli välttämätön hyödyke.', example:'Harrastuskulut 2015: jääkiekko 4 000 €/v, tanssi 2 000 €/v — sosioekonominen jakolinja selvä.' },
    cult: { q:'Mitä 13–17-vuotiailta odotettiin 2010-luvulla?', body:'Some muutti identiteettityön — Instagram, Snapchat. Suorituspaine kasvoi: hyvät arvosanat, harrastukset, some-profiili. Mielenterveysongelmat normalisoituivat puheessa.', example:'THL 2017: tyttöjen ahdistus ja masennus kasvoivat selvästi — some-paine tunnistettiin syyksi.' },
    subj: { q:'Miltä murrosikä tuntui 2010-luvulla?', body:'Ensimmäinen sukupolvi jolle some oli osa identiteettiä. "FOMO", vertailu, ulkonäköpaineet. Toisaalta: enemmän tietoa, yhteisöjä ja mahdollisuuksia kuin koskaan.', example:'Tutkimus 2018: tyttöjen itsetuhoajatukset kasvoivat 30% vuodesta 2013 — ajankohta osuu somen läpimurtoon.' },
  },
  murrosika_p6: {
    has: true,
    struct: { q:'Missä murrosikäisten rakenteet ovat nyt?', body:'Therapia garantia 2023 ulottuu myös nuoriin. Oppivelvollisuus laajeni 18 ikävuoteen. Koulupsykologi- ja kuraattoripalvelut edelleen riittämättömät. Oppilashuolto kuormittunut.', example:'2024: koulukuraattorille jonottaa kuukausia — laki lupaa palvelun mutta resurssit puuttuvat.' },
    econ: { q:'Murrosikäiset 2020-luvun taloudessa?', body:'COVID sulki koulut — oppimisvajet kasvoivat. Mielenterveyspalveluiden jonot räjähtivät. Harrastuskulut jatkoivat kasvuaan. Nuorten syrjäytymiskustannukset yhteiskunnalle mittavat.', example:'Syrjäytynyt nuori: laskennallinen kustannus yhteiskunnalle 1,2 M€ elinaikana (THL 2023).' },
    cult: { q:'Mitä 13–17-vuotiailta odotetaan nyt?', body:'TikTok ja lyhytvideon aikakausi. Identiteettikysymykset laajemmin esillä kuin koskaan. Ilmastoahdistus osa teini-ikää. Z-sukupolven arvot: autenttisuus, yhteisöllisyys, vaikuttavuus.', example:'Tutkimus 2023: 60% nuorista kokee ilmastoahdistusta — uusi kehitystehtävä murrosiässä.' },
    subj: { q:'Miltä murrosikä tuntuu nyt?', body:'Mielenterveyskriisi on sukupolven kokemus — ahdistus ja masennus ennätyslukemissa. Palvelut eivät vastaa tarpeeseen. Toisaalta: enemmän vapautta olla oma itsensä kuin koskaan.', example:'THL 2023: 30% tytöistä ja 15% pojista raportoi merkittäviä mielenterveysoireita. Palveluvaje kriittinen.' },
  },
  itsenaistymine_p1: {
    has: true,
    struct: { q:'Miten yhteiskunta rakensi polkuja itsenäistymiseen?', body:'Peruskouluuudistus 1972 loi tasa-arvoisen pohjan. Opintotukijärjestelmä syntyi 1969. Ammatillinen koulutus laajeni voimakkaasti — ammatti tuli kaikkien ulottuville.', example:'Opintotuki 1969: ensimmäistä kertaa valtio alkoi rahoittaa nuorten itsenäistymistä.' },
    econ: { q:'Miten itsenäistyminen rahoitettiin?', body:'Opintotuki oli vaatimaton, vanhempien tuki olennaisempi. BKT:n kasvu loi töitä — ammattiin valmistunut työllistyi nopeasti. Asuminen edullista kasvavilla kaupunkiseuduilla.', example:'1970-luvun nuori: koulutus maksoi vähän, työ odotti valmistumisen jälkeen.' },
    cult: { q:'Mitä 18–24-vuotiailta odotettiin?', body:'Nuorison oma kulttuuri syntyi. Poliittinen aktiivisuus huipussaan. Naimisiinmeno ja lasten saaminen odotettuja — 22-vuotias mies perheineen oli normi.', example:'Naisten keski-ikä ensisynnytyksessä 1970: 24 vuotta. Nyt 30. Kulttuurinen muutos on dramaattinen.' },
    subj: { q:'Miltä itsenäistyminen tuntui?', body:'Optimistinen aikakausi: tulevaisuus avautui. Elintason nousu konkreettinen. Ensimmäinen sukupolvi joka saattoi odottaa elävänsä paremmin kuin vanhempansa.', example:'Sosiaalinen liikkuvuus 1970-luvulla: korkein koskaan — koulutus todella avasi ovet.' },
  },
  itsenaistymine_p3: {
    has: true,
    struct: { q:'Miten lama mursi itsenäistymisen rakenteita?', body:'Opintotuki muuttui lainapainotteiseksi 1992. Nuorisotyöttömyys nousi 30%:iin. TE-palvelut ylikuormittuivat. Nuorisotyö kunnissa supistui säästöjen vuoksi.', example:'"Menetetty sukupolvi": 1993 nuorisotyöttömyys 30% — EU:n korkeimpia.' },
    econ: { q:'Lama nuoren taloudessa?', body:'Velkainen opintotuki teki opiskelusta riskin. Ensimmäinen asunto mahdottomaksi. Monet jäivät vanhempien luo — ei valinnan vaan pakon takia. Osa lähti ulkomaille.', example:'1990-luvun opintolaina: ensimmäinen sukupolvi joka velkaantui koulutukseen.' },
    cult: { q:'Mitä lama teki itsenäistymisen normeihin?', body:'Tulevaisuususko romahtoi. Naimisiinmeno ja lasten hankkiminen siirtyivät. Epävarmuuden sukupolvi — "miksi sitoutua kun kaikki on epävarmaa?"', example:'Itsemurhariski nuorilla miehillä: huippukorkea 1990-luvun alussa. Kytkös lamaan vahva.' },
    subj: { q:'Miltä 18–24-vuotiaana oleminen tuntui lamassa?', body:'Häpeä, vanhempien ahdingon näkeminen, nuoruuden "varastamisen" kokemus. Psyykkiset vaikutukset seurasivat koko elämän.', example:'Pitkittäistutkimukset: 1990-luvun lamanuorten mielenterveysongelmat koholla läpi elämän.' },
  },
  itsenaistymine_p6: {
    has: true,
    struct: { q:'Missä itsenäistymisen rakenteet ovat nyt?', body:'Oppivelvollisuus laajeni 18 ikävuoteen 2021. Nuorisotakuu uudistettu. Therapia garantia 2023. Asumistuki yhä useamman nuoren arjessa.', example:'Therapia garantia: oikeus mielenterveyshoitoon — toteutus puutteellinen, jonot pitkät.' },
    econ: { q:'Nuoret 2020-luvun taloudessa?', body:'Asuntohinnat karanneet — Helsinki mahdoton ilman vanhempien tukea. Opintolainan taakka kasvaa. Gig-talous antaa työtä mutta ei turvaa. Inflaatio söi ostovoimaa.', example:'Helsingin asuntohinnat 2023: yksiö = 8–10 vuoden opintolaina. Asunnottomuus kasvussa alle 30-vuotiailla.' },
    cult: { q:'Mitä 18–24-vuotiailta odotetaan nyt?', body:'Z-sukupolvi kyseenalaistaa perinteisen uran. Ilmastoahdistus, identiteettikysymykset, some. Luottamus instituutioihin alhainen. Työn merkityksellisyys palkka-ennen.', example:'Z-sukupolven arvot: työn merkityksellisyys > palkka. Yrittäjyys houkuttelee enemmän kuin koskaan.' },
    subj: { q:'Miltä 18–24-vuotiaana oleminen tuntuu nyt?', body:'Mielenterveyskriisi on sukupolven kokemus. Ahdistus on normalisoitunut. Yksinäisyys kasvaa somen paradoksissa. Vapaus valita — mutta valinnan kuorma on suuri.', example:'THL 2023: 25% nuorista naisista merkittäviä mielenterveysoireita. Palvelut eivät vastaa tarpeeseen.' },
  },

  // ── PERUSTAMINEN (25–34) ──────────────────────────────────────────
  perustaminen_p1: {
    has: true,
    struct: { q:'Miten yhteiskunta tuki perustamisen vaihetta?', body:'TEL 1962 lupasi eläketurvan — houkutteli sitoutumaan palkkatyöhön. Asuntorakentaminen kiihtyi. Neuvolajärjestelmä tuki perheellistymistä. Päivähoito alkoi kehittyä.', example:'Aravalainat 1960-luvulla: valtio tuki asunnon hankkimista — perustamisen vaihe sai rakenteellista tukea.' },
    econ: { q:'Miten perhe ja asunto rahoitettiin?', body:'Aravalainat mahdollistivat omistusasumisen. Progressiivinen verotus mutta nouseva palkkataso. Puoliso tarvittiin talouden kannalta — yksinasuminen oli harvinaista ja kallista.', example:'1970-luvun pariskunta: kaksi palkansaajaa pystyi ostamaan omakotitalon muutaman vuoden säästöillä.' },
    cult: { q:'Mitä 25–34-vuotiailta odotettiin?', body:'Naimisiinmeno, lapset, omistusasunto — tässä järjestyksessä. Äiti kotona oli ihanne. Mies perheen pää ja elättäjä. Poikkeama normista oli häpeä.', example:'Avioliittolain muutos 1929: käytössä vielä 1960-luvulla. Naisen oikeudellinen asema pariskunnassa heikko.' },
    subj: { q:'Miltä perustaminen tuntui?', body:'Tulevaisuus avautui konkreettisesti: oma asunto, oma perhe, oma elämä. Ensimmäinen sukupolvi joka saattoi suunnitella tulevaisuutta ilman sotaa tai nälkää.', example:'Tutkimukset 1960-70-luvuilta: tyytyväisyys elämään korkea — elintason nousu oli dramaattinen.' },
  },
  perustaminen_p3: {
    has: true,
    struct: { q:'Miten lama iski 25–34-vuotiaisiin?', body:'Asuntolainakriisi tuhosi talouksia: 100 000 suomalaista menetti kotinsa. Sosiaaliturvaleikkaukset osuivat nuoriin perheisiin. Lastensaanti siirtyi.', example:'Asuntolainakriisi 1992–95: pankit eivät joustaneet, oikeussuoja heikko. Sukupolvi kantaa tätä edelleen.' },
    econ: { q:'Perustamisen talous lamassa?', body:'Asuntolainan korkotaso nousi yli 15%:iin. Monet joutuivat myymään asunnon tappiolla. Ylivelkaantuminen jätti pysyvän arven — luottotiedot menetettiin, alkupääoma katosi.', example:'1993: asuntojen hinnat laskivat 50% huipusta. Moni menetti säästönsä ja asuntonsa samalla.' },
    cult: { q:'Miten lama muutti perustamisen normeja?', body:'Perheen perustaminen siirtyi. Avioero yleistyi — taloudellinen stressi hajotti perheitä. Yksilönvastuudiskurssi vahvistui: "sinä olet vastuussa".', example:'Tutkimus: 1990-luvun lamassa eronneet kantavat taloudellisia seurauksia vielä 2020-luvulla.' },
    subj: { q:'Miltä perustaminen tuntui lamassa?', body:'Pelko, epävarmuus, häpeä. Nuori pariskunta asunnon kanssa velan alla: "pitäisikö myydä vai kestää?" Psyykkinen taakka periytyi lapsille.', example:'Neuropsykologinen tutkimus: 1990-luvun laman lapset kantavat mitattavaa stressijälkeä.' },
  },
  perustaminen_p6: {
    has: true,
    struct: { q:'Missä perustamisen rakenteet ovat nyt?', body:'Perhevapaaremuraus 2022 tasasi vastuun. Asuntopolitiikka kriisiytynyt — ARA-rakentaminen romahtanut. Päivähoidon saatavuus parantunut mutta laatu vaihtelee.', example:'Perhevapaaremuraus 2022: ensimmäistä kertaa isälle merkittävä kiintiö. Kulttuurinen muutos alkaa.' },
    econ: { q:'Perustaminen 2020-luvun taloudessa?', body:'Asuntojen hinnat estävät perheen perustamista suurissa kaupungeissa. Korkojen nousu 2022–2023 iski asuntovelallisiin. Lapsiperheen kulut kasvoivat inflaation mukana.', example:'2023: Ensiasunnon ostajaksi tulo vaatii Helsingissä 50 000–100 000 € omarahoitusosuuden.' },
    cult: { q:'Mitä 25–34-vuotiailta odotetaan nyt?', body:'Vapaus ja pakollisuus törmäävät: valinnanvapaus ajoittaa perhe, mutta biologinen kello tikittää. Syntyvyys laskee — kuka haluaa lapsia kun asuntoa ei ole?', example:'Syntyvyys 2023: 1,26 — alhaisin koskaan. Lapsettomuus erityisesti nuorten miesten ongelma.' },
    subj: { q:'Miltä 25–34-vuotiaana eläminen tuntuu nyt?', body:'Haaveiden ja realiteettien ristiriita: halutaan omistusasunto ja lapsia, mutta taloudellinen paine on kova. Toisaalta: enemmän vapauksia kuin millään aiemmalla sukupolvella.', example:'Nuorten aikuisten hyvinvointitutkimus 2023: taloushuolet pääsyy ahdistukselle 25–34-vuotiailla.' },
  },

  // ── RAKENTAMINEN (35–54) ──────────────────────────────────────────
  rakentaminen_p1: {
    has: true,
    struct: { q:'Miten työikäisten suoja rakennettiin?', body:'Suomen sosiaaliturvan perusta syntyi 1960–70-luvuilla: sairausvakuutuslaki 1963, TEL 1962. Palkansaajan suoja kasvoi merkittävästi. Ammattiliitot vahvistuivat.', example:'TEL 1962: ansiosidonnainen eläke kaikille — pohjoismaisen hyvinvointivaltion kulmakivi.' },
    econ: { q:'Miten rakentaminen rahoitti yhteiskunnan?', body:'Progressiivinen verotus nousi 60–70%:iin. Palkansaajat maksoivat sekä omat eläkkeensä (TEL) että yleisen järjestelmän. Huoltosuhde suotuisa — suuri ikäluokka töissä.', example:'1970-luvulla jokaista eläkeläistä kohti oli yli 5 työllistä. Järjestelmä oli helppo rahoittaa.' },
    cult: { q:'Mitä 35–54-vuotiailta odotettiin?', body:'Palkkatyö oli keskiluokkaistumisen tie. Tehtaaseen töihin nousi statukseksi. Ammattiliitot vahvat — kollektiivinen identiteetti. Työ määritti ihmisen arvon.', example:'Suuri muutto 1960–70: 300 000 ihmistä siirtyi maalta kaupunkeihin. Rakentamisen vaihe muutti Suomea.' },
    subj: { q:'Miltä rakentaminen tuntui?', body:'Elintason nousu oli dramaattinen ja konkreettinen: auto, televisio, puhelin, lomamatkat. Turvallisuudentunne kasvoi. Optimismi vallitsi.', example:'1970-luvun palkansaaja: ensimmäistä kertaa historiassa keskiluokkainen elämä enemmistön ulottuvilla.' },
  },
  rakentaminen_p3: {
    has: true,
    struct: { q:'Miten lama mursi rakentamisen suojaa?', body:'Massiiviset lomautukset ja irtisanomiset. Sosiaaliturvaa leikattiin. Pitkäaikaistyöttömyys nousi uudeksi ilmiöksi. Aktivointipolitiikka syntyi.', example:'1993: 500 000 työtöntä — 19% työvoimasta. Ennennäkemätön kriisi.' },
    econ: { q:'Lama 35–54-vuotiaan kukkarossa?', body:'BKT laski 10%. Julkinen velka kaksinkertaistui. Verotusta kiristettiin samalla kun etuuksia leikattiin. Moni menetti omistusasuntonsa — pankit eivät joustaneet.', example:'Asuntolainakriisi: 100 000 suomalaista menetti kotinsa 1990-luvun alkupuolella.' },
    cult: { q:'Mitä lama teki työn merkitykselle?', body:'Yksilönvastuudiskurssi vahvistui: "sinä olet itse vastuussa asemastasi". Häpeä liittyi työttömyyteen. Yhteisöllinen solidaarisuus testattiin ja osittain mureni.', example:'Tutkimus: 1990-luvun pitkäaikaistyöttömät kokivat voimakasta häpeää — sosiaalinen stigma todellinen.' },
    subj: { q:'Miltä rakentaminen tuntui lamassa?', body:'Pelko oli läsnä: "koska on minun vuoroni?" Työtä tehtiin kovemmin koska kilpailu paikasta kasvoi. Lojaalisuus työnantajalle heikkeni — epäluottamus syntyi.', example:'Pitkittäistutkimus: 1990-luvun lamasta toipuminen kesti psyykkisesti kauemmin kuin taloudellisesti.' },
  },
  rakentaminen_p6: {
    has: true,
    struct: { q:'Missä rakentamisen rakenteet ovat nyt?', body:'TE-uudistus 2025 siirsi palvelut kuntiin. Sosiaaliturvan kokonaisuudistus valmistelussa. Työkyvyttömyyseläkkeiden kasvu huolenaiheena. Burn-out virallisena diagnoosina.', example:'Kelasto-uudistus: sosiaaliturvan selkeyttäminen — tavoite 2027, toteutus epävarma.' },
    econ: { q:'Rakentaminen 2020-luvun taloudessa?', body:'Inflaatio 2022–2023 söi reaalipalkkoja. Etätyö muutti työn ekonomiaa. Gig-talous kasvanut — sosiaaliturvavaje jäänyt paikoilleen. Huoltosuhde heikkenemässä nopeasti.', example:'2024: huoltosuhde 66 — 100 työllistä kohti 66 huollettavaa. Pahin on edessä päin.' },
    cult: { q:'Mitä 35–54-vuotiailta odotetaan nyt?', body:'Työn merkityksellisyys ohittanut palkan prioriteetissa. Burn-out käsitteenä normalisoitunut. Omaishoitovastuu lisääntymässä — "sandwich-sukupolvi" huolehtii sekä lapsista että vanhemmista.', example:'Tutkimus 2023: 40% harkitsee alan tai työnantajan vaihtoa. "Sandwich-sukupolven" kuorma kasvaa.' },
    subj: { q:'Miltä rakentaminen tuntuu nyt?', body:'Uupumus kohonnut. Työn kuormittavuus kasvanut vaatimuksien kiristyessä. Toisaalta: enemmän autonomiaa ja joustoa kuin koskaan. Kokemus jakautunut toimialoittain.', example:'THL 2023: 26% työssäkäyvistä raportoi merkittävää työuupumusta — 10-vuotisen nousutrendin huippu.' },
  },

  // ── SIIRTYMÄ (55–64) ──────────────────────────────────────────────
  siirtuma_p1: {
    has: true,
    struct: { q:'Miten yhteiskunta käsitteli siirtymävaihetta?', body:'Varhaiseläkejärjestelmät syntyivät helpottamaan rakennemuutosta. Yksilöllinen varhaiseläke 1986 loi uuden reitin. Työkyvyttömyyseläke yleistyi raskailla aloilla.', example:'Varhaiseläkkeet 1970-luvulla: keino hallita rakennemuutosta — ja siirtää ongelma tulevaisuuteen.' },
    econ: { q:'Miten 55–64-vuotiaiden talous järjestettiin?', body:'Varhaiseläke tarjosi turvan mutta leikkasi tuloja. TEL-karttumat olivat vielä pieniä — eläkkeet matalammat kuin nykyisin. Omistusasunto oli tärkein pääoma.', example:'1970-luvun 60-vuotias: eläkekarttuma pieni, mutta asunto omistuksessa. Toimeentulo ok.' },
    cult: { q:'Mitä 55–64-vuotiailta odotettiin?', body:'Vanheneminen tarkoitti vetäytymistä — "vanhana" oleminen alkoi aikaisemmin kuin nyt. 60-vuotias nähtiin "vanhana". Työn arvostus korkea, mutta ruumiillinen työ hajoitti.', example:'Elinikä 1970-luvulla: 70 vuotta. Nyt 82. Siirtymän vaihe on laajentunut dramaattisesti.' },
    subj: { q:'Miltä siirtymä tuntui?', body:'Monet kokeneet sota-ajan, niukkuuden ja nopean modernisaation. Raskaan fyysisen työn jäljet: selkä, polvet, keuhkot. Lepo ansaittua — mutta taloudelliset huolet seurasivat.', example:'Teollisuuden "vanhat miehet": 55-vuotiaana jo käytetty loppuun — työkyvyttömyyseläke pelastuslinja.' },
  },
  siirtuma_p5: {
    has: true,
    struct: { q:'Miten siirtymävaiheen rakenteet uudistuivat?', body:'Eläkeuudistus 2005 ja 2017 nosti eläkeikiä asteittain. Osaeläkkeet lisääntyivät. Työkyvyn tuki nousi politiikan agendalle. Osittainen varhennettu vanhuuseläke syntyi.', example:'Eläkeuudistus 2017: eläkeikä nousee syntymävuoden mukaan — 63 → 65 vuotta asteittain.' },
    econ: { q:'Siirtymävaiheen talous 2010-luvulla?', body:'Varhaiseläkejärjestelmiä leikattiin — "eläkeputki" kaventui. Pitkäaikaistyöttömyys yli 55-vuotiailla nousi ongelmaksi. Moni jäi pimentoon: ei töissä, ei eläkkeellä.', example:'"Eläkeputki": yli 55-vuotiaat ansiosidonnainen + eläkeputki. Poliittinen paine poistaa se kasvoi.' },
    cult: { q:'Miten käsitys 55–64-vuotiaista muuttui?', body:'"Aktiivinen ikääntyminen" nousi diskurssiin. Ikäsyrjintä nostettiin esiin. Kokemuksen arvostus kasvoi — mutta käytäntö ei aina vastannut puheita.', example:'Ikäsyrjintä rekrytoinnissa: tutkimukset osoittavat yli 50-vuotiaat syrjäytyivät rekrytoinnissa systemaattisesti.' },
    subj: { q:'Miltä siirtymä tuntui 2010-luvulla?', body:'Pelko eläkeputkeen jäämisestä. "Olen liian nuori eläkkeelle mutta liian vanha töihin." Terveys alkaa rajoittaa mutta ei vielä kaadu. Identiteettikriisi työn vähentyessä.', example:'THL 2015: 55–64-vuotiaat kokevat eniten epävarmuutta tulevaisuudesta kaikista ikäryhmistä.' },
  },
  siirtuma_p6: {
    has: true,
    struct: { q:'Missä siirtymävaiheen rakenteet ovat nyt?', body:'Eläkeikä 65 lähestyy. Työkyvyttömyyseläkkeiden kasvu huolenaiheena. Kuntoutuspolut parantuneet. TE-palvelut siirtyneet kuntiin — kohtaanto-ongelma jatkuu.', example:'2024: työkyvyttömyyseläkkeelle siirtyy 20 000 ihmistä vuosittain — mielenterveysongelmat suurin syy.' },
    econ: { q:'Siirtymä 2020-luvun taloudessa?', body:'Monet 55–64-vuotiaat menettivät töitä koronassa. Uudelleentyöllistyminen vaikeaa. Inflaatio söi eläkesäästöjä. Varhaiseläke kallistunut — monet pakotettu jatkamaan.', example:'Koronan pitkäaikaisseuraukset: yli 55-vuotiaiden pitkäaikaistyöttömyys kasvoi 40% 2020–2021.' },
    cult: { q:'Mitä 55–64-vuotiailta odotetaan nyt?', body:'Paineita jatkaa pidempään töissä. "Eläkeläinen" saa odottaa. Samaan aikaan omaishoitovelvollisuudet kasvavat — vanhemmat tarvitsevat hoivaa, lapset tukea.', example:'Omaishoitajien keski-ikä Suomessa: 63 vuotta. Siirtymävaiheen sukupolvi kantaa hoivan.' },
    subj: { q:'Miltä siirtymä tuntuu nyt?', body:'Monella hyvä: terveys ok, rahaa enemmän, lapset omillaan, oma aika. Toisaalla: sairaudet, yksinäisyys, merkityksettömyyden pelko. Kokemus eriytynyt.', example:'Paradoksi: 55–64-vuotiaat ovat tilastojen mukaan tyytyväisimpiä elämäänsä — mutta myös kuormittuneimpia.' },
  },

  // ── VAPAUTUMINEN (65–74) ──────────────────────────────────────────
  vapautuminen_p1: {
    has: true,
    struct: { q:'Miten vanhuuden hoiva järjestettiin?', body:'Vanhainkodit yleistyivät 1960–70-luvuilla. Kotipalvelu alkoi kehittyä. Kansaneläkejärjestelmä rakentui — vanhuusköyhyys vielä laajaa.', example:'1960-luvun alun eläkeläinen: kansaneläke pieni, perhe ja suku ensisijainen turva.' },
    econ: { q:'Miten eläke rahoitettiin?', body:'TEL 1962 lupasi paremman tulevaisuuden — mutta vasta tulevaisuudessa. Kansaneläke oli matala. Ensimmäinen sukupolvi TEL-eläkkeellä sai sen vasta 1980-luvulla.', example:'1970-luvun eläke: noin 30% viimeisestä palkasta. Nykytaso 50–60%. Historiallinen parannus.' },
    cult: { q:'Mitä eläkeläisyydestä ajateltiin?', body:'65 vuotta = vanha. Vetäytyminen odotettua ja normatiivista. Isovanhemmuus tärkein rooli. Poliittinen aktiivisuus harvinaista.', example:'1960-luvun eläkeläinen: "lepää ansaitusti". Aktiivinen eläkeläisyys -käsite puuttui kokonaan.' },
    subj: { q:'Miltä eläköityminen tuntui?', body:'Köyhyys, yksinäisyys ja riippuvuus perheestä yleisiä. Toisaalta: yhteisöllisyys vahvempaa, sukupolvien välinen arki lähempää kuin nyt.', example:'Haastattelututkimukset: 1960–70-luvun eläkeläiset muistavat vähyyden mutta myös yhteisöllisyyden.' },
  },
  vapautuminen_p5: {
    has: true,
    struct: { q:'Miten 65–74-vuotiaiden asema muuttui?', body:'Elinikä nousi — 65-vuotias odottaa elävänsä 85-vuotiaaksi. Vanhuspalvelulaki 2013. Aktiivisen ikääntymisen politiikka. Eläkeikä nousi 2017-uudistuksessa.', example:'Eläkeuudistus 2017: 63 → 65 vuoden eläkeikä asteittain — vapautuminen siirtyi.' },
    econ: { q:'65–74-vuotiaiden talous 2010-luvulla?', body:'Eläkemenot 28 Mrd€ — suurin yksittäinen menoerä. Huoltosuhde alkoi heiketä. Monet tekivät töitä eläkkeen ohella — halusivat tai joutuivat.', example:'2010-luvun eläkeläinen: parempi terveys, enemmän rahaa, aktiivisempi elämä kuin koskaan ennen.' },
    cult: { q:'Mitä aktiivinen eläkeläisyys tarkoitti?', body:'"Kotona mahdollisimman pitkään" nousi doktriinaksi. Kolmas ikä -käsite yleistyi: terveyden, aktiivisuuden ja osallisuuden vaihe ennen avuntarvetta.', example:'Kolmas ikä: 65–74-vuotiaat matkustelevat, harrastavat ja osallistuvat enemmän kuin koskaan.' },
    subj: { q:'Miltä 65–74-vuotiaana oleminen tuntui?', body:'Monelle paras aika: terveys vielä ok, rahat riittävät, vapaus valita mitä tekee. Yksinäisyys kasvoi — kotona asuminen poliittisena tavoitteena saattoi tarkoittaa eristäytymistä.', example:'THL: 40% yli 75-vuotiaista kokee itsensä yksinäiseksi. Kotiin jääminen voi pahentaa tilannetta.' },
  },
  vapautuminen_p6: {
    has: true,
    struct: { q:'Missä 65–74-vuotiaiden rakenteet ovat nyt?', body:'Hyvinvointialueet 2023. Henkilöstömitoitus 0.7 hoitotyöntekijää/asukas tuli voimaan. Kotihoidon resurssivaje akuutti. Digisyrjäytyminen uhkana kasvavalle ikäryhmälle.', example:'Hyvinvointialueet 2023: 1,5 Mrd€ alijäämä — vanhuspalvelut ensimmäinen leikkauskohde.' },
    econ: { q:'Vapautuminen 2020-luvun taloudessa?', body:'Eläkemenot 36 Mrd€ (2024). Pienten eläkkeiden reaaliarvo syöpyi inflaatiossa 2022–2023. Takuueläke 978 €/kk — alle köyhyysrajan monessa kaupungissa.', example:'2024: takuueläke 978 €/kk — alle köyhyysrajan monessa kaupungissa asumiskustannusten jälkeen.' },
    cult: { q:'Mitä 65–74-vuotiailta odotetaan nyt?', body:'Väestön ikääntyessä vanhuus politisoituu. Eläkeläiset suurin äänestäjäryhmä — poliittinen vaikutusvalta kasvaa. Sukupolvien välinen oikeudenmukaisuus nousee.', example:'Eläkeläiset suurin äänestäjäryhmä — poliittinen vaikutusvalta kasvaa samalla kun nuoret äänestävät vähemmän.' },
    subj: { q:'Miltä 65–74-vuotiaana oleminen tuntuu nyt?', body:'Paradoksi: suomalaiset elävät terveempiä vanhuuksia kuin koskaan — mutta kokemus palveluista on heikentynyt. Aktiivisuus korkea, mutta hoivakriisi varjostaa tulevaa.', example:'Tutkimus 2023: 65–74-vuotiaat Suomen tyytyväisin ikäryhmä — mutta huoli tulevasta on korkein.' },
  },

  // ── SOPEUTUMINEN (75–84) ──────────────────────────────────────────
  sopeutuminen_p1: {
    has: true,
    struct: { q:'Miten 75–84-vuotiaita hoidettiin?', body:'Vanhainkodit olivat pääasiallinen hoivamuoto. Kotipalvelu kehittyi hitaasti. Lääketiede kehittyi — elinikä nousi mutta palvelut eivät pysyneet perässä.', example:'1970-luvun vanhus 78-vuotiaana: todennäköisesti vanhainkodissa tai perheensä hoidossa.' },
    econ: { q:'Miten ikääntymistä rahoitettiin?', body:'Kansaneläke + perhehoito olivat pääasiallinen turva. Laitoshoidon kustannukset olivat alhaisemmat koska hoito perustui matalaan palkkatasoon.', example:'Hoivatyön palkkataso 1970-luvulla: yksi alimmista — naisten työ, arvostus matala.' },
    cult: { q:'Mitä 75–84-vuotiaista ajateltiin?', body:'Laitoshoito koettiin häpeällisenä — merkki siitä että perhe oli epäonnistunut. Vanhukset perheen vastuuna. Ikäihmisten oma ääni ei kuulunut.', example:'Sanonta "panna vanhempi vanhainkotiin" kantoi häpeäleiman vielä 1970-luvulla.' },
    subj: { q:'Miltä sopeutuminen tuntui?', body:'Köyhyys, kipu ja perheestä riippuminen yleisiä. Yhteisöllisyys vahvempaa — kyläyhteisö, kirkko, naapurit. Kuolema läheisempää ja luonnollisempana koettua.', example:'Haastattelut: 1970-luvun iäkkäät kokivat yhteisön tuen voimakkaampana mutta palvelut heikoiksi.' },
  },
  sopeutuminen_p5: {
    has: true,
    struct: { q:'Miten 75–84-vuotiaiden palvelut uudistuivat?', body:'Vanhuspalvelulaki 2013. Henkilöstömitoitus lakisääteiseksi vasta 2023. Kotihoidon laajentaminen päästrategiaksi. Muistisairaudet uusi kansantauti.', example:'Vanhuspalvelulaki 2013: ensimmäistä kertaa lakisääteinen oikeus palvelusuunnitelmaan.' },
    econ: { q:'75–84-vuotiaiden talous 2010-luvulla?', body:'Kotihoidon maksut nousivat. Omaishoidon tuki riittämätön. Yksityiset palvelut lisääntyivät — hyvinvointierot kasvoivat. Dementia tuo massiiviset kustannukset.', example:'Dementoivien sairauksien kustannus 2015: 5 Mrd€/v — suurin yksittäinen ikäkustannus.' },
    cult: { q:'Miten käsitys 75–84-vuotiaista muuttui?', body:'"Kotona mahdollisimman pitkään" -doktriini. Hoitoalan arvostus testattiin — hoivakriisit paljastuivat. Muistisairaus normalisoitui puheessa.', example:'Hoivakriisit 2018–: median paljastama aliresursoitu vanhustenhoiva järkytti julkista mielipidettä.' },
    subj: { q:'Miltä sopeutuminen tuntui 2010-luvulla?', body:'Kotona asuminen haluttua mutta yksinäisyyttä lisäävää. Avuntarve kasvaa mutta sen myöntäminen vaikeaa. Dementoivat sairaudet — oman itsen menettäminen.', example:'THL: 40% yli 75-vuotiaista kokee itsensä yksinäiseksi. Kotiin jääminen pahentaa tilannetta.' },
  },
  sopeutuminen_p6: {
    has: true,
    struct: { q:'Missä 75–84-vuotiaiden rakenteet ovat nyt?', body:'Hyvinvointialueet ottivat vastuun. Henkilöstömitoitus 0.7 voimaan. Kotihoidon resurssivaje akuutti — kotihoitajilla liian vähän aikaa per asiakas. Muistikeskukset kehittyvät.', example:'Kotihoito 2024: hoitajalla keskimäärin 20 min/käynti. Riittää lääkkeisiin ja pesuun, ei ihmisyyteen.' },
    econ: { q:'Sopeutuminen 2020-luvun taloudessa?', body:'Eläkemenot kasvavat demografian mukana. Maksutulo alijäämäinen. Kotihoidon, laitoshoidon ja omaishoidon kustannukset nousevat. Inflaatio söi pieniä eläkkeitä.', example:'2024: kotihoidon kustannus 3 500 €/kk per asiakas. Laitoshoito 5 000 €/kk. Kuka maksaa?' },
    cult: { q:'Miten 75–84-vuotiaita kohdellaan nyt?', body:'Hoivakriisi on tunnistettu mutta ei ratkaistu. Ikäihmisten ihmisarvo nousee puheeseen mutta resurssit eivät kasva. Ageismi tunnistetaan ilmiönä.', example:'Tutkimus 2023: 70% ikäihmisistä kokee tulleensa sivuutetuksi terveydenhuollossa ikänsä vuoksi.' },
    subj: { q:'Miltä sopeutuminen tuntuu nyt?', body:'Hoivakriisi on koettu: aliresursoitu kotihoito, henkilökunnan vaihtuvuus. Toisaalta: parempi terveys kuin aiemmilla sukupolvilla samassa iässä. Arvokkuuden kokeminen uhattuna.', example:'Paradoksi: 75–84-vuotiaat elävät terveempiä ja aktiivisempia elämää kuin koskaan — palvelut eivät pysy perässä.' },
  },

  // ── RIIPPUVUUS (85+) ─────────────────────────────────────────────
  riippuvuus_p1: {
    has: true,
    struct: { q:'Miten kaikkein iäkkäimpien hoiva järjestettiin?', body:'85-vuotiaita oli 1960-luvulla hyvin vähän — väestö ei vanhentunut näin pitkälle. Laitoshoito oli ainoa vaihtoehto. Perheen hoiva tai laitos — ei välimuotoa.', example:'1960-luvun 85-vuotias: harvinaisuus. Suomi ei ollut suunnitellut palveluita tälle ryhmälle.' },
    econ: { q:'Miten kaikkein iäkkäimpien hoiva rahoitettiin?', body:'Pääosin perhe. Kansaneläke minimaalinen. Laitoshoidon kustannukset piilotettiin — perhe saattoi menettää kaiken maksaakseen hoidon.', example:'Laitoshoidon maksu 1960-luvulla: voi periä koko eläkkeen ja omaisuuden. Perintösuoja puuttui.' },
    cult: { q:'Mitä kaikkein iäkkäimmistä ajateltiin?', body:'Pitkä ikä oli poikkeus. Kuolema luonnollinen osa elämää — ei medikalisoitu. Perhe huolehti loppuun asti. Vanhuus ei ollut erillinen elämänvaihe — se oli kuoleminen.', example:'Kuoleman kulttuuri 1960-luvulla: kotona kuoleminen normi, saattohoito käsite puuttui.' },
    subj: { q:'Miltä äärimmäinen vanhuus tuntui?', body:'Kipu ja toimintakyvyn menetys ilman riittäviä kipulääkkeitä. Perheyhteisö suojeli mutta myös rajoitti. Kuolema odotettuna helpotuksena pikemmin kuin pelättynä.', example:'Gerontologinen historia: 1960-luvun iäkkäät tunsivat kuuluvansa paremmin yhteisöön kuin nykypäivänä.' },
  },
  riippuvuus_p5: {
    has: true,
    struct: { q:'Miten 85+-vuotiaiden hoiva järjestettiin 2010-luvulla?', body:'85-vuotiaita oli jo kymmeniä tuhansia. Tehostetuun palveluasumiseen siirtyminen yleistyi. Saattohoito kehittyi. Muistisairaiden erityisyksiköt.', example:'2015: yli 85-vuotiaita 130 000. Suurin osa palveluiden piirissä — järjestelmä kuormittui.' },
    econ: { q:'85+-vuotiaiden hoivan kustannukset 2010-luvulla?', body:'Tehostettu palveluasuminen maksaa 4 000–6 000 €/kk. Omaishoidon tuki riittämätön. Palveluasumisessa asiakasmaksu kattaa suuren osan — pienet eläkkeet eivät riitä.', example:'2015: 85+-vuotiaiden hoivakustannus per henkilö korkein kaikista ikäryhmistä — 35 000 €/v.' },
    cult: { q:'Miten suhtautuminen kaikkein iäkkäimpiin muuttui?', body:'Saattohoito normalisoitui käsitteenä. Muistisairaus tuli julkiseen keskusteluun. Ikäihmisten ihmisarvo ja oikeudet nousivat puheenaiheeksi.', example:'Eutanasia-debatti Suomessa kiihtyi 2010-luvulla — saattohoito nousi vaihtoehtona esiin.' },
    subj: { q:'Miltä 85+-vuotiaana oleminen tuntui 2010-luvulla?', body:'Toimintakyvyn menetys ja riippuvuus. Muistisairaus — oman itsen menettäminen. Toisaalta: lääketiede helpotti kipua, saattohoito kehittyi, arvokkuus nousi puheenaiheeksi.', example:'Saattohoitotutkimus 2015: hyvä saattohoito mahdollista kun resurssit riittävät — monella ei riitä.' },
  },
  riippuvuus_p6: {
    has: true,
    struct: { q:'Missä 85+-vuotiaiden rakenteet ovat nyt?', body:'Yli 85-vuotiaita on 170 000 ja määrä kasvaa. Tehostettu palveluasuminen ylikuormittunut. Kotihoidon raja: koska siirrytään laitokseen? Saattohoidon saatavuus vaihtelee suuresti.', example:'2024: 85+-vuotiaita 170 000. Ennuste 2040: 350 000. Järjestelmä ei kestä ilman rakennemuutosta.' },
    econ: { q:'85+-vuotiaiden hoiva 2020-luvun taloudessa?', body:'Hoivakustannukset kaikkein korkeimmat — 5 000–8 000 €/kk tehostetussa palveluasumisessa. Hyvinvointialueiden alijäämät pakottavat leikkaamaan. Omaishoidon kuorma kasvanut.', example:'Laskennallinen: jos hoiva järjestetään nykyisellä mallilla 2040 väestölle, kustannus +80% nykytasosta.' },
    cult: { q:'Miten kaikkein iäkkäimpiin suhtaudutaan nyt?', body:'Hoivakriisi konkretisoi eettiset kysymykset: riittääkö aika ihmisyyteen? Eutanasia-debatti elää. Muistisairaan oikeudellinen asema nousee. Arvokkaan kuoleman oikeus.', example:'Eutanasia-kansalaisaloite 2024: yli 60 000 allekirjoitusta — poliittinen paine kasvaa.' },
    subj: { q:'Miltä 85+-vuotiaana oleminen tuntuu nyt?', body:'Hoivakriisi on koettu: liian vähän aikaa, liian paljon vaihtuvuutta, liian vähän ihmisyyttä. Lääketiede pitää hengissä — mutta elämänlaatu vaihtelee dramaattisesti.', example:'Saattohoitotutkimus 2023: vain 30% suomalaisista kuolee haluamallaan tavalla. 70%:lla kuolema ei vastaa toiveita.' },
  },
};

// ── TILA ──────────────────────────────────────────────────────────
let selected = null;
let signalData = {};

// ── SUPABASE-HAKU ─────────────────────────────────────────────────
async function fetchSignal() {
  const dot  = root.querySelector('#statusDot');
  const text = root.querySelector('#statusText');
  try {
    const res = await fetch(
      `${SUPA_URL}/rest/v1/j_code_lifecycle?select=j_code,lifecycle_primary,angle_struct,angle_econ,angle_cult,angle_subj`,
      { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
    );
    if (!res.ok) throw new Error(res.status);
    const rows = await res.json();

    // Aggregoi per lifecycle_primary
    const agg = {};
    for (const r of rows) {
      const lc = r.lifecycle_primary;
      if (!agg[lc]) agg[lc] = { s:[], e:[], c:[], u:[] };
      agg[lc].s.push(+r.angle_struct || 0);
      agg[lc].e.push(+r.angle_econ  || 0);
      agg[lc].c.push(+r.angle_cult  || 0);
      agg[lc].u.push(+r.angle_subj  || 0);
    }
    const avg = arr => arr.reduce((a,b)=>a+b,0)/arr.length;
    const baseSignal = {};
    for (const lc of Object.keys(agg)) {
      const g = agg[lc];
      baseSignal[lc] = { s: avg(g.s), e: avg(g.e), c: avg(g.c), u: avg(g.u) };
    }

    // Laske 9 elämänvaiheen signaalit painotettuna yhdistelmänä
    for (const cluster of CLUSTERS) {
      let s=0, e=0, c=0, u=0, total=0;
      for (const [lc, weight] of Object.entries(cluster.supaWeights)) {
        if (baseSignal[lc]) {
          s += baseSignal[lc].s * weight;
          e += baseSignal[lc].e * weight;
          c += baseSignal[lc].c * weight;
          u += baseSignal[lc].u * weight;
          total += weight;
        }
      }
      if (total > 0) {
        signalData[cluster.id] = { s:s/total, e:e/total, c:c/total, u:u/total, live:true };
      }
    }

    dot.className  = 'h-dot live';
    text.textContent = `${rows.length} J-koodia · 9 elämänvaihetta`;
    crisisCells = computeCrisisCells();
    renderGrid();
    renderCrisisPanel(CRISIS_EVENTS[4].id); // lama_1990 oletuksena
    renderDemographicBar();
  } catch(err) {
    dot.className  = 'h-dot';
    text.textContent = 'Offline — staattinen data';
    // Fallback
    signalData = {
      lapsuus:        { s:0.82, e:0.70, c:0.60, u:0.72, live:false },
      murrosika:      { s:0.74, e:0.65, c:0.58, u:0.68, live:false },
      itsenaistymine: { s:0.78, e:0.68, c:0.54, u:0.65, live:false },
      perustaminen:   { s:0.76, e:0.72, c:0.55, u:0.64, live:false },
      rakentaminen:   { s:0.77, e:0.76, c:0.46, u:0.55, live:false },
      siirtuma:       { s:0.82, e:0.74, c:0.52, u:0.62, live:false },
      vapautuminen:   { s:0.87, e:0.76, c:0.60, u:0.72, live:false },
      sopeutuminen:   { s:0.88, e:0.80, c:0.62, u:0.75, live:false },
      riippuvuus:     { s:0.85, e:0.85, c:0.65, u:0.80, live:false },
    };
    crisisCells = computeCrisisCells();
    renderGrid();
    renderCrisisPanel(CRISIS_EVENTS[4].id);
    renderDemographicBar();
  }
}

// ── RENDER GRID ───────────────────────────────────────────────────
function renderGrid() {
  const yAxis = root.querySelector('#yAxis');
  const xAxis = root.querySelector('#xAxis');
  const cells = root.querySelector('#cells');

  yAxis.innerHTML = CLUSTERS.map(c => `
    <div class="y-label phase-${c.phase}" title="${c.theme} · ${c.age}">
      <span class="y-label-inner">
        ${c.label}
        <span class="age-tag">${c.age}</span>
      </span>
    </div>
  `).join('');

  xAxis.innerHTML = PERIODS.map(p => `
    <div class="x-label">${p.label}</div>
  `).join('');

  cells.innerHTML = '';
  CLUSTERS.forEach(c => {
    PERIODS.forEach(p => {
      const key     = `${c.id}_${p.id}`;
      const content = CONTENT[key];
      const sd      = signalData[c.id] || {};
      const isSel   = selected === key;
      const hasData = !!content;
      const isLive  = sd.live;
      const isHit   = crisisCells.hitCells.has(key);
      const isWake  = crisisCells.wakeCells.has(key);

      const div = document.createElement('div');
      let cls = 'cell';
      if (hasData)  cls += ' has-data';
      if (isSel)    cls += ' selected';
      if (isLive)   cls += ' live-data';
      if (isHit)    cls += ' crisis-hit';
      else if (isWake) cls += ' crisis-wake';
      div.className = cls;

      const crisisTag = isHit ? ' 🔴' : isWake ? ' 🟡' : '';
      div.title = `${c.label} × ${p.label} — ${p.desc} · ${c.theme}${crisisTag}`;

      const bars = ['s','e','c','u'].map((k,i) => {
        const colors = ['#534AB7','#1D9E75','#BA7517','#D85A30'];
        const val = sd[k] || 0.4;
        const h = Math.round(val * 14);
        const col = isSel ? 'rgba(255,255,255,0.7)' : colors[i];
        return `<span class="cell-bar" style="height:${h}px;background:${col};"></span>`;
      }).join('');

      div.innerHTML = `<div class="cell-angles">${bars}</div>`;
      div.addEventListener('click', () => selectCell(c, p, key));
      cells.appendChild(div);
    });
  });
}

// ── VÄESTÖPAINE 2024→2040 ─────────────────────────────────────────
const DEMOGRAPHIC_PRESSURE = {
  lapsuus:        { pop2024: 638000,  pop2040: 540000,  change: -15.4, sectors: 5,  avgWeight: 0.48 },
  murrosika:      { pop2024: 286000,  pop2040: 225000,  change: -21.3, sectors: 7,  avgWeight: 0.26 },
  itsenaistymine: { pop2024: 388000,  pop2040: 315000,  change: -18.8, sectors: 7,  avgWeight: 0.26 },
  perustaminen:   { pop2024: 672000,  pop2040: 545000,  change: -18.9, sectors: 8,  avgWeight: 0.20 },
  rakentaminen:   { pop2024: 1355000, pop2040: 1180000, change: -12.9, sectors: 6,  avgWeight: 0.24 },
  siirtuma:       { pop2024: 662000,  pop2040: 710000,  change:  +7.3, sectors: 6,  avgWeight: 0.14 },
  vapautuminen:   { pop2024: 742000,  pop2040: 845000,  change: +13.9, sectors: 6,  avgWeight: 0.16 },
  sopeutuminen:   { pop2024: 468000,  pop2040: 720000,  change: +53.8, sectors: 4,  avgWeight: 0.24 },
  riippuvuus:     { pop2024: 172000,  pop2040: 350000,  change: +103.5,sectors: 4,  avgWeight: 0.20 },
};

// ── SELECT CELL ───────────────────────────────────────────────────
function selectCell(cluster, period, key) {
  selected = key;
  renderGrid();

  const content = CONTENT[key];
  const mount   = root.querySelector('#detailMount');
  const sd      = signalData[cluster.id] || {};

  if (!content) {
    mount.innerHTML = `<div class="detail">
      <div class="detail-header">
        <div>
          <div class="detail-title">${cluster.label} × ${period.label}</div>
          <div class="detail-sub">${period.desc} · ${cluster.age} · ${cluster.theme}</div>
        </div>
      </div>
      <div class="empty-state">Tähän risteykseen ei ole vielä sisältöä</div>
    </div>`;
    return;
  }

  const angles = [
    { key:'struct', label:'Rakenteellinen', cls:'pill-s', data: content.struct, sig: sd.s },
    { key:'econ',   label:'Taloudellinen',  cls:'pill-e', data: content.econ,   sig: sd.e },
    { key:'cult',   label:'Kulttuurinen',   cls:'pill-c', data: content.cult,   sig: sd.c },
    { key:'subj',   label:'Subjektiivinen', cls:'pill-u', data: content.subj,   sig: sd.u },
  ];
  const colors = { struct:'#534AB7', econ:'#1D9E75', cult:'#BA7517', subj:'#D85A30' };

  const dp = DEMOGRAPHIC_PRESSURE[cluster.id] || {};
  const fmtPop = n => n ? (n >= 1000000 ? (n/1000000).toFixed(2)+' M' : (n/1000).toFixed(0)+' k') : '–';
  const dpHtml = dp.pop2024 ? `
    <div style="padding:0.6rem 1.25rem;border-top:0.5px solid var(--border);background:rgba(28,28,26,0.02);display:flex;gap:1.5rem;flex-wrap:wrap;align-items:center;">
      <span style="font-family:var(--mono);font-size:9px;color:var(--ink-4);text-transform:uppercase;letter-spacing:0.08em;">Väestö 2024→2040</span>
      <span style="font-family:var(--mono);font-size:12px;color:var(--ink-2);">${fmtPop(dp.pop2024)} → ${fmtPop(dp.pop2040)}</span>
      <span style="font-family:var(--mono);font-size:12px;font-weight:500;color:${dp.change>0?'#C0392B':'#27AE60'};">${dp.change>0?'+':''}${dp.change}%</span>
      <span style="font-family:var(--mono);font-size:9px;color:var(--purple);">${dp.sectors} sektoria kohdistuu tähän ryhmään</span>
    </div>` : '';

  const angleCards = angles.map(a => `
    <div class="angle-block">
      <div class="angle-pill ${a.cls}">${a.label}</div>
      <div class="angle-q">${a.data.q}</div>
      <div class="angle-body">${a.data.body}</div>
      ${a.data.example ? `<div class="angle-example">${a.data.example}</div>` : ''}
    </div>
  `).join('');

  const signalItems = angles.map(a => `
    <div class="signal-item">
      <div class="signal-label">${a.label.substring(0,5)}</div>
      <div class="signal-value">${((a.sig||0.5)*100).toFixed(0)}%</div>
      <div class="signal-bar-wrap">
        <div class="signal-bar-fill" style="width:${((a.sig||0.5)*100).toFixed(0)}%;background:${colors[a.key]};"></div>
      </div>
    </div>
  `).join('');

  mount.innerHTML = `<div class="detail">
    <div class="detail-header">
      <div>
        <div class="detail-title">${cluster.label} × ${period.label}</div>
        <div class="detail-sub">${period.desc} · ${cluster.age} · ${cluster.theme}</div>
      </div>
      <div class="detail-meta">
        <span class="detail-signal">${sd.live ? '● Live-data · Supabase' : '○ Staattinen data'}</span>
      </div>
    </div>
    <div class="signal-strip">${signalItems}</div>
    <div class="detail-grid">${angleCards}</div>
    ${dpHtml}
  </div>`;

  mount.scrollIntoView({ behavior:'smooth', block:'nearest' });
}

// ── KRIISIDATA (Supabasesta haettu, staattiset fallback) ──────────
const CRISIS_EVENTS = [
  { id:'sota_1939',          name:'Talvi- ja jatkosota',              type:'poliittinen',  start:1939, peak:1942, end:1945, sev:5, gdp:-15,   unemp:null, lifecycle:['lapsuus','murrosika','rakentaminen','perustaminen'] },
  { id:'karjalaiset_1944',   name:'Karjalaisten siirtoväen asuttaminen', type:'demografinen', start:1940, peak:1944, end:1960, sev:5, gdp:null, unemp:null, lifecycle:['lapsuus','perustaminen','rakentaminen','murrosika'] },
  { id:'jalleenrakennus_1945',name:'Jälleenrakennuksen kriisi',       type:'demografinen', start:1945, peak:1948, end:1955, sev:3, gdp:null,  unemp:null, lifecycle:['lapsuus','perustaminen','rakentaminen'] },
  { id:'rakennemuutos_1960', name:'Maatalousyhteiskunnan murros',     type:'rakenne',      start:1960, peak:1968, end:1975, sev:3, gdp:null,  unemp:2.5,  lifecycle:['rakentaminen','perustaminen','itsenaistymine'] },
  { id:'kaupungistuminen_omavaraisuus_1960', name:'Kaupungistuminen ja omavaraisuuden menetys', type:'rakenne', start:1955, peak:1975, end:2000, sev:3, gdp:null, unemp:null, lifecycle:['perustaminen','rakentaminen','lapsuus','murrosika','siirtuma'] },
  { id:'siirtolaisuus_ruotsi_1960', name:'Suuri muutto Ruotsiin',    type:'demografinen', start:1960, peak:1969, end:1975, sev:4, gdp:null,  unemp:null, lifecycle:['rakentaminen','perustaminen','itsenaistymine','murrosika'] },
  { id:'oljykriisi_1973',    name:'1970-luvun öljykriisi',            type:'taloudellinen',start:1973, peak:1974, end:1977, sev:2, gdp:-3.5,  unemp:3.0,  lifecycle:['rakentaminen','perustaminen'] },
  { id:'lama_1990',          name:'1990-luvun suuri lama',            type:'taloudellinen',start:1990, peak:1993, end:1997, sev:5, gdp:-11,   unemp:19.9, lifecycle:['lapsuus','murrosika','itsenaistymine','perustaminen','rakentaminen'] },
  { id:'dotcom_2001',        name:'IT-kuplan puhkeaminen',            type:'taloudellinen',start:2000, peak:2001, end:2003, sev:2, gdp:-1.2,  unemp:9.1,  lifecycle:['itsenaistymine','rakentaminen'] },
  { id:'finanssikriisi_2008',name:'Globaali finanssikriisi',          type:'taloudellinen',start:2008, peak:2009, end:2011, sev:4, gdp:-8.2,  unemp:8.4,  lifecycle:['rakentaminen','perustaminen','siirtuma'] },
  { id:'nokia_2012',         name:'Nokian romahdus & stagnaatio',     type:'rakenne',      start:2011, peak:2013, end:2016, sev:3, gdp:-6.0,  unemp:9.7,  lifecycle:['rakentaminen','itsenaistymine','perustaminen'] },
  { id:'covid_2020',         name:'COVID-19-pandemia',                type:'terveys',      start:2020, peak:2021, end:2022, sev:4, gdp:-2.8,  unemp:7.7,  lifecycle:['lapsuus','murrosika','itsenaistymine','perustaminen','sopeutuminen','riippuvuus'] },
  { id:'energiakriisi_2022', name:'Energiakriisi ja inflaatio',       type:'taloudellinen',start:2022, peak:2023, end:2024, sev:3, gdp:-1.0,  unemp:7.5,  lifecycle:['perustaminen','rakentaminen','sopeutuminen','riippuvuus'] },
];

const CAUSAL_CHAINS = [
  {
    id:'lama_nuoriso_mieli', name:'1990-lama → nuorisotyöttömyys → mielenterveys → työkyvyttömyyseläke',
    crisis:'lama_1990', totalLag:14, confidence:'kohtalainen', avgR:0.86,
    steps:[
      { from:'BKT-lasku', to:'Nuorisotyöttömyys', lag:1, lifecycle:'itsenaistymine' },
      { from:'Nuorisotyöttömyys', to:'Mielenterveysongelmat', lag:3, lifecycle:'itsenaistymine' },
      { from:'Mielenterveysongelmat', to:'Työkyvyttömyyseläke', lag:10, lifecycle:'rakentaminen' },
    ]
  },
  {
    id:'lama_lapsikoyhyys_syrjaytyminen', name:'Lama → lapsiköyhyys → oppimisvajet → syrjäytyminen',
    crisis:'lama_1990', totalLag:12, confidence:'kohtalainen', avgR:0.82,
    steps:[
      { from:'BKT-lasku', to:'Lapsiköyhyys', lag:2, lifecycle:'lapsuus' },
      { from:'Lapsiköyhyys', to:'Koulupudokkuus', lag:5, lifecycle:'murrosika' },
      { from:'Koulupudokkuus', to:'Syrjäytyminen', lag:5, lifecycle:'itsenaistymine' },
    ]
  },
  {
    id:'hoiva_aalto_ketju', name:'Suuret ikäluokat → hoiva-aalto → kustannusräjähdys → leikkaukset',
    crisis:'jalleenrakennus_1945', totalLag:45, confidence:'kohtalainen', avgR:0.88,
    steps:[
      { from:'Suuret ikäluokat (1945)', to:'85+-väestö kasvaa', lag:40, lifecycle:'riippuvuus' },
      { from:'85+-väestö kasvaa', to:'Hoivamenot nousevat', lag:2, lifecycle:'riippuvuus' },
      { from:'Hoivamenot nousevat', to:'Muut menot puristuvat', lag:3, lifecycle:'lapsuus' },
    ]
  },
  {
    id:'covid_oppimisvaje_mieli', name:'COVID → etäkoulu → oppimisvajet → mielenterveyskriisi',
    crisis:'covid_2020', totalLag:4, confidence:'kohtalainen', avgR:0.88,
    steps:[
      { from:'Sulkutoimet', to:'Oppimisvaje', lag:1, lifecycle:'lapsuus' },
      { from:'Oppimisvaje', to:'Mielenterveysoireilu', lag:2, lifecycle:'murrosika' },
      { from:'Mielenterveysoireilu', to:'Palvelujonot', lag:1, lifecycle:'murrosika' },
    ]
  },
  {
    id:'asunto_syntyvyys_demografia', name:'Asuntohinnat → syntyvyyslasku → demografinen kierre',
    crisis:null, totalLag:28, confidence:'kohtalainen', avgR:0.82,
    steps:[
      { from:'Asuntohintojen nousu', to:'Syntyvyyslasku', lag:3, lifecycle:'perustaminen' },
      { from:'Syntyvyyslasku', to:'Huoltosuhteen heikkeneminen', lag:20, lifecycle:'rakentaminen' },
      { from:'Huoltosuhde heikkenee', to:'Rahoitusvaje', lag:5, lifecycle:'kaikille' },
    ]
  },
  {
    id:'omavaraisuus_riippuvuus', name:'Omavaraisuuden menetys → monetarisaatio → sosiaaliturvariippuvuus → järjestelmäpaine',
    crisis:'kaupungistuminen_omavaraisuus_1960', totalLag:33, confidence:'kohtalainen', avgR:0.84,
    steps:[
      { from:'Maatalousväestö kaupunkiin', to:'Rahamenot kasvavat', lag:10, lifecycle:'perustaminen' },
      { from:'Rahamenot ylittävät tulot', to:'Toimeentukitarve kasvaa', lag:8, lifecycle:'rakentaminen' },
      { from:'Tukiriippuvuus kasvaa', to:'Hyvinvointimenot kasvavat', lag:15, lifecycle:'kaikille' },
    ]
  },
  {
    id:'karjalaiset_rakennemuutos', name:'Karjalaisten asuttaminen → pientilat → rakennemuutos → Ruotsiin muutto',
    crisis:'karjalaiset_1944', totalLag:33, confidence:'kohtalainen', avgR:0.83,
    steps:[
      { from:'Maanhankintalaki: 130k pientilaa', to:'Pientilojen kannattavuus romahtaa', lag:10, lifecycle:'rakentaminen' },
      { from:'Pientilat elinkelvottomia', to:'Muutto maalta kaupunkiin/Ruotsiin', lag:8, lifecycle:'itsenaistymine' },
      { from:'Väestökato maalta', to:'Huoltosuhde heikkenee', lag:15, lifecycle:'kaikille' },
    ]
  },
  {
    id:'siirtolaisuus_huoltosuhde', name:'Ruotsin muutto → huoltosuhde → palvelukustannukset → alueiden autioituminen',
    crisis:'siirtolaisuus_ruotsi_1960', totalLag:23, confidence:'kohtalainen', avgR:0.82,
    steps:[
      { from:'Nettomuutto Ruotsiin', to:'Huoltosuhde heikkenee', lag:5, lifecycle:'rakentaminen' },
      { from:'Huoltosuhde heikkenee', to:'Palvelukustannus/asukas nousee', lag:8, lifecycle:'kaikille' },
      { from:'Kustannus nousee', to:'Kuntatalous alijäämäinen', lag:10, lifecycle:'kaikille' },
    ]
  },
  {
    id:'syntyvyys_huoltosuhde', name:'Syntyvyyslasku → koulutusinvestointivaje → velka',
    crisis:null, totalLag:40, confidence:'kohtalainen', avgR:0.75,
    steps:[
      { from:'Syntyvyyslasku', to:'Koulutustarpeen väheneminen', lag:15, lifecycle:'lapsuus' },
      { from:'Koulutusinvestointivaje', to:'Huoltosuhteen heikkeneminen', lag:20, lifecycle:'rakentaminen' },
      { from:'Huoltosuhde heikkenee', to:'Julkinen velka kasvaa', lag:5, lifecycle:'kaikille' },
    ]
  },
];

// Mikä periodi kattaa vuoden
function periodForYear(year) {
  return PERIODS.find(p => year >= p.years[0] && year <= p.years[1]);
}

// Laske mitkä solut osuvat kriisiin tai sen vanaveseen
function computeCrisisCells() {
  const hitCells  = new Set(); // suora osuma
  const wakeCells = new Set(); // vanavesi

  for (const c of CRISIS_EVENTS) {
    // Suorat osuma-solut
    for (const lc of c.lifecycle) {
      for (let y = c.start; y <= c.end; y++) {
        const p = periodForYear(y);
        if (p) hitCells.add(`${lc}_${p.id}`);
      }
    }
  }

  // Kausaaliketjujen vanavesisolut
  for (const chain of CAUSAL_CHAINS) {
    const crisis = CRISIS_EVENTS.find(c => c.id === chain.crisis);
    const peakYear = crisis ? (crisis.peak || crisis.start) : 2000;
    let cumLag = 0;
    for (const step of chain.steps) {
      cumLag += step.lag;
      const wakeYear = peakYear + cumLag;
      const p = periodForYear(wakeYear);
      if (p && step.lifecycle !== 'kaikille') {
        wakeCells.add(`${step.lifecycle}_${p.id}`);
      }
    }
  }

  return { hitCells, wakeCells };
}

// ── KRIISIPANEELI RENDER ──────────────────────────────────────────
function renderCrisisPanel(activeCrisisId = null) {
  const panel = root.querySelector('#crisisPanel');

  const tabs = CRISIS_EVENTS.map(c => `
    <button class="crisis-tab ${c.id === activeCrisisId ? 'active' : ''}"
      onclick="renderCrisisPanel('${c.id}')">
      <span class="sev sev-${c.sev}"></span>${c.start}–${c.end !== c.start ? c.end : ''} ${c.name}
    </button>
  `).join('');

  const bodies = CRISIS_EVENTS.map(c => {
    const relChains = CAUSAL_CHAINS.filter(ch => ch.crisis === c.id);
    const chainHtml = relChains.length ? `
      <div style="font-family:var(--mono);font-size:9px;text-transform:uppercase;letter-spacing:0.08em;color:var(--ink-4);margin-top:1rem;margin-bottom:0.5rem;">Kausaaliketjut</div>
      <div class="chain-list">
        ${relChains.map(ch => `
          <div class="chain-item">
            <div class="chain-title">${ch.name}</div>
            <div class="chain-steps">
              ${ch.steps.map((s,i) => `
                ${i>0 ? `<span class="chain-arrow">→</span><span class="chain-lag">+${s.lag}v</span><span class="chain-arrow">→</span>` : ''}
                <span class="chain-step">${s.from}</span>
                ${i===ch.steps.length-1 ? `<span class="chain-arrow">→</span><span class="chain-lag">+${s.lag}v</span><span class="chain-arrow">→</span><span class="chain-step">${s.to}</span>` : ''}
              `).join('')}
            </div>
            <div class="chain-meta">
              <span class="chain-conf conf-${ch.confidence}">${ch.confidence}</span>
              <span class="chain-lag-total">Kokonaisviive ${ch.totalLag} v · r=${ch.avgR}</span>
            </div>
          </div>
        `).join('')}
      </div>
    ` : '';

    return `
      <div class="crisis-body ${c.id === activeCrisisId ? 'active' : ''}" id="cb_${c.id}">
        <div class="crisis-meta">
          <div class="crisis-stat">
            <span class="crisis-stat-label">Vakavuus</span>
            <span class="crisis-stat-value">${'★'.repeat(c.sev)}${'☆'.repeat(5-c.sev)}</span>
          </div>
          <div class="crisis-stat">
            <span class="crisis-stat-label">Kesto</span>
            <span class="crisis-stat-value">${c.end - c.start + 1} vuotta</span>
          </div>
          ${c.gdp != null ? `<div class="crisis-stat">
            <span class="crisis-stat-label">BKT-vaikutus</span>
            <span class="crisis-stat-value">${c.gdp > 0 ? '+' : ''}${c.gdp}%</span>
          </div>` : ''}
          ${c.unemp != null ? `<div class="crisis-stat">
            <span class="crisis-stat-label">Työttömyyshuippu</span>
            <span class="crisis-stat-value">${c.unemp}%</span>
          </div>` : ''}
          <div class="crisis-stat">
            <span class="crisis-stat-label">Elämänvaiheet</span>
            <span class="crisis-stat-value">${c.lifecycle.length} kpl</span>
          </div>
        </div>
        ${chainHtml}
      </div>
    `;
  }).join('');

  panel.innerHTML = `
    <div class="crisis-panel">
      <div class="crisis-tabs">${tabs}</div>
      ${bodies}
    </div>
  `;
}

// ── RENDER GRID (päivitetty kriisikorostuksilla) ──────────────────
let crisisCells = { hitCells: new Set(), wakeCells: new Set() };
function renderDemographicBar() {
  const container = root.querySelector('#demoPressureBar');
  if (!container) return;

  const fmt = n => n >= 1000000
    ? (n/1000000).toFixed(2) + ' M'
    : (n/1000).toFixed(0) + ' k';

  const items = CLUSTERS.map(c => {
    const dp = DEMOGRAPHIC_PRESSURE[c.id];
    if (!dp) return '';
    const chg = dp.change;
    const isGrow = chg > 0;
    const barColor = chg > 50 ? '#C0392B'
                   : chg > 10 ? '#E67E22'
                   : chg > 0  ? '#F1C40F'
                   : chg > -15 ? '#27AE60'
                   :             '#2ECC71';
    const barW = Math.min(Math.abs(chg) * 0.8, 80);
    return `
      <div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:0.5px solid var(--border);">
        <div style="width:110px;font-size:10px;font-family:var(--mono);color:var(--ink-2);text-align:right;flex-shrink:0;">
          ${c.label}<br><span style="color:var(--ink-4);font-size:9px;">${c.age}</span>
        </div>
        <div style="flex:1;display:flex;align-items:center;gap:6px;">
          <div style="width:80px;height:10px;background:var(--border);border-radius:3px;overflow:hidden;flex-shrink:0;">
            <div style="height:100%;width:${barW}%;background:${barColor};border-radius:3px;
              margin-left:${isGrow?'0':'auto'};${isGrow?'':'margin-right:0;margin-left:auto;'}"></div>
          </div>
          <span style="font-family:var(--mono);font-size:10px;color:${barColor};font-weight:500;width:42px;">
            ${isGrow?'+':''}${chg}%
          </span>
          <span style="font-family:var(--mono);font-size:9px;color:var(--ink-4);">
            ${fmt(dp.pop2024)} → ${fmt(dp.pop2040)}
          </span>
          <span style="font-family:var(--mono);font-size:9px;color:var(--purple);margin-left:auto;">
            ${dp.sectors} sektoria
          </span>
        </div>
      </div>`;
  }).join('');

  container.innerHTML = `
    <div style="background:var(--paper);border:0.5px solid var(--border-md);border-radius:var(--r-lg);overflow:hidden;">
      <div style="padding:0.75rem 1.25rem;border-bottom:0.5px solid var(--border-md);display:flex;align-items:baseline;gap:1rem;">
        <span style="font-family:var(--serif);font-size:15px;">Väestöpaine 2024 → 2040</span>
        <span style="font-family:var(--mono);font-size:9px;color:var(--ink-4);letter-spacing:0.06em;">TILASTOKESKUS VÄESTÖENNUSTE 2024</span>
      </div>
      <div style="padding:0.75rem 1.25rem;">${items}</div>
    </div>`;
}

// ── KÄYNNISTYS ────────────────────────────────────────────────────
fetchSignal();

    })();
  } catch (err) {
    console.error("[" + ID + "] init virhe:", err);
    root.innerHTML = '<div style="padding:24px;color:#e05c4a;font-family:monospace">' +
      '<strong>Virhe koordinaatistossa:</strong><br>' + (err && err.message ? err.message : err) + '</div>';
    return;
  }

  _instance = { host, cleanup() {} };
}

function unmount(host) {
  if (_instance) { _instance.cleanup(); _instance = null; }
  if (host) host.innerHTML = "";
  const s = document.getElementById("style-" + ID);
  if (s) s.remove();
}

export default { id: ID, mount, unmount };
