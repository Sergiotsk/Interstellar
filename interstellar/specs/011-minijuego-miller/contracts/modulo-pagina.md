# Contrato — Módulo de página `js/minijuegos/miller/main.js`

Mismo contrato que el acople, consumido por `js/swup-router.js` (ruta ya registrada).

- `mount()`: busca `[data-miller]`, muestra el briefing, conecta el teclado y el táctil, importa Phaser (`import()` cancelable) y crea el juego con la escena. Si la raíz no existe, no hace nada.
- `unmount()`: invalida la sesión (un `import()` en vuelo no crea nada), corta timers e intervalos, destruye Phaser, quita todos los listeners, cierra el audio, pausa la música y sale de la pantalla completa.
- Sin swup (carga directa), el módulo se monta solo.

**Parámetros de URL**: `?entrada=tactil|teclado` (lo resuelve `comun/logica/dispositivo.js`) y `?autoplay` (arranca la misión sin el briefing, como el original).
