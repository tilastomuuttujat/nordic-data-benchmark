// public/plugins/moduli018.js
// Plugin: Pohjoismaat — Hyvinvointijärjestelmävertailu
// Generoitu pohjoismaat_analyysi.html:stä build-moduli018.mjs:llä.
// CSS scopattu .plugin-moduli018 -juureen, DOM-haut kohdistuvat hostiin.
// Chart.js ladataan ESM CDN:ltä.

import Chart from "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/auto/+esm";

const ID = "moduli018";
const NS = "__mod018_";

const CSS = ".plugin-moduli018{\n    --fi: #1a4a8a;\n    --dk: #2d6a1f;\n    --no: #a04010;\n    --se: #5a4ab0;\n    --fi-light: #e8f0fb;\n    --dk-light: #e8f5e2;\n    --no-light: #faeee6;\n    --se-light: #eeebf9;\n    --bg: #f7f5f0;\n    --surface: #ffffff;\n    --border: #e2ddd6;\n    --text: #1a1814;\n    --muted: #6b6560;\n    --accent: #c8a84b;\n  }\n.plugin-moduli018 *, .plugin-moduli018 *::before, .plugin-moduli018 *::after{ box-sizing: border-box; margin: 0; padding: 0; }\n.plugin-moduli018{\n    font-family: 'IBM Plex Sans', sans-serif;\n    background: var(--bg);\n    color: var(--text);\n    min-height: 100vh;\n    font-size: 15px;\n    line-height: 1.6;\n  }\n.plugin-moduli018 header{\n    background: var(--text);\n    color: #f7f5f0;\n    padding: 3rem 3rem 2.5rem;\n    position: relative;\n    overflow: hidden;\n  }\n.plugin-moduli018 header::before{\n    content: '';\n    position: absolute;\n    top: -40px; right: -60px;\n    width: 320px; height: 320px;\n    border: 1px solid rgba(200,168,75,0.2);\n    border-radius: 50%;\n    pointer-events: none;\n  }\n.plugin-moduli018 header::after{\n    content: '';\n    position: absolute;\n    bottom: -80px; right: 60px;\n    width: 200px; height: 200px;\n    border: 1px solid rgba(200,168,75,0.12);\n    border-radius: 50%;\n    pointer-events: none;\n  }\n.plugin-moduli018 .header-eyebrow{\n    font-family: 'IBM Plex Mono', monospace;\n    font-size: 11px;\n    letter-spacing: 0.15em;\n    color: var(--accent);\n    text-transform: uppercase;\n    margin-bottom: 1rem;\n  }\n.plugin-moduli018 header h1{\n    font-family: 'Playfair Display', serif;\n    font-size: clamp(2rem, 4vw, 3.2rem);\n    font-weight: 700;\n    line-height: 1.15;\n    max-width: 700px;\n    margin-bottom: 1rem;\n  }\n.plugin-moduli018 header p{\n    font-size: 14px;\n    color: rgba(247,245,240,0.6);\n    max-width: 600px;\n    font-weight: 300;\n    line-height: 1.7;\n  }\n.plugin-moduli018 .header-meta{\n    display: flex;\n    gap: 2rem;\n    margin-top: 2rem;\n    flex-wrap: wrap;\n  }\n.plugin-moduli018 .meta-item{\n    display: flex;\n    flex-direction: column;\n    gap: 2px;\n  }\n.plugin-moduli018 .meta-label{\n    font-family: 'IBM Plex Mono', monospace;\n    font-size: 10px;\n    letter-spacing: 0.1em;\n    color: rgba(247,245,240,0.4);\n    text-transform: uppercase;\n  }\n.plugin-moduli018 .meta-val{\n    font-size: 13px;\n    color: rgba(247,245,240,0.85);\n  }\n.plugin-moduli018 .country-bar{\n    background: var(--surface);\n    border-bottom: 1px solid var(--border);\n    padding: 1rem 3rem;\n    display: flex;\n    gap: 2rem;\n    flex-wrap: wrap;\n    align-items: center;\n  }\n.plugin-moduli018 .country-pill{\n    display: flex;\n    align-items: center;\n    gap: 8px;\n    font-size: 13px;\n    font-weight: 500;\n  }\n.plugin-moduli018 .cpill-dot{\n    width: 10px; height: 10px;\n    border-radius: 50%;\n    flex-shrink: 0;\n  }\n.plugin-moduli018 main{\n    padding: 2.5rem 3rem;\n    max-width: 1200px;\n    margin: 0 auto;\n  }\n.plugin-moduli018 .tab-nav{\n    display: flex;\n    gap: 0;\n    border-bottom: 2px solid var(--border);\n    margin-bottom: 2rem;\n    overflow-x: auto;\n    -webkit-overflow-scrolling: touch;\n  }\n.plugin-moduli018 .tab-btn{\n    font-family: 'IBM Plex Sans', sans-serif;\n    font-size: 13px;\n    font-weight: 500;\n    padding: 0.75rem 1.25rem;\n    border: none;\n    background: transparent;\n    color: var(--muted);\n    cursor: pointer;\n    border-bottom: 2px solid transparent;\n    margin-bottom: -2px;\n    white-space: nowrap;\n    transition: color 0.2s, border-color 0.2s;\n    letter-spacing: 0.01em;\n  }\n.plugin-moduli018 .tab-btn:hover{ color: var(--text); }\n.plugin-moduli018 .tab-btn.active{\n    color: var(--text);\n    border-bottom-color: var(--accent);\n  }\n.plugin-moduli018 .panel{ display: none; }\n.plugin-moduli018 .panel.active{ display: block; }\n.plugin-moduli018 .section-label{\n    font-family: 'IBM Plex Mono', monospace;\n    font-size: 10px;\n    letter-spacing: 0.12em;\n    text-transform: uppercase;\n    color: var(--muted);\n    margin-bottom: 0.75rem;\n    margin-top: 1.75rem;\n  }\n.plugin-moduli018 .section-label:first-child{ margin-top: 0; }\n.plugin-moduli018 .kpi-grid{\n    display: grid;\n    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));\n    gap: 10px;\n    margin-bottom: 1.5rem;\n  }\n.plugin-moduli018 .kpi-card{\n    background: var(--surface);\n    border: 1px solid var(--border);\n    border-radius: 10px;\n    padding: 1rem 1.1rem;\n    position: relative;\n    overflow: hidden;\n  }\n.plugin-moduli018 .kpi-card::before{\n    content: '';\n    position: absolute;\n    left: 0; top: 0; bottom: 0;\n    width: 3px;\n    border-radius: 3px 0 0 3px;\n  }\n.plugin-moduli018 .kpi-card.fi::before{ background: var(--fi); }\n.plugin-moduli018 .kpi-card.dk::before{ background: var(--dk); }\n.plugin-moduli018 .kpi-card.no::before{ background: var(--no); }\n.plugin-moduli018 .kpi-card.se::before{ background: var(--se); }\n.plugin-moduli018 .kpi-label{ font-size: 11px; color: var(--muted); margin-bottom: 4px; }\n.plugin-moduli018 .kpi-val{ font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 600; }\n.plugin-moduli018 .kpi-sub{ font-size: 11px; color: var(--muted); margin-top: 2px; }\n.plugin-moduli018 .chart-wrap{\n    background: var(--surface);\n    border: 1px solid var(--border);\n    border-radius: 12px;\n    padding: 1.25rem 1.5rem 1rem;\n    margin-bottom: 1rem;\n  }\n.plugin-moduli018 .chart-title{\n    font-size: 13px;\n    font-weight: 500;\n    margin-bottom: 0.75rem;\n    color: var(--text);\n  }\n.plugin-moduli018 .chart-inner{ position: relative; width: 100%; }\n.plugin-moduli018 .chart-legend{\n    display: flex;\n    flex-wrap: wrap;\n    gap: 14px;\n    margin-top: 10px;\n    font-size: 12px;\n    color: var(--muted);\n  }\n.plugin-moduli018 .chart-legend span{\n    display: flex;\n    align-items: center;\n    gap: 5px;\n  }\n.plugin-moduli018 .leg-swatch{\n    display: inline-block;\n    width: 18px; height: 2.5px;\n    border-radius: 2px;\n    flex-shrink: 0;\n  }\n.plugin-moduli018 .grid-2{\n    display: grid;\n    grid-template-columns: 1fr 1fr;\n    gap: 12px;\n    margin-top: 1rem;\n  }\n@media(max-width:640px) {.plugin-moduli018 .grid-2{ grid-template-columns: 1fr; }}\n.plugin-moduli018 .insight{\n    background: var(--surface);\n    border: 1px solid var(--border);\n    border-radius: 10px;\n    padding: 1.1rem 1.25rem;\n  }\n.plugin-moduli018 .insight-num{\n    font-family: 'IBM Plex Mono', monospace;\n    font-size: 10px;\n    letter-spacing: 0.1em;\n    color: var(--accent);\n    margin-bottom: 4px;\n  }\n.plugin-moduli018 .insight-title{\n    font-size: 13px;\n    font-weight: 500;\n    margin-bottom: 6px;\n    line-height: 1.4;\n  }\n.plugin-moduli018 .insight-body{\n    font-size: 12px;\n    color: var(--muted);\n    line-height: 1.7;\n  }\n.plugin-moduli018 .ctrl-row{\n    display: flex;\n    align-items: center;\n    gap: 10px;\n    margin-bottom: 10px;\n  }\n.plugin-moduli018 .ctrl-label{ font-size: 12px; color: var(--muted); }\n.plugin-moduli018 select{\n    font-family: 'IBM Plex Sans', sans-serif;\n    font-size: 13px;\n    padding: 5px 10px;\n    border: 1px solid var(--border);\n    border-radius: 6px;\n    background: var(--surface);\n    color: var(--text);\n    cursor: pointer;\n    outline: none;\n  }\n.plugin-moduli018 select:hover{ border-color: #aaa; }\n.plugin-moduli018 .synth-table{\n    width: 100%;\n    border-collapse: collapse;\n    font-size: 13px;\n    background: var(--surface);\n    border-radius: 12px;\n    overflow: hidden;\n    border: 1px solid var(--border);\n    margin-bottom: 1.25rem;\n  }\n.plugin-moduli018 .synth-table thead tr{\n    background: var(--text);\n    color: #f7f5f0;\n  }\n.plugin-moduli018 .synth-table th{\n    font-family: 'IBM Plex Mono', monospace;\n    font-size: 10px;\n    letter-spacing: 0.08em;\n    text-transform: uppercase;\n    padding: 0.75rem 1rem;\n    text-align: left;\n    font-weight: 500;\n  }\n.plugin-moduli018 .synth-table td{\n    padding: 0.7rem 1rem;\n    border-bottom: 1px solid var(--border);\n    vertical-align: middle;\n  }\n.plugin-moduli018 .synth-table tr:last-child td{ border-bottom: none; }\n.plugin-moduli018 .synth-table tbody tr:hover{ background: #faf9f6; }\n.plugin-moduli018 .country-tag{\n    display: inline-flex;\n    align-items: center;\n    gap: 6px;\n    font-weight: 500;\n  }\n.plugin-moduli018 .country-dot{\n    width: 8px; height: 8px;\n    border-radius: 50%;\n    flex-shrink: 0;\n  }\n.plugin-moduli018 .badge{\n    display: inline-block;\n    font-size: 10px;\n    padding: 2px 7px;\n    border-radius: 4px;\n    font-family: 'IBM Plex Mono', monospace;\n    letter-spacing: 0.04em;\n  }\n.plugin-moduli018 .badge-high{ background: #e8f5e2; color: #1a5a10; }\n.plugin-moduli018 .badge-low{ background: #faeee6; color: #8a2c0a; }\n.plugin-moduli018 .badge-mid{ background: #f5f0e8; color: #7a6520; }\n.plugin-moduli018 .radar-wrap{\n    background: var(--surface);\n    border: 1px solid var(--border);\n    border-radius: 12px;\n    padding: 1.5rem;\n    display: grid;\n    grid-template-columns: 1fr 320px;\n    gap: 1.5rem;\n    align-items: center;\n    margin-bottom: 1.25rem;\n  }\n@media(max-width:700px) {.plugin-moduli018 .radar-wrap{ grid-template-columns: 1fr; }}\n.plugin-moduli018 .radar-annotations{ display: flex; flex-direction: column; gap: 10px; }\n.plugin-moduli018 .ann{\n    border-left: 2px solid var(--border);\n    padding-left: 10px;\n    font-size: 12px;\n  }\n.plugin-moduli018 .ann-country{ font-weight: 500; margin-bottom: 1px; font-size: 12px; }\n.plugin-moduli018 .ann-text{ color: var(--muted); line-height: 1.5; font-size: 11px; }\n.plugin-moduli018 footer{\n    border-top: 1px solid var(--border);\n    padding: 1.5rem 3rem;\n    font-size: 11px;\n    color: var(--muted);\n    display: flex;\n    justify-content: space-between;\n    gap: 1rem;\n    flex-wrap: wrap;\n  }\n.plugin-moduli018 footer span{ font-family: 'IBM Plex Mono', monospace; }";

const HTML = "<div class=\"plugin-moduli018\">\n<header>\n  <div class=\"header-eyebrow\">Tutkimusraportti · NOMESCO / NORDEN-data 2005–2023</div>\n  <h1>Pohjoismaat: Hyvinvointijärjestelmä, liikkuvuus ja syntyvyys</h1>\n  <p>Kattava vertailu etuusrakenteista, julkisista menoista, koulutuksesta ja lapsettomuuden selittäjistä neljässä Pohjoismaassa. Data: NOMESCO SOCEXP11, PUBS13, KEY01, PISA01, CHIL-sarja.</p>\n  <div class=\"header-meta\">\n    <div class=\"meta-item\"><span class=\"meta-label\">Maat</span><span class=\"meta-val\">Suomi, Tanska, Norja, Ruotsi</span></div>\n    <div class=\"meta-item\"><span class=\"meta-label\">Aikajakso</span><span class=\"meta-val\">2000–2023</span></div>\n    <div class=\"meta-item\"><span class=\"meta-label\">Lähde</span><span class=\"meta-val\">Supabase · TTT-analyysikanta</span></div>\n  </div>\n</header>\n\n<div class=\"country-bar\">\n  <div class=\"country-pill\"><span class=\"cpill-dot\" style=\"background:var(--fi)\"></span>Suomi</div>\n  <div class=\"country-pill\"><span class=\"cpill-dot\" style=\"background:var(--dk)\"></span>Tanska</div>\n  <div class=\"country-pill\"><span class=\"cpill-dot\" style=\"background:var(--no)\"></span>Norja</div>\n  <div class=\"country-pill\"><span class=\"cpill-dot\" style=\"background:var(--se)\"></span>Ruotsi</div>\n  <span style=\"font-size:11px;color:var(--muted);margin-left:auto\">Katkoviiva = Tanska · Pisteviiva = Norja · Yhdysviiva = Ruotsi</span>\n</div>\n\n<main>\n\n<nav class=\"tab-nav\">\n  <button class=\"tab-btn active\" onclick=\"__mod018_switchTab('economy',this)\">Talous &amp; Työttömyys</button>\n  <button class=\"tab-btn\" onclick=\"__mod018_switchTab('spending',this)\">Julkiset menot</button>\n  <button class=\"tab-btn\" onclick=\"__mod018_switchTab('benefits',this)\">Etuuskorvausasteet</button>\n  <button class=\"tab-btn\" onclick=\"__mod018_switchTab('fertility',this)\">Syntyvyys &amp; Lapsettomuus</button>\n  <button class=\"tab-btn\" onclick=\"__mod018_switchTab('education',this)\">Päivähoito &amp; PISA</button>\n  <button class=\"tab-btn\" onclick=\"__mod018_switchTab('synthesis',this)\">Synteesi</button>\n</nav>\n\n<!-- ════════════════ TALOUS ════════════════ -->\n<div id=\"panel-economy\" class=\"panel active\">\n  <div class=\"kpi-grid\">\n    <div class=\"kpi-card no\"><div class=\"kpi-label\">BKT/asukas 2023 -- Norja</div><div class=\"kpi-val\">65 200 €</div><div class=\"kpi-sub\">Korkein Pohjoismaissa</div></div>\n    <div class=\"kpi-card dk\"><div class=\"kpi-label\">BKT/asukas 2023 -- Tanska</div><div class=\"kpi-val\">47 800 €</div><div class=\"kpi-sub\">+71 % vs. 2005</div></div>\n    <div class=\"kpi-card se\"><div class=\"kpi-label\">BKT/asukas 2023 -- Ruotsi</div><div class=\"kpi-val\">42 900 €</div><div class=\"kpi-sub\">+53 % vs. 2005</div></div>\n    <div class=\"kpi-card fi\"><div class=\"kpi-label\">BKT/asukas 2023 -- Suomi</div><div class=\"kpi-val\">40 000 €</div><div class=\"kpi-sub\">+52 % vs. 2005 · Alhaisin</div></div>\n  </div>\n\n  <div class=\"chart-wrap\">\n    <div class=\"chart-title\">BKT per asukas (euro PPS) -- 2005–2023</div>\n    <div class=\"chart-inner\" style=\"height:240px\"><canvas id=\"cGdp\"></canvas></div>\n    <div class=\"chart-legend\" id=\"legGdp\"></div>\n  </div>\n\n  <div class=\"chart-wrap\">\n    <div class=\"chart-title\">Työttömyysaste (%) -- 2005–2023</div>\n    <div class=\"chart-inner\" style=\"height:220px\"><canvas id=\"cUnemp\"></canvas></div>\n    <div class=\"chart-legend\" id=\"legUnemp\"></div>\n  </div>\n\n  <div class=\"grid-2\">\n    <div class=\"insight\"><div class=\"insight-num\">01 / HAVAINTO</div><div class=\"insight-title\">Suomi: pysyvästi korkein työttömyys</div><div class=\"insight-body\">Suomen työttömyysaste on ollut koko jakson ajan Pohjoismaiden korkein -- noin 7–10 % -- kun Norja on pitäytynyt 2–5 %:ssa. Rakenteellinen työttömyys on itsessään sosiaalisen liikkuvuuden este.</div></div>\n    <div class=\"insight\"><div class=\"insight-num\">02 / HAVAINTO</div><div class=\"insight-title\">Suomi ainut maa, joka supistui 2023</div><div class=\"insight-body\">Vuoden 2023 BKT-kasvu: Suomi −0,9 %, Norja +0,1 %, Ruotsi −0,2 %, Tanska +0,6 %. Talousjäykkyys heikentää myös työllistymistä ja nuorten mahdollisuuksia muodostaa kotitalous.</div></div>\n  </div>\n</div>\n\n<!-- ════════════════ JULKISET MENOT ════════════════ -->\n<div id=\"panel-spending\" class=\"panel\">\n  <div class=\"ctrl-row\">\n    <span class=\"ctrl-label\">Sektori:</span>\n    <select id=\"selSector\" onchange=\"__mod018_buildSpend()\">\n      <option value=\"Social protection\">Sosiaaliturva</option>\n      <option value=\"Education\">Koulutus</option>\n      <option value=\"Health\">Terveys</option>\n      <option value=\"Economic affairs\">Elinkeinot</option>\n      <option value=\"General public services\">Yleinen hallinto</option>\n      <option value=\"Total\">Yhteensä</option>\n    </select>\n  </div>\n\n  <div class=\"chart-wrap\">\n    <div class=\"chart-title\">Julkiset menot % BKT (COFOG) -- 2010–2022</div>\n    <div class=\"chart-inner\" style=\"height:280px\"><canvas id=\"cSpend\"></canvas></div>\n    <div class=\"chart-legend\" id=\"legSpend\"></div>\n  </div>\n\n  <div class=\"grid-2\">\n    <div class=\"insight\"><div class=\"insight-num\">03 / HAVAINTO</div><div class=\"insight-title\">Sosiaaliturva: Suomi nousi, Tanska laski</div><div class=\"insight-body\">Suomen sosiaaliturva kasvoi 22,6 %:sta (2010) 25,8 %:iin (2016) ja pysyi korkeana. Tanska on laskenut 24,4 %:sta 18,7 %:iin (2022). Tanskan flexicurity-malli korvaa passiivisia etuuksia aktiivisella työvoimapolitiikalla.</div></div>\n    <div class=\"insight\"><div class=\"insight-num\">04 / HAVAINTO</div><div class=\"insight-title\">Koulutus: Ruotsi johtaa, Norja matala</div><div class=\"insight-body\">Ruotsi investoi koulutukseen johdonmukaisesti yli 7 % BKT:sta -- korkein Pohjoismaissa. Suomi on laskenut 6,5 %:sta 5,8 %:iin 2010–2022. Norja on matalin (3,9 % 2022), mutta öljytulojen ansiosta laadusta ei tingitä.</div></div>\n  </div>\n</div>\n\n<!-- ════════════════ ETUUSKORVAUSASTEET ════════════════ -->\n<div id=\"panel-benefits\" class=\"panel\">\n  <div class=\"chart-wrap\">\n    <div class=\"chart-title\">Etuuksien korvausaste (% aiemmasta nettotulosta) -- keskiarvo 2007–2023</div>\n    <div class=\"chart-inner\" style=\"height:300px\"><canvas id=\"cRepl\"></canvas></div>\n    <div class=\"chart-legend\" id=\"legRepl\"></div>\n  </div>\n\n  <div class=\"section-label\">Vertailutaulukko</div>\n  <table class=\"synth-table\">\n    <thead><tr>\n      <th>Maa</th>\n      <th>Äitiysraha</th>\n      <th>Työkyvyttömyysetuus</th>\n      <th>Vanhuuseläke (67v)</th>\n      <th>Päivähoitoaste</th>\n    </tr></thead>\n    <tbody>\n      <tr>\n        <td><span class=\"country-tag\"><span class=\"country-dot\" style=\"background:var(--dk)\"></span>Tanska</span></td>\n        <td><span class=\"badge badge-high\">78,1 %</span></td>\n        <td><span class=\"badge badge-high\">92,5 %</span></td>\n        <td><span class=\"badge badge-high\">92,6 %</span></td>\n        <td><span class=\"badge badge-high\">92,7 %</span></td>\n      </tr>\n      <tr>\n        <td><span class=\"country-tag\"><span class=\"country-dot\" style=\"background:var(--no)\"></span>Norja</span></td>\n        <td><span class=\"badge badge-high\">86,3 %</span></td>\n        <td><span class=\"badge badge-mid\">71,3 %</span></td>\n        <td><span class=\"badge badge-mid\">70,4 %</span></td>\n        <td><span class=\"badge badge-high\">96,1 %</span></td>\n      </tr>\n      <tr>\n        <td><span class=\"country-tag\"><span class=\"country-dot\" style=\"background:var(--se)\"></span>Ruotsi</span></td>\n        <td><span class=\"badge badge-mid\">75,1 %</span></td>\n        <td><span class=\"badge badge-low\">63,7 %</span></td>\n        <td><span class=\"badge badge-mid\">73,2 %</span></td>\n        <td><span class=\"badge badge-high\">97,0 %</span></td>\n      </tr>\n      <tr>\n        <td><span class=\"country-tag\"><span class=\"country-dot\" style=\"background:var(--fi)\"></span>Suomi</span></td>\n        <td><span class=\"badge badge-low\">73,4 %</span></td>\n        <td><span class=\"badge badge-low\">63,9 %</span></td>\n        <td><span class=\"badge badge-mid\">76,6 %</span></td>\n        <td><span class=\"badge badge-low\">78,6 %</span></td>\n      </tr>\n    </tbody>\n  </table>\n\n  <div class=\"grid-2\">\n    <div class=\"insight\"><div class=\"insight-num\">05 / HAVAINTO</div><div class=\"insight-title\">Työkyvyttömyysetuuden 29 pp:n kuilu</div><div class=\"insight-body\">Tanska korvaa työkyvyttömyydestä 92,5 % aiemmasta nettotulosta, Suomi 63,9 %. Tanskan logiikka: korkea korvaus + aktivointi on parempi kuin matala korvaus ilman paluutukea. Suomessa matala korvausaste saattaa johtaa pitkäaikaisempaan poissaoloon.</div></div>\n    <div class=\"insight\"><div class=\"insight-num\">06 / HAVAINTO</div><div class=\"insight-title\">Äitiysraha: Norja kärjessä</div><div class=\"insight-body\">Norja korvaa 86,3 % aiemmasta palkasta äitiyslomalla -- korkein Pohjoismaissa. Suomi on matalin (73,4 %). Yhdistettynä Suomen matalimpaan päivähoitoasteeseen (78,6 %) tämä voi selittää osan syntyvyyserosta.</div></div>\n  </div>\n</div>\n\n<!-- ════════════════ SYNTYVYYS ════════════════ -->\n<div id=\"panel-fertility\" class=\"panel\">\n  <div class=\"kpi-grid\">\n    <div class=\"kpi-card fi\"><div class=\"kpi-label\">Lapsettomuus 45v -- Suomi 2023</div><div class=\"kpi-val\">29,7 %</div><div class=\"kpi-sub\">Korkein Pohjoismaissa</div></div>\n    <div class=\"kpi-card no\"><div class=\"kpi-label\">Lapsettomuus 45v -- Norja 2023</div><div class=\"kpi-val\">26,6 %</div><div class=\"kpi-sub\"></div></div>\n    <div class=\"kpi-card se\"><div class=\"kpi-label\">Lapsettomuus 45v -- Ruotsi 2023</div><div class=\"kpi-val\">22,0 %</div><div class=\"kpi-sub\"></div></div>\n    <div class=\"kpi-card dk\"><div class=\"kpi-label\">Lapsettomuus 45v -- Tanska 2023</div><div class=\"kpi-val\">20,7 %</div><div class=\"kpi-sub\">Matalin Pohjoismaissa</div></div>\n  </div>\n\n  <div class=\"chart-wrap\">\n    <div class=\"chart-title\">Kokonaishedelmällisyysluku (TFR) -- 2005–2023</div>\n    <div class=\"chart-inner\" style=\"height:240px\"><canvas id=\"cTfr\"></canvas></div>\n    <div class=\"chart-legend\" id=\"legTfr\"></div>\n  </div>\n\n  <div class=\"chart-wrap\">\n    <div class=\"chart-title\">Naisten lapsettomuus 45-vuotiaana (%) -- 2005–2023</div>\n    <div class=\"chart-inner\" style=\"height:240px\"><canvas id=\"cChildless\"></canvas></div>\n    <div class=\"chart-legend\" id=\"legChildless\"></div>\n  </div>\n\n  <div class=\"chart-wrap\">\n    <div class=\"chart-title\">Naisten keski-ikä ensisynnytyksessä (vuotta) -- 2005–2023</div>\n    <div class=\"chart-inner\" style=\"height:200px\"><canvas id=\"cAge\"></canvas></div>\n    <div class=\"chart-legend\" id=\"legAge\"></div>\n  </div>\n\n  <div class=\"grid-2\">\n    <div class=\"insight\"><div class=\"insight-num\">07 / HAVAINTO</div><div class=\"insight-title\">Suomen lapsettomuus on pohjoismainen poikkeus</div><div class=\"insight-body\">Lähes 30 % suomalaisista naisista on lapsettomia 45-vuotiaana. Tanska pysyy vakaana noin 21 %:ssa. Ero on 9 prosenttiyksikköä -- erittäin suuri väestötieteellisesti. Ilmiö on kasvanut vuoden 2005 (26,1 %) tasolta.</div></div>\n    <div class=\"insight\"><div class=\"insight-num\">08 / HAVAINTO</div><div class=\"insight-title\">Ensisynnytysikä nousi 30 → 32,2 vuoteen</div><div class=\"insight-body\">Suomalaisnaisten ensisynnytysikä on noussut eniten Pohjoismaissa -- 30,0:sta 32,2 vuoteen. Myöhäinen perheen perustaminen supistaa syntyvää ikäkohorttia biologisesti. Ilmiö kytkeytyy asumis- ja työllistymisepävarmuuteen nuorilla aikuisilla.</div></div>\n  </div>\n</div>\n\n<!-- ════════════════ KOULUTUS ════════════════ -->\n<div id=\"panel-education\" class=\"panel\">\n  <div class=\"kpi-grid\">\n    <div class=\"kpi-card se\"><div class=\"kpi-label\">Päivähoitoaste -- Ruotsi</div><div class=\"kpi-val\">97 %</div><div class=\"kpi-sub\">Korkein</div></div>\n    <div class=\"kpi-card no\"><div class=\"kpi-label\">Päivähoitoaste -- Norja</div><div class=\"kpi-val\">96 %</div><div class=\"kpi-sub\"></div></div>\n    <div class=\"kpi-card dk\"><div class=\"kpi-label\">Päivähoitoaste -- Tanska</div><div class=\"kpi-val\">93 %</div><div class=\"kpi-sub\"></div></div>\n    <div class=\"kpi-card fi\"><div class=\"kpi-label\">Päivähoitoaste -- Suomi</div><div class=\"kpi-val\">79 %</div><div class=\"kpi-sub\">18 pp alle Ruotsin</div></div>\n  </div>\n\n  <div class=\"chart-wrap\">\n    <div class=\"chart-title\">PISA-matematiikka -- pisteet mittausvuosittain 2000–2022</div>\n    <div class=\"chart-inner\" style=\"height:280px\"><canvas id=\"cPisa\"></canvas></div>\n    <div class=\"chart-legend\" id=\"legPisa\"></div>\n  </div>\n\n  <div class=\"grid-2\">\n    <div class=\"insight\"><div class=\"insight-num\">09 / HAVAINTO</div><div class=\"insight-title\">Suomen PISA-lasku on jyrkin, mutta lähtötaso oli korkein</div><div class=\"insight-body\">Suomi on laskenut matematiikassa n. 548 → 484 pistettä (2003–2022) -- suurin pudotus Pohjoismaissa absoluuttisesti. Ruotsi on toipunut 2012 notkahduksestaan. Kaikilla mailla on laskutrendi 2022 pandemiavaikutusten seurauksena.</div></div>\n    <div class=\"insight\"><div class=\"insight-num\">10 / HAVAINTO</div><div class=\"insight-title\">Päivähoito linkittyy syntyvyyteen</div><div class=\"insight-body\">Ruotsi ja Norja, joilla on korkein päivähoitoaste (96–97 %), ovat myös pitäneet lapsettomuuden matalampana kuin Suomi. Päivähoito vähentää lapsiperheen työvoimapoistumaa -- erityisesti naisten kohdalla -- ja voi siten kannustaa perheen perustamiseen.</div></div>\n  </div>\n</div>\n\n<!-- ════════════════ SYNTEESI ════════════════ -->\n<div id=\"panel-synthesis\" class=\"panel\">\n  <div class=\"section-label\">Kokonaisprofiili -- indeksoitu vertailu (100 = pohjoismaismainen paras)</div>\n\n  <div class=\"radar-wrap\">\n    <div>\n      <div class=\"chart-inner\" style=\"height:320px\"><canvas id=\"cRadar\"></canvas></div>\n      <div class=\"chart-legend\" id=\"legRadar\" style=\"margin-top:10px\"></div>\n    </div>\n    <div class=\"radar-annotations\">\n      <div class=\"ann\">\n        <div class=\"ann-country\" style=\"color:var(--fi)\">Suomi</div>\n        <div class=\"ann-text\">Rakenteellinen liikkuvuusloukku: korkea sosiaaliturva + matalin päivähoito + räjähtänyt asumistuki + korkein lapsettomuus. Järjestelmä suojelee niitä, joilla on asema -- mutta hidastaa nuorten etenemistä.</div>\n      </div>\n      <div class=\"ann\">\n        <div class=\"ann-country\" style=\"color:var(--dk)\">Tanska</div>\n        <div class=\"ann-text\">Flexicurity toimii: matala työsuhdeturva + korkea korvausaste + aktiivinen aktivointi. Sosiaaliturva laskee, lapsettomuus pysyy vakaana. Tasapainoisin profiili kaikilla ulottuvuuksilla.</div>\n      </div>\n      <div class=\"ann\">\n        <div class=\"ann-country\" style=\"color:var(--no)\">Norja</div>\n        <div class=\"ann-text\">Öljyrahasto pehmentää, mutta TFR laskee silti 1,98 → 1,40. Varallisuus yksin ei selitä syntyvyyttä. Lapsettomuus kasvaa -- kaupungistuminen Osloon voi olla taustalla.</div>\n      </div>\n      <div class=\"ann\">\n        <div class=\"ann-country\" style=\"color:var(--se)\">Ruotsi</div>\n        <div class=\"ann-text\">Korkein koulutuspanostus + korkein päivähoito, mutta korkea rakenteellinen työttömyys ja maahanmuuton integraatiohaasteet. Sosiaalisen syrjäytymisen menot kasvoivat voimakkaasti 2015–2016.</div>\n      </div>\n    </div>\n  </div>\n\n  <div class=\"section-label\">Selittävien tekijöiden pisteytys</div>\n  <table class=\"synth-table\">\n    <thead><tr>\n      <th>Indikaattori</th>\n      <th>Suomi</th>\n      <th>Tanska</th>\n      <th>Norja</th>\n      <th>Ruotsi</th>\n    </tr></thead>\n    <tbody>\n      <tr><td>TFR 2023</td><td><span class=\"badge badge-low\">1,26</span></td><td><span class=\"badge badge-mid\">1,50</span></td><td><span class=\"badge badge-mid\">1,40</span></td><td><span class=\"badge badge-mid\">1,45</span></td></tr>\n      <tr><td>Lapsettomuus naisilla 45v (2023)</td><td><span class=\"badge badge-low\">29,7 %</span></td><td><span class=\"badge badge-high\">20,7 %</span></td><td><span class=\"badge badge-mid\">26,6 %</span></td><td><span class=\"badge badge-mid\">22,0 %</span></td></tr>\n      <tr><td>Päivähoitoaste (ka.)</td><td><span class=\"badge badge-low\">78,6 %</span></td><td><span class=\"badge badge-mid\">92,7 %</span></td><td><span class=\"badge badge-high\">96,1 %</span></td><td><span class=\"badge badge-high\">97,0 %</span></td></tr>\n      <tr><td>Äitiysrahan korvausaste (ka.)</td><td><span class=\"badge badge-low\">73,4 %</span></td><td><span class=\"badge badge-mid\">78,1 %</span></td><td><span class=\"badge badge-high\">86,3 %</span></td><td><span class=\"badge badge-mid\">75,1 %</span></td></tr>\n      <tr><td>Työkyvyttömyysetuus korvausaste (ka.)</td><td><span class=\"badge badge-low\">63,9 %</span></td><td><span class=\"badge badge-high\">92,5 %</span></td><td><span class=\"badge badge-mid\">71,3 %</span></td><td><span class=\"badge badge-low\">63,7 %</span></td></tr>\n      <tr><td>Koulutusmenot % BKT (2022)</td><td><span class=\"badge badge-mid\">5,8 %</span></td><td><span class=\"badge badge-mid\">5,3 %</span></td><td><span class=\"badge badge-low\">3,9 %</span></td><td><span class=\"badge badge-high\">7,2 %</span></td></tr>\n      <tr><td>Sosiaaliturva % BKT (2022)</td><td><span class=\"badge badge-low\">23,8 %</span></td><td><span class=\"badge badge-mid\">18,7 %</span></td><td><span class=\"badge badge-high\">14,3 %</span></td><td><span class=\"badge badge-mid\">19,0 %</span></td></tr>\n      <tr><td>Työttömyysaste 2023</td><td><span class=\"badge badge-low\">7,3 %</span></td><td><span class=\"badge badge-mid\">5,2 %</span></td><td><span class=\"badge badge-high\">3,7 %</span></td><td><span class=\"badge badge-low\">7,8 %</span></td></tr>\n      <tr><td>BKT/asukas 2023 (k€)</td><td><span class=\"badge badge-low\">40,0</span></td><td><span class=\"badge badge-mid\">47,8</span></td><td><span class=\"badge badge-high\">65,2</span></td><td><span class=\"badge badge-mid\">42,9</span></td></tr>\n    </tbody>\n  </table>\n\n  <div class=\"grid-2\">\n    <div class=\"insight\"><div class=\"insight-num\">JOHTOPÄÄTÖS A</div><div class=\"insight-title\">Menojen rakenne ratkaisee -- ei taso</div><div class=\"insight-body\">Suomi kuluttaa eniten sosiaaliturvaaan BKT-prosentteina, mutta saa heikoimmat tulokset syntyvyydessä ja lapsettomuudessa. Tanska käyttää vähemmän ja saa paremmat tulokset. Tämä viittaa siihen, että menojen kohdennus -- aktiivisuus vs. passiivisuus -- on ratkaiseva tekijä.</div></div>\n    <div class=\"insight\"><div class=\"insight-num\">JOHTOPÄÄTÖS B</div><div class=\"insight-title\">Liikkuvuuden esteet kertyvät</div><div class=\"insight-body\">Asumistuen kasvu (+514 % 2007–2023 Suomessa), matalin päivähoitoaste, korkein työttömyys ja korkein lapsettomuus muodostavat systemaattisen kokonaisuuden. Nuoret kohtaavat esteitä työllistymisessä, muuttamisessa ja perheen perustamisessa -- kaikki samanaikaisesti.</div></div>\n  </div>\n</div>\n\n</main>\n\n<footer>\n  <span>Lähde: NOMESCO · NORDEN · TTT-analyysikanta (Supabase)</span>\n  <span>Tuotettu: toukokuu 2026</span>\n</footer>\n</div>";

let _instance = null;

async function mount(host, core) {
  if (!document.getElementById("style-" + ID)) {
    const s = document.createElement("style");
    s.id = "style-" + ID;
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  host.innerHTML = HTML;
  const root = host.querySelector(".plugin-moduli018");
  if (!root) {
    console.error("[moduli018] root puuttuu");
    return;
  }

  const $id  = (id)  => root.querySelector("#" + id);
  const $qs  = (sel) => root.querySelector(sel);
  const $qsa = (sel) => root.querySelectorAll(sel);

  // ── Standalone-script alkaa ──────────────────────────────

const C = { Finland:'#1a4a8a', Denmark:'#2d6a1f', Norway:'#a04010', Sweden:'#5a4ab0' };
const DASH = { Finland:[], Denmark:[6,3], Norway:[2,4], Sweden:[8,3] };
const YEARS = Array.from({length:19},(_,i)=>2005+i);
const YEARS10 = Array.from({length:13},(_,i)=>2010+i);
const CTRY = ['Finland','Denmark','Norway','Sweden'];
const CLBL = ['Suomi','Tanska','Norja','Ruotsi'];
const charts = {};

function mkLeg(id, labels, colors){
  const el=$id(id);
  if(!el) return;
  el.innerHTML=labels.map((l,i)=>`<span><span class="leg-swatch" style="background:${colors[i]}"></span>${l}</span>`).join('');
}
function destroy(id){ if(charts[id]){ charts[id].destroy(); delete charts[id]; } }

const commonOpts = (yLabel='') => ({
  responsive:true, maintainAspectRatio:false,
  plugins:{ legend:{display:false} },
  scales:{
    x:{ ticks:{autoSkip:true,maxTicksLimit:10,font:{size:11}}, grid:{color:'rgba(0,0,0,0.05)'} },
    y:{ title:{ display:!!yLabel, text:yLabel, font:{size:11} }, grid:{color:'rgba(0,0,0,0.07)'} }
  }
});

/* ── GDP ── */
const GDP = {
  Finland:[26300,27400,29900,31100,28700,29500,30400,30100,29800,29800,30400,31000,32400,33400,34000,34000,36200,38400,40000],
  Denmark:[28000,29700,30900,32200,30600,32600,33100,33100,33800,34300,35200,36000,38000,38800,39400,40100,44500,48500,47800],
  Norway:[39300,43200,44400,48200,42000,44100,46500,48600,48600,47500,43700,41200,44400,47600,46100,42900,56800,77200,65200],
  Sweden:[28000,29900,32200,32500,30300,31800,33000,33400,33300,33600,35100,34900,35300,35900,37000,36700,39700,41100,42900],
};
const UNEMP = {
  Finland:[8.5,7.8,6.9,6.4,8.4,8.5,7.9,7.8,8.3,8.8,9.6,9.0,8.8,7.5,6.8,7.9,7.8,6.9,7.3],
  Denmark:[4.9,4.0,3.8,3.7,6.5,7.9,7.9,8.0,7.6,7.1,6.5,6.2,6.0,5.3,5.1,5.8,5.2,4.5,5.2],
  Norway:[4.4,3.4,2.5,2.6,3.2,3.6,3.3,3.2,3.5,3.6,4.4,4.8,4.3,3.9,3.8,4.5,4.5,3.3,3.7],
  Sweden:[7.6,7.1,6.2,6.3,8.5,8.8,8.0,8.1,8.2,8.1,7.6,7.1,6.9,6.5,7.0,8.5,9.1,7.6,7.8],
};

function buildGdp(){
  destroy('cGdp');
  const ctx=$id('cGdp').getContext('2d');
  const opts=commonOpts('€');
  opts.scales.y.ticks={callback:v=>`${(v/1000).toFixed(0)}k`};
  charts['cGdp']=new Chart(ctx,{type:'line',data:{labels:YEARS,datasets:CTRY.map((c,i)=>({
    label:CLBL[i],data:GDP[c],borderColor:C[c],borderDash:DASH[c],backgroundColor:'transparent',
    tension:0.3,pointRadius:2,borderWidth:2,
  }))},options:opts});
  mkLeg('legGdp',CLBL,CTRY.map(c=>C[c]));
}
function buildUnemp(){
  destroy('cUnemp');
  const ctx=$id('cUnemp').getContext('2d');
  const opts=commonOpts('%');
  opts.scales.y.min=0;
  charts['cUnemp']=new Chart(ctx,{type:'line',data:{labels:YEARS,datasets:CTRY.map((c,i)=>({
    label:CLBL[i],data:UNEMP[c],borderColor:C[c],borderDash:DASH[c],backgroundColor:'transparent',
    tension:0.3,pointRadius:2,borderWidth:2,
  }))},options:opts});
  mkLeg('legUnemp',CLBL,CTRY.map(c=>C[c]));
}

/* ── SPENDING ── */
const SPEND={
  'Social protection':{Finland:[22.6,22.5,23.7,24.7,25.3,25.5,25.8,24.8,24.5,24.3,25.8,25.0,23.8],Denmark:[24.4,24.3,24.2,24.1,23.7,23.2,22.6,22.0,21.6,21.4,22.1,20.5,18.7],Norway:[17.5,17.3,17.2,17.5,18.1,19.4,20.4,19.7,18.9,19.5,21.9,18.1,14.3],Sweden:[21.0,20.3,21.1,21.7,21.3,20.9,21.2,20.8,20.4,19.7,20.4,19.4,19.0]},
  'Education':{Finland:[6.5,6.4,6.4,6.4,6.4,6.4,6.2,5.8,5.8,5.9,6.1,5.9,5.8],Denmark:[7.1,6.8,6.9,6.8,7.1,7.0,6.8,6.4,6.4,6.3,6.2,5.9,5.3],Norway:[5.2,5.0,4.9,4.9,5.1,5.4,5.6,5.5,5.4,5.6,5.8,4.8,3.9],Sweden:[7.1,7.0,7.1,7.1,7.3,7.2,7.3,7.5,7.6,7.7,7.8,7.4,7.2]},
  'Health':{Finland:[7.3,7.4,7.7,7.9,7.9,7.3,7.2,7.1,7.1,7.2,7.7,7.8,7.5],Denmark:[9.0,8.8,9.1,8.9,9.0,8.9,8.8,8.7,8.7,8.7,9.3,9.4,8.3],Norway:[7.3,7.1,7.1,7.3,7.7,8.2,8.6,8.3,8.1,8.6,9.5,8.4,6.7],Sweden:[6.9,6.9,7.0,7.1,7.1,7.0,7.1,7.1,7.2,7.2,7.5,7.5,7.2]},
  'Economic affairs':{Finland:[4.9,4.8,4.9,4.8,4.9,4.7,4.5,4.3,4.2,4.2,5.2,5.1,4.5],Denmark:[3.4,3.4,3.7,3.5,3.7,3.7,3.3,3.3,3.4,3.2,5.1,4.1,3.0],Norway:[4.7,4.5,4.5,4.8,5.1,5.4,5.7,5.6,5.5,5.9,8.1,5.7,4.9],Sweden:[4.6,4.5,4.7,4.9,4.9,4.7,4.7,4.7,4.8,4.8,6.3,5.4,5.0]},
  'General public services':{Finland:[7.7,8.1,8.3,8.4,8.4,7.2,6.8,6.5,6.7,6.6,6.9,6.7,6.5],Denmark:[7.8,8.0,9.0,7.3,7.1,7.0,6.3,5.8,6.3,5.8,6.1,5.7,5.6],Norway:[5.0,4.6,4.3,4.3,4.5,4.7,4.7,4.6,4.4,4.7,5.0,4.1,3.5],Sweden:[6.0,6.3,6.3,6.3,6.0,5.7,5.3,5.3,5.6,5.4,5.5,5.2,5.2]},
  'Total':{Finland:[54.0,53.8,55.7,57.1,57.6,55.7,55.1,52.8,52.7,52.6,56.5,55.1,52.6],Denmark:[56.5,56.3,57.9,55.6,55.1,54.4,52.4,50.6,50.8,49.8,53.3,49.7,45.1],Norway:[45.1,43.9,43.0,44.1,45.9,49.0,51.2,50.1,48.5,51.1,57.6,47.1,38.1],Sweden:[50.9,50.2,51.4,52.5,51.8,50.4,50.5,50.3,50.9,49.8,53.1,50.4,49.4]},
};
function buildSpend(){
  destroy('cSpend');
  const key=$id('selSector').value;
  const d=SPEND[key];
  const ctx=$id('cSpend').getContext('2d');
  const opts=commonOpts('% BKT');
  charts['cSpend']=new Chart(ctx,{type:'line',data:{labels:YEARS10,datasets:CTRY.map((c,i)=>({
    label:CLBL[i],data:d[c],borderColor:C[c],borderDash:DASH[c],backgroundColor:'transparent',
    tension:0.3,pointRadius:3,borderWidth:2,
  }))},options:opts});
  mkLeg('legSpend',CLBL,CTRY.map(c=>C[c]));
}

/* ── REPLACEMENT RATES ── */
function buildRepl(){
  destroy('cRepl');
  const ctx=$id('cRepl').getContext('2d');
  const groups=['Äitiysraha','Työkyvyttömyysetuus','Vanhuuseläke (67v)'];
  const vals={Finland:[73.4,63.9,76.6],Denmark:[78.1,92.5,92.6],Norway:[86.3,71.3,70.4],Sweden:[75.1,63.7,73.2]};
  const opts=commonOpts('% nettotulosta');
  opts.scales.y.min=50;
  opts.plugins.tooltip={callbacks:{label:c=>`${c.dataset.label}: ${c.parsed.y.toFixed(1)} %`}};
  charts['cRepl']=new Chart(ctx,{type:'bar',data:{
    labels:groups,
    datasets:CTRY.map((c,i)=>({
      label:CLBL[i],data:vals[c],
      backgroundColor:C[c]+'b0',borderColor:C[c],borderWidth:1.5,borderRadius:3,
    }))
  },options:opts});
  mkLeg('legRepl',CLBL,CTRY.map(c=>C[c]));
}

/* ── TFR & LAPSETTOMUUS ── */
const TFR={
  Finland:[1.803,1.837,1.829,1.846,1.864,1.870,1.827,1.801,1.747,1.710,1.650,1.567,1.489,1.407,1.347,1.370,1.458,1.316,1.257],
  Denmark:[1.802,1.848,1.844,1.889,1.840,1.871,1.752,1.729,1.669,1.691,1.714,1.785,1.752,1.730,1.699,1.675,1.724,1.553,1.496],
  Norway:[1.840,1.900,1.900,1.960,1.980,1.950,1.880,1.850,1.780,1.760,1.730,1.710,1.620,1.560,1.530,1.480,1.550,1.410,1.400],
  Sweden:[1.769,1.854,1.879,1.907,1.935,1.985,1.901,1.906,1.888,1.881,1.849,1.853,1.779,1.752,1.705,1.664,1.669,1.521,1.449],
};
const CHILDLESS={
  Finland:[26.1,26.1,26.9,27.0,26.9,27.6,28.1,28.0,28.2,28.5,28.5,28.8,28.4,28.3,27.5,27.8,28.7,29.0,29.7],
  Denmark:[21.6,21.2,21.6,21.6,21.4,21.1,20.6,20.9,20.9,20.9,21.4,20.9,20.5,20.8,21.1,20.2,20.2,20.8,20.7],
  Norway:[20.7,null,null,null,null,22.9,22.2,22.9,23.0,23.0,23.8,23.7,23.8,24.1,24.6,25.4,26.0,26.3,26.6],
  Sweden:[23.1,23.0,22.6,22.5,21.9,22.0,22.0,22.0,22.1,21.9,22.1,21.5,21.5,21.0,21.2,21.5,21.9,21.8,22.0],
};
const AGE={
  Finland:[30.0,30.2,30.2,30.2,30.3,30.4,30.5,30.6,30.7,30.7,30.9,31.1,31.2,31.4,31.5,31.6,31.9,32.0,32.2],
  Denmark:[31.2,31.3,31.3,31.3,31.3,31.3,31.4,31.4,31.4,31.4,31.3,31.2,31.2,31.3,31.4,31.5,31.5,31.5,31.7],
  Norway:[30.9,30.8,30.9,30.9,30.9,30.8,31.1,31.2,31.3,31.3,31.4,31.5,31.7,31.8,32.0,32.1,32.1,32.2,32.3],
  Sweden:[31.4,31.5,31.4,31.4,31.4,31.4,31.4,31.5,31.5,31.5,31.5,31.5,31.6,31.6,31.8,31.9,32.1,32.3,32.4],
};

function buildTfr(){
  destroy('cTfr');
  const ctx=$id('cTfr').getContext('2d');
  const opts=commonOpts('TFR');
  opts.scales.y.min=1.1; opts.scales.y.max=2.1;
  charts['cTfr']=new Chart(ctx,{type:'line',data:{labels:YEARS,datasets:CTRY.map((c,i)=>({
    label:CLBL[i],data:TFR[c],borderColor:C[c],borderDash:DASH[c],backgroundColor:'transparent',
    tension:0.3,pointRadius:2,borderWidth:2,
  }))},options:opts});
  mkLeg('legTfr',CLBL,CTRY.map(c=>C[c]));
}
function buildChildless(){
  destroy('cChildless');
  const ctx=$id('cChildless').getContext('2d');
  const opts=commonOpts('%');
  opts.scales.y.min=18; opts.plugins.tooltip={callbacks:{label:c=>c.parsed.y!=null?`${c.dataset.label}: ${c.parsed.y.toFixed(1)} %`:''}};
  charts['cChildless']=new Chart(ctx,{type:'line',data:{labels:YEARS,datasets:CTRY.map((c,i)=>({
    label:CLBL[i],data:CHILDLESS[c],borderColor:C[c],borderDash:DASH[c],backgroundColor:'transparent',
    tension:0.3,pointRadius:2,borderWidth:2,spanGaps:true,
  }))},options:opts});
  mkLeg('legChildless',CLBL,CTRY.map(c=>C[c]));
}
function buildAge(){
  destroy('cAge');
  const ctx=$id('cAge').getContext('2d');
  const opts=commonOpts('ikä (v)');
  opts.scales.y.min=29.5; opts.scales.y.max=33;
  charts['cAge']=new Chart(ctx,{type:'line',data:{labels:YEARS,datasets:CTRY.map((c,i)=>({
    label:CLBL[i],data:AGE[c],borderColor:C[c],borderDash:DASH[c],backgroundColor:'transparent',
    tension:0.3,pointRadius:2,borderWidth:2,
  }))},options:opts});
  mkLeg('legAge',CLBL,CTRY.map(c=>C[c]));
}

/* ── PISA ── */
const PISA_Y=[2000,2003,2006,2009,2012,2015,2018,2022];
const PISA={
  Finland:[536.5,544.5,548.5,540.5,518.5,511.0,507.0,484.5],
  Denmark:[514.5,514.5,513.0,503.0,500.0,511.0,509.0,489.0],
  Norway:[500.5,495.0,490.0,497.5,489.0,502.0,501.0,468.5],
  Sweden:[510.5,509.0,502.5,494.0,478.5,494.0,502.5,482.0],
};
function buildPisa(){
  destroy('cPisa');
  const ctx=$id('cPisa').getContext('2d');
  const opts=commonOpts('pisteet');
  opts.scales.y.min=460; opts.scales.y.max=560;
  charts['cPisa']=new Chart(ctx,{type:'line',data:{labels:PISA_Y,datasets:CTRY.map((c,i)=>({
    label:CLBL[i],data:PISA[c],borderColor:C[c],borderDash:DASH[c],backgroundColor:'transparent',
    tension:0.2,pointRadius:5,borderWidth:2,
  }))},options:opts});
  mkLeg('legPisa',CLBL,CTRY.map(c=>C[c]));
}

/* ── RADAR ── */
function buildRadar(){
  destroy('cRadar');
  const ctx=$id('cRadar').getContext('2d');
  const axes=['TFR\nsyntyvyys','Päivähoito\n%','Äitiysraha\n%','Koulutus\n% BKT','Sosiaaliturva\n(inv.)','Työttömyys\n(inv.)','Lapsettomuus\n(inv.)'];
  const raw={
    Finland:[1.257,78.6,73.4,5.8,23.8,7.3,29.7],
    Denmark:[1.496,92.7,78.1,5.3,18.7,5.2,20.7],
    Norway:[1.400,96.1,86.3,3.9,14.3,3.7,26.6],
    Sweden:[1.449,97.0,75.1,7.2,19.0,7.8,22.0],
  };
  const ranges=[[1.257,1.496,false],[78.6,97.0,false],[73.4,86.3,false],[3.9,7.2,false],[14.3,23.8,true],[3.7,7.8,true],[20.7,29.7,true]];
  function norm(v,mn,mx,inv){ let n=(v-mn)/(mx-mn)*100; return inv?100-n:n; }
  charts['cRadar']=new Chart(ctx,{type:'radar',data:{
    labels:axes,
    datasets:CTRY.map((c,i)=>({
      label:CLBL[i],
      data:raw[c].map((v,j)=>Math.round(norm(v,ranges[j][0],ranges[j][1],ranges[j][2]))),
      borderColor:C[c],backgroundColor:C[c]+'22',borderWidth:2,pointRadius:3,
    }))
  },options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},
    scales:{r:{min:0,max:100,ticks:{stepSize:25,font:{size:10},color:'#888'},
      pointLabels:{font:{size:11}},grid:{color:'rgba(0,0,0,0.1)'},angleLines:{color:'rgba(0,0,0,0.1)'}}}
  }});
  mkLeg('legRadar',CLBL,CTRY.map(c=>C[c]));
}

/* ── TAB SWITCHING ── */
const BUILDERS = {
  economy:   ()=>{ buildGdp(); buildUnemp(); },
  spending:  ()=>{ buildSpend(); },
  benefits:  ()=>{ buildRepl(); },
  fertility: ()=>{ buildTfr(); buildChildless(); buildAge(); },
  education: ()=>{ buildPisa(); },
  synthesis: ()=>{ buildRadar(); },
};
function switchTab(id, btn){
  $qsa('.panel').forEach(p=>p.classList.remove('active'));
  $qsa('.tab-btn').forEach(b=>b.classList.remove('active'));
  $id('panel-'+id).classList.add('active');
  btn.classList.add('active');
  if(BUILDERS[id]) BUILDERS[id]();
}

// init
BUILDERS.economy();

  // ── Standalone-script loppuu ─────────────────────────────

  // Vie onclick/onchange-funktiot windowiin namespacatuilla nimillä
  const exposed = ["switchTab","buildSpend"];
  const _prev = {};
  for (const name of exposed) {
    _prev[name] = window[NS + name];
    // eslint-disable-next-line no-undef
    window[NS + name] = eval(name);
  }

  _instance = {
    host,
    cleanup() {
      try {
        for (const id of Object.keys(charts)) {
          try { charts[id].destroy(); } catch {}
          delete charts[id];
        }
      } catch {}
      for (const name of exposed) {
        if (_prev[name] === undefined) delete window[NS + name];
        else window[NS + name] = _prev[name];
      }
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
