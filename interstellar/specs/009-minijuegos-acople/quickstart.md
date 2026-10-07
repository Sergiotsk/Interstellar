# Quickstart: validar el hub de Minijuegos y el acople

Guía de validación end-to-end. Es un sitio estático sin build: se sirve con un server estático local desde la raíz de `interstellar/`, no con `file://`, porque los módulos ES fallan por CORS.

## Prerrequisitos

- Rama `sec/minijuegos`.
- Server: `python -m http.server 8080` desde `interstellar/`.
- Chrome o Firefox actuales, con DevTools.

## 0. Tests de lógica (Principio V)

```bash
pnpm test        # node --test
```

**Esperado**: todo en verde, incluidos los `tests/acople-*.test.js` de [contracts/logica-acople.md](contracts/logica-acople.md) y el test de `rutaSinMusica`. El test de balance (R9) confirma que el piloto de referencia acopla en 30–90 s simulados.

## 1. Hub (US3, FR-001..006)

1. Borrar los datos del sitio (DevTools → Application → Clear storage) y abrir `http://localhost:8080/minijuegos.html`.
2. **Esperado**:
   - 4 bahías en orden;
   - la 1 con "Sin registro" y el enlace "Iniciar simulación";
   - las 2 a 4 con "Próximamente";
   - no aparece la terminal de memes.
3. Recorrer con Tab: el foco visible pasa por el enlace de la bahía 1 y **no** se detiene en las bahías 2 a 4.
4. DevTools → Network: **no** se descarga ningún archivo de Phaser.
5. Llevar el ancho a 320 px: sin scroll horizontal y con las tarjetas apiladas.

## 2. Partida exitosa (US1, US4)

1. Clic en "Iniciar simulación".
   - **Esperado**: la intro corta en español, con frases y fades. Saltearla con una tecla o con el botón.
2. Probar cada control:
   - ArrowLeft/Right: cambia el giro relativo de la estación en pantalla y se ven las partículas de los RCS.
   - ArrowUp: la estación crece, se ve el motor encendido y baja el Fuel.
   - Space: frena.
3. Igualar el giro.
   - **Esperado**: la estación queda casi quieta en pantalla y el campo estelar gira (R2). El HUD pasa de APPROACHING a MATCHING ROTATION y después a DOCKING RANGE.
4. Acercarse despacio y alineado hasta el contacto.
   - **Esperado**: DOCKED, el sonido de acople y la pantalla de resultado con tiempo, combustible, velocidad final, precisión, puntaje y "Nuevo récord".
5. Recargar el hub.
   - **Esperado**: la bahía 1 muestra ese puntaje.
6. Hacer otra partida con un puntaje menor.
   - **Esperado**: el récord no cambia (FR-027).

## 3. Fallos y reintento (US2, FR-015)

Provocar cada causa y confirmar el texto de la pantalla de resultado:

| Cómo | Causa esperada |
|------|----------------|
| Mantener ArrowUp hasta el contacto | impacto a velocidad excesiva |
| Llegar despacio pero sin alinear el giro | ángulo de entrada incorrecto |
| Mantener ArrowLeft varios segundos | pérdida de control |
| Gastar el combustible y quedar frenado lejos | sin combustible |

- En todos los casos **no** hay puntaje y el récord queda intacto (FR-026).
- "Reintentar" arranca en menos de 2 s, sin la intro completa (SC-004, FR-009).
- Además:
  - el estado peligroso (UNSAFE APPROACH) se distingue del seguro por al menos 2 canales además del texto (FR-022);
  - durante la partida, las flechas y Space **no** hacen scroll de la página.

## 4. Integración con el sitio (US5, SC-005)

1. Activar la música del sitio (interruptor del header) en `index.html`.
2. Ir al simulador.
   - **Esperado**: la música se pausa.
3. Volver al hub.
   - **Esperado**: la música vuelve. Con la música apagada antes de entrar, sigue apagada al salir.
4. **10 ciclos** hub → simulador (empezar a jugar) → otra sección → simulador → hub, sin recargar.
   - **Esperado**:
     - consola sin errores;
     - en el simulador, `document.querySelectorAll('[data-acople-lienzo] canvas').length === 1`;
     - sin sonido residual del juego fuera de la página.
5. Salir del simulador **mientras Phaser todavía descarga** (Network → throttling "Slow 4G", entrar y salir enseguida).
   - **Esperado**: sin errores y sin canvas huérfano al volver.
6. Botón de mute del simulador: silencia el juego y no cambia el interruptor de música del header.
7. En medio de una partida, cambiar de pestaña y volver.
   - **Esperado**: pausa con el overlay y ningún propulsor trabado al reanudar.
8. Redimensionar la ventana en medio de una partida.
   - **Esperado**: el lienzo se adapta sin reiniciar la partida.

## 5. Mobile y movimiento reducido (FR-034, FR-035)

1. DevTools → Device toolbar (un teléfono, táctil) y abrir `minijuego-acople.html`.
   - **Esperado**: el aviso "Simulador disponible en desktop" con enlace al hub, y Network **sin** Phaser.
2. En desktop, emular `prefers-reduced-motion: reduce` (DevTools → Rendering).
   - **Esperado**: sin sacudida de cámara, el campo estelar no rota y el juego sigue siendo legible.

## 6. Prueba con personas (SC-001, SC-003)

- 3 o más personas que no conocen el juego, sin explicarles nada.
- Anotar si entienden el objetivo y cuántos intentos necesitan para el primer acople.
- La meta es que al menos 2 acoplen en 5 intentos o menos. Si no se llega, se ajusta `config.js` y se re-corre el test de balance.

## 7. Cierre de la feature (Principio I)

- `js/vendor/phaser@4.2.1/phaser.esm.min.js` existe y el import en `main.js` es relativo (`../../vendor/phaser@4.2.1/phaser.esm.min.js`).
- Network sin requests a esm.sh ni a jsDelivr.
- `js/vendor/README.md` documenta Phaser: versión, peso, problema que resuelve y página donde carga.
- Criterios de aceptación de página de la constitución en ambas páginas: HTML válido, hojas en orden, rutas relativas, consola limpia.
