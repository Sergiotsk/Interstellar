# Modelo de datos — Contenido del eje Personajes

**Fase**: 1 (Diseño)
**Feature**: `003-personajes-content`
**Fecha**: 2026-08-29

**Propósito**: en un sitio estático, el "dato" es la estructura del contenido y su atribución. Este modelo describe las entidades que se materializan como HTML en `personajes.html` y como filas en el registro de créditos, con sus reglas de validación mapeadas a los FR de la spec.

> **Actualizado (2026-08-30) — rama `feat/creditos-page`.** El array `ASSET_CREDITS` y su
> render se movieron de `js/layout.js` (pie) a `js/creditos.js` (página `creditos.html`).
> Donde este modelo dice `buildFooter()` / "el pie" / `tests/layout.test.js` para los
> créditos por asset, léase `buildCreditosContent()` / "la página de créditos" /
> `tests/creditos.test.js`. Las 6 entradas de los retratos, su formato y su sincronía
> 1:1 con `assets/img/CREDITOS.md` no cambian.

## 1. Ficha de personaje

**Descripción**: una de las seis entradas del eje Personajes. Se materializa como un `<section id="…">` dentro del `<main>` de `personajes.html`.

| Campo | Tipo | Descripción | Validación |
|---|---|---|---|
| `anchorId` | string kebab-case | `id` de la sección y ancla de navegación | Uno de: `cooper`, `murph`, `brand`, `profesor-brand`, `mann`, `tars-case`. NO cambia respecto de la feature 001 (FR-001, FR-015). |
| `nombre` | string | Título visible de la ficha (`<h2>`) | Uno de: "Cooper", "Murph", "Dr. Brand", "Profesor Brand", "Mann", "TARS & CASE". Coincide con el `label` del `NavChild` en `js/nav-data.js`. |
| `quienEs` | bloque | «Quién es»: `<h3>` + 1–2 párrafos que presentan al personaje | Obligatorio en las 6 fichas (FR-002). Sin afirmaciones científicas etiquetadas (FR-009). |
| `papelEnLaHistoria` | bloque | «Su papel en la historia»: `<h3>` + 1–2 párrafos sobre su rol en la trama | Obligatorio en las 6 fichas (FR-002). Spoilers al mínimo, en particular Mann y Profesor Brand (FR-016). |
| `rasgosDistintivos` | bloque + lista | «Rasgos distintivos»: `<h3>` + `<ul>` de 3–6 `<li>` | Obligatorio en las 6 fichas (FR-002). Debe cubrir los elementos característicos de FR-003 para ese personaje. |
| `reparto` | línea de texto | Crédito con **todos** los intérpretes relevantes, con etapa/rol entre paréntesis | Un `<p class="ficha-reparto">` propio de la ficha, **fuera** del `<figcaption>` (FR-002, aclaración 2026-08-29). Formato consistente en las 6 fichas (SC-009). |
| `retrato` | AssetRef | Retrato **informativo** en línea (`<figure>` + `<img>` + `<figcaption>`) | JPEG local en `assets/img/`, ruta relativa, `alt` **descriptivo** del personaje, sin oscurecimiento (FR-006, FR-007, FR-011). Distinto de los otros 5 (FR-006). |

**Reglas**:

- Exactamente 6 fichas, en este orden: Cooper → Murph → Dr. Brand → Profesor Brand → Mann → TARS & CASE (mismo orden que `js/nav-data.js` y la feature 001).
- Ninguna ficha conserva el texto placeholder "Sección futura dedicada a…" (SC-001).
- La sección de introducción de la página (el `<section>` con `<h1>Personajes</h1>` sin `id`) se mantiene o se ajusta levemente, pero NO recibe la plantilla de tres bloques (esa es solo para las 6 fichas).
- Jerarquía de encabezados: un único `<h1>` (título de página) → un `<h2>` por ficha → un `<h3>` por bloque (FR-011). No se salta ningún nivel.
- Fichas `#brand` y `#profesor-brand`: cada una menciona explícitamente el parentesco (padre / hija) y el rol de la otra (FR-004, SC-007).
- Ficha `#tars-case`: una sola `<section>` que cubre a **ambos** robots (FR-005).

### Contenido de referencia por ficha (cobertura mínima — FR-003)

| Ficha | «Rasgos distintivos» / cuerpo debe incluir al menos | Reparto (SC-009) |
|---|---|---|
| Cooper | ex piloto/ingeniero de la NASA reconvertido en agricultor; viudo, padre de Tom y Murph; pilota el Endurance por el agujero de gusano; la promesa de volver con Murph; termina en el Tesseract | Matthew McConaughey |
| Murph | el "fantasma" de su cuarto de niña; física de la NASA junto al Profesor Brand de adulta; resuelve la ecuación de la gravedad con los datos de Cooper; el resentimiento por el abandono | Jessica Chastain (adulta), Mackenzie Foy (niña), Ellen Burstyn (anciana) |
| Dr. Brand | Amelia Brand, astrónoma/bióloga del Endurance, **hija** del Profesor Brand; defiende ir al planeta de Edmunds; sobrevive y establece el Plan B allí | Anne Hathaway |
| Profesor Brand | John Brand, líder de la NASA clandestina, **padre** de Amelia, mentor; el "Plan A"; la confesión de que el Plan B era el plan real | Michael Caine |
| Mann | "el mejor de nosotros", científico célebre de las misiones Lázaro; falsificó los datos de su planeta helado; intenta matar a Cooper y muere en un acoplamiento fallido | Matt Damon |
| TARS & CASE | robots tácticos ex-Marines, diseño monolítico articulado, humor y sinceridad ajustables; TARS con Cooper, CASE con Brand; TARS se lanza a Gargantúa por los datos cuánticos | Bill Irwin (voz y manipulación de TARS), Josh Stewart (voz de CASE) |

## 2. AssetRef (retrato de personaje)

**Descripción**: referencia al archivo de imagen del retrato en línea de una ficha.

| Campo | Tipo | Descripción | Validación |
|---|---|---|---|
| `archivo` | string kebab-case | Nombre del archivo en `assets/img/` | Formato `personajes-<anchorId>.jpg`. Minúsculas, sin acentos. Los 6 son nuevos. |
| `ruta` | string (relativa) | `src` del `<img>` desde `personajes.html` | `assets/img/personajes-<anchorId>.jpg`. Ruta relativa, resuelve correctamente (FR-013, SC-005). |
| `alt` | string | Texto alternativo **descriptivo** | Describe al personaje que muestra la imagen (imagen informativa, Principio II, FR-011). NO vacío. |
| `figcaption` | string | Descripción visible bajo el retrato | Describe la imagen: quién aparece y, si aporta, de qué escena. NO incluye la línea de reparto ni la atribución `© Warner Bros.` (aclaración 2026-08-29). |
| `pesoKB` | número | Tamaño del archivo servido | ≤ 250 KB por archivo; suma de los 6 ≤ 1,5 MB (FR-007, SC-008). |
| `credito` | AssetCredit | Entrada de atribución asociada | Obligatoria para el 100 % de los retratos (FR-006, FR-007, SC-008). Ver §3. |

**Reglas**:

- Los 6 `archivo` son distintos entre sí (FR-006).
- Ningún `src` apunta a una URL remota; todo es local con ruta relativa (FR-007).
- Todo archivo referenciado desde `personajes.html` DEBE existir en `assets/img/` en el momento de dar la feature por terminada (FR-013: sin errores de consola, sin 404).
- La atribución `© Warner Bros. Pictures` NO va en el `<figcaption>`: se expone en el pie común vía `ASSET_CREDITS` (§3).

## 3. AssetCredit (entrada de atribución)

**Descripción**: registro de procedencia de un retrato. Vive **duplicado y sincronizado** en dos lugares (convención de las features 001 y 002).

| Campo | Tipo | Descripción | Validación |
|---|---|---|---|
| `id` | string | Identificador corto del asset | `personajes-<anchorId>` (ej. `personajes-profesor-brand`). |
| `archivo` | string | Nombre del archivo | Coincide con `AssetRef.archivo`. |
| `fuenteCatalogo` | string | Fuente del catálogo | `FILMGRAB (film-grab.com)` — archivo de fotogramas, la misma de los backdrops de la feature 002. |
| `urlOrigen` | string (URL) | Enlace real a la página de origen | URL verificable; no inventada. |
| `licencia` | string | Licencia o condiciones de uso | "Material de la película, uso académico con atribución". |
| `atribucion` | string | Texto de crédito visible en el pie | `© Warner Bros. Pictures / Paramount Pictures`. |
| `estado` | enum | `descargado` \| `pendiente` | `descargado` = archivo presente en `assets/img/`; `pendiente` = registrado sin archivo aún. No se marca `descargado` sin el archivo real (convención de honestidad, feature 001). |

**Materialización**:

1. **`js/layout.js` → `ASSET_CREDITS`** (array de strings): una línea por retrato, formato `'<archivo> — © Warner Bros. Pictures / Paramount Pictures, uso académico con atribución (FILMGRAB)'` (mismo formato que las cuatro líneas de Mundos de la feature 002). Se agregan 6: `personajes-cooper.jpg`, `personajes-murph.jpg`, `personajes-brand.jpg`, `personajes-profesor-brand.jpg`, `personajes-mann.jpg`, `personajes-tars-case.jpg`.
2. **`assets/img/CREDITOS.md`** → tabla de assets: una fila por retrato, con todas las columnas (`id`, archivo, fuente, URL origen, licencia/condiciones, atribución requerida, estado). Actualizar el bloque "Resumen de estado".

**Reglas**:

- Toda entrada en `ASSET_CREDITS` tiene su fila equivalente en `CREDITOS.md` y viceversa (sincronía, convención feature 001).
- El pie común renderiza `ASSET_CREDITS` como `<li>` dentro de su `<ul>` de fuentes (mecanismo `buildFooter()` existente, sin cambios estructurales — FR-008).
- El 100 % de los retratos tiene una `AssetCredit` con `atribucion` no vacía (FR-006, FR-007, SC-008).
- Una línea de `ASSET_CREDITS` se agrega **cuando** el archivo entra a `assets/img/` (el pie no debe listar un archivo inexistente que produzca 404).

## 4. Impacto sobre artefactos existentes

| Artefacto | Cambio | Regla / test |
|---|---|---|
| `personajes.html` | Reescritura del `<main>`: 6 `<section id>` con plantilla de 3 bloques + `<p class="ficha-reparto">` + `<figure class="ficha-retrato">` con `<img>` informativo y `<figcaption>` | Validación por criterios de aceptación (`quickstart.md` E1–E6) |
| `css/global.css` | +1 sección "ficha de personaje con retrato" (grid retrato+texto en desktop, apilado en mobile; sin tokens nuevos; NO usa `.eje-con-backdrop`) | Sin regla automatizada; revisión visual (SC-003) |
| `js/layout.js` | `ASSET_CREDITS`: +6 strings | `tests/layout.test.js`: nueva aserción "el pie lista los créditos de los retratos de Personajes" (Red→Green) |
| `tests/layout.test.js` | +1 test case (aserción de créditos de Personajes) | Debe fallar antes de tocar `ASSET_CREDITS` (Principio V) |
| `assets/img/CREDITOS.md` | +6 filas en la tabla; actualizar "Resumen de estado" | Sincronía con `ASSET_CREDITS` |
| `assets/img/personajes-*.jpg` | +6 archivos JPEG nuevos | ≤250 KB c/u, ≤1,5 MB total (FR-007, SC-008); stills con atribución `© Warner Bros.` (SC-008) |
| `js/nav-data.js` | **Sin cambios** | Las 6 anclas ya están definidas en la feature 001 |
| `assets/img/personajes-astronauta.jpg` | **Sin cambios** (fuera de alcance) | Asset genérico de la feature 001; no lo referencia el contenido nuevo. Su eventual retiro es limpieza posterior. |
