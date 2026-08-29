---

description: "Task list — Contenido del eje Mundos (002)"
---

# Tasks: Contenido del eje Mundos

**Input**: Documentos de diseño en `/specs/002-mundos-content/`

**Prerrequisitos**: plan.md (obligatorio) · spec.md (obligatorio para historias de usuario) · research.md · data-model.md · contracts/ · quickstart.md · `.specify/memory/constitution.md` (autoridad)

**Tests**: El único cambio de **lógica JS** es extender el array `ASSET_CREDITS` en `js/layout.js` (Principio V → TDD). Ese cambio lleva un test test-first en `tests/layout.test.js` (T016 Rojo → T017 Verde). Todo el resto (HTML de `mundos.html`, CSS, assets) es **capa presentacional**: se valida contra los criterios de aceptación de la spec y los escenarios de `quickstart.md`, sin framework de test (constitución, Principio V).

**Organización**: Tareas agrupadas por historia de usuario para implementación y validación independientes.

## Formato: `[ID] [P?] [Story] Descripción`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias de tareas incompletas).
- **[Story]**: Historia de usuario (US1, US2, US3). Setup/Foundational/Polish **NO** llevan etiqueta.
- **Toda** descripción incluye ruta de archivo exacta y acción concreta.
- IDs secuenciales T001…T027, sin reutilización.

## Convenciones de ruta

- Código fuente en la raíz del repo: `mundos.html`, `css/global.css`, `js/layout.js`, `js/nav-data.js`, `tests/layout.test.js`, `assets/img/`.
- Nombres kebab-case, minúsculas, sin acentos (`mundos-gargantua.jpg`, no `Gargantúa.jpg`).
- Backdrops en **JPEG** (enmienda de la feature 001; `research.md` D1).

---

## Fase 1: Setup

**Propósito**: punto de partida verificable para medir la no-regresión de US3.

- [X] T001 Servir el sitio por HTTP (`python -m http.server 8000` desde la raíz) y ejecutar `node --test tests/*.test.js` (el arg de directorio `node --test tests/` está roto en Node 25); confirmar que `smoke.test.js`, `submenu-state.test.js` y `layout.test.js` pasan en verde ANTES de tocar nada. Línea base: **19 tests verdes**.

**Checkpoint**: base conocida; se puede empezar Foundational.

---

## Fase 2: Foundational (Prerrequisitos bloqueantes)

**Propósito**: andamiaje de HTML y CSS que ambas historias de contenido y visual necesitan.

**CRÍTICO**: US1 y US2 no pueden empezar hasta que esta fase termine.

- [X] T002 Reescribir el esqueleto del `<main>` de `mundos.html` según `contracts/mundos-page.md`: conservar la `<section>` de intro (`<h1>Mundos</h1>` + `<p>`); en cada una de las 5 `<section id>` (`tierra`, `gargantua`, `miller`, `mann`, `tesseract`) reemplazar el placeholder por `class="eje-con-backdrop"` + un `<div class="eje-contenido">` con `<h2>` (nombre visible del mundo, coincidente con `js/nav-data.js`) y los tres `<h3>` «Qué es» / «En la historia» / «Rasgos distintivos» en ese orden, con `<p>` y `<ul>` **vacíos** por completar. NO agregar `<img>` todavía. Conservar los `id` exactos y el `<script type="module" src="js/layout.js">`. NO declarar `<header>` ni `<footer>` (FR-008).
- [X] T003 [P] Agregar a `css/global.css` el bloque reutilizable "sección de eje con backdrop" (`research.md` D4, `contracts/mundos-page.md` §CSS asociado): `.eje-con-backdrop` (`position: relative; overflow: hidden; background-color: var(--color-fondo)` de respaldo), `.eje-backdrop` (`position: absolute; inset: 0; width/height 100%; object-fit: cover; filter: var(--backdrop-oscurecer)`), `.eje-contenido` (`position: relative; z-index: 1`; reserva de padding; tipografía y color con `--font-*`, `--color-texto`, `--color-texto-atenuado` YA definidos). Sin custom properties nuevas. Verificar a 320/768/1280 px que la página no genera desplazamiento horizontal (FR-012, SC-003).

**Checkpoint**: andamiaje listo; US1 y US2 pueden comenzar.

---

## Fase 3: Historia de Usuario 1 — «Conocer cada mundo de Interstellar» (Prioridad: P1) ⭐ MVP

**Goal**: las 5 secciones de `mundos.html` con contenido textual real en la plantilla de 3 bloques; sin ningún placeholder.

**Independent Test**: E1 de `quickstart.md` — recorrer las 5 secciones, verificar los 3 bloques por mundo, la cobertura de FR-003 y que no queda "Sección futura dedicada a…".

> Las tareas T004–T009 editan el MISMO archivo (`mundos.html`): van en secuencia, sin `[P]`.

- [X] T004 [US1] Redactar el contenido de **La Tierra** en `mundos.html` (`<section id="tierra">`): «Qué es» (1–2 párrafos), «En la historia» (1–2 párrafos), «Rasgos distintivos» (`<ul>` de 3–6 `<li>`) cubriendo la plaga de cultivos (*blight*), las tormentas de polvo y el colapso de la agricultura (FR-003). Español, tono divulgativo/cinematográfico, sin etiquetas de rigor `✓`/`~`/`✎` (FR-009), spoilers al mínimo.
- [X] T005 [US1] Redactar **Gargantúa** en `mundos.html` (`<section id="gargantua">`): los 3 bloques; «Rasgos distintivos» cubre agujero negro supermasivo, disco de acreción, horizonte de eventos y distorsión visual por lente gravitacional (FR-003). Describir lo visual y narrativo, sin explicación de física detallada ni etiquetas de rigor (FR-009 — eso es del eje La Ciencia).
- [X] T006 [US1] Redactar **Planeta de Miller** en `mundos.html` (`<section id="miller">`): los 3 bloques; «Rasgos distintivos» cubre el océano que cubre el planeta, las olas del tamaño de montañas y la proximidad extrema a Gargantúa (FR-003).
- [X] T007 [US1] Redactar **Planeta de Mann** en `mundos.html` (`<section id="mann">`): los 3 bloques; «Rasgos distintivos» cubre la superficie de hielo, las nubes congeladas y la aparente habitabilidad (FR-003).
- [X] T008 [US1] Redactar **El Tesseract** en `mundos.html` (`<section id="tesseract">`): los 3 bloques; «Rasgos distintivos» cubre el tiempo representado como espacio recorrible y la ubicación tras la estantería de la habitación de Murph (FR-003). Solo descripción narrativa/visual (FR-009).
- [X] T009 [US1] Ajustar el `<p>` de la `<section>` de intro de `mundos.html` (la del `<h1>Mundos</h1>`) para que encuadre el eje (qué destinos vas a encontrar y por qué importan) sin repetir el texto placeholder anterior.
- [X] T010 [US1] Validar US1 contra E1 de `quickstart.md`: buscar la cadena "Sección futura dedicada a" en `mundos.html` y confirmar 0 coincidencias (SC-001); confirmar que cada `section[id]` tiene exactamente 1 `<h2>` y 3 `<h3>` en el orden del contrato, y un `<ul>` de 3–6 `<li>`; jerarquía `h1 > h2 > h3` sin saltos (FR-011). **Verificado**: 0 placeholders · 1 `h1` · 5 `h2` · 15 `h3` (orden correcto en las 5) · 5 `<ul>` de 5 `<li>` · `node --test tests/*.test.js` 19/19 verde (sin regresión) · `mundos.html` sin `<canvas>`/IntersectionObserver/`@keyframes` (FR-010).

**Checkpoint**: US1 funcional y testeable sola — el eje Mundos ya informa, aunque todavía sin sus backdrops.

---

## Fase 4: Historia de Usuario 2 — «Ver cada mundo con su identidad visual» (Prioridad: P2)

**Goal**: 5 backdrops JPEG propios y distintos, oscurecidos y legibles, acreditados en el pie y dentro del presupuesto de peso.

**Independent Test**: E2 y E3 de `quickstart.md` — 5 backdrops distintos y oscurecidos, texto legible sin zona clara, fallo de carga degradado, pie con los 5 créditos, `CREDITOS.md` con URLs reales, peso ≤250 KB c/u y ≤1,2 MB total.

- [X] T011 [P] [US2] Seleccionar y descargar el backdrop de **Gargantúa** → `assets/img/mundos-gargantua.jpg`, del catálogo aprobado (`research.md` D2). Preferir visualización de agujero negro NASA/ESA de **licencia clara**; si se usa un still de la película (Wikimedia Commons / Alpha Coders / WallpaperFlare) para el disco de acreción icónico, registrar `licencia: "Material de la película, uso académico con atribución"` y `atribución: "© Warner Bros. Pictures"` (política del documento base + feature 001). NO usar el render del paper arXiv (licencia de republicación sin verificar). JPEG, ≤250 KB, nombre kebab-case. Anotar fuente, URL de origen real, licencia y texto de atribución para T017/T018.
- [X] T012 [P] [US2] Ídem para **Planeta de Miller** → `assets/img/mundos-miller.jpg` (mundo oceánico real desde el espacio, NASA/Unsplash, o still del planeta del agua). JPEG, ≤250 KB. Anotar datos de crédito.
- [X] T013 [P] [US2] Ídem para **Planeta de Mann** → `assets/img/mundos-mann.jpg` (cuerpo helado real tipo Europa/Encélado, NASA/JPL, o still del planeta helado). JPEG, ≤250 KB. Anotar datos de crédito.
- [X] T014 [P] [US2] Ídem para **El Tesseract** → `assets/img/mundos-tesseract.jpg` (still atribuido de la estructura tras la estantería, o imagen geométrica/abstracta espacial de licencia libre, Unsplash). JPEG, ≤250 KB. Anotar datos de crédito.
- [X] T015 [US2] Verificar el presupuesto de peso (FR-007, SC-009): cada `assets/img/mundos-*.jpg` pesa ≤250 KB y la suma de los cinco (incluye `mundos-tierra.jpg`, ~229 KB, ya presente) es ≤1,2 MB. Si la suma se pasa, re-comprimir/redimensionar a mano `mundos-tierra.jpg` o los nuevos hasta cumplir. Registrar los tamaños finales.
- [X] T016 [US2] Escribir PRIMERO el test que FALLA (Rojo) en `tests/layout.test.js`: nuevo caso `test('el pie lista los créditos de los backdrops de Mundos (FR-006)')` que afirma que `buildFooter()` incluye las cadenas `mundos-gargantua.jpg`, `mundos-miller.jpg`, `mundos-mann.jpg` y `mundos-tesseract.jpg` (ver `contracts/footer-credits.md` §4). Ejecutar `node --test tests/*.test.js` y comprobar que **falla** antes de tocar `js/layout.js`.
- [X] T017 [US2] Extender el array `ASSET_CREDITS` en `js/layout.js` (Verde): +4 líneas con el formato `'<archivo> — <atribución> (<fuente del catálogo>)'` usando los datos reales anotados en T011–T014 (`mundos-tierra.jpg` ya figura). Ejecutar `node --test tests/*.test.js` y dejar los 3 archivos de test en verde.
- [X] T018 [US2] Agregar 4 filas a la tabla de assets de `assets/img/CREDITOS.md` (id `mundos-<ancla>`, nombre de archivo, fuente del catálogo, URL de origen real, licencia/condiciones, atribución requerida, `estado: descargado`) y actualizar el bloque "Resumen de estado" (contadores). Mantener sincronía 1:1 con `ASSET_CREDITS` (`contracts/footer-credits.md` §3).
- [X] T019 [US2] Agregar el `<img class="eje-backdrop" alt="" src="assets/img/mundos-<ancla>.jpg">` como primer hijo de cada una de las 5 `<section class="eje-con-backdrop">` de `mundos.html` (incluye `#tierra` con el archivo ya existente). Confirmar `alt=""` (decorativa, Principio II, FR-011) y ruta relativa (FR-007).
- [X] T020 [US2] Validar US2 contra E2/E3 de `quickstart.md`: 5 backdrops distintos y oscurecidos con `--backdrop-oscurecer`; título y texto legibles encima sin depender de una zona clara (SC-007); al bloquear una imagen en DevTools, la sección conserva jerarquía sobre `--color-fondo` (caso límite); el pie renderiza los 5 créditos de Mundos (FR-006, SC-002); `CREDITOS.md` con fuentes del catálogo y URLs reales (SC-008).

**Checkpoint**: US1 + US2 funcionales — el eje Mundos informa y tiene identidad visual propia por mundo.

---

## Fase 5: Historia de Usuario 3 — «Seguir navegando y compartiendo sin fricción» (Prioridad: P3)

**Goal**: garantía de no-regresión sobre lo entregado por la feature 001 (navegación, anclas, foco, pie).

**Independent Test**: E4 de `quickstart.md` — header/submenú/pie idénticos a otra página, 5 anclas con carga directa, foco visible, sin errores de consola.

- [X] T021 [US3] Confirmar que `js/nav-data.js` NO fue modificado y que el submenú "Mundos" sigue apuntando a `mundos.html#tierra`, `#gargantua`, `#miller`, `#mann`, `#tesseract` (FR-001, FR-015). `git diff js/nav-data.js` debe estar vacío.
- [X] T022 [US3] Probar carga directa de las 5 anclas (`http://localhost:8000/mundos.html#gargantua`, y las otras 4): cada sección queda visible y usable por debajo del encabezado, con la `scroll-margin-top` sobre `section[id]` de la feature 001 aplicando sin cambios (SC-004, FR-015).
- [X] T023 [US3] Comparar encabezado, submenú y pie de `mundos.html` contra `ciencia.html`: idénticos en contenido y comportamiento (FR-008). Recorrer `mundos.html` solo con teclado y confirmar foco visible y orden de tabulación coherente con la secuencia del contenido.
- [X] T024 [US3] DevTools → Console en las 2 últimas versiones de Chrome, Edge y Firefox: recorrido completo de `mundos.html` (carga, scroll, apertura de anclas) sin errores ni 404 (FR-013, SC-005). `node --test tests/*.test.js` en verde.

**Checkpoint**: las 3 historias funcionales e independientemente verificables.

---

## Fase 6: Pulido y verificación transversal

- [ ] T025 [P] Ejecutar la verificación blanda de comprensión E6 / SC-006: 3 personas que no vieron la película leen una sección de mundo al azar y se registra si explican en una frase qué es y su papel en la historia. Meta orientativa ≥2/3. Si no se alcanza, ajustar la redacción de la(s) sección(es) floja(s) y re-verificar. **No bloquea la entrega.**
- [X] T026 Ejecutar de una sola pasada el recorrido E1–E5 de `quickstart.md` sobre el sitio servido por HTTP; registrar resultado por escenario y corregir cualquier defecto encontrado.
- [X] T027 [P] Revisión final de repositorio: `git diff --check` (sin espacios al final de línea ni marcadores de conflicto); confirmar que solo cambiaron `mundos.html`, `css/global.css`, `js/layout.js`, `tests/layout.test.js`, `assets/img/CREDITOS.md` y los `assets/img/mundos-*.jpg` nuevos; mensajes de commit con Conventional Commits (`feat:`, `docs:`, `test:`, `chore:`…) sin atribución a IA ni `Co-Authored-By` (constitución).

**Checkpoint**: feature completa tras E1–E5 en verde; E6 registrada.

---

## Dependencias y orden de ejecución

### Dependencias de fase

- **Setup (Fase 1)**: sin dependencias.
- **Foundational (Fase 2)**: depende de Setup — **BLOQUEA** US1 y US2.
- **US1 (Fase 3)**: depende de Foundational. Entrega el MVP.
- **US2 (Fase 4)**: depende de Foundational. Comparte archivo (`mundos.html`) con US1 → se hace **después** de US1 (o con cuidado de no pisar ediciones).
- **US3 (Fase 5)**: verificación; se corre cuando US1 y US2 están aplicadas.
- **Polish (Fase 6)**: depende de las historias deseadas completas.

### Dependencias a nivel de archivo (concretas)

- `mundos.html` esqueleto (T002) ANTES de redactar contenido (T004–T009) y ANTES de insertar `<img>` (T019).
- `css/global.css` con `.eje-*` (T003) ANTES de validar responsive/legibilidad (T003 mismo, T020).
- Assets `mundos-*.jpg` (T011–T014) ANTES de su verificación de peso (T015), del crédito real (T017/T018) y de los `<img>` (T019).
- Test de créditos en Rojo (T016) ANTES de extender `ASSET_CREDITS` (T017) — Principio V.
- `ASSET_CREDITS` (T017) y `CREDITOS.md` (T018) sincronizados: hacer T018 junto con o inmediatamente después de T017.

### Dentro de cada historia

- US1: T004→T005→T006→T007→T008→T009 (mismo archivo, secuencial) → T010 (validación).
- US2: T011–T014 en paralelo → T015 (peso) ; T016 (Rojo) → T017 (Verde) → T018 (sincronía) ; T019 (`<img>`) → T020 (validación).
- US3: T021→T022→T023→T024, todo verificación.

---

## Oportunidades de paralelización

- **Foundational**: T003 (`css/global.css`) es archivo distinto de T002 (`mundos.html`) — `[P]`; el CSS se puede escribir desde el contrato sin esperar el HTML.
- **US2**: T011, T012, T013, T014 son 4 archivos de imagen distintos — `[P]` entre sí. Es el mejor bloque paralelo de la feature.
- **Polish**: T025 (prueba con personas) y T027 (revisión de repo) son independientes — `[P]`.
- **Nota**: los marcadores `[P]` indican independencia de archivos, no un equipo. Proyecto de un solo alumno → orden secuencial de prioridad P1 → P2 → P3, deteniéndose en cada checkpoint.

---

## Estrategia de implementación

### MVP primero (Historia de Usuario 1)

1. Fase 1: Setup (base conocida).
2. Fase 2: Foundational (esqueleto HTML + CSS `.eje-*`).
3. Fase 3: US1 — redactar los 5 mundos, validar E1.
4. **PARAR y VALIDAR**: E1 en verde, sin placeholders, jerarquía correcta.
5. El eje Mundos ya informa: entregable demostrable aunque falten los backdrops.

### Entrega incremental

1. Setup + Foundational → andamiaje listo.
2. US1 → E1 → **MVP** (contenido real).
3. US2 → E2/E3 → identidad visual por mundo + créditos.
4. US3 → E4 → confirmada la no-regresión.
5. Polish → E1–E5 de corrido + E6 (SC-006 blanda).

---

## Notas

- `[P]` = archivos distintos, sin dependencias de tareas incompletas.
- La etiqueta `[Story]` mapea la tarea a su historia (solo US1–US3; Setup/Foundational/Polish no llevan).
- El único test test-first es T016 (créditos del pie, Principio V); el resto se valida por aceptación (`quickstart.md`).
- Commits tras cada tarea o grupo lógico, Conventional Commits sin atribución a IA.
- NO crear tareas para lo que está fuera de alcance: galerías multi-imagen, contenido científico etiquetado (FR-009), animaciones del viaje (FR-010), páginas de otros ejes.
- Ante duda, `constitution.md` prevalece.
