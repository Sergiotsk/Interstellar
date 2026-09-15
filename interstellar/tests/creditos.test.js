import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCreditosContent, ASSET_CREDITS } from '../js/creditos.js';

describe('js/creditos.js — página de créditos y fuentes', () => {
  const content = buildCreditosContent();

  test('incluye la nota de fuentes del material visual (FR-013)', () => {
    assert.match(content, /Fuentes del material visual/i);
  });

  test('lista la atribución de los backdrops de Mundos (FR-006, ex-pie)', () => {
    for (const archivo of [
      'mundos-gargantua.jpg',
      'mundos-miller.jpg',
      'mundos-mann.jpg',
      'mundos-tesseract.jpg',
    ]) {
      assert.ok(content.includes(archivo), `falta el crédito de ${archivo}`);
    }
  });

  test('lista la atribución de los retratos de Personajes (FR-007, ex-pie)', () => {
    for (const archivo of [
      'personajes-cooper.jpg',
      'personajes-murph.jpg',
      'personajes-brand.jpg',
      'personajes-profesor-brand.jpg',
      'personajes-mann.jpg',
      'personajes-tars-case.jpg',
    ]) {
      assert.ok(content.includes(archivo), `falta el crédito de ${archivo}`);
    }
  });

  test('cubre el 100 % de los assets descargados del registro (SC-008)', () => {
    // Sincronía con assets/img/CREDITOS.md: 93 assets con estado `descargado`
    // (72 previos + 21 netos: el tramo "El despegue" de Cooper se re-curó de
    // 4 a 25 fotogramas consecutivos — 3000-3024, la secuencia real de
    // lanzamiento con fuerza G — tras detectar que el tramo anterior no era
    // la escena correcta. Murph sin cambios: 8 frames, 2 tramos de 4).
    // Licencia clara NASA/ESA/EHT/NOAA + fotogramas de la película (FILMGRAB /
    // cap-that.com). Los `pendiente` NO se listan hasta tener archivo
    // (convención de honestidad).
    assert.equal(ASSET_CREDITS.length, 93);
    for (const linea of ASSET_CREDITS) {
      // Cada línea: `<archivo>.<ext> — <atribución no vacía>` (jpg salvo
      // terra-orbita.webp, que necesita alpha para recortarse sobre el cielo).
      assert.match(linea, /^[a-z0-9-]+\.(jpg|webp) — \S.*$/, `formato inválido: ${linea}`);
    }
  });

  test('buildCreditosContent es pura: sin argumento = con ASSET_CREDITS', () => {
    assert.equal(buildCreditosContent(), buildCreditosContent(ASSET_CREDITS));
  });

  test('escapa el HTML de cada línea (no inyecta markup crudo)', () => {
    const salida = buildCreditosContent(['x.jpg — <b>a</b> & "b" (fuente)']);
    assert.ok(salida.includes('&lt;b&gt;a&lt;/b&gt;'));
    assert.ok(salida.includes('&amp;'));
    assert.ok(salida.includes('&quot;b&quot;'));
  });
});
