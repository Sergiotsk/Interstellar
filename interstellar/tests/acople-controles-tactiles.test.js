import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/acople/config.js';
import {
  tocar,
  levantar,
  levantarTodo,
  accionesTactiles,
  ACCIONES_TACTILES,
} from '../js/minijuegos/acople/logica/controles-tactiles.js';

const conjunto = (mapa) => [...accionesTactiles(mapa)].sort();

describe('acople/logica/controles-tactiles.js — dedos activos (010 R3)', () => {
  test('tocar agrega el dedo sin mutar el mapa original', () => {
    const vacio = levantarTodo();
    const uno = tocar(vacio, 1, 'impulso');
    assert.equal(vacio.size, 0);
    assert.deepEqual(conjunto(uno), ['impulso']);
  });

  test('multitouch: dos dedos en controles distintos dan ambas acciones', () => {
    const m = tocar(tocar(levantarTodo(), 1, 'rotarIzquierda'), 2, 'impulso');
    assert.deepEqual(conjunto(m), ['impulso', 'rotarIzquierda']);
  });

  test('dos dedos en el mismo control: la accion sigue hasta que se levanta el ultimo', () => {
    let m = tocar(tocar(levantarTodo(), 1, 'freno'), 2, 'freno');
    m = levantar(m, 1);
    assert.deepEqual(conjunto(m), ['freno']);
    m = levantar(m, 2);
    assert.deepEqual(conjunto(m), []);
  });

  test('levantar un dedo inexistente devuelve el mismo mapa', () => {
    const m = tocar(levantarTodo(), 1, 'impulso');
    assert.equal(levantar(m, 99), m);
  });

  test('una accion invalida se ignora', () => {
    const m = tocar(levantarTodo(), 1, 'impulso');
    assert.equal(tocar(m, 2, 'hiperespacio'), m);
  });

  test('levantarTodo devuelve un mapa vacio', () => {
    assert.equal(levantarTodo().size, 0);
    assert.deepEqual(conjunto(levantarTodo()), []);
  });

  test('las acciones tactiles son exactamente las del teclado (FR-007)', () => {
    assert.deepEqual([...ACCIONES_TACTILES].sort(), [...new Set(Object.values(CONFIG.teclas))].sort());
  });
});
