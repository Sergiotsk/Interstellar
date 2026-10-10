// Abordaje sin baliza (bug del original que impedia despegar) y la presion de la huida con la baliza.
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/miller/config.js';
import { crearRng } from '../js/minijuegos/miller/logica/azar.js';
import { crearSim } from '../js/minijuegos/miller/logica/estado.js';
import { abordar } from '../js/minijuegos/miller/logica/nave.js';
import { generarFauna, emboscada, esFauna } from '../js/minijuegos/miller/logica/fauna.js';
import { actualizarSuperficie } from '../js/minijuegos/miller/logica/superficie.js';

const DIMS = { ancho: 960, alto: 540 };
const QUIETO = { left: false, right: false, up: false, down: false, confirm: false, tap: false, pointerDown: false };
const nueva = () => Object.assign(crearSim(CONFIG, crearRng(2), DIMS), { phase: 'EXPLORATION' });
const sonidos = (sim) => sim.sonidos.map(([m]) => m);

describe('nave.js — abordar en la superficie', () => {
  test('sin la baliza el Ranger no despega ni cambia de modo, y avisa que falta', () => {
    const sim = nueva();
    abordar(sim);
    assert.equal(sim.controlMode, 'FOOT');
    assert.equal(sim.stage, 'MISSION_1_SURFACE');
    assert.equal(sim.banner.text, 'BALIZA NO RECUPERADA');
    assert.ok(sonidos(sim).includes('playErrorBuzz'));
  });

  test('intentar antes y volver con la baliza: despega (antes quedaba trabado)', () => {
    const sim = nueva();
    abordar(sim);
    sim.beaconAcquired = true;
    abordar(sim);
    assert.equal(sim.stage, 'MISSION_TRANSITION');
    assert.equal(sim.controlMode, 'SHIP');
  });
});

describe('fauna.js — la huida con la baliza', () => {
  test('al recoger la baliza hay una emboscada alrededor del jugador', () => {
    const sim = nueva();
    sim.playerX = sim.beaconX;
    sim.playerY = sim.beaconY + 30;
    actualizarSuperficie(sim, QUIETO, 1 / 60, CONFIG, crearRng(5));
    assert.equal(sim.beaconAcquired, true);
    assert.equal(sim.enemies.filter(esFauna).length, CONFIG.fauna.huida.emboscada);
  });

  test('la emboscada no pasa el tope de la huida', () => {
    const sim = nueva();
    for (let i = 0; i < 5; i++) emboscada(sim, CONFIG, crearRng(i));
    assert.equal(sim.enemies.filter(esFauna).length, CONFIG.fauna.huida.maxVivos);
  });

  test('con la baliza el tope de enemigos vivos es mayor', () => {
    const sim = nueva();
    Object.assign(sim, { elapsedSeconds: 100, beaconAcquired: true });
    for (let i = 0; i < 60; i++) {
      sim.faunaTimer = 0;
      generarFauna(sim, 1 / 60, CONFIG, crearRng(i));
    }
    assert.equal(sim.enemies.filter(esFauna).length, CONFIG.fauna.huida.maxVivos);
    assert.ok(CONFIG.fauna.huida.maxVivos > CONFIG.fauna.maxVivos);
  });
});
