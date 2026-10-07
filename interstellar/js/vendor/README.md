# js/vendor/ — librerías de terceros vendorizadas

Constitución **v2.0.0**, Principio I: se permiten librerías de propósito acotado,
**sin paso de build**. Este directorio guarda las librerías **críticas** copiadas
al repo para no depender de un CDN en runtime.

## Convención

```
js/vendor/<lib>@<version>/<archivos ESM>
```

- Carpeta por librería, **con la versión en el nombre** (`gsap@3.13.0/`), para
  que un upgrade sea explícito y revisable en el diff.
- Solo se copian los archivos **ESM** que se importan (y sus dependencias
  internas). Nada de `dist/` entero si no hace falta.
- Se importan por **ruta relativa** desde los módulos propios. Para un módulo que
  vive directo en `js/` la ruta es `./vendor/…`; desde un `js/<subcarpeta>/` sería
  `../vendor/…`:
  ```js
  // desde js/mundo-portada.js
  const { gsap } = await import('./vendor/gsap@3.13.0/gsap.mjs');
  ```
- Se cargan **solo en la(s) página(s) que los usan** (nunca en un `<script>`
  global si una sola página lo necesita). Lo pesado (three, Pixi, Phaser) va con
  `import()` dinámico después del primer paint.

## Flujo

1. **Prototipo** (rama de spike o de la feature): `import` desde
   `https://esm.sh/<lib>@<version>` con versión fija.
2. **Antes de cerrar la feature**: bajar los archivos ESM a
   `js/vendor/<lib>@<version>/` y cambiar los imports a ruta relativa.
3. La spec de la feature documenta: qué librería, versión, peso (KB gzip), qué
   problema resuelve, por qué no se hizo con plataforma nativa, y en qué páginas
   carga.

Una librería que se deja como ESM pinneado desde CDN en producción tiene que
justificar el motivo en su spec y asumir ese CDN como dependencia de runtime.

## Contenido actual

### `gsap@3.13.0/`

| Archivo | Qué es | Peso |
|---|---|---|
| `gsap.mjs` | core de GSAP (tween/timeline/matchMedia + eases + CSSPlugin) | ~69 KB (~24 KB gzip) |
| `ScrollTrigger.mjs` | plugin ScrollTrigger (scrub, pin, toggle por viewport) | ~43 KB (~13 KB gzip) |

- **Problema que resuelve**: animación atada al scroll (portadas de mundos
  *scroll-scrubbed*) y loop con `timeScale` + pausa por visibilidad (tira de
  celuloide). Reescribir `matchMedia` + scrub + pin + cleanup con
  `IntersectionObserver` a mano sería frágil y mucho más código.
- **Dónde carga**: solo en las 5 páginas de mundos (`mundos-*.html`), con
  `import()` dinámico **después** del primer paint, desde `js/mundo-portada.js` y
  `js/filmstrip.js`. Nunca global.
- **Degradación**: si el `import()` falla, ambos módulos caen a su estado base
  (hero estático / tira con scroll manual). GSAP solo MEJORA.

**Origen (reproducible):** build ESM `es2022` de esm.sh, versión fijada —

```
curl -sL https://esm.sh/gsap@3.13.0/es2022/gsap.mjs          -o gsap.mjs
curl -sL https://esm.sh/gsap@3.13.0/es2022/ScrollTrigger.mjs -o ScrollTrigger.mjs
```

Cada archivo es un bundle autocontenido (cero imports internos). Único retoque: se
quitó la línea final `//# sourceMappingURL=…` (el `.map` no se versiona). GSAP se
distribuye bajo su [Standard License](https://gsap.com/standard-license) (gratis
para este uso).

### `swup@4.10.0/`

| Archivo | Qué es | Peso |
|---|---|---|
| `swup.mjs` | core de Swup v4 (enrutador SPA gapless, transiciones y hooks) | ~27 KB (~9 KB gzip) |

- **Problema que resuelve**: navegación SPA gapless en el cliente sin recarga completa de página para mantener la reproducción continua del audio de fondo (`<audio>` en el `<header>`) entre todas las páginas del sitio.
- **Dónde carga**: cargado globalmente desde `js/layout.js` / enrutador para orquestar transiciones sobre el contenedor `<main>`.
- **Degradación**: si el módulo o JS no están disponibles, cada página HTML sigue funcionando como MPA estándar nativo vía enlaces `<a>`.

**Origen (reproducible):** build ESM `es2022` bundle de esm.sh, versión fijada:

```
curl -sL https://esm.sh/swup@4.10.0/es2022/swup.bundle.mjs -o swup.mjs
```


### `phaser@4.2.1/`

| Archivo | Qué es | Peso |
|---|---|---|
| `phaser.esm.min.js` | motor de juego 2D completo (loop, escenas, `Graphics`, partículas, cámara, escalado) | 1.377.611 B (~1,31 MB, **~345 KB gzip**) |

- **Problema que resuelve**: el loop de juego, una escena, las partículas de los propulsores, los efectos de cámara (sacudida, flash) y el escalado del lienzo (`Scale.RESIZE`) del simulador de acople. Hacer todo eso a mano sobre Canvas 2D son cientos de líneas de infraestructura que no son el foco de la feature (spec 009, Principio I).
- **Qué NO hace**: las reglas del juego. La física, el acople, el puntaje y la máquina de estados viven en `js/minijuegos/acople/logica/`, sin Phaser y testeadas con `node --test`. Phaser solo dibuja.
- **Dónde carga**: únicamente en `minijuego-acople.html`, con `import()` dinámico desde `js/minijuegos/acople/main.js` (`'../../vendor/phaser@4.2.1/phaser.esm.min.js'`), después del primer paint. Nunca en el hub ni de forma global. En dispositivos táctiles sin teclado ni siquiera se descarga.
- **Degradación**: si el `import()` falla, el overlay de aviso muestra "Simulador fuera de línea" con un enlace al hub.
- **Versión**: 4.2.1 (`latest` al 2026-10-07). Se eligió frente a la 3.90 (~308 KB gzip), que es la última de la 3.x, porque es la línea viva. La medición está en `specs/009-minijuegos-acople/research.md` R1.

**Origen (reproducible):** build ESM oficial del paquete npm, servido por jsDelivr y sin retoques (no trae `sourceMappingURL`):

```
curl -sL https://cdn.jsdelivr.net/npm/phaser@4.2.1/dist/phaser.esm.min.js -o phaser.esm.min.js
```

Es autocontenido (cero imports internos) y exporta `default` más los namespaces (`Game`, `Scene`, `AUTO`, `Scale`…). Phaser se distribuye bajo licencia MIT.
