// Obstaculos de la fase 1 (nuevo): escombros solidos que se saltan, geiseres que lanzan y chatarra electrificada.
// Geiseres y chatarra avisan antes de pegar (burbujas / chispas): el jugador siempre tiene tiempo de leerlos.
import { sonar, onda } from './efectos.js';
import { aplicarDanio } from './danio.js';

const entre = (rng, [min, max]) => min + rng() * (max - min);

export function faseGeiser(g, G) {
  if (g.t >= g.periodo - G.erupcion) return 'erupcion';
  if (g.t >= g.periodo - G.erupcion - G.aviso) return 'aviso';
  return 'reposo';
}

export function faseChatarra(z, Z) {
  if (z.t >= Z.apagada + Z.aviso) return 'activa';
  if (z.t >= Z.apagada) return 'aviso';
  return 'apagada';
}

// Lejos del Ranger, de las cargas y entre si; con reintentos acotados para no colgar con una semilla rara.
function ubicar(rng, O, cargas, ocupados, separacion) {
  let punto;
  for (let intento = 0; intento < 200; intento++) {
    const a = rng() * Math.PI * 2;
    const d = entre(rng, O.anillo);
    punto = { x: Math.round(Math.cos(a) * d), y: Math.round(Math.sin(a) * d) };
    const libreDeCargas = cargas.every((c) => Math.hypot(punto.x - c.x, punto.y - c.y) > O.lejosDeCargas);
    const libreDeOtros = ocupados.every((o) => Math.hypot(punto.x - o.x, punto.y - o.y) > separacion);
    if (libreDeCargas && libreDeOtros) break;
  }
  ocupados.push(punto);
  return punto;
}

export function crearObstaculos(config, rng, cargas) {
  const O = config.obstaculos;
  const ocupados = [];
  const geiseres = [];
  for (let i = 0; i < O.geiser.cantidad; i++) {
    const periodo = entre(rng, O.geiser.periodo);
    geiseres.push({ ...ubicar(rng, O, cargas, ocupados, 110), periodo, t: rng() * periodo, golpeo: false });
  }
  const chatarra = [];
  const ciclo = O.chatarra.apagada + O.chatarra.aviso + O.chatarra.activa;
  for (let i = 0; i < O.chatarra.cantidad; i++) {
    chatarra.push({ ...ubicar(rng, O, cargas, ocupados, 130), radio: entre(rng, O.chatarra.radio), t: rng() * ciclo, tick: 0 });
  }
  return { geiseres, chatarra };
}

// Empuja al jugador fuera del escombro y le saca la velocidad que iba contra el.
function chocarEscombros(sim, O) {
  if (sim.playerZ >= O.alturaSalto) return;
  for (const d of sim.debris) {
    const minimo = d.radius + O.radioJugador;
    const dx = sim.playerX - d.x;
    const dy = sim.playerY - d.y;
    const dist = Math.hypot(dx, dy);
    if (dist >= minimo) continue;
    const nx = dist > 0 ? dx / dist : 1;
    const ny = dist > 0 ? dy / dist : 0;
    sim.playerX = d.x + nx * minimo;
    sim.playerY = d.y + ny * minimo;
    const contra = sim.playerVx * nx + sim.playerVy * ny;
    if (contra < 0) {
      sim.playerVx -= nx * contra;
      sim.playerVy -= ny * contra;
    }
  }
}

function actualizarGeiseres(sim, dt, G, rng) {
  for (const g of sim.geiseres) {
    const antes = faseGeiser(g, G);
    g.t += dt;
    if (g.t >= g.periodo) {
      g.t -= g.periodo;
      g.golpeo = false;
    }
    const fase = faseGeiser(g, G);
    if (fase === 'erupcion' && antes !== 'erupcion') {
      sonar(sim, 'playWaterSplash', 1.6);
      onda(sim, g.x, g.y, 60, 90);
    }
    if (fase !== 'erupcion' || g.golpeo || sim.isDying) continue;

    const dx = sim.playerX - g.x;
    const dy = sim.playerY - g.y;
    const dist = Math.hypot(dx, dy);
    if (dist >= G.radio || sim.playerZ >= 30) continue;
    g.golpeo = true;
    aplicarDanio(sim, G.danio, g.x, g.y, 'damage', rng);
    // Te lanza por el aire y te corre del chorro.
    sim.playerVz = G.impulso;
    sim.isGrounded = false;
    sim.playerVx += (dist > 0 ? dx / dist : 1) * G.empuje;
    sim.playerVy += (dist > 0 ? dy / dist : 0) * G.empuje;
  }
}

function actualizarChatarra(sim, dt, Z, rng) {
  const ciclo = Z.apagada + Z.aviso + Z.activa;
  for (const z of sim.chatarra) {
    z.t = (z.t + dt) % ciclo;
    z.tick -= dt;
    if (faseChatarra(z, Z) !== 'activa' || sim.playerZ >= 10 || sim.isDying) continue;
    if (Math.hypot(sim.playerX - z.x, sim.playerY - z.y) >= z.radio || z.tick > 0) continue;
    z.tick = Z.tick;
    aplicarDanio(sim, Z.danio, z.x, z.y, 'damage', rng);
  }
}

export function actualizarObstaculos(sim, dt, config, rng) {
  const O = config.obstaculos;
  chocarEscombros(sim, O);
  actualizarGeiseres(sim, dt, O.geiser, rng);
  actualizarChatarra(sim, dt, O.chatarra, rng);
}
