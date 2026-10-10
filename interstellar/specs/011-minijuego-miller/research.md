# Research — Feature 011 "Miller's Wave Escape" (Misión 1)

Cada decisión resuelve una incógnita del plan. El formato es: Decisión / Por qué / Alternativas descartadas.

## R1 — Reutilización del acople: carpeta `comun/`

- **Decisión**: los módulos genéricos del acople se mueven (`git mv`) a `js/minijuegos/comun/`, y el acople, el hub y sus tests pasan a importarlos desde ahí:
  - `logica/ranking.js`, `logica/nombre-arcade.js` y `logica/dispositivo.js` ya reciben la config por parámetro. Se mueven sin cambios.
  - `logica/acciones.js` y `logica/controles-tactiles.js` hoy importan el `CONFIG` del acople como valor por defecto. Se mueven y pasan a **exigir** el mapa de teclas o la lista de acciones por parámetro. El acople les pasa los suyos.
  - `pantalla-completa.js` (glue de DOM, sin estado de juego) se mueve tal cual.
- **Por qué**: Miller necesita exactamente esas piezas (FR-017 a FR-022). Copiarlas duplica la lógica testeada, y que Miller importe desde `acople/` acopla un capítulo con otro. Mover es seguro porque los 13 tests del acople cubren todo lo que se mueve: si siguen en verde después del refactor, el acople no se rompió.
- **Alternativas**: duplicar el código en `miller/` (dos copias para mantener, y los bugs se arreglan dos veces); importar desde `../acople/` (dependencia cruzada entre capítulos).
- **Orden**: es lo **primero** que se hace y va en su propio commit (`refactor(minijuegos): ...`), antes de escribir una sola línea de Miller.

## R2 — Mundo belt-scroller: coordenadas y dirección de la ola

- **Decisión**: el mundo se mide en gpx. `x` recorre el mapa a lo largo (unos 3 anchos de pantalla, 1440 gpx), y `z` es la profundidad dentro de una franja de agua (unos 90 gpx, que en pantalla ocupan la mitad inferior). Las coordenadas de pantalla son `yPantalla = horizonte + z`, y el orden de dibujo va por `z` creciente.
  - El **Ranger** está a la izquierda del mapa y la **baliza** en el tercio derecho, generada por semilla.
  - La **ola** se revela a la derecha, sobre el horizonte, y avanza hacia la izquierda.
- **Por qué**: el jugador va **hacia** donde después va a nacer la ola y vuelve corriendo en sentido contrario. Es la tensión de la película, y en la pantalla se lee de una: la pared crece a tus espaldas. La ola barre todas las profundidades (FR-033), así que su frente es una sola coordenada `xOla`.
- **Colisiones**: los restos y el jugador son cajas en el plano (x, z). La pantalla solo proyecta. Una colisión exige que se superpongan en x **y** en z (FR-033).
- **Alternativas**: la ola desde la izquierda (el jugador iría siempre en su contra, sin escape legible); los restos con colisión solo en x (rompe la profundidad).

## R3 — Paso de simulación

- **Decisión**: un paso fijo de 1/60 s con acumulador, y `dt` acotado a 0,1 s, igual que en el acople (`pasoFijoS`, `deltaMaxS`). La lógica recibe `dt` y `rng`, y nunca lee `Date.now` ni `Math.random`.
- **Por qué**: es determinista, testeable y evita que la ola "teletransporte" (Edge Case del frame largo).

## R4 — Movimiento con arrastre del agua

- **Decisión**: `v += (dirección·aceleración − v·arrastre)·dt`, con la velocidad terminal = aceleración / arrastre. Corre igual en x y en z; z va más lento (`factorProfundidad` de 0,6), porque cambiar de carril se siente distinto que avanzar.
- **Por qué**: es la "linear viscous dampening" del prototipo, explicable línea por línea (Principio IV).

## R5 — Generación del mapa reproducible

- **Decisión**: un PRNG `mulberry32(semilla)` en `logica/azar.js`, que se inyecta como `rng`. `crearMapa(config, rng)` ubica la baliza (en una ventana de x, con cualquier z), los restos (con una distancia mínima entre sí, sin bloquear el corredor del Ranger y siempre con un hueco de paso en z) y CASE.
- **Por qué**: FR-012 y el test de balance necesitan mapas repetibles. Mulberry32 entra en 6 líneas y se explica.
- **Alternativas**: un mapa fijo a mano (no hay rejugabilidad); `Math.random` directo (prohibido por el brief y no testeable).

## R6 — Render del pixel art con Phaser 4

- **Decisión**:
  - **Sprites**: `sprites.js` es **datos puros**: mapas de caracteres por frame y la tabla `ANIMACIONES` (nombre → frames, fps, loop). En el `preload`, la escena dibuja cada frame en un canvas offscreen con la `PALETA_PIXEL` y lo registra como textura (`textures.addCanvas`), y arma las animaciones de Phaser a partir de la tabla.
  - **Escala entera**: `logica/escala.js#escalaEntera(ancho, alto, base)` devuelve `max(1, floor(min(ancho/480, alto/270)))`. El glue fija el canvas en 480 × 270 y aplica la escala con CSS (`width/height` = base × escala, `image-rendering: pixelated`), con letterbox `#0a0e1a` del contenedor.
  - **Configuración del juego**: `pixelArt: true`, `roundPixels: true`, `antialias: false`.
- **Por qué**: si el escalado no es entero, los píxeles se deforman (DesignSystem §2). Con sprites hechos en código no entra ningún archivo externo (FR-024), y como `sprites.js` no depende de Phaser, se puede testear: dimensiones parejas, índices válidos de la paleta y frames presentes.
- **Alternativas**: `Phaser.Scale.FIT` (escala fraccionaria, píxeles borrosos); PNG del Playground (violan FR-024).

## R7 — Ola: modelo lógico vs. dibujo

- **Decisión**: la lógica solo sabe `xOla`, si está revelada y su velocidad (`velHuida` al revelarse, con una aceleración leve). Oculta no se mueve, y se revela a `distanciaRevelacion` del jugador (R16). El parallax de 3 planos, la cresta, el rocío adelantado y el zoom-out de revelación son presentación, y viven en la escena.
- **Nivel de peligro**: `nivelPeligro(distanciaOla, config)` → `'lejos' | 'cerca' | 'inminente'`, con umbrales en la config. Lo usan el HUD (teal, ámbar, rojo), el mundo (desaturar) y el audio. Es la única fuente de verdad (FR-028).

## R8 — Despegue y carga

- **Decisión**: la carga sube a `1/tiempoDespegue` por segundo mientras la acción esté sostenida dentro del radio y con la baliza recogida. Al soltar, decae a `decaimientoCarga` por segundo (no vuelve a 0 de golpe). La precisión del despegue mide las interrupciones: `1 − soltadas/maxSoltadas`.
- **Prioridades del mismo paso** (Edge Cases):
  1. La baliza se recoge antes de evaluar el radio del Ranger.
  2. Si la ola alcanza al jugador y al Ranger en el mismo paso, la causa es `'jugador'`.
  3. Si la carga llega a 1 en el mismo paso que la ola alcanza, gana el despegue: el jugador ya ejecutó la acción.

## R9 — Fórmula del puntaje (0 a 10 000)

- **Decisión**: el puntaje es `round(max · Σ pesoᵢ·factorᵢ)`, con cada factor en [0, 1]:
  - `tiempo`: 1 si `t ≤ tMin` (45 s), 0 si `t ≥ tMax` (90 s), lineal en el medio. Peso **0,45**.
  - `margen`: `min(1, distanciaOlaAlDespegar / margenMax)`. Peso **0,25**.
  - `choques`: `max(0, 1 − choques / maxChoques)`. Peso **0,15**.
  - `precision`: la precisión del despegue (R8). Peso **0,15**.
- **Rango**: S ≥ 9000, A ≥ 7500, B ≥ 5000, C para el resto. Todo en `CONFIG.puntaje`. CASE no suma puntos, solo da el impulso. `CASE ASSIST` se muestra como dato en la tirada (SÍ/NO).
- **Por qué**: el tiempo pesa más (lo exige el brief) y una fórmula lineal se defiende en un oral.

## R10 — Valores iniciales de CONFIG (traídos del Playground)

El prototipo dibujaba en un canvas de unos 1280 px de ancho, así que su valor se escala ×0,375 para llegar a 480 gpx. Son **valores de arranque**: el test de balance (R11) los confirma o los ajusta.

| Parámetro del Playground | Valor | En gpx | Clave en CONFIG |
|---|---|---|---|
| playerBaseSpeed | 260 px/s | ~98 → 75 gpx/s (R16) | `jugador.aceleracion / jugador.arrastre` |
| waterDragCoeff | 4,2 | 4,2 /s | `jugador.arrastre` |
| waveSpeedBase | 40 | — (descartado, ver R16) | — |
| waveSpeedFlight | 110 | 41 → 55 gpx/s (R16) | `ola.velHuida` |
| liftoffHoldDuration | 1,2 s | 1,5 s (lo pide el brief) | `despegue.tiempo` |
| landerTriggerRadius | 95 | 36 gpx | `ranger.radio` |
| debrisObstacleCount | 18 | 18 | `restos.cantidad` |
| defaultSfxVolume | 0,75 | 0,75 | `audio.teclado.volumen` |

## R11 — Test de balance

- **Decisión**: `tests/miller-balance.test.js` corre un **piloto de referencia** (una función pura que elige acciones: ir hacia la baliza esquivando por z, recogerla, volver al Ranger, mantener la acción) sobre 20 semillas fijas con la config por defecto. Comprueba dos cosas: que gana en todas, y que tarda entre 45 y 90 s (FR-011, SC-002).
- **Por qué**: es la misma estrategia que `acople-balance.test.js`. El balance deja de ser una sensación.

## R12 — Audio

- **Decisión**: `audio-miller.js` con `crearAudioMiller(perfil)` → `{ actualizar(estadoAudio), evento(nombre), silenciar(bool), destruir() }`. Todo se sintetiza: ruido filtrado para el agua y el viento, osciladores para el pulso y el tick, y un oscilador grave más ruido con un low-pass que se abre con el nivel de peligro para la ola. Hay dos perfiles (`teclado` y `tactil`) en CONFIG, y se arranca tras el primer gesto.
- **Música del sitio**: convive igual que con el acople. La maneja `layout.js` y el juego no la toca.
- **Por qué**: FR-029. Se sigue el mismo patrón probado de `audio-acople.js`, pero no se comparte el módulo porque los sonidos son propios de cada capítulo.

## R13 — Joystick virtual → acciones digitales

- **Decisión**: `logica/joystick.js#accionesDeJoystick(dx, dy, zonaMuerta)` devuelve un subconjunto de `moverArriba`, `moverAbajo`, `moverIzquierda` y `moverDerecha` (8 direcciones). El glue (`controles-tactiles.js` de Miller) traduce los pointer events del joystick en `dx`/`dy` y los suma a los toques del botón de acción con `comun/logica/controles-tactiles.js`.
- **Por qué**: el modelo de input sigue siendo de acciones (FR-019). La física no necesita entradas analógicas, y un joystick de 8 direcciones es lo que un fichín usaría.
- **Alternativas**: entrada analógica con magnitud (le suma un segundo tipo de entrada a toda la lógica, por poca ganancia).

## R14 — Integración con el sitio

- **Página**: `minijuego-miller.html`, con la misma estructura que `minijuego-acople.html`: las 4 hojas globales + `css/minijuegos.css` (componentes de cabina compartidos) + `css/minijuego-miller.css` (todo bajo `.juego-miller`).
- **Router**: una entrada `'minijuego-miller.html': () => import('./minijuegos/miller/main.js')` en `js/swup-router.js`.
- **Hub**: la bahía 02 pasa a `data-estado="disponible"`, con enlace y `data-record-miller`. `hub.js` lee los dos rankings.
- **Phaser**: el mismo vendorizado `js/vendor/phaser@4.2.1/phaser.esm.min.js`, con `import()` dinámico y cancelable, igual que en el acople. El brief pedía CDN, pero la constitución exige el vendorizado, y manda la constitución.

## R15 — Vista de depuración de sprites

- **Decisión**: si `?debug=sprites` está en la URL, `main.js` monta una escena de galería en lugar de la partida: cada animación en loop sobre `#0a0e1a`, con su nombre. No se enlaza desde ningún lado.
- **Por qué**: FR-032. Es la forma de revisar las animaciones sin jugar.

## R16 — Lo que cambió el test de balance (2026-10-09)

El primer piloto de referencia perdió en 4 de 20 semillas, y el diagnóstico fue un **defecto de diseño**, no de números:

- **Problema**: la ola oculta se arrimaba durante la exploración hasta un tope fijo del mapa (`xMinOculta`) y se revelaba ahí. Si la baliza caía lejos (x > 2140), la ola aparecía a menos de 300 gpx del jugador y la partida estaba perdida de entrada. Las 4 derrotas eran justo las semillas con la baliza más lejana.
- **Decisión**: la ola oculta no se mueve, y al recoger la baliza se revela a `distanciaRevelacion` (520 gpx) **del jugador**. La huida es igual de justa en cualquier mapa, y tardar se paga en el factor tiempo del puntaje. Se eliminan `velExploracion` y `xMinOculta`: una regla que el jugador no puede ver es una mala regla.
- **Escala del mundo**: con 1440 gpx y 98 gpx/s una partida duraba ~28 s (menos que el mínimo de 45). Se pasa a 2400 gpx y 75 gpx/s.
- **Barrido**: se probaron distanciaRevelacion ∈ {450, 520, 600} × velHuida ∈ {45, 50, 55} × aceleración ∈ {0,8, 1,2, 1,6}. Se eligió **520 / 55 / 1,2**: gana 20/20, de 49 a 62 s, margen promedio 416 y mínimo 221. Con aceleración 1,6 el margen mínimo cae a 15 gpx, demasiado al límite para un jugador humano.
- **margenMax**: pasa de 400 a 500, porque con 400 el factor margen casi siempre saturaba en 1 y no distinguía entre jugadores.

## R17 — Vistazo de cámara en lugar de zoom-out (2026-10-09)

- **Decisión**: al revelarse la ola, la cámara se adelanta 170 gpx hacia ella durante 1,5 s y vuelve. No hay zoom.
- **Por qué**: el cielo, las nubes y el agua son capas fijas a la cámara, de 480 px de ancho. Un zoom de cámara también las escala y deja bordes vacíos a 480 × 270. Además, la banda de la ola en el horizonte ya cumple el "es una línea que no se reconoce" del DesignSystem §5.3.
- **Alternativa descartada**: escalar el canvas con CSS (rompe la escala entera de R6).
