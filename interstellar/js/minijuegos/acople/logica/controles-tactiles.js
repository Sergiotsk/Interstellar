// Dedos apoyados sobre los controles tactiles: Map pointerId -> accion, inmutable (010 R3, data-model "Toques").
import { CONFIG } from '../config.js';

export const ACCIONES_TACTILES = Object.freeze([...new Set(Object.values(CONFIG.teclas))]);

export function tocar(mapa, id, accion) {
  if (!ACCIONES_TACTILES.includes(accion)) return mapa;
  return new Map(mapa).set(id, accion);
}

export function levantar(mapa, id) {
  if (!mapa.has(id)) return mapa;
  const nuevo = new Map(mapa);
  nuevo.delete(id);
  return nuevo;
}

export function levantarTodo() {
  return new Map();
}

export function accionesTactiles(mapa) {
  return new Set(mapa.values());
}
