---
description: "Task list — 010 Simulador de acople jugable en mobile"
---

# Tasks: Simulador de acople jugable en celulares y tablets

**Input**: documentos de diseño en `specs/010-acople-mobile/` (plan.md, spec.md, research.md, data-model.md, contracts/entrada-tactil.md, quickstart.md).

**Tests**: SÍ. La constitución (Principio V) exige **TDD estricto** en la lógica: cada test se escribe y se ve **fallar** antes de implementar. El glue de eventos, el HTML y el CSS se validan por aceptación con `quickstart.md`.

**Organization**: las tareas se agrupan por historia de usuario (spec.md: US1 y US2 son P1, US3 y US4 son P2).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede hacer en paralelo (otro archivo y sin dependencias pendientes).
- **[Story]**: historia a la que pertenece (US1…US4).
- Todas las rutas son relativas a `interstellar/`.

## Path Conventions

- Lógica pura: `js/minijuegos/acople/logica/*.js` (sin DOM).
- Glue y presentación: `js/minijuegos/acople/{main,controles-tactiles,overlays,pantalla-completa}.js`, `minijuego-acople.html` y `css/minijuegos.css`.
- Tests: `tests/acople-*.test.js` (`node --test`).
- Comentarios del código: de una línea. El porqué largo va en `docs/20-notas-de-codigo/minijuegos-acople.md`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: base de marcado y estilos que comparten todas las historias.

- [X] T001 En `minijuego-acople.html`, cambiar el meta viewport a `width=device-width, initial-scale=1, viewport-fit=cover` (R8, FR-018).
- [X] T002 [P] En `css/minijuegos.css`, agregar las reglas de visibilidad por modo (contrato §6):
  - `.acople:not([data-entrada="tactil"]) [data-solo="tactil"] { display: none }` y la inversa para `teclado`;
  - `touch-action: manipulation` en `.acople` (R8).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: el modo de entrada decide qué ve cada historia. Contrato §1 `dispositivo.js`; data-model "ModoEntrada".

**⚠️ CRITICAL**: ninguna historia empieza antes de esta fase.

- [X] T003 Reescribir `tests/acople-dispositivo.test.js` para `modoEntrada` (en ROJO). Casos:
  - solo puntero grueso → `'tactil'`;
  - puntero grueso + fino (híbrido) → `'teclado'`;
  - solo fino → `'teclado'`;
  - ninguno → `'teclado'`;
  - `forzado: 'tactil'` en desktop → `'tactil'`;
  - `forzado: 'teclado'` en táctil → `'teclado'`;
  - `forzado` con un valor inválido (`'x'`, `null`) → se ignora.
- [X] T004 Implementar `modoEntrada` en `js/minijuegos/acople/logica/dispositivo.js` y **eliminar** `debeMostrarAvisoDesktop` (T003 en VERDE).
- [X] T005 En `js/minijuegos/acople/main.js` → `mount()`:
  - leer `new URLSearchParams(location.search).get('entrada')`;
  - calcular `s.modo = modoEntrada({...})` con los mismos `matchMedia` de hoy;
  - poner `raiz.dataset.entrada = s.modo`;
  - **quitar el corte con `mostrarAviso`** (FR-003);
  - mantener la pantalla `aviso` solo para la falla de carga del motor (`mostrarFalla`).

  Verificar que en desktop todo sigue igual.

**Checkpoint**: `node --test` en verde. Con `?entrada=tactil` la página arranca la intro en lugar del aviso.

---

## Phase 3: User Story 1 - Pilotear y acoplar con los pulgares (Priority: P1) 🎯 MVP

**Goal**: rotar, acelerar y frenar con botones multitouch, acoplar con "TAP TO DOCK" y pausar.

**Independent Test**: `?entrada=tactil` en desktop (con mouse y con la emulación táctil de DevTools) y en un celular real. Completar un acople usando solo los botones (quickstart §2 y §4).

### Tests for User Story 1 (TDD: escribir primero, ver FALLAR) ⚠️

- [X] T006 [P] [US1] Crear `tests/acople-controles-tactiles.test.js` (en ROJO). Casos:
  - `tocar` agrega un par y no muta el mapa original;
  - con dos dedos en acciones distintas, `accionesTactiles` devuelve ambas (multitouch, FR-006);
  - con dos dedos en la misma acción, levantar uno la mantiene y levantar el otro la quita;
  - `levantar` con un id inexistente devuelve el mapa sin cambios;
  - una acción inválida se ignora;
  - `levantarTodo` devuelve un mapa vacío;
  - las acciones válidas son exactamente los valores de `CONFIG.teclas` (FR-007).
- [X] T007 [P] [US1] En `tests/acople-mision.test.js`, agregar el caso (en ROJO): `indicacionHud(p, 'DOCKING RANGE', 'tactil')` → `'TAP TO DOCK'`. Sin modo sigue dando `'PRESS ENTER TO DOCK'`, y el rechazo no cambia con el modo.

### Implementation for User Story 1

- [X] T008 [US1] Crear `js/minijuegos/acople/logica/controles-tactiles.js` con `tocar`, `levantar`, `levantarTodo` y `accionesTactiles` (data-model "Toques"). Las acciones válidas salen de `Object.values(CONFIG.teclas)`. T006 en VERDE.
- [X] T009 [US1] En `js/minijuegos/acople/logica/mision.js`, agregar el parámetro `modo = 'teclado'` a `indicacionHud` (T007 en VERDE).
- [X] T010 [US1] Crear `js/minijuegos/acople/controles-tactiles.js` con `conectarControles(raiz, { alCambiar, alTocar })` (contrato §3):
  - `pointerdown` llama a `releasePointerCapture`, a `tocar` y a `alTocar`, y marca `data-activo`;
  - `pointerup`, `pointercancel` y `pointerleave` llaman a `levantar`;
  - `contextmenu` hace `preventDefault`;
  - el estado vive en un `Map` local que se pasa a `alCambiar`;
  - devuelve una función de limpieza y expone `soltar()`, que vacía el mapa y limpia `data-activo`.
- [X] T011 [US1] En `minijuego-acople.html`, dentro del bloque del HUD:
  - agregar `<div class="acople-mandos acople-mandos--izq" data-solo="tactil">` con los botones `rotarIzquierda` (◀) y `rotarDerecha` (▶);
  - agregar `<div class="acople-mandos acople-mandos--der" data-solo="tactil">` con `impulso` (▲) y `freno` (▼);
  - agregar el botón de pausa `<button data-accion="pausar" data-solo="tactil" aria-label="Pausar">II</button>`.

  Los botones van con `type="button"`, `data-control`, `aria-label` y `tabindex="-1"` (contrato §2). La visibilidad tiene que acompañar a la del HUD: decidir si van dentro de la sección `data-pantalla="hud"` o se muestran desde `overlays.mostrar`.
- [X] T012 [US1] En `css/minijuegos.css`, estilar los mandos:
  - `.acople-mandos` absolutos en las esquinas inferiores, a los costados de la consola, con `env(safe-area-inset-left/right/bottom)`;
  - botones de al menos `3rem`, con la silueta de `.acople-tecla`;
  - `touch-action: none`, `user-select: none` y `-webkit-touch-callout: none`;
  - estado `[data-activo="true"]` con brillo teal (FR-010, FR-011);
  - el botón de pausa arriba a la izquierda;
  - en reduced motion, sin transiciones.
- [X] T013 [US1] En `js/minijuegos/acople/main.js`:
  - si `s.modo === 'tactil'`, conectar los controles al montar y registrar la limpieza en `s.limpiezas`;
  - guardar `s.toques`;
  - en `tick`, pasar a `conAcciones` la unión de `s.acciones` y `accionesTactiles(s.toques)`;
  - en `pausarPartida`, `volverAJugar`, `terminarPartida` y `blur`, soltar los toques (FR-012);
  - en `alClic`, agregar `pausar` → `pausarPartida`;
  - en `tick`, pasar `s.modo` a `indicacionHud`;
  - con `navigator.vibrate?.()`, vibrar al acoplar y en el rechazo, solo en táctil y sin mute (R11).
- [X] T014 [US1] En la intro de `minijuego-acople.html`, marcar el `<p class="acople-intro-controles">` actual con `data-solo="teclado"` y agregar uno con `data-solo="tactil"` ("◀ ▶ rotar · ▲ impulso · ▼ freno · tocá la orden para acoplar") (FR-019).

**Checkpoint**: US1 completa. Con `?entrada=tactil` se pilotea con el mouse y se acopla tocando la orden. En DevTools táctil, dos dedos funcionan.

---

## Phase 4: User Story 2 - Cabina adaptada a la pantalla del dispositivo (Priority: P1)

**Goal**: la cabina ocupa toda la pantalla, hay aviso de giro con pausa, la consola es compacta y se respetan las safe areas.

**Independent Test**: iframes de 844×390, 915×412, 667×375 y 1024×768 sin scroll, con la consola y los mandos completos. 390×844 muestra el aviso. En un celular real, girar en plena partida (quickstart §3 y §4).

### Tests for User Story 2 (TDD) ⚠️

- [X] T015 [P] [US2] En `tests/acople-dispositivo.test.js`, agregar los casos de `requiereGiro` (en ROJO):
  - táctil vertical → `true`;
  - táctil horizontal → `false`;
  - táctil cuadrado (`alto === ancho`) → `false`;
  - teclado vertical → `false`.

### Implementation for User Story 2

- [X] T016 [US2] Implementar `requiereGiro` en `js/minijuegos/acople/logica/dispositivo.js` (T015 en VERDE).
- [X] T017 [P] [US2] En `js/minijuegos/acople/pantalla-completa.js`, agregar `bloquearHorizontal()`: `screen.orientation?.lock?.('landscape')` con try/catch, que devuelve `Promise<boolean>` y nunca rechaza (R5).
- [X] T018 [US2] En `css/minijuegos.css`, agregar `.acople[data-cabina]`: `position: fixed; inset: 0; height: 100dvh; min-height: 0; z-index` por encima de `header` y `footer` del sitio. Revisar el z-index que usa `layout.css` para el header (R4, FR-013).
- [X] T019 [US2] En `js/minijuegos/acople/main.js`:
  - en táctil, `comenzarPartida`, `volverAJugar` y `reanudarPartida` ponen `raiz.dataset.cabina = ''` y encadenan `pantalla.entrar(raiz).then(ok => ok && pantalla.bloquearHorizontal())`;
  - `unmount` quita `data-cabina`;
  - verificar que `medidasConsola`/Phaser se reacomodan con el resize.
- [X] T020 [US2] En `minijuego-acople.html`, agregar la capa `<div class="acople-girar" data-aviso-giro role="alertdialog" aria-labelledby="girar-titulo" hidden>` **fuera** de las secciones `[data-pantalla]`, con un ícono de rotación (SVG inline) y el texto "Girá el dispositivo".

  En `css/minijuegos.css`, la capa ocupa toda la pantalla, con el estilo de `.acople-aviso` y por encima de todo dentro de `.acople`.
- [X] T021 [US2] En `js/minijuegos/acople/main.js`, agregar `evaluarGiro(s)`:
  - si `requiereGiro` es `true`, muestra la capa, llama a `pausarPartida(s)` si la fase es `en-curso` y suspende el temporizador de la intro (`clearTimeout`);
  - si es `false`, oculta la capa y, si la fase es `intro`, rearma el temporizador.

  Se escucha con `matchMedia('(orientation: portrait)')` (`change`) y con `resize`, ambos en `s.limpiezas`, y se evalúa también al montar. Además, `alPresionar` y `alClic` ignoran la entrada mientras la capa está visible (FR-015, FR-016).
- [X] T022 [US2] En `css/minijuegos.css`, agregar `@media (max-height: 30rem)` con la consola compacta:
  - `--alto-consola` de ≈5.5rem;
  - diales, barras y regla más chicos;
  - tipografía de ≈0.6rem;
  - padding de la consola reducido;
  - los 5 instrumentos visibles;
  - `.acople-orden` reposicionado sobre la consola (FR-017, R7).
- [X] T023 [US2] En `css/minijuegos.css`, ajustar los overlays para pantallas bajas: intro, pausa y resultado con `max-height` y scroll interno; el resultado en una columna si no entra. Verificar que el editor y la tabla entran en 844×390 (FR-013).

**Checkpoint**: US1 y US2 completas, el MVP mobile jugable. Medir los iframes del quickstart §3.

---

## Phase 5: User Story 3 - Cargar el nombre del ranking con el dedo (Priority: P2)

**Goal**: botones ▲ ▼ ◀ ▶ ⌫ y casillas tocables en el editor de nombre.

**Independent Test**: con `?entrada=tactil`, entrar al ranking y cargar "TARS" solo con clics en los botones y en las casillas.

### Tests for User Story 3 (TDD) ⚠️

- [X] T024 [P] [US3] En `tests/acople-nombre-arcade.test.js`, agregar los casos de `fijarCursor` (en ROJO):
  - un índice válido mueve el cursor;
  - un índice negativo queda en 0;
  - un índice mayor al largo queda en el último;
  - un índice no entero devuelve el mismo editor;
  - no muta el editor original.

### Implementation for User Story 3

- [X] T025 [US3] Implementar `fijarCursor(ed, i, config)` en `js/minijuegos/acople/logica/nombre-arcade.js` (T024 en VERDE).
- [X] T026 [US3] En `js/minijuegos/acople/overlays.js` → `pintarEditor`, crear cada casilla como `<button type="button" class="acople-nombre-casilla" data-casilla="i" tabindex="-1">` en lugar de `<span>`. En `css/minijuegos.css`, resetear el estilo de botón de la casilla (sin fondo ni borde extra; mantener la línea inferior) y llevar su área táctil a 48 px de alto.
- [X] T027 [US3] En `minijuego-acople.html`, dentro de `[data-editor-nombre]`, agregar `<div class="acople-nombre-teclas" data-solo="tactil">` con 5 botones `data-tecla-editor` (`ArrowUp` ▲, `ArrowDown` ▼, `ArrowLeft` ◀, `ArrowRight` ▶, `Backspace` ⌫) y su `aria-label`, y ocultar la ayuda de teclas con `data-solo="teclado"`. En `css/minijuegos.css`, ponerlos en fila, de 48 px como mínimo.
- [X] T028 [US3] En `js/minijuegos/acople/main.js` → `alClic`:
  - `[data-tecla-editor]` con `s.editor` → `teclaEditor(s.editor, tecla, CONFIG)`; si confirma, `confirmarNombre`, y si no, `pintarEditor(s)`;
  - `[data-casilla]` con `s.editor` → `fijarCursor` y `pintarEditor(s)`.

**Checkpoint**: US3 completa. Nombre cargado con el dedo, fila resaltada.

---

## Phase 6: User Story 4 - Desktop y equipos híbridos sin cambios (Priority: P2)

**Goal**: cero regresiones en modo teclado.

**Independent Test**: el quickstart de la 009 en desktop sin parámetro, más `?entrada=teclado`.

- [X] T029 [US4] Revisar en `css/minijuegos.css` que ninguna regla nueva afecte el modo teclado: sin `data-cabina`, sin mandos y la consola normal por encima de 30rem de alto. Si alguna regla se filtra, corregirla.
- [X] T030 [US4] Validar en Chrome desktop, sin parámetro: teclas, Enter para acoplar, el editor con teclado, que tocar una casilla con el mouse mueve el cursor, pantalla completa con `Esc Salir`, la pausa al perder el foco y 10 ciclos de entrar y salir con swup sin errores en consola (009 SC-005).

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T031 [P] En `specs/009-minijuegos-acople/spec.md`, anotar en FR-034 y SC-008: "*(Reemplazado por la spec 010, 2026-10-08.)*". En Assumptions, actualizar la plataforma objetivo para apuntar a la 010.
- [X] T032 [P] En `docs/20-notas-de-codigo/minijuegos-acople.md`, agregar la sección "Entrada táctil": por qué se libera la captura del puntero, el mapa por dedo, la cabina fija contra la Fullscreen API en el iPhone y el aviso de giro como capa.
- [X] T033 Correr `node --test` completo, todo en verde.
- [X] T034 Correr el quickstart §2 y §3 (`?entrada=tactil` e iframes) y documentar las mediciones.
- [ ] T035 Quickstart §4 en dispositivos reales (iPhone y Android, a cargo del usuario en la LAN). Registrar los resultados de SC-001, SC-004, SC-005, SC-006 y SC-008.

---

## Dependencies & Execution Order

- **Setup (T001–T002)** → **Foundational (T003–T005)** → historias.
- **US1 (T006–T014)**: depende de Foundational. Es el MVP.
- **US2 (T015–T023)**: depende de Foundational. Técnicamente es independiente de US1, pero sin US1 no hay forma táctil de probar la cabina en plena partida, así que conviene hacerla después de US1.
- **US3 (T024–T028)**: depende de Foundational. Es independiente de US1 y US2 (se prueba con `?entrada=tactil` y un acople con el mouse).
- **US4 (T029–T030)**: va al final, como regresión de todo lo anterior.
- **Polish (T031–T035)**: después de las historias.

**Dentro de cada historia**: test en ROJO → lógica pura en VERDE → glue y DOM → CSS → validación.

## Parallel Opportunities

- T002 junto con T001.
- US1: T006 y T007 (dos archivos de test distintos).
- US2: T015 y T017 (test de dispositivo y `pantalla-completa.js`).
- US3: T024 se puede escribir en paralelo con cualquier tarea de US2.
- Polish: T031 y T032.

```text
# Ejemplo US1
T006 tests/acople-controles-tactiles.test.js   ║ T007 tests/acople-mision.test.js
        ↓                                       ║        ↓
T008 logica/controles-tactiles.js               ║ T009 logica/mision.js
        └──────────────→ T010 → T011 → T012 → T013 → T014
```

## Implementation Strategy

1. **MVP = Setup + Foundational + US1 + US2**: con eso el simulador ya se juega en el celular. US1 sola sirve en tablets, pero en un teléfono horizontal hace falta US2 para que entre en pantalla.
2. Validar el MVP en un dispositivo real (T035 parcial) antes de seguir.
3. **US3**: el ranking queda completo en mobile.
4. **US4 + Polish**: regresión, documentación y commit.
5. Commits por fase: `feat(minijuegos): …` para cada historia y `docs(minijuegos): …` para la spec y las notas.
