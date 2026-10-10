import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/miller/config.js';
import { crearOla, revelarOla, avanzarOla, nivelPeligro } from '../js/minijuegos/miller/logica/ola.js';

const { ola: O } = CONFIG;

describe('miller/logica/ola.js — la megaola (R7)', () => {
  test('arranca oculta, fuera del mapa', () => {
    const ola = crearOla(CONFIG);
    assert.equal(ola.revelada, false);
    assert.ok(ola.x > CONFIG.mundo.ancho);
  });

  test('oculta no se mueve: no hay reglas que el jugador no pueda ver', () => {
    const ola = crearOla(CONFIG);
    assert.equal(avanzarOla(ola, 30, CONFIG), ola);
  });

  test('se revela a distanciaRevelacion del jugador, sea donde sea que este la baliza', () => {
    for (const xJugador of [1800, 2000, 2200]) {
      const r = revelarOla(crearOla(CONFIG), CONFIG, xJugador);
      assert.equal(r.revelada, true);
      assert.equal(r.x, xJugador + O.distanciaRevelacion);
      assert.equal(r.vel, O.velHuida);
    }
  });

  test('revelada avanza y acelera', () => {
    const r = revelarOla(crearOla(CONFIG), CONFIG, 2000);
    const a = avanzarOla(r, 1, CONFIG);
    assert.ok(Math.abs(a.vel - (O.velHuida + O.aceleracion)) < 1e-9);
    assert.ok(Math.abs(a.x - (r.x - a.vel)) < 1e-9);
  });

  test('nivelPeligro en los umbrales exactos', () => {
    assert.equal(nivelPeligro(O.umbrales.inminente, CONFIG), 'inminente');
    assert.equal(nivelPeligro(O.umbrales.inminente + 1, CONFIG), 'cerca');
    assert.equal(nivelPeligro(O.umbrales.cerca, CONFIG), 'cerca');
    assert.equal(nivelPeligro(O.umbrales.cerca + 1, CONFIG), 'lejos');
    assert.equal(nivelPeligro(-10, CONFIG), 'inminente');
  });
});
