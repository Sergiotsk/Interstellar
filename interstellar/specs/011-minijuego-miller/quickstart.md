# Quickstart — Validar la feature 011

## Prerrequisitos

- Node 20 o más (para `node --test`) y Python 3 (servidor estático).
- Trabajar desde `interstellar/`.

## 1. Lógica (TDD)

```bash
pnpm test        # equivale a node --test
```

Esperado:
- en verde `tests/comun-*.test.js` (los módulos movidos del acople), `tests/acople-*.test.js` (sin regresiones) y `tests/miller-*.test.js`;
- `tests/miller-balance.test.js`: el piloto de referencia gana en las 20 semillas y tarda entre 45 y 90 s.

## 2. Desktop con teclado

```bash
python -m http.server 8000
```

Abrir `http://localhost:8000/minijuegos.html`:

1. La bahía 02 aparece **DISPONIBLE**, con el enlace "Iniciar simulación" y "Sin registro".
2. Entrar al simulador. La intro dura de 6 a 8 s y se puede saltar. Después viene la cuenta 3-2-1 y el banner `MISSION 02 START`.
3. Moverse con WASD o las flechas: el astronauta tiene inercia, el agua lo frena y salpica. Arriba y abajo cambian la profundidad, y el astronauta se dibuja delante o detrás de los restos según dónde esté.
4. Acercarse a la baliza: el pulso se acelera. Recogerla con Space: aparecen `BEACON ACQUIRED!` y `WAVE INCOMING!`, y la ola se revela a la derecha con un zoom-out.
5. Volver al Ranger y mantener Space: se carga la barra `LIFTOFF`. Si se suelta, la carga decae.
6. Despegar: cae el sello `MISSION COMPLETE!`, corre la tirada, se estampa el rango y se abre el editor de nombre.
7. Reintentar: arranca en la cuenta 3-2-1, sin intro y con un mapa nuevo.
8. Perder a propósito, una vez quedándose quieto y otra yendo lejos del Ranger: se ve `MISSION FAILED` con la causa correcta.
9. Esc pausa. Cambiar de pestaña pausa y suelta las teclas.
10. Recargar la página: el ranking persiste. Volver al hub: el récord aparece en la bahía 02.

## 3. Mobile (táctil)

```bash
python -m http.server 8000 --bind 0.0.0.0
```

En el teléfono, abrir `http://<ip-de-la-pc>:8000/minijuego-miller.html`. Para emular en desktop: `?entrada=tactil`.

- En portrait aparece "Girá el dispositivo" y la partida queda en pausa.
- En landscape, el joystick a la izquierda y el botón de acción a la derecha funcionan **a la vez**.
- Pantalla completa: la cuenta, el resultado y "Salir" siguen visibles.
- No hay scroll ni zoom al arrastrar.

## 4. Montaje y desmontaje (SC-005)

Navegar hub → simulador → hub, 10 veces seguidas con los enlaces del sitio (swup). En DevTools:
- `document.querySelectorAll('.juego-miller canvas').length` ≤ 1 estando en el simulador, y 0 en el hub;
- la consola queda sin errores y no hay sonidos superpuestos.

## 5. Visual y accesibilidad

- `?debug=sprites`: cada animación aparece en loop sobre `#0a0e1a`.
- No hay teal dentro del canvas, y hay un único elemento naranja por pantalla.
- El escalado es entero: al redimensionar la ventana, los píxeles siguen nítidos y aparecen franjas de letterbox.
- Con *Emulate CSS prefers-reduced-motion* activado no hay shake, destellos ni hit-stop.

## 6. Acople sin regresiones

Jugar una partida de `minijuego-acople.html`, en teclado y con `?entrada=tactil`. El ranking, el editor de nombre y la pantalla completa tienen que funcionar igual que antes del refactor `comun/`.
