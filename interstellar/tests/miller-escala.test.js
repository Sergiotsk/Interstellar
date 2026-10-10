import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { escalaEntera } from '../js/minijuegos/miller/logica/escala.js';

const BASE = { ancho: 480, alto: 270 };

describe('miller/logica/escala.js — escalado entero del pixel art (R6)', () => {
  test('Full HD entra justo en x4', () => assert.equal(escalaEntera(1920, 1080, BASE), 4));
  test('1366x768 da x2', () => assert.equal(escalaEntera(1366, 768, BASE), 2));
  test('800x600 da x1', () => assert.equal(escalaEntera(800, 600, BASE), 1));
  test('nunca baja de x1', () => assert.equal(escalaEntera(300, 200, BASE), 1));
  test('limita el lado mas corto: 1440x1080 da x3', () => assert.equal(escalaEntera(1440, 1080, BASE), 3));
  test('limita la altura en pantallas anchas: 2560x600 da x2', () => assert.equal(escalaEntera(2560, 600, BASE), 2));
});
