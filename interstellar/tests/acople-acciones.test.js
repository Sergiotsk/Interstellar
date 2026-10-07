import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { accionDeTecla, presionar, soltar, soltarTodo } from '../js/minijuegos/acople/logica/acciones.js';

describe('acople/logica/acciones.js — input como acciones (FR-011)', () => {
  test('traduce las 4 teclas del juego', () => {
    assert.equal(accionDeTecla('ArrowLeft'), 'rotarIzquierda');
    assert.equal(accionDeTecla('ArrowRight'), 'rotarDerecha');
    assert.equal(accionDeTecla('ArrowUp'), 'impulso');
    assert.equal(accionDeTecla('Space'), 'freno');
  });

  test('cualquier otra tecla devuelve null', () => {
    assert.equal(accionDeTecla('KeyA'), null);
    assert.equal(accionDeTecla('ArrowDown'), null);
    assert.equal(accionDeTecla(undefined), null);
  });

  test('no confunde propiedades heredadas con teclas', () => {
    assert.equal(accionDeTecla('toString'), null);
  });

  test('acepta un mapa de teclas inyectado', () => {
    assert.equal(accionDeTecla('KeyW', { KeyW: 'impulso' }), 'impulso');
  });

  test('presionar devuelve un Set nuevo sin mutar el original', () => {
    const a = new Set();
    const b = presionar(a, 'impulso');
    assert.notEqual(a, b);
    assert.equal(a.size, 0);
    assert.ok(b.has('impulso'));
  });

  test('soltar devuelve un Set nuevo sin la accion', () => {
    const a = new Set(['impulso', 'freno']);
    const b = soltar(a, 'impulso');
    assert.ok(a.has('impulso'));
    assert.deepEqual([...b], ['freno']);
  });

  test('soltarTodo devuelve un Set vacio', () => {
    assert.equal(soltarTodo().size, 0);
  });
});
