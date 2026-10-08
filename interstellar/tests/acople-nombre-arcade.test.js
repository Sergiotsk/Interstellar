import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/acople/config.js';
import {
  crearEditor,
  cambiarLetra,
  moverCursor,
  escribir,
  borrar,
  textoEditor,
  teclaEditor,
  fijarCursor,
} from '../js/minijuegos/acople/logica/nombre-arcade.js';

const { largoNombre: LARGO, alfabeto: ALFABETO } = CONFIG.ranking;

describe('acople/logica/nombre-arcade.js — editor de nombre estilo fichin', () => {
  test('arranca con casillas en blanco y el cursor en la primera', () => {
    const ed = crearEditor('', CONFIG);
    assert.equal(ed.letras.length, LARGO);
    assert.ok(ed.letras.every((l) => l === ' '));
    assert.equal(ed.cursor, 0);
  });

  test('arranca precargado con el ultimo nombre (normalizado)', () => {
    const ed = crearEditor('murph', CONFIG);
    assert.equal(ed.letras.join(''), 'MURPH   ');
    assert.equal(textoEditor(ed), 'MURPH');
  });

  test('arriba/abajo recorren el alfabeto en circulo', () => {
    let ed = crearEditor('', CONFIG);
    ed = cambiarLetra(ed, 1, CONFIG);
    assert.equal(ed.letras[0], ALFABETO[0]);
    ed = cambiarLetra(crearEditor('', CONFIG), -1, CONFIG);
    assert.equal(ed.letras[0], ALFABETO.at(-2));
    ed = cambiarLetra(crearEditor('A', CONFIG), -1, CONFIG);
    assert.equal(ed.letras[0], ' ');
  });

  test('el cursor se mueve y no se sale de las casillas', () => {
    let ed = moverCursor(crearEditor('', CONFIG), -1, CONFIG);
    assert.equal(ed.cursor, 0);
    for (let i = 0; i < LARGO + 3; i++) ed = moverCursor(ed, 1, CONFIG);
    assert.equal(ed.cursor, LARGO - 1);
  });

  test('escribir pone la letra en mayuscula y avanza; ignora lo que no esta en el alfabeto', () => {
    let ed = escribir(crearEditor('', CONFIG), 'c', CONFIG);
    ed = escribir(ed, 'a', CONFIG);
    assert.equal(textoEditor(ed), 'CA');
    assert.equal(ed.cursor, 2);
    assert.equal(escribir(ed, '#', CONFIG), ed);
  });

  test('escribir en la ultima casilla no avanza mas alla', () => {
    let ed = crearEditor('', CONFIG);
    for (const c of 'INTERSTELLAR') ed = escribir(ed, c, CONFIG);
    assert.equal(textoEditor(ed), 'INTERSTR');
    assert.equal(ed.cursor, LARGO - 1);
  });

  test('borrar limpia la casilla anterior y retrocede; en la casilla actual si tiene letra y es la ultima', () => {
    let ed = escribir(escribir(crearEditor('', CONFIG), 'A', CONFIG), 'B', CONFIG);
    ed = borrar(ed, CONFIG);
    assert.equal(textoEditor(ed), 'A');
    assert.equal(ed.cursor, 1);
    assert.equal(borrar(crearEditor('', CONFIG), CONFIG).cursor, 0);
    let lleno = crearEditor('', CONFIG);
    for (const c of 'ABCDEFGH') lleno = escribir(lleno, c, CONFIG);
    assert.equal(textoEditor(borrar(lleno, CONFIG)), 'ABCDEFG');
  });

  test('teclaEditor traduce teclas a operaciones y avisa al confirmar', () => {
    const ed = crearEditor('', CONFIG);
    assert.equal(teclaEditor(ed, 'ArrowUp', CONFIG).editor.letras[0], ALFABETO[0]);
    assert.equal(teclaEditor(ed, 'ArrowRight', CONFIG).editor.cursor, 1);
    assert.equal(textoEditor(teclaEditor(ed, 'z', CONFIG).editor), 'Z');
    assert.equal(teclaEditor(ed, ' ', CONFIG).editor.cursor, 1);
    assert.equal(teclaEditor(ed, 'Enter', CONFIG).confirmar, true);
    assert.equal(teclaEditor(ed, 'Tab', CONFIG).manejada, false);
    assert.equal(teclaEditor(ed, 'F5', CONFIG).manejada, false);
    assert.equal(teclaEditor(ed, 'ArrowUp', CONFIG).manejada, true);
  });
});

describe('acople/logica/nombre-arcade.js — tocar una casilla (010 FR-021)', () => {
  test('mueve el cursor a la casilla tocada sin mutar el editor', () => {
    const ed = crearEditor('', CONFIG);
    const movido = fijarCursor(ed, 3, CONFIG);
    assert.equal(movido.cursor, 3);
    assert.equal(ed.cursor, 0);
  });

  test('indices fuera de rango se acotan a las casillas', () => {
    assert.equal(fijarCursor(crearEditor('', CONFIG), -2, CONFIG).cursor, 0);
    assert.equal(fijarCursor(crearEditor('', CONFIG), LARGO + 5, CONFIG).cursor, LARGO - 1);
  });

  test('un indice no entero devuelve el mismo editor', () => {
    const ed = crearEditor('', CONFIG);
    for (const i of [1.5, NaN, '2', null]) assert.equal(fijarCursor(ed, i, CONFIG), ed, String(i));
  });
});
