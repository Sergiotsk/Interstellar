---
description: "Task list — 011 Miller's Wave Escape (Misión 1)"
---

# Tasks: Capítulo 2 "Miller's Wave Escape" — Misión 1

**Input**: documentos de diseño en `specs/011-minijuego-miller/` (plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md).

**Tests**: SÍ. La constitución (Principio V) exige **TDD estricto** en la lógica: cada test se escribe y se ve **fallar** antes de implementar. La escena, los overlays, el audio, el HTML y el CSS se validan por aceptación con `quickstart.md`.

**Organization**: las tareas se agrupan por historia de usuario. En spec.md, US1 y US2 son P1, US3 y US4 son P2, y US5 es P3.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede hacer en paralelo (otro archivo y sin dependencias pendientes).
- **[Story]**: historia a la que pertenece (US1…US5).
- Todas las rutas son relativas a `interstellar/`. La rama es `sec/minijuegos`.

## Path Conventions

- Lógica compartida: `js/minijuegos/comun/logica/*.js`.
- Lógica pura de Miller: `js/minijuegos/miller/logica/*.js` (sin Phaser, sin DOM, sin `Math.random` ni `Date.now`).
- Glue y presentación: `js/minijuegos/miller/{main,escena-miller,escena-galeria,overlays,audio-miller,controles-tactiles}.js`, `minijuego-miller.html` y `css/minijuego-miller.css`.
- Tests: `tests/comun-*.test.js` y `tests/miller-*.test.js` (`node --test`).
- Phaser: `js/vendor/phaser@4.2.1/phaser.esm.min.js` (vendorizado, con `import()` dinámico).
- El código lleva comentarios de una línea. El porqué largo va en `docs/20-notas-de-codigo/minijuegos-miller.md`.
- **No se copia código del prototipo** (`../mini-juego/`): se usa como referencia de ideas, números y arte.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: la página y el registro en el sitio, todavía sin juego.

- [ ] T001 Crear `minijuego-miller.html` como gemela estructural de `minijuego-acople.html`:
  - `<head>` con las 4 hojas + `css/minijuegos.css` + `css/minijuego-miller.css`, y el meta viewport con `viewport-fit=cover`;
  - `<main>` con `<h1>` visualmente oculto y una raíz `<section class="juego-miller">` que contiene el lienzo y las secciones vacías de intro, HUD, cuenta, banners, resultado, aviso de falla y aviso de giro;
  - `js/layout.js` + `js/minijuegos/miller/main.js` como módulos.
- [ ] T002 [P] Crear `css/minijuego-miller.css`, todo bajo `.juego-miller`:
  - letterbox `#0a0e1a`, el lienzo centrado con `image-rendering: pixelated` y `touch-action: none` en el área de juego;
  - las reglas de visibilidad `[data-solo="tactil"]` / `[data-solo="teclado"]`, como en el acople;
  - sin bordes redondeados y solo tokens de `css/variables.css`.
- [ ] T003 [P] En `js/swup-router.js`, agregar `'minijuego-miller.html': () => import('./minijuegos/miller/main.js')` (contrato modulo-pagina).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: ordenar la casa (R1) y armar la base de datos del juego (config, azar, escala y sprites).

**⚠️ CRITICAL**: ninguna historia empieza antes de esta fase. T004–T009 van en **un commit propio** (`refactor(minijuegos): ...`), con el acople verificado.

- [X] T004 Mover con `git mv` a `js/minijuegos/comun/`:
  - `acople/logica/{ranking,nombre-arcade,dispositivo,acciones,controles-tactiles}.js` → `comun/logica/`;
  - `acople/pantalla-completa.js` → `comun/pantalla-completa.js`;
  - renombrar `tests/acople-{ranking,nombre-arcade,dispositivo,acciones,controles-tactiles}.test.js` → `tests/comun-*.test.js` y actualizar sus imports.
- [X] T005 En `tests/comun-acciones.test.js`, agregar casos (ROJO):
  - `accionDeTecla('KeyW', { KeyW: 'x' })` → `'x'`;
  - `accionDeTecla('KeyW')` sin mapa → `null` (ya no cae en el CONFIG del acople).
- [X] T006 En `js/minijuegos/comun/logica/acciones.js`, quitar el `import` de `../config.js` y hacer obligatorio el parámetro `teclas` (T005 en VERDE).
- [X] T007 En `tests/comun-controles-tactiles.test.js`, pasar la lista de acciones válidas como parámetro: `tocar(mapa, id, accion, acciones)` ignora acciones fuera de la lista (ROJO).
- [X] T008 En `js/minijuegos/comun/logica/controles-tactiles.js`, quitar `ACCIONES_TACTILES` y el `import` del CONFIG del acople y recibir `acciones` por parámetro (T007 en VERDE).
- [X] T009 Actualizar los imports del acople y del hub:
  - `js/minijuegos/acople/{main,overlays,controles-tactiles}.js`, `js/minijuegos/acople/logica/*.js` y `js/minijuegos/hub.js` pasan a importar de `../comun/` (o `../../comun/`), y le pasan explícitamente `CONFIG.teclas` y la lista de acciones del acople;
  - ajustar los `tests/acople-*.test.js` afectados.
  - Para cerrar: `pnpm test` en VERDE y una partida manual del acople (teclado y `?entrada=tactil`) igual que antes. Después, commit.
- [X] T010 [P] Escribir `tests/miller-config.test.js` (ROJO):
  - `CONFIG` congelado en profundidad;
  - existen todas las claves de data-model;
  - `PALETA_PIXEL` tiene como máximo 20 colores y no contiene `0x4fd0e0` (sin teal en el mundo);
  - `puntaje.pesos` suma 1;
  - `rangos.S > A > B`;
  - `ranking.clave === 'interstellar:minijuegos:miller:ranking'`;
  - cada valor del mapa `teclas` es una acción válida.
- [X] T011 Crear `js/minijuegos/miller/config.js` con `CONFIG`, `PALETA_PIXEL` y `ANIM` congelados en profundidad, con los valores de data-model y research R10 (T010 en VERDE).
- [X] T012 [P] Escribir `tests/miller-azar.test.js` (ROJO):
  - la misma semilla da la misma secuencia;
  - semillas distintas dan secuencias distintas;
  - los valores caen en [0, 1).
- [X] T013 Implementar `crearRng(semilla)` (mulberry32) en `js/minijuegos/miller/logica/azar.js` (T012 en VERDE).
- [X] T014 [P] Escribir `tests/miller-escala.test.js` (ROJO):
  - 1920×1080 → 4;
  - 1366×768 → 2;
  - 800×600 → 1;
  - 300×200 → 1 (mínimo);
  - 1440×1080 → 3 (limita el ancho).
- [X] T015 Implementar `escalaEntera(ancho, alto, base)` en `js/minijuegos/miller/logica/escala.js` (T014 en VERDE).
- [X] T016 [P] Escribir `tests/miller-sprites.test.js` (ROJO). Para cada sprite:
  - todos los frames tienen el mismo alto y el mismo ancho por fila;
  - cada carácter es `.` o una clave del mapa de paleta del sprite;
  - las animaciones de `ANIMACIONES` apuntan a frames existentes;
  - `fps` entre 12 y 15;
  - el tamaño del astronauta es 16×24.
- [X] T017 Crear `js/minijuegos/miller/sprites.js` con mapas de caracteres originales y la tabla `ANIMACIONES` (T016 en VERDE):
  - astronauta: `idle`, `correr`, `agacharse`, `trofeo`, `aturdido`, `tambaleo`, `reloj`;
  - Ranger 96×40: `quieto`, `despegue`;
  - baliza: `pulso`;
  - restos: 3 variantes;
  - CASE 12×28: `quieto`, `aspa`;
  - gota y espuma.

**Checkpoint**: `comun/` funcionando, el acople sin regresiones y la base de Miller en verde.

---

## Phase 3: User Story 1 - Jugar la misión y despegar a tiempo (Priority: P1) 🎯 MVP

**Goal**: el bucle completo intro → cuenta → exploración → huida → despegue → éxito, jugable con teclado.

**Independent Test**: quickstart §2, pasos 1 a 7: completar la misión en desktop sin instrucciones.

### Tests (escribir y ver FALLAR primero) ⚠️

- [X] T018 [P] [US1] `tests/miller-mapa.test.js`:
  - la misma semilla da el mismo mapa;
  - `cantidad` restos separados por ≥ `separacionMin`;
  - ningún resto dentro del radio del Ranger;
  - en cada x hay un hueco en z ≥ `huecoMinZ`;
  - la baliza cae dentro de `ventanaX`;
  - CASE queda entre el Ranger y la baliza.
- [X] T019 [P] [US1] `tests/miller-fisica.test.js` para `moverJugador`:
  - al mantener una dirección converge a `velMax`;
  - al soltar, la velocidad decae sin invertirse;
  - z se mueve a `factorProfundidad` de x;
  - respeta los límites del mundo y de la franja;
  - aturdido no acelera;
  - `impulso` multiplica `velMax`.
- [X] T020 [P] [US1] `tests/miller-fisica.test.js` para `resolverRestos`:
  - sin superposición no hay cambio;
  - si se superponen en x pero no en z, no hay colisión;
  - con superposición, el jugador queda fuera del resto;
  - a velocidad ≥ `velChoque` → `choque: true` y `aturdidoS` cargado.
- [X] T021 [P] [US1] `tests/miller-ola.test.js`:
  - `avanzarOla` no mueve la ola oculta; `revelarOla` la ubica a `distanciaRevelacion` del jugador, y revelada acelera desde `velHuida` (R16);
  - `nivelPeligro` devuelve `lejos`/`cerca`/`inminente` en los umbrales exactos.
- [X] T022 [P] [US1] `tests/miller-baliza.test.js`:
  - `intensidadSenal` es 1 encima de la baliza y 0 a `rangoSenal` o más, y es monótona;
  - `frecuenciaPulso` va de `pulsoMinHz` a `pulsoMaxHz`;
  - `alAlcance` corta en `alcanceBaliza`.
- [X] T023 [P] [US1] `tests/miller-despegue.test.js`:
  - `enRadio` corta en el borde;
  - `cargar` sostenida llega a 1 en `tiempo` s;
  - sin sostener decae a `decaimientoCarga` sin bajar de 0;
  - pasar de sostenida a suelta con carga > 0 suma `soltadas`.
- [X] T024 [P] [US1] `tests/miller-dilatacion.test.js`:
  - 1 s ≈ 17,05 h;
  - 3600 s = 7 años;
  - `formatoTierra` descompone en años, meses y días.
- [X] T025 [US1] `tests/miller-mision.test.js` para el camino feliz:
  - `crearPartida` arranca en `intro`, y con `conIntro: false` en `cuenta`;
  - `saltarIntro` → `cuenta`;
  - la cuenta termina en `exploracion`;
  - `t` solo corre desde la exploración;
  - la acción al alcance de la baliza → `huida` + eventos `baliza` y `olaRevelada`;
  - entrar al radio → `despegue`;
  - salir → `huida`;
  - carga completa → `exito` con evento `despegue`;
  - con `pausada` nada avanza;
  - `estadoHud` devuelve el texto de cada fase;
  - `dt` grande se acota (un solo `avanzar(…, 5)` no salta fases).

### Implementación

- [X] T026 [P] [US1] Implementar `crearMapa(config, rng)` en `js/minijuegos/miller/logica/mapa.js` (T018 en VERDE).
- [X] T027 [P] [US1] Implementar `moverJugador` y `resolverRestos` en `js/minijuegos/miller/logica/fisica.js` (T019 y T020 en VERDE).
- [X] T028 [P] [US1] Implementar `avanzarOla` y `nivelPeligro` en `js/minijuegos/miller/logica/ola.js` (T021 en VERDE).
- [X] T029 [P] [US1] Implementar `intensidadSenal`, `frecuenciaPulso` y `alAlcance` en `js/minijuegos/miller/logica/baliza.js` (T022 en VERDE).
- [X] T030 [P] [US1] Implementar `enRadio` y `cargar` en `js/minijuegos/miller/logica/despegue.js` (T023 en VERDE).
- [X] T031 [P] [US1] Implementar `horasTerrestres` y `formatoTierra` en `js/minijuegos/miller/logica/dilatacion.js` (T024 en VERDE).
- [X] T032 [US1] Implementar en `js/minijuegos/miller/logica/mision.js`: `crearPartida`, `saltarIntro`, `conAcciones`, `avanzar` (acumulador de paso fijo, prioridades de R8), `pausar`, `reanudar` y `estadoHud` (T025 en VERDE).
- [X] T033 [US1] Escribir `tests/miller-balance.test.js`: un piloto de referencia (función pura de acciones) en 20 semillas fijas gana todas y tarda entre 45 y 90 s. Ajustar `config.js` hasta que pase, sin tocar los tests de las unidades.
- [ ] T034 [US1] Crear `js/minijuegos/miller/escena-miller.js` con `crearEscenaMiller(Phaser, { obtenerPartida, alAvanzar, reducirMovimiento, modo })`:
  - en `preload`, generar las texturas desde `sprites.js` + `PALETA_PIXEL` y crear las animaciones a partir de `ANIMACIONES`;
  - cielo y horizonte, la franja de agua con oleaje y los sprites ordenados por z (`setDepth(z)`);
  - la ola con 3 planos de parallax, cresta a 12 fps y rocío adelantado;
  - el zoom-out de 2 pasos al revelarse la ola;
  - la cámara: lerp de 0,1 + look-ahead hacia la ola + shake por `nivelPeligro`;
  - desaturar el mundo por nivel de peligro, sin tinte rojo;
  - un pool de partículas con tope por modo: salpicaduras, rocío y estela del despegue;
  - la anticipación y el squash/stretch del despegue del Ranger.
  - La escena **solo lee** la partida.
- [ ] T035 [US1] Crear `js/minijuegos/miller/overlays.js` con `crearOverlays(raiz, opciones)` sobre el marcado de T001:
  - lecturas del HUD en `<output>`: `SCORE`, `MISSION TIME`, `EARTH TIME LOST`, `WAVE DISTANCE` (barra de 5 bloques), `BEACON SIGNAL`, `STATUS`, la barra `LIFTOFF` y los LEDs;
  - las clases de nivel teal/ámbar/rojo;
  - la intro con frases en fade, el chip `✎ Licencia narrativa` y el botón Saltar;
  - la cuenta 3-2-1 en Orbitron con squash;
  - los banners `MISSION 02 START`, `BEACON ACQUIRED!` y `WAVE INCOMING!` con `steps(6)`;
  - el resultado básico de éxito.
  - Agregar en `css/minijuego-miller.css` los estilos de HUD, banners, cuenta e intro.
- [ ] T036 [US1] Crear `js/minijuegos/miller/main.js` con `mount()`/`unmount()` según `contracts/modulo-pagina.md`:
  - sesión cancelable e `import()` de Phaser vendorizado;
  - juego de 480×270 con `pixelArt`/`roundPixels`/`antialias: false` y escala con `escalaEntera` en el resize;
  - teclado → `comun/logica/acciones.js` con `CONFIG.teclas`, y Esc para pausar;
  - pausa automática con `visibilitychange`/`blur` + `soltarTodo` (FR-022);
  - `?semilla=N`;
  - limpieza total en `unmount`;
  - en `prefers-reduced-motion`, avisar a la escena y a los overlays.

**Checkpoint**: la misión se completa en desktop. MVP demostrable.

---

## Phase 4: User Story 2 - Perder contra la ola y reintentar (Priority: P1)

**Goal**: fracaso con causa, aturdimiento por choque y un reintento limpio.

**Independent Test**: quickstart §2, paso 8: dejar que la ola alcance al jugador y después al Ranger, ver la causa correcta y reintentar sin recargar.

- [X] T037 [US2] Ampliar `tests/miller-mision.test.js` (ROJO):
  - `xOla ≤ jugador.x` → `fracaso` con causa `'jugador'`;
  - `xOla ≤ ranger.x` con el jugador lejos → causa `'ranger'`;
  - si pasan las dos en el mismo paso → `'jugador'`;
  - carga completa en el mismo paso que alcanza la ola → `exito`;
  - un choque fuerte suma `choques` y aturde;
  - `reintentar` → `cuenta` con un mapa nuevo (otra semilla), contadores en 0 y sin intro;
  - el `resultado` de un fracaso tiene puntaje 0 y rango `null`.
- [X] T038 [US2] Implementar en `js/minijuegos/miller/logica/mision.js` la detección de fracaso con prioridades, la integración de `resolverRestos`, el `resultado` de fracaso y `reintentar` (T037 en VERDE).
- [ ] T039 [US2] En `js/minijuegos/miller/escena-miller.js`, agregar:
  - el hit-stop de 70 ms, el destello de 1 frame (máximo 3 por segundo) y el shake al chocar;
  - el aturdido con animación;
  - la muerte: tambaleo de 3 frames → la ola barre la pantalla → el frame se congela en crema.
- [ ] T040 [US2] En `js/minijuegos/miller/overlays.js` y `main.js`, agregar:
  - el sello `MISSION FAILED` con la causa en una frase en español;
  - una frase narrativa;
  - los botones **Reintentar** (llama a `reintentar` sin recargar) y **Salir** (enlace a `minijuegos.html`);
  - el foco al título del resultado.

**Checkpoint**: US1 + US2 forman el ciclo fallar → entender → reintentar.

---

## Phase 5: User Story 3 - Sentir el costo del tiempo y competir por el ranking (Priority: P2)

**Goal**: puntaje, tirada, rango, ranking con editor de nombre y récord en el hub.

**Independent Test**: quickstart §2, pasos 6 y 10: dos victorias con distinto tiempo, ordenadas en el ranking, persistentes al recargar y visibles en la bahía 02.

- [X] T041 [P] [US3] `tests/miller-scoring.test.js` (ROJO):
  - `factores`: tiempo 1 en ≤ 45 s, 0 en ≥ 90 s y lineal en el medio; margen saturado en `margenMax`; choques en 0 a partir de `maxChoques`; precisión tal cual;
  - `calcularPuntaje` dentro de 0..10 000 y entero;
  - más rápido da más puntaje (a igualdad de lo demás);
  - `rangoDe` en los bordes de S, A y B.
- [X] T042 [US3] Implementar `factores`, `calcularPuntaje` y `rangoDe` en `js/minijuegos/miller/logica/scoring.js` (T041 en VERDE).
- [X] T043 [US3] Ampliar `tests/miller-mision.test.js` (ROJO), y después implementar en `mision.js` (VERDE): el `resultado` de éxito con `tiempoMision`, `horasTerrestres`, `margenOla`, `choques`, `asistenciaCase`, `precision`, `factores`, `puntaje` y `rango`.
- [ ] T044 [US3] En `js/minijuegos/miller/overlays.js`, agregar:
  - la tirada con un tick cada 40 ms en `MISSION TIME`, `EARTH TIME LOST` (con el chip `✎ Licencia narrativa`), `WAVE MARGIN`, `CASE ASSIST` y `TOTAL`;
  - el rango estampado en naranja Gargantúa;
  - `RETRY? 9…0`, que queda en espera al llegar a 0;
  - el ranking como `<ol>` en la intro y en el resultado.
- [ ] T045 [US3] En `js/minijuegos/miller/main.js`, al ganar:
  - `posicionEnRanking`;
  - si entra al top 10, abrir el editor de `comun/logica/nombre-arcade.js` con `ultimoNombre` o `RANGER`, operado con teclado;
  - `guardarEnRanking` con el storage en `try/catch` y la config de Miller.
- [ ] T046 [US3] En `tests/minijuegos-hub.test.js`, agregar el caso del récord de Miller (ROJO). Después:
  - en `minijuegos.html`, la bahía 02 pasa a `data-estado="disponible"`, sin `aria-disabled`, con `<p class="bahia-record" data-record-miller>Sin registro</p>`, el enlace "Iniciar simulación" → `minijuego-miller.html` y el LED `DISPONIBLE`;
  - en `js/minijuegos/hub.js`, leer el ranking de Miller y pintar el #1 (VERDE).

**Checkpoint**: el capítulo tiene rejugabilidad y presencia en el hub.

---

## Phase 6: User Story 4 - Jugar en el celular en landscape (Priority: P2)

**Goal**: joystick + botón con multitouch real, aviso de giro, pantalla completa y editor táctil.

**Independent Test**: quickstart §3 en un celular real: completar la misión solo con toques, cargando el despegue mientras se corrige con el joystick.

- [X] T047 [P] [US4] `tests/miller-joystick.test.js` (ROJO):
  - dentro de la zona muerta no hay acciones;
  - con los 4 ejes puros sale una acción;
  - en diagonales salen dos;
  - el umbral de diagonal es simétrico.
- [X] T048 [US4] Implementar `accionesDeJoystick(dx, dy, zonaMuerta)` en `js/minijuegos/miller/logica/joystick.js` (T047 en VERDE).
- [ ] T049 [US4] Crear `js/minijuegos/miller/controles-tactiles.js`:
  - joystick (pointer capture, vector relativo al centro → `accionesDeJoystick`);
  - botón de acción con `comun/logica/controles-tactiles.js` y las acciones de Miller;
  - multitouch por `pointerId`;
  - `alCambiar(acciones)` combina las dos fuentes;
  - devuelve una función `desconectar`.
- [ ] T050 [US4] En `minijuego-miller.html` y `css/minijuego-miller.css`, agregar:
  - el joystick (base con grilla y nudo cuadrado biselado) y el botón de acción como tecla de consola con `--recorte-tecla` y LED teal al presionar, ambos `data-solo="tactil"`;
  - los botones ▲▼◀▶/OK del editor;
  - el botón de pantalla completa;
  - "Salir" visible en pantalla completa.
- [ ] T051 [US4] En `js/minijuegos/miller/main.js`, agregar:
  - el modo de entrada con `comun/logica/dispositivo.js` (`?entrada=`) y el perfil de partículas o audio según el modo;
  - el aviso de giro con `requiereGiro` (pausa y suelta acciones);
  - la pantalla completa con `comun/pantalla-completa.js` y su fallback;
  - el editor de nombre táctil.

**Checkpoint**: el capítulo es jugable en un celular, al nivel del acople.

---

## Phase 7: User Story 5 - CASE, el compañero (Priority: P3)

**Goal**: el impulso de 2 s al alcanzar a CASE, con su recarga y el dato en el resultado.

**Independent Test**: alcanzar a CASE y ver que la velocidad máxima sube durante 2 s y que el resultado marca `CASE ASSIST: SÍ`.

- [X] T052 [US5] Ampliar `tests/miller-mision.test.js` (ROJO):
  - entrar al radio de CASE → `impulsoS = duracionS`, evento `impulso` y `asistio = true`;
  - con recarga activa no hay impulso;
  - el impulso vence a los 2 s;
  - `asistenciaCase` queda en el resultado.
- [X] T053 [US5] Implementar el impulso de CASE en `js/minijuegos/miller/logica/mision.js`, que le pasa `{ impulso }` a `moverJugador` (T052 en VERDE).
- [ ] T054 [US5] En `js/minijuegos/miller/escena-miller.js`, agregar:
  - CASE con `quieto` y `aspa` (los bloques se separan y giran) al asistir;
  - CASE sigue al jugador durante el impulso;
  - el idle de CASE (medio giro).

---

## Phase 8: Audio (transversal, FR-029)

- [ ] T055 Crear `js/minijuegos/miller/audio-miller.js` con `crearAudioMiller(perfil)` → `{ actualizar(estado), evento(nombre), silenciar(bool), destruir() }`:
  - ambiente de agua y viento;
  - chapoteo con pitch ±10 %;
  - pulso de 2 notas según `frecuenciaPulso`;
  - arpegio al recoger la baliza;
  - rumor de la ola con un low-pass que se abre por nivel de peligro;
  - golpe de banner;
  - golpe de impacto con silencio de hit-stop;
  - tick de la tirada y acorde final;
  - rugido y barrido del despegue;
  - perfiles `teclado`/`tactil` desde CONFIG.
- [ ] T056 En `js/minijuegos/miller/main.js` y `overlays.js`:
  - crear el audio en el primer gesto;
  - llevarle los `eventos` de cada paso;
  - botón de silencio propio;
  - `destruir()` en `unmount`.

---

## Phase 9: Polish & Cross-Cutting Concerns

- [ ] T057 [P] Crear `js/minijuegos/miller/escena-galeria.js` y conectar `?debug=sprites` en `main.js`: cada animación en loop sobre `#0a0e1a` con su nombre (FR-032).
- [ ] T058 [P] Animaciones idle a los 3 s sin input en `escena-miller.js`: mirar el reloj (con `EARTH TIME LOST` parpadeando en ámbar en overlays) y sacudirse la bota.
- [ ] T059 Revisar `prefers-reduced-motion` de punta a punta:
  - sin shake, sin destellos y sin hit-stop;
  - parallax al 30 %;
  - banners con fade.
- [ ] T060 [P] Escribir `docs/20-notas-de-codigo/minijuegos-miller.md`: por qué belt-scroller, por qué `comun/`, la fórmula del arrastre, la fórmula del puntaje, la escala entera y los sprites como mapas de caracteres.
- [ ] T061 Prueba de 10 ciclos de montaje y desmontaje vía swup (quickstart §4): un canvas, sin sonidos dobles y la consola limpia.
- [ ] T062 Prueba en un celular de gama media real (quickstart §3 + SC-006). Si hay tirones, bajar el tope de partículas en táctil desde CONFIG.
- [ ] T063 Recorrer `quickstart.md` completo, incluida la §6 (el acople sin regresiones), con `pnpm test` en verde. Marcar las tareas en este archivo.

---

## Dependencies & Execution Order

- **Setup (T001–T003)** → **Foundational (T004–T017)** → historias.
- T004 → T005–T009 en orden: es el refactor, y cierra con su commit propio.
- **US1 (T018–T036)**: bloquea a todas las demás, porque la página jugable es la base.
- **US2 (T037–T040)**: depende de US1.
- **US3 (T041–T046)** y **US4 (T047–T051)**: dependen de US1 y pueden ir en paralelo entre sí (la lógica no se toca, el glue sí). Si se hacen en serie, conviene US3 antes de US4, porque el editor táctil de T051 usa el flujo de T045.
- **US5 (T052–T054)**: depende de US1. Es lo primero que se recorta si el tiempo aprieta.
- **Audio (T055–T056)**: depende de US1, y conviene hacerlo después de US2 (eventos de fracaso).
- **Polish**: al final.

## Parallel Examples

- Foundational: T010, T012, T014 y T016 (tests de config, azar, escala y sprites) en paralelo, después del refactor.
- US1: los tests T018–T024 en paralelo, y después las implementaciones T026–T031 en paralelo. T025/T032 (misión) espera a todas.
- US3/US4: T041 y T047 en paralelo.

## Implementation Strategy

1. **MVP = Setup + Foundational + US1**: la misión jugable en desktop. Se puede mostrar.
2. **+ US2**: el ciclo de reintento. Es el mínimo para entregar como capítulo.
3. **+ US3 + US4**: ranking, hub y mobile, al nivel del acople.
4. **+ Audio + US5 + Polish**: la experiencia completa.

Hay commits por fase como mínimo, con conventional commits `feat(minijuegos)` / `refactor(minijuegos)` / `test(minijuegos)` y sin atribución de IA.
