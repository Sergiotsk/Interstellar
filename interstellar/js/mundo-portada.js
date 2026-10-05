// Portadas animadas de las paginas de mundo (`.mundo-portada`): una escena GSAP scroll-scrubbed por mundo.
// Escenas: Tierra, Gargantua (+ chispas), Miller (+ reloj), Mann (+ baliza), Tesseract (+ morse).
// GSAP 3.13 + ScrollTrigger vendorizados en js/vendor/gsap@3.13.0/ (ruta relativa, sin CDN).
// Degradado: sin JS / sin GSAP / reduced-motion -> hero estatico; `.is-armed` solo lo agrega este modulo.
// Detalle y porques: docs/20-notas-de-codigo/portadas-de-mundos.md

let activeMM = null;

async function initMundoPortada() {
  unmountMundoPortada();
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
  if (typeof window !== 'undefined') {
    window.ScrollTrigger = ScrollTrigger;
  }
  ScrollTrigger.config({ ignoreMobileResize: true });

  // matchMedia de GSAP: arma la escena segun viewport y la revierte sola; con reduced-motion no matchea -> hero estatico.
  const mm = gsap.matchMedia();
  activeMM = mm;

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

  // El pin agrega espacio: los triggers creados antes (tira de celuloide) deben recalcularse.
  ScrollTrigger.refresh();
}

// Prefetch + decode de las capas del mundo activo para evitar pantallas negras al scrollear.
function precargarCapas(capas) {
  if (typeof window === 'undefined') return;
  capas.forEach((capa) => {
    if (!capa) return;
    const bg = getComputedStyle(capa).backgroundImage;
    const match = bg && bg.match(/url\(["']?([^"']+)["']?\)/);
    if (match && match[1]) {
      const img = new Image();
      img.src = match[1];
      if (typeof img.decode === 'function') {
        img.decode().catch(() => {});
      }
    }
  });
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

  // Estado inicial: solo la orbita visible; el resto oculto (autoAlpha 0) con su transform de entrada.
  const base = () => {
    portada.classList.add('is-armed');
    precargarCapas(capas);
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

    // Timeline normalizado 0..1; crossfades cortos (0.06) para evitar doble exposicion.
    tl
      // el texto se va temprano, antes de "bajar" del planeta
      .to([texto, volver], { autoAlpha: 0, y: -40, duration: 0.08 }, 0)

      // 1 · orbita: zoom + deriva de unos grados
      .to(orbita, { rotation: 5, duration: 0.34 }, 0)
      .to(orbita, { scale: 1.4, duration: 0.22 }, 0)
      .to(orbita, { autoAlpha: 0, ease: 'power2.in', duration: 0.06 }, 0.16)

      // 2 · granja
      .to(granja, { autoAlpha: 1, duration: 0.06 }, 0.16)
      .to(granja, { scale: 1, duration: 0.2 }, 0.16)

      // 3 · maizal: el color se drena al final del beat
      .to(maizal, { autoAlpha: 1, duration: 0.06 }, 0.38)
      .to(maizal, { scale: 1, duration: 0.2 }, 0.38)
      .to(maizal, { filter: 'saturate(0.4) brightness(0.85)', duration: 0.12 }, 0.46)

      // 4 · tormenta: entra opaca y se asienta sobre si misma
      .to(tormenta, { autoAlpha: 1, duration: 0.06 }, 0.58)
      .to(tormenta, { yPercent: 0, scale: 1, duration: 0.16 }, 0.6)

      // 5 · abandonada: la granja sepultada
      .to(abandonada, { autoAlpha: 1, duration: 0.06 }, 0.78)
      .to(abandonada, { scale: 1, duration: 0.16 }, 0.78)
      // remate: leve empuje final antes de soltar el sticky
      .to(abandonada, { scale: 1.04, duration: 0.06 }, 0.94);

    return cleanup(tl);
  });

  // --- Movil: mismos 5 beats, zoom mas contenido (riel mas corto, ver mundos.css) ---
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

    // Mismas posiciones que escritorio; deriva y zoom de la orbita contenidos.
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

      // 5 · abandonada
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

  // Estado inicial: solo el primer fotograma; el `scale` de entrada > 1 da el empuje de camara.
  const base = () => {
    portada.classList.add('is-armed');
    precargarCapas(capas);
    gsap.set(lejos, { autoAlpha: 1, scale: 1, rotation: 0 });
    gsap.set(disco, { autoAlpha: 0, scale: 1.12 });
    gsap.set(plano, { autoAlpha: 0, scale: 1.16, yPercent: -4 });
    gsap.set(endurance, { autoAlpha: 0, scale: 1.12 });
    gsap.set(ranger, { autoAlpha: 0, scale: 1.16, xPercent: 3 });
    gsap.set(deriva, { autoAlpha: 0, scale: 1.18 });
    // los dos campos de chispas siempre visibles; `pulso` controla la intensidad
    if (fx) gsap.set(fx, { autoAlpha: 1 });
    if (fxFondo) gsap.set(fxFondo, { autoAlpha: 1 });
  };

  // Campo de chispas: canvas con trazos que salen del punto de fuga acelerando; `pulso.v` (0..1) modula cuantas y con que brillo.
  // Se usa dos veces: capa delante y detras del fotograma (profundidad, ver docs/20-notas-de-codigo/portadas-de-mundos.md#canvas-de-chispas).
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

  // Beat = fade-in corto + asentamiento del transform; crossfades de 0.05, ~0.13 por beat.
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
      // el texto se va temprano
      .to([texto, volver], { autoAlpha: 0, y: -40, duration: 0.07 }, 0)
      // 1 · lejos: push-in largo + deriva minima
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

    // 6 · deriva: ultimo fotograma; aguanta y se disuelve lento, solapado con las chispas.
    beat(tl, deriva, 0.66);
    tl.to(deriva, { scale: 1.12, ease: 'power1.inOut', duration: 0.34 }, 0.7);
    // No se apaga del todo: queda un fantasma hasta soltar el sticky (sin pantalla negra).
    tl.to(deriva, { autoAlpha: 0.22, ease: 'power1.in', duration: 0.16 }, 0.86);

    // Chispas: bajan algo con el scroll pero siguen presentes hasta el final.
    tl.to(pulso, { v: 1, duration: 0.08 }, 0.8);
    tl.to(pulso, { v: 0.6, ease: 'power1.in', duration: 0.16 }, 0.86);

    return cleanup(tl, paradas);
  });

  // --- Movil: mismos 6 fotogramas, riel mas corto y zoom contenido ---
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
      // en movil `cover` ya amplia en vertical -> sin zoom
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

    // deriva: aguanta y se disuelve lento; sin zoom extra en movil.
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

  // Estado inicial: solo el primer fotograma; la ola entra hundida (trepa) y el muro entra alto (baja).
  const base = () => {
    portada.classList.add('is-armed');
    precargarCapas(capas);
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

  // Beat = fade-in + asentamiento + fade-out cortos (crossfades de 0.05).
  const beat = (tl, capa, pos, extra) => {
    tl.to(capa, { autoAlpha: 1, duration: 0.05 }, pos)
      .to(capa, { scale: 1, yPercent: 0, xPercent: 0, duration: 0.11, ...extra }, pos);
  };
  const salida = (tl, capa, pos) =>
    tl.to(capa, { autoAlpha: 0, ease: 'power2.in', duration: 0.05 }, pos);

  // Reloj de dilatacion: proxy 0..23 que el scrub vuelca al <span> (1 h en Miller = 7 años arriba).
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
    // golpe seco cuando el muro cae sobre el Ranger
    tl.to(reloj, { scale: 1.18, duration: 0.06 }, 0.62)
      .to(reloj, { scale: 1, duration: 0.1 }, 0.68);
  };

  // Construye los 7 beats sobre `tl`; `amp` (0..1) atenua los zooms en movil.
  const coreografia = (tl, amp) => {
    tl
      // el texto se va temprano
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

    // 4 · ola: Doyle corre hacia camara con el muro detras; push-in + sacudida corta
    tl.to(ola, { autoAlpha: 1, duration: 0.05 }, 0.35);
    tl.to(ola, { scale: 1, xPercent: 0, ease: 'power2.out', duration: 0.13 }, 0.35);
    tl.to(ola, { xPercent: -2.5 * amp, duration: 0.04 }, 0.41).to(ola, { xPercent: 0, duration: 0.04 }, 0.46);
    salida(tl, ola, 0.52);

    // 5 · impacto: Doyle mira los restos zarandeados, la ola ya detras; sacudida + blanqueo
    beat(tl, impacto, 0.52);
    tl.to(impacto, { filter: 'brightness(1.14) saturate(0.74)', duration: 0.1 }, 0.54);
    tl.to(impacto, { xPercent: 2, duration: 0.04 }, 0.52).to(impacto, { xPercent: 0, duration: 0.04 }, 0.58);
    salida(tl, impacto, 0.63);

    // 6 · muro: entra alto y baja creciendo (se viene encima); aguanta
    tl.to(muro, { autoAlpha: 1, duration: 0.05 }, 0.63);
    tl.to(muro, { yPercent: 4, scale: 1.12 + 0.08 * amp, ease: 'power1.in', duration: 0.16 }, 0.63);
    salida(tl, muro, 0.79);

    // 7 · cabina: Brand quebrada; aguanta y se disuelve lento (sin pantalla vacia)
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

  // Escritorio: zooms plenos. Movil: `amp` 0.5 porque `cover` ya amplia en vertical.
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

  // Estado inicial: solo la cenital; `engano` entra con tiron (corte de la traicion), `tunel` entra girado.
  const base = () => {
    portada.classList.add('is-armed');
    precargarCapas(capas);
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

  // Baliza: proxy 0..1; al pasar 0.5 (la traicion) conmuta HABITABLE -> ENGAÑO via onUpdate (reversible con el scroll).
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

  // Construye los 6 beats sobre `tl`; `amp` (0..1) atenua los zooms en movil.
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

    // 6 · tunel: aguanta girando lento y queda como fantasma (sin negro vacio)
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

  // Estado inicial: solo la reticula; `caida` entra girada.
  const base = () => {
    portada.classList.add('is-armed');
    precargarCapas(capas);
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

  // Tren de morse: proxy 0..N; cada grupo se enciende al pasar su indice; al final asoma la palabra.
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

  // Construye los 6 beats sobre `tl`; `amp` (0..1) atenua los zooms en movil.
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

    // 6 · murph: aguanta y se disuelve a un fantasma (sin negro vacio)
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

export function unmountMundoPortada() {
  if (activeMM) {
    try {
      activeMM.revert();
    } catch (e) {}
    activeMM = null;
  }
}

if (typeof document !== 'undefined') {
  if (!window.__SWUP_ROUTER_ACTIVE__) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initMundoPortada);
    } else {
      initMundoPortada();
    }
  }
}

export { initMundoPortada };
