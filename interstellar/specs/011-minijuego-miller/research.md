# Research — Feature 011 v2: réplica fiel de "Miller's Wave Escape"

La v1 (belt-scroller hecho desde los briefs) quedó descartada: ver la sesión de clarificaciones de `spec.md`. Las decisiones R1 a R17 de la v1 quedan en el historial de git (commit `046a241`). Solo **R1 (carpeta `comun/`)** sigue vigente, y se conserva tal cual.

## R1 — `comun/` (vigente desde la v1)

Ranking, editor de nombre, dispositivo, acciones, toques, tabla de ranking y pantalla completa viven en `js/minijuegos/comun/`. La réplica usa `dispositivo`, `pantalla-completa` y el formato de `ranking` (para que el hub lea el récord).

## R2 — Phaser como anfitrión y Canvas 2D del original como dibujo

- **Decisión**: Phaser 4.2.1 maneja el ciclo de vida, el loop (`update` de la escena), el escalado (`Scale.FIT` a 960 × 540) y el canvas WebGL. El mundo se dibuja en un `CanvasTexture` de Phaser (`this.textures.createCanvas`) con **el mismo código Canvas 2D del original**. Después de dibujar, se llama a `textura.refresh()` para subirla.
- **Por qué**: es la única forma de que el juego **se vea igual** que el original. Los gradientes, `roundRect`, `ellipse`, `globalCompositeOperation: 'screen'` y los trazos del original no tienen equivalente exacto en `Phaser.Graphics`.
- **Costo**: subir una textura de 960 × 540 por frame. En desktop sobra; en el celular se mide (tarea de rendimiento). La resolución del `CanvasTexture` es 960 × 540 × k, con k = min(2, devicePixelRatio) en desktop y k = 1 en táctil (equivale al `prepareCanvas` del original).
- **Alternativa descartada**: redibujar con `Graphics` y sprites de Phaser (no sería fiel).

## R3 — Traducción TS → JS del render

- **Decisión**: las funciones `render*` del original se pasan a JS con `module.stripTypeScriptTypes` de Node 25 (modo `strip`). Eso solo borra las anotaciones de tipo. Después se limpian a mano los espacios que quedan en las firmas y se revisa cada función. La lógica de dibujo no se toca.
- **Por qué**: es la traducción más fiel posible y deja código legible que se puede explicar línea por línea (Principio IV). No es un paso de build: se corre **una vez**, el resultado se commitea y se mantiene a mano desde ese momento.

## R4 — Lógica: el `sim` del original, sin React, con azar y tiempo inyectados

- **Decisión**: la función `update(dt)` del original (unas 1100 líneas) se divide por responsabilidad en `logica/` (superficie, órbita, proyectiles, daño, efectos, puntaje, motor). Cada función recibe `sim` y lo **actualiza en el lugar**, igual que el original.
- **Lo que cambia respecto del original**:
  - `Math.random()` pasa a ser `rng()`, inyectado;
  - los `setState` de React desaparecen, porque el HUD lee `sim`;
  - los sonidos se piden con `sonar(sim, 'nombreDelMetodo', ...args)`: una cola que `main.js` vacía contra el sintetizador. La lógica no toca Web Audio.
- **Por qué no inmutable** (a diferencia del acople): portar 1100 líneas de mutación a un estilo inmutable sería reescribir el juego, no replicarlo. La constitución exige que la lógica sea testeable y sin DOM, no que sea inmutable. Con el `rng` y el `dt` inyectados, cada función es determinista y se prueba con `node --test`.
- **TDD**: son **pruebas de caracterización**. Primero se escribe el test con el comportamiento del original (sacado de leer su código) y se lo ve fallar porque el módulo no existe. Después se porta el módulo hasta que pasa.

## R5 — HUD y pantallas en HTML y CSS propios

- **Decisión**: el JSX del original pasa a HTML estático en `minijuego-miller.html` más `hud.js`, que actualiza textos y anchos leyendo `sim` (cada 100 ms o cuando cambia una fase). Las clases de Tailwind se traducen a CSS propio en `css/minijuego-miller.css`, con los mismos colores (`TOKENS_HUD`), bordes, recortes `clip-path` y tipografías (Orbitron y Share Tech Mono, ya servidas por el sitio).
- **Íconos**: los de Lucide se reemplazan por símbolos tipográficos para no sumar una librería.

## R6 — Audio

- **Decisión**: la clase `SynthAudio` del original y los 3 sonidos de `gameAudio` que usa (`playPowerupChime`, `playVictoryFanfare` y `playDefeatMotif`) se portan a `audio-miller.js`, con `crear()` y `cerrar()`. La música es el mp3 del original, en loop con un `HTMLAudioElement` y su propio mute (BGM).
- **Simplificación**: el original arma un buffer de loop sin cortes (`createSeamlessLoopBuffer`). Acá se usa `audio.loop = true`, que en un ambiente de drone no se nota. Si se notara, se porta esa función.

## R7 — Correcciones de defectos del original (FR-030)

| Defecto | Evidencia en `App.tsx` | Corrección |
|---|---|---|
| Los textos flotantes y los marcadores no se desvanecen | `update` nunca descuenta `ft.life`; los textos solo se recortan al llegar a 25 | Se descuenta la vida y suben con `vy` |
| Las ondas no se expanden | `rip.radius` nunca crece | `radius += speed·dt` y se descartan al llegar a `maxRadius` |
| Dron invisible en la Fase 1 | `initGame` crea un `bio_drone`, pero la Fase 1 no lo dibuja ni lo mueve, y los proyectiles sí lo golpean | Se arranca sin enemigos en la superficie |
| 17,518 h/s | `earthHours = elapsed * 17.518` | 7 × 365,25 × 24 / 3600 = 17,045 |
| Sin etiqueta de rigor | — | `✎ Licencia narrativa` en la cuenta y en el resultado |

Todo lo demás, incluidas las rarezas inofensivas (disparar en la superficie sin enemigos, restos sin colisión, configs sin usar como `liftoffHoldDuration`), se replica tal cual.

## R8 — Hall of Fame

- **Decisión**: se guarda bajo `interstellar:minijuegos:miller:ranking` con el formato de `comun/logica/ranking.js` (`{ v: 1, entradas: [{ nombre, puntaje, ... }] }`), más los campos del original (`anos`, `rango`). Así el hub lee el #1 sin cambios.
- **Pilotos de ejemplo**: COOPER 48.500, BRAND 41.200, TARS 32.400 y CASE 24.800 aparecen en la tabla mientras no haya entradas reales. No se guardan en el almacenamiento, así el hub muestra "Sin registro" hasta la primera partida real.

## R9 — Integración con el sitio

- La página `minijuego-miller.html` vive bajo el header y el footer del sitio, en el contenedor `.juego-miller`. El juego del original ocupa toda la ventana (`fixed inset-0`); acá ocupa el alto visible debajo del header, y en táctil pasa a cabina completa (`data-cabina`, como el acople).
- La ruta de swup y la bahía 02 del hub ya están hechas en la v1 y se conservan.

## R10 — Página sin scroll y escena a pantalla completa (2026-10-09)

- **Sin scroll**: se usa la cadena flex de alto completo del hub (`body` a 100dvh sin overflow, `main` flexible y `.juego-miller` ocupando el resto). El header, el juego y el footer caben en la ventana, y el pie de secciones se oculta.
- **Pantalla completa (y cabina táctil)**: la escena ocupa todo el ancho y el alto. Las opciones eran estirar (deforma), recortar los bordes (en el shmup el Ranger se perdería contra los costados) o **ampliar el campo visible**. Se eligió la tercera: `logica/visor.js` conserva 540 de alto (o 960 de ancho) y ajusta el otro lado a la proporción de la pantalla, acotada entre 4:3 y 21:9. Las barras del HUD flotan encima con fondo translúcido. Fuera de pantalla completa sigue el lienzo original de 960 × 540.
- **Detalle de Phaser**: para cambiar el tamaño con `Scale.FIT` se usa `scale.setGameSize()`. `resize()` cambia el tamaño interno pero no recalcula el ajuste, y quedaban franjas.

## R11 — Fauna de la Fase 1, mira y disparos (2026-10-09)

- **Fauna**: el original declaraba `bio_drone`, `trench_lurker`, los estados `submerged`/`leap` y el proyectil `lurker_spit`, pero no los implementaba. El comportamiento (`logica/fauna.js`) y el arte (`render/fauna.js`) son nuevos, con el estilo del juego. Los números van en `CONFIG.fauna`.
- **Mira**: el original calculaba `crosshairX/Y` y `hasTargetLock` sin dibujarlos, y su regla (blanco a menos de 60 px de un punto fijo a 160 px) casi nunca fijaba. Se conserva esa regla, y como respaldo se suma un cono de ±50° con 320 px de alcance.
- **Disparos que no salían**: `b.x < -50 || b.y < -50 ...` se evaluaba con coordenadas de mundo. Con la baliza en y ≈ −500, cada disparo se destruía en el cuadro en que nacía. En la superficie el límite pasa a ser la vista de la cámara.
