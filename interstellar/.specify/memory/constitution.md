<!--
SYNC IMPACT REPORT
Version change: 1.2.0 -> 2.0.0
Rationale: Se REDEFINE el Principio I. La catedra autorizo el uso de librerias de terceros
(2026-09-03). El Principio I pasaba de "PROHIBIDOS los frameworks y librerias de terceros /
ninguna dependencia de runtime" a PERMITIR librerias de proposito acotado (animacion,
render WebGL/Canvas, motor de juego 2D, audio, particulas) usadas desde el JS propio y
cargadas SIN paso de build (ESM pinneado para prototipar; vendorizadas en `js/vendor/` al
cerrar la feature). Redefinir un principio core -> bump MAJOR.

Cambios de esta version:
  - Principio I: renombrado "Stack Vanilla, Sin Frameworks" -> "Stack Vanilla, Librerias
    con Criterio". Se permite libreria de proposito acotado, con justificacion por spec
    (problema, peso KB gzip, impacto LCP/TBT, paginas donde carga). SIGUEN PROHIBIDOS:
    frameworks de app/UI (React, Preact, Vue, Angular, Svelte, Solid, Astro, Lit),
    frameworks CSS (Tailwind, Bootstrap), TypeScript, preprocesadores CSS. Sigue SIN build.
  - Principio V: aclaracion -> el glue de integracion de una libreria de render/animacion/
    juego (montaje de escena, wiring de tweens, callbacks visuales) es capa presentacional;
    la logica que orquesta (estado, scoring, victoria, calculos) sigue con TDD estricto.
  - "Restricciones Tecnicas": bloque CSS (sin framework/preprocesador, explicito); parrafo
    JavaScript ampliado (librerias + carpeta `js/vendor/` + sin build); `/js/vendor`
    agregado al arbol de carpetas; "Fuera de alcance" -> se quita "WebGL/Three.js";
    Hosting refuerza "publica `js/vendor/` tal cual".
  - "Flujo de Trabajo / Criterios de aceptacion": nuevo item -> toda libreria nueva viene
    justificada en su spec y vendorizada (o ESM pinneado desde CDN con motivo escrito);
    sin paso de build.

Historial:
  - 1.0.0 (2026-08-27): Primera ratificacion. Principios I-VI y las tres secciones
    definidas a partir de proyecto-interstellar-base.md.
  - 1.1.0 (2026-08-29): Hosting Vercel -> GitHub Pages (Actions), subpath /Interstellar/,
    rutas internas relativas como regla dura.
  - 1.2.0 (2026-09-02): Arquitectura CSS de 4 hojas (reset -> variables -> base -> layout),
    cargadas en orden como `<link>` independientes, sin `@import`.
  - 2.0.0 (2026-09-03): Principio I redefinido -> se permiten librerias de proposito
    acotado, sin paso de build. Autorizacion de la catedra.

Follow-up / consistencia (fuera del alcance de este comando):
  - specs/001-005 mencionan reglas del Principio I viejo; features cerradas, no se tocan.
  - La primera feature que sume una libreria crea `js/vendor/` y fija el patron
    `<lib>@<version>/`.

TODOs deferidos: ninguno.
-->

# Constitucion — Web Interstellar (Programacion IV)

Web tematica sobre la pelicula *Interstellar*. Contenido estatico y fijo. El foco es el
diseno, el impacto visual, la interactividad y la capa educativa de ciencia real. El
desarrollo se dirige con IA/agentes; esta constitucion es la fuente de reglas que el agente
DEBE respetar.

## Core Principles

### I. Stack Vanilla, Librerias con Criterio

El nucleo del sitio se construye con **HTML5 semantico, CSS puro y JavaScript ES6+ escrito
a mano como ES Modules**. Ese nucleo no se negocia: la interactividad y los efectos parten
de las **APIs nativas del navegador** (Canvas 2D, Intersection Observer, localStorage,
Fetch, Web Audio) y se suma una libreria SOLO cuando resuelve un problema que la plataforma
no cubre bien.

**Librerias de terceros PERMITIDAS** (autorizacion de la catedra, 2026-09-03), de proposito
acotado y usadas DESDE el JavaScript propio: animacion, render WebGL/Canvas, motor de juego
2D, audio, particulas. Ejemplos orientativos, NO lista cerrada: GSAP/ScrollTrigger,
three.js, OGL, PixiJS, Phaser, Howler, Lottie, tsParticles. Toda feature que introduzca una
libreria DEBE justificar en su spec: (a) que problema resuelve, (b) por que no se hace
razonablemente con plataforma nativa, (c) su peso en KB gzip y su impacto en LCP/TBT,
(d) en que pagina(s) carga (nunca global si solo la usa una pagina).

**PROHIBIDO**: frameworks de aplicacion o de UI (React, Preact, Vue, Angular, Svelte,
Solid, Astro, Lit); frameworks CSS y utilidades atomicas (Tailwind, Bootstrap); TypeScript;
preprocesadores CSS (Sass, Less, PostCSS). No se adopta el modelo de componentes / JSX de
ningun framework: el JS propio se escribe a mano.

**Sin paso de build**: sin bundler, sin transpilacion, sin minificacion automatizada, sin
autoprefixer. Las librerias se cargan como **ES Modules con version FIJADA (pinned)** desde
un CDN de ESM mientras la feature esta en prototipo, y las **librerias criticas se
VENDORIZAN** en `js/vendor/<lib>@<version>/` antes de cerrar la feature, para no depender de
un CDN en runtime. Una libreria que se deja como ESM pinneado desde CDN en produccion tiene
que explicar el motivo en su spec y asumir ese CDN como dependencia de runtime. Los
archivos que se escriben o vendorizan son los que se sirven.

**Dependencias externas por red permitidas**: fuentes (Google Fonts via `<link>` o
self-hosted), embeds de video via `<iframe>` (YouTube), y CDN de ESM solo durante el
prototipo de una feature. Se asume JavaScript habilitado en el navegador; la degradacion
sin-JS no es un objetivo del proyecto.

**Razon**: la catedra autorizo el uso de librerias. Lo que se evalua sigue siendo el
dominio de HTML semantico + CSS + JS vanilla y la efectividad dirigiendo IA. Una libreria
entra para resolver un problema concreto, entendida y pesada (Principio IV) — no como
sustituto de entender la plataforma. El "sin build" mantiene el sitio auditable: lo que se
lee en el repo es lo que corre.

### II. HTML Semantico Primero

Cada pagina se estructura con los elementos semanticos correctos (`<header>`, `<nav>`,
`<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`, `<figure>`, listas, encabezados
jerarquicos). Un `<div>` solo es aceptable como contenedor de layout sin significado; usar
`<div>` donde corresponde un elemento semantico es un defecto que bloquea la aceptacion.

Todo `<img>` lleva `alt` descriptivo (vacio si es decorativa). El foco de teclado DEBE ser
visible y el orden de tabulacion coherente. Esta es la unica accesibilidad exigida: la que
deriva del HTML bien hecho. No se pide ARIA avanzado ni auditorias WCAG completas.

**Razon**: la semantica es criterio explicito de la catedra y es la base de la
accesibilidad, el SEO minimo y el mantenimiento.

### III. Construccion en Capas

El orden de construccion NO es negociable:

1. **Base**: estructura HTML semantica + CSS (layout con Grid/Flexbox) + tipografia +
   responsive. La web tiene que verse y navegarse bien asi, sin un solo efecto.
2. **Atmosfera**: efectos ambientales sumados **de a uno** (grano, vineta, campos de
   estrellas, polvo cosmico, disco de Gargantua), cada uno verificado antes del siguiente.
3. **Minijuegos**: al final, como coronacion.

Esta PROHIBIDO sumar efectos o minijuegos sobre una pagina cuya base todavia no cumple los
criterios de aceptacion. La pieza mas ambiciosa (animacion del viaje de la Endurance) se
encara como sub-proyecto aparte, recien con la web base solida.

**Razon**: evita el arranque sobrecargado y el codigo a medio hacer apilado.

### IV. Comprension Sobre Generacion

El alumno dirige, la IA ejecuta. **Todo el codigo generado DEBE poder explicarse y
defenderse.** Si una pieza no se entiende, no entra: se pide de nuevo mas simple, o se
estudia hasta entenderla. Se prefiere codigo obvio y legible sobre codigo ingenioso.

El agente NO improvisa estructura, convenciones ni decisiones de arquitectura fuera de lo
que fija esta constitucion o una spec colgada de ella. Ante ambiguedad, pregunta; no asume.

**Razon**: la catedra evalua la efectividad usando estas herramientas, no la copia ciega.

### V. TDD en la Logica, Aceptacion en la Presentacion

Los modulos de **logica JavaScript** —minijuegos (estado, scoring, condicion de victoria),
el helper de inyeccion de header/footer, calculos puros (p. ej. dilatacion temporal),
maquinas de estado— se desarrollan con **TDD estricto**: test que falla -> implementacion
minima -> refactor (Red-Green-Refactor). No se escribe logica sin un test rojo previo.

La **capa presentacional** —HTML semantico, CSS, animaciones de scroll, efectos Canvas
puramente visuales— NO se testea con framework; se valida contra los **criterios de
aceptacion** de la seccion "Flujo de Trabajo y Puertas de Calidad".

El **glue de integracion de una libreria** de render, animacion o juego (montaje de escena,
wiring de tweens, registro de callbacks visuales) es capa presentacional y se valida por
aceptacion. La **logica que esa libreria dibuja** —estado del minijuego, scoring, condicion
de victoria, maquinas de estado, calculos puros— sigue con **TDD estricto** aunque el
render lo haga la libreria.

**Razon**: el TDD protege donde hay ramas de decision y regresiones reales; forzarlo sobre
markup y estilos seria sobreingenieria y contradice el alcance acotado del proyecto.

### VI. Rigor Cientifico Verificado

Ningun texto de la capa educativa se redacta de memoria. Cada afirmacion cientifica se
contrasta contra fuentes reales **antes** de escribirse: fuente principal *The Science of
Interstellar* (Kip Thorne, 2014) y los papers derivados (arXiv 1502.03808 y equivalentes).

Cada concepto lleva una **etiqueta de nivel de rigor visible**:

- `✓ Ciencia real` — fielmente representada.
- `~ Especulacion plausible` — permitida por la fisica, hipotetica.
- `✎ Licencia narrativa` — forzada por el guion, cuestionada por la fisica.

La fuente de cada dato se puede citar. Presentar licencia narrativa como ciencia real es un
defecto de contenido.

**Razon**: distinguir los tres niveles es el diferencial de madurez del proyecto y lo blinda
ante un evaluador que sepa del tema.

## Restricciones Tecnicas y Convenciones

**Estructura de carpetas** (el sitio vive en la raiz del repo):

```
/                 -> archivos .html (index.html, mundos.html, ...)
/css              -> hojas de estilo
/js               -> modulos JavaScript propios
/js/vendor        -> librerias de terceros vendorizadas (`<lib>@<version>/`)
/assets/img       -> imagenes (locales, rutas relativas)
/assets/fonts     -> tipografias self-hosted (solo si no alcanza con Google Fonts)
```

**Nombres**: minuscula, sin espacios, sin acentos, `kebab-case`
(`gargantua.html`, `campo-estrellas.js`, `hero-viaje.css`). Descriptivos por
responsabilidad, nunca genericos (`quiz.js`, no `script2.js`).

**CSS**: **cuatro hojas globales de responsabilidad unica**, cargadas como `<link
rel="stylesheet">` independientes en el `<head>` de cada pagina, SIEMPRE en este orden y
sin `@import`:

1. `css/reset.css` — reset y normalizacion entre navegadores. Selectores `:where()` para
   mantener especificidad 0, de modo que cualquier hoja posterior lo sobreescriba sin
   `!important`. Unica excepcion: el bloque `@media (prefers-reduced-motion: reduce)`, que
   PUEDE exceder especificidad y usar `!important`. NO impone decisiones de diseno.
2. `css/variables.css` — todos los tokens en `:root` (paleta, tipografia, foco, etc.).
   Toda la paleta y todo valor reutilizable van aca; nada hardcodeado suelto.
3. `css/base.css` — estilos base de elementos (tipografia de lectura, enlaces, listas) y el
   espaciado vertical del contenido.
4. `css/layout.css` — layout del sitio y componentes compartidos (header/nav/drawer, Hero,
   footer, foco, secciones de eje, galeria, fichas).

Cuando una pagina pesada lo justifique, se suma un CSS propio (`css/viaje.css`,
`css/minijuegos.css`) cargado **despues** de las cuatro. Layout con Grid/Flexbox; responsive
con media queries. **Sin framework CSS ni preprocesador** (Principio I): las cuatro hojas se
escriben a mano.

**JavaScript**: **ES Modules** (`<script type="module">`, `import`/`export`), un modulo por
responsabilidad, cargado solo en la pagina que lo usa. Sin variables globales. El header
(con el menu) y el footer se mantienen en un unico partial **inyectado por un modulo JS
compartido** en cada pagina. Las **librerias de terceros** (Principio I) viven vendorizadas
en `js/vendor/<lib>@<version>/` y se importan por ruta relativa desde los modulos propios
que las usan; se cargan solo en la(s) pagina(s) que las necesitan. Sin paso de build.

**Diseno**: paleta de negros y azules profundos para el espacio, ocres y dorados para la
Tierra, el naranja de Gargantua como unico acento saturado. Blancos rotos / crema para
texto; nada de blancos puros. Backdrops oscurecidos (`filter: brightness(...)`) para
legibilidad. Tipografia via Google Fonts (`<link>`). Efectos ambientales sutiles, sin
recargar.

**Assets**: imagenes locales, referenciadas con rutas relativas, optimizadas a WebP y a
resoluciones razonables a mano. **Acreditar la fuente de cada imagen es OBLIGATORIO**
(NASA/ESA lo exigen; el resto queda prolijo).

**Baseline**: navegadores evergreen, ultimas 2 versiones. Sin polyfills.

**Hosting**: **GitHub Pages**, deploy estatico automatico via **GitHub Actions** en cada
push a la rama principal (`main`). El workflow vive en
`.github/workflows/deploy-pages.yml` y publica el contenido estatico de la raiz del repo
(`*.html`, `css/`, `js/`, `assets/`); un archivo `.nojekyll` en la raiz desactiva el
procesado Jekyll. Sin paso de build, sin configuracion extra: el workflow publica los
archivos tal cual, incluido `js/vendor/`.

El sitio se sirve bajo el subpath **`https://sergiotsk.github.io/Interstellar/`**. Por eso
**toda ruta interna DEBE ser relativa** (`css/global.css`, `mundos.html#gargantua`), nunca
absoluta con `/` inicial: una ruta absoluta apunta a la raiz del dominio y se rompe en
produccion. Esto refuerza el criterio de aceptacion "links y assets cargan" (rutas
relativas bien resueltas).

**Backend**: ninguno en esta etapa. Puntajes de minijuegos en `localStorage`. Si en el
futuro se implementan rankings globales persistentes, la plataforma elegida es **Firebase
(Firestore)** — y recien ahi se abre una spec para eso.

**Fuera de alcance** (no hacer, es sobreingenieria para este TP): PWA, service workers, SEO
avanzado, optimizacion extrema, i18n, ARIA avanzado, consumo de API en vivo.

## Flujo de Trabajo y Puertas de Calidad

**Specs colgadas de la constitucion**: las piezas complejas se documentan en su propia
especificacion, referenciada desde aca pero NO detallada aca:

- **Animacion del viaje de la Endurance** — escena por escena
  (Tierra -> agujero de gusano -> Miller -> Mann -> Gargantua -> Tesseract), con el efecto
  concreto de cada escena (CSS vs Canvas 2D).
- **Cada minijuego** — reglas, estados, condicion de victoria, scoring.

Una spec colgada NO puede contradecir esta constitucion. Si necesita hacerlo, primero se
enmienda la constitucion.

**Submenus de los ejes** (Mundos, Personajes, Ciencia, Viaje): por defecto **anclas** dentro
de una misma pagina (`mundos.html#gargantua`). Se pasa a **archivo separado**
(`mundos/gargantua.html` o equivalente) solo cuando la spec del eje lo justifique por
volumen de contenido. El umbral se define en esa spec, no se improvisa.

**Criterios de aceptacion — definicion de "terminado" por pagina**:

- Es **responsive**: se ve y funciona bien en mobile y en desktop.
- El **HTML es valido y semantico** (elementos correctos, sin `div` donde va un elemento
  semantico).
- **No hay errores en la consola** del navegador.
- **Links y assets cargan** correctamente (rutas relativas bien resueltas).
- Las **hojas de estilo cargan en el orden definido** (§ CSS): `reset -> variables -> base
  -> layout`, y el CSS propio de la pagina despues.
- Si la pagina incorpora una **libreria de terceros** (Principio I): esta **justificada en
  su spec** (problema que resuelve, peso en KB gzip, paginas donde carga) y **vendorizada**
  en `js/vendor/` — o, si queda como ESM pinneado desde CDN, la spec explica por que. Sin
  paso de build.
- Respeta la **paleta y la tipografia** definidas (via variables CSS).
- Los textos de ciencia estan **verificados contra fuente** y **etiquetados** (Principio VI).
- Para modulos de logica JS involucrados: sus **tests estan en verde** (Principio V).

**Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, ...).
Sin atribucion a IA ni `Co-Authored-By`.

**Revision**: antes de dar una pieza por terminada se verifica contra los criterios de
aceptacion y contra los seis principios. La complejidad que no se pueda justificar se
elimina.

## Governance

Esta constitucion **prevalece** sobre cualquier otra practica, convencion por defecto del
agente o preferencia de estilo. Ante conflicto entre esta constitucion y una instruccion
ambigua, gana la constitucion.

**Enmiendas**: se hacen editando este archivo, con justificacion escrita, incremento de
version y actualizacion de fechas. Toda enmienda que afecte principios se refleja tambien
en las specs colgadas si corresponde.

**Versionado semantico de la constitucion**:

- **MAJOR**: se quita o redefine incompatiblemente un principio o una regla de governance.
- **MINOR**: se agrega un principio o una seccion, o se amplia materialmente una guia.
- **PATCH**: aclaraciones, correcciones de redaccion, ajustes no semanticos.

**Cumplimiento**: cada entrega (pagina, efecto, minijuego, spec) se revisa contra los
criterios de aceptacion y los principios antes de considerarse cerrada. El agente reporta
desvios de forma explicita en vez de resolverlos por su cuenta.

**Version**: 2.0.0 | **Ratified**: 2026-08-27 | **Last Amended**: 2026-09-03
