// Enrutador SPA con Swup v4 — Persistencia Gapless de Audio y Ciclo de Vida Limpio
// Constitución v2.0.0, Principio I: librería vendorizada sin bundler ni build step.

import Swup from './vendor/swup@4.10.0/swup.mjs';
import { markCurrentPage, initHeroVideo, sincronizarAudioRuta } from './layout.js';

let swupInstance = null;
let moduloActivo = null;

// Marca global para evitar que los módulos autoejecuten mount() cuando Swup está activo
if (typeof window !== 'undefined') {
  window.__SWUP_ROUTER_ACTIVE__ = true;
}

const PAGE_MODULES = {
  'personajes.html': () => import('./personajes.js'),
  'galeria.html': () => import('./galeria.js'),
  'minijuegos.html': () => import('./meme-viewer.js'),
  'viaje.html': () => import('./meme-viewer.js'),
  'ciencia.html': () => import('./ciencia.js'),
  'creditos.html': () => import('./creditos.js'),
  'contacto.html': () => import('./contacto.js'),
  'mundos-tierra.html': async () => {
    const p = await import('./mundo-portada.js');
    const f = await import('./filmstrip.js');
    return {
      mount: () => { p.initMundoPortada?.(); f.initFilmstrip?.(); },
      unmount: () => { p.unmountMundoPortada?.(); f.unmountFilmstrip?.(); },
    };
  },
  'mundos-gargantua.html': async () => {
    const p = await import('./mundo-portada.js');
    const f = await import('./filmstrip.js');
    return {
      mount: () => { p.initMundoPortada?.(); f.initFilmstrip?.(); },
      unmount: () => { p.unmountMundoPortada?.(); f.unmountFilmstrip?.(); },
    };
  },
  'mundos-miller.html': async () => {
    const p = await import('./mundo-portada.js');
    const f = await import('./filmstrip.js');
    return {
      mount: () => { p.initMundoPortada?.(); f.initFilmstrip?.(); },
      unmount: () => { p.unmountMundoPortada?.(); f.unmountFilmstrip?.(); },
    };
  },
  'mundos-mann.html': async () => {
    const p = await import('./mundo-portada.js');
    const f = await import('./filmstrip.js');
    return {
      mount: () => { p.initMundoPortada?.(); f.initFilmstrip?.(); },
      unmount: () => { p.unmountMundoPortada?.(); f.unmountFilmstrip?.(); },
    };
  },
  'mundos-tesseract.html': async () => {
    const p = await import('./mundo-portada.js');
    const f = await import('./filmstrip.js');
    return {
      mount: () => { p.initMundoPortada?.(); f.initFilmstrip?.(); },
      unmount: () => { p.unmountMundoPortada?.(); f.unmountFilmstrip?.(); },
    };
  },
};

function getArchivoActual(url = window.location.pathname) {
  const ruta = (url || '').split('?')[0].split('#')[0];
  const archivo = (ruta.split('/').pop() || '').toLowerCase();
  return archivo === '' ? 'index.html' : archivo;
}

export function unmountCurrentPage() {
  if (moduloActivo) {
    try {
      if (typeof moduloActivo.unmount === 'function') {
        moduloActivo.unmount();
      }
    } catch (err) {
      console.warn('[swup-router] error al desmontar módulo anterior:', err);
    }
    moduloActivo = null;
  }

  // Limpieza global de seguridad para ScrollTrigger de GSAP
  if (typeof window !== 'undefined' && window.ScrollTrigger) {
    try {
      window.ScrollTrigger.getAll().forEach((t) => t.kill());
    } catch (e) {
      /* noop */
    }
  }
}

export async function mountCurrentPage(archivo = getArchivoActual()) {
  unmountCurrentPage();

  if (archivo === 'index.html') {
    initHeroVideo();
    return;
  }

  const loader = PAGE_MODULES[archivo];
  if (loader) {
    try {
      const mod = await loader();
      moduloActivo = mod;
      if (typeof mod.mount === 'function') {
        mod.mount();
      }
    } catch (err) {
      console.error(`[swup-router] error al cargar/montar módulo para ${archivo}:`, err);
    }
  }
}

function sincronizarBodyYLayout(visit) {
  if (typeof document === 'undefined' || !document.body) return;

  // 1. Sincronizar clases del body entrante (ej. 'home', 'con-cielo')
  if (visit && visit.to && visit.to.document) {
    const nuevoBody = visit.to.document.body;
    if (nuevoBody) {
      document.body.className = nuevoBody.className;
    }
  }

  // 2. Manejo del cielo espacial decorativo
  const tieneCielo = document.body.classList.contains('con-cielo');
  const cieloExistente = document.body.querySelector('.cielo');
  if (tieneCielo && !cieloExistente) {
    import('./layout.js').then(({ buildCielo }) => {
      document.body.insertAdjacentHTML('afterbegin', buildCielo());
    });
  } else if (!tieneCielo && cieloExistente) {
    cieloExistente.remove();
  }

  // 3. Cerrar el drawer de navegación móvil si estaba abierto
  const header = document.body.querySelector('header');
  const nav = header && header.querySelector('nav');
  const toggle = header && header.querySelector('.nav-toggle');
  if (nav && nav.classList.contains('nav-abierto')) {
    nav.classList.remove('nav-abierto');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }

  // 4. Actualizar estado de sección activa (LED teal)
  if (nav) {
    markCurrentPage(nav);
  }
  document.body
    .querySelectorAll('footer nav.pie-secciones')
    .forEach((navSecciones) => markCurrentPage(navSecciones));
}

export function initSwupRouter() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return null;
  }
  if (swupInstance) {
    return swupInstance;
  }

  const main = document.querySelector('main');
  if (!main) {
    return null;
  }

  try {
    swupInstance = new Swup({
      containers: ['main'],
      animationSelector: '[class*="transition-"]',
      cache: true,
    });

    // 1. Antes de abandonar la página actual: desmontar módulo y ScrollTriggers
    swupInstance.hooks.on('visit:start', () => {
      unmountCurrentPage();
    });

    // 2. Al reemplazar el contenido: actualizar clases del body y título
    swupInstance.hooks.on('content:replace', (visit) => {
      sincronizarBodyYLayout(visit);
    });

    // 3. Cuando la nueva página está a la vista: sincronizar audio, montar módulo y scroll
    swupInstance.hooks.on('page:view', (visit) => {
      const archivo = getArchivoActual();
      sincronizarAudioRuta(archivo);
      mountCurrentPage(archivo);

      // Manejo de ancla (hash) o scroll al tope
      const hash = window.location.hash;
      if (hash) {
        const objetivo = document.querySelector(hash);
        if (objetivo) {
          objetivo.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
      window.scrollTo(0, 0);
    });

    // Montar la página inicial
    mountCurrentPage(getArchivoActual());

    return swupInstance;
  } catch (err) {
    console.warn('[swup-router] no se pudo iniciar Swup, continuando como MPA nativo.', err);
    return null;
  }
}
