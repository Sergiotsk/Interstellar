# Contrato — Módulo de página `js/minijuegos/miller/main.js`

Es el mismo contrato que `js/minijuegos/acople/main.js`, consumido por `js/swup-router.js`.

## Exports

- `mount(): Promise<void>`: busca la raíz `.juego-miller` en `minijuego-miller.html`, crea los overlays, conecta el teclado y el táctil, importa Phaser vendorizado con `import()` dinámico y arranca la partida en `intro`. Si la raíz no existe, no hace nada.
- `unmount(): void`: deja la página como si el juego nunca hubiera existido:
  - destruye la instancia de Phaser (`game.destroy(true)`);
  - cancela los `requestAnimationFrame`, los `setTimeout` y los `setInterval` propios;
  - quita **todos** los listeners: `keydown`, `keyup`, `pointer*`, `visibilitychange`, `blur`, `resize`, `fullscreenchange` y `orientationchange` / `matchMedia`;
  - llama a `audio.destruir()`, que cierra el `AudioContext`;
  - vacía el DOM que creó.

## Garantías

- Si `unmount()` se llama con el `import()` de Phaser en vuelo, la sesión se invalida (`sesion = null`) y el `then` posterior no crea nada.
- `mount → unmount` repetido 10 veces no deja canvas duplicados (`.juego-miller canvas` ≤ 1), sonidos ni errores en la consola.
- Si `swup` no está activo (carga directa de la página), el módulo se monta solo, igual que el acople (marca global del router).

## Registro en el router

```js
'minijuego-miller.html': () => import('./minijuegos/miller/main.js'),
```

## Parámetros de URL

| Parámetro | Efecto |
|---|---|
| `?entrada=tactil\|teclado` | fuerza el modo de entrada (lo resuelve `comun/logica/dispositivo.js`) |
| `?debug=sprites` | monta la galería de animaciones en lugar de la partida (FR-032) |
| `?semilla=N` | fija la semilla del mapa, para reproducir un bug o probar el balance a mano |
