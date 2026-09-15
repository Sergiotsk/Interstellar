---

description: "Task list — 006-reset-css"
---

# Tasks: Fundación CSS — reset, tokens y arquitectura de 4 hojas

**Input**: Design documents from `specs/006-reset-css/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/hojas-css.md,
quickstart.md

**Tests**: NO se generan tareas de test. Es capa presentacional (Principio V) → se valida
contra los criterios de aceptación de `quickstart.md` (E1–E6). La suite JS existente solo
debe seguir en verde (T023).

**Organización**: por historia de usuario (US1 P1, US2 P2, US3 P3), para implementar y
validar cada incremento de forma independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede correr en paralelo (otro archivo, sin dependencia con tareas incompletas)
- **[Story]**: US1 / US2 / US3
- Rutas de archivo relativas a `interstellar/`

---

## Phase 1: Setup

**Purpose**: andamiaje de archivos y captura del estado "antes" para la comparación visual.

- [X] T001 [P] Crear los 4 archivos vacíos con solo su comentario de cabecera:
      `css/reset.css`, `css/variables.css`, `css/base.css`, `css/layout.css`
- [X] T002 Capturar el "antes": screenshots de las 9 páginas (`index`, `mundos`,
      `personajes`, `ciencia`, `viaje`, `galeria`, `trailer`, `minijuegos`, `creditos`) a
      ≈360 px y ≈1280 px sirviendo el sitio con `css/global.css`. Guardar fuera del repo
      (referencia para T014). Servir con `python -m http.server 8899` desde `interstellar/`.
      > Sin screenshots automatizados (navegador). En su lugar: **diff a nivel de declaración
      > CSS** (`global.css` vs las 4 hojas) — sin valores perdidos ni alterados salvo los 3
      > cambios de diseño de la spec (consolidación de `prefers-reduced-motion`, narrowing de
      > color/font de form-controls, reset total de `margin` + reposición exacta de los
      > defaults UA vivos). Comparación visual final: usuario la revisó y la dio correcta
      > (2026-09-03).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: `variables.css` completo — `base.css` y `layout.css` referencian sus tokens,
así que debe existir primero.

**⚠️ CRITICAL**: sin esto no arranca ninguna historia.

- [X] T003 Migrar `css/global.css` §0 (los 2 `@font-face`) y §1 (todo el bloque
      `:root { … }`: paleta, `--font-*`, `--focus-anillo`, `--backdrop-oscurecer`,
      `--color-case`) a `css/variables.css`, **sin cambiar ningún valor**
      (data-model Entidad 2; contract C4)

**Checkpoint**: tokens disponibles; se puede empezar US1.

---

## Phase 3: User Story 1 - Base neutral y sobreescribible (Priority: P1) 🎯 MVP

**Goal**: `global.css` disuelto en `reset.css` + `variables.css` + `base.css` +
`layout.css`, cargados en orden por 4 `<link>` en las 9 páginas; reset a especificidad 0;
cero regresión visual; `global.css` borrado.

**Independent Test**: quickstart E1 (estructura de 4 hojas, sin `@import`, `global.css` no
existe ni se referencia) + E2 (9 páginas × 2 anchos idénticas antes/después) + E3
(especificidad de `reset.css` ≤ (0,0,1,0); 5 reglas de prueba sobreescriben sin
`!important`).

### Implementación

- [X] T004 [P] [US1] `css/reset.css`: `:where(*, *::before, *::after) { box-sizing:
      border-box }` + `:where(*, *::before, *::after) { margin: 0 }` + `:where(html) {
      -webkit-text-size-adjust: 100%; text-size-adjust: 100% }` +
      `:where(body) { min-height: 100vh }` (research D1; FR-007, FR-008)
- [X] T005 [US1] `css/reset.css`: `:where(ul, ol) { list-style: none; padding: 0 }` +
      `:where(img, picture, svg, video, canvas) { display: block; max-width: 100% }` +
      `:where(input, button, textarea, select) { font: inherit }` +
      `:where(table) { border-collapse: collapse; border-spacing: 0 }`
      (FR-009, FR-010, FR-011, FR-012). Depende de T004 (mismo archivo).
- [X] T006 [US1] `css/reset.css`: `:where(a) { text-decoration: none; color: inherit }` +
      `:where(button) { background: none; border: 0; cursor: pointer }`
      (FR-013, FR-014). Depende de T005 (mismo archivo).
- [X] T007 [P] [US1] `css/base.css`: migrar de `global.css` §2 la parte de TEMA
      (`body { font-family: var(--font-sitio); color: var(--color-texto) }`;
      `h1–h6 { font-family: var(--font-hero-titulo); font-weight: 700; line-height: 1.2;
      color: var(--color-texto) }`; `a { color: var(--color-texto); text-decoration:
      underline; text-underline-offset: 0.2em }`) + unificar las 2 reglas `p` (§2
      `line-height: 1.6` + §3 `font-family: var(--font-texto)`) en una sola
      (data-model Entidad 3; contract C4)
- [X] T008 [US1] `css/base.css`: migrar `global.css` §6 (`:focus-visible { … }`) y §9
      (`scroll-margin` / `:target` de compensación de anclas), sin cambios
      (data-model Entidad 3). Depende de T007 (mismo archivo).
- [X] T009 [P] [US1] `css/layout.css`: migrar `global.css` §3 (`body { display: flex;
      flex-direction: column; background: var(--color-fondo) }`, `main`), §4, §4b
      (**incluido su bloque `@media (prefers-reduced-motion: reduce)` puntual, tal cual —
      se toca en US2**), §5, §7, §8, §10, sin cambios (data-model Entidad 4; contract C4)
- [X] T010 [US1] `css/layout.css`: migrar `global.css` §11, §12, §13, §14 (secciones de
      contenido de features 002–005) + los `@keyframes case-*`, sin cambios
      (data-model Entidad 4). Depende de T009 (mismo archivo).
- [X] T011 [US1] `css/base.css`: reponer el espaciado vertical que quitó el `margin: 0`
      global — `p`, `ul, ol`, y `li` si aplica — con selectores de elemento pelado.
      Calibrar el valor contra el "antes" (T002) hasta render idéntico (research D3;
      FR-004; edge case "espaciado de las páginas de contenido"). Depende de T007, T008.
- [X] T012 [US1] Reemplazar en las 9 páginas HTML el `<link rel="stylesheet"
      href="css/global.css">` por los 4 `<link>` en orden
      `reset → variables → base → layout` (contract C1; FR-020): `index.html`,
      `mundos.html`, `personajes.html`, `ciencia.html`, `viaje.html`, `galeria.html`,
      `trailer.html`, `minijuegos.html`, `creditos.html`. Depende de T003–T011 (las 4
      hojas deben existir con contenido).
- [X] T013 [US1] Borrar `css/global.css` del repo (FR-003; contract C3). Depende de T012.
- [X] T014 [US1] Verificar quickstart **E2**: comparar "antes" (T002) vs "después" en las 9
      páginas × 2 anchos (incluye Hero, drawer abierto, secciones de eje, galería). Cero
      diferencia perceptible. Si algo difiere → ajustar `css/base.css` (T011) y repetir.
      Depende de T013.
      > ✅ Usuario comparó las páginas servidas contra el estado de `main` y las dio
      > correctas (2026-09-03). Respaldo previo: diff de declaraciones CSS sin pérdidas
      > (ver T002). Zona de riesgo revisada: separación `<h3>`→`<p>` en las secciones de eje.
- [X] T015 [US1] Verificar quickstart **E1** y **E3**: `ls css/` sin `global.css`;
      `rg -l "global\.css" --glob '!specs/**' --glob '!docs/**' .` sin resultados;
      `rg -n "@import" css/` sin resultados; los 4 `<link>` en orden en las 9 páginas;
      auditar `css/reset.css` regla por regla (especificidad ≤ (0,0,1,0) salvo el `@media`
      de US2, que aún no está); prueba funcional de sobreescritura (5 reglas de un solo
      selector sobre `ul`/`ol`/`a`/`button`/`img` aplican sin `!important`); verificar
      **FR-018**: `rg -n '#[0-9a-fA-F]{3}|var\(--(color|font)' css/reset.css` no devuelve
      nada — `reset.css` no referencia paleta ni tipografías (sí puede usar `currentColor`,
      `inherit`, `0`, y el `0.01ms` del `@media`). Depende de T012.

**Checkpoint**: US1 funcional y verificable — el sitio se ve idéntico, con 4 hojas, sin
`global.css`.

---

## Phase 4: User Story 2 - prefers-reduced-motion global (Priority: P2)

**Goal**: un bloque global agresivo en `reset.css` neutraliza toda animación/transición CSS
del sitio; el bloque puntual de `layout.css` se elimina por redundante.

**Independent Test**: quickstart E4 — con "reducir movimiento" activo, ninguna de las 9
páginas anima; el botón CASE queda quieto; `rg "prefers-reduced-motion" css/` aparece solo
en `reset.css`.

### Implementación

- [X] T016 [US2] `css/reset.css`: agregar el bloque
      `@media (prefers-reduced-motion: reduce) { *, *::before, *::after {
      animation-duration: 0.01ms !important; animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important; scroll-behavior: auto !important } }`
      (research D4; FR-016 — única excepción a la especificidad 0). Depende de US1 (T004–T006).
- [X] T017 [US2] `css/layout.css`: eliminar el bloque
      `@media (prefers-reduced-motion: reduce)` puntual (el que migró T009, targetea
      `.case-icon span` y `header nav button`) — ya cubierto por T016 (FR-017;
      research D4). Depende de T016.
- [X] T018 [US2] Verificar quickstart **E4**: activar "reducir movimiento" en el SO,
      recargar las 9 páginas, abrir el menú CASE en cada una (ícono quieto, sin
      parpadeos), navegar; `rg -n "prefers-reduced-motion" css/` → solo `reset.css`.
      Depende de T017.
      > ✅ La **regla** `@media (prefers-reduced-motion: reduce)` vive solo en
      > `css/reset.css:92` (el otro match de `rg` es un comentario migrado literal en
      > `layout.css:378`, C4). Prueba visual: usuario confirmó (2026-09-02) que con
      > "Efectos de animación" OFF en Windows, todo el sitio —botón CASE incluido— queda
      > quieto.

**Checkpoint**: US1 + US2 funcionan; movimiento reducido respetado en todo el sitio.

---

## Phase 5: User Story 3 - Texto largo que no desborda (Priority: P3)

**Goal**: `overflow-wrap` en texto y encabezados evita scroll horizontal por palabras
largas.

**Independent Test**: quickstart E5 — palabra larga artificial en un `<p>` y un `<h2>` a
320 px no produce scroll horizontal en ninguna página.

### Implementación

- [X] T019 [US3] `css/reset.css`: agregar `:where(p, li, h1, h2, h3, h4, h5, h6,
      figcaption, dd) { overflow-wrap: break-word }` (research D1; FR-015). Depende de
      T016 (mismo archivo; se agrega después del bloque `@media` o antes, sin solaparse).
- [X] T020 [US3] Verificar quickstart **E5**: insertar temporalmente una palabra larga
      (`Supercalifragilistico-dilatacion-temporal-gargantua`) en un `<p>` y un `<h2>` de
      `mundos.html`, viewport a 320 px, confirmar que corta y no hay scroll horizontal;
      quitar la palabra. Depende de T019.
      > ✅ Verificado (Chrome, `mundos.html`, 2026-09-03). `getComputedStyle` confirma
      > `overflow-wrap: break-word` en `<p>` y `<h2>` (regla `:where(...)` de `reset.css`).
      > Con la palabra larga inyectada y `<main>` constreñido a 320 px (caja de contenido
      > 280 px), `scrollWidth === clientWidth` en ambos → desborde 0. Nota: la ventana
      > estaba maximizada y no se pudo forzar viewport real de 320 px; se simuló
      > constriñendo el contenedor (test conservador: los `clamp()` con `vw` darían fuente
      > MÁS chica a 320 px real, menos presión de desborde).

**Checkpoint**: las 3 historias funcionan de forma independiente.

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: prolijidad, verificación final y cierre.

- [X] T021 [P] `js/layout.js`: actualizar los comentarios que citan `global.css` →
      `layout.css` (cambio no funcional; los comentarios describen dónde vive el CSS de
      los partials que inyecta el módulo)
      > NO-OP: `rg "global\.css" js/` → sin resultados. `js/layout.js` no nombra la hoja.
      > (El único comentario con `global.css` fuera de specs estaba en `index.html:10` y en
      > 2 docs de proyecto — corregidos: `index.html`→`layout.css`,
      > `assets/img/CREDITOS.md`→`variables.css`, `proyecto-interstellar-base.md`→arquitectura
      > de 4 hojas.)
- [X] T022 [P] Verificar quickstart **E6**: `node --test tests/*.test.js` → 26/26
      (SC-009; la feature no toca lógica)
- [X] T023 Recorrer el **checklist de cierre** de `quickstart.md` (E1–E6) completo y
      marcarlo; confirmar SC-001..SC-009 de `spec.md`
      > Verificado por CLI: **E1** (4 hojas en orden, sin `global.css`, sin `@import`),
      > **E3** (todas las reglas de `reset.css` en `:where()` salvo el `@media`; FR-018 sin
      > paleta/fuentes), **E6** (`node --test` 26/26). Además: diff de declaraciones CSS sin
      > pérdidas. **E4** ✅ confirmado por el usuario (Windows, efectos de animación OFF).
      > **E5** ✅ verificado en Chrome (`overflow-wrap: break-word` activo, sin desborde a
      > 320 px). PENDIENTE (usuario, navegador): **E2** (comparación visual 9×2).
      > SC-002/004/005/007/008/009 ✅; SC-001/006 ✅ (auditoría); SC-003 pendiente de E2.
- [X] T024 Actualizar `.specify/memory/constitution.md` si el Sync Impact Report necesita
      mover algún ítem de "Follow-up" a "hecho" (solo si se tocó `specs/001–005`; en
      principio no) — verificación, probablemente no-op
- [X] T025 Commit del feature (Conventional Commit, sin atribución IA):
      `feat(css): arquitectura de 4 hojas + reset :where() (006)`.
      > Hecho: commit `9a710fb` en `feat/006-reset-css` (24 files, +1677/−239). Incluye las
      > 4 hojas nuevas, borrado de `css/global.css`, las 9 páginas HTML,
      > `.specify/memory/constitution.md` (v1.2.0), `assets/img/CREDITOS.md`,
      > `proyecto-interstellar-base.md` y `specs/006-reset-css/`. `js/layout.js` no cambió.
      > Esta anotación en tasks.md queda sin commitear (fold en un follow-up o `--amend`).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias.
- **Foundational (Phase 2 / T003)**: depende de T001. **BLOQUEA** todas las historias.
- **US1 (Phase 3)**: depende de T003.
- **US2 (Phase 4)**: depende de US1 (necesita `reset.css` y `layout.css` migrados).
- **US3 (Phase 5)**: depende de US1; y T019 depende de T016 (mismo archivo `reset.css`) →
  correr US2 antes que US3.
- **Polish (Phase 6)**: depende de las 3 historias.

### Within US1

- `reset.css`: T004 → T005 → T006 (mismo archivo, secuencial).
- `base.css`: T007 → T008 → T011 (mismo archivo, secuencial).
- `layout.css`: T009 → T010 (mismo archivo, secuencial).
- Las 3 cadenas (`reset` ∥ `base` ∥ `layout`) son **paralelas entre sí** (archivos
  distintos): T004 puede correr con T007 y con T009.
- T012 (links) espera a que las 4 hojas tengan contenido (T003–T011).
- T013 (borrar global) → T014 (verif. visual) → depende de T013.
- T015 (verif. estructura) depende de T012.

### Parallel Opportunities

- Setup: T001 solo.
- US1: la cadena de `reset.css` (T004–T006), la de `base.css` (T007–T008), y la de
  `layout.css` (T009–T010) corren en **paralelo** (3 archivos distintos). T011 cierra la de
  base tras T008.
- Polish: T021 ∥ T022 (archivos/acciones distintas).

---

## Parallel Example: US1

```text
# Tres cadenas en paralelo (archivos distintos):
Agente A: T004 -> T005 -> T006          (css/reset.css)
Agente B: T007 -> T008 -> T011          (css/base.css)   [T011 espera a T007+T008]
Agente C: T009 -> T010                  (css/layout.css)

# Al terminar las tres:
T012 (9 <link>) -> T013 (borrar global.css) -> T014 (verif. visual)
T015 (verif. estructura) tras T012
```

---

## Implementation Strategy

### MVP (solo US1)

1. Phase 1 (Setup) + Phase 2 (T003 variables.css).
2. Phase 3 (US1): las 3 cadenas de hojas → re-link 9 páginas → borrar `global.css` →
   verificar E1/E2/E3.
3. **PARAR y VALIDAR**: el sitio se ve idéntico, con 4 hojas, `global.css` no existe.
4. Ya es entregable: fundación CSS lista.

### Entrega incremental

1. Setup + Foundational → tokens listos.
2. US1 → verificar → **MVP** (arquitectura de 4 hojas + reset base).
3. US2 → verificar (E4) → movimiento reducido global.
4. US3 → verificar (E5) → sin desborde de texto.
5. Polish → tests, checklist, commit.

---

## Notes

- `[P]` = archivo distinto, sin dependencia con tareas incompletas.
- No hay tareas de test (capa presentacional; Principio V). La "verificación" es contra
  `quickstart.md` E1–E6.
- El riesgo real está en T011 (calibrar el espaciado repuesto) y T014 (comparación visual):
  la meta es render **byte-idéntico** al actual, no "un espaciado razonable".
- Commit al final del feature (T025); durante el trabajo, commits por grupo lógico si se
  quiere.
- No hacer `git add .` a ciegas (hay `assets/_source/` y `.specify/extensions/` sueltos,
  ya en `.gitignore`).
