// Movimiento en agua poco profunda: inercia con arrastre lineal, mas lento en profundidad (R4).
// Por que esta formula: docs/20-notas-de-codigo/minijuegos-miller.md

const acotar = (v, min, max) => Math.min(max, Math.max(min, v));

export function moverJugador(jugador, acciones, dt, config, { impulso = 1 } = {}) {
  const { aceleracion, arrastre, factorProfundidad } = config.jugador;
  const { ancho, profundidad } = config.mundo;
  const aturdidoS = Math.max(0, jugador.aturdidoS - dt);
  const libre = jugador.aturdidoS <= 0;

  const dirX = libre ? (acciones.has('moverDerecha') ? 1 : 0) - (acciones.has('moverIzquierda') ? 1 : 0) : 0;
  const dirZ = libre ? (acciones.has('moverAbajo') ? 1 : 0) - (acciones.has('moverArriba') ? 1 : 0) : 0;
  const empuje = aceleracion * impulso;

  let vx = jugador.vx + (dirX * empuje - jugador.vx * arrastre) * dt;
  let vz = jugador.vz + (dirZ * empuje * factorProfundidad - jugador.vz * arrastre) * dt;
  const x = acotar(jugador.x + vx * dt, 0, ancho);
  const z = acotar(jugador.z + vz * dt, 0, profundidad);
  if (x !== jugador.x + vx * dt) vx = 0;
  if (z !== jugador.z + vz * dt) vz = 0;

  return {
    ...jugador,
    x,
    z,
    vx,
    vz,
    aturdidoS,
    mirando: dirX > 0 ? 'der' : dirX < 0 ? 'izq' : jugador.mirando,
    quietoS: dirX === 0 && dirZ === 0 ? jugador.quietoS + dt : 0,
  };
}

// Las colisiones exigen coincidir en x Y en z: la pantalla solo proyecta la profundidad (FR-033).
export function resolverRestos(jugador, restos, config) {
  const { caja } = config.jugador;
  let j = jugador;
  let choque = false;
  for (const r of restos) {
    const dx = j.x - r.x;
    const dz = j.z - r.z;
    const solapeX = (caja.ancho + r.ancho) / 2 - Math.abs(dx);
    const solapeZ = (caja.prof + r.prof) / 2 - Math.abs(dz);
    if (solapeX <= 0 || solapeZ <= 0) continue;

    if (Math.hypot(j.vx, j.vz) >= config.restos.velChoque) {
      choque = true;
      j = { ...j, aturdidoS: config.restos.aturdimientoS };
    }
    j =
      solapeX < solapeZ
        ? { ...j, x: j.x + Math.sign(dx || -1) * solapeX, vx: 0 }
        : { ...j, z: j.z + Math.sign(dz || 1) * solapeZ, vz: 0 };
  }
  return { jugador: j, choque };
}
