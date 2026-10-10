import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/miller/config.js';
import { intensidadSenal, frecuenciaPulso, alAlcance } from '../js/minijuegos/miller/logica/baliza.js';

const B = { x: 2000, z: 40 };
const j = (x, z = 40) => ({ x, z });

describe('miller/logica/baliza.js — senal y recogida', () => {
  test('intensidad 1 encima, 0 desde el rango de la senal', () => {
    assert.equal(intensidadSenal(j(2000), B, CONFIG), 1);
    assert.equal(intensidadSenal(j(2000 - CONFIG.baliza.rangoSenal), B, CONFIG), 0);
    assert.equal(intensidadSenal(j(0), B, CONFIG), 0);
  });

  test('la intensidad crece al acercarse', () => {
    const lejos = intensidadSenal(j(1500), B, CONFIG);
    const cerca = intensidadSenal(j(1900), B, CONFIG);
    assert.ok(cerca > lejos && lejos > 0);
  });

  test('la frecuencia del pulso va de min a max', () => {
    assert.equal(frecuenciaPulso(0, CONFIG), CONFIG.baliza.pulsoMinHz);
    assert.equal(frecuenciaPulso(1, CONFIG), CONFIG.baliza.pulsoMaxHz);
    assert.ok(frecuenciaPulso(0.5, CONFIG) > CONFIG.baliza.pulsoMinHz);
  });

  test('al alcance hasta el borde, contando la profundidad', () => {
    const a = CONFIG.jugador.alcanceBaliza;
    assert.equal(alAlcance(j(2000 - a), B, CONFIG), true);
    assert.equal(alAlcance(j(2000 - a - 1), B, CONFIG), false);
    assert.equal(alAlcance(j(2000, 40 + a + 1), B, CONFIG), false);
  });
});
