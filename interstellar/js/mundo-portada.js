// Portada scroll-scrubbed de las paginas de mundo (mundos-<slug>.html).
// Efecto "tipo Apple": la foto del planeta —partida en dos mitades por un
// <clipPath> SVG— se abre al scrollear el riel de la portada, y la camara
// "entra" por el hueco (scale + fade) hasta soltar el sticky en el contenido.
//
// Libreria: GSAP 3.13 + ScrollTrigger (Constitucion v2.0.0, Principio I:
// libreria acotada sin build). FASE PROTOTIPO -> import desde esm.sh con version
// fija; antes de cerrar la feature se vendoriza a js/vendor/gsap@3.13.0/ y se
// pasa a ruta relativa (ver js/vendor/README.md).
//
// Degradado: sin JS / GSAP caido / prefers-reduced-motion / <48rem -> el CSS
// deja la portada como un hero normal (foto entera + titulo + lead). GSAP solo
// MEJORA; nunca es requisito para leer la pagina.

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
    // CDN caido / offline: la portada queda en su estado base (foto entera).
    console.warn('[mundo-portada] no se pudo cargar GSAP; portada estatica.', err);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // `matchMedia` de GSAP: crea la escena SOLO en escritorio y sin reduced-motion,
  // y la revierte sola si la media query deja de matchear (resize / cambio de
  // preferencia). Debajo de 48rem o con reduced-motion no se arma nada -> el CSS
  // deja la escena como hero normal.
  const mm = gsap.matchMedia();

  mm.add('(min-width: 48rem) and (prefers-reduced-motion: no-preference)', () => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: portada,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.4, // ata la animacion al scroll con un pelin de inercia
      },
      defaults: { ease: 'none' },
    });

    // Timeline normalizado 0..1 (el scrub lo mapea al riel de scroll):
    //  - texto (titulo + "volver"): se va antes del 40 %.
    //  - mitades: se abren hasta el 65 %.
    //  - "camara entra": del 40 % al 100 %, scale + fade a la seccion.
    tl.to('.mundo-portada-texto, .mundo-portada .mundo-volver',
        { autoAlpha: 0, y: -48, duration: 0.4 }, 0)
      .to('.portada-mitad--sup', { yPercent: -82, rotate: -2.5, duration: 0.65 }, 0)
      .to('.portada-mitad--inf', { yPercent: 82, rotate: 2.5, duration: 0.65 }, 0)
      .to('.mundo-portada-svg',
        { scale: 1.45, autoAlpha: 0, ease: 'power1.in', duration: 0.6 }, 0.4);

    return () => tl.scrollTrigger && tl.scrollTrigger.kill();
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
