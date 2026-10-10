// La baliza: senal que crece al acercarse y alcance para recogerla (FR-007).

const distancia = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

export function intensidadSenal(jugador, baliza, config) {
  return Math.min(1, Math.max(0, 1 - distancia(jugador, baliza) / config.baliza.rangoSenal));
}

export function frecuenciaPulso(intensidad, config) {
  const { pulsoMinHz, pulsoMaxHz } = config.baliza;
  return pulsoMinHz + (pulsoMaxHz - pulsoMinHz) * intensidad;
}

export function alAlcance(jugador, baliza, config) {
  return distancia(jugador, baliza) <= config.jugador.alcanceBaliza;
}
