import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/miller/config.js';
import { crearRng } from '../js/minijuegos/miller/logica/azar.js';
import { crearSim } from '../js/minijuegos/miller/logica/estado.js';
import { crearDron, crearAlimana } from '../js/minijuegos/miller/logica/fauna.js';
import { contactosRadar } from '../js/minijuegos/miller/logica/radar.js';

const R = CONFIG.radar;
const sim = (cambios = {}) => Object.assign(crearSim(CONFIG, crearRng(1), { ancho: 960, alto: 540 }), { phase: 'EXPLORATION' }, cambios);
const de = (r, tipo) => r.contactos.filter((c) => c.tipo === tipo);

describe('miller/logica/radar.js — radar tactico', () => {
  test('superficie: centrado en el jugador, con el Ranger en su lugar', () => {
    const s = sim({ playerX: 0, playerY: 60 });
    const [ranger] = de(contactosRadar(s, CONFIG), 'ranger');
    const escala = R.radio / R.alcanceSuperficie;
    assert.ok(Math.abs(ranger.x - 0) < 1e-9);
    assert.ok(Math.abs(ranger.y - -60 * escala) < 1e-9);
    assert.equal(ranger.fuera, false);
  });

  test('la baliza fuera de alcance queda en el borde marcando la direccion', () => {
    const s = sim({ playerX: 0, playerY: 0, beaconX: 3000, beaconY: 0 });
    const [baliza] = de(contactosRadar(s, CONFIG), 'baliza');
    assert.equal(baliza.fuera, true);
    assert.ok(Math.abs(baliza.x - R.radio) < 1e-9);
    assert.ok(Math.abs(baliza.y) < 1e-9);
  });

  test('con la baliza recogida deja de aparecer', () => {
    assert.equal(de(contactosRadar(sim({ beaconAcquired: true }), CONFIG), 'baliza').length, 0);
  });

  test('enemigos dentro del alcance; los de afuera no se muestran; alimanas sumergidas aparte', () => {
    const s = sim({ playerX: 0, playerY: 0 });
    s.enemies.push(crearDron(s, 200, 0), crearDron(s, 5000, 0), crearAlimana(s, 0, 150));
    const r = contactosRadar(s, CONFIG);
    assert.equal(de(r, 'enemigo').length, 1);
    assert.equal(de(r, 'sumergido').length, 1);
  });

  test('el frente de la ola aparece cuando se acerca y no antes', () => {
    const lejos = sim({ playerX: 0, playerY: 0 });
    assert.equal(contactosRadar(lejos, CONFIG).ola, null);
    const cerca = sim({ playerX: 0, playerY: 0, waveDistance: R.alcanceSuperficie * 0.5 });
    const { ola } = contactosRadar(cerca, CONFIG);
    assert.ok(ola);
    const medioX = (ola.x1 + ola.x2) / 2;
    const medioY = (ola.y1 + ola.y2) / 2;
    assert.ok(Math.abs(Math.hypot(medioX, medioY) - R.radio * 0.5) < 1e-6);
  });

  test('orbita: centrado en la nave, con enemigos, el jefe y la Endurance cuando baja', () => {
    const s = sim({ stage: 'MISSION_2_ORBITAL_ASCENT', shipX: 480, shipY: 455, enduranceDescending: true, enduranceX: 480, enduranceY: 100 });
    s.enemies.push({ id: 1, type: 'scout_drone', x: 480, y: 300 }, { id: 2, type: 'dreadnought_boss', x: 480, y: 110 });
    const r = contactosRadar(s, CONFIG);
    assert.equal(de(r, 'enemigo').length, 1);
    assert.equal(de(r, 'jefe').length, 1);
    assert.equal(de(r, 'endurance').length, 1);
    assert.equal(r.ola, null);
  });
});
