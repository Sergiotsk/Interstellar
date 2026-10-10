// Glue de los mandos tactiles: Pointer Events -> mapa de dedos (logica/controles-tactiles.js). Ver 010 R2.
import { CONFIG } from './config.js';
import { accionesDe } from '../comun/logica/acciones.js';
import { tocar, levantar, levantarTodo } from '../comun/logica/controles-tactiles.js';

const ACCIONES = accionesDe(CONFIG.teclas);

export function conectarControles(raiz, { alCambiar, alTocar }) {
  const botones = [...raiz.querySelectorAll('[data-control]')];
  let toques = levantarTodo();

  // Un control se ve apretado mientras al menos un dedo lo sostenga.
  function pintar() {
    const activos = new Set(toques.values());
    botones.forEach((b) => {
      b.dataset.activo = String(activos.has(b.dataset.control));
    });
  }

  function cambiar(nuevos) {
    if (nuevos === toques) return;
    toques = nuevos;
    pintar();
    alCambiar(toques);
  }

  function alApoyar(e) {
    e.preventDefault();
    // El tactil captura el dedo en el boton de origen; sin soltarla, pointerleave no llega al salir.
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    alTocar();
    cambiar(tocar(toques, e.pointerId, e.currentTarget.dataset.control, ACCIONES));
  }

  function alLevantar(e) {
    cambiar(levantar(toques, e.pointerId));
  }

  const sinMenu = (e) => e.preventDefault();
  const eventos = [
    ['pointerdown', alApoyar],
    ['pointerup', alLevantar],
    ['pointercancel', alLevantar],
    ['pointerleave', alLevantar],
    ['contextmenu', sinMenu],
  ];
  botones.forEach((b) => eventos.forEach(([tipo, fn]) => b.addEventListener(tipo, fn)));

  return {
    soltar: () => cambiar(levantarTodo()),
    limpiar: () => botones.forEach((b) => eventos.forEach(([tipo, fn]) => b.removeEventListener(tipo, fn))),
  };
}
