---

description: "Task list — Contenido del eje Personajes (003)"
---

# Tasks: Contenido del eje Personajes

**Input**: Documentos de diseño en `/specs/003-personajes-content/`

**Prerrequisitos**: plan.md (obligatorio) · spec.md (obligatorio para historias de usuario) · research.md · data-model.md · contracts/ · quickstart.md · `.specify/memory/constitution.md` (autoridad)

**Tests**: El único cambio de **lógica JS** es extender el array `ASSET_CREDITS` en `js/layout.js` (Principio V → TDD). Ese cambio lleva un test test-first en `tests/layout.test.js` (T020 Rojo → T021 Verde). Todo el resto (HTML de `personajes.html`, CSS, assets) es **capa presentacional**: se valida contra los criterios de aceptación de la spec y los escenarios de `quickstart.md`, sin framework de test (constitución, Principio V).

**Organización**: Tareas agrupadas por historia de usuario para implementación y validación independientes.

## Formato: `[ID] [P?] [Story] Descripción`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias de tareas incompletas).
- **[Story]**: Historia de usuario (US1, US2, US3). Setup/Foundational/Polish **NO** llevan etiqueta.
- **Toda** descripción incluye ruta de archivo exacta y acción concreta.
- IDs secuenciales T001…T033, sin reutilización.

## Convenciones de ruta

- Código fuente en la raíz del repo: `personajes.html`, `css/global.css`, `js/layout.js`, `js/nav-data.js`, `tests/layout.test.js`, `assets/img/`.
- Nombres kebab-case, minúsculas, sin acentos (`personajes-profesor-brand.jpg`, no `Profesor Brand.jpg`).
- Retratos en **JPEG** (enmienda de la feature 001; `research.md` D1).
- El retrato es **en línea** (`<figure class="ficha-retrato">`), NO backdrop: sin `--backdrop-oscurecer`, sin `.eje-con-backdrop` (`research.md` D3).

---

## Fase 1: Setup

**Propósito**: punto de partida verificable para medir la no-regresión de US3.

- [X] T001 Servir el sitio por HTTP (`python -m http.server 8000` desde la raíz) y ejecutar `node --test tests/*.test.js` (el arg de directorio `node --test tests/` está roto en Node 25); confirmar que `smoke.test.js`, `submenu-state.test.js` y `layout.test.js` pasan en verde ANTES de tocar nada. Registrar la línea base de tests verdes.

**Checkpoint**: base conocida; se puede empezar Foundational.

---

## Fase 2: Foundational (Prerrequisitos bloqueantes)

**Propósito**: andamiaje de HTML y CSS que las tres historias necesitan.

**CRÍTICO**: US1 no puede empezar hasta que esta fase termine.

- [X] T002 Reescribir el esqueleto del `<main>` de `personajes.html` según `contracts/personajes-page.md`: conservar/ajustar la `<section>` de intro (`<h1>Personajes</h1>` + `<p>`); en cada una de las 6 `<section id>` (`cooper`, `murph`, `brand`, `profesor-brand`, `mann`, `tars-case`) reemplazar el placeholder por: un `<h2>` con el nombre visible (coincidente con `js/nav-data.js`: "Cooper", "Murph", "Dr. Brand", "Profesor Brand", "Mann", "TARS & CASE") **como hijo directo de la `<section>`**; **luego un `<div class="ficha-personaje">` que contiene, en este orden:** un `<figure class="ficha-retrato">` con un `<figcaption>` **vacío** y SIN `<img>` todavía; los tres `<h3>` «Quién es» / «Su papel en la historia» / «Rasgos distintivos» en ese orden, con `<p>` y `<ul>` **vacíos** por completar; y un `<p class="ficha-reparto">` **vacío**. Conservar los `id` exactos y el `<script type="module" src="js/layout.js">`. NO declarar `<header>` ni `<footer>` (FR-008). `#tars-case` es UNA sola `<section>` (FR-005).
- [X] T003 [P] Agregar a `css/global.css` la sección 12 "ficha de personaje con retrato" (`research.md` D4, `contracts/personajes-page.md` §CSS asociado): `.ficha-personaje` (**el `<div>` interno que envuelve el `<figure>` y el texto de la ficha; el `<h2>` queda fuera, como hijo directo de la `<section>`**; escritorio: `display: grid` con una franja de ancho acotado para el retrato + el resto para el texto; mobile: una columna, retrato primero; sin anchos fijos que rompan a 320 px), `.ficha-retrato` (sobre el `<figure>`: `margin: 0`; marco/fondo con `var(--color-superficie)`; `img { display:block; width:100%; height:auto }`), `.ficha-retrato figcaption` (`var(--color-texto-atenuado)`, tamaño reducido), `.ficha-reparto` (`var(--color-texto-atenuado)`, diferenciada del cuerpo, separada del último bloque). Sin custom properties nuevas. NO usar `.eje-con-backdrop` / `--backdrop-oscurecer`. Verificar a 320/768/1280 px que la página no genera desplazamiento horizontal (FR-012, SC-003).

**Checkpoint**: andamiaje listo; US1 puede comenzar.

---

## Fase 3: Historia de Usuario 1 — «Conocer a cada personaje de Interstellar» (Prioridad: P1) ⭐ MVP

**Goal**: las 6 fichas de `personajes.html` completas — plantilla de 3 bloques + línea de reparto + retrato en línea propio — sin ningún placeholder, con sus créditos en el pie.

**Independent Test**: E1, E3, E4 y E5 de `quickstart.md` — recorrer las 6 fichas, verificar los 3 bloques, el retrato en línea con `alt` descriptivo, la línea de reparto consistente (Murph con 3 actrices; TARS/CASE con voces) y los 6 créditos en el pie; que no queda "Sección futura dedicada a…".

### Contenido textual de las fichas

> Las tareas T004–T011 editan el MISMO archivo (`personajes.html`): van en secuencia, sin `[P]`.

- [X] T004 [US1] Redactar **Cooper** en `personajes.html` (`<section id="cooper">`): «Quién es» (1–2 párrafos), «Su papel en la historia» (1–2 párrafos), «Rasgos distintivos» (`<ul>` de 3–6 `<li>`) cubriendo: ex piloto/ingeniero de la NASA reconvertido en agricultor; viudo, padre de Tom y Murph; pilota el Endurance por el agujero de gusano; la promesa de volver con Murph; termina en el Tesseract y es el "fantasma" de la habitación (FR-003). Español, tono divulgativo/cinematográfico, sin etiquetas de rigor `✓`/`~`/`✎` (FR-009), spoilers al mínimo (FR-016).
- [X] T005 [US1] Redactar **Murph** en `personajes.html` (`<section id="murph">`): los 3 bloques; cubrir el "fantasma" de su cuarto de niña, física de la NASA junto al Profesor Brand de adulta, la resolución de la ecuación de la gravedad con los datos de Cooper, y el resentimiento por el abandono como eje de su arco (FR-003, FR-009, FR-016).
- [X] T006 [US1] Redactar **Dr. Brand** en `personajes.html` (`<section id="brand">`): los 3 bloques; abrir nombrando a **Amelia Brand**, astrónoma/bióloga del Endurance, e indicar explícitamente que es **hija** del Profesor Brand; cubrir que aboga por ir al planeta de Edmunds y que sobrevive estableciendo el Plan B allí (FR-003, FR-004). Mencionar el rol del Profesor para que no se confunda con él (SC-007).
- [X] T007 [US1] Redactar **Profesor Brand** en `personajes.html` (`<section id="profesor-brand">`): los 3 bloques; abrir nombrando a **John Brand**, líder de la NASA clandestina, e indicar explícitamente que es el **padre** de Amelia; explicar en qué consiste el "Plan A" y la confesión de que el Plan B era el plan real, con spoiler al mínimo imprescindible (FR-003, FR-004, FR-016). Mencionar el rol de Amelia para que no se confunda con ella (SC-007).
- [X] T008 [US1] Redactar **Mann** en `personajes.html` (`<section id="mann">`): los 3 bloques; cubrir "el mejor de nosotros", científico célebre de las misiones Lázaro, que falsificó los datos de su planeta helado, intenta matar a Cooper y muere en un acoplamiento fallido; encarna el instinto de supervivencia y la cobardía bajo aislamiento. Spoiler al mínimo imprescindible para explicar su rol (FR-003, FR-016).
- [X] T009 [US1] Redactar **TARS & CASE** en `personajes.html` (`<section id="tars-case">`, UNA sola sección): los 3 bloques; presentar a **ambos** robots — diseño monolítico articulado, parámetros ajustables de humor y sinceridad; TARS acompaña a Cooper (sarcástico, leal), CASE queda con Brand; TARS se lanza a Gargantúa por los datos cuánticos. Indicar con qué tripulante va cada uno y qué los distingue (FR-003, FR-005).
- [X] T010 [US1] Completar el `<p class="ficha-reparto">` de las 6 fichas de `personajes.html` con el mismo formato: todos los intérpretes relevantes, etapa/rol entre paréntesis. Cooper → Matthew McConaughey; Murph → Jessica Chastain (adulta), Mackenzie Foy (niña), Ellen Burstyn (anciana); Dr. Brand → Anne Hathaway; Profesor Brand → Michael Caine; Mann → Matt Damon; TARS & CASE → Bill Irwin (voz y manipulación de TARS), Josh Stewart (voz de CASE) (FR-002, SC-009). La línea va FUERA del `<figure>` (aclaración 2026-08-29).
- [X] T011 [US1] Ajustar el `<p>` de la `<section>` de intro de `personajes.html` (la del `<h1>Personajes</h1>`) para que encuadre el eje (qué fichas vas a encontrar y su lugar en la misión Endurance) sin repetir el texto placeholder anterior.
- [X] T012 [US1] Validar el contenido textual contra E1 y E4 de `quickstart.md`: buscar "Sección futura dedicada a" en `personajes.html` y confirmar 0 coincidencias (SC-001); confirmar que cada `section[id]` tiene exactamente 1 `<h2>`, 3 `<h3>` en el orden del contrato, un `<ul>` de 3–6 `<li>` y una `<p class="ficha-reparto">`; jerarquía `h1 > h2 > h3` sin saltos (FR-011); la de `#murph` nombra a Chastain, Foy y Burstyn; la de `#tars-case` incluye "voz de" para ambos robots (SC-009); `personajes.html` sin `<canvas>`/IntersectionObserver/`@keyframes` (FR-010) **y sin las etiquetas de nivel de rigor `✓`/`~`/`✎` ni explicaciones de física detalladas (FR-009 — eso es del eje La Ciencia)**. `node --test tests/*.test.js` sin regresión.

### Retratos en línea y créditos

- [X] T013 [P] [US1] Seleccionar y descargar el retrato de **Cooper** → `assets/img/personajes-cooper.jpg`: still de la película (fuente FILMGRAB, `research.md` D2), plano donde el personaje sea claramente reconocible. JPEG, ≤250 KB, nombre kebab-case. Anotar fuente, URL de origen real del fotograma, licencia ("Material de la película, uso académico con atribución") y atribución ("© Warner Bros. Pictures / Paramount Pictures") para T020–T022.
- [X] T014 [P] [US1] Ídem para **Murph** → `assets/img/personajes-murph.jpg`. JPEG, ≤250 KB. Anotar datos de crédito.
- [X] T015 [P] [US1] Ídem para **Dr. Brand** (Amelia) → `assets/img/personajes-brand.jpg`. JPEG, ≤250 KB. Anotar datos de crédito.
- [X] T016 [P] [US1] Ídem para **Profesor Brand** (John) → `assets/img/personajes-profesor-brand.jpg`. JPEG, ≤250 KB. Anotar datos de crédito.
- [X] T017 [P] [US1] Ídem para **Mann** → `assets/img/personajes-mann.jpg`. JPEG, ≤250 KB. Anotar datos de crédito.
- [X] T018 [P] [US1] Ídem para **TARS & CASE** → `assets/img/personajes-tars-case.jpg`: un plano de los robots (juntos si es posible). JPEG, ≤250 KB. Anotar datos de crédito.
- [X] T019 [US1] Verificar el presupuesto de peso (FR-007, SC-008): cada `assets/img/personajes-*.jpg` pesa ≤250 KB y la suma de los seis es ≤1,5 MB. Si la suma se pasa, re-comprimir/redimensionar a mano hasta cumplir. Registrar los tamaños finales.
- [X] T020 [US1] Escribir PRIMERO el test que FALLA (Rojo) en `tests/layout.test.js`: nuevo caso `test('el pie lista los créditos de los retratos de Personajes (FR-007)')` que afirma que `buildFooter()` incluye las cadenas `personajes-cooper.jpg`, `personajes-murph.jpg`, `personajes-brand.jpg`, `personajes-profesor-brand.jpg`, `personajes-mann.jpg` y `personajes-tars-case.jpg` (ver `contracts/footer-credits.md` §4). Ejecutar `node --test tests/*.test.js` y comprobar que **falla** antes de tocar `js/layout.js`.
- [X] T021 [US1] Extender el array `ASSET_CREDITS` en `js/layout.js` (Verde): +6 líneas con el formato `'<archivo> — © Warner Bros. Pictures / Paramount Pictures, uso académico con atribución (FILMGRAB)'` para los seis retratos, usando los datos reales anotados en T013–T018. NO tocar la línea existente `personajes-astronauta.jpg`. Ejecutar `node --test tests/*.test.js` y dejar los 3 archivos de test en verde.
- [X] T022 [US1] Agregar 6 filas a la tabla de assets de `assets/img/CREDITOS.md` (id `personajes-<ancla>`, nombre de archivo, fuente `FILMGRAB (film-grab.com)`, URL de origen real del fotograma, licencia/condiciones, atribución requerida, `estado: descargado`) y actualizar el bloque "Resumen de estado" (contadores) y la nota de peso (6 retratos ≤250 KB c/u, ≤1,5 MB total). Mantener sincronía 1:1 con `ASSET_CREDITS` (`contracts/footer-credits.md` §3).
- [X] T023 [US1] Insertar en cada una de las 6 `<figure class="ficha-retrato">` de `personajes.html` un `<img src="assets/img/personajes-<ancla>.jpg" alt="…descripción del personaje…">` con `alt` **descriptivo** (NO vacío, imagen informativa — FR-011) y completar el `<figcaption>` describiendo la imagen (quién aparece y, si aporta, de qué escena). Confirmar ruta relativa (FR-007), SIN `class="eje-backdrop"`, SIN `filter`, SIN posicionamiento absoluto, y que la atribución `© Warner Bros.` NO está en el `<figcaption>` (va en el pie).
- [X] T024 [US1] Validar el bloque de retratos contra E3 y E5 de `quickstart.md`: 6 `<figure class="ficha-retrato">` con `<img>` propio y distinto, `alt` descriptivo, `<figcaption>` con descripción de imagen; sin oscurecimiento ni backdrop; al bloquear una imagen en DevTools, el `<figure>` conserva fondo coherente con la paleta y la maqueta no se rompe (caso límite); el pie renderiza los 6 créditos de Personajes (FR-006, FR-007); `CREDITOS.md` con fuente FILMGRAB y URLs reales, "Resumen de estado" y nota de peso al día (SC-008).

**Checkpoint**: US1 funcional y testeable sola — el eje Personajes ya informa, con retrato e identidad por ficha. **MVP entregable.**

---

## Fase 4: Historia de Usuario 2 — «Distinguir a las dos figuras "Brand" y al grupo TARS & CASE» (Prioridad: P2)

**Goal**: garantizar que la Dra. Amelia Brand y el Profesor John Brand no puedan confundirse, y que TARS & CASE se lean como una ficha de dos robots.

**Independent Test**: E2 de `quickstart.md` — abrir `#brand` y `#profesor-brand` por separado y verificar personaje correcto, parentesco explícito y rol distinto; abrir `#tars-case` y verificar que cubre a ambos robots.

- [X] T025 [US2] Revisar y, si hace falta, reforzar en `personajes.html` las fichas `#brand` y `#profesor-brand` para que cada una: (a) abra con el nombre completo del personaje (Amelia Brand / John Brand), (b) mencione explícitamente el parentesco (hija / padre) y (c) mencione el rol de la otra figura de forma que ninguna pueda confundirse con la otra (FR-004, SC-007). Confirmar que `#tars-case` es una única `<section>` que nombra a TARS y a CASE, con qué tripulante va cada uno y qué los distingue (FR-005).
- [ ] T026 [US2] Validar US2 contra E2 de `quickstart.md`: recorrido de `#brand`, `#profesor-brand` y `#tars-case`; y verificación blanda con 3 personas — las 3 distinguen a Amelia del Profesor tras leer ambas fichas (SC-007). Si alguna no distingue, ajustar la redacción de la(s) ficha(s) y re-verificar.

**Checkpoint**: US1 + US2 — el eje informa y sus personajes ambiguos quedan inequívocos.

---

## Fase 5: Historia de Usuario 3 — «Seguir navegando y compartiendo sin fricción» (Prioridad: P3)

**Goal**: garantía de no-regresión sobre lo entregado por las features 001 y 002 (navegación, anclas, foco, pie).

**Independent Test**: E6 de `quickstart.md` — header/submenú/pie idénticos a otra página, 6 anclas con carga directa, foco visible, responsive, sin errores de consola.

- [X] T027 [US3] Confirmar que `js/nav-data.js` NO fue modificado y que el submenú "Personajes" sigue apuntando a `personajes.html#cooper`, `#murph`, `#brand`, `#profesor-brand`, `#mann`, `#tars-case` (FR-001, FR-015). `git diff js/nav-data.js` debe estar vacío.
- [X] T028 [US3] Probar carga directa de las 6 anclas (`http://localhost:8000/personajes.html#profesor-brand`, y las otras 5): cada sección queda visible y usable por debajo del encabezado, con la `scroll-margin-top` sobre `section[id]` de la feature 001 aplicando sin cambios (SC-004, FR-015).
- [X] T029 [US3] Comparar encabezado, submenú y pie de `personajes.html` contra `mundos.html`: idénticos en contenido y comportamiento (FR-008). Recorrer `personajes.html` solo con teclado y confirmar foco visible y orden de tabulación coherente con la secuencia del contenido. A 320/768/1280 px: sin desplazamiento horizontal, retrato apilado en mobile y en su columna en desktop, imágenes sin desbordar (SC-003).
- [X] T030 [US3] DevTools → Console en las 2 últimas versiones de Chrome, Edge y Firefox: recorrido completo de `personajes.html` (carga, scroll, apertura de anclas) sin errores ni 404 (FR-013, SC-005). `node --test tests/*.test.js` en verde.

**Checkpoint**: las 3 historias funcionales e independientemente verificables.

---

## Fase 6: Pulido y verificación transversal

- [ ] T031 [P] Ejecutar la verificación blanda de comprensión E7 / SC-006: 3 personas que no vieron la película leen una ficha al azar y se registra si explican en una frase quién es ese personaje y su papel en la historia. Meta orientativa ≥2/3. Si no se alcanza, ajustar la redacción de la(s) ficha(s) floja(s) y re-verificar. **No bloquea la entrega.**
- [X] T032 Ejecutar de una sola pasada el recorrido E1–E6 de `quickstart.md` sobre el sitio servido por HTTP; registrar resultado por escenario y corregir cualquier defecto encontrado.
- [X] T033 [P] Revisión final de repositorio: `git diff --check` (sin espacios al final de línea ni marcadores de conflicto); confirmar que solo cambiaron `personajes.html`, `css/global.css`, `js/layout.js`, `tests/layout.test.js`, `assets/img/CREDITOS.md` y los `assets/img/personajes-*.jpg` nuevos (los seis retratos); mensajes de commit con Conventional Commits (`feat:`, `docs:`, `test:`, `chore:`…) sin atribución a IA ni `Co-Authored-By` (constitución).

**Checkpoint**: feature completa tras E1–E6 en verde; E7 registrada.

---

## Dependencias y orden de ejecución

### Dependencias de fase

- **Setup (Fase 1)**: sin dependencias.
- **Foundational (Fase 2)**: depende de Setup — **BLOQUEA** US1.
- **US1 (Fase 3)**: depende de Foundational. Entrega el MVP.
- **US2 (Fase 4)**: depende de que el contenido de `#brand` / `#profesor-brand` / `#tars-case` esté redactado en US1 (T006, T007, T009); refina y verifica.
- **US3 (Fase 5)**: verificación; se corre cuando US1 (y US2) están aplicadas.
- **Polish (Fase 6)**: depende de las historias deseadas completas.

### Dependencias a nivel de archivo (concretas)

- `personajes.html` esqueleto (T002) ANTES de redactar contenido (T004–T011), insertar `<img>` (T023) y refinar Brand (T025).
- `css/global.css` con `.ficha-*` (T003) ANTES de validar responsive/maqueta (T024, T029).
- Assets `personajes-*.jpg` (T013–T018) ANTES de su verificación de peso (T019), del crédito real (T021/T022) y de los `<img>` (T023).
- Test de créditos en Rojo (T020) ANTES de extender `ASSET_CREDITS` (T021) — Principio V.
- `ASSET_CREDITS` (T021) y `CREDITOS.md` (T022) sincronizados: hacer T022 junto con o inmediatamente después de T021.

### Dentro de cada historia

- US1 texto: T004→T005→T006→T007→T008→T009→T010→T011 (mismo archivo, secuencial) → T012 (validación).
- US1 retratos: T013–T018 en paralelo → T019 (peso) ; T020 (Rojo) → T021 (Verde) → T022 (sincronía) ; T023 (`<img>` + `<figcaption>`) → T024 (validación).
- US2: T025 (refinar) → T026 (validación + prueba blanda).
- US3: T027→T028→T029→T030, todo verificación.

---

## Oportunidades de paralelización

- **Foundational**: T003 (`css/global.css`) es archivo distinto de T002 (`personajes.html`) — `[P]`; el CSS se puede escribir desde el contrato sin esperar el HTML.
- **US1**: T013–T018 son 6 archivos de imagen distintos — `[P]` entre sí. Es el mejor bloque paralelo de la feature.
- **Polish**: T031 (prueba con personas) y T033 (revisión de repo) son independientes — `[P]`.
- **Nota**: los marcadores `[P]` indican independencia de archivos, no un equipo. Proyecto de un solo alumno → orden secuencial de prioridad P1 → P2 → P3, deteniéndose en cada checkpoint.

---

## Parallel Example: US1 (retratos)

```bash
# Lanzar la selección/descarga de los 6 retratos en paralelo:
Task: "Retrato de Cooper → assets/img/personajes-cooper.jpg"
Task: "Retrato de Murph → assets/img/personajes-murph.jpg"
Task: "Retrato de Dr. Brand → assets/img/personajes-brand.jpg"
Task: "Retrato de Profesor Brand → assets/img/personajes-profesor-brand.jpg"
Task: "Retrato de Mann → assets/img/personajes-mann.jpg"
Task: "Retrato de TARS & CASE → assets/img/personajes-tars-case.jpg"
```

---

## Estrategia de implementación

### MVP primero (Historia de Usuario 1)

1. Fase 1: Setup (base conocida).
2. Fase 2: Foundational (esqueleto HTML + CSS `.ficha-*`).
3. Fase 3: US1 — redactar las 6 fichas (texto + reparto), luego retratos + créditos, validar E1/E3/E4/E5.
4. **PARAR y VALIDAR**: sin placeholders, jerarquía correcta, retratos con `alt` descriptivo, reparto consistente, 6 créditos en el pie.
5. El eje Personajes ya informa y tiene identidad por ficha: entregable demostrable.

### Entrega incremental

1. Setup + Foundational → andamiaje listo.
2. US1 → E1/E3/E4/E5 → **MVP** (fichas completas).
3. US2 → E2 → distinción Brand y TARS & CASE inequívoca.
4. US3 → E6 → confirmada la no-regresión.
5. Polish → E1–E6 de corrido + E7 (SC-006 blanda).

---

## Notas

- `[P]` = archivos distintos, sin dependencias de tareas incompletas.
- La etiqueta `[Story]` mapea la tarea a su historia (solo US1–US3; Setup/Foundational/Polish no llevan).
- El único test test-first es T020 (créditos del pie, Principio V); el resto se valida por aceptación (`quickstart.md`).
- El retrato es **en línea** con `alt` **descriptivo** (imagen informativa), a diferencia de los backdrops decorativos `alt=""` de la feature 002.
- `personajes-astronauta.jpg` (asset genérico de la feature 001) NO se toca: fuera de alcance.
- Commits tras cada tarea o grupo lógico, Conventional Commits sin atribución a IA.
- NO crear tareas para lo que está fuera de alcance: galerías multi-imagen, contenido científico etiquetado (FR-009), animaciones del viaje (FR-010), fichas para Tom/Romilly/Doyle/Edmunds, páginas de otros ejes.
- Ante duda, `constitution.md` prevalece.
