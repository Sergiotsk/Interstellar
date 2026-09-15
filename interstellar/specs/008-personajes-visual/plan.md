# Implementation Plan: Rediseño visual de Personajes — hero cinematográfico, galería de escenas y visor Nav-Ranger

**Branch**: `sec/personajes` | **Date**: 2026-09-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/008-personajes-visual/spec.md`

## Summary

Reemplazar la intro de texto plano y la ficha estática de `personajes.html` (contrato 003) por
una portada en mosaico (los 6 personajes como retratos clickeables, aloja el único `<h1>` de la
página) y tres piezas nuevas por personaje: 1) hero full-bleed (imagen + scrim + ficha, mismo mecanismo
que `.mundo-portada-escena`), 2) galería de escenas con riel+sticky+scrub GSAP ya validado en
spike (texto 30% arriba / tira de fotogramas 70% abajo, corte duro sincronizado), 3) visor
"Nav-Ranger" nuevo — panel con piel de instrumentos de cockpit que cicla en loop 2-3 tramos
cortos de fotogramas reales curados desde el volcado local `assets/cap-that.com_interstellar(2014)/`.
Alcance mínimo: Cooper y Murph (único material suficiente hoy); los otros 4 personajes
degradan al patrón vigente del contrato 003 hasta curar más material.

## Technical Context

**Language/Version**: HTML5 semántico + CSS puro + JavaScript ES6+ (ES Modules), sin build —
Principio I de la constitución.

**Primary Dependencies**: GSAP 3.13 + `ScrollTrigger`, ya vendorizado en
`js/vendor/gsap@3.13.0/` y reutilizado sin cambios de versión (mismo patrón que
`js/mundo-portada.js` y `js/filmstrip.js`). Sin dependencias nuevas.

**Storage**: N/A — sitio estático sin backend. El "contenido" es archivos de imagen en
`assets/img/` + HTML/CSS.

**Testing**: Ninguno de tipo unitario para esta feature — es capa presentacional pura (HTML +
CSS + animación de scroll/ciclado), validada contra criterios de aceptación (Principio V:
TDD estricto aplica solo a lógica con ramas de decisión reales — ni `js/filmstrip.js` ni
`js/mundo-portada.js`, que resuelven el mismo tipo de problema, tienen tests unitarios hoy;
`tests/*.test.js` cubre `layout.js`, `creditos.js` y el estado del submenú, módulos de estado
real, no scroll-scrub).

**Target Platform**: Navegadores evergreen, últimas 2 versiones (baseline del sitio). Sin
polyfills.

**Project Type**: Sitio web estático multi-página (single project, sin frontend/backend
separados).

**Performance Goals**: Sin objetivo numérico propio de esta feature; hereda el criterio del
sitio (imágenes optimizadas, sin bloquear el hilo principal con el ciclador del visor —
`setInterval` liviano + `IntersectionObserver` para pausar fuera de vista, ver FR-004).

**Constraints**: El volcado de 11.713 fotogramas (`assets/cap-that.com_interstellar(2014)/`)
NUNCA se versiona (FR-010) — es material de curación local, no un asset del sitio.

**Scale/Scope**: 6 secciones de una única página (`personajes.html`). Alcance mínimo
garantizado: 2 de 6 (Cooper, Murph). Los otros 4 quedan en su patrón actual hasta curar
material (US5, fuera del cierre de esta feature).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación |
|---|---|
| I. Stack vanilla, sin frameworks | ✅ Cumple — no se agrega ninguna dependencia nueva. GSAP ya está en uso sitewide (Mundos) y vendorizado sin CDN; **nota de gobernanza**: la constitución (v1.1.0) no menciona GSAP explícitamente entre las excepciones permitidas del Principio I, aunque el sitio ya lo usa en producción (Mundos, feature 007). Esto es deuda documental preexistente, no introducida por esta feature — se señala pero no bloquea (ver Complexity Tracking). |
| I. (sin-JS no es objetivo) | ⚠️ A tener presente: la constitución aclara que la degradación sin-JS NO es un objetivo del proyecto. Los degradados de esta spec (FR-006) son por **`prefers-reduced-motion`** y por **fallo de carga de GSAP** (resiliencia de red/librería) — no por "visitante con JS deshabilitado a propósito". Mismo alcance que ya validan `js/mundo-portada.js` y `js/filmstrip.js`; no se amplía el compromiso de la constitución. |
| II. HTML semántico primero | ✅ Hero, galería y visor se construyen con `<section>`/`<article>`/`<figure>` según corresponda; `<div>` solo para agrupamiento de layout puro (riel, pista, visor). Todo `<img>` lleva `alt` (vacío donde es decorativo — visor y tira de fotogramas refuerzan texto ya presente, no lo reemplazan). |
| III. Construcción en capas | ✅ Esta feature es "atmósfera" sobre una página cuya base (contrato 003) ya cumple; no se suma un minijuego. |
| IV. Comprensión sobre generación | ✅ El mecanismo se explica en el spec y se reutiliza texto a texto del patrón ya en producción (`.mundo-portada-escena`, riel+sticky+scrub, `IntersectionObserver`) — nada nuevo que no pueda explicarse. |
| V. TDD en lógica / aceptación en presentación | ✅ Ver Testing arriba — capa 100% presentacional, sin lógica de estado real (el ciclador del visor es un `setInterval` + un booleano de pausa, mismo nivel de complejidad que el resto de la capa de animación del sitio, ya sin tests). |
| VI. Rigor científico verificado | N/A — esta feature no agrega texto de la capa educativa de ciencia; los "datos curiosos" de la galería son de producción/guion, no afirmaciones científicas. |

**Gate**: PASA. Única nota (no bloqueante): la ausencia de GSAP en la lista de excepciones del
Principio I es una inconsistencia documental preexistente del proyecto — se recomienda una
enmienda de constitución aparte (fuera del alcance de esta feature) que documente la excepción
ya vigente en la práctica.

## Project Structure

### Documentation (this feature)

```text
specs/008-personajes-visual/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/
│   └── personajes-page.md   # Phase 1 output — reemplaza al contrato 003 para esta página
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

Sitio estático de una sola pieza (Opción "Single project" — no aplica frontend/backend
separados). Estructura real ya vigente en el repo, extendida por esta feature:

```text
personajes.html                          # única página tocada (estructura interna)

css/
├── personajes.css                       # hoja específica de la página (existente) — se
│                                         #   reescribe: portada, hero full-bleed, riel-tira,
│                                         #   nav-visor (SOLO el estilo puntual de la portada:
│                                         #   la grilla en sí reusa `.galeria-grid` sin tocarla)
├── global.css                           # SOLO LECTURA — `.galeria-grid` (línea ~1031), se
│                                         #   reutiliza tal cual para la portada, no se modifica
└── mundos.css                           # SOLO LECTURA — referencia para portar el patrón de
                                          #   `.mundo-portada-escena` (no se modifica)

js/
├── personajes.js                        # NUEVO — módulo dedicado (por convención "un módulo
│                                         #   por responsabilidad", cargado solo en esta página):
│                                         #   arma el riel de galería (GSAP+ScrollTrigger,
│                                         #   idéntico patrón a mundo-portada.js) y el ciclador
│                                         #   del visor Nav-Ranger (setInterval + IntersectionObserver)
├── mundo-portada.js                     # SOLO LECTURA — referencia del patrón riel+sticky+scrub
└── vendor/gsap@3.13.0/                  # SOLO LECTURA — ya vendorizado, se reutiliza tal cual

assets/img/
├── personajes-<id>.jpg                  # existente — retrato de respaldo (degradado FR-009)
├── personajes-<id>-escena-NN.jpg        # NUEVO — fotogramas curados para la galería (Cooper/Murph)
└── personajes-<id>-visor-NN.jpg         # NUEVO — fotogramas curados para el visor Nav-Ranger

assets/cap-that.com_interstellar(2014)/  # SOLO LECTURA, LOCAL, GITIGNOREADO — fuente de curación,
                                          #   nunca se versiona (FR-010)

CREDITOS.md                              # se amplía con una fila por fotograma nuevo curado
```

**Structure Decision**: sitio estático de página única modificada (`personajes.html` +
`css/personajes.css` + `js/personajes.js` nuevo), sin separación frontend/backend — sigue la
estructura ya vigente del repo (constitución, "Estructura de carpetas"). No se toca
`css/mundos.css` ni `js/mundo-portada.js`: se leen como referencia de patrón, no se importan ni
se editan (evita acoplar una página a los selectores de otra).

## Complexity Tracking

> Ninguna violación de la constitución requiere justificación en esta feature. La única nota
> (GSAP no documentado como excepción explícita del Principio I) es una inconsistencia
> preexistente del proyecto, no introducida por este plan, y no requiere una excepción nueva —
> se resuelve reutilizando exactamente el mecanismo ya en producción, sin ampliarlo.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
