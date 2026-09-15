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
// `poster-hero` baja aún más: el <video> lo tapa en ~1 s y de fondo es un agujero
// negro sobre espacio (casi todo gradientes oscuros). q52 le saca ~12 KiB al LCP.
export function webpQuality(context) {
  if (context === 'retrato-personaje') return 80;
  if (context === 'poster-hero') return 52;
  return 74;
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

// --- webpConviene ------------------------------------------------------------
// Guard: un .webp solo se escribe si es ESTRICTAMENTE más liviano que su
// respaldo (mismo ancho, mismo contenido). Si empata o pesa más, no es una
// optimización — servir dos archivos para entregar el más grande es peor que
// no tener webp. Pasó con imágenes de mucho grano / ya muy comprimidas.
export function webpConviene(webpBytes, respaldoBytes) {
  if (!Number.isFinite(respaldoBytes) || respaldoBytes <= 0) return false;
  if (!Number.isFinite(webpBytes) || webpBytes <= 0) return false;
  return webpBytes < respaldoBytes;
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
  // portada scroll en css/mundos.css — Tierra + Gargantúa
  'terra-granja', 'terra-maizal', 'terra-tormenta', 'terra-abandonada',
  'mundos-gargantua', 'ciencia-gargantua',
  'mundos-gargantua-plano', 'mundos-gargantua-endurance',
  'mundos-gargantua-ranger', 'mundos-gargantua-deriva',
  // portada scroll en css/mundos.css — Miller / Mann / Tesseract (páginas
  // rehechas después del plan; scope ampliado 2026-09-09)
  'mundos-miller-arribo', 'mundos-miller-vadeo', 'mundos-miller-rasante',
  'mundos-miller-ola', 'mundos-miller-impacto', 'mundos-miller-muro',
  'mundos-miller-cabina',
  'mundos-mann-hielo', 'mundos-mann-superficie', 'mundos-mann-mann',
  'mundos-mann-engano', 'mundos-mann-docking', 'mundos-mann-tunel',
  'mundos-tesseract-reticula', 'mundos-tesseract-caida', 'mundos-tesseract-estante',
  'mundos-tesseract-empuje', 'mundos-tesseract-mensaje', 'mundos-tesseract-murph',
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
  if (/^mundos-(tierra|gargantua|miller|mann|tesseract)-/.test(logicalName)) return 'filmstrip-frame';
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
      // Miller / Mann / Tesseract (scope ampliado 2026-09-09)
      'mundos-miller-arribo', 'mundos-miller-vadeo', 'mundos-miller-rasante',
      'mundos-miller-ola', 'mundos-miller-impacto', 'mundos-miller-muro',
      'mundos-miller-cabina',
      'mundos-mann-hielo', 'mundos-mann-superficie', 'mundos-mann-mann',
      'mundos-mann-engano', 'mundos-mann-docking', 'mundos-mann-tunel',
      'mundos-tesseract-reticula', 'mundos-tesseract-caida', 'mundos-tesseract-estante',
      'mundos-tesseract-empuje', 'mundos-tesseract-mensaje', 'mundos-tesseract-murph',
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
  // Filmstrips de las páginas rehechas después del plan (T035, 2026-09-09).
  // Los frames que comparten nombre con un backdrop de `mundos-portada` caen en
  // 'backdrop-mundo' vía contextForImage (D2-A) y el pipeline los saltea acá.
  'filmstrip-mann': {
    markup: ['mundos-mann.html'],
    images: img([
      'mundos-mann-hielo', 'mundos-mann-superficie', 'mundos-mann-brand',
      'mundos-mann-mann', 'mundos-mann-retrato', 'mundos-mann-engano',
      'mundos-mann-escarcha', 'mundos-mann-caido', 'mundos-mann-endurance',
      'mundos-mann-docking', 'mundos-mann-tunel', 'mundos-mann-cabina',
    ]),
  },
  'filmstrip-miller': {
    markup: ['mundos-miller.html'],
    images: img([
      'mundos-miller-endurance', 'mundos-miller-pizarra', 'mundos-miller-ranger',
      'mundos-miller-descenso', 'mundos-miller-rasante', 'mundos-miller-arribo',
      'mundos-miller-cooper-casco', 'mundos-miller-doyle', 'mundos-miller-ola',
      'mundos-miller-impacto', 'mundos-miller-muro', 'mundos-miller-doyle-escotilla',
      'mundos-miller-cabina', 'mundos-miller-brand-restos', 'mundos-miller-regreso',
      'mundos-miller-romilly',
    ]),
  },
  'filmstrip-tesseract': {
    markup: ['mundos-tesseract.html'],
    images: img([
      'mundos-tesseract-horizonte', 'mundos-tesseract-profil', 'mundos-tesseract-negro',
      'mundos-tesseract-caida', 'mundos-tesseract-lattice2', 'mundos-tesseract-reticula',
      'mundos-tesseract-estante', 'mundos-tesseract-empuje', 'mundos-tesseract-mensaje',
      'mundos-tesseract-murph',
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
