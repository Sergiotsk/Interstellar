import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/miller/config.js';
import { crearRng } from '../js/minijuegos/miller/logica/azar.js';
import { crearSim } from '../js/minijuegos/miller/logica/estado.js';
import { dimensionesVisor, ajustarDimensiones } from '../js/minijuegos/miller/logica/visor.js';

describe('miller/logica/visor.js — llenar la pantalla sin deformar', () => {
  test('16:9 exacto conserva el lienzo original de 960x540', () => {
    assert.deepEqual(dimensionesVisor(1920, 1080), { ancho: 960, alto: 540 });
  });

  test('pantalla mas ancha: 540 de alto y el ancho crece con la proporcion', () => {
    assert.deepEqual(dimensionesVisor(2340, 1080), { ancho: 1170, alto: 540 });
  });

  test('pantalla mas alta (16:10): 960 de ancho y el alto crece', () => {
    assert.deepEqual(dimensionesVisor(1920, 1200), { ancho: 960, alto: 600 });
  });

  test('proporciones extremas se acotan entre 4:3 y 21:9', () => {
    assert.deepEqual(dimensionesVisor(5000, 1000), { ancho: 1260, alto: 540 });
    assert.deepEqual(dimensionesVisor(1000, 1000), { ancho: 960, alto: 720 });
  });

  test('sin medidas validas vuelve al lienzo original', () => {
    assert.deepEqual(dimensionesVisor(0, 0), { ancho: 960, alto: 540 });
  });

  test('ajustarDimensiones centra la Endurance y mete la nave en los nuevos limites del shmup', () => {
    const sim = crearSim(CONFIG, crearRng(1), { ancho: 960, alto: 540 });
    Object.assign(sim, { stage: 'MISSION_2_ORBITAL_ASCENT', shipX: 1300, shipY: 700 });
    ajustarDimensiones(sim, { ancho: 1170, alto: 540 });
    assert.equal(sim.enduranceX, 585);
    assert.equal(sim.shipX, 1120);
    assert.equal(sim.shipY, 495);
  });

  test('en la superficie no toca la nave estacionada', () => {
    const sim = crearSim(CONFIG, crearRng(1), { ancho: 960, alto: 540 });
    ajustarDimensiones(sim, { ancho: 1170, alto: 540 });
    assert.deepEqual([sim.shipX, sim.shipY], [0, 0]);
  });
});
