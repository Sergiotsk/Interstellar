# tools/

Scripts de mantenimiento del repo. **Corren en local, en la máquina del desarrollador —
nunca en CI ni en el deploy.** Node ESM, sin framework. Sus salidas se commitean y se sirven
tal cual (constitución v2.3.0, § Principio I).

- `optimize-img.mjs` — optimiza imágenes a WebP + respaldo, por sección. Ver
  `specs/007-optimizacion-imagenes-webp/contracts/optimize-img-cli.md`.
  Uso: `node tools/optimize-img.mjs <seccion> [--dry-run]` o `--all`.
- `optimize-img.lib.mjs` — funciones puras del pipeline (anchos, nombres, mapa de
  secciones). Testeado en `tests/optimize-img.test.js`.
