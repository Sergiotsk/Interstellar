# Contrato: estructura DOM de `mundos.html`

**Valida**: FR-001, FR-002, FR-003, FR-004, FR-005, FR-008, FR-011, FR-012, FR-015.

## Regla general

`mundos.html` conserva su `<head>` actual (Google Fonts + `css/global.css`) y su `<script type="module" src="js/layout.js">`. **No declara `<header>` ni `<footer>` propios**: los inyecta `js/layout.js` (FR-008). Solo se reescribe el interior de `<main>`.

## Esqueleto de `<main>`

```text
<main>
  <section>                         ← intro de página (SIN id, SIN plantilla de 3 bloques)
    <h1>Mundos</h1>
    <p>…texto breve de encuadre del eje…</p>
  </section>

  <section id="tierra" class="eje-con-backdrop">
    <img src="assets/img/mundos-tierra.jpg" alt="" class="eje-backdrop">
    <div class="eje-contenido">
      <h2>La Tierra</h2>

      <h3>Qué es</h3>
      <p>…1–2 párrafos…</p>

      <h3>En la historia</h3>
      <p>…1–2 párrafos…</p>

      <h3>Rasgos distintivos</h3>
      <ul>
        <li>…</li>   ← 3 a 6 ítems, cubre FR-003 para este mundo
      </ul>
    </div>
  </section>

  <section id="gargantua" class="eje-con-backdrop"> … </section>
  <section id="miller"    class="eje-con-backdrop"> … </section>
  <section id="mann"      class="eje-con-backdrop"> … </section>
  <section id="tesseract" class="eje-con-backdrop"> … </section>
</main>
```

## Hooks y restricciones

| Elemento | Regla |
|---|---|
| `<main>` | Exactamente uno; nunca lo reemplaza `layout.js` (FR-008, Principio II). |
| `<section id="…">` | Exactamente 5, con `id` ∈ {`tierra`, `gargantua`, `miller`, `mann`, `tesseract`} y en ese orden (FR-001, FR-015). Los `id` NO cambian. |
| `<h1>` | Uno solo en toda la página, en la sección de intro. |
| `<h2>` | Uno por sección-mundo, con el nombre visible (coincide con el `label` de `js/nav-data.js`). |
| `<h3>` | Exactamente tres por sección-mundo, con los textos «Qué es», «En la historia», «Rasgos distintivos», en ese orden (FR-002, FR-011). |
| `<ul>` de rasgos | Un `<ul>` real (no párrafos con guiones) con 3–6 `<li>` por mundo (FR-002). |
| `<img class="eje-backdrop">` | Uno por sección-mundo. `alt=""` (decorativa, Principio II). `src` relativo a `assets/img/mundos-<id>.jpg` (FR-004, FR-007). |
| Envoltorio `.eje-contenido` | Contiene todo el texto de la sección; se apila por encima del `<img>` de fondo (z-index). Reserva superior para no chocar con el encabezado superpuesto en carga directa de ancla. |
| Contenido científico | PROHIBIDO texto con etiquetas `✓` / `~` / `✎` o explicaciones de física detalladas (FR-009). |
| Animación / scroll driven | PROHIBIDO (FR-010). Sin `data-*` de animación, sin Canvas, sin Intersection Observer en esta página. |

## CSS asociado (en `css/global.css`, D4 de `research.md`)

Se agrega un bloque reutilizable (no `css/mundos.css`, sin tokens nuevos):

- `.eje-con-backdrop` → `position: relative; overflow: hidden; background-color: var(--color-fondo);` (respaldo si la imagen no carga — caso límite).
- `.eje-backdrop` → `position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: var(--backdrop-oscurecer);` (FR-005, SC-007).
- `.eje-contenido` → `position: relative; z-index: 1;` + reserva de padding; ancho máximo y tipografía con las variables ya definidas (`--font-hero-titulo`, `--font-texto`, `--color-texto`, `--color-texto-atenuado`).
- La compensación `scroll-margin-top` sobre `section[id]` ya existe en `global.css` (feature 001) y aplica sin cambios (FR-015).
- Responsive: sin anchos fijos que provoquen scroll horizontal a 320 px; `img { max-width: 100% }` ya está en el reset (FR-012, SC-003).

## Verificación

- **SC-001**: ningún `<section id>` contiene el string "Sección futura dedicada a".
- **FR-011**: `document.querySelectorAll('main h1').length === 1`; cada `section[id]` tiene 1 `h2` y 3 `h3` en el orden del contrato.
- **FR-004 / SC-002**: 5 `img.eje-backdrop` con 5 `src` distintos, todos `assets/img/mundos-*.jpg`.
- **FR-013 / SC-005**: recorrido de la página sin errores ni 404 en consola (Chrome, Edge, Firefox).
- **SC-003**: a 320/768/1280 px, sin desplazamiento horizontal involuntario; imágenes no desbordan.
