<!--
SYNC IMPACT REPORT
Version change: 1.0.0 -> 1.1.0
Rationale: Enmienda a la seccion "Restricciones Tecnicas y Convenciones". Se reemplaza el
hosting: Vercel -> GitHub Pages, con deploy via GitHub Actions en cada push a `main`. El
sitio pasa a servirse bajo el subpath `/Interstellar/`, por lo que se eleva a regla dura
la exigencia de rutas internas relativas. Ningun principio (I-VI) cambia; por eso el bump
es MINOR y no MAJOR.

Cambios de esta version:
  - "Restricciones Tecnicas y Convenciones" -> bloque **Hosting** reescrito (GitHub Pages).
  - Se agrega referencia a .github/workflows/deploy-pages.yml y al archivo .nojekyll.

Historial:
  - 1.0.0 (2026-08-27): Primera ratificacion. Principios I-VI y las tres secciones
    definidas a partir de proyecto-interstellar-base.md.

Follow-up / consistencia (fuera del alcance de este comando):
  - specs/001-shared-layout-hero/quickstart.md y research.md -> mencionan "Vercel" como
    ejemplo de hosting. Feature 001 ya cerrada; se corrige el texto por prolijidad.
  - .specify/templates/plan-template.md -> el "Constitution Check" no referencia hosting;
    no requiere cambios.

TODOs deferidos: ninguno.
-->

# Constitucion — Web Interstellar (Programacion IV)

Web tematica sobre la pelicula *Interstellar*. Contenido estatico y fijo. El foco es el
diseno, el impacto visual, la interactividad y la capa educativa de ciencia real. El
desarrollo se dirige con IA/agentes; esta constitucion es la fuente de reglas que el agente
DEBE respetar.

## Core Principles

### I. Stack Vanilla, Sin Frameworks

El sitio se construye unica y exclusivamente con **HTML5 semantico, CSS puro y JavaScript
ES6+**. Estan PROHIBIDOS los frameworks y librerias de terceros: sin React, Preact, Angular,
Astro, Tailwind, TypeScript, jQuery, ni ninguna dependencia de runtime. La interactividad,
los efectos y los minijuegos se resuelven con **APIs nativas del navegador** (Canvas 2D,
Intersection Observer, localStorage, Fetch, Web Audio).

No hay paso de build: sin bundler, sin transpilacion, sin minificacion automatizada, sin
autoprefixer. Los archivos que se escriben son los que se sirven. Unica dependencia externa
por red permitida: **Google Fonts via `<link>`** y **embeds de video via `<iframe>`**
(YouTube). Se asume JavaScript habilitado en el navegador; la degradacion sin-JS no es un
objetivo del proyecto.

**Razon**: la catedra evalua el dominio de los fundamentos web y la efectividad dirigiendo
IA, no el uso de abstracciones. Cada capacidad debe salir de la plataforma, no de una
libreria.

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
/js               -> modulos JavaScript
/assets/img       -> imagenes (locales, rutas relativas)
/assets/fonts     -> tipografias self-hosted (solo si no alcanza con Google Fonts)
```

**Nombres**: minuscula, sin espacios, sin acentos, `kebab-case`
(`gargantua.html`, `campo-estrellas.js`, `hero-viaje.css`). Descriptivos por
responsabilidad, nunca genericos (`quiz.js`, no `script2.js`).

**CSS**: un `css/global.css` de base (variables, reset, header/nav/footer, utilidades) +
un CSS especifico por pagina pesada cuando haga falta (`css/viaje.css`,
`css/minijuegos.css`). Toda la paleta y todo valor reutilizable van como **variables CSS**
en `:root`; nada hardcodeado suelto. Layout con Grid/Flexbox; responsive con media queries.

**JavaScript**: **ES Modules** (`<script type="module">`, `import`/`export`), un modulo por
responsabilidad, cargado solo en la pagina que lo usa. Sin variables globales. El header
(con el menu) y el footer se mantienen en un unico partial **inyectado por un modulo JS
compartido** en cada pagina.

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
procesado Jekyll. Sin paso de build, sin configuracion extra.

El sitio se sirve bajo el subpath **`https://sergiotsk.github.io/Interstellar/`**. Por eso
**toda ruta interna DEBE ser relativa** (`css/global.css`, `mundos.html#gargantua`), nunca
absoluta con `/` inicial: una ruta absoluta apunta a la raiz del dominio y se rompe en
produccion. Esto refuerza el criterio de aceptacion "links y assets cargan" (rutas
relativas bien resueltas).

**Backend**: ninguno en esta etapa. Puntajes de minijuegos en `localStorage`. Si en el
futuro se implementan rankings globales persistentes, la plataforma elegida es **Firebase
(Firestore)** — y recien ahi se abre una spec para eso.

**Fuera de alcance** (no hacer, es sobreingenieria para este TP): PWA, service workers, SEO
avanzado, optimizacion extrema, i18n, ARIA avanzado, consumo de API en vivo, WebGL/Three.js.

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

**Version**: 1.1.0 | **Ratified**: 2026-08-27 | **Last Amended**: 2026-08-29
