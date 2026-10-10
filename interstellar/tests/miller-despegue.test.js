import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/miller/config.js';
import { enRadio, cargar, crearDespegue } from '../js/minijuegos/miller/logica/despegue.js';

const DT = CONFIG.pasoFijoS;
const R = { x: 80, z: 45, radio: 36 };
const sostener = (d, segundos, sostenida) => {
  let r = d;
  for (let i = 0; i < Math.round(segundos / DT); i++) r = cargar(r, sostenida, DT, CONFIG);
  return r;
};

describe('miller/logica/despegue.js — radio y carga (R8)', () => {
  test('enRadio corta en el borde y cuenta la profundidad', () => {
    assert.equal(enRadio({ x: 80 + 36, z: 45 }, R), true);
    assert.equal(enRadio({ x: 80 + 37, z: 45 }, R), false);
    assert.equal(enRadio({ x: 80 + 30, z: 45 + 30 }, R), false);
  });

  test('arranca vacia', () => {
    assert.deepEqual(crearDespegue(), { carga: 0, soltadas: 0, sostenida: false });
  });

  test('sostenida llega a 1 en el tiempo de despegue y no se pasa', () => {
    const casi = sostener(crearDespegue(), CONFIG.despegue.tiempo - 0.1, true);
    assert.ok(casi.carga < 1);
    const llena = sostener(crearDespegue(), CONFIG.despegue.tiempo + 0.5, true);
    assert.equal(llena.carga, 1);
  });

  test('sin sostener decae sin bajar de 0', () => {
    const media = sostener(crearDespegue(), 0.75, true);
    const baja = cargar(media, false, 0.1, CONFIG);
    assert.ok(Math.abs(baja.carga - (media.carga - CONFIG.despegue.decaimientoCarga * 0.1)) < 1e-9);
    assert.equal(sostener(media, 5, false).carga, 0);
  });

  test('soltar con carga a medias cuenta una interrupcion, una sola vez', () => {
    let d = sostener(crearDespegue(), 0.5, true);
    d = sostener(d, 0.3, false);
    assert.equal(d.soltadas, 1);
    d = sostener(d, 0.2, true);
    d = cargar(d, false, DT, CONFIG);
    assert.equal(d.soltadas, 2);
  });

  test('no soltar nunca deja las interrupciones en 0', () => {
    assert.equal(sostener(crearDespegue(), 2, true).soltadas, 0);
    assert.equal(sostener(crearDespegue(), 2, false).soltadas, 0);
  });
});
