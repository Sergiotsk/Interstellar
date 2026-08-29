# Investigación y decisiones de diseño — Contenido del eje Mundos

**Fase**: 0 (Investigación)
**Feature**: `002-mundos-content`
**Fecha**: 2026-08-29

## Estado

No quedan incógnitas abiertas (sin NEEDS CLARIFICATION). Las cinco clarificaciones de `spec.md` §Clarifications (galería, plantilla de contenido, presupuesto de peso, naturaleza de SC-006, formato de imagen) y la inspección del código de la feature 001 resuelven cada punto.

## D1 — Formato de imagen: JPEG, no WebP (clarificación 2026-08-29 + enmienda de la feature 001)

- **Decisión**: los backdrops de Mundos se sirven en **JPEG local** en `assets/img/`, con el presupuesto de peso intacto (≤250 KB por imagen, ≤1,2 MB los cinco juntos).
- **Rationale**: `assets/img/CREDITOS.md` de la feature 001 tiene una **enmienda formal aprobada (2026-08-28)**: el catálogo aprobado (`/proyecto-interstellar-base.md`) entrega JPG/TIF, y convertir a WebP exigiría agregar tooling/build al repo, lo que viola el Principio I (sin build, sin dependencias). Los 6 assets existentes son todos `.jpg`. La FR-007 original ("WebP") venía del prompt del usuario y se corrigió en la clarificación para no contradecir una decisión ya tomada ni el Principio I.
- **Alternatives considered**: (a) WebP con conversión manual externa por imagen — descartado: fricción operativa por cada asset sin beneficio verificable frente al presupuesto de peso, que se cumple igual en JPEG; (b) WebP con mini-script en el repo — descartado: viola el Principio I y requeriría enmendar la constitución.

## D2 — Fuente de backdrop por mundo (FR-004, FR-006, SC-002, SC-008)

- **Decisión**: un backdrop por mundo, del catálogo aprobado de `/proyecto-interstellar-base.md`, distinto entre sí. Prioridad de fuente por licencia:
  1. **La Tierra** → reutiliza `assets/img/mundos-tierra.jpg` (NASA, Blue Marble; ya descargado y acreditado). No agrega asset nuevo.
  2. **Gargantúa** → `mundos-gargantua.jpg`. Preferencia: visualización de agujero negro de **licencia clara** (NASA Image Library / ESA-Hubble; ya hay una imagen de este tipo en el repo, `ciencia-agujero-negro.jpg`, que sirve de referencia de estilo). Si el disco de acreción icónico exige un still de la película (Wikimedia Commons / Alpha Coders / WallpaperFlare), se admite bajo **uso académico con atribución** — política explícita del documento base y ya aplicada en la feature 001: se registra `licencia: "Material de la película, uso académico con atribución"` y `atribución: "© Warner Bros. Pictures"` en `CREDITOS.md`, y `estado` según si el archivo está descargado. El render del paper arXiv 1502.03808 **queda descartado** para Mundos: su licencia de republicación no está verificada (`CREDITOS.md` de la feature 001 lo tiene como `pendiente` por ese motivo).
  3. **Planeta de Miller** → imagen real de mundo oceánico o de la Tierra desde el espacio con océano dominante (NASA / Unsplash), o still de la película del planeta del agua. `mundos-miller.jpg`.
  4. **Planeta de Mann** → cuerpo helado real (luna de hielo tipo Europa/Encélado, NASA/JPL) o still del planeta helado. `mundos-mann.jpg`.
  5. **El Tesseract** → still atribuido de la película (la estructura tras la estantería) o imagen geométrica/abstracta espacial de licencia libre (Unsplash). `mundos-tesseract.jpg`.
- **Rationale**: el documento base autoriza explícitamente el uso de stills de la película para un proyecto académico *siempre acreditando la fuente*; y prioriza "material de mayor calidad e impacto visual". Se prefiere material de dominio público (NASA/ESA/Unsplash) cuando transmite el "clima" del mundo, y se admite un still de cine atribuido cuando la identidad del mundo lo exige (Tesseract, disco de Gargantúa).
- **Convención de honestidad (heredada de la feature 001)**: cada asset se registra en `CREDITOS.md` con su URL de origen real y su licencia; `estado: pendiente` mientras el archivo no esté físicamente en `assets/img/`. No se inventan URLs ni archivos falsos. La descarga/selección final de cada archivo es trabajo de la fase de implementación.
- **Alternatives considered**: (a) galería multi-imagen por mundo — descartado en `spec.md` §Clarifications (alcance); (b) generar/derivar imágenes — descartado: el contenido es fijo y proviene de fuentes reales acreditadas; (c) un único backdrop compartido para toda la página — descartado: rompe FR-004 y SC-002 (backdrop propio y distinto por mundo).

## D3 — El backdrop como `<img alt="">` posicionado, con fallback de paleta (FR-005, FR-011, casos límite)

- **Decisión**: cada sección de mundo lleva un `<img>` de backdrop **decorativo** (`alt=""`), posicionado de forma absoluta detrás del contenido, con `filter: var(--backdrop-oscurecer)` — el mismo patrón que `.hero-backdrop` de la home en `css/global.css`. La sección tiene `background-color: var(--color-fondo)` como respaldo: si la imagen no carga, el texto conserva jerarquía y legibilidad sobre la paleta.
- **Rationale**: reutiliza un patrón ya probado y testeado en la feature 001; el oscurecimiento por token cumple FR-005 y SC-007; el respaldo de color cumple el caso límite "si el backdrop no carga". La FR-011 pide `<figure>`/`<img>` con alternativa textual adecuada; al ser puramente decorativo (la información está en el texto), `alt=""` es lo correcto (Principio II).
- **Alternatives considered**: (a) `background-image` en CSS — descartado: el degradado ante fallo de carga es menos controlable y la spec pide `<img>`; (b) `<img>` informativo con `alt` descriptivo — descartado: duplicaría en texto alternativo lo que ya dicen los bloques «Qué es»/«Rasgos», contra Principio II.

## D4 — CSS del patrón "sección de eje con backdrop" en `css/global.css` (Restricciones — CSS)

- **Decisión**: el CSS del backdrop por sección se agrega a `css/global.css` como un bloque reutilizable (por ejemplo una clase `.eje-con-backdrop` o extendiendo el `section[id]` existente), **sin tokens nuevos** y usando solo `--backdrop-oscurecer`, `--color-fondo` y las variables de tipografía ya definidas.
- **Rationale**: los ejes Personajes, La Ciencia y El Viaje van a necesitar el mismo patrón visual; `global.css` ya es dueño del estilo de `section[id]` y de `.hero-backdrop`. Crear `css/mundos.css` para un patrón compartido sería duplicación anticipada.
- **Alternatives considered**: (a) `css/mundos.css` propio — descartado: la constitución reserva el CSS por página para páginas *pesadas* con estilo único; este patrón es transversal; (b) estilos inline en `mundos.html` — descartado: viola "nada hardcodeado suelto" y la estrategia de CSS de la constitución.

## D5 — Extensión del registro de créditos, test-first (FR-006, Principio V)

- **Decisión**: los créditos de los backdrops de Mundos se agregan en **dos lugares acoplados**:
  1. `js/layout.js` → array `ASSET_CREDITS`: +4 entradas (`mundos-gargantua.jpg`, `mundos-miller.jpg`, `mundos-mann.jpg`, `mundos-tesseract.jpg`). La Tierra ya figura (`mundos-tierra.jpg — NASA (Blue Marble 2012)`).
  2. `assets/img/CREDITOS.md` → +4 filas en la tabla de assets, con fuente, URL de origen, licencia, atribución y `estado`.
- **TDD (Principio V)**: el test actual del pie (`tests/layout.test.js`, "el footer tiene créditos…") solo verifica presencia de `<footer>`, "Interstellar", "Fuent" y el enlace al repo — **no** afirma sobre líneas de crédito concretas, así que extender el array no lo rompe. Para respetar Red→Green se **agrega una aserción nueva**: el pie DEBE contener los créditos de los cuatro backdrops nuevos de Mundos. Esa aserción falla (Red) hasta que se extiende `ASSET_CREDITS` (Green).
- **Rationale**: el pie común es el mecanismo de atribución de la feature 001 (`FooterContent.imageSources`); extender su lista de datos es la vía prevista y no "redefine el pie" (FR-008). Mantener `ASSET_CREDITS` y `CREDITOS.md` sincronizados es una convención ya establecida de la 001.
- **Alternatives considered**: (a) un bloque de créditos propio en `mundos.html` — descartado: rompe la fuente única del pie y FR-008; (b) editar `ASSET_CREDITS` sin tocar el test — descartado: viola el Principio V (cambio de lógica sin test previo).

## D6 — Contenido: narrativo, en español, sin etiquetas de rigor (FR-002, FR-003, FR-009)

- **Decisión**: cada mundo se redacta con la plantilla fija de tres bloques — **Qué es** (1–2 párrafos), **En la historia** (1–2 párrafos), **Rasgos distintivos** (lista de 3–6 puntos). Tono divulgativo y cinematográfico, en español, describiendo la película. Spoilers al mínimo imprescindible para explicar el rol de cada mundo.
- **Rationale**: la plantilla la fijó la clarificación 2; la profundidad la fijó una asunción de la spec. FR-009 excluye el contenido científico etiquetado (✓/~/✎): eso es del eje La Ciencia y su Principio VI. El contenido de Mundos no hace afirmaciones científicas que requieran verificación de fuentes: describe lugares y su función narrativa.
- **Cobertura mínima por mundo (FR-003)**: Tierra → *blight*, tormentas de polvo, colapso agrícola; Miller → océano global, olas montañosas, cercanía a Gargantúa; Mann → superficie de hielo, nubes congeladas, aparente habitabilidad; Gargantúa → agujero negro supermasivo, disco de acreción, horizonte de eventos, distorsión por lente gravitacional; Tesseract → el tiempo como espacio recorrible, tras la estantería de Murph.
- **Alternatives considered**: (a) prosa libre — descartado en la clarificación 2 (uniformidad y testeabilidad); (b) incluir la ciencia de cada mundo aquí — descartado: FR-009 y separación de ejes.

## D7 — Sin cambios en navegación, anclas ni tokens (FR-001, FR-008, FR-015)

- **Decisión**: `js/nav-data.js` no se toca (las 5 anclas de Mundos ya están: `#tierra #gargantua #miller #mann #tesseract`). `mundos.html` no declara header ni footer propios. No se agregan custom properties a `:root`. La compensación de scroll de anclas (`scroll-margin-top` sobre `section[id]`) de la feature 001 se conserva y aplica sin cambios.
- **Rationale**: la feature es aditiva sobre una base aprobada; minimizar la superficie de cambio reduce el riesgo de regresión (HU3).
- **Alternatives considered**: (a) un acento de color por mundo como token nuevo — descartado: FR-014 admite acento "opcional" pero dentro de la paleta ya aprobada, sin un segundo color saturado; si se usa, se hace con las variables existentes.
