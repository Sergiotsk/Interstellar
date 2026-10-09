import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/acople/config.js';
import { accionDeTecla, accionesDe, presionar, soltar, soltarTodo } from '../js/minijuegos/comun/logica/acciones.js';

const T = CONFIG.teclas;

describe('comun/logica/acciones.js — input como acciones (FR-011)', () => {
  test('traduce las teclas del juego (flechas y WASD)', () => {
    assert.equal(accionDeTecla('ArrowLeft', T), 'rotarIzquierda');
    assert.equal(accionDeTecla('ArrowRight', T), 'rotarDerecha');
    assert.equal(accionDeTecla('ArrowUp', T), 'impulso');
    assert.equal(accionDeTecla('Space', T), 'freno');
    assert.equal(accionDeTecla('KeyA', T), 'rotarIzquierda');
    assert.equal(accionDeTecla('KeyD', T), 'rotarDerecha');
    assert.equal(accionDeTecla('KeyW', T), 'impulso');
    assert.equal(accionDeTecla('KeyS', T), 'freno');
  });

  test('cualquier otra tecla devuelve null', () => {
    assert.equal(accionDeTecla('KeyJ', T), null);
    assert.equal(accionDeTecla('KeyX', T), null);
    assert.equal(accionDeTecla('ArrowDown', T), null);
    assert.equal(accionDeTecla(undefined, T), null);
  });

  test('no confunde propiedades heredadas con teclas', () => {
    assert.equal(accionDeTecla('toString', T), null);
  });

  test('sin mapa de teclas no traduce nada: el mapa es de cada juego', () => {
    assert.equal(accionDeTecla('KeyW'), null);
  });

  test('accionesDe lista las acciones del mapa sin repetir', () => {
    assert.deepEqual([...accionesDe({ KeyA: 'x', ArrowLeft: 'x', Space: 'y' })], ['x', 'y']);
    assert.ok(Object.isFrozen(accionesDe(T)));
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
