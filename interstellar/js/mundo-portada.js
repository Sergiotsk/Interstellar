// Portadas animadas de las paginas de mundo (`.mundo-portada`).
//   - Tierra  -> "caida al polvo": cinco fotogramas (FILMGRAB) que el scroll
//     encadena (orbita -> granja -> maizal -> tormenta -> granja sepultada).
//   - Gargantua -> "descenso": seis fotogramas que el scroll encadena (la
//     Endurance frente a Gargantua -> el disco de cerca -> el descenso por el
//     plano del disco -> la Endurance minima -> el Ranger con las chispas del
//     roce -> Cooper a la deriva). Al irse el ultimo fotograma queda el negro y
//     un canvas de chispas que salen disparadas del centro hacia afuera
//     acelerando (avance a velocidad, como Cooper cayendo) y DISMINUYEN a medida
//     que scrolleas. Riel mas largo que la Tierra.
//   - Miller -> "el amerizaje": siete fotogramas (plano abierto del Ranger y el
//     pecio -> por la ventana del Ranger -> la camara al ras del oceano -> Doyle
//     corre del muro de agua -> Doyle mira los restos zarandeados -> el muro
//     BAJANDO sobre el Ranger volcado -> Brand quebrada).
//     Encima, un reloj que cuenta los años que se pierden
//     afuera mientras bajas: 0 -> 23 (una hora ahi = siete años arriba). El
//     reloj es a Miller lo que las chispas a Gargantua: solo aparece con la
//     escena armada.
//   - Mann -> "el señuelo": seis fotogramas (vista cenital del hielo -> dos
//     figuras en las crestas -> el doctor Mann -> la traicion, Cooper boca
//     abajo con el visor rajado -> aproximacion a la Endurance -> caida por el
//     tunel de acoplamiento). Encima, una baliza SEÑAL: HABITABLE que se
//     CORROMPE a ENGAÑO (verde -> rojo, con glitch) en cuanto el scroll llega
//     a la traicion. La baliza es a Mann lo que el reloj a Miller.
//   - Tesseract -> "el pasillo del tiempo": seis fotogramas (la reticula
//     infinita de estanterias -> la caida por la estructura -> detras del
//     estante -> Cooper tensandose -> la vista cenital del cuarto -> Murph
//     adulta entendiendo). Encima, un tren de morse que ENCIENDE sus grupos
//     (S T A Y) en orden con el scroll y se decodifica en la palabra al final.
// En las cinco la camara "baja" atada al scroll y suelta el sticky sobre el
// contenido de la pagina.
//
// Libreria: GSAP 3.13 + ScrollTrigger (Constitucion v2.0.0, Principio I:
// libreria acotada sin build). VENDORIZADA en js/vendor/gsap@3.13.0/ e importada
// por ruta relativa: no depende de un CDN en runtime (ver js/vendor/README.md).
//
// Degradado: sin JS / GSAP no carga / prefers-reduced-motion -> el CSS deja la
// portada como un hero estatico (primer plano a pantalla completa + titulo +
// lead). El riel alto y el sticky solo se activan si este modulo agrega
// `.is-armed`, cosa que hace UNICAMENTE cuando logro construir el timeline.
// GSAP solo MEJORA; nunca es requisito para leer la pagina.

async function initMundoPortada() {
  const portada = document.querySelector('.mundo-portada');
  if (!portada) {
    return; // no es una pagina de mundo con portada -> nada que hacer
  }

  let gsap;
  let ScrollTrigger;
  try {
    ({ gsap } = await import('./vendor/gsap@3.13.0/gsap.mjs'));
    ({ ScrollTrigger } = await import('./vendor/gsap@3.13.0/ScrollTrigger.mjs'));
  } catch (err) {
    // GSAP no disponible: la portada queda en su estado base (hero estatico).
    console.warn('[mundo-portada] no se pudo cargar GSAP; portada estatica.', err);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // `matchMedia` de GSAP: arma la escena que corresponde al viewport y la
  // revierte sola (con el cleanup que devuelve cada callback) si la media query
  // deja de matchear. Con reduced-motion no matchea ninguna -> hero estatico.
  const mm = gsap.matchMedia();

  if (portada.querySelector('.mundo-capa--orbita')) {
    escenaTierra(gsap, mm, portada);
  } else if (portada.querySelector('.mundo-capa--gargantua-lejos')) {
    escenaGargantua(gsap, mm, portada);
  } else if (portada.querySelector('.mundo-capa--miller-arribo')) {
    escenaMiller(gsap, mm, portada);
  } else if (portada.querySelector('.mundo-capa--mann-hielo')) {
    escenaMann(gsap, mm, portada);
  } else if (portada.querySelector('.mundo-capa--tesseract-reticula')) {
    escenaTesseract(gsap, mm, portada);
  }
}

// --- Tierra: descenso al colapso, 5 fotogramas encadenados ---------------------
function escenaTierra(gsap, mm, portada) {
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

  // --- Movil: los mismos 5 beats que escritorio (antes eran 3 y se saltaba la
  //     granja verde y la granja sepultada — el remate de la secuencia), con un
  //     zoom de entrada mas contenido. Riel algo mas corto (ver mundos.css). ---
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

    // Mismas posiciones normalizadas que escritorio (0.16 / 0.38 / 0.58 / 0.78);
    // solo se contiene la deriva y el zoom de la orbita para no ampliar de mas.
    tl
      .to([texto, volver], { autoAlpha: 0, y: -24, duration: 0.08 }, 0)

      // 1 · orbita
      .to(orbita, { rotation: 3, duration: 0.34 }, 0)
      .to(orbita, { scale: 1.24, duration: 0.22 }, 0)
      .to(orbita, { autoAlpha: 0, ease: 'power2.in', duration: 0.06 }, 0.16)

      // 2 · granja
      .to(granja, { autoAlpha: 1, duration: 0.06 }, 0.16)
      .to(granja, { scale: 1, duration: 0.2 }, 0.16)

      // 3 · maizal
      .to(maizal, { autoAlpha: 1, duration: 0.06 }, 0.38)
      .to(maizal, { scale: 1, duration: 0.2 }, 0.38)
      .to(maizal, { filter: 'saturate(0.4) brightness(0.85)', duration: 0.12 }, 0.46)

      // 4 · tormenta
      .to(tormenta, { autoAlpha: 1, duration: 0.06 }, 0.58)
      .to(tormenta, { yPercent: 0, scale: 1, duration: 0.16 }, 0.6)

      // 5 · abandonada: la granja sepultada, muerta
      .to(abandonada, { autoAlpha: 1, duration: 0.06 }, 0.78)
      .to(abandonada, { scale: 1, duration: 0.16 }, 0.78)
      .to(abandonada, { scale: 1.04, duration: 0.06 }, 0.94);

    return cleanup(tl);
  });
}

// --- Gargantua: descenso, 6 fotogramas + campo de chispas final ------------
function escenaGargantua(gsap, mm, portada) {
  const lejos = portada.querySelector('.mundo-capa--gargantua-lejos');
  const disco = portada.querySelector('.mundo-capa--gargantua-disco');
  const plano = portada.querySelector('.mundo-capa--gargantua-plano');
  const endurance = portada.querySelector('.mundo-capa--gargantua-endurance');
  const ranger = portada.querySelector('.mundo-capa--gargantua-ranger');
  const deriva = portada.querySelector('.mundo-capa--gargantua-deriva');
  const fx = portada.querySelector('.mundo-chispas-fx:not(.mundo-chispas-fx--fondo)');
  const fxFondo = portada.querySelector('.mundo-chispas-fx--fondo');
  const texto = portada.querySelector('.mundo-portada-texto');
  const volver = portada.querySelector('.mundo-volver');
  const capas = [lejos, disco, plano, endurance, ranger, deriva];
  if (capas.some((c) => !c)) {
    return; // DOM inesperado -> hero estatico
  }

  // Estado inicial: solo el primer fotograma visible; el resto oculto con su
  // transform de entrada preparado (mismo criterio que la Tierra). El `scale`
  // de entrada > 1 da el "empuje" de camara: cada beat se asienta a scale 1.
  const base = () => {
    portada.classList.add('is-armed');
    gsap.set(lejos, { autoAlpha: 1, scale: 1, rotation: 0 });
    gsap.set(disco, { autoAlpha: 0, scale: 1.12 });
    gsap.set(plano, { autoAlpha: 0, scale: 1.16, yPercent: -4 });
    gsap.set(endurance, { autoAlpha: 0, scale: 1.12 });
    gsap.set(ranger, { autoAlpha: 0, scale: 1.16, xPercent: 3 });
    gsap.set(deriva, { autoAlpha: 0, scale: 1.18 });
    // los dos campos de chispas siempre visibles; el `pulso` controla la intensidad
    if (fx) gsap.set(fx, { autoAlpha: 1 });
    if (fxFondo) gsap.set(fxFondo, { autoAlpha: 1 });
  };

  // Campo de chispas del cruce (Cooper cayendo a velocidad). Un <canvas> con N
  // trazos que nacen en el punto de fuga (centro) y salen DISPARADOS hacia
  // afuera ACELERANDO -> pasan de largo la camara. El trazo se alarga con la
  // velocidad; al salir de cuadro renacen en el centro. rAF propio; el objeto
  // `pulso` (que mueve el timeline con el scroll, `pulso.v` 0..1) modula cuantas
  // chispas se dibujan y con cuanto brillo -> disminuyen a medida que scrolleas.
  //
  // Se llama DOS veces: una capa por delante del fotograma (`fx`, z-index 3) y
  // otra por detras (`.mundo-chispas-fx--fondo`, detras de las `.mundo-capa`).
  // Mientras `deriva` es opaco, las de atras quedan tapadas por Cooper; cuando
  // el fotograma baja a autoAlpha 0.22, asoman -> sensacion de profundidad.
  const arrancarChispas = (fxEl, opts) => {
    if (!fxEl) return null;
    const { n, pulso, brilloMax = 1, escala = 1, velMul = 1 } = opts;
    const cv = document.createElement('canvas');
    fxEl.appendChild(cv);
    const ctx = cv.getContext('2d');
    let raf = 0;
    let dpr = 1;
    const sparks = [];

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.max(1, fxEl.clientWidth) * dpr;
      cv.height = Math.max(1, fxEl.clientHeight) * dpr;
    };
    resize();
    window.addEventListener('resize', resize);

    const spawn = (s) => {
      const cx = cv.width * 0.52; // punto de fuga apenas descentrado
      const cy = cv.height * 0.44;
      const a = Math.random() * Math.PI * 2;
      const r = (3 + Math.random() * 90) * dpr;
      s.x = cx + Math.cos(a) * r;
      s.y = cy + Math.sin(a) * r;
      const sp = (0.3 + Math.random() * 0.75) * dpr * velMul; // arranca lenta
      s.vx = Math.cos(a) * sp;
      s.vy = Math.sin(a) * sp;
      s.accel = 1.022 + Math.random() * 0.014; // acelera un poco cada frame
      s.age = 0;
      s.w = (1.2 + Math.random() * 2.4) * dpr * escala; // trazo grueso
      s.hue = 16 + Math.random() * 24; // naranja calido
    };
    for (let i = 0; i < n; i++) {
      const s = {};
      spawn(s);
      // desfase inicial: adelanta cada chispa un tramo de su recorrido
      const pre = Math.floor(Math.random() * 90);
      for (let k = 0; k < pre; k++) {
        s.vx *= s.accel;
        s.vy *= s.accel;
        s.x += s.vx;
        s.y += s.vy;
      }
      sparks.push(s);
    }

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const w = cv.width;
      const h = cv.height;
      const cx = w * 0.52;
      const cy = h * 0.44;
      const edge = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy));
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter'; // los trazos que se cruzan suman brillo
      ctx.lineCap = 'round';
      const p = pulso ? Math.max(0, Math.min(1, pulso.v)) : 1;
      // cuantas chispas activas ahora (disminuye con el scroll) + su brillo
      const activas = Math.round(sparks.length * (0.05 + 0.95 * p));
      const brillo = (0.12 + 0.88 * p) * brilloMax;
      for (let i = 0; i < activas; i++) {
        const s = sparks[i];
        s.vx *= s.accel;
        s.vy *= s.accel;
        s.x += s.vx;
        s.y += s.vy;
        s.age++;
        if (s.x < -80 || s.x > w + 80 || s.y < -80 || s.y > h + 80 || s.age > 600) {
          spawn(s);
          continue;
        }
        const dist = Math.hypot(s.x - cx, s.y - cy);
        const t = dist / edge; // 0 en el centro, 1 al borde
        const fade = t < 0.08 ? t / 0.08 : 1; // solo enciende al salir del centro
        const speed = Math.hypot(s.vx, s.vy) || 1;
        const len = Math.min(speed * 4, 240 * dpr) * escala; // whoosh: largo ∝ velocidad
        const nx = s.vx / speed;
        const ny = s.vy / speed;
        const g = ctx.createLinearGradient(s.x, s.y, s.x - nx * len, s.y - ny * len);
        g.addColorStop(0, `hsla(${s.hue}, 100%, 92%, ${0.95 * fade * brillo})`);
        g.addColorStop(1, `hsla(${s.hue}, 100%, 55%, 0)`);
        ctx.strokeStyle = g;
        ctx.lineWidth = s.w;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - nx * len, s.y - ny * len);
        ctx.stroke();
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      cv.remove();
    };
  };

  const cleanup = (tl, paradas) => () => {
    if (tl.scrollTrigger) tl.scrollTrigger.kill();
    tl.kill();
    (paradas || []).forEach((parar) => parar && parar());
    portada.classList.remove('is-armed');
    gsap.set([...capas, texto, volver], { clearProps: 'all' });
    if (fx) gsap.set(fx, { clearProps: 'all' });
    if (fxFondo) gsap.set(fxFondo, { clearProps: 'all' });
  };

  // Un beat = fade-in corto + asentamiento del transform + fade-out corto. Los
  // crossfades son cortos (0.05) para que casi todo el scroll se vea UN solo
  // fotograma (dos mezclados se leen sucios). `pos` = donde entra en el timeline
  // normalizado 0..1; cada beat ocupa ~0.13.
  const beat = (tl, capa, pos, extra) => {
    tl.to(capa, { autoAlpha: 1, duration: 0.05 }, pos)
      .to(capa, { scale: 1, yPercent: 0, xPercent: 0, duration: 0.12, ...extra }, pos);
  };
  const salida = (tl, capa, pos) =>
    tl.to(capa, { autoAlpha: 0, ease: 'power2.in', duration: 0.05 }, pos);

  // --- Escritorio: 6 fotogramas + campo de chispas ---
  mm.add('(min-width: 48rem) and (prefers-reduced-motion: no-preference)', () => {
    base();
    const pulso = { v: 0 };
    const paradas = [
      arrancarChispas(fx, { n: 190, pulso }),
      arrancarChispas(fxFondo, { n: 70, pulso, brilloMax: 0.6, escala: 0.78, velMul: 0.85 }),
    ];

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
      // el texto se va temprano, antes de empezar a caer
      .to([texto, volver], { autoAlpha: 0, y: -40, duration: 0.07 }, 0)
      // 1 · lejos: la Endurance frente a Gargantua; push-in largo + deriva minima
      .to(lejos, { scale: 1.35, duration: 0.4 }, 0)
      .to(lejos, { rotation: 2, duration: 0.4 }, 0);
    salida(tl, lejos, 0.12);

    // 2 · disco: el disco de acrecion de cerca
    beat(tl, disco, 0.12);
    salida(tl, disco, 0.26);

    // 3 · plano: el descenso por el plano del disco, la Endurance minuscula
    beat(tl, plano, 0.26);
    salida(tl, plano, 0.4);

    // 4 · endurance: el anillo recortado contra el disco encendido
    beat(tl, endurance, 0.4);
    salida(tl, endurance, 0.52);

    // 5 · ranger: el Ranger cayendo con las chispas del roce a su alrededor
    beat(tl, ranger, 0.52);
    salida(tl, ranger, 0.66);

    // 6 · deriva: ultimo fotograma. AGUANTA y se disuelve LENTO hasta casi el
    //     final del riel, solapado con las chispas -> nunca queda pantalla negra
    //     y vacia esperando que suelte el sticky.
    beat(tl, deriva, 0.66);
    tl.to(deriva, { scale: 1.12, ease: 'power1.inOut', duration: 0.34 }, 0.7);
    // NO se apaga del todo: queda un fantasma de Cooper hasta que suelta el
    // sticky -> el ultimo tramo nunca es pantalla negra vacia.
    tl.to(deriva, { autoAlpha: 0.22, ease: 'power1.in', duration: 0.16 }, 0.86);

    // Campo de chispas: sube y con el scroll baja algo, pero se mantiene bien
    // presente hasta el final; el resto se lo lleva el sticky al soltarse.
    tl.to(pulso, { v: 1, duration: 0.08 }, 0.8);
    tl.to(pulso, { v: 0.6, ease: 'power1.in', duration: 0.16 }, 0.86);

    return cleanup(tl, paradas);
  });

  // --- Movil: los mismos 6 fotogramas que escritorio (antes eran menos y las
  //     transiciones se sentian apuradas), con un riel algo mas corto y un zoom
  //     de entrada mas contenido. ---
  mm.add('(max-width: 47.99rem) and (prefers-reduced-motion: no-preference)', () => {
    base();
    const pulso = { v: 0 };
    const paradas = [
      arrancarChispas(fx, { n: 120, pulso }),
      arrancarChispas(fxFondo, { n: 45, pulso, brilloMax: 0.6, escala: 0.78, velMul: 0.85 }),
    ];

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
      .to([texto, volver], { autoAlpha: 0, y: -28, duration: 0.07 }, 0)
      // en movil `cover` ya amplia bastante en vertical -> deriva minima, sin zoom
      .to(lejos, { rotation: 1, duration: 0.4 }, 0);
    salida(tl, lejos, 0.12);

    beat(tl, disco, 0.12);
    salida(tl, disco, 0.26);

    beat(tl, plano, 0.26);
    salida(tl, plano, 0.4);

    beat(tl, endurance, 0.4);
    salida(tl, endurance, 0.52);

    beat(tl, ranger, 0.52);
    salida(tl, ranger, 0.66);

    // deriva aguanta hasta casi el final y se disuelve lento, solapado con las
    // chispas -> sin pantalla vacia al terminar. Sin zoom extra en movil.
    beat(tl, deriva, 0.66);
    tl.to(deriva, { xPercent: -2, ease: 'power1.inOut', duration: 0.34 }, 0.7);
    tl.to(deriva, { autoAlpha: 0.22, ease: 'power1.in', duration: 0.16 }, 0.86);

    tl.to(pulso, { v: 1, duration: 0.08 }, 0.8);
    tl.to(pulso, { v: 0.6, ease: 'power1.in', duration: 0.16 }, 0.86);

    return cleanup(tl, paradas);
  });
}

// --- Miller: el amerizaje, 7 fotogramas + reloj de la dilatacion -------------
function escenaMiller(gsap, mm, portada) {
  const arribo = portada.querySelector('.mundo-capa--miller-arribo');
  const vadeo = portada.querySelector('.mundo-capa--miller-vadeo');
  const rasante = portada.querySelector('.mundo-capa--miller-rasante');
  const ola = portada.querySelector('.mundo-capa--miller-ola');
  const impacto = portada.querySelector('.mundo-capa--miller-impacto');
  const muro = portada.querySelector('.mundo-capa--miller-muro');
  const cabina = portada.querySelector('.mundo-capa--miller-cabina');
  const texto = portada.querySelector('.mundo-portada-texto');
  const volver = portada.querySelector('.mundo-volver');
  const reloj = portada.querySelector('.mundo-reloj');
  const relojNum = portada.querySelector('[data-reloj]');
  const capas = [arribo, vadeo, rasante, ola, impacto, muro, cabina];
  if (capas.some((c) => !c)) {
    return; // DOM inesperado -> hero estatico
  }

  // Estado inicial: solo el primer fotograma; el resto oculto con su transform
  // de entrada preparado. `scale` > 1 en las capas que "empujan" la camara; la
  // ola entra hundida (yPercent) para TREPAR con el scroll; el muro entra alto
  // para BAJAR encima del Ranger.
  const base = () => {
    portada.classList.add('is-armed');
    gsap.set(arribo, { autoAlpha: 1, scale: 1, rotation: 0 });
    gsap.set(vadeo, { autoAlpha: 0, scale: 1.14 });
    gsap.set(rasante, { autoAlpha: 0, scale: 1.16, yPercent: -3 });
    gsap.set(ola, { autoAlpha: 0, scale: 1.14, xPercent: 3 });
    gsap.set(impacto, { autoAlpha: 0, scale: 1.12, filter: 'brightness(1) saturate(1)' });
    gsap.set(muro, { autoAlpha: 0, scale: 1, yPercent: -8 });
    gsap.set(cabina, { autoAlpha: 0, scale: 1.12 });
    if (reloj) gsap.set(reloj, { autoAlpha: 0, scale: 1 });
    if (relojNum) relojNum.textContent = '0';
  };

  const cleanup = (tl) => () => {
    if (tl.scrollTrigger) tl.scrollTrigger.kill();
    tl.kill();
    portada.classList.remove('is-armed');
    gsap.set([...capas, texto, volver], { clearProps: 'all' });
    if (reloj) gsap.set(reloj, { clearProps: 'all' });
    if (relojNum) relojNum.textContent = '0';
  };

  // Beat = fade-in corto + asentamiento del transform + fade-out corto. Mismo
  // criterio que Gargantua: crossfades de 0.05 para que casi todo el scroll se
  // vea UN fotograma. `pos` = entrada en el timeline normalizado 0..1.
  const beat = (tl, capa, pos, extra) => {
    tl.to(capa, { autoAlpha: 1, duration: 0.05 }, pos)
      .to(capa, { scale: 1, yPercent: 0, xPercent: 0, duration: 0.11, ...extra }, pos);
  };
  const salida = (tl, capa, pos) =>
    tl.to(capa, { autoAlpha: 0, ease: 'power2.in', duration: 0.05 }, pos);

  // El reloj de la dilatacion: un proxy 0..23 que el scrub arrastra y vuelca al
  // <span>. Arranca al dejar el planeta y se clava en 23 cerca del final (una
  // hora en Miller = siete años arriba; la parada les costo veintitres).
  const contador = (tl, movil) => {
    if (!reloj || !relojNum) return;
    const proxy = { v: 0 };
    tl.to(reloj, { autoAlpha: 0.92, duration: 0.06 }, movil ? 0.14 : 0.1);
    tl.to(
      proxy,
      {
        v: 23,
        ease: 'none',
        duration: 0.76,
        onUpdate: () => { relojNum.textContent = String(Math.round(proxy.v)); },
      },
      0.12,
    );
    // golpe seco cuando el muro cae sobre el Ranger: el costo se siente
    tl.to(reloj, { scale: 1.18, duration: 0.06 }, 0.62)
      .to(reloj, { scale: 1, duration: 0.1 }, 0.68);
  };

  // Construye los 7 beats sobre `tl`. `amp` (0..1) atenua los zooms para movil.
  const coreografia = (tl, amp) => {
    tl
      // el texto se va temprano, antes de "bajar" al agua
      .to([texto, volver], { autoAlpha: 0, y: -40 * amp, duration: 0.07 }, 0)
      // 1 · arribo: plano abierto (Ranger + pecio + exploradores); push-in + deriva
      .to(arribo, { scale: 1 + 0.2 * amp, duration: 0.34 }, 0)
      .to(arribo, { rotation: 1.4 * amp, duration: 0.34 }, 0);
    salida(tl, arribo, 0.11);

    // 2 · vadeo: por la ventana del Ranger, el pecio, las figuras en el agua
    beat(tl, vadeo, 0.11);
    salida(tl, vadeo, 0.22);

    // 3 · rasante: la camara al ras del agua, el Ranger corre sobre la superficie
    beat(tl, rasante, 0.22, { xPercent: -4 * amp });
    salida(tl, rasante, 0.35);

    // 4 · ola: Doyle corre hacia camara con el muro de agua ya levantandose
    //     detras. Push-in con urgencia + sacudida corta (no "trepa": eso es el muro).
    tl.to(ola, { autoAlpha: 1, duration: 0.05 }, 0.35);
    tl.to(ola, { scale: 1, xPercent: 0, ease: 'power2.out', duration: 0.13 }, 0.35);
    tl.to(ola, { xPercent: -2.5 * amp, duration: 0.04 }, 0.41).to(ola, { xPercent: 0, duration: 0.04 }, 0.46);
    salida(tl, ola, 0.52);

    // 5 · impacto: Doyle mira los restos zarandeados, la ola ya detras; sacudida + blanqueo
    beat(tl, impacto, 0.52);
    tl.to(impacto, { filter: 'brightness(1.14) saturate(0.74)', duration: 0.1 }, 0.54);
    tl.to(impacto, { xPercent: 2, duration: 0.04 }, 0.52).to(impacto, { xPercent: 0, duration: 0.04 }, 0.58);
    salida(tl, impacto, 0.63);

    // 6 · muro: el Ranger volcado y la pared de agua tapando el cuadro. Entra alto
    //     y BAJA creciendo -> se siente que se viene encima. Aguanta.
    tl.to(muro, { autoAlpha: 1, duration: 0.05 }, 0.63);
    tl.to(muro, { yPercent: 4, scale: 1.12 + 0.08 * amp, ease: 'power1.in', duration: 0.16 }, 0.63);
    salida(tl, muro, 0.79);

    // 7 · cabina: Brand quebrada tras perder a Doyle -> el costo, hecho cara.
    //     AGUANTA y se disuelve LENTO hasta casi el final del riel -> nunca queda
    //     pantalla vacia esperando que suelte el sticky.
    beat(tl, cabina, 0.79);
    tl.to(cabina, { scale: 1 + 0.09 * amp, ease: 'power1.inOut', duration: 0.24 }, 0.82);
    tl.to(cabina, { autoAlpha: 0.22, ease: 'power1.in', duration: 0.14 }, 0.88);
  };

  const armar = (amp, movil) => () => {
    base();
    const tl = gsap.timeline({
      scrollTrigger: { trigger: portada, start: 'top top', end: 'bottom bottom', scrub: 0.5 },
      defaults: { ease: 'none' },
    });
    coreografia(tl, amp);
    contador(tl, movil);
    return cleanup(tl);
  };

  // Escritorio: zooms plenos. Movil: `cover` ya amplia en vertical -> `amp` 0.5.
  mm.add('(min-width: 48rem) and (prefers-reduced-motion: no-preference)', armar(1, false));
  mm.add('(max-width: 47.99rem) and (prefers-reduced-motion: no-preference)', armar(0.5, true));
}

// --- Mann: el señuelo, 6 fotogramas + baliza de habitabilidad ---------------
function escenaMann(gsap, mm, portada) {
  const hielo = portada.querySelector('.mundo-capa--mann-hielo');
  const superficie = portada.querySelector('.mundo-capa--mann-superficie');
  const mann = portada.querySelector('.mundo-capa--mann-mann');
  const engano = portada.querySelector('.mundo-capa--mann-engano');
  const docking = portada.querySelector('.mundo-capa--mann-docking');
  const tunel = portada.querySelector('.mundo-capa--mann-tunel');
  const texto = portada.querySelector('.mundo-portada-texto');
  const volver = portada.querySelector('.mundo-volver');
  const baliza = portada.querySelector('.mundo-baliza');
  const balizaEstado = portada.querySelector('[data-baliza]');
  const capas = [hielo, superficie, mann, engano, docking, tunel];
  if (capas.some((c) => !c)) {
    return; // DOM inesperado -> hero estatico
  }

  // Estado inicial: solo la cenital del hielo; el resto oculto con su transform
  // de entrada. `engano` entra con un tiron (yPercent) para el corte seco de la
  // traicion; `tunel` entra girado para la caida sin gravedad.
  const base = () => {
    portada.classList.add('is-armed');
    gsap.set(hielo, { autoAlpha: 1, scale: 1, rotation: 0, xPercent: 0 });
    gsap.set(superficie, { autoAlpha: 0, scale: 1.14 });
    gsap.set(mann, { autoAlpha: 0, scale: 1.12 });
    gsap.set(engano, { autoAlpha: 0, scale: 1.18, yPercent: 6, filter: 'brightness(1) contrast(1)' });
    gsap.set(docking, { autoAlpha: 0, scale: 1.12 });
    gsap.set(tunel, { autoAlpha: 0, scale: 1.16, rotation: -5 });
    if (baliza) gsap.set(baliza, { autoAlpha: 0, x: 0 });
    if (baliza) baliza.classList.remove('is-mentira');
    if (balizaEstado) balizaEstado.textContent = 'Habitable';
  };

  const cleanup = (tl) => () => {
    if (tl.scrollTrigger) tl.scrollTrigger.kill();
    tl.kill();
    portada.classList.remove('is-armed');
    gsap.set([...capas, texto, volver], { clearProps: 'all' });
    if (baliza) {
      gsap.set(baliza, { clearProps: 'all' });
      baliza.classList.remove('is-mentira');
    }
    if (balizaEstado) balizaEstado.textContent = 'Habitable';
  };

  const beat = (tl, capa, pos, extra) => {
    tl.to(capa, { autoAlpha: 1, duration: 0.05 }, pos)
      .to(capa, { scale: 1, yPercent: 0, xPercent: 0, rotation: 0, duration: 0.12, ...extra }, pos);
  };
  const salida = (tl, capa, pos) =>
    tl.to(capa, { autoAlpha: 0, ease: 'power2.in', duration: 0.05 }, pos);

  // La baliza: un proxy 0..1 que el scrub arrastra. Cuando pasa 0.5 (la
  // traicion) conmuta la lectura HABITABLE -> ENGAÑO y prende `.is-mentira`
  // (verde -> rojo). onUpdate = funciona en los dos sentidos del scroll.
  const balizaSenal = (tl, movil) => {
    if (!baliza || !balizaEstado) return;
    tl.to(baliza, { autoAlpha: 0.92, duration: 0.06 }, movil ? 0.14 : 0.1);
    const proxy = { v: 0 };
    tl.to(
      proxy,
      {
        v: 1,
        duration: 0.02,
        onUpdate: () => {
          const mentira = proxy.v > 0.5;
          baliza.classList.toggle('is-mentira', mentira);
          balizaEstado.textContent = mentira ? 'Engaño' : 'Habitable';
        },
      },
      0.45,
    );
    // glitch corto al conmutar
    tl.to(baliza, { x: 5, duration: 0.02 }, 0.45)
      .to(baliza, { x: -4, duration: 0.02 }, 0.47)
      .to(baliza, { x: 0, duration: 0.03 }, 0.49)
      .to(baliza, { autoAlpha: 0.35, duration: 0.02 }, 0.45)
      .to(baliza, { autoAlpha: 0.92, duration: 0.05 }, 0.5);
  };

  // Construye los 6 beats sobre `tl`. `amp` (0..1) atenua los zooms en movil.
  const coreografia = (tl, amp) => {
    tl
      .to([texto, volver], { autoAlpha: 0, y: -40 * amp, duration: 0.07 }, 0)
      // 1 · hielo: cenital del paramo blanco; push-in lento + deriva minima
      .to(hielo, { scale: 1 + 0.16 * amp, duration: 0.4 }, 0)
      .to(hielo, { xPercent: -3 * amp, duration: 0.4 }, 0);
    salida(tl, hielo, 0.14);

    // 2 · superficie: dos figuras en las crestas de hielo
    beat(tl, superficie, 0.14);
    salida(tl, superficie, 0.28);

    // 3 · mann: el doctor Mann, el mas condecorado -> el que miente
    beat(tl, mann, 0.28);
    salida(tl, mann, 0.42);

    // 4 · engano: la traicion. Corte seco (entra con tiron) + oscurecimiento.
    tl.to(engano, { autoAlpha: 1, duration: 0.04 }, 0.42);
    tl.to(engano, { yPercent: 0, scale: 1, ease: 'power2.out', duration: 0.1 }, 0.42);
    tl.to(engano, { filter: 'brightness(0.88) contrast(1.18)', duration: 0.1 }, 0.44);
    tl.to(engano, { xPercent: 1.5, duration: 0.03 }, 0.43).to(engano, { xPercent: 0, duration: 0.03 }, 0.47);
    salida(tl, engano, 0.58);

    // 5 · docking: la aproximacion a la Endurance; leve push (nos acercamos)
    beat(tl, docking, 0.58, { scale: 1.06 });
    salida(tl, docking, 0.72);

    // 6 · tunel: la caida por el tunel de acoplamiento. AGUANTA girando lento y
    //     se disuelve a un fantasma hasta que suelta el sticky (sin negro vacio).
    beat(tl, tunel, 0.72, { rotation: 0 });
    tl.to(tunel, { rotation: -3 * amp, scale: 1.08, ease: 'power1.inOut', duration: 0.3 }, 0.76);
    tl.to(tunel, { autoAlpha: 0.22, ease: 'power1.in', duration: 0.16 }, 0.86);
  };

  const armar = (amp, movil) => () => {
    base();
    const tl = gsap.timeline({
      scrollTrigger: { trigger: portada, start: 'top top', end: 'bottom bottom', scrub: 0.5 },
      defaults: { ease: 'none' },
    });
    coreografia(tl, amp);
    balizaSenal(tl, movil);
    return cleanup(tl);
  };

  mm.add('(min-width: 48rem) and (prefers-reduced-motion: no-preference)', armar(1, false));
  mm.add('(max-width: 47.99rem) and (prefers-reduced-motion: no-preference)', armar(0.5, true));
}

// --- Tesseract: el pasillo del tiempo, 6 fotogramas + tren de morse ---------
function escenaTesseract(gsap, mm, portada) {
  const reticula = portada.querySelector('.mundo-capa--tesseract-reticula');
  const caida = portada.querySelector('.mundo-capa--tesseract-caida');
  const estante = portada.querySelector('.mundo-capa--tesseract-estante');
  const empuje = portada.querySelector('.mundo-capa--tesseract-empuje');
  const mensaje = portada.querySelector('.mundo-capa--tesseract-mensaje');
  const murph = portada.querySelector('.mundo-capa--tesseract-murph');
  const texto = portada.querySelector('.mundo-portada-texto');
  const volver = portada.querySelector('.mundo-volver');
  const morse = portada.querySelector('.mundo-morse');
  const grupos = [...portada.querySelectorAll('.mundo-morse-g')];
  const palabra = portada.querySelector('[data-morse-palabra]');
  const capas = [reticula, caida, estante, empuje, mensaje, murph];
  if (capas.some((c) => !c)) {
    return; // DOM inesperado -> hero estatico
  }

  // Estado inicial: solo la reticula; el resto oculto con su transform de
  // entrada. `caida` entra girada (la caida sin gravedad por la estructura).
  const base = () => {
    portada.classList.add('is-armed');
    gsap.set(reticula, { autoAlpha: 1, scale: 1, rotation: 0, xPercent: 0 });
    gsap.set(caida, { autoAlpha: 0, scale: 1.2, rotation: 5 });
    gsap.set(estante, { autoAlpha: 0, scale: 1.14 });
    gsap.set(empuje, { autoAlpha: 0, scale: 1.12 });
    gsap.set(mensaje, { autoAlpha: 0, scale: 1.14 });
    gsap.set(murph, { autoAlpha: 0, scale: 1.1 });
    if (morse) gsap.set(morse, { autoAlpha: 0 });
    grupos.forEach((g) => gsap.set(g, { autoAlpha: 0.26 }));
    if (palabra) gsap.set(palabra, { autoAlpha: 0 });
  };

  const cleanup = (tl) => () => {
    if (tl.scrollTrigger) tl.scrollTrigger.kill();
    tl.kill();
    portada.classList.remove('is-armed');
    gsap.set([...capas, texto, volver], { clearProps: 'all' });
    if (morse) gsap.set([morse, ...grupos, palabra].filter(Boolean), { clearProps: 'all' });
  };

  const beat = (tl, capa, pos, extra) => {
    tl.to(capa, { autoAlpha: 1, duration: 0.05 }, pos)
      .to(capa, { scale: 1, yPercent: 0, xPercent: 0, rotation: 0, duration: 0.12, ...extra }, pos);
  };
  const salida = (tl, capa, pos) =>
    tl.to(capa, { autoAlpha: 0, ease: 'power2.in', duration: 0.05 }, pos);

  // El tren de morse (S T A Y). Un proxy 0..4 que el scrub arrastra; cada grupo
  // se enciende cuando el proxy pasa su indice. Al final asoma la palabra
  // decodificada y el tren baja de intensidad (transmision cerrada).
  const morseTren = (tl, movil) => {
    if (!morse || grupos.length === 0) return;
    tl.to(morse, { autoAlpha: 0.9, duration: 0.06 }, movil ? 0.14 : 0.1);
    const proxy = { v: 0 };
    tl.to(
      proxy,
      {
        v: grupos.length,
        ease: 'none',
        duration: 0.6,
        onUpdate: () => {
          grupos.forEach((g, i) => { g.style.opacity = proxy.v > i + 0.5 ? '1' : '0.26'; });
        },
      },
      0.14,
    );
    if (palabra) {
      tl.to(palabra, { autoAlpha: 1, duration: 0.06 }, 0.8);
      tl.to(grupos, { autoAlpha: 0.5, duration: 0.08 }, 0.82);
    }
  };

  // Construye los 6 beats sobre `tl`. `amp` (0..1) atenua los zooms en movil.
  const coreografia = (tl, amp) => {
    tl
      .to([texto, volver], { autoAlpha: 0, y: -40 * amp, duration: 0.07 }, 0)
      // 1 · reticula: la estructura infinita; push-in lento + leve rotacion
      .to(reticula, { scale: 1 + 0.16 * amp, duration: 0.36 }, 0)
      .to(reticula, { rotation: -1.5 * amp, duration: 0.36 }, 0);
    salida(tl, reticula, 0.14);

    // 2 · caida: la caida sin gravedad — entra girada y se endereza
    beat(tl, caida, 0.14, { rotation: 0 });
    salida(tl, caida, 0.28);

    // 3 · estante: detras de la estanteria, la habitacion por los hilos
    beat(tl, estante, 0.28);
    salida(tl, estante, 0.42);

    // 4 · empuje: Cooper tensandose contra el estante; push-in + sacudida corta
    beat(tl, empuje, 0.42, { scale: 1.08 });
    tl.to(empuje, { xPercent: 1.5 * amp, duration: 0.03 }, 0.46).to(empuje, { xPercent: 0, duration: 0.03 }, 0.5);
    salida(tl, empuje, 0.56);

    // 5 · mensaje: la vista cenital del cuarto — el instante que intenta cambiar
    beat(tl, mensaje, 0.56);
    salida(tl, mensaje, 0.72);

    // 6 · murph: Murph adulta frente al estante, entendiendo. AGUANTA y se
    //     disuelve a un fantasma hasta que suelta el sticky (sin negro vacio).
    beat(tl, murph, 0.72);
    tl.to(murph, { scale: 1 + 0.06 * amp, ease: 'power1.inOut', duration: 0.28 }, 0.76);
    tl.to(murph, { autoAlpha: 0.22, ease: 'power1.in', duration: 0.16 }, 0.86);
  };

  const armar = (amp, movil) => () => {
    base();
    const tl = gsap.timeline({
      scrollTrigger: { trigger: portada, start: 'top top', end: 'bottom bottom', scrub: 0.5 },
      defaults: { ease: 'none' },
    });
    coreografia(tl, amp);
    morseTren(tl, movil);
    return cleanup(tl);
  };

  mm.add('(min-width: 48rem) and (prefers-reduced-motion: no-preference)', armar(1, false));
  mm.add('(max-width: 47.99rem) and (prefers-reduced-motion: no-preference)', armar(0.5, true));
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMundoPortada);
  } else {
    initMundoPortada();
  }
}

export { initMundoPortada };
