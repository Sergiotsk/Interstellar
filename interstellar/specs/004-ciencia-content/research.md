# Investigación y decisiones de diseño — Contenido del eje La Ciencia

**Fase**: 0 (Investigación)
**Feature**: `004-ciencia-content`
**Fecha**: 2026-08-29

## Estado

No quedan incógnitas abiertas (sin NEEDS CLARIFICATION). Las seis clarificaciones de
`spec.md` §Clarifications y la inspección del código de las features 001–003 resuelven
cada punto de diseño. Este documento también materializa la **verificación del Principio
VI**: la tabla §D6 mapea cada afirmación planificada a su fuente y a su etiqueta de rigor,
y es la base de la revisión de SC-004 y SC-005.

## Fuentes aprobadas (única bibliografía admitida para esta feature)

- **[T]** Thorne, Kip. *The Science of Interstellar*. W. W. Norton, 2014. ISBN 978-0393351378.
  Asesor científico y productor ejecutivo de la película. El libro clasifica cada tema en
  ciencia establecida ("truths"), especulación informada ("educated guesses") y licencia
  del guion ("speculation"); esta feature sigue ese mismo criterio.
- **[P1]** James, O.; von Tunzelmann, E.; Franklin, P.; Thorne, K. S. "Gravitational
  lensing by spinning black holes in astrophysics, and in the movie Interstellar."
  *Class. Quantum Grav.* 32, 065001 (2015). Preprint: arXiv:1502.03808. Render DNGR de
  Gargantúa con lente gravitacional real.
- **[P2]** James, O.; von Tunzelmann, E.; Franklin, P.; Thorne, K. S. "Visualizing
  Interstellar's Wormhole." *Am. J. Phys.* 83, 486–499 (2015). Visualización del agujero
  de gusano.

## D1 — Sin imágenes nuevas; se reutiliza `ciencia-agujero-negro.jpg` (clarificación 2026-08-29)

- **Decisión**: la feature es solo texto. `#agujeros-negros` reutiliza
  `assets/img/ciencia-agujero-negro.jpg` (NASA/JPL-Caltech, descargada y acreditada) como
  `<figure>` ilustrativo con `alt` descriptivo. Las otras tres secciones no llevan imagen.
  NO se toca `js/layout.js`, `js/creditos.js`, `assets/img/CREDITOS.md` ni `tests/`.
- **Nota (PR #8, feat/creditos-page)**: la atribución por asset se movió del pie a una
  página propia `creditos.html` + `js/creditos.js`; el pie solo enlaza a "Créditos y
  fuentes". `ciencia-agujero-negro.jpg` sigue acreditada ahí (`js/creditos.js` +
  `assets/img/CREDITOS.md`). Como la feature 004 no agrega imágenes ni créditos, ese
  cambio de mecanismo no la afecta: SC-010 se cumple porque la atribución ya existe.
- **Rationale**: el valor del eje está en el contenido y en las etiquetas de rigor. Las
  imágenes de licencia clara para dilatación temporal / agujeros de gusano / relatividad
  son difíciles de conseguir sin forzar; el render del paper (`gargantua-render.jpg`)
  sigue descartado (licencia de republicación sin verificar, igual que en 002/003). Una
  foto genérica de estrellas no aporta.
- **Alternatives considered**: (a) una imagen nueva de lente gravitacional real
  (NASA/ESA) — descartado por la clarificación (mantener la feature acotada, sin tocar
  lógica JS); (b) una imagen por sección — descartado (riesgo de imágenes forzadas,
  feature más grande).

## D2 — Etiqueta de rigor: `<span class="rigor rigor-<nivel>">` inline, texto real, un nivel por párrafo

- **Decisión**: cada afirmación con contenido científico se cierra con un
  `<span class="rigor rigor-real">✓ Ciencia real</span>` /
  `<span class="rigor rigor-plausible">~ Especulación plausible</span>` /
  `<span class="rigor rigor-licencia">✎ Licencia narrativa</span>`. El texto del `<span>`
  incluye **el nivel escrito** (no solo el glifo ni solo color) — FR-011, FR-016.
  Convención de maquetado: **cada `<p>` de «La ciencia» / «En Interstellar» agrupa
  afirmaciones de un único nivel de rigor y termina con su etiqueta**; si una sección
  tiene afirmaciones de dos niveles, van en párrafos distintos. Esto mantiene la relación
  1 `<p>` calificado ↔ 1 `.rigor` y vuelve testeable SC-003.
- **Rationale**: `<span>` es neutro (a diferencia de `<mark>`, que trae fondo amarillo y
  semántica de "resaltado para referencia" en algunos UA). La regla "un nivel por párrafo"
  evita etiquetas ambiguas a mitad de frase y da un criterio de conteo claro.
- **Alternatives considered**: (a) `<mark>` — descartado (reset de estilo UA, semántica
  distinta); (b) nota al pie numerada por afirmación — descartado en la clarificación
  (pesado sin tooling); (c) una etiqueta por sección — descartado por la clarificación
  (niveles mixtos dentro de un tema).

## D3 — Leyenda de rigor: un `<dl>` único, cerca del inicio del `<main>` (FR-004)

- **Decisión**: después de la `<section>` de introducción (la del `<h1>La Ciencia</h1>`) y
  antes de la primera sección de concepto, va un `<dl class="rigor-leyenda">` con las tres
  entradas: término = `✓ Ciencia real` / `~ Especulación plausible` / `✎ Licencia
  narrativa`, definición = su significado en una frase (tomado de la constitución,
  Principio VI). Es la única leyenda de la página; las etiquetas inline no repiten la
  definición.
- **Rationale**: `<dl>` (término/definición) es el elemento semántico exacto para una
  leyenda. Ponerla una sola vez, arriba, cumple "su significado identificable la primera
  vez que aparecen" sin ensuciar cada sección.
- **Alternatives considered**: (a) leyenda repetida por sección — descartado (ruido); (b)
  `title=""` en cada `<span>` — descartado (no accesible en teclado ni en móvil, no
  cumple FR-011).

## D4 — Sub-estructura: tres `<h3>` fijos «La ciencia» / «En Interstellar» / «Fuentes» (clarificación)

- **Decisión**: cada `<section id>` de concepto lleva `<h2>` + tres bloques `<h3>` en este
  orden: **«La ciencia»** (párrafos de física real divulgativa, con etiquetas inline),
  **«En Interstellar»** (párrafos sobre a qué escena(s) corresponde y cómo la película lo
  representa, con etiquetas inline) y **«Fuentes»** (`<ul>` de 1–3 referencias del conjunto
  aprobado, citadas donde aplican). Las cuatro secciones usan la misma plantilla.
- **Rationale**: espejo del patrón de las features 002 («Qué es» / «En la historia» /
  «Rasgos») y 003 («Quién es» / «Su papel» / «Rasgos»), adaptado. El juicio de rigor lo
  dan las etiquetas inline, no un bloque aparte.
- **Alternatives considered**: bloque separado «Dónde está la línea» — descartado en la
  clarificación (redundante con las etiquetas).

## D5 — CSS: sección 13 de `css/global.css`, patrón reutilizable, sin tokens nuevos

- **Decisión**: se agrega a `css/global.css` una **sección 13** con:
  - `.concepto` (clase sobre cada `<section id>` de `ciencia.html`): estilos de `h3`, `p`,
    `ul`, `li` y `figure` del contenido del concepto (el `section[id]` base solo estiliza
    `h2` y `p`; `h3`/`ul`/`li` no están cubiertos fuera de `.eje-con-backdrop` y
    `.ficha-personaje`). `figure` del concepto: ancho máximo acotado, centrado, `img`
    `display:block; width:100%; height:auto`, sin `--backdrop-oscurecer`.
  - `.rigor` (base de la etiqueta): `display: inline-block`, tipografía pequeña, `padding`
    mínimo, `border-radius`, `white-space: nowrap`, `border` sutil con
    `color-mix(... var(--color-texto) ...)`, fondo `var(--color-superficie)`. Igual para
    los tres niveles: **la distinción la da el texto** (`✓`/`~`/`✎` + palabras), no el
    color (FR-016).
  - `.rigor-real` / `.rigor-plausible` / `.rigor-licencia`: variaciones **mínimas** dentro
    de la paleta ya aprobada (por ejemplo, opacidad o peso del borde). Si se quiere un
    acento, el único admitido es el naranja de Gargantúa (`--color-gargantua`) y se
    reserva para `.rigor-licencia` (marca lo más alejado de la ciencia). Nunca un segundo
    color saturado.
  - `.rigor-leyenda` (sobre el `<dl>`): layout compacto término→definición, tipografía
    `var(--font-texto)` y `var(--color-texto-atenuado)`.
  - **Sin custom properties nuevas**: solo se consumen `--color-superficie`, `--color-fondo`,
    `--color-texto`, `--color-texto-atenuado`, `--color-gargantua` y `--font-*`.
  - `scroll-margin-top` sobre `section[id]` ya existe (feature 001) y aplica sin cambios
    (FR-015).
- **Rationale**: el eje El Viaje va a necesitar el mismo patrón de "contenido de concepto
  con etiqueta de rigor"; `global.css` ya es dueño de `section[id]`, de `.eje-con-backdrop`
  y de `.ficha-personaje`. Crear `css/ciencia.css` para un patrón transversal sería
  duplicación anticipada.
- **Alternatives considered**: (a) `css/ciencia.css` propio — descartado (patrón
  transversal, no página pesada); (b) estilos inline — descartado ("nada hardcodeado
  suelto"); (c) tres colores saturados para los tres niveles — descartado (FR-016, viola
  "único color saturado = naranja de Gargantúa").

## D6 — Verificación del Principio VI: tabla afirmación → fuente → etiqueta

Cada afirmación planificada para `ciencia.html`, con la fuente que la respalda y su nivel
de rigor. Es la referencia de la revisión de aceptación (SC-004: ninguna `✎` como `✓`;
SC-005: toda afirmación con fuente). Los textos finales pueden reformularse, pero NO pueden
subir de nivel de rigor sin cambiar también esta tabla.

### Agujeros negros (`#agujeros-negros`)

| # | Afirmación (idea) | Fuente | Etiqueta |
|---|---|---|---|
| AN-1 | El horizonte de eventos es el límite del que nada escapa, ni la luz. | [T] cap. "Black Holes" | `✓ Ciencia real` |
| AN-2 | El disco de acreción: gas que orbita y se calienta antes de caer, y por eso brilla. | [T] cap. sobre Gargantúa | `✓ Ciencia real` |
| AN-3 | La imagen de Gargantúa (el anillo de luz que parece envolverla arriba y abajo) es lente gravitacional: la luz de detrás se curva por la gravedad. Se calculó con ecuaciones reales de relatividad general y derivó en un paper con revisión por pares. | [T] cap. sobre la visualización; [P1] | `✓ Ciencia real` |
| AN-4 | Gargantúa gira casi al máximo posible (espín ≈ 0,9999…); Thorne lo eligió para que la dilatación temporal de Miller fuera consistente. | [T] cap. "A Spinning Black Hole" | `~ Especulación plausible` |
| AN-5 | Cooper cruza el horizonte y sobrevive gracias a una "singularidad amable" (tipo BKL / de masa-inflación) que en teoría sería menos destructiva. | [T] cap. "The Singularities…" (Thorne lo marca como especulación informada) | `~ Especulación plausible` |
| AN-6 | Que se pueda ver, medir y transmitir información desde el interior del agujero negro y volver. | Sin respaldo en [T]; contradice la causalidad del horizonte | `✎ Licencia narrativa` |

**Fuentes de la sección**: [T] (caps. sobre agujeros negros y sobre Gargantúa), [P1].

### Dilatación temporal (`#dilatacion-temporal`)

| # | Afirmación (idea) | Fuente | Etiqueta |
|---|---|---|---|
| DT-1 | El tiempo corre más lento cuanto más profundo se está en un pozo gravitatorio (dilatación temporal gravitacional). Está confirmado con relojes atómicos y es lo que corrige el GPS. | [T] cap. "Slowing Time" | `✓ Ciencia real` |
| DT-2 | En el planeta de Miller, 1 hora equivale a unos 7 años fuera (factor ≈ 61.000). Es alcanzable estando muy cerca del horizonte de un agujero negro que gira muy rápido; Thorne verificó los números con Gargantúa. | [T] cap. sobre Miller | `✓ Ciencia real` |
| DT-3 | La nave Endurance, en órbita más alta, casi no sufre esa dilatación mientras el equipo baja a Miller. | [T] mismo cap. | `✓ Ciencia real` |
| DT-4 | Que un planeta con océano y condiciones para la vida orbite de forma estable tan cerca de Gargantúa, pese a las mareas extremas. | [T] (Thorne lo trata como forzado pero no imposible con ajustes) | `~ Especulación plausible` |

**Fuentes de la sección**: [T] (cap. "Slowing Time" y cap. sobre el planeta de Miller).

### Agujeros de gusano (`#agujeros-de-gusano`)

| # | Afirmación (idea) | Fuente | Etiqueta |
|---|---|---|---|
| AG-1 | Un agujero de gusano es un "atajo" que conecta dos regiones lejanas del espacio-tiempo; matemáticamente es el puente de Einstein-Rosen (1935), solución de las ecuaciones de Einstein. | [T] cap. "Wormholes" | `✓ Ciencia real` (como solución matemática) |
| AG-2 | La visualización esférica del agujero de gusano en la película (no un embudo 2D) es la forma correcta de verlo; salió un paper sobre eso. | [T]; [P2] | `✓ Ciencia real` |
| AG-3 | Para que un agujero de gusano sea atravesable y no colapse haría falta "materia exótica" con energía negativa; nunca se observó en la cantidad necesaria y no se sabe si existe así. | [T] cap. "Wormholes" | `~ Especulación plausible` |
| AG-4 | Que "alguien" (seres de dimensiones superiores / humanos del futuro) haya colocado el agujero de gusano cerca de Saturno para salvarnos. | [T] (Thorne lo cataloga como parte de la ficción) | `✎ Licencia narrativa` |

**Fuentes de la sección**: [T] (cap. "Wormholes"), [P2].

### Relatividad (`#relatividad`) — marco unificador

| # | Afirmación (idea) | Fuente | Etiqueta |
|---|---|---|---|
| RE-1 | La relatividad general de Einstein (1915): la gravedad no es una fuerza, es la curvatura del espacio-tiempo causada por la masa y la energía. Es la teoría de la gravedad mejor comprobada. | [T] caps. "Warped Time and Space" / introductorios | `✓ Ciencia real` |
| RE-2 | No existe un "ahora" universal: el ritmo del tiempo depende del observador y de la gravedad local. | [T] mismos caps. | `✓ Ciencia real` |
| RE-3 | De este marco se derivan los otros tres temas del eje: los agujeros negros (colapso extremo), la dilatación temporal (tiempo más lento en pozos de gravedad) y los agujeros de gusano (soluciones tipo puente). | [T] (estructura del libro) | `✓ Ciencia real` (que son soluciones/consecuencias) · `~` (que existan agujeros de gusano atravesables) |
| RE-4 | El Tesseract: un espacio construido donde el tiempo es una dimensión física que se puede recorrir, hecho por seres de más dimensiones. Thorne lo señala como lo más especulativo/forzado de la película. | [T] cap. sobre el Tesseract | `✎ Licencia narrativa` |
| RE-5 | Que la gravedad "se filtre" entre dimensiones y Cooper pueda empujar libros y mover la aguja de un reloj desde el Tesseract. Inspirado libremente en teorías de branas/dimensiones extra, pero su uso en la trama es ficción. | [T] (Thorne lo explica como licencia) | `✎ Licencia narrativa` |
| RE-6 | El amor como una fuerza física, medible, que atraviesa el espacio y el tiempo (tesis de Amelia Brand). | No es una afirmación científica; es argumento de un personaje | `✎ Licencia narrativa` |

**Fuentes de la sección**: [T] (caps. "Warped Time and Space" y sobre el Tesseract).

### Cobertura de las tres etiquetas (FR-004, SC-003)

- `✓ Ciencia real`: AN-1, AN-2, AN-3, DT-1, DT-2, DT-3, AG-1, AG-2, RE-1, RE-2, RE-3.
- `~ Especulación plausible`: AN-4, AN-5, DT-4, AG-3, RE-3 (parcial).
- `✎ Licencia narrativa`: AN-6, AG-4, RE-4, RE-5, RE-6.

Las tres aparecen varias veces y en más de una sección.

## D7 — Sin cambios en navegación, anclas, tokens ni lógica (FR-001, FR-009, FR-014, FR-015)

- **Decisión**: `js/nav-data.js`, `js/layout.js` y `tests/` NO se tocan. `ciencia.html` no
  declara header ni footer propios. No se agregan custom properties a `:root`. La
  compensación `scroll-margin-top` sobre `section[id]` de la feature 001 se conserva.
  Todas las rutas internas de `ciencia.html` (CSS, script, la imagen, enlaces a otras
  páginas del sitio) son relativas (FR-014; constitución 1.1.0).
- **Rationale**: feature aditiva sobre base aprobada; superficie de cambio mínima
  (`ciencia.html` + sección 13 de `global.css`).
- **Alternatives considered**: enlazar desde cada concepto a la escena correspondiente del
  eje El Viaje — descartado: El Viaje todavía es placeholder; las referencias a escenas
  son textuales (FR-010) y no enlaces a anclas que aún no tienen contenido.
