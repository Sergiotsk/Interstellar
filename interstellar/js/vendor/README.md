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
