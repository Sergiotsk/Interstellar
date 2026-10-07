import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/acople/config.js';
import {
  normalizarAngulo,
  deltaOmega,
  deltaTheta,
  evaluarSincronia,
  evaluarContacto,
} from '../js/minijuegos/acople/logica/docking.js';

const PI = Math.PI;
const W = 0.9;
const cerca = (a, b) => Math.abs(a - b) < 1e-9;
const est = (extra = {}) => ({ angulo: 0, velAngular: W, anguloPuerto: 0, ...extra });
// Por defecto: nave sincronizada, alineada y en contacto lento.
const nav = (extra = {}) => ({ angulo: 0, velAngular: W, distancia: 0, velAproximacion: 1, combustible: 1, ...extra });

describe('acople/logica/docking.js — sincronia y contacto', () => {
  test('normalizarAngulo cae en (-pi, pi]', () => {
    assert.ok(cerca(normalizarAngulo(3 * PI), PI));
    assert.ok(cerca(normalizarAngulo(-3 * PI), PI));
    assert.ok(cerca(normalizarAngulo(2 * PI), 0));
    assert.ok(cerca(normalizarAngulo(0), 0));
    assert.ok(cerca(normalizarAngulo(-PI / 2), -PI / 2));
  });

  test('deltaOmega es la diferencia absoluta de giro', () => {
    assert.ok(cerca(deltaOmega(nav({ velAngular: 0.5 }), est()), 0.4));
    assert.ok(cerca(deltaOmega(nav({ velAngular: 1.3 }), est()), 0.4));
  });

  test('deltaTheta esta en [0, pi], es simetrico y considera el angulo del puerto', () => {
    assert.ok(cerca(deltaTheta(nav({ angulo: 0.3 }), est()), 0.3));
    assert.ok(cerca(deltaTheta(nav({ angulo: -0.3 }), est()), 0.3));
    assert.ok(cerca(deltaTheta(nav({ angulo: 2 * PI + 0.1 }), est()), 0.1));
    assert.ok(cerca(deltaTheta(nav({ angulo: PI }), est()), PI));
    assert.ok(cerca(deltaTheta(nav({ angulo: 1 }), est({ anguloPuerto: 1 })), 0));
  });

  test('todo en tolerancia y en rango es seguro y no peligro', () => {
    const s = evaluarSincronia(nav({ distancia: CONFIG.rangoAcople }), est(), CONFIG);
    assert.equal(s.seguro, true);
    assert.equal(s.peligro, false);
    assert.equal(s.enRango, true);
  });

  test('fuera de rango cuando la distancia supera rangoAcople', () => {
    assert.equal(evaluarSincronia(nav({ distancia: CONFIG.rangoAcople + 1 }), est(), CONFIG).enRango, false);
  });

  test('entre la tolerancia y el peligro no es seguro ni peligro', () => {
    const v = (CONFIG.tol.velocidad + CONFIG.peligro.velocidad) / 2;
    const s = evaluarSincronia(nav({ velAproximacion: v }), est(), CONFIG);
    assert.equal(s.seguro, false);
    assert.equal(s.peligro, false);
  });

  test('cualquier variable sobre su umbral de peligro marca peligro', () => {
    assert.equal(evaluarSincronia(nav({ velAproximacion: CONFIG.peligro.velocidad + 1 }), est(), CONFIG).peligro, true);
    assert.equal(evaluarSincronia(nav({ velAngular: W + CONFIG.peligro.omega + 0.01 }), est(), CONFIG).peligro, true);
    assert.equal(evaluarSincronia(nav({ angulo: CONFIG.peligro.angulo + 0.01 }), est(), CONFIG).peligro, true);
  });

  test('contacto con velocidad sobre la tolerancia es impacto', () => {
    assert.deepEqual(evaluarContacto(nav({ velAproximacion: CONFIG.tol.velocidad + 0.1 }), est(), CONFIG), {
      exito: false,
      causa: 'impacto',
    });
  });

  test('contacto con angulo o giro fuera de tolerancia es causa angulo', () => {
    assert.deepEqual(evaluarContacto(nav({ angulo: CONFIG.tol.angulo + 0.01 }), est(), CONFIG), {
      exito: false,
      causa: 'angulo',
    });
    assert.deepEqual(evaluarContacto(nav({ velAngular: W + CONFIG.tol.omega + 0.01 }), est(), CONFIG), {
      exito: false,
      causa: 'angulo',
    });
  });

  test('el impacto tiene prioridad sobre el angulo', () => {
    assert.equal(evaluarContacto(nav({ velAproximacion: 99, angulo: 1 }), est(), CONFIG).causa, 'impacto');
  });

  test('contacto con todo en tolerancia es exito', () => {
    assert.deepEqual(evaluarContacto(nav(), est(), CONFIG), { exito: true });
  });
});
