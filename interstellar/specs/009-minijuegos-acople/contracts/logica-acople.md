# Contrato — Lógica pura del acople (`js/minijuegos/acople/logica/` + `config.js`)

Ningún módulo de esta carpeta importa Phaser, toca el DOM ni lee globals del navegador, salvo `record.js`, que recibe el storage **inyectado**. Todos se testean con `node --test` en `tests/acople-*.test.js` (Principio V: test en rojo antes de implementar).

## `config.js`

Exporta un único objeto congelado: `export const CONFIG = Object.freeze({...})`. Es el **único** lugar con números de gameplay (FR-018) y nombres de la película (FR-039).

```js
CONFIG = {
  nombres: { estacion: 'Endurance', nave: 'Ranger' },
  teclas: { ArrowLeft: 'rotarIzquierda', ArrowRight: 'rotarDerecha', ArrowUp: 'impulso', Space: 'freno' },
  pasoFijoS, deltaMaxS,
  estacion: { velAngular, anguloPuerto },
  nave: { aceleracionAngular, friccionAngular, empuje, frenado, velAngularInicial },
  distanciaInicial, zonaCercana, rangoAcople,
  tol: { omega, angulo, velocidad },           // tolerancias de acople
  peligro: { omega, angulo, velocidad },       // umbrales de UNSAFE (> tol)
  limiteControl, margenSinControl,             // pérdida de control
  combustible: { inicial: 1, consumoRotacion, consumoImpulso, consumoFreno },
  puntaje: { max: 10000, tMin: 30, tMax: 90, pesos: { precision, combustible, tiempo, suavidad, velocidad } },
  record: { clave: 'interstellar:minijuegos:acople:best', version: 1 },
}
```

Invariantes, cubiertas por test:

- la suma de `pesos` es 1;
- `peligro.* > tol.*`;
- `rangoAcople < zonaCercana < distanciaInicial`.

## `acciones.js`

```js
accionDeTecla(code, teclas = CONFIG.teclas) → Accion | null
presionar(activas: Set, accion) → Set     // devuelve un Set nuevo
soltar(activas: Set, accion) → Set
soltarTodo() → Set                         // vacío
```

## `fisica.js`

```js
crearNave(config) → Nave
crearEstacion(config) → Estacion
pasoFisica({ nave, estacion }, acciones: Set, dt, config) → { nave, estacion }
```

- Las acciones solo tienen efecto si `nave.combustible > 0`.
- El combustible baja según las acciones activas · `dt` y nunca queda < 0.
- `distancia` nunca queda < 0: se clampa en 0, y el contacto lo resuelve `mision.js`.

## `docking.js`

```js
normalizarAngulo(rad) → rad en (−π, π]
deltaOmega(nave, estacion) → ≥ 0
deltaTheta(nave, estacion) → [0, π]
evaluarSincronia(nave, estacion, config) → { deltaOmega, deltaTheta, enRango, seguro, peligro }
evaluarContacto(nave, estacion, config) → { rebote: true } | { exito: false, causa: 'impacto' | 'angulo' }
motivoRechazo(sincronia, nave, config) → null | 'distancia' | 'velocidad' | 'giro' | 'angulo'
```

## `mision.js`

```js
crearPartida(config, { conIntro = true }) → Partida          // fase 'intro' o 'en-curso'
iniciar(partida) → Partida                                   // intro → en-curso
pausar(partida) → Partida                                    // en-curso → pausada; acciones = soltarTodo()
reanudar(partida) → Partida                                  // pausada → en-curso
conAcciones(partida, acciones: Set) → Partida                // ignorado si fase !== 'en-curso'
avanzar(partida, dtReal, config) → Partida                   // acumula y aplica pasos fijos de config.pasoFijoS; dtReal recortado a deltaMaxS
estadoHud(partida, config) → 'APPROACHING' | 'MATCHING ROTATION' | 'DOCKING RANGE' | 'UNSAFE APPROACH' | 'DOCKED' | 'MISSION FAILED'
reintentar(partida, config) → Partida                        // nueva, conIntro: false
solicitarAcople(partida, config) → Partida                   // Enter: acople si enRango && seguro; si no, rechazo con espera
indicacionHud(partida, estado) → string                      // 'PRESS ENTER TO DOCK' | 'REJECTED · TOO FAR' | … | ''
```

- `avanzar` es la única función que mueve el tiempo. Detecta los fallos (`control`, `combustible`) y el contacto, y al terminar fija `desenlace`, incluido el `puntaje` vía `scoring.js`.
- En las fases `intro`, `pausada`, `acoplada` y `fallida`, `avanzar` no cambia la física. La estación sí sigue girando en `intro`, como decorado.

## `scoring.js`

```js
factores(desenlaceParcial, config) → { precision, combustible, tiempo, suavidad, velocidad }   // cada uno en [0,1]
calcularPuntaje(factores, config) → entero ≥ 0
```

Es determinístico: la misma entrada da la misma salida.

## `record.js`

```js
leerRecord(storage = globalThis.localStorage, config) → Record | null    // nunca lanza
guardarSiMejor(desenlace, storage, config, ahora = new Date()) → { guardado: boolean, record: Record | null }  // nunca lanza
```

- Un `storage` ausente, o que lanza en `getItem`/`setItem`, se trata como no disponible: devuelve `null` o `{ guardado: false }`.
- Un JSON inválido, `v` distinto o un `puntaje` no entero, negativo o no finito se tratan como `null`.

## `dispositivo.js`

```js
debeMostrarAvisoDesktop({ punteroGrueso, algunPunteroFino }) → boolean   // punteroGrueso && !algunPunteroFino
```

## Tests mínimos (uno o más por regla de FR-040)

| Archivo | Cubre |
|---------|-------|
| `tests/acople-config.test.js` | invariantes de CONFIG |
| `tests/acople-acciones.test.js` | mapeo de teclas, presionar/soltar/soltarTodo inmutables |
| `tests/acople-fisica.test.js` | rotación, empuje, freno, consumo, sin combustible = sin respuesta, clamp de distancia |
| `tests/acople-docking.test.js` | normalización de ángulos, seguro/peligro, contacto → éxito/impacto/ángulo |
| `tests/acople-mision.test.js` | transiciones de fase, pausa suelta acciones, fallos `control`/`combustible`, estadoHud por prioridad, reintentar sin intro |
| `tests/acople-scoring.test.js` | factores en [0,1], determinismo, peso total, fallo → `puntaje: null` |
| `tests/acople-record.test.js` | storage fake: vacío, corrupto, que lanza, solo guarda si es mejor |
| `tests/acople-balance.test.js` | piloto de referencia acopla en [30, 90] s; política torpe falla (R9) |
| `tests/acople-dispositivo.test.js` | tabla de verdad del aviso |
