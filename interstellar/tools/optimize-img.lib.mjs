// Lógica pura del pipeline de imágenes (sin I/O): qué archivos, a qué ancho y con qué nombres.
// Testeado en tests/optimize-img.test.js.

// Anchos objetivo por contexto de uso.
export const TARGET_WIDTHS = Object.freeze({
  'poster-hero': 1280,
  'backdrop-mundo': 2560,
  'galeria-miniatura': 800,
  'galeria-ampliada': 1600,
  'filmstrip-frame': 900,
  'retrato-personaje': 720,
});

// Calidad WebP por contexto: retratos 80, poster-hero 52, resto 74 (ver docs/20-notas-de-codigo/).
export function webpQuality(context) {
  if (context === 'retrato-personaje') return 80;
  if (context === 'poster-hero') return 52;
  return 74;
}

// Nunca agranda: si la fuente es más chica que el objetivo, se respeta la fuente.
export function resolveTargetWidth(context, sourceWidth) {
  const target = TARGET_WIDTHS[context];
  if (target === undefined) {
    throw new Error(`resolveTargetWidth: contexto desconocido "${context}"`);
  }
  return Math.min(target, sourceWidth);
}

// Nombres servibles a partir del nombre lógico + formato fuente.
export function deriveOutputs(logicalName, sourceFormat) {
  const fmt = String(sourceFormat).toLowerCase().replace(/^\./, '');
  if (fmt === 'svg') {
    throw new Error(`deriveOutputs: "${logicalName}" es svg — fuera del pipeline`);
  }
  const ext = fmt === 'jpeg' ? 'jpg' : fmt;
  return { webp: `${logicalName}.webp`, fallback: `${logicalName}.${ext}` };
}

// Reducción porcentual de peso; pasaMinimo = cumple el −25 %.
export function weightDelta(bytesAntes, bytesDespues) {
  if (!bytesAntes || bytesAntes <= 0) return { pct: 0, pasaMinimo: false };
  const pct = Math.round((1 - bytesDespues / bytesAntes) * 100);
  return { pct, pasaMinimo: pct >= 25 };
}

// Guard: el .webp solo se escribe si es ESTRICTAMENTE más liviano que su respaldo.
export function webpConviene(webpBytes, respaldoBytes) {
  if (!Number.isFinite(respaldoBytes) || respaldoBytes <= 0) return false;
  if (!Number.isFinite(webpBytes) || webpBytes <= 0) return false;
  return webpBytes < respaldoBytes;
}

// Contexto canónico por archivo: se procesa UNA vez, con el ancho de su uso más exigente;
// el resto cae en 'galeria-ampliada'.

const BACKDROP_MUNDO = new Set([
  // portada scroll: Tierra + Gargantúa
  'terra-granja', 'terra-maizal', 'terra-tormenta', 'terra-abandonada',
  'mundos-gargantua', 'ciencia-gargantua',
  'mundos-gargantua-plano', 'mundos-gargantua-endurance',
  'mundos-gargantua-ranger', 'mundos-gargantua-deriva',
  // portada scroll: Miller / Mann / Tesseract
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

// section -> { markup: [archivos a migrar a mano], images: [{ name, kind }] }
// kind: 'css' (background-image) | 'img' (<img> / poster).

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
  // Frames con nombre de backdrop de `mundos-portada` caen en 'backdrop-mundo' (contextForImage).
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
  // Provisional: lista vacía hasta cerrar el contenido de la galería.
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
