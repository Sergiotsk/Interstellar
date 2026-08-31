---
description: "Task list — Galería de imágenes (feature 005)"
---

# Tasks: Galería de imágenes

**Input**: Design documents from `/specs/005-galeria/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/galeria-page.md`, `quickstart.md`

**Tests**: NO se generan tareas de test. La feature es capa presentacional pura (Principio V:
aceptación en la presentación). La única tocada en `tests/` (contador de `ASSET_CREDITS`
15 → 28) ya se hizo en la fase de sourcing y está commiteada (`69b792c`).

**Organización**: tareas agrupadas por historia de usuario. Todas las de implementación
tocan `galeria.html` y `css/global.css`, así que dentro de una misma fase NO son
paralelas entre sí (mismo archivo); el marcador `[P]` solo aparece donde de verdad no hay
conflicto de archivo.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede correr en paralelo (archivo distinto, sin dependencias)
- **[Story]**: `[US1]` / `[US2]` / `[US3]` según `spec.md`
- Ruta de archivo exacta en cada descripción

## Path Conventions

Sitio estático en la raíz del repo (`interstellar/`): HTML en `/`, CSS en `css/`, imágenes
en `assets/img/`. Sin `src/` ni build.

---

## Phase 1: Setup (verificación de base)

**Purpose**: confirmar que el punto de partida está sano antes de maquetar.

- [X] T001 Verificar baseline: `node --test tests/creditos.test.js tests/layout.test.js tests/submenu-state.test.js tests/smoke.test.js` da 26/26 en verde, y las 13 imágenes nuevas están en `assets/img/` (`mundos-tierra-tormenta.jpg`, `mundos-miller-oceano.jpg`, `mundos-mann-hielo.jpg`, `mundos-tierra-granja.jpg`, `viaje-endurance.jpg`, `viaje-tierra-orbita.jpg`, `viaje-tierra-lejana.jpg`, `personajes-murph-nina.jpg`, `personajes-murph-adulta.jpg`, `personajes-murph-anciana.jpg`, `ciencia-gargantua.jpg`, `ciencia-tesseract.jpg`, `ciencia-agujero-gusano.jpg`), cada una ≤ 250 KB.

---

## Phase 2: Foundational (prerequisito bloqueante)

**Purpose**: el CSS de la cuadrícula y el esqueleto de `galeria.html`. Sin esto ninguna
historia de usuario se puede maquetar.

**⚠️ CRÍTICO**: US1/US2/US3 no pueden empezar hasta terminar esta fase.

- [X] T002 Agregar la **sección 14 «Galería (feature 005 — galeria)»** al final de `css/global.css`, con el encabezado de sección al estilo de las secciones 10–13. Selectores según `contracts/galeria-page.md` §3: `.galeria-grid` (`list-style:none; margin:1.5rem 0 0; padding:0; display:grid; gap:0.75rem; grid-template-columns:repeat(auto-fill, minmax(min(100%, 16rem), 1fr));`), `.galeria-grid > li` (`min-width:0`), `.galeria-grid figure` (`margin:0`), `.galeria-grid figure > a` (`display:block; background:var(--color-superficie)`), `.galeria-grid img` (`display:block; width:100%; height:auto; aspect-ratio:3/2; object-fit:cover`), `.galeria-grid figcaption` (`margin-top:0.4rem; font-family:var(--font-texto); font-size:0.9rem; color:var(--color-texto-atenuado); line-height:1.5`), `.galeria-eje-enlace` (`display:inline-block; font-family:var(--font-nav); color:var(--color-texto-atenuado)` + subrayado sutil + margen inferior). Solo tokens existentes; sin `@keyframes`, sin token nuevo, sin segundo color saturado (S1–S5, FR-014, FR-015).
- [X] T003 Reescribir el `<main>` de `galeria.html`: quitar el `<section>` placeholder actual y dejar el esqueleto — primera `<section>` con `<h1>Galería</h1>` + un `<p>` de intro breve (qué reúne la galería, organizada por los cuatro ejes), seguida de 4 `<section>` **vacías** con `id="mundos"`, `id="personajes"`, `id="ciencia"`, `id="viaje"` (en ese orden), cada una con solo su `<h2>` (`Mundos` / `Personajes` / `La Ciencia` / `El Viaje`). Conservar `<head>`, `<body>` sin clase `home` y `<script type="module" src="js/layout.js">`. Sin `<header>`/`<footer>`/`<style>`/`<script>` propios (C1, C2, C10, C11).

**Checkpoint**: la página carga, muestra el título y 4 secciones tituladas vacías; el CSS
de la cuadrícula existe pero todavía no hay figuras.

---

## Phase 3: User Story 1 — Recorrer las imágenes del sitio en un solo lugar (Priority: P1) 🎯 MVP

**Goal**: las 4 categorías con su cuadrícula completa de figuras (28 imágenes), cada una
con `alt` y pie; ningún placeholder.

**Independent Test**: abrir `galeria.html`, ver las 4 categorías en orden con sus
cuadrículas llenas; contar 9 / 10 / 5 / 4 figuras; cada imagen que ya usaban los ejes está
presente sin archivo duplicado (`quickstart.md` E1, E2).

- [X] T004 [US1] En `galeria.html`, sección `#mundos`: agregar `<ul class="galeria-grid">` con **9** `<li><figure>` según `data-model.md` (Mundos): `mundos-tierra.jpg`, `mundos-tierra-tormenta.jpg`, `mundos-tierra-granja.jpg`, `mundos-gargantua.jpg`, `mundos-miller.jpg`, `mundos-miller-oceano.jpg`, `mundos-mann.jpg`, `mundos-mann-hielo.jpg`, `mundos-tesseract.jpg`. Cada `<figure>`: `<img>` con `src` relativo a `assets/img/`, `alt` descriptivo no vacío, `loading="lazy"`, `width`/`height` reales (1280×720; `mundos-tierra-granja` 960×402), envuelto en `<a href="assets/img/<archivo>">`; `<figcaption>` hermano del `<a>` con qué muestra + «Eje Mundos». Sin `<div>` intermedio (C4–C7).
- [X] T005 [US1] En `galeria.html`, sección `#personajes`: `<ul class="galeria-grid">` con **10** `<li><figure>` (Personajes de `data-model.md`): `personajes-cooper.jpg`, `personajes-murph.jpg`, `personajes-murph-nina.jpg`, `personajes-murph-adulta.jpg`, `personajes-murph-anciana.jpg`, `personajes-brand.jpg`, `personajes-profesor-brand.jpg`, `personajes-mann.jpg`, `personajes-tars-case.jpg`, `personajes-astronauta.jpg`. Mismo patrón de `<figure>` que T004 (`alt`, `loading="lazy"`, `width`/`height` — `murph-nina` y `murph-anciana` 960×402, el resto 1280×720; `<a>`, `<figcaption>` con «Eje Personajes»).
- [X] T006 [US1] En `galeria.html`, sección `#ciencia`: `<ul class="galeria-grid">` con **5** `<li><figure>` (La Ciencia de `data-model.md`): `ciencia-agujero-negro.jpg`, `hero-backdrop.jpg`, `ciencia-gargantua.jpg`, `ciencia-tesseract.jpg`, `ciencia-agujero-gusano.jpg`. Mismo patrón de `<figure>`; `<figcaption>` con qué muestra + «Eje La Ciencia»; sin datos científicos ni etiquetas de rigor `✓`/`~`/`✎` en los pies (C7).
- [X] T007 [US1] En `galeria.html`, sección `#viaje`: `<ul class="galeria-grid">` con **4** `<li><figure>` (El Viaje de `data-model.md`): `viaje-pilares-de-creacion.jpg`, `viaje-endurance.jpg`, `viaje-tierra-orbita.jpg`, `viaje-tierra-lejana.jpg`. Mismo patrón de `<figure>`; `<figcaption>` con qué muestra + «Eje El Viaje».
- [X] T008 [US1] Revisar los 28 `alt` y 28 `<figcaption>` de `galeria.html`: `alt` describe la imagen para quien no la ve; el pie no repite el `alt` literal y sí nombra el eje; español, tono descriptivo/cinematográfico (SC-010). Ajustar redacción donde haga falta.
- [X] T009 [US1] Verificar en el DOM servido: 1 solo `<h1>`; 4 `<section id>` con ids exactos y en orden; conteo de `<figure>` por sección = 9 / 10 / 5 / 4 (total 28); ningún texto placeholder («Esta sección reunirá…»); ningún archivo de `assets/img/` referenciado dos veces (`quickstart.md` E1, E2; SC-001, SC-002, SC-003).

**Checkpoint**: MVP funcional — la galería se recorre completa por los cuatro ejes.

---

## Phase 4: User Story 2 — Ver una imagen en detalle y saber de dónde viene (Priority: P2)

**Goal**: cada miniatura abre la imagen aislada sin recorte; la atribución de las 28 está
en `creditos.html` (sincronía 1:1 ya hecha en el sourcing).

**Independent Test**: activar una miniatura (clic y teclado) → se abre
`assets/img/<archivo>.jpg` sola, sin el recorte 3:2; seguir el enlace del pie a
`creditos.html` → la imagen figura con su fuente y atribución (`quickstart.md` E3).

- [X] T010 [US2] Verificar que cada `<figure>` de `galeria.html` envuelve el `<img>` en un `<a href="assets/img/<archivo>">` con ruta **relativa** (nunca `/` inicial ni URL de dominio), y que activarlo (clic + Enter con foco) abre la imagen sola en el navegador, sin recorte 3:2 (C5, C9, FR-004, SC-005/SC-008). Corregir cualquier `<a>` faltante o ruta mal formada.
- [X] T011 [US2] Verificar la sincronía 1:1 `assets/img/CREDITOS.md` ↔ `ASSET_CREDITS` (`js/creditos.js`): las 28 entradas coinciden en ambos lados, sin filas huérfanas; `tests/creditos.test.js` afirma `length === 28` y la suite queda 26/26 (FR-007, SC-004). Abrir `creditos.html` servido y confirmar que las 13 nuevas aparecen listadas.
- [X] T012 [US2] Comprobar la degradación (FR-018): bloqueando una imagen de la galería en DevTools, su `<figure>` conserva el hueco del tile (por `aspect-ratio` + `width`/`height`) y el `<figcaption>` sigue legible; la cuadrícula no se rompe (`quickstart.md` E10).

**Checkpoint**: US1 + US2 funcionan — se puede mirar cada imagen en detalle y rastrear su crédito.

---

## Phase 5: User Story 3 — Usar la galería como índice visual de los ejes (Priority: P3)

**Goal**: cada categoría enlaza a la página de su eje.

**Independent Test**: en cada categoría, bajo el `<h2>`, hay un enlace con texto explícito
que lleva a `mundos.html` / `personajes.html` / `ciencia.html` / `viaje.html`
(`quickstart.md` E5).

- [X] T013 [US3] En `galeria.html`, agregar bajo el `<h2>` de cada una de las 4 secciones un `<a class="galeria-eje-enlace" href="…">` con ruta relativa y texto explícito: `mundos.html` → "Ir a la página de Mundos"; `personajes.html` → "Ir a la página de Personajes"; `ciencia.html` → "Ir a la página de La Ciencia"; `viaje.html` → "Ir a la página de El Viaje" (C3, FR-009, SC-009). Ubicarlo antes del `<ul class="galeria-grid">`.
- [X] T014 [US3] Verificar con teclado que los 4 enlaces de categoría reciben foco visible y en orden, y que cada uno navega a la página correcta del eje (`quickstart.md` E5, E8).

**Checkpoint**: las 3 historias de usuario funcionan de forma independiente.

---

## Phase 6: Polish & validación transversal

**Purpose**: pasar `quickstart.md` completo y dejar la feature lista para verificar.

- [X] T015 [P] Responsive (`quickstart.md` E7): a 320 px la cuadrícula es de 1 columna, sin scroll horizontal, pies sin recortar; a 768 px y 1280 px 2–3 columnas, nada desborda. Ajustar la sección 14 de `css/global.css` solo si aparece overflow.
- [X] T016 [P] Carga diferida y peso (`quickstart.md` E4): en DevTools → Network, las imágenes fuera del viewport no se descargan hasta hacer scroll; ninguna respuesta de imagen > 250 KB; peso total del documento + CSS + imágenes ≤ 4 MB (FR-008, FR-008a, SC-011).
- [X] T017 [P] Semántica y consola (`quickstart.md` E8, E9): estructura `h1 > h2`, `<ul>/<li>/<figure>/<figcaption>` reales, ningún `<div>` donde va un semántico; recorrido completo (carga, scroll, anclas, activar miniaturas) sin errores de consola en Chrome, Edge y Firefox (SC-007); paleta/tipografía por tokens, sin animaciones, sin segundo color saturado.
- [X] T018 Anclas con carga directa (`quickstart.md` E6): abrir `galeria.html#mundos`, `#personajes`, `#ciencia`, `#viaje` directamente; cada sección queda reconocible y utilizable bajo el encabezado (FR-017, SC-006).
- [X] T019 Correr `node --test tests/*.test.js` archivo por archivo → 26/26 en verde. Commit de la implementación: `feat(galeria): maquetar la galeria por ejes con cuadricula responsive`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias.
- **Foundational (Phase 2)**: depende de Setup. **BLOQUEA** todas las historias de usuario.
- **US1 (Phase 3)**: depende de Foundational. Es el MVP.
- **US2 (Phase 4)**: depende de Foundational; en la práctica se apoya en el marcado de US1
  (el `<a>` está en la plantilla de `<figure>` de US1), pero se valida por separado.
- **US3 (Phase 5)**: depende de Foundational; independiente de US1/US2 (solo agrega los
  enlaces de categoría).
- **Polish (Phase 6)**: depende de US1–US3 completas.

### Within Each User Story

- No hay tests que escribir antes (capa presentacional).
- El esqueleto (Phase 2) antes que el llenado de cuadrículas (US1).
- El llenado (US1) antes de las verificaciones de detalle (US2).
- Historia completa antes de pasar a la siguiente prioridad.

### Parallel Opportunities

- Casi nulas dentro de US1: T004–T008 tocan todas `galeria.html` → **secuenciales**.
- T009–T012 y T014 son verificaciones; se pueden hacer mientras se redacta, pero no
  modifican archivos en paralelo.
- Phase 6: T015, T016, T017 son revisiones sobre navegador de aspectos distintos y se
  pueden repartir; marcadas `[P]`.

---

## Implementation Strategy

### MVP First (solo US1)

1. Phase 1 (Setup) → Phase 2 (Foundational: CSS + esqueleto).
2. Phase 3 (US1): llenar las 4 cuadrículas, redactar `alt` y pies.
3. **PARAR y VALIDAR**: `quickstart.md` E1, E2, E7, E8 — la galería se recorre completa.
4. Es demostrable como MVP (galería navegable por ejes).

### Incremental

1. Setup + Foundational → base lista.
2. US1 → validar → MVP.
3. US2 → validar (el detalle de imagen + créditos ya casi cerrado por el sourcing).
4. US3 → validar (enlaces de categoría).
5. Polish → `quickstart.md` completo + commit.

---

## Notes

- `[P]` = archivo distinto, sin dependencias.
- La fase de sourcing (13 imágenes + `CREDITOS.md` + `ASSET_CREDITS` + contador de test)
  ya está hecha y commiteada (`69b792c`); estas tareas NO la repiten.
- Commit al cerrar la implementación (T019); Conventional Commits, sin atribución a IA.
- Parar en cualquier checkpoint para validar la historia de forma independiente.
- Evitar: pies que repiten el `alt`, `<div>` donde va un semántico, rutas absolutas con `/`.

---

## Phase 7: Convergence

Añadido por `/speckit-converge` (2026-08-30) tras `/speckit-implement`. Assessment del
código contra `spec.md` / `plan.md` / `tasks.md`. Un solo hallazgo.

- [X] T020 Re-comprimir `assets/img/viaje-pilares-de-creacion.jpg` a 250 KB o menos con Pillow (mismo método que las 13 nuevas: cap 1280 px, JPEG progresivo, sin EXIF, `optimize`, sin tooling en el repo). Hoy pesa 508.939 bytes (~497 KB) y `galeria.html` la referencia en la categoría El Viaje, incumpliendo "cada imagen ≤ 250 KB" per SC-004 y FR-008 (`contradicts`). La imagen también la usa `viaje.html`, que se beneficia del ajuste. Actualizar la nota de peso de `assets/img/CREDITOS.md` si corresponde. Re-correr `node --test tests/*.test.js` (26/26).
