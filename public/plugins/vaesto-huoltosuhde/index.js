// Plugin: vaesto-huoltosuhde
// ESM module — default export { mount, unmount }
// Käyttää D3 v7:ää CDN:stä. Olettaa että `core.data.load(path)` palauttaa Promise<json>.
// Jos `core` puuttuu, fallback fetchiin.

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const PLUGIN_ID = "vaesto-huoltosuhde";
const cls = (s) => `plugin-${PLUGIN_ID}${s ? "__" + s : ""}`;

const COLORS = {
  child: "#c9a84c",
  work: "#3a5f8a",
  elder: "#a8401f",
  improve: "#2f6b46",
  worsen: "#a8401f",
  neutral: "#3a5f8a",
  hist: "#6b6b6b",
  rule: "#d4d4cf",
  ink: "#1a1a1a",
  inkSoft: "#4a4a4a",
};

function ageMid(label) {
  if (label.endsWith("+")) return 102;
  const [a, b] = label.split("-").map(Number);
  return (a + b) / 2;
}
function bandCategory(label) {
  const m = ageMid(label);
  if (m < 15) return "child";
  if (m < 65) return "work";
  return "elder";
}

let _state = null;

function ensureTooltip(root) {
  let tt = root.querySelector("." + cls("tooltip"));
  if (!tt) {
    tt = document.createElement("div");
    tt.className = cls("tooltip");
    document.body.appendChild(tt);
  }
  return tt;
}
function showTip(tt, html, evt) {
  tt.innerHTML = html;
  tt.classList.add("is-visible");
  const x = evt.clientX + 12;
  const y = evt.clientY + 12;
  tt.style.left = x + "px";
  tt.style.top = y + "px";
}
function hideTip(tt) {
  tt.classList.remove("is-visible");
}

function renderPyramid(container, snapshot, tt) {
  container.innerHTML = "";
  const width = container.clientWidth || 380;
  const height = 360;
  const margin = { top: 8, right: 8, bottom: 28, left: 36 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;
  const halfW = innerW / 2;
  const gap = 36; // center label gap

  const bands = snapshot.ageBands;
  const maxVal = d3.max(bands, (d) => Math.max(d.m, d.f)) || 1;

  const x = d3.scaleLinear().domain([0, maxVal]).range([0, halfW - gap / 2]);
  const y = d3
    .scaleBand()
    .domain(bands.map((b) => b.age))
    .range([innerH, 0])
    .padding(0.18);

  const svg = d3
    .select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "img")
    .attr("aria-label", `Ikäpyramidi vuonna ${snapshot.year}`);

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Bars — men (left)
  g.selectAll(".bar-m")
    .data(bands)
    .join("rect")
    .attr("class", "bar-m")
    .attr("x", (d) => halfW - gap / 2 - x(d.m))
    .attr("y", (d) => y(d.age))
    .attr("width", (d) => x(d.m))
    .attr("height", y.bandwidth())
    .attr("fill", (d) => COLORS[bandCategory(d.age)])
    .attr("opacity", 0.9)
    .on("mousemove", (e, d) =>
      showTip(
        tt,
        `<b>${snapshot.year}</b> · ${d.age} v · miehet<br>${d.m.toLocaleString("fi-FI")}`,
        e,
      ),
    )
    .on("mouseleave", () => hideTip(tt));

  // Bars — women (right)
  g.selectAll(".bar-f")
    .data(bands)
    .join("rect")
    .attr("class", "bar-f")
    .attr("x", halfW + gap / 2)
    .attr("y", (d) => y(d.age))
    .attr("width", (d) => x(d.f))
    .attr("height", y.bandwidth())
    .attr("fill", (d) => COLORS[bandCategory(d.age)])
    .attr("opacity", 0.9)
    .on("mousemove", (e, d) =>
      showTip(
        tt,
        `<b>${snapshot.year}</b> · ${d.age} v · naiset<br>${d.f.toLocaleString("fi-FI")}`,
        e,
      ),
    )
    .on("mouseleave", () => hideTip(tt));

  // Center age labels
  g.selectAll(".age-label")
    .data(bands)
    .join("text")
    .attr("class", "age-label")
    .attr("x", halfW)
    .attr("y", (d) => y(d.age) + y.bandwidth() / 2 + 3)
    .attr("text-anchor", "middle")
    .attr("font-size", 9)
    .attr("fill", COLORS.inkSoft)
    .text((d) => d.age);

  // Sex labels
  g.append("text")
    .attr("x", halfW - gap / 2 - 4)
    .attr("y", -2)
    .attr("text-anchor", "end")
    .attr("font-size", 11)
    .attr("fill", COLORS.inkSoft)
    .text("← miehet");
  g.append("text")
    .attr("x", halfW + gap / 2 + 4)
    .attr("y", -2)
    .attr("text-anchor", "start")
    .attr("font-size", 11)
    .attr("fill", COLORS.inkSoft)
    .text("naiset →");

  // Bottom axis (counts, symmetric)
  const ticks = x.ticks(4).filter((t) => t > 0);
  const axisG = g
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${innerH})`);
  axisG
    .append("line")
    .attr("x1", 0)
    .attr("x2", innerW)
    .attr("stroke", COLORS.rule)
    .attr("opacity", 0.6);
  ticks.forEach((t) => {
    [halfW - gap / 2 - x(t), halfW + gap / 2 + x(t)].forEach((px) => {
      axisG
        .append("text")
        .attr("x", px)
        .attr("y", 14)
        .attr("text-anchor", "middle")
        .attr("font-size", 10)
        .attr("fill", COLORS.inkSoft)
        .text(d3.format(".2~s")(t).replace("k", " k"));
    });
  });
}

function renderDepLine(container, dep, governments, tt) {
  container.innerHTML = "";
  const width = container.clientWidth || 380;
  const height = 320;
  const margin = { top: 12, right: 12, bottom: 28, left: 36 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const x = d3
    .scaleLinear()
    .domain(d3.extent(dep, (d) => d.year))
    .range([0, innerW]);
  const yMax = d3.max(dep, (d) => d.total) * 1.05;
  const y = d3.scaleLinear().domain([0, yMax]).range([innerH, 0]);

  const svg = d3
    .select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "img")
    .attr("aria-label", "Huoltosuhde 1985–2045");
  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Government bands (haalea)
  g.selectAll(".gov")
    .data(governments)
    .join("rect")
    .attr("class", "gov")
    .attr("x", (d) => x(d.start))
    .attr("width", (d) => Math.max(0, x(Math.min(d.end, dep[dep.length - 1].year)) - x(d.start)))
    .attr("y", 0)
    .attr("height", innerH)
    .attr("fill", (d, i) => (i % 2 ? "#efece3" : "#f5f2e8"))
    .attr("opacity", 0.55);

  // Gridlines
  y.ticks(5).forEach((t) => {
    g.append("line")
      .attr("class", "gridline")
      .attr("x1", 0)
      .attr("x2", innerW)
      .attr("y1", y(t))
      .attr("y2", y(t));
  });

  // Axes
  const xAxis = d3
    .axisBottom(x)
    .tickValues([1985, 1995, 2005, 2015, 2024, 2035, 2045])
    .tickFormat(d3.format("d"));
  const yAxis = d3.axisLeft(y).ticks(5).tickFormat((d) => d + " %");
  g.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${innerH})`)
    .call(xAxis);
  g.append("g").attr("class", "axis").call(yAxis);

  // Lines
  const lineMaker = (key) =>
    d3
      .line()
      .x((d) => x(d.year))
      .y((d) => y(d[key]))
      .curve(d3.curveMonotoneX);

  const series = [
    { key: "child", color: COLORS.child, label: "Lapset (0–14)/työikä" },
    { key: "elderly", color: COLORS.elder, label: "Eläke (65+)/työikä" },
    { key: "total", color: COLORS.ink, label: "Kokonaishuoltosuhde", width: 2.4 },
  ];
  series.forEach((s) => {
    g.append("path")
      .datum(dep)
      .attr("fill", "none")
      .attr("stroke", s.color)
      .attr("stroke-width", s.width || 1.6)
      .attr("d", lineMaker(s.key));
  });

  // Hover overlay
  const focus = g.append("g").style("display", "none");
  focus
    .append("line")
    .attr("y1", 0)
    .attr("y2", innerH)
    .attr("stroke", COLORS.inkSoft)
    .attr("stroke-dasharray", "2 2")
    .attr("opacity", 0.5);

  g.append("rect")
    .attr("width", innerW)
    .attr("height", innerH)
    .attr("fill", "transparent")
    .on("mouseenter", () => focus.style("display", null))
    .on("mouseleave", () => {
      focus.style("display", "none");
      hideTip(tt);
    })
    .on("mousemove", (e) => {
      const [mx] = d3.pointer(e);
      const yr = Math.round(x.invert(mx));
      const row = dep.find((d) => d.year === yr);
      if (!row) return;
      focus.select("line").attr("transform", `translate(${x(yr)},0)`);
      showTip(
        tt,
        `<b>${yr}</b><br>Lapsi: ${row.child} %<br>Eläke: ${row.elderly} %<br>Yht.: <b>${row.total} %</b>`,
        e,
      );
    });
}

function renderLegend(el) {
  el.innerHTML = `
    <span><i style="background:${COLORS.child}"></i>0–14 v.</span>
    <span><i style="background:${COLORS.work}"></i>15–64 v.</span>
    <span><i style="background:${COLORS.elder}"></i>65+ v.</span>
  `;
}
function renderDepLegend(el) {
  el.innerHTML = `
    <span><i style="background:${COLORS.child}"></i>Lapsi/työikä</span>
    <span><i style="background:${COLORS.elder}"></i>Eläke/työikä</span>
    <span><i style="background:${COLORS.ink}"></i>Kokonaishuoltosuhde</span>
  `;
}

function buildSrTable(data) {
  const rows = data.dependencyRatio
    .filter((d) => [1985, 2000, 2024, 2045].includes(d.year))
    .map(
      (d) =>
        `<tr><td>${d.year}</td><td>${d.child}%</td><td>${d.elderly}%</td><td>${d.total}%</td></tr>`,
    )
    .join("");
  return `
    <table>
      <caption>Huoltosuhde valittuina vuosina</caption>
      <thead><tr><th>Vuosi</th><th>Lapsi</th><th>Eläke</th><th>Yht.</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

async function loadData(core) {
  const path = `/plugins/${PLUGIN_ID}/data/vaesto.json`;
  if (core && core.data && typeof core.data.load === "function") {
    return core.data.load(path);
  }
  const res = await fetch(path);
  if (!res.ok) throw new Error("Datan lataus epäonnistui: " + res.status);
  return res.json();
}

async function mount(target, core) {
  if (!target) return;
  target.innerHTML = "";
  const root = document.createElement("section");
  root.className = `plugin-${PLUGIN_ID}`;
  root.setAttribute("aria-label", "Väestörakenne ja huoltosuhde");
  target.appendChild(root);

  root.innerHTML = `
    <h3>Väestörakenne ja huoltosuhde 1985–2045</h3>
    <p class="${cls("lede")}">
      Yksi demografinen kuva, joka selittää miksi hoiva-, eläke- ja työvoimakysymykset
      ovat kytkettyjä. Eläkeikäisten osuus työikäisistä lähes kolminkertaistuu 60 vuodessa.
    </p>
    <div class="${cls("charts")}">
      <div>
        <p class="${cls("panel-title")}">Ikäpyramidi</p>
        <div class="${cls("slider-row")}">
          <span class="${cls("year")}" data-role="year-label"></span>
          <input type="range" data-role="year-slider" aria-label="Valitse vuosi" />
        </div>
        <div data-role="pyramid"></div>
        <div class="${cls("legend")}" data-role="pyramid-legend"></div>
      </div>
      <div>
        <p class="${cls("panel-title")}">Huoltosuhde — kolme aikasarjaa</p>
        <p class="${cls("panel-sub")}">Pystypalkit = hallituskaudet (haalea)</p>
        <div data-role="dep"></div>
        <div class="${cls("legend")}" data-role="dep-legend"></div>
      </div>
    </div>

    <div class="${cls("takeaway")}">
      <h4>Mitä tämä kertoo</h4>
      <ul data-role="takeaway"></ul>
    </div>

    <p class="${cls("footnote")}" data-role="footnote"></p>
    <div class="${cls("sr-only")}" data-role="sr"></div>
  `;

  const tt = ensureTooltip(root);
  const pyramidEl = root.querySelector('[data-role="pyramid"]');
  const depEl = root.querySelector('[data-role="dep"]');
  const slider = root.querySelector('[data-role="year-slider"]');
  const yearLabel = root.querySelector('[data-role="year-label"]');

  let data;
  try {
    data = await loadData(core);
  } catch (err) {
    root.innerHTML = `<div class="${cls("error")}">Datan lataus epäonnistui: ${err.message}</div>`;
    return;
  }

  // Slider setup
  const years = data.pyramid.map((p) => p.year);
  slider.min = 0;
  slider.max = years.length - 1;
  slider.step = 1;
  slider.value = years.indexOf(2024) >= 0 ? years.indexOf(2024) : 0;

  const drawPyramid = () => {
    const idx = +slider.value;
    const snap = data.pyramid[idx];
    yearLabel.textContent = snap.year;
    renderPyramid(pyramidEl, snap, tt);
  };
  slider.addEventListener("input", drawPyramid);

  // Initial render
  renderLegend(root.querySelector('[data-role="pyramid-legend"]'));
  renderDepLegend(root.querySelector('[data-role="dep-legend"]'));
  drawPyramid();
  renderDepLine(depEl, data.dependencyRatio, data.governments || [], tt);

  // Takeaways — yksi nostaa eläkehuoltosuhde-kaksinkertaistumisen
  const dr = data.dependencyRatio;
  const d1985 = dr.find((d) => d.year === 1985);
  const d2045 = dr.find((d) => d.year === 2045);
  const ratio = d2045 && d1985 ? (d2045.elderly / d1985.elderly).toFixed(1) : "—";
  const totalRatio = d2045 && d1985 ? (d2045.total / d1985.total).toFixed(1) : "—";

  root.querySelector('[data-role="takeaway"]').innerHTML = `
    <li><b>Eläkehuoltosuhde ${ratio}-kertaistuu</b> 1985→2045 — käytännössä kaksinkertainen huoltosuhde verrattuna vuoteen 1985.</li>
    <li>Pyramidin pohja kapenee: työikäisten määrä ei riitä korvaamaan eläköityvää sukupolvea.</li>
    <li>Hoiva-, eläke- ja työvoimakysymykset jakavat saman demografisen pohjan — niitä ei voi erottaa toisistaan.</li>
    <li>Kokonaishuoltosuhde nousee tasolta ${d1985 ? d1985.total : "?"} % → ${d2045 ? d2045.total : "?"} % (${totalRatio}×).</li>
  `;

  root.querySelector('[data-role="footnote"]').textContent =
    `Lähde: ${data._meta.source}. Päivitetty ${data._meta.updated}. ` +
    `Menetelmä: 5-vuotisikäluokat, miehet/naiset eroteltuina. Kuratoitu opetuskäyttöön.`;

  root.querySelector('[data-role="sr"]').innerHTML = buildSrTable(data);

  // Resize handler
  const onResize = () => {
    drawPyramid();
    renderDepLine(depEl, data.dependencyRatio, data.governments || [], tt);
  };
  window.addEventListener("resize", onResize);

  // Fade-in
  requestAnimationFrame(() => root.classList.add("is-mounted"));

  _state = { root, tt, onResize };
}

function unmount() {
  if (!_state) return;
  const { root, tt, onResize } = _state;
  window.removeEventListener("resize", onResize);
  if (tt && tt.parentNode) tt.parentNode.removeChild(tt);
  if (root && root.parentNode) root.parentNode.removeChild(root);
  _state = null;
}

export default { mount, unmount };
