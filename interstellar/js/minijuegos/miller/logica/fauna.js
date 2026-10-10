// Fauna de la Fase 1: drones (bio_drone) y alimanas (trench_lurker). El original declaraba estos tipos
// y sus estados (submerged, leap) pero nunca los implemento; el comportamiento es nuevo, con el estilo del juego.
import { CONFIG } from '../config.js';
import { sonar, onda } from './efectos.js';
import { aplicarDanio } from './danio.js';

const TIPOS = ['bio_drone', 'trench_lurker'];

export const esFauna = (e) => TIPOS.includes(e.type);

const entre = (rng, [min, max]) => min + rng() * (max - min);

export function crearDron(sim, x, y, { dron: D } = CONFIG.fauna) {
  return {
    id: sim.nextEnemyId++,
    type: 'bio_drone',
    x,
    y,
    z: D.z,
    vx: 0,
    vy: 0,
    vz: 0,
    hp: D.hp,
    maxHp: D.hp,
    facing: 1,
    attackTimer: D.cadencia,
    stateTimer: 0,
    state: 'patrol',
    flashTimer: 0,
  };
}

export function crearAlimana(sim, x, y, { alimana: A } = CONFIG.fauna) {
  return {
    id: sim.nextEnemyId++,
    type: 'trench_lurker',
    x,
    y,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    hp: A.hp,
    maxHp: A.hp,
    facing: 1,
    attackTimer: 0,
    stateTimer: 0,
    state: 'submerged',
    flashTimer: 0,
  };
}

// Aparecen fuera de pantalla alrededor del jugador; con la baliza recogida, mas seguido.
export function generarFauna(sim, dt, config, rng) {
  const F = config.fauna;
  if (sim.elapsedSeconds < F.primerSpawnS) return;
  sim.faunaTimer -= dt;
  if (sim.faunaTimer > 0) return;
  sim.faunaTimer = entre(rng, sim.beaconAcquired ? F.huida.intervalo : F.intervaloSpawn);
  const tope = sim.beaconAcquired ? F.huida.maxVivos : F.maxVivos;
  if (sim.enemies.filter(esFauna).length >= tope) return;
  aparecerUno(sim, F, rng);
}

function aparecerUno(sim, F, rng) {
  const angulo = rng() * Math.PI * 2;
  const distancia = entre(rng, F.distanciaSpawn);
  const x = sim.playerX + Math.cos(angulo) * distancia;
  const y = sim.playerY + Math.sin(angulo) * distancia;
  sim.enemies.push(rng() < F.probabilidadDron ? crearDron(sim, x, y, F) : crearAlimana(sim, x, y, F));
}

// Al recoger la baliza: una tanda de enemigos alrededor del jugador, sin pasar el tope de la huida.
export function emboscada(sim, config, rng) {
  const F = config.fauna;
  const libres = F.huida.maxVivos - sim.enemies.filter(esFauna).length;
  for (let i = 0; i < Math.min(F.huida.emboscada, libres); i++) aparecerUno(sim, F, rng);
}

function disparar(sim, desdeX, desdeY, vel, damage, type) {
  const objetivoY = sim.playerY - sim.playerZ - 6;
  const angulo = Math.atan2(objetivoY - desdeY, sim.playerX - desdeX);
  sim.bullets.push({ x: desdeX, y: desdeY, vx: Math.cos(angulo) * vel, vy: Math.sin(angulo) * vel, type, damage, life: 2.2, maxLife: 2.2, isEnemy: true });
}

// Mantiene su distancia orbitando al jugador y dispara plasma a la altura del hombro.
function moverDron(sim, e, dt, D) {
  const dx = sim.playerX - e.x;
  const dy = sim.playerY - e.y;
  const d = Math.hypot(dx, dy) || 1;
  const acercarse = d > D.distancia + 20 ? 1 : d < D.distancia - 40 ? -1 : 0;
  const lateral = Math.sin(sim.elapsedSeconds * 1.3 + e.id) * 0.6;
  const objetivoVx = ((dx / d) * acercarse - (dy / d) * lateral) * D.vel;
  const objetivoVy = ((dy / d) * acercarse + (dx / d) * lateral) * D.vel;
  e.vx += (objetivoVx - e.vx) * Math.min(1, 3 * dt);
  e.vy += (objetivoVy - e.vy) * Math.min(1, 3 * dt);
  e.x += e.vx * dt;
  e.y += e.vy * dt;
  e.facing = dx >= 0 ? 1 : -1;

  e.attackTimer -= dt;
  if (e.attackTimer <= 0 && d < D.rangoDisparo && !sim.isDying) {
    e.attackTimer = D.cadencia;
    sonar(sim, 'playEnemyLaser');
    disparar(sim, e.x, e.y - e.z, D.velBala, D.danio, 'drone_plasma');
  }
}

// Nada sumergida hacia el jugador, salta, muerde si cae encima, escupe y vuelve a hundirse.
function moverAlimana(sim, e, dt, A, rng) {
  const dx = sim.playerX - e.x;
  const dy = sim.playerY - e.y;
  const d = Math.hypot(dx, dy) || 1;
  e.facing = dx >= 0 ? 1 : -1;

  if (e.state === 'submerged') {
    e.stateTimer = Math.max(0, e.stateTimer - dt);
    e.x += (dx / d) * A.velSumergida * dt;
    e.y += (dy / d) * A.velSumergida * dt;
    if (d < A.rangoSalto && e.stateTimer <= 0) {
      const tiempoEnAire = (2 * A.velSalto) / A.gravedad;
      e.state = 'leap';
      e.vz = A.velSalto;
      e.vx = dx / tiempoEnAire;
      e.vy = dy / tiempoEnAire;
      sonar(sim, 'playWaterSplash', 1.3);
      onda(sim, e.x, e.y, 40, 70);
    }
    return;
  }

  if (e.state === 'leap') {
    e.x += e.vx * dt;
    e.y += e.vy * dt;
    e.vz -= A.gravedad * dt;
    e.z += e.vz * dt;
    if (e.z <= 0) {
      e.z = 0;
      e.vz = 0;
      e.state = 'aiming';
      e.stateTimer = 0.9;
      e.attackTimer = 0.45;
      sonar(sim, 'playWaterSplash', 1.4);
      onda(sim, e.x, e.y + 6, 46, 60);
      const cayoEncima = Math.hypot(sim.playerX - e.x, sim.playerY - e.y) < A.radioMordida && sim.playerZ < 20;
      if (cayoEncima) aplicarDanio(sim, A.danioMordida, e.x, e.y, 'damage', rng);
    }
    return;
  }

  // 'aiming': un escupitajo y de vuelta al agua.
  e.stateTimer -= dt;
  e.attackTimer -= dt;
  if (e.attackTimer <= 0) {
    e.attackTimer = Infinity;
    sonar(sim, 'playEnemyLaser');
    disparar(sim, e.x, e.y - 8, A.velEscupida, A.danioEscupida, 'lurker_spit');
  }
  if (e.stateTimer <= 0) {
    e.state = 'submerged';
    e.stateTimer = A.enfriamiento;
  }
}

export function moverFauna(sim, dt, config, rng) {
  const F = config.fauna;
  const dirX = Math.cos(sim.waveAngle);
  const dirY = Math.sin(sim.waveAngle);

  for (let i = sim.enemies.length - 1; i >= 0; i--) {
    const e = sim.enemies[i];
    if (!esFauna(e)) continue;
    if (e.flashTimer > 0) e.flashTimer -= dt;

    // La ola se los lleva: el frente avanza sobre su direccion.
    if (e.x * dirX + e.y * dirY >= sim.waveDistance) {
      onda(sim, e.x, e.y, 50, 90);
      sim.enemies.splice(i, 1);
      continue;
    }

    if (e.type === 'bio_drone') moverDron(sim, e, dt, F.dron);
    else moverAlimana(sim, e, dt, F.alimana, rng);
  }
}
