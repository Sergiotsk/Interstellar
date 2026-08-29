// Inyección del layout compartido (FR-001): header con nav y footer únicos por página.
// El árbol de navegación proviene exclusivamente de nav-data.js (única fuente de verdad).
// Las funciones puras (buildHeader/buildFooter/renderLayout) son importables sin browser
// para el test TDD (Principio V); init() hace la inyección real en el DOM del navegador.

import { NavConfig } from './nav-data.js';
import { createSubmenuState } from './submenu-state.js';

const CREDITS = 'Interstellar — sitio académico de fan, sin fines de lucro.';
const IMAGE_SOURCES_NOTE =
  'Fuentes del material visual: catálogo aprobado (Wikimedia Commons, NASA Image Library, ESA/Hubble). Créditos por asset:';
// Atribución por asset según assets/img/CREDITOS.md (FR-013, SC-008). Solo se
// listan los assets descargados del catálogo; los pendientes se sumarán al
// incorporarse (Gargantúa del paper arXiv y still de la película).
const ASSET_CREDITS = [
  'hero-backdrop.jpg — Event Horizon Telescope Collaboration, CC BY 4.0 (Wikimedia Commons)',
  'ciencia-agujero-negro.jpg — NASA/JPL-Caltech (NASA Image Library)',
  'mundos-tierra.jpg — NASA (Blue Marble 2012)',
  'personajes-astronauta.jpg — NASA (astronauta Scott Tingle)',
  'viaje-pilares-de-creacion.jpg — NASA, ESA/Hubble',
];
const REPO_URL = 'https://github.com/Sergiotsk/Interstellar.git';

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
  // T030: boton ☰ de apertura/cierre del drawer mobile. Vive FUERA del <nav>
  // (primer hijo del <header>, antes del <nav>) para que collectDisclosures(nav)
  // —que consulta `button[aria-controls]` dentro del nav— nunca lo confunda con
  // un disclosure de submenu. El nav lleva id="nav-principal" (target del
  // aria-controls y hook del CSS para mostrar/ocultar el drawer en mobile).
  return `<header>
  <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="nav-principal" aria-label="Abrir menú de navegación">☰</button>
  <nav id="nav-principal" aria-label="Navegación principal">
    <ul>
${items}
    </ul>
  </nav>
</header>`;
}

export function buildFooter() {
  const assetList = ASSET_CREDITS.map(
    (credit) => `    <li>${escapeHtml(credit)}</li>`,
  ).join('\n');
  return `<footer>
  <p>${escapeHtml(CREDITS)}</p>
  <p>${escapeHtml(IMAGE_SOURCES_NOTE)}</p>
  <ul>
${assetList}
  </ul>
  <a href="${escapeHtml(REPO_URL)}">Repositorio del proyecto</a>
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
   Drawer mobile (T030) — contracts/navigation.md + FR-022, SC-003, SC-005.
   El nav queda oculto por defecto en mobile (CSS) y se muestra como panel
   desplagable al pulsar el boton ☰. Mecanismo elegido: JS alterna (a) el
   `aria-expanded` del boton ☰ y (b) la clase `nav-abierto` sobre el
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

  // Escape (nivel documento): cierra el drawer y restaura el foco al ☰.
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
  wireDisclosure(nav, estado);
  wireDrawer(header, nav, estado);
}

if (typeof document !== 'undefined') {
  if (typeof document.body !== 'undefined') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', () => init());
  }
}