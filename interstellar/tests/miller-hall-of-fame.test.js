import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/miller/config.js';
import { leerHall, filasHall, guardarEnHall, PILOTOS_EJEMPLO } from '../js/minijuegos/miller/logica/hall-of-fame.js';
import { leerRanking } from '../js/minijuegos/comun/logica/ranking.js';

const memoria = () => {
  const datos = new Map();
  return { getItem: (k) => datos.get(k) ?? null, setItem: (k, v) => datos.set(k, String(v)) };
};

describe('miller/logica/hall-of-fame.js — leaderboard del original', () => {
  test('sin partidas: la tabla muestra los 4 pilotos de ejemplo del original', () => {
    assert.deepEqual(leerHall(memoria(), CONFIG), []);
    assert.deepEqual(filasHall([]).map((f) => [f.nombre, f.puntaje, f.rango]), [
      ['COOPER', 48500, 'S'],
      ['BRAND', 41200, 'A'],
      ['TARS', 32400, 'B'],
      ['CASE', 24800, 'C'],
    ]);
    assert.equal(PILOTOS_EJEMPLO.length, 4);
  });

  test('guardar: nombre en mayusculas de hasta 8, COOPER por defecto, y queda ordenado', () => {
    const s = memoria();
    guardarEnHall(s, CONFIG, { nombre: 'brand', puntaje: 30000, anos: '0.1y', rango: 'A' });
    guardarEnHall(s, CONFIG, { nombre: '', puntaje: 41000, anos: '0.1y', rango: 'S' });
    guardarEnHall(s, CONFIG, { nombre: 'muyLargoNombre', puntaje: 100, anos: '0.2y', rango: 'C' });
    const entradas = leerHall(s, CONFIG);
    assert.deepEqual(entradas.map((e) => e.nombre), ['COOPER', 'BRAND', 'MUYLARGO']);
    assert.equal(entradas[0].rango, 'S');
    assert.equal(entradas[0].anos, '0.1y');
  });

  test('tope de 10: el peor no entra', () => {
    const s = memoria();
    for (let i = 1; i <= 10; i++) guardarEnHall(s, CONFIG, { nombre: `P${i}`, puntaje: i * 1000, anos: '0y', rango: 'C' });
    const r = guardarEnHall(s, CONFIG, { nombre: 'MALO', puntaje: 10, anos: '0y', rango: 'C' });
    assert.equal(r.guardado, false);
    assert.equal(leerHall(s, CONFIG).length, 10);
  });

  test('el hub lo lee con comun/logica/ranking.js', () => {
    const s = memoria();
    guardarEnHall(s, CONFIG, { nombre: 'MURPH', puntaje: 39000, anos: '0.1y', rango: 'A' });
    assert.equal(leerRanking(s, CONFIG).entradas[0].puntaje, 39000);
  });

  test('sin almacenamiento o con almacenamiento roto no lanza', () => {
    const roto = { getItem: () => { throw new Error('bloqueado'); }, setItem: () => { throw new Error('lleno'); } };
    assert.deepEqual(leerHall(roto, CONFIG), []);
    assert.equal(guardarEnHall(roto, CONFIG, { nombre: 'X', puntaje: 5, anos: '0y', rango: 'C' }).guardado, false);
    assert.deepEqual(leerHall(undefined, CONFIG), []);
  });
});
