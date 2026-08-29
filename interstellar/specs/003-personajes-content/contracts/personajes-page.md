# Contrato: estructura DOM de `personajes.html`

**Valida**: FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-008, FR-011, FR-012, FR-015, FR-016.

## Regla general

`personajes.html` conserva su `<head>` actual (Google Fonts + `css/global.css`) y su `<script type="module" src="js/layout.js">`. **No declara `<header>` ni `<footer>` propios**: los inyecta `js/layout.js` (FR-008). Solo se reescribe el interior de `<main>`.

## Esqueleto de `<main>`

```text
<main>
  <section>                         ← intro de página (SIN id, SIN plantilla de 3 bloques)
    <h1>Personajes</h1>
    <p>…texto breve de encuadre del eje…</p>
  </section>

  <section id="cooper">
    <h2>Cooper</h2>
    <div class="ficha-personaje">

      <figure class="ficha-retrato">
        <img src="assets/img/personajes-cooper.jpg"
             alt="…descripción del personaje…">
        <figcaption>…quién aparece y, si aporta, de qué escena…</figcaption>
      </figure>

      <h3>Quién es</h3>
      <p>…1–2 párrafos…</p>

      <h3>Su papel en la historia</h3>
      <p>…1–2 párrafos…</p>

      <h3>Rasgos distintivos</h3>
      <ul>
        <li>…</li>   ← 3 a 6 ítems, cubre FR-003 para este personaje
      </ul>

      <p class="ficha-reparto">Reparto: Matthew McConaughey.</p>
    </div>
  </section>

  <section id="murph">          … (misma plantilla) …
  <section id="brand">          … (abre nombrando a Amelia Brand, hija del Profesor) …
  <section id="profesor-brand"> … (abre nombrando a John Brand, padre de Amelia) …
  <section id="mann">           … (spoiler al mínimo: FR-016) …
  <section id="tars-case">      … (una sola sección, cubre TARS y CASE) …
</main>
```

> El orden de `<figure>`, los tres bloques y `<p class="ficha-reparto">` dentro de la ficha es **advisory** en el detalle visual (lo resuelve el CSS de `.ficha-personaje`), pero el DOM DEBE contener los tres `<h3>` en el orden «Quién es» → «Su papel en la historia» → «Rasgos distintivos» y exactamente un `<figure>` y una `<p class="ficha-reparto">` por ficha. El contenedor de layout es un `<div class="ficha-personaje">` interno que envuelve el `<figure>` y el texto; el `<h2>` queda fuera, como hijo directo de la `<section id>`.

## Hooks y restricciones

| Elemento | Regla |
|---|---|
| `<main>` | Exactamente uno; nunca lo reemplaza `layout.js` (FR-008, Principio II). |
| `<section id="…">` | Exactamente 6, con `id` ∈ {`cooper`, `murph`, `brand`, `profesor-brand`, `mann`, `tars-case`} y en ese orden (FR-001, FR-015). Los `id` NO cambian. `#tars-case` es una sola sección para los dos robots (FR-005). |
| `<h1>` | Uno solo en toda la página, en la sección de intro. |
| `<h2>` | Uno por ficha, con el nombre visible (coincide con el `label` de `js/nav-data.js`: "Cooper", "Murph", "Dr. Brand", "Profesor Brand", "Mann", "TARS & CASE"). |
| `<h3>` | Exactamente tres por ficha, con los textos «Quién es», «Su papel en la historia», «Rasgos distintivos», en ese orden (FR-002, FR-011). |
| `<ul>` de rasgos | Un `<ul>` real (no párrafos con guiones) con 3–6 `<li>` por ficha (FR-002). |
| `<div class="ficha-personaje">` | Uno por ficha. Envuelve el `<figure>`, los tres bloques `<h3>` + contenido y la `<p class="ficha-reparto">`. El `<h2>` queda fuera, como hijo directo de la `<section id>`. Div de layout sin significado semántico (Principio II). |
| `<figure class="ficha-retrato">` | Uno por ficha, dentro de `.ficha-personaje`. Contiene un `<img>` y un `<figcaption>`. |
| `<img>` del retrato | `alt` **descriptivo** del personaje (imagen informativa, Principio II, FR-011) — NO `alt=""`. `src` relativo a `assets/img/personajes-<id>.jpg` (FR-006, FR-007). SIN `class="eje-backdrop"`, SIN `filter`, SIN posicionamiento absoluto detrás del texto. |
| `<figcaption>` | Describe la imagen (quién aparece, escena). NO contiene la línea de reparto ni la atribución `© Warner Bros.` (aclaración 2026-08-29). |
| `<p class="ficha-reparto">` | Uno por ficha, fuera del `<figure>`. Nombra a **todos** los intérpretes relevantes con etapa/rol entre paréntesis; formato idéntico en las 6 (FR-002, SC-009). |
| Distinción Brand | `#brand` y `#profesor-brand` mencionan explícitamente el parentesco y el rol de la otra figura (FR-004, SC-007). |
| Contenido científico | PROHIBIDO texto con etiquetas `✓` / `~` / `✎` o explicaciones de física detalladas (FR-009). |
| Animación / scroll driven | PROHIBIDO (FR-010). Sin `data-*` de animación, sin Canvas, sin Intersection Observer en esta página. |
| Spoilers | Al mínimo imprescindible para explicar el rol; cuidado en `#mann` y `#profesor-brand` (FR-016). |

## CSS asociado (en `css/global.css`, D4 de `research.md`)

Se agrega una sección 12 con un bloque reutilizable (no `css/personajes.css`, sin tokens nuevos):

- `.ficha-personaje` → `<div>` interno que envuelve el `<figure>` y el texto de la ficha (el `<h2>` queda fuera). Escritorio: `display: grid` con dos columnas (una franja de ancho acotado para el retrato + el resto para el texto). Mobile: una sola columna, retrato primero. Sin anchos fijos que provoquen scroll horizontal a 320 px.
- `.ficha-retrato` (sobre el `<figure>`) → `margin: 0`; marco/fondo con `var(--color-superficie)`; `img { display:block; width:100%; height:auto }` (el reset ya trae `img { max-width:100% }`). Respaldo: si la imagen no carga, el `<figure>` mantiene un fondo coherente con la paleta y la maqueta no se rompe (caso límite, FR-006).
- `.ficha-retrato figcaption` → `var(--color-texto-atenuado)`, tamaño reducido.
- `.ficha-reparto` → `var(--color-texto-atenuado)`, diferenciada del cuerpo (p. ej. `font-style: italic`), separada del último bloque.
- **NO** se usa `.eje-con-backdrop` / `.eje-backdrop` / `--backdrop-oscurecer` (patrón de la feature 002; aclaración 2026-08-29).
- La compensación `scroll-margin-top` sobre `section[id]` ya existe en `global.css` (feature 001) y aplica sin cambios (FR-015).
- Tipografía y color con las variables ya definidas (`--font-hero-titulo`, `--font-texto`, `--color-texto`, `--color-texto-atenuado`).

## Verificación

- **SC-001**: ningún `<section id>` contiene el string "Sección futura dedicada a".
- **FR-011**: `document.querySelectorAll('main h1').length === 1`; cada `section[id]` tiene 1 `h2` (hijo directo), 1 `div.ficha-personaje`, 3 `h3` en el orden del contrato, 1 `figure > img[alt]:not([alt=""])`, 1 `figcaption`, 1 `p.ficha-reparto`.
- **FR-006 / SC-002**: 6 `figure.ficha-retrato > img` con 6 `src` distintos, todos `assets/img/personajes-*.jpg`.
- **FR-004 / SC-007**: `#brand` menciona "hija" / "Profesor Brand"; `#profesor-brand` menciona "padre" / "Amelia".
- **FR-005**: existe exactamente una `<section id="tars-case">` y menciona a TARS y a CASE.
- **SC-009**: las 6 `p.ficha-reparto` presentes; la de `#murph` nombra a Chastain, Foy y Burstyn; la de `#tars-case` incluye "voz de" para ambos robots.
- **FR-013 / SC-005**: recorrido de la página sin errores ni 404 en consola (Chrome, Edge, Firefox).
- **SC-003**: a 320/768/1280 px, sin desplazamiento horizontal involuntario; imágenes no desbordan.
