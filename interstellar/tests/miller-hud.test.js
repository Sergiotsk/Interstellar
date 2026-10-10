import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/miller/config.js';
import { crearRng } from '../js/minijuegos/miller/logica/azar.js';
import { crearSim } from '../js/minijuegos/miller/logica/estado.js';
import { lecturasHud } from '../js/minijuegos/miller/hud.js';

const sim = (cambios = {}) => Object.assign(crearSim(CONFIG, crearRng(1), { ancho: 960, alto: 540 }), cambios);

describe('miller/hud.js — lecturas del HUD flotante', () => {
  test('superficie: objetivo de la baliza, traje y ayuda de controles de la fase 1', () => {
    const l = lecturasHud(sim({ phase: 'EXPLORATION' }), 'PLAYING', CONFIG);
    assert.equal(l.orbita, false);
    assert.equal(l.objetivo, 'RETRIEVE MILLER BEACON');
    assert.equal(l.traje, 100);
    assert.equal(l.score, '000000');
    assert.match(l.ayuda, /SPACE: Jump/);
  });

  test('baliza asegurada: el objetivo pasa a volver al Ranger', () => {
    const l = lecturasHud(sim({ beaconAcquired: true }), 'PLAYING', CONFIG);
    assert.equal(l.objetivo, 'BEACON SECURED // BOARD THE RANGER [E]');
    assert.equal(l.balizaAsegurada, true);
  });

  test('orbita: sector como objetivo, altitud, barras, armas y ayuda de la fase 2', () => {
    const l = lecturasHud(
      sim({ stage: 'MISSION_2_ORBITAL_ASCENT', sectorName: 'SECTOR 2: STRATOSPHERIC FIGHTERS', altitude: 2500, shipShield: 60, shipHealth: 80, weaponPowerLevel: 2, combo: 12, aerialInterceptorsDowned: 3 }),
      'PLAYING',
      CONFIG,
    );
    assert.equal(l.orbita, true);
    assert.equal(l.objetivo, 'SECTOR 2: STRATOSPHERIC FIGHTERS');
    assert.equal(l.altitud, '▲ 2500m / 10,000m');
    assert.equal(l.progreso, 25);
    assert.equal(l.escudo, 60);
    assert.equal(l.casco, 80);
    assert.equal(l.canon, 'LV2 TRIPLE');
    assert.equal(l.combo, 3);
    assert.equal(l.score, String(2500 * 2.5 + 3 * 350).padStart(6, '0'));
    assert.match(l.ayuda, /Q: Missiles/);
  });

  test('jefe, abordaje y cuenta', () => {
    const conJefe = sim({ stage: 'MISSION_2_ORBITAL_ASCENT', enemies: [{ type: 'dreadnought_boss', hp: 325, maxHp: 650 }] });
    assert.equal(lecturasHud(conJefe, 'PLAYING', CONFIG).jefe, 50);
    assert.equal(lecturasHud(sim(), 'PLAYING', CONFIG).jefe, null);
    assert.equal(lecturasHud(sim({ shipBoardPrompt: true }), 'PLAYING', CONFIG).abordar, true);
    assert.equal(lecturasHud(sim({ countdownTimer: 1.2 }), 'PLAYING', CONFIG).cuenta, 2);
    assert.equal(lecturasHud(sim({ phase: 'EXPLORATION' }), 'PLAYING', CONFIG).cuenta, null);
  });

  test('el traje se dibuja en 10 segmentos y avisa por debajo de 36', () => {
    assert.equal(lecturasHud(sim({ playerShieldHp: 87 }), 'PLAYING', CONFIG).segmentosTraje, 9);
    assert.equal(lecturasHud(sim({ playerShieldHp: 35 }), 'PLAYING', CONFIG).trajeAlerta, true);
    assert.equal(lecturasHud(sim({ playerShieldHp: 36 }), 'PLAYING', CONFIG).trajeAlerta, false);
  });
});
