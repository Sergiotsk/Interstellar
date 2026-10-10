# Data Model — Feature 011 "Miller's Wave Escape" (Misión 1)

Todas las estructuras son **objetos planos e inmutables**: cada función de `logica/` recibe un estado y devuelve uno nuevo. Las unidades son gpx (distancia), s (tiempo) y gpx/s (velocidad).

## Configuración (`miller/config.js` → `CONFIG`, congelado en profundidad)

Es el único lugar con números del gameplay y con nombres de la película (Ranger, Miller, CASE). Los valores de arranque salen de research R10.

| Grupo | Claves |
|---|---|
| `nombres` | `planeta: 'Miller'`, `nave: 'Ranger'`, `robot: 'CASE'` |
| `teclas` | `ArrowUp/KeyW → moverArriba`, `ArrowDown/KeyS → moverAbajo`, `ArrowLeft/KeyA → moverIzquierda`, `ArrowRight/KeyD → moverDerecha`, `Space/Enter → accion`, `Escape → pausa` |
| tiempo | `pasoFijoS: 1/60`, `deltaMaxS: 0.1`, `introS: 7`, `cuentaS: 3` |
| `mundo` | `ancho: 2400`, `profundidad: 90`, `horizonte: 150` (y de pantalla), `base: { ancho: 480, alto: 270 }` |
| `jugador` | `aceleracion: 315`, `arrastre: 4.2` (velocidad terminal = aceleración/arrastre = 75), `factorProfundidad: 0.6`, `caja: { ancho: 10, prof: 6 }`, `alcanceBaliza: 14` |
| `ranger` | `x: 80`, `z: 45`, `radio: 36` |
| `baliza` | `ventanaX: [1800, 2200]`, `pulsoMinHz: 0.8`, `pulsoMaxHz: 6`, `rangoSenal: 900` |
| `restos` | `cantidad: 18`, `desdeX: 220`, `hastaX: 2300`, `separacionMin: 60`, `huecoMinZ: 20`, `caja: { ancho: 16, prof: 10 }`, `velChoque: 50`, `aturdimientoS: 0.8` |
| `ola` | `xInicial: 2800` (oculta, fuera del mapa), `distanciaRevelacion: 520`, `velHuida: 55`, `aceleracion: 1.2`, `umbrales: { cerca: 360, inminente: 150 }` |
| `despegue` | `tiempo: 1.5`, `decaimientoCarga: 0.8`, `maxSoltadas: 3` |
| `caseRobot` | `radio: 16`, `impulso: 1.5` (multiplicador de velMax), `duracionS: 2`, `recargaS: 8` |
| `dilatacion` | `anosPorHora: 7` → horas terrestres por segundo = 7·365,25·24/3600 ≈ 17,05 |
| `puntaje` | `max: 10000`, `tMin: 45`, `tMax: 90`, `margenMax: 500`, `maxChoques: 5`, `pesos: { tiempo: 0.45, margen: 0.25, choques: 0.15, precision: 0.15 }`, `rangos: { S: 9000, A: 7500, B: 5000 }` |
| `particulas` | `tope: { teclado: 300, tactil: 150 }` |
| `audio` | `teclado: {...}`, `tactil: {...}` (volumen, filtros de ola y ambiente, compresor) |
| `ranking` | `clave: 'interstellar:minijuegos:miller:ranking'`, `version: 1`, `tope: 10`, `largoNombre: 8`, `alfabeto: 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ0123456789 '`, `nombrePorDefecto: 'RANGER'` |
| `PALETA_PIXEL` | P0…P17 (DesignSystem §3.2), en enteros `0xRRGGBB` |
| `ANIM` | tokens de tiempo de animación (DesignSystem §5.1) |

## Mapa (`logica/mapa.js#crearMapa(config, rng)`)

| Campo | Tipo | Regla |
|---|---|---|
| `semilla` | entero | se guarda para reproducir el mapa |
| `ranger` | `{ x, z, radio }` | fijo, viene de la config |
| `baliza` | `{ x, z }` | x dentro de `baliza.ventanaX`, z dentro de `[0, profundidad]` |
| `restos` | `[{ x, z, ancho, prof, variante }]` | `cantidad` restos; a ≥ `separacionMin` entre sí; ninguno dentro del radio del Ranger + margen; en cada x siempre queda un hueco libre en z ≥ `huecoMinZ` (siempre hay paso) |
| `caseRobot` | `{ x, z }` | entre el Ranger y la baliza, fuera de la línea recta |

## Partida (`logica/mision.js`)

| Campo | Tipo | Notas |
|---|---|---|
| `fase` | `'intro' \| 'cuenta' \| 'exploracion' \| 'huida' \| 'despegue' \| 'exito' \| 'fracaso'` | ver las transiciones |
| `pausada` | bool | la pausa es una bandera ortogonal: congela todo menos la fase |
| `mapa` | Mapa | |
| `t` | s | tiempo de misión: corre desde `exploracion` hasta el final |
| `tFase` | s | tiempo dentro de la fase actual (intro, cuenta, banners) |
| `jugador` | `{ x, z, vx, vz, aturdidoS, mirando: 'izq' \| 'der', quietoS }` | `quietoS` dispara el idle (≥ 3 s) |
| `acciones` | `Set` congelado de acciones | entra con `conAcciones` |
| `balizaRecogida` | bool | |
| `ola` | `{ x, vel, revelada }` | |
| `carga` | 0..1 | carga del despegue |
| `soltadas` | entero | interrupciones de la carga |
| `choques` | entero | |
| `caseRobot` | `{ x, z, asistio, impulsoS, recargaS }` | |
| `eventos` | array de strings | eventos de **este** paso para el audio y la escena: `'paso'`, `'choque'`, `'baliza'`, `'olaRevelada'`, `'despegue'`, `'impulso'`, `'fracaso'`. Se vacía en cada paso |
| `causa` | `null \| 'jugador' \| 'ranger'` | solo en `fracaso` |
| `resultado` | Resultado \| null | solo en `exito` y `fracaso` |

### Transiciones de estado

```
intro ──(tFase ≥ introS | saltar)──▶ cuenta
cuenta ──(tFase ≥ cuentaS)──▶ exploracion
exploracion ──(acción a ≤ alcanceBaliza de la baliza)──▶ huida            [evento baliza, olaRevelada]
huida ──(dentro del radio del Ranger)──▶ despegue
despegue ──(sale del radio)──▶ huida                                     [la carga decae]
despegue ──(carga ≥ 1)──▶ exito                                          [evento despegue]
exploracion | huida | despegue ──(xOla ≤ jugador.x)──▶ fracaso(causa 'jugador')
exploracion | huida | despegue ──(xOla ≤ ranger.x)──▶ fracaso(causa 'ranger')
* ──pausar/reanudar──▶ misma fase con pausada = true/false
exito | fracaso ──reintentar──▶ cuenta (mapa nuevo, sin intro)
```

Prioridades del mismo paso: research R8.

### Funciones públicas (contrato en `contracts/logica-miller.md`)

`crearPartida`, `saltarIntro`, `conAcciones`, `avanzar(partida, dtReal, config, rng)`, `pausar`, `reanudar`, `reintentar`, `estadoHud`, `nivelPeligro`.

## Resultado

| Campo | Tipo |
|---|---|
| `exito` | bool |
| `causa` | `null \| 'jugador' \| 'ranger'` |
| `tiempoMision` | s |
| `horasTerrestres` | número (`t · 17,05`), que el HUD formatea como `Ny Mm` |
| `margenOla` | gpx (`xOla − ranger.x` al despegar; 0 si fracasó) |
| `choques` | entero |
| `asistenciaCase` | bool |
| `precision` | 0..1 |
| `factores` | `{ tiempo, margen, choques, precision }` |
| `puntaje` | entero 0..10 000 (0 si fracasó, y no entra al ranking) |
| `rango` | `'S' \| 'A' \| 'B' \| 'C' \| null` |

## Entrada del ranking (`comun/logica/ranking.js`, sin cambios de forma)

`{ nombre (≤ 8 caracteres del alfabeto), puntaje, tiempo, fecha (ISO) }`. Se guarda como `{ v: 1, entradas: [...hasta 10], ultimoNombre }` bajo la clave de Miller. Si `v` es otra o el JSON es inválido, se lee como vacío (FR-018).

## Estado de la escena (presentación, no se testea)

Son el pool de partículas (con tope por modo), la cámara (lerp de 0,1 + look-ahead hacia la ola + shake por nivel) y los sprites ordenados por z. Se derivan de la Partida en cada frame. La escena **nunca** escribe en la Partida.
