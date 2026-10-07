# Implementation Plan: Hub de Minijuegos + Capítulo 1 "No Time for Caution"

**Branch**: `sec/minijuegos` | **Date**: 2026-10-07 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/009-minijuegos-acople/spec.md`, más las "Notas para `/speckit-plan`" del brief `PromtInicialMiniJuegos.md`.

## Summary

Este plan cubre dos piezas:

- **Hub**: `minijuegos.html` pasa a ser un mapa de misiones en HTML semántico, con 4 bahías (la 1 jugable) y el récord local. Sale la terminal de memes.
- **Simulador**: `minijuego-acople.html` es nueva y contiene el arcade *No Time for Caution*.

Enfoque técnico:

- **Vista desde la cabina** a lo largo del eje de giro (R2). Al sincronizar, la estación queda quieta y gira el universo. La rotación y la aproximación se controlan como ejes independientes.
- **Toda la lógica es pura y está testeada con `node --test`**: física de paso fijo, sincronía, contacto, máquina de estados, scoring, récord, input como acciones y detección del aviso.
- **Phaser 4.2.1 solo dibuja una escena** (espacio, estación, nave, partículas, cámara) y carga con `import()` dinámico únicamente en el simulador.
- **La intro, el HUD, la pausa, el resultado y el aviso son overlays de HTML semántico** (R3).
- **Música**: se generaliza el silencio por ruta que ya existe para el trailer (R5).
- **Audio del juego**: sintetizado con Web Audio, sin assets (R6).

## Technical Context

**Language/Version**: JavaScript ES2022, ES Modules escritos a mano, sin TypeScript ni build (Principio I).

**Primary Dependencies**: Phaser **4.2.1** (`phaser.esm.min.js`, ~345 KB gzip, autocontenido; R1). Las existentes del sitio: swup 4.10.0, ya integrado. Sin dependencias nuevas de tooling.

**Storage**:
- `localStorage`, clave `interstellar:minijuegos:acople:best`, para el récord (R13).
- `sessionStorage`, clave `interstellar:minijuegos:mute`, para el mute del juego (R6).

**Testing**: `node --test` (`pnpm test`), con archivos en `tests/acople-*.test.js` más el test de `rutaSinMusica`. La presentación se valida por aceptación con [quickstart.md](quickstart.md).

**Target Platform**: navegadores evergreen (últimas 2 versiones). El juego requiere teclado y puntero fino; WebGL con fallback a Canvas (`Phaser.AUTO`).

**Project Type**: sitio web estático (GitHub Pages bajo `/Interstellar/`), con navegación SPA vía swup.

**Performance Goals**:
- 60 fps en la escena en una laptop media.
- El hub no descarga el motor.
- El simulador muestra la intro o el aviso en menos de 3 s (SC-007).
- Reintentar en menos de 2 s (SC-004).

**Constraints**:
- Rutas relativas.
- Hojas en orden `reset → variables → base → layout → (cielo) → minijuegos`.
- Sin colores hardcodeados: tokens CSS leídos en runtime.
- `prefers-reduced-motion`.
- Destroy limpio con swup (R12).
- Sin assets con copyright.

**Scale/Scope**: 2 páginas, unos 12 módulos JS nuevos, 1 hoja CSS nueva y alrededor de 10 archivos de test. Un solo jugador local.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio / regla | Evaluación | Estado |
|---|---|---|
| **I. Stack vanilla, librerías con criterio** | JS ES Modules a mano, sin TS ni build. Phaser está justificado en la spec (a–d) y en R1 con el peso medido (~345 KB gzip). Carga solo en `minijuego-acople.html` vía `import()` después del primer paint. Se prototipa pinneado y se vendoriza en `js/vendor/phaser@4.2.1/` antes de cerrar. | ✅ |
| **II. HTML semántico** | Hub con `<ol>`, `<article>` y h1→h2→h3. El simulador usa overlays con `<section>`, `<dl>`, `<button>` y `<a>` reales, foco visible y bahías bloqueadas fuera del orden de tabulación. Botones y textos no van en canvas (R3). | ✅ |
| **III. Construcción en capas** | Los minijuegos van "al final, como coronación". La base del sitio ya está cerrada (secciones 001–008 en main). | ✅ |
| **IV. Comprensión sobre generación** | Módulos chicos de una responsabilidad. La física es deliberadamente simple (2 ejes, R2) y las decisiones están documentadas en `research.md`. | ✅ |
| **V. TDD en la lógica** | Toda regla de juego vive en `logica/` sin motor ni DOM, con test en rojo primero (contrato `logica-acople.md`), incluido el test de balance (R9). La escena y los overlays se validan por aceptación. | ✅ |
| **VI. Rigor científico** | El juego no muestra cifras de la película y la bahía 1 deja de decir "67 RPM" (R10). | ✅ |
| **CSS** | `css/minijuegos.css` es la hoja propia, nombrada por la constitución, y carga después de las 4 globales. El bloque de bahías se muda desde `en-desarrollo.css` (R11). | ✅ |
| **JS: un módulo por responsabilidad, cargado solo donde se usa, sin globals** | Cada página carga su módulo y no hay `window.*` nuevos. La única excepción es el flag existente `__SWUP_ROUTER_ACTIVE__`, que solo se lee. | ✅ |
| **Diseño** | La interfaz del simulador es "capa de nave", así que usa el teal como acento de cockpit (no baja al contenido narrativo), ámbar y rojo como LEDs de estado y alerta, y crema para el texto. Fuentes self-hosted. | ✅ |
| **Assets / créditos** | El juego es 100 % procedural: no hay imágenes nuevas que acreditar. | ✅ |
| **Backend** | Ninguno. El récord va en `localStorage`, como manda la constitución. | ✅ |
| **Fuera de alcance (PWA, i18n, etc.)** | No se toca. | ✅ |

**Re-check post-diseño (Phase 1)**: los contratos y el data model no introducen violaciones. La única desviación consciente respecto del brief, pasar de 3 escenas Phaser a 1 escena con overlays DOM, **refuerza** el Principio II. No hay entradas en Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/009-minijuegos-acople/
├── spec.md
├── plan.md              # este archivo
├── research.md          # R1–R13
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── logica-acople.md
│   └── integracion-sitio.md
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks (todavía no)
```

### Source Code (repository root = `interstellar/`)

```text
minijuegos.html                      # REHECHO: hub (contrato integracion-sitio §1)
minijuego-acople.html                # NUEVO: simulador (§2)
css/
├── minijuegos.css                   # NUEVO: hub + simulador (overlays, HUD, aviso)
└── en-desarrollo.css                # se muda el §4 Bahías
js/
├── layout.js                        # rutaSinMusica() (R5)
├── swup-router.js                   # PAGE_MODULES + HOJAS_ESTILO_SITIO
├── vendor/phaser@4.2.1/phaser.esm.min.js   # al cerrar la feature (+ README)
└── minijuegos/
    ├── hub.js                       # mount: pinta el récord en la bahía 1
    └── acople/
        ├── main.js                  # mount/unmount, aviso, import() de Phaser, listeners, flujo de pantallas
        ├── config.js                # CONFIG congelado (FR-018, FR-039)
        ├── escena-acople.js         # única Phaser.Scene: dibuja el estado, partículas, cámara
        ├── overlays.js              # muestra/oculta [data-pantalla], pinta HUD y resultado (DOM)
        ├── audio-acople.js          # Web Audio sintetizado + mute (R6)
        └── logica/                  # PURO — sin Phaser ni DOM
            ├── acciones.js
            ├── fisica.js
            ├── docking.js
            ├── mision.js
            ├── scoring.js
            ├── record.js
            └── dispositivo.js
tests/
├── acople-{config,acciones,fisica,docking,mision,scoring,record,balance,dispositivo}.test.js
└── musica-mobile.test.js            # + casos de rutaSinMusica
sitemap.xml                          # + minijuego-acople.html
```

**Structure Decision**:
- Se adopta la estructura tentativa del brief con tres ajustes:
  1. `escenas/` se reduce a **un solo archivo** (`escena-acople.js`), porque la intro y el resultado son DOM (R3).
  2. `ui/` pasa a `overlays.js`, porque el HUD es DOM y no un objeto de Phaser.
  3. Se suman `dispositivo.js` (R7) y `audio-acople.js` (R6). `input.js` pasa a llamarse `acciones.js` (R8).
- El orden de dependencias es `logica/` ← `main.js` → (`escena-acople.js`, `overlays.js`, `audio-acople.js`). La escena y los overlays **solo leen** la partida y nunca la mutan.
- Una misión futura suma `js/minijuegos/<mision>/`, su página y su bahía, sin tocar `acople/` (FR-041). No se crea ninguna abstracción "Mision base" hasta que exista la segunda misión.

### Orden sugerido de implementación (insumo para `/speckit-tasks`)

1. **Lógica con TDD**: `config` → `acciones` → `fisica` → `docking` → `mision` → `scoring` → `record` → `dispositivo` → test de balance.
2. **Integración del sitio**: `rutaSinMusica` (TDD), router, CSS mudado.
3. **Hub** (US3), con `hub.js` leyendo el récord.
4. **Simulador mínimo**: página, `main.js` con el aviso, `import()` de Phaser desde CDN pinneado, escena con estación y nave dibujadas, input y HUD. Con esto ya se juega US1.
5. **Resultado y reintento** (US2 y US4).
6. **Pulido**: partículas, cámara, campo estelar, audio, reduced-motion, pausa por foco.
7. **Balance con personas**, vendorizar Phaser y quickstart completo.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
