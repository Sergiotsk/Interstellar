import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { SPRITES, ANIMACIONES, LEYENDA } from '../js/minijuegos/miller/sprites.js';
import { PALETA_PIXEL } from '../js/minijuegos/miller/config.js';

describe('miller/sprites.js — sprites como mapas de caracteres (FR-024, R6)', () => {
  test('la leyenda solo usa indices de PALETA_PIXEL', () => {
    for (const [c, indice] of Object.entries(LEYENDA)) {
      assert.equal(c.length, 1);
      assert.notEqual(c, '.');
      assert.ok(Object.hasOwn(PALETA_PIXEL, indice), `${c} -> ${indice} no existe`);
    }
  });

  for (const [nombre, sprite] of Object.entries(SPRITES)) {
    test(`${nombre}: todos los frames miden ${sprite.ancho}x${sprite.alto} y usan caracteres validos`, () => {
      const frames = Object.entries(sprite.frames);
      assert.ok(frames.length > 0);
      for (const [id, filas] of frames) {
        assert.equal(filas.length, sprite.alto, `${nombre}/${id}: alto ${filas.length}`);
        filas.forEach((fila, y) => {
          assert.equal(fila.length, sprite.ancho, `${nombre}/${id} fila ${y}: ancho ${fila.length}`);
          for (const c of fila) assert.ok(c === '.' || Object.hasOwn(LEYENDA, c), `${nombre}/${id} fila ${y}: '${c}'`);
        });
      }
    });
  }

  test('tamanos del DesignSystem: astronauta 16x24, CASE 12x28, Ranger 96x40', () => {
    assert.deepEqual([SPRITES.astronauta.ancho, SPRITES.astronauta.alto], [16, 24]);
    assert.deepEqual([SPRITES.caseRobot.ancho, SPRITES.caseRobot.alto], [12, 28]);
    assert.deepEqual([SPRITES.ranger.ancho, SPRITES.ranger.alto], [96, 40]);
  });

  test('cada animacion apunta a frames que existen, con fps de 12 a 15', () => {
    for (const [nombre, a] of Object.entries(ANIMACIONES)) {
      assert.ok(SPRITES[a.sprite], `${nombre}: sprite ${a.sprite}`);
      assert.ok(a.frames.length > 0);
      for (const f of a.frames) assert.ok(SPRITES[a.sprite].frames[f], `${nombre}: falta frame ${f}`);
      assert.ok(a.fps >= 12 && a.fps <= 15, `${nombre}: fps ${a.fps}`);
      assert.equal(typeof a.loop, 'boolean');
    }
  });

  test('estan las animaciones que usa la escena', () => {
    for (const n of [
      'astronauta-quieto', 'astronauta-correr', 'astronauta-agacharse', 'astronauta-trofeo',
      'astronauta-aturdido', 'astronauta-tambaleo', 'astronauta-reloj',
      'ranger-quieto', 'ranger-despegue', 'baliza-pulso', 'case-quieto', 'case-aspa',
    ]) assert.ok(ANIMACIONES[n], `falta ${n}`);
  });

  test('hay tres variantes de restos', () => {
    assert.equal(Object.keys(SPRITES.restos.frames).length, 3);
  });

  test('ningun frame esta vacio', () => {
    for (const [nombre, sprite] of Object.entries(SPRITES)) {
      for (const [id, filas] of Object.entries(sprite.frames)) {
        assert.ok(filas.some((f) => /[^.]/.test(f)), `${nombre}/${id} vacio`);
      }
    }
  });
});
