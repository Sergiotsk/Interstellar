// Maquina de estados del submenu (js/submenu-state.js): toggle(id), navigate(), dismiss().
// Ejecutar: node --test tests/

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createSubmenuState } from '../js/submenu-state.js';

test('createSubmenuState arranca con openSubmenuId = null (estado inicial cerrado)', () => {
  const estado = createSubmenuState();
  assert.equal(estado.openSubmenuId, null);
});

test('toggle abre un submenu cerrado', () => {
  const estado = createSubmenuState();
  estado.toggle('mundos');
  assert.equal(estado.openSubmenuId, 'mundos');
});

test('toggle sobre el mismo id cierra un submenu abierto (cerrado->abierto / abierto->cerrado)', () => {
  const estado = createSubmenuState();
  estado.toggle('personajes');
  assert.equal(estado.openSubmenuId, 'personajes');
  estado.toggle('personajes');
  assert.equal(estado.openSubmenuId, null);
});

test('abrir otro submenu cierra el actual (maximo uno abierto; evento abrir-otro)', () => {
  const estado = createSubmenuState();
  estado.toggle('mundos');
  assert.equal(estado.openSubmenuId, 'mundos');
  estado.toggle('ciencia');
  assert.equal(estado.openSubmenuId, 'ciencia');
});

test('navigate cierra el submenu abierto al activar un destino anidado (HU1-E4)', () => {
  const estado = createSubmenuState();
  estado.toggle('viaje');
  assert.equal(estado.openSubmenuId, 'viaje');
  estado.navigate();
  assert.equal(estado.openSubmenuId, null);
});

test('dismiss cierra el submenu y devuelve el id del control para restaurar foco (FR-010)', () => {
  const estado = createSubmenuState();
  estado.toggle('viaje');
  const controlObjetivo = estado.dismiss();
  assert.equal(estado.openSubmenuId, null);
  assert.equal(controlObjetivo, 'viaje');
});

test('dismiss sin submenu abierto no devuelve control objetivo', () => {
  const estado = createSubmenuState();
  assert.equal(estado.openSubmenuId, null);
  const controlObjetivo = estado.dismiss();
  assert.equal(controlObjetivo, null);
});

test('open abre un submenu sin cerrarlo si ya esta abierto (hover re-entrada; maximo uno abierto)', () => {
  const estado = createSubmenuState();
  estado.open('mundos');
  assert.equal(estado.openSubmenuId, 'mundos');
  estado.open('mundos');            // re-entrada hover: NO debe cerrar
  assert.equal(estado.openSubmenuId, 'mundos');
  estado.open('ciencia');           // abrir otro: cierra el actual
  assert.equal(estado.openSubmenuId, 'ciencia');
});