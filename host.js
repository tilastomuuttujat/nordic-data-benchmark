// V-Signal · Plugin-työpöytä
// Älykäs yhdistelmänäkymä: kun työpöydällä on kaksi moduulia jotka muodostavat
// määritellyn parin, ne fuusioituvat yhdeksi vuorovaikutteiseksi näkymäksi.

import { PAIRINGS, findPairing, partnersOf } from "./pairings.js";

const HOST_DIR = new URL("./", import.meta.url).href;
// GitHub Pages palvelee tämän tiedoston suoraan projektin alipolusta
// /nordic-data-benchmark/, joten emme saa nousta yhtä hakemistoa ylemmäs.
const SITE_BASE = HOST_DIR;
const PLUGINS_BASE = new URL("plugins/", SITE_BASE).href;
const DATA_BASE_DEFAULT = new URL("data/views/", SITE_BASE).href;
const STORAGE_KEY = "vsignal.workspace.v2";

const uniq = (a) => [...new Set(a.filter(Boolean))];
const escapeHtml = (s) => String(s).replace(/[&<>"']/g,
  (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
const errorText = (e) => e?.stack || e?.message || String(e || "Tuntematon virhe");

// --- Data loader -------------------------------------------------------------
function createDataLoader(baseUrl, extraBaseUrls = []) {
  const cache = new Map();
  const baseUrls = uniq([baseUrl, ...extraBaseUrls]).map((u) => u.endsWith("/") ? u : u + "/");
  return {
    async load(filename) {
      const key = baseUrls.join("|") + "::" + filename;
      if (cache.has(key)) return cache.get(key);
      const p = (async () => {
        const errs = [];
        for (const base of baseUrls) {
          const url = new URL(filename, base).href;
          try {
            const r = await fetch(url, { cache: "no-cache" });
            if (!r.ok) throw new Error("HTTP " + r.status);
            const ct = r.headers.get("content-type") || "";
            return ct.includes("json") || filename.endsWith(".json") ? r.json() : r.text();
          } catch (e) { errs.push(`${url} → ${e?.message || e}`); }
        }
        throw new Error(`Datan lataus epäonnistui (${filename}): ${errs.join(" | ")}`);
      })();
      cache.set(key, p);
      return p;
    },
  };
}

// --- Bus ---------------------------------------------------------------------
function createBus() {
  const channels = new Map();
  const state = new Map();
  function on(channel, fn) {
    if (!channels.has(channel)) channels.set(channel, new Set());
    channels.get(channel).add(fn);
    if ((channel.startsWith("selection.") || channel.startsWith("filter.")) && state.has(channel)) {
      try { fn(state.get(channel), { sticky: true }); } catch (e) { console.error(e); }
    }
    return () => channels.get(channel)?.delete(fn);
  }
  function emit(channel, value, meta = {}) {
    if (channel.startsWith("selection.") || channel.startsWith("filter.")) state.set(channel, value);
    const subs = channels.get(channel);
    if (subs) for (const fn of subs) { try { fn(value, meta); } catch (e) { console.error(e); } }
    const all = channels.get("*");
    if (all) for (const fn of all) { try { fn({ channel, value, meta }); } catch (e) { console.error(e); } }
  }
  return { on, emit, get: (c) => state.get(c), snapshot: () => Object.fromEntries(state) };
}

// --- Registry ----------------------------------------------------------------
async function loadRegistry() {
  const r = await fetch(PLUGINS_BASE + "index.json", { cache: "no-cache" });
  if (!r.ok) throw new Error("plugins/index.json puuttuu");
  const reg = await r.json();
  const locationRoot = new URL("/", location.href).href;
  const dataDir = reg.dataDir
    ? (reg.dataDir.startsWith("/")
        ? new URL(reg.dataDir.replace(/^\//, ""), locationRoot).href
        : new URL(reg.dataDir, SITE_BASE).href)
    : DATA_BASE_DEFAULT;
  const fallbackDataDirs = uniq([
    DATA_BASE_DEFAULT,
    new URL("data/views/", SITE_BASE).href,
    new URL("public/data/views/", SITE_BASE).href,
    new URL("data/views/", locationRoot).href,
    new URL("public/data/views/", locationRoot).href,
  ]).filter((u) => u !== dataDir);
  return { ...reg, dataDir, fallbackDataDirs };
}

const moduleCache = new Map();
function loadModule(manifest) {
  if (!moduleCache.has(manifest.id)) {
    moduleCache.set(manifest.id, import(/* @vite-ignore */ PLUGINS_BASE + manifest.file));
  }
  return moduleCache.get(manifest.id);
}

// --- Globaali tila -----------------------------------------------------------
const bus = createBus();
let registry = null;
let dataLoader = null;
// Työpöytä on lista pluginId:itä (max 4). Layout johdetaan automaattisesti.
const state = loadState() || { panes: [] };
if (!Array.isArray(state.panes)) state.panes = [];
// mounted: container-element → { id, unmount }
const mounted = new Map();

function loadState() {
  try {
    const hash = location.hash.startsWith("#ws=") ? decodeURIComponent(location.hash.slice(4)) : null;
    if (hash) return JSON.parse(hash);
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    location.replace("#ws=" + encodeURIComponent(JSON.stringify(state)));
  } catch {}
}

// --- Core api ----------------------------------------------------------------
function buildCore(pluginId) {
  return {
    pluginId,
    data: dataLoader,
    bus: {
      on: (ch, fn) => bus.on(ch, fn),
      emit: (ch, val) => bus.emit(ch, val, { source: pluginId }),
      get: (ch) => bus.get(ch),
    },
    log: (lvl, msg, ...rest) => console[lvl === "error" ? "error" : lvl === "warn" ? "warn" : "log"](`[${pluginId}]`, msg, ...rest),
  };
}

// --- DOM ---------------------------------------------------------------------
const libraryList = document.getElementById("library-list");
const workspaceEl = document.getElementById("workspace");
const statusEl = document.getElementById("status");
const busStateEl = document.getElementById("bus-state");

// Piilota vanha layout-switch — layout on nyt automaattinen
const layoutSwitch = document.querySelector(".layout-switch");
if (layoutSwitch) layoutSwitch.style.display = "none";

// --- Kirjasto ----------------------------------------------------------------
function renderLibrary() {
  libraryList.innerHTML = "";

  // Kun yksi moduuli on jo paneelissa (ja vain yksi), korosta sen parit
  const anchors = state.panes.filter(Boolean);
  const highlightSet = new Set();
  let anchorMode = false;
  if (anchors.length === 1) {
    anchorMode = true;
    for (const id of partnersOf(anchors[0])) highlightSet.add(id);
  }

  for (const m of registry.plugins) {
    const li = document.createElement("li");
    li.draggable = true;
    li.dataset.pluginId = m.id;
    const isAnchor = anchors.includes(m.id);
    const isPair = highlightSet.has(m.id);
    if (isAnchor) li.classList.add("is-active");
    if (anchorMode && isPair) li.classList.add("is-pair");
    if (anchorMode && !isPair && !isAnchor) li.classList.add("is-dim");

    const badge = isAnchor
      ? `<span class="lib-badge active">aktiivinen</span>`
      : (anchorMode && isPair ? `<span class="lib-badge pair">muodostaa parin</span>` : "");

    li.innerHTML = `<div class="title">${escapeHtml(m.title)} ${badge}</div>
      <div class="id">${escapeHtml(m.id)}${m.tags ? " · " + m.tags.map(escapeHtml).join(", ") : ""}</div>`;

    li.addEventListener("dragstart", (ev) => {
      li.classList.add("dragging");
      ev.dataTransfer.effectAllowed = "copy";
      ev.dataTransfer.setData("application/x-vsignal-plugin", m.id);
      ev.dataTransfer.setData("text/plain", m.id);
    });
    li.addEventListener("dragend", () => li.classList.remove("dragging"));
    // Tupla-klikkaus = lisää työpöydälle
    li.addEventListener("dblclick", () => addPlugin(m.id));
    libraryList.appendChild(li);
  }
}

function renderBusState() {
  const snap = bus.snapshot();
  const keys = Object.keys(snap);
  busStateEl.textContent = keys.length === 0 ? "(ei valintoja)"
    : keys.map((k) => `${k}: ${JSON.stringify(snap[k])}`).join("\n");
}
bus.on("*", renderBusState);

// --- Työpöydän älykäs renderöinti -------------------------------------------
function unmountAll() {
  for (const [, m] of mounted) { try { m.unmount?.(); } catch {} }
  mounted.clear();
}

function renderWorkspace() {
  unmountAll();
  workspaceEl.innerHTML = "";

  const panes = state.panes.filter(Boolean);
  const n = panes.length;

  // Tila: tyhjä työpöytä → drop-zone
  if (n === 0) {
    workspaceEl.dataset.layout = "empty";
    const dz = makeDropZone({
      title: "Aloita raahaamalla moduuli vasemmalta",
      hint: "Yksi moduuli näyttää sisältönsä. Kaksi yhteensopivaa moduulia muodostavat yhdistelmänäkymän.",
    });
    workspaceEl.appendChild(dz);
    renderLibrary();
    return;
  }

  // Tila: kaksi moduulia + niillä on määritelty pari → COMPOUND VIEW
  if (n === 2) {
    const pairing = findPairing(panes[0], panes[1]);
    if (pairing) {
      workspaceEl.dataset.layout = "compound";
      const compound = buildCompoundView(panes[0], panes[1], pairing);
      workspaceEl.appendChild(compound);
      renderLibrary();
      return;
    }
  }

  // Muutoin: rinnakkainen layout (1 / 2 / 3 / 4 = 2x2)
  workspaceEl.dataset.layout = n === 1 ? "1" : n === 2 ? "2" : n === 3 ? "3" : "2x2";
  panes.forEach((pluginId, idx) => {
    workspaceEl.appendChild(buildPane(pluginId, idx, panes));
  });

  // Lisää aina ”+” drop-slot jos alle 4
  if (n < 4) {
    workspaceEl.appendChild(makeAddSlot());
  }
  renderLibrary();
}

function buildPane(pluginId, idx, allPanes) {
  const manifest = registry.plugins.find((p) => p.id === pluginId);
  const pane = document.createElement("div");
  pane.className = "pane";
  pane.dataset.pane = String(idx);

  // Vihjeotsikko: jos toiselle moduulille on olemassa pari → näytä se
  let hint = "";
  if (allPanes.length === 1) {
    const partners = [...partnersOf(pluginId)];
    if (partners.length) {
      hint = `<span class="pane-hint">↔ Raahaa pariksi: ${partners.map((p) => {
        const m = registry.plugins.find((x) => x.id === p);
        return escapeHtml(m?.title || p);
      }).slice(0, 3).join(" · ")}</span>`;
    }
  }

  const header = document.createElement("div");
  header.className = "pane-header";
  header.innerHTML = `
    <span class="pane-handle" draggable="true" title="Raahaa toiseen lohkoon">⋮⋮</span>
    <span class="pane-title">${escapeHtml(manifest?.title || pluginId)}</span>
    ${hint}
    <span class="pane-actions">
      <button data-act="clear" title="Poista">✕</button>
    </span>`;
  pane.appendChild(header);

  const body = document.createElement("div");
  body.className = "pane-body";
  pane.appendChild(body);

  // Drop: korvaa tämän paikan plugini
  attachDropTarget(pane, (newId, fromIdx) => {
    if (fromIdx != null) swapPanes(fromIdx, idx);
    else replacePlugin(idx, newId);
  });
  // Pane-handle drag (siirto)
  const handle = header.querySelector(".pane-handle");
  handle.addEventListener("dragstart", (ev) => {
    ev.dataTransfer.effectAllowed = "move";
    ev.dataTransfer.setData("application/x-vsignal-pane", String(idx));
    ev.dataTransfer.setData("text/plain", pluginId);
  });
  header.querySelector('[data-act="clear"]').addEventListener("click", () => removePlugin(idx));

  mountPlugin(pluginId, body);
  return pane;
}

function buildCompoundView(idA, idB, pairing) {
  const wrap = document.createElement("div");
  wrap.className = "compound";

  const mA = registry.plugins.find((p) => p.id === idA);
  const mB = registry.plugins.find((p) => p.id === idB);

  wrap.innerHTML = `
    <div class="compound-header">
      <div class="compound-kicker">VUOROVAIKUTUSNÄKYMÄ · ${escapeHtml(idA)} ↔ ${escapeHtml(idB)}</div>
      <div class="compound-title">${escapeHtml(pairing.title)}</div>
      <div class="compound-synth">${escapeHtml(pairing.synthesis)}</div>
      <div class="compound-bridge">Jaettu kanavat: ${pairing.bridge.map((c) => `<code>${escapeHtml(c)}</code>`).join(" · ")}</div>
      <div class="compound-actions">
        <button class="ghost" data-act="swap" title="Vaihda järjestys">⇄ vaihda</button>
        <button class="ghost" data-act="split" title="Pura yhdistelmä">⊟ pura</button>
        <button class="ghost" data-act="clear-b" title="Poista oikea">✕ ${escapeHtml(mB?.title?.slice(0, 24) || idB)}</button>
      </div>
    </div>
    <div class="compound-grid">
      <section class="compound-cell">
        <div class="cell-label">A · ${escapeHtml(mA?.title || idA)}</div>
        <div class="cell-body" data-cell="a"></div>
      </section>
      <section class="compound-cell">
        <div class="cell-label">B · ${escapeHtml(mB?.title || idB)}</div>
        <div class="cell-body" data-cell="b"></div>
      </section>
    </div>
  `;

  wrap.querySelector('[data-act="swap"]').addEventListener("click", () => {
    state.panes = [idB, idA];
    saveState(); renderWorkspace();
  });
  wrap.querySelector('[data-act="split"]').addEventListener("click", () => {
    // Pura → poista jälkimmäinen jotta ne näkyvät erikseen ilman yhdistelmää.
    // Käytännössä: pidä molemmat mutta merkitse "split-mode".
    state.split = true;
    saveState(); renderSplit();
  });
  wrap.querySelector('[data-act="clear-b"]').addEventListener("click", () => {
    state.panes = [idA]; saveState(); renderWorkspace();
  });

  mountPlugin(idA, wrap.querySelector('[data-cell="a"]'));
  mountPlugin(idB, wrap.querySelector('[data-cell="b"]'));
  return wrap;
}

function renderSplit() {
  // Vain tämän kerran: näytä kahtena erillisenä paneelina vaikka pari löytyisi
  unmountAll();
  workspaceEl.innerHTML = "";
  workspaceEl.dataset.layout = "2";
  const panes = state.panes.filter(Boolean);
  panes.forEach((id, idx) => workspaceEl.appendChild(buildPane(id, idx, panes)));
  // Palaa-painike
  const back = document.createElement("button");
  back.className = "ghost split-back";
  back.textContent = "↺ palaa yhdistelmänäkymään";
  back.addEventListener("click", () => { state.split = false; saveState(); renderWorkspace(); });
  workspaceEl.appendChild(back);
  renderLibrary();
}

function makeDropZone({ title, hint }) {
  const dz = document.createElement("div");
  dz.className = "dropzone";
  dz.innerHTML = `<div class="dz-title">${escapeHtml(title)}</div><div class="dz-hint">${escapeHtml(hint)}</div>`;
  attachDropTarget(dz, (id) => addPlugin(id));
  return dz;
}

function makeAddSlot() {
  const s = document.createElement("div");
  s.className = "add-slot";
  s.innerHTML = `<div>+ raahaa lisää moduuli</div>`;
  attachDropTarget(s, (id) => addPlugin(id));
  return s;
}

function attachDropTarget(el, onDrop) {
  el.addEventListener("dragover", (ev) => {
    if (ev.dataTransfer.types.includes("application/x-vsignal-plugin") ||
        ev.dataTransfer.types.includes("application/x-vsignal-pane")) {
      ev.preventDefault();
      ev.dataTransfer.dropEffect = "move";
      el.classList.add("drop-target");
    }
  });
  el.addEventListener("dragleave", () => el.classList.remove("drop-target"));
  el.addEventListener("drop", (ev) => {
    ev.preventDefault();
    el.classList.remove("drop-target");
    const fromPane = ev.dataTransfer.getData("application/x-vsignal-pane");
    const newId = ev.dataTransfer.getData("application/x-vsignal-plugin");
    if (fromPane !== "") onDrop(null, parseInt(fromPane, 10));
    else if (newId) onDrop(newId, null);
  });
}

async function mountPlugin(pluginId, container) {
  const manifest = registry.plugins.find((p) => p.id === pluginId);
  if (!manifest) {
    container.innerHTML = `<div class="error">Tuntematon moduuli: ${escapeHtml(pluginId)}</div>`;
    return;
  }
  container.innerHTML = "";
  const inner = document.createElement("div");
  container.appendChild(inner);

  // Sieppaa myös plugineille ohjatut virheet (data.load 404 jne.)
  // ja tarkista että moduuli sai jotain renderöityä — muuten näytä fallback.
  const failed = [];
  const origLoad = dataLoader.load.bind(dataLoader);
  const wrappedCore = buildCore(pluginId);
  wrappedCore.data = {
    load: (filename) => origLoad(filename).catch((e) => {
      failed.push({ filename, message: e?.message || String(e) });
      throw e;
    }),
  };

  try {
    const mod = await loadModule(manifest);
    const pluginObj = mod.default ?? mod;
    const result = pluginObj.mount.length >= 2
      ? pluginObj.mount(inner, wrappedCore)
      : pluginObj.mount({ container: inner, slot: "pane", core: wrappedCore, manifest });
    await result;
    mounted.set(container, {
      id: pluginId,
      unmount: () => {
        try {
          if (pluginObj.unmount?.length >= 1) pluginObj.unmount(inner);
          else pluginObj.unmount?.({ container: inner });
        } catch (e) { console.error(e); }
      },
    });
    // Jos moduuli nielaisi virheen mutta data 404:si → näytä päällikerros
    if (failed.length) {
      const overlay = document.createElement("div");
      overlay.className = "data-missing";
      overlay.innerHTML = `
        <div class="dm-title">Datatiedostoja puuttuu</div>
        <div class="dm-hint">Moduuli <code>${escapeHtml(pluginId)}</code> tarvitsee tiedostoja kansiosta <code>public/data/views/</code>:</div>
        <ul class="dm-list">${failed.map((f) => `<li><code>${escapeHtml(f.filename)}</code></li>`).join("")}</ul>
        <div class="dm-foot">Vie ne <code>public/data/views/</code>-kansioon ja päivitä sivu.</div>`;
      container.appendChild(overlay);
    }
  } catch (err) {
    console.error("[host] mount epäonnistui", err);
    if (failed.length) {
      container.innerHTML = `<div class="data-missing">
        <div class="dm-title">Datatiedostoja puuttuu</div>
        <div class="dm-hint">Moduuli <code>${escapeHtml(pluginId)}</code> tarvitsee tiedostoja kansiosta <code>public/data/views/</code>:</div>
        <ul class="dm-list">${failed.map((f) => `<li><code>${escapeHtml(f.filename)}</code> — ${escapeHtml(f.message)}</li>`).join("")}</ul>
      </div>`;
    } else {
      container.innerHTML = `<div class="error">Lisäosa "${escapeHtml(pluginId)}" epäonnistui: ${escapeHtml(errorText(err))}</div>`;
    }
  }
}

// --- Mutaatiot --------------------------------------------------------------
function addPlugin(id) {
  // Estä duplikaatit, salli max 4
  if (state.panes.includes(id)) return;
  if (state.panes.length >= 4) state.panes.pop();
  state.panes.push(id);
  state.split = false;
  saveState(); renderWorkspace();
}
function replacePlugin(idx, id) {
  if (state.panes.includes(id) && state.panes[idx] !== id) {
    // jos jo olemassa toisessa kohdassa, swappaa
    const other = state.panes.indexOf(id);
    [state.panes[idx], state.panes[other]] = [state.panes[other], state.panes[idx]];
  } else {
    state.panes[idx] = id;
  }
  state.split = false;
  saveState(); renderWorkspace();
}
function removePlugin(idx) {
  state.panes.splice(idx, 1);
  state.split = false;
  saveState(); renderWorkspace();
}
function swapPanes(a, b) {
  if (a === b) return;
  [state.panes[a], state.panes[b]] = [state.panes[b], state.panes[a]];
  saveState(); renderWorkspace();
}

// --- Boot --------------------------------------------------------------------
(async () => {
  try {
    registry = await loadRegistry();
    dataLoader = createDataLoader(registry.dataDir, registry.fallbackDataDirs);
    statusEl.textContent = `${registry.plugins.length} moduulia · ${PAIRINGS.length} määriteltyä paria`;
    document.getElementById("reset-btn").addEventListener("click", () => {
      state.panes = []; state.split = false;
      saveState(); renderWorkspace();
    });
    renderWorkspace();
    renderBusState();
  } catch (err) {
    console.error("[host] käynnistys epäonnistui", err);
    statusEl.textContent = "Virhe: " + errorText(err);
    statusEl.style.color = "var(--danger)";
  }
})();
