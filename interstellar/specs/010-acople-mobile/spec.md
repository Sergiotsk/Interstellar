# Feature Specification: Simulador de acople jugable en celulares y tablets

**Feature Branch**: `sec/minijuegos`

**Created**: 2026-10-08

**Status**: Draft

**Input**: User description: hacer jugable el simulador *No Time for Caution* (`minijuego-acople.html`, feature 009) en celulares y tablets táctiles. **Reemplaza FR-034 y SC-008 de la spec 009** (aviso "Simulador disponible en desktop") y amplía la plataforma objetivo a dispositivos táctiles. Decisiones tomadas con el usuario: solo orientación horizontal, con aviso para girar el dispositivo en vertical; controles a dos pulgares con multitouch; consola compacta con los 5 instrumentos; cabina a pantalla completa durante la partida; editor de nombre del ranking usable con botones táctiles; una laptop híbrida sigue usando teclado. La física, el puntaje y el ranking no cambian.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Pilotear y acoplar con los pulgares (Priority: P1)

Un visitante abre el simulador desde el celular, en horizontal. En lugar del aviso que hoy lo manda a la computadora, ve la intro y arranca la partida. La cabina ocupa toda la pantalla. Con el pulgar izquierdo rota la nave (◀ ▶) y con el derecho acelera (▲) o frena (▼). Puede mantener apretados dos controles a la vez, por ejemplo rotar mientras acelera. Lee la telemetría en una consola compacta con los mismos cinco instrumentos que en desktop. Cuando está en rango y en tolerancia aparece la orden "TAP TO DOCK"; la toca, acopla y ve su resultado.

**Why this priority**: es la razón de la feature. Sin pilotear y acoplar con el dedo, el simulador sigue sin poder jugarse en mobile.

**Independent Test**: en un celular sin teclado, en horizontal, abrir el simulador y completar un acople usando solo los controles táctiles, con la telemetría visible durante toda la partida.

**Acceptance Scenarios**:

1. **Given** un celular táctil sin teclado, **When** se abre el simulador, **Then** se ve la intro y se puede iniciar la partida (ya no aparece el aviso de desktop).
2. **Given** una partida en curso, **When** el jugador mantiene apretado ◀ y ▲ a la vez, **Then** la nave rota y acelera al mismo tiempo, y cada acción se detiene al soltar su botón.
3. **Given** la nave en rango y en tolerancia, **When** aparece "TAP TO DOCK" y el jugador lo toca, **Then** la nave acopla igual que con Enter en desktop.
4. **Given** una partida en curso, **When** el jugador toca el botón de pausa, **Then** la partida se pausa y se ofrecen "Seguir" y "Volver al hub".
5. **Given** un dedo apoyado en un control, **When** el dedo se desliza fuera del botón o el sistema cancela el toque, **Then** esa acción se suelta y la nave no queda acelerando ni rotando sola.

---

### User Story 2 - Cabina adaptada a la pantalla del dispositivo (Priority: P1)

Durante la partida, la cabina ocupa toda la pantalla del dispositivo: no se ven el header ni el footer del sitio y no hay scroll. Donde el navegador lo permite, entra en pantalla completa y fija la orientación horizontal. Los controles quedan al alcance de los pulgares, no los tapan la muesca ni las esquinas redondeadas, y no se superponen con la consola. Si el visitante pone el teléfono en vertical, la partida se pausa y se muestra un aviso de nave que le pide girarlo. Al volver a horizontal puede seguir.

**Why this priority**: en una pantalla de 360 a 430 px de alto, con el header del sitio y una consola de tamaño desktop no queda lugar para jugar. Sin esta historia, la US1 no es viable.

**Independent Test**: en celulares de distintos tamaños, en horizontal, verificar que la escena, la consola y los cuatro controles se ven completos y sin scroll; girar a vertical y verificar la pausa con el aviso.

**Acceptance Scenarios**:

1. **Given** un celular en horizontal, **When** empieza la partida, **Then** la cabina ocupa toda la pantalla, sin header, footer ni scroll, y se ven la escena, la consola compacta y los controles.
2. **Given** una partida en curso, **When** el dispositivo pasa a vertical, **Then** la partida se pausa, se sueltan los controles y aparece el aviso "Girá el dispositivo".
3. **Given** el aviso de giro visible, **When** el dispositivo vuelve a horizontal, **Then** el aviso desaparece y el jugador puede reanudar.
4. **Given** un teléfono con muesca, **When** se juega en horizontal, **Then** ningún control ni instrumento queda debajo de la muesca ni de las esquinas redondeadas.
5. **Given** una tablet en horizontal, **When** se juega, **Then** la cabina se ve completa y los controles mantienen su tamaño táctil.

---

### User Story 3 - Cargar el nombre del ranking con el dedo (Priority: P2)

Al terminar una partida que entra al ranking, el jugador carga su nombre sin teclado físico. Usa botones ▲ ▼ para cambiar la letra, ◀ ▶ para moverse entre casillas y ⌫ para borrar. También puede tocar una casilla para ir directo a ella. Confirma con el botón "Confirmar" y ve su fila resaltada en la tabla.

**Why this priority**: el ranking es parte del cierre de la partida, pero el juego se puede disfrutar aunque esta historia todavía no esté. Sin ella, el nombre queda en el valor por defecto.

**Independent Test**: en un celular sin teclado, lograr un puntaje que entre al ranking y cargar un nombre de varias letras usando solo los botones táctiles del editor.

**Acceptance Scenarios**:

1. **Given** el editor de nombre abierto en un táctil, **When** el jugador toca ▲, **Then** la letra de la casilla activa avanza igual que con la flecha arriba del teclado.
2. **Given** el editor abierto, **When** el jugador toca la cuarta casilla, **Then** el cursor pasa a esa casilla.
3. **Given** un nombre cargado, **When** el jugador toca "Confirmar", **Then** el puntaje se guarda con ese nombre y su fila aparece resaltada en la tabla.

---

### User Story 4 - Desktop y equipos híbridos sin cambios (Priority: P2)

Quien juega en una computadora o en una laptop híbrida (pantalla táctil más teclado o touchpad) sigue jugando con el teclado como hasta ahora: mismas teclas, mismo Enter para acoplar, mismo editor de nombre y misma pantalla completa con Esc. No ve los controles táctiles.

**Why this priority**: es la experiencia que hoy funciona y está en producción; no puede romperse.

**Independent Test**: repetir en desktop las pruebas de aceptación de la feature 009 y verificar que todas pasan y que los controles táctiles no aparecen.

**Acceptance Scenarios**:

1. **Given** un desktop con teclado, **When** se abre el simulador, **Then** no se muestran los controles táctiles y todas las teclas funcionan como antes.
2. **Given** una laptop híbrida con pantalla táctil y touchpad, **When** se abre el simulador, **Then** se juega en modo teclado.
3. **Given** cualquier equipo, **When** se abre el simulador con el parámetro de modo forzado (táctil o teclado), **Then** se usa el modo pedido, para poder probarlo sin el dispositivo.

---

### Edge Cases

- **Tres o más dedos a la vez**: cada control responde solo a su propio dedo, y soltar uno no suelta los otros.
- **Dedo que entra a un botón ya apoyado**: un dedo que se apoya fuera de un control y se desliza adentro no lo activa. Solo cuenta el toque que empieza sobre el control.
- **Pérdida de foco o pestaña oculta** (llamada entrante, cambio de app): la partida se pausa y se sueltan todos los controles, como en desktop (FR-036 de la 009).
- **Rotación durante el resultado o el editor de nombre**: aparece el aviso de giro, pero no se pierde el puntaje ni el nombre que se estaba cargando.
- **Navegador sin pantalla completa** (por ejemplo, el iPhone): la cabina igual ocupa toda la pantalla visible y la partida se juega igual.
- **Bloqueo de orientación rechazado**: si el navegador no permite fijar la horizontal, el aviso de giro es la red de seguridad.
- **Toque largo**: mantener apretado un control no abre menús contextuales, no selecciona texto y no hace zoom.
- **Doble toque**: tocar dos veces rápido un control no hace zoom en la página.
- **Pantalla muy baja** (celulares chicos en horizontal, unos 320 px de alto): la consola compacta y los controles siguen entrando sin superponerse.
- **Tablet con teclado conectado**: si el dispositivo informa un puntero fino, juega en modo teclado, y el parámetro de modo forzado sirve para cambiarlo.

## Requirements *(mandatory)*

### Functional Requirements

**Modo de entrada**

- **FR-001**: El simulador MUST decidir un modo de entrada, táctil o teclado, al cargar. Es táctil cuando el dispositivo tiene un puntero grueso y ningún puntero fino; en cualquier otro caso es teclado (se mantiene el criterio de equipo híbrido de la 009).
- **FR-002**: Un parámetro de la URL MUST poder forzar el modo táctil o el modo teclado, con prioridad sobre la detección.
- **FR-003**: En modo táctil, el simulador MUST iniciar la partida en lugar del aviso de desktop. **Este requisito reemplaza FR-034 de la spec 009.**

**Controles táctiles**

- **FR-004**: En modo táctil, durante la partida, MUST verse cuatro controles: rotar a la izquierda y rotar a la derecha agrupados para el pulgar izquierdo, e impulso y freno agrupados para el pulgar derecho.
- **FR-005**: Cada control MUST mantener su acción activa mientras el dedo que lo tocó siga apoyado, y soltarla cuando ese dedo se levanta, se cancela el toque o el dedo sale del control.
- **FR-006**: Los controles MUST admitir varios dedos simultáneos, cada uno con su acción independiente.
- **FR-007**: Los controles MUST producir exactamente las mismas acciones que las teclas en desktop. La física, el consumo de combustible, el puntaje y el ranking no cambian según el modo.
- **FR-008**: En modo táctil, la orden de acople MUST indicar que se toca ("TAP TO DOCK" en lugar de "PRESS ENTER TO DOCK") y tocarla MUST equivaler a apretar Enter.
- **FR-009**: En modo táctil, MUST existir un control de pausa visible durante la partida.
- **FR-010**: Todo control táctil MUST medir al menos 48 × 48 px y MUST mostrar un estado visible mientras está apretado.
- **FR-011**: Mantener apretado o tocar dos veces un control MUST NOT abrir menús contextuales, seleccionar texto ni hacer zoom.
- **FR-012**: Pausar, reintentar, terminar la partida o perder el foco MUST soltar todos los controles táctiles activos.

**Pantalla y orientación**

- **FR-013**: En modo táctil, la cabina MUST ocupar toda el área visible de la pantalla durante la partida, sin header, footer ni scroll.
- **FR-014**: Donde el navegador lo permita, iniciar la partida MUST pedir pantalla completa y fijar la orientación horizontal. Si alguna de las dos se niega, el juego MUST seguir funcionando sin error visible.
- **FR-015**: En modo táctil y orientación vertical, MUST mostrarse un aviso de nave que pida girar el dispositivo. Si había una partida en curso, MUST pausarse.
- **FR-016**: Al volver a horizontal, el aviso MUST desaparecer y el jugador MUST poder reanudar desde donde estaba, sin perder el resultado ni el nombre en edición.
- **FR-017**: En pantallas bajas, la consola MUST mostrar los cinco instrumentos de desktop (sincronía de giro, alineación, velocidad, distancia y combustible), con sus indicadores y lecturas, en una versión compacta que deje visible la escena.
- **FR-018**: Los controles y los instrumentos MUST NOT quedar debajo de la muesca, de las esquinas redondeadas ni de las barras del sistema.
- **FR-019**: Los textos de la intro y de las ayudas MUST describir los controles del modo activo: teclas en modo teclado y botones en modo táctil.

**Editor de nombre**

- **FR-020**: En modo táctil, el editor de nombre del ranking MUST ofrecer botones para cambiar la letra hacia arriba y hacia abajo, moverse a la casilla anterior y a la siguiente, y borrar, con el mismo comportamiento que sus teclas equivalentes.
- **FR-021**: Tocar una casilla del editor MUST mover el cursor a esa casilla, en cualquier modo.
- **FR-022**: Los botones del editor MUST cumplir FR-010.

**Sin regresiones**

- **FR-023**: En modo teclado, el simulador MUST verse y comportarse como en la feature 009 y MUST NOT mostrar los controles táctiles.
- **FR-024**: Las reglas de la feature 009 sobre ciclo de vida, música, silencio, movimiento reducido y pausa por foco (FR-029 a FR-036 y FR-042) MUST seguir cumpliéndose en ambos modos.

### Key Entities

- **Modo de entrada**: táctil o teclado. Se decide al cargar a partir de los punteros que informa el dispositivo o del parámetro de la URL, y define qué controles y textos se muestran.
- **Toque activo**: un dedo apoyado sobre un control, con su identificador y la acción que sostiene. El conjunto de toques activos define las acciones táctiles en cada instante.
- **Orientación**: horizontal o vertical. En modo táctil, la vertical bloquea la partida con el aviso de giro.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En el 100 % de los celulares y tablets táctiles probados (al menos un iPhone y un Android), el simulador inicia la partida en lugar del aviso de desktop. **Este criterio reemplaza SC-008 de la spec 009**, cuya parte sobre el hub sigue vigente: el hub se ve sin desplazamiento horizontal ni elementos cortados.
- **SC-002**: Un jugador que nunca usó el simulador completa un acople en mobile, sin instrucciones externas, en no más del doble de intentos que en desktop.
- **SC-003**: En pantallas horizontales de 320 a 1024 px de alto, la escena, la consola con sus 5 instrumentos y los 4 controles se ven completos, sin scroll ni superposiciones, en el 100 % de los tamaños probados.
- **SC-004**: Con dos controles apretados a la vez, ambos actúan el 100 % de las veces, y al soltar cualquiera de ellos su acción se detiene enseguida, sin que la nave quede acelerando o rotando sola.
- **SC-005**: Al girar a vertical durante una partida, se pausa y aparece el aviso el 100 % de las veces; al volver a horizontal se puede reanudar sin perder el estado.
- **SC-006**: Un jugador carga un nombre de 5 letras con los botones táctiles en menos de 30 s.
- **SC-007**: Las pruebas de aceptación de la feature 009 en desktop siguen pasando al 100 %, y las pruebas automatizadas existentes y nuevas pasan todas.
- **SC-008**: Ninguna interacción con los controles provoca zoom, selección de texto ni menús contextuales en los dispositivos probados.

## Assumptions

- **Plataforma objetivo ampliada**: desktop con teclado (sin cambios) más celulares y tablets táctiles en navegadores evergreen móviles (Safari iOS, Chrome Android; últimas 2 versiones).
- **Solo horizontal**: no se diseña una cabina vertical. La vertical solo muestra el aviso de giro.
- **Botones, no gestos**: no hay control por inclinación (giroscopio) ni por deslizamiento. El giroscopio queda como posible mejora futura.
- **Acoplar sin botón propio**: en táctil se acopla con la orden que aparece en rango, en lugar de un botón permanente equivalente al Enter libre de desktop. Así se evitan rechazos por toques accidentales.
- **Misma dificultad**: las tolerancias, el combustible y el puntaje son iguales en ambos modos, y el ranking es compartido. Si se detecta que el táctil queda en desventaja, el ajuste se trata en otra spec.
- **Vibración opcional**: en los navegadores que la soportan, un pulso breve al acoplar y al ser rechazado. No es requisito; en iOS no existe.
- **Sin teclado virtual**: el editor de nombre no abre el teclado del sistema; usa sus propios botones.
- **Hub**: no cambia. Ya es responsive y sigue cumpliendo la parte vigente de SC-008 de la 009.
- **Fuera de alcance**: cabina en vertical, control por giroscopio, gamepads, PWA o instalación en la pantalla de inicio, y balance distinto por dispositivo.
- **Dependencias**: feature 009 en producción (PR #42): modelo de acciones FR-011, pantalla completa FR-042, ranking y editor de nombre.
