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
- Se importan por **ruta relativa** desde los módulos propios:
  ```js
  import { gsap } from '../vendor/gsap@3.13.0/gsap.min.js';
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

_(vacío — todavía no se vendorizó ninguna librería)_

Ver `docs/10-aprendizaje/03-librerias/` para las fichas de cada candidata.
