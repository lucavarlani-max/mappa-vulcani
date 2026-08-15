import csv
import json

CURATED_WEBCAMS = {
    "332010": {"label": "USGS - Kilauea (Hawaii)", "url": "https://www.usgs.gov/volcanoes/kilauea/webcams"},
    "211060": {"label": "INGV Osservatorio Etneo - Etna", "url": "https://www.ct.ingv.it/index.php/monitoraggio-e-sorveglianza/segnali-in-tempo-reale/video-sorveglianza-vulcanica-etna"},
    "211040": {"label": "INGV - Isole Eolie (Stromboli)", "url": "https://www.ct.ingv.it/index.php/monitoraggio-e-sorveglianza/segnali-in-tempo-reale/video-sorveglianza-vulcanica-isole-eolie"},
    "211020": {"label": "INGV Osservatorio Vesuviano - Vesuvio", "url": "https://www.ov.ingv.it/index.php/monitoraggio-e-infrastrutture/segnali-in-tempo-reale/video-sorveglianza"},
    "341090": {"label": "Webcams de Mexico - Popocatepetl (Tlamacas)", "url": "https://webcamsdemexico.com/webcam/popocatepetl-tlamacas/"},
    "233020": {"label": "OVPF-IPGP - Piton de la Fournaise", "url": "https://www.ipgp.fr/volcanoweb/reunion/html_static_webcam/cameras-ovpf.html"},
    "357120": {"label": "Sernageomin RNVV - Villarrica", "url": "https://rnvv.sernageomin.cl/volcan-villarrica/"},
    "283030": {"label": "Fujigoko.tv - Monte Fuji", "url": "https://live.fujigoko.tv/?e=1&v=1"},
    "282080": {"label": "SkylineWebcams - Sakurajima", "url": "https://www.skylinewebcams.com/en/webcam/japan/prefecture-of-kagoshima/kagoshima/volcano-sakurajima.html"},
}

def fmt_eruption(raw):
    raw = (raw or "").strip()
    if raw == "" or raw.upper() == "UNKNOWN":
        return {"text": "Sconosciuta", "sort": 999999}
    try:
        year = int(raw)
    except ValueError:
        return {"text": raw, "sort": 999999}
    if year < 0:
        return {"text": f"{abs(year)} a.C. circa", "sort": year}
    return {"text": f"{year} d.C.", "sort": year}

rows = []
with open("data/volcano_raw.csv", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for r in reader:
        try:
            lat = float(r["latitude"])
            lon = float(r["longitude"])
        except ValueError:
            continue
        vid = r["volcano_number"]
        eruption = fmt_eruption(r["last_eruption_year"])
        entry = {
            "id": vid,
            "name": r["volcano_name"].strip(),
            "type": r["primary_volcano_type"].strip(),
            "country": r["country"].strip(),
            "region": r["region"].strip(),
            "lat": lat,
            "lon": lon,
            "elev": r["elevation"].strip(),
            "erupt": eruption["text"],
            "eruptSort": eruption["sort"],
            "pop5": r["population_within_5_km"].strip(),
        }
        if vid in CURATED_WEBCAMS:
            entry["webcam"] = CURATED_WEBCAMS[vid]
        rows.append(entry)

with open("data/volcanoes.json", "w", encoding="utf-8") as f:
    json.dump(rows, f, ensure_ascii=False, separators=(",", ":"))

print(f"Written {len(rows)} volcanoes")
print("With webcams:", sum(1 for r in rows if "webcam" in r))
