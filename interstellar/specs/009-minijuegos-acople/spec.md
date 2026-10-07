# Feature Specification: Hub de Minijuegos + Capítulo 1 "No Time for Caution" (acople con la Endurance)

**Feature Branch**: `sec/minijuegos`

**Created**: 2026-10-07

**Status**: Draft

**Input**: User description: brief `PromtInicialMiniJuegos.md`, bloque 1 ("Input para `/speckit-specify`"). Rehacer `minijuegos.html` como mapa de misiones (4 bahías, solo la 1 jugable) y crear la página del primer minijuego, *No Time for Caution*: un arcade de acople contra una estación que rota. El jugador sincroniza rotación, velocidad relativa y distancia; la partida dura entre 30 y 90 s, tiene HUD de cockpit, narrativa breve en español, puntaje y récord local. Está integrado al sitio existente (layout, navegación SPA, música de fondo) y lo rige la constitución v2.3.0.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Jugar y completar el acople (Priority: P1)

Un visitante entra a la página del simulador. Ve una intro cinemática breve, en frases cortas y en español, que lo pone en situación: la Tierra se muere y la Endurance gira. Después toma el control de una nave pequeña con el teclado. Tiene que igualar el giro de la estación, acercarse despacio y entrar alineado al puerto de acople. Lee su situación por el movimiento, las partículas de los propulsores, la vibración, el sonido y un HUD de computadora de navegación. Si cumple las tolerancias, la misión se completa y ve sus estadísticas y su puntaje.

**Why this priority**: es el corazón de la feature. Sin un acople jugable y entendible no hay minijuego, y el hub no tiene a dónde llevar.

**Independent Test**: abrir la página del simulador en desktop, sin instrucciones externas, y lograr un acople exitoso que muestre tiempo, combustible restante, velocidad relativa final, precisión de sincronización y puntaje.

**Acceptance Scenarios**:

1. **Given** el visitante abre la página del simulador en un equipo con teclado, **When** termina la intro, o la saltea, **Then** empieza la partida con la nave lejos del puerto, la estación girando y el HUD visible en estado APPROACHING.
2. **Given** la partida está en curso, **When** el jugador mantiene ArrowLeft o ArrowRight, **Then** la nave cambia su velocidad de giro en ese sentido y el indicador Rotation Sync refleja la nueva diferencia con la estación.
3. **Given** la partida está en curso, **When** el jugador mantiene ArrowUp, **Then** la nave acelera hacia adelante, se ven partículas del propulsor y baja el combustible.
4. **Given** la partida está en curso, **When** el jugador mantiene Space, **Then** la nave reduce su velocidad relativa (retropropulsión) y consume combustible.
5. **Given** la rotación, la velocidad relativa y la alineación están dentro de tolerancia, **When** la nave entra en la zona de acople, **Then** el estado pasa a DOCKED, se escucha y se ve la confirmación del acople, y aparece la pantalla de éxito con estadísticas y puntaje.
6. **Given** la nave se acerca al puerto, **When** alguna variable sale de tolerancia, **Then** el HUD cambia a un estado de peligro (UNSAFE APPROACH) distinguible a simple vista del estado seguro (DOCKING RANGE).

---

### User Story 2 - Fallar, entender por qué y reintentar (Priority: P1)

El jugador se equivoca: llega demasiado rápido, entra torcido, pierde el control del giro o se queda sin combustible lejos del puerto. La misión falla, el juego le dice en una frase cuál fue la causa y le ofrece reintentar al toque o volver al hub.

**Why this priority**: un arcade de reintentos vive del ciclo fallar → entender → reintentar. Sin ese ciclo no hay rejugabilidad, y la dificultad pierde sentido.

**Independent Test**: provocar a propósito cada una de las causas de fallo y verificar que la pantalla de fracaso nombra la causa correcta y que "Reintentar" arranca una partida nueva limpia, sin repetir la intro completa.

**Acceptance Scenarios**:

1. **Given** la nave llega al puerto con velocidad relativa por encima del límite de impacto, **When** hace contacto, **Then** la misión falla con la causa "impacto a velocidad excesiva".
2. **Given** la nave llega al puerto con un ángulo fuera de tolerancia, **When** hace contacto, **Then** la misión falla con la causa "ángulo de entrada incorrecto".
3. **Given** la velocidad de giro de la nave supera el límite de control, **When** se sostiene más allá del margen permitido, **Then** la misión falla con la causa "pérdida de control".
4. **Given** el combustible llega a cero, **When** la nave no está en condiciones de acoplar por inercia, **Then** la misión falla con la causa "sin combustible".
5. **Given** la pantalla de fracaso o de éxito, **When** el jugador elige "Reintentar", **Then** arranca una partida nueva con todas las variables reiniciadas.

---

### User Story 3 - Hub de misiones con récord y capítulos bloqueados (Priority: P2)

Un visitante entra a Minijuegos desde el menú del sitio. Ve un mapa de misiones con cuatro bahías, que son los capítulos de una misma misión:

1. *No Time for Caution*, disponible.
2. *Miller's Wave Escape*, bloqueado.
3. *Gargantua Slingshot*, bloqueado.
4. *Tesseract Data Sync*, bloqueado.

La bahía 1 muestra su mejor puntaje si ya jugó, o un estado vacío si no, y lleva al simulador. Las bloqueadas se ven, pero no se pueden activar, y anuncian "Próximamente".

**Why this priority**: es la puerta de entrada y el marco narrativo de "capítulos de una misión". Es P2 porque, sin el juego (US1), el hub solo promete.

**Independent Test**: abrir `minijuegos.html` en desktop y en mobile y verificar las cuatro bahías, los estados disponible y bloqueado, el enlace funcional al simulador y que el récord aparece después de un acople exitoso.

**Acceptance Scenarios**:

1. **Given** el visitante nunca jugó, **When** abre el hub, **Then** la bahía 1 muestra el estado vacío del récord, por ejemplo "Sin registro".
2. **Given** el visitante ya completó el acople, **When** vuelve al hub, por navegación interna o recargando, **Then** la bahía 1 muestra el mejor puntaje guardado.
3. **Given** las bahías 2 a 4, **When** el visitante intenta activarlas con mouse o teclado, **Then** no navegan a ningún lado y comunican claramente que están bloqueadas.
4. **Given** el hub, **When** se recorre con teclado, **Then** el foco es visible y solo la bahía disponible es un destino navegable.
5. **Given** el hub, **When** se carga, **Then** ya no aparece la terminal de memes de TARS.

---

### User Story 4 - Superar el propio récord (Priority: P2)

El jugador quiere mejorar. Al terminar con éxito, la pantalla de resultado le dice si superó su mejor puntaje, y el nuevo récord queda guardado en ese navegador.

**Why this priority**: es el incentivo principal para reintentar, pero el juego ya se disfruta sin él.

**Independent Test**: lograr dos acoples con puntajes distintos y verificar que el récord guardado es siempre el mayor y que la pantalla avisa "nuevo récord" solo cuando corresponde.

**Acceptance Scenarios**:

1. **Given** no hay récord guardado, **When** el jugador completa el acople, **Then** ese puntaje queda como récord y se anuncia como nuevo récord.
2. **Given** hay un récord de N puntos, **When** el jugador completa con menos de N, **Then** el récord no cambia y se muestra junto al puntaje actual.
3. **Given** el navegador no permite almacenamiento local, por ejemplo en modo privado estricto, **When** el jugador completa el acople, **Then** el juego funciona igual, muestra el puntaje y simplemente no lo conserva, sin errores visibles.

---

### User Story 5 - Convivir con el sitio: navegación, música y mobile (Priority: P3)

El simulador es una página más del sitio: tiene el header y el footer, se llega y se sale con la navegación interna, y respeta la música de fondo. Durante el juego la música se pausa o se atenúa, y al salir vuelve a como estaba. En un dispositivo táctil sin teclado, en vez de un juego injugable, se ve un aviso de nave que invita a jugar en desktop y ofrece volver al hub.

**Why this priority**: es la calidad de integración. No suma gameplay, pero sin ella la sección se siente pegada con cinta.

**Independent Test**: navegar hub → simulador → otra sección → simulador → hub varias veces, sin recargar, y verificar que no hay errores en consola, que nunca hay dos juegos corriendo y que la música queda en el estado que eligió el usuario. Abrir el simulador en un celular y ver el aviso.

**Acceptance Scenarios**:

1. **Given** la música de fondo del sitio está activada, **When** el visitante entra al simulador y empieza a jugar, **Then** la música del sitio se pausa o se atenúa.
2. **Given** el visitante está en el simulador, **When** navega a otra página del sitio, **Then** el juego se detiene por completo, sin sonido residual ni proceso en segundo plano, y la música del sitio recupera el estado que tenía antes.
3. **Given** el visitante entró y salió del simulador varias veces, **When** vuelve a entrar, **Then** hay una sola partida activa y un solo lienzo de juego.
4. **Given** un dispositivo táctil sin teclado físico, **When** se abre el simulador, **Then** se muestra el aviso "Simulador disponible en desktop", o equivalente, con enlace al hub, y no arranca la partida.
5. **Given** el juego tiene su propio control de silencio, **When** el jugador lo activa, **Then** se silencian solo los sonidos del juego, sin cambiar la preferencia de música del sitio.

---

### Edge Cases

- **Teclas que hacen scroll**: durante la partida, las flechas y Space no deben desplazar la página ni activar otros controles del sitio. Fuera de la partida (intro, resultados, aviso) el teclado se comporta normal.
- **Pérdida de foco o pestaña oculta**: si la ventana pierde el foco o la pestaña se oculta en medio de la partida, el juego se pausa y suelta todas las teclas que estaban apretadas, así no queda un propulsor "trabado". Al volver se reanuda con un gesto del jugador.
- **Cambio de tamaño de ventana**: el lienzo se adapta a la nueva resolución sin reiniciar la partida ni deformar la escena.
- **Movimiento reducido**: con la preferencia de movimiento reducido del sistema activa, no hay sacudidas fuertes de cámara y el giro del fondo estelar se atenúa o se detiene. El juego sigue siendo jugable y legible.
- **Autoplay de audio bloqueado**: si el navegador no permite sonido hasta un gesto del usuario, el juego arranca igual y el audio se habilita con la primera tecla o el primer clic.
- **Récord corrupto o ajeno**: si el valor guardado no es un puntaje válido, se ignora y se trata como "sin registro".
- **Equipo híbrido**: en una laptop con pantalla táctil y teclado se juega normalmente. El aviso aparece solo si no hay forma razonable de usar teclado.
- **Saltear la intro**: la intro se puede saltear con una tecla o un clic. En los reintentos no se vuelve a mostrar completa.

## Requirements *(mandatory)*

### Functional Requirements

**Hub de misiones (`minijuegos.html`)**

- **FR-001**: El hub MUST presentar las cuatro bahías como capítulos ordenados de una misma misión, con título, subtítulo de tipo de misión, una descripción breve y su estado.
- **FR-002**: La bahía 1 (*No Time for Caution*) MUST estar disponible y llevar a la página del simulador mediante un enlace normal del sitio.
- **FR-003**: Las bahías 2 a 4 MUST verse como bloqueadas ("Próximamente"), no ser activables por mouse ni teclado y no ser destinos de tabulación.
- **FR-004**: La bahía 1 MUST mostrar el mejor puntaje guardado en ese navegador o, si no existe, un estado vacío explícito.
- **FR-005**: El hub MUST dejar de mostrar la terminal de memes de TARS. Las demás páginas que la usan no cambian.
- **FR-006**: El hub MUST ser responsive y cumplir los criterios de aceptación de página de la constitución.

**Flujo del simulador (`minijuego-acople.html`)**

- **FR-007**: El simulador MUST seguir el flujo carga → intro → partida → resultado (éxito o fracaso), y el resultado MUST ofrecer "Reintentar" y "Volver al hub".
- **FR-008**: La intro MUST ser breve (como referencia, menos de 15 s si no se saltea), usar frases cortas en español con transiciones cinematográficas y poder saltearse con una tecla o un clic.
- **FR-009**: "Reintentar" MUST iniciar una partida nueva con todas las variables reiniciadas, sin pasar otra vez por la intro completa.

**Mecánica de acople**

- **FR-010**: El jugador MUST poder rotar a la izquierda (ArrowLeft), rotar a la derecha (ArrowRight), impulsarse hacia adelante (ArrowUp) y frenar o aplicar retropropulsión (Space).
- **FR-011**: Los controles MUST modelarse como **acciones del jugador** (rotar izquierda, rotar derecha, impulso, freno), independientes del dispositivo de entrada, para poder sumar otros métodos sin cambiar las reglas del juego.
- **FR-012**: La estación MUST rotar a velocidad constante durante toda la partida.
- **FR-013**: El juego MUST evaluar de forma continua tres variables:
  - la diferencia de velocidad angular entre la nave y la estación;
  - la velocidad relativa de aproximación;
  - la distancia al puerto de acople.
  También MUST evaluar la alineación de la nave con el puerto.
- **FR-014**: La misión MUST completarse cuando la nave entra en la zona de acople con la diferencia de giro, la velocidad relativa y la alineación dentro de sus tolerancias.
- **FR-015**: La misión MUST fallar en cuatro casos:
  - (a) contacto con el puerto a velocidad relativa por encima del límite;
  - (b) contacto con ángulo fuera de tolerancia;
  - (c) velocidad de giro de la nave por encima del límite de control durante más de un margen breve;
  - (d) combustible agotado sin condiciones de acoplar.
  La pantalla de fracaso MUST nombrar la causa.
- **FR-016**: El impulso, el freno y la rotación MUST consumir combustible. Con el combustible agotado, la nave sigue por inercia y no responde a esos controles.
- **FR-017**: La física MUST ser simplificada y priorizar sensación y legibilidad sobre realismo: arcade, no simulador orbital.
- **FR-018**: Todos los parámetros de jugabilidad MUST estar centralizados en un único punto de configuración, sin valores dispersos:
  - velocidades de rotación y de la estación;
  - empuje y fricción;
  - tolerancias de ángulo, giro y velocidad;
  - radio de acople;
  - combustible inicial y consumos;
  - límites de fallo;
  - pesos del puntaje.
- **FR-019**: La dificultad por defecto MUST permitir que un jugador que entiende la mecánica acople en 30 a 90 s, y debe ser lo bastante exigente como para que el primer intento suela fallar o salir con bajo puntaje.

**Estados de la misión y HUD**

- **FR-020**: La partida MUST tener estados explícitos y mutuamente excluyentes, que el HUD muestra con etiquetas en inglés:
  - APPROACHING: lejos del puerto;
  - MATCHING ROTATION: cerca, con la rotación todavía fuera de tolerancia;
  - DOCKING RANGE: cerca y con todas las variables en tolerancia;
  - UNSAFE APPROACH: cerca y con alguna variable fuera de un umbral de peligro;
  - DOCKED;
  - MISSION FAILED.
  Las etiquetas pueden ajustarse en el plan siempre que se mantengan consistentes.
- **FR-021**: El HUD MUST mostrar Rotation Sync, Relative Velocity, Distance, Fuel y Docking Status, con estética de computadora de navegación: oscura, monoespaciada, de líneas finas, con la paleta de cockpit del sitio y sin estilo arcade genérico.
- **FR-022**: El estado seguro y el estado peligroso MUST distinguirse por **al menos dos canales además del texto**, elegidos entre color del HUD, cambio de LED o indicador, sonido de advertencia, vibración de la nave o de la cámara, y partículas.
- **FR-023**: Las etiquetas técnicas del HUD MUST ir en inglés. La narrativa, los botones, las causas de fallo y los textos de resultado MUST ir en español.

**Resultado, puntaje y récord**

- **FR-024**: Al completar el acople, el resultado MUST mostrar el tiempo total, el combustible restante, la velocidad relativa final, la precisión de sincronización y el puntaje.
- **FR-025**: El puntaje MUST ser un número entero no negativo, donde mayor es mejor. Combina la precisión de sincronización, el combustible restante, el tiempo, la suavidad del acople y la velocidad relativa final, con pesos definidos en la configuración. A igual desempeño, el puntaje MUST ser siempre el mismo (determinístico).
- **FR-026**: Una misión fallida MUST mostrar sus estadísticas y la causa del fallo, pero no genera puntaje ni modifica el récord.
- **FR-027**: El mejor puntaje MUST persistir localmente en el navegador, sin servidor. Se actualiza solo si el puntaje nuevo es mayor, y la pantalla de éxito anuncia "nuevo récord" cuando corresponde.
- **FR-028**: Si el almacenamiento local no está disponible o contiene un valor inválido, el juego MUST seguir funcionando sin errores visibles y tratar el récord como inexistente.

**Integración con el sitio**

- **FR-029**: El simulador MUST mostrar el header y el footer compartidos del sitio y ser accesible desde el hub por la navegación interna.
- **FR-030**: Al salir del simulador por cualquier vía de navegación interna, el juego MUST detenerse por completo y liberar sus recursos: sin sonido residual, sin captura de teclado, sin ciclos de animación activos. Volver a entrar MUST producir una única instancia del juego.
- **FR-031**: Mientras se juega, la música de fondo del sitio MUST pausarse o atenuarse. Al salir del simulador MUST volver al estado que tenía antes de entrar, encendida o apagada según la preferencia del usuario.
- **FR-032**: El simulador MUST tener su propio control de silencio, que afecta solo a los sonidos del juego.
- **FR-033**: El sistema de sonido del juego MUST contemplar ambiente, propulsores, advertencias, impactos, acople y música. Para el MVP se aceptan sonidos placeholder originales o libres.
- **FR-034**: En dispositivos táctiles sin teclado, el simulador MUST mostrar un aviso de nave con enlace al hub en lugar de iniciar la partida.
- **FR-035**: El simulador MUST respetar la preferencia de movimiento reducido: sin sacudidas fuertes y con el movimiento del fondo atenuado.
- **FR-036**: La partida MUST pausarse automáticamente al perder el foco u ocultarse la pestaña, y soltar todos los controles activos.

**Contenido y derechos**

- **FR-037**: El juego MUST usar solo gráficos y sonidos originales, procedurales o libres. No usa logos, clips, música, diálogos ni material promocional de la película. El hub puede reutilizar fotogramas que el sitio ya acredita.
- **FR-038**: Toda cifra que provenga de la película y se muestre al visitante (por ejemplo, la velocidad de giro de la Endurance) MUST etiquetarse como `✎ Licencia narrativa` o verificarse contra fuente y etiquetarse según su nivel de rigor (Principio VI).
- **FR-039**: Los nombres propios tomados de la película (Endurance, Ranger) MUST poder reemplazarse por genéricos cambiando un único lugar.

**Calidad**

- **FR-040**: Las reglas del juego MUST poder verificarse con pruebas automatizadas sin ejecutar el motor gráfico: el avance de la física simplificada, la evaluación del acople y de las causas de fallo, las transiciones de estado, el cálculo del puntaje y la lectura y escritura del récord.
- **FR-041**: Agregar una misión futura MUST requerir solo sumar su bahía en el hub, su página y su propio módulo de misión, sin modificar el código de la misión 1 ni el del hub más allá de la nueva bahía.

### Restricciones de la constitución (Principio I — justificación de librería)

La constitución exige que toda feature que introduzca una librería la justifique en su spec. Esta feature introduce un **motor de juego 2D (Phaser)**:

- **(a) Problema que resuelve**: el loop de juego con paso de tiempo estable, la gestión de escenas (intro, partida, resultado), el input de teclado con estado de teclas, los sistemas de partículas para los propulsores, los efectos de cámara (sacudida, zoom), el audio con varios canales y el escalado del lienzo a distintas resoluciones.
- **(b) Por qué no con plataforma nativa**: Canvas 2D y Web Audio cubren cada pieza por separado, pero reimplementar el loop, las escenas, las partículas, la cámara y el escalado a mano suma cientos de líneas de infraestructura que no son el foco de la feature. El foco es la mecánica de acople. Las **reglas** del juego igual se escriben a mano e independientes del motor (FR-040). El motor solo dibuja.
- **(c) Peso e impacto**: se carga **solo en la página del simulador**, después del primer pintado, y nunca en el hub ni de forma global. El peso exacto en KB gzip de la versión elegida y su impacto en la carga se **miden y registran en `research.md` durante `/speckit-plan`**, junto con la elección de versión (3.x o 4.x).
- **(d) Páginas**: únicamente `minijuego-acople.html`.
- Se prototipa desde un CDN de ESM con versión fijada y se **vendoriza** en `js/vendor/phaser@<version>/` antes de cerrar la feature.

### Key Entities *(include if feature involves data)*

- **Misión**: un capítulo del hub. Tiene identificador, número de capítulo, título, tipo de misión, descripción breve, estado (disponible o bloqueado) y, si está disponible, el destino de la página de juego.
- **Nave del jugador**: posición, orientación, velocidad lineal, velocidad angular y combustible restante.
- **Estación**: posición, orientación, velocidad angular constante y ubicación y orientación del puerto de acople, que giran con ella.
- **Estado de la partida**: el estado actual de la misión (FR-020), el tiempo transcurrido, las acciones del jugador activas y, al terminar, el desenlace (éxito o causa de fallo).
- **Resultado de partida**: desenlace, tiempo total, combustible restante, velocidad relativa final, precisión de sincronización, suavidad del acople y puntaje (solo si hubo éxito).
- **Récord**: el mejor puntaje de la misión 1 en ese navegador. Opcionalmente incluye la fecha y las estadísticas de esa partida.
- **Configuración de juego**: el conjunto centralizado de parámetros de FR-018.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En una prueba con al menos 3 personas que no conocen el juego, todas entienden qué hay que hacer sin instrucciones externas y al menos 2 logran un acople exitoso en sus primeros 5 intentos.
- **SC-002**: Una partida completada por un jugador que ya entiende la mecánica dura entre 30 y 90 s en al menos 8 de cada 10 intentos exitosos.
- **SC-003**: Un observador identifica correctamente si el acople es "seguro" o "peligroso" en al menos 9 de cada 10 momentos de muestra, mirando la pantalla sin leer los números del HUD.
- **SC-004**: Desde la pantalla de resultado, una partida nueva arranca en menos de 2 s después de elegir "Reintentar".
- **SC-005**: Tras 10 ciclos consecutivos de entrar y salir del simulador por navegación interna, sin recargar, hay 0 errores en consola, nunca más de una partida o lienzo activo, y la música del sitio queda en el estado elegido por el usuario el 100 % de las veces.
- **SC-006**: El mejor puntaje sigue disponible después de cerrar y reabrir el navegador, y se ve en el hub en el 100 % de las pruebas en las que el almacenamiento está disponible.
- **SC-007**: El hub carga sin descargar el motor del juego. La página del simulador muestra su contenido inicial (aviso o intro) en menos de 3 s en una conexión de banda ancha típica.
- **SC-008**: En celular, el hub se ve y se navega sin desplazamiento horizontal ni elementos cortados, y el simulador muestra el aviso en el 100 % de los dispositivos táctiles sin teclado probados.
- **SC-009**: El 100 % de las reglas de juego listadas en FR-040 tienen pruebas automatizadas y todas pasan.
- **SC-010**: Ninguna cifra de la película queda visible al visitante sin su etiqueta de nivel de rigor.

## Assumptions

- **Plataforma objetivo**: desktop con teclado, en navegadores evergreen (últimas 2 versiones). Los controles táctiles quedan fuera del MVP; el modelo de acciones (FR-011) los habilita a futuro.
- **Una sola dificultad**: no hay selector de niveles, y el balance fino se ajusta por configuración.
- **Solo el éxito puntúa**: una misión fallida no genera puntaje (decisión tomada ante la ambigüedad del brief, que pedía "recibir un score" al completar o fallar).
- **Contacto con el casco**: el contacto con la estación fuera del puerto cuenta como fallo por "impacto" si supera el límite de velocidad. Por debajo de ese límite, el roce no es fallo.
- **Intro corta en reintentos**: la intro completa se muestra la primera vez de cada visita a la página. Los reintentos van directo a la partida.
- **Récord por navegador**: no hay perfiles ni sincronización entre dispositivos. Borrar los datos del sitio borra el récord.
- **Textos de bahías 2 a 4**: se reutilizan los títulos y descripciones que ya están redactados (y comentados) en `minijuegos.html`. Lo que hoy aparece como "67 RPM" se etiqueta como licencia narrativa o se quita.
- **Audio placeholder**: los sonidos definitivos se reemplazan más adelante, sin cambiar la lógica.
- **Fuera de alcance**:
  - el gameplay de los capítulos 2 a 4;
  - backend, rankings globales y cuentas (la constitución reserva Firebase para una spec futura);
  - controles táctiles;
  - una pantalla principal propia del juego;
  - abstracciones para misiones que todavía no existen.
- **Dependencias del sitio existente**:
  - header y footer compartidos;
  - navegación interna con montaje y desmontaje por página;
  - música de fondo persistente con su preferencia guardada;
  - tokens de diseño y paleta de cockpit;
  - campo estelar compartido;
  - pipeline de pruebas automatizadas del repo.
