// public/plugins/moduli014.js
// Plugin: Hyvinvointilmiösimulaattori
// Generoitu ilmiosim_standalone.html:stä build-moduli014.mjs:llä.
// Simulaation logiikka, mallidata ja UI säilyvät täsmälleen samoina;
// vain CSS scopataan .plugin-moduli014 -juureen ja DOM-haut kohdistuvat hostiin.

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const ID = "moduli014";

const CSS = "\n.plugin-moduli014{\n  --bg:#0d0f0e;--surface:#141716;--surface2:#1c1f1d;--surface3:#222523;\n  --border:rgba(255,255,255,.07);--border2:rgba(255,255,255,.13);\n  --text:#e8ebe8;--muted:#7a8a7c;--ink:#b8c8ba;\n  --red:#e05c4a;--amber:#d4902a;--green:#4caf7a;--blue:#5a9fd4;--purple:#9b72cf;\n  --data-color:#4caf7a;--lit-color:#5a9fd4;--spec-color:#d4902a;\n  --chain-color:#c87edb;\n  --crit-color:#ff4444;\n  --mono:'DM Mono',monospace;--serif:'DM Serif Display',serif;--sans:'DM Sans',sans-serif;\n}\n.plugin-moduli014 *{box-sizing:border-box;margin:0;padding:0}\n.plugin-moduli014, .plugin-moduli014{height:100%;background:var(--bg);color:var(--text);font-family:var(--sans);font-size:13px;overflow:hidden}\n.plugin-moduli014 .app{display:grid;grid-template-rows:52px 1fr;height:100%}\n.plugin-moduli014 .content{display:grid;grid-template-columns:340px 1fr 300px;overflow:hidden}\n\n/* HEADER */\n.plugin-moduli014 header{display:flex;align-items:center;justify-content:space-between;padding:0 20px;border-bottom:1px solid var(--border2);background:var(--surface)}\n.plugin-moduli014 .header-title{font-family:var(--serif);font-size:17px;letter-spacing:.01em}\n.plugin-moduli014 .header-sub{font-family:var(--mono);font-size:10px;color:var(--muted);margin-left:12px;text-transform:uppercase;letter-spacing:.1em}\n.plugin-moduli014 .header-right{display:flex;align-items:center;gap:10px}\n.plugin-moduli014 .system-pressure{font-family:var(--mono);font-size:10px;padding:4px 10px;border:1px solid var(--border2);text-transform:uppercase;letter-spacing:.08em;display:flex;align-items:center;gap:6px;transition:border-color .3s,color .3s}\n.plugin-moduli014 .system-pressure.calm{color:var(--muted);border-color:var(--border)}\n.plugin-moduli014 .system-pressure.moderate{color:var(--amber);border-color:rgba(212,144,42,.5)}\n.plugin-moduli014 .system-pressure.critical{color:var(--red);border-color:rgba(255,68,68,.6);background:rgba(255,68,68,.06);animation:pulse-border 1.5s ease-in-out infinite}\n@keyframes pulse-border{0%,100%{box-shadow:0 0 0 0 rgba(255,68,68,.3)}50%{box-shadow:0 0 0 4px rgba(255,68,68,.1)}}\n.plugin-moduli014 .pill-btn{font-family:var(--mono);font-size:9px;text-transform:uppercase;letter-spacing:.1em;padding:4px 10px;border:1px solid var(--border2);color:var(--muted);background:transparent;cursor:pointer;transition:all .15s}\n.plugin-moduli014 .pill-btn:hover{border-color:var(--text);color:var(--text)}\n.plugin-moduli014 .pill-btn.warn{background:rgba(212,144,42,.12);border-color:rgba(212,144,42,.3);color:var(--amber)}\n\n/* LEFT */\n.plugin-moduli014 aside.left{background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden}\n.plugin-moduli014 .phenomena-panel{padding:14px 16px 10px;flex-shrink:0}\n.plugin-moduli014 .panel-label{font-family:var(--mono);font-size:9px;text-transform:uppercase;letter-spacing:.12em;color:var(--muted);margin-bottom:10px}\n.plugin-moduli014 .phenom-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px}\n.plugin-moduli014 .phenom-card{background:var(--surface2);border:1px solid var(--border);padding:8px 10px;cursor:pointer;transition:border-color .15s,background .15s;position:relative}\n.plugin-moduli014 .phenom-card.active{border-color:currentColor;background:var(--surface3)}\n.plugin-moduli014 .phenom-card.critical-state{animation:card-pulse 2s ease-in-out infinite}\n@keyframes card-pulse{0%,100%{box-shadow:0 0 0 0 transparent}50%{box-shadow:0 0 8px 1px rgba(255,68,68,.25)}}\n.plugin-moduli014 .phenom-name{font-family:var(--mono);font-size:9px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);margin-bottom:3px}\n.plugin-moduli014 .phenom-value{font-family:var(--mono);font-size:15px;font-weight:500;line-height:1}\n.plugin-moduli014 .phenom-delta{font-family:var(--mono);font-size:10px;margin-top:3px;display:flex;align-items:center;gap:4px}\n.plugin-moduli014 .phenom-bar{height:2px;margin-top:6px;background:var(--border);position:relative;overflow:hidden}\n.plugin-moduli014 .phenom-bar-fill{position:absolute;top:0;left:0;height:100%;transition:width .4s ease,background .4s}\n.plugin-moduli014 .crit-badge{position:absolute;top:5px;right:6px;font-family:var(--mono);font-size:8px;color:var(--crit-color);font-weight:700}\n\n.plugin-moduli014 .drivers-section{flex:1;overflow-y:auto;padding:0 16px 16px}\n.plugin-moduli014 .driver-group{margin-bottom:14px}\n.plugin-moduli014 .driver-group-label{font-family:var(--mono);font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:8px;padding-top:12px;border-top:1px solid var(--border)}\n.plugin-moduli014 .driver-group-label:first-child{border-top:none;padding-top:4px}\n.plugin-moduli014 .driver-row{margin-bottom:10px}\n.plugin-moduli014 .driver-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}\n.plugin-moduli014 .driver-label{font-size:11px;color:var(--ink);display:flex;align-items:center;gap:5px}\n.plugin-moduli014 .driver-value{font-family:var(--mono);font-size:11px;font-weight:500;min-width:48px;text-align:right}\n.plugin-moduli014 .conf-badge{font-family:var(--mono);font-size:8px;text-transform:uppercase;letter-spacing:.07em;padding:1px 4px;border:1px solid currentColor;flex-shrink:0}\n.plugin-moduli014 .conf-data{color:var(--data-color)}.plugin-moduli014 .conf-lit{color:var(--lit-color)}.plugin-moduli014 .conf-spec{color:var(--spec-color)}.plugin-moduli014 .conf-new{color:var(--chain-color)}\n.plugin-moduli014 .slider-wrap{position:relative}\n.plugin-moduli014 input[type=range]{width:100%;height:3px;-webkit-appearance:none;background:var(--border2);outline:none;cursor:pointer}\n.plugin-moduli014 input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;border-radius:50%;background:var(--text);border:2px solid var(--bg);cursor:pointer;transition:transform .1s}\n.plugin-moduli014 input[type=range]:hover::-webkit-slider-thumb{transform:scale(1.35)}\n.plugin-moduli014 .driver-note{font-family:var(--mono);font-size:9px;color:var(--muted);margin-top:3px}\n.plugin-moduli014 .chain-note{font-family:var(--mono);font-size:9px;color:var(--chain-color);margin-top:2px}\n\n/* CENTER */\n.plugin-moduli014 main.canvas-area{position:relative;overflow:hidden;background:radial-gradient(ellipse at 50% 30%,rgba(76,175,122,.04) 0%,transparent 70%),var(--bg)}\n.plugin-moduli014 #network-svg{width:100%;height:100%;display:block}\n.plugin-moduli014 .canvas-toolbar{position:absolute;bottom:16px;left:50%;transform:translateX(-50%);display:flex;gap:6px}\n.plugin-moduli014 .c-btn{font-family:var(--mono);font-size:9px;text-transform:uppercase;letter-spacing:.08em;padding:6px 12px;background:var(--surface);border:1px solid var(--border2);color:var(--muted);cursor:pointer;transition:all .15s}\n.plugin-moduli014 .c-btn:hover{border-color:var(--text);color:var(--text)}\n.plugin-moduli014 .c-btn.on{background:var(--surface2);color:var(--text);border-color:var(--border2)}\n\n/* DELTA OVERLAY */\n.plugin-moduli014 .delta-overlay{position:absolute;top:14px;left:50%;transform:translateX(-50%);background:var(--surface);border:1px solid var(--border2);padding:10px 16px;display:none;min-width:320px;font-family:var(--mono);font-size:11px;z-index:5}\n.plugin-moduli014 .delta-row{display:flex;justify-content:space-between;gap:20px;padding:3px 0;border-bottom:1px solid var(--border)}\n.plugin-moduli014 .delta-row:last-child{border-bottom:none}\n\n/* CHAIN PATH overlay */\n.plugin-moduli014 .chain-path-indicator{position:absolute;top:14px;right:14px;background:var(--surface);border:1px solid rgba(200,126,219,.3);padding:8px 12px;font-family:var(--mono);font-size:10px;color:var(--chain-color);display:none;max-width:200px}\n\n/* RIGHT */\n.plugin-moduli014 aside.right{background:var(--surface);border-left:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden}\n.plugin-moduli014 .right-header{padding:12px 16px;border-bottom:1px solid var(--border);flex-shrink:0}\n.plugin-moduli014 .right-content{padding:14px 16px;overflow-y:auto;flex:1}\n.plugin-moduli014 .insp-section{margin-bottom:18px}\n.plugin-moduli014 .insp-section-label{font-family:var(--mono);font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:8px}\n.plugin-moduli014 .insp-title{font-family:var(--serif);font-size:15px;margin-bottom:4px;line-height:1.2}\n.plugin-moduli014 .insp-sub{font-family:var(--mono);font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px}\n.plugin-moduli014 .stat{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border);font-size:11px}\n.plugin-moduli014 .stat .k{color:var(--muted)}.plugin-moduli014 .stat .v{font-family:var(--mono);font-weight:500}\n.plugin-moduli014 .risk-block{padding:8px 12px;margin-top:8px;font-size:11px;line-height:1.4}\n.plugin-moduli014 .risk-high{background:rgba(224,92,74,.08);border-left:3px solid var(--red);color:var(--red)}\n.plugin-moduli014 .risk-medium{background:rgba(212,144,42,.08);border-left:3px solid var(--amber);color:var(--amber)}\n.plugin-moduli014 .risk-low{background:rgba(76,175,122,.08);border-left:3px solid var(--green);color:var(--green)}\n.plugin-moduli014 .risk-chain{background:rgba(200,126,219,.08);border-left:3px solid var(--chain-color);color:var(--chain-color)}\n.plugin-moduli014 .scenario-list{display:flex;flex-direction:column;gap:6px}\n.plugin-moduli014 .scenario-btn{font-family:var(--mono);font-size:10px;text-transform:uppercase;letter-spacing:.08em;padding:8px 10px;background:var(--surface2);border:1px solid var(--border);color:var(--ink);cursor:pointer;text-align:left;transition:all .15s;display:flex;flex-direction:column;gap:2px}\n.plugin-moduli014 .scenario-btn:hover{border-color:var(--border2);color:var(--text)}\n.plugin-moduli014 .scenario-btn .sc-name{font-size:11px}.plugin-moduli014 .scenario-btn .sc-desc{font-size:9px;color:var(--muted);text-transform:none;letter-spacing:0}\n.plugin-moduli014 .legend-item{display:flex;align-items:center;gap:8px;margin-bottom:5px;font-size:10px;color:var(--ink)}\n.plugin-moduli014 .legend-line{width:24px;height:2px;flex-shrink:0}\n\n/* LOAD SCREEN */\n.plugin-moduli014 #load-screen{display:none!important}\n.plugin-moduli014 .load-box{display:none}\n.plugin-moduli014 .load-box h2{font-family:var(--serif);font-size:22px;margin-bottom:6px}\n.plugin-moduli014 .load-box p{font-size:11px;color:var(--muted);margin-bottom:20px;line-height:1.5}\n.plugin-moduli014 .load-zone{display:none}\n.plugin-moduli014 .load-zone:hover{border-color:var(--text);color:var(--text)}\n.plugin-moduli014 .load-zone.loaded{border-style:solid;border-color:var(--green);color:var(--green)}\n.plugin-moduli014 .load-zone input{display:none}\n.plugin-moduli014 .load-start{display:none}\n.plugin-moduli014 .load-start:hover{background:#5cc88a}\n\n/* MODAL */\n.plugin-moduli014 .modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.7);display:none;align-items:center;justify-content:center;z-index:100}\n.plugin-moduli014 .modal-backdrop.show{display:flex}\n.plugin-moduli014 .modal{background:var(--surface);border:1px solid var(--border2);max-width:620px;width:90%;max-height:80vh;overflow-y:auto;padding:28px 32px}\n.plugin-moduli014 .modal h2{font-family:var(--serif);font-size:20px;margin-bottom:14px}\n.plugin-moduli014 .modal p{font-size:12px;line-height:1.6;color:var(--ink);margin-bottom:10px}\n.plugin-moduli014 .modal .close-btn{margin-top:16px;font-family:var(--mono);font-size:10px;text-transform:uppercase;letter-spacing:.1em;padding:8px 16px;background:transparent;border:1px solid var(--border2);color:var(--muted);cursor:pointer}\n.plugin-moduli014 .modal .close-btn:hover{border-color:var(--text);color:var(--text)}\n\n.plugin-moduli014 ::-webkit-scrollbar{width:4px}\n.plugin-moduli014 ::-webkit-scrollbar-track{background:transparent}\n.plugin-moduli014 ::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px}\n";

const HTML = "<div class=\"plugin-moduli014\">\n<!-- LOAD SCREEN -->\n<!-- data embedded, no load screen -->\n\n<!-- APP -->\n<div class=\"app\" id=\"app\">\n  <header>\n    <div style=\"display:flex;align-items:center\">\n      <span class=\"header-title\">Hyvinvointilmiöt</span>\n      <span class=\"header-sub\">· Suomen hyvinvointijärjestelmä · 1990–2024</span>\n    </div>\n    <div class=\"header-right\">\n      <div class=\"system-pressure calm\" id=\"sys-pressure\">Järjestelmäpaine: 0.00</div>\n      <div id=\"scenario-status\" style=\"font-family:var(--mono);font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em\"></div>\n      <button class=\"pill-btn\" id=\"reset-btn\">Nollaa</button>\n      <button class=\"pill-btn warn\" id=\"warning-btn\">⚠ Menetelmä</button>\n    </div>\n  </header>\n\n  <div class=\"content\">\n    <aside class=\"left\">\n      <div class=\"phenomena-panel\">\n        <div class=\"panel-label\">Tilannekuva · 6 ilmiötä</div>\n        <div class=\"phenom-grid\" id=\"phenom-grid\"></div>\n      </div>\n      <div class=\"drivers-section\" id=\"drivers-section\">\n        <div class=\"driver-group-label\">Valitse ilmiö ylhäältä</div>\n      </div>\n    </aside>\n\n    <main class=\"canvas-area\">\n      <svg id=\"network-svg\"></svg>\n      <div class=\"delta-overlay\" id=\"delta-overlay\"></div>\n      <div class=\"chain-path-indicator\" id=\"chain-indicator\"></div>\n      <div class=\"canvas-toolbar\">\n        <button class=\"c-btn on\" id=\"btn-flow\">Virtausanimaatio</button>\n        <button class=\"c-btn\" id=\"btn-chains\">Ilmiöketjut</button>\n        <button class=\"c-btn\" id=\"btn-active-only\">Vain aktiiviset</button>\n      </div>\n    </main>\n\n    <aside class=\"right\">\n      <div class=\"right-header\">\n        <div class=\"panel-label\">Tarkastelu &amp; Skenaariot</div>\n      </div>\n      <div class=\"right-content\" id=\"right-content\">\n        <div class=\"insp-section\">\n          <div class=\"insp-section-label\">Skenaariot</div>\n          <div class=\"scenario-list\" id=\"scenario-list\"></div>\n        </div>\n        <div class=\"insp-section\">\n          <div class=\"insp-section-label\">Linkkilegenda</div>\n          <div class=\"legend-item\"><span class=\"legend-line\" style=\"background:var(--data-color)\"></span><span style=\"color:var(--data-color)\">DATA</span> — muutoskorrelaatio ≥0.30</div>\n          <div class=\"legend-item\"><span class=\"legend-line\" style=\"background:var(--lit-color);opacity:.7\"></span><span style=\"color:var(--lit-color)\">LIT</span> — kirjallisuuspohjainen</div>\n          <div class=\"legend-item\"><span class=\"legend-line\" style=\"background:var(--spec-color);opacity:.5\"></span><span style=\"color:var(--spec-color)\">SPEK</span> — spekulatiivinen</div>\n          <div class=\"legend-item\"><span class=\"legend-line\" style=\"background:var(--chain-color);border-top:2px dashed var(--chain-color);height:0\"></span><span style=\"color:var(--chain-color)\">KETJU</span> — ilmiö→ilmiö (uusi)</div>\n        </div>\n        <div class=\"insp-section\" id=\"selected-info\">\n          <div class=\"insp-section-label\">Valittu elementti</div>\n          <div style=\"font-family:var(--mono);font-size:10px;color:var(--muted)\">Klikkaa solmua tai linkkiä</div>\n        </div>\n      </div>\n    </aside>\n  </div>\n</div>\n\n<!-- METHOD MODAL -->\n<div class=\"modal-backdrop\" id=\"warning-modal\">\n  <div class=\"modal\">\n    <h2>Menetelmällinen varoitus</h2>\n    <p><strong>Tämä ei ole ennustemalli.</strong> Se on hypoteesigeneroinnin ja systeemiajattelun apuväline. Kaikki luvut ovat yksinkertaistettuja likiarvoja.</p>\n    <p><strong style=\"color:var(--data-color)\">DATA</strong> — estimoitu Suomen aikasarjasta 1990–2024, muutoskorrelaatiolla. Pieni n tarkoittaa isoa epävarmuutta.</p>\n    <p><strong style=\"color:var(--lit-color)\">LIT</strong> — kansainvälinen tutkimuskirjallisuus. Kontekstiriski: Suomen erityispiirteet voivat poiketa.</p>\n    <p><strong style=\"color:var(--spec-color)\">SPEK</strong> — teoriaperustainen, heikko tai puuttuva datapohja.</p>\n    <p><strong style=\"color:var(--chain-color)\">KETJU</strong> — ilmiö→ilmiö vaikutukset. Näissä on kaksi epävarmuuskerrointa päällekkäin (ensin driver→ilmiö, sitten ilmiö→ilmiö). Käytä erityisellä varauksella.</p>\n    <p><strong>Järjestelmäpaine</strong> (yläreunan mittari) kuvaa kuinka paljon mallin kokonaismuutos on. Korkea paine ei tarkoita kriisiä — se tarkoittaa että malli on kaukana lähtötilastaan ja epävarmuus kasvaa.</p>\n    <p><strong>Kriittinen muutos</strong> (⚠) näytetään kun ilmiö ylittää ±15 % lähtötasostaan. Tämä on mielivaltainen kynnys, ei tilastollinen signaali.</p>\n    <button class=\"close-btn\" id=\"close-warning\">Ymmärrän rajoitukset</button>\n  </div>\n</div>\n</div>";

let _instance = null;

async function mount(host, core) {
  // Tyylien injektio (kerran)
  if (!document.getElementById("style-" + ID)) {
    const s = document.createElement("style");
    s.id = "style-" + ID;
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  host.innerHTML = HTML;
  const root = host.querySelector(".plugin-" + ID);
  if (!root) {
    console.error("[moduli014] root puuttuu");
    return;
  }

  // Root-scope helpers korvaamaan document.getElementById / querySelector
  const $id = (id) => root.querySelector("#" + id);
  const $qs = (sel) => root.querySelector(sel);
  const $qsa = (sel) => root.querySelectorAll(sel);

  // ── Standalone-script alkaa ────────────────────────────────

// ═══════════════════════════════════════════════════════════════════
// MALLIDATA
// ═══════════════════════════════════════════════════════════════════

const PHENOMENA = {
  syntyvyys:  { label:'Syntyvyys (TFR)',   unit:'lapsia/nainen', base:1.26, good:+1, color:'#4caf7a', short:'TFR' },
  lastensuoj: { label:'Lastensuojelu',     unit:'sij. 0-17‰',    base:4.2,  good:-1, color:'#e05c4a', short:'Sij.' },
  neet:       { label:'Nuoret syrjässä',   unit:'NEET %',        base:11.4, good:-1, color:'#d4902a', short:'NEET' },
  julktalous: { label:'Julk. talous',      unit:'velka % BKT',   base:82.5, good:-1, color:'#9b72cf', short:'Velka' },
  koulutus:   { label:'Erityistuki',       unit:'% oppilaista',  base:10.3, good:-1, color:'#5a9fd4', short:'Erit.tuki' },
  eriarvois:  { label:'Eriarvoisuus',      unit:'Gini',          base:28.4, good:-1, color:'#c07a4a', short:'Gini' },
};

// DRIVER → ILMIÖ -linkit (estimoitu datasta tai kirjallisuudesta)
const LINKS = [
  // ─ SYNTYVYYS ─
  { from:'unemp',       to:'syntyvyys',  weight:-.28, lag:12, conf:'data', r:.47,  n:23, note:'Pitkä viive 12v. Datassa etumerkki ristiriitainen teorian kanssa.' },
  { from:'gini',        to:'syntyvyys',  weight:-.18, lag:10, conf:'data', r:.43,  n:25, note:'Tuloero heikentää syntyvyyttä pitkällä aikavälillä.' },
  { from:'asumiskust',  to:'syntyvyys',  weight:-.35, lag:2,  conf:'lit',  r:.50,  n:null, lit_src:'Kulu & Vikat 2007, Mulder 2006', note:'Asumiskustannukset, kirjallisuusnäyttö vahva.' },
  { from:'ansios',      to:'syntyvyys',  weight:+.20, lag:1,  conf:'lit',  r:.30,  n:null, lit_src:'Lalive & Zweimüller 2009', note:'Ansiosidonnainen vähentää taloudellista epävarmuutta.' },
  { from:'jaljella_vuokra', to:'syntyvyys', weight:+.22, lag:5, conf:'data', r:.38, n:12, note:'Lapsiperheille jäävä käytettävissä oleva tulo vuokran jälkeen. Uusi muuttuja v5.3-datasta.' },
  { from:'bkt',         to:'syntyvyys',  weight:+.12, lag:1,  conf:'spec', note:'Suhdannevaikutus: datassa heikko.' },
  // ─ LASTENSUOJELU ─
  { from:'unemp',       to:'lastensuoj', weight:+.22, lag:5,  conf:'data', r:.39, n:30, note:'Työttömyys lisää sijoituksia 5v viiveellä.' },
  { from:'pdh',         to:'lastensuoj', weight:-.25, lag:6,  conf:'data', r:.67, n:29, note:'⚠ Tasolla trendi. Muutoskorrelaatiossa viive 6v.' },
  { from:'lsk_p',       to:'lastensuoj', weight:-.15, lag:6,  conf:'data', r:.56, n:29, note:'Lastensuojelupanos ja sijoitukset — kasvava tarve vetää molempia.' },
  { from:'mth',         to:'lastensuoj', weight:-.20, lag:6,  conf:'data', r:.67, n:29, note:'MT-palvelut ja sijoitukset — yhteinen kasvu ⚠.' },
  { from:'omistus_vuokra', to:'lastensuoj', weight:+.15, lag:3, conf:'data', r:.36, n:33, note:'Omistaja-vuokralaiskuilu — asumisrakenteen eriarvoisuus.' },
  // ─ NEET ─
  { from:'unemp',       to:'neet',       weight:+.55, lag:0,  conf:'data', r:.85, n:23, note:'Vahvin linkki mallissa. Lähes samanaikainen.' },
  { from:'bkt',         to:'neet',       weight:-.30, lag:1,  conf:'data', r:.63, n:23, note:'BKT-lasku nostaa NEETiä 1v viiveellä.' },
  { from:'nuor',        to:'neet',       weight:-.18, lag:6,  conf:'data', r:.48, n:18, note:'Nuorisotyöpanostus ja NEET 6v viiveellä.' },
  { from:'ansiotaso',   to:'neet',       weight:-.20, lag:3,  conf:'data', r:.47, n:19, note:'Ansiotasoindeksi — uusi v5.3-muuttuja. Reaalipalkkataso ja NEET.' },
  // ─ JULKINEN TALOUS ─
  { from:'unemp',       to:'julktalous', weight:+.45, lag:0,  conf:'data', r:.83, n:34, note:'Vahva: työttömyys kasvattaa menoja ja pienentää tuloja yhtäaikaisesti.' },
  { from:'exp_gdp',     to:'julktalous', weight:+.38, lag:0,  conf:'data', r:.70, n:35, note:'Kokonaismenot ja velka kasvavat yhdessä.' },
  { from:'bkt',         to:'julktalous', weight:-.30, lag:1,  conf:'data', r:.57, n:34, note:'BKT-kasvu pienentää velkasuhdetta viiveellä.' },
  // ─ KOULUTUS ─
  { from:'perus',       to:'koulutus',   weight:+.25, lag:3,  conf:'data', r:.70, n:26, note:'⚠ Yhteinen trendi. Tulkinta epävarma.' },
  { from:'gini',        to:'koulutus',   weight:+.20, lag:2,  conf:'data', r:.41, n:29, note:'Tuloerot ennakoivat erityistuen kasvua 2v viiveellä.' },
  { from:'unemp',       to:'koulutus',   weight:+.15, lag:12, conf:'data', r:.39, n:23, note:'Pitkä viive: taloudellinen ahdinko välittyy hitaasti kouluvaikeuksiin.' },
  // ─ ERIARVOISUUS ─
  { from:'unemp',       to:'eriarvois',  weight:+.25, lag:7,  conf:'data', r:.46, n:28, note:'Työttömyys kasvattaa eriarvoistumista 7v viiveellä.' },
  { from:'exp_gdp',     to:'eriarvois',  weight:-.28, lag:1,  conf:'data', r:.54, n:34, note:'Julkiset menot tasaavat eriarvoistumista.' },
  { from:'omistus_vuokra', to:'eriarvois', weight:+.20, lag:6, conf:'data', r:.36, n:29, note:'Omistaja-vuokralaiskuilu ja tuloerojen kasvu.' },
];

// ILMIÖ → ILMIÖ -ketjulinkit (ChatGPT:n ehdotus, datalla tuettu)
// Nämä merkitään erikseen ja käytetään heikennetyllä painolla (damping)
const PHENOMENA_LINKS = [
  // Tuettu: eriarvoisuus → syntyvyys (kirjallisuus + heikko data-tuki)
  { from:'eriarvois',  to:'syntyvyys',  weight:-.20, conf:'lit',
    note:'Eriarvoisuuden kasvu alentaa syntyvyyttä. LIT-pohjainen.' },
  // Tuettu: lastensuojelu → julkinen talous (kasvavat korjaavat menot)
  { from:'lastensuoj', to:'julktalous', weight:+.15, conf:'data',
    note:'Sijoitusten kasvu lisää julkisia menoja. Data-tuki: r≈0.37, lag 11v.' },
  // Tuettu: NEET → julkinen talous (syrjäytyminen kasvattaa menoja)
  { from:'neet',       to:'julktalous', weight:+.20, conf:'lit',
    note:'Nuorten syrjäytyminen kasvattaa pitkällä aikavälillä sosiaaliturvamenoja.' },
  // Heikko: koulutus → NEET (erityistukitarve ennakoi myöhempää syrjäytymistä)
  { from:'koulutus',   to:'neet',       weight:+.12, conf:'spec',
    note:'Erityistukitarve ja myöhempi NEET — teoreettinen yhteys, heikko datapohja.' },
  // Stabilisoiva: talous → eriarvoisuus (leikkaukset kasvattavat eroja)
  { from:'julktalous', to:'eriarvois',  weight:+.12, conf:'spec',
    note:'Julkisen talouden paine voi heikentää tasaavia palveluita.' },
];

// Tekijät jotka käyttäjä säätää
const DRIVERS = {
  unemp:    { label:'Työttömyysaste',      unit:'%',   base:7.5, min:2,  max:20,  step:.1,  fmt:v=>`${v.toFixed(1)}%` },
  bkt:      { label:'BKT-kasvu',           unit:'%',   base:1.0, min:-8, max:8,   step:.1,  fmt:v=>`${v>0?'+':''}${v.toFixed(1)}%` },
  gini:     { label:'Tuloero (Gini)',       unit:'',    base:28,  min:20, max:40,  step:.1,  fmt:v=>v.toFixed(1) },
  pdh:      { label:'Päivähoito-panostus', unit:'ind', base:1.0, min:.4, max:1.8, step:.02, fmt:v=>v.toFixed(2) },
  perus:    { label:'Perusopetus-panostus',unit:'ind', base:1.0, min:.4, max:1.8, step:.02, fmt:v=>v.toFixed(2) },
  lsk_p:    { label:'Lastensuojelupanos',  unit:'ind', base:1.0, min:.4, max:1.8, step:.02, fmt:v=>v.toFixed(2) },
  nuor:     { label:'Nuorisotyö-panostus', unit:'ind', base:1.0, min:.4, max:1.8, step:.02, fmt:v=>v.toFixed(2) },
  mth:      { label:'MT-palvelut-panostus',unit:'ind', base:1.0, min:.4, max:1.8, step:.02, fmt:v=>v.toFixed(2) },
  exp_gdp:  { label:'Julk. menot % BKT',  unit:'%',   base:77,  min:45, max:100, step:.5,  fmt:v=>`${v.toFixed(1)}%` },
  asumiskust:{ label:'Asumiskustannukset', unit:'ind', base:1.0, min:.4, max:2.5, step:.05, fmt:v=>v.toFixed(2) },
  ansios:   { label:'Ansiosidonnainen',    unit:'ind', base:1.0, min:.4, max:1.6, step:.02, fmt:v=>v.toFixed(2) },
  // Uudet v5.3-datasta
  jaljella_vuokra: { label:'Lapsiperheille jäävä tulo (vuokran jälkeen)', unit:'ind', base:1.0, min:.5, max:1.5, step:.02, fmt:v=>v.toFixed(2), isNew:true },
  omistus_vuokra:  { label:'Omistaja/vuokra-tulokuilu',    unit:'ind', base:1.0, min:.7, max:1.5, step:.02, fmt:v=>v.toFixed(2), isNew:true },
  ansiotaso:       { label:'Ansiotasoindeksi',              unit:'ind', base:1.0, min:.7, max:1.5, step:.02, fmt:v=>v.toFixed(2), isNew:true },
};

const SCENARIOS = [
  { name:'Nuorten epävarmuus',   desc:'Asuminen kallistuu, ansiosidonnainen leikkautuu',
    changes:{ unemp:+3, asumiskust:+.4, ansios:-.2, nuor:-.1, jaljella_vuokra:-.15 } },
  { name:'Leikkausskenaariot',   desc:'Julkisia palveluita supistetaan',
    changes:{ pdh:-.25, perus:-.2, lsk_p:-.15, nuor:-.2, mth:-.15, exp_gdp:-5 } },
  { name:'Lama-skenaario',       desc:'1990-laman tapainen sokki',
    changes:{ bkt:-7, unemp:+8, exp_gdp:-5 } },
  { name:'Panostus lapsipalveluihin', desc:'Ehkäisevien palvelujen reaalikasvu +25%',
    changes:{ pdh:+.25, perus:+.15, nuor:+.25, lsk_p:+.10 } },
  { name:'Asuminen helpottuu',   desc:'Lapsiperheille jäävä tulo paranee',
    changes:{ asumiskust:-.2, jaljella_vuokra:+.15, ansiotaso:+.1 } },
];

// ═══════════════════════════════════════════════════════════════════
// TILA JA ENGINE
// ═══════════════════════════════════════════════════════════════════
const DAMPING = 0.55;   // ilmiö→ilmiö vaimennuskerroin
const CHAIN_ITER = 2;   // iterointikierroksia

const state = {
  vars: Object.fromEntries(Object.entries(DRIVERS).map(([k,d])=>[k,d.base])),
  phenom: Object.fromEntries(Object.entries(PHENOMENA).map(([k,v])=>[k,v.base])),
  master:null, ttt:null,
  activePhenom:'syntyvyys',
  showFlow:true, showChains:false, activeOnly:false,
  networkNodes:null, nodeById:null,
  flowTimer:null,
};

function computeAll() {
  // Reset
  for (const [k,v] of Object.entries(PHENOMENA)) state.phenom[k] = v.base;

  // 1. Driver → ilmiö (normalisoitu driver-muutos)
  for (const lnk of LINKS) {
    const d = DRIVERS[lnk.from];
    if (!d) continue;
    const norm = (state.vars[lnk.from] - d.base) / (d.max - d.min);
    state.phenom[lnk.to] += norm * lnk.weight * Math.abs(PHENOMENA[lnk.to].base);
  }

  // 2. Ilmiö → ilmiö (normalisoitu delta, vaimennettu)
  // Normalisoitu delta = (phenom - base) / base  → skaalautuu oikein eri yksiköille
  for (let iter = 0; iter < CHAIN_ITER; iter++) {
    const updates = {};
    for (const lnk of PHENOMENA_LINKS) {
      const normDelta = (state.phenom[lnk.from] - PHENOMENA[lnk.from].base)
                        / Math.abs(PHENOMENA[lnk.from].base);
      // Vaikutus kohteessa: normDelta * weight * DAMPING * target_base
      const impact = normDelta * lnk.weight * DAMPING
                     * Math.abs(PHENOMENA[lnk.to].base);
      updates[lnk.to] = (updates[lnk.to] || 0) + impact;
    }
    for (const [k, change] of Object.entries(updates)) {
      state.phenom[k] = clamp(state.phenom[k] + change, k);
    }
  }
}

function clamp(v, key) {
  const ph = PHENOMENA[key];
  if (!ph) return v;
  // Ei anna mennä yli 3× tai alle 0.05× lähtöarvon
  const lo = ph.base * 0.05, hi = ph.base * 3.5;
  return Math.max(lo, Math.min(hi, v));
}

function systemPressure() {
  let p = 0;
  for (const [k,ph] of Object.entries(PHENOMENA)) {
    const d = Math.abs(state.phenom[k] - ph.base) / Math.abs(ph.base);
    p += d;
  }
  return p / Object.keys(PHENOMENA).length;
}

function isCritical(key) {
  const ph = PHENOMENA[key];
  return Math.abs(state.phenom[key] - ph.base) / Math.abs(ph.base) > 0.15;
}

// ═══════════════════════════════════════════════════════════════════
// EMBEDDED DATA — ei tiedostolatausta
// Data: finland_public_finance_master_updated_14.json (1990–2024)
// Korjattu: 1999-yksikkövirhe, 1993-iakkaat, deflator 2020-baasin
// ═══════════════════════════════════════════════════════════════════
const EMBEDDED = {"1990":{"tfr":1.78,"birth_rate":13.1,"age_65_share":13.5,"demo_dependency":48.6,"gini_disposable":20.9,"gini_market_income":40.5,"unemployment_rate":5.7,"empl_rate_25_34":81.4,"sijoitettu_0_17_pct":8.6,"sijoitettu_13_17_pct":0.7,"sijoitettu_0_6_pct":0.3,"huostassa_13_17_pct":0.6,"huostassa_7_12_pct":0.5,"suicides_per100k":27.5,"psych_rehab":0.2,"gdp_meur":90964,"bkt_muutos":0.7,"edp_debt_gdp":13.8,"expenditure_gdp":57.2,"revenue_gdp":62.5,"percap_paivahoito":3850.9,"percap_perusopetus":2313.1,"percap_lastensuojelu":142.4,"percap_nuoriso":111.2,"percap_kirjasto":30.3,"percap_liikunta":85.8,"percap_erikoissairaanhoito":103.2,"percap_perusterveydenhuolto":406.4,"percap_iakkaat":1060.9,"percap_mielenterveys":8.0},"1991":{"tfr":1.79,"birth_rate":13,"age_65_share":13.6,"demo_dependency":48.8,"gini_disposable":20.7,"gini_market_income":41.5,"unemployment_rate":12.1,"empl_rate_25_34":74.5,"sijoitettu_0_17_pct":8.7,"sijoitettu_13_17_pct":1,"sijoitettu_0_6_pct":0.5,"huostassa_13_17_pct":0.8,"huostassa_7_12_pct":0.5,"suicides_per100k":26.8,"psych_rehab":0.7,"gdp_meur":86913,"bkt_muutos":-5.9,"edp_debt_gdp":21.9,"expenditure_gdp":70.1,"revenue_gdp":69.2,"percap_paivahoito":4121.3,"percap_perusopetus":2317.7,"percap_lastensuojelu":154.5,"percap_nuoriso":115.4,"percap_kirjasto":30.1,"percap_liikunta":87.6,"percap_erikoissairaanhoito":105.9,"percap_perusterveydenhuolto":433.3,"percap_iakkaat":1117.5,"percap_mielenterveys":7.7},"1992":{"tfr":1.85,"birth_rate":13.2,"age_65_share":13.8,"demo_dependency":49,"family_with_child_pct":47.1,"single_household_pct":33.5,"gini_disposable":20.5,"gini_market_income":44.6,"unemployment_rate":18,"empl_rate_25_34":68.5,"sijoitettu_0_17_pct":9.8,"sijoitettu_13_17_pct":1,"sijoitettu_0_6_pct":0.5,"huostassa_13_17_pct":0.8,"huostassa_7_12_pct":0.6,"suicides_per100k":26,"psych_rehab":1.1,"gdp_meur":84786,"bkt_muutos":-3.3,"edp_debt_gdp":39.2,"expenditure_gdp":76.5,"revenue_gdp":71.1,"percap_paivahoito":3843.5,"percap_perusopetus":2206.7,"percap_lastensuojelu":148.4,"percap_nuoriso":108.4,"percap_kirjasto":24.6,"percap_liikunta":82.1,"percap_erikoissairaanhoito":104.3,"percap_perusterveydenhuolto":418.5,"percap_iakkaat":1055.6,"percap_mielenterveys":7.0},"1993":{"tfr":1.81,"birth_rate":12.8,"age_65_share":13.9,"demo_dependency":49.2,"family_with_child_pct":47,"single_household_pct":34.2,"gini_disposable":21.3,"gini_market_income":47.7,"unemployment_rate":22.2,"empl_rate_25_34":63.3,"sijoitettu_0_17_pct":10.2,"sijoitettu_13_17_pct":1,"sijoitettu_0_6_pct":0.5,"huostassa_13_17_pct":0.8,"huostassa_7_12_pct":0.6,"suicides_per100k":24.7,"psych_rehab":1.4,"gdp_meur":85610,"bkt_muutos":-0.8,"edp_debt_gdp":54.2,"expenditure_gdp":81.9,"revenue_gdp":74,"percap_paivahoito":5246.1,"percap_perusopetus":5766.3,"percap_lastensuojelu":307.9,"percap_nuoriso":127.6,"percap_kirjasto":61.0,"percap_liikunta":86.8,"percap_erikoissairaanhoito":713.5,"percap_perusterveydenhuolto":425.2,"percap_iakkaat":1744.2,"percap_mielenterveys":17.4},"1994":{"tfr":1.85,"birth_rate":12.8,"age_65_share":14.1,"demo_dependency":49.5,"family_with_child_pct":46.7,"single_household_pct":34.9,"gini_disposable":21.3,"gini_market_income":48.7,"unemployment_rate":20.4,"empl_rate_25_34":64.8,"sijoitettu_0_17_pct":9.8,"sijoitettu_13_17_pct":1,"sijoitettu_0_6_pct":0.5,"huostassa_13_17_pct":0.8,"huostassa_7_12_pct":0.6,"suicides_per100k":24.9,"psych_rehab":1.6,"gdp_meur":90646,"bkt_muutos":4,"edp_debt_gdp":56.2,"expenditure_gdp":81.3,"revenue_gdp":74.9,"percap_paivahoito":5018.3,"percap_perusopetus":5688.3,"percap_lastensuojelu":306.8,"percap_nuoriso":121.1,"percap_kirjasto":58.5,"percap_liikunta":84.8,"percap_erikoissairaanhoito":667.6,"percap_perusterveydenhuolto":422.1,"percap_iakkaat":2377.8,"percap_mielenterveys":18.1},"1995":{"tfr":1.81,"birth_rate":12.3,"age_65_share":14.3,"demo_dependency":49.8,"family_with_child_pct":46.2,"single_household_pct":35.7,"gini_disposable":22.2,"gini_market_income":48.8,"income_median":20598,"unemployment_rate":19.8,"empl_rate_25_34":65.5,"sijoitettu_0_17_pct":9.2,"sijoitettu_13_17_pct":1.1,"sijoitettu_0_6_pct":0.5,"huostassa_13_17_pct":0.8,"huostassa_7_12_pct":0.6,"erityistuki_yht_pct":2.9,"suicides_per100k":24.5,"psych_rehab":1.4,"gdp_meur":98454,"bkt_muutos":4.2,"edp_debt_gdp":55.2,"expenditure_gdp":78.6,"revenue_gdp":72.8,"percap_paivahoito":4929.7,"percap_perusopetus":5722.6,"percap_lastensuojelu":317.1,"percap_nuoriso":134.8,"percap_kirjasto":57.5,"percap_liikunta":83.5,"percap_erikoissairaanhoito":666.2,"percap_perusterveydenhuolto":415.4,"percap_iakkaat":2443.0,"percap_mielenterveys":17.8},"1996":{"tfr":1.76,"birth_rate":11.8,"age_65_share":14.5,"demo_dependency":50,"family_with_child_pct":45.8,"single_household_pct":36.1,"gini_disposable":22.6,"gini_market_income":48.6,"income_median":20944,"unemployment_rate":19.4,"empl_rate_25_34":66.9,"sijoitettu_0_17_pct":8.4,"sijoitettu_13_17_pct":1.1,"sijoitettu_0_6_pct":0.5,"huostassa_13_17_pct":0.8,"huostassa_7_12_pct":0.6,"erityistuki_yht_pct":3,"suicides_per100k":21.9,"psych_rehab":1.7,"gdp_meur":101977,"bkt_muutos":3.7,"edp_debt_gdp":55.4,"expenditure_gdp":75.3,"revenue_gdp":72.1,"percap_paivahoito":4764.9,"percap_perusopetus":5908.2,"percap_lastensuojelu":335.3,"percap_nuoriso":153.8,"percap_kirjasto":58.6,"percap_liikunta":86.0,"percap_erikoissairaanhoito":711.8,"percap_perusterveydenhuolto":436.2,"percap_iakkaat":1994.0,"percap_mielenterveys":19.2},"1997":{"tfr":1.75,"birth_rate":11.5,"age_65_share":14.6,"demo_dependency":50,"family_with_child_pct":45.4,"single_household_pct":36.5,"gini_disposable":24,"gini_market_income":48.3,"income_median":21682,"unemployment_rate":16.7,"empl_rate_25_34":69.7,"sijoitettu_0_17_pct":6.7,"sijoitettu_13_17_pct":1.2,"sijoitettu_0_6_pct":0.5,"huostassa_13_17_pct":0.9,"huostassa_7_12_pct":0.6,"erityistuki_yht_pct":3.4,"suicides_per100k":23.2,"psych_rehab":1.8,"gdp_meur":110764,"bkt_muutos":6.4,"edp_debt_gdp":52.2,"expenditure_gdp":69.7,"revenue_gdp":68.5,"percap_paivahoito":4849.4,"percap_perusopetus":5302.4,"percap_lastensuojelu":435.6,"percap_nuoriso":125.7,"percap_kirjasto":52.1,"percap_liikunta":70.3,"percap_erikoissairaanhoito":748.6,"percap_perusterveydenhuolto":425.9,"percap_iakkaat":1836.0,"percap_mielenterveys":18.3},"1998":{"tfr":1.7,"birth_rate":11.1,"age_65_share":14.7,"demo_dependency":49.7,"family_with_child_pct":44.9,"single_household_pct":37,"gini_disposable":25.2,"gini_market_income":48.6,"income_median":22144,"unemployment_rate":15.1,"empl_rate_25_34":71.9,"sijoitettu_0_17_pct":6.6,"sijoitettu_13_17_pct":1.2,"sijoitettu_0_6_pct":0.5,"huostassa_13_17_pct":0.9,"huostassa_7_12_pct":0.6,"erityistuki_yht_pct":3.7,"suicides_per100k":21.1,"psych_rehab":2.1,"gdp_meur":120431,"bkt_muutos":5.5,"edp_debt_gdp":46.8,"expenditure_gdp":64.9,"revenue_gdp":66.6,"percap_paivahoito":5096.7,"percap_perusopetus":5486.6,"percap_lastensuojelu":451.2,"percap_nuoriso":122.2,"percap_kirjasto":50.9,"percap_liikunta":68.9,"percap_erikoissairaanhoito":741.5,"percap_perusterveydenhuolto":421.9,"percap_iakkaat":1855.0,"percap_mielenterveys":18.0},"1999":{"tfr":1.73,"birth_rate":11.1,"age_65_share":14.8,"demo_dependency":49.5,"family_with_child_pct":44.3,"single_household_pct":37.5,"gini_disposable":27,"gini_market_income":49.9,"income_median":22681,"unemployment_rate":14.1,"empl_rate_25_34":73,"sijoitettu_0_17_pct":9.7,"sijoitettu_13_17_pct":1.3,"sijoitettu_0_6_pct":0.6,"huostassa_13_17_pct":0.9,"huostassa_7_12_pct":0.6,"erityistuki_yht_pct":4.1,"suicides_per100k":21,"psych_rehab":2.3,"gdp_meur":126888,"bkt_muutos":4.4,"edp_debt_gdp":44.1,"expenditure_gdp":62.6,"revenue_gdp":64.3,"percap_paivahoito":5280.3,"percap_perusopetus":5716.8,"percap_lastensuojelu":473.6,"percap_nuoriso":124.1,"percap_kirjasto":51.6,"percap_liikunta":70.5,"percap_erikoissairaanhoito":755.8,"percap_perusterveydenhuolto":425.9,"percap_iakkaat":1946.1,"percap_mielenterveys":19.0},"2000":{"tfr":1.73,"birth_rate":11,"age_65_share":15,"demo_dependency":49.4,"family_with_child_pct":43.7,"single_household_pct":37.9,"gini_disposable":28.4,"gini_market_income":50.4,"income_median":22990,"unemployment_rate":12.6,"empl_rate_25_34":74.6,"neet":12.9,"sijoitettu_0_17_pct":8.3,"sijoitettu_13_17_pct":1.4,"sijoitettu_0_6_pct":0.6,"huostassa_13_17_pct":1,"huostassa_7_12_pct":0.6,"erityistuki_yht_pct":4.5,"pisa_math":536,"pisa_reading":546,"suicides_per100k":20.2,"psych_rehab":2.5,"gdp_meur":136386,"bkt_muutos":5.8,"edp_debt_gdp":45.1,"expenditure_gdp":58.2,"revenue_gdp":65.1,"percap_paivahoito":5329.7,"percap_perusopetus":6198.2,"percap_lastensuojelu":516.9,"percap_nuoriso":129.4,"percap_kirjasto":54.8,"percap_liikunta":83.7,"percap_erikoissairaanhoito":775.4,"percap_perusterveydenhuolto":503.5,"percap_iakkaat":2606.3,"percap_mielenterveys":20.8},"2001":{"tfr":1.73,"birth_rate":10.8,"age_65_share":15.2,"demo_dependency":49.4,"family_with_child_pct":43,"single_household_pct":38.5,"gini_disposable":26.9,"gini_market_income":48.9,"income_median":23703,"unemployment_rate":12.4,"empl_rate_25_34":74.8,"neet":11.3,"sijoitettu_0_17_pct":8.5,"sijoitettu_13_17_pct":1.5,"sijoitettu_0_6_pct":0.6,"huostassa_13_17_pct":1.1,"huostassa_7_12_pct":0.6,"erityistuki_yht_pct":5.2,"suicides_per100k":20.5,"psych_rehab":2.4,"gdp_meur":144613,"bkt_muutos":2.6,"edp_debt_gdp":43.4,"expenditure_gdp":57.4,"revenue_gdp":62.4,"percap_paivahoito":5288.1,"percap_perusopetus":6347.4,"percap_lastensuojelu":571.4,"percap_nuoriso":137.0,"percap_kirjasto":55.6,"percap_liikunta":85.1,"percap_erikoissairaanhoito":809.7,"percap_perusterveydenhuolto":522.5,"percap_iakkaat":2782.8,"percap_mielenterveys":22.9},"2002":{"tfr":1.72,"birth_rate":10.7,"age_65_share":15.3,"demo_dependency":49.5,"family_with_child_pct":42.4,"single_household_pct":39,"gini_disposable":26.8,"gini_market_income":48.8,"income_median":24291,"unemployment_rate":12,"empl_rate_25_34":74.7,"neet":11.4,"sijoitettu_0_17_pct":8.1,"sijoitettu_13_17_pct":1.6,"sijoitettu_0_6_pct":0.6,"huostassa_13_17_pct":1.1,"huostassa_7_12_pct":0.7,"erityistuki_yht_pct":5.7,"suicides_per100k":18.5,"psych_rehab":4.2,"gdp_meur":148440,"bkt_muutos":1.7,"edp_debt_gdp":42.6,"expenditure_gdp":59.6,"revenue_gdp":63.7,"percap_paivahoito":5422.1,"percap_perusopetus":6640.5,"percap_lastensuojelu":619.3,"percap_nuoriso":144.0,"percap_kirjasto":56.9,"percap_liikunta":86.8,"percap_erikoissairaanhoito":860.2,"percap_perusterveydenhuolto":557.5,"percap_iakkaat":2903.6,"percap_mielenterveys":24.6},"2003":{"tfr":1.76,"birth_rate":10.9,"age_65_share":15.6,"demo_dependency":49.6,"family_with_child_pct":42,"single_household_pct":39.5,"gini_disposable":27.2,"gini_market_income":48.9,"income_median":24932,"unemployment_rate":12,"empl_rate_25_34":74.4,"neet":12,"sijoitettu_0_17_pct":8.1,"sijoitettu_13_17_pct":1.7,"sijoitettu_0_6_pct":0.6,"huostassa_13_17_pct":1.2,"huostassa_7_12_pct":0.7,"erityistuki_yht_pct":6.2,"pisa_math":544,"pisa_reading":543,"suicides_per100k":18.1,"psych_rehab":4.7,"gdp_meur":151714,"bkt_muutos":2,"edp_debt_gdp":45.2,"expenditure_gdp":60.9,"revenue_gdp":63.3,"percap_paivahoito":5542.7,"percap_perusopetus":6958.0,"percap_lastensuojelu":668.3,"percap_nuoriso":150.6,"percap_kirjasto":59.2,"percap_liikunta":88.8,"percap_erikoissairaanhoito":909.5,"percap_perusterveydenhuolto":585.7,"percap_iakkaat":3054.5,"percap_mielenterveys":26.4},"2004":{"tfr":1.8,"birth_rate":11,"age_65_share":15.9,"demo_dependency":49.9,"family_with_child_pct":41.7,"single_household_pct":39.9,"gini_disposable":28.2,"gini_market_income":49.6,"income_median":25921,"unemployment_rate":11.8,"empl_rate_25_34":74.7,"neet":11.7,"sijoitettu_0_17_pct":8.1,"sijoitettu_13_17_pct":1.8,"sijoitettu_0_6_pct":0.7,"huostassa_13_17_pct":1.2,"huostassa_7_12_pct":0.7,"erityistuki_yht_pct":6.7,"suicides_per100k":18.1,"psych_rehab":4.4,"gdp_meur":158741,"bkt_muutos":4,"edp_debt_gdp":44.9,"expenditure_gdp":60.8,"revenue_gdp":63,"percap_paivahoito":5663.3,"percap_perusopetus":7329.8,"percap_lastensuojelu":729.6,"percap_nuoriso":148.0,"percap_kirjasto":60.3,"percap_liikunta":91.2,"percap_erikoissairaanhoito":961.8,"percap_perusterveydenhuolto":612.7,"percap_iakkaat":3226.7,"percap_mielenterveys":28.0},"2005":{"tfr":1.8,"birth_rate":11,"age_65_share":16,"demo_dependency":49.9,"family_with_child_pct":41.5,"single_household_pct":40.4,"gini_disposable":28.1,"gini_market_income":49.5,"income_median":26447,"unemployment_rate":11.1,"empl_rate_25_34":75.4,"neet":10.6,"sijoitettu_0_17_pct":8.5,"sijoitettu_13_17_pct":1.8,"sijoitettu_0_6_pct":0.7,"huostassa_13_17_pct":1.3,"huostassa_7_12_pct":0.7,"erityistuki_yht_pct":7.3,"suicides_per100k":16.2,"psych_rehab":4.3,"gdp_meur":164666,"bkt_muutos":2.8,"edp_debt_gdp":42.1,"expenditure_gdp":60.8,"revenue_gdp":63.5,"percap_paivahoito":5957.2,"percap_perusopetus":7725.1,"percap_lastensuojelu":786.6,"percap_nuoriso":149.8,"percap_kirjasto":61.8,"percap_liikunta":93.9,"percap_erikoissairaanhoito":994.6,"percap_perusterveydenhuolto":630.7,"percap_iakkaat":3330.9,"percap_mielenterveys":29.1},"2006":{"tfr":1.84,"birth_rate":11.2,"age_65_share":16.5,"demo_dependency":50.1,"family_with_child_pct":41.2,"single_household_pct":40.7,"gini_disposable":28.7,"gini_market_income":49.8,"income_median":27069,"unemployment_rate":9.7,"empl_rate_25_34":76.7,"neet":10.7,"sijoitettu_0_17_pct":8.4,"sijoitettu_13_17_pct":1.9,"sijoitettu_0_6_pct":0.7,"huostassa_13_17_pct":1.4,"huostassa_7_12_pct":0.8,"erityistuki_yht_pct":7.7,"pisa_math":548,"pisa_reading":547,"suicides_per100k":17.6,"psych_rehab":4.9,"gdp_meur":172861,"bkt_muutos":4,"edp_debt_gdp":40.2,"expenditure_gdp":59,"revenue_gdp":63,"percap_paivahoito":6021.2,"percap_perusopetus":8048.0,"percap_lastensuojelu":844.8,"percap_nuoriso":151.3,"percap_kirjasto":62.7,"percap_liikunta":95.6,"percap_erikoissairaanhoito":1024.0,"percap_perusterveydenhuolto":659.7,"percap_iakkaat":3456.2,"percap_mielenterveys":31.2},"2007":{"tfr":1.83,"birth_rate":11.1,"age_65_share":16.5,"demo_dependency":50.3,"family_with_child_pct":40.9,"single_household_pct":41,"gini_disposable":29.5,"gini_market_income":49.8,"income_median":27970,"unemployment_rate":8.5,"empl_rate_25_34":78.2,"neet":9.7,"sijoitettu_0_17_pct":8.3,"sijoitettu_13_17_pct":2,"sijoitettu_0_6_pct":0.7,"huostassa_13_17_pct":1.4,"huostassa_7_12_pct":0.8,"erityistuki_yht_pct":8.1,"suicides_per100k":16.3,"psych_rehab":5.3,"gdp_meur":187059,"bkt_muutos":5.3,"edp_debt_gdp":36,"expenditure_gdp":56.8,"revenue_gdp":61.9,"percap_paivahoito":6096.7,"percap_perusopetus":8263.5,"percap_lastensuojelu":913.9,"percap_nuoriso":152.8,"percap_kirjasto":62.8,"percap_liikunta":94.6,"percap_erikoissairaanhoito":1046.1,"percap_perusterveydenhuolto":672.1,"percap_iakkaat":3628.6,"percap_mielenterveys":32.1},"2008":{"tfr":1.85,"birth_rate":11.2,"age_65_share":16.7,"demo_dependency":50.2,"family_with_child_pct":40.5,"single_household_pct":41.3,"gini_disposable":28.4,"gini_market_income":48.9,"income_median":28363,"unemployment_rate":9,"empl_rate_25_34":78.1,"neet":9.9,"sijoitettu_0_17_pct":7.8,"sijoitettu_13_17_pct":2.1,"sijoitettu_0_6_pct":0.7,"huostassa_13_17_pct":1.5,"huostassa_7_12_pct":0.8,"ls_ilmoitus_pct":4.3,"erityistuki_yht_pct":8.4,"suicides_per100k":17.1,"psych_rehab":5.5,"gdp_meur":194253,"bkt_muutos":0.8,"edp_debt_gdp":34.7,"expenditure_gdp":59.2,"revenue_gdp":63.4,"percap_paivahoito":6289.8,"percap_perusopetus":8607.3,"percap_lastensuojelu":991.1,"percap_nuoriso":158.5,"percap_kirjasto":64.3,"percap_liikunta":96.2,"percap_erikoissairaanhoito":1099.2,"percap_perusterveydenhuolto":710.7,"percap_iakkaat":3833.1,"percap_mielenterveys":34.4},"2009":{"tfr":1.86,"birth_rate":11.3,"age_65_share":17,"demo_dependency":50.5,"family_with_child_pct":40.3,"single_household_pct":41.4,"gini_disposable":27.6,"gini_market_income":49.4,"income_median":28940,"unemployment_rate":11.6,"empl_rate_25_34":74.7,"neet":12.9,"sijoitettu_0_17_pct":7.7,"sijoitettu_13_17_pct":2.2,"sijoitettu_0_6_pct":0.7,"huostassa_13_17_pct":1.5,"huostassa_7_12_pct":0.8,"ls_ilmoitus_pct":4.6,"erityistuki_yht_pct":8.5,"pisa_math":541,"pisa_reading":536,"suicides_per100k":17,"psych_rehab":6,"gdp_meur":181735,"bkt_muutos":-8.1,"edp_debt_gdp":44.1,"expenditure_gdp":67.5,"revenue_gdp":65,"percap_paivahoito":6451.8,"percap_perusopetus":8891.6,"percap_lastensuojelu":957.2,"percap_nuoriso":161.4,"percap_kirjasto":65.1,"percap_liikunta":102.2,"percap_erikoissairaanhoito":1120.0,"percap_perusterveydenhuolto":703.2,"percap_iakkaat":4065.0,"percap_mielenterveys":35.4},"2010":{"tfr":1.87,"birth_rate":11.4,"age_65_share":17.5,"demo_dependency":51.1,"family_with_child_pct":40,"single_household_pct":41.7,"gini_disposable":27.9,"gini_market_income":50.1,"income_median":29349,"unemployment_rate":10.4,"empl_rate_25_34":75.7,"neet":12.5,"sijoitettu_0_17_pct":6.7,"sijoitettu_13_17_pct":2.3,"sijoitettu_0_6_pct":0.7,"huostassa_13_17_pct":1.5,"huostassa_7_12_pct":0.8,"ls_ilmoitus_pct":5,"erityistuki_yht_pct":8.5,"suicides_per100k":15.8,"psych_rehab":6.3,"gdp_meur":188147,"bkt_muutos":3.2,"edp_debt_gdp":50.1,"expenditure_gdp":68,"revenue_gdp":65.4,"percap_paivahoito":6584.9,"percap_perusopetus":9462.7,"percap_lastensuojelu":972.9,"percap_nuoriso":172.2,"percap_kirjasto":65.9,"percap_liikunta":102.7,"percap_erikoissairaanhoito":1138.5,"percap_perusterveydenhuolto":707.1,"percap_iakkaat":4170.6,"percap_mielenterveys":35.1},"2011":{"tfr":1.83,"birth_rate":11.1,"age_65_share":18.1,"demo_dependency":52.2,"family_with_child_pct":39.7,"single_household_pct":41.9,"gini_disposable":28.2,"gini_market_income":50.2,"income_median":29382,"unemployment_rate":9.9,"empl_rate_25_34":76.2,"neet":11.7,"sijoitettu_0_17_pct":7.5,"sijoitettu_13_17_pct":2.4,"sijoitettu_0_6_pct":0.8,"huostassa_13_17_pct":1.6,"huostassa_7_12_pct":0.8,"ls_ilmoitus_pct":5.5,"erityistuki_yht_pct":8.1,"tehostettutuki_pct":3.3,"suicides_per100k":14.8,"psych_rehab":7.2,"gdp_meur":197655,"bkt_muutos":2.4,"edp_debt_gdp":52,"expenditure_gdp":67.5,"revenue_gdp":66.5,"percap_paivahoito":6734.3,"percap_perusopetus":9529.1,"percap_lastensuojelu":1035.5,"percap_nuoriso":174.4,"percap_kirjasto":65.9,"percap_liikunta":103.0,"percap_erikoissairaanhoito":1170.8,"percap_perusterveydenhuolto":718.7,"percap_iakkaat":4176.8,"percap_mielenterveys":35.9},"2012":{"tfr":1.8,"birth_rate":11,"age_65_share":18.8,"demo_dependency":53.6,"family_with_child_pct":39.5,"single_household_pct":42.2,"gini_disposable":26.9,"gini_market_income":49.7,"income_median":29501,"unemployment_rate":10.8,"empl_rate_25_34":75.2,"neet":11.8,"sijoitettu_0_17_pct":7.8,"sijoitettu_13_17_pct":2.5,"sijoitettu_0_6_pct":0.8,"huostassa_13_17_pct":1.7,"huostassa_7_12_pct":0.8,"ls_ilmoitus_pct":5.8,"erityistuki_yht_pct":7.6,"tehostettutuki_pct":5.1,"pisa_math":519,"pisa_reading":524,"suicides_per100k":14.1,"psych_rehab":7.9,"gdp_meur":200378,"bkt_muutos":-1.5,"edp_debt_gdp":57.9,"expenditure_gdp":69.9,"revenue_gdp":67.7,"percap_paivahoito":6830.7,"percap_perusopetus":9631.8,"percap_lastensuojelu":1097.4,"percap_nuoriso":176.8,"percap_kirjasto":64.9,"percap_liikunta":105.0,"percap_erikoissairaanhoito":1182.9,"percap_perusterveydenhuolto":735.9,"percap_iakkaat":4236.6,"percap_mielenterveys":36.9},"2013":{"tfr":1.75,"birth_rate":10.7,"age_65_share":19.4,"demo_dependency":55,"family_with_child_pct":39.1,"single_household_pct":42.4,"gini_disposable":27.2,"gini_market_income":50.8,"income_median":29302,"unemployment_rate":12.6,"empl_rate_25_34":73.4,"neet":12.6,"sijoitettu_0_17_pct":7.6,"sijoitettu_13_17_pct":2.5,"sijoitettu_0_6_pct":0.8,"huostassa_13_17_pct":1.7,"huostassa_7_12_pct":0.9,"ls_ilmoitus_pct":5.8,"erityistuki_yht_pct":7.3,"tehostettutuki_pct":6.5,"suicides_per100k":14.3,"psych_rehab":8.6,"gdp_meur":203497,"bkt_muutos":-1,"edp_debt_gdp":60.8,"expenditure_gdp":71.7,"revenue_gdp":69.1,"percap_paivahoito":6847.6,"percap_perusopetus":9609.0,"percap_lastensuojelu":1136.8,"percap_nuoriso":176.3,"percap_kirjasto":63.4,"percap_liikunta":104.7,"percap_erikoissairaanhoito":1241.9,"percap_perusterveydenhuolto":737.3,"percap_iakkaat":4252.2,"percap_mielenterveys":38.2},"2014":{"tfr":1.71,"birth_rate":10.5,"age_65_share":19.9,"demo_dependency":56.4,"family_with_child_pct":38.9,"single_household_pct":42.7,"gini_disposable":27,"gini_market_income":51.1,"income_median":29219,"unemployment_rate":13.9,"empl_rate_25_34":72,"neet":13.8,"sijoitettu_0_17_pct":7.3,"sijoitettu_13_17_pct":2.5,"sijoitettu_0_6_pct":0.8,"huostassa_13_17_pct":1.7,"huostassa_7_12_pct":0.9,"ls_ilmoitus_pct":5.8,"erityistuki_yht_pct":7.3,"tehostettutuki_pct":7.5,"suicides_per100k":12.7,"psych_rehab":9.5,"gdp_meur":205855,"bkt_muutos":-0.5,"edp_debt_gdp":64.8,"expenditure_gdp":72.4,"revenue_gdp":69.4,"percap_paivahoito":6733.9,"percap_perusopetus":9541.6,"percap_lastensuojelu":1122.3,"percap_nuoriso":175.9,"percap_kirjasto":61.7,"percap_liikunta":105.0,"percap_erikoissairaanhoito":1256.5,"percap_perusterveydenhuolto":711.2,"percap_iakkaat":4209.9,"percap_mielenterveys":38.0},"2015":{"tfr":1.65,"birth_rate":10.1,"age_65_share":20.5,"demo_dependency":57.6,"family_with_child_pct":38.7,"single_household_pct":43,"gini_disposable":27.3,"gini_market_income":51.9,"income_median":29445,"unemployment_rate":14.4,"empl_rate_25_34":71.3,"neet":14.6,"sijoitettu_0_17_pct":7.3,"sijoitettu_13_17_pct":2.5,"sijoitettu_0_6_pct":0.7,"huostassa_13_17_pct":1.7,"huostassa_7_12_pct":0.8,"ls_ilmoitus_pct":6,"erityistuki_yht_pct":7.3,"tehostettutuki_pct":8.4,"pisa_math":511,"pisa_reading":526,"psych_rehab":10.5,"gdp_meur":210192,"bkt_muutos":0.5,"edp_debt_gdp":68.8,"expenditure_gdp":70.5,"revenue_gdp":68.1,"percap_paivahoito":6839.7,"percap_perusopetus":9415.5,"percap_lastensuojelu":1143.1,"percap_nuoriso":171.6,"percap_kirjasto":61.3,"percap_liikunta":107.0,"percap_erikoissairaanhoito":1283.1,"percap_perusterveydenhuolto":655.9,"percap_iakkaat":3141.8,"percap_mielenterveys":38.2},"2016":{"tfr":1.57,"birth_rate":9.6,"age_65_share":20.9,"demo_dependency":58.7,"family_with_child_pct":38.6,"single_household_pct":43.4,"gini_disposable":27.2,"gini_market_income":52,"income_median":29732,"unemployment_rate":13.6,"empl_rate_25_34":71.8,"neet":13.7,"sijoitettu_0_17_pct":7.4,"sijoitettu_13_17_pct":2.5,"sijoitettu_0_6_pct":0.7,"huostassa_13_17_pct":1.7,"huostassa_7_12_pct":0.8,"ls_ilmoitus_pct":6.3,"erityistuki_yht_pct":7.5,"tehostettutuki_pct":9,"psych_rehab":11.6,"gdp_meur":215717,"bkt_muutos":2.6,"edp_debt_gdp":68.6,"expenditure_gdp":69.6,"revenue_gdp":67.9,"percap_paivahoito":7041.5,"percap_perusopetus":9487.9,"percap_lastensuojelu":1177.7,"percap_nuoriso":172.7,"percap_kirjasto":61.5,"percap_liikunta":109.9,"percap_erikoissairaanhoito":1271.5,"percap_perusterveydenhuolto":640.7,"percap_iakkaat":3106.9,"percap_mielenterveys":37.3},"2017":{"tfr":1.49,"birth_rate":9.1,"age_65_share":21.4,"demo_dependency":59.6,"family_with_child_pct":38.5,"single_household_pct":44.1,"gini_disposable":27.7,"gini_market_income":52.3,"income_median":30079,"unemployment_rate":11.4,"empl_rate_25_34":73.6,"neet":12.9,"sijoitettu_0_17_pct":6.3,"sijoitettu_13_17_pct":2.6,"sijoitettu_0_6_pct":0.8,"huostassa_13_17_pct":1.7,"huostassa_7_12_pct":0.8,"ls_ilmoitus_pct":7,"erityistuki_yht_pct":7.7,"tehostettutuki_pct":9.7,"psych_rehab":12.6,"gdp_meur":224706,"bkt_muutos":3.3,"edp_debt_gdp":66.6,"expenditure_gdp":67.2,"revenue_gdp":66.6,"percap_paivahoito":7127.7,"percap_perusopetus":9339.5,"percap_lastensuojelu":1224.2,"percap_nuoriso":177.7,"percap_kirjasto":60.4,"percap_liikunta":110.1,"percap_erikoissairaanhoito":1285.3,"percap_perusterveydenhuolto":621.2,"percap_iakkaat":3052.6,"percap_mielenterveys":37.4},"2018":{"tfr":1.41,"birth_rate":8.6,"age_65_share":21.8,"demo_dependency":60.5,"family_with_child_pct":38.3,"single_household_pct":44.8,"gini_disposable":28.1,"gini_market_income":52.2,"income_median":30475,"unemployment_rate":9.8,"empl_rate_25_34":75.1,"neet":11.6,"sijoitettu_0_17_pct":6.7,"sijoitettu_13_17_pct":2.7,"sijoitettu_0_6_pct":0.8,"huostassa_13_17_pct":1.8,"huostassa_7_12_pct":0.8,"ls_ilmoitus_pct":7.3,"erityistuki_yht_pct":8.1,"tehostettutuki_pct":10.6,"pisa_math":507,"pisa_reading":520,"psych_rehab":14.6,"gdp_meur":231905,"bkt_muutos":1.2,"edp_debt_gdp":65.4,"expenditure_gdp":66.6,"revenue_gdp":65.7,"percap_paivahoito":7603.6,"percap_perusopetus":9410.3,"percap_lastensuojelu":1317.2,"percap_nuoriso":179.2,"percap_kirjasto":60.3,"percap_liikunta":112.6,"percap_erikoissairaanhoito":1288.4,"percap_perusterveydenhuolto":622.5,"percap_iakkaat":3040.4,"percap_mielenterveys":36.7},"2019":{"tfr":1.35,"birth_rate":8.3,"age_65_share":22.3,"demo_dependency":61.1,"family_with_child_pct":38,"single_household_pct":45.4,"gini_disposable":27.9,"gini_market_income":51.6,"income_median":30929,"unemployment_rate":9.9,"empl_rate_25_34":74.5,"neet":11.3,"sijoitettu_0_17_pct":6,"sijoitettu_13_17_pct":2.8,"sijoitettu_0_6_pct":0.9,"huostassa_13_17_pct":1.9,"huostassa_7_12_pct":0.9,"ls_ilmoitus_pct":7.7,"erityistuki_yht_pct":8.5,"tehostettutuki_pct":11.6,"psych_rehab":16.1,"gdp_meur":238518,"bkt_muutos":1.3,"edp_debt_gdp":65.3,"expenditure_gdp":66.3,"revenue_gdp":65.3,"percap_paivahoito":8100.8,"percap_perusopetus":9621.3,"percap_lastensuojelu":1426.8,"percap_nuoriso":183.9,"percap_kirjasto":61.1,"percap_liikunta":115.0,"percap_erikoissairaanhoito":1330.2,"percap_perusterveydenhuolto":634.2,"percap_iakkaat":3074.2,"percap_mielenterveys":41.9},"2020":{"tfr":1.37,"birth_rate":8.4,"age_65_share":22.7,"demo_dependency":61.7,"family_with_child_pct":37.9,"single_household_pct":46.1,"gini_disposable":27.7,"gini_market_income":52.7,"income_median":30984,"unemployment_rate":13.5,"empl_rate_25_34":71.2,"neet":13.1,"sijoitettu_0_17_pct":5.3,"sijoitettu_13_17_pct":2.8,"sijoitettu_0_6_pct":0.9,"huostassa_13_17_pct":1.9,"huostassa_7_12_pct":0.9,"ls_ilmoitus_pct":7.9,"erityistuki_yht_pct":9,"tehostettutuki_pct":12.2,"psych_rehab":18.4,"gdp_meur":236387,"bkt_muutos":-2.5,"edp_debt_gdp":75.3,"expenditure_gdp":72.4,"revenue_gdp":66.9,"percap_paivahoito":8197.2,"percap_perusopetus":9509.7,"percap_lastensuojelu":1507.7,"percap_nuoriso":178.1,"percap_kirjasto":58.9,"percap_liikunta":119.2,"percap_erikoissairaanhoito":1326.8,"percap_perusterveydenhuolto":668.0,"percap_iakkaat":3091.1,"percap_mielenterveys":39.7},"2021":{"tfr":1.46,"birth_rate":9,"age_65_share":23.1,"demo_dependency":62.2,"family_with_child_pct":37.8,"single_household_pct":46.7,"gini_disposable":29.1,"gini_market_income":53.3,"income_median":31320,"unemployment_rate":10.4,"empl_rate_25_34":73.9,"neet":10.6,"sijoitettu_0_17_pct":5,"sijoitettu_13_17_pct":2.7,"sijoitettu_0_6_pct":0.9,"huostassa_13_17_pct":1.8,"huostassa_7_12_pct":0.9,"ls_ilmoitus_pct":8.6,"erityistuki_yht_pct":9.4,"tehostettutuki_pct":13.5,"psych_rehab":20.1,"gdp_meur":248764,"bkt_muutos":2.7,"edp_debt_gdp":73.1,"expenditure_gdp":70,"revenue_gdp":67.4,"percap_paivahoito":8575.0,"percap_perusopetus":9671.4,"percap_lastensuojelu":1506.1,"percap_nuoriso":180.5,"percap_kirjasto":58.5,"percap_liikunta":126.4,"percap_erikoissairaanhoito":1354.8,"percap_perusterveydenhuolto":614.4,"percap_iakkaat":3027.7,"percap_mielenterveys":119.9},"2022":{"tfr":1.32,"birth_rate":8.1,"age_65_share":23.3,"demo_dependency":62.5,"family_with_child_pct":37.7,"single_household_pct":47.1,"gini_disposable":28.6,"gini_market_income":52.3,"income_median":30412,"unemployment_rate":9.8,"empl_rate_25_34":74.7,"neet":10.5,"sijoitettu_0_17_pct":4.5,"sijoitettu_13_17_pct":2.6,"sijoitettu_0_6_pct":0.9,"huostassa_13_17_pct":1.8,"huostassa_7_12_pct":0.9,"ls_ilmoitus_pct":9.1,"erityistuki_yht_pct":9.9,"tehostettutuki_pct":14,"pisa_math":484,"pisa_reading":490,"psych_rehab":21.6,"gdp_meur":266135,"bkt_muutos":0.8,"edp_debt_gdp":74,"expenditure_gdp":66.7,"revenue_gdp":66.5,"percap_paivahoito":8824.1,"percap_perusopetus":9603.0,"percap_lastensuojelu":1522.6,"percap_nuoriso":182.6,"percap_kirjasto":57.6,"percap_liikunta":121.5,"percap_erikoissairaanhoito":1331.0,"percap_perusterveydenhuolto":595.6,"percap_iakkaat":3021.4,"percap_mielenterveys":111.4},"2023":{"tfr":1.26,"birth_rate":7.8,"age_65_share":23.4,"demo_dependency":62.6,"family_with_child_pct":37.5,"single_household_pct":47.5,"gini_disposable":27.9,"gini_market_income":51.8,"income_median":29888,"unemployment_rate":11,"empl_rate_25_34":73.2,"neet":10.7,"sijoitettu_0_17_pct":4,"sijoitettu_13_17_pct":2.6,"sijoitettu_0_6_pct":0.8,"huostassa_13_17_pct":1.8,"huostassa_7_12_pct":0.9,"ls_ilmoitus_pct":10.2,"erityistuki_yht_pct":10.5,"tehostettutuki_pct":15,"psych_rehab":22.8,"gdp_meur":272848,"bkt_muutos":-1.3,"edp_debt_gdp":77.1,"expenditure_gdp":75.7,"revenue_gdp":72.8,"percap_paivahoito":9814.1,"percap_perusopetus":10008.6,"percap_lastensuojelu":1776.8,"percap_nuoriso":199.0,"percap_kirjasto":58.0,"percap_liikunta":128.9,"percap_erikoissairaanhoito":1353.5,"percap_perusterveydenhuolto":436.1,"percap_iakkaat":3427.9,"percap_mielenterveys":124.3},"2024":{"tfr":1.25,"birth_rate":7.8,"age_65_share":23.6,"demo_dependency":62.7,"family_with_child_pct":37.2,"single_household_pct":47.6,"gini_disposable":28.4,"gini_market_income":52.3,"income_median":30523,"neet":11.4,"sijoitettu_0_17_pct":4.2,"sijoitettu_13_17_pct":2.6,"sijoitettu_0_6_pct":0.8,"huostassa_13_17_pct":1.8,"huostassa_7_12_pct":0.9,"ls_ilmoitus_pct":10.7,"erityistuki_yht_pct":10.3,"tehostettutuki_pct":16.1,"psych_rehab":23.3,"gdp_meur":275963,"bkt_muutos":0.4,"edp_debt_gdp":82.5,"expenditure_gdp":77.7,"revenue_gdp":73.4,"percap_paivahoito":10144.2,"percap_perusopetus":10364.4,"percap_lastensuojelu":1886.1,"percap_nuoriso":209.2,"percap_kirjasto":58.3,"percap_liikunta":130.0,"percap_erikoissairaanhoito":1354.5,"percap_perusterveydenhuolto":441.3,"percap_iakkaat":3436.5,"percap_mielenterveys":135.9}};

// state.master-rakenne simuloidaan embedded-datasta
state.master = { _embedded: true, years: Object.keys(EMBEDDED).map(Number).sort((a,b)=>a-b) };
state.ttt = { _embedded: true };

// Käynnistä automaattisesti
// boot handled by mount()

// ═══════════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════════
function initApp() {
  // data embedded, no deflator needed
  computeAll();
  buildNetwork();
  renderAll();
  bindControls();
  if (state.showFlow) startFlow();
}

function renderAll() {
  renderPhenomenaPanel();
  renderDrivers(state.activePhenom);
  renderScenarios();
  updateSystemPressure();
  updateDeltaOverlay();
}

function bindControls() {
  $id('reset-btn').addEventListener('click',()=>{
    for(const[k,d]of Object.entries(DRIVERS))state.vars[k]=d.base;
    computeAll();renderAll();updateNetworkVisuals();
    $id('scenario-status').textContent='';
  });
  $id('warning-btn').addEventListener('click',()=>$id('warning-modal').classList.add('show'));
  $id('close-warning').addEventListener('click',()=>$id('warning-modal').classList.remove('show'));
  $id('btn-flow').addEventListener('click',function(){
    state.showFlow=!state.showFlow;this.classList.toggle('on',state.showFlow);
    if(!state.showFlow&&state.flowTimer){clearInterval(state.flowTimer);state.flowTimer=null;}
    else if(state.showFlow)startFlow();
  });
  $id('btn-chains').addEventListener('click',function(){
    state.showChains=!state.showChains;this.classList.toggle('on',state.showChains);
    updateNetworkVisuals();
    $id('chain-indicator').style.display=state.showChains?'block':'none';
    if(state.showChains)updateChainIndicator();
  });
  $id('btn-active-only').addEventListener('click',function(){
    state.activeOnly=!state.activeOnly;this.classList.toggle('on',state.activeOnly);
    updateNetworkVisuals();
  });
  root.addEventListener('change',e=>{
    if(['corr-method','corr-year-min','corr-year-max'].includes(e.target?.id)) return;
  });
}

// ═══════════════════════════════════════════════════════════════════
// NETWORK
// ═══════════════════════════════════════════════════════════════════
function buildNetwork() {
  const svg=d3.select($id('network-svg'));
  svg.selectAll('*').remove();
  const W=svg.node().clientWidth, H=svg.node().clientHeight;
  const cx=W/2, cy=H/2;
  const Rp=Math.min(W,H)*.33, Rd=Math.min(W,H)*.15;

  // Defs
  const defs=svg.append('defs');
  ['data','lit','spec','chain'].forEach(t=>{
    const col=t==='data'?'var(--data-color)':t==='lit'?'var(--lit-color)':t==='spec'?'var(--spec-color)':'var(--chain-color)';
    defs.append('marker').attr('id',`arrow-${t}`)
      .attr('viewBox','0 -4 8 8').attr('refX',24).attr('refY',0)
      .attr('markerWidth',5).attr('markerHeight',5).attr('orient','auto')
      .append('path').attr('d','M0,-4L8,0L0,4').attr('fill',col);
  });

  const g=svg.append('g').attr('class','g-net');
  svg.call(d3.zoom().scaleExtent([.3,2]).on('zoom',e=>g.attr('transform',e.transform)));

  // Background rings
  g.append('g').selectAll('circle').data([Rd*.6,Rd,Rp*.6,Rp]).enter()
    .append('circle').attr('cx',cx).attr('cy',cy).attr('r',d=>d)
    .attr('fill','none').attr('stroke','rgba(255,255,255,.025)').attr('stroke-width',.5);

  // Nodes
  const phenomKeys=Object.keys(PHENOMENA);
  const driverKeys=Object.keys(DRIVERS);
  const nodes=[];

  phenomKeys.forEach((k,i)=>{
    const a=(i/phenomKeys.length)*2*Math.PI-Math.PI/2;
    nodes.push({id:k,type:'phenom',x:cx+Math.cos(a)*Rp,y:cy+Math.sin(a)*Rp,def:PHENOMENA[k]});
  });
  driverKeys.forEach((k,i)=>{
    const a=(i/driverKeys.length)*2*Math.PI-Math.PI/2;
    nodes.push({id:k,type:'driver',x:cx+Math.cos(a)*Rd,y:cy+Math.sin(a)*Rd,def:DRIVERS[k]});
  });

  state.networkNodes=nodes;
  state.nodeById=Object.fromEntries(nodes.map(n=>[n.id,n]));

  // Draw edges (driver→phenom)
  const edgeG=g.append('g').attr('class','edges-driver');
  LINKS.forEach((lnk,i)=>{
    const src=state.nodeById[lnk.from],tgt=state.nodeById[lnk.to];
    if(!src||!tgt)return;
    const col=lnk.conf==='data'?'var(--data-color)':lnk.conf==='lit'?'var(--lit-color)':'var(--spec-color)';
    const sw=Math.max(.8,Math.abs(lnk.weight)*4);
    const dash=lnk.conf==='data'?'none':lnk.conf==='lit'?'6 3':'3 6';

    edgeG.append('path').attr('class','glow-edge').attr('id',`glow-${i}`)
      .attr('d',bezier(src,tgt)).attr('fill','none')
      .attr('stroke',lnk.weight>0?'var(--green)':'var(--red)')
      .attr('stroke-width',sw+8).attr('opacity',0).attr('pointer-events','none');

    edgeG.append('path').attr('class','driver-edge').attr('id',`edge-${i}`)
      .attr('d',bezier(src,tgt)).attr('fill','none')
      .attr('stroke',col).attr('stroke-width',sw).attr('stroke-dasharray',dash)
      .attr('marker-end',`url(#arrow-${lnk.conf})`).attr('opacity',.65)
      .style('cursor','pointer')
      .on('click',()=>selectLink(lnk,false))
      .on('mouseenter',function(){d3.select(this).attr('opacity',1)})
      .on('mouseleave',function(){d3.select(this).attr('opacity',.65)});
  });

  // Ilmiö→ilmiö-ketjulinkit
  const chainG=g.append('g').attr('class','edges-chain').attr('opacity',0);
  PHENOMENA_LINKS.forEach((lnk,i)=>{
    const src=state.nodeById[lnk.from],tgt=state.nodeById[lnk.to];
    if(!src||!tgt)return;
    const sw=Math.max(.8,Math.abs(lnk.weight)*3);
    chainG.append('path').attr('class','chain-edge').attr('id',`chain-${i}`)
      .attr('d',bezierCurved(src,tgt,.7))
      .attr('fill','none').attr('stroke','var(--chain-color)')
      .attr('stroke-width',sw).attr('stroke-dasharray','8 4')
      .attr('marker-end','url(#arrow-chain)').attr('opacity',.7)
      .style('cursor','pointer')
      .on('click',()=>selectLink(lnk,true));
  });
  state.chainGroup=chainG;

  // Draw nodes
  const nodeG=g.append('g').attr('class','nodes');
  nodes.forEach(n=>{
    const ng=nodeG.append('g').attr('id',`node-${n.id}`)
      .attr('transform',`translate(${n.x},${n.y})`)
      .style('cursor','pointer')
      .on('click',()=>{
        state.activePhenom=n.id;
        renderPhenomenaPanel();renderDrivers(n.id);selectNode(n);
      });
    const r=n.type==='phenom'?30:16;
    const col=n.type==='phenom'?n.def.color:'rgba(200,200,200,.35)';

    ng.append('circle').attr('class','node-bg').attr('r',r+9)
      .attr('fill','none').attr('stroke',col).attr('stroke-width',.4).attr('opacity',.25);
    ng.append('circle').attr('class','node-main').attr('r',r)
      .attr('fill','var(--surface2)').attr('stroke',col).attr('stroke-width',n.type==='phenom'?1.5:.8);

    if(n.type==='phenom'){
      ng.append('text').attr('y',-14).attr('text-anchor','middle')
        .attr('fill',col).attr('font-family','var(--mono)').attr('font-size',8)
        .attr('text-transform','uppercase').text(n.def.short);
      ng.append('text').attr('class','nv').attr('id',`nv-${n.id}`)
        .attr('y',5).attr('text-anchor','middle')
        .attr('fill',col).attr('font-family','var(--mono)').attr('font-size',12).attr('font-weight',500)
        .text(fmtPhenom(n.id,n.def.base));
    } else {
      const shortLabel=(n.def.label||n.id).slice(0,8);
      ng.append('text').attr('y',4).attr('text-anchor','middle')
        .attr('fill','var(--muted)').attr('font-family','var(--mono)').attr('font-size',7)
        .text(shortLabel);
      if(n.def.isNew){
        ng.append('text').attr('y',14).attr('text-anchor','middle')
          .attr('fill','var(--chain-color)').attr('font-family','var(--mono)').attr('font-size',7)
          .text('NEW');
      }
    }
  });
}

function bezier(src,tgt){
  const dx=tgt.x-src.x,dy=tgt.y-src.y;
  const cx1=src.x+dx*.4+dy*.12,cy1=src.y+dy*.4-dx*.12;
  const cx2=src.x+dx*.6+dy*.12,cy2=src.y+dy*.6-dx*.12;
  return `M${src.x},${src.y}C${cx1},${cy1},${cx2},${cy2},${tgt.x},${tgt.y}`;
}
function bezierCurved(src,tgt,curve=.5){
  // Curved anders um to distinguish from driver edges
  const mx=(src.x+tgt.x)/2,my=(src.y+tgt.y)/2;
  const dx=tgt.x-src.x,dy=tgt.y-src.y;
  const ox=-dy*curve,oy=dx*curve;
  return `M${src.x},${src.y}Q${mx+ox},${my+oy},${tgt.x},${tgt.y}`;
}

function updateNetworkVisuals(){
  // Edges
  LINKS.forEach((lnk,i)=>{
    const dv=state.vars[lnk.from],base=DRIVERS[lnk.from]?.base||0;
    const active=Math.abs(dv-base)>0.001;
    const el=$id(`edge-${i}`);
    if(!el)return;
    if(state.activeOnly){el.style.display=active?'':'none';}
    else{el.style.display='';}
    el.style.opacity=active?'1':'.45';
  });
  // Chain visibility
  if(state.chainGroup) state.chainGroup.attr('opacity',state.showChains?1:0);
  // Node colors
  updateNodeColors();
}

function updateNodeColors(){
  for(const[k,ph]of Object.entries(PHENOMENA)){
    const val=state.phenom[k],delta=val-ph.base;
    const col=(ph.good*delta>=0)?'var(--green)':'var(--red)';
    const nv=$id(`nv-${k}`);
    if(nv){nv.style.fill=col;nv.textContent=fmtPhenom(k,val);}
    const nm=$qs(`#node-${k} .node-main`);
    if(nm)nm.style.strokeWidth=isCritical(k)?'2.5':'1.5';
    const nr=$qs(`#node-${k} .node-bg`);
    if(nr)nr.style.opacity=isCritical(k)?'.5':'.25';
  }
}

function pulseLink(i){
  const g=$id(`glow-${i}`);
  if(!g)return;
  g.style.opacity='.5';
  setTimeout(()=>{if(g)g.style.opacity='0';},700);
}

// ═══════════════════════════════════════════════════════════════════
// RENDER UI
// ═══════════════════════════════════════════════════════════════════
function fmtPhenom(k,v){
  if(k==='syntyvyys')return v.toFixed(2);
  if(k==='julktalous')return v.toFixed(1);
  if(k==='eriarvois')return v.toFixed(1);
  return v.toFixed(1);
}

function renderPhenomenaPanel(){
  const grid=$id('phenom-grid');
  grid.innerHTML='';
  for(const[k,ph]of Object.entries(PHENOMENA)){
    const val=state.phenom[k],delta=val-ph.base;
    const pct=delta/ph.base;
    const isGood=ph.good*delta>=0;
    const col=isGood?'var(--green)':'var(--red)';
    const crit=isCritical(k);
    const arrows=Math.min(3,Math.round(Math.abs(pct)*15));
    const arrowStr=arrows===0?'—':(delta*ph.good>0?'↑':'↓').repeat(arrows);
    const barW=Math.min(100,Math.abs(pct)*200);
    const active=k===state.activePhenom;

    const card=document.createElement('div');
    card.className=`phenom-card${active?' active':''}${crit?' critical-state':''}`;
    card.style.color=col;
    card.innerHTML=`
      <div class="phenom-name">${ph.short}</div>
      <div class="phenom-value" style="color:${col}">${fmtPhenom(k,val)}</div>
      <div class="phenom-delta" style="color:${col}"><span>${arrowStr}</span><span>${delta>0?'+':''}${(pct*100).toFixed(1)}%</span></div>
      <div class="phenom-bar"><div class="phenom-bar-fill" style="width:${barW}%;background:${col}"></div></div>
      ${crit?`<div class="crit-badge">⚠</div>`:''}
    `;
    card.addEventListener('click',()=>{state.activePhenom=k;renderPhenomenaPanel();renderDrivers(k);selectNode({id:k,type:'phenom',def:ph});});
    grid.appendChild(card);
  }
  updateNodeColors();
  updateSystemPressure();
}

function renderDrivers(phenomKey){
  const container=$id('drivers-section');
  const relevantLinks=LINKS.filter(l=>l.to===phenomKey);
  const relevantSet=new Set(relevantLinks.map(l=>l.from));
  const chainLinksIn=PHENOMENA_LINKS.filter(l=>l.to===phenomKey);

  let html='';

  // Tämän ilmiön suorat driverit
  html+=`<div class="driver-group"><div class="driver-group-label">${PHENOMENA[phenomKey]?.label||phenomKey} — suorat tekijät</div>`;
  for(const lnk of relevantLinks){
    const dk=lnk.from,d=DRIVERS[dk];
    if(!d)continue;
    html+=driverSliderHTML(dk,d,lnk);
  }
  html+='</div>';

  // Ilmiöketjuvaikutukset
  if(chainLinksIn.length>0){
    html+=`<div class="driver-group"><div class="driver-group-label" style="color:var(--chain-color)">↳ Ketjuvaikutukset → ${PHENOMENA[phenomKey]?.short}</div>`;
    for(const cl of chainLinksIn){
      const srcPh=PHENOMENA[cl.from];
      const curDelta=(state.phenom[cl.from]-PHENOMENA[cl.from].base);
      const chainImpact=(curDelta*cl.weight*DAMPING).toFixed(3);
      html+=`<div class="driver-row" style="opacity:.85">
        <div class="driver-header">
          <span class="driver-label" style="color:var(--chain-color)">${srcPh?.label||cl.from} <span class="conf-badge conf-${cl.conf}">${cl.conf}</span></span>
          <span style="font-family:var(--mono);font-size:10px;color:var(--chain-color)">${Number(chainImpact)>0?'+':''}${chainImpact}</span>
        </div>
        <div class="chain-note">${cl.note}</div>
      </div>`;
    }
    html+='</div>';
  }

  // Muut driverit
  const otherDrivers=Object.keys(DRIVERS).filter(k=>!relevantSet.has(k));
  if(otherDrivers.length>0){
    html+=`<div class="driver-group"><div class="driver-group-label">Muut tekijät</div>`;
    for(const dk of otherDrivers){
      html+=driverSliderHTML(dk,DRIVERS[dk],null);
    }
    html+='</div>';
  }

  container.innerHTML=html;
  container.querySelectorAll('input[type=range]').forEach(inp=>{
    inp.addEventListener('input',e=>{
      const k=e.target.dataset.key;
      state.vars[k]=parseFloat(e.target.value);
      $id(`dval-${k}`).textContent=DRIVERS[k].fmt(state.vars[k]);
      computeAll();
      renderPhenomenaPanel();
      updateNetworkVisuals();
      updateDeltaOverlay();
      if(state.showChains)updateChainIndicator();
      // Pulse active links
      LINKS.forEach((lnk,i)=>{if(lnk.from===k)pulseLink(i);});
    });
  });
}

function driverSliderHTML(dk,d,lnk){
  const val=state.vars[dk];
  const pct=(val-d.min)/(d.max-d.min)*100;
  const changed=Math.abs(val-d.base)>0.001;
  const confBadge=lnk?`<span class="conf-badge conf-${lnk.conf}">${lnk.conf}</span>`:'';
  const newBadge=d.isNew?`<span class="conf-badge conf-new">NEW</span>`:'';
  const note=lnk?`<div class="driver-note" title="${lnk.note||''}">${lnk.weight>0?'+':''}${lnk.weight.toFixed(2)} · viive ${lnk.lag}v ${lnk.note?'ⓘ':''}</div>`:'';
  return `
    <div class="driver-row">
      <div class="driver-header">
        <span class="driver-label">${d.label} ${confBadge}${newBadge}</span>
        <span class="driver-value" id="dval-${dk}" style="color:${changed?'var(--text)':'var(--muted)'}">${d.fmt(val)}</span>
      </div>
      <div class="slider-wrap">
        <input type="range" min="${d.min}" max="${d.max}" step="${d.step}" value="${val}" data-key="${dk}" style="accent-color:${lnk?(lnk.conf==='data'?'var(--data-color)':lnk.conf==='lit'?'var(--lit-color)':'var(--spec-color)'):'var(--border2)'}">
      </div>
      ${note}
    </div>`;
}

function renderScenarios(){
  const el=$id('scenario-list');
  el.innerHTML=SCENARIOS.map((s,i)=>`
    <button class="scenario-btn" data-i="${i}">
      <span class="sc-name">${s.name}</span>
      <span class="sc-desc">${s.desc}</span>
    </button>`).join('');
  el.querySelectorAll('.scenario-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const s=SCENARIOS[+btn.dataset.i];
      for(const[k,d]of Object.entries(DRIVERS))state.vars[k]=d.base;
      for(const[k,delta]of Object.entries(s.changes))if(state.vars[k]!==undefined)state.vars[k]=DRIVERS[k].base+delta;
      computeAll();renderAll();updateNetworkVisuals();
      $id('scenario-status').textContent=s.name;
    });
  });
}

function updateSystemPressure(){
  const p=systemPressure();
  const el=$id('sys-pressure');
  el.textContent=`Järjestelmäpaine: ${p.toFixed(2)}`;
  el.className='system-pressure '+(p>0.15?'critical':p>0.06?'moderate':'calm');
}

function updateDeltaOverlay(){
  const changed=Object.entries(DRIVERS).some(([k,d])=>Math.abs(state.vars[k]-d.base)>0.001);
  const ov=$id('delta-overlay');
  if(!changed){ov.style.display='none';return;}
  ov.style.display='block';
  let html=`<div style="font-family:var(--mono);font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;margin-bottom:5px">Muutos lähtötilanteesta</div>`;
  for(const[k,ph]of Object.entries(PHENOMENA)){
    const d=state.phenom[k]-ph.base;
    if(Math.abs(d)<0.001)continue;
    const pct=d/ph.base*100;
    const isGood=ph.good*d>=0;
    const col=isGood?'var(--green)':'var(--red)';
    const crit=isCritical(k)?` <span style="color:var(--crit-color)">⚠</span>`:'';
    html+=`<div class="delta-row">
      <span style="color:var(--ink);font-family:var(--mono);font-size:10px">${ph.short}${crit}</span>
      <span style="font-family:var(--mono);font-size:10px">
        <span style="color:var(--muted)">${fmtPhenom(k,ph.base)}</span>
        <span style="color:var(--muted);margin:0 6px">→</span>
        <span style="color:${col};font-weight:500">${fmtPhenom(k,state.phenom[k])}</span>
        <span style="color:${col};margin-left:6px">${d>0?'+':''}${pct.toFixed(1)}%</span>
      </span>
    </div>`;
  }
  ov.innerHTML=html;
}

function updateChainIndicator(){
  const el=$id('chain-indicator');
  const activeChains=PHENOMENA_LINKS.filter(lnk=>{
    const d=Math.abs(state.phenom[lnk.from]-PHENOMENA[lnk.from].base);
    return d>0.01;
  });
  if(activeChains.length===0){el.innerHTML='Ketjuvaikutuksia ei aktiivisena';return;}
  el.innerHTML='<strong>Aktiiviset ketjut:</strong><br>'+
    activeChains.map(l=>`${PHENOMENA[l.from]?.short||l.from} → ${PHENOMENA[l.to]?.short||l.to}`).join('<br>');
}

// ═══════════════════════════════════════════════════════════════════
// SELECTION
// ═══════════════════════════════════════════════════════════════════
function selectNode(n){
  const el=$id('selected-info');
  const ph=PHENOMENA[n.id],dr=DRIVERS[n.id];
  if(ph){
    const val=state.phenom[n.id],d=val-ph.base;
    const inLinks=LINKS.filter(l=>l.to===n.id);
    const chainIn=PHENOMENA_LINKS.filter(l=>l.to===n.id);
    const chainOut=PHENOMENA_LINKS.filter(l=>l.from===n.id);
    const crit=isCritical(n.id);
    el.innerHTML=`
      <div class="insp-section-label">Ilmiö</div>
      <div class="insp-title" style="color:${ph.color}">${ph.label}</div>
      <div class="insp-sub">${ph.unit}</div>
      <div class="stat"><span class="k">Lähtöarvo</span><span class="v">${fmtPhenom(n.id,ph.base)}</span></div>
      <div class="stat"><span class="k">Nykytila</span><span class="v" style="color:${ph.good*d>=0?'var(--green)':'var(--red)'}">${fmtPhenom(n.id,val)}</span></div>
      <div class="stat"><span class="k">Muutos</span><span class="v" style="color:${ph.good*d>=0?'var(--green)':'var(--red)'}">${d>0?'+':''}${(d/ph.base*100).toFixed(1)}%</span></div>
      <div class="stat"><span class="k">Suorat driverit</span><span class="v">${inLinks.length}</span></div>
      <div class="stat"><span class="k">Ketjuja sisään</span><span class="v" style="color:var(--chain-color)">${chainIn.length}</span></div>
      <div class="stat"><span class="k">Ketjuja ulos</span><span class="v" style="color:var(--chain-color)">${chainOut.length}</span></div>
      ${crit?`<div class="risk-block risk-high" style="margin-top:8px">⚠ Kriittinen muutos (>15%). Epävarmuus kasvaa.</div>`:''}
      ${chainIn.length?`<div class="risk-block risk-chain" style="margin-top:6px">Tähän ilmiöön kohdistuu ${chainIn.length} ketjuvaikutusta. Nämä sisältävät kaksi epävarmuuskerrointa päällekkäin.</div>`:''}
    `;
  }else if(dr){
    const changed=Math.abs(state.vars[n.id]-dr.base)>0.001;
    el.innerHTML=`
      <div class="insp-section-label">Tekijä</div>
      <div class="insp-title">${dr.label}</div>
      <div class="stat"><span class="k">Perusarvo</span><span class="v">${dr.fmt(dr.base)}</span></div>
      <div class="stat"><span class="k">Nykytila</span><span class="v" style="color:${changed?'var(--text)':'var(--muted)'}">${dr.fmt(state.vars[n.id])}</span></div>
      ${dr.isNew?`<div class="risk-block risk-chain" style="margin-top:8px">Uusi muuttuja ttt_v5.3-datasta. Lyhyt aikasarja (n≈20–30).</div>`:''}
    `;
  }
}

function selectLink(lnk,isChain){
  const el=$id('selected-info');
  const srcLabel=isChain?(PHENOMENA[lnk.from]?.label||lnk.from):(DRIVERS[lnk.from]?.label||lnk.from);
  const tgtLabel=PHENOMENA[lnk.to]?.label||lnk.to;
  const confCol=lnk.conf==='data'?'var(--data-color)':lnk.conf==='lit'?'var(--lit-color)':'var(--spec-color)';
  const riskL=lnk.conf==='data'&&lnk.n>=15&&Math.abs(lnk.r||0)>=0.3?'low':lnk.conf==='data'&&lnk.n>=8?'medium':'high';
  el.innerHTML=`
    <div class="insp-section-label">${isChain?'Ilmiöketjulinkki':'Driverlinkki'}</div>
    <div class="insp-title">${srcLabel} → ${tgtLabel}</div>
    <div class="insp-sub" style="color:${confCol}">${lnk.conf.toUpperCase()}</div>
    <div class="stat"><span class="k">Paino</span><span class="v">${lnk.weight>0?'+':''}${lnk.weight.toFixed(2)}</span></div>
    <div class="stat"><span class="k">Viive</span><span class="v">${lnk.lag||0} vuotta</span></div>
    ${lnk.r!=null?`<div class="stat"><span class="k">Datasta r</span><span class="v">${lnk.r.toFixed(2)} (n=${lnk.n})</span></div>`:''}
    ${lnk.lit_src?`<div class="stat"><span class="k">Kirjallisuus</span><span class="v" style="font-size:9px;color:var(--muted)">${lnk.lit_src}</span></div>`:''}
    <div class="risk-block risk-${riskL}" style="margin-top:8px;font-size:10px">${lnk.note||''}</div>
    ${isChain?`<div class="risk-block risk-chain" style="margin-top:5px;font-size:10px">Ketjulinkki käyttää damping-kerrointa ${DAMPING}. Todellinen vaikutus on todennäköisesti heikompi kuin näytetty.</div>`:''}
    ${riskL==='high'?`<div class="risk-block risk-high" style="margin-top:5px;font-size:10px">⚠ Heikko datapohja. Älä tee johtopäätöksiä tämän linkin perusteella.</div>`:''}
  `;
}

// ═══════════════════════════════════════════════════════════════════
// FLOW PARTICLES
// ═══════════════════════════════════════════════════════════════════
function startFlow(){
  if(state.flowTimer)clearInterval(state.flowTimer);
  state.flowTimer=setInterval(spawnParticle,500);
}

function spawnParticle(){
  const svg=$id('network-svg');
  if(!svg||!state.networkNodes)return;
  const activeLinks=LINKS.filter(lnk=>{
    const dv=state.vars[lnk.from],base=DRIVERS[lnk.from]?.base||dv;
    return Math.abs(dv-base)>0.001;
  });
  if(activeLinks.length===0)return;
  const lnk=activeLinks[Math.floor(Math.random()*activeLinks.length)];
  const src=state.nodeById[lnk.from],tgt=state.nodeById[lnk.to];
  if(!src||!tgt)return;

  const g=$qs('.g-net');
  if(!g)return;
  const col=lnk.weight>0?'var(--green)':'var(--red)';
  const p=document.createElementNS('http://www.w3.org/2000/svg','circle');
  p.setAttribute('r','3');p.setAttribute('fill',col);p.setAttribute('opacity','0.9');
  p.setAttribute('pointer-events','none');
  g.appendChild(p);

  const path=document.createElementNS('http://www.w3.org/2000/svg','path');
  path.setAttribute('d',bezier(src,tgt));
  const len=path.getTotalLength();

  let t=0;const dur=1400;const step=16;
  const tim=setInterval(()=>{
    t+=step/dur;
    if(t>=1){p.remove();clearInterval(tim);return;}
    const pt=path.getPointAtLength(t*len);
    p.setAttribute('cx',pt.x);p.setAttribute('cy',pt.y);
    p.setAttribute('opacity',String(1-t*.7));
  },step);
}

window.addEventListener('resize',()=>{if(state.master&&state.ttt){buildNetwork();updateNetworkVisuals();}});

  // ── Standalone-script loppuu ───────────────────────────────

  // Boot
  try {
    initApp();
  } catch (err) {
    console.error("[moduli014] initApp virhe:", err);
    root.innerHTML = '<div style="padding:24px;color:#e05c4a;font-family:monospace">' +
      '<strong>Virhe simulaattorissa:</strong><br>' + (err && err.message ? err.message : err) + '</div>';
    return;
  }

  _instance = {
    host,
    cleanup() {
      try {
        if (state && state.flowTimer) { clearInterval(state.flowTimer); state.flowTimer = null; }
      } catch {}
    },
  };
}

function unmount(host) {
  if (_instance) {
    _instance.cleanup();
    _instance = null;
  }
  if (host) host.innerHTML = "";
  const s = document.getElementById("style-" + ID);
  if (s) s.remove();
}

export default { id: ID, mount, unmount };
