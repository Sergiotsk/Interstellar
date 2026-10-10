// Radar tactico: que contactos ve y donde, en coordenadas del radar (centro 0,0; x a la derecha, y hacia abajo).
// En el original el "TACTICAL RADAR" era una frase; esto lo vuelve un radar de verdad.

function proyectar(dx, dy, escala, radio, clavarEnBorde) {
  const x = dx * escala;
  const y = dy * escala;
  const d = Math.hypot(x, y);
  if (d <= radio) return { x, y, fuera: false };
  if (!clavarEnBorde) return null;
  return { x: (x / d) * radio, y: (y / d) * radio, fuera: true };
}

function agregar(contactos, tipo, punto) {
  if (punto) contactos.push({ tipo, ...punto });
}

function radarSuperficie(sim, { radio, alcanceSuperficie }) {
  const escala = radio / alcanceSuperficie;
  const cx = sim.playerX;
  const cy = sim.playerY;
  const contactos = [];

  // Baliza y Ranger se clavan en el borde: marcan hacia donde ir aunque esten lejos.
  if (!sim.beaconAcquired) agregar(contactos, 'baliza', proyectar(sim.beaconX - cx, sim.beaconY - cy, escala, radio, true));
  agregar(contactos, 'ranger', proyectar(sim.shipX - cx, sim.shipY - cy, escala, radio, true));
  agregar(contactos, 'case', proyectar(sim.caseX - cx, sim.caseY - cy, escala, radio, false));
  for (const e of sim.enemies) {
    const tipo = e.type === 'trench_lurker' && e.state === 'submerged' ? 'sumergido' : 'enemigo';
    agregar(contactos, tipo, proyectar(e.x - cx, e.y - cy, escala, radio, false));
  }

  // Frente de la ola: la recta donde (x, y) . direccion = waveDistance, vista desde el jugador.
  const dirX = Math.cos(sim.waveAngle);
  const dirY = Math.sin(sim.waveAngle);
  const distancia = (sim.waveDistance - (cx * dirX + cy * dirY)) * escala;
  let ola = null;
  if (distancia <= radio) {
    const mx = dirX * distancia;
    const my = dirY * distancia;
    ola = { x1: mx + dirY * radio, y1: my - dirX * radio, x2: mx - dirY * radio, y2: my + dirX * radio };
  }
  return { contactos, ola };
}

function radarOrbita(sim, { radio, alcanceOrbita }) {
  const escala = radio / alcanceOrbita;
  const contactos = [];
  for (const e of sim.enemies) {
    agregar(contactos, e.type === 'dreadnought_boss' ? 'jefe' : 'enemigo', proyectar(e.x - sim.shipX, e.y - sim.shipY, escala, radio, false));
  }
  if (sim.enduranceDescending) {
    agregar(contactos, 'endurance', proyectar(sim.enduranceX - sim.shipX, sim.enduranceY - sim.shipY, escala, radio, true));
  }
  return { contactos, ola: null };
}

export function contactosRadar(sim, config) {
  return sim.stage === 'MISSION_1_SURFACE' ? radarSuperficie(sim, config.radar) : radarOrbita(sim, config.radar);
}
