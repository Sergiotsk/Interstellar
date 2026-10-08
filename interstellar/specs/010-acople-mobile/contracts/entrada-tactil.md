# Contrato — Entrada táctil y cabina mobile

Complementa `specs/009-minijuegos-acople/contracts/logica-acople.md` (lógica pura) e `integracion-sitio.md` (DOM y ciclo de vida).

## 1. Módulos puros (TDD, sin DOM)

### `js/minijuegos/acople/logica/dispositivo.js`

```js
export function modoEntrada({ punteroGrueso, algunPunteroFino, forzado }) // → 'tactil' | 'teclado'
export function requiereGiro({ modo, ancho, alto })                     // → boolean
```

`debeMostrarAvisoDesktop` **se elimina**, junto con sus tests, que se reescriben para `modoEntrada`.

### `js/minijuegos/acople/logica/controles-tactiles.js` (nuevo)

```js
export function tocar(mapa, id, accion)   // → Map nuevo
export function levantar(mapa, id)        // → Map nuevo
export function levantarTodo()            // → Map vacío
export function accionesTactiles(mapa)    // → Set<Accion>
```

### `js/minijuegos/acople/logica/nombre-arcade.js` (extensión)

```js
export function fijarCursor(ed, i, config) // → editor
```

### `js/minijuegos/acople/logica/mision.js` (extensión)

```js
export function indicacionHud(partida, estado, modo = 'teclado')
// 'tactil' + 'DOCKING RANGE' → 'TAP TO DOCK'
```

## 2. DOM (`minijuego-acople.html`)

| Elemento | Atributos | Visible |
|---|---|---|
| raíz `[data-acople]` | `data-entrada="tactil\|teclado"`, `data-cabina` (presente durante la partida en táctil) | siempre |
| controles izquierdos | `<div class="acople-mandos acople-mandos--izq" data-solo="tactil">` con `<button type="button" data-control="rotarIzquierda" aria-label="Rotar a la izquierda">◀</button>` y `rotarDerecha` | táctil, en HUD |
| controles derechos | ídem `--der` con `impulso` (▲) y `freno` (▼) | táctil, en HUD |
| pausa | `<button data-accion="pausar" aria-label="Pausar">II</button>` | táctil, en HUD |
| aviso de giro | `<div class="acople-girar" data-aviso-giro role="alertdialog" aria-labelledby="girar-titulo" hidden>`, capa propia **fuera** de `[data-pantalla]` | táctil + vertical |
| ayudas de la intro | `<p data-solo="teclado">` (actual) y `<p data-solo="tactil">` | según el modo |
| editor: botones | `<button data-tecla-editor="ArrowUp\|ArrowDown\|ArrowLeft\|ArrowRight\|Backspace">` | táctil, editor abierto |
| editor: casillas | `<button type="button" data-casilla="0..7" tabindex="-1">` (antes eran `<span>`) | editor abierto |
| meta viewport | `width=device-width, initial-scale=1, viewport-fit=cover` | — |

Los botones de control **no** reciben foco por teclado (`tabindex="-1"`): son una superficie táctil, y el teclado ya tiene sus teclas. Llevan `aria-label` igual, para que los lectores de pantalla los anuncien.

## 3. Eventos (`js/minijuegos/acople/controles-tactiles.js`, glue de DOM)

```js
export function conectarControles(raiz, { alCambiar, alTocar }) // → limpiar()
```

- `pointerdown` sobre `[data-control]`:
  1. `releasePointerCapture(id)`.
  2. `alCambiar(tocar(...))`.
  3. `data-activo="true"`.
  4. `alTocar()` para reanudar el audio.
- `pointerup`, `pointercancel` y `pointerleave` sobre `[data-control]`: `alCambiar(levantar(...))` y `data-activo` desaparece si ningún dedo sostiene ese control.
- `contextmenu` sobre `[data-control]`: `preventDefault`.
- Devuelve una función de limpieza que `main.js` registra en `s.limpiezas` (009 FR-030).

## 4. `main.js` (flujo)

- `mount()`:
  - calcula `s.modo = modoEntrada(...)` con `?entrada=`;
  - pone `data-entrada`;
  - **ya no corta con el aviso de desktop**;
  - conecta los controles si el modo es táctil;
  - registra el listener de orientación.
- `tick()`: `conAcciones(s.partida, unión(s.acciones, accionesTactiles(s.toques)))`.
- `pausarPartida`, `volverAJugar`, `terminarPartida` y `blur` vacían `s.toques` con `levantarTodo()` y limpian `data-activo`.
- `comenzarPartida`, `volverAJugar` y `reanudarPartida` en táctil: activan `data-cabina` y llaman a `pantalla.entrar(...).then(ok => ok && pantalla.bloquearHorizontal())`.
- Fin de partida, pausa y salida: `data-cabina` se mantiene durante el resultado y la pausa (la cabina sigue llenando la pantalla) y se quita en `unmount()`.
- Orientación: `requiereGiro` true → capa visible + `pausarPartida` o suspensión de la intro; false → capa oculta.
- `alClic`:
  - `pausar` → `pausarPartida`;
  - `[data-tecla-editor]` → `teclaEditor`;
  - `[data-casilla]` → `fijarCursor`.

## 5. `pantalla-completa.js` (extensión)

```js
export function bloquearHorizontal() // → Promise<boolean>, nunca rechaza
```

## 6. CSS (`css/minijuegos.css`)

- `[data-solo="tactil"]` oculto salvo con `[data-entrada="tactil"]`, y a la inversa con `teclado`.
- `.acople[data-cabina]`: `position: fixed; inset: 0; height: 100dvh; z-index` por encima de `header` y `footer`.
- `@media (max-height: 30rem)`: consola compacta (R7).
- `.acople-mandos`: posición con `env(safe-area-inset-*)`, botones ≥ `3rem`, `touch-action: none`, `user-select: none`, `-webkit-touch-callout: none`, estado `[data-activo="true"]`.
- `.acople`: `touch-action: manipulation`.
- `.acople-girar`: capa a pantalla completa con el estilo de `.acople-aviso`.
