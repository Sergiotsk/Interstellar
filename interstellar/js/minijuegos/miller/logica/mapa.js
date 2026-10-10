// Mapa de la mision generado por semilla: Ranger fijo, baliza al fondo, restos y CASE en el camino (R5).

const MAX_INTENTOS = 60;
const DISTANCIA_BALIZA = 40;

const entre = (rng, desde, hasta) => desde + rng() * (hasta - desde);
const distancia = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

export function crearMapa(config, rng) {
  const { ranger: R, baliza: B, restos: Rs, mundo } = config;
  const ranger = { x: R.x, z: R.z, radio: R.radio };
  const baliza = { x: entre(rng, B.ventanaX[0], B.ventanaX[1]), z: entre(rng, 10, mundo.profundidad - 10) };

  // CASE queda corrido de la linea recta Ranger-baliza: alcanzarlo es una decision, no un regalo.
  const fraccion = entre(rng, 0.35, 0.55);
  const zRecta = ranger.z + (baliza.z - ranger.z) * fraccion;
  const desvio = (rng() < 0.5 ? -1 : 1) * 25;
  const caseRobot = {
    x: ranger.x + (baliza.x - ranger.x) * fraccion,
    z: Math.min(mundo.profundidad - 5, Math.max(5, zRecta + desvio)),
  };

  // Con separacionMin >= 30 nunca hay tres restos en la misma x: siempre queda un hueco de paso en z.
  const { ancho, prof } = Rs.caja;
  const restos = [];
  for (let i = 0; i < Rs.cantidad; i++) {
    for (let intento = 0; intento < MAX_INTENTOS; intento++) {
      const r = {
        x: entre(rng, Rs.desdeX, Rs.hastaX),
        z: entre(rng, prof / 2, mundo.profundidad - prof / 2),
        ancho,
        prof,
        variante: Math.floor(rng() * 3),
      };
      const libre =
        Math.abs(r.x - ranger.x) > ranger.radio + ancho &&
        distancia(r, baliza) > DISTANCIA_BALIZA &&
        distancia(r, caseRobot) > DISTANCIA_BALIZA &&
        restos.every((o) => distancia(r, o) >= Rs.separacionMin);
      if (libre) {
        restos.push(r);
        break;
      }
    }
  }

  return { ranger, baliza, restos, caseRobot };
}
