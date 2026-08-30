# Modelo de datos — Contenido del eje Mundos

**Fase**: 1 (Diseño)
**Feature**: `002-mundos-content`
**Fecha**: 2026-08-29

**Propósito**: en un sitio estático, el "dato" es la estructura del contenido y su atribución. Este modelo describe las entidades que se materializan como HTML en `mundos.html` y como filas en el registro de créditos, con sus reglas de validación mapeadas a los FR de la spec.

> **Actualizado (2026-08-30) — rama `feat/creditos-page`.** El array `ASSET_CREDITS` y su
> render se movieron de `js/layout.js` (pie) a `js/creditos.js` (página `creditos.html`,
> enlazada desde el pie). Donde este modelo dice `buildFooter()` / "el pie" /
> `tests/layout.test.js` para los créditos por asset, léase `buildCreditosContent()` /
> "la página de créditos" / `tests/creditos.test.js`. Las 4 entradas de los backdrops de
> Mundos, su formato y su sincronía 1:1 con `assets/img/CREDITOS.md` no cambian.

## 1. Mundo

**Descripción**: una de las cinco escenas-destino del eje Mundos. Se materializa como un `<section id="…">` dentro del `<main>` de `mundos.html`.

| Campo | Tipo | Descripción | Validación |
|---|---|---|---|
| `anchorId` | string kebab-case | `id` de la sección y ancla de navegación | Uno de: `tierra`, `gargantua`, `miller`, `mann`, `tesseract`. NO cambia respecto de la feature 001 (FR-001, FR-015). |
| `nombre` | string | Título visible del mundo (`<h2>`) | Uno de: "La Tierra", "Gargantúa", "Planeta de Miller", "Planeta de Mann", "El Tesseract". Coincide con el `label` del `NavChild` en `js/nav-data.js`. |
| `queEs` | bloque | «Qué es»: `<h3>` + 1–2 párrafos que describen el lugar | Obligatorio en las 5 secciones (FR-002). Sin afirmaciones científicas etiquetadas (FR-009). |
| `enLaHistoria` | bloque | «En la historia»: `<h3>` + 1–2 párrafos sobre su rol en la trama | Obligatorio en las 5 secciones (FR-002). Spoilers al mínimo (Assumptions). |
| `rasgosDistintivos` | bloque + lista | «Rasgos distintivos»: `<h3>` + `<ul>` de 3–6 `<li>` | Obligatorio en las 5 secciones (FR-002). Debe cubrir los elementos característicos de FR-003 para ese mundo. |
| `backdrop` | AssetRef | Imagen de fondo decorativa de la sección | JPEG local en `assets/img/`, ruta relativa, `alt=""`, oscurecida con `--backdrop-oscurecer` (FR-004, FR-005, FR-007). Distinta de los otros 4 (SC-002). |

**Reglas**:

- Exactamente 5 secciones de mundo, en este orden: Tierra → Gargantúa → Miller → Mann → Tesseract (mismo orden que `js/nav-data.js` y la feature 001).
- Ninguna sección conserva el texto placeholder "Sección futura dedicada a…" (SC-001).
- La sección de introducción de la página (el `<section>` con `<h1>Mundos</h1>` sin `id`) se mantiene o se ajusta levemente, pero NO recibe la plantilla de tres bloques (esa es solo para las 5 secciones-mundo).
- Jerarquía de encabezados: un único `<h1>` (título de página) → un `<h2>` por mundo → un `<h3>` por bloque (FR-011). No se salta ningún nivel.

### Contenido de referencia por mundo (cobertura mínima — FR-003)

| Mundo | «Rasgos distintivos» debe incluir al menos |
|---|---|
| La Tierra | plaga de cultivos (*blight*), tormentas de polvo, colapso de la agricultura |
| Planeta de Miller | océano que cubre el planeta, olas del tamaño de montañas, proximidad extrema a Gargantúa |
| Planeta de Mann | superficie de hielo, nubes congeladas, aparente habitabilidad |
| Gargantúa | agujero negro supermasivo, disco de acreción, horizonte de eventos, distorsión por lente gravitacional |
| El Tesseract | el tiempo como espacio recorrible, ubicado tras la estantería de la habitación de Murph |

## 2. AssetRef (backdrop de mundo)

**Descripción**: referencia al archivo de imagen de fondo de una sección de mundo.

| Campo | Tipo | Descripción | Validación |
|---|---|---|---|
| `archivo` | string kebab-case | Nombre del archivo en `assets/img/` | Formato `mundos-<anchorId>.jpg`. Minúsculas, sin acentos. `mundos-tierra.jpg` ya existe (se reutiliza). |
| `ruta` | string (relativa) | `src` del `<img>` desde `mundos.html` | `assets/img/mundos-<anchorId>.jpg`. Ruta relativa, resuelve correctamente (FR-013, SC-005). |
| `alt` | string | Texto alternativo | Cadena vacía `""` (imagen decorativa, Principio II, FR-011). |
| `pesoKB` | número | Tamaño del archivo servido | ≤ 250 KB por archivo; suma de los 5 ≤ 1,2 MB (FR-007, SC-009). |
| `credito` | AssetCredit | Entrada de atribución asociada | Obligatoria para el 100 % de los backdrops (FR-006, SC-008). Ver §3. |

**Reglas**:

- Los 5 `archivo` son distintos entre sí (SC-002).
- Ningún `src` apunta a una URL remota; todo es local con ruta relativa (FR-007).
- Todo archivo referenciado desde `mundos.html` DEBE existir en `assets/img/` en el momento de dar la feature por terminada (FR-013: sin errores de consola, sin 404).

## 3. AssetCredit (entrada de atribución)

**Descripción**: registro de procedencia de un backdrop. Vive **duplicado y sincronizado** en dos lugares (convención de la feature 001).

| Campo | Tipo | Descripción | Validación |
|---|---|---|---|
| `id` | string | Identificador corto del asset | `mundos-<anchorId>` (ej. `mundos-gargantua`). |
| `archivo` | string | Nombre del archivo | Coincide con `AssetRef.archivo`. |
| `fuenteCatalogo` | enum | Fuente del catálogo aprobado | Una de las listadas en `/proyecto-interstellar-base.md` y `specs/001-shared-layout-hero/contracts/assets.md` (NASA Image Library, ESA/Hubble, Unsplash, Rawpixel NASA, Wikimedia Commons, Alpha Coders, WallpaperFlare, Wallpaper Cave, Wallpapers.com, WallpaperCat, TMDB, Fanart.tv). |
| `urlOrigen` | string (URL) | Enlace real a la página de origen | URL verificable; no inventada. |
| `licencia` | string | Licencia o condiciones de uso | Texto claro (ej. "Dominio público (NASA)", "CC BY 4.0", "Material de la película, uso académico con atribución"). |
| `atribucion` | string | Texto de crédito visible en el pie | Ej. "NASA/JPL-Caltech", "NASA, ESA/Hubble", "© Warner Bros. Pictures". |
| `estado` | enum | `descargado` \| `pendiente` | `descargado` = archivo presente en `assets/img/`; `pendiente` = registrado sin archivo aún. No se marca `descargado` sin el archivo real (convención de honestidad, feature 001). |

**Materialización**:

1. **`js/layout.js` → `ASSET_CREDITS`** (array de strings): una línea por backdrop, formato `"<archivo> — <atribucion> (<fuenteCatalogo>)"`. Ya presente: `mundos-tierra.jpg — NASA (Blue Marble 2012)`. Se agregan 4: `mundos-gargantua.jpg`, `mundos-miller.jpg`, `mundos-mann.jpg`, `mundos-tesseract.jpg`.
2. **`assets/img/CREDITOS.md`** → tabla de assets: una fila por backdrop, con todas las columnas (`id`, archivo, fuente, URL origen, licencia/condiciones, atribución requerida, estado).

**Reglas**:

- Toda entrada en `ASSET_CREDITS` tiene su fila equivalente en `CREDITOS.md` y viceversa (sincronía, convención feature 001).
- El pie común renderiza `ASSET_CREDITS` como `<li>` dentro de su `<ul>` de fuentes (mecanismo `buildFooter()` existente, sin cambios estructurales).
- El 100 % de los backdrops de Mundos tiene una `AssetCredit` con `atribucion` no vacía (FR-006, SC-008).

## 4. Impacto sobre artefactos existentes

| Artefacto | Cambio | Regla / test |
|---|---|---|
| `mundos.html` | Reescritura del `<main>`: 5 `<section id>` con plantilla de 3 bloques + `<img>` de backdrop | Validación por criterios de aceptación (`quickstart.md` E1–E5) |
| `css/global.css` | +1 bloque reutilizable "sección de eje con backdrop" (sin tokens nuevos) | Sin regla automatizada; revisión visual (SC-003, SC-007) |
| `js/layout.js` | `ASSET_CREDITS`: +4 strings | `tests/layout.test.js`: nueva aserción "el pie contiene los créditos de los backdrops de Mundos" (Red→Green) |
| `tests/layout.test.js` | +1 test case (aserción de créditos de Mundos) | Debe fallar antes de tocar `ASSET_CREDITS` (Principio V) |
| `assets/img/CREDITOS.md` | +4 filas en la tabla; actualizar "Resumen de estado" | Sincronía con `ASSET_CREDITS` |
| `assets/img/mundos-*.jpg` | +4 archivos JPEG (Tierra ya existe) | ≤250 KB c/u, ≤1,2 MB total (FR-007, SC-009); del catálogo (SC-008) |
| `js/nav-data.js` | **Sin cambios** | Las 5 anclas ya están definidas |
