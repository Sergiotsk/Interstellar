import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

import { buildIco, ICO_SIZES } from '../tools/make-favicon.lib.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');

describe('tools/make-favicon.lib.mjs — escritor ICO (feature favicon)', () => {
  test('buildIco arma ICONDIR + entradas + blobs PNG pegados', () => {
    const images = ICO_SIZES.map((size) => ({ size, png: Buffer.from([size, 0, 0, 0]) }));
    const ico = buildIco(images);

    assert.equal(ico.readUInt16LE(0), 0, 'reserved');
    assert.equal(ico.readUInt16LE(2), 1, 'type = 1 (icon)');
    assert.equal(ico.readUInt16LE(4), images.length, 'count');

    const firstOffset = 6 + 16 * images.length;
    const e = 6; // primera entrada
    assert.equal(ico.readUInt8(e + 0), 16, 'ancho');
    assert.equal(ico.readUInt8(e + 1), 16, 'alto');
    assert.equal(ico.readUInt8(e + 2), 0, 'colores de paleta');
    assert.equal(ico.readUInt16LE(e + 4), 1, 'planos');
    assert.equal(ico.readUInt16LE(e + 6), 32, 'bits por píxel');
    assert.equal(ico.readUInt32LE(e + 8), 4, 'bytesInRes');
    assert.equal(ico.readUInt32LE(e + 12), firstOffset, 'offset del primer blob');
    assert.deepEqual(ico.subarray(firstOffset, firstOffset + 4), images[0].png, 'blob crudo');
    assert.equal(ico.length, firstOffset + images.reduce((n, img) => n + img.png.length, 0));
  });

  test('el tamaño 256 se codifica como 0 (convención ICO)', () => {
    const ico = buildIco([{ size: 256, png: Buffer.from([1, 2, 3]) }]);
    assert.equal(ico.readUInt8(6), 0);
    assert.equal(ico.readUInt8(7), 0);
  });
});

describe('favicon — páginas cableadas', () => {
  test('todas las páginas HTML declaran el favicon (SVG + ico + png + apple-touch)', async () => {
    const entradas = await readdir(ROOT);
    const htmls = entradas.filter((f) => f.endsWith('.html'));
    assert.ok(htmls.length >= 16, `esperaba >=16 páginas, hay ${htmls.length}`);

    for (const f of htmls) {
      const html = await readFile(path.join(ROOT, f), 'utf8');
      assert.match(html, /<link rel="icon" type="image\/svg\+xml" href="assets\/img\/favicon\.svg">/, f);
      assert.match(html, /<link rel="icon" href="favicon\.ico"/, f);
      assert.match(html, /<link rel="apple-touch-icon" href="assets\/img\/apple-touch-icon\.png">/, f);
    }
  });

  test('existe la fuente SVG y los derivados rasterizados', async () => {
    const salidas = [
      'assets/img/favicon.svg',
      'favicon.ico',
      'assets/img/favicon-16.png',
      'assets/img/favicon-32.png',
      'assets/img/apple-touch-icon.png',
    ];
    for (const f of salidas) {
      const buf = await readFile(path.join(ROOT, f));
      assert.ok(buf.length > 0, `${f} está vacío`);
    }
  });
});
