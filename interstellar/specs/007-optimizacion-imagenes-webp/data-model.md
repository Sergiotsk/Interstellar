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
| `backdrop-mundo` | 2560 | `<img>` de backdrop en `mundos*.html` + `background-image` en `css/mundos.css` |
| `galeria-miniatura` | 800 | grid de `galeria.html` |
| `galeria-ampliada` | 1600 | lightbox / enlace de `galeria.html` |
| `filmstrip-frame` | 900 | tira de celuloide (`mundos-tierra.html`, `mundos-gargantua.html`) |
| `retrato-personaje` | 720 | `.ficha-retrato img` en `personajes.html` |

**Regla**: `anchoSalida = min(anchoObjetivo, dimensiones.ancho)` — nunca agranda.

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
| `mundos-portada` | `css/mundos.css`, `mundos.html` (backdrops) | ~15 (CSS + `<img>`) |
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
