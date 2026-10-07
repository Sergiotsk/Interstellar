import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { textoRecord } from '../js/minijuegos/hub.js';

describe('js/minijuegos/hub.js — record en la bahia 1', () => {
  test('sin record muestra "Sin registro"', () => {
    assert.equal(textoRecord(null), 'Sin registro');
  });

  test('con record muestra el puntaje con separador de miles', () => {
    assert.equal(textoRecord({ puntaje: 7421 }), 'Récord: 7.421 pts');
    assert.equal(textoRecord({ puntaje: 0 }), 'Récord: 0 pts');
  });
});
