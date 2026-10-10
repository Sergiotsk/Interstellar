# Contrato — Lógica de Miller v2 (`js/minijuegos/miller/logica/`)

Reglas comunes: sin Phaser, sin DOM y sin `Math.random` (el azar entra como `rng`). Cada función recibe `sim` y lo actualiza en el lugar (R4). Los sonidos se piden con `sonar(sim, metodo, ...args)`. En la columna "Original" va dónde está cada pieza en `App.tsx`.

| Módulo | Función | Original |
|---|---|---|
| `efectos.js` | `sonar(sim, metodo, ...args)`, `onda(sim, x, y, max, vel, color)`, `textoFlotante(sim, x, y, texto, color, critico)`, `mostrarBanner(sim, texto, sub, color, duracion, parpadeo)`, `avanzarEfectos(sim, dt)` | `spawnRipple`, `spawnFloatingText`, `showBanner`, decaimiento de marcadores y banner; corrige R7 a/b |
| `estado.js` | `crearSim(config, rng, { ancho, alto })` | `initGame` (sin el dron invisible: R7 c) |
| `puntaje.js` | `horasTerrestres(s)`, `anosTerrestres(s)`, `textoAnos(s)`, `puntajeEnVivo(sim)`, `puntajeVictoria(sim)`, `puntajeFallo(sim)`, `rangoDe(total)` | fórmulas de 3049, 3631-3642 y 4095-4102 |
| `danio.js` | `aplicarDanio(sim, monto, x, y, razon, textos)`, `matarJugador(sim, razon, textos, rng)` | `applyPlayerDamage`, `triggerPlayerDeath` |
| `nave.js` | `abordar(sim, textos)`, `dispararMisil(sim)`, `detonarEmp(sim)`, `cambiarArma(sim, arma?)` | `boardSpaceship`, `startMission2Transition`, `fireShipMissile`, `triggerEmpBomb`, `switchWeapon` |
| `superficie.js` | `actualizarSuperficie(sim, entrada, dt, config, rng, textos)` | bloque `MISSION_1_SURFACE` (3669-3957) |
| `orbita.js` | `actualizarTransicion(sim, dt, rng, dims)`, `actualizarOrbita(sim, entrada, dt, config, rng, dims, textos)` | bloques `MISSION_TRANSITION` y `MISSION_2_ORBITAL_ASCENT` (3128-3667) |
| `proyectiles.js` | `actualizarProyectiles(sim, dt, rng, dims, textos)`, `actualizarCaidas(sim, dt, dims)` | pasos 8 y 9 (3936-4073) |
| `motor.js` | `actualizar(sim, entrada, dt, config, rng, dims, textos)` | `update` completo (2989-4103) |
| `hall-of-fame.js` | `leerHall(storage, config)`, `filasHall(entradas)`, `guardarEnHall(storage, config, registro)` | `leaderboard` + guardado (2208-2214, 4924-4944) |

`textos` es la tabla de textos en español del original (banners), inyectada para que la lógica no dependa del idioma.
`dims` = `{ ancho: 960, alto: 540 }` (`canvasWidth`, `canvasHeight`).
