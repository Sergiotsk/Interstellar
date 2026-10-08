import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/acople/config.js';
import { crearPartida } from '../js/minijuegos/acople/logica/mision.js';
import { instrumentos } from '../js/minijuegos/acople/logica/instrumentos.js';

const W = CONFIG.estacion.velAngular;
const cerca = (a, b) => Math.abs(a - b) < 1e-9;

// Partida en curso con la nave sincronizada y alineada; se pisan campos de la nave.
function partida(naveExtra = {}) {
  const p = crearPartida(CONFIG, { conIntro: false });
  const angulo = p.estacion.angulo + p.estacion.anguloPuerto;
  return { ...p, nave: { ...p.nave, angulo, velAngular: W, ...naveExtra } };
}

describe('acople/logica/instrumentos.js — lecturas normalizadas de la consola', () => {
  test('sincronizada y alineada: agujas al centro y LEDs en tolerancia', () => {
    const i = instrumentos(partida(), CONFIG);
    assert.ok(cerca(i.giro, 0));
    assert.ok(cerca(i.alineacion, 0));
    assert.equal(i.giroOk, true);
    assert.equal(i.alineacionOk, true);
  });

  test('giro: con signo, relativo al umbral de peligro y acotado a [-1, 1]', () => {
    assert.ok(cerca(instrumentos(partida({ velAngular: W + CONFIG.peligro.omega / 2 }), CONFIG).giro, 0.5));
    assert.ok(cerca(instrumentos(partida({ velAngular: W - CONFIG.peligro.omega / 2 }), CONFIG).giro, -0.5));
    assert.equal(instrumentos(partida({ velAngular: W + 99 }), CONFIG).giro, 1);
    assert.equal(instrumentos(partida({ velAngular: W - 99 }), CONFIG).giro, -1);
  });

  test('zonas seguras de los diales = tolerancia / peligro', () => {
    const i = instrumentos(partida(), CONFIG);
    assert.ok(cerca(i.giroZona, CONFIG.tol.omega / CONFIG.peligro.omega));
    assert.ok(cerca(i.alineacionZona, CONFIG.tol.angulo / CONFIG.peligro.angulo));
  });

  test('alineacion: con signo y acotada', () => {
    const p = partida();
    const desvio = { ...p, nave: { ...p.nave, angulo: p.nave.angulo - CONFIG.peligro.angulo / 2 } };
    assert.ok(cerca(instrumentos(desvio, CONFIG).alineacion, 0.5));
    const lejos = { ...p, nave: { ...p.nave, angulo: p.nave.angulo + 3 } };
    assert.equal(instrumentos(lejos, CONFIG).alineacion, -1);
  });

  test('velocidad: barra en [0,1] con marcas de tolerancia y peligro; alejarse marca 0', () => {
    const i = instrumentos(partida({ velAproximacion: CONFIG.tol.velocidad }), CONFIG);
    assert.ok(cerca(i.velocidad, i.velocidadTol));
    assert.ok(i.velocidadTol < i.velocidadPeligro && i.velocidadPeligro < 1);
    assert.equal(i.velocidadOk, true);
    assert.equal(instrumentos(partida({ velAproximacion: -5 }), CONFIG).velocidad, 0);
    assert.equal(instrumentos(partida({ velAproximacion: 999 }), CONFIG).velocidad, 1);
    assert.equal(instrumentos(partida({ velAproximacion: CONFIG.tol.velocidad + 0.1 }), CONFIG).velocidadOk, false);
  });

  test('distancia: fraccion del recorrido inicial y marca del rango de acople', () => {
    const i = instrumentos(partida({ distancia: CONFIG.distanciaInicial / 2 }), CONFIG);
    assert.ok(cerca(i.distancia, 0.5));
    assert.ok(cerca(i.distanciaRango, CONFIG.rangoAcople / CONFIG.distanciaInicial));
    assert.equal(i.enRango, false);
    assert.equal(instrumentos(partida({ distancia: CONFIG.rangoAcople }), CONFIG).enRango, true);
    assert.equal(instrumentos(partida({ distancia: CONFIG.distanciaInicial * 2 }), CONFIG).distancia, 1);
  });

  test('combustible acotado a [0,1]', () => {
    assert.equal(instrumentos(partida({ combustible: 0.42 }), CONFIG).combustible, 0.42);
  });

  test('LEDs fuera de tolerancia', () => {
    const i = instrumentos(partida({ velAngular: W + CONFIG.tol.omega * 2, angulo: 1 }), CONFIG);
    assert.equal(i.giroOk, false);
    assert.equal(i.alineacionOk, false);
  });
});

describe('acople/logica/instrumentos.js — LED de velocidad al alejarse', () => {
  test('con velocidad negativa el LED no esta en tolerancia', () => {
    assert.equal(instrumentos(partida({ velAproximacion: -1 }), CONFIG).velocidadOk, false);
  });
});
