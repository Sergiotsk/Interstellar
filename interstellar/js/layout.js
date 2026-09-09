// Inyección del layout compartido (FR-001): header con nav y footer únicos por página.
// El árbol de navegación proviene exclusivamente de nav-data.js (única fuente de verdad).
// Las funciones puras (buildHeader/buildFooter/renderLayout) son importables sin browser
// para el test TDD (Principio V); init() hace la inyección real en el DOM del navegador.

import { NavConfig } from './nav-data.js';
import { createSubmenuState } from './submenu-state.js';

const REPO_URL = 'https://github.com/Sergiotsk/Interstellar.git';
const SITE_URL = 'https://sergiotsk.github.io/Interstellar/';
// El pie es una consola de TECLAS cortas: enlaza creditos.html, el repo, la
// página de contacto y suma teclas para compartir el sitio (WhatsApp/Facebook
// como enlaces de "share"; "Compartir" usa la Web Share API, solo si existe).
// El disclaimer completo ("sitio académico de fan, sin fines de lucro") vive en
// creditos.html; la atribución por asset también (módulo js/creditos.js).

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
  // Marca del header: enlace al inicio con aspecto de placa de instrumento en la
  // banda. Antes era `header::after` (pseudo, no enlazable); es un <a> real para
  // que sea navegable y accesible (aria-label da el destino). Dos lineas:
  //   1. `.cockpit-marca` -> "Interstellar" (la marca).
  //   2. `.cockpit-brand-linea` -> los dos LED (SYS/PWR) + "NAV · RANGER".
  // Visible <60rem (en escritorio la fila de nav ocupa el centro; la placa
  // vuelve a la izquierda a partir de ~68rem, salvo con el aviso de spoiler
  // activo). El sufijo " · RANGER" se oculta en pantallas muy angostas.
  //
  // Boton CASE: menu-hamburguesa "girado" a 4 barras VERTICALES (guiño al robot
  // de la pelicula). Abre/cierra el drawer de navegacion por debajo de 60rem.
  // Las 4 <span> internas son DECORATIVAS (el <span.case-icon> lleva
  // aria-hidden): el nombre accesible del control lo da el aria-label; el icono
  // se dibuja por completo con CSS. Vive FUERA del <nav> (antes del <nav>) para
  // que collectDisclosures(nav) —que consulta `button[aria-controls]` dentro del
  // nav— nunca lo confunda con un disclosure de submenu. El nav lleva
  // id="nav-principal" (target del aria-controls y hook del CSS del drawer).
  return `<header>
  <a class="cockpit-brand" href="index.html" aria-label="Interstellar — ir al inicio"><span class="cockpit-marca">Interstellar</span><span class="cockpit-brand-linea"><span>NAV</span><span class="cockpit-brand-ext"> · RANGER</span></span></a>
  <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="nav-principal" aria-label="Abrir menú de navegación"><span class="case-icon" aria-hidden="true"><span></span><span></span><span></span><span></span></span></button>
  <nav id="nav-principal" aria-label="Navegación principal">
    <ul>
${items}
    </ul>
  </nav>
</header>`;
}

export function buildFooter() {
  // Pie mínimo: disclaimer + enlaces (créditos y repo). La lista de atribución
  // por asset vive en creditos.html (FR-012, FR-013; contrato assets.md).
  //
  // Consola inferior del cockpit (constitución v2.1.0): cada entrada es una
  // "tecla" de panel — misma caja con recorte diagonal, bezel y LED que las de
  // la nav. Cada tecla es UNA palabra (`.tele-v`) + un LED (`.led`, decorativo),
  // sin etiqueta previa. El LED va a la izquierda (como en la nav). Todas son
  // `.tele-accion`: tecla-BOTÓN — un <a> (o <button>) ocupa toda la caja y es el
  // destino (`aria-label` da el destino sin sumar texto visible). El disclaimer
  // completo vive en creditos.html.
  // WhatsApp y Facebook: sin JS comparten la home; wireFooterShare() los sube a
  // la página actual. La tecla "Compartir" (Web Share API) nace oculta y solo la
  // muestra el JS si navigator.share existe.
  const waFallback = `https://wa.me/?text=${encodeURIComponent(`Interstellar — ${SITE_URL}`)}`;
  const fbFallback = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`;
  return `<footer>
  <ul>
    <li class="tele tele-accion"><a href="contacto.html" aria-label="Formulario de contacto"><span class="led" aria-hidden="true"></span><span class="tele-v">Contacto</span></a></li>
    <li class="tele tele-accion"><a href="${escapeHtml(waFallback)}" data-share="whatsapp" target="_blank" rel="noopener" aria-label="Compartir el sitio en WhatsApp"><span class="led" aria-hidden="true"></span><span class="tele-v">WhatsApp</span></a></li>
    <li class="tele tele-accion"><a href="${escapeHtml(fbFallback)}" data-share="facebook" target="_blank" rel="noopener" aria-label="Compartir el sitio en Facebook"><span class="led" aria-hidden="true"></span><span class="tele-v">Facebook</span></a></li>
    <li class="tele tele-accion" data-share-nativo hidden><button type="button" data-share="nativo" aria-label="Compartir el sitio"><span class="led led-ambar" aria-hidden="true"></span><span class="tele-v">Compartir</span></button></li>
    <li class="tele tele-accion"><a href="creditos.html" aria-label="Créditos y fuentes"><span class="led" aria-hidden="true"></span><span class="tele-v">Créditos</span></a></li>
    <li class="tele tele-accion"><a href="${escapeHtml(REPO_URL)}" aria-label="Repositorio en GitHub"><span class="led led-alerta" aria-hidden="true"></span><span class="tele-v">GitHub</span></a></li>
  </ul>
</footer>`;
}

export function renderLayout(navConfig = NavConfig) {
  return {
    header: buildHeader(navConfig),
    footer: buildFooter(),
  };
}

// Cielo compartido (css/layout.css §15): campo estelar + 3 estrellas fugaces
// (los <i>). Es puramente decorativo (`aria-hidden`); todo el movimiento vive en
// CSS. Se inyecta como PRIMER hijo del <body> —detras de header/main/footer— y
// SOLO en las paginas marcadas con `class="... con-cielo"` (opt-in).
export function buildCielo() {
  return '<div class="cielo" aria-hidden="true"><i></i><i></i><i></i></div>';
}

/* -----------------------------------------------------------------------------
   Disclosure de submenus (T011) — contracts/navigation.md + data-model.md §6.
   La logica de la maquina de estados vive en submenu-state.js (puro); aca solo
   se conectan los eventos del DOM con esa maquina y se sincroniza el `hidden` /
   `aria-expanded` de cada submenu. La funcion devuelve la maquina para permitir
   pruebas, y es inofensiva sobre un DOM de prueba que no expone querySelector.
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

  // Abrir/alternar: un solo listener de `click` cubre clic, toque, Enter y Space,
  // porque un <button> nativo dispara `click` en todos esos casos (contracts).
  disclosures.forEach(({ button, axisId }) => {
    button.addEventListener('click', () => {
      estado.toggle(axisId);
      syncDisclosures(estado, disclosures);
    });
  });

  // Elegir un destino anidado: navega y cierra el submenu (HU1-E4). Se deja
  // actuar al enlace por defecto (la navegacion real).
  nav.querySelectorAll('ul ul a').forEach((link) => {
    link.addEventListener('click', () => {
      estado.navigate();
      syncDisclosures(estado, disclosures);
    });
  });

  // Cierre restaurando foco: para cierres por teclado/clic (Escape, focusout,
  // clic fuera), que devuelven el foco al control que estaba abierto (FR-010).
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

  // Abandonar la navegacion con el teclado: si el foco sale del area del nav,
  // cierra y restaura el foco.
  nav.addEventListener('focusout', (event) => {
    const nextTarget = event.relatedTarget;
    if (nextTarget && !nav.contains(nextTarget)) {
      dismissConFoco();
    }
  });

  // El submenu se abre y se cierra SOLO por intencion explicita: clic/tecla en el
  // boton ▼ (toggle, arriba), Escape, seleccion de un destino anidado o clic
  // fuera de la navegacion. Sin hover-open: cruzar la barra con el raton ya no
  // despliega nada (evita disparos accidentales y que el menu "persiga" al
  // cursor). Sin cierre por `mouseleave`: una vez abierto queda abierto hasta un
  // gesto de cierre, aunque el raton se aleje del area del nav.
}

/* -----------------------------------------------------------------------------
   Drawer de navegacion — contracts/navigation.md + FR-022, SC-003, SC-005.
   El nav queda oculto por defecto en TODOS los viewports (CSS) y se muestra
   como panel flotante al pulsar el boton CASE. Mecanismo elegido: JS alterna
   (a) el `aria-expanded` del boton CASE y (b) la clase `nav-abierto` sobre el
   `<nav id="nav-principal">`; el CSS usa esa clase para mostrar el panel.
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

  // Seleccionar CUALQUIER destino del drawer cierra el drawer; la navegacion
  // nativa continua. Solo si el drawer esta abierto.
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

// Hero de la home: el <video> de fondo lleva `autoplay muted` en el HTML, pero
// si hay `prefers-reduced-motion: reduce` lo PAUSAMOS y lo rebobinamos -> queda
// el poster fijo (hero-gargantua.jpg). Si la preferencia cambia en caliente,
// reacciona. Inofensivo si la pagina no tiene ese <video>.
function initHeroVideo() {
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

// Compartir desde el pie. WhatsApp y Facebook son enlaces a sus URLs de "share":
// sin JS comparten la home; aca se actualizan a la pagina actual (`location.href`).
// El boton "Compartir" usa la Web Share API (`navigator.share`) y SOLO se muestra
// si el navegador la soporta —tipico en movil—: abre la bandeja nativa del
// sistema, el unico camino real para compartir a Instagram desde una web (no
// existe una URL de "share" de Instagram). Inofensivo si el pie no esta.
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

// Aviso de spoiler (css/layout.css §17). El sitio comenta la trama completa
// —final incluido— en casi todas las paginas. En la primera visita se pone
// `body.spoiler-alerta` (los LED del header pasan a rojo y parpadean), se inyecta
// un rotulo "SPOILERS" en la banda y una tira de aviso debajo del header con un
// boton "Ya la vi". Al confirmar se guarda en localStorage y todo vuelve a teal.
// `localStorage` puede tirar (modo privado): las lecturas/escrituras van en
// try/catch y si falla, el aviso simplemente aparece cada vez.
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
  header.insertAdjacentHTML(
    'afterend',
    '<div class="spoiler-aviso" role="alert">' +
      '<span><b>⚠ Spoilers:</b> este sitio comenta la trama completa, incluido el final.</span>' +
      '<button type="button" data-spoiler-ok>Ya la vi</button>' +
      '</div>',
  );

  const rotulo = header.querySelector('.spoiler-rotulo');
  const aviso = document.body.querySelector('.spoiler-aviso');
  const boton = aviso && aviso.querySelector('[data-spoiler-ok]');
  if (boton) {
    boton.addEventListener('click', () => {
      guardarSpoilerReconocido();
      document.body.classList.remove('spoiler-alerta');
      if (rotulo) {
        rotulo.remove();
      }
      if (aviso) {
        aviso.remove();
      }
    });
  }
}

// Indicador de seccion actual (FR: descubribilidad de la nav). Marca con
// `aria-current="page"` el enlace de NIVEL SUPERIOR cuyo destino es la pagina en
// curso; el CSS lo resalta (LED fijo + acento) tanto en la barra de escritorio
// como en el drawer. Solo enlaces directos del <ul> raiz: los destinos anidados
// apuntan a `pagina.html#ancla` y no deben marcarse como "pagina actual".
function markCurrentPage(nav) {
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
    }
  });
}

export function init(navConfig = NavConfig) {
  if (typeof document === 'undefined' || !document.body) {
    return;
  }
  document.body.insertAdjacentHTML('afterbegin', buildHeader(navConfig));
  document.body.insertAdjacentHTML('beforeend', buildFooter());

  // Cielo: solo en paginas `con-cielo`. `afterbegin` lo deja como primer hijo
  // del body (por detras del header, que ya se inyecto). `classList` puede no
  // existir en el DOM de prueba: se consulta con guarda.
  if (
    document.body.classList &&
    typeof document.body.classList.contains === 'function' &&
    document.body.classList.contains('con-cielo')
  ) {
    document.body.insertAdjacentHTML('afterbegin', buildCielo());
  }

  // Conecta la interaccion del disclosure. Solo se ejecuta si el DOM de prueba
  // (layout.test.js usa un fake body sin querySelector) expone la API real;
  // en el navegador siempre esta disponible.
  if (typeof document.body.querySelector !== 'function') {
    return;
  }
  const header = document.body.querySelector('header');
  const nav = header && header.querySelector('nav');
  const estado = createSubmenuState();
  markCurrentPage(nav);
  wireDisclosure(nav, estado);
  wireDrawer(header, nav, estado);
  wireFooterShare(document.body.querySelector('footer'));
  initSpoilerAviso(header);
  initHeroVideo();
}

if (typeof document !== 'undefined') {
  if (typeof document.body !== 'undefined') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', () => init());
  }
}