// Página de créditos y fuentes (creditos.html): registro de atribución de cada
// material visual del sitio. Antes vivía en el pie común; se movió a una página
// dedicada, enlazada desde el pie (contrato assets.md §"Atribución obligatoria",
// contracts/footer-credits.md).
//
// `ASSET_CREDITS` es la fuente de verdad en código, sincronizada 1:1 con
// assets/img/CREDITOS.md (invariante del contrato). Solo se listan los assets
// DESCARGADOS; los pendientes se suman cuando el archivo entra a assets/img/
// (misma convención de honestidad que el resto del sitio: nada que produzca 404).
//
// `buildCreditosContent()` es pura e importable sin navegador para el test TDD
// (Principio V); `init()` hace la inyección real en el <main> de creditos.html.

const INTRO =
  'Fuentes del material visual: catálogo aprobado (Wikimedia Commons, NASA Image Library, ESA/Hubble) y fotogramas de la película (FILMGRAB, uso académico con atribución al titular del copyright). Atribución por asset:';

// Atribución por asset según assets/img/CREDITOS.md (FR-013, SC-008).
// Formato de cada línea: `<archivo> — <atribución> (<fuente del catálogo>)`.
export const ASSET_CREDITS = [
  'hero-backdrop.jpg — Event Horizon Telescope Collaboration, CC BY 4.0 (Wikimedia Commons)',
  'ciencia-agujero-negro.jpg — NASA/JPL-Caltech (NASA Image Library)',
  'mundos-tierra.jpg — NASA (Blue Marble 2012)',
  'personajes-astronauta.jpg — NASA (astronauta Scott Tingle)',
  'viaje-pilares-de-creacion.jpg — NASA, ESA/Hubble',
  'mundos-gargantua.jpg — © Warner Bros. Pictures / Paramount Pictures, uso académico con atribución (FILMGRAB)',
  'mundos-miller.jpg — © Warner Bros. Pictures / Paramount Pictures, uso académico con atribución (FILMGRAB)',
  'mundos-mann.jpg — © Warner Bros. Pictures / Paramount Pictures, uso académico con atribución (FILMGRAB)',
  'mundos-tesseract.jpg — © Warner Bros. Pictures / Paramount Pictures, uso académico con atribución (FILMGRAB)',
  'personajes-cooper.jpg — © Warner Bros. Pictures / Paramount Pictures, uso académico con atribución (FILMGRAB)',
  'personajes-murph.jpg — © Warner Bros. Pictures / Paramount Pictures, uso académico con atribución (FILMGRAB)',
  'personajes-brand.jpg — © Warner Bros. Pictures / Paramount Pictures, uso académico con atribución (FILMGRAB)',
  'personajes-profesor-brand.jpg — © Warner Bros. Pictures / Paramount Pictures, uso académico con atribución (FILMGRAB)',
  'personajes-mann.jpg — © Warner Bros. Pictures / Paramount Pictures, uso académico con atribución (FILMGRAB)',
  'personajes-tars-case.jpg — © Warner Bros. Pictures / Paramount Pictures, uso académico con atribución (FILMGRAB)',
];

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

// Devuelve el HTML a inyectar dentro de la sección de créditos: la nota de
// fuentes + la lista de atribución por asset. Sin datos propios: sin argumento
// usa ASSET_CREDITS (misma convención de pureza que buildHeader en layout.js).
export function buildCreditosContent(credits = ASSET_CREDITS) {
  const items = credits
    .map((credit) => `      <li>${escapeHtml(credit)}</li>`)
    .join('\n');
  return `<p>${escapeHtml(INTRO)}</p>
    <ul class="creditos-lista">
${items}
    </ul>`;
}

export function init() {
  if (typeof document === 'undefined') {
    return;
  }
  // Contenedor marcado en creditos.html; si no está (otra página, DOM de prueba)
  // el módulo es inofensivo.
  const target = document.querySelector('[data-creditos]');
  if (!target || typeof target.insertAdjacentHTML !== 'function') {
    return;
  }
  target.insertAdjacentHTML('beforeend', buildCreditosContent());
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init());
  } else {
    init();
  }
}
