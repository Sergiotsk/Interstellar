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

async function initFilmstrip() {
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
    track.innerHTML += track.innerHTML;
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

    // Hover / foco -> desacelera suave (no frena de golpe); al salir, ritmo normal.
    const setRitmo = (lento) =>
      gsap.to(tween, {
        timeScale: lento ? 0.12 : 1,
        duration: lento ? 0.6 : 0.8,
        overwrite: true,
      });

    // El "desacelerar al pasar por encima" es SOLO para punteros con hover real.
    // En tactil, un scroll que arranca sobre la tira dispara `pointerenter` y
    // despues `pointercancel` (no `pointerleave`): la tira se quedaba clavada en
    // timeScale 0.12 -> se veia "quieta" en el celular. Ahi no enganchamos el
    // puntero; el foco (teclado) sigue frenandola en cualquier dispositivo.
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      tira.addEventListener('pointerenter', () => setRitmo(true));
      tira.addEventListener('pointerleave', () => setRitmo(false));
      tira.addEventListener('pointercancel', () => setRitmo(false));
    }
    tira.addEventListener('focusin', () => setRitmo(true));
    tira.addEventListener('focusout', () => setRitmo(false));

    // Perf con varias tiras: solo corren cuando estan a la vista.
    ScrollTrigger.create({
      trigger: tira,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => {
        if (self.isActive) tween.play();
        else tween.pause();
      },
    });
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFilmstrip);
  } else {
    initFilmstrip();
  }
}

export { initFilmstrip };