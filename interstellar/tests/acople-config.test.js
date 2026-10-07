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

  test('mapea flechas y WASD a las 4 acciones del juego', () => {
    assert.deepEqual({ ...CONFIG.teclas }, {
      ArrowLeft: 'rotarIzquierda',
      ArrowRight: 'rotarDerecha',
      ArrowUp: 'impulso',
      Space: 'freno',
      KeyA: 'rotarIzquierda',
      KeyD: 'rotarDerecha',
      KeyW: 'impulso',
      KeyS: 'freno',
    });
  });

  test('acople manual: tecla Enter y parametros de rechazo y rebote', () => {
    assert.equal(CONFIG.acople.tecla, 'Enter');
    assert.ok(CONFIG.acople.esperaRechazo > 0);
    assert.ok(CONFIG.acople.costoRechazo > 0 && CONFIG.acople.costoRechazo < 1);
    assert.ok(CONFIG.acople.velRebote > 0);
    assert.ok(CONFIG.puntaje.penalizacionRechazo > 0);
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
