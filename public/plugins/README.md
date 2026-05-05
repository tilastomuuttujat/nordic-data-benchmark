# Lisäosien tekeminen

Lisäosa on itsenäinen kansio `public/plugins/<id>/`-alla. Asentaminen vaatii
**vain** kansion luonnin ja yhden rivin lisäämisen tiedostoon
`public/plugins/index.json`. Mitään ydinkoodia (`src/`-puolella) ei tarvitse muokata.

## Rakenne

```
public/plugins/<id>/
  manifest.json   ← metadata
  index.js        ← ESM-moduuli (default export)
  styles.css      ← valinnainen, ladataan automaattisesti
  data/...        ← oma data, hae core.data.load('/plugins/<id>/data/x.json')
```

## manifest.json

```json
{
  "id": "oma-plugin",
  "version": "1.0.0",
  "title": "Oma plugin",
  "slots": ["dashboard.widgets"],
  "entry": "./index.js",
  "styles": "./styles.css"
}
```

Käytettävissä olevat slot-nimet: katso etusivun `<Slot name="…" />` -kutsut.

## index.js

```js
export default {
  async mount({ container, slot, core, manifest }) {
    container.innerHTML = `<div class="plugin-oma-plugin">Hei!</div>`;
    core.events.on("calc.changed", (p) => console.log(p));
  },
  unmount({ container }) {
    container.innerHTML = "";
  },
};
```

## core-API

- `core.events.on(name, fn) → off()` · `core.events.emit(name, payload)`
- `core.data.load(url, validate?)` — välimuistitettu fetch + JSON
- `core.theme.get('--primary')` — ydin-CSS-muuttujan luku
- `core.log('info'|'warn'|'error', msg, ...)`

## CSS-eristys

Käytä prefiksiä `.plugin-<id>` kaikissa luokissa. Tyylit ladataan globaalisti,
joten konventio on ainoa eristys. Voit halutessasi käyttää Shadow DOMia mount-funktiossa.

## Aktivointi

Lisää rivi `public/plugins/index.json`-tiedostoon:

```json
[
  { "dir": "demo-counter" },
  { "dir": "oma-plugin" }
]
```

Lataa sivu uudelleen — plugin näkyy slotissaan.
