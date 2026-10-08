// Layout compartido (FR-001): header con nav y footer unicos por pagina; el arbol sale de nav-data.js.
// Las funciones build*/renderLayout son puras (testeables sin browser); init() inyecta en el DOM.

import { NavConfig } from './nav-data.js';
import { createSubmenuState } from './submenu-state.js';

const REPO_URL = 'https://github.com/Sergiotsk/Interstellar.git';
const SITE_URL = 'https://sergiotsk.github.io/Interstellar/';
// Pie: consola de teclas cortas (contacto, compartir, creditos, repo). Disclaimer y atribucion viven en creditos.html.

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function buildChildList(item) {
  const children = item.children
    .map(
      (child) =>
        `        <li><a href="${escapeHtml(child.href)}">${escapeHtml(child.label)}</a></li>`,
    )
    .join('\n');
  return `      <ul id="submenu-${escapeHtml(item.id)}" hidden>\n${children}\n      </ul>`;
}

function buildTopLevelItem(item) {
  let html = `        <li><a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`;
  if (item.hasChildren) {
    html +=
      `<button type="button" aria-expanded="false" aria-controls="submenu-${escapeHtml(item.id)}" aria-label="Abrir submenú de ${escapeHtml(item.label)}">▼</button>\n` +
      buildChildList(item);
  }
  return `${html}\n        </li>`;
}

export function buildHeader(navConfig = NavConfig) {
  const items = navConfig.items.map(buildTopLevelItem).join('\n');
  // Marca del header: <a> real (navegable y accesible) con placa de instrumento; visible <60rem.
  // Boton CASE: 4 barras verticales dibujadas solo con CSS. Va FUERA del <nav> para que
  // collectDisclosures no lo confunda con un disclosure de submenu.
  return `<header>
  <a class="cockpit-brand" href="index.html" aria-label="Interstellar — ir al inicio"><span class="cockpit-marca">Interstellar</span><span class="cockpit-brand-linea"><span>NAV</span><span class="cockpit-brand-ext"> · ENDURANCE</span></span></a>
  <button type="button" class="musica-toggle" aria-pressed="false" aria-label="Música de fondo: activar"><span class="musica-icono" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V6l10-2v10" /><circle cx="6" cy="18" r="3" fill="currentColor" stroke="none" /><circle cx="16" cy="16" r="3" fill="currentColor" stroke="none" /></svg></span></button>
  <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="nav-principal" aria-label="Abrir menú de navegación"><span class="case-icon" aria-hidden="true"><span></span><span></span><span></span><span></span></span></button>
  <nav id="nav-principal" aria-label="Navegación principal">
    <ul>
${items}
    </ul>
  </nav>
</header>`;
}

// Consola de tres zonas: grupos laterales FIJOS por id (3+3 simetrico, sin Inicio ni Trailer).
// Misma paleta que el chrome; la seccion activa se marca con aria-current (ver docs/20-notas-de-codigo/layout-y-router.md#pie).
const PIE_IZQUIERDA_IDS = ['mundos', 'personajes', 'la-ciencia'];
const PIE_DERECHA_IDS = ['el-viaje', 'galeria', 'minijuegos'];

function buildPieSeccionesGrupo(navConfig, ids, etiqueta) {
  const items = ids
    .map((id) => navConfig.items.find((item) => item.id === id))
    .filter(Boolean)
    .map(
      (item) =>
        `          <li class="tele tele-accion tele-fina"><a href="${escapeHtml(item.href)}"><span class="led" aria-hidden="true"></span><span class="tele-v">${escapeHtml(item.label)}</span></a></li>`,
    )
    .join('\n');
  // El clip-path va en el marco, no en el <nav>/<ul>, para no cortar focus-rings ni tap targets.
  return `<div class="pie-secciones-marco">
    <nav class="pie-secciones" aria-label="${escapeHtml(etiqueta)}">
      <ul>
${items}
      </ul>
    </nav>
  </div>`;
}

export function buildFooter(navConfig = NavConfig) {
  // Teclas del cockpit (.tele-accion): una palabra + LED decorativo; aria-label da el destino.
  // WhatsApp/Facebook comparten la home sin JS (wireFooterShare los sube a la pagina actual);
  // "Compartir" (Web Share API) nace oculta y el JS la muestra solo si navigator.share existe.
  // .pie-placa y .pie-pantalla son decoracion aria-hidden (CSS en css/layout.css).
  const waFallback = `https://wa.me/?text=${encodeURIComponent(`Interstellar — ${SITE_URL}`)}`;
  const fbFallback = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`;
  return `<footer>
  <div class="pie-consola">
    ${buildPieSeccionesGrupo(navConfig, PIE_IZQUIERDA_IDS, 'Secciones (izquierda)')}
    <div class="pie-pantalla">
      <div class="pie-placa" aria-hidden="true">
        <span class="pie-placa-linea"></span>
        <span class="pie-placa-marca">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
            <path fill="currentColor" d="M12 2C14.6 4.6 16 8.6 16 13L8 13C8 8.6 9.4 4.6 12 2Z M8 12L4 18L8 15Z M16 12L20 18L16 15Z M10 13L12 20L14 13Z" />
            <circle cx="12" cy="8.3" r="1.7" fill="var(--cockpit-metal)" />
          </svg>
          <span class="pie-placa-texto">
            <span class="pie-placa-titulo">Endurance</span>
            <span class="pie-placa-subtitulo">Control Panel</span>
          </span>
        </span>
        <span class="pie-placa-linea"></span>
      </div>
      <div class="pie-pantallas" aria-hidden="true">
        <span class="pie-perillas"><span class="pie-perilla"></span><span class="pie-perilla"></span></span>
        <div class="pie-scope">
          <span class="pie-scope-label">Gargantúa</span>
          <svg class="pie-scope-svg" viewBox="0 0 210 66" preserveAspectRatio="xMidYMid meet" focusable="false">
            <ellipse class="pie-scope-orbita" cx="105" cy="34" rx="95" ry="22" />
            <ellipse class="pie-scope-orbita pie-scope-orbita--2" cx="105" cy="34" rx="62" ry="13" />
            <circle class="pie-scope-planeta" cx="105" cy="34" r="11" />
            <circle class="pie-scope-luna" cx="196" cy="34" r="3" />
            <line class="pie-scope-barrido" x1="105" y1="34" x2="200" y2="16" />
          </svg>
          <span class="pie-scope-tags"><span>RECALIB</span><span>PARSE</span><span>SYNC</span></span>
        </div>
        <div class="pie-telemetria">
          <span class="pie-telemetria-linea">GRAVIMETRIC · STABLE</span>
          <span class="pie-telemetria-linea">ROTATIONAL SYNC · 98%</span>
          <span class="pie-telemetria-linea">THERMAL · NOMINAL</span>
          <span class="pie-telemetria-linea pie-telemetria-linea--alerta">HULL STRESS · 04%</span>
          <span class="pie-telemetria-linea">UPLINK · ONLINE</span>
        </div>
        <span class="pie-perillas"><span class="pie-perilla"></span><span class="pie-perilla"></span></span>
      </div>
      <ul class="pie-acciones">
        <li class="tele tele-accion"><a href="contacto.html" aria-label="Formulario de contacto"><span class="led" aria-hidden="true"></span><span class="tele-v">Contacto</span></a></li>
        <li class="tele tele-accion"><a href="${escapeHtml(waFallback)}" data-share="whatsapp" target="_blank" rel="noopener" aria-label="Compartir el sitio en WhatsApp"><span class="led" aria-hidden="true"></span><span class="tele-v">WhatsApp</span></a></li>
        <li class="tele tele-accion"><a href="${escapeHtml(fbFallback)}" data-share="facebook" target="_blank" rel="noopener" aria-label="Compartir el sitio en Facebook"><span class="led" aria-hidden="true"></span><span class="tele-v">Facebook</span></a></li>
        <li class="tele tele-accion" data-share-nativo hidden><button type="button" data-share="nativo" aria-label="Compartir el sitio"><span class="led led-ambar" aria-hidden="true"></span><span class="tele-v">Compartir</span></button></li>
        <li class="tele tele-accion"><a href="creditos.html" aria-label="Créditos y fuentes"><span class="led" aria-hidden="true"></span><span class="tele-v">Créditos</span></a></li>
        <li class="tele tele-accion"><a href="${escapeHtml(REPO_URL)}" aria-label="Repositorio en GitHub"><span class="led led-alerta" aria-hidden="true"></span><span class="tele-v">GitHub</span></a></li>
      </ul>
      <div class="pie-pantalla-estado" aria-hidden="true">
        <span></span>
        <span></span>
      </div>
    </div>
    ${buildPieSeccionesGrupo(navConfig, PIE_DERECHA_IDS, 'Secciones (derecha)')}
  </div>
</footer>`;
}

// Boton "volver arriba" (cohete SVG): tecla flotante, ultimo hijo del body; initBotonSubir lo conecta.
// SVG propio y no emoji, para teñirlo con los tokens del sitio (ver docs/20-notas-de-codigo/layout-y-router.md#boton-subir).
export function buildBotonSubir() {
  return (
    '<button type="button" class="boton-subir" aria-label="Volver arriba de la página">' +
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">' +
    '<path fill="currentColor" d="M12 2C14.6 4.6 16 8.6 16 13L8 13C8 8.6 9.4 4.6 12 2Z ' +
    'M8 12L4 18L8 15Z M16 12L20 18L16 15Z M10 13L12 20L14 13Z" />' +
    '<circle cx="12" cy="8.3" r="1.7" fill="var(--cockpit-metal)" />' +
    '</svg>' +
    '</button>'
  );
}

export function renderLayout(navConfig = NavConfig) {
  return {
    header: buildHeader(navConfig),
    footer: buildFooter(navConfig),
  };
}

// Cielo compartido (css/layout.css §15): decorativo, primer hijo del <body>, solo en paginas con-cielo.
export function buildCielo() {
  return '<div class="cielo" aria-hidden="true"><i></i><i></i><i></i></div>';
}

/* -----------------------------------------------------------------------------
   Disclosure de submenus (T011) — contracts/navigation.md + data-model.md §6.
   La maquina de estados vive en submenu-state.js; aca solo se conectan los eventos del DOM.
   ----------------------------------------------------------------------------- */
function collectDisclosures(nav) {
  const disclosures = [];
  const buttons = nav.querySelectorAll('button[aria-controls]');
  buttons.forEach((button) => {
    const axisId = button.getAttribute('aria-controls').replace('submenu-', '');
    const submenu = button.parentElement.querySelector('ul');
    if (submenu) {
      disclosures.push({ button, submenu, axisId });
    }
  });
  return disclosures;
}

function syncDisclosures(estado, disclosures) {
  disclosures.forEach(({ button, submenu, axisId }) => {
    const isOpen = estado.openSubmenuId === axisId;
    submenu.hidden = !isOpen;
    button.setAttribute('aria-expanded', String(isOpen));
  });
}

function wireDisclosure(nav, estado) {
  const disclosures = collectDisclosures(nav);
  if (disclosures.length === 0) {
    return;
  }
  syncDisclosures(estado, disclosures);

  // Un solo listener de `click` cubre clic, toque, Enter y Space (<button> nativo).
  disclosures.forEach(({ button, axisId }) => {
    button.addEventListener('click', () => {
      estado.toggle(axisId);
      syncDisclosures(estado, disclosures);
    });
  });

  // Elegir un destino anidado cierra el submenu; la navegacion sigue por defecto (HU1-E4).
  nav.querySelectorAll('ul ul a').forEach((link) => {
    link.addEventListener('click', () => {
      estado.navigate();
      syncDisclosures(estado, disclosures);
    });
  });

  // Cierre con restauracion de foco al control que estaba abierto (FR-010).
  const dismissConFoco = () => {
    const controlId = estado.dismiss(); // devuelve el id del control objetivo
    syncDisclosures(estado, disclosures);
    if (controlId) {
      const target = disclosures.find((d) => d.axisId === controlId);
      if (target) {
        target.button.focus();
      }
    }
  };

  // Escape: cierra y restaura el foco (FR-010).
  nav.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      dismissConFoco();
    }
  });

  // Clic fuera de la navegacion: cierra y restaura el foco (FR-010).
  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target)) {
      dismissConFoco();
    }
  });

  // Foco fuera del nav: cierra y restaura el foco.
  nav.addEventListener('focusout', (event) => {
    const nextTarget = event.relatedTarget;
    if (nextTarget && !nav.contains(nextTarget)) {
      dismissConFoco();
    }
  });

  // Sin hover-open ni cierre por mouseleave: solo gestos explicitos abren/cierran
  // (ver docs/20-notas-de-codigo/layout-y-router.md#drawer-y-submenus).
}

/* -----------------------------------------------------------------------------
   Drawer de navegacion — contracts/navigation.md + FR-022, SC-003, SC-005.
   Oculto por defecto (CSS); el boton CASE alterna aria-expanded y la clase `nav-abierto` del nav.
   ----------------------------------------------------------------------------- */
function wireDrawer(header, nav, estado) {
  const toggle = header.querySelector('.nav-toggle');
  if (!toggle || !nav) {
    return;
  }
  const disclosures = collectDisclosures(nav);

  // Colapsa cualquier submenu abierto y resincroniza hidden/aria-expanded.
  const colapsarSubmenus = () => {
    estado.dismiss(); // descarta el submenu abierto (no queremos restaurar foco aqui)
    syncDisclosures(estado, disclosures);
  };

  // Primer enlace enfocable dentro del drawer (destino superior o anidado).
  const primerEnlace = () => nav.querySelector('a');

  const cerrarDrawer = () => {
    if (!nav.classList.contains('nav-abierto')) {
      return;
    }
    nav.classList.remove('nav-abierto');
    toggle.setAttribute('aria-expanded', 'false');
    colapsarSubmenus();
    toggle.focus();
  };

  const abrirDrawer = () => {
    nav.classList.add('nav-abierto');
    toggle.setAttribute('aria-expanded', 'true');
    colapsarSubmenus(); // arranque limpio: acordeon cerrado al abrir (T030)
    const primera = primerEnlace();
    if (primera) {
      primera.focus();
    }
  };

  const alternarDrawer = () => {
    if (nav.classList.contains('nav-abierto')) {
      cerrarDrawer();
    } else {
      abrirDrawer();
    }
  };

  toggle.addEventListener('click', (event) => {
    event.stopPropagation(); // evita que el listener de clic-fuera lo cierre al instante
    alternarDrawer();
  });

  // Elegir CUALQUIER destino cierra el drawer; la navegacion nativa continua.
  nav.addEventListener('click', (event) => {
    if (nav.classList.contains('nav-abierto') && event.target.closest('a')) {
      cerrarDrawer();
    }
  });

  // Escape (nivel documento): cierra el drawer y restaura el foco al boton CASE.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('nav-abierto')) {
      cerrarDrawer();
    }
  });

  // Clic fuera del header: cierra el drawer.
  document.addEventListener('click', (event) => {
    if (nav.classList.contains('nav-abierto') && !header.contains(event.target)) {
      cerrarDrawer();
    }
  });
}

// Hero de la home: con prefers-reduced-motion se pausa el <video> y queda el poster. Reacciona en caliente.
export function initHeroVideo() {
  if (typeof document.querySelector !== 'function' || typeof matchMedia !== 'function') {
    return;
  }
  const video = document.querySelector('video.hero-backdrop');
  if (!video) {
    return;
  }
  const quieto = matchMedia('(prefers-reduced-motion: reduce)');
  const aplicar = () => {
    if (quieto.matches) {
      video.pause();
      try { video.currentTime = 0; } catch (_) { /* aun sin metadata */ }
    } else {
      const p = video.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {}); // autoplay bloqueado (iOS bajo consumo): queda el poster
      }
    }
  };
  aplicar();
  if (typeof quieto.addEventListener === 'function') {
    quieto.addEventListener('change', aplicar);
  }
}

// Compartir desde el pie: WhatsApp/Facebook se actualizan a la pagina actual; "Compartir"
// (Web Share API) solo se muestra si navigator.share existe.
function wireFooterShare(footer) {
  if (!footer || typeof footer.querySelector !== 'function') {
    return;
  }
  const url = window.location.href;
  const titulo = document.title || 'Interstellar';

  const wa = footer.querySelector('a[data-share="whatsapp"]');
  if (wa) {
    wa.href = `https://wa.me/?text=${encodeURIComponent(`${titulo} — ${url}`)}`;
  }
  const fb = footer.querySelector('a[data-share="facebook"]');
  if (fb) {
    fb.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  }

  const nativoLi = footer.querySelector('[data-share-nativo]');
  const nativoBtn = footer.querySelector('button[data-share="nativo"]');
  if (
    nativoLi &&
    nativoBtn &&
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function'
  ) {
    nativoLi.hidden = false;
    nativoBtn.addEventListener('click', () => {
      navigator.share({ title: titulo, url }).catch(() => {});
    });
  }
}

// Aviso de spoiler (css/layout.css §17): en la primera visita alerta en el header hasta confirmar.
// localStorage puede tirar (modo privado): va en try/catch y, si falla, el aviso reaparece.
const SPOILER_KEY = 'interstellar:spoiler-ack';

function spoilerReconocido() {
  try {
    return localStorage.getItem(SPOILER_KEY) === '1';
  } catch (_) {
    return false;
  }
}

function guardarSpoilerReconocido() {
  try {
    localStorage.setItem(SPOILER_KEY, '1');
  } catch (_) {
    /* modo privado / storage bloqueado: se vuelve a mostrar la proxima vez */
  }
}

function initSpoilerAviso(header) {
  if (!header || typeof header.insertAdjacentHTML !== 'function' || !document.body) {
    return;
  }
  if (spoilerReconocido()) {
    return;
  }

  document.body.classList.add('spoiler-alerta');
  header.insertAdjacentHTML(
    'afterbegin',
    '<span class="spoiler-rotulo" aria-hidden="true"><span class="led led-alerta"></span>Spoilers</span>',
  );
  // DENTRO del <header>: el panel cuelga del tablero (absolute) y flota sin empujar el contenido.
  header.insertAdjacentHTML(
    'beforeend',
    '<div class="spoiler-aviso" role="alert">' +
      '<span><b>⚠ Spoilers:</b> este sitio comenta la trama completa, incluido el final.</span>' +
      '<button type="button" data-spoiler-ok>Ya la vi</button>' +
      '</div>',
  );

  const rotulo = header.querySelector('.spoiler-rotulo');
  const aviso = header.querySelector('.spoiler-aviso');
  const boton = aviso && aviso.querySelector('[data-spoiler-ok]');
  if (boton) {
    boton.addEventListener('click', () => {
      guardarSpoilerReconocido();
      // Las luces vuelven a normal al instante y el panel se retrae antes de quitarse;
      // el timeout respalda a animationend (no dispara con prefers-reduced-motion).
      document.body.classList.remove('spoiler-alerta');
      const cerrar = () => {
        if (rotulo) rotulo.remove();
        if (aviso) aviso.remove();
      };
      const sinMovimiento =
        typeof matchMedia === 'function' &&
        matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (sinMovimiento) {
        cerrar(); // sin animacion de retraccion -> se quita al toque
        return;
      }
      aviso.classList.add('spoiler-aviso--retrae');
      aviso.addEventListener('animationend', cerrar, { once: true });
      setTimeout(cerrar, 1800); // respaldo: > que la animacion de 1.5s
    });
  }
}

// Boton "volver arriba": aparece tras scrollear 60% de viewport y se oculta con el pie a la vista.
// Un booleano combinado decide la clase; el scroll va con rAF-throttle.
function initBotonSubir(boton) {
  if (!boton || typeof window === 'undefined' || typeof window.scrollTo !== 'function') {
    return;
  }
  const UMBRAL = () => window.innerHeight * 0.6;
  let pasoUmbral = window.scrollY > UMBRAL();
  let pieVisible = false;
  let tickPendiente = false;

  const actualizar = () => {
    tickPendiente = false;
    boton.classList.toggle('boton-subir--visible', pasoUmbral && !pieVisible);
  };

  const solicitarTick = () => {
    if (tickPendiente) return;
    tickPendiente = true;
    requestAnimationFrame(actualizar);
  };

  window.addEventListener(
    'scroll',
    () => {
      pasoUmbral = window.scrollY > UMBRAL();
      solicitarTick();
    },
    { passive: true },
  );

  const pie = document.querySelector('footer');
  if (pie && typeof IntersectionObserver === 'function') {
    const observador = new IntersectionObserver(
      (entradas) => {
        pieVisible = entradas.some((entrada) => entrada.isIntersecting);
        solicitarTick();
      },
      { rootMargin: '0px' },
    );
    observador.observe(pie);
  }

  // Despegue (css/layout.css): animationend lo termina; el setTimeout es red de contencion.
  const disparaDespegue = () => {
    boton.classList.remove('boton-subir--despega');
    void boton.offsetWidth; // fuerza reflow: reinicia la animacion si se clickea de nuevo rapido
    boton.classList.add('boton-subir--despega');
  };
  boton.addEventListener('animationend', (evento) => {
    if (evento.animationName === 'cohete-despegar-icono') {
      boton.classList.remove('boton-subir--despega');
    }
  });

  boton.addEventListener('click', () => {
    const sinMovimiento =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: sinMovimiento ? 'auto' : 'smooth' });
    disparaDespegue();
    setTimeout(() => boton.classList.remove('boton-subir--despega'), 900); // respaldo: > que la animacion de 0.6s
    // Foco al enlace de marca: teclado/lector de pantalla no quedan perdidos en el <body>.
    document.querySelector('header .cockpit-brand')?.focus();
  });

  actualizar(); // estado inicial, por si la pagina se carga ya scrolleada (anchor #hash)
}

// El menu duplicado del pie solo aporta si hay que scrollear para llegar a el: se mide en runtime
// (resize y load). Se oculta el marco COMPLETO, no solo el <nav> (ver docs/20-notas-de-codigo/layout-y-router.md#pie).
export function actualizarPieSeccionesCondicional() {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return;
  }
  const grupos = document.querySelectorAll('footer .pie-secciones-marco');
  if (grupos.length === 0) {
    return;
  }
  const esHome = document.body && document.body.classList.contains('home');
  const hayScroll = !esHome && (document.documentElement.scrollHeight > window.innerHeight + 1);
  grupos.forEach((marco) => {
    marco.hidden = !hayScroll;
  });
}

export function initPieSeccionesCondicional() {
  if (typeof window === 'undefined') {
    return;
  }
  actualizarPieSeccionesCondicional();
  window.addEventListener('resize', actualizarPieSeccionesCondicional);
  window.addEventListener('load', actualizarPieSeccionesCondicional);
}

// Musica de fondo con interruptor en el header (desktop y mobile). Preferencia y segundo actual en
// sessionStorage; nunca suena en las rutas de rutaSinMusica (trailer, simulador). En mobile se pausa al ocultarse la pagina y en iOS se
// atenua con un GainNode (ver docs/20-notas-de-codigo/layout-y-router.md#musica-de-fondo).
// Intenta fijar el volumen nativo. Devuelve false si el navegador lo ignora
// (iOS Safari: `volume` es de solo lectura) y hay que atenuar por Web Audio.
export function aplicarVolumenNativo(audio, vol) {
  audio.volume = vol;
  return Math.abs(audio.volume - vol) < 0.01;
}

// Decide que hacer con la musica cuando cambia la visibilidad de la pagina.
// Pura (sin DOM) para poder testearla: 'pausar' | 'reanudar' | null.
export function accionPorVisibilidad({
  oculto,
  sonando,
  pausadoPorOculto,
  preferida,
  silenciadoPorTrailer,
}) {
  if (oculto) {
    return sonando ? 'pausar' : null;
  }
  return pausadoPorOculto && preferida && !silenciadoPorTrailer ? 'reanudar' : null;
}

// Paginas donde la musica de fondo no suena: su propio audio manda (research R5 de la 009).
const RUTAS_SIN_MUSICA = new Set(['trailer.html', 'minijuego-acople.html']);

export function rutaSinMusica(archivo) {
  return RUTAS_SIN_MUSICA.has(archivo);
}

let audioGlobal = null;
let ctxAudio = null; // AudioContext, solo en iOS (atenuacion por GainNode)
let pausadoPorOculto = false;
let botonMusicaGlobal = null;
let muteadoPorRuta = false;
let reanudarMusica = null; // lo define initMusicaFondo: crea el audio si hace falta y lo reproduce

export function sincronizarAudioRuta(archivo) {
  const CLAVE = 'interstellar:musica';
  const lee = (k) => {
    try {
      return sessionStorage.getItem(k);
    } catch (e) {
      return null;
    }
  };
  const preferida = lee(CLAVE) === 'on';

  if (rutaSinMusica(archivo)) {
    if (audioGlobal && !audioGlobal.paused) {
      audioGlobal.pause();
    }
    if (preferida) {
      muteadoPorRuta = true;
    }
  } else {
    const debeReanudar = muteadoPorRuta && preferida;
    muteadoPorRuta = false;
    if (debeReanudar && reanudarMusica) {
      reanudarMusica();
    }
  }
}

// Musica de fondo con interruptor en el header.
function initMusicaFondo() {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return;
  }
  const boton = document.querySelector('.musica-toggle');
  if (!boton) {
    return;
  }
  botonMusicaGlobal = boton;
  const CLAVE = 'interstellar:musica'; // 'on' | 'off'
  const CLAVE_T = 'interstellar:musica-t'; // segundo actual
  const SRC = 'assets/audio/stay-ambient.m4a';
  const VOL = 0.32;
  // Se evalua en cada uso: con swup la ruta cambia sin recargar este modulo.
  const enRutaSinMusica = () => rutaSinMusica((window.location.pathname.split('/').pop() || 'index.html').toLowerCase());

  const lee = (k) => {
    try {
      return sessionStorage.getItem(k);
    } catch (e) {
      return null;
    }
  };
  const guarda = (k, v) => {
    try {
      sessionStorage.setItem(k, v);
    } catch (e) {
      /* sessionStorage no disponible (modo privado): la musica no reanuda, pero no rompe */
    }
  };

  // iOS: volume de solo lectura -> el audio pasa por un GainNode fijo en VOL.
  const atenuarConGain = (a) => {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) {
      return;
    }
    try {
      ctxAudio = new Ctx();
      const gain = ctxAudio.createGain();
      gain.gain.value = VOL;
      ctxAudio.createMediaElementSource(a).connect(gain).connect(ctxAudio.destination);
    } catch (e) {
      ctxAudio = null;
    }
  };

  const reproducir = (a) => {
    if (ctxAudio && ctxAudio.state === 'suspended') {
      ctxAudio.resume().catch(() => {});
    }
    return a.play();
  };

  const debeSonar = () =>
    boton.getAttribute('aria-pressed') === 'true' && !enRutaSinMusica() && !muteadoPorRuta;

  // Reintenta en el primer gesto (autoplay bloqueado o Web Audio suspendido); debeSonar evita revivir musica apagada.
  const esperarGesto = (a) => {
    const reintento = () => {
      if (debeSonar()) {
        reproducir(a).catch(() => {});
      }
    };
    window.addEventListener('pointerdown', reintento, { once: true });
    window.addEventListener('keydown', reintento, { once: true });
  };

  const crearAudio = () => {
    if (audioGlobal) {
      return audioGlobal;
    }
    audioGlobal = new Audio(SRC);
    audioGlobal.loop = true;
    audioGlobal.preload = 'none';
    if (!aplicarVolumenNativo(audioGlobal, VOL)) {
      atenuarConGain(audioGlobal);
    }
    // En el DOM (no detached): mas robusto ante el GC.
    document.body.appendChild(audioGlobal);
    const t = parseFloat(lee(CLAVE_T) || '0');
    if (t > 0) {
      audioGlobal.addEventListener(
        'loadedmetadata',
        () => {
          try {
            if (t < audioGlobal.duration) {
              audioGlobal.currentTime = t;
            }
          } catch (e) {
            /* algunos navegadores rechazan currentTime antes de bufferear: se ignora */
          }
        },
        { once: true },
      );
    }
    audioGlobal.addEventListener('timeupdate', () => {
      guarda(CLAVE_T, String(Math.floor(audioGlobal.currentTime)));
    });
    return audioGlobal;
  };

  const reflejar = (on) => {
    boton.setAttribute('aria-pressed', on ? 'true' : 'false');
    boton.setAttribute('aria-label', on ? 'Música de fondo: silenciar' : 'Música de fondo: activar');
    boton.classList.toggle('musica-toggle--on', on);
  };

  const encender = () => {
    guarda(CLAVE, 'on');
    reflejar(true);
    if (enRutaSinMusica()) {
      muteadoPorRuta = true; // aca su propio audio manda; reanuda al salir de la ruta
      return;
    }
    const a = crearAudio();
    pausadoPorOculto = false;
    reproducir(a)
      .then(() => {
        if (ctxAudio && ctxAudio.state !== 'running') {
          esperarGesto(a);
        }
      })
      .catch(() => esperarGesto(a));
  };

  reanudarMusica = () => {
    const a = crearAudio();
    pausadoPorOculto = false;
    reproducir(a).catch(() => esperarGesto(a));
  };

  const apagar = () => {
    guarda(CLAVE, 'off');
    pausadoPorOculto = false;
    reflejar(false);
    if (audioGlobal) {
      try {
        guarda(CLAVE_T, String(Math.floor(audioGlobal.currentTime)));
        audioGlobal.pause();
      } catch (e) {
        /* noop */
      }
    }
  };

  boton.addEventListener('click', () => {
    if (boton.getAttribute('aria-pressed') === 'true') {
      apagar();
    } else {
      encender();
    }
  });

  // Antes de navegar: fijar el punto para reanudar en la proxima pagina.
  window.addEventListener('pagehide', () => {
    if (audioGlobal) {
      guarda(CLAVE_T, String(Math.floor(audioGlobal.currentTime)));
    }
  });

  // Mobile (tactil): pausar al ocultarse la pagina y reanudar al volver; en desktop sigue sonando.
  if (typeof window.matchMedia === 'function' && window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
    document.addEventListener('visibilitychange', () => {
      const accion = accionPorVisibilidad({
        oculto: document.hidden,
        sonando: !!audioGlobal && !audioGlobal.paused,
        pausadoPorOculto,
        preferida: lee(CLAVE) === 'on',
        silenciadoPorTrailer: muteadoPorRuta || enRutaSinMusica(),
      });
      if (accion === 'pausar') {
        guarda(CLAVE_T, String(Math.floor(audioGlobal.currentTime)));
        audioGlobal.pause();
        pausadoPorOculto = true;
      } else if (accion === 'reanudar') {
        pausadoPorOculto = false;
        reproducir(audioGlobal).catch(() => esperarGesto(audioGlobal));
      } else if (!document.hidden) {
        pausadoPorOculto = false;
      }
    });
  }

  // Estado inicial segun la preferencia guardada.
  if (lee(CLAVE) === 'on') {
    if (enRutaSinMusica()) {
      reflejar(true); // preferencia ON, pero muteada en esta ruta; reanuda al salir
      muteadoPorRuta = true;
    } else {
      encender();
    }
  } else {
    reflejar(false);
  }
}

// Indicador de seccion actual: marca con aria-current="page" el enlace de nivel superior de la pagina en curso.
export function markCurrentPage(nav) {
  if (!nav || typeof nav.querySelectorAll !== 'function') {
    return;
  }
  let archivo = (window.location.pathname.split('/').pop() || '').toLowerCase();
  if (archivo === '') {
    archivo = 'index.html'; // la raiz del sitio sirve index.html
  }
  nav.querySelectorAll(':scope > ul > li > a').forEach((enlace) => {
    const destino = (enlace.getAttribute('href') || '').split('#')[0].toLowerCase();
    if (destino === archivo) {
      enlace.setAttribute('aria-current', 'page');
    } else {
      enlace.removeAttribute('aria-current');
    }
  });
}

export function init(navConfig = NavConfig) {
  if (typeof document === 'undefined' || !document.body) {
    return;
  }
  const yaInyectado = typeof document.body.querySelector === 'function' && document.body.querySelector('header');
  if (!yaInyectado) {
    document.body.insertAdjacentHTML('afterbegin', buildHeader(navConfig));
    document.body.insertAdjacentHTML('beforeend', buildFooter(navConfig));
    document.body.insertAdjacentHTML('beforeend', buildBotonSubir());

    // Cielo: solo en paginas `con-cielo`.
    if (
      document.body.classList &&
      typeof document.body.classList.contains === 'function' &&
      document.body.classList.contains('con-cielo')
    ) {
      document.body.insertAdjacentHTML('afterbegin', buildCielo());
    }
  }

  // Conecta el disclosure solo si el DOM expone la API real (layout.test.js usa un fake body).
  if (typeof document.body.querySelector !== 'function') {
    return;
  }
  const header = document.body.querySelector('header');
  const nav = header && header.querySelector('nav');
  const estado = createSubmenuState();
  markCurrentPage(nav);
  document.body
    .querySelectorAll('footer nav.pie-secciones')
    .forEach((navSecciones) => markCurrentPage(navSecciones));
  wireDisclosure(nav, estado);
  wireDrawer(header, nav, estado);
  wireFooterShare(document.body.querySelector('footer'));
  initSpoilerAviso(header);
  initHeroVideo();
  initBotonSubir(document.body.querySelector('.boton-subir'));
  initPieSeccionesCondicional();
  initMusicaFondo();

  // Iniciar enrutador Swup en el navegador si estamos en runtime real
  if (typeof window !== 'undefined' && !window.__SWUP_INITIALIZED__) {
    window.__SWUP_INITIALIZED__ = true;
    import('./swup-router.js')
      .then(({ initSwupRouter }) => initSwupRouter())
      .catch((e) => console.warn('[layout] no se pudo iniciar swup router:', e));
  }
}

if (typeof document !== 'undefined') {
  if (typeof document.body !== 'undefined') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', () => init());
  }
}