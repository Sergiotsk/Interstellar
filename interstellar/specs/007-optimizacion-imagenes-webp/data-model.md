# Phase 1 — Data Model

No hay base de datos ni estado en runtime. Las "entidades" son los objetos conceptuales que
el pipeline y la migración manipulan: archivos y sus relaciones.

---

## Entidad: Imagen fuente

La mejor versión disponible de una imagen lógica.

| Campo | Descripción |
|---|---|
| `nombreLogico` | Base del nombre, `kebab-case`, sin extensión (p. ej. `mundos-gargantua`). |
| `seccion` | Sección a la que pertenece (ver entidad Sección). |
| `ruta` | `assets/_source/img/<seccion>/<nombreLogico>.<ext>` si existe (local, gitignored); si no, `assets/img/<nombreLogico>.<ext>` (se usa a sí misma como fuente). |
| `formatoOriginal` | `jpg` \| `png` (los `webp`/`svg` existentes no son fuentes a re-procesar salvo excepción). |
| `dimensiones` | ancho × alto en px del archivo fuente. |
| `tieneAlfa` | `true` si es PNG con transparencia → el respaldo se mantiene PNG. |

**Reglas**:
- Si no hay original crudo, se acepta **una** recompresión con pérdida sobre el archivo
  servido actual.
- SVG y vectoriales: fuera del pipeline.

---

## Entidad: Contexto de uso

Determina el ancho de salida. Valor fijo por categoría (ver `research.md` R3).

| `contexto` | `anchoObjetivo` (px) | Dónde |
|---|---|---|
| `poster-hero` | 1280 | `index.html` `poster=` |
| `backdrop-mundo` | 2560 | `<img>` de mundo en `mundos.html` (tarjetas del hub) y `mundos-{mann,miller,tesseract}.html`; `background-image` de la portada scroll en `css/mundos.css` |
| `galeria-miniatura` | 800 | grid de `galeria.html` |
| `galeria-ampliada` | 1600 | lightbox / enlace de `galeria.html` |
| `filmstrip-frame` | 900 | tira de celuloide (`mundos-tierra.html`, `mundos-gargantua.html`) |
| `retrato-personaje` | 720 | `.ficha-retrato img` en `personajes.html` |

**Regla**: `anchoSalida = min(anchoObjetivo, dimensiones.ancho)` — nunca agranda.

**Contexto por archivo, no por sección** (D2-A, acordado 2026-09-08): un archivo se
procesa UNA vez, con el ancho de su **uso más exigente**. `galeria.html` reutiliza los
mismos archivos que el resto del sitio (≈19/50); un retrato que también aparece en la
galería toma el mayor de los dos anchos. Implementado en `contextForImage()` de
`tools/optimize-img.lib.mjs` (mapa explícito `BACKDROP_MUNDO` / `RETRATO_PERSONAJE` +
prefijo `mundos-{tierra,gargantua}-` → `filmstrip-frame`; resto → `galeria-ampliada`).
Consecuencia: optimizar una sección puede tocar archivos compartidos con otra (p. ej.
`mundos-portada` recomprime `mundos-gargantua.jpg`, que además es `<img>` en el hub y la
galería). El marcado de cada sección se migra igual por separado.

**Idempotencia** (SC-005): la mayoría del material NO tiene original en `assets/_source/`
(gitignored, decisión 1B). Si la fuente es el propio `assets/img/<n>.<ext>` y ya existe
`<n>.webp`, el pipeline **saltea** ese archivo (re-encodear sería pérdida generacional y el
árbol nunca se estabilizaría). `--force` regenera. Si hay original en `assets/_source/`, se
reprocesa siempre (determinista desde el pristino).

---

## Entidad: Derivados servibles

Lo que el pipeline escribe en `assets/img/` por cada imagen fuente.

| Campo | Descripción |
|---|---|
| `webp` | `assets/img/<nombreLogico>.webp` — SIEMPRE. |
| `respaldo` | `assets/img/<nombreLogico>.<formatoOriginal>` — para imágenes de contenido (`<img>`). Para backdrops de CSS se genera igual pero el CSS no lo referencia. |
| `anchoSalida` | según Contexto de uso. |
| `credito` | heredado del original; el derivado NO tiene entrada propia en `CREDITOS.md` / `ASSET_CREDITS`. |

**Reglas**:
- Nombres estables: el `.webp` y el `.<ext>` comparten `nombreLogico` con la fuente. La
  migración de marcado depende de esta convención.
- Byte-determinismo: mismos fuente + parámetros + versión de `sharp` ⇒ mismos bytes. El
  pipeline no reescribe si el contenido no cambió.

---

## Entidad: Sección

Unidad de aplicación incremental. Una sección se migra de una sola vez, en un commit.

| `seccion` | Archivos de marcado | Nº aprox. de imágenes |
|---|---|---|
| `mundos-portada` | `css/mundos.css` (portada scroll de `mundos-tierra` / `mundos-gargantua` / `mundos-miller` / `mundos-mann` / `mundos-tesseract`) | 29 (solo `background-image`; sin `<img>` propios). Scope ampliado el 2026-09-09: Miller/Mann/Tesseract se rehicieron después del plan. |
| `galeria` | `galeria.html` | 50 |
| `filmstrip-tierra` | `mundos-tierra.html` | 20 |
| `filmstrip-gargantua` | `mundos-gargantua.html` | 15 |
| `mundos-hub` | `mundos.html`, `mundos-mann/miller/tesseract.html` | ~8 |
| `personajes` | `personajes.html` | 6 |
| `ciencia` | `ciencia.html` | 1 |
| `contacto` | `contacto.html`, `gracias.html` | 2 |
| `hero` | `index.html` (solo poster) | 1 |

**Estado de una sección**: `pendiente` → `migrada` (marcado en `tasks.md` y en el commit).

**Regla de entrada**: una sección no pasa a `migrada` hasta que su contenido esté cerrado
(sin cambios de imágenes pendientes).

---

## Relaciones

```
Sección 1───* Imagen fuente 1───1 Contexto de uso
                     │
                     └──1───1 Derivados servibles (webp [+ respaldo])
```

- Una **Sección** agrupa muchas **Imágenes fuente**.
- Cada **Imagen fuente** tiene exactamente un **Contexto de uso** (define su ancho) y
  produce exactamente un juego de **Derivados**.
- El **crédito** es propiedad de la Imagen fuente (original); los Derivados lo heredan.

---

## Reglas derivadas de requisitos

| Regla | Origen |
|---|---|
| Nunca agrandar (ancho salida ≤ ancho fuente) | FR-002, edge case |
| `<img>` de contenido → `<picture>` con WebP + respaldo | FR-005 |
| `background-image` → `.webp` directo (respaldo opcional) | FR-005b |
| Toda imagen migrada declara `width`/`height` | FR-006 |
| Bajo el fold → `loading="lazy"`; LCP/poster → sin diferir | FR-007 |
| `alt` con sentido / vacío si decorativa | FR-008, Principio II |
| Derivados no suman entradas de crédito | FR-011 |
| Re-run sin cambios de fuente = 0 diffs | SC-005 |
| Sección migrada baja ≥ 25 % y respeta tope de peso | SC-002, FR-013 |
