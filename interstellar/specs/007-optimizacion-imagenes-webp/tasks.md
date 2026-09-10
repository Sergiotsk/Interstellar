---
description: "Task list — feature 007: optimización de imágenes + `<picture>`/WebP"
---

# Tasks: Optimización de imágenes + `<picture>`/WebP, incremental por sección

**Input**: Design documents from `specs/007-optimizacion-imagenes-webp/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: SÍ para la lógica pura del pipeline (Principio V — Strict TDD). El resto
(marcado, CSS, resultado visual) se valida por **aceptación** con el checklist de
`contracts/picture-markup.md`.

**Organización**: por user story. US1 = el pipeline (MVP). US2 = la migración de marcado por
sección. US3 = créditos/docs. Trabajo en `main`, un commit chico por tarea o grupo lógico.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede correr en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: US1 / US2 / US3 (fases de user story); Setup / Foundational / Polish sin label
- Rutas relativas a `interstellar/`

---

## Phase 1: Setup

**Purpose**: dejar el proyecto listo para tener un script de tooling.

- [X] T001 Agregar `sharp` como `devDependencies` (versión exacta pinneada) en `package.json`, y `"scripts": { "optimize": "node tools/optimize-img.mjs" }`. Correr `pnpm install` y verificar que `node -e "require('sharp')"` (o `import`) resuelve.
- [X] T002 [P] Crear el directorio `tools/` con un `tools/README.md` de una línea (qué es: scripts de mantenimiento del repo, corren local, NO en CI).
- [X] T003 [P] Confirmar en `.gitignore` que `assets/_source/` sigue ignorado y que `assets/img/*.webp` NO está ignorado (los derivados se versionan). Sin cambios si ya está bien; documentar en el commit.

**Checkpoint**: `pnpm install` OK, `sharp` disponible, `tools/` existe.

---

## Phase 2: Foundational (bloquea todo)

**Purpose**: la lógica pura del pipeline (config de secciones, anchos, nombres de salida),
con TDD. Es lo que consume el CLI y lo que se testea.

- [X] T004 [P] Escribir tests que FALLAN para `resolveTargetWidth(context, sourceWidth)` en `tests/optimize-img.test.js`: devuelve `min(anchoObjetivo[context], sourceWidth)`; tabla = poster-hero 1280 / backdrop-mundo 2560 / galeria-miniatura 800 / galeria-ampliada 1600 / filmstrip-frame 900 / retrato-personaje 720; `context` desconocido lanza.
- [X] T005 [P] Escribir tests que FALLAN para `deriveOutputs(logicalName, sourceFormat)` en `tests/optimize-img.test.js`: devuelve `{ webp: "<logicalName>.webp", fallback: "<logicalName>.<ext>" }`; `svg` → lanza / se marca ignorada.
- [X] T006 [P] Escribir tests que FALLAN para `sectionConfig(section)` en `tests/optimize-img.test.js`: devuelve la lista `{ logicalName, context, kind: "img"|"css" }` de esa sección (según data-model.md §Sección); sección desconocida lanza; `--all` no es una sección.
- [X] T007 [P] Escribir tests que FALLAN para `weightDelta(bytesAntes, bytesDespues)` en `tests/optimize-img.test.js`: devuelve `{ pct, pasaMinimo: pct >= 25 }`.
- [X] T008 Implementar `tools/optimize-img.lib.mjs` (ES module, funciones puras exportadas: `TARGET_WIDTHS`, `SECTION_MAP`, `resolveTargetWidth`, `deriveOutputs`, `sectionConfig`, `weightDelta`) hasta que T004–T007 pasen (`node --test` — NO `node --test tests/`, roto en Node 25.9.0).
- [X] T009 Poblar `SECTION_MAP` en `tools/optimize-img.lib.mjs` con las secciones y sus imágenes reales: recorrer `*.html` y `css/mundos.css`, listar cada imagen raster por `logicalName`, asignarle `context` y `kind`. Ajustar T006 si el conteo real difiere.

**Checkpoint**: `node --test` en verde; la lógica de config/anchos/nombres está cerrada.

---

## Phase 3: User Story 1 — El pipeline con un comando (Priority: P1) — MVP

**Goal**: `node tools/optimize-img.mjs <seccion>` produce en `assets/img/` los `.webp` +
respaldo redimensionados, es idempotente y no toca nada más.

**Independent Test**: correr el comando para `mundos-portada`, ver los derivados nuevos con
peso menor, correr de nuevo y comprobar `git status` limpio.

- [X] T010 [US1] Implementar el CLI `tools/optimize-img.mjs` según `contracts/optimize-img-cli.md`: parsea `<seccion>|--all` + `--dry-run`; para cada imagen de `sectionConfig`, resuelve la fuente (`assets/_source/img/<seccion>/<n>.<ext>` si existe, si no `assets/img/<n>.<ext>`); usa `optimize-img.lib.mjs` para ancho y nombres.
- [X] T011 [US1] Implementar el procesamiento `sharp` en `tools/optimize-img.mjs`: `resize({ width, withoutEnlargement: true })`; `.webp({ quality: 74, effort: 5 })` (80 para `retrato-personaje`); respaldo `.jpeg({ mozjpeg: true, quality: 78, progressive: true })` o `.png({ palette: true })` si tiene alfa; sin `withMetadata()`.
- [X] T012 [US1] Implementar idempotencia en `tools/optimize-img.mjs`: generar a buffer, comparar con el archivo existente, escribir SOLO si difiere; `--dry-run` no escribe.
- [X] T012b [US1] Guard WebP en `tools/optimize-img.mjs` (+ `webpConviene` puro en `optimize-img.lib.mjs`, con tests): el `.webp` se escribe SOLO si es estrictamente más liviano que su respaldo; si no, se descarta, se borra el `.webp` viejo y se deja un marcador vacío `<n>.nowebp` (versionado, cuenta para la idempotencia y le dice a la migración de marcado que esa imagen se queda sin `<picture>`). Reporte con flag `⚠`. Ver *Guard WebP* en el contrato y el edge case en `spec.md`.
- [X] T013 [US1] Implementar el reporte de consola y exit codes (0/1/2/3) según el contrato: por imagen `<flag> nombre  <wSrc>→<wOut>  <bytesAntes> → <bytesDespues> (−NN%)` (`·`/`=`/`⚠`); total de sección + warning si supera el tope conocido.
- [X] T014 [US1] Ejecutar `node tools/optimize-img.mjs mundos-portada` y validar: derivados creados, peso de los 5 backdrops de `mundos.html` ≤ 1,2 MB y cada uno ≤ 250 KB (FR-013), segunda corrida ⇒ `git status --porcelain assets/img/` vacío (SC-005). Commit de los derivados.

**Checkpoint**: el pipeline funciona de punta a punta sobre una sección real.

---

## Phase 4: User Story 2 — Marcado moderno y sin CLS por sección (Priority: P2)

**Goal**: cada sección sirve WebP con respaldo, sin salto de layout, con lazy correcto y
`fetchpriority` en el LCP.

**Independent Test** (por sección): abrir la página, DevTools → Network filtra `webp`; sin
reflow al cargar; sin `loading=lazy` arriba del fold; consola limpia; `node --test` verde.

> Cada sub-bloque = un commit. Regla: primero `node tools/optimize-img.mjs <seccion>` (si no
> se corrió aún), después migrar el marcado, después verificar contra el checklist de
> `contracts/picture-markup.md`.

### mundos-portada (backdrops de CSS — sección CSS-only)

> La portada scroll vive en `mundos-tierra`, `mundos-gargantua`, `mundos-miller`, `mundos-mann`
> y `mundos-tesseract` (`.mundo-portada*` + `js/mundo-portada.js`) y usa **solo
> `background-image` + canvas**, sin `<img>` propios.
> Los `<img>` de `mundos.html` son las tarjetas del hub → sección `mundos-hub` (T022).
>
> **Scope ampliado (2026-09-09):** el `SECTION_MAP['mundos-portada']` original (2026-09-08)
> solo cubría Tierra + Gargantúa (10 backdrops). Miller/Mann/Tesseract se rehicieron después
> del plan y suman 19 backdrops más → sección ampliada a **29**. `BACKDROP_MUNDO` +
> `SECTION_MAP` en `optimize-img.lib.mjs` actualizados, con test en `optimize-img.test.js`.

- [X] T015 [US2] En `css/mundos.css`, migrar los **29** `background-image: url("../assets/img/<n>.jpg")` de la portada scroll a `.webp`: Tierra/Gargantúa (`terra-granja`, `terra-maizal`, `terra-tormenta`, `terra-abandonada`, `mundos-gargantua`, `ciencia-gargantua`, `mundos-gargantua-{plano,endurance,ranger,deriva}`) + Miller (`mundos-miller-{arribo,vadeo,rasante,ola,impacto,muro,cabina}`) + Mann (`mundos-mann-{hielo,superficie,mann,engano,docking,tunel}`) + Tesseract (`mundos-tesseract-{reticula,caida,estante,empuje,mensaje,murph}`). Derivados generados por `node tools/optimize-img.mjs mundos-portada` (−49% en los 19 nuevos; 2ª corrida ⇒ `git status` limpio). Pendiente: verificación visual en navegador de las 5 páginas.
- [X] T016 [US2] N/A confirmado: la portada scroll de las 5 páginas es `background-image` + `<canvas>`, sin `<img>` propios. Los `<img>` de esas páginas son filmstrip (T021 / pendiente Miller-Mann-Tesseract) o tarjetas del hub (T022).

### galeria (50 `<img>`, ya tienen `loading`/`width`/`height`)

- [ ] T017 [US2] Ejecutar `node tools/optimize-img.mjs galeria`; verificar peso total bajo el tope de la feature 005 y −25% vs. estado previo. Commit de derivados.
- [ ] T018 [US2] En `galeria.html`, envolver los 50 `<img>` en `<picture>` con `<source type="image/webp">`, conservando `alt`/`width`/`height`/`loading="lazy"`; agregar `decoding="async"`.
- [ ] T019 [US2] En `galeria.html`, al **primer `<img>` en orden de DOM del grid** (`.galeria-grid > li:first-child img`): quitar `loading="lazy"` y agregar `fetchpriority="high"`. Solo ese; el resto queda con `loading="lazy"`.

### filmstrips

- [X] T020 [US2] Pipeline de `filmstrip-tierra` + `filmstrip-gargantua` ejecutado; derivados commiteados (`92992be`, `7fb5708`). Idempotente en 2ª corrida.
- [X] T021 [US2] `mundos-tierra.html` (20 `<img>`) y `mundos-gargantua.html` (15) migrados a `<picture>` + `<source type="image/webp">` + `width`/`height` intrínsecos + `decoding="async"` + `loading="lazy"` en todos. `css/mundos.css`: regla `.mundo-film-frame picture { display:block; height:100% }` (el `<picture>` no debe meter caja intermedia). `js/filmstrip.js` opera sobre `[data-film]`/`.mundo-film-track`, no toca `<img>` → sin cambios. Commit `815cf36`. **Pendiente: verificación visual en navegador.**

- [X] T021b [US2] **Filmstrips de Miller/Mann/Tesseract** (fuera del plan original — esas páginas se rehicieron después). Secciones nuevas `filmstrip-{mann,miller,tesseract}` en `optimize-img.lib.mjs` (12 + 16 + 10 frames) + `contextForImage` extendido; derivados de los 20 frames propios de tira generados a 900px (−58% a −66%), commit `3322a30`. `mundos-mann.html` (12) / `mundos-miller.html` (16) / `mundos-tesseract.html` (10): `<img>` migrados a `<picture>` + `<source webp>` + `width`/`height` intrínsecos + `decoding="async"` + `loading="lazy"`. Commit `e5e611a`. `mundos-miller.html` es LF (el resto CRLF) — se respetó. **Pendiente: verificación visual.**

### mundos-hub + fichas de mundos

- [X] T022 [US2] Pipeline de `mundos-hub` ejecutado; derivados commiteados (`ff0bb48`). `mundos.html`: las 5 tarjetas del hub migradas a `<picture>` + `<source type="image/webp">` + `width`/`height` + `decoding="async"`, `alt=""` conservado (decorativas). 1ª tarjeta (Tierra) con `fetchpriority="high"` sin `lazy` (candidata LCP), resto `loading="lazy"`. Commit `815cf36`. Las tarjetas no necesitan regla CSS: su `<img>` es `position:absolute`. **NOTA:** el "1 c/u" de `mundos-mann/miller/tesseract.html` del enunciado original ya no aplica — esas páginas se rehicieron y su hero es `background-image`, no `<img>`; sus únicos `<img>` son filmstrip (ver nota T021).

### personajes (6 `<img>`, HOY sin `width`/`height`/`loading`)

- [ ] T023 [US2] Ejecutar el pipeline para `personajes`; verificar −25% vs. estado previo en el reporte y anotarlo en el commit; commit de derivados.
- [ ] T024 [US2] En `personajes.html`, envolver los 6 retratos en `<picture>`; agregar `alt` con sentido donde falte, `width`/`height` (medir intrínsecos del respaldo), `decoding="async"`, `loading="lazy"` a los que estén bajo el fold. Verificar `.ficha-retrato` (float en desktop) sin regresión.

### ciencia + contacto + gracias

- [ ] T025 [US2] Ejecutar el pipeline para `ciencia` y `contacto` (verificar −25% en el reporte); migrar el `<img>` de `ciencia.html`, `contacto.html` y `gracias.html` a `<picture>` + atributos (`width`/`height`/`decoding`/`lazy`, `alt` con sentido). Commit.

### hero (solo poster)

- [X] T026 [US2] `hero-gargantua` procesado por el pipeline (contexto `poster-hero`, 1024×576) y commiteado con el filmstrip de Gargantúa (`7fb5708`). `index.html` sigue con `poster="assets/img/hero-gargantua.jpg"` sin `<picture>` (el atributo no lo admite) — sin cambios en el HTML, correcto por contrato §2.

**Checkpoint**: todas las secciones sirven WebP con respaldo; sin regresiones visuales.

---

## Phase 5: User Story 3 — Créditos y docs al día (Priority: P3)

**Goal**: los derivados no ensucian el registro; la doc refleja que ahora hay pipeline.

**Independent Test**: `node --test` verde; `assets/img/CREDITOS.md` sin filas nuevas por
`.webp`; el doc de aprendizaje ya no dice "sin pipeline / solo JPEG".

- [ ] T027 [P] [US3] En `assets/img/CREDITOS.md`: actualizar la nota/enmienda del 2026-08-28 ("solo JPEG, sin WebP") → "se sirve WebP con respaldo vía `tools/optimize-img.mjs` (feature 007)"; aclarar que los `.webp` derivados heredan el crédito del original y no se listan.
- [X] T028 [P] [US3] En `docs/10-aprendizaje/01-optimizacion-imagenes-web.md`: actualizar la sección "Formatos" y la nota final "srcset / `<picture>` … Fuera de alcance" → ahora el proyecto tiene pipeline local (`sharp`) y sirve `<picture>`/WebP; enlazar `specs/007-...`.
- [ ] T029 [US3] Correr `node --test` y confirmar verde; confirmar que `js/creditos.js` / `tests/creditos.test.js` NO necesitaron cambios (ningún test escanea `assets/img/`).

**Checkpoint**: registro de créditos coherente, documentación actualizada.

---

## Phase 6: Polish & Cross-Cutting

- [ ] T030 [P] Correr `node tools/optimize-img.mjs --all` y confirmar `git status` limpio (idempotencia global, SC-005).
- [ ] T031 [P] Verificar el deploy: `.github/workflows/deploy-pages.yml` NO referencia `tools/` ni scripts de `package.json` (`pnpm`/`npm run`); publica `assets/` tal cual (FR-014, SC-008).
- [ ] T032 Pasada visual final en navegador de todas las páginas migradas: sin 404 de imágenes, sin errores de consola, sin reflow; medir peso total de `assets/img/` antes/después y anotarlo en el commit final.
- [ ] T033 [P] Actualizar `DESIGN.md` si documenta reglas de imágenes (añadir el patrón `<picture>` + tabla de anchos) — omitir si no aplica.
- [ ] T034 Ejecutar el `quickstart.md` de punta a punta sobre una sección como smoke final.

---

## Dependencies & Execution Order

- **Phase 1 (Setup)** → sin dependencias.
- **Phase 2 (Foundational)** → depende de Setup. BLOQUEA US1/US2. TDD: T004–T007 (fallan) antes de T008.
- **Phase 3 (US1)** → depende de Foundational. Es el MVP.
- **Phase 4 (US2)** → cada sub-bloque depende de que US1 (el pipeline) exista; además cada sección necesita sus derivados generados (tarea de pipeline dentro del sub-bloque) antes de migrar su marcado. Los sub-bloques entre sí son independientes.
- **Phase 5 (US3)** → puede correr en cuanto la primera sección de US2 esté lista; no bloquea US2.
- **Phase 6 (Polish)** → depende de US2 completa.

### Parallel Opportunities

- T002, T003 en paralelo.
- T004–T007 (tests, mismo archivo pero secciones distintas — escribir juntos, corren juntos).
- Dentro de US2, los sub-bloques de secciones distintas pueden ir en paralelo por personas distintas (archivos distintos), respetando "un commit por sección".
- T027 y T028 en paralelo (archivos distintos).

---

## Implementation Strategy

### MVP (US1)

1. Phase 1 (Setup) → 2. Phase 2 (Foundational, TDD) → 3. Phase 3 (US1) → **parar y validar**:
el pipeline optimiza `mundos-portada`, es idempotente, baja el peso bajo presupuesto.

### Entrega incremental

- Setup + Foundational → la máquina.
- US1 sobre `mundos-portada` → primera sección optimizada (mayor ganancia: `mundos-gargantua.jpg` 337 KB → bajo 250 KB).
- US2 sección por sección, en el orden de `research.md` R6 (mundos-portada → galería → filmstrips → hub/fichas → personajes → ciencia/contacto → hero), un commit por sección.
- US3 al cerrar la primera sección.
- Polish al final.

---

## Notes

- `node --test tests/` está roto en Node 25.9.0 → usar `node --test` sin argumento.
- Commits: Conventional Commits, sin atribución a IA (constitución).
- Cada sección de US2 es un incremento independiente y verificable; no romper secciones ya migradas.
- No generar `srcset` multi-ancho ni AVIF (fuera de alcance).
