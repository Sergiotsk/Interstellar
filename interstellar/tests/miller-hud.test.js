import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/miller/config.js';
import { crearRng } from '../js/minijuegos/miller/logica/azar.js';
import { crearSim } from '../js/minijuegos/miller/logica/estado.js';
import { lecturasHud } from '../js/minijuegos/miller/hud.js';

const sim = (cambios = {}) => Object.assign(crearSim(CONFIG, crearRng(1), { ancho: 960, alto: 540 }), cambios);

describe('miller/hud.js — lecturas del HUD del original (JSX)', () => {
  test('superficie: textos de la fase 1', () => {
    const l = lecturasHud(sim({ phase: 'EXPLORATION' }), 'PLAYING', CONFIG);
    assert.equal(l.sector, 'MISSION 01 // SURFACE EXPLORATION');
    assert.equal(l.stage, '🌊 STAGE 01: SURFACE');
    assert.equal(l.baliza, 'RETRIEVE MILLER BEACON');
    assert.equal(l.radar, 'EXPLORE WATER SURFACE // RETRIEVE MILLER BEACON');
    assert.equal(l.ayuda, 'WASD / Arrows: Move | SPACE: Jump | SHIFT: Slide | J/CLICK: Shoot | E: Board Ship');
    assert.equal(l.orbita, false);
    assert.equal(l.score, '000000');
  });

  test('baliza asegurada', () => {
    const l = lecturasHud(sim({ beaconAcquired: true }), 'PLAYING', CONFIG);
    assert.equal(l.baliza, 'BEACON SECURED // BOARD SPACECRAFT [E]');
    assert.equal(l.balizaAsegurada, true);
    assert.equal(l.radar, 'BEACON SECURED // RETURN TO RANGER SPACECRAFT [E]');
  });

  test('orbita: sector, altitud, barras y armas', () => {
    const l = lecturasHud(
      sim({ stage: 'MISSION_2_ORBITAL_ASCENT', sectorName: 'SECTOR 2: STRATOSPHERIC FIGHTERS', altitude: 2500, shipShield: 60, shipHealth: 80, weaponPowerLevel: 2, combo: 12, aerialInterceptorsDowned: 3 }),
      'PLAYING',
      CONFIG,
    );
    assert.equal(l.orbita, true);
    assert.equal(l.sector, 'SECTOR 2: STRATOSPHERIC FIGHTERS');
    assert.equal(l.stage, '🚀 STAGE 02: ORBIT');
    assert.equal(l.altitud, '▲ 2500m / 10,000m');
    assert.equal(l.progreso, 25);
    assert.equal(l.escudo, 60);
    assert.equal(l.casco, 80);
    assert.equal(l.canon, 'LV2 TRIPLE');
    assert.equal(l.combo, 3);
    assert.equal(l.score, String(2500 * 2.5 + 3 * 350).padStart(6, '0'));
    assert.equal(l.radar, 'VERTICAL SHMUP MODE // DODGE BULLETS & SHOOT UPWARDS TO REACH THE ENDURANCE');
  });

  test('jefe, abordaje y cuenta', () => {
    const conJefe = sim({ stage: 'MISSION_2_ORBITAL_ASCENT', enemies: [{ type: 'dreadnought_boss', hp: 325, maxHp: 650 }] });
    assert.equal(lecturasHud(conJefe, 'PLAYING', CONFIG).jefe, 50);
    assert.equal(lecturasHud(sim(), 'PLAYING', CONFIG).jefe, null);
    assert.equal(lecturasHud(sim({ shipBoardPrompt: true }), 'PLAYING', CONFIG).abordar, true);
    assert.equal(lecturasHud(sim({ countdownTimer: 1.2 }), 'PLAYING', CONFIG).cuenta, 2);
    assert.equal(lecturasHud(sim({ phase: 'EXPLORATION' }), 'PLAYING', CONFIG).cuenta, null);
  });

  test('traje en peligro por debajo de 36', () => {
    assert.equal(lecturasHud(sim({ playerShieldHp: 35 }), 'PLAYING', CONFIG).trajeAlerta, true);
    assert.equal(lecturasHud(sim({ playerShieldHp: 36 }), 'PLAYING', CONFIG).trajeAlerta, false);
  });
});
