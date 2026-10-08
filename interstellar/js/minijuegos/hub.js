// Modulo de pagina del hub de minijuegos: pinta el #1 del ranking local en la bahia 1 (FR-004).
import { CONFIG } from './acople/config.js';
import { leerRanking } from './acople/logica/ranking.js';

export function textoRecord(record) {
  return record ? `Récord: ${record.puntaje.toLocaleString('es-AR')} pts` : 'Sin registro';
}

export function mount() {
  const destino = document.querySelector('[data-record-acople]');
  if (!destino) return;
  let storage;
  try {
    storage = globalThis.localStorage;
  } catch {
    storage = undefined; // acceder a localStorage puede lanzar con el almacenamiento bloqueado
  }
  destino.textContent = textoRecord(leerRanking(storage, CONFIG).entradas[0] ?? null);
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
