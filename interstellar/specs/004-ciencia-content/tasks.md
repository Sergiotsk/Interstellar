---

description: "Task list — Contenido del eje La Ciencia (004)"
---

# Tasks: Contenido del eje La Ciencia

**Input**: Documentos de diseño en `/specs/004-ciencia-content/`

**Prerrequisitos**: plan.md (obligatorio) · spec.md (obligatorio para historias de usuario) · research.md (incluye la tabla §D6 afirmación→fuente→etiqueta) · data-model.md · contracts/ · quickstart.md · `.specify/memory/constitution.md` (autoridad; Principio VI activo)

**Tests**: Esta feature **NO cambia lógica JS** (`js/layout.js`, `js/nav-data.js`, `tests/` intactos). No se agregan tests de framework. Todo es capa presentacional (HTML de `ciencia.html`, CSS): se valida contra los criterios de aceptación de la spec y los escenarios de `quickstart.md` (Principio V). La suite `node --test tests/*.test.js` DEBE seguir en verde **sin modificaciones**.

**Organización**: Tareas agrupadas por historia de usuario para implementación y validación independientes.

## Formato: `[ID] [P?] [Story] Descripción`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias de tareas incompletas).
- **[Story]**: Historia de usuario (US1, US2, US3). Setup/Foundational/Polish **NO** llevan etiqueta.
- **Toda** descripción incluye ruta de archivo exacta y acción concreta.
- IDs secuenciales T001…T018, sin reutilización.

## Convenciones de ruta

- Código fuente en la raíz del repo: `ciencia.html`, `css/global.css`.
- **Sin cambios** en `js/layout.js`, `js/nav-data.js`, `tests/`, `assets/img/`, `assets/img/CREDITOS.md`.
- Nombres kebab-case, minúsculas, sin acentos para ids y clases (`#agujeros-de-gusano`, `.rigor-licencia`).
- **Rutas internas relativas**, nunca `/` inicial (constitución 1.1.0 / GitHub Pages — FR-014).
- La etiqueta de rigor lleva **texto real del nivel**, no solo glifo ni solo color (FR-011, FR-016).

---

## Fase 1: Setup

**Propósito**: punto de partida verificable para medir la no-regresión de US3.

- [X] T001 Servir el sitio por HTTP (`python -m http.server 8000` desde la raíz) y ejecutar `node --test tests/*.test.js` (el arg de directorio `node --test tests/` está roto en Node 25); confirmar que `smoke.test.js`, `submenu-state.test.js` y `layout.test.js` pasan en verde ANTES de tocar nada. Registrar la línea base de tests verdes; esa cifra NO debe cambiar al terminar la feature.

**Checkpoint**: base conocida; se puede empezar Foundational.

---

## Fase 2: Foundational (Prerrequisitos bloqueantes)

**Propósito**: andamiaje de HTML y CSS que las tres historias necesitan.

**CRÍTICO**: US1 no puede empezar hasta que esta fase termine.

- [X] T002 Reescribir el esqueleto del `<main>` de `ciencia.html` según `contracts/ciencia-page.md`: conservar/ajustar la `<section>` de intro (`<h1>La Ciencia</h1>` + `<p>`) y agregarle un `<dl class="rigor-leyenda">` con 3 pares `<dt>`/`<dd>` **vacíos** (orden `real` → `plausible` → `licencia`); en cada una de las 4 `<section id>` (`agujeros-negros`, `dilatacion-temporal`, `agujeros-de-gusano`, `relatividad`) reemplazar el placeholder por: `class="concepto"` en la `<section>`, un `<h2>` con el nombre visible (coincidente con `js/nav-data.js`: "Agujeros negros", "Dilatación temporal", "Agujeros de gusano", "Relatividad") y los tres `<h3>` «La ciencia» / «En Interstellar» / «Fuentes» en ese orden, con `<p>` y `<ul>` **vacíos** por completar. Solo en `#agujeros-negros`, agregar un `<figure>` con `<img src="assets/img/ciencia-agujero-negro.jpg" alt="…">` (ruta relativa) y un `<figcaption>` **vacío**. Conservar los `id` exactos y el `<script type="module" src="js/layout.js">`. NO declarar `<header>` ni `<footer>` (FR-009). Ninguna ruta con `/` inicial (FR-014).
- [X] T003 [P] Agregar a `css/global.css` la sección 13 "concepto de ciencia + etiqueta de rigor" (`research.md` D5, `contracts/ciencia-page.md` §CSS asociado): `.concepto h3` (`var(--font-hero-titulo)`, tamaño intermedio, `h3:first-of-type { margin-top: 0 }`), `.concepto p` y `.concepto li` (`var(--font-texto)`, `var(--color-texto-atenuado)`, line-height cómodo), `.concepto ul` (`margin: 0; padding-left: 1.25rem`), `.concepto figure` (`margin` propio, `max-width` acotado, centrado, borde/fondo sutil con `var(--color-superficie)`, `img { display:block; width:100%; height:auto }`, SIN `--backdrop-oscurecer`), `.concepto figcaption` (`var(--color-texto-atenuado)`, reducido), `.rigor` (base: `display:inline-block; white-space:nowrap;` tipografía pequeña, `padding` mínimo, `border-radius`, `border` sutil con `color-mix(... var(--color-texto) ...)`, `background-color: var(--color-superficie)`, `margin-left`), `.rigor-real` / `.rigor-plausible` / `.rigor-licencia` (variación **mínima** dentro de la paleta; único acento saturado admitido = `var(--color-gargantua)`, reservado para `.rigor-licencia`), `.rigor-leyenda` (layout compacto `<dt>`→`<dd>`, `<dt>` en `var(--color-texto)`, `<dd>` en `var(--color-texto-atenuado)`, margen inferior). **Sin custom properties nuevas. Sin segundo color saturado. La distinción de nivel la da el texto, no el color** (FR-016). Verificar a 320/768/1280 px que la página no genera desplazamiento horizontal (FR-012, SC-006).

**Checkpoint**: andamiaje listo; US1 puede comenzar.

---

## Fase 3: Historia de Usuario 1 — «Entender la física real detrás de Interstellar» (Prioridad: P1) ⭐ MVP

**Goal**: las 4 secciones de `ciencia.html` con contenido divulgativo real en la plantilla de 3 bloques, cada afirmación científica con su etiqueta de rigor inline según `research.md` §D6, y su bloque «Fuentes».

**Independent Test**: E1 y E4 de `quickstart.md` — recorrer las 4 secciones, verificar los 3 bloques por concepto, la cobertura de FR-006, que `#relatividad` funciona como sección paraguas, que no queda placeholder, y que ninguna ruta es absoluta.

> Las tareas T004–T008 editan el MISMO archivo (`ciencia.html`): van en secuencia, sin `[P]`.
> El nivel de rigor de cada afirmación se toma de `research.md` §D6 y NO se puede subir de nivel sin cambiar también esa tabla.

- [X] T004 [US1] Redactar **Agujeros negros** en `ciencia.html` (`<section id="agujeros-negros">`): bloque «La ciencia» (párrafos que cubren horizonte de eventos, disco de acreción, lente gravitacional / imagen de Gargantúa, espín de Gargantúa, singularidad amable — FR-006) y bloque «En Interstellar» (cómo la película lo muestra), con cada `<p>` de contenido científico terminando en su `<span class="rigor rigor-<nivel>">` según las filas AN-1…AN-6 de `research.md` §D6 (un solo nivel por `<p>`). Bloque «Fuentes»: `<ul>` con Thorne 2014 (caps. de agujeros negros y Gargantúa) y James et al. 2015 (arXiv:1502.03808). Completar el `<figcaption>` y el `alt` del `<figure>` describiendo qué muestra la imagen. Español divulgativo, spoilers al mínimo.
- [X] T005 [US1] Redactar **Dilatación temporal** en `ciencia.html` (`<section id="dilatacion-temporal">`): «La ciencia» (el tiempo corre más lento en un pozo gravitatorio; por qué 1 h en Miller ≈ 7 años fuera; la nave en órbita alta casi no la sufre — FR-006) y «En Interstellar», con etiquetas inline según las filas DT-1…DT-4 de `research.md` §D6. «Fuentes»: `<ul>` con Thorne 2014 (cap. "Slowing Time" y cap. de Miller). Sin `<figure>`.
- [X] T006 [US1] Redactar **Agujeros de gusano** en `ciencia.html` (`<section id="agujeros-de-gusano">`): «La ciencia» (atajo en el espacio-tiempo; puente de Einstein-Rosen; la forma esférica correcta; necesidad de "materia exótica" — FR-006) y «En Interstellar», con etiquetas inline según AG-1…AG-4 de `research.md` §D6. «Fuentes»: `<ul>` con Thorne 2014 (cap. "Wormholes") y James et al. "Visualizing Interstellar's Wormhole", AJP 83 (2015). Sin `<figure>`.
- [X] T007 [US1] Redactar **Relatividad** en `ciencia.html` (`<section id="relatividad">`) como **sección paraguas**: «La ciencia» (relatividad general: el espacio-tiempo se curva con la masa, no hay tiempo absoluto; presentar agujeros negros / dilatación / agujeros de gusano como **consecuencias**, referenciados como casos derivados y NO re-explicados en profundidad — FR-006, clarificación 2026-08-29) y «En Interstellar» (el Tesseract, la gravedad entre dimensiones, el amor como "fuerza"), con etiquetas inline según RE-1…RE-6 de `research.md` §D6 (varias `✎` en esta sección). «Fuentes»: `<ul>` con Thorne 2014 (caps. "Warped Time and Space" y del Tesseract). Sin `<figure>`.
- [X] T008 [US1] Ajustar el `<p>` de la `<section>` de intro de `ciencia.html` (la del `<h1>La Ciencia</h1>`) para que encuadre el eje (qué conceptos vas a encontrar y que la película mezcla tres niveles de rigor) sin repetir el texto placeholder anterior. NO tocar todavía el `<dl class="rigor-leyenda">` (eso es US2).
- [X] T009 [US1] Validar US1 contra E1 y E4 de `quickstart.md`: buscar "Sección futura dedicada a" en `ciencia.html` y confirmar 0 coincidencias (SC-001); confirmar que cada `section[id].concepto` tiene exactamente 1 `<h2>` y 3 `<h3>` en el orden «La ciencia» / «En Interstellar» / «Fuentes»; jerarquía `h1 > h2 > h3` sin saltos (FR-011); cada bloque «Fuentes» es un `<ul>` con ≥1 `<li>` (SC-005); `#relatividad` menciona los otros tres temas como consecuencias sin re-explicarlos; `ciencia.html` sin `<canvas>`/IntersectionObserver/`@keyframes` **y sin ningún `href` a anclas del eje El Viaje (`viaje.html#…`) — las referencias a escenas son textuales** (FR-010); y **sin ningún `href`/`src` que empiece con `/`** (FR-014). `node --test tests/*.test.js` sin cambios y en verde.

**Checkpoint**: US1 funcional y testeable sola — el eje La Ciencia ya explica los cuatro conceptos con sus etiquetas de rigor. **MVP entregable.**

---

## Fase 4: Historia de Usuario 2 — «Distinguir ciencia real de licencia narrativa» (Prioridad: P1)

**Goal**: la leyenda de rigor visible una vez, y la garantía del Principio VI — cada afirmación etiquetada coincide con `research.md` §D6, las tres etiquetas aparecen, ninguna `✎` vendida como `✓`.

**Independent Test**: E2 y E3 de `quickstart.md` — leyenda `<dl>` con los 3 niveles; todo `<p>` científico con su `.rigor`; las 3 clases presentes; cruce contra `research.md` §D6 sin discrepancias; «Fuentes» por sección.

- [X] T010 [US2] Completar el `<dl class="rigor-leyenda">` de la `<section>` de intro de `ciencia.html`: 3 pares `<dt>`/`<dd>` con el significado de cada nivel tomado del Principio VI de la constitución y de `research.md` D3 — `✓ Ciencia real` = "fielmente representada; física establecida"; `~ Especulación plausible` = "permitida por la física en teoría, pero hipotética"; `✎ Licencia narrativa` = "forzada por el guion, cuestionada por la física". Una sola leyenda en toda la página; texto real (sin `title`, sin depender de color) — FR-004, FR-011.
- [X] T011 [US2] Validar US2 contra E2 y E3 de `quickstart.md` (puerta de aceptación del Principio VI): (a) todo `<p>` con contenido científico en `.concepto` termina con un `<span class="rigor">` y su texto incluye el nombre del nivel (FR-003, FR-011); (b) las tres clases `rigor-real`, `rigor-plausible`, `rigor-licencia` aparecen al menos una vez (SC-003); (c) para cada `.rigor` de `ciencia.html`, localizar la afirmación en `research.md` §D6 y confirmar que el nivel **coincide** — **ninguna** afirmación catalogada `licencia` en §D6 aparece con `rigor-real`, y ninguna `rigor-real` carece de fila de respaldo (FR-005, SC-004); (d) cada sección tiene «Fuentes» con ≥1 referencia del conjunto aprobado que respalda al menos una afirmación de esa sección (SC-005). La revisión es afirmación‑contra‑fuente; no requiere formación en física.

**Checkpoint**: US1 + US2 — el eje explica y etiqueta con criterio; el Principio VI queda verificado contra fuentes.

---

## Fase 5: Historia de Usuario 3 — «Seguir navegando y compartiendo sin fricción» (Prioridad: P3)

**Goal**: garantía de no-regresión sobre lo entregado por las features 001–003.

**Independent Test**: E5 de `quickstart.md` — header/submenú/pie idénticos a otra página, 4 anclas con carga directa, foco, responsive, consola limpia, tests sin cambios.

- [X] T012 [US3] Confirmar con `git diff` que NO cambiaron `js/nav-data.js`, `js/layout.js`, `tests/`, `assets/img/` ni `assets/img/CREDITOS.md` (los diffs de esas rutas deben estar vacíos). El submenú "La Ciencia" sigue apuntando a `ciencia.html#agujeros-negros`, `#dilatacion-temporal`, `#agujeros-de-gusano`, `#relatividad` (FR-001, FR-015).
- [X] T013 [US3] Probar carga directa de las 4 anclas (`http://localhost:8000/ciencia.html#agujeros-de-gusano`, y las otras 3): cada sección queda visible y usable por debajo del encabezado, con la `scroll-margin-top` sobre `section[id]` de la feature 001 aplicando sin cambios (SC-007, FR-015). Comparar encabezado, submenú y pie de `ciencia.html` contra `personajes.html`: idénticos en contenido y comportamiento (FR-009). Recorrer con teclado: foco visible, orden de tabulación coherente.
- [X] T014 [US3] DevTools → Console en las 2 últimas versiones de Chrome, Edge y Firefox: recorrido completo de `ciencia.html` (carga, scroll, apertura de anclas) sin errores ni 404 (FR-013, SC-008). Confirmar que la imagen `assets/img/ciencia-agujero-negro.jpg` carga por ruta relativa. `node --test tests/*.test.js` en verde y con la misma cifra de tests que T001.
- [X] T015 [US3] Validar responsive contra E6 de `quickstart.md`: a 320 px, 768 px y 1280 px, todo el contenido, las etiquetas `.rigor`, la `<dl class="rigor-leyenda">` y la imagen de `#agujeros-negros` permanecen dentro del viewport, sin desplazamiento horizontal involuntario ni recorte; una etiqueta de rigor al final de una línea no rompe la maqueta a 320 px.

**Checkpoint**: las 3 historias funcionales e independientemente verificables.

---

## Fase 6: Pulido y verificación transversal

- [ ] T016 [P] Ejecutar la verificación blanda de comprensión E7 / SC-009: 3 personas sin formación en física leen una sección al azar y se registra si explican en una o dos frases qué es ese concepto y dónde aparece en la película. Meta orientativa ≥2/3. Si no se alcanza, ajustar la redacción de la(s) sección(es) floja(s) y re-verificar. **No bloquea la entrega.**
- [X] T017 Ejecutar de una sola pasada el recorrido E1–E6 de `quickstart.md` sobre el sitio servido por HTTP; registrar resultado por escenario y corregir cualquier defecto encontrado. Prestar especial atención a E3 (puerta del Principio VI).
- [X] T018 [P] Revisión final de repositorio: `git diff --check` (sin espacios al final de línea ni marcadores de conflicto); confirmar que **solo** cambiaron `ciencia.html` y `css/global.css`; mensajes de commit con Conventional Commits (`feat:`, `docs:`…) sin atribución a IA ni `Co-Authored-By` (constitución).

**Checkpoint**: feature completa tras E1–E6 en verde; E7 registrada.

---

## Dependencias y orden de ejecución

### Dependencias de fase

- **Setup (Fase 1)**: sin dependencias.
- **Foundational (Fase 2)**: depende de Setup — **BLOQUEA** US1.
- **US1 (Fase 3)**: depende de Foundational. Entrega el MVP.
- **US2 (Fase 4)**: depende de US1 (la leyenda explica etiquetas que US1 ya puso; la verificación cruza el contenido de US1 contra `research.md` §D6). T010 (leyenda) puede hacerse en paralelo con las últimas tareas de US1 si se quiere, pero T011 (verificación) requiere US1 completo.
- **US3 (Fase 5)**: verificación; se corre cuando US1 y US2 están aplicadas.
- **Polish (Fase 6)**: depende de las historias deseadas completas.

### Dependencias a nivel de archivo (concretas)

- `ciencia.html` esqueleto (T002) ANTES de redactar contenido (T004–T008), completar la leyenda (T010) y verificar (T009, T011).
- `css/global.css` con la sección 13 (T003) ANTES de validar responsive/maqueta (T003 mismo, T015).
- T004–T008 son el MISMO archivo, secuenciales.
- La tabla `research.md` §D6 es entrada de T004–T007 (niveles de rigor) y la referencia de T011 (verificación).

### Dentro de cada historia

- US1: T004→T005→T006→T007→T008 (mismo archivo, secuencial) → T009 (validación).
- US2: T010 (leyenda) → T011 (verificación del Principio VI).
- US3: T012→T013→T014→T015, todo verificación.

---

## Oportunidades de paralelización

- **Foundational**: T003 (`css/global.css`) es archivo distinto de T002 (`ciencia.html`) — `[P]`; el CSS se puede escribir desde el contrato sin esperar el HTML.
- **US1/US2**: T010 (leyenda, `<dl>` de la intro) toca una zona distinta del `<main>` que T004–T007 (secciones de concepto); si se coordina para no pisar el archivo, puede solaparse. Por simplicidad (un solo alumno), va secuencial.
- **Polish**: T016 (prueba con personas) y T018 (revisión de repo) son independientes — `[P]`.
- **Nota**: los marcadores `[P]` indican independencia de archivos, no un equipo. Proyecto de un solo alumno → orden secuencial de prioridad P1 → P1 → P3, deteniéndose en cada checkpoint.

---

## Estrategia de implementación

### MVP primero (Historia de Usuario 1)

1. Fase 1: Setup (base conocida).
2. Fase 2: Foundational (esqueleto HTML + CSS sección 13).
3. Fase 3: US1 — redactar los 4 conceptos con sus etiquetas de rigor (según `research.md` §D6), validar E1/E4.
4. **PARAR y VALIDAR**: sin placeholders, jerarquía correcta, 3 bloques por concepto, «Fuentes» por sección, rutas relativas.
5. El eje La Ciencia ya explica y etiqueta: entregable demostrable.

### Entrega incremental

1. Setup + Foundational → andamiaje listo.
2. US1 → E1/E4 → **MVP** (contenido + etiquetas).
3. US2 → E2/E3 → leyenda + Principio VI verificado contra fuentes.
4. US3 → E5 → confirmada la no-regresión.
5. Polish → E1–E6 de corrido + E7 (SC-009 blanda).

---

## Notas

- `[P]` = archivos distintos, sin dependencias de tareas incompletas.
- La etiqueta `[Story]` mapea la tarea a su historia (solo US1–US3; Setup/Foundational/Polish no llevan).
- **No hay tarea de TDD**: esta feature no cambia lógica JS. La suite existente queda intacta y en verde (verificado en T001, T014).
- El nivel de rigor de cada afirmación sale de `research.md` §D6 y es puerta de aceptación (SC-004): ninguna `✎` como `✓`.
- Commits tras cada tarea o grupo lógico, Conventional Commits sin atribución a IA.
- NO crear tareas para lo que está fuera de alcance: imágenes nuevas, cambios en `js/`, `tests/` o `CREDITOS.md`, contenido del eje El Viaje, animaciones (FR-010), enlaces a anclas de ejes todavía placeholder.
- Ante duda, `constitution.md` prevalece.
