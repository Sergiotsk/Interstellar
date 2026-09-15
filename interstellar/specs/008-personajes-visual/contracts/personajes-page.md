# Contrato: estructura DOM de `personajes.html` (v008 — reemplaza parcialmente al contrato 003)

**Valida**: FR-001 a FR-011 de `specs/008-personajes-visual/spec.md`.

**Relación con el contrato 003** (`specs/003-personajes-content/contracts/personajes-page.md`):
este documento **reemplaza** las reglas visuales de `.ficha-personaje` / `.ficha-retrato` /
FR-010 (prohibición de animación) para las fichas con `patron: completo` (ver
`data-model.md`). **Mantiene vigente sin cambios** el contrato 003 completo para las fichas con
`patron: degradado` (hoy: Brand, Profesor Brand, Mann, TARS/CASE) y hereda de 003, para TODAS
las fichas, las reglas de contenido que no son puramente visuales: los 6 `id` de sección fijos
y en su orden, la distinción de parentesco Brand/Profesor Brand, `<p class="ficha-reparto">`,
la prohibición de contenido científico detallado (FR-009 de 003) y la prohibición de spoilers
más allá de lo imprescindible.

## Regla general

`personajes.html` conserva su `<head>` actual y su `<script type="module" src="js/layout.js">`.
Se agrega `<script type="module" src="js/personajes.js">` (nuevo, ver `research.md` §6). No
declara `<header>` ni `<footer>` propios. Solo se reescribe el interior de `<main>`.

## Esqueleto de `<main>` — portada de tripulación (reemplaza la intro de 003)

```text
<section class="portada-tripulacion">
  <h1>Personajes</h1>
  <p>…párrafo breve de encuadre, hereda del contrato 003…</p>
  <ul class="galeria-grid">          <!-- reuso textual de css/global.css, ver research.md §6b -->
    <li>
      <figure>
        <a href="#cooper">
          <img src="assets/img/personajes-cooper.jpg" alt="">
          <figcaption>Cooper <span>Piloto · Endurance</span></figcaption>
        </a>
      </figure>
    </li>
    <!-- … 6 en total, mismo orden e id que las secciones de más abajo -->
  </ul>
</section>
```

**Regla**: el `<h1>` de esta sección es el ÚNICO `<h1>` de toda la página (hereda del contrato
003, ahora explícito). El `<ul class="galeria-grid">` PORTA (copia textual) la clase ya
definida en `css/galeria.css` (hoja de `galeria.html`) a `css/personajes.css` — no se hace
`<link>` cruzado entre hojas de página (rompería el aislamiento del contrato 006 C5) — más el
estilo puntual del nombre/rol superpuesto al retrato dentro de cada `<figure>`.

## Esqueleto de `<main>` — ficha con `patron: completo` (Cooper, Murph)

```text
<section id="cooper" class="personaje-hero">
  <div class="personaje-hero-img-wrap">
    <img class="personaje-hero-img" src="assets/img/personajes-cooper.jpg" alt="">
  </div>
  <div class="personaje-hero-ficha">
    <p class="personaje-hero-rol">Piloto · Endurance</p>
    <h1>Cooper</h1>              <!-- ver nota H1/H2 más abajo -->
    <p>…bajada corta…</p>
  </div>
</section>

<div class="personaje-texto">
  <h3>Quién es</h3>
  <p>…1-2 párrafos…</p>
</div>

<div class="riel-tira" data-riel-t>
  <div class="riel-tira-vista">
    <div class="tira-datos" data-datos>
      <div class="tira-datos-item">          <!-- 2-3, una por Escena de galería -->
        <p class="tira-datos-label">Escena 01 · …</p>
        <h3>…título…</h3>
        <p>…descripción…</p>
        <div class="tira-datos-dato"><strong>Dato curioso</strong>…</div>
      </div>
      <!-- … -->
    </div>
    <div class="tira-fotogramas">
      <div class="tira-pista" data-pista>
        <figure class="tira-frame"><img src="assets/img/personajes-cooper-escena-01.jpg" alt="…"></figure>
        <!-- … una por Escena de galería, mismo orden que tira-datos-item -->
      </div>
    </div>
  </div>
</div>

<div class="personaje-cierre">
  <div class="personaje-texto">
    <h3>Su papel en la historia</h3>
    <p>…</p>
    <h3>Rasgos distintivos</h3>
    <ul>
      <li>…</li>   <!-- 3-6 items, hereda regla del contrato 003 -->
    </ul>
  </div>
  <div class="nav-visor-bloque">
    <div class="nav-visor" data-nav-visor data-intervalo="450">
      <p class="nav-visor-cabecera"><span class="nav-visor-rec">REC</span><span>COOPER · NN</span></p>
      <div class="nav-visor-pantalla">
        <img class="nav-visor-frame is-activo" src="assets/img/personajes-cooper-visor-01.jpg" alt="">
        <img class="nav-visor-frame" src="assets/img/personajes-cooper-visor-02.jpg" alt="">
        <!-- … todos los frames de todos los tramos, en orden, ver data-model.md -->
      </div>
      <p class="nav-visor-pie"><span>LOOP ⟳</span><span data-nav-estado>NN FRM</span></p>
    </div>
  </div>
</div>

<p class="ficha-reparto">Reparto: Matthew McConaughey.</p>   <!-- hereda del contrato 003, fuera del bloque visual -->
```

## Esqueleto de `<main>` — ficha con `patron: degradado` (Brand, Profesor Brand, Mann, TARS/CASE)

**Sin cambios respecto al contrato 003**: `<h2>` + `<div class="ficha-personaje">` con
`<figure class="ficha-retrato">`, los tres `<h3>` en el orden «Quién es» → «Su papel en la
historia» → «Rasgos distintivos», `<ul>` de 3-6 `<li>`, `<p class="ficha-reparto">`. Ver
contrato 003 para el detalle completo — no se reproduce acá para no duplicar fuente de verdad.

## Hooks y restricciones (fichas `patron: completo`)

| Elemento | Regla |
|---|---|
| `section[id].personaje-hero` | Reemplaza a `<h2>` + `.ficha-personaje` de 003 para estas fichas. El `id` no cambia (hereda de 003). Contiene exactamente: `.personaje-hero-img-wrap > img`, `.personaje-hero-ficha` con `.personaje-hero-rol`, un encabezado con el nombre y un `<p>` de bajada. |
| Encabezado del nombre dentro del hero | `<h1>` si es la única sección de nivel 1 de esa "página lógica" (personajes.html sigue teniendo un único `<h1>` real en la intro, fuera de las fichas — el del hero de cada ficha usa `<p class="personaje-hero-nombre">` o se ajusta a `<h2>` en la implementación final para no duplicar `<h1>`; **se resuelve en tasks**, no es ambiguo a nivel de jerarquía: sigue habiendo exactamente un `<h1>` en toda la página, igual que exige el contrato 003). |
| `.riel-tira` | Uno por ficha `completo`. Contiene `.tira-datos` (2-3 `.tira-datos-item`, sincronizados 1:1 con) `.tira-fotogramas > .tira-pista > .tira-frame` (mismo total). Degradado sin JS/GSAP/reduced-motion: sin `body.js-armado`, ambos quedan en flujo normal (CSS ya lo resuelve, sin rama JS adicional). |
| `.personaje-cierre` | Uno por ficha `completo`, al final. Contiene `.personaje-texto` (con «Su papel en la historia» + «Rasgos distintivos», hereda `<ul>` 3-6 `<li>` de 003) y `.nav-visor-bloque`. |
| `.nav-visor` | `data-nav-visor` + `data-intervalo` (ms). Contiene `.nav-visor-pantalla` con N `<img class="nav-visor-frame">` (la primera con `.is-activo`), `alt=""` (decorativo — refuerza contenido ya en el texto, FR-011). Ausente por completo si el personaje no tiene tramos de visor curados (no un `<div>` vacío). |
| `<p class="ficha-reparto">` | Hereda sin cambios del contrato 003: uno por ficha, fuera de los bloques anteriores, mismo formato en las 6. |
| Animación / scroll driven | PERMITIDO para fichas `patron: completo` — esta es la derogación explícita de FR-010 del contrato 003 para estas fichas puntuales (FR-002, FR-003 de esta spec). Las fichas `patron: degradado` siguen bajo la prohibición de 003 sin cambios. |
| Contenido científico / spoilers | Hereda sin cambios de 003 (fuera del alcance visual de esta feature). |

## CSS asociado

Vive en `css/personajes.css` (hoja específica de la página, ya existente — se reescribe, no se
crea una nueva). No se toca `css/galeria.css` ni `css/mundos.css` (se portan textual, no se
linkean cruzados); los tokens que se reutilizan
(`--cockpit-metal`, `--cockpit-bezel`, `--instrumento-teal`, `--font-instrumento`) ya están
declarados en `css/variables.css` / `css/layout.css` — se consumen, no se redefinen.

- `.personaje-hero` / `.personaje-hero-img-wrap` / `.personaje-hero-ficha` → mismo mecanismo que
  `.mundo-portada-escena` (`css/mundos.css`), portado (no importado) a `css/personajes.css`.
- `.riel-tira` / `.tira-datos` / `.tira-fotogramas` / `.tira-pista` / `.tira-frame` → tal como
  quedó validado en `spikes/personajes-galeria-vertical.html`.
- `.personaje-cierre` → `display: grid`, 2 columnas en escritorio (texto / visor), 1 columna en
  mobile (`≤48rem`), `padding` simétrico arriba/abajo respecto al elemento anterior.
- `.nav-visor*` → piel de instrumento (gradiente `--cockpit-metal-alto`→`--cockpit-metal`,
  borde `--cockpit-bezel`, texto `--font-instrumento` + `--instrumento-teal`), scanlines vía
  `repeating-linear-gradient` — NO reutiliza clases de `#en-celuloide` / `js/filmstrip.js`.
- Fichas `patron: degradado` conservan el CSS de `.ficha-personaje` / `.ficha-retrato` sin
  cambios (hereda de `css/personajes.css`, que ya trae la ficha del contrato 003 portada desde
  `css/layout.css` sección 12 — ver cabecera del propio archivo).

## Verificación

- **FR-012**: `document.querySelectorAll('main h1').length === 1` (vive en `.portada-tripulacion`);
  `.galeria-grid` tiene exactamente 6 `<li>`, cada uno con un `<a href="#<id>">` que resuelve a
  una de las 6 secciones existentes.
- **FR-001/FR-002**: para `cooper` y `murph`, existe `section#<id>.personaje-hero` con imagen de
  fondo + ficha; NO existe `.ficha-personaje`/`.ficha-retrato` para esos dos `id`.
- **FR-002**: `.riel-tira[data-riel-t]` presente para `cooper`/`murph`, con igual cantidad de
  `.tira-datos-item` y `.tira-frame`.
- **FR-003/FR-004**: `.nav-visor[data-nav-visor][data-intervalo]` presente cuando hay tramos
  curados; ausente (sin hueco) cuando no.
- **FR-009**: para `brand`, `profesor-brand`, `mann`, `tars-case`: DOM idéntico al contrato 003
  (`.ficha-personaje` presente, `.personaje-hero`/`.riel-tira`/`.nav-visor` ausentes).
- **FR-010**: `git status` / `git ls-files` no incluye ningún archivo bajo
  `assets/cap-that.com_interstellar(2014)/`.
- **FR-011**: cada `img` decorativa (`.personaje-hero-img`, `.tira-frame img`,
  `.nav-visor-frame`) tiene `alt=""`; el retrato de respaldo (`patron: degradado`) conserva
  `alt` descriptivo (hereda regla de 003).
- Heredado de 003, sin cambios: 6 `section[id]` en el orden fijo, `<p class="ficha-reparto">`
  por ficha, exactamente un `<h1>` en toda la página, sin errores/404 en consola en Chrome/Edge/
  Firefox, sin desplazamiento horizontal a 320/768/1280px.
