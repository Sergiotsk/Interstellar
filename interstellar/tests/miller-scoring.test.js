import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/miller/config.js';
import { factores, calcularPuntaje, rangoDe } from '../js/minijuegos/miller/logica/scoring.js';

const P = CONFIG.puntaje;
const datos = (extra = {}) => ({ tiempo: 60, margen: 200, choques: 1, precision: 1, ...extra });

describe('miller/logica/scoring.js — puntaje 0 a 10 000 (R9)', () => {
  test('factor tiempo: 1 hasta tMin, 0 desde tMax, lineal en el medio', () => {
    assert.equal(factores(datos({ tiempo: 30 }), CONFIG).tiempo, 1);
    assert.equal(factores(datos({ tiempo: P.tMin }), CONFIG).tiempo, 1);
    assert.equal(factores(datos({ tiempo: P.tMax }), CONFIG).tiempo, 0);
    assert.equal(factores(datos({ tiempo: 200 }), CONFIG).tiempo, 0);
    assert.equal(factores(datos({ tiempo: (P.tMin + P.tMax) / 2 }), CONFIG).tiempo, 0.5);
  });

  test('factor margen satura en margenMax y no es negativo', () => {
    assert.equal(factores(datos({ margen: P.margenMax * 3 }), CONFIG).margen, 1);
    assert.equal(factores(datos({ margen: P.margenMax / 2 }), CONFIG).margen, 0.5);
    assert.equal(factores(datos({ margen: -50 }), CONFIG).margen, 0);
  });

  test('factor choques llega a 0 en maxChoques', () => {
    assert.equal(factores(datos({ choques: 0 }), CONFIG).choques, 1);
    assert.equal(factores(datos({ choques: P.maxChoques }), CONFIG).choques, 0);
    assert.equal(factores(datos({ choques: P.maxChoques + 4 }), CONFIG).choques, 0);
  });

  test('la precision pasa tal cual, acotada a [0, 1]', () => {
    assert.equal(factores(datos({ precision: 0.4 }), CONFIG).precision, 0.4);
    assert.equal(factores(datos({ precision: 2 }), CONFIG).precision, 1);
  });

  test('perfecto da el maximo; todo en 0 da 0; siempre entero', () => {
    assert.equal(calcularPuntaje({ tiempo: 1, margen: 1, choques: 1, precision: 1 }, CONFIG), P.max);
    assert.equal(calcularPuntaje({ tiempo: 0, margen: 0, choques: 0, precision: 0 }, CONFIG), 0);
    assert.ok(Number.isInteger(calcularPuntaje(factores(datos({ tiempo: 61.37 }), CONFIG), CONFIG)));
  });

  test('a igualdad de lo demas, volver mas rapido puntua mas', () => {
    const rapido = calcularPuntaje(factores(datos({ tiempo: 55 }), CONFIG), CONFIG);
    const lento = calcularPuntaje(factores(datos({ tiempo: 75 }), CONFIG), CONFIG);
    assert.ok(rapido > lento);
  });

  test('rangoDe en los bordes', () => {
    assert.equal(rangoDe(P.rangos.S, CONFIG), 'S');
    assert.equal(rangoDe(P.rangos.S - 1, CONFIG), 'A');
    assert.equal(rangoDe(P.rangos.A, CONFIG), 'A');
    assert.equal(rangoDe(P.rangos.B, CONFIG), 'B');
    assert.equal(rangoDe(P.rangos.B - 1, CONFIG), 'C');
    assert.equal(rangoDe(0, CONFIG), 'C');
  });
});
