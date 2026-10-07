import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/acople/config.js';

describe('acople/config.js — parametros centralizados (FR-018)', () => {
  test('los pesos del puntaje suman 1', () => {
    const suma = Object.values(CONFIG.puntaje.pesos).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(suma - 1) < 1e-9, `suma = ${suma}`);
  });

  test('cada umbral de peligro supera a su tolerancia', () => {
    for (const k of ['omega', 'angulo', 'velocidad']) {
      assert.ok(CONFIG.peligro[k] > CONFIG.tol[k], k);
    }
  });

  test('rangoAcople < zonaCercana < distanciaInicial', () => {
    assert.ok(CONFIG.rangoAcople < CONFIG.zonaCercana);
    assert.ok(CONFIG.zonaCercana < CONFIG.distanciaInicial);
  });

  test('esta congelado, tambien en profundidad', () => {
    assert.ok(Object.isFrozen(CONFIG));
    assert.ok(Object.isFrozen(CONFIG.tol));
    assert.ok(Object.isFrozen(CONFIG.puntaje.pesos));
  });

  test('mapea las 4 teclas a las 4 acciones', () => {
    assert.deepEqual({ ...CONFIG.teclas }, {
      ArrowLeft: 'rotarIzquierda',
      ArrowRight: 'rotarDerecha',
      ArrowUp: 'impulso',
      Space: 'freno',
    });
  });

  test('clave del record namespaced', () => {
    assert.equal(CONFIG.record.clave, 'interstellar:minijuegos:acople:best');
    assert.equal(CONFIG.record.version, 1);
  });

  test('nombres de la pelicula en un unico lugar (FR-039)', () => {
    assert.equal(typeof CONFIG.nombres.estacion, 'string');
    assert.equal(typeof CONFIG.nombres.nave, 'string');
  });
});
