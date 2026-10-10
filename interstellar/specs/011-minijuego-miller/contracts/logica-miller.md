# Contrato — Lógica pura de Miller (`js/minijuegos/miller/logica/`)

Reglas comunes: sin Phaser, sin DOM, sin `Math.random` ni `Date.now`. El azar entra como una semilla (de la que `azar.js` arma un `rng` en [0, 1)) y el tiempo como `dt` en segundos. Ninguna función muta lo que recibe.

| Módulo | Función | Firma | Devuelve |
|---|---|---|---|
| `azar.js` | `crearRng` | `(semilla: int)` | `rng` (mulberry32) |
| `mapa.js` | `crearMapa` | `(config, rng)` | Mapa |
| `fisica.js` | `moverJugador` | `(jugador, acciones, dt, config, { impulso })` | jugador nuevo (inercia + arrastre, z más lento, límites del mundo) |
| `fisica.js` | `resolverRestos` | `(jugador, restos, config)` | `{ jugador, choque: bool }`: separa y aturde si la velocidad ≥ `velChoque` |
| `ola.js` | `crearOla` | `(config)` | ola oculta fuera del mapa |
| `ola.js` | `revelarOla` | `(ola, config, xJugador)` | ola en `xJugador + distanciaRevelacion` (R16) |
| `ola.js` | `avanzarOla` | `(ola, dt, config)` | la misma ola si está oculta; si no, una nueva que avanzó y aceleró |
| `ola.js` | `nivelPeligro` | `(distancia, config)` | `'lejos' \| 'cerca' \| 'inminente'` |
| `baliza.js` | `intensidadSenal` | `(jugador, baliza, config)` | 0..1 |
| `baliza.js` | `frecuenciaPulso` | `(intensidad, config)` | Hz |
| `baliza.js` | `alAlcance` | `(jugador, baliza, config)` | bool |
| `despegue.js` | `enRadio` | `(jugador, ranger)` | bool |
| `despegue.js` | `crearDespegue` | `()` | `{ carga: 0, soltadas: 0, sostenida: false }` |
| `despegue.js` | `cargar` | `({ carga, soltadas, sostenida }, sostenida, dt, config)` | el mismo formato; soltar a medias suma `soltadas` |
| `dilatacion.js` | `horasTerrestres` | `(segundos, config)` | número |
| `dilatacion.js` | `formatoTierra` | `(horas)` | `{ anos, meses, dias }` |
| `scoring.js` | `factores` | `(datos, config)` | `{ tiempo, margen, choques, precision }` en [0, 1] |
| `scoring.js` | `calcularPuntaje` | `(factores, config)` | entero 0..max |
| `scoring.js` | `rangoDe` | `(puntaje, config)` | `'S' \| 'A' \| 'B' \| 'C'` |
| `joystick.js` | `accionesDeJoystick` | `(dx, dy, zonaMuerta)` | array de acciones de movimiento |
| `escala.js` | `escalaEntera` | `(ancho, alto, base)` | entero ≥ 1 |
| `mision.js` | `crearPartida` | `(config, { semilla, conIntro = true })` (crea el `rng` del mapa a partir de la semilla) | Partida en `intro` o `cuenta` |
| `mision.js` | `saltarIntro` | `(partida)` | Partida en `cuenta` |
| `mision.js` | `conAcciones` | `(partida, acciones)` | Partida |
| `mision.js` | `avanzar` | `(partida, dtReal, config)` | Partida (acumulador interno de pasos fijos, `dt` acotado). Pausada o terminada devuelve **la misma referencia**: el loop procesa `eventos` solo si la referencia cambió |
| `mision.js` | `pausar` / `reanudar` | `(partida)` | Partida |
| `mision.js` | `reintentar` | `(partida, config, semilla)` | Partida nueva en `cuenta` |
| `mision.js` | `estadoHud` | `(partida)` | `'SEARCHING' \| 'BEACON ACQUIRED' \| 'WAVE INCOMING' \| 'RETURN TO RANGER' \| 'LIFTOFF READY' \| 'MISSION COMPLETE' \| 'MISSION FAILED'` |
| `sprites.js` (en `miller/`) | `SPRITES`, `ANIMACIONES` | datos | mapas de caracteres y la tabla nombre → `{ frames, fps, loop }` |

## Desde `comun/` (movidas del acople, research R1)

| Módulo | Cambio de firma |
|---|---|
| `comun/logica/ranking.js` | ninguno |
| `comun/logica/nombre-arcade.js` | ninguno |
| `comun/logica/dispositivo.js` | ninguno |
| `comun/logica/acciones.js` | `accionDeTecla(code, teclas)`: `teclas` pasa a ser **obligatorio** |
| `comun/logica/controles-tactiles.js` | `tocar(mapa, id, accion, acciones)`: la lista de acciones válidas pasa a ser **obligatoria**. Se quita `ACCIONES_TACTILES` atado al acople |
| `comun/pantalla-completa.js` | ninguno |

Criterio de aceptación del refactor: `node --test` en verde **antes** de crear `miller/`, con los imports del acople y del hub actualizados.
