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

// Visor Nav-Ranger: ciclador de fotogramas que se reemplazan en loop (estilo
// stop-motion, sin crossfade). reduced-motion -> queda fijo en el primer
// fotograma (ya lo muestra el CSS vía .is-activo). IntersectionObserver ->
// pausa el setInterval cuando el visor no está en pantalla.
function initNavVisores() {
  const visores = [...document.querySelectorAll('[data-nav-visor]')];
  if (visores.length === 0) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  const observer = new IntersectionObserver((entradas) => {
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

    setInterval(() => {
      if (!ciclador.activo) return;
      frames[indice].classList.remove('is-activo');
      indice = (indice + 1) % frames.length;
      frames[indice].classList.add('is-activo');
    }, intervaloMs);

    observer.observe(visor);
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

  const instancias = [];

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

    // Distancia real de la tira: el desplazamiento coincide con el ancho
    // real de los fotogramas, no un valor fijo.
    const distancia = pista.scrollWidth - tiraViewport.clientWidth;

    const trigger = ScrollTrigger.create({
      trigger: riel,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3,
      onUpdate(self) {
        if (distancia > 0) {
          gsap.set(pista, { x: -distancia * self.progress });
        }
        const idx = Math.round(self.progress * (total - 1));
        datos.forEach((el, n) => el.classList.toggle('activa', n === idx));
        frames.forEach((el, n) => el.classList.toggle('activa', n === idx));
        if (progreso) progreso.textContent = `${idx + 1} / ${total}`;
      },
    });
    return { riel, trigger };
  }

  rieles.forEach((riel) => {
    const inst = armar(riel);
    if (inst) instancias.push(inst);
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      instancias.forEach(({ trigger, riel }) => {
        trigger.kill();
        riel.classList.remove('is-armada');
      });
      instancias.length = 0;
      rieles.forEach((riel) => {
        const inst = armar(riel);
        if (inst) instancias.push(inst);
      });
      ScrollTrigger.refresh();
    }, 200);
  });
}

initNavVisores();
armarGalerias();
