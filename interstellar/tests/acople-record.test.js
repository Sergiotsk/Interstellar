import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/acople/config.js';
import { leerRecord, guardarSiMejor } from '../js/minijuegos/acople/logica/record.js';

const CLAVE = CONFIG.record.clave;
const ahora = new Date('2026-10-07T21:30:00.000Z');

const fake = (inicial = {}) => {
  const datos = { ...inicial };
  return {
    datos,
    getItem: (k) => (k in datos ? datos[k] : null),
    setItem: (k, v) => {
      datos[k] = String(v);
    },
  };
};
const falla = () => {
  throw new Error('bloqueado');
};
const roto = { getItem: falla, setItem: falla };
const exito = (puntaje) => ({
  exito: true,
  causa: null,
  puntaje,
  tiempoTotal: 40,
  combustibleRestante: 0.5,
  velocidadFinal: 2,
  precision: 0.9,
});
const guardado = (puntaje) =>
  JSON.stringify({ v: 1, puntaje, fecha: ahora.toISOString(), tiempoS: 40, combustible: 0.5, velocidadFinal: 2, precision: 0.9 });

describe('acople/logica/record.js — mejor puntaje local (FR-027/028)', () => {
  test('sin nada guardado devuelve null', () => {
    assert.equal(leerRecord(fake(), CONFIG), null);
  });

  test('lee un record valido', () => {
    assert.equal(leerRecord(fake({ [CLAVE]: guardado(7421) }), CONFIG).puntaje, 7421);
  });

  test('JSON invalido, version distinta o puntaje invalido devuelven null', () => {
    assert.equal(leerRecord(fake({ [CLAVE]: '{nope' }), CONFIG), null);
    assert.equal(leerRecord(fake({ [CLAVE]: 'null' }), CONFIG), null);
    assert.equal(leerRecord(fake({ [CLAVE]: JSON.stringify({ v: 2, puntaje: 10 }) }), CONFIG), null);
    for (const p of [-1, 10.5, 'Infinity', null, '10']) {
      assert.equal(leerRecord(fake({ [CLAVE]: JSON.stringify({ v: 1, puntaje: p }) }), CONFIG), null, String(p));
    }
  });

  test('storage que lanza o ausente devuelve null sin lanzar', () => {
    assert.equal(leerRecord(roto, CONFIG), null);
    assert.equal(leerRecord(undefined, CONFIG), null);
  });

  test('guarda si no hay record, con la fecha inyectada', () => {
    const s = fake();
    const r = guardarSiMejor(exito(500), s, CONFIG, ahora);
    assert.equal(r.guardado, true);
    assert.equal(r.record.puntaje, 500);
    assert.equal(JSON.parse(s.datos[CLAVE]).fecha, ahora.toISOString());
  });

  test('guarda solo si el puntaje nuevo es mayor', () => {
    const s = fake({ [CLAVE]: guardado(700) });
    assert.equal(guardarSiMejor(exito(700), s, CONFIG, ahora).guardado, false);
    assert.equal(guardarSiMejor(exito(600), s, CONFIG, ahora).guardado, false);
    assert.equal(guardarSiMejor(exito(800), s, CONFIG, ahora).guardado, true);
    assert.equal(leerRecord(s, CONFIG).puntaje, 800);
  });

  test('cuando no guarda devuelve el record vigente', () => {
    const s = fake({ [CLAVE]: guardado(700) });
    assert.equal(guardarSiMejor(exito(10), s, CONFIG, ahora).record.puntaje, 700);
  });

  test('un desenlace fallido no guarda', () => {
    const s = fake();
    const r = guardarSiMejor({ exito: false, causa: 'impacto', puntaje: null }, s, CONFIG, ahora);
    assert.equal(r.guardado, false);
    assert.equal(s.datos[CLAVE], undefined);
  });

  test('storage que lanza al guardar devuelve guardado false sin lanzar', () => {
    assert.deepEqual(guardarSiMejor(exito(500), roto, CONFIG, ahora), { guardado: false, record: null });
  });
});
