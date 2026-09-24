// Personajes (personajes.html) — feature 008.
// Módulo dedicado a esta página (un módulo por responsabilidad, cargado solo
// acá), separado de js/mundo-portada.js y js/filmstrip.js a propósito: reusa
// el MISMO mecanismo que esos dos (riel + sticky + scrub con GSAP/ScrollTrigger,
// import dinámico vendorizado, degradado a prefers-reduced-motion / fallo de
// carga), pero resuelve un problema propio (galería de escenas + visor
// Nav-Ranger) y no debe acoplar Personajes a cambios futuros de Mundos.
//
// Dos piezas independientes entre sí:
//   1. initNavVisores() — ciclador del visor Nav-Ranger (US4). No está atado
//      a scroll, no depende de GSAP: setInterval + IntersectionObserver.
//   2. armarGalerias() — riel de escenas con texto sincronizado (US3).
//      GSAP + ScrollTrigger, scrub, corte duro. Degrada a flujo normal sin
//      GSAP / con reduced-motion.

let activeObserver = null;
let activeIntervals = [];
let activeInstancias = [];
let activeResizeHandler = null;

// Visor Nav-Ranger: ciclador de fotogramas que se reemplazan en loop (estilo
// stop-motion, sin crossfade). reduced-motion -> queda fijo en el primer
// fotograma (ya lo muestra el CSS vía .is-activo). IntersectionObserver ->
// pausa el setInterval cuando el visor no está en pantalla.
function initNavVisores() {
  const visores = [...document.querySelectorAll('[data-nav-visor]')];
  if (visores.length === 0) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  activeObserver = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      const ciclador = entrada.target._ciclador;
      if (!ciclador) return;
      ciclador.activo = entrada.isIntersecting;
    });
  }, { threshold: 0.15 });

  visores.forEach((visor) => {
    const frames = [...visor.querySelectorAll('.nav-visor-frame')];
    if (frames.length < 2) return; // nada que ciclar

    const intervaloMs = Number(visor.dataset.intervalo) || 600;
    let indice = 0;
    const ciclador = { activo: false };
    visor._ciclador = ciclador;

    const timer = setInterval(() => {
      if (!ciclador.activo) return;
      frames[indice].classList.remove('is-activo');
      indice = (indice + 1) % frames.length;
      frames[indice].classList.add('is-activo');
    }, intervaloMs);
    activeIntervals.push(timer);

    activeObserver.observe(visor);
  });
}

// Galería de escenas: riel + sticky + scrub. El texto (`.tira-datos-item`)
// cambia en corte duro según qué fotograma (`.tira-frame`) queda activo,
// calculado a partir del `progress` del ScrollTrigger — mismo patrón de
// riel vertical que js/mundo-portada.js, pero desplazando la tira en `x`.
async function armarGalerias() {
  const rieles = [...document.querySelectorAll('[data-riel-t]')];
  if (rieles.length === 0) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return; // flujo normal ya resuelto por CSS (sin .js-armado)

  let gsap, ScrollTrigger;
  try {
    ({ gsap } = await import('./vendor/gsap@3.13.0/gsap.mjs'));
    ({ ScrollTrigger } = await import('./vendor/gsap@3.13.0/ScrollTrigger.mjs'));
  } catch (err) {
    console.warn('[personajes] GSAP no disponible — galería en flujo normal.', err);
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add('js-armado');

  function armar(riel) {
    const datos = [...riel.querySelectorAll('.tira-datos-item')];
    const frames = [...riel.querySelectorAll('.tira-frame')];
    const pista = riel.querySelector('[data-pista]');
    const tiraViewport = riel.querySelector('.tira-fotogramas');
    const progreso = riel.querySelector('[data-progreso]');
    const total = datos.length;
    if (total < 2 || frames.length !== total) return null;

    riel.classList.add('is-armada');
    riel.style.setProperty('--riel-alto-t', `${window.innerHeight * total}px`);

    datos.forEach((el, n) => el.classList.toggle('activa', n === 0));
    frames.forEach((el, n) => el.classList.toggle('activa', n === 0));
    if (progreso) progreso.textContent = `1 / ${total}`;

    // Centro (en x) de cada fotograma dentro de la pista, medido con el
    // layout SIN transformar (offsetLeft ignora `transform`, así que da
    // igual el x actual).
    const centros = frames.map(
      (f) => f.offsetLeft + f.offsetWidth / 2 - tiraViewport.clientWidth / 2,
    );
    const segmentos = total - 1;

    const trigger = ScrollTrigger.create({
      trigger: riel,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3,
      onUpdate(self) {
        const cruda = self.progress * segmentos;
        const piso = Math.min(segmentos, Math.floor(cruda));
        const siguiente = Math.min(segmentos, piso + 1);
        const local = cruda - piso;
        const xDesde = -centros[piso];
        const xHasta = -centros[siguiente];
        gsap.set(pista, { x: xDesde + (xHasta - xDesde) * local });

        const idx = Math.round(cruda);
        datos.forEach((el, n) => el.classList.toggle('activa', n === idx));
        frames.forEach((el, n) => el.classList.toggle('activa', n === idx));
        if (progreso) progreso.textContent = `${idx + 1} / ${total}`;
      },
    });
    return { riel, trigger };
  }

  rieles.forEach((riel) => {
    const inst = armar(riel);
    if (inst) activeInstancias.push(inst);
  });

  let resizeTimer;
  activeResizeHandler = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      activeInstancias.forEach(({ trigger, riel }) => {
        trigger.kill();
        riel.classList.remove('is-armada');
      });
      activeInstancias.length = 0;
      rieles.forEach((riel) => {
        const inst = armar(riel);
        if (inst) activeInstancias.push(inst);
      });
      ScrollTrigger.refresh();
    }, 200);
  };
  window.addEventListener('resize', activeResizeHandler);
}

export function mount() {
  unmount();
  initNavVisores();
  armarGalerias();
}

export function unmount() {
  activeIntervals.forEach(clearInterval);
  activeIntervals = [];

  if (activeObserver) {
    activeObserver.disconnect();
    activeObserver = null;
  }

  if (activeResizeHandler) {
    window.removeEventListener('resize', activeResizeHandler);
    activeResizeHandler = null;
  }

  activeInstancias.forEach(({ trigger, riel }) => {
    try {
      trigger.kill();
    } catch (e) {}
    riel.classList.remove('is-armada');
  });
  activeInstancias = [];

  if (typeof document !== 'undefined' && document.body) {
    document.body.classList.remove('js-armado');
  }
}

if (typeof document !== 'undefined') {
  if (!window.__SWUP_ROUTER_ACTIVE__) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', mount);
    } else {
      mount();
    }
  }
}
