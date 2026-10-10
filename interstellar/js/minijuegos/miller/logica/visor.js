// Tamano logico del lienzo segun la pantalla: en pantalla completa la escena la llena sin deformar ni recortar.
// El original era 960x540 fijo; aca se conserva 540 de alto (o 960 de ancho) y se amplia el campo visible.

const BASE = { ancho: 960, alto: 540 };
const PROPORCION_MIN = 4 / 3;
const PROPORCION_MAX = 21 / 9;

export function dimensionesVisor(anchoPx, altoPx) {
  if (!(anchoPx > 0 && altoPx > 0)) return { ...BASE };
  const proporcion = Math.min(PROPORCION_MAX, Math.max(PROPORCION_MIN, anchoPx / altoPx));
  if (proporcion >= BASE.ancho / BASE.alto) return { ancho: Math.round(BASE.alto * proporcion), alto: BASE.alto };
  return { ancho: BASE.ancho, alto: Math.round(BASE.ancho / proporcion) };
}

// La Endurance nace centrada y la nave del shmup vive entre limites que dependen del lienzo (actualizarOrbita).
export function ajustarDimensiones(sim, { ancho, alto }) {
  sim.enduranceX = ancho / 2;
  if (sim.stage !== 'MISSION_2_ORBITAL_ASCENT') return;
  sim.shipX = Math.min(ancho - 50, Math.max(50, sim.shipX));
  sim.shipY = Math.min(alto - 45, Math.max(alto * 0.35, sim.shipY));
}
