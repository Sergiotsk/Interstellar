import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/acople/config.js';
import { crearNave, crearEstacion, pasoFisica } from '../js/minijuegos/acople/logica/fisica.js';

const dt = 0.1;
const estado = (naveExtra = {}) => ({
  nave: { ...crearNave(CONFIG), ...naveExtra },
  estacion: crearEstacion(CONFIG),
});
const acc = (...a) => new Set(a);

describe('acople/logica/fisica.js — fisica simplificada de 2 ejes', () => {
  test('crearNave y crearEstacion salen de la config', () => {
    const n = crearNave(CONFIG);
    assert.equal(n.distancia, CONFIG.distanciaInicial);
    assert.equal(n.combustible, CONFIG.combustible.inicial);
    assert.equal(n.velAproximacion, 0);
    const e = crearEstacion(CONFIG);
    assert.equal(e.velAngular, CONFIG.estacion.velAngular);
    assert.equal(e.anguloPuerto, CONFIG.estacion.anguloPuerto);
    assert.equal(e.angulo, CONFIG.estacion.anguloInicial);
  });

  test('rotar a izquierda y derecha cambia velAngular en sentidos opuestos', () => {
    const izq = pasoFisica(estado(), acc('rotarIzquierda'), dt, CONFIG).nave.velAngular;
    const der = pasoFisica(estado(), acc('rotarDerecha'), dt, CONFIG).nave.velAngular;
    assert.ok(izq < 0 && der > 0);
    assert.ok(Math.abs(izq + der) < 1e-12);
  });

  test('impulso acerca y freno aleja (velAproximacion puede quedar negativa)', () => {
    assert.ok(pasoFisica(estado(), acc('impulso'), dt, CONFIG).nave.velAproximacion > 0);
    assert.ok(pasoFisica(estado(), acc('freno'), dt, CONFIG).nave.velAproximacion < 0);
  });

  test('la distancia baja segun la velocidad de aproximacion', () => {
    const n = pasoFisica(estado({ velAproximacion: 10 }), acc(), dt, CONFIG).nave;
    assert.ok(Math.abs(n.distancia - (CONFIG.distanciaInicial - 1)) < 1e-9);
  });

  test('la distancia se clampa en 0', () => {
    const n = pasoFisica(estado({ distancia: 0.5, velAproximacion: 50 }), acc(), dt, CONFIG).nave;
    assert.equal(n.distancia, 0);
  });

  test('el combustible baja segun las acciones activas y nunca queda < 0', () => {
    const una = pasoFisica(estado(), acc('impulso'), dt, CONFIG).nave.combustible;
    assert.ok(Math.abs(una - (1 - CONFIG.combustible.consumoImpulso * dt)) < 1e-12);
    const dos = pasoFisica(estado(), acc('impulso', 'rotarDerecha'), dt, CONFIG).nave.combustible;
    assert.ok(dos < una);
    const vacio = pasoFisica(estado({ combustible: 0.0001 }), acc('impulso', 'freno'), 10, CONFIG).nave;
    assert.equal(vacio.combustible, 0);
  });

  test('sin acciones no consume combustible', () => {
    assert.equal(pasoFisica(estado(), acc(), dt, CONFIG).nave.combustible, 1);
  });

  test('sin combustible las acciones no tienen efecto (inercia)', () => {
    const s = estado({ combustible: 0, velAproximacion: 3, velAngular: 0.2 });
    const n = pasoFisica(s, acc('impulso', 'rotarDerecha'), dt, CONFIG).nave;
    assert.equal(n.velAproximacion, 3);
    assert.equal(n.velAngular, 0.2);
  });

  test('la estacion y la nave avanzan su angulo con su velocidad angular', () => {
    const s = estado({ velAngular: 0.5 });
    const r = pasoFisica(s, acc(), dt, CONFIG);
    assert.ok(Math.abs(r.estacion.angulo - (s.estacion.angulo + CONFIG.estacion.velAngular * dt)) < 1e-12);
    assert.ok(Math.abs(r.nave.angulo - (s.nave.angulo + 0.5 * dt)) < 1e-12);
  });

  test('es pura: no muta la entrada', () => {
    const s = estado();
    const copia = structuredClone(s);
    pasoFisica(s, acc('impulso', 'rotarIzquierda'), dt, CONFIG);
    assert.deepEqual(s, copia);
  });
});
