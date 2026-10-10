import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/acople/config.js';
import { filasRanking, textoPuesto } from '../js/minijuegos/comun/logica/tabla-ranking.js';

const entradas = [
  { nombre: 'COOPER', puntaje: 8004 },
  { nombre: 'BRAND', puntaje: 7705 },
];

describe('comun/logica/tabla-ranking.js — filas de la tabla de puntajes', () => {
  test('completa hasta el tope con filas vacias, puesto con dos digitos y miles con punto', () => {
    const filas = filasRanking(entradas, -1, CONFIG);
    assert.equal(filas.length, CONFIG.ranking.tope);
    assert.deepEqual(filas[0], { puesto: '01', nombre: 'COOPER', puntaje: '8.004', resaltada: false, vacia: false });
    assert.equal(filas[2].vacia, true);
    assert.equal(filas[9].puesto, '10');
  });

  test('resalta la fila indicada', () => {
    const filas = filasRanking(entradas, 1, CONFIG);
    assert.equal(filas[1].resaltada, true);
    assert.equal(filas.filter((f) => f.resaltada).length, 1);
  });

  test('sin completar devuelve solo las filas con datos', () => {
    assert.equal(filasRanking(entradas, -1, CONFIG, { completar: false }).length, 2);
    assert.deepEqual(filasRanking([], -1, CONFIG, { completar: false }), []);
  });
});

describe('comun/logica/tabla-ranking.js — texto del puesto conseguido', () => {
  test('primer puesto es nuevo record; el resto indica el puesto; fuera del ranking, nada', () => {
    assert.equal(textoPuesto(0), '★ Nuevo récord');
    assert.equal(textoPuesto(3), '★ Entraste al ranking · puesto 4');
    assert.equal(textoPuesto(-1), '');
  });
});
