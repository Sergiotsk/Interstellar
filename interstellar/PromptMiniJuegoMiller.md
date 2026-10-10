Creá un minijuego web 2D llamado **"Miller's Wave Escape"**: el capítulo 2 de una serie de simuladores inspirados en la película *Interstellar*. Es un proyecto fan, educativo y no oficial. Lo voy a portar después a un sitio estático existente, así que **las restricciones de construcción importan tanto como el juego**. Respetalas al pie de la letra.

## 1. El juego

**Premisa.** El Ranger amerizó en el planeta de Miller: un océano de agua poco profunda (hasta las rodillas) donde cada hora equivale a 7 años en la Tierra. Una ola gigante (una montaña de agua de más de 1 km de alto) avanza hacia la nave. El jugador tiene que salir del Ranger, recuperar la caja negra de la sonda y volver a despegar antes de que la ola lo alcance.

**Género.** Contrarreloj arcade de vista cenital (top-down) o lateral (elegí la que sea más legible y fundamentá la elección en un comentario). Las partidas duran entre **45 y 90 segundos**. Es fácil de aprender, difícil de hacer perfecto y da ganas de reintentar.

**Bucle de juego:**
1. **Intro cinemática breve** (6-8 s, se puede saltar): frases cortas en español con fade. Por ejemplo:
   > PLANETA DE MILLER
   > Una hora acá son siete años en la Tierra.
   >
   > Encontrá la baliza. Volvé al Ranger. No mires atrás.
2. **Cuenta regresiva 3-2-1.**
3. **Exploración:** el jugador se mueve por el agua poco profunda (el agua lo frena), busca la baliza siguiendo una señal (un pulso que se intensifica al acercarse) y esquiva restos de la sonda.
4. **Huida:** al recoger la baliza, la ola aparece en el horizonte y avanza. El jugador vuelve al Ranger. Mientras más cerca está la ola, más se agita el agua (micro-shake de cámara, oleaje, rocío).
5. **Despegue:** dentro del radio del Ranger, el jugador mantiene una acción ("Despegar") durante ~1,5 s mientras se carga una barra. Si la ola llega antes, la misión falla.
6. **Resultado:** éxito o fracaso, estadísticas, puntaje, ranking local y opciones **Reintentar** / **Salir**.

**Mecánica central de tensión — el reloj de dilatación.** Además del cronómetro de la misión, el HUD muestra un **contador de "años perdidos en la Tierra"** que corre a 1 h = 7 años (o sea, cada segundo de juego suma unas 17,5 horas terrestres). Lo que buscamos es que el jugador **sienta** el costo del tiempo. El puntaje premia volver rápido.

**El juego falla si:** la ola alcanza al jugador o al Ranger, o el jugador queda inmovilizado (por ejemplo, choca contra restos a alta velocidad y queda aturdido demasiado tiempo cerca de la ola).

**Puntaje (0 a 10 000):** combina el tiempo total (pesa más), el margen con la ola al despegar, los choques evitados y la precisión del despegue. Todos los pesos van en la configuración.

## 2. Dirección visual y de audio

- **Atmósfera:** cinematográfica, minimalista e inmensa. Paleta fría: grises azulados, agua plomiza, cielo nublado y brillante. La ola es una pared oscura que **ocupa el horizonte** y crece. Nada de estética arcade genérica, nada de colores saturados de caricatura.
- **Gráficos 100 % originales y procedurales** (formas, gradientes, partículas dibujadas por código). **NO** uses logos, fotogramas, música, diálogos ni material de la película. Tampoco uses imágenes externas ni sprites descargados.
- **Partículas:** salpicaduras al moverse, rocío cuando la ola está cerca, estela del Ranger al despegar. Que sea sutil: sin saturar la pantalla.
- **HUD de nave:** minimalista, oscuro, monoespaciado (`'Share Tech Mono', ui-monospace, monospace`), líneas finas y pocos colores. Usá **exactamente estos tokens**:
  - Acento de interfaz: teal `#4fd0e0`.
  - Fondo de panel: `#0c2529`. Fondo general: `#0a0e1a`.
  - Texto: crema `#efe7d6` (nunca blanco puro). Texto secundario: `#a8a294`.
  - LED de estado: ámbar `#e0a94a`. LED de alerta: rojo `#d0453a` (uso puntual).
  - Metal del panel: `#12161a` / `#1c2226`, bezel `#3d454c`.
- **Idioma:** las **etiquetas técnicas del HUD van en INGLÉS**: `MISSION TIME`, `EARTH TIME LOST`, `BEACON SIGNAL`, `WAVE DISTANCE`, `LIFTOFF`. Los **estados** también: `SEARCHING`, `BEACON ACQUIRED`, `WAVE INCOMING`, `RETURN TO RANGER`, `LIFTOFF READY`, `MISSION FAILED`. La **narrativa y los textos para el jugador van en español rioplatense** (voseo: "Volvé", "Mantené", "Despegá").
- Tiene que distinguirse **visualmente** cuándo hay margen y cuándo el peligro es inminente: el HUD pasa de teal a ámbar y a rojo según la distancia de la ola.
- **Rigor:** toda cifra tomada de la película (1 h = 7 años, altura de la ola) se muestra con una etiqueta pequeña **`✎ Licencia narrativa`** en la intro o en el resultado. Nunca se presenta como ciencia real.
- **Audio con Web Audio API, sintetizado por código** (sin archivos externos): ambiente de agua/viento, salpicaduras, un pulso de la baliza que se acelera al acercarse, un rumor grave de la ola que crece con la cercanía, una alarma corta y el despegue. Agregá un botón propio de silencio. El audio arranca **recién después del primer gesto del usuario** (por la política de autoplay). Separá dos perfiles de mezcla en la configuración: `teclado` (desktop) y `tactil` (el parlante del celular no reproduce graves, así que ahí hay que subir el volumen y abrir los filtros).
- **`prefers-reduced-motion`:** sin shake de cámara, oleaje atenuado y transiciones más simples.

## 3. Controles: teclado y táctil desde el día uno

- **El input se modela como ACCIONES, no como teclas:** `moverArriba`, `moverAbajo`, `moverIzquierda`, `moverDerecha` y `accion` (recoger/despegar). Un mapa `teclas → acción` vive en la configuración.
- **Teclado:** flechas y WASD para moverse, Space o Enter para la acción, Esc para pausar.
- **Táctil:** un joystick virtual a la izquierda y un botón de acción a la derecha, ambos con estilo de consola de nave (con los mismos tokens del HUD). Tiene que ser **multitouch real**: moverse y mantener la acción al mismo tiempo. Usá `pointer events`, `touch-action: none` en el área de juego, y que no se active ni el scroll ni el zoom.
- **Mobile:** jugable en **landscape**. En portrait mostrá un aviso "Girá el dispositivo". Agregá un botón de pantalla completa (Fullscreen API con fallback, porque iOS Safari no la soporta en elementos que no son video), la cuenta regresiva y un botón "Salir" visible también en pantalla completa.
- Si la pestaña se oculta o la ventana pierde el foco, el juego se **pausa solo** y se sueltan todas las acciones (que no quede una tecla "pegada").

## 4. Ranking local estilo fichín

- Top 10 en `localStorage`, con la clave `interstellar:minijuegos:miller:ranking` y un campo `version: 1`.
- Al entrar al top, aparece un editor de nombre arcade de **8 letras como máximo**, con el alfabeto `ABCDEFGHIJKLMNÑOPQRSTUVWXYZ0123456789 ` y `RANGER` como nombre por defecto. Se puede usar con teclado (flechas para cambiar la letra y moverse) **y** de forma táctil (botones ▲▼◀▶ y OK).
- Mostrá el ranking en la intro y en el resultado.
- **Todo acceso a `localStorage` va con `try/catch`.** Si no está disponible (por ejemplo, en modo privado), el juego funciona igual y simplemente no guarda.

## 5. Restricciones de construcción (NO negociables)

**Stack:**
- **HTML + CSS + JavaScript vanilla escrito a mano, como ES Modules** (`<script type="module">`).
- **PROHIBIDO:** TypeScript, React/Vue/Svelte/Preact/Lit o cualquier framework de UI, Tailwind/Bootstrap, Sass y cualquier paso de build o bundler. Lo que se escribe es lo que corre.
- **Motor: Phaser 4.2.1** (versión fija, NO Phaser 3), importado como ESM desde `https://cdn.jsdelivr.net/npm/phaser@4.2.1/dist/phaser.esm.min.js` con `import()` dinámico. No agregues ninguna otra librería.
- **Entrega:** un **único archivo `index.html` autocontenido**, pero con el JS **dividido en bloques claramente separados**, cada uno con un comentario de encabezado. Cada bloque se va a convertir después en un archivo propio:
  1. `// ===== config.js =====`: un objeto `CONFIG` congelado (`Object.freeze` profundo) con **TODOS** los números del gameplay: velocidades, arrastre del agua, distancias, velocidad de la ola, radio del Ranger, tiempo de despegue, pesos del puntaje, perfiles de audio, ranking y mapa de teclas. **Cero números mágicos** fuera de este bloque. Los nombres de la película (Ranger, Miller) también van acá, para poder cambiarlos fácilmente.
  2. `// ===== logica/*.js =====`: **funciones PURAS**, sin Phaser, sin DOM, sin `Math.random` ni `Date.now` directos (el azar y el tiempo entran como parámetros: una semilla o una función `rng` y el `dt`). Incluye: física simplificada con paso fijo de 1/60 s y `dt` acotado; la máquina de estados de la misión (`intro → cuenta → exploracion → huida → despegue → exito | fracaso`, más `pausa`); el avance de la ola; la detección de baliza y del radio de despegue; el puntaje; el reloj de dilatación; el ranking (leer, insertar, posición y guardar, con el `storage` inyectado); el editor de nombre arcade, y el mapeo de teclas y toques a acciones. **Estado inmutable**: cada función recibe el estado y devuelve uno nuevo.
  3. `// ===== escena.js =====`: la escena Phaser. **Solo dibuja** lo que le dicta la lógica; no decide reglas.
  4. `// ===== overlays.js =====`: el HUD y las pantallas (intro, resultado, ranking, aviso de giro) en **HTML/CSS semántico superpuesto al canvas**, no dibujados dentro de Phaser. Usá `<section>`, `<h2>`, `<ol>` para el ranking, `<button>` reales y `<output>` para las lecturas.
  5. `// ===== audio.js =====`: Web Audio, con `crear()` y `destruir()`.
  6. `// ===== controles-tactiles.js =====`: el joystick y el botón táctil, que emiten acciones.
  7. `// ===== main.js =====`: el ciclo de vida. Exportá **`mount(contenedor)` y `unmount()`**. `unmount` tiene que **destruir la instancia de Phaser, cancelar todos los `requestAnimationFrame` y timers, quitar TODOS los listeners (teclado, pointer, visibilitychange, resize, fullscreenchange), cerrar el `AudioContext` y vaciar el DOM que creó**. Llamar a `mount → unmount → mount` 10 veces seguidas no debe duplicar canvas, loops ni sonidos, y no debe dejar errores en la consola. Si `unmount` se llama mientras Phaser todavía se está importando, la carga se cancela de forma limpia.
- Agregá un bloque final `// ===== tests (node --test) =====`, **comentado**, con tests de `node:test` + `node:assert` para la lógica pura: física, ola, máquina de estados, puntaje, ranking y editor. Incluí un **test de balance**: un "piloto de referencia" simulado completa la misión en 45-90 s con la configuración por defecto.
- **CSS:** todos los colores, tipografías y medidas reutilizables van como **custom properties en `:root`** (los tokens de la sección 2). Nada de valores sueltos. Sin `@import`. El CSS del juego tiene que poder vivir **debajo** de un header y un footer de sitio que no son suyos: no toques `body` ni `html` más allá de lo mínimo, y encapsulá todo bajo un contenedor raíz `.juego-miller`.
- **Rutas:** si aparece alguna ruta, que sea **relativa**, nunca absoluta (`/algo`), porque el sitio se publica bajo un subpath.
- **Nombres:** de archivos y clases CSS en `kebab-case`, sin acentos. De variables y funciones JS en español y `camelCase` (`crearPartida`, `avanzarOla`, `leerRanking`).
- **Comentarios:** mínimos, de una línea, y que expliquen el **porqué**, no el qué.
- **Código obvio antes que ingenioso:** nada de magia ni de abstracciones para "futuras misiones". Todo tiene que poder explicarse línea por línea.
- **Rendimiento:** 60 fps estables en un celular de gama media. Las partículas tienen un tope configurable y no se crean objetos en cada frame dentro del loop caliente.

## 6. Criterios de aceptación

1. Se juega y se entiende **sin tutorial**: el jugador lee lo que pasa por el movimiento, el sonido, las partículas y el HUD.
2. Se puede ganar y perder. El resultado muestra el tiempo, los años perdidos en la Tierra, el margen con la ola y el puntaje.
3. Reintentar reinicia limpio, sin recargar la página.
4. El ranking persiste entre recargas y el editor de nombre funciona con teclado y con toque.
5. Es jugable en desktop (teclado) y en un celular en landscape (táctil multitouch), con pantalla completa.
6. Pausa automática al ocultar la pestaña, sin teclas pegadas.
7. `mount/unmount` repetido no deja fugas (canvas, loops, audio ni listeners).
8. Toda la lógica es pura y testeable con `node --test`, sin Phaser ni DOM.
9. El HUD respeta la paleta y el idioma (inglés técnico y narrativa en español).
10. Ningún asset proviene de la película.

Antes de escribir el código, devolvé un **resumen de diseño breve**: la vista elegida, la máquina de estados, la fórmula del puntaje y los valores iniciales de `CONFIG` con su justificación. Después entregá el archivo completo.
