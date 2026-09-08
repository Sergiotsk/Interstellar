import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { FILM_SPEED, loopDuration, initFilmstrip } from '../js/filmstrip.js';

describe('js/filmstrip.js — tira de celuloide (port spike/librerias)', () => {
  test('expone el inicializador del componente', () => {
    assert.equal(typeof initFilmstrip, 'function');
  });

  test('FILM_SPEED: el ritmo base del desfile es 28 px/s', () => {
    // Valor del contrato del prototipo _lab/filmstrip-mundos.html: constante
    // para que dos tiras de distinto largo se lean al mismo ritmo.
    assert.equal(FILM_SPEED, 28);
  });

  test('loopDuration: una vuelta completa dura width / speed', () => {
    // Tira de 1400 px (los 2 sets duplicados de 700) -> 50 s al ritmo base.
    assert.equal(loopDuration(1400), 50);
    assert.equal(loopDuration(700), 25);
    assert.equal(loopDuration(0), 0);
  });

  test('loopDuration respeta una velocidad custom (no solo la default)', () => {
    assert.equal(loopDuration(700, 35), 20);
    assert.equal(loopDuration(1400, 14), 100);
  });
});