// Glue tactil de Miller: joystick (izquierda) + boton de accion (derecha), multitouch por pointerId (FR-020).
import { accionesDeJoystick } from './logica/joystick.js';
import { tocar, levantar, levantarTodo, accionesTactiles } from '../comun/logica/controles-tactiles.js';

const ZONA_MUERTA = 0.25; // fraccion del radio del joystick
const RECORRIDO_NUDO = 0.55;

export function conectarControles(raiz, { alCambiar, alTocar, acciones }) {
  const joystick = raiz.querySelector('[data-joystick]');
  const nudo = raiz.querySelector('[data-joystick-nudo]');
  const boton = raiz.querySelector('[data-control="accion"]');
  let dedoJoystick = null;
  let direccion = [];
  let toques = levantarTodo();

  function emitir() {
    alCambiar(new Set([...direccion, ...accionesTactiles(toques)]));
  }

  function moverNudo(dx, dy) {
    nudo.style.setProperty('--dx', `${dx}px`);
    nudo.style.setProperty('--dy', `${dy}px`);
  }

  function seguirDedo(e) {
    const caja = joystick.getBoundingClientRect();
    const radio = caja.width / 2;
    const dx = e.clientX - (caja.left + radio);
    const dy = e.clientY - (caja.top + radio);
    const largo = Math.hypot(dx, dy) || 1;
    const tope = Math.min(1, (radio * RECORRIDO_NUDO) / largo);
    moverNudo(dx * tope, dy * tope);
    direccion = accionesDeJoystick(dx, dy, radio * ZONA_MUERTA);
    emitir();
  }

  function soltarJoystick() {
    dedoJoystick = null;
    direccion = [];
    joystick.dataset.activo = 'false';
    moverNudo(0, 0);
    emitir();
  }

  function alApoyarJoystick(e) {
    e.preventDefault();
    alTocar();
    dedoJoystick = e.pointerId;
    joystick.setPointerCapture?.(e.pointerId);
    joystick.dataset.activo = 'true';
    seguirDedo(e);
  }

  function alMoverJoystick(e) {
    if (e.pointerId === dedoJoystick) seguirDedo(e);
  }

  function alLevantarJoystick(e) {
    if (e.pointerId === dedoJoystick) soltarJoystick();
  }

  function pintarBoton() {
    boton.dataset.activo = String(toques.size > 0);
  }

  function alApoyarBoton(e) {
    e.preventDefault();
    // Sin soltar la captura implicita del tactil, pointerleave no llega al salir del boton.
    if (boton.hasPointerCapture?.(e.pointerId)) boton.releasePointerCapture(e.pointerId);
    alTocar();
    toques = tocar(toques, e.pointerId, 'accion', acciones);
    pintarBoton();
    emitir();
  }

  function alLevantarBoton(e) {
    const nuevos = levantar(toques, e.pointerId);
    if (nuevos === toques) return;
    toques = nuevos;
    pintarBoton();
    emitir();
  }

  const sinMenu = (e) => e.preventDefault();
  const eventos = [
    [joystick, 'pointerdown', alApoyarJoystick],
    [joystick, 'pointermove', alMoverJoystick],
    [joystick, 'pointerup', alLevantarJoystick],
    [joystick, 'pointercancel', alLevantarJoystick],
    [joystick, 'lostpointercapture', alLevantarJoystick],
    [joystick, 'contextmenu', sinMenu],
    [boton, 'pointerdown', alApoyarBoton],
    [boton, 'pointerup', alLevantarBoton],
    [boton, 'pointercancel', alLevantarBoton],
    [boton, 'pointerleave', alLevantarBoton],
    [boton, 'contextmenu', sinMenu],
  ];
  eventos.forEach(([el, tipo, fn]) => el.addEventListener(tipo, fn));

  return {
    soltar() {
      toques = levantarTodo();
      pintarBoton();
      soltarJoystick();
    },
    limpiar: () => eventos.forEach(([el, tipo, fn]) => el.removeEventListener(tipo, fn)),
  };
}
