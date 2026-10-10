// Caracterizacion del update() del original (../mini-juego/App.tsx 2989-4103): superficie, orbita, proyectiles y motor.
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/miller/config.js';
import { crearRng } from '../js/minijuegos/miller/logica/azar.js';
import { crearSim } from '../js/minijuegos/miller/logica/estado.js';
import { actualizarSuperficie } from '../js/minijuegos/miller/logica/superficie.js';
import { actualizarTransicion, actualizarOrbita } from '../js/minijuegos/miller/logica/orbita.js';
import { actualizarProyectiles, actualizarCaidas } from '../js/minijuegos/miller/logica/proyectiles.js';
import { actualizar } from '../js/minijuegos/miller/logica/motor.js';

const DT = 1 / 60;
const DIMS = { ancho: 960, alto: 540 };
const QUIETO = { left: false, right: false, up: false, down: false, confirm: false, tap: false, pointerDown: false };
const con = (cambios) => ({ ...QUIETO, ...cambios });
const rng = () => crearRng(11);
const fijo = (v) => () => v;
const nueva = () => {
  const sim = crearSim(CONFIG, crearRng(5), DIMS);
  sim.phase = 'EXPLORATION';
  return sim;
};
const enOrbita = () => {
  const sim = nueva();
  Object.assign(sim, { stage: 'MISSION_2_ORBITAL_ASCENT', controlMode: 'SHIP', shipX: 480, shipY: 455, enemies: [], enemySpawnTimer: 99 });
  return sim;
};
const sonidos = (sim) => sim.sonidos.map(([m]) => m);
const superficie = (sim, entrada, segundos, r = rng()) => {
  let fin;
  for (let i = 0; i < Math.round(segundos / DT); i++) {
    sim.elapsedSeconds += DT;
    fin = actualizarSuperficie(sim, entrada, DT, CONFIG, r);
    if (fin) break;
  }
  return fin;
};
const orbita = (sim, entrada, segundos, r = rng()) => {
  for (let i = 0; i < Math.round(segundos / DT) && !sim.fin; i++) {
    sim.elapsedSeconds += DT;
    actualizarOrbita(sim, entrada, DT, CONFIG, r, DIMS);
  }
};

describe('superficie.js — Fase 1 a pie', () => {
  test('acelera con arrastre hasta la velocidad maxima (260) y mira a la derecha', () => {
    const sim = nueva();
    superficie(sim, con({ right: true }), 2);
    assert.ok(Math.abs(sim.playerVx - CONFIG.playerBaseSpeed) < 1, `vx ${sim.playerVx}`);
    assert.equal(sim.playerFacing, 1);
    assert.equal(sim.state, 'run');
  });

  test('al soltar el agua lo frena', () => {
    const sim = nueva();
    superficie(sim, con({ right: true }), 1);
    superficie(sim, QUIETO, 1);
    assert.ok(Math.abs(sim.playerVx) < 10);
    assert.equal(sim.state, 'idle');
  });

  test('con el impulso de CASE el tope sube a 370', () => {
    const sim = nueva();
    sim.caseBoostTimer = 5;
    superficie(sim, con({ left: true }), 1.5);
    assert.ok(Math.abs(sim.playerVx + CONFIG.playerSprintSpeed) < 1);
    assert.equal(sim.playerFacing, -1);
  });

  test('salto con gravedad: despega a 350 y vuelve a apoyar con onda', () => {
    const sim = nueva();
    sim.touchJump = true;
    superficie(sim, QUIETO, DT);
    assert.equal(sim.isGrounded, false);
    assert.ok(sim.playerVz > 300);
    assert.ok(sonidos(sim).includes('playJumpSwoosh'));
    superficie(sim, QUIETO, 1);
    assert.equal(sim.isGrounded, true);
    assert.equal(sim.playerZ, 0);
  });

  test('slide: 0.32 s a 460 con enfriamiento de 0.7', () => {
    const sim = nueva();
    sim.touchSlide = true;
    superficie(sim, QUIETO, DT);
    assert.equal(sim.state, 'slide');
    assert.equal(sim.slideCooldown, 0.7);
    assert.ok(sim.playerVx > 400);
    sim.touchSlide = true;
    superficie(sim, QUIETO, DT);
    assert.ok(sim.slideTimer < 0.32, 'durante el enfriamiento no se repite');
  });

  test('carabina de pulso: dispara en la direccion de apuntado con enfriamiento 0.12', () => {
    const sim = nueva();
    superficie(sim, con({ tap: true }), DT);
    const [b] = sim.bullets;
    assert.equal(b.type, 'pulse');
    assert.equal(b.damage, 26);
    assert.ok(Math.abs(Math.hypot(b.vx, b.vy) - 880) < 1e-6);
    assert.equal(sim.fireCooldown, 0.12);
    assert.ok(sonidos(sim).includes('playArcadeLaser') || sonidos(sim).includes('playPulseCarbine'));
    superficie(sim, con({ tap: true }), DT);
    assert.equal(sim.bullets.length, 1, 'el enfriamiento frena el segundo disparo');
  });

  test('autoapuntado: si hay un blanco cerca de la mira la fija sobre el', () => {
    const sim = nueva();
    sim.enemies.push({ id: 5, x: sim.playerX + 2 + 150, y: sim.playerY - 6 + 10, z: 0 });
    superficie(sim, QUIETO, DT);
    assert.equal(sim.hasTargetLock, true);
    assert.equal(sim.lockedEnemyId, 5);
    assert.equal(sim.crosshairX, sim.enemies[0].x);
  });

  test('sonar de la baliza segun la distancia', () => {
    const sim = nueva();
    superficie(sim, QUIETO, 2);
    assert.ok(sonidos(sim).includes('playBeaconSonar'));
  });

  test('recoger la baliza: RETRIEVED, ola a 115 y banner naranja', () => {
    const sim = nueva();
    sim.playerX = sim.beaconX;
    sim.playerY = sim.beaconY + 40;
    superficie(sim, QUIETO, DT);
    assert.equal(sim.beaconAcquired, true);
    assert.equal(sim.phase, 'RETRIEVED');
    assert.equal(sim.waveSpeed, CONFIG.waveSpeedFlight);
    assert.equal(sim.banner.text, '¡BALIZA DE MILLER RECUPERADA!');
    assert.ok(sonidos(sim).includes('playBeaconAcquired'));
  });

  test('CASE asiste a 62: impulso de 2.5 s y despues sigue al jugador', () => {
    const sim = nueva();
    sim.playerX = sim.caseX;
    sim.playerY = sim.caseY + 30;
    superficie(sim, QUIETO, DT);
    assert.equal(sim.caseAssisting, true);
    assert.ok(sim.caseBoostTimer > 2.4);
    assert.ok(sonidos(sim).includes('playCaseBoost'));
    const antes = { x: sim.caseX, y: sim.caseY };
    sim.playerX += 300;
    superficie(sim, QUIETO, 0.5);
    assert.ok(sim.caseX > antes.x, 'CASE va detras del jugador');
  });

  test('aviso de abordaje a 120 del Ranger', () => {
    const sim = nueva();
    superficie(sim, QUIETO, DT);
    assert.equal(sim.shipBoardPrompt, true);
    sim.playerX = 500;
    superficie(sim, QUIETO, DT);
    assert.equal(sim.shipBoardPrompt, false);
  });

  test('la ola avanza y mata cuando supera al jugador por 30', () => {
    const sim = nueva();
    const dir = { x: Math.cos(sim.waveAngle), y: Math.sin(sim.waveAngle) };
    const proyeccion = sim.playerX * dir.x + sim.playerY * dir.y;
    sim.waveDistance = proyeccion - 29;
    const fin = superficie(sim, QUIETO, 0.5);
    assert.equal(fin, 'muerto');
    assert.equal(sim.isDying, true);
    assert.equal(sim.deathReason, 'wave');
    assert.ok(sonidos(sim).includes('updateWaveRumble'));
  });
});

describe('orbita.js — transicion y Fase 2', () => {
  test('la transicion lleva el Ranger abajo al centro y arranca la fase 2 limpia', () => {
    const sim = nueva();
    Object.assign(sim, { stage: 'MISSION_TRANSITION', controlMode: 'SHIP', transitionTimer: 1.2 });
    sim.enemies.push({ id: 1 });
    for (let i = 0; i < 80 && sim.stage === 'MISSION_TRANSITION'; i++) actualizarTransicion(sim, DT, rng(), DIMS);
    assert.equal(sim.stage, 'MISSION_2_ORBITAL_ASCENT');
    assert.deepEqual([sim.shipX, sim.shipY], [480, 455]);
    assert.equal(sim.enemies.length, 0);
    assert.equal(sim.enemySpawnTimer, 0.6);
    assert.ok(sonidos(sim).includes('playTargetLock') && sonidos(sim).includes('playGalagaDive'));
  });

  test('asciende a 280 m/s y cambia de sector con banner', () => {
    const sim = enOrbita();
    sim.altitude = 1999;
    orbita(sim, QUIETO, 0.1);
    assert.equal(sim.sector, 2);
    assert.equal(sim.banner.text, 'SECTOR 2: STRATOSPHERIC FIGHTERS');
  });

  test('se mueve a 440 dentro de los limites del shmup', () => {
    const sim = enOrbita();
    orbita(sim, con({ left: true }), 0.5);
    assert.ok(Math.abs(sim.shipX - (480 - 220)) < 1);
    assert.ok(sim.shipRoll < 0);
    orbita(sim, con({ left: true, up: true }), 3);
    assert.equal(sim.shipX, 50);
    assert.equal(sim.shipY, 540 * 0.35);
  });

  test('cañon de 2, 3 o 4 disparos segun el nivel', () => {
    for (const [nivel, cantidad, enfriamiento] of [[1, 2, 0.12], [2, 3, 0.1], [3, 4, 0.08]]) {
      const sim = enOrbita();
      sim.weaponPowerLevel = nivel;
      orbita(sim, con({ confirm: true }), DT);
      assert.equal(sim.bullets.filter((b) => b.type === 'ship_cannon').length, cantidad);
      assert.equal(sim.shipWeaponCooldown, enfriamiento);
    }
  });

  test('asteroides y minas solo en el sector 3', () => {
    const sim = enOrbita();
    orbita(sim, QUIETO, DT, fijo(0.01));
    assert.equal(sim.obstacles.length, 0);
    sim.altitude = 4300;
    orbita(sim, QUIETO, DT, fijo(0.01));
    assert.equal(sim.sector, 3);
    assert.equal(sim.obstacles.length, 1);
  });

  test('el Dreadnought aparece una sola vez a 8800 m', () => {
    const sim = enOrbita();
    sim.altitude = 8795;
    orbita(sim, QUIETO, 0.1);
    const jefes = sim.enemies.filter((e) => e.type === 'dreadnought_boss');
    assert.equal(jefes.length, 1);
    assert.equal(jefes[0].hp, 650);
    assert.equal(sim.bossActive, true);
    orbita(sim, QUIETO, 0.5);
    assert.equal(sim.enemies.filter((e) => e.type === 'dreadnought_boss').length, 1);
  });

  test('escuadron Galaga de 3 al vencer el spawner', () => {
    const sim = enOrbita();
    sim.enemySpawnTimer = 0;
    orbita(sim, QUIETO, DT, fijo(0.1));
    assert.equal(sim.enemies.filter((e) => e.type === 'galaga_striker').length, 3);
  });

  test('chocar un enemigo daña 35 y lo destruye', () => {
    const sim = enOrbita();
    sim.enemies.push({ id: 7, type: 'scout_drone', x: 480, y: 455, vx: 0, vy: 0, hp: 30, maxHp: 30, attackTimer: 9, flashTimer: 0 });
    orbita(sim, QUIETO, DT);
    assert.equal(sim.shipShield, 65);
    assert.equal(sim.enemies.length, 0);
  });

  test('a 10.000 m baja la Endurance, atrae al Ranger y termina en VICTORY', () => {
    const sim = enOrbita();
    sim.altitude = 10000;
    orbita(sim, QUIETO, 12);
    assert.equal(sim.enduranceDescending, true);
    assert.equal(sim.stage, 'VICTORY_ENDURANCE_DOCKED');
    assert.equal(sim.fin.estado, 'VICTORY');
    assert.ok(sim.fin.resultado.finalScore >= 1000);
    assert.ok(sonidos(sim).includes('playDockingLock'));
  });
});

describe('proyectiles.js — impactos y caidas', () => {
  test('un impacto saca vida, deja marcador, texto y suma combo', () => {
    const sim = enOrbita();
    sim.enemies.push({ id: 3, type: 'armored_gunship', x: 300, y: 200, vx: 0, vy: 0, hp: 140, maxHp: 140, flashTimer: 0 });
    sim.bullets.push({ x: 300, y: 200, vx: 0, vy: 0, type: 'ship_cannon', damage: 35, life: 1, maxLife: 1 });
    actualizarProyectiles(sim, DT, fijo(0.9), DIMS);
    assert.equal(sim.enemies[0].hp, 105);
    assert.equal(sim.hitMarkers.length, 1);
    assert.equal(sim.floatingTexts.at(-1).text, '35');
    assert.equal(sim.combo, 1);
    assert.equal(sim.comboTimer, 2.4);
  });

  test('critico: 1.5 veces el daño', () => {
    const sim = enOrbita();
    sim.enemies.push({ id: 3, type: 'armored_gunship', x: 300, y: 200, hp: 140, maxHp: 140, flashTimer: 0 });
    sim.bullets.push({ x: 300, y: 200, vx: 0, vy: 0, type: 'ship_cannon', damage: 30, life: 1, maxLife: 1 });
    actualizarProyectiles(sim, DT, fijo(0.1), DIMS);
    assert.equal(sim.enemies[0].hp, 95);
  });

  test('un dron de carga muerto siempre suelta una mejora', () => {
    const sim = enOrbita();
    sim.enemies.push({ id: 4, type: 'cargo_drone', x: 300, y: 200, hp: 10, maxHp: 40, flashTimer: 0 });
    sim.bullets.push({ x: 300, y: 200, vx: 0, vy: 0, type: 'ship_cannon', damage: 35, life: 1, maxLife: 1 });
    actualizarProyectiles(sim, DT, fijo(0.9), DIMS);
    assert.equal(sim.enemies.length, 0);
    assert.equal(sim.aerialInterceptorsDowned, 1);
    assert.equal(sim.drops.length, 1);
    assert.ok(['weapon_upgrade', 'emp_bomb'].includes(sim.drops[0].type));
  });

  test('el Dreadnought muerto suma 5 y anuncia el camino a la Endurance', () => {
    const sim = enOrbita();
    sim.bossActive = true;
    sim.enemies.push({ id: 9, type: 'dreadnought_boss', x: 480, y: 110, hp: 20, maxHp: 650, flashTimer: 0 });
    sim.bullets.push({ x: 480, y: 110, vx: 0, vy: 0, type: 'homing_missile', damage: 90, life: 1, maxLife: 1 });
    actualizarProyectiles(sim, DT, fijo(0.5), DIMS);
    assert.equal(sim.bossActive, false);
    assert.equal(sim.aerialInterceptorsDowned, 5);
    assert.equal(sim.banner.text, 'DREADNOUGHT DESTROYED!');
    assert.equal(sim.particles.length, 45);
  });

  test('un proyectil enemigo daña la nave', () => {
    const sim = enOrbita();
    sim.bullets.push({ x: 480, y: 455, vx: 0, vy: 0, type: 'drone_plasma', damage: 20, life: 1, maxLife: 1, isEnemy: true });
    actualizarProyectiles(sim, DT, rng(), DIMS);
    assert.equal(sim.shipShield, 80);
    assert.equal(sim.bullets.length, 0);
  });

  test('el misil persigue a su blanco', () => {
    const sim = enOrbita();
    sim.enemies.push({ id: 2, type: 'scout_drone', x: 800, y: 100, hp: 30, maxHp: 30, flashTimer: 0 });
    sim.bullets.push({ x: 480, y: 400, vx: 0, vy: -620, type: 'homing_missile', damage: 90, life: 2, maxLife: 2, targetEnemyId: 2 });
    actualizarProyectiles(sim, 0.1, rng(), DIMS);
    assert.ok(sim.bullets[0].vx > 0, 'giro hacia la derecha');
  });

  test('caidas: se recogen a 42 con su efecto y bajan en la fase 2', () => {
    const sim = enOrbita();
    const caida = (type) => ({ id: 1, type, x: 480, y: 455, z: 0, vz: 0, life: 14 });
    sim.drops.push(caida('weapon_upgrade'));
    actualizarCaidas(sim, DT, DIMS);
    assert.equal(sim.weaponPowerLevel, 2);
    sim.drops.push(caida('emp_bomb'), caida('missile_pod'));
    actualizarCaidas(sim, DT, DIMS);
    assert.equal(sim.bombStock, 3);
    assert.equal(sim.missileStock, 12);
    sim.shipShield = 10;
    sim.drops.push(caida('energy_cell'));
    actualizarCaidas(sim, DT, DIMS);
    assert.equal(sim.shipShield, 50);
    sim.drops.push({ ...caida('energy_cell'), x: 100, y: 100 });
    actualizarCaidas(sim, 1, DIMS);
    assert.equal(sim.drops[0].y, 185);
  });
});

describe('motor.js — update completo', () => {
  test('el hit-stop congela el paso', () => {
    const sim = nueva();
    sim.hitStopMsRemaining = 50;
    actualizar(sim, QUIETO, DT, CONFIG, rng(), DIMS);
    assert.equal(sim.elapsedSeconds, 0);
    assert.ok(sim.hitStopMsRemaining < 50);
  });

  test('la cuenta de 2.5 s pasa a EXPLORATION con el banner de la fase 01', () => {
    const sim = crearSim(CONFIG, crearRng(5), DIMS);
    for (let i = 0; i < 160; i++) actualizar(sim, QUIETO, DT, CONFIG, rng(), DIMS);
    assert.equal(sim.phase, 'EXPLORATION');
    assert.equal(sim.banner.text, 'FASE 01 // EXPLORACIÓN DE SUPERFICIE');
  });

  test('el tiempo de mision corre y el traje se regenera tras la demora', () => {
    const sim = nueva();
    sim.playerShieldHp = 50;
    sim.playerShieldRegenDelay = 0;
    for (let i = 0; i < 60; i++) actualizar(sim, QUIETO, DT, CONFIG, rng(), DIMS);
    assert.ok(Math.abs(sim.elapsedSeconds - 1) < 1e-6);
    assert.ok(Math.abs(sim.playerShieldHp - 60) < 0.01);
  });

  test('la muerte termina en GAME_OVER con el resultado de fallo', () => {
    const sim = nueva();
    sim.isDying = true;
    sim.deathReason = 'wave';
    sim.deathTimer = 0.1;
    for (let i = 0; i < 10; i++) actualizar(sim, QUIETO, DT, CONFIG, rng(), DIMS);
    assert.equal(sim.phase, 'FAILED');
    assert.equal(sim.fin.estado, 'GAME_OVER');
    assert.equal(sim.fin.resultado.rank, 'FAILED');
    assert.ok(sonidos(sim).includes('playDefeatMotif'));
  });

  test('la camara sigue al jugador a pie y queda centrada en la fase 2', () => {
    const sim = nueva();
    sim.playerX = 400;
    for (let i = 0; i < 120; i++) actualizar(sim, QUIETO, DT, CONFIG, rng(), DIMS);
    assert.ok(Math.abs(sim.camX - 450) < 5);
    const orb = enOrbita();
    actualizar(orb, QUIETO, DT, CONFIG, rng(), DIMS);
    assert.deepEqual([orb.camX, orb.camY], [480, 270]);
  });

  test('el combo vence a los 2.4 s y las particulas mueren', () => {
    const sim = nueva();
    sim.combo = 5;
    sim.comboTimer = 0.1;
    sim.particles.push({ x: 0, y: 0, vx: 10, vy: 0, life: 0.05, maxLife: 1, color: '#fff', size: 2 });
    for (let i = 0; i < 12; i++) actualizar(sim, QUIETO, DT, CONFIG, rng(), DIMS);
    assert.equal(sim.combo, 0);
    assert.equal(sim.particles.length, 0);
  });
});
