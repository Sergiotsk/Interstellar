# Implementation Plan: Capítulo 2 "Miller's Wave Escape" — réplica fiel (v2)

**Branch**: `sec/minijuegos` | **Date**: 2026-10-09 | **Spec**: [spec.md](spec.md)

## Summary

Réplica del juego completo del Playground (`../mini-juego/App.tsx`): superficie cenital + shmup vertical hasta la Endurance. Phaser 4.2.1 hace de anfitrión (loop, escalado, ciclo de vida) y **el render Canvas 2D del original** dibuja sobre un `CanvasTexture`. La lógica del `update` del original se divide en módulos puros (sin DOM ni Phaser, con `rng` y `dt` inyectados) y se cubre con pruebas de caracterización. El HUD y las pantallas en JSX pasan a HTML y CSS propios.

## Technical Context

**Language/Version**: JavaScript ES2022 (ES Modules), HTML5 y CSS3. Sin TypeScript, React, Tailwind ni build.

**Primary Dependencies**: Phaser 4.2.1 vendorizado (`js/vendor/phaser@4.2.1/`), con `import()` dinámico solo en esta página.

**Storage**: `localStorage`, clave `interstellar:minijuegos:miller:ranking`.

**Testing**: `node --test`, con pruebas de caracterización de `logica/` (`tests/miller-*.test.js`). El render y el HUD se validan por aceptación ([quickstart](quickstart.md)).

**Target Platform**: navegadores evergreen, en desktop con teclado y mouse y en táctil en horizontal.

**Performance Goals**: 60 fps en desktop y jugable en un celular de gama media (el `CanvasTexture` en táctil va a 1×).

**Constraints**: fidelidad al original (FR-001); lógica testeable (FR-020); rutas relativas; integración con el sitio (swup, header y footer).

## Constitution Check

| Principio | Cómo se cumple | Estado |
|---|---|---|
| I. Vanilla + librerías con criterio | JS a mano; sin React ni TS (los tipos se quitan una sola vez y el resultado se mantiene a mano: R3). Phaser ya está vendorizado y justificado. | ✅ |
| II. HTML semántico | Pantallas con `<section>`, `<h2>`, `<button>`, `<table>` para el Hall of Fame y `<output>` para las lecturas. | ✅ |
| III. Capas | El minijuego es la capa 3 sobre una base ya aceptada. | ✅ |
| IV. Comprensión | El código es el del juego del autor, traducido; las decisiones están en research. | ✅ |
| V. TDD en la lógica | Pruebas de caracterización por módulo antes de portar (R4). | ✅ |
| VI. Rigor | `✎ Licencia narrativa` en las cifras de la película; se corrige 17,518 → 17,045 (R7). | ✅ |

## Project Structure

```text
minijuego-miller.html                 # se reescribe: HUD y pantallas del original en HTML
css/minijuego-miller.css              # se reescribe: estilos del original (TOKENS_HUD)
assets/audio/minijuegos/miller-ambiente.mp3   # música del original
js/minijuegos/miller/
├── config.js            # CONFIG (constants.ts), PALETA_PIXEL, ANIM, TOKENS_HUD
├── logica/
│   ├── azar.js          # mulberry32 (se conserva de la v1)
│   ├── efectos.js       # onda, texto flotante, banner, sonar(); avance de efectos (corrige R7 a/b)
│   ├── estado.js        # crearSim (= initGame)
│   ├── danio.js         # aplicarDanio, matarJugador
│   ├── nave.js          # abordar, dispararMisil, detonarEmp, cambiarArma
│   ├── superficie.js    # actualizarSuperficie (Fase 1)
│   ├── orbita.js        # actualizarTransicion, actualizarOrbita (Fase 2)
│   ├── proyectiles.js   # proyectiles e impactos; caídas y recogida
│   ├── puntaje.js       # tiempo terrestre, puntaje en vivo, de victoria y de fallo; rango
│   ├── motor.js         # actualizar(): orquesta el paso (= update del original)
│   └── hall-of-fame.js  # leer/guardar con storage inyectado y pilotos de ejemplo
├── render/
│   ├── funciones.js     # las 14 funciones render* del original, solo sin tipos
│   └── dibujar.js       # draw() del original
├── escena-miller.js     # Phaser: CanvasTexture + paso fijo + dibujar
├── audio-miller.js      # SynthAudio + gameAudio usados + música
├── hud.js               # pantallas y barras (el JSX del original)
├── controles.js         # teclado del original + D-pad y botones táctiles
└── main.js              # mount/unmount, flujo de pantallas
tests/miller-*.test.js   # se reescriben: caracterización de logica/
```

**Se borra (v1)**: `sprites.js`, `texturas.js`, `escena-galeria.js`, `overlays.js`, `controles-tactiles.js`, `logica/{mapa,fisica,ola,baliza,despegue,dilatacion,scoring,joystick,escala,mision}.js` y sus tests.

## Orden de implementación

1. Borrar la v1 y portar `config.js`.
2. Lógica por módulo, con test de caracterización primero: efectos → estado → puntaje → daño → nave → superficie → órbita → proyectiles → motor → hall-of-fame.
3. Render portado (R3) + escena Phaser + página mínima: **el juego se ve y se juega**.
4. HUD y pantallas (briefing, barras, banners, victoria, fallo, pausa, ranking, manual).
5. Audio y música.
6. Táctil, giro y pantalla completa.
7. Hub (ya hecho), créditos del mp3, notas de código y quickstart.

## Complexity Tracking

| Desvío | Por qué | Alternativa descartada |
|---|---|---|
| Lógica mutable (`sim` en el lugar) | Es la del original; hacerla inmutable sería reescribirla | Inmutable como el acople: deja de ser una réplica |
| Herramienta de una sola vez para quitar tipos (R3) | Es la traducción más fiel | Reescribir a mano 3000 líneas de dibujo: más riesgo de diferencias |
