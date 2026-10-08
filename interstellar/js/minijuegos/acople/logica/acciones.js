// Input del acople modelado como acciones, independiente del dispositivo (FR-011).
import { CONFIG } from '../config.js';

export function accionDeTecla(code, teclas = CONFIG.teclas) {
  return Object.hasOwn(teclas, code) ? teclas[code] : null;
}

export function presionar(activas, accion) {
  return new Set(activas).add(accion);
}

export function soltar(activas, accion) {
  const nuevas = new Set(activas);
  nuevas.delete(accion);
  return nuevas;
}

export function soltarTodo() {
  return new Set();
}
