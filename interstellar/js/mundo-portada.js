// Portada "caida al polvo" de la pagina Tierra (mundos-tierra.html).
// Tres capas de imagen apiladas que el scroll encadena:
//   orbita (la Tierra desde el espacio) -> maizal aereo -> tormenta de polvo.
// La camara "baja" del planeta al campo, el color se drena y la pared de polvo
// se traga todo antes de soltar el sticky sobre el contenido de la pagina.
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
  const campo = portada.querySelector('.mundo-capa--campo');
  const tormenta = portada.querySelector('.mundo-capa--tormenta');
  const texto = portada.querySelector('.mundo-portada-texto');
  const volver = portada.querySelector('.mundo-volver');
  if (!orbita || !campo || !tormenta) {
    return; // DOM inesperado -> mejor el hero estatico que una escena rota
  }

  // `matchMedia` de GSAP: arma la escena que corresponde al viewport y la
  // revierte sola (con el cleanup que devuelve cada callback) si la media query
  // deja de matchear. Con reduced-motion no matchea ninguna -> hero estatico.
  const mm = gsap.matchMedia();

  const base = () => {
    portada.classList.add('is-armed');
    gsap.set(orbita, { autoAlpha: 1, scale: 1, rotation: 0, filter: 'saturate(1) brightness(1)' });
    gsap.set(campo, { autoAlpha: 0, scale: 1.22, filter: 'saturate(1) brightness(1)' });
    gsap.set(tormenta, { autoAlpha: 0, scale: 1.12, yPercent: 12 });
  };

  const cleanup = (tl) => () => {
    if (tl.scrollTrigger) tl.scrollTrigger.kill();
    tl.kill();
    portada.classList.remove('is-armed');
    gsap.set([orbita, campo, tormenta, texto, volver], { clearProps: 'all' });
  };

  // --- Escritorio: secuencia completa orbita -> campo -> tormenta ---
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

    // Timeline normalizado 0..1 (el scrub lo mapea al riel de scroll):
    tl
      // el texto se va temprano, antes de "bajar" del planeta
      .to([texto, volver], { autoAlpha: 0, y: -40, duration: 0.16 }, 0)
      // deriva lenta del globo: unos grados de giro mientras "descendemos".
      // Es una foto plana: giro corto = parallax con vida, no rotacion esferica.
      .to(orbita, { rotation: 8, duration: 0.42 }, 0)
      // la orbita se hunde: zoom profundo. La disolvencia arranca tarde y cae
      // rapido (power2.in) para un traspaso limpio, sin doble exposicion larga.
      .to(orbita, { scale: 1.7, duration: 0.42 }, 0)
      .to(orbita, { autoAlpha: 0, ease: 'power2.in', duration: 0.2 }, 0.2)
      // aparece el maizal ya casi sin el globo encima y la camara se asienta
      .to(campo, { autoAlpha: 1, duration: 0.16 }, 0.24)
      .to(campo, { scale: 1.02, duration: 0.5 }, 0.24)
      // el color se drena mientras se acerca el polvo
      .to(campo, { filter: 'saturate(0.12) brightness(0.68)', duration: 0.34 }, 0.42)
      // la pared de polvo sube desde abajo y traga todo
      .to(tormenta, { autoAlpha: 1, yPercent: 0, duration: 0.3 }, 0.5)
      .to(tormenta, { scale: 1, duration: 0.3 }, 0.5)
      // remate: leve empuje final hacia el polvo antes de soltar el sticky
      .to(tormenta, { scale: 1.08, duration: 0.18 }, 0.82);

    return cleanup(tl);
  });

  // --- Movil: version breve, orbita -> campo -> tormenta sin drenaje de escala ---
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
      .to([texto, volver], { autoAlpha: 0, y: -24, duration: 0.2 }, 0)
      // misma deriva + zoom que en escritorio, mas contenida
      .to(orbita, { rotation: 4, scale: 1.35, autoAlpha: 0, ease: 'power1.in', duration: 0.34 }, 0.06)
      .to(campo, { autoAlpha: 1, duration: 0.3 }, 0.22)
      .to(campo, { filter: 'saturate(0.15) brightness(0.72)', duration: 0.3 }, 0.5)
      .to(tormenta, { autoAlpha: 1, yPercent: 0, duration: 0.4 }, 0.6);

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
