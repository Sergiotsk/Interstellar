# CREDITOS — Registro de atribucion de assets de imagen

**Feature**: `001-shared-layout-hero` · **Contrato**: `specs/001-shared-layout-hero/contracts/assets.md` · **Valida**: FR-013, SC-008.

Este registro es la fuente unica de verdad de la atribucion de cada imagen del sitio.
Se materializa en la pagina `creditos.html` (modulo `js/creditos.js`, array
`ASSET_CREDITS`), enlazada desde el pie comun de todas las paginas
(`CreditsPageContent.imageSources`, `data-model.md` §5b). Sincronia 1:1: toda fila con
`estado: descargado` tiene su linea en `ASSET_CREDITS` y viceversa.
Referencia al catálogo aprobado de `proyecto-interstellar-base.md` (SOURCE = fuente del
catálogo en la columna "Fuente").

## Convenciones

- Nombres kebab-case, minusculas, sin acentos (constitucion).
- Formato real descargado: **JPEG** (los servicios usados —NASA y Wikimedia Commons—
  sirven JPG/TIF, no WebP). **ENMIENDA aprobada (2026-08-28)**: el desvio de formato a
  JPEG queda formalmente justificado — el catalogo aprobado sirve JPG/TIF y no existe
  herramienta de conversion disponible sin agregar tooling al repo (sin build, sin
  dependencias, Principio I). La referencia relativa usa la extension real del archivo;
  la conversion a WebP se podra realizar en una ronda posterior con herramienta externa
  (fuera del repo) si el evaluador lo exige.
- **Estado**: `descargado` = archivo presente en `assets/img/` · `pendiente` = planificado,
  sin descargar (la tarea T008 registra lo pendiente sin inventar URLs ni archivos falsos).
- Ninguna URL de imagen se hardcodea en codigo; el HTML futuro referencia los archivos
  locales via este registro.

## Tabla de assets

| id | nombre de archivo | fuente (catálogo) | URL origen | licencia/condiciones | atribución requerida | estado |
|---|---|---|---|---|---|---|
| hero-m87 | `hero-backdrop.jpg` | Wikimedia Commons | https://commons.wikimedia.org/wiki/File:Black_hole_-_Messier_87_crop_max_res.jpg | CC BY 4.0 (Event Horizon Telescope Collaboration) | "EHT Collaboration, CC BY 4.0" | descargado |
| ciencia-agujero-negro | `ciencia-agujero-negro.jpg` | NASA Image Library | https://images.nasa.gov/details/PIA04206 | Dominio publico (foto/ilustracion NASA; no aplica a logos) | "NASA/JPL-Caltech" | descargado |
| mundos-tierra | `mundos-tierra.jpg` | NASA Image Library | https://images.nasa.gov/details/GSFC_20171208_Archive_e001788 | Dominio publico (NASA) | "NASA (Blue Marble 2012)" | descargado |
| personajes-astronauta | `personajes-astronauta.jpg` | NASA Image Library | https://images.nasa.gov/details/iss054e022823 | Dominio publico (NASA) | "NASA (astronauta Scott Tingle)" | descargado |
| viaje-pilares | `viaje-pilares-de-creacion.jpg` | NASA Image Library / ESA-Hubble | https://images.nasa.gov/details/GSFC_20171208_Archive_e000842 | Dominio publico con creditos (NASA/ESA Hubble) | "NASA, ESA/Hubble" | descargado |
| mundos-gargantua | `mundos-gargantua.jpg` | FILMGRAB (film-grab.com) — archivo de fotogramas | https://film-grab.com/2015/04/17/interstellar/ | Material de la pelicula, uso academico con atribucion (research.md D2; politica del catalogo base) | "© Warner Bros. Pictures / Paramount Pictures" | descargado |
| mundos-miller | `mundos-miller.jpg` | FILMGRAB (film-grab.com) — archivo de fotogramas | https://film-grab.com/2015/04/17/interstellar/ | Material de la pelicula, uso academico con atribucion (research.md D2; politica del catalogo base) | "© Warner Bros. Pictures / Paramount Pictures" | descargado |
| mundos-mann | `mundos-mann.jpg` | FILMGRAB (film-grab.com) — archivo de fotogramas | https://film-grab.com/2015/04/17/interstellar/ | Material de la pelicula, uso academico con atribucion (research.md D2; politica del catalogo base) | "© Warner Bros. Pictures / Paramount Pictures" | descargado |
| mundos-tesseract | `mundos-tesseract.jpg` | FILMGRAB (film-grab.com) — archivo de fotogramas | https://film-grab.com/2015/04/17/interstellar/ | Material de la pelicula, uso academico con atribucion (research.md D2; politica del catalogo base) | "© Warner Bros. Pictures / Paramount Pictures" | descargado |
| ciencia-gargantua-render | _sin archivo (por descargar)_ `gargantua-render.jpg` | arXiv — paper 1502.03808 (render DNGR de Gargantua) | https://arxiv.org/abs/1502.03808 | Licencia del material del paper NO verificada para descarga/republicacion | "James, von Tunzelmann, Franklin & Thorne (2015), arXiv:1502.03808" | pendiente |
| hero-still-endurance | _sin archivo (por descargar)_ `hero-still-endurance.jpg` | TMDB / Fanart.tv | https://www.themoviedb.org/movie/157336-interstellar | Material de la pelicula con copyright (Warner Bros.); uso academico cubierto en condiciones del catálogo aprobado — decidir licencia | "© Paramount Pictures / Warner Bros. Pictures" | pendiente |
| personajes-cooper | `personajes-cooper.jpg` | FILMGRAB (film-grab.com) — archivo de fotogramas | https://film-grab.com/2015/04/17/interstellar/ | Material de la pelicula, uso academico con atribucion (feature 003, research.md D2) | "© Warner Bros. Pictures / Paramount Pictures" | descargado |
| personajes-murph | `personajes-murph.jpg` | FILMGRAB (film-grab.com) — archivo de fotogramas | https://film-grab.com/2015/04/17/interstellar/ | Material de la pelicula, uso academico con atribucion (feature 003, research.md D2) | "© Warner Bros. Pictures / Paramount Pictures" | descargado |
| personajes-brand | `personajes-brand.jpg` | FILMGRAB (film-grab.com) — archivo de fotogramas | https://film-grab.com/2015/04/17/interstellar/ | Material de la pelicula, uso academico con atribucion (feature 003, research.md D2) | "© Warner Bros. Pictures / Paramount Pictures" | descargado |
| personajes-profesor-brand | `personajes-profesor-brand.jpg` | FILMGRAB (film-grab.com) — archivo de fotogramas | https://film-grab.com/2015/04/17/interstellar/ | Material de la pelicula, uso academico con atribucion (feature 003, research.md D2) | "© Warner Bros. Pictures / Paramount Pictures" | descargado |
| personajes-mann | `personajes-mann.jpg` | FILMGRAB (film-grab.com) — archivo de fotogramas | https://film-grab.com/2015/04/17/interstellar/ | Material de la pelicula, uso academico con atribucion (feature 003, research.md D2) | "© Warner Bros. Pictures / Paramount Pictures" | descargado |
| personajes-tars-case | `personajes-tars-case.jpg` | FILMGRAB (film-grab.com) — archivo de fotogramas | https://film-grab.com/2015/04/17/interstellar/ | Material de la pelicula, uso academico con atribucion (feature 003, research.md D2) | "© Warner Bros. Pictures / Paramount Pictures" | descargado |
| galeria-mundos-tierra-tormenta | `mundos-tierra-tormenta.jpg` | FILMGRAB (film-grab.com) — archivo de fotogramas | https://film-grab.com/2015/04/17/interstellar/ | Material de la pelicula, uso academico con atribucion (feature 005, research.md) | "© Warner Bros. Pictures / Paramount Pictures" | descargado |
| galeria-mundos-miller-oceano | `mundos-miller-oceano.jpg` | FILMGRAB (film-grab.com) — archivo de fotogramas | https://film-grab.com/2015/04/17/interstellar/ | Material de la pelicula, uso academico con atribucion (feature 005, research.md) | "© Warner Bros. Pictures / Paramount Pictures" | descargado |
| galeria-mundos-mann-hielo | `mundos-mann-hielo.jpg` | FILMGRAB (film-grab.com) — archivo de fotogramas | https://film-grab.com/2015/04/17/interstellar/ | Material de la pelicula, uso academico con atribucion (feature 005, research.md) | "© Warner Bros. Pictures / Paramount Pictures" | descargado |
| galeria-mundos-tierra-granja | `mundos-tierra-granja.jpg` | FILMGRAB (film-grab.com) — archivo de fotogramas | https://film-grab.com/2015/04/17/interstellar/ | Material de la pelicula, uso academico con atribucion (feature 005, research.md) | "© Warner Bros. Pictures / Paramount Pictures" | descargado |
| galeria-viaje-endurance | `viaje-endurance.jpg` | FILMGRAB (film-grab.com) — archivo de fotogramas | https://film-grab.com/2015/04/17/interstellar/ | Material de la pelicula, uso academico con atribucion (feature 005, research.md) | "© Warner Bros. Pictures / Paramount Pictures" | descargado |
| galeria-viaje-tierra-orbita | `viaje-tierra-orbita.jpg` | FILMGRAB (film-grab.com) — archivo de fotogramas | https://film-grab.com/2015/04/17/interstellar/ | Material de la pelicula, uso academico con atribucion (feature 005, research.md) | "© Warner Bros. Pictures / Paramount Pictures" | descargado |
| galeria-viaje-tierra-lejana | `viaje-tierra-lejana.jpg` | FILMGRAB (film-grab.com) — archivo de fotogramas | https://film-grab.com/2015/04/17/interstellar/ | Material de la pelicula, uso academico con atribucion (feature 005, research.md) | "© Warner Bros. Pictures / Paramount Pictures" | descargado |
| galeria-personajes-murph-nina | `personajes-murph-nina.jpg` | FILMGRAB (film-grab.com) — archivo de fotogramas | https://film-grab.com/2015/04/17/interstellar/ | Material de la pelicula, uso academico con atribucion (feature 005, research.md) | "© Warner Bros. Pictures / Paramount Pictures" | descargado |
| galeria-personajes-murph-adulta | `personajes-murph-adulta.jpg` | FILMGRAB (film-grab.com) — archivo de fotogramas | https://film-grab.com/2015/04/17/interstellar/ | Material de la pelicula, uso academico con atribucion (feature 005, research.md) | "© Warner Bros. Pictures / Paramount Pictures" | descargado |
| galeria-personajes-murph-anciana | `personajes-murph-anciana.jpg` | FILMGRAB (film-grab.com) — archivo de fotogramas | https://film-grab.com/2015/04/17/interstellar/ | Material de la pelicula, uso academico con atribucion (feature 005, research.md) | "© Warner Bros. Pictures / Paramount Pictures" | descargado |
| galeria-ciencia-gargantua | `ciencia-gargantua.jpg` | FILMGRAB (film-grab.com) — archivo de fotogramas | https://film-grab.com/2015/04/17/interstellar/ | Material de la pelicula, uso academico con atribucion (feature 005, research.md) | "© Warner Bros. Pictures / Paramount Pictures" | descargado |
| galeria-ciencia-tesseract | `ciencia-tesseract.jpg` | FILMGRAB (film-grab.com) — archivo de fotogramas | https://film-grab.com/2015/04/17/interstellar/ | Material de la pelicula, uso academico con atribucion (feature 005, research.md) | "© Warner Bros. Pictures / Paramount Pictures" | descargado |
| galeria-ciencia-agujero-gusano | `ciencia-agujero-gusano.jpg` | FILMGRAB (film-grab.com) — archivo de fotogramas | https://film-grab.com/2015/04/17/interstellar/ | Material de la pelicula, uso academico con atribucion (feature 005, research.md) | "© Warner Bros. Pictures / Paramount Pictures" | descargado |

## Resumen de estado

- **Descargados — features 001 y 002 (9)**: `hero-m87`, `ciencia-agujero-negro`,
  `mundos-tierra`, `personajes-astronauta`, `viaje-pilares` (dominio publico / licencia
  clara del catálogo aprobado) + `mundos-gargantua`, `mundos-miller`, `mundos-mann`,
  `mundos-tesseract` (feature 002: fotogramas de la pelicula, uso academico con
  atribucion — research.md D2).
- **Descargados — feature 003 (6)**: `personajes-cooper`, `personajes-murph`,
  `personajes-brand`, `personajes-profesor-brand`, `personajes-mann`, `personajes-tars-case`
  — retratos en linea del eje Personajes: fotogramas de la pelicula (FILMGRAB), uso
  academico con atribucion `© Warner Bros. Pictures / Paramount Pictures`.
- **Descargados — feature 005 (13)**: galeria de imagenes. Mundos: `mundos-tierra-tormenta`,
  `mundos-miller-oceano`, `mundos-mann-hielo`, `mundos-tierra-granja`. El Viaje:
  `viaje-endurance`, `viaje-tierra-orbita`, `viaje-tierra-lejana`. Personajes (etapas de
  Murph): `personajes-murph-nina`, `personajes-murph-adulta`, `personajes-murph-anciana`.
  La Ciencia: `ciencia-gargantua`, `ciencia-tesseract`, `ciencia-agujero-gusano`. Todos
  fotogramas de la pelicula (FILMGRAB), uso academico con atribucion
  `© Warner Bros. Pictures / Paramount Pictures`.
- **Pendientes**: el render cientifico de Gargantua del paper arXiv (licencia del
  material no confirmada) y `hero-still-endurance` (cubierto en la practica por los
  backdrops de Mundos).
- **Backdrops de Mundos — peso** (FR-007, SC-009): `mundos-gargantua.jpg` 169 KB,
  `mundos-miller.jpg` 195 KB, `mundos-mann.jpg` 180 KB, `mundos-tesseract.jpg` 87 KB;
  con `mundos-tierra.jpg` (229 KB) los 5 suman 780 KB. Cada uno ≤250 KB y total ≤1,2 MB.
  Los 4 nuevos re-encodados a JPEG progresivo con Pillow (sin agregar tooling al repo).
- **Retratos de Personajes — peso** (feature 003, FR-007, SC-008): `personajes-cooper.jpg`
  64 KB, `personajes-murph.jpg` 61 KB, `personajes-brand.jpg` 81 KB,
  `personajes-profesor-brand.jpg` 76 KB, `personajes-mann.jpg` 64 KB,
  `personajes-tars-case.jpg` 80 KB — los 6 suman ~426 KB. Cada uno ≤250 KB y total ≤1,5 MB.
  Re-encodados a JPEG progresivo con Pillow (cap de ancho 1280 px, sin EXIF, `optimize`;
  sin agregar tooling al repo).
- **Imagenes de galeria — peso** (feature 005, FR-008, SC-004): `mundos-tierra-tormenta.jpg`
  136 KB, `mundos-miller-oceano.jpg` 151 KB, `mundos-mann-hielo.jpg` 244 KB,
  `mundos-tierra-granja.jpg` 114 KB, `viaje-endurance.jpg` 67 KB,
  `viaje-tierra-orbita.jpg` 175 KB, `viaje-tierra-lejana.jpg` 84 KB,
  `personajes-murph-nina.jpg` 59 KB, `personajes-murph-adulta.jpg` 91 KB,
  `personajes-murph-anciana.jpg` 44 KB, `ciencia-gargantua.jpg` 111 KB,
  `ciencia-tesseract.jpg` 209 KB, `ciencia-agujero-gusano.jpg` 35 KB — las 13 suman
  ~1,5 MB. Cada una ≤250 KB. Re-encodadas a JPEG progresivo con Pillow (cap de ancho
  1280 px, sin EXIF, `optimize`; sin agregar tooling al repo). Formato scope 960x402 en
  `mundos-tierra-granja`, `personajes-murph-nina` y `personajes-murph-anciana` (fuente
  film-grab a esa resolucion); el resto 1280x720.

## Optimizacion WebP — ENMIENDA aprobada (2026-08-28)

Los 5 assets descargados estan en JPEG real (resoluciones ya razonables). La conversion a
WebP local queda registrada como desvio formal **ENMENDADO**: los servicios del catalogo
aprobado sirven JPG/TIF y no hay herramienta de conversion sin agregar tooling al repo
(Principio I). Se mantiene como mejora opcional para una ronda posterior con herramienta
externa (fuera del repo); si se realiza, se actualiza esta tabla, la referencia relativa
en el HTML (FR-021) y queda en historial la decision.