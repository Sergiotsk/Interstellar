import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import {
  TARGET_WIDTHS,
  resolveTargetWidth,
  deriveOutputs,
  sectionConfig,
  weightDelta,
  webpConviene,
} from '../tools/optimize-img.lib.mjs';

describe('tools/optimize-img.lib.mjs — lógica pura del pipeline (feature 007)', () => {
  describe('resolveTargetWidth(context, sourceWidth)', () => {
    test('tabla de anchos por contexto (Clarifications 2026-09-08)', () => {
      assert.equal(TARGET_WIDTHS['poster-hero'], 1280);
      assert.equal(TARGET_WIDTHS['backdrop-mundo'], 2560);
      assert.equal(TARGET_WIDTHS['galeria-miniatura'], 800);
      assert.equal(TARGET_WIDTHS['galeria-ampliada'], 1600);
      assert.equal(TARGET_WIDTHS['filmstrip-frame'], 900);
      assert.equal(TARGET_WIDTHS['retrato-personaje'], 720);
    });

    test('devuelve el ancho objetivo cuando la fuente es más grande', () => {
      assert.equal(resolveTargetWidth('backdrop-mundo', 3440), 2560);
      assert.equal(resolveTargetWidth('galeria-miniatura', 1280), 800);
    });

    test('nunca agranda: si la fuente es más chica, devuelve el ancho de la fuente', () => {
      assert.equal(resolveTargetWidth('backdrop-mundo', 1920), 1920);
      assert.equal(resolveTargetWidth('retrato-personaje', 500), 500);
    });

    test('fuente igual al objetivo → el objetivo', () => {
      assert.equal(resolveTargetWidth('galeria-ampliada', 1600), 1600);
    });

    test('contexto desconocido lanza', () => {
      assert.throws(() => resolveTargetWidth('no-existe', 1000), /contexto/i);
    });
  });

  describe('deriveOutputs(logicalName, sourceFormat)', () => {
    test('jpg → { webp, fallback:.jpg }', () => {
      assert.deepEqual(deriveOutputs('mundos-gargantua', 'jpg'), {
        webp: 'mundos-gargantua.webp',
        fallback: 'mundos-gargantua.jpg',
      });
    });

    test('normaliza jpeg → jpg', () => {
      assert.deepEqual(deriveOutputs('foo', 'jpeg'), {
        webp: 'foo.webp',
        fallback: 'foo.jpg',
      });
    });

    test('png conserva el formato del respaldo', () => {
      assert.deepEqual(deriveOutputs('bar', 'png'), {
        webp: 'bar.webp',
        fallback: 'bar.png',
      });
    });

    test('svg lanza (fuera del pipeline)', () => {
      assert.throws(() => deriveOutputs('icono', 'svg'), /svg/i);
    });
  });

  describe('sectionConfig(section)', () => {
    test('devuelve una lista de entradas { logicalName, context, kind }', () => {
      const entradas = sectionConfig('mundos-portada');
      assert.ok(Array.isArray(entradas));
      assert.ok(entradas.length > 0);
      for (const e of entradas) {
        assert.equal(typeof e.logicalName, 'string');
        assert.ok(e.logicalName.length > 0);
        assert.ok(e.context in TARGET_WIDTHS, `contexto inválido: ${e.context}`);
        assert.ok(e.kind === 'img' || e.kind === 'css', `kind inválido: ${e.kind}`);
      }
    });

    test('mundos-portada es CSS-only (todas las entradas kind:"css")', () => {
      for (const e of sectionConfig('mundos-portada')) {
        assert.equal(e.kind, 'css');
      }
    });

    test('mundos-portada incluye los backdrops de Miller/Mann/Tesseract, todos backdrop-mundo (scope ampliado 2026-09-09)', () => {
      const entradas = sectionConfig('mundos-portada');
      const nombres = entradas.map((e) => e.logicalName);
      for (const n of ['mundos-miller-arribo', 'mundos-mann-hielo', 'mundos-tesseract-reticula']) {
        assert.ok(nombres.includes(n), `falta ${n} en mundos-portada`);
      }
      for (const e of entradas) {
        if (/^mundos-(miller|mann|tesseract)-/.test(e.logicalName)) {
          assert.equal(e.context, 'backdrop-mundo', `${e.logicalName} debería ser backdrop-mundo`);
        }
      }
    });

    test('sección desconocida lanza', () => {
      assert.throws(() => sectionConfig('inexistente'), /secci[oó]n/i);
    });

    test('"--all" no es una sección', () => {
      assert.throws(() => sectionConfig('--all'), /secci[oó]n/i);
    });
  });

  describe('weightDelta(bytesAntes, bytesDespues)', () => {
    test('reducción del 40 % → pct 40, pasaMinimo true', () => {
      assert.deepEqual(weightDelta(1000, 600), { pct: 40, pasaMinimo: true });
    });

    test('reducción del 25 % justo → pasaMinimo true', () => {
      assert.deepEqual(weightDelta(1000, 750), { pct: 25, pasaMinimo: true });
    });

    test('reducción del 10 % → pasaMinimo false', () => {
      assert.deepEqual(weightDelta(1000, 900), { pct: 10, pasaMinimo: false });
    });

    test('sin reducción o más pesado → pct ≤ 0, pasaMinimo false', () => {
      assert.equal(weightDelta(1000, 1000).pct, 0);
      assert.equal(weightDelta(1000, 1200).pasaMinimo, false);
    });

    test('bytesAntes 0 → pct 0 (sin división por cero)', () => {
      assert.deepEqual(weightDelta(0, 0), { pct: 0, pasaMinimo: false });
    });
  });

  describe('webpConviene(webpBytes, respaldoBytes)', () => {
    test('webp más liviano que el respaldo → true (aporta, se escribe)', () => {
      assert.equal(webpConviene(600, 1000), true);
      assert.equal(webpConviene(1, 2), true);
    });

    test('webp igual o más pesado que el respaldo → false (no es optimización)', () => {
      assert.equal(webpConviene(1000, 1000), false);
      assert.equal(webpConviene(1201, 1000), false);
    });

    test('respaldo sin tamaño válido → false (no se puede establecer beneficio)', () => {
      assert.equal(webpConviene(500, 0), false);
      assert.equal(webpConviene(500, -1), false);
      assert.equal(webpConviene(500, NaN), false);
    });
  });
});
