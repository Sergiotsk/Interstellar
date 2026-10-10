# Feature Specification: Capítulo 2 "Miller's Wave Escape" — réplica fiel del juego del Playground

**Feature Branch**: `sec/minijuegos`

**Created**: 2026-10-09 (v2, mismo día: reemplaza la v1)

**Status**: Draft

**Input**: User description: replicar en la sección Minijuegos (bahía 02) el juego creado en Google AI Studio Playground (`../mini-juego/`: React + TypeScript, `App.tsx` de ~5100 líneas con render Canvas 2D), adaptado a las restricciones del TP (sin React, sin TypeScript, sin build).

**Fuente de verdad**: el código de `../mini-juego/App.tsx`, `constants.ts` y `utils/helper.tsx`. `PromptMiniJuegoMiller.md` y `DesignSystemMiniJuegoMiller.md` quedan como referencia secundaria y **no** mandan sobre el original.

## Clarifications

### Session 2026-10-09

- Q: ¿La v1 (belt-scroller lateral, solo Misión 1, hecha a partir de los briefs) cumple? → A: No. "No tiene nada que ver con el proyecto que te pasé". Hay que replicar el juego real.
- Q: ¿Qué alcance tiene la réplica? → A: El juego completo: Fase 1 de superficie, transición y Fase 2 shmup hasta el acople con la Endurance.
- Q: ¿Con qué motor? → A: Phaser 4.2.1 (ya vendorizado). Las funciones de dibujo del original se portan casi 1:1 sobre un `CanvasTexture` de Phaser (contexto 2D real), para que el juego se vea igual.
- Q: (posterior) ¿La Fase 1 lleva enemigos? → A: Sí. Drones y alimañas: los tipos `bio_drone` y `trench_lurker` que el original declaraba sin implementar. Además hay que dibujar la mira con autoapuntado y arreglar los disparos que a veces no salen (FR-031 a FR-033).
- Q: ¿Qué se hace con lo ya commiteado? → A: Se conserva el refactor a `js/minijuegos/comun/`. Se reemplazan `js/minijuegos/miller/`, la página y estos documentos.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fase 1: explorar la superficie, recuperar la baliza y subir al Ranger (Priority: P1)

El jugador abre el simulador y ve el briefing "MILLER'S WAVE ESCAPE" con las dos fases. Inicia la misión: corre una cuenta de 2,5 s y aparece el banner "FASE 01 // EXPLORACIÓN DE SUPERFICIE". Desde una vista cenital del océano de Miller (cáusticas, ondas, restos de la sonda), mueve al astronauta en 2D con inercia y arrastre del agua. Puede saltar, deslizarse y disparar la carabina de pulso, que apunta sola hacia donde camina. Sigue el sonar de la baliza, que se acelera al acercarse, y la recoge. La ola avanza en diagonal, cada vez más rápido. Vuelve al Ranger estacionado y lo aborda con [E] antes de que la ola lo alcance.

**Why this priority**: es la primera mitad del juego y la puerta a la Fase 2.

**Independent Test**: iniciar una misión en desktop, recuperar la baliza y abordar el Ranger. El juego tiene que pasar a la transición de la Fase 2.

**Acceptance Scenarios**:

1. **Given** el briefing está visible, **When** el jugador elige "Iniciar misión completa", **Then** corre la cuenta de 2,5 s con la equivalencia de tiempo terrestre y después aparece el banner de la Fase 01.
2. **Given** la Fase 1 está en curso, **When** el jugador mantiene WASD o las flechas, **Then** el astronauta acelera con inercia y el agua lo frena al soltar, con ondas y chapoteo al correr.
3. **Given** el astronauta está en el agua, **When** presiona Espacio, **Then** salta con gravedad y cae con una onda grande. **When** presiona Shift o C, **Then** hace un slide rápido con enfriamiento.
4. **Given** la Fase 1 está en curso, **When** presiona J, X, Z, Enter o hace clic, **Then** dispara la carabina de pulso en la dirección de apuntado, con autoapuntado si hay un blanco cerca de la mira.
5. **Given** la baliza no fue recogida, **When** el astronauta se acerca, **Then** el sonar suena más seguido y más agudo. **When** entra en el radio de recogida (58), **Then** suena la fanfarria, el banner "¡BALIZA DE MILLER RECUPERADA!" pide subir al Ranger y la ola acelera a la velocidad de huida (115).
6. **Given** el astronauta está a 120 o menos del Ranger, **When** presiona E o F (o toca el botón "BOARD"), **Then** aborda la nave. Si ya tiene la baliza, arranca la transición a la Fase 2.
7. **Given** el astronauta alcanza a CASE, **When** entra en su radio (62), **Then** recibe 2,5 s de impulso de velocidad y CASE pasa a seguirlo rodando.

---

### User Story 2 - Fase 2: shmup vertical de 10.000 m hasta acoplar con la Endurance (Priority: P1)

Tras el despegue, el Ranger queda abajo y al centro. El jugador asciende 10.000 m por 5 sectores (tropósfera, cazas estratosféricos, cinturón de asteroides ionizado, cruceros orbitales y el Dreadnought). Se mueve en 2D y dispara cañones de plasma que mejoran de doble a triple y a cuádruple con las cápsulas "P". Lanza misiles teledirigidos (Q), detona bombas EMP (B) y junta celdas de escudo. Derrota al Titan Sentinel Dreadnought y, al llegar a los 10.000 m, la Endurance desciende y el Ranger se acopla.

**Why this priority**: es el corazón del juego original: la mayor parte del código y del tiempo de partida.

**Independent Test**: completar la Fase 2 hasta "ATRAQUE EN EL ENDURANCE COMPLETADO" y verificar la tirada de resultados con su rango.

**Acceptance Scenarios**:

1. **Given** terminó la transición, **When** empieza la Fase 2, **Then** el fondo es espacio con estrellas que caen a velocidad de warp, y la barra superior muestra el sector y la altitud "▲ N m / 10,000m".
2. **Given** la Fase 2 está en curso, **When** el jugador dispara, **Then** salen 2, 3 o 4 proyectiles según el nivel del cañón, con el sonido láser arcade.
3. **Given** cruza 2000, 4200, 6500 u 8500 m, **When** cambia el sector, **Then** aparece el banner del sector con su advertencia, y en el sector 3 llegan asteroides y minas.
4. **Given** derribó un enemigo, **When** muere, **Then** suma puntos con el multiplicador de combo y puede soltar mejoras (P, B, celda, misiles). Los drones de carga siempre sueltan P o B.
5. **Given** llega a 8800 m en el sector 5, **When** aparece el Dreadnought, **Then** se ve la barra de vida del jefe, con ráfagas de 5 disparos y aura de escudo mientras tiene más del 50 %.
6. **Given** llega a 10.000 m, **When** la Endurance desciende, **Then** el Ranger es atraído al puerto, suena la fanfarria de acople y aparece la pantalla de victoria con la tirada (tiempo, años perdidos, enemigos, acople, total) y el sello de rango S/A/B/C.
7. **Given** recibe daño, **When** el escudo está activo, **Then** baja primero el escudo y después el casco. Con el casco en 0, la misión falla.

---

### User Story 3 - Morir, reintentar y entrar al Hall of Fame (Priority: P2)

Si la ola alcanza al astronauta o el casco del Ranger llega a cero, el jugador ve la secuencia de muerte y la pantalla "MISSION CRITICAL FAILURE" con la causa, el tiempo sobrevivido, el tiempo terrestre perdido, el puntaje y un "AUTO RETRY IN 9…0". Puede reintentar con Espacio, Enter, R o el botón. Si gana, carga su nombre (hasta 8 letras) y entra al Hall of Fame, que se ve desde el briefing.

**Why this priority**: es el ciclo de rejugabilidad del original.

**Independent Test**: perder contra la ola, reintentar sin recargar la página, ganar una partida, guardar el nombre y verlo en el ranking después de recargar.

**Acceptance Scenarios**:

1. **Given** la ola alcanza al astronauta, **When** muere, **Then** se ve la animación de caída, el banner "¡ALCANZADO POR LA OLA!" y después la pantalla de fallo con "ALCANZADO POR LA OLA".
2. **Given** se ve la pantalla de fallo, **When** el jugador presiona Espacio, Enter o R, **Then** arranca una misión nueva sin recargar la página.
3. **Given** ganó, **When** guarda su nombre, **Then** aparece "✓ RECORD COMMITTED TO RELATIVITY LOG" y la entrada queda en el Hall of Fame (top 10, guardado local).
4. **Given** hay un récord guardado, **When** se abre el hub, **Then** la bahía 02 muestra el mejor puntaje.

---

### User Story 4 - Jugar en el celular (Priority: P2)

En un dispositivo táctil aparecen los controles del original. A la izquierda hay un D-pad de 4 direcciones. A la derecha, en la Fase 1: BOARD (cuando corresponde), SLIDE, JUMP y FIRE; en la Fase 2: BOMB, MISSILE y FIRE. Se juega en horizontal, con la integración del sitio: aviso de giro y pantalla completa.

**Why this priority**: el original ya tenía controles táctiles, y el sitio es jugable en mobile desde la feature 010.

**Independent Test**: en un celular en horizontal, completar la Fase 1 y una parte de la Fase 2 solo con toques.

**Acceptance Scenarios**:

1. **Given** es un dispositivo táctil, **When** la misión está en curso, **Then** se ven el D-pad y el grupo de acciones de la fase actual.
2. **Given** está en vertical, **When** se abre el simulador, **Then** aparece "Girá el dispositivo" y la partida se pausa.

---

### User Story 5 - Pausa, sonido y menú (Priority: P3)

Desde el botón MENU o con Esc se abre "PAUSE // INSTRUMENTS": Resume, SFX activado o muteado, BGM activado o muteado, Restart expedition y "Quit to Mission Briefing". La música ambiente de océano suena en loop durante la misión. El briefing tiene Manual y Hall of Fame.

**Independent Test**: abrir el menú en plena partida, mutear el SFX y la música, reanudar, reiniciar y volver al briefing.

### Edge Cases

- **Pestaña oculta o ventana sin foco**: se abre el menú de pausa y se sueltan las entradas.
- **Navegar a otra página del sitio en plena partida**: el juego se desmonta sin dejar loops, audio ni listeners vivos (10 ciclos sin duplicados ni errores).
- **Frame muy largo**: el paso fijo de 60 Hz con 5 subpasos como máximo evita que la simulación salte, igual que en el original.
- **Almacenamiento local bloqueado**: el Hall of Fame muestra los pilotos de ejemplo del original y no guarda nada, sin errores.
- **Morir por daño en la Fase 1**: el original no tiene enemigos visibles en la superficie, así que en la práctica solo mata la ola.

## Requirements *(mandatory)*

### Functional Requirements

**Fidelidad**

- **FR-001**: Todas las mecánicas, números, textos, colores y formas de dibujo MUST replicar los de `../mini-juego/App.tsx` y `constants.ts`, salvo las correcciones listadas en FR-030.
- **FR-002**: El dibujo del mundo MUST ser el código Canvas 2D del original (las funciones `render*` y `draw`), traducido a JavaScript sin cambiar su lógica de dibujo, sobre un lienzo lógico de 960 × 540.
- **FR-003**: El HUD y las pantallas (barra superior, sub-barra de armas, barra del jefe, aviso de abordaje, banners, cuenta, barra inferior de ayuda, controles táctiles, briefing, victoria con tirada, fallo con reintento automático, menú de pausa, Hall of Fame y manual) MUST replicar el contenido y el estilo del original en HTML y CSS propios (sin React ni Tailwind).

**Fase 1**

- **FR-004**: El movimiento a pie MUST usar la aceleración (2300), el arrastre del agua (4,0), la velocidad máxima (260 o 370 con el impulso de CASE), el salto (350) y la gravedad (860) del original, con coyote time (0,12 s) y buffer de salto (0,14 s).
- **FR-005**: El slide MUST durar 0,32 s a 460, con un enfriamiento de 0,7 s.
- **FR-006**: El disparo a pie MUST replicar la carabina de pulso (enfriamiento 0,12 s, velocidad 880, daño 26) con la mira a 160 y autoapuntado a menos de 60 de un blanco.
- **FR-007**: La baliza MUST generarse a 580-720 del origen, opuesta a la ola, con un sonar cuyo intervalo y tono dependen de la distancia. Se recoge a 58.
- **FR-008**: La ola MUST avanzar desde 2200 en el ángulo 0,72π, a 38 hasta recoger la baliza y a 115 después, y matar al jugador cuando lo supera por 30.
- **FR-009**: El Ranger MUST poder abordarse con E o F a 120 o menos. Sin la baliza muestra "¡SISTEMAS DE VUELO EN LÍNEA!"; con la baliza inicia la transición.

**Fase 2**

- **FR-010**: La transición MUST llevar el Ranger a (480, 455) en 1,2 s y arrancar la Fase 2 con el sonido de fijación de blanco.
- **FR-011**: La Fase 2 MUST replicar el ascenso (280 m/s), los 5 sectores y sus umbrales, el movimiento a 440 con límites, los 3 niveles de cañón, los misiles (8 iniciales, Q), las bombas EMP (2 iniciales, B) y la regeneración de escudo.
- **FR-012**: Los enemigos (galaga_striker, scout_drone, armored_gunship, cargo_drone y dreadnought_boss), los obstáculos del sector 3, las caídas de mejoras, el combo y los puntos MUST replicar el comportamiento del original.
- **FR-013**: El final MUST replicar el descenso de la Endurance, el acople por atracción y el cálculo del puntaje total y el rango (S ≥ 40.000, A ≥ 30.000, B ≥ 20.000, C para el resto).

**Pantallas, ranking e integración**

- **FR-014**: El Hall of Fame MUST guardar el top 10 en `localStorage` bajo `interstellar:minijuegos:miller:ranking`, con nombre (hasta 8 caracteres), puntaje, años terrestres y rango. Si está vacío, muestra los 4 pilotos de ejemplo del original.
- **FR-015**: El hub MUST mostrar la bahía 02 disponible, con su mejor puntaje real guardado (no los de ejemplo).
- **FR-016**: El juego MUST montarse y desmontarse con la navegación del sitio sin dejar Phaser, loops, timers, listeners ni audio vivos.
- **FR-017**: En táctil MUST verse los controles del original, con el aviso de giro en vertical y la pantalla completa del sitio (`comun/`).
- **FR-018**: La música ambiente del original (`ocean_abyss_ambience.mp3`) MUST sonar en loop durante la misión, con su propio mute (BGM), y los efectos sintetizados del original con su mute (SFX).
- **FR-019**: Debe haber un enlace "Salir" al hub disponible desde el briefing, la pausa y los resultados.

**Calidad**

- **FR-020**: La lógica de simulación MUST vivir en módulos sin Phaser ni DOM, con el azar y el tiempo inyectados, y verificarse con pruebas automatizadas que comprueben el comportamiento del original.
- **FR-030**: Se corrigen estos defectos del original. Cada uno queda documentado y es reversible:
  - (a) los textos flotantes y los marcadores nunca se desvanecían, porque su vida no se descontaba; ahora suben y se desvanecen;
  - (b) las ondas del agua nunca se expandían; ahora crecen con su velocidad;
  - (c) en la Fase 1 había un dron invisible que absorbía disparos y hacía aparecer números de daño de la nada; se quita;
  - (d) el tiempo terrestre usaba 17,518 h/s, cuando 1 h = 7 años da 17,045 h/s; se usa el valor correcto y el texto de la cuenta lo dice;
  - (e) el sitio exige `✎ Licencia narrativa` junto a las cifras de la película (Constitución VI); se agrega en la cuenta y en el resultado.

- **FR-031**: La Fase 1 MUST tener fauna hostil que aparece fuera de pantalla desde los 5 s (más seguido después de recoger la baliza, con un tope de 6). Los drones flotan, mantienen distancia y disparan plasma. Las alimañas nadan sumergidas (en ese estado no se las puede apuntar ni dañar), saltan, muerden si caen encima y escupen. La ola las barre. Cada baja suma a `enemiesDestroyed` (+200 en el puntaje) y puede soltar una celda de energía.
- **FR-032**: La mira MUST dibujarse: un anillo cian cuando está libre, y corchetes rojos con "LOCK" cuando hay un blanco fijado. El autoapuntado conserva la regla original (60 px de la mira) y, si no encuentra nada, fija al enemigo más cercano dentro de 320 px y ±50° de la dirección de apuntado, con el sonido de fijación.
- **FR-033**: Los disparos en la superficie MUST descartarse al salir de la vista de la cámara, no del rectángulo de pantalla. En el original desaparecían al nacer cuando el jugador estaba lejos del origen.

### Key Entities

- **Simulación (`sim`)**: el estado completo del original: etapa, modo de control, nave, astronauta, CASE, baliza, ola, proyectiles, enemigos, caídas, obstáculos, partículas, ondas, textos, cámara y temporizadores.
- **Entrada**: el estado de las acciones (izquierda, derecha, arriba, abajo, confirmar, tap, puntero) más los toques (dirección, disparo, salto, slide).
- **Resultado**: tiempo de misión, años terrestres, enemigos derribados, puntaje y rango.
- **Entrada del Hall of Fame**: nombre, puntaje, años terrestres y rango.

## Success Criteria *(mandatory)*

- **SC-001**: Una persona que jugó el original en el Playground reconoce el juego sin dudar: mismas pantallas, mismas fases, mismos enemigos y el mismo aspecto.
- **SC-002**: Las mismas entradas producen el mismo resultado que en el original, comparando sus fórmulas con las pruebas de la lógica.
- **SC-003**: Se puede completar la misión de punta a punta con teclado y la Fase 1 con toques en un celular en horizontal.
- **SC-004**: Diez ciclos de entrar y salir de la página no dejan canvas duplicados, sonidos superpuestos ni errores en la consola.
- **SC-005**: El juego se mantiene fluido en un desktop común y jugable en un celular de gama media.

## Assumptions

- Los PNG generados por el Playground no los usa el original y no se incluyen. El mp3 de ambiente sí lo usa y se incluye en `assets/audio/` con su crédito ("generado por Google AI Studio Playground para el prototipo del autor").
- Los íconos de Lucide del HUD se reemplazan por símbolos tipográficos equivalentes (▲, ✈, ⚡, ✦), para no sumar una librería de íconos.
- El idioma es el del original: español con etiquetas técnicas en inglés.
- La v1 (belt-scroller) se reemplaza. Su lógica, sus tests y su página se borran; `comun/` se conserva.
