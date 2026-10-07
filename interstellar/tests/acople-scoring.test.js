import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/acople/config.js';
import { factores, calcularPuntaje } from '../js/minijuegos/acople/logica/scoring.js';

const perfecto = {
  deltaOmega: 0,
  deltaTheta: 0,
  combustibleRestante: 1,
  tiempoTotal: CONFIG.puntaje.tMin,
  tiempoEnRango: 5,
  tiempoEnRangoSeguro: 5,
  velocidadFinal: 0,
};
const enRango01 = (f) => Object.values(f).every((v) => v >= 0 && v <= 1);

describe('acople/logica/scoring.js — puntaje deterministico (FR-025)', () => {
  test('devuelve los 5 factores, todos en [0,1]', () => {
    const f = factores(perfecto, CONFIG);
    assert.deepEqual(Object.keys(f).sort(), ['combustible', 'precision', 'suavidad', 'tiempo', 'velocidad']);
    assert.ok(enRango01(f));
    const malo = factores(
      { ...perfecto, deltaOmega: 9, deltaTheta: 9, tiempoTotal: 999, velocidadFinal: 99, combustibleRestante: 0, tiempoEnRangoSeguro: 0 },
      CONFIG,
    );
    assert.ok(enRango01(malo));
  });

  test('precision combina giro y angulo relativos a su tolerancia', () => {
    const f = factores({ ...perfecto, deltaOmega: CONFIG.tol.omega / 2, deltaTheta: 0 }, CONFIG);
    assert.ok(Math.abs(f.precision - 0.75) < 1e-9);
  });

  test('tiempo: 1 por debajo de tMin, 0 por encima de tMax, lineal en el medio', () => {
    const { tMin, tMax } = CONFIG.puntaje;
    assert.equal(factores({ ...perfecto, tiempoTotal: tMin - 10 }, CONFIG).tiempo, 1);
    assert.equal(factores({ ...perfecto, tiempoTotal: tMax + 10 }, CONFIG).tiempo, 0);
    assert.ok(Math.abs(factores({ ...perfecto, tiempoTotal: (tMin + tMax) / 2 }, CONFIG).tiempo - 0.5) < 1e-9);
  });

  test('suavidad: fraccion del tiempo en rango que fue segura; 1 si no hubo tiempo en rango', () => {
    assert.equal(factores({ ...perfecto, tiempoEnRango: 4, tiempoEnRangoSeguro: 1 }, CONFIG).suavidad, 0.25);
    assert.equal(factores({ ...perfecto, tiempoEnRango: 0, tiempoEnRangoSeguro: 0 }, CONFIG).suavidad, 1);
  });

  test('suavidad: cada rechazo de acople resta la penalizacion configurada', () => {
    const pen = CONFIG.puntaje.penalizacionRechazo;
    assert.ok(Math.abs(factores({ ...perfecto, rechazos: 1 }, CONFIG).suavidad - (1 - pen)) < 1e-9);
    assert.equal(factores({ ...perfecto, rechazos: 99 }, CONFIG).suavidad, 0);
  });

  test('velocidad: 1 parado, 0 en la tolerancia', () => {
    assert.equal(factores({ ...perfecto, velocidadFinal: 0 }, CONFIG).velocidad, 1);
    assert.equal(factores({ ...perfecto, velocidadFinal: CONFIG.tol.velocidad }, CONFIG).velocidad, 0);
  });

  test('un desempeno perfecto da el maximo', () => {
    assert.equal(calcularPuntaje(factores(perfecto, CONFIG), CONFIG), CONFIG.puntaje.max);
  });

  test('el puntaje es entero, acotado y deterministico', () => {
    const datos = { ...perfecto, deltaOmega: 0.03, deltaTheta: 0.07, combustibleRestante: 0.42, tiempoTotal: 55, velocidadFinal: 2.5 };
    const a = calcularPuntaje(factores(datos, CONFIG), CONFIG);
    const b = calcularPuntaje(factores(datos, CONFIG), CONFIG);
    assert.equal(a, b);
    assert.ok(Number.isInteger(a) && a >= 0 && a <= CONFIG.puntaje.max);
  });

  test('todo en cero da 0', () => {
    const ceros = { precision: 0, combustible: 0, tiempo: 0, suavidad: 0, velocidad: 0 };
    assert.equal(calcularPuntaje(ceros, CONFIG), 0);
  });
});
