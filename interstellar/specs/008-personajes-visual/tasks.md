---

description: "Task list for Rediseño visual de Personajes — hero, galería, visor Nav-Ranger"
---

# Tasks: Rediseño visual de Personajes — hero cinematográfico, galería de escenas y visor Nav-Ranger

**Input**: Design documents from `specs/008-personajes-visual/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/personajes-page.md, quickstart.md — todos presentes.

**Tests**: NO se incluyen tareas de test unitario. Esta feature es 100% capa presentacional
(HTML + CSS + animación de scroll/ciclado); la constitución (Principio V) reserva TDD estricto
para lógica con ramas de decisión reales (minijuegos, `layout.js`, `creditos.js`), no para este
tipo de componente — mismo criterio que ya rige `js/filmstrip.js` y `js/mundo-portada.js`, sin
tests hoy. La validación es manual, contra `quickstart.md`.

**Organization**: Tareas agrupadas por user story de `spec.md` (US1-US5), en orden de prioridad.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: User story a la que pertenece (US1-US5)

## Path Conventions

Sitio estático de página única — rutas reales del repo: `personajes.html` (raíz),
`css/personajes.css`, `js/personajes.js` (nuevo), `assets/img/`, `CREDITOS.md`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffolding compartido, sin lógica ni contenido todavía.

- [X] T001 [P] Crear `js/personajes.js` — módulo ES vacío con comentario de cabecera (mismo
  criterio de `js/mundo-portada.js`: un módulo por responsabilidad, cargado solo en esta
  página) y agregar `<script type="module" src="js/personajes.js"></script>` en
  `personajes.html`, después del `<script>` de `js/layout.js` ya existente.
- [X] T002 [P] En `css/personajes.css`, agregar los 5 bloques de comentario-sección vacíos:
  Portada / Hero / Galería (riel-tira) / Cierre + Visor Nav-Ranger / Degradado heredado
  (contrato 003) — scaffold que evita colisión de nombres entre las fases siguientes.

**Checkpoint**: Estructura de archivos lista, sin romper nada de lo existente.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Checkpoint de datos que condiciona qué patrón aplica a cada personaje.

- [X] T003 Verificar en `assets/img/` que existen los stills listados en la tabla "Estado de
  disponibilidad de assets" de `data-model.md` (5 de Cooper, 4 de Murph, 1-2 del resto) —
  checkpoint sin crear archivos; si algo no coincide, actualizar la tabla de `data-model.md`
  antes de seguir.

**Checkpoint**: Confirmado qué personajes son `patron: completo` (Cooper, Murph) vs
`patron: degradado` (los otros 4) antes de tocar `personajes.html`.

---

## Phase 3: User Story 1 - Portada de tripulación en mosaico (Priority: P1) 🎯 MVP

**Goal**: Reemplazar la intro de texto plano por un mosaico de 6 retratos clickeables; el único
`<h1>` de la página vive acá.

**Independent Test**: Abrir `personajes.html` sin ancla — ver Escenario 0 de `quickstart.md`.

### Implementation for User Story 1

- [X] T004 [US1] En `personajes.html`, reemplazar la `<section>` de intro actual
  (`<h1>Personajes</h1>` + párrafo) por `<section class="portada-tripulacion">` con el mismo
  `<h1>`/párrafo + `<ul class="galeria-grid">` de 6 `<li><figure><a href="#<id>"><img
  src="assets/img/personajes-<id>.jpg" alt=""><figcaption>Nombre <span>Rol</span></figcaption>`
  — uno por personaje, mismo orden e `id` que las 6 secciones existentes. Ver esqueleto en
  `contracts/personajes-page.md`.
- [X] T005 [US1] En `css/personajes.css` (sección "Portada"), agregar `.portada-tripulacion`
  (`min-height` casi pantalla completa) y el overlay de nombre/rol sobre cada `figcaption`
  dentro de `.galeria-grid` — la regla `.galeria-grid` en sí se PORTA (copia textual, no link
  cruzado) desde `css/galeria.css`, ver `research.md` §6b.
- [X] T006 [US1] Validar Escenario 0 de `quickstart.md`: los 6 enlaces navegan a su ficha,
  `document.querySelectorAll('main h1').length === 1`, sin scroll horizontal a 320px.

**Checkpoint**: Portada funcional y navegable, independiente de todo lo demás.

---

## Phase 4: User Story 2 - Hero cinematográfico por personaje (Priority: P1)

**Goal**: Hero full-bleed para Cooper y Murph (los 2 `patron: completo`).

**Independent Test**: Abrir `#cooper` / `#murph` — ver Escenario 1 de `quickstart.md`.

### Implementation for User Story 2

- [X] T007 [P] [US2] En `personajes.html`, dentro de `<section id="cooper">`, anteponer el
  hero full-bleed (`.personaje-hero-img-wrap > img` + `.personaje-hero-ficha` con rol/nombre/
  bajada) según el esqueleto de `contracts/personajes-page.md`, dejando debajo el resto de la
  ficha (`.ficha-personaje` actual) sin modificar todavía.
- [X] T008 [P] [US2] Ídem para `<section id="murph">` en `personajes.html`.
- [X] T009 [US2] En `css/personajes.css` (sección "Hero"), agregar `.personaje-hero` /
  `.personaje-hero-img-wrap` / `.personaje-hero-img` / `.personaje-hero-ficha` — portado 1:1
  de `spikes/personajes-galeria-vertical.html` (`min-height: 92svh`, scrim degradado, ficha
  apoyada abajo). Depende de T007/T008.
- [X] T010 [US2] Validar Escenario 1 de `quickstart.md`: hero full-bleed legible en `#cooper` y
  `#murph`, sin scroll horizontal a 320px; `#mann` (degradado) sigue con el patrón viejo.

**Checkpoint**: Cooper y Murph con hero nuevo; el resto de la ficha (texto) sigue en formato
viejo hasta las fases siguientes — estado intermedio válido.

---

## Phase 5: User Story 3 - Galería de escenas con texto sincronizado (Priority: P1)

**Goal**: Riel de 3 escenas por personaje con texto sincronizado en corte duro.

**Independent Test**: Scrollear `#cooper` / `#murph` — ver Escenario 2 de `quickstart.md`.

### Implementation for User Story 3

- [X] T011 [P] [US3] ~~Curar 3 fotogramas de escena de Cooper desde el volcado~~ — DESVÍO:
  se reusaron los 3 stills ya curados y ya versionados (`personajes-cooper-casco.jpg`,
  `-sudor.jpg`, `-murph-adios.jpg`), en vez de duplicar contenido nuevo con la convención
  `-escena-NN`. Ya estaban en `CREDITOS.md` de features anteriores — sin fila nueva.
- [X] T012 [P] [US3] Ídem para Murph — se reusaron `personajes-murph-nina.jpg`, `-corre.jpg`,
  `-anciana.jpg` (mismo desvío que T011).
- [X] T013 [US3] En `personajes.html`, dentro de `<section id="cooper">`, insertar
  `.riel-tira[data-riel-t]` con `.tira-datos` (3 `.tira-datos-item` con label/título/
  descripción/dato curioso REAL, no placeholder) y `.tira-fotogramas > .tira-pista` (3
  `.tira-frame` apuntando a los fotogramas de T011) — según esqueleto del contrato. Depende
  de T011.
- [X] T014 [US3] Ídem para `<section id="murph">`, usando los fotogramas de T012. Depende de
  T012.
- [X] T015 [US3] En `css/personajes.css` (sección "Galería"), agregar `.riel-tira` /
  `.tira-datos*` / `.tira-fotogramas` / `.tira-pista` / `.tira-frame` — portado de
  `spikes/personajes-galeria-vertical.html` (panel 30%/70%, degradado sin JS en flujo normal).
- [X] T016 [US3] En `js/personajes.js`, implementar la función que arma el riel de galería
  (import dinámico de `js/vendor/gsap@3.13.0/gsap.mjs` + `ScrollTrigger.mjs`, `scrub`,
  alternancia de `.activa` en corte duro entre `.tira-datos-item` y `.tira-frame` según
  `progress`) — mismo algoritmo que `spikes/personajes-galeria-vertical.html`, adaptado a
  producción; degradado a `prefers-reduced-motion` / fallo de carga de GSAP.
- [X] T017 [US3] Validar Escenario 2 de `quickstart.md`: sincronía scrub en `#cooper`/`#murph`
  confirmada en navegador (riel armado, indicador de progreso, corte duro texto↔fotograma).
  Degradado sin GSAP / reduced-motion validado por lectura de código (mismo patrón ya probado
  en Mundos), no repetido en browser en esta pasada.

**Checkpoint**: Galería funcional y sincronizada en Cooper y Murph, independiente del visor.

---

## Phase 6: User Story 4 - Visor Nav-Ranger con secuencias reales (Priority: P2)

**Goal**: Visor con piel de cockpit que cicla tramos curados de fotogramas, al cierre de cada
ficha completa.

**Independent Test**: Ver Escenario 3 de `quickstart.md`.

### Implementation for User Story 4

- [X] T018 [P] [US4] Curados 2 tramos de 4 frames consecutivos de Cooper desde el volcado
  local (identificados visualmente, no por timestamp exacto): "El despegue" (cabina del
  Ranger, frames 3078-3081) y "Acoplamiento de emergencia" (frames 9009-9012). Guardados como
  `assets/img/personajes-cooper-visor-01.jpg` a `-08.jpg` (recorte de letterbox + resize 900px
  vía `sharp`), filas agregadas en `assets/img/CREDITOS.md` + `js/creditos.js`.
- [X] T019 [P] [US4] Ídem para Murph: "La despedida" (frames 2946-2949) y "El mensaje del
  Tesseract" (frames 10701-10704) → `assets/img/personajes-murph-visor-01.jpg` a `-08.jpg`.
- [X] T020 [US4] En `personajes.html`, dentro de `<section id="cooper">`, insertar
  `.personaje-cierre` (bloque de texto "Su papel en la historia" + "Rasgos distintivos" +
  `.nav-visor-bloque > .nav-visor[data-nav-visor][data-intervalo="450"]` con un `<img
  class="nav-visor-frame">` por fotograma de T018, la primera con `.is-activo`) — según
  esqueleto del contrato. Depende de T018.
- [X] T021 [US4] Ídem para `<section id="murph">`, usando los fotogramas de T019. Depende de
  T019.
- [X] T022 [US4] En `css/personajes.css` (sección "Cierre + Visor Nav-Ranger"), agregar
  `.personaje-cierre` / `.nav-visor` / `.nav-visor-cabecera` / `.nav-visor-pantalla` /
  `.nav-visor-frame` / `.nav-visor-pie` — portado de `spikes/personajes-galeria-vertical.html`
  (piel cockpit: `--cockpit-metal`, `--cockpit-bezel`, `--instrumento-teal`,
  `--font-instrumento`; explícitamente NO la estética de `#en-celuloide`).
- [X] T023 [US4] En `js/personajes.js`, implementar el ciclador del visor (`setInterval` según
  `data-intervalo`, `IntersectionObserver` para pausar/reanudar fuera de vista,
  `prefers-reduced-motion` → solo primer frame fijo, sin ciclar).
- [X] T024 [US4] Validar Escenario 3 de `quickstart.md`: loop confirmado en navegador (cambio
  de fotograma verificado con zoom), REC parpadeante, ausencia total en `#mann` confirmada.
  Pausa fuera de viewport y reduced-motion validados por lectura de código (mismo mecanismo ya
  usado), no repetidos en browser en esta pasada.

**Checkpoint**: Cooper y Murph con el patrón completo (hero + galería + visor) — alcance
mínimo viable de la feature (junto con US1) cumplido.

---

## Phase 7: User Story 5 - Migración completa de las 6 fichas (Priority: P3)

**Goal**: Extender el patrón completo a Brand, Profesor Brand, Mann y TARS/CASE a medida que
se cura material — sin tocar código nuevo, solo reusar lo de US2-US4.

**Independent Test**: Ver Escenario 4 (y, para cada uno migrado, repetir Escenarios 1-3) de
`quickstart.md`.

### Implementation for User Story 5

- [ ] T025 [US5] Curar stills adicionales + 3 escenas + 2-3 tramos de visor para `#brand`
  (`assets/img/personajes-brand-*.jpg` + `CREDITOS.md`) y aplicarle el mismo markup que
  Cooper/Murph en `personajes.html` (reusa el CSS de T005/T009/T015/T022 y el JS de
  T016/T023 sin cambios).
- [ ] T026 [US5] Ídem para `#profesor-brand`.
- [X] T027 [US5] Ídem para `#mann` — DESVÍO: se reusaron stills ya curados de
  `mundos-mann.html` (`mundos-mann-retrato/-mann/-engano/-docking.jpg`) en vez
  de curar fotogramas nuevos del volcado, mismo criterio que T011/T012. Hero +
  galería de 3 escenas + **visor Nav-Ranger completos**: 2 tramos de 4
  fotogramas consecutivos curados del volcado local — "El mejor de nosotros"
  (07900-07903, Mann conversando con Cooper en su llegada) y "La confesión al
  borde del abismo" (07945-07948, la confrontación en el glaciar) — guardados
  como `personajes-mann-visor-01.jpg` a `-08.jpg` (recorte centrado a 2.31:1 +
  resize 900px vía `sharp`, mismo criterio que Cooper/Murph). Filas de crédito
  nuevas en `CREDITOS.md` + `js/creditos.js`, tanto para los 4 stills reusados
  (no tenían fila propia pese a usarse ya en `mundos-mann.html`) como para los
  8 fotogramas del visor. Mann queda con el patrón completo, igual que Cooper
  y Murph.
- [ ] T028 [US5] Ídem para `#tars-case`.
- [ ] T029 [US5] Validar Escenario 4 de `quickstart.md` para los personajes ya migrados en
  T025-T028 (o confirmar que los que sigan sin curar permanecen correctamente degradados).

**Checkpoint**: Las 6 fichas en el patrón nuevo (alcance completo de la feature), o degradadas
prolijamente donde aún falte contenido — ambos estados son válidos según FR-009.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Cierre formal de la feature.

- [ ] T030 [P] Actualizar `specs/003-personajes-content/contracts/personajes-page.md` con una
  nota de cabecera que referencia a `specs/008-personajes-visual/contracts/personajes-page.md`
  como reemplazo parcial (FR-007) — para que quien abra el contrato viejo sepa que está
  parcialmente derogado.
- [ ] T031 [P] Correr los 5 escenarios completos de `quickstart.md` en Chrome, Edge y Firefox;
  tildar el checklist de cierre (SC-001 a SC-008) dentro del propio `quickstart.md`.
- [ ] T032 Verificar `git status` — confirmar que `assets/cap-that.com_interstellar(2014)/` y
  `assets/photo-gallery-*/` no aparecen como candidatos a commit (SC-007).
- [ ] T033 Decidir con el usuario si los spikes `spikes/personajes-*.html` se borran o se dejan
  como referencia histórica, una vez que todo lo portado esté validado en producción.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias — arranca de inmediato.
- **Foundational (Phase 2)**: depende de Setup — checkpoint de datos, no bloquea en el sentido
  estricto de "todas las historias necesitan código de acá", pero SÍ condiciona qué se
  implementa en cada una.
- **User Stories (Phase 3-7)**: todas pueden arrancar después de Foundational. US1 (portada) y
  US2 (hero) son 100% independientes entre sí y del resto (CSS/HTML puro, sin JS). US3
  (galería) y US4 (visor) comparten `js/personajes.js` (Setup) pero son independientemente
  testeables — completar solo hasta US3 deja una ficha funcional sin visor. US5 depende
  enteramente de que US2-US4 ya existan (reusa su CSS/JS), por eso es la última.
- **Polish (Phase 8)**: depende de que las historias que se vayan a entregar en este corte
  estén completas.

### User Story Dependencies

- **US1 (P1)**: sin dependencias de otras historias.
- **US2 (P1)**: sin dependencias de otras historias.
- **US3 (P1)**: usa `js/personajes.js` de Setup; independiente de US1/US2/US4.
- **US4 (P2)**: usa `js/personajes.js` de Setup; independiente de US1/US2/US3 (una ficha puede
  tener galería sin visor, o viceversa).
- **US5 (P3)**: depende de que US2+US3+US4 ya estén implementadas (es la extensión de su
  patrón a los 4 personajes restantes) — única historia con dependencia dura de otras.

### Parallel Opportunities

- T001/T002 (Setup) en paralelo.
- Dentro de cada historia, las tareas de curación de assets por personaje (ej. T011/T012,
  T018/T019) son paralelas entre sí (archivos distintos, sin dependencia mutua).
- T007/T008 (US2, Cooper vs Murph) en paralelo.
- US1 y US2 pueden trabajarse en paralelo por completo (secciones y archivos CSS distintos
  dentro de la misma hoja, sin solapamiento de selectores).
- T030/T031 (Polish) en paralelo.

---

## Parallel Example: User Story 3

```bash
# Curación de assets en paralelo (personajes distintos, sin dependencia mutua):
Task: "Curar 3 fotogramas de escena de Cooper -> assets/img/personajes-cooper-escena-NN.jpg"
Task: "Curar 3 fotogramas de escena de Murph -> assets/img/personajes-murph-escena-NN.jpg"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2)

1. Completar Phase 1 (Setup) + Phase 2 (Foundational).
2. Completar Phase 3 (US1 — portada): ya es una mejora visible y de valor por sí sola.
3. Completar Phase 4 (US2 — hero en Cooper/Murph).
4. **PARAR y VALIDAR**: correr Escenarios 0 y 1 de `quickstart.md`.
5. Esto ya es un MVP razonable: portada + hero nuevo, sin la complejidad de GSAP todavía.

### Incremental Delivery

1. Setup + Foundational → base lista.
2. US1 → portada → validar → (opcional) commit/demo.
3. US2 → hero Cooper/Murph → validar → commit/demo.
4. US3 → galería sincronizada → validar → commit/demo (acá entra GSAP por primera vez).
5. US4 → visor Nav-Ranger → validar → commit/demo (Cooper y Murph ya en patrón completo).
6. US5 → expansión a los 4 restantes, a medida que se cure contenido — no bloquea nada de lo
   anterior, se hace cuando haya material.

### Notas específicas de este proyecto

- Commits en Conventional Commits, sin atribución a IA (constitución, "Flujo de Trabajo").
- Cada tarea que toca `personajes.html`/`css/personajes.css` debe revisarse contra los
  criterios de aceptación de la constitución (responsive, HTML semántico, sin errores de
  consola, rutas relativas, paleta/tipografía) antes de darse por cerrada.
- Las tareas de curación de assets (T011, T012, T018, T019, T025-T028) son las únicas con una
  dependencia real de trabajo humano fuera del código — no son automatizables por el agente
  sin supervisión (elegir el fotograma correcto es una decisión de contenido/narrativa).
