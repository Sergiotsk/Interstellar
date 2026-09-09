# Quickstart — optimizar y verificar una sección

Guía de validación end-to-end. Detalle de parámetros en [research.md](./research.md);
contratos en [contracts/](./contracts/).

## Prerrequisitos (una sola vez)

```bash
cd interstellar
pnpm install           # instala sharp (devDependency, pinneada)
```

- `assets/_source/` sigue gitignored: si tenés originales crudos de una sección, ponelos en
  `assets/_source/img/<seccion>/`. Si no, el pipeline usa las imágenes actuales de
  `assets/img/` como fuente.

## Optimizar una sección

```bash
# ver qué haría, sin escribir
node tools/optimize-img.mjs mundos-portada --dry-run

# ejecutar
node tools/optimize-img.mjs mundos-portada
```

Salida esperada: por imagen, `<ancho_fuente>→<ancho_salida>` y `<bytes_antes> → <bytes_despues> (−NN%)`;
al final, total de la sección y aviso si supera el tope de peso.

## Migrar el marcado de esa sección

Según [contracts/picture-markup.md](./contracts/picture-markup.md):

1. En el/los `*.html` de la sección: envolver cada `<img>` de contenido en `<picture>` con
   `<source type="image/webp">`; agregar `width`/`height`/`decoding="async"`; `loading="lazy"`
   solo bajo el fold; revisar `alt`.
2. Si la sección tiene fondos en `css/mundos.css`: cambiar `url("...jpg")` → `url("...webp")`.
3. El poster del hero: solo verificar que apunta al archivo optimizado (sin `<picture>`).

## Verificar

```bash
# tests del proyecto (OJO: 'node --test tests/' está roto en Node 25.9.0)
node --test

# idempotencia: correr de nuevo NO debe cambiar nada
node tools/optimize-img.mjs mundos-portada
git status --porcelain assets/img/        # -> vacío
```

En el navegador (`python -m http.server` o similar desde `interstellar/`):

- La sección se ve igual que antes.
- DevTools → Network → filtro `Img`: las imágenes se sirven como `webp`.
- DevTools → Performance / Lighthouse: sin salto de layout por imágenes; el resto de la
  página sin regresiones.
- Consola sin errores; sin 404 de imágenes.

## Cerrar la sección

- Commit chico en `main`: `feat(<seccion>): imagenes a webp con <picture> + pipeline`
  (o `perf(...)`). Incluye los `.webp`/`.jpg` regenerados + los `*.html`/`css` migrados.
- Marcar la sección como `migrada` en `tasks.md`.

## Una sola vez, al cerrar la primera sección

- Actualizar `assets/img/CREDITOS.md`: la nota "solo JPEG / sin WebP" (2026-08-28) pasa a
  "se sirve WebP con respaldo vía `tools/optimize-img.mjs`".
- Actualizar `docs/10-aprendizaje/01-optimizacion-imagenes-web.md`: el proyecto ahora SÍ
  tiene pipeline local; `<picture>`/WebP dejó de estar "fuera de alcance".
