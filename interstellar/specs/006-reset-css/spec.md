# Feature Specification: Fundación CSS — reset, tokens y arquitectura de 4 hojas

**Feature Branch**: `006-reset-css`

**Created**: 2026-09-02

**Status**: Draft — bloqueada por enmienda de constitución (ver Dependencias)

**Input**: User description: "Implementar una capa de reset y normalización CSS como fundación del proyecto, previa a cualquier estilo de layout o componente existente. Reset con selectores :where() (especificidad 0), box-sizing global, reset de márgenes total, normalización de listas/media/controles de formulario/tablas, enlaces sin decoración y color: inherit, botones sin estilos nativos, bloque prefers-reduced-motion global que neutralice animaciones/transiciones, overflow-wrap en texto y encabezados. Organización de archivos: css/reset.css → css/variables.css → css/base.css → css/layout.css, cargados como <link> independientes en ese orden, sin @import. Solo CSS vanilla, sin build. No debe alterar visualmente el hero ni el layout base ya implementados; sin regresiones visuales en ninguna página."

## Clarifications

### Session 2026-09-02

- Q: ¿Cómo se integra el reset (constitución fija un solo `css/global.css`)? → A: **Split
  completo**. `css/global.css` se disuelve en `css/reset.css` + `css/variables.css` +
  `css/base.css` + `css/layout.css`, cargados como 4 `<link>` en ese orden. Requiere
  enmendar la constitución (§ Restricciones — CSS) **antes** de planificar.
- Q: ¿Reset de márgenes total o conservador? ¿"Sin regresiones" cubre qué páginas? → A:
  **Reset total** (`:where(*) { margin: 0 }`). Esta feature **también** agrega las reglas
  mínimas de espaciado necesarias (en `base.css`/`layout.css`) para que **las 9 páginas**
  se vean sin regresiones.
- Q: ¿Bloque `prefers-reduced-motion` agresivo o liviano? → A: **Agresivo y global** en
  `reset.css` (`*, *::before, *::after` con `animation`/`transition` a duración casi nula y
  `!important`). El bloque puntual `@media (prefers-reduced-motion: reduce)` que hoy vive en
  `global.css` se **elimina** por redundante (la pausa del video del Hero en `js/layout.js`
  se mantiene: es lógica, no CSS).

## Dependencias

- **Enmienda de constitución (prerequisito)**: la constitución fija hoy el modelo de CSS
  como *"un `css/global.css` de base (variables, reset, header/nav/footer, utilidades) +
  un CSS específico por página pesada"*. Esta feature lo reemplaza por una arquitectura de
  4 hojas globales. La constitución establece que *"una spec colgada NO puede contradecir
  esta constitución; si necesita hacerlo, primero se enmienda"*. Por lo tanto, **antes de
  `/speckit-plan` hay que correr `/speckit-constitution`** para actualizar esa sección
  (bump MINOR: cambia una convención, ningún principio I–VI).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Base neutral y sobreescribible para quien estiliza el sitio (Priority: P1)

Quien trabaja el CSS de cualquier sección del sitio (layout, componentes, páginas de eje)
necesita partir de un piso de estilos consistente entre navegadores que **no pelee** con
sus reglas: cualquier selector de una clase o de un elemento debe ganarle al reset sin
recurrir a `!important` ni a selectores más específicos de lo necesario.

**Why this priority**: Es la razón de ser de la feature. Sin esto, el trabajo por secciones
arranca sobre defaults inconsistentes del navegador y sobre reglas base que a veces hay que
"vencer" con especificidad. Entregando solo esto ya hay valor: una fundación limpia.

**Independent Test**: Agregar en cualquier hoja posterior una regla de un solo selector de
elemento (p. ej. `p { margin-top: 2rem }`) y verificar que **aplica** sin conflicto, y
auditar que ninguna regla de `reset.css` (salvo el bloque de movimiento reducido) supera
especificidad `(0,0,1,0)`.

**Acceptance Scenarios**:

1. **Given** `reset.css` cargado como primera hoja, **When** una hoja posterior define una
   regla de elemento simple sobre `ul`, `a`, `button` o `img`, **Then** esa regla se aplica
   sin `!important` ni aumentar la especificidad.
2. **Given** un navegador evergreen (últimas 2 versiones), **When** se carga una página,
   **Then** los defaults de caja, márgenes, listas, media y controles de formulario son los
   mismos entre navegadores.
3. **Given** el reset y el resto de las hojas aplicadas, **When** se compara **cada una de
   las 9 páginas** contra su estado previo (con `css/global.css`), **Then** se ven
   **idénticas**, sin regresiones visuales.

---

### User Story 2 - Respeto de la preferencia de menos movimiento en todo el sitio (Priority: P2)

Una persona visitante que activó "reducir movimiento" en su sistema debe recorrer cualquier
página sin animaciones ni transiciones molestas, de forma consistente, sin depender de que
cada componente se acuerde de contemplar esa preferencia.

**Why this priority**: El sitio usa animaciones (marcha del botón CASE, y a futuro efectos
scroll-driven y Canvas). Un neutralizador global en la capa base es una red de seguridad:
aunque un componente nuevo olvide su bloque de `prefers-reduced-motion`, `reset.css` lo
cubre.

**Independent Test**: Con "reducir movimiento" activo, abrir cada página y verificar que
ninguna animación ni transición CSS corre (el botón CASE queda quieto), y que el contenido
sigue legible y usable.

**Acceptance Scenarios**:

1. **Given** `prefers-reduced-motion: reduce` activo, **When** se abre cualquier página,
   **Then** no se percibe ninguna animación ni transición CSS.
2. **Given** la preferencia activa, **When** se interactúa con el menú y con los enlaces,
   **Then** los cambios de estado ocurren de forma instantánea y nada se rompe ni
   desaparece.

---

### User Story 3 - Texto largo que no desborda (Priority: P3)

Quien visita el sitio en una pantalla angosta (p. ej. 320 px) debe ver el texto y los
encabezados contenidos, sin que una palabra larga (una URL, "dilatación-temporal") empuje
el layout y genere scroll horizontal.

**Why this priority**: Mejora de robustez de bajo riesgo. Complementa el trabajo responsive
existente sin reemplazarlo.

**Independent Test**: Cargar una página con una palabra artificialmente larga en un párrafo
y en un encabezado a 320 px y verificar que corta y no hay scroll horizontal.

**Acceptance Scenarios**:

1. **Given** un encabezado o párrafo con una palabra más ancha que su contenedor a 320 px,
   **When** se renderiza la página, **Then** la palabra se parte y no hay desborde
   horizontal.

---

### Edge Cases

- **Espaciado de las páginas de contenido**: al ser reset total de márgenes, las páginas de
  eje (Mundos, Personajes, La Ciencia, Galería) pierden la separación vertical que hoy dan
  los márgenes por defecto del navegador. Esta feature DEBE reponer ese espaciado en
  `base.css`/`layout.css` para que no haya regresión (US1-AS3).
- **Bloque `prefers-reduced-motion` migrado**: las reglas puntuales que hoy están en
  `global.css` (botón CASE, transiciones de nav) se **eliminan**; el neutralizador global
  de `reset.css` las cubre. La pausa del `<video>` del Hero en `js/layout.js` NO se toca
  (es JS, no CSS).
- **Controles de formulario y botones ya estilados**: el sitio tiene `<button>` (botón CASE
  de navegación y controles ▼ del acordeón). El reset de botones (quitar fondo/borde,
  `cursor: pointer`) NO debe alterar el aspecto ni el comportamiento de esos controles, que
  ya definen su propio estilo en `layout.css`.
- **Media del Hero**: el backdrop del Hero es un `<video>` posicionado en absoluto; el reset
  de media (`display: block`, `max-width: 100%`) NO debe cambiar su cobertura de pantalla.
- **Orden de carga en las 9 páginas**: si a alguna página le falta uno de los 4 `<link>` o
  quedan en otro orden, la cascada se rompe. Todas deben tener los 4, en el mismo orden.

## Requirements *(mandatory)*

### Functional Requirements

**Arquitectura de hojas**

- **FR-001**: El CSS global del sitio DEBE quedar dividido en **4 hojas**, cada una con una
  responsabilidad única:
  - `css/reset.css` — reset y normalización (esta feature).
  - `css/variables.css` — tokens de diseño en `:root` (los actuales, migrados sin cambios).
  - `css/base.css` — estilos base de elementos (tipografía, enlaces, listas de lectura) y el
    espaciado vertical de contenido.
  - `css/layout.css` — layout del sitio y componentes compartidos (header/nav/drawer, Hero,
    footer, foco, secciones de eje, galería, ficha, concepto de ciencia).
  - (Nota: el reparto exacto base vs. layout lo fija `/speckit-plan`.)
- **FR-002**: Las 9 páginas HTML DEBEN cargar las 4 hojas como `<link rel="stylesheet">`
  **independientes**, en el orden `reset → variables → base → layout`. PROHIBIDO `@import`.
- **FR-003**: `css/global.css` DEBE dejar de existir (su contenido se reparte entre las 4
  hojas). Ninguna página puede seguir enlazándolo.
- **FR-004**: La migración NO DEBE alterar visualmente **ninguna** de las 9 páginas. El
  resultado renderizado con las 4 hojas DEBE ser idéntico al actual con `global.css`.

**Reset (`css/reset.css`)**

- **FR-005**: `css/reset.css` DEBE ser la **primera** hoja que el navegador aplica en las 9
  páginas.
- **FR-006**: Salvo el bloque de movimiento reducido (FR-016), **ninguna** regla de
  `reset.css` DEBE superar especificidad `(0,0,1,0)`. La mayoría DEBEN usar `:where()` para
  tener especificidad `(0,0,0,0)`.
- **FR-007**: `box-sizing: border-box` a todos los elementos y pseudo-elementos
  (`*, *::before, *::after`).
- **FR-008**: Reset **total** de márgenes: `margin: 0` en todos los elementos.
- **FR-009**: Normalizar **listas** (`ul`, `ol`): `list-style`, `margin`, `padding` a
  valores consistentes.
- **FR-010**: Normalizar **media** (`img`, `picture`, `svg`, `video`, `canvas`):
  `display: block` y `max-width: 100%`.
- **FR-011**: **Controles de formulario** (`input`, `textarea`, `select`, `button`) DEBEN
  heredar la tipografía de su contexto (`font: inherit`).
- **FR-012**: Normalizar **tablas** (`border-collapse`, `border-spacing`).
- **FR-013**: **Enlaces**: `text-decoration: none` y `color: inherit`. El color y la
  decoración de enlaces los define `base.css`/`layout.css`, no el reset.
- **FR-014**: **Botones**: quitar los estilos nativos del navegador (fondo, borde) y dar
  `cursor: pointer`. El aspecto visual lo definen los componentes.
- **FR-015**: `overflow-wrap: break-word` (o equivalente) en elementos de **texto y
  encabezados**, para que palabras largas no generen desborde horizontal.
- **FR-016**: Bloque `@media (prefers-reduced-motion: reduce)` que **neutralice de forma
  global** animaciones y transiciones CSS (`*, *::before, *::after` con
  `animation-duration`/`transition-duration` a duración casi nula, `animation-iteration-count: 1`,
  `scroll-behavior: auto`, todo con `!important`). Es la **única** excepción a FR-006 y
  PUEDE exceder especificidad y usar `!important`.
- **FR-017**: El bloque `@media (prefers-reduced-motion: reduce)` **puntual** que hoy vive
  en `css/global.css` DEBE **eliminarse cuando entre en vigor el bloque global de FR-016**
  (US2). Durante US1 se migra sin cambios a `css/layout.css` para no perder la reducción de
  movimiento en ningún momento; se borra recién al agregarse FR-016. La lógica JS de pausa
  del video del Hero (`js/layout.js`) NO se toca.
- **FR-018**: `css/reset.css` **NO DEBE** imponer decisiones de diseño: nada de colores de
  paleta, familias tipográficas concretas, escalas de tamaño ni espaciados de diseño. Esos
  valores viven en `variables.css` / `base.css` / `layout.css`.

**Restricciones generales**

- **FR-019**: Todo el trabajo DEBE ser **CSS vanilla sin paso de build** (sin preprocesador,
  sin `@import`, sin bundler), conforme al Principio I.
- **FR-020**: El único cambio de HTML permitido es **reemplazar el `<link>` a `global.css`
  por los 4 `<link>` en orden** en las 9 páginas. Ningún otro cambio de markup.
- **FR-021**: La suite de tests JS existente DEBE seguir en verde: la feature es solo CSS +
  `<link>`, no toca lógica.
- **FR-022**: La arquitectura DEBE permitir que una página pesada (p. ej. cada minijuego,
  hechos con CSS + JS vanilla) sume **una hoja CSS propia** como **5º `<link>`**, cargada
  **después** de `layout.css`, sin `@import`. Al ser el reset de especificidad 0
  (`:where()`), esa hoja de página sobreescribe la base sin `!important` ni subir
  especificidad. Esta feature NO crea ninguna hoja de página; solo garantiza y documenta
  el patrón para features futuras.

### Key Entities

- **`css/reset.css`**: hoja de reset/normalización. Zero-specificity (`:where()`), primera
  en cargar. Contenido: box-sizing, márgenes, listas, media, form controls, tablas, links,
  botones, overflow-wrap, y el bloque global de `prefers-reduced-motion`.
- **`css/variables.css`**: `:root` con todos los tokens actuales (paleta, tipografía, foco,
  oscurecimiento de backdrops, `--color-case`). Migración textual, sin cambios de valor.
- **`css/base.css`**: estilos base de elementos + espaciado vertical del contenido de
  lectura.
- **`css/layout.css`**: layout + componentes compartidos (todo lo que hoy son las secciones
  3–14 de `global.css`).
- **`<head>` de las 9 páginas**: pasa de 1 `<link>` (`global.css`) a 4, en orden fijo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de las reglas de `css/reset.css` (contadas una por una), excepto el
  bloque de `prefers-reduced-motion`, tiene especificidad ≤ `(0,0,1,0)`; verificable
  inspeccionando la hoja.
- **SC-002**: `css/reset.css` es la **primera** hoja de estilo aplicada en las 9 páginas;
  ninguna regla de proyecto se carga antes.
- **SC-003**: Las **9 páginas** se ven **idénticas** antes (con `global.css`) y después (con
  las 4 hojas), comparando capturas en al menos 2 anchos (≈360 px y ≈1280 px). Cero
  diferencias perceptibles.
- **SC-004**: `css/global.css` ya no existe en el repo y ninguna página lo enlaza.
- **SC-005**: Las 9 páginas tienen exactamente los 4 `<link>` en el orden
  `reset → variables → base → layout`.
- **SC-006**: En cualquier página, agregar una regla de un solo selector de elemento sobre
  `ul`, `ol`, `a`, `button` o `img` la sobreescribe sin `!important` y sin subir
  especificidad. Verificable con 5 pruebas puntuales.
- **SC-007**: Con "reducir movimiento" activo, ninguna de las 9 páginas presenta animaciones
  ni transiciones CSS perceptibles, y todas siguen navegables y legibles.
- **SC-008**: A 320 px de ancho, una palabra artificialmente larga en un párrafo y en un
  encabezado no produce scroll horizontal en ninguna página.
- **SC-009**: `node --test tests/*.test.js` sigue en verde (26/26).

## Assumptions

- **Prerequisito duro**: la constitución se enmienda (§ CSS) **antes** de `/speckit-plan`,
  vía `/speckit-constitution`. Bump MINOR (cambia una convención, no un principio).
- **Público**: US1 apunta a quien desarrolla el CSS (autor + agente); US2 y US3 a la
  persona que visita el sitio.
- **Navegadores**: evergreen, últimas 2 versiones. `:where()`, `overflow-wrap`,
  `prefers-reduced-motion` con soporte pleno; sin polyfills.
- **Verificación**: capa presentacional (Principio V) → se valida contra estos criterios de
  aceptación, no con tests de framework. El "idéntico antes/después" se hace con capturas
  en navegador, página por página.
- **Fuera de alcance de ESTA feature**: reorganización de carpetas del repo (más allá de
  `css/`), agregado de páginas nuevas, y cualquier retoque estético. Son features
  separadas (007+).
- **Reparto base vs. layout**: qué regla va en `base.css` y qué en `layout.css` lo decide
  `/speckit-plan`; la spec solo fija que existan las 4 hojas y su orden.
- **`js/layout.js` inyecta header y footer**: el markup de esos partials no cambia; solo
  cambia dónde viven sus estilos (de `global.css` a `layout.css`).
