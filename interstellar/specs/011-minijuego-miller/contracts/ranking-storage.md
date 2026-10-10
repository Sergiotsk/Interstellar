# Contrato — Ranking local de Miller

- **Clave**: `interstellar:minijuegos:miller:ranking` (separada de la del acople).
- **Forma**:

```json
{
  "v": 1,
  "entradas": [
    { "nombre": "RANGER", "puntaje": 8420, "fecha": "2026-10-09T21:14:00.000Z", "tiempoS": 58.3 }
  ],
  "ultimoNombre": "RANGER"
}
```

- **Reglas**:
  - Hasta 10 entradas, ordenadas por puntaje descendente. Si hay empate, gana la más antigua.
  - `nombre`: de 1 a 8 caracteres de `ABCDEFGHIJKLMNÑOPQRSTUVWXYZ0123456789 `, normalizado (sin tildes, en mayúsculas, sin espacios en los extremos).
  - Solo entran las misiones exitosas (puntaje > 0).
  - JSON inválido, un `v` distinto o entradas mal formadas: se leen como `{ entradas: [], ultimoNombre: '' }`.
  - Todo acceso a `localStorage` va con `try/catch`. Si falla, el juego sigue sin guardar.
- **Escritura**: se usa `guardarEnRanking(desenlace, nombre, storage, CONFIG)` de `comun/` con `desenlace = { exito, puntaje, tiempoTotal: tiempoMision }`. Los campos propios del acople (`combustible`, `velocidadFinal`, `precision`) quedan `undefined` y `JSON.stringify` los omite.
- **Consumidores**:
  - `miller/main.js`: lee y escribe.
  - `minijuegos/hub.js`: lee la entrada #1 y la pinta en `[data-record-miller]` de la bahía 02.
