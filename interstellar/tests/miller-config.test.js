import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG, PALETA_PIXEL, ANIM } from '../js/minijuegos/miller/config.js';

const congeladoProfundo = (obj) =>
  Object.isFrozen(obj) && Object.values(obj).every((v) => v === null || typeof v !== 'object' || congeladoProfundo(v));

const ACCIONES = ['moverArriba', 'moverAbajo', 'moverIzquierda', 'moverDerecha', 'accion', 'pausa'];

describe('miller/config.js — parametros del capitulo 2', () => {
  test('CONFIG, PALETA_PIXEL y ANIM estan congelados en profundidad', () => {
    assert.ok(congeladoProfundo(CONFIG));
    assert.ok(congeladoProfundo(PALETA_PIXEL));
    assert.ok(congeladoProfundo(ANIM));
  });

  test('tiene todos los grupos del data-model', () => {
    for (const grupo of ['nombres', 'teclas', 'mundo', 'jugador', 'ranger', 'baliza', 'restos', 'ola', 'despegue', 'caseRobot', 'dilatacion', 'puntaje', 'particulas', 'audio', 'ranking']) {
      assert.ok(CONFIG[grupo], `falta CONFIG.${grupo}`);
    }
    assert.equal(CONFIG.pasoFijoS, 1 / 60);
    assert.ok(CONFIG.deltaMaxS > 0);
  });

  test('las teclas mapean solo a acciones validas y cubren las seis', () => {
    const valores = new Set(Object.values(CONFIG.teclas));
    for (const v of valores) assert.ok(ACCIONES.includes(v), `accion invalida: ${v}`);
    assert.equal(valores.size, ACCIONES.length);
    assert.equal(CONFIG.teclas.KeyW, 'moverArriba');
    assert.equal(CONFIG.teclas.Space, 'accion');
    assert.equal(CONFIG.teclas.Escape, 'pausa');
  });

  test('paleta cerrada: hasta 20 colores y sin el teal de la cabina', () => {
    const colores = Object.values(PALETA_PIXEL);
    assert.ok(colores.length <= 20);
    assert.ok(!colores.includes(0x4fd0e0));
    assert.equal(PALETA_PIXEL.P15, 0xe8803b); // naranja Gargantua: baliza y llama
  });

  test('los pesos del puntaje suman 1 y los rangos son decrecientes', () => {
    const suma = Object.values(CONFIG.puntaje.pesos).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(suma - 1) < 1e-9);
    const { S, A, B } = CONFIG.puntaje.rangos;
    assert.ok(S > A && A > B && B > 0 && S <= CONFIG.puntaje.max);
    assert.ok(CONFIG.puntaje.tMin < CONFIG.puntaje.tMax);
  });

  test('ranking propio de Miller, compatible con comun/logica/ranking.js', () => {
    const r = CONFIG.ranking;
    assert.equal(r.clave, 'interstellar:minijuegos:miller:ranking');
    assert.equal(r.version, 1);
    assert.equal(r.tope, 10);
    assert.equal(r.largoNombre, 8);
    assert.equal(r.nombrePorDefecto, 'RANGER');
    assert.ok(r.alfabeto.includes('Ñ') && r.alfabeto.endsWith(' '));
  });

  test('geometria coherente: baliza dentro del mundo y lejos del Ranger', () => {
    const { mundo, ranger, baliza, ola } = CONFIG;
    assert.ok(baliza.ventanaX[0] > ranger.x + ranger.radio);
    assert.ok(baliza.ventanaX[1] < mundo.ancho);
    assert.ok(ola.xInicial > mundo.ancho && ola.distanciaRevelacion > ola.umbrales.cerca);
    assert.ok(ola.umbrales.cerca > ola.umbrales.inminente);
  });

  test('la dilatacion es 7 anos por hora', () => {
    assert.equal(CONFIG.dilatacion.anosPorHora, 7);
  });

  test('perfiles de audio y tope de particulas por modo', () => {
    assert.ok(CONFIG.audio.teclado && CONFIG.audio.tactil);
    assert.ok(CONFIG.particulas.tope.tactil < CONFIG.particulas.tope.teclado);
  });
});
