// Visor de memes de Interstellar y "Estamos trabajando en ello" (GIPHY)
// Arquitectura modular en Vanilla JS: maquina de estados desacoplada del DOM
// para testing unitario puro, mas funcion de conexion accesible al DOM.

export const MEMES_DATA = [
  {
    id: 'wViS9n0RqN2',
    title: 'Entrega del TP',
    tagline: 'Esta entrega del TP nos va a costar 51 millones de tokens de IA...',
    category: 'interstellar',
  },
  {
    id: 'NTur7XlVDUdqM',
    title: 'Noche de entrega',
    tagline: 'El TP prendido fuego la noche anterior a la entrega.',
    category: 'interstellar',
  },
  {
    id: 'JIX9t2j0ZTN9S',
    title: 'Tirando código',
    tagline: 'Cámara en vivo tirando código a las chapas para llegar a la entrega de la TUP.',
    category: 'trabajando',
  },
  {
    id: 'l41lUJ1YoZB1lHVPG',
    title: 'Modo automático',
    tagline: 'Yo dándole "yes" a todo lo que propone Claudio.',
    category: 'trabajando',
  },
  {
    id: '13HgwGsXF0aiGY',
    title: 'Último commit',
    tagline: 'Tirando código y metiendo commits a las 23:59 antes de que cierre la entrega en Teams.',
    category: 'trabajando',
  },
  {
    id: '3oKIPnAiaMCws8nOsE',
    title: 'Refactor nocturno',
    tagline: 'El michi senior colaborando con el TP.',
    category: 'trabajando',
  },
  {
    id: 'sU511xfb7ORqw',
    title: 'No hizo nada',
    tagline: 'Cuando la IA te dice que hizo algo, pero no hizo nada.',
    category: 'interstellar',
  },
  {
    id: 'bPCwGUF2sKjyE',
    title: 'Compilación forzosa',
    tagline: 'Cuando no compila y le pedís a TARS que apruebe el TP por la fuerza bruta.',
    category: 'trabajando',
  },
];

export function formatCounter(index, total) {
  if (total === 0) return '[ 0 / 0 ]';
  return `[ ${index + 1} / ${total} ]`;
}

export function createMemeViewerState(memes = MEMES_DATA, initialIndex = 0) {
  let list = Array.isArray(memes) ? memes : [];
  let currentIndex = list.length > 0 ? Math.max(0, Math.min(initialIndex, list.length - 1)) : 0;

  return {
    get currentIndex() {
      return currentIndex;
    },
    get total() {
      return list.length;
    },
    current() {
      if (list.length === 0) return null;
      return list[currentIndex];
    },
    next() {
      if (list.length === 0) return null;
      currentIndex = (currentIndex + 1) % list.length;
      return list[currentIndex];
    },
    prev() {
      if (list.length === 0) return null;
      currentIndex = (currentIndex - 1 + list.length) % list.length;
      return list[currentIndex];
    },
    random() {
      if (list.length === 0) return null;
      if (list.length === 1) return list[0];
      let nextIdx = currentIndex;
      while (nextIdx === currentIndex) {
        nextIdx = Math.floor(Math.random() * list.length);
      }
      currentIndex = nextIdx;
      return list[currentIndex];
    },
  };
}

export function initMemeViewer(container, memes = MEMES_DATA) {
  if (!container || typeof container.querySelector !== 'function') {
    return null;
  }

  const state = createMemeViewerState(memes);
  const iframe = container.querySelector('.meme-iframe');
  const titleEl = container.querySelector('.meme-titulo');
  const taglineEl = container.querySelector('.meme-tagline');
  const counterEl = container.querySelector('.meme-contador');
  const fallbackLink = container.querySelector('.meme-enlace-giphy');
  const btnPrev = container.querySelector('[data-meme-nav="prev"]');
  const btnNext = container.querySelector('[data-meme-nav="next"]');
  const btnRandom = container.querySelector('[data-meme-nav="random"]');

  function render() {
    const meme = state.current();
    if (!meme) return;

    if (iframe) {
      iframe.src = `https://giphy.com/embed/${encodeURIComponent(meme.id)}`;
      iframe.title = meme.title;
    }
    if (fallbackLink) {
      fallbackLink.href = `https://giphy.com/gifs/${encodeURIComponent(meme.id)}`;
    }
    if (titleEl) {
      titleEl.textContent = meme.title;
    }
    if (taglineEl) {
      taglineEl.textContent = meme.tagline;
    }
    if (counterEl) {
      counterEl.textContent = formatCounter(state.currentIndex, state.total);
    }
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      state.prev();
      render();
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      state.next();
      render();
    });
  }

  if (btnRandom) {
    btnRandom.addEventListener('click', () => {
      state.random();
      render();
    });
  }

  // Atajos de teclado en el contenedor para facilitar la exploracion
  container.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      state.prev();
      render();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      state.next();
      render();
    }
  });

  render();
  return state;
}

export const mount = () => {
  const containers = document.querySelectorAll('[data-meme-viewer]');
  containers.forEach((c) => initMemeViewer(c));
};

export const unmount = () => {
  // El contenedor se destruye con el swap de main
};

// Auto-inicializacion si existe en el DOM al cargar
if (typeof document !== 'undefined') {
  if (!window.__SWUP_ROUTER_ACTIVE__) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', mount);
    } else {
      mount();
    }
  }
}
