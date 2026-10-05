// Filtro por eje + visor (lightbox) de la galeria (galeria.html).
// Piezas puras sin DOM (tests/galeria.test.js) + init() que conecta con el DOM.
// Degradado: sin JS cada <a> enlaza directo a la imagen y se ven las 4 secciones.

export const EJE_TODAS = 'todas';

// Filtro: un unico eje activo ('todas' por defecto); clic en el activo vuelve a 'todas'.
export function createFiltroState() {
  let activo = EJE_TODAS;
  return {
    get activo() {
      return activo;
    },
    set(eje) {
      activo = activo === eje ? EJE_TODAS : eje;
    },
  };
}

// Indices de `items` ({ eje }) visibles bajo el filtro; EJE_TODAS devuelve todos.
export function visibleIndices(items, filtro) {
  if (filtro === EJE_TODAS) {
    return items.map((_, indice) => indice);
  }
  return items.reduce((acumulado, item, indice) => {
    if (item.eje === filtro) {
      acumulado.push(indice);
    }
    return acumulado;
  }, []);
}

// Avanza `pos` (posicion en la lista visible, no indice de `items`) `delta` pasos, con wraparound.
export function wrapIndex(pos, delta, length) {
  if (length <= 0) {
    return 0;
  }
  return ((pos + delta) % length + length) % length;
}

// ---------------------------------------------------------------------------
// DOM — no se ejecuta en los tests (node:test no define `document`).
// ---------------------------------------------------------------------------

// Solo las <li> dentro de una .galeria-grid (el drawer de navegacion tambien usa <li>).
function leerItems(grids) {
  return grids.flatMap((grid) => {
    const eje = grid.dataset.eje ?? EJE_TODAS;
    return [...grid.querySelectorAll(':scope > li')].map((li) => {
      const enlace = li.querySelector('a');
      const img = li.querySelector('img');
      const figcaption = li.querySelector('figcaption');
      return { li, eje, href: enlace?.getAttribute('href') ?? '', alt: img?.alt ?? '', caption: figcaption?.textContent ?? '' };
    });
  });
}

function wireFiltro(items, grids) {
  const barra = document.querySelector('.galeria-filtro');
  if (!barra) {
    return { filtro: createFiltroState(), items };
  }
  const teclas = [...barra.querySelectorAll('.galeria-filtro-tecla')];
  const contador = barra.querySelector('.galeria-filtro-contador');
  const filtro = createFiltroState();
  // section[id] de cada eje: se oculta entera si no le queda ninguna imagen visible.
  const secciones = grids.map((grid) => grid.closest('section[id]'));
  // Paginacion Anterior/Siguiente: solo con un filtro puntual activo (ver css/galeria.css).
  const paginaciones = [...document.querySelectorAll('.galeria-paginacion')];
  const botonesPaginacion = [...document.querySelectorAll('.galeria-anterior, .galeria-siguiente')];

  const aplicar = () => {
    const indicesVisibles = new Set(visibleIndices(items, filtro.activo));
    items.forEach((item, indice) => {
      item.li.hidden = !indicesVisibles.has(indice);
    });
    grids.forEach((grid, i) => {
      const tieneVisibles = [...grid.querySelectorAll(':scope > li')].some((li) => !li.hidden);
      if (secciones[i]) {
        secciones[i].hidden = !tieneVisibles;
      }
    });
    for (const nav of paginaciones) {
      nav.hidden = filtro.activo === EJE_TODAS;
    }
    for (const tecla of teclas) {
      const esActiva = tecla.dataset.filtro === filtro.activo
        || (filtro.activo === EJE_TODAS && tecla.dataset.filtro === EJE_TODAS);
      tecla.setAttribute('aria-pressed', String(esActiva));
    }
    if (contador) {
      const n = indicesVisibles.size;
      contador.textContent = `${n} ${n === 1 ? 'imagen' : 'imágenes'}`;
    }
  };

  for (const tecla of teclas) {
    tecla.addEventListener('click', () => {
      filtro.set(tecla.dataset.filtro);
      aplicar();
    });
  }

  // Apuntan siempre a un eje distinto del activo (set() no cae en el toggle a "todas");
  // tras conmutar se lleva la seccion nueva al tope.
  for (const boton of botonesPaginacion) {
    boton.addEventListener('click', () => {
      filtro.set(boton.dataset.filtro);
      aplicar();
      const i = grids.findIndex((grid) => grid.dataset.eje === filtro.activo);
      secciones[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  aplicar();
  return { filtro, items };
}

function wireVisor(items, filtro) {
  const dialogo = document.querySelector('.galeria-visor');
  if (!dialogo || typeof dialogo.showModal !== 'function') {
    return; // sin <dialog> nativo -> los <a> siguen navegando directo (degradado)
  }
  const img = dialogo.querySelector('.galeria-visor-img');
  const caption = dialogo.querySelector('.galeria-visor-caption');
  const btnCerrar = dialogo.querySelector('.galeria-visor-cerrar');
  const btnPrev = dialogo.querySelector('.galeria-visor-prev');
  const btnNext = dialogo.querySelector('.galeria-visor-next');

  let posicionActual = 0;
  let disparador = null;

  const mostrar = (posicion, indicesVisibles) => {
    posicionActual = posicion;
    const item = items[indicesVisibles[posicionActual]];
    img.src = item.href;
    img.alt = item.alt;
    caption.textContent = item.caption;
  };

  const abrir = (indiceItem) => {
    const indicesVisibles = visibleIndices(items, filtro.activo);
    const posicion = indicesVisibles.indexOf(indiceItem);
    if (posicion === -1) {
      return; // el item esta oculto por el filtro actual (no deberia pasar)
    }
    disparador = document.activeElement;
    mostrar(posicion, indicesVisibles);
    dialogo.showModal();
  };

  const mover = (delta) => {
    const indicesVisibles = visibleIndices(items, filtro.activo);
    mostrar(wrapIndex(posicionActual, delta, indicesVisibles.length), indicesVisibles);
  };

  items.forEach((item, indice) => {
    const enlace = item.li.querySelector('a');
    if (!enlace) return;
    enlace.addEventListener('click', (evento) => {
      // Ctrl/Cmd/click-medio/etc.: dejar que el navegador abra el archivo como siempre.
      if (evento.defaultPrevented || evento.button !== 0 || evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) {
        return;
      }
      evento.preventDefault();
      evento.stopPropagation();
      abrir(indice);
    });
  });

  btnCerrar?.addEventListener('click', () => dialogo.close());
  btnPrev?.addEventListener('click', () => mover(-1));
  btnNext?.addEventListener('click', () => mover(1));

  dialogo.addEventListener('click', (evento) => {
    if (evento.target === dialogo) {
      dialogo.close(); // clic en el "backdrop" (fuera del marco)
    }
  });

  dialogo.addEventListener('close', () => {
    disparador?.focus();
  });

  dialogo.addEventListener('keydown', (evento) => {
    if (evento.key === 'ArrowLeft') {
      mover(-1);
    } else if (evento.key === 'ArrowRight') {
      mover(1);
    }
    // Escape lo maneja el propio <dialog> (evento "cancel" nativo).
  });
}

function initGaleria() {
  const grids = [...document.querySelectorAll('.galeria-grid')];
  if (grids.length === 0) {
    return; // pagina sin galeria -> nada que hacer
  }
  const items = leerItems(grids);
  const { filtro } = wireFiltro(items, grids);
  wireVisor(items, filtro);
}

export function mount() {
  initGaleria();
}

export function unmount() {
  const dialogo = document.getElementById('galeria-visor');
  if (dialogo && typeof dialogo.close === 'function' && dialogo.open) {
    dialogo.close();
  }
}

if (typeof document !== 'undefined') {
  if (!window.__SWUP_ROUTER_ACTIVE__) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', mount);
    } else {
      mount();
    }
  }
}

export { initGaleria };
