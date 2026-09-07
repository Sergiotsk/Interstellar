// Portada "caida al polvo" de la pagina Tierra (mundos-tierra.html).
// Cinco capas de fotograma (FILMGRAB) que el scroll encadena, un descenso al
// colapso:
//   orbita (la Tierra desde la nave) -> la granja verde -> el maizal aereo ->
//   la tormenta en el pueblo -> la granja sepultada.
// La camara "baja" del planeta, el color se drena y el polvo se traga todo
// antes de soltar el sticky sobre el contenido de la pagina.
//
// Libreria: GSAP 3.13 + ScrollTrigger (Constitucion v2.0.0, Principio I:
// libreria acotada sin build). FASE PROTOTIPO -> import desde esm.sh con version
// fija; antes de cerrar la feature se vendoriza a js/vendor/gsap@3.13.0/ y se
// pasa a ruta relativa (ver js/vendor/README.md).
//
// Degradado: sin JS / GSAP caido / prefers-reduced-motion -> el CSS deja la
// portada como un hero estatico (orbita a pantalla completa + titulo + lead).
// El riel alto y el sticky solo se activan si este modulo agrega `.is-armed`,
// cosa que hace UNICAMENTE cuando logro construir el timeline. GSAP solo MEJORA;
// nunca es requisito para leer la pagina.

const GSAP_VER = '3.13.0';

async function initMundoPortada() {
  const portada = document.querySelector('.mundo-portada');
  if (!portada) {
    return; // no es una pagina de mundo con portada -> nada que hacer
  }

  let gsap;
  let ScrollTrigger;
  try {
    ({ gsap } = await import(`https://esm.sh/gsap@${GSAP_VER}`));
    ({ ScrollTrigger } = await import(`https://esm.sh/gsap@${GSAP_VER}/ScrollTrigger`));
  } catch (err) {
    // CDN caido / offline: la portada queda en su estado base (hero estatico).
    console.warn('[mundo-portada] no se pudo cargar GSAP; portada estatica.', err);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const orbita = portada.querySelector('.mundo-capa--orbita');
  const granja = portada.querySelector('.mundo-capa--granja');
  const maizal = portada.querySelector('.mundo-capa--maizal');
  const tormenta = portada.querySelector('.mundo-capa--tormenta');
  const abandonada = portada.querySelector('.mundo-capa--abandonada');
  const texto = portada.querySelector('.mundo-portada-texto');
  const volver = portada.querySelector('.mundo-volver');
  const capas = [orbita, granja, maizal, tormenta, abandonada];
  if (capas.some((c) => !c)) {
    return; // DOM inesperado -> mejor el hero estatico que una escena rota
  }

  // `matchMedia` de GSAP: arma la escena que corresponde al viewport y la
  // revierte sola (con el cleanup que devuelve cada callback) si la media query
  // deja de matchear. Con reduced-motion no matchea ninguna -> hero estatico.
  const mm = gsap.matchMedia();

  // Estado inicial comun: solo la orbita visible; el resto oculto (autoAlpha 0 ->
  // visibility hidden, no pinta) con su transform de entrada preparado.
  const base = () => {
    portada.classList.add('is-armed');
    gsap.set(orbita, { autoAlpha: 1, scale: 1, rotation: 0, filter: 'saturate(1) brightness(1)' });
    gsap.set(granja, { autoAlpha: 0, scale: 1.15 });
    gsap.set(maizal, { autoAlpha: 0, scale: 1.12, filter: 'saturate(1) brightness(1)' });
    gsap.set(tormenta, { autoAlpha: 0, scale: 1.16, yPercent: 8 });
    gsap.set(abandonada, { autoAlpha: 0, scale: 1.06 });
  };

  const cleanup = (tl) => () => {
    if (tl.scrollTrigger) tl.scrollTrigger.kill();
    tl.kill();
    portada.classList.remove('is-armed');
    gsap.set([...capas, texto, volver], { clearProps: 'all' });
  };

  // --- Escritorio: los 5 beats ---
  mm.add('(min-width: 48rem) and (prefers-reduced-motion: no-preference)', () => {
    base();

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: portada,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5, // ata la animacion al scroll con un pelin de inercia
      },
      defaults: { ease: 'none' },
    });

    // Timeline normalizado 0..1 (el scrub lo mapea al riel de scroll). Cada beat
    // tiene ~0.20 de recorrido; los crossfades son cortos (0.06) para que casi
    // todo el scroll se vea UNA sola imagen y no una doble exposicion larga (dos
    // fotogramas mezclados se leen sucios). El transform de cada capa sigue
    // corriendo despues del fade -> asentamiento sobre la imagen ya opaca.
    tl
      // el texto se va temprano, antes de "bajar" del planeta
      .to([texto, volver], { autoAlpha: 0, y: -40, duration: 0.08 }, 0)

      // 1 · orbita: el full-disk aguanta bien el zoom (2200px) -> se puede
      //     "bajar" mas hacia el planeta. Deriva de unos grados (foto plana:
      //     parallax con vida, no rotacion esferica) y corte rapido al final.
      .to(orbita, { rotation: 5, duration: 0.34 }, 0)
      .to(orbita, { scale: 1.4, duration: 0.22 }, 0)
      .to(orbita, { autoAlpha: 0, ease: 'power2.in', duration: 0.06 }, 0.16)

      // 2 · granja: la granja verde; la camara se asienta durante el beat
      .to(granja, { autoAlpha: 1, duration: 0.06 }, 0.16)
      .to(granja, { scale: 1, duration: 0.2 }, 0.16)

      // 3 · maizal: el aereo del maizal; el color se drena hacia el final del beat
      .to(maizal, { autoAlpha: 1, duration: 0.06 }, 0.38)
      .to(maizal, { scale: 1, duration: 0.2 }, 0.38)
      .to(maizal, { filter: 'saturate(0.4) brightness(0.85)', duration: 0.12 }, 0.46)

      // 4 · tormenta: entra opaca y despues "se asienta" (baja + escala) sobre si
      //     misma, no como panel translucido moviendose sobre el maizal.
      .to(tormenta, { autoAlpha: 1, duration: 0.06 }, 0.58)
      .to(tormenta, { yPercent: 0, scale: 1, duration: 0.16 }, 0.6)

      // 5 · abandonada: el polvo se asienta -> la granja sepultada, muerta
      .to(abandonada, { autoAlpha: 1, duration: 0.06 }, 0.78)
      .to(abandonada, { scale: 1, duration: 0.16 }, 0.78)
      // remate: leve empuje final antes de soltar el sticky
      .to(abandonada, { scale: 1.04, duration: 0.06 }, 0.94);

    return cleanup(tl);
  });

  // --- Movil: version breve, 3 beats (orbita -> maizal -> tormenta) ---
  mm.add('(max-width: 47.99rem) and (prefers-reduced-motion: no-preference)', () => {
    base();

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: portada,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
      },
      defaults: { ease: 'none' },
    });

    tl
      .to([texto, volver], { autoAlpha: 0, y: -24, duration: 0.16 }, 0)
      // misma deriva + zoom que en escritorio, mas contenida
      .to(orbita, { rotation: 3, scale: 1.24, duration: 0.34 }, 0)
      .to(orbita, { autoAlpha: 0, ease: 'power2.in', duration: 0.08 }, 0.24)
      .to(maizal, { autoAlpha: 1, duration: 0.08 }, 0.3)
      .to(maizal, { scale: 1, duration: 0.2 }, 0.3)
      .to(maizal, { filter: 'saturate(0.35) brightness(0.8)', duration: 0.16 }, 0.5)
      .to(tormenta, { autoAlpha: 1, duration: 0.08 }, 0.66)
      .to(tormenta, { yPercent: 0, scale: 1, duration: 0.18 }, 0.66);

    return cleanup(tl);
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMundoPortada);
  } else {
    initMundoPortada();
  }
}

export { initMundoPortada };
