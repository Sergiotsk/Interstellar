# Research — 009 Minijuegos + acople

Fase 0 de `/speckit-plan`. Cada entrada sigue el formato Decisión / Razón / Alternativas.
Fuentes medidas el 2026-10-07: registry de npm (`registry.npmjs.org/phaser`) y los builds ESM descargados de jsDelivr, con el gzip medido localmente (`gzip -9`).

---

## R1. Versión de Phaser y peso

**Decisión**: **Phaser 4.2.1** (`dist/phaser.esm.min.js`), un único archivo ESM.

| Versión | Publicada | ESM min | ESM min gzip |
|---------|-----------|---------|--------------|
| 3.90.0 (última 3.x) | 2025-05-23 | 1.197.130 B (~1,14 MB) | 315.572 B (**~308 KB**) |
| 4.2.1 (`latest`) | 2026-07-09 | 1.377.611 B (~1,31 MB) | 353.179 B (**~345 KB**) |

**Razón**:

- La 4.x es la línea viva. La 3.90 cierra la 3.x, así que empezar un proyecto nuevo en una línea terminada es deuda desde el día uno.
- La 4.x salió estable el 2026-04-10 y ya va por dos minors, así que no es una RC.
- La diferencia es de ~37 KB gzip (+12 %). Como Phaser carga solo en la página del simulador, eso no afecta a ninguna otra página.
- El build ESM es **autocontenido**: no hace `import` de otros archivos y exporta `Game`, `Scene`, `AUTO`, `CANVAS`, `WEBGL` y `Scale`, además de `default`. Para vendorizar alcanza con copiar **un archivo**.
- Incluye `CanvasRenderer`, así que `Phaser.AUTO` cae a Canvas si no hay WebGL.

**Impacto en la carga (Principio I c)**:

- Unos 345 KB gzip se descargan con `import()` **después** del primer pintado, solo en `minijuego-acople.html`.
- El LCP de esa página lo define el HTML y el overlay de la intro (DOM), no el motor.
- El hub (`minijuegos.html`) **no** descarga Phaser. Esto se verifica en DevTools → Network (quickstart §3).

**Alternativas**:

- **Phaser 3.90**: más tutoriales, pero es una línea terminada.
- **Build custom recortado**: requiere un bundler, y el Principio I lo prohíbe.
- **Canvas 2D a mano**: se descarta por la justificación de la spec (loop, partículas, cámara, escalado).
- **PixiJS**: es solo un renderer, así que habría que hacer escenas, input y cámara a mano. No ahorra mucho frente a Phaser y pierde las partículas y la cámara integradas.

**Riesgo**: la mayoría de la documentación y los ejemplos de la comunidad son de la 3.x. **Mitigación**: consultar la API de la 4.x con context7 al implementar. El uso que hace el juego es acotado: una escena, `Graphics`, partículas, `cameras.main.shake` y `Scale.RESIZE`.

---

## R2. Perspectiva de cámara y modelo de movimiento

**Decisión**: **vista desde la cabina de la nave, mirando a lo largo del eje de giro de la estación.**

- La cámara va solidaria a la nave. La estación (un anillo con su puerto de acople en el centro) se dibuja **rotada por el ángulo relativo** `θ_estación − θ_nave` y **escalada por la distancia**: crece a medida que te acercás.
- El campo estelar rota con `−θ_nave`.
- La silueta de la nave queda fija en primer plano, con sus propulsores visibles: los RCS laterales al rotar y el motor principal o la retro al impulsar o frenar.
- El movimiento se separa en dos ejes independientes:
  - **rotación** (ArrowLeft/Right cambian la velocidad angular de la nave);
  - **aproximación** en 1D a lo largo del eje (ArrowUp acerca, Space frena o aleja).

**Razón**:

- **Legibilidad sin tutorial (FR-017, SC-003)**. Cuando la sincronía es perfecta, **la estación queda quieta en pantalla y es el universo el que gira**. Es la lectura visual más clara posible de "rotación igualada" y reproduce la sensación de la escena de la película sin copiar ningún asset.
- Separar los ejes evita el problema clásico de una vista cenital: si la nave gira para sincronizar, la dirección del empuje gira con ella y la traslación se vuelve incontrolable. Eso choca con "fácil de aprender".
- Las tres variables del brief se mapean de forma natural:
  - Δω (la estación rota en pantalla o no);
  - velocidad de aproximación (lo rápido que crece);
  - distancia (el tamaño).
  
  La **alineación** es el ángulo relativo entre la ranura del puerto y la marca de enganche de la nave.

**Alternativas**:

- **Vista cenital 2D con traslación libre** (asteroids-like): se descarta por lo de arriba. Además, para que el puerto se pueda alcanzar orbitando, haría falta física de rotación de marco, y eso es lo que el brief pide evitar.
- **Vista lateral**: no comunica la rotación.

> Decisión de diseño de gameplay: el usuario la puede revisar antes de `/speckit-tasks`.

---

## R3. Reparto motor / DOM ("estrategia de escenas")

**Decisión**:

- **Una sola escena Phaser** (`escena-acople.js`) que dibuja el espacio, la estación, la nave, las partículas y la cámara.
- La **intro, el HUD, la pausa, el resultado y el aviso para mobile son overlays de HTML semántico** sobre el lienzo, estilados con `css/minijuegos.css`.
- El flujo entre pantallas lo maneja `main.js` a partir de la máquina de estados pura `mision.js`.

**Razón**:

- **Principio II**: "Reintentar" y "Volver al hub" son `<button>` y `<a>` reales, con foco visible y tabulables. El HUD es una `<dl>` legible por lectores de pantalla, y el estado va en una región `aria-live="polite"`.
- Las tipografías self-hosted (Share Tech Mono) y los tokens de `variables.css` se aplican directo por CSS, sin cargar fuentes dentro del canvas.
- Menos superficie de Phaser significa menos código acoplado al motor. Más de lo que se ve queda en capa presentacional estándar del sitio.

**Alternativa**: 3 escenas Phaser (Intro, Docking, Result), como en el brief. Se descarta porque los botones y textos en canvas no son semánticos, los textos con web fonts se rasterizan, la navegación de foco sale a mano, y habría más código de motor sin beneficio.

---

## R4. Física y reglas fuera del motor

**Decisión**:

- La física simplificada y las reglas viven en módulos puros (`logica/*.js`), sin importar Phaser y sin DOM.
- Se integran con **paso fijo** (`PASO_FIJO_S` = 1/60 s) mediante un acumulador. El `delta` real se recorta a `DELTA_MAX_S` = 0,1 s para que una pestaña que vuelve de segundo plano no "teletransporte" la nave.
- Phaser **no** usa Arcade Physics: solo lee el estado y lo dibuja.

**Razón**: FR-040 y el Principio V (TDD de la lógica con `node --test`). El paso fijo además hace la simulación **determinística**: la misma secuencia de acciones da el mismo resultado, y eso permite testear la condición de victoria, el scoring y el balance (ver R9).

**Alternativa**: Arcade Physics de Phaser. Se descarta porque no se puede testear sin el motor y es 2D cartesiana, que no encaja con el modelo de R2.

---

## R5. Música de fondo del sitio

**Decisión**: generalizar el mecanismo **que ya existe** para el trailer.

- `js/layout.js` hoy silencia la música en `trailer.html` (`esTrailer` / `muteadoPorTrailer` / `sincronizarAudioRuta(archivo)`, que el router llama en cada `page:view`).
- Se reemplaza el chequeo por una función pura exportada, `rutaSinMusica(archivo)`, que vale `true` para `trailer.html` y para `minijuego-acople.html`.
- Las variables pasan a llamarse `muteadoPorRuta` y `silenciadoPorRuta`.

**Razón**:

- FR-031 queda resuelto sin que el juego conozca la música del sitio: **cero acoplamiento**, y el juego no llama a `layout.js`.
- El comportamiento al salir (reanudar si la preferencia es "on") ya está probado con el trailer.
- La función pura se puede testear con `node --test`, igual que `accionPorVisibilidad`.

**Alternativas**:

- **Evento custom** (`interstellar:musica-pausar` y `-restaurar`) disparado por el juego: suma un protocolo nuevo y la responsabilidad de restaurar al salir, con riesgo de dejar la música pausada si `unmount` falla.
- **Atenuar en lugar de pausar**: la música ambiente del sitio compite con los sonidos de advertencia, que son información de juego, así que se pausa.

---

## R6. Audio del juego (placeholders)

**Decisión**: módulo propio `audio-acople.js` sobre **Web Audio API**, con **sonidos sintetizados** y sin archivos:

- ambiente: drone grave con osciladores;
- propulsores: ruido filtrado, con la ganancia según las acciones activas;
- advertencia: pitido intermitente en UNSAFE;
- impacto: golpe de ruido corto;
- acople: acorde breve.

Tiene su propio `GainNode` maestro para el **mute del juego** (FR-032), con la preferencia en `sessionStorage` (`interstellar:minijuegos:mute`). El canal de "música" queda definido pero vacío en el MVP.

**Razón**:

- No hay assets ni copyright (FR-037) y no pesa nada.
- El `AudioContext` se crea o se reanuda en el **primer gesto** (tecla o clic de "comenzar"). Eso resuelve el autoplay bloqueado (edge case).
- Se cierra con `ctx.close()` en `unmount` (FR-030).

**Alternativa**: el `SoundManager` de Phaser con archivos `.ogg`/`.m4a`. Requiere conseguir o generar assets y licencias. Queda como mejora diferida (sonido final).

---

## R7. Aviso en dispositivos táctiles

**Decisión**: función pura `debeMostrarAvisoDesktop({ punteroGrueso, algunPunteroFino })` que devuelve `punteroGrueso && !algunPunteroFino`. Se alimenta con `matchMedia('(pointer: coarse)')` y `matchMedia('(any-pointer: fine)')`.

**Razón**: no existe una API confiable para detectar un teclado físico. Una laptop híbrida tiene un puntero fino (touchpad o mouse), así que juega; un celular o una tablet sin mouse ven el aviso. Cubre el edge case del equipo híbrido.

**Alternativa**: user-agent sniffing. Es frágil y está desaconsejado.

---

## R8. Input como acciones

**Decisión**:

- `logica/acciones.js` traduce teclas a acciones con un mapa de `config.js` (`ArrowLeft → 'rotarIzquierda'`, etc.).
- Mantiene el conjunto de acciones activas con funciones puras (`presionar`, `soltar`, `soltarTodo`).
- Los listeners `keydown`/`keyup` son **nativos**, registrados en `main.js` y removidos en `unmount`.
- `preventDefault()` se aplica solo a las teclas mapeadas y solo mientras la misión está en curso.

**Razón**:

- FR-011: un futuro control táctil solo llama a `presionar` y `soltar`.
- La limpieza queda bajo control explícito del módulo, no dentro del motor.
- Sin `preventDefault` acotado, Space y las flechas harían scroll de la página (edge case).

---

## R9. Balance de dificultad (30–90 s)

**Decisión**:

- Se incluye un **test de balance**: un "piloto de referencia" scripteado (una política simple: primero igualar ω, después alinear, acercarse con velocidad objetivo y frenar al entrar en rango) corre la simulación pura.
- El test exige que acople con éxito y que el tiempo simulado quede entre `[30, 90]` s.
- Un segundo test exige que una política torpe (impulso constante) **falle**.

**Razón**: convierte la parte medible de SC-002 en un test automatizado y protege el balance cuando se ajusta `config.js`. El ajuste fino con personas (SC-001) sigue siendo manual (quickstart §5).

---

## R10. Datos de la película y rigor (FR-038)

**Decisión**:

- El juego no muestra cifras de la película. La estación gira a una velocidad **de juego** (configurable y mucho menor que la de la película), sin mostrar RPM.
- La tarjeta de la bahía 1 deja de decir "67 RPM": se reemplaza por "rotación descontrolada".

**Razón**: si no se muestra ninguna cifra, no hace falta etiquetar nada, y SC-010 se cumple por construcción. La cifra de la película no aporta al gameplay.

**Alternativa**: mantener "67 RPM" con la etiqueta `✎ Licencia narrativa`. Es válido, pero suma una etiqueta de rigor en una tarjeta de juego por una cifra irrelevante.

---

## R11. Ubicación de estilos del hub

**Decisión**:

- El bloque §4 "Bahías" de `css/en-desarrollo.css` **se mueve** a la nueva `css/minijuegos.css`, que también lleva los estilos del simulador (overlays, HUD, lienzo).
- El hub deja de cargar `en-desarrollo.css`: ya no es una "sección en construcción", y su encabezado propio va en `minijuegos.css`.
- `css/minijuegos.css` se suma a `HOJAS_ESTILO_SITIO` en `js/swup-router.js` para que se precargue con swup.

**Razón**: la constitución nombra explícitamente `css/minijuegos.css` como hoja propia de página pesada. Así, `en-desarrollo.css` queda con lo que su nombre dice (`viaje.html` y los memes).

---

## R12. Ciclo de vida con swup

**Decisión**: `acople/main.js` exporta `mount()` y `unmount()`, siguiendo el patrón de `galeria.js` y `meme-viewer.js`, incluida la auto-inicialización si `!window.__SWUP_ROUTER_ACTIVE__`.

`unmount()` es **idempotente** y hace, en este orden:

1. marca el montaje como cancelado, para abortar un `import()` de Phaser que todavía esté en vuelo;
2. llama a `game.destroy(true)` si la instancia existe;
3. remueve los listeners de teclado, `visibilitychange` y `blur`;
4. cierra el `AudioContext` del juego;
5. anula las referencias.

`mount()` llama primero a `unmount()` como guarda. Así nunca hay dos instancias (FR-030, SC-005).

**Razón**: el router llama a `unmountCurrentPage()` en `visit:start`, **antes** del swap de `<main>`, así que el canvas se destruye con su contenedor todavía en el DOM. El caso borde real es salir mientras Phaser todavía se está descargando: lo cubre el flag de cancelación del paso 1.

---

## R13. Récord en localStorage

**Decisión**:

- Clave `interstellar:minijuegos:acople:best`, con el valor en JSON `{ v: 1, puntaje, fecha, tiempoS, combustible, velocidadFinal, precision }`.
- `leerRecord()` valida la forma y el tipo (`puntaje` entero ≥ 0, `v === 1`). Si algo no cierra, devuelve `null`.
- Todas las lecturas y escrituras van en `try/catch`.
- El storage se **inyecta** como parámetro (`storage = globalThis.localStorage`) para testear con un fake.

**Razón**: FR-027/028 y el edge case "récord corrupto". El campo `v` permite migrar el formato sin romper los récords viejos.
