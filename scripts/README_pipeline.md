# TTT-analyysipipeline

Python-skripti joka päivittää kaikki laskennat Supabase-tietokannassa
kun dataa lisätään tai muutetaan.

---

## Asennus

```bash
pip install -r requirements.txt

# Luo .env-tiedosto
cp .env.example .env
# Täytä SUPABASE_URL ja SUPABASE_SERVICE_KEY
```

**.env**
```
SUPABASE_URL=https://yjkabgtbcgvrfqtewtna.supabase.co
SUPABASE_SERVICE_KEY=eyJ...   # service_role -avain, EI anon
```

---

## Käyttö

```bash
# Aja kaikki askeleet järjestyksessä
python ttt_pipeline.py

# Testaa ensin ilman kirjoitusta
python ttt_pipeline.py --dry-run

# Aja vain yksi askel
python ttt_pipeline.py --step elasticities
python ttt_pipeline.py --step per_capita
python ttt_pipeline.py --step forecasts

# Päivitä vain uusin data (nopeampi)
python ttt_pipeline.py --since 2024-01-01
```

---

## Askeleet ja mitä ne tekevät

### 1. per_capita
**Milloin:** Aina kun `sector_series` (nominal) tai
`sector_target_population` muuttuu.

Laskee `sector_series.basis='per_capita_target'` kaikille sektoreille.
Interpoloi puuttuvat väestövuodet lineaarisesti.

**Kirjoittaa:** `sector_series` (upsert, basis=per_capita_target)

---

### 2. nordic_sync
**Milloin:** Aina kun `nordic_indicators`-tauluun tulee uutta dataa.

Luo puuttuvat `indicators_ref`-rivit nordic-kategorioille.
Tämä on se linkitysoperaatio joka tekee pohjoismaisesta vertailusta
analyyttisesti käyttökelpoista.

**Kirjoittaa:** `indicators_ref`

---

### 3. elasticities
**Milloin:** Kun `time_series` tai `sector_series` muuttuu merkittävästi
(uusi vuosi tai uusi indikaattori).

Laskee Pearson-korrelaatiot kaikille `j_code_indicator`-linkeille,
testaa lag-arvot 0–10 vuotta, valitsee parhaan.
Ei ylikirjoita `verified=true`-rivejä.

**Kirjoittaa:** `elasticities` (upsert, ohittaa verified=true)

Confidence-luokitus:
- vahva:       |r| ≥ 0.70 ja p < 0.01
- kohtalainen: |r| ≥ 0.45 ja p < 0.05
- heikko:      kaikki muut merkitsevät (p < 0.05)

---

### 4. ols
**Milloin:** Kun uutta time_series-dataa tulee tai mallimäärittelyjä
muutetaan skriptin MODELS-listassa.

Ajaa OLS-regressiot neljälle ennalta määritellylle mallille:
- TFR-selittäjät (nuorisotyöttömyys, osa-aikatyö, asuminen)
- MT-panos-tuotos (avohoito vs itsemurhat)
- Lastensuojelun tarpeen ennuste
- Vanhuspalvelu-tehokkuus

**Kirjoittaa:** `ols_models`, `ols_coefficients`, `statistical_tests`

---

### 5. forecasts
**Milloin:** Kun `time_series.j_code='syntyvyys_tfr'` päivittyy.

Päivittää TFR-ennusteet kolmella skenaariolla (baseline,
optimistinen, pessimistinen) sovittamalla lineaarisen trendin
viimeisille 10 vuodelle.

**Kirjoittaa:** `tfr_forecast` (upsert year,scenario)

---

### 6. hoiva_aalto
**Milloin:** Kun `sector_target_population` (vanhus_vammais) päivittyy.

Laskee tehoasumisen ja kotihoidon tarpeen 75+-väestölle kertoimilla:
- Tehoasuminen: 8.5% (2023-taso)
- Kotihoito: 13.5% (2023-taso)

Kertoimet päivitettävä käsin kun THL julkaisee uudet luvut.

**Kirjoittaa:** `hoiva_aalto_projection`

---

### 7. analytics_snapshot
**Milloin:** Jokaisen ajon lopussa automaattisesti.

Tallentaa rivimäärät keskeisistä tauluista `analytics_events`-tauluun.
Aktivoi taulun joka on tällä hetkellä tyhjä.

**Kirjoittaa:** `analytics_events`

---

## Automaatio (cron / GitHub Actions)

### Cron — ajetaan viikoittain tai kun data päivittyy

```bash
# crontab -e
# Joka sunnuntai klo 03:00
0 3 * * 0 cd /polku/ttt && python ttt_pipeline.py >> logs/pipeline.log 2>&1
```

### GitHub Actions — ajetaan kun data-tiedostoja pushattaan

```yaml
# .github/workflows/ttt_pipeline.yml
name: TTT Pipeline
on:
  push:
    paths:
      - 'data/**'
      - 'ttt_pipeline.py'
  schedule:
    - cron: '0 3 * * 0'   # Joka sunnuntai

jobs:
  pipeline:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install -r requirements.txt
      - run: python ttt_pipeline.py
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
```

---

## Kun lisäät uutta dataa — tarkistuslista

| Data-tyyppi | Mitä tehdä | Pipeline-askel |
|-------------|------------|----------------|
| Uusi vuosi amounts/cofog | Lisää mappings, aja pipeline | per_capita + elasticities |
| Uusi time_series-indikaattori | Lisää indicators_ref, lisää j_code_indicator-linkki | elasticities + ols |
| Päivitetty TFR | Lisää time_series-rivi | forecasts |
| Uusi nordic_indicators-data | Lisää rivit tauluun | nordic_sync |
| Väestödata muuttunut | Päivitä sector_target_population | per_capita + hoiva_aalto |
| Uusi OLS-malli | Lisää spec MODELS-listaan skriptissä | ols |

---

## Virheidenkäsittely

- `verified=true`-elasticities-rivit eivät koskaan ylikirjoitu
- `--dry-run` näyttää mitä tehtäisiin ilman kirjoitusta
- Skripti palauttaa exit-koodin 1 jos jokin askel epäonnistuu
- Kaikki kirjoitukset ovat upsert-operaatioita — turvallista ajaa uudelleen

---

## Mallien lisääminen

Lisää uusi OLS-malli `MODELS`-listaan `step_ols`-funktiossa:

```python
{
    "model_id": "uusi_malli_id",       # uniikki tunniste
    "outcome": "indikaattori_ext_id",  # selitettävä muuttuja
    "predictors": [                    # selittäjät (indicators_ref.external_id)
        "selittaja_1",
        "selittaja_2",
    ],
    "period": "2010-2023",
    "notes": "Mitä malli mittaa",
},
```

Indikaattorit haetaan automaattisesti `time_series`-taulusta.
Puuttuvat sarakkeet ohitetaan varoituksella.
