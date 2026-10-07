---
description: "Task list — 009 Hub de Minijuegos + acople"
---

# Tasks: Hub de Minijuegos + Capítulo 1 "No Time for Caution"

**Input**: documentos de diseño en `specs/009-minijuegos-acople/` (plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md).

**Tests**: SÍ. La constitución (Principio V) exige **TDD estricto** en la lógica: cada test de `tests/acople-*.test.js` se escribe y se ve **fallar** antes de implementar su módulo. La presentación (HTML, CSS, escena Phaser, overlays) se valida por aceptación con `quickstart.md`.

**Organization**: las tareas se agrupan por historia de usuario (spec.md: US1 y US2 son P1, US3 y US4 son P2, US5 es P3).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede hacer en paralelo (otro archivo y sin dependencias pendientes).
- **[Story]**: historia a la que pertenece (US1…US5).
- Todas las rutas son relativas a `interstellar/`.

## Path Conventions

- Lógica pura: `js/minijuegos/acople/logica/*.js` (sin Phaser y sin DOM).
- Presentación: `js/minijuegos/acople/{main,escena-acople,overlays,audio-acople}.js` y `js/minijuegos/hub.js`.
- Tests: `tests/acople-*.test.js` (`node --test`, `import { describe, test } from 'node:test'` + `node:assert/strict`, igual que `tests/filmstrip.test.js`).
- Comentarios del código: de una línea. El porqué largo va en `docs/20-notas-de-codigo/`. Nunca poner `*/` dentro de un comentario CSS.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: archivos base que no dependen de ninguna historia.

- [X] T001 Crear `css/minijuegos.css`: comentario de cabecera de una línea (hoja propia de Minijuegos, carga después de reset → variables → base → layout) y la utilidad `.visualmente-oculto` (patrón clip/1px, porque no existe en el sitio). Por ahora no lleva más reglas.
- [X] T002 [P] Agregar en `sitemap.xml` una entrada `<url>` para `https://sergiotsk.github.io/Interstellar/minijuego-acople.html`, con el mismo formato que la de `minijuegos.html`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: los módulos de lógica pura que usan todas las historias de juego (US1, US2, US4) y el hub (US3). Contrato: `contracts/logica-acople.md`. Datos: `data-model.md`.

**⚠️ CRITICAL**: ninguna historia empieza antes de que esta fase esté en verde con `pnpm test`.

- [X] T003 [P] Test (rojo) `tests/acople-config.test.js`:
  - la suma de `CONFIG.puntaje.pesos` es 1 (con tolerancia de 1e-9);
  - cada `CONFIG.peligro.*` es mayor que su `CONFIG.tol.*`;
  - `rangoAcople < zonaCercana < distanciaInicial`;
  - `CONFIG` está congelado;
  - `CONFIG.teclas` mapea `ArrowLeft`, `ArrowRight`, `ArrowUp` y `Space` a las 4 acciones;
  - `CONFIG.record.clave === 'interstellar:minijuegos:acople:best'`.
- [X] T004 Implementar `js/minijuegos/acople/config.js`: `export const CONFIG = Object.freeze({...})`, con la forma exacta de `contracts/logica-acople.md` (nombres, teclas, pasoFijoS = 1/60, deltaMaxS = 0.1, estacion, nave, distancias, tol, peligro, limiteControl, margenSinControl, combustible, puntaje con max 10000 / tMin 30 / tMax 90 / pesos, record). Los valores numéricos iniciales son razonables y se ajustan en T020. Freezar también los objetos anidados.
- [X] T005 [P] Test (rojo) `tests/acople-acciones.test.js`:
  - `accionDeTecla` devuelve la acción para las 4 teclas y `null` para cualquier otra;
  - `presionar` y `soltar` devuelven un Set **nuevo** sin mutar el de entrada;
  - `soltarTodo()` devuelve un Set vacío.
- [X] T006 Implementar `js/minijuegos/acople/logica/acciones.js` (`accionDeTecla`, `presionar`, `soltar`, `soltarTodo`) según el contrato (R8).
- [X] T007 [P] Test (rojo) `tests/acople-fisica.test.js`:
  - `crearNave` y `crearEstacion` toman sus valores de CONFIG;
  - `rotarIzquierda` y `rotarDerecha` cambian `velAngular` en sentidos opuestos;
  - `impulso` sube `velAproximacion` y `freno` la baja (puede quedar negativa);
  - el combustible baja según las acciones activas · dt y nunca queda < 0;
  - con `combustible === 0` las acciones no tienen efecto;
  - la estación avanza `angulo += velAngular·dt`;
  - `distancia` se clampa en 0;
  - la función es pura (no muta la entrada).
- [X] T008 Implementar `js/minijuegos/acople/logica/fisica.js` (`crearNave`, `crearEstacion`, `pasoFisica`) según el contrato y `data-model.md`: modelo de 2 ejes de R2, con fricción angular leve.
- [X] T009 [P] Test (rojo) `tests/acople-docking.test.js`:
  - `normalizarAngulo` cae en (−π, π] para ±3π, 2π y 0;
  - `deltaTheta` está en [0, π] y es simétrico;
  - `evaluarSincronia` marca `seguro` y `peligro` según tol/peligro, y `enRango` según `rangoAcople`;
  - `evaluarContacto` da `{exito:false, causa:'impacto'}` con velocidad > tol;
  - `evaluarContacto` da `causa:'angulo'` con deltaTheta o deltaOmega > tol;
  - `evaluarContacto` da `{exito:true}` con todo en tolerancia;
  - el impacto tiene prioridad sobre el ángulo.
- [X] T010 Implementar `js/minijuegos/acople/logica/docking.js` (`normalizarAngulo`, `deltaOmega`, `deltaTheta`, `evaluarSincronia`, `evaluarContacto`).
- [X] T011 [P] Test (rojo) `tests/acople-record.test.js`, con un storage fake (objeto con `getItem`/`setItem`):
  - si no hay nada guardado, devuelve `null`;
  - si hay JSON inválido, `v !== 1` o un `puntaje` negativo, decimal o `Infinity`, devuelve `null`;
  - si el storage lanza en `getItem`, devuelve `null` sin lanzar;
  - si `storage` es `undefined`, devuelve `null`;
  - `guardarSiMejor` guarda si no hay récord o si el puntaje nuevo es mayor, y no guarda si es igual o menor;
  - con desenlace fallido (`puntaje: null`) no guarda;
  - si el storage lanza en `setItem`, devuelve `{guardado:false}` sin lanzar;
  - la `fecha` usa el `ahora` inyectado.
- [X] T012 Implementar `js/minijuegos/acople/logica/record.js` (`leerRecord`, `guardarSiMejor`) según R13, con el storage inyectado y todo en try/catch.

**Checkpoint**: `pnpm test` en verde. La lógica base está lista.

---

## Phase 3: User Story 1 — Jugar y completar el acople (Priority: P1) 🎯 MVP

**Goal**: entrar al simulador, ver la intro, controlar la nave con el teclado, leer el HUD y acoplar con éxito viendo las estadísticas y el puntaje.

**Independent Test**: `quickstart.md` §2, pasos 1 a 4 (sin récord: eso es US4).

### Tests for User Story 1 ⚠️ (escribir primero y verlos fallar)

- [X] T013 [P] [US1] Test (rojo) `tests/acople-scoring.test.js`:
  - `factores` devuelve los 5 valores en [0,1] según las fórmulas de `data-model.md` §Puntaje;
  - debajo de `tMin` el factor tiempo es 1 y arriba de `tMax` es 0;
  - `suavidad` vale 1 si `tiempoEnRango = 0`;
  - `calcularPuntaje` da un entero ≥ 0 y ≤ `CONFIG.puntaje.max`;
  - es determinístico (misma entrada, misma salida);
  - un desempeño perfecto da `max`.
- [X] T014 [P] [US1] Test (rojo) `tests/acople-mision.test.js`, camino feliz:
  - `crearPartida(CONFIG,{conIntro:true})` arranca en fase `'intro'` y `iniciar` la pasa a `'en-curso'`;
  - `crearPartida(..., {conIntro:false})` arranca en `'en-curso'`;
  - `conAcciones` se ignora fuera de `'en-curso'`;
  - `avanzar` aplica pasos fijos de `pasoFijoS` y recorta un `dtReal` de 5 s a `deltaMaxS`;
  - `tiempo` solo se acumula en `'en-curso'`;
  - una partida preparada en tolerancia que llega a distancia 0 pasa a `'acoplada'`, con `desenlace.exito === true` y `puntaje` entero;
  - un contacto con velocidad alta pasa a `'fallida'` con causa `'impacto'`;
  - `estadoHud` devuelve cada uno de los 6 estados con la prioridad de `data-model.md` (un caso por estado).
- [X] T015 [P] [US1] Test (rojo) `tests/acople-balance.test.js`: un "piloto de referencia" escrito en el test (política: primero llevar `deltaOmega` a ~0 con rotar; después corregir `deltaTheta`; después impulsar hasta una velocidad objetivo menor que `tol.velocidad` y frenar al entrar en `zonaCercana`) simula con `avanzar` a paso de 1/60 s. Exige `desenlace.exito === true` y `30 ≤ tiempoTotal ≤ 90`.

### Implementation for User Story 1

- [X] T016 [US1] Implementar `js/minijuegos/acople/logica/scoring.js` (`factores`, `calcularPuntaje`) para que T013 pase.
- [X] T017 [US1] Implementar `js/minijuegos/acople/logica/mision.js` (`crearPartida`, `iniciar`, `conAcciones`, `avanzar`, `estadoHud`), con el acumulador de paso fijo sobre `pasoFisica`. Al llegar `distancia` a 0 usa `evaluarContacto` y fija `desenlace` (con `puntaje` vía scoring si hubo éxito y `null` si falló). Lleva `tiempoEnRango` y `tiempoEnRangoSeguro`. Las causas `control` y `combustible` quedan para US2. T014 tiene que pasar.
- [X] T018 [US1] Crear `minijuego-acople.html` según `contracts/integracion-sitio.md` §2:
  - `<head>` igual a `minijuegos.html` (meta, preload de fuentes, favicons) con hojas reset → variables → base → layout → minijuegos;
  - `<body class="pagina-acople">`, `<main>` con `section[data-acople]`, `h1.visualmente-oculto`, `[data-acople-lienzo]` con `tabindex="-1"` y las 5 `[data-pantalla]` (intro, hud, pausa, resultado, aviso), todas `hidden`;
  - textos de la intro en español con frases cortas ("AÑO 2067" / "La Tierra se muere." / "La Endurance gira." / "Sincronizá. Acercate despacio. Acoplá.") y botón Saltear;
  - etiquetas del HUD en inglés;
  - scripts `js/layout.js` y `js/minijuegos/acople/main.js` como `type="module"`.
- [X] T019 [US1] Estilos del simulador en `css/minijuegos.css`:
  - `.acople` ocupa el viewport disponible bajo el header y el lienzo va a pantalla completa de la sección;
  - overlays posicionados sobre el lienzo;
  - HUD estilo computadora de navegación: `--font-instrumento`, líneas finas, `--instrumento-teal` como acento, `--led-ambar` y `--led-alerta` para los estados, `--color-texto` para el texto;
  - modificadores de estado `.acople-estado[data-nivel="seguro|atencion|peligro"]`;
  - intro con fades por CSS;
  - resultado con `<dl>` y botones con el estilo de tecla del sitio (`--recorte-tecla`);
  - solo tokens de `variables.css`, sin hex sueltos.
- [X] T020 [US1] Ajustar los valores de `js/minijuegos/acople/config.js` hasta que T015 (balance) pase sin tocar la política del piloto. Correr `pnpm test` completo.
- [X] T021 [US1] Implementar `js/minijuegos/acople/overlays.js` (solo DOM, recibe el contenedor `[data-acople]`):
  - `mostrarPantalla(nombre)` deja visible solo esa `[data-pantalla]`, y además el HUD si el nombre es `'hud'` o `'pausa'`;
  - `pintarHud(partida, estado, config)` actualiza Rotation Sync, Relative Velocity, Distance y Fuel. El texto de estado y `data-nivel` cambian **solo cuando cambia el estado**, para no saturar el `aria-live`;
  - `pintarResultado(desenlace)` muestra el título "Acople completo" y la `<dl>` con tiempo, combustible, velocidad final, precisión y puntaje, y pone el foco en el `h2`.
- [X] T022 [US1] Implementar `js/minijuegos/acople/escena-acople.js`: una clase que extiende `Phaser.Scene`. Phaser se recibe por parámetro de una fábrica `crearEscenaAcople(Phaser, { obtenerPartida, alAvanzar, paleta, reducirMovimiento })`, así que el módulo no importa Phaser y lo lee de lo que le pasan.
  - `update(time, delta)` llama a `alAvanzar(delta/1000)` y después dibuja el estado.
  - Campo estelar procedural rotado por `−nave.angulo` (sin rotar si `reducirMovimiento`).
  - Estación: un anillo con puerto y ranura dibujados con `Graphics`, rotada por `estacion.angulo + anguloPuerto − nave.angulo` y escalada según `distancia` (más cerca, más grande).
  - Silueta de la nave fija en primer plano, con su marca de enganche.
  - Partículas: RCS laterales al rotar y motor o retro al impulsar o frenar.
  - Color del anillo y de la marca según el nivel del HUD (teal / ámbar / rojo de `paleta`).
  - Vibración leve de la cámara en UNSAFE y sacudida en el impacto, con intensidad 0 si `reducirMovimiento`.
  - Escalado con `Scale.RESIZE`.
  - Consultar la API de Phaser 4 con context7 antes de escribir.
- [X] T023 [US1] Implementar `js/minijuegos/acople/main.js`, versión mínima jugable:
  - `export async function mount()` y `export function unmount()`, con autoinicialización si `!window.__SWUP_ROUTER_ACTIVE__` (patrón de `js/galeria.js`).
  - `mount`:
    1. busca `[data-acople]` y sale si no existe;
    2. lee la paleta de los tokens con `getComputedStyle(document.documentElement)` (`--instrumento-teal`, `--led-ambar`, `--led-alerta`, `--color-texto`, `--color-fondo`);
    3. lee `matchMedia('(prefers-reduced-motion: reduce)')`;
    4. muestra la pantalla `'intro'` y crea la partida con `conIntro:true`;
    5. importa Phaser desde `https://cdn.jsdelivr.net/npm/phaser@4.2.1/dist/phaser.esm.min.js` (prototipo pinneado, R1) y crea el `Game` con `type: AUTO`, `parent` = `[data-acople-lienzo]` y `scale.mode: RESIZE`, más la escena.
  - Listeners nativos de `keydown`/`keyup` en `window` que mapean con `accionDeTecla`. Hacen `preventDefault()` solo en teclas mapeadas y solo en fase `'en-curso'`.
  - Saltear la intro con una tecla, un clic o el botón llama a `iniciar` y muestra el `'hud'`.
  - Por tick: `avanzar`, `pintarHud(estadoHud)`. Al pasar a `'acoplada'` o `'fallida'`, `pintarResultado` y mostrar el `'resultado'`.
  - `unmount` es idempotente: `game.destroy(true)`, remueve los listeners y anula las referencias.
- [X] T024 [US1] En `js/swup-router.js`: agregar `'minijuego-acople.html': () => import('./minijuegos/acople/main.js')` a `PAGE_MODULES` y `'css/minijuegos.css'` a `HOJAS_ESTILO_SITIO`.
- [ ] T025 [US1] Validar `quickstart.md` §2, pasos 1 a 4, en el navegador (`python -m http.server 8080`). Corregir hasta que se cumplan: la estación queda quieta al sincronizar, hay 2 canales visuales de peligro además del texto (FR-022), consola limpia, y las flechas y Space no hacen scroll durante la partida.

**Checkpoint**: el MVP jugable está completo. Se puede acoplar y ver el puntaje.

---

## Phase 4: User Story 2 — Fallar, entender por qué y reintentar (Priority: P1)

**Goal**: las 4 causas de fallo se detectan y se nombran en español, y "Reintentar" arranca una partida limpia sin intro en menos de 2 s.

**Independent Test**: `quickstart.md` §3.

### Tests for User Story 2 ⚠️

- [ ] T026 [P] [US2] Ampliar `tests/acople-mision.test.js` (rojo):
  - con `|velAngular| > limiteControl` sostenido más de `margenSinControl`, la partida pasa a `'fallida'` con causa `'control'`;
  - si baja antes del margen, el contador se resetea;
  - `combustible === 0 && velAproximacion ≤ 0` lleva a causa `'combustible'`;
  - `combustible === 0` acercándose no falla hasta el contacto, y ahí se juzga por `evaluarContacto`;
  - todo fallo tiene `puntaje: null` y las estadísticas completas (FR-026);
  - `reintentar` devuelve una partida nueva en `'en-curso'` (sin intro) con las variables iniciales.
- [ ] T027 [P] [US2] Ampliar `tests/acople-balance.test.js` (rojo): una política torpe (impulso constante, sin rotar) termina en `'fallida'`.

### Implementation for User Story 2

- [ ] T028 [US2] Completar `js/minijuegos/acople/logica/mision.js`: el contador `tiempoSinControl`, las causas `control` y `combustible`, y `reintentar(partida, config)`. T026 y T027 tienen que pasar.
- [ ] T029 [US2] En `js/minijuegos/acople/overlays.js`: un mapa `CAUSAS` → texto en español:
  - impacto → "Impacto a velocidad excesiva";
  - ángulo → "Ángulo de entrada incorrecto";
  - control → "Pérdida de control";
  - combustible → "Sin combustible".

  `pintarResultado` muestra "Misión fallida", la causa y las estadísticas sin puntaje.
- [ ] T030 [US2] En `js/minijuegos/acople/main.js`: el botón `[data-accion="reintentar"]` llama a `reintentar`, muestra el `'hud'`, enfoca el lienzo y reinicia la escena **sin** volver a importar Phaser ni recrear el `Game`. También se reintenta con Enter o R estando en el resultado.
- [ ] T031 [US2] En `js/minijuegos/acople/escena-acople.js`: una reacción visual al fallo. En el impacto, un destello en `--led-alerta` y la sacudida (respetando `reducirMovimiento`). En la pérdida de control, la nave queda girando.
- [ ] T032 [US2] Validar `quickstart.md` §3: las 4 causas, Reintentar en menos de 2 s y el récord intacto tras un fallo.

**Checkpoint**: US1 y US2 juntas son el ciclo completo de juego.

---

## Phase 5: User Story 3 — Hub de misiones con récord y capítulos bloqueados (Priority: P2)

**Goal**: `minijuegos.html` pasa a ser un mapa de misiones semántico, con 4 bahías, el récord de la bahía 1 y sin memes.

**Independent Test**: `quickstart.md` §1.

### Tests for User Story 3 ⚠️

- [ ] T033 [P] [US3] Test (rojo) `tests/minijuegos-hub.test.js` para la función pura `textoRecord(record)` exportada por `js/minijuegos/hub.js`. Devuelve `'Sin registro'` si es `null`; si hay récord, el puntaje formateado con separador de miles es-AR más " pts" (por ejemplo `'7.421 pts'`).

### Implementation for User Story 3

- [ ] T034 [US3] Mudar el bloque "4. Bahías de Minijuegos" de `css/en-desarrollo.css` a `css/minijuegos.css` (incluidos sus media queries del §5 si los hay) y actualizar el comentario de cabecera de `en-desarrollo.css` (queda "viaje.html + terminal de memes"). En `minijuegos.css`, sumar:
  - el encabezado `.minijuegos-intro`;
  - la grilla como `<ol>` sin viñetas;
  - `h3` en la tarjeta;
  - `.bahia-record`;
  - `.bahia-accion`, con estilo de tecla y foco visible;
  - `[data-estado="bloqueada"]`, atenuada y con LED apagado;
  - el modo responsive, con las tarjetas apiladas a 320 px.
- [ ] T035 [US3] Rehacer `minijuegos.html` según `contracts/integracion-sitio.md` §1:
  - quitar la `.meme-seccion` y el link a `css/en-desarrollo.css`, y agregar `css/minijuegos.css` después de `cielo.css`;
  - `section.minijuegos-intro` con el `h1`;
  - la sección de bahías con `h2` y `<ol class="minijuegos-bahias-grid">` de 4 `<li><article class="bahia-card" data-mision data-estado>`;
  - reutilizar los textos de las 4 tarjetas que hoy están comentadas, pasando `h2` a `h3`, cambiando "a 67 RPM" por "en rotación descontrolada" (R10) y sacando las bahías 2 a 4 del foco: sin `<a>` ni `tabindex`, con `aria-disabled="true"` y "Próximamente";
  - la bahía 1 lleva `<p class="bahia-record" data-record-acople>Sin registro</p>` y `<a class="bahia-accion" href="minijuego-acople.html">Iniciar simulación</a>`;
  - el script `js/minijuegos/hub.js` reemplaza a `js/meme-viewer.js`;
  - actualizar la `meta description`, porque deja de estar "en construcción".
- [ ] T036 [US3] Implementar `js/minijuegos/hub.js`: `textoRecord` (T033 en verde), `mount()` que lee con `leerRecord(globalThis.localStorage, CONFIG)` y escribe en `[data-record-acople]`, `unmount()` como noop, y la autoinicialización si `!window.__SWUP_ROUTER_ACTIVE__`.
- [ ] T037 [US3] En `js/swup-router.js`, cambiar `'minijuegos.html': () => import('./meme-viewer.js')` por `() => import('./minijuegos/hub.js')`. `viaje.html` sigue con `meme-viewer.js`.
- [ ] T038 [US3] Validar `quickstart.md` §1: las 4 bahías, el orden de tabulación, que Network no muestre Phaser y los 320 px sin scroll horizontal.

**Checkpoint**: el hub funciona solo. Con un récord cargado a mano en localStorage, se ve el puntaje.

---

## Phase 6: User Story 4 — Superar el propio récord (Priority: P2)

**Goal**: al acoplar, se guarda el récord si es mejor, se anuncia "Nuevo récord" y el hub lo refleja.

**Independent Test**: `quickstart.md` §2, pasos 4 a 6.

### Implementation for User Story 4

- [ ] T039 [US4] En `js/minijuegos/acople/main.js`: al pasar a `'acoplada'`, llamar a `guardarSiMejor(desenlace, globalThis.localStorage, CONFIG)` y pasarle el resultado `{guardado, record}` a `pintarResultado`.
- [ ] T040 [US4] En `js/minijuegos/acople/overlays.js`: `pintarResultado(desenlace, infoRecord)` muestra "Nuevo récord" si `guardado` es true y, si no, el récord vigente junto al puntaje. Si el storage no está disponible (`record === null` y `guardado === false`), no muestra nada de récord y no da error.
- [ ] T041 [US4] Validar `quickstart.md` §2, pasos 4 a 6 (nuevo récord, recarga del hub y una partida peor que no lo pisa). Además, en una ventana privada con el storage bloqueado, el juego sigue sin errores.

**Checkpoint**: el incentivo de rejugabilidad está completo.

---

## Phase 7: User Story 5 — Convivir con el sitio: navegación, música y mobile (Priority: P3)

**Goal**: la música del sitio se silencia en el simulador y vuelve al salir. El simulador tiene audio propio con mute, pausa por foco, aviso en mobile, movimiento reducido y cero fugas con swup.

**Independent Test**: `quickstart.md` §4 y §5.

### Tests for User Story 5 ⚠️

- [ ] T042 [P] [US5] Test (rojo) en `tests/musica-mobile.test.js`: `rutaSinMusica` exportada por `js/layout.js` es `true` para `'trailer.html'` y `'minijuego-acople.html'`, y `false` para `'index.html'`, `'minijuegos.html'` y `'mundos-tierra.html'`.
- [ ] T043 [P] [US5] Test (rojo) `tests/acople-dispositivo.test.js`: la tabla de verdad completa de `debeMostrarAvisoDesktop`, donde solo `{punteroGrueso:true, algunPunteroFino:false}` da `true`.
- [ ] T044 [P] [US5] Ampliar `tests/acople-mision.test.js` (rojo):
  - `pausar` desde `'en-curso'` pasa a `'pausada'` y vacía las acciones;
  - `avanzar` en `'pausada'` no cambia la física;
  - `reanudar` vuelve a `'en-curso'`;
  - `pausar` fuera de `'en-curso'` no tiene efecto.

### Implementation for User Story 5

- [ ] T045 [US5] En `js/layout.js` (R5):
  - exportar `rutaSinMusica(archivo)`;
  - en `sincronizarAudioRuta` y en `initMusicaFondo`, reemplazar las comparaciones `archivo === 'trailer.html'` y la variable `esTrailer` por `rutaSinMusica(archivo)`;
  - renombrar `muteadoPorTrailer` a `muteadoPorRuta`;
  - actualizar el comentario de una línea.

  T042 y los tests existentes de música tienen que seguir en verde.
- [ ] T046 [US5] Implementar `js/minijuegos/acople/logica/dispositivo.js` (`debeMostrarAvisoDesktop`), con T043 en verde. Agregar `pausar` y `reanudar` a `js/minijuegos/acople/logica/mision.js`, con T044 en verde.
- [ ] T047 [US5] En `js/minijuegos/acople/main.js`: antes del `import()` de Phaser, evaluar `debeMostrarAvisoDesktop` con `matchMedia('(pointer: coarse)')` y `matchMedia('(any-pointer: fine)')`. Si da `true`, mostrar la pantalla `'aviso'` y **no** importar Phaser.
- [ ] T048 [US5] Implementar `js/minijuegos/acople/audio-acople.js` (R6):
  - `crearAudioAcople()` devuelve `{ reanudar(), actualizar(estado, acciones), evento(nombre), setMute(bool), cerrar() }`;
  - `AudioContext` creado de forma perezosa en el primer `reanudar()` (gesto);
  - un `GainNode` maestro;
  - ambiente: drone con 2 osciladores;
  - propulsores: ruido filtrado con la ganancia según las acciones activas;
  - advertencia: pitido intermitente mientras el estado es UNSAFE;
  - eventos `'impacto'` (golpe de ruido corto) y `'acople'` (acorde breve);
  - mute guardado en `sessionStorage` `interstellar:minijuegos:mute` con try/catch;
  - `cerrar()` hace `ctx.close()`.
- [ ] T049 [US5] Conectar el audio en `js/minijuegos/acople/main.js` y en `minijuego-acople.html`:
  - `reanudar()` en el primer keydown o clic;
  - `actualizar` en cada tick;
  - `evento` al acoplar o al fallar por impacto;
  - el botón `[data-accion="mute"]` alterna `setMute` y `aria-pressed` sin tocar el interruptor de música del header (FR-032);
  - `cerrar()` en `unmount`.
- [ ] T050 [US5] Pausa por foco en `js/minijuegos/acople/main.js`: con `visibilitychange` (oculto) y `blur` de `window` durante `'en-curso'`, llamar a `pausar` y mostrar el overlay `'pausa'`. Con keydown o clic en pausa, `reanudar`. Esos listeners se remueven en `unmount`.
- [ ] T051 [US5] Endurecer `unmount` en `js/minijuegos/acople/main.js` (R12):
  - un flag `montajeId` / cancelado que se revisa **después** del `await import()`, para descartar un montaje obsoleto;
  - `mount()` llama primero a `unmount()`;
  - destruye en este orden: `game.destroy(true)`, los listeners (teclado, visibilidad, blur, botones), `audio.cerrar()` y anula las referencias;
  - es idempotente si se llama dos veces.
- [ ] T052 [US5] Movimiento reducido en `css/minijuegos.css`: `@media (prefers-reduced-motion: reduce)` desactiva los fades y las animaciones de la intro y del resultado. Verificar que `escena-acople.js` respeta `reducirMovimiento` (campo estelar sin rotación y sacudida en 0).
- [ ] T053 [US5] Validar `quickstart.md` §4 y §5:
  - la música se pausa y se restaura en los dos sentidos;
  - 10 ciclos sin recargar con exactamente 1 canvas y consola limpia;
  - salir durante la descarga de Phaser con "Slow 4G";
  - el mute independiente;
  - la pausa al cambiar de pestaña sin propulsor trabado;
  - el resize sin reiniciar;
  - el aviso en el emulador de mobile sin Phaser en Network;
  - el movimiento reducido.

**Checkpoint**: las 5 historias quedan completas e integradas.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T054 Vendorizar Phaser:
  - descargar `https://cdn.jsdelivr.net/npm/phaser@4.2.1/dist/phaser.esm.min.js` a `js/vendor/phaser@4.2.1/phaser.esm.min.js`;
  - cambiar el import en `js/minijuegos/acople/main.js` a `'../../vendor/phaser@4.2.1/phaser.esm.min.js'` (es relativo al módulo: ojo con `../` vs `./`);
  - verificar en Network que no queden requests a CDN.
- [ ] T055 [P] Documentar Phaser en `js/vendor/README.md` → "Contenido actual", con el mismo formato que GSAP: el archivo, el peso (1.377.611 B, ~345 KB gzip), el problema que resuelve, por qué no se usa nativo, que carga solo en `minijuego-acople.html` vía `import()`, la degradación (si el import falla, mensaje en el overlay de aviso) y el origen reproducible (jsDelivr npm `dist/phaser.esm.min.js`).
- [ ] T056 [P] Escribir `docs/20-notas-de-codigo/minijuegos-acople.md` con el porqué largo:
  - el modelo de 2 ejes y la vista desde la cabina (R2);
  - una escena más overlays DOM (R3);
  - el paso fijo (R4);
  - el silencio por ruta (R5);
  - el ciclo de vida y la cancelación del import (R12);
  - cómo sumar una misión nueva (FR-041).
- [ ] T057 [P] Actualizar `docs/00-backlog/BACKLOG.md`: tachar "Vendorizar Phaser" (hecho), destrabar el ítem del README "Stack real" en lo que toca a Phaser, y anotar una entrada en la Bitácora con fecha.
- [ ] T058 [P] Actualizar `DESIGN.md` con los componentes nuevos: tarjeta de bahía (disponible/bloqueada), HUD de navegación y overlays del simulador, con los tokens que usan.
- [ ] T059 Prueba con 3 o más personas (`quickstart.md` §6). Si no se llega a la meta de SC-001, ajustar `js/minijuegos/acople/config.js` y volver a correr `pnpm test` (el balance tiene que seguir en verde).
- [ ] T060 Cierre:
  - `pnpm test` completo en verde;
  - recorrer `quickstart.md` §0 a §7;
  - validar el HTML de `minijuegos.html` y `minijuego-acople.html` (validador W3C);
  - confirmar el orden de las hojas, las rutas relativas y la consola limpia en las dos páginas;
  - revisar contra los 6 principios de la constitución.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (F1)**: no tiene dependencias.
- **Foundational (F2)**: depende de F1. **Bloquea** a todas las historias.
- **US1 (F3)**: depende de F2.
- **US2 (F4)**: depende de US1, porque extiende `mision.js`, `overlays.js` y `main.js`.
- **US3 (F5)**: depende solo de F2 (`record.js` y `config.js`). Se puede hacer **en paralelo** con US1 y US2.
- **US4 (F6)**: depende de US1, que es donde se acopla.
- **US5 (F7)**: depende de US1. T042, T043, T045 y T046 (parte de dispositivo) se pueden adelantar después de F2.
- **Polish (F8)**: depende de todas.

### Within Each User Story

- El test en rojo va antes de la lógica, y la lógica antes de la presentación.
- `overlays.js` y `escena-acople.js` antes de `main.js`, que los conecta.
- Cada historia cierra con su validación del quickstart.

### Parallel Opportunities

- F2: los tests T003, T005, T007, T009 y T011 son todos [P], en archivos distintos. Cada implementación sigue a su test.
- F3: T013, T014 y T015 [P]. Después, T018 (HTML), T019 (CSS), T021 (overlays) y T022 (escena) tocan archivos distintos y pueden ir en paralelo una vez que pasó T017.
- US3 completa en paralelo con US1 y US2.
- F7: T042, T043 y T044 [P].
- F8: T055, T056, T057 y T058 [P].

---

## Parallel Example: User Story 1

```text
# Tests en rojo, juntos:
T013 tests/acople-scoring.test.js
T014 tests/acople-mision.test.js
T015 tests/acople-balance.test.js

# Después de T016/T017 en verde, presentación en paralelo:
T018 minijuego-acople.html
T019 css/minijuegos.css (simulador)
T021 js/minijuegos/acople/overlays.js
T022 js/minijuegos/acople/escena-acople.js
# Y por último T023 main.js conecta todo.
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. F1 Setup, F2 Foundational (`pnpm test` en verde) y F3 US1.
2. **Parar y validar**: `quickstart.md` §2. Ya hay un acople jugable de punta a punta.

### Incremental Delivery

1. US1, después US2 (ciclo de juego completo, las dos P1).
2. US3, el hub (se puede adelantar en paralelo).
3. US4, el récord.
4. US5, la integración fina.
5. Polish: vendorizar y documentar.

Un commit por tarea o por grupo coherente, en Conventional Commits (`test:`, `feat:`, `refactor:`, `docs:`, `chore:`) y sin atribución a IA.

---

## Notes

- [P] = otro archivo y sin dependencias pendientes.
- Verificar que cada test **falla** antes de implementar (Principio V).
- No se crea ninguna abstracción "misión genérica": la segunda misión la justifica (FR-041, plan).
- La API de Phaser 4 se consulta con context7 al escribir T022 y T023. La mayoría de los ejemplos de internet son de la 3.x.
