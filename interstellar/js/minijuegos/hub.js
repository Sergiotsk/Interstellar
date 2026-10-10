// Modulo de pagina del hub de minijuegos: pinta el #1 del ranking local de cada bahia disponible (FR-004, 011 FR-001).
import { CONFIG as CONFIG_ACOPLE } from './acople/config.js';
import { CONFIG as CONFIG_MILLER } from './miller/config.js';
import { leerRanking } from './comun/logica/ranking.js';

export const MISIONES = Object.freeze([
  { mision: 'acople', destino: '[data-record-acople]', config: CONFIG_ACOPLE },
  { mision: 'miller', destino: '[data-record-miller]', config: CONFIG_MILLER },
]);

export function textoRecord(record) {
  return record ? `Récord: ${record.puntaje.toLocaleString('es-AR')} pts` : 'Sin registro';
}

export function recordDe(storage, config) {
  return leerRanking(storage, config).entradas[0] ?? null;
}

export function mount() {
  let storage;
  try {
    storage = globalThis.localStorage;
  } catch {
    storage = undefined; // acceder a localStorage puede lanzar con el almacenamiento bloqueado
  }
  MISIONES.forEach(({ destino, config }) => {
    const el = document.querySelector(destino);
    if (el) el.textContent = textoRecord(recordDe(storage, config));
  });
}

export function unmount() {
  // El DOM del hub se va con el swap de <main>; no hay nada que liberar.
}

if (typeof document !== 'undefined' && !window.__SWUP_ROUTER_ACTIVE__) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
}
