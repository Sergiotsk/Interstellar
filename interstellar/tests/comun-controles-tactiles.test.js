import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  tocar,
  levantar,
  levantarTodo,
  accionesTactiles,
} from '../js/minijuegos/comun/logica/controles-tactiles.js';

const VALIDAS = ['impulso', 'freno', 'rotarIzquierda'];
const conjunto = (mapa) => [...accionesTactiles(mapa)].sort();

describe('comun/logica/controles-tactiles.js — dedos activos (010 R3)', () => {
  test('tocar agrega el dedo sin mutar el mapa original', () => {
    const vacio = levantarTodo();
    const uno = tocar(vacio, 1, 'impulso', VALIDAS);
    assert.equal(vacio.size, 0);
    assert.deepEqual(conjunto(uno), ['impulso']);
  });

  test('multitouch: dos dedos en controles distintos dan ambas acciones', () => {
    const m = tocar(tocar(levantarTodo(), 1, 'rotarIzquierda', VALIDAS), 2, 'impulso', VALIDAS);
    assert.deepEqual(conjunto(m), ['impulso', 'rotarIzquierda']);
  });

  test('dos dedos en el mismo control: la accion sigue hasta que se levanta el ultimo', () => {
    let m = tocar(tocar(levantarTodo(), 1, 'freno', VALIDAS), 2, 'freno', VALIDAS);
    m = levantar(m, 1);
    assert.deepEqual(conjunto(m), ['freno']);
    m = levantar(m, 2);
    assert.deepEqual(conjunto(m), []);
  });

  test('levantar un dedo inexistente devuelve el mismo mapa', () => {
    const m = tocar(levantarTodo(), 1, 'impulso', VALIDAS);
    assert.equal(levantar(m, 99), m);
  });

  test('una accion fuera de la lista del juego se ignora', () => {
    const m = tocar(levantarTodo(), 1, 'impulso', VALIDAS);
    assert.equal(tocar(m, 2, 'hiperespacio', VALIDAS), m);
  });

  test('la lista de acciones validas es la del juego que llama', () => {
    assert.equal(tocar(levantarTodo(), 1, 'accion', ['accion']).size, 1);
    assert.equal(tocar(levantarTodo(), 1, 'impulso', ['accion']).size, 0);
  });

  test('sin lista de acciones no se acepta ningun toque', () => {
    assert.equal(tocar(levantarTodo(), 1, 'impulso').size, 0);
  });

  test('levantarTodo devuelve un mapa vacio', () => {
    assert.equal(levantarTodo().size, 0);
    assert.deepEqual(conjunto(levantarTodo()), []);
  });
});
