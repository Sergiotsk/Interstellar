import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/acople/config.js';

describe('acople/config.js — parametros centralizados (FR-018)', () => {
  test('los pesos del puntaje suman 1', () => {
    const suma = Object.values(CONFIG.puntaje.pesos).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(suma - 1) < 1e-9, `suma = ${suma}`);
  });

  test('cada umbral de peligro supera a su tolerancia', () => {
    for (const k of ['omega', 'angulo', 'velocidad']) {
      assert.ok(CONFIG.peligro[k] > CONFIG.tol[k], k);
    }
  });

  test('rangoAcople < zonaCercana < distanciaInicial', () => {
    assert.ok(CONFIG.rangoAcople < CONFIG.zonaCercana);
    assert.ok(CONFIG.zonaCercana < CONFIG.distanciaInicial);
  });

  test('esta congelado, tambien en profundidad', () => {
    assert.ok(Object.isFrozen(CONFIG));
    assert.ok(Object.isFrozen(CONFIG.tol));
    assert.ok(Object.isFrozen(CONFIG.puntaje.pesos));
  });

  test('mapea flechas y WASD a las 4 acciones del juego', () => {
    assert.deepEqual({ ...CONFIG.teclas }, {
      ArrowLeft: 'rotarIzquierda',
      ArrowRight: 'rotarDerecha',
      ArrowUp: 'impulso',
      Space: 'freno',
      KeyA: 'rotarIzquierda',
      KeyD: 'rotarDerecha',
      KeyW: 'impulso',
      KeyS: 'freno',
    });
  });

  test('acople manual: tecla Enter y parametros de rechazo y rebote', () => {
    assert.equal(CONFIG.acople.tecla, 'Enter');
    assert.ok(CONFIG.acople.esperaRechazo > 0);
    assert.ok(CONFIG.acople.costoRechazo > 0 && CONFIG.acople.costoRechazo < 1);
    assert.ok(CONFIG.acople.velRebote > 0);
    assert.ok(CONFIG.puntaje.penalizacionRechazo > 0);
  });

  test('ranking: clave namespaced, top 10 y nombre por defecto valido', () => {
    const r = CONFIG.ranking;
    assert.equal(r.clave, 'interstellar:minijuegos:acople:ranking');
    assert.equal(r.version, 1);
    assert.equal(r.tope, 10);
    assert.ok(r.nombrePorDefecto.length <= r.largoNombre);
    assert.ok([...r.nombrePorDefecto].every((c) => r.alfabeto.includes(c)));
    assert.equal(r.alfabeto.at(-1), ' ', 'el espacio cierra el alfabeto: casilla en blanco');
  });

  test('nombres de la pelicula en un unico lugar (FR-039)', () => {
    assert.equal(typeof CONFIG.nombres.estacion, 'string');
    assert.equal(typeof CONFIG.nombres.nave, 'string');
  });
});

describe('acople/config.js — perfil de audio por modo (010, parlantes de celular)', () => {
  const { teclado, tactil } = CONFIG.audio;

  test('desktop conserva la mezcla original', () => {
    assert.equal(teclado.volumen, 0.6);
    assert.equal(teclado.musicaFiltro[0], 450);
    assert.equal(teclado.propulsorFiltro, 900);
    assert.equal(teclado.compresor, false);
  });

  test('tactil suena mas fuerte y mas brillante, con compresor para no saturar', () => {
    assert.ok(tactil.volumen > teclado.volumen && tactil.volumen <= 1);
    assert.ok(tactil.musicaFiltro[0] > teclado.musicaFiltro[0]);
    assert.ok(tactil.musicaVolumen[0] > teclado.musicaVolumen[0]);
    assert.ok(tactil.propulsorFiltro > teclado.propulsorFiltro);
    assert.equal(tactil.compresor, true);
  });

  test('cada rango va de menor a mayor', () => {
    for (const p of [teclado, tactil]) {
      assert.ok(p.musicaFiltro[0] < p.musicaFiltro[1]);
      assert.ok(p.musicaVolumen[0] < p.musicaVolumen[1]);
    }
  });
});
