/* Atlante Geografico dei Vulcani — National Geographic style volcano atlas */

const CATEGORIES = [
  { key: 'strato',   label: 'Stratovulcano',      color: '#e2572b', test: t => t.includes('strato') },
  { key: 'shield',   label: 'Vulcano a scudo',     color: '#ffb300', test: t => t.includes('shield') },
  { key: 'caldera',  label: 'Caldera',             color: '#c0392b', test: t => t.includes('caldera') },
  { key: 'complex',  label: 'Complesso vulcanico',  color: '#9b6b9e', test: t => t.includes('complex') || t.includes('compound') },
  { key: 'dome',     label: 'Duomo di lava',       color: '#8a8375', test: t => t.includes('dome') },
  { key: 'cone',     label: 'Cono / Maar / Fessura', color: '#c9974a', test: t => t.includes('cone') || t.includes('maar') || t.includes('tuff') || t.includes('fissure') || t.includes('crater row') },
  { key: 'field',    label: 'Campo vulcanico',     color: '#6b8f3e', test: t => t.includes('field') },
  { key: 'sub',      label: 'Sottomarino / Subglaciale', color: '#2e86ab', test: t => t.includes('submarine') || t.includes('subglacial') },
  { key: 'other',    label: 'Altro',               color: '#9a978d', test: () => true },
];

function categoryOf(type) {
  const t = (type || '').toLowerCase();
  return CATEGORIES.find(c => c.test(t));
}

// Alcuni nomi di vulcano coincidono con voci Wikipedia generiche (es. "Vulcano" -> la
// voce enciclopedica sul concetto di vulcano, non l'isola) o con nomi di stati/luoghi
// omonimi. Qui correggiamo manualmente il titolo giusto da cercare, o disattiviamo la
// ricerca quando non esiste una voce dedicata corretta.
const WIKI_TITLE_OVERRIDE = {
  '211050': { lang: 'it', title: 'Isola di Vulcano' }, // Vulcano (Isole Eolie), non il concetto generico "vulcano"
  '390015': { lang: 'it', title: 'Monte Melbourne' }, // vulcano antartico, non la città australiana
  '390022': { lang: 'en', title: 'Mount Berlin' }, // vulcano antartico, non la capitale tedesca
  '224010': { lang: 'en', title: 'Mount Cameroon' }, // vulcano, non lo stato
  '341040': { lang: 'en', title: 'Colima Volcano' }, // Volcán de Colima, non lo stato messicano di Colima
  '343050': { lang: 'en', title: 'San Salvador (volcano)' }, // vulcano, non la città capitale
  '353090': { lang: 'en', title: 'Santiago Island (Galápagos)' }, // isola vulcanica delle Galápagos, non la capitale del Cile
};
const WIKI_SKIP = new Set([
  '353011', // Ecuador (vulcano dei Galápagos) -> altrimenti risolverebbe sullo stato Ecuador
  '221170', // Adwa (vulcano etiope) -> altrimenti risolverebbe sulla città di Adua/Adwa; nessuna voce dedicata trovata
]);

// Il dataset Smithsonian GVP usato è fermo al ~2020: per i vulcani più attivi del
// pianeta "ultima eruzione conosciuta" risulta quindi obsoleta (es. Etna segnava 2020
// mentre è in eruzione dall'agosto 2026). Qui correggiamo manualmente i casi verificati
// tramite fonti ufficiali (INGV, USGS, OVPF, JMA), con data di verifica in chiaro.
const ERUPTION_OVERRIDE = {
  '211060': { text: 'In corso — nuova fase eruttiva dal 6 agosto 2026, fontane di lava e nuove bocche in Valle del Bove', verified: '15 agosto 2026', source: 'INGV Osservatorio Etneo' },
  '211040': { text: 'Attività stromboliana persistente, con parossismi il 23 maggio e il 12 giugno 2026', verified: '15 agosto 2026', source: 'INGV' },
  '332010': { text: 'Eruzione a episodi dal 23 dicembre 2024 — ultimo episodio (53°) il 12-13 agosto 2026, ora in pausa', verified: '15 agosto 2026', source: 'USGS - Hawaiian Volcano Observatory' },
  '341090': { text: 'Attività persistente nel 2026, con decine di esalazioni di cenere e gas al giorno (semaforo giallo, fase 2)', verified: '15 agosto 2026', source: 'CENAPRED' },
  '233020': { text: 'Eruzione del 13 febbraio 2026, con colata di lava sul fianco sud che ha raggiunto la strada nazionale il 13 marzo (conclusa il 25 marzo)', verified: '15 agosto 2026', source: 'OVPF-IPGP' },
  '282080': { text: 'Attività esplosiva frequente nel 2025-2026, con una grande eruzione ad aprile 2026 (pennacchio di cenere di 3,4 km)', verified: '15 agosto 2026', source: 'JMA / GVP' },
  '264180': { text: 'In corso — emissioni di cenere quasi quotidiane fino alla prima settimana di agosto 2026 (pennacchi fino a 1200 m)', verified: '15 agosto 2026', source: 'PVMBG / VolcanoDiscovery' },
  '263300': { text: 'Attività esplosiva in corso nel 2026, livello di allerta 3 (Standby)', verified: '15 agosto 2026', source: 'PVMBG' },
  '268030': { text: 'Attività esplosiva persistente nel 2026', verified: '15 agosto 2026', source: 'PVMBG / MAGMA Indonesia' },
  '268010': { text: 'Attività eruttiva pressoché continua nel 2026 — uno dei vulcani più costantemente attivi al mondo', verified: '15 agosto 2026', source: 'PVMBG' },
  '262000': { text: 'Attività esplosiva intermittente in corso nel 2026 (Anak Krakatau)', verified: '15 agosto 2026', source: 'PVMBG / VolcanoDiscovery' },
  '342090': { text: 'Attività stromboliana quasi continua; una fase eruttiva più intensa si è conclusa il 3-4 agosto 2026', verified: '15 agosto 2026', source: 'INSIVUMEH' },
};

// Sottoinsieme di ERUPTION_OVERRIDE ritenuto in eruzione attiva proprio ora (non solo
// "attività recente"): usato per l'icona verde sulla mappa. Elenco curato e verificato
// manualmente il 15 agosto 2026 — non esaustivo (il GVP ne segue in media una ventina
// contemporaneamente nel mondo): Kilauea è escluso perché in pausa tra un episodio e
// l'altro, Piton de la Fournaise perché l'eruzione si è conclusa a marzo 2026.
const ACTIVE_NOW = new Set([
  '211060', // Etna
  '211040', // Stromboli
  '282080', // Sakurajima (Aira)
  '264180', // Lewotobi
  '263300', // Semeru
  '268030', // Ibu
  '268010', // Dukono
  '262000', // Krakatau
  '342090', // Fuego
  '341090', // Popocatépetl
]);
const ACTIVE_NOW_VERIFIED = '15 agosto 2026';

const WMO = {
  0:['Sereno','☀️'],1:['Prevalentemente sereno','🌤️'],2:['Parzialmente nuvoloso','⛅'],3:['Nuvoloso','☁️'],
  45:['Nebbia','🌫️'],48:['Nebbia con brina','🌫️'],
  51:['Pioviggine leggera','🌦️'],53:['Pioviggine','🌦️'],55:['Pioviggine intensa','🌦️'],
  61:['Pioggia debole','🌧️'],63:['Pioggia','🌧️'],65:['Pioggia intensa','🌧️'],
  66:['Pioggia gelata','🌧️'],67:['Pioggia gelata intensa','🌧️'],
  71:['Neve debole','🌨️'],73:['Neve','🌨️'],75:['Neve intensa','❄️'],77:['Granelli di neve','❄️'],
  80:['Rovesci deboli','🌦️'],81:['Rovesci','🌧️'],82:['Rovesci violenti','⛈️'],
  85:['Rovesci di neve','🌨️'],86:['Rovesci di neve intensi','❄️'],
  95:['Temporale','⛈️'],96:['Temporale con grandine','⛈️'],99:['Temporale violento con grandine','⛈️'],
};

let ALL = [];
let markerIndex = {}; // id -> leaflet marker

const ACTIVE_SVG = `<svg viewBox="0 0 24 24" width="14" height="14"><path d="M3 19l6-13 3 5 2-3 7 11H3z" fill="#fff"/><path d="M11.2 5.4c.8-1 .8-2.1 0-3.1" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>`;

function iconFor(v) {
  if (ACTIVE_NOW.has(v.id)) {
    return L.divIcon({
      className: 'volcano-icon-wrap',
      html: `<div class="volcano-icon-active" title="Vulcano attivo ora">${ACTIVE_SVG}</div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      popupAnchor: [0, -12],
    });
  }
  const cat = categoryOf(v.type);
  return L.divIcon({
    className: 'volcano-icon-wrap',
    html: `<div class="volcano-icon" style="width:11px;height:11px;background:${cat.color}"></div>`,
    iconSize: [11, 11],
    iconAnchor: [5, 5],
    popupAnchor: [0, -6],
  });
}

function popupShell(v) {
  const cat = categoryOf(v.type);
  const webcamHtml = v.webcam
    ? `<a class="vc-webcam-btn" href="${v.webcam.url}" target="_blank" rel="noopener noreferrer">🎥 Guarda la webcam — ${v.webcam.label}</a>`
    : `<span class="vc-webcam-none">Nessuna webcam pubblica nota per questo vulcano</span>`;

  const eruptOverride = ERUPTION_OVERRIDE[v.id];
  const eruptText = eruptOverride ? eruptOverride.text : v.erupt;
  const eruptNote = eruptOverride
    ? `<div class="vc-erupt-note vc-erupt-note--fresh">✓ Verificato il ${eruptOverride.verified} — fonte: ${eruptOverride.source}</div>`
    : `<div class="vc-erupt-note">Dato Smithsonian GVP (dataset ~2020) — potrebbero esistere eruzioni più recenti non riportate qui</div>`;

  const activeBadge = ACTIVE_NOW.has(v.id) ? `<div class="vc-active-badge">🌋 Attivo ora</div>` : '';

  return `
    <div class="vc-photo vc-photo-fallback" data-photo="1">
      ${activeBadge}
      <div class="vc-photo-caption">
        <div class="vc-name">${v.name}</div>
        <div class="vc-country">${v.country}${v.region ? ' · ' + v.region : ''}</div>
      </div>
    </div>
    <div class="vc-body">
      <div class="vc-row">
        <span class="ico">⛰️</span>
        <div><span class="vc-label">Tipologia · Quota</span>${cat.label} · ${v.elev} m s.l.m.</div>
      </div>
      <div class="vc-row">
        <span class="ico">🌋</span>
        <div><span class="vc-label">Ultima eruzione conosciuta</span>${eruptText}${eruptNote}</div>
      </div>
      <div class="vc-row vc-weather-row">
        <span class="ico">🌡️</span>
        <div style="flex:1">
          <span class="vc-label">Condizioni attuali</span>
          <span class="vc-loading">Rilevamento in corso…</span>
        </div>
      </div>
      <div class="vc-extract-wrap"></div>
      <div class="vc-row" style="margin-top:2px;">
        ${webcamHtml}
      </div>
      <div class="vc-source">Vulcano #${v.id} · Fonte dati: Smithsonian GVP</div>
    </div>
  `;
}

async function enrichPopup(v, node) {
  // --- weather ---
  const weatherRow = node.querySelector('.vc-weather-row > div');
  fetch(`https://api.open-meteo.com/v1/forecast?latitude=${v.lat}&longitude=${v.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`)
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(data => {
      const c = data.current;
      const w = WMO[c.weather_code] || ['Condizioni non disponibili', '🌐'];
      weatherRow.innerHTML = `
        <span class="vc-label">Condizioni attuali (in tempo reale)</span>
        <div class="vc-weather">
          <span class="vc-weather-icon">${w[1]}</span>
          <span>${Math.round(c.temperature_2m)}°C, ${w[0]} · vento ${Math.round(c.wind_speed_10m)} km/h · um. ${c.relative_humidity_2m}%</span>
        </div>`;
    })
    .catch(() => {
      weatherRow.innerHTML = `<span class="vc-label">Condizioni attuali</span><span class="vc-loading">Dati meteo non disponibili</span>`;
    });

  // --- photo + extract via Wikipedia ---
  if (WIKI_SKIP.has(v.id)) return;
  const photoEl = node.querySelector('[data-photo]');
  const extractWrap = node.querySelector('.vc-extract-wrap');

  async function tryWiki(lang, titleOverride) {
    const title = encodeURIComponent((titleOverride || v.name).replace(/ /g, '_'));
    const res = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${title}`, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('not found');
    return res.json();
  }

  try {
    let data;
    const override = WIKI_TITLE_OVERRIDE[v.id];
    if (override) {
      data = await tryWiki(override.lang, override.title);
    } else {
      try { data = await tryWiki('it'); } catch (e) { data = await tryWiki('en'); }
    }
    if (data.thumbnail && data.thumbnail.source) {
      const imgUrl = data.thumbnail.source.replace(/\/\d+px-/, '/500px-');
      photoEl.style.backgroundImage = `url('${imgUrl}')`;
      photoEl.classList.remove('vc-photo-fallback');
    }
    if (data.extract) {
      extractWrap.innerHTML = `<div class="vc-extract">"${data.extract.slice(0, 160)}${data.extract.length > 160 ? '…' : ''}" <span style="opacity:.6">— Wikipedia</span></div>`;
    }
  } catch (e) {
    // no wiki data available — keep fallback visuals
  }
}

function buildLegend() {
  const list = document.getElementById('legend-list');
  const used = new Set(ALL.map(v => categoryOf(v.type).key));
  CATEGORIES.filter(c => used.has(c.key)).forEach(c => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="dot" style="background:${c.color}"></span>${c.label}`;
    list.appendChild(li);
  });
  const li = document.createElement('li');
  li.innerHTML = `<span class="dot dot--active">${ACTIVE_SVG}</span>Attivo ora (${ACTIVE_NOW.size}, verificato ${ACTIVE_NOW_VERIFIED})`;
  list.appendChild(li);
}

function initMap() {
  const map = L.map('map', {
    worldCopyJump: true,
    minZoom: 2,
    maxZoom: 17,
    zoomControl: false,
  }).setView([15, 10], 3);

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  const topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Mappa: © OpenTopoMap (CC-BY-SA) · dati © OpenStreetMap contributors, SRTM',
    subdomains: 'abc',
    maxZoom: 17,
    className: 'natgeo-tiles',
  }).addTo(map);

  const cluster = L.markerClusterGroup({
    maxClusterRadius: 45,
    iconCreateFunction: function (c) {
      const count = c.getChildCount();
      const size = count > 100 ? 44 : count > 20 ? 36 : 28;
      return L.divIcon({
        html: `<span>${count}</span>`,
        className: 'marker-cluster-custom',
        iconSize: [size, size],
      });
    },
  });

  ALL.forEach(v => {
    const marker = L.marker([v.lat, v.lon], { icon: iconFor(v) });
    marker.bindPopup(popupShell(v), { maxWidth: 300, minWidth: 300, className: 'volcano-popup' });
    marker.on('popupopen', (e) => enrichPopup(v, e.popup._contentNode));
    markerIndex[v.id] = marker;
    cluster.addLayer(marker);
  });

  map.addLayer(cluster);
  return { map, cluster };
}

function normalize(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function setupSearch(map, cluster) {
  const box = document.getElementById('search-box');
  const results = document.getElementById('search-results');
  let timer;

  box.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const q = normalize(box.value.trim());
      if (q.length < 2) { results.classList.remove('show'); results.innerHTML = ''; return; }
      const matches = ALL.filter(v => normalize(v.name).includes(q) || normalize(v.country).includes(q)).slice(0, 30);
      if (!matches.length) {
        results.innerHTML = `<div class="search-item">Nessun risultato</div>`;
      } else {
        results.innerHTML = matches.map(v =>
          `<div class="search-item" data-id="${v.id}">${v.name} <small>${v.country}</small></div>`
        ).join('');
      }
      results.classList.add('show');
    }, 150);
  });

  results.addEventListener('click', (e) => {
    const item = e.target.closest('.search-item');
    if (!item || !item.dataset.id) return;
    const v = ALL.find(x => x.id === item.dataset.id);
    if (!v) return;
    results.classList.remove('show');
    box.value = v.name;
    map.setView([v.lat, v.lon], 10, { animate: true });
    const marker = markerIndex[v.id];
    setTimeout(() => {
      cluster.zoomToShowLayer(marker, () => marker.openPopup());
    }, 300);
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.top-controls')) results.classList.remove('show');
  });
}

async function boot() {
  const res = await fetch('data/volcanoes.json');
  ALL = await res.json();
  document.getElementById('stat-count').textContent = ALL.length;
  buildLegend();
  const { map, cluster } = initMap();
  setupSearch(map, cluster);
  document.getElementById('loading-banner').classList.add('hidden');
}

boot();
