# Implementation Plan: Capítulo 2 "Miller's Wave Escape" — Misión 1

**Branch**: `sec/minijuegos` | **Date**: 2026-10-09 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/011-minijuego-miller/spec.md`

## Summary

Segundo simulador de la sección Minijuegos: un contrarreloj belt-scroller en el planeta de Miller. Hay que recoger la baliza, volver al Ranger y despegar antes de que la ola alcance al jugador. Es un port del prototipo React + TS del Playground, **reescrito** (no copiado) en JS vanilla con el mismo patrón que el acople:
- lógica pura e inmutable en `js/minijuegos/miller/logica/`, con TDD;
- escena Phaser 4.2.1 (vendorizado) que solo dibuja;
- HUD y pantallas en HTML semántico superpuesto;
- audio sintetizado.

Antes de escribir Miller, los módulos genéricos del acople (ranking, editor de nombre, dispositivo, acciones, toques y pantalla completa) se mueven a `js/minijuegos/comun/`, para que los dos capítulos los compartan sin depender uno del otro (research R1).

## Technical Context

**Language/Version**: JavaScript ES2022, ES Modules escritos a mano, HTML5 y CSS3. Sin TypeScript ni build.

**Primary Dependencies**: Phaser 4.2.1, ya vendorizado en `js/vendor/phaser@4.2.1/` (1,38 MB, ~355 KB gzip). Se carga solo en `minijuego-miller.html` con `import()` dinámico. No se suma ninguna librería nueva.

**Storage**: `localStorage`, con la clave `interstellar:minijuegos:miller:ranking` y `v: 1` (mismo formato que el acople) ([contrato](contracts/ranking-storage.md)).

**Testing**: `node --test` + `node:assert` sobre la lógica pura (`tests/miller-*.test.js`, `tests/comun-*.test.js`). La presentación se valida por aceptación ([quickstart](quickstart.md)).

**Target Platform**: navegadores evergreen (últimas 2 versiones), en desktop con teclado y en celulares o tablets táctiles en landscape. Se publica en GitHub Pages bajo un subpath, así que todas las rutas son relativas.

**Project Type**: sitio web estático multipágina con navegación SPA (swup). El minijuego es un módulo de página con `mount`/`unmount`.

**Performance Goals**: 60 fps estables en un celular de gama media. Las partículas tienen un tope (300 en teclado, 150 en táctil), se reutilizan desde un pool y el loop caliente no crea objetos.

**Constraints**:
- pixel art con resolución interna de 480 × 270 y escala entera;
- paleta cerrada de 18 colores, sin teal en el mundo y con un solo naranja por pantalla;
- sin assets externos;
- `prefers-reduced-motion`;
- máximo 3 destellos por segundo;
- partidas de 45 a 90 s.

**Scale/Scope**: 1 página nueva y unos 20 módulos JS nuevos (unos 12 de lógica). Además: 6 módulos movidos a `comun/`, 1 hoja CSS nueva y cambios chicos en el hub, el router y los créditos/README de minijuegos si aplica.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cómo se cumple | Estado |
|---|---|---|
| I. Stack vanilla, librerías con criterio | JS a mano en ESM, sin React ni TS (el prototipo se reescribe). Phaser ya está vendorizado y justificado en la spec: (a) qué resuelve, (b) por qué no se hace a mano, (c) peso de ~355 KB gzip, cargado dinámicamente después del LCP, (d) se carga solo en esta página. Sin build. | ✅ |
| II. HTML semántico primero | Overlays con `<section>`, `<h2>`, `<ol>` para el ranking, `<button>` reales y `<output>` para las lecturas. El foco es visible en los botones de las pantallas. | ✅ |
| III. Construcción en capas | La base del sitio y la sección Minijuegos ya cumplen (009/010). Un minijuego es la capa 3: corresponde ahora. | ✅ |
| IV. Comprensión sobre generación | Las fórmulas (arrastre, puntaje, ola, dilatación) son lineales y están documentadas en research. Nada de abstracciones "para futuras misiones": `comun/` solo junta lo que **ya** usan dos capítulos. | ✅ |
| V. TDD en la lógica | Todo `logica/` y `comun/logica/` con Red-Green-Refactor, más el test de balance. La escena, los overlays, el audio y el glue se validan por aceptación. | ✅ |
| VI. Rigor científico | 1 h = 7 años y la altura de la ola llevan `✎ Licencia narrativa` (FR-014). El juego no suma texto educativo nuevo. | ✅ |
| Convenciones | Archivos en kebab-case sin acentos, JS en español y camelCase, rutas relativas. CSS propio bajo `.juego-miller`, cargado después de las 4 hojas globales. Comentarios de una línea, y el porqué largo va a `docs/20-notas-de-codigo/`. | ✅ |

**Re-check post-diseño (Phase 1)**: sin violaciones. Un solo desvío del brief, a favor de la constitución: Phaser se importa del vendorizado, no del CDN que pedía el Prompt.

## Project Structure

### Documentation (this feature)

```text
specs/011-minijuego-miller/
├── spec.md
├── plan.md              # este archivo
├── research.md          # R1–R15
├── data-model.md        # CONFIG, Mapa, Partida, Resultado, transiciones
├── quickstart.md        # validación end-to-end
├── contracts/
│   ├── logica-miller.md     # firmas de la lógica pura + cambios de comun/
│   ├── modulo-pagina.md     # mount/unmount, router, parámetros de URL
│   └── ranking-storage.md   # clave y forma en localStorage
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks (todavía no)
```

### Source Code

```text
minijuego-miller.html                 # NUEVA — página del simulador (estructura gemela del acople)
minijuegos.html                       # bahía 02 → disponible + data-record-miller
css/
└── minijuego-miller.css              # NUEVA — todo bajo .juego-miller (HUD, banners, joystick, letterbox)
js/
├── swup-router.js                    # + ruta minijuego-miller.html
└── minijuegos/
    ├── hub.js                        # lee también el ranking de Miller
    ├── comun/                        # NUEVA — movido del acople (R1)
    │   ├── pantalla-completa.js
    │   └── logica/
    │       ├── acciones.js           # teclas obligatorio
    │       ├── controles-tactiles.js # acciones válidas obligatorias
    │       ├── dispositivo.js
    │       ├── nombre-arcade.js
    │       └── ranking.js
    ├── acople/                       # solo cambian imports (y pasa CONFIG.teclas explícito)
    └── miller/                       # NUEVA
        ├── config.js                 # CONFIG + PALETA_PIXEL + ANIM, congelados
        ├── sprites.js                # mapas de caracteres + tabla ANIMACIONES (datos puros)
        ├── main.js                   # mount/unmount, carga de Phaser, loop, wiring
        ├── escena-miller.js          # Phaser: texturas, parallax, ola, partículas, cámara
        ├── escena-galeria.js         # ?debug=sprites
        ├── overlays.js               # HUD, intro, cuenta, banners, resultado, ranking, giro
        ├── audio-miller.js           # Web Audio sintetizado, crear/destruir
        ├── controles-tactiles.js     # joystick + botón (DOM → acciones)
        └── logica/
            ├── azar.js
            ├── mapa.js
            ├── fisica.js
            ├── ola.js
            ├── baliza.js
            ├── despegue.js
            ├── dilatacion.js
            ├── scoring.js
            ├── joystick.js
            ├── escala.js
            └── mision.js
tests/
├── comun-*.test.js                   # renombrados desde acople-{ranking,nombre-arcade,dispositivo,acciones,controles-tactiles}
├── acople-*.test.js                  # el resto, con los imports actualizados
├── minijuegos-hub.test.js            # + récord de Miller
└── miller-{azar,mapa,fisica,ola,baliza,despegue,dilatacion,scoring,joystick,escala,mision,sprites,config,balance}.test.js
```

**Structure Decision**: se replica la estructura del acople (`config.js` + `logica/` + escena + overlays + audio + glue táctil + `main.js`) para que los dos capítulos se lean igual. Lo compartido baja a `comun/` solo cuando lo usan dos capítulos de verdad. No hay clases base ni un "motor de minijuegos" propio.

## Orden de implementación (para `/speckit-tasks`)

1. **Refactor `comun/`** (R1): mover, ajustar firmas y renombrar tests. Con `node --test` en verde y el acople probado a mano, se hace el commit.
2. **Lógica de Miller con TDD**, de abajo hacia arriba: azar → mapa → física → ola → baliza → despegue → dilatación → scoring → joystick → escala → misión → balance.
3. **Sprites y paleta**: `sprites.js` con su test de integridad, y la galería `?debug=sprites`.
4. **Página + escena + overlays + teclado**: el MVP jugable en desktop (US1 + US2).
5. **Resultado, tirada, ranking y hub** (US3).
6. **Táctil, giro y pantalla completa** (US4).
7. **Audio**.
8. **CASE** (US5).
9. **Pulido y aceptación**: reduced-motion, partículas, rendimiento en un celular real y quickstart completo.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
