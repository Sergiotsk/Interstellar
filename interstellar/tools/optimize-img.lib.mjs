// Lógica pura del pipeline de optimización de imágenes (feature 007).
// Sin I/O: se testea en tests/optimize-img.test.js (Principio V — Strict TDD).
// El CLI (optimize-img.mjs) consume esto para saber QUÉ archivos tocar, a qué
// ancho y con qué nombres de salida.

// --- Anchos objetivo por contexto de uso (Clarifications 2026-09-08) -----------
export const TARGET_WIDTHS = Object.freeze({
  'poster-hero': 1280,
  'backdrop-mundo': 2560,
  'galeria-miniatura': 800,
  'galeria-ampliada': 1600,
  'filmstrip-frame': 900,
  'retrato-personaje': 720,
});

// Calidad WebP por contexto: los retratos son informativos (no van oscurecidos),
// el resto tolera compresión más agresiva (backdrops con brightness(0.4)).
export function webpQuality(context) {
  return context === 'retrato-personaje' ? 80 : 74;
}

// --- resolveTargetWidth ------------------------------------------------------
// Nunca agranda: si la fuente es más chica que el objetivo, se respeta la fuente.
export function resolveTargetWidth(context, sourceWidth) {
  const target = TARGET_WIDTHS[context];
  if (target === undefined) {
    throw new Error(`resolveTargetWidth: contexto desconocido "${context}"`);
  }
  return Math.min(target, sourceWidth);
}

// --- deriveOutputs ---------------------------------------------------------------
// Nombres de los archivos servibles a partir del nombre lógico + formato fuente.
export function deriveOutputs(logicalName, sourceFormat) {
  const fmt = String(sourceFormat).toLowerCase().replace(/^\./, '');
  if (fmt === 'svg') {
    throw new Error(`deriveOutputs: "${logicalName}" es svg — fuera del pipeline`);
  }
  const ext = fmt === 'jpeg' ? 'jpg' : fmt;
  return { webp: `${logicalName}.webp`, fallback: `${logicalName}.${ext}` };
}

// --- weightDelta ---------------------------------------------------------------
// Reducción porcentual de peso; pasaMinimo = cumple el −25 % (SC-002).
export function weightDelta(bytesAntes, bytesDespues) {
  if (!bytesAntes || bytesAntes <= 0) return { pct: 0, pasaMinimo: false };
  const pct = Math.round((1 - bytesDespues / bytesAntes) * 100);
  return { pct, pasaMinimo: pct >= 25 };
}

// --- Contexto canónico por archivo -------------------------------------------
// Regla (D2-A, acordada 2026-09-08): un archivo se procesa UNA vez, con el ancho
// de su USO MÁS EXIGENTE. Mapa explícito de los archivos de secciones estables;
// el resto cae en 'galeria-ampliada' (1600) por defecto.
//
// PROVISIONAL para la galería: el usuario va a rehacer galeria.html y puede no
// reutilizar estas imágenes. Cuando se migren las secciones `galeria` y
// `personajes` (Fase 4), reconciliar acá: si un archivo queda además en la
// galería nueva, subirlo a max(su contexto, 'galeria-ampliada').

const BACKDROP_MUNDO = new Set([
  // portada scroll en css/mundos.css
  'terra-granja', 'terra-maizal', 'terra-tormenta', 'terra-abandonada',
  'mundos-gargantua', 'ciencia-gargantua',
  'mundos-gargantua-plano', 'mundos-gargantua-endurance',
  'mundos-gargantua-ranger', 'mundos-gargantua-deriva',
  // heros de mundo (hub + fichas de detalle)
  'mundos-tierra', 'mundos-miller', 'mundos-mann', 'mundos-tesseract',
  // heros de sección
  'ciencia-agujero-negro', 'ciencia-teseracto-biblioteca',
]);

const RETRATO_PERSONAJE = new Set([
  'personajes-cooper', 'personajes-murph', 'personajes-brand',
  'personajes-profesor-brand', 'personajes-mann', 'personajes-tars-case',
]);

export function contextForImage(logicalName) {
  if (logicalName === 'hero-gargantua') return 'poster-hero';
  if (BACKDROP_MUNDO.has(logicalName)) return 'backdrop-mundo';
  if (RETRATO_PERSONAJE.has(logicalName)) return 'retrato-personaje';
  if (/^mundos-(tierra|gargantua)-/.test(logicalName)) return 'filmstrip-frame';
  return 'galeria-ampliada';
}

// --- SECTION_MAP -------------------------------------------------------------
// section -> { markup: [archivos a migrar a mano], images: [{ name, kind }] }
// kind: 'css' (background-image) | 'img' (<img> / poster).
// `sectionConfig` mapea cada name a su contexto vía contextForImage().

const img = (names) => names.map((name) => ({ name, kind: 'img' }));
const css = (names) => names.map((name) => ({ name, kind: 'css' }));

export const SECTION_MAP = Object.freeze({
  'mundos-portada': {
    markup: ['css/mundos.css'],
    images: css([
      'terra-granja', 'terra-maizal', 'terra-tormenta', 'terra-abandonada',
      'mundos-gargantua', 'ciencia-gargantua',
      'mundos-gargantua-plano', 'mundos-gargantua-endurance',
      'mundos-gargantua-ranger', 'mundos-gargantua-deriva',
    ]),
  },
  'mundos-hub': {
    markup: ['mundos.html', 'mundos-mann.html', 'mundos-miller.html', 'mundos-tesseract.html'],
    images: img(['mundos-tierra', 'mundos-gargantua', 'mundos-miller', 'mundos-mann', 'mundos-tesseract']),
  },
  'filmstrip-tierra': {
    markup: ['mundos-tierra.html'],
    images: img([
      'mundos-tierra-maizal-aereo', 'mundos-tierra-granja', 'mundos-tierra-tormenta',
      'mundos-tierra-camino', 'mundos-tierra-abandonada', 'mundos-tierra-atardecer',
      'mundos-tierra-cabina', 'mundos-tierra-ruta', 'mundos-tierra-dron',
      'mundos-tierra-cosechadora', 'mundos-tierra-familia', 'mundos-tierra-escuela',
      'mundos-tierra-beisbol', 'mundos-tierra-patio', 'mundos-tierra-desayuno',
      'mundos-tierra-habitacion', 'mundos-tierra-biblioteca', 'mundos-tierra-murph-campo',
      'mundos-tierra-porche', 'mundos-tierra-donald',
    ]),
  },
  'filmstrip-gargantua': {
    markup: ['mundos-gargantua.html'],
    images: img([
      'mundos-gargantua', 'ciencia-gargantua', 'mundos-gargantua-plano',
      'mundos-gargantua-descenso', 'mundos-gargantua-endurance', 'mundos-gargantua-cabina',
      'mundos-gargantua-nave', 'mundos-gargantua-amelia', 'mundos-gargantua-cooper',
      'mundos-gargantua-disco-cerca', 'mundos-gargantua-ranger', 'mundos-gargantua-chispas',
      'mundos-gargantua-caida', 'mundos-gargantua-deriva', 'hero-gargantua',
    ]),
  },
  personajes: {
    markup: ['personajes.html'],
    images: img([
      'personajes-cooper', 'personajes-murph', 'personajes-brand',
      'personajes-profesor-brand', 'personajes-mann', 'personajes-tars-case',
    ]),
  },
  ciencia: {
    markup: ['ciencia.html'],
    images: img(['ciencia-agujero-negro']),
  },
  contacto: {
    markup: ['contacto.html', 'gracias.html'],
    images: img(['ciencia-teseracto-biblioteca']),
  },
  hero: {
    markup: ['index.html'],
    images: img(['hero-gargantua']),
  },
  // PROVISIONAL — galeria.html se va a rehacer. Lista al día de 2026-09-08 pero
  // no se migra hasta que su contenido esté cerrado (FR-009).
  galeria: {
    markup: ['galeria.html'],
    images: img([]),
  },
});

export function sectionConfig(section) {
  const entry = SECTION_MAP[section];
  if (!entry) {
    throw new Error(`sectionConfig: sección desconocida "${section}"`);
  }
  return entry.images.map(({ name, kind }) => ({
    logicalName: name,
    context: contextForImage(name),
    kind,
  }));
}
