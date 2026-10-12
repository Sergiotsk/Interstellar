// Fase 1 con 3 cargas (baliza, caja negra, muestra): se llevan de a una hasta el Ranger y cada carga hace retroceder la ola.
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/miller/config.js';
import { crearRng } from '../js/minijuegos/miller/logica/azar.js';
import { crearSim } from '../js/minijuegos/miller/logica/estado.js';
import { abordar } from '../js/minijuegos/miller/logica/nave.js';
import { esFauna } from '../js/minijuegos/miller/logica/fauna.js';
import { actualizarSuperficie } from '../js/minijuegos/miller/logica/superficie.js';

const DT = 1 / 60;
const DIMS = { ancho: 960, alto: 540 };
const C = CONFIG.carga;
const QUIETO = { left: false, right: false, up: false, down: false, confirm: false, tap: false, pointerDown: false };
const nueva = (semilla = 2) => Object.assign(crearSim(CONFIG, crearRng(semilla), DIMS), { phase: 'EXPLORATION' });
const paso = (sim, entrada = QUIETO, r = crearRng(5)) => actualizarSuperficie(sim, entrada, DT, CONFIG, r);
const carga = (sim, tipo) => sim.cargas.find((c) => c.tipo === tipo);
const pararEn = (sim, x, y) => Object.assign(sim, { playerX: x, playerY: y, playerVx: 0, playerVy: 0 });
const irA = (sim, tipo) => {
  const c = carga(sim, tipo);
  pararEn(sim, c.x, c.y + 20);
  paso(sim);
};
const alRanger = (sim) => {
  pararEn(sim, sim.shipX + 30, sim.shipY);
  paso(sim);
};

describe('carga.js — las 3 cargas en el mapa', () => {
  test('baliza, caja negra y muestra en el suelo; la baliza donde siempre', () => {
    const sim = nueva();
    assert.deepEqual(sim.cargas.map((c) => c.tipo), ['baliza', 'caja_negra', 'muestra']);
    assert.ok(sim.cargas.every((c) => c.estado === 'suelo'));
    assert.deepEqual([carga(sim, 'baliza').x, carga(sim, 'baliza').y], [sim.beaconX, sim.beaconY]);
    assert.equal(sim.cargando, null);
    assert.equal(sim.cargasCargadas, 0);
    assert.equal(sim.huida, false);
  });

  test('los extras quedan lejos, del lado contrario a la ola y en direcciones distintas', () => {
    for (let semilla = 1; semilla < 30; semilla++) {
      const sim = nueva(semilla);
      const dirX = Math.cos(sim.waveAngle);
      const dirY = Math.sin(sim.waveAngle);
      const extras = sim.cargas.filter((c) => c.tipo !== 'baliza');
      for (const c of extras) {
        const d = Math.hypot(c.x, c.y);
        assert.ok(d >= C.distanciaExtra[0] - 1 && d <= C.distanciaExtra[1] + 1, `distancia ${d}`);
        assert.ok(c.x * dirX + c.y * dirY < 0, 'del lado contrario a la ola');
      }
      const [a, b] = extras.map((c) => Math.atan2(c.y, c.x));
      assert.ok(Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b))) > 1, 'direcciones distintas');
    }
  });

  test('ningun escombro tapa una carga', () => {
    for (let semilla = 1; semilla < 30; semilla++) {
      const sim = nueva(semilla);
      for (const c of sim.cargas) assert.ok(sim.debris.every((d) => d.isMain || Math.hypot(d.x - c.x, d.y - c.y) > 90));
    }
  });
});

describe('carga.js — recoger y cargar de a una', () => {
  test('la primera recogida activa la huida y trae una emboscada', () => {
    const sim = nueva();
    irA(sim, 'baliza');
    assert.equal(sim.cargando, 'baliza');
    assert.equal(carga(sim, 'baliza').estado, 'llevando');
    assert.equal(sim.huida, true);
    assert.equal(sim.waveSpeed, CONFIG.waveSpeedFlight);
    assert.equal(sim.beaconAcquired, false);
    assert.equal(sim.enemies.filter(esFauna).length, CONFIG.fauna.huida.emboscada);
  });

  test('llevando una no se puede levantar otra', () => {
    const sim = nueva();
    irA(sim, 'baliza');
    irA(sim, 'caja_negra');
    assert.equal(sim.cargando, 'baliza');
    assert.equal(carga(sim, 'caja_negra').estado, 'suelo');
  });

  test('al llegar al Ranger se carga sola y la ola retrocede', () => {
    const sim = nueva();
    irA(sim, 'baliza');
    const ola = sim.waveDistance;
    alRanger(sim);
    assert.equal(carga(sim, 'baliza').estado, 'cargada');
    assert.equal(sim.cargando, null);
    assert.equal(sim.cargasCargadas, 1);
    assert.ok(Math.abs(sim.waveDistance - (ola + C.retrasoOla - sim.waveSpeed * DT)) < 1e-6);
  });

  test('cada recogida trae otra emboscada', () => {
    const sim = nueva();
    irA(sim, 'baliza');
    alRanger(sim);
    sim.enemies = [];
    irA(sim, 'caja_negra');
    assert.equal(sim.enemies.filter(esFauna).length, CONFIG.fauna.huida.emboscada);
  });

  test('con 2 de 3 el Ranger no despega; con 3 de 3 la carga esta completa y despega', () => {
    const sim = nueva();
    for (const tipo of ['baliza', 'caja_negra']) {
      irA(sim, tipo);
      alRanger(sim);
    }
    assert.equal(sim.beaconAcquired, false);
    abordar(sim);
    assert.equal(sim.stage, 'MISSION_1_SURFACE');
    assert.equal(sim.controlMode, 'FOOT');

    irA(sim, 'muestra');
    alRanger(sim);
    assert.equal(sim.cargasCargadas, 3);
    assert.equal(sim.beaconAcquired, true);
    abordar(sim);
    assert.equal(sim.stage, 'MISSION_TRANSITION');
  });

  test('llevar una carga baja la velocidad maxima', () => {
    const velocidad = (llevando) => {
      const sim = nueva();
      if (llevando) irA(sim, 'baliza');
      pararEn(sim, -2000, -2000);
      for (let i = 0; i < 90; i++) paso(sim, { ...QUIETO, right: true });
      return Math.hypot(sim.playerVx, sim.playerVy);
    };
    const libre = velocidad(false);
    const cargado = velocidad(true);
    assert.ok(Math.abs(cargado - libre * C.factorVelocidad) < 1, `libre ${libre} cargado ${cargado}`);
  });
});
