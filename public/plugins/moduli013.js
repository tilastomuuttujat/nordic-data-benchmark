// public/plugins/moduli013.js
// Plugin: Mielenterveyskriisin syvyys
// TTT-analyysi -- Suomen hyvinvointijärjestelmä

const ID = "moduli013";

const CSS = `
.plugin-${ID} {
  font-family: 'Source Serif 4', Georgia, serif;
  background: #12121e;
  color: #e8e0d0;
  padding: 24px;
  border-radius: 8px;
  box-sizing: border-box;
  max-width: 900px;
  margin: 0 auto;
  opacity: 0;
  transition: opacity .4s ease;
}
.plugin-${ID}.is-mounted { opacity: 1; }
.plugin-${ID} .m013-otsikko-paa {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 22px;
  font-weight: 700;
  color: #e8e0d0;
  letter-spacing: 0.03em;
  margin: 0 0 4px;
  border-bottom: 2px solid #8B1A1A;
  padding-bottom: 10px;
}
.plugin-${ID} .m013-alaotsikko {
  font-size: 13px;
  color: #888;
  margin: 0 0 24px;
  font-style: italic;
}
.plugin-${ID} .m013-osio {
  margin-bottom: 36px;
  border-top: 1px solid #2a2a3e;
  padding-top: 20px;
}
.plugin-${ID} .m013-otsikko {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 16px;
  font-weight: 700;
  color: #c8b89a;
  margin: 0 0 4px;
}
.plugin-${ID} .m013-kuvaus {
  font-size: 12px;
  color: #666;
  margin: 0 0 14px;
  font-style: italic;
}
.plugin-${ID} .m013-valitsin-rivi {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}
.plugin-${ID} .m013-btn {
  background: #1e1e30;
  color: #aaa;
  border: 1px solid #333;
  padding: 5px 12px;
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;
  font-family: 'Georgia', serif;
  transition: background 0.15s, color 0.15s;
}
.plugin-${ID} .m013-btn:hover { background: #2a2a40; color: #ddd; }
.plugin-${ID} .m013-btn.aktiivinen {
  background: #8B1A1A;
  color: #fff;
  border-color: #8B1A1A;
}
.plugin-${ID} .m013-kaavio-kotelo {
  width: 100%;
  overflow-x: auto;
}
.plugin-${ID} .m013-legenda {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 8px;
}
.plugin-${ID} .m013-legenda-item {
  font-size: 11px;
  color: #aaa;
  display: flex;
  align-items: center;
  gap: 5px;
}
/* Suppilo */
.plugin-${ID} .m013-suppilo { padding: 8px 0; }
.plugin-${ID} .m013-suppilo-rivi {
  display: grid;
  grid-template-columns: 130px 1fr;
  align-items: center;
  gap: 12px;
  margin-bottom: 2px;
}
.plugin-${ID} .m013-suppilo-etiketti {
  font-size: 12px;
  color: #bbb;
  text-align: right;
  font-style: italic;
}
.plugin-${ID} .m013-suppilo-palkki-kotelo { width: 100%; }
.plugin-${ID} .m013-suppilo-palkki {
  height: 36px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  padding-left: 10px;
  min-width: 60px;
  transition: opacity 0.2s;
}
.plugin-${ID} .m013-suppilo-lkm { font-size: 12px; color: #fff; font-weight: 700; }
.plugin-${ID} .m013-suppilo-pudotus {
  font-size: 11px;
  color: #666;
  text-align: center;
  padding: 3px 0 3px 142px;
  font-style: italic;
}
.plugin-${ID} .m013-suppilo-kuvaukset { margin-top: 14px; }
.plugin-${ID} .m013-suppilo-kuvaus-item {
  font-size: 12px;
  color: #999;
  padding: 3px 0;
  border-bottom: 1px solid #1e1e2e;
  line-height: 1.5;
}
/* Alue */
.plugin-${ID} .m013-alue-taulukko { width: 100%; }
.plugin-${ID} .m013-alue-rivi {
  display: grid;
  grid-template-columns: 180px 1fr 1fr 50px;
  align-items: center;
  gap: 10px;
  padding: 7px 8px;
  border-bottom: 1px solid #1e1e2e;
  transition: background 0.1s;
}
.plugin-${ID} .m013-alue-rivi:hover { background: #1e1e30; }
.plugin-${ID} .m013-alue-otsikko {
  font-size: 11px;
  color: #666;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: default;
}
.plugin-${ID} .m013-alue-solu { font-size: 12px; color: #ccc; }
.plugin-${ID} .m013-alue-nimi { font-weight: 600; color: #ddd; }
.plugin-${ID} .m013-mini-palkki-kotelo {
  background: #1a1a2e;
  border-radius: 2px;
  height: 12px;
  width: 100%;
  margin-bottom: 2px;
}
.plugin-${ID} .m013-mini-palkki { height: 12px; border-radius: 2px; }
.plugin-${ID} .m013-mini-lkm { font-size: 11px; color: #aaa; }
.plugin-${ID} .m013-liikennevalo { text-align: center; font-size: 14px; }
/* Tilastoboxsi */
.plugin-${ID} .m013-tilastoboxsi {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 16px;
}
.plugin-${ID} .m013-tilasto-kortti {
  background: #1a1a2e;
  border: 1px solid #2a2a3e;
  border-radius: 4px;
  padding: 12px 14px;
}
.plugin-${ID} .m013-tilasto-nimi { font-size: 11px; color: #888; margin-bottom: 4px; }
.plugin-${ID} .m013-tilasto-arvo { font-size: 18px; font-weight: 700; color: #e8e0d0; }
.plugin-${ID} .m013-tilasto-muutos { font-size: 11px; color: #8B1A1A; margin-top: 2px; }
/* Vertailu */
.plugin-${ID} .m013-vertailu-palkit { padding: 8px 0; }
.plugin-${ID} .m013-vertailu-rivi {
  display: grid;
  grid-template-columns: 70px 1fr;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  cursor: pointer;
}
.plugin-${ID} .m013-vertailu-label { font-size: 13px; font-weight: 700; color: #ccc; }
.plugin-${ID} .m013-vertailu-bar-kotelo {
  background: #1a1a2e;
  border-radius: 3px;
  height: 32px;
  width: 100%;
}
.plugin-${ID} .m013-vertailu-bar {
  height: 32px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  transition: opacity 0.2s;
}
.plugin-${ID} .m013-vertailu-arvo { font-size: 13px; font-weight: 700; color: #fff; }
.plugin-${ID} .m013-yhteenveto-boxsi {
  background: #1a1a2e;
  padding: 12px 16px;
  border-radius: 4px;
  font-size: 13px;
  color: #aaa;
  line-height: 1.6;
  margin-top: 14px;
}
.plugin-${ID} .m013-yhteenveto-boxsi strong { color: #e8e0d0; }
.plugin-${ID} .loading {
  text-align: center;
  padding: 40px;
  font-size: 11px;
  color: #888;
  font-family: monospace;
}
.plugin-${ID} .spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 1.5px solid #444;
  border-top-color: #8B1A1A;
  border-radius: 50%;
  animation: spin-${ID} 0.8s linear infinite;
  margin-right: 8px;
  vertical-align: middle;
}
@keyframes spin-${ID} {
  to { transform: rotate(360deg); }
}
@media (max-width: 640px) {
  .plugin-${ID} .m013-alue-rivi { grid-template-columns: 120px 1fr 1fr 36px; }
  .plugin-${ID} .m013-suppilo-rivi { grid-template-columns: 90px 1fr; }
  .plugin-${ID} .m013-suppilo-pudotus { padding-left: 102px; }
  .plugin-${ID} .m013-vertailu-rivi { grid-template-columns: 50px 1fr; }
}
`;

function ensureStyles() {
  if (document.getElementById("style-" + ID)) return;
  const s = document.createElement("style");
  s.id = "style-" + ID;
  s.textContent = CSS;
  document.head.appendChild(s);
}

function tooltipKomponentti() {
  const tip = document.createElement("div");
  tip.className = "m013-tooltip";
  tip.style.cssText = "display:none;position:fixed;background:#1a1a2e;color:#e8e0d0;padding:10px 14px;border-radius:4px;font-size:12px;pointer-events:none;z-index:9999;max-width:260px;border:1px solid #444;line-height:1.5;";
  document.body.appendChild(tip);
  return {
    nayta(e, html) {
      tip.innerHTML = html;
      tip.style.display = "block";
      let left = e.clientX + 14;
      let top = e.clientY - 10;
      if (left + 260 > window.innerWidth) left = e.clientX - 270;
      if (top + 120 > window.innerHeight) top = e.clientY - 120;
      tip.style.left = left + "px";
      tip.style.top = top + "px";
    },
    piilota() { tip.style.display = "none"; },
    poista() { tip.remove(); }
  };
}

let chartInstances = [];

function destroyCharts() {
  chartInstances.forEach(ch => { try { ch.destroy(); } catch(e) {} });
  chartInstances = [];
}

async function mount(host, core) {
  console.log("[moduli013] mount kutsuttu");
  ensureStyles();
  destroyCharts();

  host.innerHTML = `
    <div class="plugin-${ID}">
      <div class="m013-otsikko-paa">🧠 Mielenterveyskriisin syvyys</div>
      <p class="m013-alaotsikko">Diagnoositrendit · Palvelupolku · Alueellinen eriarvoisuus · Talousvaikutukset · Kansainvälinen vertailu</p>
      <div class="loading"><span class="spinner"></span>Ladataan dataa…</div>
    </div>
  `;

  const container = host.querySelector(`.plugin-${ID}`);

  try {
    console.log("[moduli013] ladataan dataa…");
    
    // Lataa tarvittavat JSON-tiedostot
    const [diagnoosit, sairauspoissaolot, odotusajat, nordic] = await Promise.all([
      core.data.load("mental_health_diagnoses_by_age.json").catch(() => null),
      core.data.load("sick_leave_mental_health.json").catch(() => null),
      core.data.load("mental_health_waiting_times_regional.json").catch(() => null),
      core.data.load("mental_health_nordic_comparison.json").catch(() => null)
    ]);
    
    container.innerHTML = "";
    
    const tooltip = tooltipKomponentti();
    
    // Rakenna kaikki osiot
    if (diagnoosit) {
      rakennaDiagnoositrendi(container, diagnoosit, tooltip);
    } else {
      container.appendChild(luoVirhe("Mental_health_diagnoses_by_age.json - Diagnoositrendiä ei ladattu"));
    }
    
    rakennaPalvelupolku(container);
    
    if (odotusajat && odotusajat.maakunnat) {
      rakennaAlueellinenHeatmap(container, odotusajat.maakunnat, tooltip);
    } else {
      container.appendChild(luoVirhe("Mental_health_waiting_times_regional.json - Aluedataa ei ladattu"));
    }
    
    if (sairauspoissaolot) {
      rakennaTalousvaikutukset(container, sairauspoissaolot, tooltip);
    } else {
      container.appendChild(luoVirhe("Sick_leave_mental_health.json - Talousdataa ei ladattu"));
    }
    
    if (nordic && nordic.vertailuindeksi_2023) {
      rakennaKansainvalinenVertailu(container, nordic.vertailuindeksi_2023, nordic.vertailuindeksi_2023.komponentit, tooltip);
    } else {
      container.appendChild(luoVirhe("Mental_health_nordic_comparison.json - Pohjoismaista vertailua ei ladattu"));
    }
    
    requestAnimationFrame(() => container.classList.add("is-mounted"));
    
  } catch (err) {
    console.error("[moduli013] virhe:", err);
    container.innerHTML = `<div style="padding:24px; color:#8B1A1A; font-family:monospace;">
      <strong>Virhe lisäosassa:</strong><br>${err.message}
      <br><br>Tarvittavat tiedostot:<br>
      • mental_health_diagnoses_by_age.json<br>
      • sick_leave_mental_health.json<br>
      • mental_health_waiting_times_regional.json<br>
      • mental_health_nordic_comparison.json
    </div>`;
  }
}

function luoVirhe(viesti) {
  const el = document.createElement("div");
  el.className = "loading";
  el.style.color = "#8B1A1A";
  el.textContent = "⚠️ " + viesti;
  return el;
}

function rakennaDiagnoositrendi(container, data, tooltip) {
  const vuodet = data.vuodet || [];
  const sarjat = data.sarjat || [];
  const ikaryhma = "25–29 v";
  
  const osio = document.createElement("div");
  osio.className = "m013-osio";
  osio.innerHTML = `
    <h2 class="m013-otsikko">Mielenterveysdiagnoosit 2010–2024</h2>
    <p class="m013-kuvaus">Sairaalahoitopotilaat per 100 000 asukasta (25–29 v) -- lähde: NOMESCO</p>
  `;
  
  const kaavioKotelo = document.createElement("div");
  kaavioKotelo.className = "m013-kaavio-kotelo";
  
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 680 260");
  svg.setAttribute("style", "width:100%; height:auto");
  
  const leveys = 680, korkeus = 260;
  const marginaali = { top: 20, right: 30, bottom: 40, left: 50 };
  const piirtoLeveys = leveys - marginaali.left - marginaali.right;
  const piirtoKorkeus = korkeus - marginaali.top - marginaali.bottom;
  
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("transform", `translate(${marginaali.left},${marginaali.top})`);
  svg.appendChild(g);
  
  // Laske maksimiarvo
  let maxArvo = 0;
  sarjat.forEach(s => {
    const d = s.data[ikaryhma] || s.data.kaikki || [];
    d.forEach(v => { if (v && v > maxArvo) maxArvo = v; });
  });
  maxArvo = Math.ceil(maxArvo / 200) * 200;
  
  const xAskel = piirtoLeveys / (vuodet.length - 1);
  const värit = ["#8B1A1A", "#D4A017", "#3a5f8a", "#1D6B5A"];
  
  // Ruudukko
  [0, maxArvo/2, maxArvo].forEach(arvo => {
    const y = piirtoKorkeus - (arvo / maxArvo) * piirtoKorkeus;
    const viiva = document.createElementNS("http://www.w3.org/2000/svg", "line");
    viiva.setAttribute("x1", 0); viiva.setAttribute("x2", piirtoLeveys);
    viiva.setAttribute("y1", y); viiva.setAttribute("y2", y);
    viiva.setAttribute("stroke", "#333"); viiva.setAttribute("stroke-dasharray", "3,4");
    g.appendChild(viiva);
    const teksti = document.createElementNS("http://www.w3.org/2000/svg", "text");
    teksti.setAttribute("x", -6); teksti.setAttribute("y", y + 4);
    teksti.setAttribute("text-anchor", "end");
    teksti.setAttribute("font-size", "10"); teksti.setAttribute("fill", "#888");
    teksti.textContent = arvo;
    g.appendChild(teksti);
  });
  
  // X-akseli
  vuodet.forEach((v, i) => {
    if (i % 3 !== 0 && i !== vuodet.length - 1) return;
    const x = i * xAskel;
    const teksti = document.createElementNS("http://www.w3.org/2000/svg", "text");
    teksti.setAttribute("x", x); teksti.setAttribute("y", piirtoKorkeus + 18);
    teksti.setAttribute("text-anchor", "middle");
    teksti.setAttribute("font-size", "10"); teksti.setAttribute("fill", "#888");
    teksti.textContent = v;
    g.appendChild(teksti);
  });
  
  // COVID-merkintä
  const covidIdx = vuodet.indexOf(2020);
  if (covidIdx >= 0) {
    const x = covidIdx * xAskel;
    const viiva = document.createElementNS("http://www.w3.org/2000/svg", "line");
    viiva.setAttribute("x1", x); viiva.setAttribute("x2", x);
    viiva.setAttribute("y1", 0); viiva.setAttribute("y2", piirtoKorkeus);
    viiva.setAttribute("stroke", "#555"); viiva.setAttribute("stroke-dasharray", "2,3");
    g.appendChild(viiva);
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", x + 5); label.setAttribute("y", 14);
    label.setAttribute("font-size", "8"); label.setAttribute("fill", "#666");
    label.textContent = "COVID-19";
    g.appendChild(label);
  }
  
  // Piirrä viivat ja pisteet
  sarjat.forEach((sarja, idx) => {
    const arvot = sarja.data[ikaryhma] || sarja.data.kaikki || [];
    const vari = värit[idx % värit.length];
    
    let d = "";
    arvot.forEach((arvo, i) => {
      if (arvo === null || arvo === undefined) return;
      const x = i * xAskel;
      const y = piirtoKorkeus - (arvo / maxArvo) * piirtoKorkeus;
      if (d === "") d = "M" + x.toFixed(1) + "," + y.toFixed(1);
      else d += "L" + x.toFixed(1) + "," + y.toFixed(1);
    });
    if (d) {
      const polku = document.createElementNS("http://www.w3.org/2000/svg", "path");
      polku.setAttribute("d", d);
      polku.setAttribute("fill", "none");
      polku.setAttribute("stroke", vari);
      polku.setAttribute("stroke-width", "2.5");
      polku.setAttribute("stroke-linecap", "round");
      g.appendChild(polku);
    }
    
    arvot.forEach((arvo, i) => {
      if (arvo === null || arvo === undefined) return;
      const x = i * xAskel;
      const y = piirtoKorkeus - (arvo / maxArvo) * piirtoKorkeus;
      const piste = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      piste.setAttribute("cx", x); piste.setAttribute("cy", y);
      piste.setAttribute("r", i === arvot.length - 1 ? 5 : 3.5);
      piste.setAttribute("fill", vari);
      piste.setAttribute("stroke", "#12121e"); piste.setAttribute("stroke-width", "1.5");
      piste.style.cursor = "pointer";
      piste.addEventListener("mouseenter", e => {
        tooltip.nayta(e, `<strong>${sarja.nimi}</strong><br>${vuodet[i]}: <strong>${arvo}</strong> / 100 000`);
      });
      piste.addEventListener("mouseleave", () => tooltip.piilota());
      g.appendChild(piste);
    });
  });
  
  kaavioKotelo.appendChild(svg);
  
  // Legenda
  const legenda = document.createElement("div");
  legenda.className = "m013-legenda";
  sarjat.forEach((s, idx) => {
    const item = document.createElement("span");
    item.className = "m013-legenda-item";
    item.innerHTML = `<span style="color:${värit[idx % värit.length]};font-size:14px;">●</span> ${s.nimi}`;
    legenda.appendChild(item);
  });
  kaavioKotelo.appendChild(legenda);
  
  osio.appendChild(kaavioKotelo);
  container.appendChild(osio);
}

function rakennaPalvelupolku(container) {
  const polku = [
    { vaihe: "Oireilee", lkm: 760000, kuvaus: "Arviolta 760 000 suomalaista kärsii kliinisesti merkittävistä mielenterveysoireista vuosittain", vari: "#8B1A1A" },
    { vaihe: "Hakee apua", lkm: 420000, kuvaus: "420 000 hakee apua – 340 000 jää hakematta (stigma, tietämättömyys, kustannukset)", vari: "#c0392b" },
    { vaihe: "Pääsee hoitoon", lkm: 290000, kuvaus: "290 000 pääsee hoitoon kohtuullisessa ajassa – 130 000 jää jonoihin tai pudottaa hoitonsa", vari: "#D4A017" },
    { vaihe: "Toipuu", lkm: 175000, kuvaus: "175 000 toipuu tai saa toimintakykynsä merkittävästi parantumaan hoidon aikana", vari: "#1D6B5A" }
  ];
  
  const osio = document.createElement("div");
  osio.className = "m013-osio";
  osio.innerHTML = `
    <h2 class="m013-otsikko">Palvelupolku: missä pudotaan?</h2>
    <p class="m013-kuvaus">Vuotuinen arvio -- lähde: THL, Kela (2024)</p>
  `;
  
  const suppiloKotelo = document.createElement("div");
  suppiloKotelo.className = "m013-suppilo";
  
  polku.forEach((vaihe, i) => {
    const osuus = vaihe.lkm / polku[0].lkm;
    const leveysPct = Math.round(osuus * 100);
    
    const rivi = document.createElement("div");
    rivi.className = "m013-suppilo-rivi";
    
    const etiketti = document.createElement("div");
    etiketti.className = "m013-suppilo-etiketti";
    etiketti.textContent = vaihe.vaihe;
    rivi.appendChild(etiketti);
    
    const palkkiKotelo = document.createElement("div");
    palkkiKotelo.className = "m013-suppilo-palkki-kotelo";
    const palkki = document.createElement("div");
    palkki.className = "m013-suppilo-palkki";
    palkki.style.width = leveysPct + "%";
    palkki.style.background = vaihe.vari;
    const lkmSpan = document.createElement("span");
    lkmSpan.className = "m013-suppilo-lkm";
    lkmSpan.textContent = (vaihe.lkm / 1000).toFixed(0) + " 000";
    palkki.appendChild(lkmSpan);
    palkkiKotelo.appendChild(palkki);
    rivi.appendChild(palkkiKotelo);
    suppiloKotelo.appendChild(rivi);
    
    if (i < polku.length - 1) {
      const pudotus = polku[i].lkm - polku[i + 1].lkm;
      const nuoli = document.createElement("div");
      nuoli.className = "m013-suppilo-pudotus";
      nuoli.textContent = "▼ " + (pudotus / 1000).toFixed(0) + " 000 ei jatka";
      suppiloKotelo.appendChild(nuoli);
    }
  });
  
  osio.appendChild(suppiloKotelo);
  
  const kuvaukset = document.createElement("div");
  kuvaukset.className = "m013-suppilo-kuvaukset";
  polku.forEach(v => {
    const item = document.createElement("div");
    item.className = "m013-suppilo-kuvaus-item";
    item.innerHTML = `<span style="color:${v.vari};font-weight:700;">${v.vaihe}:</span> ${v.kuvaus}`;
    kuvaukset.appendChild(item);
  });
  osio.appendChild(kuvaukset);
  
  container.appendChild(osio);
}

function rakennaAlueellinenHeatmap(container, maakunnat, tooltip) {
  const osio = document.createElement("div");
  osio.className = "m013-osio";
  osio.innerHTML = `
    <h2 class="m013-otsikko">Alueellinen eriarvoisuus hoitoonpääsyssä</h2>
    <p class="m013-kuvaus">Odotusaika viikkoa (mediaani) ja hoitoon päässeiden osuus -- lähde: THL 2024</p>
  `;
  
  const taulukko = document.createElement("div");
  taulukko.className = "m013-alue-taulukko";
  
  const otsikot = document.createElement("div");
  otsikot.className = "m013-alue-rivi m013-alue-otsikko";
  ["Maakunta", "Odotusaika", "Hoitoonpääsy", "Tila"].forEach(t => {
    const solu = document.createElement("div");
    solu.className = "m013-alue-solu";
    solu.textContent = t;
    otsikot.appendChild(solu);
  });
  taulukko.appendChild(otsikot);
  
  const lajiteltu = [...maakunnat].sort((a, b) => a.odotusaika_vk_mediaani - b.odotusaika_vk_mediaani);
  
  lajiteltu.forEach(alue => {
    const rivi = document.createElement("div");
    rivi.className = "m013-alue-rivi";
    rivi.style.cursor = "pointer";
    
    const nimi = document.createElement("div");
    nimi.className = "m013-alue-solu m013-alue-nimi";
    nimi.textContent = alue.maakunta;
    rivi.appendChild(nimi);
    
    const odotus = document.createElement("div");
    odotus.className = "m013-alue-solu";
    const odotusBar = document.createElement("div");
    odotusBar.className = "m013-mini-palkki-kotelo";
    const odotusVis = document.createElement("div");
    odotusVis.className = "m013-mini-palkki";
    const odotusaika = alue.odotusaika_vk_mediaani;
    odotusVis.style.width = Math.min(100, (odotusaika / 65) * 100) + "%";
    odotusVis.style.background = odotusaika > 50 ? "#8B1A1A" : (odotusaika > 30 ? "#D4A017" : "#2f6b46");
    odotusBar.appendChild(odotusVis);
    odotus.appendChild(odotusBar);
    const odusTeksti = document.createElement("span");
    odusTeksti.className = "m013-mini-lkm";
    odusTeksti.textContent = odotusaika + " vk";
    odotus.appendChild(odusTeksti);
    rivi.appendChild(odotus);
    
    const hoito = document.createElement("div");
    hoito.className = "m013-alue-solu";
    const hoitoBar = document.createElement("div");
    hoitoBar.className = "m013-mini-palkki-kotelo";
    const hoitoVis = document.createElement("div");
    hoitoVis.className = "m013-mini-palkki";
    const paasy = alue.hoitoonpaasy_90vrk_pct;
    hoitoVis.style.width = paasy + "%";
    hoitoVis.style.background = paasy > 60 ? "#2f6b46" : (paasy > 40 ? "#D4A017" : "#8B1A1A");
    hoitoBar.appendChild(hoitoVis);
    hoito.appendChild(hoitoBar);
    const hoitoTeksti = document.createElement("span");
    hoitoTeksti.className = "m013-mini-lkm";
    hoitoTeksti.textContent = paasy + "%";
    hoito.appendChild(hoitoTeksti);
    rivi.appendChild(hoito);
    
    const tila = document.createElement("div");
    tila.className = "m013-alue-solu m013-liikennevalo";
    tila.textContent = paasy > 60 ? "🟢" : (paasy > 40 ? "🟡" : "🔴");
    rivi.appendChild(tila);
    
    rivi.addEventListener("mouseenter", e => {
      tooltip.nayta(e, `<strong>${alue.maakunta}</strong><br>Odotusaika: <strong>${odotusaika} viikkoa</strong><br>Hoitoonpääsy: <strong>${paasy}%</strong>`);
    });
    rivi.addEventListener("mouseleave", () => tooltip.piilota());
    
    taulukko.appendChild(rivi);
  });
  
  osio.appendChild(taulukko);
  container.appendChild(osio);
}

function rakennaTalousvaikutukset(container, data, tooltip) {
  const osio = document.createElement("div");
  osio.className = "m013-osio";
  osio.innerHTML = `
    <h2 class="m013-otsikko">Talousvaikutukset: kasvava tuottavuusmenetys</h2>
    <p class="m013-kuvaus">Mielenterveyden vuoksi menetetyt sairaspäivät ja euromääräinen tuottavuusmenetys -- lähde: Kela, THL (2024)</p>
  `;
  
  const talousData = data.sairauspaivarahat;
  const elakeData = data.tyokyvyttomyyselakkeet;
  
  if (!talousData || !elakeData) {
    osio.appendChild(luoVirhe("Talousdataa ei saatavilla"));
    container.appendChild(osio);
    return;
  }
  
  const vuodet = talousData.vuodet.slice(-10);
  const menetysMilj = talousData.maksettu_eur.slice(-10).map(e => e / 1000000);
  const elakkeet = elakeData.arvot_tuhatta;
  
  const maxMenetys = Math.max(...menetysMilj);
  const maxElakkeet = Math.max(...elakkeet);
  
  const leveys = 680, korkeus = 240;
  const marginaali = { top: 20, right: 70, bottom: 40, left: 55 };
  const W = leveys - marginaali.left - marginaali.right;
  const H = korkeus - marginaali.top - marginaali.bottom;
  
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${leveys} ${korkeus}`);
  svg.setAttribute("style", "width:100%; height:auto");
  
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("transform", `translate(${marginaali.left},${marginaali.top})`);
  svg.appendChild(g);
  
  const barLeveys = W / vuodet.length - 6;
  menetysMilj.forEach((arvo, i) => {
    const x = i * (W / vuodet.length) + 3;
    const palkki_h = (arvo / maxMenetys) * H;
    const y = H - palkki_h;
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", x); rect.setAttribute("y", y);
    rect.setAttribute("width", barLeveys); rect.setAttribute("height", palkki_h);
    rect.setAttribute("fill", "#8B1A1A"); rect.setAttribute("opacity", "0.75");
    rect.setAttribute("rx", "2");
    rect.style.cursor = "pointer";
    rect.addEventListener("mouseenter", e => {
      tooltip.nayta(e, `<strong>${vuodet[i]}</strong><br>Tuottavuusmenetys: <strong>${arvo.toFixed(0)} M€</strong>`);
    });
    rect.addEventListener("mouseleave", () => tooltip.piilota());
    g.appendChild(rect);
    
    const xtxt = document.createElementNS("http://www.w3.org/2000/svg", "text");
    xtxt.setAttribute("x", x + barLeveys / 2); xtxt.setAttribute("y", H + 18);
    xtxt.setAttribute("text-anchor", "middle");
    xtxt.setAttribute("font-size", "10"); xtxt.setAttribute("fill", "#888");
    xtxt.textContent = vuodet[i];
    g.appendChild(xtxt);
  });
  
  // Y-akseli (vasen)
  [0, 1000, 2000, 3000].forEach(arvo => {
    const y = H - (arvo / maxMenetys) * H;
    const ytxt = document.createElementNS("http://www.w3.org/2000/svg", "text");
    ytxt.setAttribute("x", -6); ytxt.setAttribute("y", y + 4);
    ytxt.setAttribute("text-anchor", "end");
    ytxt.setAttribute("font-size", "9"); ytxt.setAttribute("fill", "#8B1A1A");
    ytxt.textContent = arvo + " M€";
    g.appendChild(ytxt);
  });
  
  // Viiva: työkyvyttömyyseläkkeet
  let polkuD = "";
  elakkeet.forEach((arvo, i) => {
    const x = i * (W / vuodet.length) + barLeveys / 2 + 3;
    const y = H - (arvo / maxElakkeet) * H;
    polkuD += (i === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1);
  });
  if (polkuD) {
    const viiva = document.createElementNS("http://www.w3.org/2000/svg", "path");
    viiva.setAttribute("d", polkuD);
    viiva.setAttribute("fill", "none");
    viiva.setAttribute("stroke", "#D4A017");
    viiva.setAttribute("stroke-width", "2.5");
    viiva.setAttribute("stroke-dasharray", "6,3");
    g.appendChild(viiva);
  }
  
  // Y-akseli (oikea)
  [0, 200, 400, 600].forEach(arvo => {
    const y = H - (arvo / maxElakkeet) * H;
    const ytxt = document.createElementNS("http://www.w3.org/2000/svg", "text");
    ytxt.setAttribute("x", W + 6); ytxt.setAttribute("y", y + 4);
    ytxt.setAttribute("text-anchor", "start");
    ytxt.setAttribute("font-size", "9"); ytxt.setAttribute("fill", "#D4A017");
    ytxt.textContent = arvo === 0 ? "0" : arvo + "k";
    g.appendChild(ytxt);
  });
  
  osio.appendChild(svg);
  
  const legenda = document.createElement("div");
  legenda.className = "m013-legenda";
  legenda.innerHTML = `<span class="m013-legenda-item"><span style="color:#8B1A1A;">█</span> Tuottavuusmenetys (M€, vasen akseli)</span>
    <span class="m013-legenda-item"><span style="color:#D4A017;">╌╌</span> Työkyvyttömyyseläkkeet (hlö, oikea akseli)</span>`;
  osio.appendChild(legenda);
  
  const tilastoBox = document.createElement("div");
  tilastoBox.className = "m013-tilastoboxsi";
  [
    { nimi: "Tuottavuusmenetys 2024", arvo: "1,022 Mrd €", muutos: "-2 % vs 2023 (laskua uudistusten myötä)" },
    { nimi: "Työkyvyttömyyseläkkeet", arvo: "418 000 hlö", muutos: "-28 % vs 2010 (kanta laskee)" },
    { nimi: "Mielenterveysosuus", arvo: "~38 %", muutos: "työkyvyttömyyseläkkeistä (THL 2024)" }
  ].forEach(t => {
    const kortti = document.createElement("div");
    kortti.className = "m013-tilasto-kortti";
    kortti.innerHTML = `<div class="m013-tilasto-nimi">${t.nimi}</div><div class="m013-tilasto-arvo">${t.arvo}</div><div class="m013-tilasto-muutos">${t.muutos}</div>`;
    tilastoBox.appendChild(kortti);
  });
  osio.appendChild(tilastoBox);
  
  container.appendChild(osio);
}

function rakennaKansainvalinenVertailu(container, indeksi, komponentit, tooltip) {
  const maat = [
    { nimi: "Norja", pisteet: indeksi.pisteet.Norway, vari: "#2f6b46", kuvaus: "Vahva integroitu hoitomalli, korkea resursointi" },
    { nimi: "Tanska", pisteet: indeksi.pisteet.Denmark, vari: "#3a7a55", kuvaus: "Lähipalvelut, aluetason vastuu" },
    { nimi: "Ruotsi", pisteet: indeksi.pisteet.Sweden, vari: "#4a8a65", kuvaus: "Alueellista vaihtelua, uudistuksia käynnissä" },
    { nimi: "Suomi", pisteet: indeksi.pisteet.Finland, vari: "#8B1A1A", kuvaus: "Hoitoonpääsy heikentynyt, resurssivaje kasvaa" }
  ].sort((a, b) => b.pisteet - a.pisteet);
  
  const osio = document.createElement("div");
  osio.className = "m013-osio";
  osio.innerHTML = `
    <h2 class="m013-otsikko">Kansainvälinen vertailu -- Pohjoismaat</h2>
    <p class="m013-kuvaus">Psykologiresurssit (per 100 000) ja mielialahäiriöiden sairaalahoitopotilaat -- lähde: NOMESCO, THL</p>
  `;
  
  const palkit = document.createElement("div");
  palkit.className = "m013-vertailu-palkit";
  
  maat.forEach(maa => {
    const rivi = document.createElement("div");
    rivi.className = "m013-vertailu-rivi";
    
    const label = document.createElement("div");
    label.className = "m013-vertailu-label";
    label.textContent = maa.nimi;
    rivi.appendChild(label);
    
    const barKotelo = document.createElement("div");
    barKotelo.className = "m013-vertailu-bar-kotelo";
    const bar = document.createElement("div");
    bar.className = "m013-vertailu-bar";
    bar.style.width = maa.pisteet + "%";
    bar.style.background = maa.vari;
    if (maa.nimi === "Suomi") {
      bar.style.border = "2px solid #fff";
      bar.style.boxShadow = "0 0 8px rgba(139,26,26,0.6)";
    }
    const arvoSpan = document.createElement("span");
    arvoSpan.className = "m013-vertailu-arvo";
    arvoSpan.textContent = maa.pisteet;
    bar.appendChild(arvoSpan);
    barKotelo.appendChild(bar);
    rivi.appendChild(barKotelo);
    
    rivi.addEventListener("mouseenter", e => {
      tooltip.nayta(e, `<strong>${maa.nimi}</strong><br>Indeksipisteet: <strong>${maa.pisteet}/100</strong><br>${maa.kuvaus}`);
    });
    rivi.addEventListener("mouseleave", () => tooltip.piilota());
    
    palkit.appendChild(rivi);
  });
  
  osio.appendChild(palkit);
  
  const yhteenveto = document.createElement("div");
  yhteenveto.className = "m013-yhteenveto-boxsi";
  yhteenveto.style.borderLeft = "4px solid #8B1A1A";
  yhteenveto.innerHTML = `<strong>Suomi häntäpäässä pohjoismaisessa vertailussa.</strong> Suomen kokonaispisteet ovat 33 pistettä alle Norjan ja 27 pistettä alle Tanskan. Keskeiset heikkoudet: hoitoonpääsyn odotusajat, psykologiresurssien puute (Suomessa 75/100 000, Norjassa 137/100 000), perustason palvelujen integraation puutteet.`;
  osio.appendChild(yhteenveto);
  
  container.appendChild(osio);
}

function unmount(host) {
  destroyCharts();
  const tip = document.querySelector(".m013-tooltip");
  if (tip) tip.remove();
  if (host) host.innerHTML = "";
}

export default { id: ID, mount, unmount };