// Kevyt staattinen plugin-host. Toimii GitHub Pagesilla (vain staattisia tiedostoja).
// Käyttää suhteellisia polkuja, joten /<repo>/-alipolut toimivat ilman konfigurointia.

// GitHub Pagesilla index.html on juuressa ja pluginit ./plugins/ alla.
// Lokaalisti (Lovable preview) standalone on /standalone/ ja pluginit /plugins/ → ../plugins/.
const PLUGINS_BASE = location.pathname.includes("/standalone/") ? "../plugins/" : "./plugins/";

// --- Event bus ---------------------------------------------------------------
function createEventBus() {
  const map = new Map();
  return {
    on(event, fn) {
      if (!map.has(event)) map.set(event, new Set());
      map.get(event).add(fn);
      return () => map.get(event)?.delete(fn);
    },
    off(event, fn) { map.get(event)?.delete(fn); },
    emit(event, payload) {
      const set = map.get(event);
      if (!set) return;
      for (const fn of set) {
        try { fn(payload); } catch (e) { console.error("[bus]", event, e); }
      }
    },
  };
}

// --- Data loader -------------------------------------------------------------
function createDataLoader() {
  const cache = new Map();
  return {
    async load(url, validate) {
      if (cache.has(url)) return cache.get(url);
      const p = fetch(url, { cache: "no-cache" }).then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
        const ct = r.headers.get("content-type") || "";
        const data = ct.includes("json") ? await r.json() : await r.text();
        return validate ? validate(data) : data;
      });
      cache.set(url, p);
      return p;
    },
    invalidate(url) { url ? cache.delete(url) : cache.clear(); },
  };
}

// --- Registry ----------------------------------------------------------------
async function loadRegistry() {
  const list = await fetch(`${PLUGINS_BASE}index.json`, { cache: "no-cache" })
    .then((r) => { if (!r.ok) throw new Error("index.json puuttuu"); return r.json(); });
  const manifests = [];
  for (const entry of list) {
    const dir = `${PLUGINS_BASE}${entry.dir}/`;
    const m = await fetch(`${dir}manifest.json`, { cache: "no-cache" })
      .then((r) => { if (!r.ok) throw new Error(`manifest puuttuu: ${entry.dir}`); return r.json(); });
    m._dir = dir;
    m._entryUrl = new URL(m.entry, new URL(dir, location.href)).href;
    m._stylesUrl = m.styles ? new URL(m.styles, new URL(dir, location.href)).href : null;
    manifests.push(m);
  }
  return manifests;
}

// --- CSS / module loaders ----------------------------------------------------
const styleInjected = new Set();
function injectStyles(m) {
  if (!m._stylesUrl || styleInjected.has(m.id)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet"; link.href = m._stylesUrl;
  link.dataset.pluginId = m.id;
  document.head.appendChild(link);
  styleInjected.add(m.id);
}
const moduleCache = new Map();
function loadModule(m) {
  let p = moduleCache.get(m.id);
  if (!p) { p = import(m._entryUrl); moduleCache.set(m.id, p); }
  return p;
}

// --- Core api ----------------------------------------------------------------
const events = createEventBus();
const data = createDataLoader();
function buildCore(pluginId) {
  return {
    pluginId,
    events,
    data,
    theme: { get: (cssVar) => getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim() },
    log: (level, msg, ...rest) => console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](`[${pluginId}]`, msg, ...rest),
  };
}

// --- UI ----------------------------------------------------------------------
const statusEl = document.getElementById("status");
const menuList = document.getElementById("menu-list");
const stage = document.getElementById("stage");

let manifests = [];
let activeId = null;
let currentUnmount = null;

function renderMenu() {
  menuList.innerHTML = "";
  if (manifests.length === 0) {
    menuList.innerHTML = `<li class="empty" style="padding:8px">Ei lisäosia.</li>`;
    return;
  }
  for (const m of manifests) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.className = m.id === activeId ? "active" : "";
    btn.innerHTML = `<div class="title">${escapeHtml(m.title)}</div>
      <div class="id">v${escapeHtml(m.version)} · ${escapeHtml(m.id)}</div>`;
    btn.addEventListener("click", () => mountPlugin(m.id));
    li.appendChild(btn);
    menuList.appendChild(li);
  }
}

async function mountPlugin(id) {
  const m = manifests.find((x) => x.id === id);
  if (!m) return;
  activeId = id;
  renderMenu();

  // unmount previous
  try { currentUnmount?.(); } catch (e) { console.error(e); }
  currentUnmount = null;
  stage.innerHTML = "";

  const container = document.createElement("div");
  stage.appendChild(container);

  try {
    injectStyles(m);
    const mod = await loadModule(m);
    const core = buildCore(m.id);
    await mod.default.mount({ container, slot: "main", core, manifest: m });
    currentUnmount = () => mod.default.unmount?.({ container });
  } catch (err) {
    console.error(err);
    stage.innerHTML = `<div class="error">Lisäosa "${escapeHtml(id)}" epäonnistui: ${escapeHtml(String(err?.message || err))}</div>`;
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// --- Boot --------------------------------------------------------------------
(async () => {
  try {
    manifests = await loadRegistry();
    statusEl.textContent = `${manifests.length} lisäosaa`;
    renderMenu();
    if (manifests[0]) mountPlugin(manifests[0].id);
  } catch (err) {
    console.error(err);
    statusEl.textContent = `Virhe: ${err.message}`;
    statusEl.style.color = "var(--danger)";
  }
})();
