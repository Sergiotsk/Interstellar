import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/acople/config.js';
import { sanearEntrada } from '../js/minijuegos/comun/logica/nombre-arcade.js';

const { largoNombre: LARGO } = CONFIG.ranking;

describe('comun/logica/nombre-arcade.js — nombre tipeado con el teclado', () => {
  test('pasa a mayusculas', () => {
    assert.equal(sanearEntrada('cooper', CONFIG), 'COOPER');
  });

  test('saca tildes y conserva la Ñ', () => {
    assert.equal(sanearEntrada('brand ñú', CONFIG), 'BRAND ÑU');
  });

  test('descarta caracteres fuera del alfabeto', () => {
    assert.equal(sanearEntrada('t@rs!-9', CONFIG), 'TRS9');
  });

  test('corta en el largo maximo', () => {
    assert.equal(sanearEntrada('abcdefghijkl', CONFIG).length, LARGO);
  });

  test('no permite espacios al principio pero si al final mientras se tipea', () => {
    assert.equal(sanearEntrada('  mu ', CONFIG), 'MU ');
  });

  test('vacio queda vacio (el nombre por defecto se aplica recien al guardar)', () => {
    assert.equal(sanearEntrada('', CONFIG), '');
    assert.equal(sanearEntrada(null, CONFIG), '');
  });
});
