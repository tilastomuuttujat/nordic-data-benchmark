# Plugin-ydin: drop-in lisäosat ilman ydinkoodin muokkausta

## Tavoite

Lisäosa asennetaan **kahdella askeleella**:
1. Pudota kansio `public/plugins/<id>/` (manifest + index.js + styles.css + data)
2. Lisää yksi rivi `public/plugins/index.json` -registryyn

Ei buildiä, ei ydinkoodin diffiä, ei reititysmuutoksia. Lisäosat ladataan natiivilla dynaamisella `import()`-kutsulla selaimessa.

---

## Arkkitehtuuri

```text
┌─────────────────────────────────────────────────┐
│  TanStack Start (ohut kuori: SSR + reititys)    │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  PluginHost (client-only)                │  │
│  │   ├─ Registry  (lukee index.json)        │  │
│  │   ├─ Loader    (dynamic import + CSS)    │  │
│  │   ├─ EventBus  (pub/sub, löysä kytkentä) │  │
│  │   ├─ DataLoader(fetch + cache + Zod)     │  │
│  │   └─ SlotRenderer (nimetyt kiinnityspist.)│  │
│  └──────────────────────────────────────────┘  │
│                      ▲                          │
│       mount({container, core, slot})            │
│                      │                          │
│  public/plugins/<id>/index.js  (ESM)            │
│  public/plugins/<id>/styles.css                 │
│  public/plugins/<id>/manifest.json              │
│  public/plugins/<id>/data/*.json                │
└─────────────────────────────────────────────────┘
```

Lisäosat sijaitsevat `public/`-kansiossa → selain hakee ne suoraan URL:lla, eivät kulje Viten läpi → eivät vaadi buildiä.

---

## Mitä rakennetaan

### 1. Ydin (`src/core/plugin-host/`)

- **`registry.ts`** — hakee `/plugins/index.json`, palauttaa listan manifesteja
- **`loader.ts`** — `import(/* @vite-ignore */ '/plugins/<id>/index.js')`, injektoi `<link rel="stylesheet">` headiin
- **`event-bus.ts`** — minimalistinen pub/sub: `on(event, fn)`, `off`, `emit`
- **`data-loader.ts`** — fetch + in-memory cache + valinnainen Zod-validaatio per URL
- **`slot-renderer.tsx`** — React-komponentti `<Slot name="..." />` joka renderöi `<div>`-kontit ja kutsuu `plugin.mount()` jokaiselle siihen slottiin ilmoittautuneelle pluginille
- **`types.ts`** — `PluginManifest`, `PluginModule`, `CoreApi` -tyypit

### 2. Manifest-muoto

```json
{
  "id": "demo-counter",
  "version": "1.0.0",
  "title": "Demolaskuri",
  "slots": ["dashboard.widgets"],
  "entry": "./index.js",
  "styles": "./styles.css",
  "permissions": ["events:emit", "data:read"]
}
```

### 3. Plugin-rajapinta

```js
// public/plugins/demo-counter/index.js
export default {
  async mount({ container, slot, core }) {
    container.innerHTML = `<div class="plugin-demo-counter">...</div>`;
    core.events.on('calc.changed', payload => { /* reagoi */ });
  },
  unmount({ container }) { container.innerHTML = ''; }
}
```

`core` -objekti, jonka ydin antaa pluginille:
- `core.events` — event bus
- `core.data.load(url, schema?)` — välimuistitettu fetch
- `core.theme` — CSS-muuttujien luku (vain luku)
- `core.log(level, msg)` — ydin-logger

### 4. Reitti & demo-sivu

- `src/routes/index.tsx` — korvaa placeholderin: yksinkertainen "hub"-sivu jossa on muutama nimetty slot:
  - `<Slot name="dashboard.widgets" />`
  - `<Slot name="sidebar.menu" />`
- Sivu lataa registryn `useEffect`issä ja renderöi pluginit slot-kohtaisesti
- `errorComponent` + `notFoundComponent` reitille

### 5. Kaksi näytelisäosaa (todistaa eristyksen)

- **`public/plugins/demo-counter/`** — D3-pohjainen pylväskaavio, lähettää `calc.changed` -tapahtuman kun käyttäjä klikkaa
- **`public/plugins/demo-listener/`** — kuuntelee `calc.changed` ja päivittää lukunsa

→ Toinen plugin voidaan poistaa `index.json`:sta ja sovellus toimii silti. Kolmannen lisääminen ei vaadi minkään olemassa olevan tiedoston muokkausta paitsi `index.json` -listan.

### 6. Dokumentaatio

- `public/plugins/README.md` — miten oma plugin tehdään (3 minuutin ohje + manifest-skeema)

---

## Tekniset yksityiskohdat

- **Ei build-vaihetta plugineille**: tiedostot palvellaan staattisesti `public/`-kansiosta → natiivi ESM, ei TypeScriptiä plugineissa (kommenteilla kuvattu API riittää; pluginin tekijä saa halutessaan kirjoittaa TS:llä ja kääntää itse)
- **`@vite-ignore`-kommentti** dynamic importissa, ettei Vite yritä bundlettaa pluginia
- **CSS-eristys**: nimiavaruusprefiksi `.plugin-<id>` -konventio, dokumentoidaan README:ssä. Ydin ei valvo, mutta D3 ja teema-CSS-muuttujat toimivat ilman Shadow DOMia.
- **SSR-turva**: PluginHost on client-only (`useEffect`); reitti renderöi tyhjät slot-kontit serverillä, pluginit hydraatuvat selaimessa. Ei ole "window is not defined" -ongelmia.
- **Tyypit**: `CoreApi`-tyyppi viedään myös `public/plugins/types.d.ts`-tiedostoon, jota plugin-tekijät voivat halutessaan käyttää.
- **Virheenhallinta**: yhden pluginin lataus- tai mount-virhe ei kaada muita; virhe lokitetaan ja kyseinen slot-kohta näyttää huomautuksen.
- **Tapahtumaväylän tyypit**: avoin (`emit(name: string, payload: unknown)`) — pluginit dokumentoivat tukemansa tapahtumat omissa README:issään. Ydin ei pakota skeemaa, mutta tarjoaa valinnaisen Zod-validaattorin `events.defineSchema(name, schema)` -metodilla.

---

## Hyväksymiskriteerit

1. Kun molemmat demoplugarit on registryssä, etusivu näyttää molemmat ja klikkaus toisessa päivittää toisen luvun (event bus toimii).
2. Kun `demo-listener` poistetaan registrystä, sovellus toimii ilman virheitä; `demo-counter` näkyy edelleen.
3. Uuden pluginin lisääminen vaatii vain: uusi kansio `public/plugins/`-alle + yksi rivi `index.json`-tiedostoon. Mitään ydintiedostoa (`src/`-puolella) ei muokata.
4. `public/plugins/README.md` sisältää copy-paste-mallin uuden pluginin tekemiseen.
