import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG, PALETA_PIXEL, ANIM, TOKENS_HUD } from '../js/minijuegos/miller/config.js';

const congeladoProfundo = (o) => Object.isFrozen(o) && Object.values(o).every((v) => typeof v !== 'object' || v === null || congeladoProfundo(v));

describe('miller/config.js — constants.ts del original', () => {
  test('todo congelado', () => {
    [CONFIG, PALETA_PIXEL, ANIM, TOKENS_HUD].forEach((o) => assert.ok(congeladoProfundo(o)));
  });

  test('los valores de juego son los del original', () => {
    const esperado = {
      baseCanvasWidth: 960, baseCanvasHeight: 540, stepMs: 1000 / 60, maxSubSteps: 5,
      defaultMusicVolume: 0.5, defaultSfxVolume: 0.75,
      playerBaseSpeed: 260, playerSprintSpeed: 370, playerAcceleration: 2300, waterDragCoeff: 4.0,
      jumpVelocity: 350, gravity: 860, playerMaxHp: 100, slideSpeed: 460, slideDuration: 0.32,
      waveInitialDistance: 2200, waveSpeedBase: 38, waveSpeedFlight: 115, waveMaxSpeed: 170,
      liftoffHoldDuration: 1.2, landerTriggerRadius: 95, beaconPickupRadius: 58, caseTriggerRadius: 62,
      debrisObstacleCount: 16, shipMaxSpeed: 460, shipBoostSpeed: 720, shipThrustAccel: 480, shipTurnRate: 3.0,
      shipAirDrag: 0.95, shipBoardingRadius: 120, mission2TargetDistance: 10000, enduranceDockingRadius: 160,
    };
    for (const [k, v] of Object.entries(esperado)) assert.equal(CONFIG[k], v, k);
  });

  test('paleta P0..P20 del original', () => {
    assert.equal(Object.keys(PALETA_PIXEL).length, 21);
    assert.equal(PALETA_PIXEL.P13, '#e8803b');
    assert.equal(PALETA_PIXEL.P18, '#4fd0e0');
    assert.equal(PALETA_PIXEL.P20, '#a855f7');
  });

  test('ANIM y TOKENS_HUD del original', () => {
    assert.equal(ANIM.hitStopMs, 65);
    assert.deepEqual({ ...ANIM.shake }, { leve: 1.5, medio: 3.5, fuerte: 6.0, decaimiento: 0.88 });
    assert.equal(TOKENS_HUD.tealGlow, '#4fd0e0');
    assert.equal(TOKENS_HUD.panelBg, '#0c2529');
  });

  test('integracion con el sitio: ranking y dilatacion correcta', () => {
    assert.equal(CONFIG.ranking.clave, 'interstellar:minijuegos:miller:ranking');
    assert.equal(CONFIG.ranking.tope, 10);
    assert.equal(CONFIG.ranking.largoNombre, 8);
    assert.ok(Math.abs(CONFIG.horasTerrestresPorSegundo - 17.045) < 0.001);
  });
});
