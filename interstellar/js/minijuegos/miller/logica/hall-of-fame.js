// Hall of Fame del original (leaderboard + guardado) sobre el formato de comun/logica/ranking.js,
// asi el hub lee el record de la bahia 02 sin cambios.
import { leerRanking, insertarEntrada } from '../../comun/logica/ranking.js';

// Los pilotos de ejemplo del original se muestran mientras no haya partidas reales; nunca se guardan.
export const PILOTOS_EJEMPLO = Object.freeze([
  { nombre: 'COOPER', puntaje: 48500, anos: '1.1y', rango: 'S' },
  { nombre: 'BRAND', puntaje: 41200, anos: '1.6y', rango: 'A' },
  { nombre: 'TARS', puntaje: 32400, anos: '2.4y', rango: 'B' },
  { nombre: 'CASE', puntaje: 24800, anos: '3.2y', rango: 'C' },
]);

export function leerHall(storage, config) {
  if (!storage) return [];
  return leerRanking(storage, config).entradas;
}

export function filasHall(entradas) {
  return entradas.length ? entradas : PILOTOS_EJEMPLO;
}

// Como el input del original: mayusculas, hasta 8 caracteres y COOPER si queda vacio.
function limpiarNombre(nombre, config) {
  const limpio = String(nombre ?? '').trim().toUpperCase().slice(0, config.ranking.largoNombre).trim();
  return limpio || config.ranking.nombrePorDefecto;
}

export function guardarEnHall(storage, config, { nombre, puntaje, anos, rango }) {
  const entradas = leerHall(storage, config);
  const entrada = { nombre: limpiarNombre(nombre, config), puntaje, anos, rango };
  const r = insertarEntrada(entradas, entrada, config);
  if (r.posicion === -1) return { guardado: false, entradas };
  try {
    storage.setItem(config.ranking.clave, JSON.stringify({ v: config.ranking.version, entradas: r.entradas, ultimoNombre: entrada.nombre }));
    return { guardado: true, entradas: r.entradas };
  } catch {
    return { guardado: false, entradas };
  }
}
