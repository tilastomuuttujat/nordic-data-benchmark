// public/plugins/moduli001.js
// Plugin: Väestörakenne ja huoltosuhde - käyttää per_capita_trend.json dataa
// Sopimus: ESM, default export { id, mount, unmount }

console.log("[moduli001] tiedosto evaluoitu, ladataan d3…");
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
console.log("[moduli001] d3 ladattu:", typeof d3, d3?.version);

const ID = "moduli001";

const CSS = `
.plugin-${ID}{background:#fafaf7;color:#1a1a1a;font-family:Georgia,"Times New Roman",serif;
  max-width:980px;margin:0 auto;padding:24px;border:1px solid #e6e2d4;border-radius:4px;
  opacity:0;transition:opacity .4s ease}
.plugin-${ID}.is-mounted{opacity:1}
.plugin-${ID} h3{font-family:Georgia,serif;font-size:22px;margin:0 0 6px;color:#1a1a1a}
.plugin-${ID} .lead{color:#555;font-size:13px;margin:0 0 18px;line-height:1.55}
.plugin-${ID} .charts{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start}
.plugin-${ID} .chart-title{font:600 11px/1 ui-sans-serif,system-ui;text-transform:uppercase;
  letter-spacing:.08em;color:#6b6b6b;margin-bottom:8px}
.plugin-${ID} svg{width:100%;height:auto;display:block;font:11px ui-sans-serif,system-ui}
.plugin-${ID} .axis path,.plugin-${ID} .axis line{stroke:#d4d4cf;stroke-opacity:.7}
.plugin-${ID} .axis text{fill:#6b6b6b}
.plugin-${ID} .grid line{stroke:#d4d4cf;stroke-opacity:.4;shape-rendering:crispEdges}
.plugin-${ID} .grid path{display:none}
.plugin-${ID} .insight{background:#f0ede2;border-left:3px solid #2f6b46;
  padding:12px 16px;margin-top:18px;font-size:13px;line-height:1.55;border-radius:2px}
.plugin-${ID} .insight strong{font-family:Georgia,serif}
.plugin-${ID} .insight ul{margin:6px 0 0;padding-left:18px}
.plugin-${ID} .insight li{margin:3px 0}
.plugin-${ID} .source{color:#888;font-size:11px;margin-top:14px;font-style:italic}
.plugin-${ID} .legend{display:flex;gap:16px;font-size:11px;color:#444;margin-top:6px;flex-wrap:wrap}
.plugin-${ID} .legend i{display:inline-block;width:10px;height:10px;margin-right:4px;vertical-align:middle}
.plugin-${ID} .tip{position:fixed;background:#1a1a1a;color:#fafaf7;font:11px ui-sans-serif,system-ui;
  padding:5px 8px;border-radius:3px;pointer-events:none;opacity:0;transition:opacity .15s;z-index:9999}
.plugin-${ID}__sr-only{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
@media (max-width:640px){.plugin-${ID} .charts{grid-template-columns:1fr}}
`;

function ensureStyles() {
  if (document.getElementById("style-" + ID)) return;
  const s = document.createElement("style");
  s.id = "style-" + ID;
  s.textContent = CSS;
  document.head.appendChild(s);
}

function tip(root) {
  let el = root.querySelector(".tip");
  if (!el) {
    el = document.createElement("div");
    el.className = "tip";
    document.body.appendChild(el);
  }
  return {
    show(html, ev) {
      el.innerHTML = html;
      el.style.left = ev.clientX + 12 + "px";
      el.style.top = ev.clientY + 12 + "px";
      el.style.opacity = "1";
    },
    hide() { el.style.opacity = "0"; },
    destroy() { el.remove(); },
  };
}

// Piirrä menokehitys -kuvaaja valituille sektoreille
function drawExpenditureChart(container, data, sectors, colors) {
  const wrap = d3.select(container);
  wrap.selectAll("*").remove();
  wrap.append("div").attr("class", "chart-title").text("Julkiset menot per asukas (€, 2020 hinta)");

  const W = 420, H = 260, M = { t: 12, r: 8, b: 32, l: 52 };
  const svg = wrap.append("svg").attr("viewBox", `0 0 ${W} ${H}`);

  // Suodatetaan vuodet 1980–2025
  const years = [...new Set(data.map(d => d.year).filter(y => y >= 1980 && y <= 2025))].sort();
  
  // Tehdään datasta sarjat sektoreittain
  const series = {};
  sectors.forEach(s => { series[s.key] = []; });
  
  years.forEach(year => {
    const yearData = data.filter(d => d.year === year);
    sectors.forEach(s => {
      const entry = yearData.find(d => d.sector_key === s.key);
      series[s.key].push({ year, value: entry ? entry.real_2020_eur_per_target : 0 });
    });
  });

  const x = d3.scaleLinear().domain([1980, 2025]).range([M.l, W - M.r]);
  const maxVal = d3.max(sectors.flatMap(s => series[s.key].map(p => p.value))) * 1.05;
  const y = d3.scaleLinear().domain([0, maxVal]).nice().range([H - M.b, M.t]);

  // Grid
  svg.append("g").attr("class", "grid").attr("transform", `translate(${M.l},0)`)
    .call(d3.axisLeft(y).tickSize(-(W - M.l - M.r)).tickFormat(""));
  
  // Akselit
  svg.append("g").attr("class", "axis").attr("transform", `translate(0,${H - M.b})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(9));
  svg.append("g").attr("class", "axis").attr("transform", `translate(${M.l},0)`)
    .call(d3.axisLeft(y).ticks(6).tickFormat(d => d.toLocaleString("fi-FI") + "€"));

  // Piirrä viivat
  const lineGen = d3.line().x(d => x(d.year)).y(d => y(d.value));
  const t = tip(container);

  sectors.forEach(s => {
    const path = svg.append("path")
      .attr("d", lineGen(series[s.key]))
      .attr("fill", "none")
      .attr("stroke", colors[s.key])
      .attr("stroke-width", 2)
      .attr("stroke-linecap", "round");
    
    const len = path.node().getTotalLength();
    path.attr("stroke-dasharray", `${len} ${len}`)
      .attr("stroke-dashoffset", len)
      .transition().duration(800).attr("stroke-dashoffset", 0);
  });

  // Hover-pisteet
  const focus = svg.append("circle").attr("r", 0).attr("fill", "#1a1a1a");
  const tooltipLine = svg.append("line")
    .attr("y1", M.t).attr("y2", H - M.b)
    .attr("stroke", "#1a1a1a").attr("stroke-opacity", 0).attr("stroke-width", 0.8);
  
  svg.append("rect")
    .attr("x", M.l).attr("y", M.t)
    .attr("width", W - M.l - M.r).attr("height", H - M.t - M.b)
    .attr("fill", "transparent")
    .on("mousemove", function(ev) {
      const [mx] = d3.pointer(ev, this);
      const year = Math.round(x.invert(mx + M.l));
      if (year < 1980 || year > 2025) return;
      tooltipLine.attr("x1", x(year)).attr("x2", x(year)).attr("stroke-opacity", 0.3);
      
      let html = `<b>${year}</b><br>`;
      sectors.forEach(s => {
        const val = series[s.key].find(p => p.year === year)?.value || 0;
        html += `<span style="color:${colors[s.key]}">●</span> ${s.name}: ${val.toLocaleString("fi-FI")}€<br>`;
      });
      t.show(html, ev);
      
      // Etsi lähimpänä oleva piste ja korosta
      const closest = sectors.map(s => ({
        key: s.key,
        point: series[s.key].reduce((a, b) => Math.abs(b.year - year) < Math.abs(a.year - year) ? b : a)
      }));
      if (closest[0] && closest[0].point) {
        const totalVal = closest.reduce((sum, c) => sum + c.point.value, 0);
        html += `<span style="border-top:1px solid #888;margin-top:2px;">━━━━━━━<br>YHT: ${totalVal.toLocaleString("fi-FI")}€</span>`;
        t.show(html, ev);
      }
    })
    .on("mouseleave", () => {
      tooltipLine.attr("stroke-opacity", 0);
      t.hide();
    });

  // Legenda
  const legendHtml = sectors.map(s => 
    `<span><i style="background:${colors[s.key]}"></i>${s.name}</span>`
  ).join("");
  wrap.append("div").attr("class", "legend").html(legendHtml);

  return () => t.destroy();
}

// Piirrä pylväsdiagrammi vanhus- ja lapsimenoista
function drawDemographicBar(container, data) {
  const wrap = d3.select(container);
  wrap.selectAll("*").remove();
  wrap.append("div").attr("class", "chart-title").text("Vanhus- ja lapsiperhepalvelut per asukas (€)");

  const W = 400, H = 260, M = { t: 10, r: 10, b: 42, l: 48 };
  const svg = wrap.append("svg").attr("viewBox", `0 0 ${W} ${H}`);

  // Suodatetaan vuodet 1980–2025
  const years = [...new Set(data.map(d => d.year).filter(y => y >= 1980 && y <= 2025))].sort();
  
  // Haetaan vanhus- ja lapsimenot
  const elderlyData = data.filter(d => d.sector_key === "vanhus_vammais");
  const childData = data.filter(d => d.sector_key === "lastensuojelu");
  
  const values = [];
  years.forEach(year => {
    const elderly = elderlyData.find(d => d.year === year)?.real_2020_eur_per_target || 0;
    const child = childData.find(d => d.year === year)?.real_2020_eur_per_target || 0;
    values.push({ year, elderly, child });
  });

  const x = d3.scaleBand().domain(years).range([M.l, W - M.r]).padding(0.2);
  const maxVal = d3.max(values.flatMap(v => [v.elderly, v.child])) * 1.05;
  const yScale = d3.scaleLinear().domain([0, maxVal]).nice().range([H - M.b, M.t]);

  // Grid
  svg.append("g").attr("class", "grid").attr("transform", `translate(${M.l},0)`)
    .call(d3.axisLeft(yScale).tickSize(-(W - M.l - M.r)).tickFormat(""));
  
  // Akselit
  svg.append("g").attr("class", "axis").attr("transform", `translate(0,${H - M.b})`)
    .call(d3.axisBottom(x).tickValues(years.filter((_, i) => i % 5 === 0)).tickFormat(d3.format("d")));
  svg.append("g").attr("class", "axis").attr("transform", `translate(${M.l},0)`)
    .call(d3.axisLeft(yScale).ticks(6).tickFormat(d => d.toLocaleString("fi-FI") + "€"));

  // Pylväät vierekkäin
  const t = tip(container);
  
  svg.selectAll(".bar-elderly")
    .data(values)
    .enter()
    .append("rect")
    .attr("class", "bar-elderly")
    .attr("x", d => x(d.year))
    .attr("y", d => yScale(d.elderly))
    .attr("width", x.bandwidth() / 2)
    .attr("height", d => H - M.b - yScale(d.elderly))
    .attr("fill", "#a8401f")
    .attr("opacity", 0.85)
    .on("mousemove", (ev, d) => t.show(`<b>${d.year}</b><br>Vanhus- ja vammaispalvelut: ${d.elderly.toLocaleString("fi-FI")}€`, ev))
    .on("mouseleave", t.hide);

  svg.selectAll(".bar-child")
    .data(values)
    .enter()
    .append("rect")
    .attr("class", "bar-child")
    .attr("x", d => x(d.year) + x.bandwidth() / 2)
    .attr("y", d => yScale(d.child))
    .attr("width", x.bandwidth() / 2)
    .attr("height", d => H - M.b - yScale(d.child))
    .attr("fill", "#3a5f8a")
    .attr("opacity", 0.85)
    .on("mousemove", (ev, d) => t.show(`<b>${d.year}</b><br>Lastensuojelu & perhepalvelut: ${d.child.toLocaleString("fi-FI")}€`, ev))
    .on("mouseleave", t.hide);

  // Legenda
  wrap.append("div").attr("class", "legend").html(`
    <span><i style="background:#a8401f"></i>Vanhus- & vammaispalvelut</span>
    <span><i style="background:#3a5f8a"></i>Lastensuojelu & perhepalvelut</span>
  `);

  return () => t.destroy();
}

let _cleanups = [];

async function mount(host, core) {
  console.log("[moduli001] mount kutsuttu");
  ensureStyles();
  
  host.innerHTML = `
    <section class="plugin-${ID}" aria-label="Väestörakenne ja julkiset menot">
      <h3>Väestörakenne ja julkiset menot 1980–2025</h3>
      <p class="lead">Ikääntyvä väestö näkyy selvästi julkisissa menoissa -- vanhuspalvelut ovat kasvaneet reaalisesti samalla kun lapsiperhepalvelut ovat pysyneet vakaampina.</p>
      <div class="charts">
        <div class="expenditure"></div>
        <div class="demographic"></div>
      </div>
      <div class="insight">
        <strong>Mitä tämä kertoo:</strong>
        <ul id="insight-${ID}"></ul>
      </div>
      <div class="source"></div>
      <table class="plugin-${ID}__sr-only" aria-hidden="false">
        <caption>Menokehityksen vuosiarvot</caption>
        <thead><tr><th>Vuosi</th><th>Vanhuspalvelut €</th><th>Lapsiperhepalvelut €</th><th>Eläkemenot €</th><th>Sosiaaliturva €</th></tr></thead>
        <tbody id="sr-${ID}"></tbody>
      </table>
    </section>
  `;

  const root = host.querySelector(`.plugin-${ID}`);
  
  try {
    console.log("[moduli001] ladataan per_capita_trend.json…");
    const data = await core.data.load("per_capita_trend.json");
    console.log("[moduli001] data ladattu,", data?.length, "riviä");
    
    if (!data || data.length === 0) {
      throw new Error("Dataa ei löytynyt tai se on tyhjää.");
    }
    
    // Määritellään sektorit ja värit
    const sectors = [
      { key: "vanhus_vammais", name: "Vanhus- & vammaispalvelut" },
      { key: "elakkeet_sosiaaliturva", name: "Eläkkeet & sosiaaliturva" },
      { key: "lastensuojelu", name: "Lastensuojelu" },
      { key: "somaattinen_th", name: "Somaattinen th" }
    ];
    
    const colors = {
      "vanhus_vammais": "#a8401f",
      "elakkeet_sosiaaliturva": "#2f6b46",
      "lastensuojelu": "#3a5f8a",
      "somaattinen_th": "#8b6b3d"
    };
    
    _cleanups.push(drawExpenditureChart(root.querySelector(".expenditure"), data, sectors, colors));
    _cleanups.push(drawDemographicBar(root.querySelector(".demographic"), data));
    
    // Laske insight-tiedot
    const elderlyData = data.filter(d => d.sector_key === "vanhus_vammais");
    const childData = data.filter(d => d.sector_key === "lastensuojelu");
    const pensionData = data.filter(d => d.sector_key === "elakkeet_sosiaaliturva");
    
    const elderly1980 = elderlyData.find(d => d.year === 1980)?.real_2020_eur_per_target || 0;
    const elderly2025 = elderlyData.find(d => d.year === 2025)?.real_2020_eur_per_target || 0;
    const child1980 = childData.find(d => d.year === 1980)?.real_2020_eur_per_target || 0;
    const child2025 = childData.find(d => d.year === 2025)?.real_2020_eur_per_target || 0;
    const pension1980 = pensionData.find(d => d.year === 1980)?.real_2020_eur_per_target || 0;
    const pension2025 = pensionData.find(d => d.year === 2025)?.real_2020_eur_per_target || 0;
    
    const elderlyGrowth = ((elderly2025 - elderly1980) / elderly1980 * 100).toFixed(0);
    const pensionGrowth = ((pension2025 - pension1980) / pension1980 * 100).toFixed(0);
    
    const ul = root.querySelector(`#insight-${ID}`);
    ul.innerHTML = `
      <li>Vanhus- ja vammaispalvelut ovat kasvaneet reaalisesti <b>+${elderlyGrowth}%</b> vuodesta 1980 (${elderly1980.toLocaleString("fi-FI")}€ → ${elderly2025.toLocaleString("fi-FI")}€ per asukas).</li>
      <li>Samaan aikaan eläkemenot ovat kasvaneet <b>+${pensionGrowth}%</b> reaalisesti.</li>
      <li>Lapsiperhepalvelut ovat pysyneet vakaampina (${child1980.toLocaleString("fi-FI")}€ → ${child2025.toLocaleString("fi-FI")}€ per asukas).</li>
      <li>Tämä kuvastaa väestön ikääntymistä: 65+ väestön osuus on kasvanut ~10%:sta yli 20%:iin.</li>
      <li>Sosiaali- ja terveysmenot painottuvat yhä enemmän ikääntyvän väestön tarpeisiin.</li>
    `;
    
    const updated = data.find(d => d.year === 2024)?.["_meta"]?.updated || "–";
    root.querySelector(".source").textContent = `Lähde: per_capita_trend.json (reaaliset menot per asukas, 2020 hintataso).`;
    
    // Taulukko saavutettavuutta varten
    const tbody = root.querySelector(`#sr-${ID}`);
    const years = [...new Set(data.map(d => d.year).filter(y => y >= 1980 && y % 5 === 0 || y === 2025))].sort();
    years.forEach(year => {
      const elderly = elderlyData.find(d => d.year === year)?.real_2020_eur_per_target || 0;
      const child = childData.find(d => d.year === year)?.real_2020_eur_per_target || 0;
      const pension = pensionData.find(d => d.year === year)?.real_2020_eur_per_target || 0;
      const health = data.find(d => d.year === year && d.sector_key === "somaattinen_th")?.real_2020_eur_per_target || 0;
      tbody.insertAdjacentHTML("beforeend", `
        <tr><td>${year}</td><td>${Math.round(elderly).toLocaleString("fi-FI")}</td>
        <td>${Math.round(child).toLocaleString("fi-FI")}</td>
        <td>${Math.round(pension).toLocaleString("fi-FI")}</td>
        <td>${Math.round(health).toLocaleString("fi-FI")}</td></tr>
      `);
    });
    
    requestAnimationFrame(() => root.classList.add("is-mounted"));
    
  } catch (err) {
    console.error("[moduli001] virhe mountissa:", err);
    root.innerHTML = `<div style="padding:16px;color:#a8401f">
        <strong>Virhe lisäosassa:</strong><br>${err.message}
        <br><br>Varmista että data on ladattavissa ja oikeassa muodossa.
    </div>`;
  }
}

function unmount(host) {
  _cleanups.forEach(fn => { try { fn && fn(); } catch {} });
  _cleanups = [];
  if (host) host.innerHTML = "";
}

export default { id: ID, mount, unmount };