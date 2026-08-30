# Contrato: estructura DOM de `ciencia.html` + CSS de la etiqueta de rigor

**Valida**: FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-009, FR-011, FR-012, FR-014, FR-015, FR-016.

## Regla general

`ciencia.html` conserva su `<head>` actual (Google Fonts + `css/global.css`) y su
`<script type="module" src="js/layout.js">`. **No declara `<header>` ni `<footer>`
propios**: los inyecta `js/layout.js` (FR-009). Solo se reescribe el interior de `<main>`.
Todas las rutas (`href`/`src`) son **relativas**, nunca con `/` inicial (FR-014).

## Esqueleto de `<main>`

```text
<main>
  <section>                              ← intro (SIN id, SIN plantilla de 3 bloques)
    <h1>La Ciencia</h1>
    <p>…encuadre del eje…</p>
    <dl class="rigor-leyenda">
      <dt>✓ Ciencia real</dt>            <dd>Fielmente representada; física establecida.</dd>
      <dt>~ Especulación plausible</dt>  <dd>Permitida por la física en teoría, pero hipotética.</dd>
      <dt>✎ Licencia narrativa</dt>      <dd>Forzada por el guion, cuestionada por la física.</dd>
    </dl>
  </section>

  <section id="agujeros-negros" class="concepto">
    <h2>Agujeros negros</h2>

    <figure>
      <img src="assets/img/ciencia-agujero-negro.jpg" alt="…ilustración de un agujero negro y su disco…">
      <figcaption>…qué muestra la imagen…</figcaption>
    </figure>

    <h3>La ciencia</h3>
    <p>…afirmación(es) de un nivel… <span class="rigor rigor-real">✓ Ciencia real</span></p>
    <p>…afirmación(es) de otro nivel… <span class="rigor rigor-plausible">~ Especulación plausible</span></p>

    <h3>En Interstellar</h3>
    <p>…cómo aparece en la película… <span class="rigor rigor-real">✓ Ciencia real</span></p>
    <p>…lo que la película fuerza… <span class="rigor rigor-licencia">✎ Licencia narrativa</span></p>

    <h3>Fuentes</h3>
    <ul>
      <li>Thorne, K. <i>The Science of Interstellar</i> (2014), cap. …</li>
      <li>James et al., <i>Class. Quantum Grav.</i> 32, 065001 (2015) — arXiv:1502.03808.</li>
    </ul>
  </section>

  <section id="dilatacion-temporal" class="concepto"> … (misma plantilla, SIN <figure>) …
  <section id="agujeros-de-gusano"  class="concepto"> … (misma plantilla, SIN <figure>) …
  <section id="relatividad"         class="concepto"> … (sección paraguas, SIN <figure>) …
</main>
```

## Hooks y restricciones

| Elemento | Regla |
|---|---|
| `<main>` | Exactamente uno; nunca lo reemplaza `layout.js` (FR-009, Principio II). |
| `<section id="…">` | Exactamente 4, con `id` ∈ {`agujeros-negros`, `dilatacion-temporal`, `agujeros-de-gusano`, `relatividad`} y en ese orden (FR-001, FR-015). Cada una lleva `class="concepto"`. Los `id` NO cambian. |
| `<h1>` | Uno solo en toda la página, en la sección de intro. |
| `<dl class="rigor-leyenda">` | Uno solo, en la sección de intro. Exactamente 3 pares `<dt>`/`<dd>`, orden `real` → `plausible` → `licencia` (FR-004). Texto real (no `title`, no solo color). |
| `<h2>` | Uno por concepto, con el nombre visible (coincide con `js/nav-data.js`). |
| `<h3>` | Exactamente tres por concepto, con los textos «La ciencia», «En Interstellar», «Fuentes», en ese orden (FR-002, FR-011). |
| `<span class="rigor rigor-<nivel>">` | Cada `<p>` de «La ciencia» / «En Interstellar» con contenido científico termina con **una** etiqueta. `<nivel>` ∈ {`real`, `plausible`, `licencia`}. El texto del `<span>` incluye el glifo **y** las palabras del nivel (FR-003, FR-011). |
| Coherencia rigor ↔ `research.md` §D6 | Ninguna afirmación catalogada `licencia` en `research.md` §D6 se materializa con `rigor-real` (FR-005, SC-004). Las tres clases aparecen al menos una vez en la página (FR-004, SC-003). |
| «Fuentes» `<ul>` | Un `<ul>` real con 1–3 `<li>`, referencias del conjunto {Thorne 2014, arXiv 1502.03808, AJP 83 2015} (FR-007). Al menos 1 por sección (SC-005). |
| `<figure>` | Solo en `#agujeros-negros`. `<img>` con `src` relativo a `assets/img/ciencia-agujero-negro.jpg` y `alt` descriptivo (informativa, FR-011). SIN `class="eje-backdrop"`, SIN `filter`, SIN posicionamiento absoluto. Las otras 3 secciones NO llevan `<figure>`. |
| Referencias a escenas | **Textuales**. PROHIBIDO enlazar a anclas del eje El Viaje (todavía placeholder) o incluir animación/scroll-driven (FR-010). |
| Rutas | Todas relativas: `css/global.css`, `js/layout.js`, `assets/img/…`, `viaje.html`, `mundos.html#…` — nunca `/…` (FR-014). |

## CSS asociado — sección 13 de `css/global.css`

Bloque reutilizable (no `css/ciencia.css`, sin tokens nuevos):

- **`.concepto`** (sobre `<section id>`): estiliza el contenido que el `section[id]` base no
  cubre fuera de `.eje-con-backdrop` / `.ficha-personaje`:
  - `.concepto h3` → `var(--font-hero-titulo)`, tamaño intermedio, separación de token;
    `.concepto h3:first-of-type { margin-top: 0 }`.
  - `.concepto p`, `.concepto li` → `var(--font-texto)`, `var(--color-texto-atenuado)`,
    `line-height` cómodo.
  - `.concepto ul` → `margin: 0; padding-left: 1.25rem`.
  - `.concepto figure` → `margin: 1rem 0`; `max-width` acotado; centrado; borde/fondo sutil
    con `var(--color-superficie)`; `img { display:block; width:100%; height:auto }`. Sin
    `--backdrop-oscurecer`.
  - `.concepto figcaption` → `var(--color-texto-atenuado)`, tamaño reducido.
- **`.rigor`** (base de la etiqueta, común a los tres niveles):
  `display: inline-block; white-space: nowrap;` tipografía pequeña; `padding` mínimo;
  `border-radius`; `border: 1px solid color-mix(in srgb, var(--color-texto) 22%, transparent);`
  `background-color: var(--color-superficie);` `color: var(--color-texto);`
  `margin-left: 0.35rem;`. **La distinción entre niveles la da el texto**, no el color
  (FR-016).
- **`.rigor-real` / `.rigor-plausible` / `.rigor-licencia`**: variación **mínima** dentro de
  la paleta aprobada (p. ej. peso u opacidad del borde). El único acento saturado admitido
  es `var(--color-gargantua)` y, si se usa, se reserva para `.rigor-licencia` (borde o
  guion lateral). Nunca un segundo color saturado; nunca la única señal del nivel.
- **`.rigor-leyenda`** (sobre el `<dl>`): layout compacto término→definición
  (`<dt>` en `var(--color-texto)`, `<dd>` en `var(--color-texto-atenuado)`,
  `var(--font-texto)`); margen inferior de separación con la primera sección. A 320 px no
  desborda (FR-012).
- `scroll-margin-top` sobre `section[id]` ya existe (feature 001) y aplica sin cambios
  (FR-015).
- El reset ya trae `img { max-width: 100% }` (FR-012).

## Verificación

- **SC-001**: ningún `<section id>` contiene el string "Sección futura dedicada a".
- **SC-002 / FR-011**: `document.querySelectorAll('main h1').length === 1`; cada
  `section[id].concepto` tiene 1 `h2` y 3 `h3` con los textos y el orden del contrato; un
  único `dl.rigor-leyenda` con 3 `dt` y 3 `dd`.
- **SC-003 / FR-003 / FR-004**: todo `p` con contenido científico dentro de `.concepto`
  termina con un `span.rigor`; aparecen las tres clases `rigor-real`, `rigor-plausible`,
  `rigor-licencia` al menos una vez; cada `span.rigor` contiene texto con el nombre del
  nivel.
- **SC-004 / FR-005**: contrastando contra `research.md` §D6, ninguna afirmación
  catalogada `licencia` aparece con `rigor-real`; ninguna `rigor-real` carece de fila de
  respaldo.
- **SC-005 / FR-007**: cada `section[id].concepto` tiene un `h3` «Fuentes» seguido de un
  `ul` con ≥1 `li`.
- **FR-013 / SC-008**: recorrido de la página sin errores ni 404 en consola (Chrome, Edge,
  Firefox).
- **FR-014**: ningún `href`/`src` de `ciencia.html` empieza con `/`.
- **SC-006**: a 320/768/1280 px, sin desplazamiento horizontal; la etiqueta de rigor y la
  leyenda no desbordan; la imagen no desborda su contenedor.
