# Implementation Plan: Layout compartido y Hero de inicio

**Branch**: `001-shared-layout-hero` | **Date**: 2026-08-28 | **Spec**: [spec.md](./spec.md)

**Input**: Especificación de la feature en `/specs/001-shared-layout-hero/spec.md`

**Note**: Este plan es el resultado de `/speckit-plan`; su definición describe el flujo de ejecución del diseño.

## Summary

La feature construye la capa fundacional del sitio: un layout compartido que garantiza encabezado, navegación principal y pie comunes en las ocho páginas superiores desde una única fuente (FR-001), los ocho destinos top-level y los destinos anidados de los cuatro ejes resueltos como anclas dentro de su página superior (FR-002..FR-011), y una página de inicio con Hero cinematográfico de pantalla completa con encabezado superpuesto e introducción breve (FR-014..FR-016). La identidad visual completa —paleta, tipografía, jerarquías, oscurecimiento de backdrops y foco— se centraliza como base visual común (FR-017..FR-022).

Técnicamente el enfoque es vanilla: HTML5 semántico y CSS3 con variables CSS en `:root`, más un módulo ES compartido (`layout.js`) que inyecta el header/nav/footer en cada página a partir de un árbol de navegación configurable (`nav-data.js`), con los destinos anidados resueltos como anclas dentro de la página superior. Sin frameworks, sin build: los archivos se sirven tal cual se escriben.

## Technical Context

**Language/Version**: HTML5, CSS3 (custom properties), JavaScript ES6+ (ES Modules).

**Primary Dependencies**: Ninguna en runtime. Únicas dependencias externas por red permitidas: Google Fonts vía `<link>` y embeds de YouTube vía `<iframe>` (constitución, Principio I).

**Storage**: N/A. Sitio estático y fijo; `localStorage` queda fuera de esta feature (los minijuegos y su persistencia llegan en features posteriores).

**Testing**: TDD estricto (Red-Green-Refactor) para el módulo JS de inyección compartido `layout.js` (constitución, Principio V). La capa presentacional (HTML/CSS) se valida contra los criterios de aceptación de la spec y las puertas de calidad de la constitución ("Flujo de Trabajo y Puertas de Calidad").

**Target Platform**: Navegadores evergreen, últimas 2 versiones de Chrome, Edge y Firefox; sin polyfills (constitución + clarificación Q3, enmendada 2026-08-28: Safari fuera del alcance de verificación).

**Project Type**: Sitio web estático multi-página, sin paso de build; los archivos se sirven tal cual se escriben.

**Performance Goals**: Sin errores de consola en los recorridos (FR-021, SC-009); layout fluido al navegar y al abrir/cerrar submenús; efectos visuales sutiles y solo presentacionales — los efectos ambientales están explícitamente fuera de alcance en esta feature.

**Constraints**: Sin frameworks/librerías/TypeScript y sin build (Principio I); imágenes locales WebP con rutas relativas y atribución obligatoria (FR-013, SC-008); oscurecimiento de backdrops para legibilidad (FR-019); responsive desde 320 px sin desplazamiento horizontal involuntario (FR-022, SC-003); destinos anidados como anclas dentro de la misma página (FR-004).

**Scale/Scope**: 8 páginas top-level (Inicio, Mundos, Personajes, La Ciencia, El Viaje, Galería, Minijuegos, Trailer); 4 ejes con anclas anidadas (21 destinos anidados: 5 + 6 + 4 + 6); layout compartido + página de inicio con Hero fullscreen + placeholders navegables.

## Constitution Check

*GATE: Debe pasar antes de la Fase 0. Se re-evalúa después de la Fase 1 (diseño).*

### Puertas derivadas de los principios

| # | Puerta | Evaluación |
|---|--------|-----------|
| I | Stack vanilla: HTML5 semántico + CSS puro + JS ES6+; sin frameworks/librerías/TypeScript; sin build; única dependencia de red: Google Fonts vía `<link>` y YouTube vía `<iframe>`. | **COMPLIES**: sin dependencias de runtime; ES Modules nativos; archivos servidos tal cual. |
| II | HTML semántico primero: elementos correctos, único `<main>`, encabezados jerárquicos, `alt` (vacío si decorativa), foco visible y tabulación coherente (FR-020, SC-007). | **COMPLIES**: FR-020 y SC-007 figuran como criterios de aceptación y se reflejan en el contrato de layout y en el quickstart. |
| III | Construcción en capas: base → atmósfera → minijuegos; prohibido sumar efectos sobre una base sin aprobar. | **COMPLIES**: esta feature entrega únicamente la capa base; los efectos ambientales y minijuegos están "Fuera de alcance" en la spec. |
| IV | Comprensión sobre generación: el agente no improvisa estructura ni convenciones fuera de constitución/spec; ante ambigüedad, pregunta. | **COMPLIES**: no se inventó nada; la constitución y Q1–Q5 resuelven todo (no quedan NEEDS CLARIFICATION). |
| V | TDD en la lógica JS; aceptación en la presentación. | **COMPLIES**: `layout.js` se desarrolla con TDD Red-Green-Refactor; HTML/CSS se valida contra los criterios de aceptación. |
| VI | Rigor científico verificado; textos científicos etiquetados (✓ / ~ / ✎). | **COMPLIES / no aplica**: esta feature no redacta contenido científico (solo placeholders); no introduce afirmaciones sin verificar. |

### Restricciones técnicas y puertas de calidad

- **Estructura de carpetas** en la raíz del repo (HTML en `/`, `css/`, `js/`, `assets/img`, `assets/fonts`) — **COMPLIES** (ver Project Structure).
- **Nombres** kebab-case, minúsculas, sin acentos (`gargantua`, no `Gargantúa`) — **COMPLIES** en todos los archivos previstos.
- **CSS**: `css/global.css` de base con variables en `:root` + CSS específico por página pesada solo cuando haga falta; nada hardcodeado suelto — **COMPLIES** (FR-017..FR-019).
- **JS**: ES Modules, un módulo por responsabilidad, cargado solo donde se usa; sin variables globales — **COMPLIES** (`layout.js`, `nav-data.js`).
- **Header/footer**: partial único inyectado por un módulo JS compartido — **COMPLIES** (FR-001, contrato layout-injection).
- **Assets**: locales, rutas relativas, WebP, atribución obligatoria — **COMPLIES** (FR-012/FR-013, SC-008, contrato assets).
- **Baseline**: evergreen, últimas 2 versiones, sin polyfills — **COMPLIES** (Q3, SC-009).
- **Submenús de ejes**: anclas dentro de la misma página hasta que una spec del eje justifique archivo separado — **COMPLIES** (FR-004).
- **Commits**: Conventional Commits, sin atribución a IA ni Co-Authored-By — **COMPLIES** (este comando no commitea; el plan no lo viola).
- **Criterios de aceptación por página**: responsive, HTML válido y semántico, sin errores de consola, links y assets OK, paleta/tipografía vía variables, tests de lógica en verde — **COMPLIES** (escenarios reflejados en quickstart.md).

**Resultado**: el plan COMPLIES con todas las puertas. No hay violaciones que justificar.

## Project Structure

### Documentation (esta feature)

```text
specs/001-shared-layout-hero/
├── plan.md              # Este archivo (salida de /speckit-plan)
├── research.md          # Salida de Fase 0 (/speckit-plan)
├── data-model.md        # Salida de Fase 1 (/speckit-plan)
├── quickstart.md        # Salida de Fase 1 (/speckit-plan)
├── contracts/           # Salida de Fase 1 (/speckit-plan)
│   ├── README.md
│   ├── layout-injection.md
│   ├── navigation.md
│   ├── design-tokens.md
│   └── assets.md
├── checklists/          # Validación de la spec (comando de calidad)
│   └── requirements.md
└── tasks.md             # Salida de Fase 2 (/speckit-tasks — NO la crea /speckit-plan)
```

### Source Code (raíz del repositorio)

```text
/
├── index.html              # Inicio: Hero fullscreen + introducción (FR-014..FR-016)
├── mundos.html             # Eje Mundos, anclas: #tierra #gargantua #miller #mann #tesseract (FR-005)
├── personajes.html         # Eje Personajes, anclas: #cooper #murph #brand #profesor-brand #mann #tars-case (FR-006)
├── ciencia.html            # Eje Ciencia, anclas: #agujeros-negros #dilatacion-temporal #agujeros-de-gusano #relatividad (FR-007)
├── viaje.html              # Eje Viaje, anclas: #tierra #agujero-de-gusano #miller #mann #gargantua #tesseract (FR-008)
├── galeria.html            # Placeholder (FR-011)
├── minijuegos.html         # Placeholder (FR-011)
├── trailer.html            # Placeholder (FR-011)
/css/
├── global.css              # Variables CSS, reset, header/nav/footer, utilidades (FR-017..FR-019)
/js/
├── layout.js               # Módulo ES compartido que inyecta header/nav/footer en cada página (FR-001) — TDD (Principio V)
├── nav-data.js             # Config del árbol de navegación (destinos superiores + anidados) (FR-002..FR-008)
/assets/img/                # Imágenes locales, WebP, rutas relativas, atribución obligatoria (FR-013, SC-008)
/assets/fonts/              # Solo si no alcanza con Google Fonts (constitución)
```

**Structure Decision**: Sitio estático único en la raíz del repo conforme a la constitución (HTML en `/`, `css/`, `js/`, `assets/`); el árbol de navegación vive como datos consumidos por `layout.js`, garantizando una única fuente de verdad (FR-001); el CSS pesado por página se agrega recién cuando una página lo justifique, manteniendo `global.css` como base única.

## Complexity Tracking

> Sin violaciones registradas; no se requiere tabla.