// Proyectiles, impactos y caidas: pasos 8 y 9 del update() original (App.tsx 3936-4073), con rng inyectado.
import { ANIM, CONFIG, PALETA_PIXEL } from '../config.js';
import { sonar, textoFlotante, mostrarBanner } from './efectos.js';
import { aplicarDanio } from './danio.js';
import { esFauna } from './fauna.js';

const ORBITA = 'MISSION_2_ORBITAL_ASCENT';

function guiarMisil(sim, b, dt) {
  const targetEnemy = sim.enemies.find((e) => e.id === b.targetEnemyId);
  if (!targetEnemy) return;
  const angleToE = Math.atan2(targetEnemy.y - b.y, targetEnemy.x - b.x);
  const curAngle = Math.atan2(b.vy, b.vx);
  let diff = angleToE - curAngle;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  const newAngle = curAngle + diff * Math.min(1, 12 * dt);
  const speed = Math.hypot(b.vx, b.vy);
  b.vx = Math.cos(newAngle) * speed;
  b.vy = Math.sin(newAngle) * speed;
}

// Baja en la superficie: cuenta en enemiesDestroyed (el campo que el puntaje del original ya sumaba).
function derribarFauna(sim, enemy, eIdx, rng, F) {
  sim.enemies.splice(eIdx, 1);
  sim.enemiesDestroyed++;
  sonar(sim, 'playExplosion', false);
  textoFlotante(sim, enemy.x, enemy.y - enemy.z - 18, `+${F.puntos} PTS`, PALETA_PIXEL.P13, false);
  for (let p = 0; p < 14; p++) {
    const a = rng() * Math.PI * 2;
    const spd = 60 + rng() * 140;
    sim.particles.push({
      x: enemy.x,
      y: enemy.y - enemy.z,
      vx: Math.cos(a) * spd,
      vy: Math.sin(a) * spd,
      life: 0.5,
      maxLife: 0.5,
      color: p % 2 === 0 ? PALETA_PIXEL.P13 : PALETA_PIXEL.P7,
      size: 2 + rng() * 3,
    });
  }
  if (rng() < F.probabilidadCelda) {
    sim.drops.push({ id: sim.nextDropId++, type: 'energy_cell', x: enemy.x, y: enemy.y, z: 0, vz: 0, life: 14.0 });
  }
}

function derribar(sim, enemy, eIdx, rng) {
  if (enemy.type === 'dreadnought_boss') {
    sim.bossActive = false;
    sonar(sim, 'playExplosion', true);
    sim.screenShake = ANIM.shake.fuerte * 3;
    mostrarBanner(sim, 'DREADNOUGHT DESTROYED!', 'APPROACHING THE ENDURANCE', '#7ee7f8', 3.0, true);
    for (let p = 0; p < 45; p++) {
      const a = rng() * Math.PI * 2;
      const spd = 80 + rng() * 220;
      sim.particles.push({
        x: enemy.x + (rng() * 2 - 1) * 40,
        y: enemy.y + (rng() * 2 - 1) * 40,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        life: 0.8,
        maxLife: 0.8,
        color: p % 2 === 0 ? PALETA_PIXEL.P15 : PALETA_PIXEL.P13,
        size: 5 + rng() * 4,
      });
    }
    sim.enemies.splice(eIdx, 1);
    sim.aerialInterceptorsDowned += 5;
    textoFlotante(sim, enemy.x, enemy.y, '+5000 PTS', PALETA_PIXEL.P13, true);
    return;
  }

  sim.enemies.splice(eIdx, 1);
  sim.aerialInterceptorsDowned++;
  sonar(sim, 'playExplosion', false);

  const pts = (enemy.type === 'armored_gunship' ? 500 : 250) * Math.min(4, 1 + Math.floor(sim.combo / 5));
  textoFlotante(sim, enemy.x, enemy.y - 18, `+${pts} PTS`, PALETA_PIXEL.P13, false);

  if (enemy.type === 'cargo_drone' || rng() < 0.35) {
    const type =
      enemy.type === 'cargo_drone'
        ? rng() < 0.6
          ? 'weapon_upgrade'
          : 'emp_bomb'
        : rng() < 0.4
          ? 'weapon_upgrade'
          : rng() < 0.7
            ? 'energy_cell'
            : 'missile_pod';
    sim.drops.push({ id: sim.nextDropId++, type, x: enemy.x, y: enemy.y, z: 0, vz: 0, life: 14.0 });
  }
}

export function actualizarProyectiles(sim, dt, rng, { ancho, alto }, F = CONFIG.fauna) {
  const enSuperficie = sim.stage === 'MISSION_1_SURFACE';
  for (let bIdx = sim.bullets.length - 1; bIdx >= 0; bIdx--) {
    const b = sim.bullets[bIdx];
    b.life -= dt;
    if (b.type === 'homing_missile' && b.targetEnemyId !== undefined) guiarMisil(sim, b, dt);

    b.x += b.vx * dt;
    b.y += b.vy * dt;

    // En la superficie las coordenadas son de mundo: el limite es la vista de la camara. El original usaba
    // el rectangulo de pantalla y los disparos lejos del origen desaparecian al nacer.
    const fuera = enSuperficie
      ? Math.abs(b.x - sim.camX) > ancho / 2 + 60 || Math.abs(b.y - sim.camY) > alto / 2 + 60
      : b.y < -50 || b.y > alto + 50 || b.x < -50 || b.x > ancho + 50;
    if (b.life <= 0 || fuera) {
      sim.bullets.splice(bIdx, 1);
      continue;
    }

    if (b.isEnemy) {
      const enOrbita = sim.stage === ORBITA;
      const curX = enOrbita ? sim.shipX : sim.playerX;
      const curY = enOrbita ? sim.shipY : sim.playerY;
      if (Math.hypot(b.x - curX, b.y - curY) < (enOrbita ? 32 : 18)) {
        sim.bullets.splice(bIdx, 1);
        if (sim.slideTimer <= 0 && !sim.isDying) aplicarDanio(sim, b.damage, b.x, b.y, 'damage', rng);
      }
      continue;
    }

    for (let eIdx = sim.enemies.length - 1; eIdx >= 0; eIdx--) {
      const enemy = sim.enemies[eIdx];
      if (enemy.type === 'trench_lurker' && enemy.state === 'submerged') continue;
      const hitRadius = enemy.type === 'dreadnought_boss' ? 75 : enemy.type === 'armored_gunship' ? 36 : 22;
      // Los drones flotan: el impacto se mide a su altura, como la mira.
      if (Math.hypot(b.x - enemy.x, b.y - (enemy.y - (enemy.z ?? 0))) >= hitRadius) continue;

      const isCrit = b.type === 'homing_missile' || rng() < 0.25;
      const finalDmg = isCrit ? Math.round(b.damage * 1.5) : b.damage;
      enemy.hp -= finalDmg;
      enemy.flashTimer = 0.1;
      sim.screenShake = Math.max(sim.screenShake, isCrit ? ANIM.shake.medio : ANIM.shake.leve);

      sim.hitMarkers.push({ x: b.x, y: b.y, life: 0.16, maxLife: 0.16, isCrit });
      sonar(sim, 'playHitMarker', isCrit);
      textoFlotante(
        sim,
        b.x + (rng() * 2 - 1) * 6,
        b.y - 10,
        isCrit ? `${finalDmg}!` : `${finalDmg}`,
        isCrit ? '#ff3b30' : '#4fd0e0',
        isCrit,
      );

      sim.bullets.splice(bIdx, 1);
      sim.combo++;
      sim.comboTimer = 2.4;

      if (enemy.hp <= 0) {
        if (esFauna(enemy)) derribarFauna(sim, enemy, eIdx, rng, F);
        else derribar(sim, enemy, eIdx, rng);
      }
      break;
    }
  }
}

export function actualizarCaidas(sim, dt, { alto }) {
  const enOrbita = sim.stage === ORBITA;
  for (let dIdx = sim.drops.length - 1; dIdx >= 0; dIdx--) {
    const drop = sim.drops[dIdx];
    drop.life -= dt;
    if (enOrbita) drop.y += 85 * dt; // en el shmup las caidas bajan

    if (drop.life <= 0 || drop.y > alto + 40) {
      sim.drops.splice(dIdx, 1);
      continue;
    }

    const curX = enOrbita ? sim.shipX : sim.playerX;
    const curY = enOrbita ? sim.shipY : sim.playerY;
    if (Math.hypot(curX - drop.x, curY - drop.y) >= 42) continue;

    sim.drops.splice(dIdx, 1);
    if (drop.type === 'weapon_upgrade') {
      sim.weaponPowerLevel = Math.min(3, sim.weaponPowerLevel + 1);
      sonar(sim, 'playPickup', true);
      sonar(sim, 'playPowerupChime');
      textoFlotante(sim, curX, curY - 25, sim.weaponPowerLevel === 2 ? 'TRIPLE PLASMA!' : 'QUAD OVERCHARGE!', '#a855f7', true);
    } else if (drop.type === 'emp_bomb') {
      sim.bombStock = Math.min(4, sim.bombStock + 1);
      sonar(sim, 'playPickup', true);
      textoFlotante(sim, curX, curY - 25, '+1 EMP BOMB (B)', '#e8803b', true);
    } else if (drop.type === 'missile_pod') {
      sim.missileStock = Math.min(16, sim.missileStock + 4);
      sonar(sim, 'playPickup', true);
      textoFlotante(sim, curX, curY - 25, '+4 MISSILES (Q)', '#f7a952', true);
    } else if (drop.type === 'energy_cell') {
      sim.shipShield = Math.min(100, sim.shipShield + 40);
      sim.playerShieldHp = Math.min(100, sim.playerShieldHp + 35);
      sonar(sim, 'playPickup', true);
      textoFlotante(sim, curX, curY - 25, '+SHIELD RESTORED', '#4fd0e0', false);
    }
  }
}
