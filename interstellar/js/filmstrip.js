// Tira de celuloide (filmstrip): loop infinito de fotogramas con GSAP, pausado fuera de vista.
// GSAP 3.13 + ScrollTrigger vendorizados. Sin JS / sin GSAP / reduced-motion -> scroll horizontal manual.
// Detalle y porques: docs/20-notas-de-codigo/portadas-de-mundos.md#tira-de-celuloide-filmstrip

// Ritmo base del desfile en px/s (los tests la usan para validar la duracion del loop).
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

  // 1) Duplicar los fotogramas ANTES de medir: el loop cierra sin salto.
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

  // micro-yield: deja asentar el DOM duplicado antes de medir (el ancho no depende de las imagenes).
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
  if (typeof window !== 'undefined') {
    window.ScrollTrigger = ScrollTrigger;
  }
  ScrollTrigger.config({ ignoreMobileResize: true });

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

  // Si la portada (pin) se arma despues, el rango de la tira queda corrido: recalcular.
  ScrollTrigger.refresh();
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