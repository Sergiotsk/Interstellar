# Research — Galería de imágenes (feature 005)

**Fecha**: 2026-08-30 · **Spec**: `spec.md` · **Alimenta**: FR-006, FR-007, FR-008, SC-003, SC-004

## D1 — Fuente de las imágenes nuevas

**Decisión**: FILMGRAB (`film-grab.com/2015/04/17/interstellar/`), misma fuente y política
que las features 002 y 003.

**Alternativas evaluadas**:

- **fancaps.net** (`MovieImages.php?movieid=5010`) — descartada como fuente principal.
  El set de Interstellar tiene 1512 capturas contiguas
  (`mvt.fancaps.net/<id>.jpg` miniatura, `cdni.fancaps.net/file/fancaps-movieimages/<id>.jpg`
  full 1920×1080) pero **solo cubre los primeros ~50 minutos** de la película: termina
  cuando la Endurance se aleja de la Tierra, antes del agujero de gusano. No tiene Miller,
  Mann, Gargantúa, Tesseract, Murph adulta, el acoplamiento ni el final. Sirve solo para
  reforzar la Tierra / el lanzamiento, cosa que FILMGRAB ya cubre.
- **TMDB / arXiv render** — no usadas. El render científico de Gargantúa (`arXiv:1502.03808`)
  sigue con licencia sin confirmar (ver `CREDITOS.md`, fila `ciencia-gargantua-render`,
  estado `pendiente`); no entra a la galería (spec.md, caso límite).

**FILMGRAB**: galería de 60 fotogramas curados que abarca toda la película. Los 40 del
tramo espacial están en 1280×720; los 20 del acto en la Tierra en 960×402 (formato scope).
URLs full-size en el HTML servido: `wp-content/uploads/photo-gallery/<n> (<k>).jpg`.

## D2 — Licencia y atribución

Fotogramas de la película con copyright de Warner Bros. / Paramount. Uso académico con
atribución, misma política que features 002/003 (`research.md` D2 de la feature 001).
Atribución requerida: `© Warner Bros. Pictures / Paramount Pictures`. Registro en
`assets/img/CREDITOS.md` (estado `descargado`) + línea espejo en `ASSET_CREDITS`
(`js/creditos.js`). Sincronía 1:1 verificada: 15 → 28 entradas.

## D3 — Optimización (Principio I: sin tooling nuevo en el repo)

Descarga con `curl` (User-Agent de navegador; `film-grab.com` responde 403 al UA por
defecto). Re-encode con Pillow (Python del sistema, fuera del repo): cap de ancho 1280 px,
sin EXIF, JPEG progresivo, `optimize`, búsqueda binaria de `quality` para caer ≤ 250 KB
por archivo. Los 960×402 se dejan a esa resolución (la fuente no da más).

## D4 — Manifiesto de imágenes nuevas (13)

| id (`CREDITOS.md`) | archivo | still FILMGRAB | dimensión | peso | categoría | qué muestra |
|---|---|---|---|---|---|---|
| galeria-mundos-tierra-tormenta | `mundos-tierra-tormenta.jpg` | 37 | 1280×720 | 136 KB | Mundos | La tormenta de polvo bajando por la calle del pueblo, autos huyendo |
| galeria-mundos-miller-oceano | `mundos-miller-oceano.jpg` | 33 | 1280×720 | 151 KB | Mundos | La Ranger sobre el océano infinito del planeta de Miller, cielo de tormenta |
| galeria-mundos-mann-hielo | `mundos-mann-hielo.jpg` | 35 | 1280×720 | 244 KB | Mundos | Un astronauta en la cresta helada del planeta de Mann |
| galeria-mundos-tierra-granja | `mundos-tierra-granja.jpg` | 05 | 960×402 | 114 KB | Mundos | La granja de los Cooper entre el maíz, cosechadoras al frente |
| galeria-viaje-endurance | `viaje-endurance.jpg` | 29 | 1280×720 | 67 KB | El Viaje | La nave Endurance, el anillo completo girando contra el negro |
| galeria-viaje-tierra-orbita | `viaje-tierra-orbita.jpg` | 28 | 1280×720 | 175 KB | El Viaje | La Tierra desde órbita con el anillo de acoplamiento de la Ranger |
| galeria-viaje-tierra-lejana | `viaje-tierra-lejana.jpg` | 30 | 1280×720 | 84 KB | El Viaje | La Tierra en creciente desde el espacio profundo, la nave un punto |
| galeria-personajes-murph-nina | `personajes-murph-nina.jpg` | 04 | 960×402 | 59 KB | Personajes | Murph niña (Mackenzie Foy) en el campo |
| galeria-personajes-murph-adulta | `personajes-murph-adulta.jpg` | 51 | 1280×720 | 91 KB | Personajes | Murph adulta (Jessica Chastain) en el estudio |
| galeria-personajes-murph-anciana | `personajes-murph-anciana.jpg` | 02 | 960×402 | 44 KB | Personajes | Murph anciana (Ellen Burstyn), entrevista documental |
| galeria-ciencia-gargantua | `ciencia-gargantua.jpg` | 32 | 1280×720 | 111 KB | La Ciencia | Gargantúa y su disco de acreción, la lente gravitacional |
| galeria-ciencia-tesseract | `ciencia-tesseract.jpg` | 46 | 1280×720 | 209 KB | La Ciencia | El Tesseract: la retícula tetradimensional tras la biblioteca |
| galeria-ciencia-agujero-gusano | `ciencia-agujero-gusano.jpg` | 31 | 1280×720 | 35 KB | La Ciencia | Saturno y el punto brillante del agujero de gusano |

Total de las 13: ~1,5 MB. Con las 15 imágenes reutilizadas (features 001–004), la galería
queda en **28 imágenes**. Presupuesto de página (FR-008): ≤ 4 MB; margen amplio.

## D5 — Cobertura por categoría tras esta feature

| Categoría | Reutilizadas | Nuevas | Total |
|---|---|---|---|
| Mundos | 5 (`mundos-tierra`, `-gargantua`, `-miller`, `-mann`, `-tesseract`) | 4 | 9 |
| Personajes | 7 (`-cooper`, `-murph`, `-brand`, `-profesor-brand`, `-mann`, `-tars-case`, `-astronauta`) | 3 (etapas de Murph) | 10 |
| La Ciencia | 2 (`ciencia-agujero-negro`, `hero-backdrop` M87) | 3 | 5 |
| El Viaje | 1 (`viaje-pilares-de-creacion`) | 3 | 4 |

Cumple SC-003 (≥ 24 total; 3–4 nuevas por categoría).
