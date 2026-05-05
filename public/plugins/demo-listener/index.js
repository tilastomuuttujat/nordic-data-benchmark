// Demo plugin: kuuntelee 'calc.changed' eventiä ja näyttää viimeisimmän summan.

export default {
  async mount({ container, core, manifest, slot }) {
    container.innerHTML = `
      <div class="plugin-demo-listener">
        <h3>${manifest.title}</h3>
        <div class="pdl-value" data-value>—</div>
        <div class="pdl-meta">Slot: ${slot} · Odottaa tapahtumaa "calc.changed"…</div>
      </div>
    `;
    const valueEl = container.querySelector("[data-value]");
    const metaEl = container.querySelector(".pdl-meta");

    const off = core.events.on("calc.changed", (payload) => {
      const p = payload || {};
      valueEl.textContent = String(p.sum ?? "—");
      metaEl.textContent = `Lähde: ${p.source ?? "?"} · ${new Date().toLocaleTimeString()}`;
    });

    container._cleanup = off;
    core.log("info", "demo-listener mounted in slot " + slot);
  },
  unmount({ container }) {
    if (typeof container._cleanup === "function") container._cleanup();
    container.innerHTML = "";
  },
};
