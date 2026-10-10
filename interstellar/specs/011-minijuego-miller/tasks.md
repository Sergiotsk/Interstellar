---
description: "Task list — 011 v2: réplica fiel de Miller's Wave Escape"
---

# Tasks: Capítulo 2 "Miller's Wave Escape" — réplica fiel

**Input**: `specs/011-minijuego-miller/` (spec, plan, research, data-model, contracts, quickstart). La fuente de verdad es `../mini-juego/App.tsx`.

**Tests**: SÍ. Se usan pruebas de **caracterización** (R4): el test describe el comportamiento del original y se ve fallar antes de portar el módulo.

**Rama**: `sec/minijuegos`. Rutas relativas a `interstellar/`.

## Phase 1: Setup

- [X] T001 Borrar la v1: `js/minijuegos/miller/{sprites,texturas,escena-galeria,escena-miller,overlays,controles-tactiles,audio-miller,main}.js`, `js/minijuegos/miller/logica/` (menos `azar.js`), y `tests/miller-*.test.js` (menos `miller-azar.test.js`).
- [X] T002 Copiar `../mini-juego/assets/audio/ocean_abyss_ambience.mp3` → `assets/audio/minijuegos/miller-ambiente.mp3` y sumar su crédito en `js/creditos.js`.
- [X] T003 [P] Test de `config.js`, con los valores de `constants.ts`, `PALETA_PIXEL` (P0 a P20), `ANIM` y `TOKENS_HUD` congelados (ROJO). Después portar `js/minijuegos/miller/config.js` (VERDE).

## Phase 2: Lógica (caracterización → port)

- [X] T004 `tests/miller-efectos.test.js` → `logica/efectos.js`:
  - `sonar` encola;
  - `onda` respeta el tope de 35;
  - `textoFlotante` respeta el tope de 25;
  - `mostrarBanner` encola `playBannerImpact`;
  - `avanzarEfectos` descuenta vidas, expande ondas y hace subir los textos (R7 a/b).
- [X] T005 `tests/miller-estado.test.js` → `logica/estado.js`:
  - `crearSim` deja la baliza a 580-720, opuesta a la ola ±0,25;
  - los restos (el principal + hasta 16) quedan a más de 120 del origen y a más de 90 de la baliza;
  - 90 estrellas y 0 enemigos (R7 c);
  - fase `COUNTDOWN` de 2,5 s;
  - ola a 2200 y 38.
- [X] T006 `tests/miller-puntaje.test.js` → `logica/puntaje.js`:
  - 17,045 h/s;
  - texto de años con 1 decimal;
  - puntaje en vivo = altitud × 2,5 + destruidos × 200 + derribados × 350;
  - victoria = máx(1000, 45000 − t × 25 + destruidos × 200 + derribados × 400 + (CASE ? 3000 : 0));
  - fallo = t × 15 + destruidos × 150 + derribados × 350;
  - rangos S/A/B/C.
- [X] T007 `tests/miller-danio.test.js` → `logica/danio.js`:
  - en la nave baja primero el escudo y después el casco;
  - a pie baja el traje, con demora de regeneración 4, hurt 0,45 y hit-stop;
  - con el slide hay inmunidad;
  - al llegar a 0 se activa `matarJugador` (1,6 s, 36 partículas, banner con la razón).
- [X] T008 `tests/miller-nave.test.js` → `logica/nave.js`:
  - `abordar` pasa a SHIP; con la baliza arranca la transición (1,2 s) y, sin ella, muestra el banner de sistemas;
  - `dispararMisil` gasta 1, tiene enfriamiento de 0,3 y suelta 2 misiles hacia el enemigo más cercano;
  - `detonarEmp` solo funciona en la Fase 2: limpia los proyectiles enemigos y hace 220 de daño;
  - `cambiarArma` cicla pulse → scatter → rocket.
- [X] T009 `tests/miller-superficie.test.js` → `logica/superficie.js`:
  - aceleración y arrastre con tope de velocidad, impulso de CASE y salto con coyote y buffer;
  - slide y su enfriamiento;
  - disparo de pulso con su enfriamiento;
  - autoapuntado a menos de 60;
  - sonar por intervalo;
  - recogida a 58, que pone la ola a 115 y la fase en RETRIEVED;
  - asistencia de CASE a 62;
  - aviso de abordaje a 120;
  - muerte por ola cuando la distancia es ≤ −30.
- [X] T010 `tests/miller-orbita.test.js` → `logica/orbita.js`:
  - la transición converge a (480, 455) y al terminar pasa a la Fase 2 sin enemigos;
  - sectores por altitud;
  - movimiento a 440 con límites;
  - disparo de 2, 3 o 4 balas según el nivel;
  - obstáculos solo en el sector 3;
  - jefe a 8800 m;
  - IA de striker, scout, cañonero y carga;
  - colisión con la nave;
  - descenso de la Endurance y acople → `fin` VICTORY con el puntaje de victoria.
- [X] T011 `tests/miller-proyectiles.test.js` → `logica/proyectiles.js`:
  - los misiles persiguen al blanco;
  - un proyectil enemigo daña a la nave;
  - un impacto saca vida, deja marcador y texto y suma combo;
  - un enemigo muerto suma puntos con combo y puede soltar caídas (el dron de carga siempre suelta);
  - el jefe muerto da +5 al contador y banner;
  - las caídas se recogen a 42 con su efecto (P, B, misiles, celda) y caen en la Fase 2.
- [X] T012 `tests/miller-motor.test.js` → `logica/motor.js`:
  - el hit-stop congela el paso;
  - los efectos decaen;
  - la cuenta pasa a EXPLORATION con banner;
  - la muerte termina en `fin` GAME_OVER con el resultado de fallo;
  - regeneración de escudo y traje;
  - despacho por etapa;
  - cámara (lerp a pie, centrada en la Fase 2).
- [X] T013 `tests/miller-hall-of-fame.test.js` → `logica/hall-of-fame.js`:
  - vacío → pilotos de ejemplo en pantalla, pero no en el almacenamiento;
  - guardar ordena, recorta a 10 y normaliza el nombre (hasta 8 caracteres, COOPER por defecto);
  - `try/catch` alrededor del almacenamiento;
  - el formato es compatible con `comun/logica/ranking.js` (el hub lo lee).

## Phase 3: Render y escena (el juego se ve y se juega)

- [X] T014 Portar con `stripTypeScriptTypes` (R3) a `render/comunes.js`, `render/superficie.js` y `render/espacio.js`, y limpiar las firmas a mano.
- [X] T015 Portar `draw()` del original a `render/dibujar.js`: flash, shake, las dos fases, viñeta de daño y el cartel de abordaje en el canvas.
- [X] T016 `escena-miller.js`:
  - `CanvasTexture` de 960 × 540 × k;
  - paso fijo de 1/60 s con 5 subpasos como máximo (el `createFixedStepper` del original) llamando a `motor.actualizar`;
  - `dibujar` + `refresh`.
- [X] T017 `main.js` mínimo + `minijuego-miller.html` + `controles.js` (las teclas del original: WASD, flechas, Espacio, Shift/C, J/X/Z/Enter, E/F, Q/M, B y 1/2/3).

## Phase 4: HUD y pantallas

- [X] T018 `hud.js` + HTML + CSS:
  - barra superior (score con combo, earth time, sector y progreso o estado de la baliza, stage y MENU);
  - sub-barra (shield, hull, cannon, missiles y EMP, o suit integrity y pulse);
  - barra del jefe, botón de abordaje, banner, cuenta y barra inferior de ayuda.
- [X] T019 Pantallas:
  - briefing (con Manual y Hall of Fame);
  - victoria con tirada en 5 pasos, sello e input de nombre;
  - fallo con AUTO RETRY y reintento con Espacio, Enter o R;
  - menú de pausa (Esc o MENU) con SFX, BGM, Restart y Quit;
  - modales de Hall of Fame y de Manual.

## Phase 5: Audio, táctil e integración

- [X] T020 `audio-miller.js`: `SynthAudio` + `playPowerupChime`, `playVictoryFanfare`, `playDefeatMotif` y el rumor de la ola; música mp3 en loop; vaciar `sim.sonidos`.
- [~] T021 Táctil: D-pad y grupos de acciones por fase, aviso de giro, pantalla completa y cabina (`data-cabina`).
- [X] T022 Pausa por visibilidad y foco; `unmount` limpio; 10 ciclos de swup.
- [X] T023 Notas de código en `docs/20-notas-de-codigo/minijuegos-miller.md` (local) y `quickstart` completo; `pnpm test` en verde.

## Dependencies

T001 → T003 → T004 a T013 (en orden; `motor` va al final) → T014 a T017 → T018/T019 → T020 a T023.
