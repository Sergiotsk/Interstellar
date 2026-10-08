# Data Model — 010 Simulador de acople jugable en mobile

Esta feature **no cambia** las entidades de la 009 (Partida, Nave, Estación, Desenlace, Puntaje, Ranking). Suma estado de **entrada** y de **presentación**, nada persistente: no hay claves nuevas en `localStorage` ni en `sessionStorage`.

## ModoEntrada

| Campo | Tipo | Regla |
|---|---|---|
| valor | `'tactil' \| 'teclado'` | Se decide una vez en `mount()` (R1). No cambia durante la sesión de la página. |

**Derivación** (`modoEntrada`):

| forzado | punteroGrueso | algunPunteroFino | → |
|---|---|---|---|
| `'tactil'` o `'teclado'` | cualquiera | cualquiera | forzado |
| otro valor o ausente | `true` | `false` | `'tactil'` |
| otro valor o ausente | cualquier otra combinación | | `'teclado'` |

Se refleja en el DOM como `[data-acople][data-entrada="tactil|teclado"]`.

## Toques (mapa de dedos activos)

`Map<pointerId: number, accion: Accion>`, inmutable: cada operación devuelve un mapa nuevo.

`Accion` ∈ `rotarIzquierda | rotarDerecha | impulso | freno`, los mismos valores que `CONFIG.teclas` (FR-007).

| Operación | Efecto |
|---|---|
| `tocar(mapa, id, accion)` | agrega o reemplaza el par `id → accion`. Una acción que no es válida devuelve el mapa sin cambios. |
| `levantar(mapa, id)` | quita `id`. Un `id` inexistente devuelve el mapa sin cambios. |
| `levantarTodo()` | mapa vacío (pausa, reintento, fin, blur: FR-012). |
| `accionesTactiles(mapa)` | `Set` de las acciones presentes, sin duplicados. |

**Invariante**: una acción sigue activa mientras al menos un dedo la sostenga.

**Acciones efectivas por tick**: `unión(s.acciones [teclado], accionesTactiles(s.toques))`.

## Orientación / Aviso de giro

| Entrada | Regla |
|---|---|
| `requiereGiro({ modo, ancho, alto })` | `modo === 'tactil' && alto > ancho` |

**Transiciones**:

| Estado previo | Evento | Efecto |
|---|---|---|
| partida `en-curso` | `requiereGiro` pasa a `true` | `pausarPartida` → fase `pausada`, se vacían los toques y se muestra la capa de giro |
| `intro` | `requiereGiro` pasa a `true` | se suspende el temporizador de la intro y se muestra la capa |
| `resultado` o editor | `requiereGiro` pasa a `true` | se muestra la capa; el editor, el nombre y el resultado quedan intactos |
| cualquiera | `requiereGiro` pasa a `false` | se oculta la capa; si estaba pausada se ve la pausa ("Seguir") y la intro retoma su temporizador |

## Editor de nombre (extensión)

| Operación nueva | Regla |
|---|---|
| `fijarCursor(ed, i, config)` | `cursor = clamp(i, 0, largoNombre - 1)`. Un `i` que no es entero devuelve `ed` sin cambios. |

Las demás operaciones (`teclaEditor`, `cambiarLetra`, etc.) no cambian.

## HUD (extensión)

| Función | Cambio |
|---|---|
| `indicacionHud(partida, estado, modo = 'teclado')` | En `'tactil'`, `'DOCKING RANGE'` devuelve `'TAP TO DOCK'`. El resto de los casos no cambia. |
