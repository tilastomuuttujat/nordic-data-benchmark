// Demo plugin: D3-tyylinen pylväskaavio (vanilla DOM, ei riippuvuuksia).
// Lähettää 'calc.changed' tapahtuman event busiin.

export default {
  async mount({ container, core, manifest }) {
    const state = { values: [3, 7, 4, 9, 5, 8] };

    container.innerHTML = `
      <div class="plugin-demo-counter">
        <h3>${manifest.title}</h3>
        <div class="pdc-bars" role="img" aria-label="Pylväskaavio"></div>
        <div class="pdc-meta">Summa: <span data-sum>0</span></div>
        <button type="button" data-action="randomize">Päivitä arvot</button>
      </div>
    `;

    const bars = container.querySelector(".pdc-bars");
    const sumEl = container.querySelector("[data-sum]");
    const btn = container.querySelector('[data-action="randomize"]');

    function render() {
      const max = Math.max(...state.values, 1);
      bars.innerHTML = state.values
        .map((v) => `<div class="pdc-bar" style="height:${(v / max) * 100}%"></div>`)
        .join("");
      const sum = state.values.reduce((a, b) => a + b, 0);
      sumEl.textContent = String(sum);
      core.events.emit("calc.changed", { source: manifest.id, sum, values: state.values });
    }

    btn.addEventListener("click", () => {
      state.values = state.values.map(() => Math.round(Math.random() * 10) + 1);
      render();
    });

    render();
    core.log("info", "demo-counter mounted");
  },
  unmount({ container }) {
    container.innerHTML = "";
  },
};
