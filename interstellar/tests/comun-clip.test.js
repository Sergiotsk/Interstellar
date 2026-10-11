import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { crearClip } from '../js/minijuegos/comun/clip.js';

function ctxFalso() {
  const ctx = {
    decodificados: 0,
    fuentes: [],
    decodeAudioData: async () => {
      ctx.decodificados += 1;
      return { duracion: 2 };
    },
    createGain: () => ({ gain: { value: 1 }, connect: (n) => n }),
    createBufferSource: () => {
      const f = { buffer: null, iniciada: false, connect: (n) => n, start: () => (f.iniciada = true) };
      ctx.fuentes.push(f);
      return f;
    },
  };
  return ctx;
}

describe('comun/clip.js — voz grabada por el grafo de audio del juego', () => {
  test('descarga y decodifica una sola vez por contexto', async () => {
    let descargas = 0;
    const clip = crearClip('voz.mp3', async () => {
      descargas += 1;
      return new ArrayBuffer(8);
    });
    const ctx = ctxFalso();
    clip.precargar(ctx);
    await clip.sonar(ctx, {});
    await clip.sonar(ctx, {});
    assert.equal(descargas, 1);
    assert.equal(ctx.decodificados, 1);
    assert.equal(ctx.fuentes.length, 2);
    assert.ok(ctx.fuentes.every((f) => f.iniciada && f.buffer));
  });

  test('sin contexto o sin destino no suena ni rompe', async () => {
    const clip = crearClip('voz.mp3', async () => new ArrayBuffer(8));
    assert.equal(await clip.sonar(null, {}), false);
    assert.equal(await clip.sonar(ctxFalso(), null), false);
  });

  test('si la descarga falla queda en silencio', async () => {
    const clip = crearClip('voz.mp3', async () => {
      throw new Error('offline');
    });
    const ctx = ctxFalso();
    assert.equal(await clip.sonar(ctx, {}), false);
    assert.equal(ctx.fuentes.length, 0);
  });
});
