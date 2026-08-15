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
    "342090": {"label": "INSIVUMEH - Fuego", "url": "https://geo.insivumeh.gob.gt/vulcam"},
    "342030": {"label": "INSIVUMEH - Santiaguito (Santa Maria)", "url": "https://geo.insivumeh.gob.gt/vulcam"},
    "263300": {"label": "MAGMA Indonesia (PVMBG) - Semeru", "url": "https://magma.esdm.go.id/v1/gunung-api/cctv"},
    "263250": {"label": "MAGMA Indonesia (PVMBG) - Merapi", "url": "https://magma.esdm.go.id/v1/gunung-api/cctv"},
    "262000": {"label": "MAGMA Indonesia (PVMBG) - Krakatau", "url": "https://magma.esdm.go.id/v1/gunung-api/cctv"},
    "268030": {"label": "MAGMA Indonesia (PVMBG) - Ibu", "url": "https://magma.esdm.go.id/v1/gunung-api/cctv"},
    "268010": {"label": "MAGMA Indonesia (PVMBG) - Dukono", "url": "https://magma.esdm.go.id/v1/gunung-api/cctv"},
    "264180": {"label": "MAGMA Indonesia (PVMBG) - Lewotobi", "url": "https://magma.esdm.go.id/v1/gunung-api/cctv"},
    "345033": {"label": "OVSICORI-UNA - Arenal", "url": "http://www.ovsicori.una.ac.cr/vulcanologia/videoarenal.html"},
    "352010": {"label": "IGEPN - El Reventador", "url": "https://www.igepn.edu.ec/reventador-camaras"},
    "352050": {"label": "IGEPN - Cotopaxi", "url": "https://webcam.igepn.edu.ec/cotopaxi-camaras"},
    "351020": {"label": "SGC - Nevado del Ruiz", "url": "https://www2.sgc.gov.co/Noticias/Paginas/Ahora-los-colombianos-podran-ver-en-vivo-la-actividad-del-volcan-Nevado-del-Ruiz.aspx"},
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
