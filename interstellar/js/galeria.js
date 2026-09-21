// Filtro por eje + visor (lightbox) de la galeria (galeria.html).
// Dos piezas PURAS sin DOM (testeadas en tests/galeria.test.js) + init() que
// conecta con el DOM real. Mismo criterio que js/submenu-state.js.
//
// Degradado: sin JS, cada <a> sigue enlazando directo al archivo de imagen (se
// nunca se le saca el href) y las 4 secciones se ven todas juntas, como antes
// de este cambio. El filtro y el visor solo MEJORAN — nunca son requisito
// para ver las imagenes.

export const EJE_TODAS = 'todas';

// Filtro: un unico eje activo ('todas' por defecto). Clic en el eje ya activo
// vuelve a 'todas' — mismo criterio de toggle que el submenu del header
// (submenu-state.js).
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

// Indices de `items` visibles bajo el filtro activo. `items` es un array de
// objetos con `{ eje }`. EJE_TODAS devuelve todos los indices, en orden.
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

// Avanza `pos` (posicion dentro de una lista de largo `length`, no un indice
// de `items`) `delta` pasos, con wraparound. `length <= 0` -> 0 (lista vacia,
// caso limite: no hay nada que recorrer).
export function wrapIndex(pos, delta, length) {
  if (length <= 0) {
    return 0;
  }
  return ((pos + delta) % length + length) % length;
}

// ---------------------------------------------------------------------------
// DOM — no se ejecuta en los tests (node:test no define `document`).
// ---------------------------------------------------------------------------

// Solo las <li> DENTRO de una .galeria-grid (nunca todo el document): el
// drawer de navegacion tambien usa <li> y no tiene nada que ver con esto.
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
  // Cada grid vive dentro de un section[id] (el eje): section.hidden cuando
  // el filtro activo la deja sin ninguna imagen visible. Sin esto, el titulo
  // + CTA de esa seccion quedarian flotando solos sobre una grilla vacia.
  const secciones = grids.map((grid) => grid.closest('section[id]'));
  // Paginacion Anterior/Siguiente al pie de cada eje: solo tiene sentido con
  // un filtro puntual activo (en "Todas" los 4 ejes ya estan uno debajo del
  // otro en el mismo scroll — ver css/galeria.css).
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

  // Anterior/Siguiente siempre apuntan a un eje DISTINTO del activo, asi que
  // filtro.set() nunca cae en la rama de toggle-a-"todas". Tras conmutar,
  // la seccion recien mostrada puede quedar fuera de vista (el usuario venia
  // scrolleado al pie del eje anterior) -> la llevamos al tope.
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

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGaleria);
  } else {
    initGaleria();
  }
}

export { initGaleria };
