import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { EJE_TODAS, createFiltroState, visibleIndices, wrapIndex } from '../js/galeria.js';

describe('js/galeria.js — filtro por eje (estado puro)', () => {
  test('arranca en "todas"', () => {
    assert.equal(createFiltroState().activo, EJE_TODAS);
  });

  test('set(eje): activa un eje distinto al actual', () => {
    const estado = createFiltroState();
    estado.set('mundos');
    assert.equal(estado.activo, 'mundos');
  });

  test('set(eje) sobre el eje ya activo: vuelve a "todas" (toggle)', () => {
    const estado = createFiltroState();
    estado.set('mundos');
    estado.set('mundos');
    assert.equal(estado.activo, EJE_TODAS);
  });

  test('set(eje) sobre un eje nuevo reemplaza al anterior (uno solo activo)', () => {
    const estado = createFiltroState();
    estado.set('mundos');
    estado.set('viaje');
    assert.equal(estado.activo, 'viaje');
  });
});

describe('js/galeria.js — visibleIndices', () => {
  const items = [
    { eje: 'mundos' },
    { eje: 'personajes' },
    { eje: 'mundos' },
    { eje: 'viaje' },
  ];

  test('EJE_TODAS: devuelve todos los indices en orden', () => {
    assert.deepEqual(visibleIndices(items, EJE_TODAS), [0, 1, 2, 3]);
  });

  test('un eje puntual: solo los indices de ese eje', () => {
    assert.deepEqual(visibleIndices(items, 'mundos'), [0, 2]);
  });

  test('eje sin coincidencias: lista vacia', () => {
    assert.deepEqual(visibleIndices(items, 'ciencia'), []);
  });

  test('lista vacia de items: siempre vacio', () => {
    assert.deepEqual(visibleIndices([], 'mundos'), []);
    assert.deepEqual(visibleIndices([], EJE_TODAS), []);
  });
});

describe('js/galeria.js — wrapIndex (navegacion circular del visor)', () => {
  test('avanza sin salir del rango', () => {
    assert.equal(wrapIndex(0, 1, 5), 1);
    assert.equal(wrapIndex(3, 1, 5), 4);
  });

  test('retrocede sin salir del rango', () => {
    assert.equal(wrapIndex(3, -1, 5), 2);
  });

  test('da la vuelta al pasar el final', () => {
    assert.equal(wrapIndex(4, 1, 5), 0);
  });

  test('da la vuelta al retroceder desde el principio', () => {
    assert.equal(wrapIndex(0, -1, 5), 4);
  });

  test('length 0 (caso limite, sin items visibles): siempre 0', () => {
    assert.equal(wrapIndex(0, 1, 0), 0);
    assert.equal(wrapIndex(0, -1, 0), 0);
  });

  test('length 1: siempre se queda en 0', () => {
    assert.equal(wrapIndex(0, 1, 1), 0);
    assert.equal(wrapIndex(0, -1, 1), 0);
  });
});
