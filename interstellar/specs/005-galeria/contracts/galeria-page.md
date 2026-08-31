# Contrato — `galeria.html` y sección 14 de `css/global.css`

**Feature**: `005-galeria` · **Valida**: FR-001..FR-018, SC-001..SC-011

Define la estructura DOM de `galeria.html` tras la feature y el bloque CSS que la
acompaña. No incluye el texto final de los pies (eso es tarea de implementación) ni
código completo; fija la forma y las clases.

## 1. `galeria.html` — `<head>` (sin cambios)

Se conserva el `<head>` actual: `charset`, `viewport`, `<title>Galería | Interstellar</title>`,
`<link>` de Google Fonts, `<link rel="stylesheet" href="css/global.css">`. Se conserva
`<script type="module" src="js/layout.js">` al final del `<body>`. NO se agrega `<script>`
propio (FR-016).

`<body>` sin clase `home` (hereda el tratamiento de página interna, sección 10 de
`global.css`).

## 2. `galeria.html` — `<main>` (se reescribe)

```html
<main>
  <section>
    <h1>Galería</h1>
    <p><!-- intro breve: qué reúne la galería, organizada por los cuatro ejes --></p>
  </section>

  <section id="mundos">
    <h2>Mundos</h2>
    <a class="galeria-eje-enlace" href="mundos.html">Ir a la página de Mundos</a>
    <ul class="galeria-grid">
      <li>
        <figure>
          <a href="assets/img/mundos-miller-oceano.jpg">
            <img src="assets/img/mundos-miller-oceano.jpg"
                 alt="<!-- descripción de la imagen -->"
                 loading="lazy" width="1280" height="720">
          </a>
          <figcaption><!-- qué muestra + «Eje Mundos» --></figcaption>
        </figure>
      </li>
      <!-- … resto de <li> de la categoría Mundos (9 en total) -->
    </ul>
  </section>

  <section id="personajes"> … </section>   <!-- 10 figuras -->
  <section id="ciencia">    … </section>   <!-- 5 figuras -->
  <section id="viaje">      … </section>   <!-- 4 figuras -->
</main>
```

### Reglas del marcado

| # | Regla |
|---|---|
| C1 | Un único `<h1>` en la página, en la primera `<section>` (sin `id`). Esa sección hereda el bloque de presentación centrado (`body:not(.home) main > section:first-child`, sección 10). |
| C2 | Exactamente 4 `<section id>` con `id` = `mundos`, `personajes`, `ciencia`, `viaje`, en ese orden (FR-001, SC-001). Heredan `section[id]` (sección 10): `max-width: 60rem`, centrada, `border-top`, `<h2>` en Orbitron. |
| C3 | Cada categoría: un `<h2>` con el nombre visible + un `<a class="galeria-eje-enlace">` a la página del eje con ruta relativa (FR-002, FR-009). El texto del enlace es explícito ("Ir a la página de Mundos"), no "aquí". |
| C4 | Las figuras van en un `<ul class="galeria-grid">`; cada imagen es un `<li>` con un `<figure>` dentro (FR-002, FR-011). El `<ul>` lleva `list-style: none`. |
| C5 | Cada `<figure>`: un `<a href="assets/img/<archivo>">` (ruta relativa, FR-004) que envuelve **solo** el `<img>`, y un `<figcaption>` hermano del `<a>` (no dentro). Sin `<div>` intermedio. |
| C6 | Cada `<img>`: `src` relativo a `assets/img/`, `alt` descriptivo no vacío (FR-003, FR-011), `loading="lazy"` (FR-008a, SC-011), `width` y `height` con las dimensiones reales de **ese** archivo (varían por imagen — la mayoría 1280×720, otras 960×402, 1280×1280, 2560×1072, 925×1197, 1920×1920, 1280×853, 960×899) para reservar el espacio y evitar reflow. |
| C7 | El `<figcaption>` describe qué muestra la imagen y nombra su eje ("… Eje Mundos."). Tono descriptivo, español; sin datos científicos ni etiquetas de rigor `✓`/`~`/`✎` (FR-003 nota). No repite literal el `alt`. |
| C8 | Reparto de las 28 imágenes por categoría según `data-model.md` (Mundos 9 · Personajes 10 · La Ciencia 5 · El Viaje 4). Cada archivo aparece en una sola categoría. |
| C9 | Ningún `href`/`src` absoluto con `/` inicial ni URL de dominio; todo relativo (constitución 1.1.0). |
| C10 | La página NO declara `<header>` ni `<footer>` propios; los inyecta `js/layout.js` (FR-010). |
| C11 | Sin `<style>` en línea, sin `<script>` propio, sin `on*` handlers, sin `data-*` de comportamiento (FR-016). |

## 3. `css/global.css` — sección 14 «Galería (feature 005 — galeria)»

Se agrega al final del archivo, con el mismo encabezado de sección que las secciones
10–13. Solo consume tokens existentes; **sin tokens nuevos**, sin segundo color saturado
(FR-014).

### Selectores y reglas (forma, no valores finales)

| Selector | Propósito |
|---|---|
| `.galeria-eje-enlace` | Enlace bajo el `<h2>` de cada categoría: `display: inline-block`, tipografía `--font-nav`, color `--color-texto-atenuado`, subrayado sutil; `:focus-visible` hereda el anillo de foco de la sección 6. Margen inferior antes de la cuadrícula. |
| `.galeria-grid` | El `<ul>`: `list-style: none; margin: 1.5rem 0 0; padding: 0;` + `display: grid; gap: 0.75rem;` + `grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));` — el `min(100%, 16rem)` garantiza **1 columna sin desbordamiento a 320 px** (FR-012, SC-005). |
| `.galeria-grid > li` | Grid item; sin estilo propio salvo `min-width: 0` (evita overflow de contenido). |
| `.galeria-grid figure` | `margin: 0;` |
| `.galeria-grid figure > a` | `display: block;` + `background: var(--color-superficie);` (fondo de degradación si la imagen no carga, FR-018); `:focus-visible` hereda el anillo de foco. |
| `.galeria-grid img` | `display: block; width: 100%; height: auto; aspect-ratio: 3 / 2; object-fit: cover;` — tile uniforme con recorte centrado (FR-002a). |
| `.galeria-grid figcaption` | `margin-top: 0.4rem;` tipografía `--font-texto`, `font-size: 0.9rem`, `color: var(--color-texto-atenuado)`, `line-height: 1.5`. |
| `@media (max-width: 30rem)` | Ajuste opcional de `gap`/`font-size` si hace falta; la cuadrícula ya cae a 1 columna por el `min(100%, …)`. |

### Reglas del CSS

| # | Regla |
|---|---|
| S1 | Solo tokens existentes: `--color-texto-atenuado`, `--color-superficie`, `--font-nav`, `--font-texto`, y el foco de la sección 6. Ningún valor de color nuevo, ningún `--token` nuevo (FR-014). |
| S2 | Sin `@keyframes`, sin `transition` de aparición, sin `transform` animado (FR-015). Un `transition` de color en `:hover`/`:focus` del enlace es aceptable (no es "efecto de atmósfera"). |
| S3 | Ninguna regla fuerza un ancho mayor que el viewport; `minmax(min(100%, 16rem), 1fr)` es la garantía anti-overflow (SC-005). |
| S4 | La sección 14 no altera selectores de las secciones 1–13. `section[id]` y su `<h2>` siguen viniendo de la sección 10. |
| S5 | `aspect-ratio` + `width`/`height` en el `<img>` reservan el hueco del tile aunque la imagen tarde o falle (FR-018). |

## 4. Sin cambios

- `js/layout.js`, `js/nav-data.js` — intactos.
- `tests/` — solo `creditos.test.js` ya ajustó el contador `15 → 28` (fase de sourcing);
  ningún test nuevo.
- `assets/img/CREDITOS.md`, `js/creditos.js` — ya actualizados en la fase de sourcing
  (13 filas / 13 líneas nuevas, sincronía 1:1).
