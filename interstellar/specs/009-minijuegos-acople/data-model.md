# Data Model — 009 Minijuegos + acople

Todas las estructuras son objetos planos de JS, sin clases, inmutables por convención: cada paso devuelve un estado nuevo. Las unidades son de juego: distancias en **u** (unidades), ángulos en **rad** y tiempos en **s**. Los valores concretos viven en `config.js` (ver [contracts/logica-acople.md](contracts/logica-acople.md)); los que aparecen acá son solo ilustrativos.

## Mision (hub)

Datos estáticos del hub. El hub los escribe como HTML; no hace falta modelarlos en JS.

| Campo | Tipo | Regla |
|-------|------|-------|
| `id` | string | `acople`, `miller`, `gargantua`, `tesseract` |
| `capitulo` | 1–4 | orden en el hub |
| `estado` | `'disponible' \| 'bloqueada'` | solo `acople` está disponible en el MVP |
| `href` | string \| null | ruta relativa, solo si está disponible (`minijuego-acople.html`) |

## Nave

| Campo | Tipo | Regla |
|-------|------|-------|
| `angulo` | rad | orientación de la nave, sin acotar (se normaliza al comparar) |
| `velAngular` | rad/s | la modifican `rotarIzquierda` y `rotarDerecha`; con fricción angular leve |
| `distancia` | u | ≥ 0 a lo largo del eje; arranca en `config.distanciaInicial` |
| `velAproximacion` | u/s | positiva = acercándose; `impulso` la sube y `freno` la baja (puede quedar negativa: se aleja) |
| `combustible` | 0–1 | fracción; cada acción activa consume por segundo; en 0 no responde a controles |

## Estacion

| Campo | Tipo | Regla |
|-------|------|-------|
| `angulo` | rad | `angulo += velAngular · dt` |
| `velAngular` | rad/s | constante = `config.estacion.velAngular` |
| `anguloPuerto` | rad | offset del puerto respecto de la estación (constante) |

## Variables derivadas (puras, `docking.js`)

- `deltaOmega = |nave.velAngular − estacion.velAngular|`
- `deltaTheta = |normalizar(estacion.angulo + anguloPuerto − nave.angulo)|` en `[0, π]`
- `enRango = nave.distancia ≤ config.rangoAcople`
- `seguro = deltaOmega ≤ tol.omega && deltaTheta ≤ tol.angulo && velAproximacion ≤ tol.velocidad`
- `peligro = deltaOmega > peligro.omega || deltaTheta > peligro.angulo || velAproximacion > peligro.velocidad` (los umbrales de peligro son mayores que las tolerancias)

## Partida (máquina de estados, `mision.js`)

| Campo | Tipo | Regla |
|-------|------|-------|
| `fase` | ver abajo | |
| `tiempo` | s | se acumula solo en `en-curso` |
| `nave`, `estacion` | objetos de arriba | |
| `acciones` | `Set<Accion>` | vacío fuera de `en-curso` |
| `tiempoSinControl` | s | se acumula mientras `|nave.velAngular| > limiteControl`; se resetea al bajar |
| `tiempoEnRango`, `tiempoEnRangoSeguro` | s | para la *suavidad* del scoring |
| `desenlace` | `null \| Desenlace` | se fija al terminar |

### Fases y transiciones

```
cargando ──(motor listo)──▶ intro ──(fin o saltear)──▶ en-curso
en-curso ──(blur / pestaña oculta)──▶ pausada ──(gesto)──▶ en-curso
en-curso ──(acople válido)──▶ acoplada ──▶ resultado
en-curso ──(causa de fallo)──▶ fallida ──▶ resultado
resultado ──(Reintentar)──▶ en-curso      (sin intro: FR-009)
cualquier fase ──(unmount)──▶ [destruida]
```

- `aviso-desktop` es una fase terminal alternativa a `cargando`: si R7 da `true`, nunca se carga el motor.
- La intro se muestra solo en la primera partida de cada montaje de la página.

### Estado del HUD (derivado, `estadoHud(partida)`)

| Estado HUD | Condición (en orden de prioridad) |
|------------|-----------------------------------|
| `DOCKED` | `fase === 'acoplada'` |
| `MISSION FAILED` | `fase === 'fallida'` |
| `UNSAFE APPROACH` | `distancia ≤ zonaCercana && peligro` |
| `DOCKING RANGE` | `enRango && seguro` |
| `MATCHING ROTATION` | `distancia ≤ zonaCercana` (cerca, pero sin todas las variables en tolerancia) |
| `APPROACHING` | resto |

### Resolución del contacto (`evaluarContacto`, cuando `distancia` llega a 0)

1. `velAproximacion > tol.velocidad` → fallo `'impacto'`.
2. `deltaTheta > tol.angulo || deltaOmega > tol.omega` → fallo `'angulo'`.
3. Si no → **acople** (éxito).

### Otras causas de fallo (evaluadas en cada paso)

- `tiempoSinControl > config.margenSinControl` → `'control'`.
- `combustible === 0 && velAproximacion ≤ 0` → `'combustible'`. Sin combustible, si todavía se acerca, se espera al contacto y se juzga por las reglas de arriba.

## Desenlace

| Campo | Tipo |
|-------|------|
| `exito` | boolean |
| `causa` | `null \| 'impacto' \| 'angulo' \| 'control' \| 'combustible'` |
| `tiempoTotal` | s |
| `combustibleRestante` | 0–1 |
| `velocidadFinal` | u/s (`velAproximacion` al terminar) |
| `precision` | 0–1 (solo si hay éxito) |
| `suavidad` | 0–1 (solo si hay éxito) |
| `puntaje` | entero ≥ 0, o `null` si falló (FR-026) |

Los textos de causa en español (FR-015, FR-023) se mapean en la capa de UI desde `causa`.

## Puntaje (`scoring.js`)

Factores, cada uno en `[0, 1]`:

- `precision = 1 − ½·(deltaOmega/tol.omega + deltaTheta/tol.angulo)` al contacto
- `combustible = combustibleRestante`
- `tiempo = clamp((tMax − t)/(tMax − tMin))`, con `tMin = 30` y `tMax = 90` (debajo de 30 s vale 1)
- `suavidad = tiempoEnRangoSeguro / tiempoEnRango` (1 si `tiempoEnRango = 0`)
- `velocidad = 1 − velocidadFinal/tol.velocidad`

`puntaje = round(PUNTAJE_MAX · Σ peso_i · factor_i)`, con `Σ pesos = 1` y `PUNTAJE_MAX = 10000`. Es determinístico (FR-025).

## Record (`record.js`)

Clave: `interstellar:minijuegos:acople:best`

```json
{ "v": 1, "puntaje": 7421, "fecha": "2026-10-07T21:30:00.000Z",
  "tiempoS": 48.2, "combustible": 0.41, "velocidadFinal": 1.8, "precision": 0.93 }
```

Validación: `v === 1`, `puntaje` entero ≥ 0 y finito; si no se cumple, se trata como `null`. Se escribe solo si el puntaje nuevo es mayor que el récord existente (FR-027).

## Accion

`'rotarIzquierda' | 'rotarDerecha' | 'impulso' | 'freno'`. El mapa de teclas está en `config.teclas`.
