# Implementation Plan: Simulador de acople jugable en celulares y tablets

**Branch**: `sec/minijuegos` | **Date**: 2026-10-08 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/010-acople-mobile/spec.md`.

## Summary

El simulador *No Time for Caution* deja de bloquear los táctiles y pasa a jugarse con los pulgares. Reemplaza FR-034 y SC-008 de la 009.

Enfoque técnico:

- **Modo de entrada** decidido al montar (`modoEntrada`, puro), con override `?entrada=` (R1). Mantiene el criterio del equipo híbrido de la 009.
- **Controles táctiles** como superficie DOM de `<button>`. Usan Pointer Events con la captura implícita liberada (R2) y un mapa puro `pointerId → acción` (R3). Las acciones efectivas son la unión de teclado y toques. **La física, el puntaje y el ranking no cambian**: el modelo de acciones de la 009 (FR-011) ya lo permitía.
- **Cabina**: modo `data-cabina` (fixed, `100dvh`) en todos los navegadores, más Fullscreen y bloqueo horizontal donde existan (R4, R5). Aviso de giro como **capa independiente** que pausa sin destruir el estado (R6).
- **Consola compacta** por altura de pantalla, con los 5 instrumentos (R7). Controles de ≥48 px en zonas seguras, sin zoom, selección ni menú (R8).
- **Editor de nombre**: botones que reusan `teclaEditor` y casillas tocables con `fijarCursor` (R10).

## Technical Context

**Language/Version**: JavaScript ES2022, ES Modules escritos a mano, sin build (Principio I).

**Primary Dependencies**: Phaser 4.2.1, ya vendorizado. No se suman dependencias. APIs de plataforma usadas: Pointer Events, Fullscreen API, Screen Orientation API, `matchMedia`, `navigator.vibrate`. Todas son opcionales salvo Pointer Events, que es baseline.

**Storage**: sin cambios. Sin claves nuevas.

**Testing**: `node --test` para la lógica pura (`tests/acople-*.test.js`). La presentación se valida por aceptación con [quickstart.md](quickstart.md), incluido un dispositivo real.

**Target Platform**: navegadores evergreen de desktop (sin cambios), más Safari iOS y Chrome Android (últimas 2 versiones) en horizontal.

**Project Type**: sitio web estático (GitHub Pages), con navegación SPA vía swup.

**Performance Goals**:
- 60 fps en la escena en un teléfono medio.
- Respuesta táctil sin demora perceptible: la acción se aplica en el tick siguiente, igual que con teclado.

**Constraints**:
- Rutas relativas.
- Sin colores hardcodeados.
- Destroy limpio con swup: los listeners nuevos van a `s.limpiezas`.
- `prefers-reduced-motion`.
- Targets de ≥48 px.
- Safe areas.

**Scale/Scope**:
- 1 página modificada y 1 módulo puro nuevo.
- 1 módulo DOM nuevo.
- 4 módulos extendidos: `dispositivo`, `mision`, `nombre-arcade` y `pantalla-completa`.
- Alrededor de 3 archivos de test nuevos o modificados.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio / regla | Evaluación | Estado |
|---|---|---|
| **I. Stack vanilla** | No suma librerías ni build. Solo APIs nativas, con detección y degradación (R4, R5, R11). | ✅ |
| **II. HTML semántico** | Los controles son `<button>` reales con `aria-label`, no dibujos en el canvas (R8). El aviso de giro tiene rol y título. Las casillas del editor pasan de `<span>` a `<button>`. | ✅ |
| **III. Construcción en capas** | Se apoya en la 009 cerrada y en producción (PR #42). | ✅ |
| **IV. Comprensión sobre generación** | Las decisiones están documentadas en R1–R12. Un módulo chico por responsabilidad: el mapa de toques es puro y el glue es DOM. | ✅ |
| **V. TDD en la lógica** | `modoEntrada`, `requiereGiro`, el mapa de toques, `fijarCursor` e `indicacionHud` con modo se hacen con test en rojo primero. El glue de eventos, el CSS y el layout se validan por aceptación. | ✅ |
| **VI. Rigor científico** | No se agregan cifras. | ✅ |
| **CSS** | Todo va en `css/minijuegos.css`, la hoja propia ya existente. | ✅ |
| **JS: módulo por responsabilidad, sin globals** | `controles-tactiles.js` (DOM) y `logica/controles-tactiles.js` (puro) son nuevos. Sin `window.*` nuevos. | ✅ |
| **Diseño** | Los controles usan la silueta de tecla de cabina y el acento teal de la capa de nave. | ✅ |
| **Baseline evergreen, sin polyfills** | Pointer Events, `dvh` y `env()` son baseline. Fullscreen, Orientation y vibrate son opcionales, con `?.` o try/catch. | ✅ |
| **Fuera de alcance (PWA, etc.)** | No se instala, sin service worker ni manifest. | ✅ |

**Re-check post-diseño (Phase 1)**: el contrato (`contracts/entrada-tactil.md`) y el data model no introducen violaciones. El único cambio de semántica, casillas del editor como `<button>`, **mejora** el Principio II. No hay entradas en Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/010-acople-mobile/
├── spec.md
├── plan.md              # este archivo
├── research.md          # R1–R12
├── data-model.md
├── quickstart.md
├── contracts/
│   └── entrada-tactil.md
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks (todavía no)
```

### Source Code (repository root = `interstellar/`)

```text
minijuego-acople.html                       # controles, capa de giro, ayudas por modo, editor táctil, viewport-fit=cover
css/minijuegos.css                          # data-entrada, data-cabina, consola compacta, mandos, capa de giro
js/minijuegos/acople/
├── main.js                                 # modo, unión de acciones, cabina, orientación, clics nuevos
├── controles-tactiles.js                   # NUEVO: glue Pointer Events → mapa de toques
├── overlays.js                             # capa de giro, editor con casillas-botón
├── pantalla-completa.js                    # + bloquearHorizontal()
└── logica/
    ├── dispositivo.js                      # modoEntrada, requiereGiro (sale debeMostrarAvisoDesktop)
    ├── controles-tactiles.js               # NUEVO: tocar / levantar / levantarTodo / accionesTactiles
    ├── mision.js                           # indicacionHud(…, modo)
    └── nombre-arcade.js                    # + fijarCursor
tests/
├── acople-dispositivo.test.js              # reescrito
├── acople-controles-tactiles.test.js       # NUEVO
├── acople-nombre-arcade.test.js            # + fijarCursor
└── acople-mision.test.js                   # + TAP TO DOCK
docs/20-notas-de-codigo/minijuegos-acople.md  # + sección "Entrada táctil" (local, excluido de git)
```

**Structure Decision**: se extiende la estructura de la 009 sin carpetas nuevas. El par puro/DOM de `controles-tactiles` sigue el patrón `logica/` + glue que ya usan `mision.js`/`main.js` e `instrumentos.js`/`overlays.js`.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
