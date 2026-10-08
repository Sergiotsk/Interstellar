// Pantalla completa del simulador (FR-042). El navegador solo la concede dentro de un gesto del usuario.

export function soportada() {
  return typeof document !== 'undefined' && Boolean(document.fullscreenEnabled);
}

export function estaActiva(el) {
  return Boolean(el) && document.fullscreenElement === el;
}

// Nunca rechaza: sin gesto, sin soporte o con permiso negado, se sigue jugando dentro de la pagina.
export function entrar(el) {
  if (!soportada() || estaActiva(el) || typeof el.requestFullscreen !== 'function') return Promise.resolve(false);
  return el
    .requestFullscreen({ navigationUI: 'hide' })
    .then(() => true)
    .catch(() => false);
}

export function salir() {
  if (typeof document === 'undefined' || !document.fullscreenElement) return Promise.resolve();
  return document.exitFullscreen().catch(() => {});
}
