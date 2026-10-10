import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/miller/config.js';
import { horasTerrestres, formatoTierra } from '../js/minijuegos/miller/logica/dilatacion.js';

const HORAS_ANO = 365.25 * 24;

describe('miller/logica/dilatacion.js — 1 h en Miller = 7 anos en la Tierra (licencia narrativa)', () => {
  test('1 s de juego son unas 17,05 horas terrestres (7 x 365,25 x 24 / 3600)', () => {
    assert.ok(Math.abs(horasTerrestres(1, CONFIG) - 17.045) < 0.001);
  });

  test('una hora son exactamente 7 anos', () => {
    assert.ok(Math.abs(horasTerrestres(3600, CONFIG) - 7 * HORAS_ANO) < 1e-6);
  });

  test('0 s no suma nada', () => assert.equal(horasTerrestres(0, CONFIG), 0));

  test('formatoTierra descompone en anos, meses y dias', () => {
    assert.deepEqual(formatoTierra(0), { anos: 0, meses: 0, dias: 0 });
    assert.deepEqual(formatoTierra(HORAS_ANO * 2 + HORAS_ANO / 12 * 3 + 24 * 5 + 1), { anos: 2, meses: 3, dias: 5 });
  });

  test('60 s de mision son 1 mes y 12 dias en la Tierra', () => {
    assert.deepEqual(formatoTierra(horasTerrestres(60, CONFIG)), { anos: 0, meses: 1, dias: 12 });
  });
});
