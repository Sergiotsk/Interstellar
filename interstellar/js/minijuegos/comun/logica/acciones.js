// Input modelado como acciones, independiente del dispositivo; cada juego trae su mapa de teclas (FR-011).

export function accionDeTecla(code, teclas = {}) {
  return Object.hasOwn(teclas, code) ? teclas[code] : null;
}

export function accionesDe(teclas) {
  return Object.freeze([...new Set(Object.values(teclas))]);
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
