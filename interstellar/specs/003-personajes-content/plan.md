# Implementation Plan: Contenido del eje Personajes

**Branch**: `feat/003-personajes-content` | **Date**: 2026-08-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-personajes-content/spec.md`

**Note**: Este plan es la salida de `/speckit-plan`; su definición describe el flujo de ejecución del diseño.

## Summary

La feature reemplaza el contenido placeholder de las seis secciones de `personajes.html` (Cooper, Murph, Dr. Brand, Profesor Brand, Mann, TARS & CASE) por fichas reales, redactadas con una plantilla fija de tres bloques (**Quién es**, **Su papel en la historia**, **Rasgos distintivos**), más una línea de crédito de reparto y un **retrato en línea** por ficha (`<figure>` con `<img>` y `<figcaption>`) con su atribución en el pie común (FR-001..FR-007, FR-011). No agrega lógica JS de aplicación: el layout compartido, los tokens y las anclas de la feature 001 se reutilizan tal cual.

Técnicamente: se reescribe el `<main>` de `personajes.html` con HTML semántico (un `<h1>`, un `<h2>` por personaje, un `<h3>` por bloque, `<ul>` de rasgos, un `<p>` de reparto, un `<figure>` de retrato con `<img>` **informativo** —`alt` descriptivo— y `<figcaption>`). A diferencia de la feature 002 (Mundos), la imagen **no** es un backdrop a sección completa ni lleva `--backdrop-oscurecer`: es un retrato enmarcado maquetado junto al texto. El registro de créditos se extiende en dos lugares acoplados: el array `ASSET_CREDITS` de `js/layout.js` y la tabla de `assets/img/CREDITOS.md`. Como `js/layout.js` es módulo de lógica con TDD (Principio V), el cambio del pie se hace test-first sobre `tests/layout.test.js`. Los retratos son **JPEG** locales (enmienda aprobada de la feature 001: el catálogo sirve JPG/TIF y no se agrega tooling de conversión, Principio I), stills de la película bajo uso académico con atribución `© Warner Bros. Pictures` (misma política que los backdrops de Mundos), ≤250 KB cada uno y ≤1,5 MB los seis juntos.

## Technical Context

**Language/Version**: HTML5 semántico, CSS3 (custom properties), JavaScript ES6+ (ES Modules). Sin cambios respecto de las features 001 y 002.

**Primary Dependencies**: Ninguna en runtime. Google Fonts vía `<link>` (ya presente en `personajes.html`). Sin build.

**Storage**: N/A. Contenido estático y fijo.

**Testing**: `node --test tests/*.test.js` para la lógica JS afectada (`js/layout.js` → `tests/layout.test.js`), TDD Red-Green-Refactor (Principio V). El contenido HTML/CSS se valida contra los criterios de aceptación de la spec y los escenarios de `quickstart.md` (Principio V: aceptación en la presentación).

**Target Platform**: Navegadores evergreen, últimas 2 versiones de Chrome, Edge y Firefox; sin polyfills. Safari fuera del alcance de verificación (enmienda 2026-08-28 de la feature 001, heredada por SC-005).

**Project Type**: Sitio web estático multi-página, sin paso de build. Esta feature toca una página (`personajes.html`), un módulo compartido (`js/layout.js`), su test, un registro (`assets/img/CREDITOS.md`), assets de imagen y `css/global.css`.

**Performance Goals**: Sin errores de consola en el recorrido de `personajes.html` (FR-013, SC-005). Presupuesto de imágenes: ≤250 KB por retrato, ≤1,5 MB sumando los seis (FR-007, SC-008). Layout fluido al hacer scroll y abrir anclas.

**Constraints**: Sin frameworks/librerías/TypeScript y sin build (Principio I). Retratos JPEG locales con ruta relativa y atribución obligatoria (FR-006, FR-007, SC-008). **Sin** tratamiento de oscurecimiento ni patrón `eje-con-backdrop` (aclaración 2026-08-29). Responsive desde 320 px sin desplazamiento horizontal involuntario y sin desbordar imágenes (FR-012, SC-003). Anclas `#cooper #murph #brand #profesor-brand #mann #tars-case` sin cambios (FR-001, FR-015). Sin contenido científico etiquetado (FR-009) ni animaciones (FR-010). Spoilers al mínimo, en particular en Mann y Profesor Brand (FR-016).

**Scale/Scope**: 1 página HTML reescrita en su `<main>`; 6 fichas de personaje con plantilla de 3 bloques + línea de reparto + retrato; 6 retratos JPEG nuevos; 6 entradas nuevas en `ASSET_CREDITS` y en `CREDITOS.md`; 1 test nuevo en `tests/layout.test.js`; 1 bloque CSS nuevo reutilizable ("ficha de personaje con retrato") en `css/global.css`.

## Constitution Check

*GATE: Debe pasar antes de la Fase 0. Se re-evalúa después de la Fase 1 (diseño).*

### Puertas derivadas de los principios

| # | Puerta | Evaluación |
|---|--------|-----------|
| I | Stack vanilla: HTML5 semántico + CSS puro + JS ES6+; sin frameworks/librerías/TypeScript; sin build; única dependencia de red: Google Fonts vía `<link>`. | **COMPLIES**: no se agrega ninguna dependencia ni tooling. Retratos en JPEG por la misma razón que la feature 002 (el catálogo sirve JPG/TIF; convertir exigiría build — `research.md` D1). |
| II | HTML semántico primero: elementos correctos, único `<main>`, encabezados jerárquicos, `alt` (vacío si decorativa, descriptivo si informativa), foco visible y tabulación coherente. | **COMPLIES**: FR-011 fija la jerarquía `h1 > h2 > h3`; los retratos son **informativos** → `alt` descriptivo del personaje (a diferencia de los backdrops decorativos de Mundos); `<figure>`/`<figcaption>` reales; `<ul>` real para los rasgos; no se agregan controles nuevos que alteren el orden de tabulación. |
| III | Construcción en capas: base → atmósfera → minijuegos; prohibido sumar efectos sobre una base sin aprobar. | **COMPLIES**: la base (feature 001) está aprobada y fusionada; el patrón de contenido por eje (feature 002) también. Esta feature es **contenido sobre la base**, no un efecto ambiental: sin animación, sin Canvas, sin partículas (FR-010). |
| IV | Comprensión sobre generación: el agente no improvisa estructura ni convenciones fuera de constitución/spec; ante ambigüedad, pregunta. | **COMPLIES**: las cinco clarificaciones de `spec.md` §Clarifications (identidad visual, sub-estructura, backdrop vs retrato, alcance del reparto, ubicación del crédito) resolvieron toda ambigüedad de alcance antes de este plan. |
| V | TDD en la lógica JS; aceptación en la presentación. | **COMPLIES**: el único cambio de lógica es extender `ASSET_CREDITS` en `js/layout.js`; se hace test-first sobre `tests/layout.test.js` (Red→Green). El HTML/CSS de `personajes.html` se valida por criterios de aceptación (`quickstart.md`). |
| VI | Rigor científico verificado; textos científicos etiquetados (✓ / ~ / ✎). | **COMPLIES / no aplica**: FR-009 excluye explícitamente los textos científicos etiquetados; el contenido de Personajes es narrativo/descriptivo de la película. El rigor científico es responsabilidad del eje La Ciencia. |

### Restricciones técnicas y puertas de calidad

- **Estructura de carpetas**: HTML en `/`, CSS en `css/`, JS en `js/`, imágenes en `assets/img/` — **COMPLIES** (no se crean carpetas nuevas).
- **Nombres**: kebab-case, minúsculas, sin acentos para archivos e ids (`personajes-profesor-brand.jpg`, no `Profesor Brand.jpg`) — **COMPLIES**.
- **CSS**: `css/global.css` de base + CSS por página pesada solo cuando haga falta; nada hardcodeado suelto — **COMPLIES**. Decisión en `research.md` D4: el patrón "ficha de personaje con retrato" va como bloque reutilizable en `global.css`, sin tokens nuevos. Personajes NO usa el patrón `.eje-con-backdrop` de la feature 002.
- **JS**: ES Modules, sin variables globales, un módulo por responsabilidad — **COMPLIES** (solo se edita un array de datos en `layout.js`).
- **Header/footer**: partial único inyectado por `js/layout.js` — **COMPLIES**: `personajes.html` sigue sin declarar header ni footer propios (FR-008); solo se extiende la lista de créditos que ese módulo ya construye.
- **Assets**: locales, rutas relativas, atribución obligatoria en `CREDITOS.md` + pie — **COMPLIES** (FR-006, FR-007, SC-008). Formato JPEG conforme a la enmienda de la 001; stills de la película con atribución `© Warner Bros. Pictures`, misma política que la feature 002 (`research.md` D2).
- **Baseline**: evergreen, últimas 2 versiones, sin Safari — **COMPLIES** (SC-005).
- **Submenús de ejes**: anclas dentro de la misma página — **COMPLIES**: las 6 anclas de Personajes no cambian (FR-001, FR-015).
- **Commits**: Conventional Commits, sin atribución a IA ni `Co-Authored-By` — **COMPLIES** (este comando no commitea).
- **Criterios de aceptación por página**: responsive, HTML válido y semántico, sin errores de consola, links y assets OK, paleta/tipografía vía variables, tests de lógica en verde — **COMPLIES** (reflejados en `quickstart.md`).

**Resultado**: el plan COMPLIES con todas las puertas. No hay violaciones que justificar.

### Re-evaluación post-Fase 1

Sin cambios: los artefactos de diseño (data-model, contracts, quickstart) no introducen dependencias, tokens, carpetas ni lógica nueva. El único cambio de lógica sigue siendo `ASSET_CREDITS` (test-first). COMPLIES.

## Project Structure

### Documentation (esta feature)

```text
specs/003-personajes-content/
├── plan.md              # Este archivo (salida de /speckit-plan)
├── spec.md              # Salida de /speckit-specify + /speckit-clarify
├── research.md          # Salida de Fase 0 (/speckit-plan)
├── data-model.md        # Salida de Fase 1 (/speckit-plan)
├── quickstart.md        # Salida de Fase 1 (/speckit-plan)
├── contracts/           # Salida de Fase 1 (/speckit-plan)
│   ├── personajes-page.md   # Estructura DOM de personajes.html (plantilla de ficha + retrato)
│   └── footer-credits.md    # Extensión del registro de créditos (ASSET_CREDITS + CREDITOS.md)
├── checklists/
│   └── requirements.md  # Validación de la spec (ya en verde)
└── tasks.md             # Salida de Fase 2 (/speckit-tasks — NO la crea /speckit-plan)
```

### Source Code (raíz del repositorio)

```text
/
├── personajes.html            # SE REESCRIBE el <main>: 6 fichas con plantilla de 3 bloques
                               # + <p> de reparto + <figure> de retrato (FR-001..FR-007, FR-011)
/css/
├── global.css                 # SE AGREGA un bloque reutilizable "ficha de personaje con retrato"
                               # (grid retrato+texto en desktop, apilado en mobile; sin tokens
                               #  nuevos; NO usa .eje-con-backdrop) — FR-011, FR-012
/js/
├── layout.js                  # SE EDITA el array ASSET_CREDITS: +6 entradas (cooper, murph,
                               #  brand, profesor-brand, mann, tars-case) — FR-006, FR-007
├── nav-data.js                # SIN CAMBIOS (las 6 anclas ya están definidas en la feature 001)
/tests/
├── layout.test.js             # SE AGREGA un test test-first: el pie lista los créditos de los
                               #  retratos de Personajes (Red→Green, Principio V)
/assets/img/
├── personajes-cooper.jpg          # NUEVO — retrato de Cooper (still, © Warner Bros.)
├── personajes-murph.jpg           # NUEVO — retrato de Murph
├── personajes-brand.jpg           # NUEVO — retrato de Amelia Brand
├── personajes-profesor-brand.jpg  # NUEVO — retrato del Profesor John Brand
├── personajes-mann.jpg            # NUEVO — retrato del Dr. Mann
├── personajes-tars-case.jpg       # NUEVO — retrato de TARS y CASE
└── CREDITOS.md                    # SE AGREGAN 6 filas a la tabla de assets (estado + atribución)
```

**Structure Decision**: Sitio estático en la raíz del repo, sin cambios de arquitectura. La feature es de **contenido**: reescribe una página, extiende un registro de créditos y su test, y suma assets. El CSS de la ficha con retrato se agrega a `css/global.css` como patrón reutilizable (los ejes La Ciencia y El Viaje podrían compartirlo para fichas con imagen en línea), sin introducir un `css/personajes.css` ni tokens nuevos. El asset genérico `personajes-astronauta.jpg` de la feature 001 queda **fuera de alcance** (no se referencia desde el contenido nuevo; su eventual retiro es una limpieza posterior, no de esta feature).

## Complexity Tracking

> Sin violaciones registradas; no se requiere tabla.
