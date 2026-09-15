# Implementation Plan: Fundación CSS — reset, tokens y arquitectura de 4 hojas

**Branch**: `006-reset-css` | **Date**: 2026-09-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/006-reset-css/spec.md`

## Summary

Disolver el único `css/global.css` (1069 líneas, secciones 0–14) en **cuatro hojas
globales** cargadas en orden fijo por `<link>` en las 9 páginas —
`reset.css → variables.css → base.css → layout.css`, sin `@import`. La pieza nueva es
`css/reset.css`: un reset moderno con selectores `:where()` (especificidad 0), reset total
de `margin` y `box-sizing`, normalización de listas/media/form-controls/tablas, enlaces sin
decoración, botones sin estilo nativo, `overflow-wrap` en texto/encabezados, y un bloque
global agresivo de `@media (prefers-reduced-motion: reduce)` (con `!important`) que
reemplaza al bloque puntual actual. El resto de `global.css` se **reubica sin cambios de
valor** entre `variables.css` (tokens + `@font-face`), `base.css` (elementos base +
espaciado de contenido) y `layout.css` (layout + componentes). El único cambio de HTML es
el bloque de `<link>`. Verificación: comparación visual página por página (cero
regresiones) + auditoría de especificidad + `node --test` en verde.

## Technical Context

**Language/Version**: CSS3 (`:where()`, `@media (prefers-reduced-motion)`, `overflow-wrap`,
custom properties) + HTML5 (`<link rel="stylesheet">`). Sin JS nuevo.

**Primary Dependencies**: ninguna. Vanilla puro, sin frameworks ni preprocesadores
(Principio I). Sin `@import`.

**Storage**: N/A.

**Testing**: capa presentacional → validación por **criterios de aceptación** (Principio V):
comparación visual antes/después página por página a ≈360 px y ≈1280 px, auditoría manual de
especificidad de `reset.css`, prueba de `prefers-reduced-motion`, prueba de overflow a
320 px. Además `node --test tests/*.test.js` DEBE seguir 26/26 (la feature no toca lógica).

**Target Platform**: navegadores evergreen, últimas 2 versiones (constitución, "Baseline").
Sin polyfills.

**Project Type**: sitio estático servido tal cual (sin build), GitHub Pages bajo
`/Interstellar/`.

**Performance Goals**: sin regresión perceptible. El costo es **+3 requests HTTP** de CSS
por página (4 hojas en vez de 1). Mitigado por: hojas chicas (~1–8 KB c/u), HTTP/2
multiplexado, gzip/brotli, y CDN (Cloudflare, previsto). El CSS no es el elemento LCP.

**Constraints**:
- Cero regresión visual en **las 9 páginas** (spec US1-AS3, SC-003).
- Ninguna regla de `reset.css` supera especificidad `(0,0,1,0)` salvo el bloque de
  `prefers-reduced-motion` (SC-001).
- Solo se toca el `<head>` de las 9 páginas (bloque de `<link>`); ningún otro markup
  (FR-020).
- `css/global.css` deja de existir (FR-003, SC-004).

**Scale/Scope**: 4 hojas CSS (~1100 líneas redistribuidas + ~60 líneas nuevas de reset),
9 archivos HTML con un cambio de 1 bloque cada uno, 0 archivos JS. Comentarios de
`js/layout.js` que mencionan `global.css` se actualizan por prolijidad (no funcional).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio / Regla | Estado | Nota |
|---|---|---|
| **I. Stack vanilla, sin build** | ✅ PASA | 4 archivos `.css` planos + `<link>`. Sin `@import`, sin preprocesador, sin bundler. |
| **II. HTML semántico primero** | ✅ PASA | Único cambio de markup: reemplazar 1 `<link>` por 4 en el `<head>`. Cero cambios de estructura. |
| **III. Construcción en capas** | ✅ PASA | Esta feature ES la capa base (reset). No suma efectos ni minijuegos. |
| **IV. Comprensión sobre generación** | ✅ PASA | Un reset `:where()` es patrón estándar y explicable. La reubicación es mecánica (regla base-vs-layout en research.md). |
| **V. TDD en lógica / aceptación en presentación** | ✅ PASA | CSS puro → se valida contra criterios de aceptación (comparación visual). Tests JS intactos (26/26). |
| **VI. Rigor científico** | N/A | No hay contenido educativo. |
| **§ Convención CSS (v1.2.0)** | ✅ PASA | La arquitectura de 4 hojas en orden `reset → variables → base → layout` es exactamente la que fija la constitución enmendada. |
| **§ Rutas relativas** | ✅ PASA | Los 4 `<link>` usan `href="css/…"` relativo. |

**Sin violaciones → no se requiere Complexity Tracking.**

**Re-check post-Phase 1 (diseño)**: research.md y data-model.md no introducen ninguna
dependencia, build ni patrón que roce un principio. El reparto base/layout (D2) es
mecánico y explicable; el reset `:where()` (D1) es estándar; el bloque
`prefers-reduced-motion` (D4) se verificó que no rompe drawer/filter/video. **Sigue sin
violaciones.**

## Project Structure

### Documentation (this feature)

```text
specs/006-reset-css/
├── plan.md              # Este archivo
├── spec.md              # Especificación (ya existe)
├── research.md          # Phase 0 (este comando)
├── data-model.md        # Phase 1 (este comando) — mapa de reubicación
├── quickstart.md        # Phase 1 (este comando) — guía de verificación
├── contracts/
│   └── hojas-css.md     # Phase 1 — contrato del bloque <link> + invariante de especificidad
├── checklists/
│   └── requirements.md  # ya existe
└── tasks.md             # Phase 2 (/speckit-tasks — NO lo crea este comando)
```

### Source Code (repository root = `interstellar/`)

```text
css/
├── reset.css            # NUEVO — reset :where() + prefers-reduced-motion global
├── variables.css        # NUEVO — :root tokens + @font-face (de global.css §0 y §1)
├── base.css             # NUEVO — elementos base + :focus-visible + :target + espaciado de contenido
├── layout.css           # NUEVO — layout + componentes (de global.css §3–§14)
└── global.css           # ELIMINADO al cerrar la feature

index.html, mundos.html, personajes.html, ciencia.html, viaje.html,
galeria.html, trailer.html, minijuegos.html, creditos.html
   └── <head>: 1 <link a global.css>  ->  4 <link> en orden

js/layout.js             # sin cambios funcionales; comentarios "global.css" -> "layout.css"
```

**Structure Decision**: sitio estático de un solo "proyecto", sin `src/`. El CSS vive en
`css/` (constitución, § Estructura de carpetas). Se pasa de 1 a 4 hojas globales conforme a
la convención CSS v1.2.0. El HTML y el JS quedan donde están.

**Extensibilidad (FR-022)**: la arquitectura queda lista para que features futuras —cada
minijuego, hechos con CSS + JS vanilla— sumen **un 5º `<link>`** de CSS propio por página,
después de `layout.css` (contract `hojas-css.md` C5). Esta feature NO crea ninguna hoja de
página; solo garantiza el patrón. El reset a especificidad 0 es justamente lo que hace que
la UI densa de un juego sobreescriba la base sin `!important`.

## Complexity Tracking

> No aplica: Constitution Check sin violaciones.
