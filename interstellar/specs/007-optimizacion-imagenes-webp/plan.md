# Implementation Plan: Optimización de imágenes + `<picture>`/WebP, incremental por sección

**Branch**: `main` (excepción consciente, ver spec) | **Date**: 2026-09-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/007-optimizacion-imagenes-webp/spec.md`

## Summary

Se agrega un **script local de optimización de imágenes** (`tools/optimize-img.mjs`, Node
ESM sobre `sharp`) que, por sección, toma las imágenes fuente y produce en `assets/img/`
una versión **WebP** más una de **respaldo** en el formato original, redimensionadas al
ancho objetivo del contexto de uso. En paralelo, el marcado `<img>` de cada sección migra a
`<picture>` (source WebP + img de respaldo, con `width`/`height`, `loading` y `alt`), y las
imágenes de fondo de CSS pasan a apuntar al `.webp`. La migración es **por sección** y cada
una es un commit chico en `main`. El pipeline corre solo en local: GitHub Pages sigue
publicando los archivos tal cual (constitución v2.3.0). Los originales crudos no se
versionan; los `.webp` derivados heredan el crédito del original.

## Technical Context

**Language/Version**: JavaScript (Node.js ESM). Node 25.9.0 en la máquina del dev. El sitio
servido sigue siendo HTML/CSS/JS vanilla sin build.

**Primary Dependencies**: `sharp` (libvips) como **devDependency** de tooling — habilitada
por la constitución v2.3.0 (§ Principio I / "Dependencias de tooling"). Sin dependencias de
runtime nuevas. Sin cambios en `js/vendor/`.

**Storage**: sistema de archivos. Entradas: `assets/_source/img/<seccion>/` cuando exista
(local, gitignored) o el propio `assets/img/<archivo>` como fuente. Salidas: `assets/img/`
(versionado).

**Testing**: `node --test` nativo (`node:test`). **Gotcha del repo**: `node --test tests/`
(argumento de directorio) está roto en Node 25.9.0 → usar `node --test` sin argumento o
`node --test "tests/*.test.js"` (documentado en `docs/10-aprendizaje/01-...`). El pipeline
en sí es capa presentacional (glue de tooling) y se valida por aceptación (Principio V); si
se extrae una función pura de mapeo (nombre→derivados, elección de ancho) esa sí lleva test.

**Target Platform**: navegadores evergreen últimas 2 versiones (baseline de la constitución)
— WebP tiene soporte universal en esa baseline. Sitio bajo subpath
`https://sergiotsk.github.io/Interstellar/`, rutas relativas.

**Project Type**: sitio estático multipágina + un script de mantenimiento de repo.

**Performance Goals**: por sección migrada, ≥ 25 % menos peso de imágenes (SC-002);
contribución de imágenes al CLS ≈ 0 (SC-004); el poster del hero (LCP) sin diferir carga.

**Constraints**: sin paso de build en el deploy (FR-014); presupuestos de peso vigentes por
feature previa (002: cada backdrop de mundos ≤ 250 KB y total de los 5 ≤ 1,2 MB; 005:
tope de la galería). Idempotencia: re-run = 0 cambios en git (SC-005).

**Scale/Scope**: ~12 secciones; ~110 `<img>` (galería 50, filmstrip tierra 20, filmstrip
gargantúa 15, mundos hub 5, personajes 6, sueltas 1 c/u) + ~10 imágenes de fondo en
`css/mundos.css` + el poster del hero.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Regla de la constitución | ¿Cumple? | Nota |
|---|---|---|
| I — Stack vanilla, sin framework de app/UI, sin preprocesador CSS | ✅ | `sharp` es tooling de imágenes, no framework ni preprocesador. No entra JSX/TS. |
| I — Sin paso de build (en publicación) | ✅ | El script corre local, fuera de CI; sus salidas se commitean y se sirven tal cual. Explícito en v2.3.0. |
| I — devDependency de tooling justificada | ✅ | Justificada acá: `sharp` hace resize + WebP + JPEG mozjpeg en una sola herramienta rápida; alternativas (CLIs sueltos, `@squoosh/cli` archivado, Pillow sin runtime Python) descartadas — ver research.md. |
| II — HTML semántico, `<img>` con `alt` | ✅ | `<picture>` es semántico; la migración corrige `alt` faltantes y agrega `width`/`height`. |
| III — Construcción en capas (base antes que efectos) | ✅ | Es optimización de la capa base; no suma efectos. |
| IV — Comprensión sobre generación | ✅ | El script es corto y legible (un `sharp` chain por contexto); se documenta en `quickstart.md` y en el doc de aprendizaje. |
| V — TDD en lógica, aceptación en presentación | ✅ | El pipeline se valida por aceptación; si se extrae mapeo puro, lleva test rojo previo. |
| VI — Atribución obligatoria | ✅ | Los derivados heredan crédito; el registro de originales no cambia; se actualiza la nota "solo JPEG". |
| Restricciones — 4 hojas CSS, orden | ✅ | No se toca la arquitectura CSS; solo cambian URLs dentro de `css/mundos.css`. |
| Restricciones — presupuesto de peso | ✅ (objetivo) | FR-013: cada sección no supera el tope vigente y baja respecto del estado previo. |
| Restricciones — rutas relativas | ✅ | Las salidas y los `srcset` usan rutas relativas. |

**Resultado**: PASS. Sin violaciones que justificar → sección "Complexity Tracking" vacía.

## Project Structure

### Documentation (this feature)

```text
specs/007-optimizacion-imagenes-webp/
├── plan.md              # Este archivo
├── research.md          # Fase 0 — decisiones técnicas (sharp, anchos, <picture>, créditos)
├── data-model.md        # Fase 1 — entidades: imagen fuente, derivados, contexto, sección
├── quickstart.md        # Fase 1 — cómo correr el pipeline y verificar una sección
├── contracts/
│   ├── optimize-img-cli.md      # Contrato del comando: args, entradas, salidas, exit codes
│   └── picture-markup.md        # Contrato del marcado <picture> y del swap en CSS
└── tasks.md             # Fase 2 (/speckit-tasks) — NO lo crea /speckit-plan
```

### Source Code (repository root — `interstellar/`)

```text
interstellar/
├── package.json                 # + devDependencies.sharp ; + scripts.optimize (opcional)
├── tools/
│   └── optimize-img.mjs         # NUEVO — el pipeline (Node ESM)
├── assets/
│   ├── _source/img/<seccion>/   # LOCAL, gitignored — originales cuando existan
│   └── img/                     # <nombre>.webp + <nombre>.<ext> (respaldo) — versionado
├── css/
│   └── mundos.css               # background-image: url(...jpg) -> url(...webp)
├── *.html                       # <img ...> -> <picture><source type=image/webp><img ...></picture>
├── assets/img/CREDITOS.md       # actualizar nota "solo JPEG" (2026-08-28)
├── docs/10-aprendizaje/01-optimizacion-imagenes-web.md  # actualizar a "hay pipeline"
└── tests/                       # sin cambios obligatorios (nada escanea assets/img/)
```

**Structure Decision**: sitio estático multipágina existente + un único script nuevo en
`tools/`. No se introduce estructura `src/`. El pipeline es un archivo autónomo, sin
subcarpetas. La aplicación por sección toca `*.html` y `css/mundos.css` de a poco.

## Complexity Tracking

> Sin violaciones de la Constitution Check. Nada que justificar.

## Phase 0 — Research

Ver [research.md](./research.md). Resuelve:

- **R1**: elección de `sharp` vs alternativas (CLIs, `@squoosh/cli`, Pillow) — cerrado.
- **R2**: formato de salida y parámetros (WebP `quality`/`effort`, JPEG `mozjpeg`,
  metadata, determinismo/idempotencia).
- **R3**: anchos objetivo por contexto de uso (poster hero, miniatura y lightbox de
  galería, frame de filmstrip, retrato de personaje, backdrop de mundo, backdrop CSS).
- **R4**: patrón `<picture>` + fallback, y el swap directo a `.webp` en CSS `background-image`
  (con/ sin `image-set()`).
- **R5**: manejo de créditos de derivados (confirmado: ningún test escanea `assets/img/`;
  los `.webp` no se listan).
- **R6**: orden de secciones y criterio de "sección lista para migrar".
- **R7**: cómo medir peso e idempotencia (comparación antes/después, `git status` limpio en
  re-run).

## Phase 1 — Design & Contracts

- [data-model.md](./data-model.md) — entidades y reglas (nombres de derivados, selección de
  ancho, relación fuente→derivados, unidad "sección").
- [contracts/optimize-img-cli.md](./contracts/optimize-img-cli.md) — contrato del comando
  `node tools/optimize-img.mjs [<seccion>|--all] [--dry-run]`: entradas, salidas, códigos de
  salida, garantía de idempotencia, qué NO toca.
- [contracts/picture-markup.md](./contracts/picture-markup.md) — forma exacta del `<picture>`
  para contenido, de la imagen suelta para el poster del hero, y del `url(...webp)` en CSS.
- [quickstart.md](./quickstart.md) — pasos para optimizar y verificar una sección de punta a
  punta (correr, revisar peso, revisar visual, correr tests, commitear).

**Re-check Constitution post-design**: sin cambios respecto del gate inicial — PASS.

## Next

`/speckit-tasks` para generar `tasks.md` (breakdown dependency-ordered): setup del pipeline
→ contexto+anchos → migración sección por sección → actualización de docs/créditos.
