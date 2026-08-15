# Atlante dei Vulcani

Mappa interattiva, in stile National Geographic, di 958 vulcani olocenici del mondo
(database Smithsonian Institution — Global Volcanism Program), con marker geolocalizzati
raggruppati per tipologia e clusterizzati automaticamente.

Sito live: https://lucavarlani-max.github.io/mappa-vulcani/

## Funzionalità

- 958 vulcani geolocalizzati, colorati per tipologia (stratovulcano, scudo, caldera,
  campo vulcanico, ecc.) con legenda
- Ricerca per nome del vulcano o paese, con zoom automatico al risultato
- Click su un vulcano: popup con
  - foto recuperata in tempo reale da Wikipedia (con estratto testuale)
  - **condizioni meteo attuali in tempo reale** (Open-Meteo)
  - ultima eruzione conosciuta (fonte Smithsonian GVP)
  - link a webcam live per i vulcani più iconici (Etna, Stromboli, Vesuvio, Kilauea,
    Fuji, Sakurajima, Popocatépetl, Villarrica, Piton de la Fournaise)
- Mappa topografica (OpenTopoMap) con trattamento cromatico scuro/seppia

## Come si vede

```bash
python -m http.server 8756
```

poi apri `http://localhost:8756/index.html`.

Su Windows, in alternativa, basta fare doppio click su `Avvia Atlante.bat`.

## Dati

- `data/volcano_raw.csv`: dataset grezzo (Smithsonian GVP, via tidytuesday)
- `data/volcanoes.json`: dataset elaborato usato dalla mappa (generato da `convert.py`)
