import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { accionesDeJoystick } from '../js/minijuegos/miller/logica/joystick.js';

const ZM = 10;
const ordenadas = (dx, dy) => accionesDeJoystick(dx, dy, ZM).sort();

describe('miller/logica/joystick.js — joystick de 8 direcciones (R13)', () => {
  test('dentro de la zona muerta no hay acciones', () => {
    assert.deepEqual(ordenadas(0, 0), []);
    assert.deepEqual(ordenadas(6, 6), []);
  });

  test('los cuatro ejes puros dan una accion', () => {
    assert.deepEqual(ordenadas(40, 0), ['moverDerecha']);
    assert.deepEqual(ordenadas(-40, 0), ['moverIzquierda']);
    assert.deepEqual(ordenadas(0, -40), ['moverArriba']);
    assert.deepEqual(ordenadas(0, 40), ['moverAbajo']);
  });

  test('las diagonales dan dos acciones', () => {
    assert.deepEqual(ordenadas(30, 30), ['moverAbajo', 'moverDerecha']);
    assert.deepEqual(ordenadas(-30, -30), ['moverArriba', 'moverIzquierda']);
  });

  test('cerca de un eje cuenta solo ese eje (sector de 45 grados)', () => {
    assert.deepEqual(ordenadas(40, 10), ['moverDerecha']);
    assert.deepEqual(ordenadas(10, -40), ['moverArriba']);
  });

  test('el umbral de diagonal es simetrico en los cuatro cuadrantes', () => {
    for (const [sx, sy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      assert.equal(accionesDeJoystick(40 * sx, 17 * sy, ZM).length, 2);
      assert.equal(accionesDeJoystick(40 * sx, 15 * sy, ZM).length, 1);
    }
  });
});
