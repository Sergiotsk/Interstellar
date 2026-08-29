# Investigación y decisiones de diseño — Contenido del eje Personajes

**Fase**: 0 (Investigación)
**Feature**: `003-personajes-content`
**Fecha**: 2026-08-29

## Estado

No quedan incógnitas abiertas (sin NEEDS CLARIFICATION). Las cinco clarificaciones de `spec.md` §Clarifications (identidad visual por personaje, sub-estructura de la ficha, backdrop vs retrato, alcance del crédito de reparto, ubicación del crédito) y la inspección del código de las features 001 y 002 resuelven cada punto.

## D1 — Formato de imagen: JPEG local (enmienda de la feature 001, heredada por la 002)

- **Decisión**: los retratos de Personajes se sirven en **JPEG local** en `assets/img/`, con presupuesto de peso ≤250 KB por imagen y ≤1,5 MB los seis juntos.
- **Rationale**: `assets/img/CREDITOS.md` de la feature 001 tiene una **enmienda formal aprobada (2026-08-28)**: el catálogo aprobado entrega JPG/TIF, y convertir a WebP exigiría agregar tooling/build al repo, lo que viola el Principio I. Todos los assets del repo (incluidos los 4 backdrops de la feature 002) son `.jpg`. La feature 003 no reabre esa decisión.
- **Alternatives considered**: (a) WebP con conversión manual externa — descartado: fricción operativa por asset sin beneficio verificable frente al presupuesto de peso, que se cumple igual en JPEG; (b) mini-script de conversión en el repo — descartado: viola el Principio I.

## D2 — Fuente del retrato por personaje: still de la película, uso académico con atribución (FR-006, FR-007, SC-008)

- **Decisión**: un retrato por ficha, **still de la película**, distinto entre sí, registrado en `assets/img/CREDITOS.md` con:
  - `fuente`: FILMGRAB (film-grab.com) — archivo de fotogramas, la misma usada para los cuatro backdrops de la feature 002.
  - `licencia/condiciones`: "Material de la película, uso académico con atribución".
  - `atribución requerida`: `© Warner Bros. Pictures / Paramount Pictures`.
  - `estado`: `descargado` cuando el archivo esté físicamente en `assets/img/`; `pendiente` mientras tanto (convención de honestidad de la feature 001 — no se marca `descargado` sin el archivo, no se inventan URLs).
- **Rationale**: no existe un catálogo aprobado de **retratos** de personas con licencia clara (NASA/ESA/Unsplash no cubren caras de actores). El documento base autoriza explícitamente el uso de stills de la película para un proyecto académico *siempre acreditando la fuente*, y la feature 002 ya estableció el precedente y el registro (`research.md` D2 de la 002). Se reutiliza esa política sin cambios.
- **Selección de cada still (fase de implementación)**: un plano donde el personaje sea claramente reconocible; para TARS & CASE, un plano de los robots (juntos si es posible). La descarga y el recorte final son trabajo de implementación, no de este plan.
- **Alternatives considered**: (a) retratos de dominio público de los actores (Wikimedia) — descartado: mostrarían al actor fuera de personaje, rompen la coherencia "in-universe" y muchos tienen licencias de foto de prensa no verificadas; (b) un único collage del reparto para toda la página — descartado: rompe FR-006 (retrato propio y distinto por ficha) y SC-002 (misma plantilla, seis fichas equivalentes); (c) sin imágenes — descartado en la clarificación 1.

## D3 — Retrato en línea, NO backdrop (clarificación 2026-08-29; FR-006, FR-011, casos límite)

- **Decisión**: cada ficha lleva un `<figure class="ficha-retrato">` con un `<img>` **informativo** (`alt` descriptivo del personaje) y un `<figcaption>` que describe la imagen (quién aparece y de qué escena). El retrato se maqueta **junto o sobre** el texto de la ficha, **sin** `filter: var(--backdrop-oscurecer)`, **sin** posicionamiento absoluto detrás del contenido y **sin** la clase `.eje-con-backdrop` de la feature 002. Si la imagen no carga, el `<figure>` degrada a un fondo coherente con la paleta (`--color-superficie` / `--color-fondo`) sin romper la maqueta.
- **Rationale**: la clarificación 3 eligió explícitamente "retrato enmarcado en línea" sobre "backdrop a sección completa". En una ficha de personaje interesa la cara, no el "clima" de fondo; además, un still con el rostro sobre texto genera problemas de legibilidad que el patrón de Mundos resuelve oscureciendo —algo que aquí no queremos—. Al ser **informativa** (muestra al personaje), la imagen lleva `alt` descriptivo, a diferencia de los backdrops decorativos (`alt=""`) de la feature 002 (Principio II: `alt` según función).
- **Alternatives considered**: (a) reutilizar `.eje-con-backdrop` — descartado por la clarificación 3 y porque el oscurecimiento tapa la cara; (b) `background-image` en CSS — descartado: el degradado ante fallo de carga es menos controlable y la spec pide `<figure>`/`<img>` (FR-011); (c) `alt=""` decorativo — descartado: la imagen aporta información (aspecto del personaje), FR-011 pide alternativa textual descriptiva.

## D4 — CSS del patrón "ficha de personaje con retrato" en `css/global.css` (Restricciones — CSS)

- **Decisión**: se agrega a `css/global.css` una sección 12 con un bloque reutilizable, por ejemplo:
  - `.ficha-personaje` → contenedor de la ficha; en escritorio, `display: grid` con dos columnas (retrato en una franja de ancho acotado + texto en el resto); en mobile, una sola columna con el retrato primero. Sin anchos fijos que provoquen scroll horizontal a 320 px.
  - `.ficha-retrato` (sobre el `<figure>`) → marco del retrato: `margin: 0`, borde/―fondo con `--color-superficie`, `img { display:block; width:100%; height:auto }` (el reset ya trae `max-width:100%`).
  - `.ficha-retrato figcaption` → `--color-texto-atenuado`, tamaño reducido, la descripción de la imagen.
  - `.ficha-reparto` (sobre el `<p>` de reparto) → línea diferenciada del cuerpo: `--color-texto-atenuado`, quizá `font-style: italic`, separada del último bloque.
  - **Sin custom properties nuevas**: solo se consumen las de la feature 001 (`--color-superficie`, `--color-fondo`, `--color-texto`, `--color-texto-atenuado`, `--font-*`).
  - `scroll-margin-top` sobre `section[id]` ya existe (feature 001) y aplica sin cambios (FR-015).
- **Rationale**: los ejes La Ciencia y El Viaje pueden necesitar el mismo patrón de "contenido con imagen en línea"; `global.css` ya es dueño del estilo de `section[id]` y del patrón `.eje-con-backdrop`. Crear `css/personajes.css` para un patrón potencialmente transversal sería duplicación anticipada; la constitución reserva el CSS por página para páginas *pesadas* con estilo único.
- **Alternatives considered**: (a) `css/personajes.css` propio — descartado (patrón transversal, no página pesada); (b) estilos inline en `personajes.html` — descartado: viola "nada hardcodeado suelto"; (c) reutilizar tal cual el bloque `.eje-con-backdrop` — descartado (D3).

## D5 — Extensión del registro de créditos, test-first (FR-006, FR-007, Principio V)

- **Decisión**: los créditos de los seis retratos se agregan en **dos lugares acoplados**:
  1. `js/layout.js` → array `ASSET_CREDITS`: **+6 entradas** (`personajes-cooper.jpg` … `personajes-tars-case.jpg`), formato `'<archivo> — <atribución>, uso académico con atribución (FILMGRAB)'`, igual que las cuatro líneas de Mundos de la feature 002.
  2. `assets/img/CREDITOS.md` → **+6 filas** en la tabla de assets, con `id`, archivo, fuente del catálogo, URL de origen real, licencia/condiciones, atribución y `estado`. Actualizar el bloque **"Resumen de estado"** (contadores).
- **TDD (Principio V)**: el test actual del pie (`tests/layout.test.js`) verifica presencia de `<footer>`, "Interstellar", "Fuent", el enlace al repo y —desde la feature 002— los cuatro backdrops de Mundos; **no** afirma sobre los retratos de Personajes, así que extender el array no rompe nada. Para respetar Red→Green se **agrega un test nuevo**: el pie DEBE contener los seis archivos de retrato de Personajes. Ese test falla (Red) hasta que se extiende `ASSET_CREDITS` (Green).
- **Rationale**: el pie común es el mecanismo de atribución de la feature 001 (`FooterContent.imageSources`); extender su lista de datos es la vía prevista y no "redefine el pie" (FR-008). Mantener `ASSET_CREDITS` y `CREDITOS.md` sincronizados es convención establecida de la 001 y aplicada en la 002.
- **Convención de honestidad**: cada línea de `ASSET_CREDITS` se agrega **cuando** el archivo entra a `assets/img/` (el pie no debe listar un archivo inexistente que produzca 404). En `CREDITOS.md`, `estado: pendiente` mientras el archivo no esté.
- **Alternatives considered**: (a) un bloque de créditos propio en `personajes.html` — descartado: rompe la fuente única del pie y FR-008; (b) editar `ASSET_CREDITS` sin tocar el test — descartado: viola el Principio V.

## D6 — Contenido: narrativo, en español, sin etiquetas de rigor, spoilers al mínimo (FR-002, FR-003, FR-009, FR-016)

- **Decisión**: cada ficha se redacta con la plantilla fija — **Quién es** (1–2 párrafos), **Su papel en la historia** (1–2 párrafos), **Rasgos distintivos** (lista de 3–6 puntos) — más una **línea de reparto**. Tono divulgativo y cinematográfico, en español, describiendo la película. Spoilers al mínimo imprescindible para explicar el rol de cada personaje; especial cuidado en Mann (la traición) y en el Profesor Brand (la confesión sobre el Plan A).
- **Rationale**: la plantilla la fijó la clarificación 2; la profundidad, una asunción de la spec. FR-009 excluye el contenido científico etiquetado (✓/~/✎): eso es del eje La Ciencia. El contenido de Personajes no hace afirmaciones científicas que requieran verificación de fuentes: describe personas y su función narrativa.
- **Cobertura mínima por ficha (FR-003)**:
  - **Cooper** — ex piloto/ingeniero de la NASA reconvertido en agricultor; viudo, padre de Tom y Murph; pilota el Endurance a través del agujero de gusano; su motor es la promesa de volver con Murph; termina dentro del Tesseract y es el "fantasma" de la habitación.
  - **Murph** — de niña cree que hay un "fantasma" en su cuarto; de adulta, física de la NASA junto al Profesor Brand; resuelve la ecuación de la gravedad con los datos que Cooper le transmite desde el Tesseract; su arco lo marca el resentimiento por el abandono del padre.
  - **Dr. Brand (Amelia)** — astrónoma/bióloga de la tripulación del Endurance, hija del Profesor Brand; sostiene que el amor es un dato a considerar y aboga por ir al planeta de Edmunds; sobrevive y queda estableciendo el Plan B (colonia) en ese planeta.
  - **Profesor Brand (John)** — líder de la NASA clandestina, mentor de Cooper y Murph; impulsa el "Plan A" (ecuación de la gravedad para despegar las estaciones); confiesa en su lecho de muerte que el Plan A no era viable sin datos del interior de un agujero negro y que el Plan B siempre fue el plan real.
  - **Mann** — "el mejor de nosotros", científico célebre de las misiones Lázaro; falsificó los datos de su planeta helado para que lo rescataran; intenta matar a Cooper y muere en un acoplamiento fallido; encarna el instinto de supervivencia y la cobardía bajo aislamiento.
  - **TARS & CASE** — robots tácticos ex-Marines, de diseño monolítico articulado, con parámetros ajustables de humor y sinceridad; TARS acompaña a Cooper (sarcástico, leal) y CASE queda con Brand; TARS se lanza a Gargantúa para recoger los datos cuánticos y se lo recupera para el aterrizaje final.
- **Reparto por ficha (FR-002, SC-009 — todos los intérpretes relevantes con etapa/rol)**:
  - Cooper — Matthew McConaughey.
  - Murph — Jessica Chastain (adulta), Mackenzie Foy (niña), Ellen Burstyn (anciana).
  - Dr. Brand — Anne Hathaway.
  - Profesor Brand — Michael Caine.
  - Mann — Matt Damon.
  - TARS & CASE — Bill Irwin (voz y manipulación de TARS), Josh Stewart (voz de CASE).
- **Alternatives considered**: (a) prosa libre — descartado en la clarificación 2 (uniformidad y testeabilidad); (b) solo el intérprete principal — descartado en la clarificación 4; (c) incluir la ciencia de cada personaje aquí — descartado: FR-009 y separación de ejes.

## D7 — Distinción explícita de las dos figuras "Brand" y ficha única de TARS & CASE (FR-004, FR-005, HU2)

- **Decisión**: la ficha `#brand` abre nombrando a **Amelia Brand** y su rol (astrónoma del Endurance, **hija** del Profesor Brand); la ficha `#profesor-brand` abre nombrando a **John Brand** y su rol (líder de la NASA en la Tierra, **padre** de Amelia). Cada una menciona explícitamente el parentesco y el rol de la otra para que no puedan confundirse (SC-007). La ficha `#tars-case` es **una sola** `<section>` que presenta a los dos robots, indica con qué tripulante va cada uno y qué los distingue.
- **Rationale**: es la principal fuente de ambigüedad del eje (HU2); dos anclas con apellido compartido y un ancla que agrupa dos robots. La feature 001 ya fijó las tres anclas (`#brand`, `#profesor-brand`, `#tars-case`); esta feature solo llena su contenido de forma inequívoca.
- **Alternatives considered**: (a) fusionar a los dos Brand en una ficha — descartado: contradice las anclas de la feature 001 y el submenú; (b) fichas separadas para TARS y para CASE — descartado: el submenú de la feature 001 define un único destino `#tars-case`.

## D8 — Sin cambios en navegación, anclas ni tokens (FR-001, FR-008, FR-015)

- **Decisión**: `js/nav-data.js` no se toca (las 6 anclas de Personajes ya están: `#cooper #murph #brand #profesor-brand #mann #tars-case`). `personajes.html` no declara header ni footer propios. No se agregan custom properties a `:root`. La compensación de scroll de anclas (`scroll-margin-top` sobre `section[id]`) de la feature 001 se conserva y aplica sin cambios.
- **Rationale**: la feature es aditiva sobre una base aprobada; minimizar la superficie de cambio reduce el riesgo de regresión (HU3).
- **Alternatives considered**: (a) un acento de color por ficha como token nuevo — descartado: FR-014 admite acento "opcional" pero dentro de la paleta ya aprobada, sin un segundo color saturado; si se usa, se hace con las variables existentes.
