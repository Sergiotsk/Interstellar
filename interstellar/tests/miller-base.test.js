// Caracterizacion de la base de la logica de Miller contra ../mini-juego/App.tsx (feature 011 v2).
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG, ANIM, PALETA_PIXEL, TOKENS_HUD } from '../js/minijuegos/miller/config.js';
import { crearRng } from '../js/minijuegos/miller/logica/azar.js';
import { sonar, onda, textoFlotante, mostrarBanner, avanzarEfectos } from '../js/minijuegos/miller/logica/efectos.js';
import { crearSim } from '../js/minijuegos/miller/logica/estado.js';
import {
  horasTerrestres, textoAnosHud, puntajeEnVivo, puntajeVictoria, puntajeFallo, rangoDe, resultadoVictoria, resultadoFallo,
} from '../js/minijuegos/miller/logica/puntaje.js';
import { aplicarDanio, matarJugador } from '../js/minijuegos/miller/logica/danio.js';
import { abordar, dispararMisil, detonarEmp, cambiarArma } from '../js/minijuegos/miller/logica/nave.js';

const DIMS = { ancho: 960, alto: 540 };
const nueva = (semilla = 7) => crearSim(CONFIG, crearRng(semilla), DIMS);
const sonidos = (sim) => sim.sonidos.map(([m]) => m);

describe('efectos.js — spawnRipple / spawnFloatingText / showBanner', () => {
  test('sonar encola el metodo del sintetizador con sus argumentos', () => {
    const sim = nueva();
    sonar(sim, 'playExplosion', true);
    assert.deepEqual(sim.sonidos.at(-1), ['playExplosion', true]);
  });

  test('onda: valores por defecto del original y tope de 36', () => {
    const sim = nueva();
    onda(sim, 10, 20);
    assert.deepEqual(sim.ripples[0], { x: 10, y: 20, radius: 4, maxRadius: 32, alpha: 0.85, speed: 45, color: 'rgba(158, 194, 207, 0.7)' });
    for (let i = 0; i < 50; i++) onda(sim, i, 0);
    assert.equal(sim.ripples.length, 36);
  });

  test('textoFlotante: vida 0.85, sube mas rapido si es critico, tope de 26', () => {
    const sim = nueva();
    textoFlotante(sim, 1, 2, '26', '#4fd0e0', true);
    assert.deepEqual(sim.floatingTexts[0], { x: 1, y: 2, text: '26', color: '#4fd0e0', life: 0.85, maxLife: 0.85, vy: -55, isCrit: true });
    for (let i = 0; i < 40; i++) textoFlotante(sim, 0, 0, 'x');
    assert.equal(sim.floatingTexts.length, 26);
  });

  test('mostrarBanner: arma el banner y suena el golpe', () => {
    const sim = nueva();
    mostrarBanner(sim, 'HOLA', 'sub');
    assert.deepEqual(sim.banner, { text: 'HOLA', subtext: 'sub', color: TOKENS_HUD.tealGlow, duration: 2.4, timer: 2.4, isBlinking: false });
    assert.ok(sonidos(sim).includes('playBannerImpact'));
  });

  test('avanzarEfectos: marcadores y banner vencen; textos suben y se desvanecen; ondas crecen (R7 a/b)', () => {
    const sim = nueva();
    sim.hitMarkers.push({ x: 0, y: 0, life: 0.1, maxLife: 0.16 });
    mostrarBanner(sim, 'B', '', '#fff', 0.05);
    textoFlotante(sim, 0, 100, 't');
    onda(sim, 0, 0, 32, 45);
    avanzarEfectos(sim, 0.2);
    assert.equal(sim.hitMarkers.length, 0);
    assert.equal(sim.banner, null);
    assert.ok(sim.floatingTexts[0].life < 0.85 && sim.floatingTexts[0].y < 100);
    assert.ok(sim.ripples[0].radius > 4);
    avanzarEfectos(sim, 2);
    assert.equal(sim.floatingTexts.length, 0);
    assert.equal(sim.ripples.length, 0);
  });
});

describe('estado.js — initGame', () => {
  test('estado inicial de la superficie', () => {
    const sim = nueva();
    assert.equal(sim.stage, 'MISSION_1_SURFACE');
    assert.equal(sim.controlMode, 'FOOT');
    assert.equal(sim.phase, 'COUNTDOWN');
    assert.equal(sim.countdownTimer, 2.5);
    assert.deepEqual([sim.playerX, sim.playerY, sim.shipX, sim.shipY], [0, 60, 0, 0]);
    assert.equal(sim.waveDistance, CONFIG.waveInitialDistance);
    assert.equal(sim.waveSpeed, CONFIG.waveSpeedBase);
    assert.equal(sim.waveAngle, Math.PI * 0.72);
    assert.deepEqual([sim.missileStock, sim.bombStock, sim.weaponPowerLevel, sim.shipShield, sim.playerShieldHp], [8, 2, 1, 100, 100]);
    assert.deepEqual([sim.caseX, sim.caseY], [120, -50]);
  });

  test('la baliza queda a 580-720, opuesta a la ola (+-0.25 rad)', () => {
    for (let s = 1; s <= 30; s++) {
      const sim = nueva(s);
      const d = Math.hypot(sim.beaconX, sim.beaconY);
      assert.ok(d >= 579 && d <= 721, `distancia ${d}`);
      let delta = Math.atan2(sim.beaconY, sim.beaconX) - (sim.waveAngle + Math.PI);
      delta = Math.atan2(Math.sin(delta), Math.cos(delta));
      assert.ok(Math.abs(delta) <= 0.2501, `angulo ${delta}`);
    }
  });

  test('restos: el principal junto a la baliza y el resto lejos del origen y de la baliza', () => {
    const sim = nueva(3);
    const [principal, ...resto] = sim.debris;
    assert.deepEqual(principal, { x: sim.beaconX + 24, y: sim.beaconY + 12, radius: 36, isMain: true });
    assert.ok(resto.length <= CONFIG.debrisObstacleCount);
    for (const d of resto) {
      assert.ok(Math.hypot(d.x, d.y) > 120);
      assert.ok(Math.hypot(d.x - sim.beaconX, d.y - sim.beaconY) > 90);
      assert.ok(d.radius >= 16 && d.radius < 26);
    }
  });

  test('90 estrellas y la superficie arranca sin enemigos (R7 c)', () => {
    const sim = nueva();
    assert.equal(sim.stars.length, 90);
    assert.equal(sim.enemies.length, 0);
  });
});

describe('puntaje.js — formulas del original', () => {
  test('dilatacion correcta: 17,045 h/s y el texto del HUD en anos y meses', () => {
    assert.ok(Math.abs(horasTerrestres(1, CONFIG) - 17.045) < 0.001);
    assert.equal(textoAnosHud(0, CONFIG), '0y 0m');
    assert.equal(textoAnosHud(3600, CONFIG), '7y 0m');
  });

  test('puntaje en vivo, de victoria y de fallo', () => {
    const sim = { altitude: 1000, enemiesDestroyed: 2, aerialInterceptorsDowned: 3, elapsedSeconds: 100, caseAssisting: true };
    assert.equal(puntajeEnVivo(sim), 2500 + 400 + 1050);
    assert.equal(puntajeVictoria(sim), 45000 - 2500 + 400 + 1200 + 3000);
    assert.equal(puntajeFallo(sim), 1500 + 300 + 1050);
    assert.equal(puntajeVictoria({ ...sim, elapsedSeconds: 5000, caseAssisting: false, enemiesDestroyed: 0, aerialInterceptorsDowned: 0 }), 1000);
  });

  test('rangos S/A/B/C', () => {
    assert.equal(rangoDe(40000), 'S');
    assert.equal(rangoDe(39999), 'A');
    assert.equal(rangoDe(30000), 'A');
    assert.equal(rangoDe(20000), 'B');
    assert.equal(rangoDe(19999), 'C');
  });

  test('resultados de victoria y de fallo', () => {
    const sim = { altitude: 0, enemiesDestroyed: 0, aerialInterceptorsDowned: 10, elapsedSeconds: 120.7, caseAssisting: false, deathReason: 'wave' };
    const v = resultadoVictoria(sim, CONFIG);
    assert.equal(v.missionTime, 120);
    assert.equal(v.finalScore, puntajeVictoria(sim));
    assert.equal(v.rank, rangoDe(v.finalScore));
    assert.match(v.earthYearsLost, /^\d+\.\d$/);
    const f = resultadoFallo(sim, CONFIG);
    assert.equal(f.rank, 'FAILED');
    assert.equal(f.deathReason, 'wave');
  });
});

describe('danio.js — applyPlayerDamage / triggerPlayerDeath', () => {
  test('a pie: baja el traje, hurt, regeneracion demorada, hit-stop y texto', () => {
    const sim = nueva();
    aplicarDanio(sim, 20);
    assert.equal(sim.playerShieldHp, 80);
    assert.equal(sim.playerShieldRegenDelay, 4.0);
    assert.equal(sim.playerHurtTimer, 0.45);
    assert.equal(sim.hitStopMsRemaining, ANIM.hitStopMs);
    assert.equal(sim.floatingTexts.at(-1).text, '-20 HP');
    assert.ok(sonidos(sim).includes('playPlayerHurt'));
  });

  test('el slide da inmunidad', () => {
    const sim = nueva();
    sim.slideTimer = 0.2;
    aplicarDanio(sim, 50);
    assert.equal(sim.playerShieldHp, 100);
  });

  test('en la nave: primero el escudo, despues el casco', () => {
    const sim = nueva();
    sim.controlMode = 'SHIP';
    aplicarDanio(sim, 30);
    assert.equal(sim.shipShield, 70);
    assert.equal(sim.shipHealth, 100);
    sim.shipShield = 0;
    aplicarDanio(sim, 30);
    assert.equal(sim.shipHealth, 70);
    assert.equal(sim.floatingTexts.at(-1).text, '-30 HULL');
  });

  test('traje en 0: muere con 1.6 s, 36 particulas y el banner de la razon', () => {
    const sim = nueva();
    aplicarDanio(sim, 150, 0, 0, 'wave', crearRng(1));
    assert.equal(sim.isDying, true);
    assert.equal(sim.deathReason, 'wave');
    assert.equal(sim.deathTimer, 1.6);
    assert.equal(sim.particles.length, 36);
    assert.equal(sim.banner.text, '¡ALCANZADO POR LA OLA!');
    assert.ok(sonidos(sim).includes('playPlayerDeath') && sonidos(sim).includes('stopWaveRumble'));
  });

  test('morir dos veces no hace nada la segunda', () => {
    const sim = nueva();
    matarJugador(sim, 'damage', crearRng(1));
    const particulas = sim.particles.length;
    matarJugador(sim, 'wave', crearRng(1));
    assert.equal(sim.particles.length, particulas);
    assert.equal(sim.banner.text, '¡COLAPSO ESTRUCTURAL!');
  });
});

describe('nave.js — abordar, misiles, EMP y armas', () => {
  test('abordar sin baliza: pasa a SHIP y anuncia los sistemas de vuelo', () => {
    const sim = nueva();
    abordar(sim);
    assert.equal(sim.controlMode, 'SHIP');
    assert.equal(sim.stage, 'MISSION_1_SURFACE');
    assert.equal(sim.banner.text, '¡SISTEMAS DE VUELO EN LÍNEA!');
    assert.ok(sonidos(sim).includes('playShipBoard'));
  });

  test('abordar con baliza: arranca la transicion a la fase 2', () => {
    const sim = nueva();
    sim.beaconAcquired = true;
    abordar(sim);
    assert.equal(sim.stage, 'MISSION_TRANSITION');
    assert.equal(sim.transitionTimer, 1.2);
    assert.equal(sim.banner.text, 'FASE 02: ASCENSO ORBITAL HACIA EL ENDURANCE');
    assert.ok(sonidos(sim).includes('playRangerThruster'));
  });

  test('misil: gasta uno, enfria 0.3 y lanza dos teledirigidos al enemigo mas cercano', () => {
    const sim = nueva();
    sim.shipX = 480;
    sim.shipY = 450;
    sim.enemies.push({ id: 9, x: 480, y: 100 }, { id: 10, x: 900, y: 0 });
    dispararMisil(sim);
    assert.equal(sim.missileStock, 7);
    assert.equal(sim.shipMissileCooldown, 0.3);
    const misiles = sim.bullets.filter((b) => b.type === 'homing_missile');
    assert.equal(misiles.length, 2);
    assert.ok(misiles.every((m) => m.targetEnemyId === 9 && m.damage === 90));
    dispararMisil(sim);
    assert.equal(sim.missileStock, 7, 'el enfriamiento bloquea el segundo');
  });

  test('EMP: solo en la fase 2; limpia proyectiles enemigos y pega 220', () => {
    const sim = nueva();
    detonarEmp(sim);
    assert.equal(sim.bombStock, 2);
    sim.stage = 'MISSION_2_ORBITAL_ASCENT';
    sim.enemies.push({ id: 1, x: 0, y: 0, hp: 300, flashTimer: 0 });
    sim.bullets.push({ isEnemy: true }, { isEnemy: false });
    detonarEmp(sim);
    assert.equal(sim.bombStock, 1);
    assert.equal(sim.enemies[0].hp, 80);
    assert.equal(sim.bullets.length, 1);
    assert.equal(sim.empFlashTimer, 0.35);
    assert.equal(sim.banner.text, 'EMP PULSE DETONATED');
  });

  test('cambiarArma cicla pulse -> scatter -> rocket o elige una', () => {
    const sim = nueva();
    cambiarArma(sim);
    assert.equal(sim.equippedWeapon, 'scatter');
    cambiarArma(sim);
    assert.equal(sim.equippedWeapon, 'rocket');
    cambiarArma(sim);
    assert.equal(sim.equippedWeapon, 'pulse');
    cambiarArma(sim, 'rocket');
    assert.equal(sim.equippedWeapon, 'rocket');
  });

  test('la paleta del original esta disponible para los colores del banner', () => {
    assert.equal(PALETA_PIXEL.P13, '#e8803b');
  });
});
