// Despegue: mantener la accion dentro del radio del Ranger carga la barra; soltar la hace decaer (FR-010, R8).

export function enRadio(jugador, ranger) {
  return Math.hypot(jugador.x - ranger.x, jugador.z - ranger.z) <= ranger.radio;
}

export function crearDespegue() {
  return { carga: 0, soltadas: 0, sostenida: false };
}

// Soltar a medias cuenta como interrupcion: es la "precision del despegue" del puntaje.
export function cargar(despegue, sostenida, dt, config) {
  const { tiempo, decaimientoCarga } = config.despegue;
  if (sostenida) return { ...despegue, carga: Math.min(1, despegue.carga + dt / tiempo), sostenida };
  const solto = despegue.sostenida && despegue.carga > 0 && despegue.carga < 1;
  return {
    carga: Math.max(0, despegue.carga - decaimientoCarga * dt),
    soltadas: despegue.soltadas + (solto ? 1 : 0),
    sostenida,
  };
}
