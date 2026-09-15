# Interstellar — Web temática

Sitio web sobre la película **Interstellar** (Christopher Nolan, 2014). Trabajo
práctico para **Programación IV**: contenido estático, foco en diseño, impacto
visual, interactividad y una capa educativa de **ciencia real** verificada.

**En producción:** <https://sergiotsk.github.io/Interstellar/>

---

## La idea del trabajo práctico

La consigna de la cátedra es armar una web temática sobre una serie o película
favorita, demostrando **dominio de los fundamentos web** — sin frameworks.

Como es **una sola historia** (sin temporadas ni capítulos), la navegación se
construye sobre **cuatro ejes propios** que dan la misma solidez multinivel que
tendría una serie:

| Eje | Qué cubre |
|-----|-----------|
| **Mundos** | Cada escenario como una "temporada": la Tierra, Gargantúa, el planeta de Miller, el de Mann y el Tesseract. Página propia, galería y clima visual por mundo. |
| **Personajes** | Cooper, Murph, Dr. Brand, el profesor, Mann, TARS & CASE. |
| **La Ciencia** | La física real detrás de la película: agujeros negros, dilatación temporal, agujeros de gusano, relatividad. |
| **El Viaje** | Timeline del recorrido de la misión Endurance. |

Más las secciones de apoyo: **Galería**, **Minijuegos**, **Trailer** y **Contacto**.

### La capa educativa: tres niveles de rigor

El diferencial del proyecto es no sobrevender la ciencia. Cada concepto lleva una
etiqueta visible:

- **✓ Ciencia real** — fielmente representada (la visualización de Gargantúa, la
  dilatación temporal gravitacional).
- **~ Especulación plausible** — permitida por la física, pero hipotética
  (atravesar un agujero de gusano).
- **✎ Licencia narrativa** — forzada por el guion, cuestionada por la física (el
  Tesseract, la comunicación a través del tiempo por gravedad).

Ningún texto de ciencia se redacta de memoria: se contrasta contra *The Science of
Interstellar* (Kip Thorne) y los papers derivados (arXiv 1502.03808) **antes** de
escribirse.

---

## Restricciones de la cátedra (lo que NO se negocia)

El profesor pidió explícitamente **herramientas básicas**. El núcleo del sitio se
construye solo con:

- **HTML5 semántico** — `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`,
  `<figure>`… La semántica es criterio explícito de evaluación. Un `<div>` donde
  va un elemento semántico es un defecto que bloquea la aceptación.
- **CSS puro** — variables CSS para toda la paleta y los valores reutilizables,
  Grid/Flexbox para el layout, media queries para responsive.
- **JavaScript vanilla (ES6+)** — **ES Modules** planos, un módulo por
  responsabilidad, sin variables globales.

> **"Vanilla" es una restricción _técnica_, no sobre quién teclea.** Quiere decir
> HTML/CSS/JS directo: sin el modelo de componentes / JSX de ningún framework y
> sin transpilación. El código lo generan **agentes de codificación bajo dirección
> del alumno** (ver _Libertades_ y _Metodología_ más abajo); lo que la cátedra
> evalúa es esa dirección y que cada pieza se pueda explicar y defender.

**Prohibido:**

- Frameworks de aplicación o de UI: React, Preact, Vue, Angular, Svelte, Solid,
  Astro, Lit.
- Frameworks CSS y utilidades atómicas: Tailwind, Bootstrap.
- TypeScript.
- Preprocesadores CSS: Sass, Less, PostCSS.
- **Paso de build** en la publicación: sin bundler, sin transpilación, sin
  minificación automática. Lo que se lee en el repo es lo que corre.

**Además:**

- **Responsive obligatorio** — tiene que verse y funcionar bien en mobile y en
  desktop (criterio muy valorado).
- **Cero errores en consola**; links y assets con rutas relativas bien resueltas.
- **Acreditar la fuente de cada imagen** es obligatorio (NASA/ESA lo exigen; el
  resto queda prolijo).
- Alcance acotado: sin PWA, sin service workers, sin SEO avanzado, sin i18n, sin
  ARIA avanzado. La accesibilidad exigida es la que da el HTML bien hecho.

---

## Libertades que dio la cátedra

- **IA y agentes de programación: permitidos y alentados.** El objetivo pedagógico
  es evaluar **qué tan efectivamente el alumno dirige la IA** para construir sobre
  fundamentos, no la copia ciega. Cada pieza generada tiene que poder explicarse y
  defenderse.
- **Metodología spec-driven.** El desarrollo se dirige con una `constitution.md`
  (principios firmes del proyecto) y **specs colgadas** feature por feature, al
  estilo GitHub Spec Kit. Es la herramienta central para que la IA genere lo
  imaginado y no cualquier cosa.
- **Librerías de propósito acotado** (autorización de la cátedra, 2026-09-03),
  usadas **desde el JavaScript propio** para lo que la plataforma no cubre bien:
  animación, render WebGL/Canvas, motor de juego 2D, audio, partículas. Ejemplos:
  **GSAP/ScrollTrigger**, three.js, PixiJS, Phaser, Howler, Lottie, tsParticles.
  Toda feature que sume una librería justifica en su spec: qué problema resuelve,
  por qué no se hace con plataforma nativa, su peso en KB gzip y su impacto en
  LCP/TBT, y en qué páginas carga. Se **vendorizan** en `js/vendor/<lib>@<version>/`
  antes de cerrar la feature (sin depender de un CDN en runtime). La prohibición de
  frameworks de app/UI y CSS **sigue en pie**.
- **Herramientas de tooling local** (`devDependencies`) para scripts de
  mantenimiento del repo — por ejemplo **sharp** para optimizar imágenes. Corren
  en la máquina del desarrollador, fuera de CI, con los resultados commiteados. NO
  se envían al navegador ni participan del runtime.

---

## Stack real

Sobre la base HTML/CSS/JS, el sitio usa APIs nativas del navegador y una librería
acotada:

- **GSAP 3.13 + ScrollTrigger** — las portadas *scroll-scrubbed* de los mundos
  (`js/mundo-portada.js`) y la tira de celuloide (`js/filmstrip.js`).
  **Vendorizada** en `js/vendor/gsap@3.13.0/` e importada por ruta relativa: no
  depende de un CDN en runtime. Carga con `import()` dinámico, solo en las páginas
  de mundos. Degrada a hero estático sin JS o con `prefers-reduced-motion`.
- **Canvas 2D** — campo de chispas en la portada de Gargantúa.
- **Intersection Observer** — animaciones de entrada al scroll, tira de celuloide.
- **localStorage** — estado del aviso de spoiler, puntajes locales.
- **Web Share API** — botón "Compartir" del footer (con fallback a enlaces).
- **Tipografías self-hosted** vía `@font-face` (woff2 subset latin); sin `<link>`
  a servicios de terceros.

**Diseño:** negros y azules profundos para el espacio; ocres y dorados para la
Tierra. Dos acentos saturados, uno por capa: el **naranja de Gargantúa** para el
contenido narrativo, el **teal `#4fd0e0`** para la capa de interfaz de nave
(header, footer, LEDs del "cockpit"). Ámbar y rojo como LED de estado/alerta.

---

## Estructura del repo

```
/                       → raíz del repo: CI/CD y este README
  .github/workflows/     → deploy-pages.yml (GitHub Pages vía Actions)
  interstellar/          → el sitio
    *.html               → una página por sección (16 páginas)
    css/                 → reset → variables → base → layout  (+ mundos.css)
    js/                  → módulos ES propios, uno por responsabilidad
    js/vendor/           → librerías vendorizadas (<lib>@<version>/)
    assets/img/          → imágenes que se sirven (rutas relativas)
    assets/fonts/        → tipografías self-hosted
    tools/               → scripts de mantenimiento (Node ESM, corren local)
    tests/               → node:test — lógica JS con TDD estricto
    specs/               → spec-driven development, una carpeta por feature
    .specify/memory/constitution.md   → los principios firmes del proyecto
    proyecto-interstellar-base.md     → el documento base del TP
    DESIGN.md            → el sistema de diseño, portable
    sitemap.xml
```

> El sitio vive en `interstellar/`, no en la raíz. El workflow publica el
> contenido estático de esa carpeta tal cual.

---

## Correr el proyecto localmente

Es un sitio estático: **no hay build**. Alcanza con servir `interstellar/` con
cualquier servidor estático.

```bash
cd interstellar
python -m http.server 8000
# o: pnpm dlx serve .
```

Y abrir <http://localhost:8000>. Servir por HTTP (no abrir los `.html` con
`file://`): los ES Modules y las rutas relativas lo necesitan.

### Tests

La **lógica JavaScript** (helper de layout, estado de submenús, formulario de
contacto, pipeline de imágenes) se desarrolla con **TDD estricto** y corre con el
runner nativo de Node (≥ 20):

```bash
cd interstellar
pnpm test
```

La capa presentacional (HTML, CSS, animaciones visuales) no se testea con
framework: se valida contra los criterios de aceptación de la constitución.

> El gestor de paquetes es **pnpm** (fijado en `package.json` →
> `packageManager`). El lockfile es `pnpm-lock.yaml`. `pnpm test` no instala nada
> —solo corre `node --test`—, así que no necesitás `pnpm install` para los tests.

### Optimizar imágenes

```bash
cd interstellar
pnpm install         # trae sharp (devDependency de tooling)
pnpm optimize
```

---

## Deploy

**GitHub Pages** vía **GitHub Actions** (`.github/workflows/deploy-pages.yml`) en
cada push a `main`. El workflow copia `*.html`, `css/`, `js/`, `assets/` y
`sitemap.xml` de `interstellar/` a `_site/`, agrega `.nojekyll` (desactiva el
procesado Jekyll) y publica. Sin configuración extra.

El sitio se sirve bajo el subpath **`/Interstellar/`**, por eso **toda ruta interna
es relativa** — una ruta absoluta con `/` inicial apunta a la raíz del dominio y se
rompe en producción.

---

## Estado

Base del sitio, los cuatro ejes y las secciones de apoyo: **completos y en
producción**. Las cinco páginas de Mundos tienen portada *scroll-scrubbed* con
GSAP, ya **vendorizado** (`js/vendor/gsap@3.13.0/`).

Pendiente: los **minijuegos** (la coronación, cada uno con su spec) y la pieza más
ambiciosa —la **animación completa del viaje de la Endurance**—, que se encara
como sub-proyecto aparte con su propia spec. Cuando el primer minijuego sume
**Phaser**, se vendoriza igual que GSAP, al cerrar esa feature.
