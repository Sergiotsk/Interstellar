// Tira de celuloide (filmstrip) — port del prototipo _lab/filmstrip-mundos.html
// (spike/librerias, commit 33eb00a). Una tira de película con perforaciones que
// desfila en loop infinito mientras está a la vista:
//   - loop cerrado sin salto (los fotogramas se duplican antes de medir)
//   - velocidad constante en px/s (SPEED) -> el ritmo no depende del largo de la tira
//   - hover / foco -> desacelera (timeScale bajo, no frena de golpe)
//   - pausa cuando la tira sale de vista (ScrollTrigger)
//
// Librería: GSAP 3.13 + ScrollTrigger (Constitucion v2.0.0, Principio I:
// libreria acotada sin build). Mismo criterio de `js/mundo-portada.js`:
// VENDORIZADA en js/vendor/gsap@3.13.0/ e importada por ruta relativa, sin
// depender de un CDN en runtime (ver js/vendor/README.md).
//
// Degradado: sin JS / GSAP no carga / prefers-reduced-motion -> la tira queda
// estatica con scroll horizontal manual (`overflow-x: auto` y sin mascara).
// GSAP solo MEJORA; nunca es requisito para ver los fotogramas.

// Ritmo base del desfile, en px/s. Constante exportada: es parte del contrato
// del componente (los tests la usan para validar la duracion del loop).
export const FILM_SPEED = 28;

// Duracion (s) de una vuelta completa para una tira de `widthPx` px.
export function loopDuration(widthPx, speedPxPerSec = FILM_SPEED) {
  return widthPx / speedPxPerSec;
}

let activeFilmstrips = [];

async function initFilmstrip() {
  unmountFilmstrip();
  const tiras = [...document.querySelectorAll('[data-film]')];
  if (tiras.length === 0) {
    return; // pagina sin tira de celuloide -> nada que hacer
  }

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1) Duplicar los fotogramas ANTES de medir: el loop cierra sin salto (lo que
  //    se ve en x=0 es identico a lo que se ve en x=-anchoDeUnSet).
  const tracks = [];
  for (const tira of tiras) {
    const track = tira.querySelector('.mundo-film-track');
    if (!track) {
      continue; // DOM inesperado en esta tira -> la dejo estatica y sigo
    }
    if (track.dataset.duplicado !== 'true') {
      track.innerHTML += track.innerHTML;
      track.dataset.duplicado = 'true';
    }
    tracks.push({ tira, track });
  }
  if (tracks.length === 0) {
    return;
  }

  // micro-yield: deja asentar el DOM duplicado antes de medir (resuelve aunque
  // la pestana este en segundo plano; el ancho NO depende de que carguen las
  // imagenes: el .frame tiene width por CSS).
  await new Promise((r) => setTimeout(r, 0));

  // Tira estatica con scroll manual: usable sin GSAP y con reduced-motion.
  const modoManual = (tira) => {
    tira.style.overflowX = 'auto';
    tira.style.webkitMask = tira.style.mask = 'none';
  };

  // 2) reduced-motion -> scroll manual, sin animacion.
  if (reduce) {
    tracks.forEach(({ tira }) => modoManual(tira));
    return;
  }

  // 3) GSAP no carga -> mismo trato que reduced-motion.
  let gsap;
  let ScrollTrigger;
  try {
    ({ gsap } = await import('./vendor/gsap@3.13.0/gsap.mjs'));
    ({ ScrollTrigger } = await import('./vendor/gsap@3.13.0/ScrollTrigger.mjs'));
  } catch (err) {
    console.warn('[filmstrip] no se pudo cargar GSAP; tira con scroll manual.', err);
    tracks.forEach(({ tira }) => modoManual(tira));
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  // 4) Loop: un tween por tira, velocidad constante, repetido al infinito.
  for (const { tira, track } of tracks) {
    const oneSet = track.getBoundingClientRect().width / 2; // reflow sincronico
    const tween = gsap.to(track, {
      x: -oneSet,
      duration: loopDuration(oneSet),
      ease: 'none',
      repeat: -1,
    });

    const listeners = [];
    const addSafeListener = (target, type, fn) => {
      target.addEventListener(type, fn);
      listeners.push({ target, type, fn });
    };

    // Hover / foco -> desacelera suave (no frena de golpe); al salir, ritmo normal.
    const setRitmo = (lento) =>
      gsap.to(tween, {
        timeScale: lento ? 0.12 : 1,
        duration: lento ? 0.6 : 0.8,
        overwrite: true,
      });

    // El "desacelerar al pasar por encima" es SOLO para punteros con hover real.
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      addSafeListener(tira, 'pointerenter', () => setRitmo(true));
      addSafeListener(tira, 'pointerleave', () => setRitmo(false));
      addSafeListener(tira, 'pointercancel', () => setRitmo(false));
    }
    addSafeListener(tira, 'focusin', () => setRitmo(true));
    addSafeListener(tira, 'focusout', () => setRitmo(false));

    // Perf con varias tiras: solo corren cuando estan a la vista.
    const trigger = ScrollTrigger.create({
      trigger: tira,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => {
        if (self.isActive) tween.play();
        else tween.pause();
      },
    });

    activeFilmstrips.push({ tween, trigger, listeners });
  }
}

export function unmountFilmstrip() {
  activeFilmstrips.forEach(({ tween, trigger, listeners }) => {
    if (trigger) trigger.kill();
    if (tween) tween.kill();
    listeners.forEach(({ target, type, fn }) => target.removeEventListener(type, fn));
  });
  activeFilmstrips = [];
}

if (typeof document !== 'undefined') {
  if (!window.__SWUP_ROUTER_ACTIVE__) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initFilmstrip);
    } else {
      initFilmstrip();
    }
  }
}

export { initFilmstrip };