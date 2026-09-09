#!/usr/bin/env node
// Pipeline de optimización de imágenes (feature 007). Corre LOCAL, nunca en CI.
// Uso:  node tools/optimize-img.mjs <seccion> [--dry-run] [--force]
//       node tools/optimize-img.mjs --all       [--dry-run] [--force]
// Contrato: specs/007-optimizacion-imagenes-webp/contracts/optimize-img-cli.md

import { readFile, writeFile, access, stat, rm } from 'node:fs/promises';
import { constants as FS } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

import {
  SECTION_MAP,
  sectionConfig,
  resolveTargetWidth,
  deriveOutputs,
  weightDelta,
  webpQuality,
  webpConviene,
} from './optimize-img.lib.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const IMG_DIR = path.join(ROOT, 'assets', 'img');
const SRC_DIR = path.join(ROOT, 'assets', '_source', 'img');
const SRC_EXTS = ['jpg', 'jpeg', 'png'];

// Topes de peso heredados de features previas (FR-013). Solo advertencia.
const SECTION_BUDGETS = {
  'mundos-hub': { perFile: 250 * 1024, total: 1200 * 1024 }, // feature 002
};

const EXIT = { OK: 0, BAD_ARG: 1, SRC_MISSING: 2, PROCESS_ERR: 3 };

function parseArgs(argv) {
  const args = argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');
  const positional = args.filter((a) => !a.startsWith('--'));
  if (positional.length !== 1 && !args.includes('--all')) {
    return { error: 'Falta <seccion> o --all' };
  }
  const target = args.includes('--all') ? '--all' : positional[0];
  return { target, dryRun, force };
}

async function exists(p) {
  try { await access(p, FS.F_OK); return true; } catch { return false; }
}

// Devuelve { file, format, fromSource }, o null si no hay fuente.
// fromSource = true cuando el original vive en assets/_source/ (pristino y
// determinista); false cuando la fuente es el propio assets/img/ ya servido.
async function resolveSource(section, logicalName) {
  for (const ext of SRC_EXTS) {
    for (const dir of [path.join(SRC_DIR, section), SRC_DIR]) {
      const c = path.join(dir, `${logicalName}.${ext}`);
      if (await exists(c)) return { file: c, format: ext, fromSource: true };
    }
  }
  for (const ext of SRC_EXTS) {
    const c = path.join(IMG_DIR, `${logicalName}.${ext}`);
    if (await exists(c)) return { file: c, format: ext, fromSource: false };
  }
  return null;
}

async function buildBuffers(srcFile, context, format) {
  // Leemos la fuente a un Buffer: varias imágenes se optimizan sobre sí mismas
  // (source === destino) y en Windows libvips deja el archivo tomado si se pasa
  // la ruta, lo que rompe el writeFile posterior.
  const input = await readFile(srcFile);
  const meta = await sharp(input).metadata();
  const outWidth = resolveTargetWidth(context, meta.width);
  const resized = () =>
    sharp(input).resize({ width: outWidth, withoutEnlargement: true });

  const webpBuf = await resized()
    .webp({ quality: webpQuality(context), effort: 5 })
    .toBuffer();

  const alpha = meta.hasAlpha && format === 'png';
  const fallbackBuf = alpha
    ? await resized().png({ palette: true }).toBuffer()
    : await resized().jpeg({ mozjpeg: true, quality: 78, progressive: true }).toBuffer();

  return { meta, outWidth, webpBuf, fallbackBuf };
}

async function sizeOf(p) {
  try { return (await stat(p)).size; } catch { return 0; }
}

async function maybeWrite(destPath, buf, dryRun) {
  const current = await exists(destPath) ? await readFile(destPath) : null;
  if (current && current.equals(buf)) return { wrote: false, bytes: current.length };
  if (!dryRun) await writeFile(destPath, buf);
  return { wrote: true, bytes: buf.length };
}

function fmtKB(n) { return `${(n / 1024).toFixed(1)} KB`; }

async function processSection(section, dryRun, force) {
  const entries = sectionConfig(section);
  let before = 0;
  let after = 0;
  let missing = 0;
  let procErr = 0;
  let changed = 0;
  let skipped = 0;

  console.log(`\n▶ ${section}  (${entries.length} imágenes)${dryRun ? '  [dry]' : ''}`);

  for (const { logicalName, context, kind } of entries) {
    const src = await resolveSource(section, logicalName);
    if (!src) {
      console.log(`  ✖ ${logicalName}  — sin fuente en _source/ ni img/`);
      missing++;
      continue;
    }
    const { webp, fallback } = deriveOutputs(logicalName, src.format);
    const webpPath = path.join(IMG_DIR, webp);
    const nowebpPath = path.join(IMG_DIR, `${logicalName}.nowebp`);

    // Idempotencia (SC-005): si la fuente es el propio assets/img/ (no hay
    // original en _source/) y ya existe un derivado (el .webp, o el marcador
    // .nowebp si el webp se descartó por no convenir), la imagen ya pasó por el
    // pipeline. Re-encodear recomprimiría (pérdida generacional) y el árbol
    // nunca se estabilizaría → se saltea salvo --force.
    if (
      !src.fromSource && !force &&
      ((await exists(webpPath)) || (await exists(nowebpPath)))
    ) {
      console.log(`  = ${logicalName.padEnd(34)} ya optimizada (--force para regenerar)`);
      skipped++;
      continue;
    }

    // Peso "antes": lo que hoy sirve la página (el fallback si existe, si no la fuente).
    const beforeBytes =
      (await sizeOf(path.join(IMG_DIR, fallback))) || (await sizeOf(src.file));

    let bufs;
    try {
      bufs = await buildBuffers(src.file, context, src.format);
    } catch (err) {
      console.log(`  ✖ ${logicalName}  — sharp: ${err.message}`);
      procErr++;
      continue;
    }

    // El respaldo (jpg/png) se escribe siempre. Para backdrops de CSS queda
    // disponible aunque el CSS apunte al .webp.
    const f = await maybeWrite(path.join(IMG_DIR, fallback), bufs.fallbackBuf, dryRun);

    // Guard: el .webp solo se escribe si le gana en peso a su respaldo. Si no
    // conviene, se escribe un marcador .nowebp (para la idempotencia y para que
    // la migración de markup sepa apuntar al .jpg) y se borra cualquier .webp
    // viejo que hubiera quedado.
    const vale = webpConviene(bufs.webpBuf.length, bufs.fallbackBuf.length);
    let w;
    if (vale) {
      w = await maybeWrite(webpPath, bufs.webpBuf, dryRun);
      if (!dryRun && (await exists(nowebpPath))) await rm(nowebpPath);
    } else {
      const habiaWebp = await exists(webpPath);
      if (!dryRun) {
        if (habiaWebp) await rm(webpPath);
        await writeFile(nowebpPath, '');
      }
      w = { wrote: false, bytes: 0, descartado: true, habiaWebp };
    }

    const afterBytes = w.descartado
      ? f.bytes
      : (kind === 'css' ? w.bytes : Math.max(w.bytes, f.bytes));
    before += beforeBytes;
    after += afterBytes;
    if (w.wrote || f.wrote || w.descartado) changed++;

    const d = weightDelta(beforeBytes, afterBytes);
    const flag = w.descartado ? '⚠' : (w.wrote || f.wrote ? '·' : '=');
    const nota = w.descartado
      ? `  webp descartado: ${fmtKB(bufs.webpBuf.length)} ≥ respaldo ${fmtKB(bufs.fallbackBuf.length)}`
      : '';
    console.log(
      `  ${flag} ${logicalName.padEnd(34)} ${String(bufs.meta.width).padStart(4)}→${String(bufs.outWidth).padEnd(4)}  ` +
      `${fmtKB(beforeBytes).padStart(9)} → ${fmtKB(afterBytes).padStart(9)}  (${d.pct >= 0 ? '−' : '+'}${Math.abs(d.pct)}%)${nota}`,
    );
  }

  const total = weightDelta(before, after);
  console.log(
    `  ── total: ${fmtKB(before)} → ${fmtKB(after)}  (${total.pct >= 0 ? '−' : '+'}${Math.abs(total.pct)}%)  ` +
    `${changed} ${dryRun ? 'a actualizar' : 'actualizados'}, ${skipped} ya optimizadas`,
  );
  if (!total.pasaMinimo && before > 0 && changed > 0) {
    console.log(`  ⚠ no llega al −25 % (SC-002)`);
  }
  const budget = SECTION_BUDGETS[section];
  if (budget && after > budget.total) {
    console.log(`  ⚠ supera el tope de la sección (${fmtKB(budget.total)})`);
  }

  return { missing, procErr };
}

async function main() {
  const { target, dryRun, force, error } = parseArgs(process.argv);
  if (error) {
    console.error(`optimize-img: ${error}\nUso: node tools/optimize-img.mjs <seccion>|--all [--dry-run]`);
    console.error(`Secciones: ${Object.keys(SECTION_MAP).join(', ')}`);
    process.exit(EXIT.BAD_ARG);
  }

  const sections = target === '--all' ? Object.keys(SECTION_MAP) : [target];
  if (target !== '--all' && !SECTION_MAP[target]) {
    console.error(`optimize-img: sección desconocida "${target}"`);
    console.error(`Secciones: ${Object.keys(SECTION_MAP).join(', ')}`);
    process.exit(EXIT.BAD_ARG);
  }

  let missing = 0;
  let procErr = 0;
  for (const s of sections) {
    const r = await processSection(s, dryRun, force);
    missing += r.missing;
    procErr += r.procErr;
  }

  if (procErr > 0) process.exit(EXIT.PROCESS_ERR);
  if (missing > 0) process.exit(EXIT.SRC_MISSING);
  process.exit(EXIT.OK);
}

main();
