# Feature Specification: Capítulo 2 "Miller's Wave Escape" — Misión 1 (superficie de Miller)

**Feature Branch**: `sec/minijuegos`

**Created**: 2026-10-09

**Status**: Draft

**Input**: User description: portar el prototipo hecho en Google AI Studio Playground (`../mini-juego/`, React + TypeScript, un solo componente de ~5100 líneas) a la sección Minijuegos como **segundo simulador** (bahía 02 del hub), reescrito para cumplir la constitución. El alcance es un MVP con **solo la Misión 1**: superficie de Miller, baliza, megaola y despegue. Los requisitos del juego salen de `PromptMiniJuegoMiller.md`, y lo visual, el audio y la animación, de `DesignSystemMiniJuegoMiller.md`, que manda en esos temas. Los parámetros ajustables vienen de `../mini-juego/playground_config.json`.

## Clarifications

### Session 2026-10-09

- Q: ¿Qué perspectiva usa el juego: lateral, cenital o lateral con profundidad? → A: Lateral con profundidad (belt-scroller). Mantiene el horizonte y la ola como pared del DesignSystem, y conserva la búsqueda 2D del prototipo (FR-033).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Jugar la misión en Miller y despegar a tiempo (Priority: P1)

Un visitante entra a la página del simulador. Ve una intro cinemática breve, con frases cortas en español, que lo pone en situación: el planeta de Miller, una hora acá son siete años en la Tierra. Después de una cuenta 3-2-1 toma el control del astronauta. Avanza por un agua que le llega a las rodillas y lo frena, sigue un pulso que se intensifica a medida que se acerca a la baliza, esquiva los restos de la sonda y recoge la baliza. En ese momento la ola aparece en el horizonte y empieza a avanzar. El jugador vuelve al Ranger y, dentro de su radio, mantiene "Despegar" mientras se carga una barra. Si la barra se llena antes de que llegue la ola, la misión se completa y ve sus estadísticas y su puntaje.

**Why this priority**: es el corazón de la feature. Sin este bucle jugable y entendible no hay capítulo 2.

**Independent Test**: abrir la página en desktop, sin instrucciones externas, y completar la misión: el resultado tiene que mostrar el tiempo de misión, los años perdidos en la Tierra, el margen con la ola y el puntaje.

**Acceptance Scenarios**:

1. **Given** el visitante abre la página con teclado, **When** termina la intro o la saltea, **Then** corre la cuenta 3-2-1 y empieza la partida con el astronauta junto al Ranger, el HUD visible en estado `SEARCHING` y la ola todavía sin revelarse.
2. **Given** la partida está en exploración, **When** el jugador mantiene una dirección, **Then** el astronauta acelera con inercia y frena gradualmente al soltar (el agua lo frena), con salpicaduras en cada paso.
3. **Given** el jugador se acerca a la baliza, **When** la distancia baja, **Then** el pulso de la baliza (visual y sonoro) se acelera y la lectura `BEACON SIGNAL` sube.
4. **Given** el astronauta está sobre la baliza, **When** el jugador presiona la acción, **Then** la recoge, aparece `BEACON ACQUIRED!`, la ola se revela en el horizonte y el estado pasa a `WAVE INCOMING` y después a `RETURN TO RANGER`.
5. **Given** el astronauta está dentro del radio del Ranger con la baliza, **When** mantiene la acción, **Then** el estado pasa a `LIFTOFF READY`, se carga la barra `LIFTOFF` y, al llenarse, el Ranger despega y aparece el sello `MISSION COMPLETE!`.
6. **Given** el jugador suelta la acción antes de completar la carga, **When** la barra no está llena, **Then** la carga se pierde (o decae) y hay que volver a mantenerla.
7. **Given** la ola avanza, **When** se acerca al jugador, **Then** el HUD pasa de teal a ámbar y a rojo en tres escalones distinguibles, y el agua se agita más (oleaje, rocío y micro-shake de cámara).

---

### User Story 2 - Perder contra la ola, entender por qué y reintentar (Priority: P1)

El jugador tarda demasiado, choca contra los restos o se pierde. La ola lo alcanza a él o al Ranger y la misión falla con una animación seria (sin comedia). La pantalla de resultado le dice la causa en una frase y le ofrece reintentar al toque o salir.

**Why this priority**: un contrarreloj vive del ciclo fallar → entender → reintentar. Sin ese ciclo no hay rejugabilidad.

**Independent Test**: dejar que la ola alcance al jugador, y después dejar que alcance al Ranger con el jugador lejos. Verificar que cada caso muestra `MISSION FAILED` con la causa correcta y que "Reintentar" arranca una partida limpia sin recargar la página.

**Acceptance Scenarios**:

1. **Given** la ola está en camino, **When** su frente alcanza la posición del astronauta, **Then** la misión falla con la causa "la ola te alcanzó".
2. **Given** la ola está en camino, **When** su frente alcanza al Ranger antes del despegue, **Then** la misión falla con la causa "la ola alcanzó al Ranger", aunque el jugador esté a salvo.
3. **Given** el jugador choca contra un resto a alta velocidad, **When** el choque supera el umbral, **Then** queda aturdido un tiempo breve (no puede moverse) y se registra el choque en las estadísticas.
4. **Given** la misión terminó (éxito o fracaso), **When** el jugador elige "Reintentar", **Then** arranca una partida nueva limpia, sin la intro completa, sin restos del estado anterior y sin sonidos duplicados.
5. **Given** la misión terminó, **When** el jugador elige "Salir", **Then** vuelve al hub de minijuegos.

---

### User Story 3 - Sentir el costo del tiempo y competir por el ranking (Priority: P2)

Mientras juega, el jugador ve correr el `MISSION TIME` y, al lado, `EARTH TIME LOST`, que avanza a razón de 1 h = 7 años (unas 17 horas terrestres por segundo de juego). Al terminar, el resultado cuenta los ítems uno por uno (la "tirada"), le da un rango (S, A, B o C) y, si su puntaje entra al top 10 local, le pide un nombre arcade de hasta 8 letras. El ranking se ve en la intro y en el resultado, y el mejor puntaje aparece en la bahía 02 del hub.

**Why this priority**: es lo que convierte una partida en algo que da ganas de repetir. El juego funciona sin esto, pero pierde la tensión y el motivo para volver.

**Independent Test**: completar dos misiones con tiempos distintos y verificar que la más rápida puntúa más, que ambas entran al ranking ordenadas, que el editor de nombre funciona con teclado y que el ranking persiste tras recargar.

**Acceptance Scenarios**:

1. **Given** la partida está en curso, **When** pasa 1 segundo de juego, **Then** `EARTH TIME LOST` suma alrededor de 17 horas (17,05) terrestres, y la cifra lleva el chip `✎ Licencia narrativa` en la intro o en el resultado.
2. **Given** la misión se completa, **When** aparece el resultado, **Then** los ítems `MISSION TIME`, `EARTH TIME LOST`, `WAVE MARGIN`, `CASE ASSIST` y `TOTAL` se cuentan uno por uno con un tick sonoro y después se estampa el rango.
3. **Given** el puntaje entra al top 10, **When** termina la tirada, **Then** se abre el editor de nombre con `RANGER` por defecto, editable con flechas y confirmable con OK o Enter.
4. **Given** el almacenamiento local no está disponible, **When** termina una partida, **Then** el juego funciona igual, no guarda y no muestra errores.
5. **Given** hay un récord guardado, **When** el visitante abre el hub, **Then** la bahía 02 aparece disponible, con un enlace al simulador y el mejor puntaje.

---

### User Story 4 - Jugar en el celular en landscape (Priority: P2)

El visitante abre el simulador en un celular. En portrait ve el aviso "Girá el dispositivo". En landscape juega con un joystick virtual a la izquierda y un botón de acción a la derecha, con multitouch real: puede moverse y mantener "Despegar" al mismo tiempo. Puede pasar a pantalla completa y tiene "Salir" visible también ahí.

**Why this priority**: el sitio ya es jugable en mobile desde la feature 010. Este capítulo tiene que estar al mismo nivel, y reutiliza lo que ya está resuelto.

**Independent Test**: en un celular real en landscape, completar la misión solo con toques, incluida una carga de despegue mientras se corrige la posición con el joystick.

**Acceptance Scenarios**:

1. **Given** el dispositivo está en portrait, **When** se abre el simulador, **Then** se ve el aviso de giro y la partida no avanza.
2. **Given** la partida está en landscape, **When** el jugador arrastra el joystick y mantiene el botón de acción al mismo tiempo, **Then** ambas acciones se aplican a la vez.
3. **Given** el jugador toca el área de juego, **When** arrastra o pellizca, **Then** la página no hace scroll ni zoom.
4. **Given** el jugador pasa a pantalla completa, **When** termina la partida, **Then** la cuenta regresiva, el resultado y el botón "Salir" siguen visibles y operables.

---

### User Story 5 - CASE, el compañero que te da un empujón (Priority: P3)

En el mapa está CASE, el monolito de cuatro bloques. Si el jugador lo alcanza, CASE se pone a su lado y le da un impulso de velocidad durante 2 s, con su animación de "aspa". El resultado cuenta si hubo asistencia (`CASE ASSIST`).

**Why this priority**: suma personalidad y una decisión táctica (desviarse para buscar el impulso o ir directo), pero el juego se completa sin él.

**Independent Test**: alcanzar a CASE durante la exploración y verificar que la velocidad máxima sube durante 2 s y que el resultado registra la asistencia.

**Acceptance Scenarios**:

1. **Given** CASE está disponible, **When** el astronauta entra en su radio, **Then** recibe un impulso de velocidad por 2 s y CASE ejecuta su animación de asistencia.
2. **Given** CASE ya asistió, **When** el jugador vuelve a tocarlo, **Then** no da otro impulso hasta que pase su tiempo de recarga.

---

### Edge Cases

- **Pestaña oculta o ventana sin foco**: el juego se pausa solo y se sueltan todas las acciones (ninguna tecla queda "pegada"). Al volver, la partida sigue en pausa hasta que el jugador la reanude.
- **Pausa con Esc** en medio de la carga de despegue: la carga se congela, no avanza ni la ola ni los relojes.
- **Navegar a otra página del sitio** en medio de la partida: el simulador se desmonta sin dejar canvas, loops, timers, listeners ni sonidos vivos, y volver a entrar lo arranca limpio (10 ciclos seguidos sin duplicados ni errores).
- **Salir de la página mientras el motor del juego todavía carga**: la carga se cancela de forma limpia, sin errores.
- **Frame muy largo** (pestaña lenta o un tirón): el paso de simulación se acota y la ola no "salta" por encima del jugador.
- **Recoger la baliza justo cuando el jugador entra al radio del Ranger**: el orden de los eventos queda definido y es determinista.
- **La ola alcanza al jugador y al Ranger en el mismo paso**: se informa una sola causa, con prioridad definida.
- **Rotar a portrait en medio de la partida**: la partida se pausa y aparece el aviso de giro.
- **`prefers-reduced-motion`**: sin shake, sin destellos, sin hit-stop, con el parallax de la ola al 30 % y los banners con fade. La animación cuadro por cuadro se mantiene porque es información.
- **Audio bloqueado por el navegador**: no suena nada hasta el primer gesto del usuario, y el juego funciona igual en silencio.
- **Ranking corrupto o con otra versión** en el almacenamiento local: se ignora y se arranca vacío, sin romper el juego.

## Requirements *(mandatory)*

### Functional Requirements

**Integración con el sitio y el hub**

- **FR-001**: El hub MUST mostrar la bahía 02 (*Miller's Wave Escape*) como disponible, con un enlace normal del sitio a la página del simulador y el mejor puntaje local o un estado vacío explícito.
- **FR-002**: La página del simulador MUST convivir con el header, el footer, la navegación interna con montaje y desmontaje por página y la música de fondo del sitio, igual que el simulador de acople.
- **FR-003**: El juego MUST montarse y desmontarse por completo con la navegación del sitio: al desmontarse no deja motor, canvas, loops, timers, listeners, contexto de audio ni DOM propio vivos. Diez ciclos seguidos de montaje y desmontaje no producen duplicados ni errores.

**Bucle de la misión**

- **FR-004**: La misión MUST seguir la secuencia de estados `intro → cuenta → exploración → huida → despegue → éxito | fracaso`, más `pausa`, sin saltos fuera de esa secuencia.
- **FR-005**: La intro MUST durar entre 6 y 8 s, poder saltearse, mostrar frases cortas en español con fade y mostrarse completa solo la primera vez de cada visita. Los reintentos van directo a la cuenta 3-2-1.
- **FR-006**: El movimiento del astronauta MUST tener inercia con arrastre del agua: acelera al mantener una dirección y frena gradualmente al soltar.
- **FR-007**: La baliza MUST emitir un pulso visual y sonoro cuya frecuencia crezca a medida que el jugador se acerca, y MUST poder recogerse con la acción estando a su alcance.
- **FR-008**: Los restos de la sonda MUST bloquear el paso. Un choque por encima de un umbral de velocidad aturde al jugador un tiempo breve y cuenta como choque en las estadísticas.
- **FR-009**: La ola MUST revelarse al recoger la baliza y avanzar hacia el Ranger con una velocidad configurable. Si su frente alcanza al jugador o al Ranger antes del despegue, la misión falla con la causa correspondiente.
- **FR-010**: El despegue MUST exigir mantener la acción dentro del radio del Ranger, con la baliza recogida, durante el tiempo configurado (unos 1,5 s por defecto), mostrando una barra de carga.
- **FR-011**: Con la configuración por defecto, una partida exitosa de un jugador que ya conoce la mecánica MUST durar entre 45 y 90 s.
- **FR-012**: La generación del mapa (posición de la baliza, los restos y CASE) MUST ser reproducible a partir de una semilla, para poder testear y balancear.

**Reloj de dilatación, puntaje y ranking**

- **FR-013**: El HUD MUST mostrar `MISSION TIME` y `EARTH TIME LOST`, este último calculado a 1 h de juego = 7 años terrestres.
- **FR-014**: Toda cifra tomada de la película (1 h = 7 años, la altura de la ola) MUST mostrarse con la etiqueta `✎ Licencia narrativa` en la intro o en el resultado, y nunca presentarse como ciencia real.
- **FR-015**: El puntaje MUST ir de 0 a 10 000 y combinar el tiempo total (con más peso), el margen con la ola al despegar, los choques evitados y la precisión del despegue. Todos los pesos son configurables. Una misión fallida no genera puntaje.
- **FR-016**: El resultado MUST mostrar éxito o fracaso, la causa del fracaso si la hubo, la "tirada" de los ítems uno por uno, un rango S/A/B/C, una única frase narrativa en español y las opciones "Reintentar" y "Salir".
- **FR-017**: El juego MUST mantener un top 10 local con su propio campo de versión, separado del ranking del acople, con un editor de nombre arcade de 8 caracteres como máximo (alfabeto `A-Z`, `Ñ`, `0-9` y espacio, `RANGER` por defecto), operable con teclado y con toque.
- **FR-018**: Si el almacenamiento local no está disponible o está corrupto, el juego MUST funcionar igual, sin guardar y sin errores visibles.

**Controles**

- **FR-019**: La entrada MUST modelarse como acciones (`moverArriba`, `moverAbajo`, `moverIzquierda`, `moverDerecha`, `accion`, `pausa`), con un mapa configurable de teclas a acciones: flechas y WASD para moverse, Space o Enter para la acción, Esc para la pausa.
- **FR-020**: En dispositivos táctiles, el juego MUST ofrecer un joystick virtual a la izquierda y un botón de acción a la derecha, con multitouch real, sin disparar el scroll ni el zoom de la página.
- **FR-021**: En portrait MUST aparecer el aviso "Girá el dispositivo" y la partida no avanza. MUST haber un botón de pantalla completa con alternativa para los navegadores que no la soportan, y "Salir" MUST quedar visible también en pantalla completa.
- **FR-022**: Al ocultarse la pestaña o perder el foco, el juego MUST pausarse solo y soltar todas las acciones.

**Presentación visual y audio**

- **FR-023**: El mundo MUST dibujarse en pixel art con una paleta cerrada (como máximo 20 colores, derivados de los tokens del sitio), a una resolución interna de 480 × 270 con escalado entero y sin suavizado. El naranja Gargantúa marca un solo elemento por pantalla, y el teal nunca aparece dentro del mundo.
- **FR-024**: Los sprites MUST ser originales y estar definidos en el código. No se usan imágenes descargadas ni generadas externamente, ni material de la película o de terceros (sprites, fuentes, sonidos, logos, frases).
- **FR-025**: Los personajes MUST animarse cuadro por cuadro (12 a 15 fps) con anticipación, acción y rebote. Los impactos tienen hit-stop, shake y un destello, con un máximo de 3 destellos por segundo.
- **FR-026**: La ola MUST verse como una pared que ocupa el horizonte: primero es una línea que no se reconoce, después se revela con un cambio de escala de cámara. Se construye con 3 planos de parallax, y su cresta tira rocío que llega antes que ella.
- **FR-027**: El HUD y las pantallas (intro, cuenta, banners, resultado, ranking, aviso de giro) MUST ser HTML semántico superpuesto al canvas, con los tokens de cabina del sitio. Las etiquetas técnicas y los estados van en inglés y la narrativa en español rioplatense. Sin bordes redondeados.
- **FR-028**: El estado de peligro MUST distinguirse a simple vista en tres escalones (lejos, cerca, inminente): en el HUD, con el teal, el ámbar y el rojo, y en el mundo, desaturando y oscureciendo, nunca con un tinte rojo.
- **FR-029**: El audio MUST ser sintetizado por código: ambiente, chapoteo, pulso de la baliza, rumor de la ola, banners, impactos, tirada y despegue. Arranca solo después del primer gesto del usuario, tiene su propio botón de silencio y tiene dos perfiles de mezcla (teclado y táctil).
- **FR-030**: Con `prefers-reduced-motion`, el juego MUST aplicar las reducciones descritas en los Edge Cases.
- **FR-031**: Las partículas MUST tener un tope configurable (300 por defecto y 150 en táctil) y reutilizarse sin crear objetos por cuadro.
- **FR-032**: MUST existir una vista de depuración oculta (`?debug=sprites`) que muestre cada animación en loop sobre el fondo del sitio.

**Perspectiva**

- **FR-033**: El juego MUST presentarse en **vista lateral con profundidad** (belt-scroller): el horizonte y el cielo quedan visibles al fondo y el jugador se mueve en una franja de agua donde izquierda y derecha recorren el mapa, y arriba y abajo lo acercan o alejan de la cámara. La ola es una pared que entra por un costado y barre toda la franja, en todas las profundidades. Los elementos del mundo se ordenan por profundidad: lo que está más abajo en la franja se dibuja adelante. Una colisión solo cuenta si coinciden la posición horizontal y la profundidad.

### Restricciones de la constitución (Principio I — justificación de librería)

- **Librería**: Phaser 4.2.1, ya vendorizado en el repo para el simulador de acople. **No se suma ninguna librería nueva.**
- **(a) Qué resuelve**: el loop de juego, el escalado entero del pixel art, la generación de texturas a partir de los mapas de sprites, la cámara (seguimiento, look-ahead, shake y zoom) y el render de partículas por lotes.
- **(b) Por qué no se hace a mano**: se podría hacer con Canvas 2D, pero reutilizar el motor que el sitio ya carga mantiene un solo patrón de integración (montaje, desmontaje y glue) entre los dos simuladores y evita duplicar la infraestructura de cámara y escalado.
- **(c) Qué queda en JS propio**: toda la lógica del juego (física, estados, ola, baliza, despegue, puntaje, reloj, ranking, editor de nombre y mapeo de entradas) es JS vanilla puro, sin el motor ni el DOM, y se testea en aislamiento. El motor solo dibuja lo que la lógica le dicta.
- **Del prototipo** se toman las ideas, los números de balance y el arte procedural. El código React y TypeScript se reescribe; no se copia.

### Key Entities *(include if feature involves data)*

- **Partida**: el estado de la misión en un instante (fase, tiempo de misión, posición y velocidad del astronauta, aturdimiento, baliza recogida, posición del frente de la ola, carga de despegue, impulso de CASE, choques, semilla).
- **Mapa**: la disposición generada por semilla (la posición del Ranger, la baliza, los restos y CASE, y los límites del área).
- **Resultado**: el desenlace de una partida (éxito o fracaso, causa, tiempo de misión, años perdidos, margen con la ola, choques, asistencia de CASE, precisión del despegue, puntaje y rango).
- **Entrada del ranking**: nombre (hasta 8 caracteres), puntaje, tiempo de misión y fecha. El ranking es una lista de hasta 10 entradas con un campo de versión, guardada por navegador.
- **Configuración**: todos los números del gameplay, del audio y del balance, más el mapa de teclas, en un único lugar inmutable.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En una prueba con al menos 3 personas que no conocen el juego, todas entienden qué hay que hacer sin instrucciones externas y al menos 2 completan la misión en sus primeros 5 intentos.
- **SC-002**: Una partida exitosa de un jugador que ya entiende la mecánica dura entre 45 y 90 s en al menos 8 de cada 10 intentos, y un piloto de referencia simulado con la configuración por defecto la completa dentro de ese rango.
- **SC-003**: Un observador identifica correctamente el nivel de peligro (lejos, cerca o inminente) en al menos 9 de cada 10 momentos de muestra, mirando la pantalla sin leer los números del HUD.
- **SC-004**: "Reintentar" deja al jugador jugando de nuevo en menos de 5 s (la duración de la cuenta 3-2-1), sin recargar la página.
- **SC-005**: Diez ciclos seguidos de entrar y salir de la página del simulador no dejan canvas duplicados, sonidos superpuestos ni errores en la consola.
- **SC-006**: El juego se mantiene fluido (sin tirones perceptibles) durante toda la partida en un celular de gama media en landscape, incluso con la ola cerca y las partículas al tope.
- **SC-007**: El 100 % de la lógica del juego se verifica con pruebas automatizadas que corren sin navegador.
- **SC-008**: El ranking sobrevive a una recarga de la página, y el editor de nombre se completa tanto con teclado como solo con toques.
- **SC-009**: Ningún asset del juego proviene de la película ni de terceros: una revisión de los archivos de la feature no encuentra imágenes, audios ni fuentes externas nuevas.

## Assumptions

- **Origen y destino del prototipo**: `../mini-juego/` queda fuera del sitio y no se versiona. Es material de referencia, del que se toman las ideas, los números de balance y el arte procedural.
- **Assets del Playground descartados**: los PNG generados (astronauta, Ranger, baliza y restos) no los usa el prototipo y violan FR-024. El mp3 de ambiente se reemplaza por audio sintetizado (FR-029). No se versiona ninguno.
- **Fuera de alcance**: la Misión 2 del prototipo (ascenso orbital tipo shmup, armas, enemigos y acople con la Endurance), prevista para una feature 012; backend y rankings globales; selector de dificultad; abstracciones para misiones futuras.
- **Una sola dificultad**: el balance fino se ajusta por configuración, a partir de los valores por defecto del Playground (velocidad 260, arrastre 4,2, ola de exploración 40 y de huida 110, despegue 1,2 s, radio del Ranger 95, 18 restos y volumen 0,75), reescalados a la resolución de 480 × 270.
- **Solo el éxito puntúa**: es la misma regla que en el acople.
- **Intro corta en reintentos**: es la misma regla que en el acople.
- **Récord por navegador**: no hay perfiles ni sincronización. Borrar los datos del sitio borra el récord.
- **CASE incluido como P3**: lo pide el DesignSystem y existe en el prototipo. Si el tiempo aprieta, es lo primero que se recorta sin romper el MVP.
- **Reutilización del acople**: la pantalla completa, la detección de dispositivo, la base de los controles táctiles, el editor de nombre arcade y el patrón del ranking se reutilizan o se generalizan, sin romper el simulador de acople.
- **Fuentes**: las tipografías del HUD y de los banners son las que el sitio ya sirve self-hosted. Si alguna no está, se usan los fallbacks y no se suma ninguna fuente de terceros.
- **Dependencias del sitio existente**: header y footer compartidos, navegación interna con montaje y desmontaje por página, música de fondo persistente, tokens de cabina, Phaser vendorizado y el pipeline de pruebas automatizadas del repo.
