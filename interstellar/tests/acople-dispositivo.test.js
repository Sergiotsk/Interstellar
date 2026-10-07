import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { debeMostrarAvisoDesktop } from '../js/minijuegos/acople/logica/dispositivo.js';

describe('acople/logica/dispositivo.js — aviso en tactiles sin teclado (research R7)', () => {
  test('solo un puntero grueso sin ningun puntero fino muestra el aviso', () => {
    assert.equal(debeMostrarAvisoDesktop({ punteroGrueso: true, algunPunteroFino: false }), true);
  });

  test('desktop, laptop hibrida o tablet con mouse juegan', () => {
    assert.equal(debeMostrarAvisoDesktop({ punteroGrueso: false, algunPunteroFino: true }), false);
    assert.equal(debeMostrarAvisoDesktop({ punteroGrueso: true, algunPunteroFino: true }), false);
    assert.equal(debeMostrarAvisoDesktop({ punteroGrueso: false, algunPunteroFino: false }), false);
  });
});
