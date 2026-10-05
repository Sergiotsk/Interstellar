#!/usr/bin/env node
// Genera el favicon desde assets/img/favicon.svg. Corre LOCAL; los derivados se commitean.
// Uso:  node tools/make-favicon.mjs [--dry-run]

import { readFile, writeFile, access } from 'node:fs/promises';
import { constants as FS } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

import { ICO_SIZES, buildIco } from './make-favicon.lib.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const IMG_DIR = path.join(ROOT, 'assets', 'img');
const SVG_SRC = path.join(IMG_DIR, 'favicon.svg');
const TILE = '#0a0b12'; // fondo para iOS (sin alpha)
const SVG_REL = 'assets/img/favicon.svg';

const PNG_OUT = [
  { size: 16, file: path.join(IMG_DIR, 'favicon-16.png') },
  { size: 32, file: path.join(IMG_DIR, 'favicon-32.png') },
];
const APPLE = { size: 180, file: path.join(IMG_DIR, 'apple-touch-icon.png') };
const ICO_OUT = path.join(ROOT, 'favicon.ico'); // raíz del sitio

async function exists(p) {
  try { await access(p, FS.F_OK); return true; } catch { return false; }
}

// `density` alta: sharp rasteriza el SVG (64 unidades) antes del resize; sin ella sale borroso.
function render(svg, size, { flatten = false } = {}) {
  const density = Math.max(72, Math.ceil((size / 64) * 72 * 2));
  let img = sharp(svg, { density }).resize(size, size);
  if (flatten) img = img.flatten({ background: TILE });
  return img.png().toBuffer();
}

async function maybeWrite(dest, buf, dryRun) {
  const current = (await exists(dest)) ? await readFile(dest) : null;
  const rel = path.relative(ROOT, dest).replaceAll('\\', '/');
  if (current && current.equals(buf)) {
    console.log(`  = ${rel}  (sin cambios)`);
    return false;
  }
  if (!dryRun) await writeFile(dest, buf);
  console.log(`  ${dryRun ? '·' : '+'} ${rel}  (${(buf.length / 1024).toFixed(1)} KB)`);
  return true;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  if (!(await exists(SVG_SRC))) {
    console.error(`make-favicon: falta la fuente ${SVG_REL}`);
    process.exit(1);
  }
  const svg = await readFile(SVG_SRC);
  console.log(`\n▶ favicon  (fuente: ${SVG_REL})${dryRun ? '  [dry]' : ''}`);

  for (const { size, file } of PNG_OUT) {
    await maybeWrite(file, await render(svg, size), dryRun);
  }
  await maybeWrite(APPLE.file, await render(svg, APPLE.size, { flatten: true }), dryRun);

  const ico = [];
  for (const size of ICO_SIZES) ico.push({ size, png: await render(svg, size) });
  await maybeWrite(ICO_OUT, buildIco(ico), dryRun);

  console.log('  ── listo');
}

main();
