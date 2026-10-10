// Transicion y Fase 2 (shmup vertical): bloques MISSION_TRANSITION y MISSION_2_ORBITAL_ASCENT del update() original
// (App.tsx 3128-3667), con rng en lugar de Math.random. El fin con VICTORY queda en sim.fin.
import { ANIM, PALETA_PIXEL, TOKENS_HUD } from '../config.js';
import { sonar, mostrarBanner } from './efectos.js';
import { aplicarDanio } from './danio.js';
import { resultadoVictoria } from './puntaje.js';

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const SECTORES = [
  { desde: 8500, numero: 5, nombre: 'SECTOR 5: FLAGSHIP SENTINEL DREADNOUGHT', aviso: '⚠ WARNING: DREADNOUGHT ENCOUNTER AHEAD ⚠' },
  { desde: 6500, numero: 4, nombre: 'SECTOR 4: ORBITAL HEAVY CRUISERS', aviso: 'HEAVY BULLET CURTAINS & SHIELDED ENGINES' },
  { desde: 4200, numero: 3, nombre: 'SECTOR 3: IONIZED ASTEROID BELT', aviso: 'NAVIGATE DENSE ASTEROIDS & SPACE MINES' },
  { desde: 2000, numero: 2, nombre: 'SECTOR 2: STRATOSPHERIC FIGHTERS', aviso: 'SWOOPING FORMATIONS DETECTED' },
  { desde: 0, numero: 1, nombre: 'SECTOR 1: TROPOSPHERE & CLOUD DRONES', aviso: 'SWOOPING FORMATIONS DETECTED' },
];

export function actualizarTransicion(sim, dt, rng, { ancho, alto }) {
  sim.transitionTimer -= dt;
  const targetStartX = ancho / 2;
  const targetStartY = alto - 85;

  sim.shipX += (targetStartX - sim.shipX) * Math.min(1, 8 * dt);
  sim.shipY += (targetStartY - sim.shipY) * Math.min(1, 8 * dt);
  sim.shipAngle = -Math.PI / 2;
  sim.shipRoll = 0;

  sim.particles.push({
    x: sim.shipX + (rng() * 2 - 1) * 14,
    y: sim.shipY + 34,
    vx: (rng() * 2 - 1) * 40,
    vy: 350 + rng() * 150,
    life: 0.35,
    maxLife: 0.35,
    color: rng() < 0.5 ? '#4fd0e0' : '#ffffff',
    size: 5,
  });

  if (sim.transitionTimer <= 0) {
    sim.stage = 'MISSION_2_ORBITAL_ASCENT';
    sim.shipX = targetStartX;
    sim.shipY = targetStartY;
    sim.enemies = [];
    sim.enemySpawnTimer = 0.6;
    sonar(sim, 'playTargetLock');
    sonar(sim, 'playGalagaDive');
  }
}

function enemigo(sim, datos) {
  sim.enemies.push({ id: sim.nextEnemyId++, z: 0, vz: 0, facing: 1, flashTimer: 0, ...datos });
}

function disparoEnemigo(sim, x, y, vx, vy, damage, life) {
  sim.bullets.push({ x, y, vx, vy, type: 'drone_plasma', damage, life, maxLife: life, isEnemy: true });
}

function generarOleada(sim, rng, ancho) {
  const waveTypeRand = rng();
  if (waveTypeRand < 0.45) {
    // Escuadron Galaga: 3 cazas en V que entran por un costado.
    const entrySide = rng() < 0.5 ? -1 : 1;
    const startX = entrySide === 1 ? ancho + 30 : -30;
    for (let i = 0; i < 3; i++) {
      enemigo(sim, {
        type: 'galaga_striker',
        x: startX + i * 40 * entrySide,
        y: -30 - i * 35,
        vx: -entrySide * (180 + rng() * 40),
        vy: 140 + rng() * 50,
        hp: 45,
        maxHp: 45,
        facing: entrySide,
        attackTimer: 1.2 + i * 0.4,
        stateTimer: 2.5,
        state: 'swoop',
        diveSeed: rng() * Math.PI * 2,
      });
    }
    if (rng() < 0.5) sonar(sim, 'playGalagaDive');
  } else if (waveTypeRand < 0.75) {
    enemigo(sim, {
      type: 'scout_drone',
      x: 80 + rng() * (ancho - 160),
      y: -30,
      vx: (rng() * 2 - 1) * 60,
      vy: 240 + rng() * 80,
      hp: 30,
      maxHp: 30,
      attackTimer: 1.0,
      stateTimer: 2.0,
      state: 'dive',
    });
  } else if (sim.sector >= 2 && rng() < 0.4) {
    enemigo(sim, {
      type: 'armored_gunship',
      x: 100 + rng() * (ancho - 200),
      y: -50,
      vx: (rng() * 2 - 1) * 40,
      vy: 90,
      hp: 140,
      maxHp: 140,
      attackTimer: 1.5,
      stateTimer: 3.0,
      state: 'patrol',
    });
  } else if (rng() < 0.3) {
    enemigo(sim, {
      type: 'cargo_drone',
      x: 80 + rng() * (ancho - 160),
      y: -40,
      vx: (rng() * 2 - 1) * 30,
      vy: 75,
      hp: 40,
      maxHp: 40,
      attackTimer: 99,
      stateTimer: 99,
      state: 'patrol',
    });
  }
}

function moverEnemigos(sim, dt, rng, { ancho, alto }) {
  for (let eIdx = sim.enemies.length - 1; eIdx >= 0; eIdx--) {
    const enemy = sim.enemies[eIdx];
    if (enemy.flashTimer > 0) enemy.flashTimer -= dt;

    if (enemy.type === 'dreadnought_boss') {
      if (enemy.y < 110) enemy.y += 60 * dt;
      else enemy.x = ancho / 2 + Math.sin(sim.elapsedSeconds * 1.5) * (ancho * 0.35);

      enemy.attackTimer -= dt;
      if (enemy.attackTimer <= 0) {
        enemy.attackTimer = enemy.hp < 300 ? 1.1 : 1.6;
        sonar(sim, 'playEnemyLaser');
        const baseAngle = Math.PI / 2;
        [-0.35, -0.18, 0, 0.18, 0.35].forEach((offsetAngle) => {
          const fAngle = baseAngle + offsetAngle;
          disparoEnemigo(sim, enemy.x, enemy.y + 35, Math.cos(fAngle) * 380, Math.sin(fAngle) * 380, 26, 2.2);
        });
      }
    } else if (enemy.type === 'galaga_striker') {
      // Picada en curva seno, al estilo Galaga.
      enemy.stateTimer -= dt;
      enemy.attackTimer -= dt;
      enemy.pathTime = (enemy.pathTime || 0) + dt;
      const sineOffset = Math.sin(enemy.pathTime * 3.5 + (enemy.diveSeed || 0)) * 140;
      enemy.x += (enemy.vx + sineOffset) * dt;
      enemy.y += enemy.vy * dt;

      if (enemy.attackTimer <= 0 && enemy.y < sim.shipY) {
        enemy.attackTimer = 2.0;
        sonar(sim, 'playEnemyLaser');
        const angleToPlayer = Math.atan2(sim.shipY - enemy.y, sim.shipX - enemy.x);
        disparoEnemigo(sim, enemy.x, enemy.y + 12, Math.cos(angleToPlayer) * 420, Math.sin(angleToPlayer) * 420, 20, 1.8);
      }
    } else if (enemy.type === 'scout_drone') {
      enemy.x += enemy.vx * dt;
      enemy.y += enemy.vy * dt;
      // Como en el original, el scout nunca descuenta su attackTimer: dispara solo si nace en 0 o menos.
      if (enemy.attackTimer <= 0 && enemy.y < sim.shipY) {
        enemy.attackTimer = 1.8;
        sonar(sim, 'playEnemyLaser');
        disparoEnemigo(sim, enemy.x, enemy.y + 10, 0, 460, 18, 1.5);
      }
    } else if (enemy.type === 'armored_gunship') {
      enemy.x += enemy.vx * dt;
      enemy.y += enemy.vy * dt;
      if (enemy.x < 60 || enemy.x > ancho - 60) enemy.vx *= -1;

      enemy.attackTimer -= dt;
      if (enemy.attackTimer <= 0) {
        enemy.attackTimer = 1.8;
        sonar(sim, 'playEnemyLaser');
        [-0.2, 0, 0.2].forEach((offset) => {
          const a = Math.PI / 2 + offset;
          disparoEnemigo(sim, enemy.x, enemy.y + 16, Math.cos(a) * 360, Math.sin(a) * 360, 22, 2.0);
        });
      }
    } else {
      enemy.x += enemy.vx * dt;
      enemy.y += enemy.vy * dt;
    }

    const distToShip = Math.hypot(sim.shipX - enemy.x, sim.shipY - enemy.y);
    const colRad = enemy.type === 'dreadnought_boss' ? 70 : 28;
    if (distToShip < colRad && !sim.isDying) {
      aplicarDanio(sim, 35, enemy.x, enemy.y, 'damage', rng);
      if (enemy.type !== 'dreadnought_boss') {
        sim.enemies.splice(eIdx, 1);
        sonar(sim, 'playExplosion', true);
        continue;
      }
    }

    if (enemy.y > alto + 70 && enemy.type !== 'dreadnought_boss') sim.enemies.splice(eIdx, 1);
  }
}

export function actualizarOrbita(sim, entrada, dt, config, rng, dims) {
  const { ancho, alto } = dims;

  // 1. Ascenso y estrellas.
  sim.altitude += sim.scrollSpeed * dt;
  const altitude = Math.min(sim.targetAltitude, sim.altitude);
  for (const s of sim.stars) {
    s.y += s.speed * dt;
    if (s.y > alto) {
      s.y = -10;
      s.x = rng() * ancho;
    }
  }

  const sector = SECTORES.find((s) => altitude >= s.desde);
  if (sector.numero !== sim.sector) {
    sim.sector = sector.numero;
    sim.sectorName = sector.nombre;
    sonar(sim, 'playBannerImpact');
    sonar(sim, 'playPowerupChime');
    const color = sector.numero === 5 ? PALETA_PIXEL.P15 : sector.numero === 3 ? PALETA_PIXEL.P13 : TOKENS_HUD.tealGlow;
    mostrarBanner(sim, sector.nombre, sector.aviso, color, 2.6, true);
  }

  // 2. Movimiento del shmup.
  let moveX = 0;
  let moveY = 0;
  if (entrada.left) moveX -= 1;
  if (entrada.right) moveX += 1;
  if (entrada.up) moveY -= 1;
  if (entrada.down) moveY += 1;
  if (sim.touchDir.active) {
    moveX += sim.touchDir.x;
    moveY += sim.touchDir.y;
  }

  const shmupSpeed = 440;
  sim.shipVx = moveX * shmupSpeed;
  sim.shipVy = moveY * shmupSpeed;
  sim.shipX = clamp(sim.shipX + sim.shipVx * dt, 50, ancho - 50);
  sim.shipY = clamp(sim.shipY + sim.shipVy * dt, alto * 0.35, alto - 45);
  sim.shipRoll = moveX * 0.45;
  sim.shipAngle = -Math.PI / 2;

  // 3. Canones de plasma de 2, 3 o 4 tiros segun el nivel.
  if (sim.shipWeaponCooldown > 0) sim.shipWeaponCooldown -= dt;
  if (sim.shipMissileCooldown > 0) sim.shipMissileCooldown -= dt;

  const isFiring = entrada.confirm || entrada.tap || entrada.pointerDown || sim.touchShoot;
  if (isFiring && sim.shipWeaponCooldown <= 0) {
    sim.shipWeaponCooldown = sim.weaponPowerLevel >= 3 ? 0.08 : sim.weaponPowerLevel >= 2 ? 0.1 : 0.12;
    sim.screenShake = ANIM.shake.leve;
    sonar(sim, 'playArcadeLaser', sim.weaponPowerLevel);
    const canon = (offset, vx, vy, damage) =>
      sim.bullets.push({ x: sim.shipX + offset, y: sim.shipY - (sim.weaponPowerLevel === 1 ? 26 : 28), vx, vy, type: 'ship_cannon', damage, life: 1.1, maxLife: 1.1 });

    if (sim.weaponPowerLevel === 1) {
      [-22, 22].forEach((o) => canon(o, 0, -920, 35));
    } else if (sim.weaponPowerLevel === 2) {
      [-24, 0, 24].forEach((o, idx) => canon(o, (idx - 1) * 120, -940, 38));
    } else {
      [-28, -10, 10, 28].forEach((o, idx) => canon(o, (idx - 1.5) * 80, -980, 46));
    }
  }

  // 4. Asteroides y minas del sector 3.
  if (sim.sector === 3 && sim.obstacles.length < 8 && rng() < 0.04) {
    const ox = 40 + rng() * (ancho - 80);
    const isMine = rng() < 0.35;
    sim.obstacles.push({
      id: sim.nextObstacleId++,
      type: isMine ? 'space_mine' : 'asteroid',
      x: ox,
      y: -40,
      radius: isMine ? 18 : 22 + rng() * 16,
      hp: isMine ? 30 : 65,
      maxHp: isMine ? 30 : 65,
      rot: rng() * Math.PI * 2,
      vRot: (rng() * 2 - 1) * 2,
      vx: (rng() * 2 - 1) * 35,
      vy: 120 + rng() * 90,
    });
  }

  for (let oIdx = sim.obstacles.length - 1; oIdx >= 0; oIdx--) {
    const obs = sim.obstacles[oIdx];
    obs.x += obs.vx * dt;
    obs.y += obs.vy * dt;
    obs.rot += obs.vRot * dt;

    const distToShip = Math.hypot(sim.shipX - obs.x, sim.shipY - obs.y);
    if (distToShip < obs.radius + 24 && !sim.isDying) {
      aplicarDanio(sim, obs.type === 'space_mine' ? 45 : 30, obs.x, obs.y, 'damage', rng);
      sonar(sim, 'playExplosion', true);
      sim.obstacles.splice(oIdx, 1);
      continue;
    }
    if (obs.y > alto + 50) sim.obstacles.splice(oIdx, 1);
  }

  // 5. Oleadas y jefe.
  sim.enemySpawnTimer -= dt;
  sim.wavePatternTimer += dt;

  if (sim.sector === 5 && !sim.bossSpawned && altitude >= 8800) {
    sim.bossSpawned = true;
    sim.bossActive = true;
    sonar(sim, 'playBannerImpact');
    sonar(sim, 'playGalagaDive');
    enemigo(sim, {
      type: 'dreadnought_boss',
      x: ancho / 2,
      y: -120,
      vx: 0,
      vy: 80,
      hp: 650,
      maxHp: 650,
      attackTimer: 1.5,
      stateTimer: 3.0,
      state: 'boss_phase1',
    });
    mostrarBanner(sim, 'TITAN SENTINEL DREADNOUGHT', 'DEFEAT TO CLEAR DOCKING VECTOR', PALETA_PIXEL.P15, 3.0, true);
  }

  if (sim.enemySpawnTimer <= 0 && (!sim.bossActive || sim.enemies.length < 5)) {
    sim.enemySpawnTimer = 1.8 + rng() * 1.2;
    generarOleada(sim, rng, ancho);
  }

  // 6. IA de los enemigos y choques con la nave.
  moverEnemigos(sim, dt, rng, dims);

  // 7. Llegada de la Endurance y acople.
  if (altitude >= sim.targetAltitude && !sim.enduranceDescending) {
    sim.enduranceDescending = true;
    sim.scrollSpeed = 60;
    sonar(sim, 'playBannerImpact');
    sonar(sim, 'playVictoryFanfare');
    mostrarBanner(sim, 'ENDURANCE MOTHERSHIP REACHED', 'APPROACHING DOCKING BAY', '#7ee7f8', 3.0, true);
  }

  if (sim.enduranceDescending && !sim.enduranceDocked) {
    if (sim.enduranceY < 180) sim.enduranceY += 90 * dt;

    const targetDockX = sim.enduranceX;
    const targetDockY = sim.enduranceY + 4;
    const distToDock = Math.hypot(sim.shipX - targetDockX, sim.shipY - targetDockY);

    if (distToDock < 140 || sim.enduranceY >= 170) {
      sim.dockingLerp += dt * 0.8;
      sim.shipX += (targetDockX - sim.shipX) * Math.min(1, 5 * dt);
      sim.shipY += (targetDockY - sim.shipY) * Math.min(1, 5 * dt);

      if (sim.dockingLerp >= 1.0) {
        sim.enduranceDocked = true;
        sim.stage = 'VICTORY_ENDURANCE_DOCKED';
        sonar(sim, 'playDockingLock');
        sim.fin = { estado: 'VICTORY', resultado: resultadoVictoria(sim, config) };
      }
    }
  }
}
