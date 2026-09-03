// Inyección del layout compartido (FR-001): header con nav y footer únicos por página.
// El árbol de navegación proviene exclusivamente de nav-data.js (única fuente de verdad).
// Las funciones puras (buildHeader/buildFooter/renderLayout) son importables sin browser
// para el test TDD (Principio V); init() hace la inyección real en el DOM del navegador.

import { NavConfig } from './nav-data.js';
import { createSubmenuState } from './submenu-state.js';

const CREDITS = 'Interstellar — sitio académico de fan, sin fines de lucro.';
const REPO_URL = 'https://github.com/Sergiotsk/Interstellar.git';
// La atribución por asset ya NO vive en el pie: se movió a creditos.html
// (módulo js/creditos.js). El pie solo enlaza esa página + el repo.

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
  // Boton CASE: menu-hamburguesa "girado" a 4 barras VERTICALES (guiño al robot
  // de la pelicula). Abre/cierra el drawer de navegacion en TODOS los viewports
  // (ya no hay barra horizontal de escritorio). Las 4 <span> internas son
  // DECORATIVAS (el <span.case-icon> lleva aria-hidden): el nombre accesible del
  // control lo da el aria-label; el icono se dibuja por completo con CSS.
  // Vive FUERA del <nav>
  // (primer hijo del <header>, antes del <nav>) para que collectDisclosures(nav)
  // —que consulta `button[aria-controls]` dentro del nav— nunca lo confunda con
  // un disclosure de submenu. El nav lleva id="nav-principal" (target del
  // aria-controls y hook del CSS para mostrar/ocultar el drawer en mobile).
  return `<header>
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
  // Estética "consola inferior" del cockpit (constitución v2.1.0): cada dato se
  // presenta como una lectura de telemetría — una etiqueta técnica corta
  // (`<span class="tele-k">`, decorativa: aria-hidden) + el valor real + un LED
  // de estado (`<span class="led">`, decorativo). El texto y los enlaces siguen
  // siendo el contenido accesible; las etiquetas y LEDs son sólo el marco visual.
  return `<footer>
  <p class="tele"><span class="tele-k" aria-hidden="true">CREW</span> ${escapeHtml(CREDITS)} <span class="led" aria-hidden="true"></span></p>
  <ul>
    <li class="tele"><span class="tele-k" aria-hidden="true">REF</span> <a href="creditos.html">Créditos y fuentes</a> <span class="led" aria-hidden="true"></span></li>
    <li class="tele"><span class="tele-k" aria-hidden="true">REPO</span> <a href="${escapeHtml(REPO_URL)}">Repositorio del proyecto</a> <span class="led led-alerta" aria-hidden="true"></span></li>
  </ul>
</footer>`;
}

export function renderLayout(navConfig = NavConfig) {
  return {
    header: buildHeader(navConfig),
    footer: buildFooter(),
  };
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

  // Cierre sin restaurar foco: para abandonos "suaves" (puro mouse), donde el
  // foco de teclado no debe ser robado a un boton del header (BUGFIX defecto #2).
  const dismissSinFoco = () => {
    estado.dismiss();
    syncDisclosures(estado, disclosures);
  };

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

  // Abandonar la navegacion con el raton: al salir del area del nav, cerrar la
  // vista pero SIN restaurar foco (el raton nunca debe robar el foco de teclado).
  nav.addEventListener('mouseleave', dismissSinFoco);

  // HOVER OPEN (desktop): el submenu debe abrirse al pasar el cursor sobre el eje
  // (patron clasico de escritorio), restableciendo su descubribilidad (BUGFIX
  // SC-010). Se limita a dispositivos con hover fino para no afectar al toque.
  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches
  ) {
    disclosures.forEach(({ button, axisId }) => {
      const li = button.closest('li');
      if (li) {
        li.addEventListener('mouseenter', () => {
          estado.open(axisId);
          syncDisclosures(estado, disclosures);
        });
      }
    });
  }
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
  initHeroVideo();
}

if (typeof document !== 'undefined') {
  if (typeof document.body !== 'undefined') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', () => init());
  }
}