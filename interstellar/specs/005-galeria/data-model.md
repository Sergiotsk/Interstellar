# Data Model — Galería de imágenes (feature 005)

Contenido estático: no hay base de datos ni estado en runtime. Este documento fija las
**entidades conceptuales** de la galería y el **reparto concreto de las 28 imágenes** por
categoría, que la Fase 2 (`tasks.md`) traduce a marcado.

## Entidades

### Categoría de galería

Una de las cuatro agrupaciones de la galería, alineada 1:1 con un eje del sitio.

| Campo | Valor |
|---|---|
| `id` (ancla) | `mundos` · `personajes` · `ciencia` · `viaje` |
| Nombre visible (`<h2>`) | "Mundos" · "Personajes" · "La Ciencia" · "El Viaje" |
| Enlace al eje | `mundos.html` · `personajes.html` · `ciencia.html` · `viaje.html` (ruta relativa) |
| Ítems | colección ordenada de **Ítem de imagen** (ver reparto abajo) |
| Orden de presentación | Mundos → Personajes → La Ciencia → El Viaje (el del menú superior) |

Reglas:

- Las cuatro categorías DEBEN estar presentes y en ese orden (FR-001).
- Cada categoría DEBE tener entre 2 y 4 imágenes nuevas de esta feature (FR-006) — el
  reparto real es 4 / 3 / 3 / 3.
- El `id` de cada categoría DEBE resolver con carga directa (`galeria.html#ciencia`) y
  quedar utilizable bajo el encabezado (FR-017, SC-006) — lo garantiza la compensación de
  scroll ya existente (sección 9 de `global.css`).

### Ítem de imagen

Una entrada de la galería dentro de una categoría.

| Campo | Descripción |
|---|---|
| `id` de asset | coincide con `assets/img/CREDITOS.md` |
| archivo | nombre local en `assets/img/`, kebab-case, `.jpg` |
| `alt` | texto alternativo descriptivo de lo que muestra la imagen (FR-003, FR-011) |
| pie (`<figcaption>`) | qué muestra + a qué eje pertenece; tono descriptivo, español, sin ciencia ni etiquetas de rigor |
| origen | `reutilizada` (features 001–004) o `nueva` (feature 005, FILMGRAB) |
| dimensión | `1280×720` o `960×402` (las 960 son de film-grab a esa resolución) |

Reglas:

- Cada ítem se materializa como `<li><figure>` con un `<a href="assets/img/<archivo>">`
  que envuelve un `<img loading="lazy">` y un `<figcaption>` hermano (FR-003, FR-004,
  FR-008a).
- El `<img>` se renderiza como tile uniforme: `aspect-ratio: 3 / 2`, `object-fit: cover`
  (FR-002a). El recorte es esperado; el archivo enlazado se ve sin recortar (SC-005,
  SC-008).
- El `alt` NUNCA se repite literal en el `<figcaption>`: `alt` describe la imagen para
  quien no la ve; el pie añade el contexto de eje.
- Ninguna imagen individual supera 250 KB (FR-008). Verificado: máx. `mundos-mann-hielo.jpg`
  244 KB.
- Una misma imagen aparece en **una sola** categoría (sin figuras duplicadas); el archivo
  en `assets/img/` es único (spec.md, caso límite).

### Crédito de imagen

Por cada imagen, la fuente, el enlace de origen, la licencia/condiciones y la atribución.

- Vive en `assets/img/CREDITOS.md` (tabla, estado `descargado`) y en el array
  `ASSET_CREDITS` de `js/creditos.js`, con **sincronía 1:1** (FR-007, SC-004).
- Estado actual: 28 entradas en ambos lados (15 previas + 13 de esta feature). El test
  `tests/creditos.test.js` afirma `ASSET_CREDITS.length === 28`.
- La galería NO expone la atribución por imagen en la página: el pie común enlaza a
  `creditos.html`, que lista las 28 (HU2, SC-008).

## Reparto de las 28 imágenes por categoría

### Mundos (`#mundos`) — 9 imágenes

| archivo | origen | qué muestra (base del `alt`/pie) |
|---|---|---|
| `mundos-tierra.jpg` | reutilizada | La Tierra desde el espacio (Blue Marble de la NASA) |
| `mundos-tierra-tormenta.jpg` | nueva | La tormenta de polvo bajando por la calle del pueblo |
| `mundos-tierra-granja.jpg` | nueva | La granja de los Cooper entre el maíz |
| `mundos-gargantua.jpg` | reutilizada | Gargantúa vista desde el sistema (fotograma de Mundos) |
| `mundos-miller.jpg` | reutilizada | El planeta de Miller (fotograma de Mundos) |
| `mundos-miller-oceano.jpg` | nueva | La Ranger sobre el océano infinito de Miller, cielo de tormenta |
| `mundos-mann.jpg` | reutilizada | El planeta de Mann (fotograma de Mundos) |
| `mundos-mann-hielo.jpg` | nueva | Un astronauta en la cresta helada del planeta de Mann |
| `mundos-tesseract.jpg` | reutilizada | El Tesseract (fotograma de Mundos) |

### Personajes (`#personajes`) — 10 imágenes

| archivo | origen | qué muestra |
|---|---|---|
| `personajes-cooper.jpg` | reutilizada | Retrato de Cooper |
| `personajes-murph.jpg` | reutilizada | Retrato de Murph (el del eje Personajes) |
| `personajes-murph-nina.jpg` | nueva | Murph niña (Mackenzie Foy) en el campo |
| `personajes-murph-adulta.jpg` | nueva | Murph adulta (Jessica Chastain) en el estudio |
| `personajes-murph-anciana.jpg` | nueva | Murph anciana (Ellen Burstyn), entrevista documental |
| `personajes-brand.jpg` | reutilizada | Retrato de la Dra. Amelia Brand |
| `personajes-profesor-brand.jpg` | reutilizada | Retrato del Profesor Brand |
| `personajes-mann.jpg` | reutilizada | Retrato del Dr. Mann |
| `personajes-tars-case.jpg` | reutilizada | TARS y CASE |
| `personajes-astronauta.jpg` | reutilizada | Astronauta (referencia, NASA) |

### La Ciencia (`#ciencia`) — 5 imágenes

| archivo | origen | qué muestra |
|---|---|---|
| `ciencia-agujero-negro.jpg` | reutilizada | Ilustración de un agujero negro (NASA/JPL-Caltech) |
| `hero-backdrop.jpg` | reutilizada | La primera foto real de un agujero negro (M87, EHT) |
| `ciencia-gargantua.jpg` | nueva | Gargantúa y su disco de acreción, la lente gravitacional |
| `ciencia-tesseract.jpg` | nueva | El Tesseract: la retícula tetradimensional tras la biblioteca |
| `ciencia-agujero-gusano.jpg` | nueva | Saturno y el punto brillante del agujero de gusano |

### El Viaje (`#viaje`) — 4 imágenes

| archivo | origen | qué muestra |
|---|---|---|
| `viaje-pilares-de-creacion.jpg` | reutilizada | Los Pilares de la Creación (NASA, ESA/Hubble) |
| `viaje-endurance.jpg` | nueva | La nave Endurance, el anillo completo girando contra el negro |
| `viaje-tierra-orbita.jpg` | nueva | La Tierra desde órbita con el anillo de acoplamiento de la Ranger |
| `viaje-tierra-lejana.jpg` | nueva | La Tierra en creciente desde el espacio profundo, la nave un punto |

**Totales**: Mundos 9 · Personajes 10 · La Ciencia 5 · El Viaje 4 = **28**. Cumple SC-002
(el 100 % de las imágenes de los ejes está en la galería), SC-003 (≥ 24 total; 3–4 nuevas
por categoría) y SC-009 (enlace por categoría a su eje).

## Reglas de validación (derivadas de la spec)

| Regla | Requisito |
|---|---|
| 4 secciones, ids exactos, orden del menú | FR-001, SC-001 |
| `<h2>` + enlace al eje por sección | FR-002, FR-009, SC-009 |
| `<ul class="galeria-grid">` de `<figure>` | FR-002, FR-011 |
| `<a>` a `assets/img/<archivo>` por miniatura, ruta relativa | FR-004 |
| `<img loading="lazy">` en el 100 % de las miniaturas | FR-008a, SC-011 |
| tile 3:2 `object-fit: cover` | FR-002a, SC-005 |
| `alt` descriptivo por `<img>` informativo | FR-003, FR-011 |
| `<figcaption>` con qué muestra + eje | FR-003, SC-010 |
| todas las imágenes de los ejes presentes, sin archivo duplicado | SC-002 |
| cada imagen ≤ 250 KB; página ≤ 4 MB | FR-008, SC-004, SC-011 |
| sincronía 1:1 `CREDITOS.md` ↔ `ASSET_CREDITS` (28) | FR-007, SC-004 |
| 1 columna a 320 px, sin scroll horizontal | FR-012, SC-005 |
| 4 anclas con carga directa | FR-017, SC-006 |
| sin JS nuevo, sin animación, sin 2.º color saturado | FR-014, FR-015, FR-016 |
