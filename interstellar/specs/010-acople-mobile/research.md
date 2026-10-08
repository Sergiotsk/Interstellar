# Research — 010 Simulador de acople jugable en mobile

Cada decisión sigue el formato **Decisión / Razón / Alternativas**. Las referencias "009 Rn" apuntan a `specs/009-minijuegos-acople/research.md`.

## R1. Cómo se decide el modo de entrada

**Decisión**: `modoEntrada({ punteroGrueso, algunPunteroFino, forzado })` es una función pura en `logica/dispositivo.js` y reemplaza a `debeMostrarAvisoDesktop`. Devuelve `'tactil'` si hay puntero grueso y ningún puntero fino; si no, `'teclado'`. Un `forzado` válido (`'tactil' | 'teclado'`) tiene prioridad. El valor de `forzado` sale de `?entrada=` en la URL y lo lee `main.js`; la función no toca `location`.

**Razón**: mantiene el criterio del equipo híbrido de la 009 R7 (una laptop táctil con touchpad usa teclado) y solo cambia la consecuencia: modo táctil en lugar de aviso. El parámetro permite probar el modo táctil en desktop y forzar el teclado en una tablet con teclado Bluetooth que informa puntero grueso.

**Alternativas**:
- Detectar `'ontouchstart' in window`: falla en las laptops táctiles, porque se jugarían en táctil teniendo teclado.
- Cambiar de modo en caliente al recibir el primer `keydown` o `pointerdown` táctil: es más complejo y obliga a reacomodar el layout en plena partida. Queda para el futuro si hace falta.

## R2. Eventos para los controles: Pointer Events, sin captura

**Decisión**: cada control escucha `pointerdown`, `pointerup`, `pointercancel` y `pointerleave`. En `pointerdown` se llama a `el.releasePointerCapture(e.pointerId)`, si la captura existe.

**Razón**:
- Pointer Events son baseline en todos los navegadores evergreen y dan un `pointerId` por dedo, que es la base del multitouch (FR-006).
- En pantallas táctiles el navegador **captura implícitamente** el puntero en el elemento donde empezó el toque. Con la captura activa, `pointerleave` no se dispara al deslizar el dedo fuera. Liberarla es lo que permite cumplir "el dedo sale del control → se suelta" (FR-005).
- Solo `pointerdown` activa. Un dedo que entra deslizando a un control no lo activa (edge case de la spec).

**Alternativas**:
- Touch Events (`touchstart`/`touchend`): solo existen en táctil, cada evento trae una lista de toques que hay que reconciliar, y duplican la lógica para mouse.
- Mantener la captura: el dedo seguiría acelerando aunque saliera del botón, en contra de FR-005.

## R3. Estado de los toques: módulo puro

**Decisión**: `logica/controles-tactiles.js` (puro, TDD) maneja un `Map<pointerId, accion>` inmutable con estas operaciones:
- `tocar(mapa, id, accion)`
- `levantar(mapa, id)`
- `levantarTodo()`
- `accionesTactiles(mapa) → Set`

En `main.js`, el set efectivo que recibe `conAcciones` es la **unión** de `s.acciones` (teclado) y `accionesTactiles(s.toques)`.

**Razón**:
- Dos dedos sobre el mismo control (o un dedo que se levanta mientras el otro sigue) no deben soltar la acción antes de tiempo. Por eso el estado es por dedo y no por botón.
- La unión permite que un equipo con `?entrada=tactil` también use el teclado, y no rompe nada en modo teclado, donde el mapa está vacío.
- Al ser puro se testea sin DOM (Principio V).

**Alternativas**:
- `presionar`/`soltar` directo sobre `s.acciones` desde los botones: falla con dos dedos en el mismo control y mezcla el origen de las acciones.

## R4. Cabina a pantalla completa: Fullscreen donde existe, "modo cabina" siempre

**Decisión**: en modo táctil, durante la partida, se activa el atributo `data-cabina` sobre `.acople`, que lo pone en `position: fixed; inset: 0; z-index` por encima del header y del footer, con `height: 100dvh`. Además se llama al `pantalla.entrar` existente (Fullscreen API, donde esté soportada).

**Razón**: en el iPhone, Safari no ofrece pantalla completa para elementos HTML (solo para video). El modo cabina garantiza FR-013 en todos los navegadores. Donde sí hay Fullscreen API (Android, iPad), las barras del navegador también se van. `dvh` sigue la altura visible real cuando las barras aparecen o se ocultan.

**Alternativas**:
- Solo Fullscreen API: en el iPhone quedarían el header del sitio y la barra de Safari, y en ~390 px de alto no hay lugar para jugar.
- Hacer scroll automático para esconder el header: es frágil y Safari vuelve a mostrar la barra.

## R5. Bloqueo de orientación

**Decisión**: se agrega `bloquearHorizontal()` a `pantalla-completa.js`. Llama a `screen.orientation.lock('landscape')` dentro de un `try/catch`, sin rechazar nunca (mismo contrato que `entrar`). Se invoca después de que `entrar` resuelve `true`.

**Razón**: el bloqueo solo funciona en pantalla completa y en algunos navegadores (Chrome Android). En el resto rechaza o no existe. El aviso de giro (R6) es la red de seguridad (FR-014, FR-015).

**Alternativas**: rotar la cabina 90° por CSS cuando el teléfono está en vertical. Confunde la orientación de los controles con los sensores y el teclado del sistema, y queda descartado.

## R6. Aviso de giro como capa independiente

**Decisión**:
- `requiereGiro({ modo, ancho, alto })` es pura y devuelve `modo === 'tactil' && alto > ancho`.
- `main.js` la evalúa al montar y con `matchMedia('(orientation: portrait)')` (evento `change`), más `resize` como respaldo.
- Mientras sea `true`, se muestra `[data-aviso-giro]`, una **capa aparte** de las pantallas `[data-pantalla]`. Si había partida en curso, se llama a `pausarPartida`.
- El temporizador de la intro también se suspende.

**Razón**: si el aviso fuera una pantalla más, `mostrar()` ocultaría el resultado o el editor de nombre y se perdería lo que se estaba cargando (FR-016). Como capa superpuesta, lo de abajo queda intacto. Al volver a horizontal la capa se oculta y el jugador ve la pausa ("Seguir"), así que no hay reanudación sorpresa.

**Alternativas**:
- Reanudar automáticamente al volver a horizontal: el jugador puede no estar listo. Se elige la pausa explícita, igual que al salir de pantalla completa (009 FR-042).

## R7. Consola compacta por altura, no por dispositivo

**Decisión**: `@media (max-height: 30rem)` redefine `--alto-consola` (≈5.5rem), el tamaño de los diales y las barras, y la tipografía (≈0.6rem). Los cinco instrumentos se mantienen (FR-017). La escena ya lee `--alto-consola` y `--ancho-consola` con `medidasConsola()` (`main.js`), así que Phaser se reacomoda solo.

**Razón**: el problema es la altura disponible, no el tipo de puntero. Una ventana de desktop muy baja también se beneficia, y la regla no depende del modo.

**Alternativas**: modo mínimo con solo LEDs. El usuario lo descartó a favor de mantener el instrumental.

## R8. Controles: ubicación, tamaño y gestos del navegador

**Decisión**:
- Hay dos grupos absolutos en las esquinas inferiores, a los costados de la consola: `◀ ▶` a la izquierda y `▲ ▼` a la derecha, con ▲ arriba de ▼.
- Cada botón mide como mínimo `3rem` (48 px), con el mismo estilo de tecla de cabina (`clip-path: var(--recorte-tecla)`) y un estado `[data-activo="true"]` con brillo teal (FR-010).
- La pausa (`II`) va arriba a la izquierda, donde en desktop está el control de pantalla completa (FR-009).
- CSS de protección:
  - `touch-action: none` en los controles.
  - `touch-action: manipulation` en `.acople`, que anula el zoom por doble toque.
  - `user-select: none` y `-webkit-touch-callout: none`.
  - `contextmenu` con `preventDefault` en los controles (FR-011).
- Los grupos se ubican con `env(safe-area-inset-left/right/bottom)` y el meta viewport suma `viewport-fit=cover` (FR-018).

**Razón**:
- Es la convención de los juegos móviles: dirección a la izquierda, acción a la derecha.
- 48 px es el target que ya usa el sitio (WCAG 2.5.8, `layout.css`).
- Sin `viewport-fit=cover`, `env(safe-area-*)` vale 0 y Safari agrega franjas.

**Alternativas**:
- Un joystick virtual: es más impreciso para tolerancias finas y no aporta nada sobre un eje de rotación.
- Botones dentro del canvas de Phaser: rompe el Principio II (009 R3), porque no son `<button>` reales.

## R9. Orden de acople y textos según el modo

**Decisión**:
- `indicacionHud(partida, estado, modo = 'teclado')` en `logica/mision.js` devuelve `'TAP TO DOCK'` en táctil (FR-008). Se mantiene el botón `.acople-orden` (`data-accion="acoplar"`), que ya llama a `pedirAcople`.
- En la intro, las ayudas por modo usan `data-solo="teclado|tactil"` y CSS sobre `[data-entrada]` (FR-019).

**Razón**: es un cambio mínimo, con el valor por defecto que conserva el comportamiento de desktop y el test que ya existe. La decisión de no tener un botón permanente está en las Assumptions de la spec.

**Alternativas**: un botón ACOPLAR fijo. Queda descartado por los rechazos accidentales (Assumptions).

## R10. Editor de nombre táctil

**Decisión**:
- Debajo de las casillas, botones con `data-tecla-editor="ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Backspace"`. El clic se traduce a `teclaEditor(s.editor, tecla, CONFIG)` (ya testeado).
- Las casillas pasan a ser `<button>` con `data-casilla="i"`, y tocarlas llama a la nueva función pura `fijarCursor(ed, i, config)` en `logica/nombre-arcade.js` (FR-020, FR-021).
- Los botones del editor se ven solo en táctil. Tocar una casilla funciona en ambos modos.

**Razón**: se reusa el mismo camino que el teclado, sin lógica duplicada.

**Alternativas**: un `<input>` que abra el teclado del sistema. Se descarta porque rompe la estética arcade, el teclado tapa media pantalla en horizontal y la spec lo deja afuera.

## R11. Vibración

**Decisión**: `navigator.vibrate?.(…)` con pulsos breves al acoplar (~40 ms) y al ser rechazado (~2 × 30 ms), solo en modo táctil y con el juego sin silenciar.

**Razón**: suma sensación de cabina sin costo. En iOS no existe y el operador `?.` lo vuelve un no-op.

**Alternativas**: no vibrar. Sigue siendo opcional según la spec, así que si molesta en las pruebas se quita sin afectar requisitos.

## R12. Verificación

**Decisión**:
- Lógica con `node --test`.
- Presentación por aceptación, en tres niveles:
  1. Chrome desktop con `?entrada=tactil`, midiendo con iframes de 844×390, 915×412, 667×375, 1024×768 y 390×844.
  2. Emulación táctil de DevTools para probar los gestos.
  3. **Dispositivo real** en la LAN con `python -m http.server 8000 --bind 0.0.0.0`.

**Razón**: el multitouch, la muesca, la barra de Safari y el bloqueo de orientación solo se pueden validar de verdad en un dispositivo real. SC-001 pide al menos un iPhone y un Android.
