// La megaola: un frente en x que barre todas las profundidades. El parallax y la espuma son de la escena (R7).

export function crearOla(config) {
  return { x: config.ola.xInicial, vel: 0, revelada: false };
}

// Aparece a distancia fija del JUGADOR: la huida es igual de justa este donde este la baliza.
export function revelarOla(ola, config, xJugador) {
  return { ...ola, revelada: true, x: xJugador + config.ola.distanciaRevelacion, vel: config.ola.velHuida };
}

export function avanzarOla(ola, dt, config) {
  if (!ola.revelada) return ola;
  const vel = ola.vel + config.ola.aceleracion * dt;
  return { ...ola, vel, x: ola.x - vel * dt };
}

// Unica fuente de verdad del peligro: la usan el HUD, el mundo y el audio (FR-028).
export function nivelPeligro(distancia, config) {
  const { cerca, inminente } = config.ola.umbrales;
  if (distancia <= inminente) return 'inminente';
  if (distancia <= cerca) return 'cerca';
  return 'lejos';
}
