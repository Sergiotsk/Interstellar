// Controles tactiles: palanca analogica flotante a la izquierda y botones de accion por fase a la derecha.
// Escriben en los campos touch* de sim, igual que los onPointerDown del JSX; las acciones puntuales van por callback.
import { PALANCA, leerPalanca, seguirDedo } from './logica/joystick.js';

function conectarPalanca(zona, { obtenerSim, alGesto, escuchar }) {
  const base = zona.querySelector('[data-joystick-base]');
  let dedo = null;
  let centro = null;

  const ubicar = (e) => {
    const r = zona.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const pintar = (p) => {
    zona.style.setProperty('--x', `${centro.x}px`);
    zona.style.setProperty('--y', `${centro.y}px`);
    base.style.setProperty('--px', `${p.perillaX}px`);
    base.style.setProperty('--py', `${p.perillaY}px`);
  };
  const mover = (e) => {
    const punto = ubicar(e);
    centro = seguirDedo(centro, punto, PALANCA.radio);
    const p = leerPalanca(punto.x - centro.x, punto.y - centro.y);
    obtenerSim().touchDir = { x: p.x, y: p.y, active: p.activo };
    pintar(p);
  };
  const soltar = (e) => {
    if (e.pointerId !== dedo) return;
    dedo = null;
    zona.removeAttribute('data-activo');
    base.style.removeProperty('--px');
    base.style.removeProperty('--py');
    obtenerSim().touchDir = { x: 0, y: 0, active: false };
  };

  escuchar(zona, 'pointerdown', (e) => {
    e.preventDefault();
    if (dedo !== null) return;
    dedo = e.pointerId;
    // Captura a proposito: el dedo puede salir de la zona sin perder la palanca.
    zona.setPointerCapture?.(e.pointerId);
    alGesto();
    centro = ubicar(e);
    zona.setAttribute('data-activo', '');
    mover(e);
  });
  escuchar(zona, 'pointermove', (e) => {
    if (e.pointerId === dedo) mover(e);
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((t) => escuchar(zona, t, soltar));
  escuchar(zona, 'contextmenu', (e) => e.preventDefault());
}

export function conectarTactil(raiz, { obtenerSim, alGesto, acciones }) {
  const botones = [...raiz.querySelectorAll('[data-control]')];
  const limpiezas = [];
  const escuchar = (el, tipo, fn) => {
    el.addEventListener(tipo, fn);
    limpiezas.push(() => el.removeEventListener(tipo, fn));
  };

  const zona = raiz.querySelector('[data-joystick]');
  if (zona) conectarPalanca(zona, { obtenerSim, alGesto, escuchar });

  botones.forEach((boton) => {
    const control = boton.dataset.control;
    escuchar(boton, 'pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (boton.hasPointerCapture?.(e.pointerId)) boton.releasePointerCapture(e.pointerId);
      alGesto();
      boton.setAttribute('data-activo', '');
      const sim = obtenerSim();
      if (control === 'fuego') sim.touchShoot = true;
      else if (control === 'salto') sim.touchJump = true;
      else if (control === 'slide') sim.touchSlide = true;
      else acciones[control]?.();
    });
    const soltar = () => {
      boton.removeAttribute('data-activo');
      if (control === 'fuego') obtenerSim().touchShoot = false;
    };
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((t) => escuchar(boton, t, soltar));
    escuchar(boton, 'contextmenu', (e) => e.preventDefault());
  });

  return () => limpiezas.forEach((fn) => fn());
}
