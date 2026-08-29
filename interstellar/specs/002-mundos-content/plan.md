# Implementation Plan: Contenido del eje Mundos

**Branch**: `feat/002-mundos-content` | **Date**: 2026-08-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-mundos-content/spec.md`

**Note**: Este plan es la salida de `/speckit-plan`; su definición describe el flujo de ejecución del diseño.

## Summary

La feature reemplaza el contenido placeholder de las cinco secciones de `mundos.html` (La Tierra, Gargantúa, Planeta de Miller, Planeta de Mann, El Tesseract) por contenido real, redactado con una plantilla fija de tres bloques por mundo (**Qué es**, **En la historia**, **Rasgos distintivos**), más un backdrop cinematográfico propio por sección con su atribución en el pie común (FR-001..FR-008). No agrega lógica JS de aplicación: el layout compartido, los tokens y las anclas de la feature 001 se reutilizan tal cual.

Técnicamente: se reescribe el `<main>` de `mundos.html` con HTML semántico (un `<h1>`, un `<h2>` por mundo, un `<h3>` por bloque, `<ul>` de rasgos, un `<img alt="">` de backdrop por sección con el mismo patrón que `.hero-backdrop` de la home). El registro de créditos se extiende en dos lugares acoplados: el array `ASSET_CREDITS` de `js/layout.js` y la tabla de `assets/img/CREDITOS.md`. Como `js/layout.js` es módulo de lógica con TDD (Principio V), el cambio del pie se hace test-first sobre `tests/layout.test.js`. Los backdrops son **JPEG** (enmienda aprobada de la feature 001: el catálogo sirve JPG/TIF y no se agrega tooling de conversión, Principio I), ≤250 KB cada uno y ≤1,2 MB en total.

## Technical Context

**Language/Version**: HTML5 semántico, CSS3 (custom properties), JavaScript ES6+ (ES Modules). Sin cambios respecto de la feature 001.

**Primary Dependencies**: Ninguna en runtime. Google Fonts vía `<link>` (ya presente en `mundos.html`). Sin build.

**Storage**: N/A. Contenido estático y fijo.

**Testing**: `node --test` para la lógica JS afectada (`js/layout.js` → `tests/layout.test.js`), TDD Red-Green-Refactor (Principio V). El contenido HTML/CSS se valida contra los criterios de aceptación de la spec y los escenarios de `quickstart.md` (Principio V: aceptación en la presentación).

**Target Platform**: Navegadores evergreen, últimas 2 versiones de Chrome, Edge y Firefox; sin polyfills. Safari fuera del alcance de verificación (enmienda 2026-08-28 de la feature 001, heredada por SC-005).

**Project Type**: Sitio web estático multi-página, sin paso de build. Esta feature toca una página (`mundos.html`), un módulo compartido (`js/layout.js`), su test, un registro (`assets/img/CREDITOS.md`), assets de imagen y, si hace falta, `css/global.css`.

**Performance Goals**: Sin errores de consola en el recorrido de `mundos.html` (FR-013, SC-005). Presupuesto de imágenes: ≤250 KB por backdrop, ≤1,2 MB sumando los cinco (FR-007, SC-009). Layout fluido al hacer scroll y abrir anclas.

**Constraints**: Sin frameworks/librerías/TypeScript y sin build (Principio I). Backdrops JPEG locales con ruta relativa y atribución obligatoria (FR-006, FR-007, SC-008). Oscurecimiento con `--backdrop-oscurecer` (FR-005). Responsive desde 320 px sin desplazamiento horizontal involuntario y sin desbordar imágenes (FR-012, SC-003). Anclas `#tierra #gargantua #miller #mann #tesseract` sin cambios (FR-001, FR-015). Sin contenido científico etiquetado (FR-009) ni animaciones (FR-010).

**Scale/Scope**: 1 página HTML reescrita en su `<main>`; 5 secciones de mundo con plantilla de 3 bloques; hasta 4 backdrops nuevos (La Tierra puede reutilizar `assets/img/mundos-tierra.jpg`); 4 entradas nuevas en `ASSET_CREDITS` y en `CREDITOS.md`; 1 actualización de `tests/layout.test.js`; CSS reutilizable para "sección de eje con backdrop".

## Constitution Check

*GATE: Debe pasar antes de la Fase 0. Se re-evalúa después de la Fase 1 (diseño).*

### Puertas derivadas de los principios

| # | Puerta | Evaluación |
|---|--------|-----------|
| I | Stack vanilla: HTML5 semántico + CSS puro + JS ES6+; sin frameworks/librerías/TypeScript; sin build; única dependencia de red: Google Fonts vía `<link>`. | **COMPLIES**: no se agrega ninguna dependencia ni tooling. El conflicto WebP↔JPEG se resolvió a favor de JPEG justamente para no violar este principio (ver `research.md` D1). |
| II | HTML semántico primero: elementos correctos, único `<main>`, encabezados jerárquicos, `alt` (vacío si decorativa), foco visible y tabulación coherente. | **COMPLIES**: FR-011 fija la jerarquía `h1 > h2 > h3`; los backdrops son decorativos (`alt=""`); `<ul>` real para los rasgos; no se agregan controles nuevos que alteren el orden de tabulación. |
| III | Construcción en capas: base → atmósfera → minijuegos; prohibido sumar efectos sobre una base sin aprobar. | **COMPLIES**: la base (feature 001) está aprobada y fusionada. Esta feature es **contenido sobre la base**, no un efecto ambiental: sin animación, sin Canvas, sin partículas (FR-010). |
| IV | Comprensión sobre generación: el agente no improvisa estructura ni convenciones fuera de constitución/spec; ante ambigüedad, pregunta. | **COMPLIES**: las 5 clarificaciones (galería, plantilla, peso, SC-006, formato) resolvieron toda ambigüedad de alcance antes de este plan. |
| V | TDD en la lógica JS; aceptación en la presentación. | **COMPLIES**: el único cambio de lógica es extender `ASSET_CREDITS` en `js/layout.js`; se hace test-first sobre `tests/layout.test.js` (Red→Green). El HTML/CSS de `mundos.html` se valida por criterios de aceptación (`quickstart.md`). |
| VI | Rigor científico verificado; textos científicos etiquetados (✓ / ~ / ✎). | **COMPLIES / no aplica**: FR-009 excluye explícitamente los textos científicos etiquetados; el contenido de Mundos es narrativo/descriptivo de la película. El rigor científico es responsabilidad del eje La Ciencia. |

### Restricciones técnicas y puertas de calidad

- **Estructura de carpetas**: HTML en `/`, CSS en `css/`, JS en `js/`, imágenes en `assets/img/` — **COMPLIES** (no se crean carpetas nuevas).
- **Nombres**: kebab-case, minúsculas, sin acentos para archivos e ids (`mundos-gargantua.jpg`, no `Gargantúa.jpg`) — **COMPLIES**.
- **CSS**: `css/global.css` de base + CSS por página pesada solo cuando haga falta; nada hardcodeado suelto — **COMPLIES**. Decisión en `research.md` D4: el patrón "sección con backdrop" va como bloque reutilizable en `global.css` (lo van a compartir los otros ejes), sin tokens nuevos.
- **JS**: ES Modules, sin variables globales, un módulo por responsabilidad — **COMPLIES** (solo se edita un array de datos en `layout.js`).
- **Header/footer**: partial único inyectado por `js/layout.js` — **COMPLIES**: `mundos.html` sigue sin declarar header ni footer propios (FR-008); solo se extiende la lista de créditos que ese módulo ya construye.
- **Assets**: locales, rutas relativas, atribución obligatoria en `CREDITOS.md` + pie — **COMPLIES** (FR-006, FR-007, SC-008). Formato JPEG conforme a la enmienda de la 001.
- **Baseline**: evergreen, últimas 2 versiones, sin Safari — **COMPLIES** (SC-005).
- **Submenús de ejes**: anclas dentro de la misma página — **COMPLIES**: las 5 anclas de Mundos no cambian (FR-001, FR-015).
- **Commits**: Conventional Commits, sin atribución a IA ni `Co-Authored-By` — **COMPLIES** (este comando no commitea).
- **Criterios de aceptación por página**: responsive, HTML válido y semántico, sin errores de consola, links y assets OK, paleta/tipografía vía variables, tests de lógica en verde — **COMPLIES** (reflejados en `quickstart.md`).

**Resultado**: el plan COMPLIES con todas las puertas. No hay violaciones que justificar.

## Project Structure

### Documentation (esta feature)

```text
specs/002-mundos-content/
├── plan.md              # Este archivo (salida de /speckit-plan)
├── spec.md              # Salida de /speckit-specify + /speckit-clarify
├── research.md          # Salida de Fase 0 (/speckit-plan)
├── data-model.md        # Salida de Fase 1 (/speckit-plan)
├── quickstart.md        # Salida de Fase 1 (/speckit-plan)
├── contracts/           # Salida de Fase 1 (/speckit-plan)
│   ├── mundos-page.md       # Estructura DOM de mundos.html (plantilla de mundo + backdrop)
│   └── footer-credits.md    # Extensión del registro de créditos (ASSET_CREDITS + CREDITOS.md)
├── checklists/
│   └── requirements.md  # Validación de la spec (ya en verde)
└── tasks.md             # Salida de Fase 2 (/speckit-tasks — NO la crea /speckit-plan)
```

### Source Code (raíz del repositorio)

```text
/
├── mundos.html                 # SE REESCRIBE el <main>: 5 secciones con plantilla de 3 bloques
                                 # + <img alt=""> de backdrop por sección (FR-001..FR-005, FR-011)
/css/
├── global.css                  # SE AGREGA un bloque reutilizable "sección de eje con backdrop"
                                 # (oscurecimiento con --backdrop-oscurecer, fallback a --color-fondo,
                                 #  sin tokens nuevos) — FR-005, FR-012, casos límite
/js/
├── layout.js                   # SE EDITA el array ASSET_CREDITS: +4 entradas (gargantua, miller,
                                 #  mann, tesseract; tierra ya existe) — FR-006
├── nav-data.js                 # SIN CAMBIOS (las 5 anclas ya están definidas)
/tests/
├── layout.test.js              # SE ACTUALIZA test-first: el pie ahora lista los créditos de Mundos
                                 #  (Red→Green, Principio V)
/assets/img/
├── mundos-tierra.jpg           # YA EXISTE (NASA Blue Marble) — se reutiliza para #tierra
├── mundos-gargantua.jpg        # NUEVO — backdrop de Gargantúa (fuente resuelta en research.md D2)
├── mundos-miller.jpg           # NUEVO — backdrop del planeta oceánico
├── mundos-mann.jpg             # NUEVO — backdrop del planeta helado
├── mundos-tesseract.jpg        # NUEVO — backdrop del Tesseract
└── CREDITOS.md                 # SE AGREGAN 4 filas a la tabla de assets (estado + atribución)
```

**Structure Decision**: Sitio estático en la raíz del repo, sin cambios de arquitectura. La feature es de **contenido**: reescribe una página, extiende un registro de créditos y su test, y suma assets. El CSS del backdrop por sección se agrega a `css/global.css` como patrón reutilizable (los ejes Personajes, La Ciencia y El Viaje lo van a compartir), sin introducir un `css/mundos.css` ni tokens nuevos.

## Complexity Tracking

> Sin violaciones registradas; no se requiere tabla.
