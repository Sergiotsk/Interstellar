import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { modoEntrada, requiereGiro } from '../js/minijuegos/acople/logica/dispositivo.js';

describe('acople/logica/dispositivo.js — modo de entrada (010 R1)', () => {
  test('solo un puntero grueso sin ningun puntero fino es tactil', () => {
    assert.equal(modoEntrada({ punteroGrueso: true, algunPunteroFino: false }), 'tactil');
  });

  test('desktop, laptop hibrida o tablet con mouse usan teclado', () => {
    assert.equal(modoEntrada({ punteroGrueso: false, algunPunteroFino: true }), 'teclado');
    assert.equal(modoEntrada({ punteroGrueso: true, algunPunteroFino: true }), 'teclado');
    assert.equal(modoEntrada({ punteroGrueso: false, algunPunteroFino: false }), 'teclado');
  });

  test('el modo forzado por la URL tiene prioridad sobre la deteccion', () => {
    assert.equal(modoEntrada({ punteroGrueso: false, algunPunteroFino: true, forzado: 'tactil' }), 'tactil');
    assert.equal(modoEntrada({ punteroGrueso: true, algunPunteroFino: false, forzado: 'teclado' }), 'teclado');
  });

  test('un forzado invalido se ignora', () => {
    for (const forzado of ['x', null, undefined, '', 'TACTIL']) {
      assert.equal(modoEntrada({ punteroGrueso: true, algunPunteroFino: false, forzado }), 'tactil', String(forzado));
    }
  });
});

describe('acople/logica/dispositivo.js — aviso de giro (010 R6)', () => {
  test('tactil en vertical pide girar; en horizontal o cuadrado no', () => {
    assert.equal(requiereGiro({ modo: 'tactil', ancho: 390, alto: 844 }), true);
    assert.equal(requiereGiro({ modo: 'tactil', ancho: 844, alto: 390 }), false);
    assert.equal(requiereGiro({ modo: 'tactil', ancho: 600, alto: 600 }), false);
  });

  test('en modo teclado nunca pide girar', () => {
    assert.equal(requiereGiro({ modo: 'teclado', ancho: 390, alto: 844 }), false);
  });
});
