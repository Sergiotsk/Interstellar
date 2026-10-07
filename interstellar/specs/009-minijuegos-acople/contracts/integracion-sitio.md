# Contrato — Integración con el sitio (páginas, router, música, módulos de página)

## 1. `minijuegos.html` (hub) — contrato DOM

Hojas, en este orden: `reset → variables → base → layout → cielo → minijuegos`. Ya **no** carga `en-desarrollo.css` (R11). Scripts: `js/layout.js` y `js/minijuegos/hub.js` (los dos `type="module"`). **No** carga Phaser.

```html
<body class="con-cielo">
  <main>
    <section class="minijuegos-intro">            <!-- h1 "Minijuegos" + bajada de una línea -->
      <h1>Minijuegos</h1> …
    </section>
    <section aria-labelledby="bahias-titulo">
      <h2 id="bahias-titulo">Bahías de simulación</h2>
      <ol class="minijuegos-bahias-grid">         <!-- orden = capítulos -->
        <li><article class="bahia-card" data-mision="acople" data-estado="disponible">
          … <h3>No Time for Caution</h3> …
          <p class="bahia-record" data-record-acople>Sin registro</p>   <!-- hub.js reemplaza el texto -->
          <a class="bahia-accion" href="minijuego-acople.html">Iniciar simulación</a>
        </article></li>
        <li><article class="bahia-card" data-mision="miller" data-estado="bloqueada" aria-disabled="true">
          … <h3>Miller's Wave Escape</h3> … <span class="bahia-estado">Próximamente</span>
        </article></li>                            <!-- sin <a> ni tabindex: no es destino de foco (FR-003) -->
        … gargantua, tesseract igual …
      </ol>
    </section>
  </main>
</body>
```

- La jerarquía de encabezados es h1 → h2 → h3. Las tarjetas pasan de `h2` (como en el markup comentado de hoy) a `h3`.
- Se elimina la sección `.meme-seccion` (FR-005).
- La tarjeta de la bahía 1 no menciona RPM (R10).

## 2. `minijuego-acople.html` (simulador) — contrato DOM

Hojas: `reset → variables → base → layout → minijuegos`. Sin `cielo`: el juego tiene su propio fondo estelar. Scripts: `js/layout.js` y `js/minijuegos/acople/main.js`.

```html
<body class="pagina-acople">
  <main>
    <section class="acople" aria-labelledby="acople-titulo" data-acople>
      <h1 id="acople-titulo" class="visualmente-oculto">No Time for Caution — simulador de acople</h1>
      <div class="acople-lienzo" data-acople-lienzo></div>        <!-- Phaser monta acá su canvas -->

      <section class="acople-intro" data-pantalla="intro" hidden> … frases cortas + <button data-accion="saltar-intro">Saltear</button></section>
      <section class="acople-hud" data-pantalla="hud" aria-label="Instrumentos de navegación" hidden>
        <dl> Rotation Sync / Relative Velocity / Distance / Fuel </dl>
        <p class="acople-estado" data-hud-estado aria-live="polite">APPROACHING</p>
        <button data-accion="mute" aria-pressed="false">Sonido del simulador</button>
      </section>
      <section class="acople-pausa" data-pantalla="pausa" hidden> … "Pausa — presioná una tecla" </section>
      <section class="acople-resultado" data-pantalla="resultado" aria-labelledby="resultado-titulo" hidden>
        <h2 id="resultado-titulo">…</h2>   <!-- "Acople completo" / "Misión fallida: <causa>" -->
        <dl> tiempo / combustible / velocidad final / precisión / puntaje (+ récord) </dl>
        <button data-accion="reintentar">Reintentar</button>
        <a href="minijuegos.html">Volver al hub</a>
      </section>
      <section class="acople-aviso" data-pantalla="aviso" hidden>
        <h2>Simulador disponible en desktop</h2> … <a href="minijuegos.html">Volver al hub</a>
      </section>
    </section>
  </main>
</body>
```

- `main.js` muestra **una sola** `[data-pantalla]` a la vez (más el HUD durante `en-curso` y `pausada`), según `partida.fase`.
- Cuando se abre el resultado, el foco va al `h2` del resultado. Al reintentar, vuelve al lienzo, que es focusable con `tabindex="-1"`.
- `prefers-reduced-motion`: el CSS desactiva las animaciones de la intro y del resultado. La escena lee `matchMedia('(prefers-reduced-motion: reduce)')` y pone en 0 la sacudida de cámara y la rotación del campo estelar.
- Los colores de la escena salen de los tokens CSS (`--instrumento-teal`, `--led-ambar`, `--led-alerta`, `--color-texto`, `--color-fondo`) leídos con `getComputedStyle(document.documentElement)` en `main.js` y pasados a la escena. No hay hex duplicados en JS.

## 3. Módulos de página (patrón existente)

```js
// js/minijuegos/hub.js
export function mount()     // lee el récord (record.js) y pinta [data-record-acople]
export function unmount()   // noop (el DOM se va con el swap de <main>)

// js/minijuegos/acople/main.js
export async function mount()   // R12: guarda unmount(); aviso (R7) o import() de Phaser + escena + listeners
export function unmount()       // R12: idempotente; cancela import en vuelo, game.destroy(true), listeners, AudioContext
```

Los dos se auto-inicializan solo si `!window.__SWUP_ROUTER_ACTIVE__`, igual que `galeria.js` y `meme-viewer.js`.

## 4. Cambios en `js/swup-router.js`

```js
PAGE_MODULES['minijuegos.html']        = () => import('./minijuegos/hub.js');          // reemplaza meme-viewer.js
PAGE_MODULES['minijuego-acople.html']  = () => import('./minijuegos/acople/main.js');
HOJAS_ESTILO_SITIO.push('css/minijuegos.css');
```

`viaje.html → meme-viewer.js` no se toca.

## 5. Cambios en `js/layout.js` (R5)

```js
export function rutaSinMusica(archivo)  // true para 'trailer.html' y 'minijuego-acople.html'
```

- `sincronizarAudioRuta(archivo)` e `initMusicaFondo()` usan `rutaSinMusica(archivo)` donde hoy usan `archivo === 'trailer.html'`. El renombre es `muteadoPorTrailer → muteadoPorRuta`.
- `accionPorVisibilidad` mantiene su firma. Su parámetro `silenciadoPorTrailer` pasa a significar "silenciado por ruta"; el renombre es opcional y no rompe tests.
- Test nuevo en `tests/musica-mobile.test.js` o `tests/layout.test.js`: `rutaSinMusica` es verdadera para las dos rutas y falsa para `index.html`, `minijuegos.html` y `mundos-tierra.html`.

## 6. Otros archivos tocados

- `css/en-desarrollo.css`: se va el bloque §4 Bahías (se mueve a `minijuegos.css`) y se actualiza el comentario de cabecera.
- `sitemap.xml`: se agrega `minijuego-acople.html`.
- `js/vendor/phaser@4.2.1/phaser.esm.min.js` + sección en `js/vendor/README.md` (al cerrar la feature).
- Durante el prototipo, el import es `https://esm.sh/phaser@4.2.1`, o el `dist/phaser.esm.min.js` de jsDelivr pinneado.
- `deploy-pages.yml`: **sin cambios**, porque ya copia `*.html`, `css/` y `js/` de forma recursiva.
