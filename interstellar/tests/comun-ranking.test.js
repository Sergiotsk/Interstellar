import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/acople/config.js';
import {
  leerRanking,
  posicionEnRanking,
  insertarEntrada,
  guardarEnRanking,
  normalizarNombre,
} from '../js/minijuegos/comun/logica/ranking.js';

const { clave: CLAVE, tope: TOPE } = CONFIG.ranking;
const ahora = new Date('2026-10-08T21:30:00.000Z');

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
const entrada = (nombre, puntaje) => ({ nombre, puntaje, fecha: ahora.toISOString() });
const tabla = (...puntajes) => puntajes.map((p, i) => entrada(`P${i}`, p));
const guardado = (entradas, extra = {}) => JSON.stringify({ v: 1, entradas, ultimoNombre: '', ...extra });

describe('comun/logica/ranking.js — lectura tolerante', () => {
  test('sin nada guardado devuelve tabla vacia', () => {
    assert.deepEqual(leerRanking(fake(), CONFIG), { entradas: [], ultimoNombre: '' });
  });

  test('lee entradas validas ordenadas de mayor a menor y el ultimo nombre', () => {
    const s = fake({ [CLAVE]: guardado([entrada('ANA', 100), entrada('BETO', 900)], { ultimoNombre: 'BETO' }) });
    const r = leerRanking(s, CONFIG);
    assert.deepEqual(r.entradas.map((e) => e.puntaje), [900, 100]);
    assert.equal(r.ultimoNombre, 'BETO');
  });

  test('descarta entradas invalidas y recorta al tope', () => {
    const basura = [entrada('OK', 5), { nombre: 'X', puntaje: -1 }, { nombre: 'Y', puntaje: 1.5 }, { puntaje: 3 }, null];
    assert.deepEqual(leerRanking(fake({ [CLAVE]: guardado(basura) }), CONFIG).entradas.map((e) => e.nombre), ['OK']);
    const larga = tabla(...Array.from({ length: TOPE + 5 }, (_, i) => i));
    assert.equal(leerRanking(fake({ [CLAVE]: guardado(larga) }), CONFIG).entradas.length, TOPE);
  });

  test('JSON roto, version distinta o storage que lanza devuelven tabla vacia', () => {
    const vacia = { entradas: [], ultimoNombre: '' };
    assert.deepEqual(leerRanking(fake({ [CLAVE]: '{nope' }), CONFIG), vacia);
    assert.deepEqual(leerRanking(fake({ [CLAVE]: JSON.stringify({ v: 2, entradas: tabla(5) }) }), CONFIG), vacia);
    assert.deepEqual(leerRanking(roto, CONFIG), vacia);
    assert.deepEqual(leerRanking(undefined, CONFIG), vacia);
  });
});

describe('comun/logica/ranking.js — posicion e insercion', () => {
  test('tabla con lugar: cualquier puntaje entra', () => {
    assert.equal(posicionEnRanking([], 0, CONFIG), 0);
    assert.equal(posicionEnRanking(tabla(900, 500), 700, CONFIG), 1);
    assert.equal(posicionEnRanking(tabla(900, 500), 100, CONFIG), 2);
  });

  test('empate: el puntaje nuevo queda debajo del que ya estaba', () => {
    assert.equal(posicionEnRanking(tabla(900, 500), 500, CONFIG), 2);
  });

  test('tabla llena: hay que superar al ultimo para entrar', () => {
    const llena = tabla(...Array.from({ length: TOPE }, (_, i) => 1000 - i * 10));
    const ultimo = llena.at(-1).puntaje;
    assert.equal(posicionEnRanking(llena, ultimo, CONFIG), -1);
    assert.equal(posicionEnRanking(llena, ultimo + 1, CONFIG), TOPE - 1);
    assert.equal(posicionEnRanking(llena, 5000, CONFIG), 0);
  });

  test('puntaje no entero o negativo no entra', () => {
    assert.equal(posicionEnRanking([], null, CONFIG), -1);
    assert.equal(posicionEnRanking([], -5, CONFIG), -1);
  });

  test('insertarEntrada no muta, ubica la entrada y recorta al tope', () => {
    const llena = tabla(...Array.from({ length: TOPE }, (_, i) => 1000 - i * 10));
    const copia = structuredClone(llena);
    const r = insertarEntrada(llena, entrada('NUEVO', 995), CONFIG);
    assert.deepEqual(llena, copia);
    assert.equal(r.posicion, 1);
    assert.equal(r.entradas.length, TOPE);
    assert.equal(r.entradas[1].nombre, 'NUEVO');
    assert.equal(r.entradas.at(-1).puntaje, llena.at(-2).puntaje);
  });

  test('insertarEntrada con un puntaje que no entra devuelve la tabla igual y posicion -1', () => {
    const llena = tabla(...Array.from({ length: TOPE }, () => 500));
    const r = insertarEntrada(llena, entrada('X', 500), CONFIG);
    assert.equal(r.posicion, -1);
    assert.deepEqual(r.entradas, llena);
  });
});

describe('comun/logica/ranking.js — nombres', () => {
  test('mayusculas, solo el alfabeto permitido, sin espacios en los bordes y hasta el largo maximo', () => {
    assert.equal(normalizarNombre('  sergio  ', CONFIG), 'SERGIO');
    assert.equal(normalizarNombre('ñandú!', CONFIG), 'ÑANDU');
    assert.equal(normalizarNombre('COOPER-TARS-CASE', CONFIG), 'COOPERTA');
    assert.equal(normalizarNombre('DR  MANN', CONFIG), 'DR  MANN');
  });

  test('vacio o invalido cae al nombre por defecto', () => {
    assert.equal(normalizarNombre('', CONFIG), CONFIG.ranking.nombrePorDefecto);
    assert.equal(normalizarNombre('   ', CONFIG), CONFIG.ranking.nombrePorDefecto);
    assert.equal(normalizarNombre(null, CONFIG), CONFIG.ranking.nombrePorDefecto);
  });
});

describe('comun/logica/ranking.js — guardar', () => {
  test('guarda la entrada con nombre normalizado, fecha inyectada y recuerda el nombre', () => {
    const s = fake();
    const r = guardarEnRanking(exito(500), 'tars', s, CONFIG, ahora);
    assert.equal(r.guardado, true);
    assert.equal(r.posicion, 0);
    const leido = leerRanking(s, CONFIG);
    assert.equal(leido.entradas[0].nombre, 'TARS');
    assert.equal(leido.entradas[0].fecha, ahora.toISOString());
    assert.equal(leido.entradas[0].tiempoS, 40);
    assert.equal(leido.ultimoNombre, 'TARS');
  });

  test('ubica la entrada en su posicion dentro de la tabla existente', () => {
    const s = fake({ [CLAVE]: guardado(tabla(900, 300)) });
    const r = guardarEnRanking(exito(500), 'CASE', s, CONFIG, ahora);
    assert.equal(r.posicion, 1);
    assert.deepEqual(leerRanking(s, CONFIG).entradas.map((e) => e.nombre), ['P0', 'CASE', 'P1']);
  });

  test('un desenlace fallido o que no entra no guarda', () => {
    const s = fake();
    assert.equal(guardarEnRanking({ exito: false, puntaje: null }, 'X', s, CONFIG, ahora).guardado, false);
    assert.equal(s.datos[CLAVE], undefined);
    const llena = fake({ [CLAVE]: guardado(tabla(...Array.from({ length: TOPE }, () => 900))) });
    const r = guardarEnRanking(exito(100), 'X', llena, CONFIG, ahora);
    assert.equal(r.guardado, false);
    assert.equal(r.posicion, -1);
  });

  test('storage que lanza al guardar devuelve guardado false sin lanzar', () => {
    const r = guardarEnRanking(exito(500), 'X', roto, CONFIG, ahora);
    assert.equal(r.guardado, false);
    assert.deepEqual(r.entradas, []);
  });
});
