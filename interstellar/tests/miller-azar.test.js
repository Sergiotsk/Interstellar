import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { crearRng } from '../js/minijuegos/miller/logica/azar.js';

const tomar = (rng, n) => Array.from({ length: n }, () => rng());

describe('miller/logica/azar.js — azar reproducible (R5)', () => {
  test('la misma semilla da la misma secuencia', () => {
    assert.deepEqual(tomar(crearRng(42), 20), tomar(crearRng(42), 20));
  });

  test('semillas distintas dan secuencias distintas', () => {
    assert.notDeepEqual(tomar(crearRng(1), 5), tomar(crearRng(2), 5));
  });

  test('los valores caen en [0, 1)', () => {
    for (const v of tomar(crearRng(7), 1000)) assert.ok(v >= 0 && v < 1);
  });

  test('no se queda pegado en un valor', () => {
    assert.ok(new Set(tomar(crearRng(0), 100)).size > 90);
  });
});
