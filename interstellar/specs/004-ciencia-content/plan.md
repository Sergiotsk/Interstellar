# Implementation Plan: Contenido del eje La Ciencia

**Branch**: `feat/004-ciencia-content` | **Date**: 2026-08-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-ciencia-content/spec.md`

**Note**: Este plan es la salida de `/speckit-plan`; su definición describe el flujo de ejecución del diseño.

## Summary

La feature reemplaza el contenido placeholder de las cuatro secciones de `ciencia.html` (Agujeros negros, Dilatación temporal, Agujeros de gusano, Relatividad) por explicaciones divulgativas reales, con una plantilla fija de tres bloques por concepto (**«La ciencia»**, **«En Interstellar»**, **«Fuentes»**) y una **etiqueta de nivel de rigor por afirmación** (`✓ Ciencia real` / `~ Especulación plausible` / `✎ Licencia narrativa`, Principio VI). Es el único eje que activa el Principio VI: cada afirmación se contrasta contra una fuente validada (Thorne 2014; arXiv 1502.03808; AJP 83 2015) **antes** de escribirse, y el mapeo afirmación→fuente vive en `research.md`.

Técnicamente es la feature más acotada de los ejes de contenido: **no incorpora imágenes nuevas** (reutiliza `assets/img/ciencia-agujero-negro.jpg`, ya acreditada desde la feature 001), **no toca `js/layout.js`** ni `tests/` ni `assets/img/CREDITOS.md`. Se reescribe el `<main>` de `ciencia.html` con HTML semántico (un `<h1>`, un `<h2>` por concepto, tres `<h3>` por sección, `<dl>` de leyenda de rigor, `<ul>` de fuentes, `<span class="rigor …">` inline por afirmación) y se agrega la **sección 13** a `css/global.css` con el patrón reutilizable de la etiqueta de rigor y del bloque de contenido de concepto (sin tokens nuevos, sin segundo color saturado). Rutas internas relativas (constitución 1.1.0).

## Technical Context

**Language/Version**: HTML5 semántico, CSS3 (custom properties), JavaScript ES6+ (ES Modules). Sin cambios respecto de las features 001–003.

**Primary Dependencies**: Ninguna en runtime. Google Fonts vía `<link>` (ya presente en `ciencia.html`). Sin build.

**Storage**: N/A. Contenido estático y fijo.

**Testing**: **No hay cambio de lógica JS**, por lo que esta feature NO agrega tests de framework. Todo es capa presentacional (HTML de `ciencia.html`, CSS): se valida contra los criterios de aceptación de la spec y los escenarios de `quickstart.md` (Principio V: aceptación en la presentación). La suite `node --test tests/*.test.js` existente DEBE seguir en verde sin cambios.

**Target Platform**: Navegadores evergreen, últimas 2 versiones de Chrome, Edge y Firefox; sin polyfills. Safari fuera del alcance de verificación (enmienda 2026-08-28 de la feature 001, heredada por SC-008).

**Project Type**: Sitio web estático multi-página, sin paso de build. Esta feature toca una página (`ciencia.html`) y una hoja de estilo compartida (`css/global.css`).

**Performance Goals**: Sin errores de consola en el recorrido de `ciencia.html` (FR-013, SC-008). Sin imágenes nuevas → sin presupuesto de peso adicional. Layout fluido al hacer scroll y abrir anclas.

**Constraints**: Sin frameworks/librerías/TypeScript y sin build (Principio I). **Principio VI activo**: cada afirmación científica etiquetada con su nivel de rigor y respaldada por una fuente validada; ninguna `✎` presentada como `✓` (SC-004, puerta de aceptación). Rutas internas relativas, nunca absolutas con `/` (constitución 1.1.0 / GitHub Pages subpath — FR-014). La información del nivel de rigor NUNCA depende solo del color (FR-016). Responsive desde 320 px sin desplazamiento horizontal (FR-012, SC-006). Anclas `#agujeros-negros #dilatacion-temporal #agujeros-de-gusano #relatividad` sin cambios (FR-001, FR-015). Sin animaciones (FR-010).

**Scale/Scope**: 1 página HTML reescrita en su `<main>`; 4 secciones de concepto con plantilla de 3 bloques; ~2–4 párrafos por sección + etiquetas de rigor inline; 1 `<dl>` de leyenda; 1 `<figure>` reutilizando un asset existente; 1 sección CSS nueva (sección 13) reutilizable; `research.md` con la tabla afirmación→fuente→etiqueta (verificación de SC-004/SC-005).

## Constitution Check

*GATE: Debe pasar antes de la Fase 0. Se re-evalúa después de la Fase 1 (diseño).*

### Puertas derivadas de los principios

| # | Puerta | Evaluación |
|---|--------|-----------|
| I | Stack vanilla: HTML5 semántico + CSS puro + JS ES6+; sin frameworks/librerías/TypeScript; sin build; única dependencia de red: Google Fonts vía `<link>`. | **COMPLIES**: no se agrega dependencia ni tooling. Sin imágenes nuevas, sin conversión de formato. |
| II | HTML semántico primero: elementos correctos, único `<main>`, encabezados jerárquicos, `alt` (vacío si decorativa), foco visible y tabulación coherente. | **COMPLIES**: FR-011 fija `h1 > h2 > h3`; la leyenda de rigor es un `<dl>` real; las fuentes son un `<ul>` real; la etiqueta de rigor lleva texto real del nivel (no solo color/símbolo). La imagen reutilizada lleva `alt` descriptivo (informativa). |
| III | Construcción en capas: base → atmósfera → minijuegos; prohibido sumar efectos sobre una base sin aprobar. | **COMPLIES**: la base (001) y el patrón de contenido por eje (002/003) están aprobados y fusionados. Esta feature es **contenido sobre la base**: sin animación, sin Canvas (FR-010). |
| IV | Comprensión sobre generación: el agente no improvisa estructura ni convenciones fuera de constitución/spec; ante ambigüedad, pregunta. | **COMPLIES**: las seis clarificaciones de `spec.md` §Clarifications (plantilla, granularidad de etiqueta, fuentes visibles, puerta SC-004, imágenes, ángulo de Relatividad) cerraron toda ambigüedad de alcance. |
| V | TDD en la lógica JS; aceptación en la presentación. | **COMPLIES / no aplica TDD**: esta feature NO cambia lógica JS (`js/layout.js`, `nav-data.js`, `tests/` intactos). Todo el cambio es HTML/CSS presentacional, validado por criterios de aceptación (`quickstart.md`). La suite existente queda en verde. |
| VI | Rigor científico verificado; textos científicos etiquetados (✓ / ~ / ✎); fuente de cada dato citable; presentar licencia narrativa como ciencia real es defecto. | **COMPLIES — es la feature que activa el principio**. `research.md` (Fase 0) contiene la tabla afirmación→fuente→etiqueta para las cuatro secciones, contrastada contra Thorne 2014 y los papers. FR-003 exige etiqueta por afirmación; FR-005/SC-004 prohíben `✎` presentada como `✓`; FR-007 exige el bloque «Fuentes» por sección. La verificación es afirmación-contra-fuente, sin requerir un revisor con formación en física (clarificación 2026-08-29). |

### Restricciones técnicas y puertas de calidad

- **Estructura de carpetas**: HTML en `/`, CSS en `css/` — **COMPLIES** (no se crean carpetas).
- **Nombres**: kebab-case, minúsculas, sin acentos para ids y clases (`#agujeros-de-gusano`, `.rigor-licencia`) — **COMPLIES**.
- **CSS**: `css/global.css` de base + CSS por página pesada solo si hace falta; nada hardcodeado suelto — **COMPLIES**. El patrón de la etiqueta de rigor y del contenido de concepto va como **sección 13** de `global.css` (reutilizable por El Viaje), sin tokens nuevos y sin segundo color saturado (FR-016).
- **JS**: ES Modules, sin variables globales — **COMPLIES** (no se toca JS).
- **Header/footer**: partial único inyectado por `js/layout.js` — **COMPLIES**: `ciencia.html` sigue sin declarar header ni footer propios (FR-009).
- **Assets**: locales, rutas relativas, atribución en `CREDITOS.md` + pie — **COMPLIES**: la única imagen (`ciencia-agujero-negro.jpg`) ya está registrada desde la feature 001; no se agrega ni se modifica nada (SC-010).
- **Rutas internas relativas** (constitución 1.1.0): **COMPLIES** — FR-014; todo `href`/`src` de `ciencia.html` es relativo.
- **Baseline**: evergreen, últimas 2 versiones, sin Safari — **COMPLIES** (SC-008).
- **Submenús de ejes**: anclas dentro de la misma página — **COMPLIES**: las 4 anclas de La Ciencia no cambian (FR-001, FR-015).
- **Commits**: Conventional Commits, sin atribución a IA ni `Co-Authored-By` — **COMPLIES** (este comando no commitea).
- **Criterios de aceptación por página**: responsive, HTML válido y semántico, sin errores de consola, links y assets OK, paleta/tipografía vía variables, **textos de ciencia verificados contra fuente y etiquetados (Principio VI)** — **COMPLIES** (reflejados en `quickstart.md`).

**Resultado**: el plan COMPLIES con todas las puertas. No hay violaciones que justificar.

### Re-evaluación post-Fase 1

Sin cambios: los artefactos de diseño no introducen dependencias, tokens, carpetas ni lógica. La verificación del Principio VI se materializa en `research.md` (tabla afirmación→fuente→etiqueta) y en los escenarios E-Rigor de `quickstart.md`. COMPLIES.

## Project Structure

### Documentation (esta feature)

```text
specs/004-ciencia-content/
├── plan.md              # Este archivo (salida de /speckit-plan)
├── spec.md              # Salida de /speckit-specify + /speckit-clarify
├── research.md          # Salida de Fase 0 — incluye la tabla afirmación→fuente→etiqueta
├── data-model.md        # Salida de Fase 1
├── quickstart.md        # Salida de Fase 1
├── contracts/           # Salida de Fase 1
│   └── ciencia-page.md      # Estructura DOM de ciencia.html + CSS de la etiqueta de rigor
├── checklists/
│   └── requirements.md  # Validación de la spec (ya en verde)
└── tasks.md             # Salida de Fase 2 (/speckit-tasks — NO la crea /speckit-plan)
```

### Source Code (raíz del repositorio)

```text
/
├── ciencia.html               # SE REESCRIBE el <main>: 4 secciones con plantilla de 3 bloques
                               #  («La ciencia» / «En Interstellar» / «Fuentes»),
                               #  <span class="rigor …"> inline por afirmación, <dl> de leyenda,
                               #  <figure> reutilizando ciencia-agujero-negro.jpg en #agujeros-negros
                               #  (FR-001..FR-008, FR-011, FR-014)
/css/
├── global.css                 # SE AGREGA la sección 13 "concepto de ciencia + etiqueta de rigor":
                               #  .concepto h3/ul/li/figure, .rigor + .rigor-real/-plausible/-licencia,
                               #  .rigor-leyenda. Sin tokens nuevos, sin 2.º color saturado (FR-016)
/js/
├── layout.js                  # SIN CAMBIOS (la imagen ya está en ASSET_CREDITS desde la 001)
├── nav-data.js                # SIN CAMBIOS (las 4 anclas ya están definidas)
/tests/
├── layout.test.js             # SIN CAMBIOS (no hay cambio de lógica)
/assets/img/
├── ciencia-agujero-negro.jpg  # SE REUTILIZA tal cual (NASA/JPL-Caltech, ya acreditada)
└── CREDITOS.md                # SIN CAMBIOS
```

**Structure Decision**: Sitio estático en la raíz del repo, sin cambios de arquitectura. La feature es de **contenido** y la más acotada de los ejes: reescribe una página y agrega un bloque CSS reutilizable. No suma assets, no toca lógica, no agrega tests. El diferencial es la **verificación del Principio VI**, que vive en `research.md` (tabla afirmación→fuente→etiqueta) y se comprueba en la revisión de aceptación (SC-004/SC-005), sin depender de un revisor con formación en física.

## Complexity Tracking

> Sin violaciones registradas; no se requiere tabla.
