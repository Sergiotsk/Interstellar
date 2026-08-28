# Proyecto Web Interstellar — Documento Base

## Contexto

Trabajo práctico para **Programación IV**. La consigna es hacer una web temática sobre una serie o película favorita. Obra elegida: **Interstellar** (película, dir. Christopher Nolan), seleccionada por su altísima identidad visual (agujero negro Gargantúa, la nave Endurance, los planetas, el maizal), la calidad de imagen impecable, y la riqueza conceptual que aporta la ciencia real detrás de la película.

### Restricción técnica de la cátedra

El profesor pidió explícitamente usar **herramientas básicas: HTML semántico, CSS y JavaScript vanilla** (sin frameworks). El uso de **IA y agentes de programación está permitido y alentado** — el objetivo pedagógico es evaluar qué tan efectivamente el alumno dirige la IA para construir sobre fundamentos, no el uso de un framework que abstraiga el trabajo. Por eso:

- Todo el desarrollo se hace con las tres tecnologías base, sin Astro, React, Preact, Tailwind ni TypeScript.
- El trabajo con IA/agentes es parte central de la metodología, y debe poder explicarse y entenderse cada pieza generada.
- El **spec-constitution** (documento derivado de este) es la herramienta central para dirigir al agente de forma efectiva.

## Naturaleza del proyecto

Web de **contenido estático y fijo** (no hay buscador ni consumo de API en vivo). Todo el material —imágenes, textos— se define de antemano. El foco está puesto en el **diseño, el impacto visual y la interactividad**, demostrando dominio de los fundamentos web.

## Estructura del sitio

Al ser una película (una sola historia, sin temporadas/capítulos), la estructura se construye sobre **cuatro ejes propios** que reemplazan al eje "temporadas → capítulos" de una serie, dando la misma solidez de navegación multinivel.

Se implementa como **múltiples archivos HTML** (una página por sección), enfoque clásico, semántico y alineado con lo que pide la cátedra. El header (con el menú) y el footer se replican en cada página; para evitar mantenerlos a mano se pueden inyectar con un fragmento de JavaScript vanilla compartido.

**Los cuatro ejes:**

- **Eje 1 — Mundos**: cada escenario de la película funciona como una "temporada" con su propia página, galería y clima visual (la Tierra, Gargantúa, planeta de Miller, planeta de Mann, el Tesseract).
- **Eje 2 — Personajes**: Cooper, Murph, Dr. Brand, el profesor, Mann, TARS & CASE.
- **Eje 3 — La Ciencia**: la física real detrás de la película (asesorada por Kip Thorne). Aporta profundidad temática y original que una serie de entretenimiento no tendría.
- **Eje 4 — El Viaje**: timeline del recorrido de la misión Endurance (equivalente a los "capítulos").

**Menú / mapa de archivos propuesto:**

```
index.html            → Inicio (hero)
mundos.html           → Mundos (con anclas o subpáginas)
  ├─ La Tierra
  ├─ Gargantúa
  ├─ Planeta de Miller
  ├─ Planeta de Mann
  └─ El Tesseract
personajes.html       → Personajes
  ├─ Cooper
  ├─ Murph
  ├─ Dr. Brand
  ├─ TARS & CASE
  └─ ...
ciencia.html          → La Ciencia
  ├─ Agujeros negros
  ├─ Dilatación temporal
  ├─ Agujeros de gusano
  └─ Relatividad
viaje.html            → El Viaje (timeline)
galeria.html          → Galería
minijuegos.html       → Minijuegos
  ├─ Quiz espacial
  ├─ Acoplamiento (docking)
  └─ ...
trailer.html          → Trailer (o embebido en index)
```

> Nota: los submenús pueden resolverse como **anclas dentro de una misma página** (ej. `mundos.html#gargantua`) o como **archivos separados**, según cuánto contenido tenga cada uno. Para arrancar, anclas dentro de la página es más simple.

## Capa educativa: la ciencia en el recorrido

Diferencial central del proyecto: el recorrido por la web y por la película **explica los conceptos teóricos reales** (física, relatividad, astronomía, etc.) en los que se basaron los escenarios, el guion y los efectos visuales. El concepto teórico aparece **en contexto**, atado a cada escena, no como un bloque de teoría aparte. Esto fusiona el eje "El Viaje" con el eje "La Ciencia": el viaje ES el recorrido por los conceptos.

### Tres niveles de rigor (etiquetar cada concepto)

Para demostrar criterio y no sobrevender la ciencia, cada concepto se clasifica con una etiqueta visible. Interstellar mezcla tres niveles:

- **✓ Ciencia real** — fielmente representada. Ej.: la visualización de Gargantúa se generó con ecuaciones reales de la relatividad general (trabajo de Kip Thorne + Double Negative, que derivó en papers científicos con revisión por pares). La dilatación temporal gravitacional es física real.
- **~ Especulación plausible** — permitida por la física en teoría, pero hipotética. Ej.: atravesar un agujero de gusano; que Gargantúa tenga planetas habitables orbitando tan cerca.
- **✎ Licencia narrativa** — forzado por el guion, cuestionado por la física real. Ej.: el Tesseract y la comunicación a través del tiempo por gravedad.

> Distinguir estos niveles uno mismo (en vez de presentar todo como "ciencia real") es un diferencial de madurez intelectual y blinda el trabajo ante un profesor que sepa del tema.

### Mapeo concepto por escena

- **La Tierra** → el *blight* (plaga de cultivos), sostenibilidad, el colapso de la agricultura. Ciencia más biológica/ambiental. También física de drones y estaciones espaciales.
- **El agujero de gusano** → qué es un wormhole, el puente de Einstein-Rosen, por qué sería un atajo en el espacio-tiempo. `~ Especulativo`
- **Planeta de Miller** → la joya: **dilatación temporal gravitacional**. Por qué una hora ahí equivale a 7 años en la Tierra (cercanía a Gargantúa). Relatividad general pura. `✓ Real`
- **Planeta de Mann** → habitabilidad planetaria y el factor humano. Qué hace habitable a un planeta.
- **Gargantúa** → **agujeros negros**: horizonte de eventos, disco de acreción, lente gravitacional, singularidad. El corazón científico. `✓ Real`
- **El Tesseract** → dimensiones superiores, el tiempo como dimensión física navegable. `✎ Licencia narrativa`

### Formato sugerido (dos capas de lectura por escena)

- **La escena**: lo visual y narrativo de la película.
- **La ciencia detrás**: panel / acordeón / sección desplegable con el concepto explicado y su etiqueta de rigor.

> Importante: los textos científicos deben verificarse con fuentes reales antes de redactarse (ver Bibliografía). No afirmar datos de memoria — la fuente principal es el libro de Kip Thorne.

## Stack técnico

**Base**

- **HTML5 semántico** — uso correcto de `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`, etc. La semántica es un criterio explícito de la cátedra.
- **CSS puro** — sin frameworks. Uso de **variables CSS** (custom properties) para la paleta y valores reutilizables. Flexbox y Grid para el layout. Media queries para responsive.
- **JavaScript vanilla (ES6+)** — para interactividad, efectos, minijuegos e inyección de header/footer compartido.

**Efectos visuales y ambientales**

- **CSS puro** — efectos livianos sin JS: grano de película, viñeta, campos de estrellas con gradientes, micro-interacciones, hover, animaciones con `@keyframes`.
- **Canvas 2D** (API nativa del navegador) — efectos con movimiento: polvo cósmico, campo de estrellas animado, el disco de acreción de Gargantúa girando, y minijuegos con movimiento.
- **Intersection Observer API** (nativa) — animaciones de entrada al hacer scroll y motor del viaje de la Endurance (ver sección "Pieza central: animación del viaje").

**Minijuegos temáticos** (JavaScript vanilla)

- Quiz espacial: sobre la película o sobre astrofísica (arranque, manejo de estado simple con JS).
- Acoplamiento / docking: recreación simple de la maniobra de acople (Canvas 2D).
- Navegación entre planetas o mecánica de dilatación temporal (ambicioso, opcional, muy temático).

**Deploy**

- **Vercel o Netlify** — hosting estático con deploy automático desde GitHub en cada push. Sirve igual para HTML/CSS/JS estático, sin configuración especial.

**Backend (futuro, condicional)**

- Solo si se quieren **rankings globales persistentes** para los minijuegos.
- Opciones: **Firebase** (Firestore, NoSQL, más fácil) o **Supabase** (SQL, más alineado con lo estudiado en la carrera).
- Mientras tanto: `localStorage` (API nativa) para puntajes locales, sin backend.

## Metodología de trabajo con IA

- El desarrollo se dirige mediante **IA / agentes de programación** (Claude, Claude Code, Cursor, etc.), práctica habilitada por la cátedra.
- El **spec-constitution** derivado de este documento es la fuente de reglas y contexto para el agente: define convenciones, estructura de carpetas, qué está permitido y qué no, y criterios de aceptación.
- Principio clave: **entender cada pieza generada.** El código asistido por IA debe poder explicarse y defenderse, ya que la cátedra evalúa la efectividad en el uso de estas herramientas, no la copia ciega.

## Pieza central: animación del viaje de la Endurance

La pieza más ambiciosa y distintiva del proyecto: una **animación full del viaje de la nave por el universo**, pasando por cada mundo en el orden narrativo de la película. Sería el corazón visual del sitio.

**Recorrido narrativo (orden fiel a la película):**

```
Tierra → agujero de gusano → Planeta de Miller → Planeta de Mann → Gargantúa → Tesseract
```

**Enfoque técnico: combinación A + B** (elegido por su mejor relación impacto/riesgo, sin salir de vanilla)

- **Capa A — esqueleto con scroll (CSS + Intersection Observer)**: las escenas apiladas verticalmente, cada una a pantalla completa. El **scroll es el motor del viaje** (*scroll-driven animation*): a medida que el usuario baja, la nave avanza y va llegando a cada destino. Intersection Observer detecta en qué escena se está y dispara las transiciones (fade, zoom, empuje). Usa los backdrops de TMDB más el texto de cada mundo.
- **Capa B — momentos vivos (Canvas 2D)**: solo para lo que necesita movimiento real, encima o de fondo de la escena correspondiente:
  - Campo de estrellas con sensación de velocidad (el "viajar" entre mundos)
  - El disco de acreción de Gargantúa girando
  - El túnel del agujero de gusano
  - La distorsión temporal en el planeta de Miller (efecto de ondas)

No todo es Canvas: **solo los momentos estrella**. El resto lo resuelve CSS (más liviano y mantenible). Cada escena decide si necesita capa de Canvas o le alcanza con CSS.

**Principio de diseño clave — modularidad**: cada escena es **independiente y modular** (escena Tierra, escena Wormhole, escena Miller, etc.), cada una con su propio bloque y su propia lógica. Permite construir y testear una por una sin romper el conjunto, y facilita dirigir a la IA escena por escena en lugar de "toda la animación de una".

**Construcción por capas sugerida:**

1. Estructura narrativa: las 5-6 escenas apiladas, scrolleables de la Tierra al Tesseract, sin animación todavía.
2. Transiciones entre escenas (CSS + Intersection Observer).
3. La nave: elemento (PNG de la Endurance) que se reposiciona según la escena.
4. Capa de partículas/estrellas de fondo (Canvas 2D) con sensación de velocidad.
5. Momentos estrella: Gargantúa girando, túnel del wormhole, distorsión en Miller.
6. Sonido opcional: música de fondo con control de mute (el autoplay de audio suele estar bloqueado por el navegador).

**Descartado:** WebGL / Three.js para un viaje 3D real. Aunque sería de máximo impacto, Three.js es una librería/framework y quedaría fuera de la consigna vanilla (salvo habilitación explícita de la cátedra).

**Advertencia de planificación:** es la pieza más ambiciosa del proyecto. Debe encararse como un **sub-proyecto aparte**, recién cuando la web base (páginas, contenido, responsive) esté sólida. Merece su **propia especificación detallada** dentro del spec-constitution, con el detalle escena por escena de qué efecto lleva cada una — ese nivel de detalle es lo que permite que la IA genere lo imaginado y no cualquier cosa.

## Fuentes de material gráfico

- **TMDB** — backdrops (hero), pósters, stills. Descarga en resolución `original` para el hero.
- **Fanart.tv** — logo transparente de la película, backdrops limpios, banners.
- **Wikimedia Commons** — material de licencia libre.
- **Trailers** — embed de YouTube vía iframe.

Las imágenes se guardan localmente en el proyecto (ej. carpeta `assets/img/`) y se referencian con rutas relativas. Conviene optimizarlas a WebP y a resoluciones razonables a mano o con alguna herramienta, ya que sin framework no hay optimización automática en build.

## Lineamientos de diseño

- **Paleta**: negros y azules profundos para el espacio, ocres y dorados terrosos para las escenas en la Tierra, el naranja de Gargantúa como acento icónico. Blancos rotos / crema para texto. Nada de blancos puros ni colores saturados fuera del naranja del agujero negro. Definir todo como variables CSS.
- **Tipografía**: cargar con Google Fonts vía `<link>`. Una tipo limpia y futurista, o con presencia cinematográfica.
- **Contraste**: al ser una estética mayormente oscura, oscurecer los backdrops (ej. `filter: brightness(0.4)`) para garantizar legibilidad del texto encima.
- **Responsive**: debe verse bien en celular y desktop (criterio muy valorado por el profesor). Media queries + layout con Grid/Flexbox.
- **Atmósfera cinematográfica**: efectos ambientales sutiles (polvo, estrellas, el disco de Gargantúa) que refuercen el clima de la película sin recargar.

## Principios de construcción

- **Construir en capas**: primero la web funcional y linda solo con estructura HTML semántica + CSS + tipografía + responsive. Recién con esa base sólida, sumar los efectos ambientales de a uno. Los minijuegos van al final, como coronación.
- **No sobrecargar el arranque** metiendo efectos y juegos sobre una web a medio hacer.
- **Sin frameworks**: aprovechar al máximo las APIs nativas del navegador (Canvas, Intersection Observer, localStorage) en lugar de librerías.
- **Código entendible**: mantener el HTML semántico, el CSS ordenado (con variables y secciones claras) y el JS modular en archivos separados por responsabilidad.

## Convenciones técnicas

Definiciones prácticas para que el agente de IA no improvise su propia estructura a mitad de camino.

### Estructura de carpetas

```
/                     → archivos .html (index.html, mundos.html, etc.)
/css                  → hojas de estilo
/js                   → scripts
/assets/img           → imágenes
/assets/fonts         → tipografías (si no se usan solo desde Google Fonts)
```

### Convención de nombres

- Archivos y carpetas en **minúscula, sin espacios, sin acentos**: `gargantua.html` (no `Gargantúa.html`), `dilatacion-temporal.js`.
- Separar palabras con guion medio (`kebab-case`): `campo-estrellas.js`, `hero-viaje.css`.
- Nombres descriptivos por responsabilidad, no genéricos (`quiz.js`, no `script2.js`).

### Estrategia de CSS

- **Un CSS global de base** (`css/global.css`): variables (paleta, tipografía, espaciados), reset, estilos de `header`/`footer`/`nav`, utilidades comunes.
- **Un CSS específico por página pesada** cuando haga falta (ej. `css/viaje.css` para la animación del viaje, `css/minijuegos.css`). Las páginas simples usan solo el global.
- Toda la paleta y valores reutilizables van como **variables CSS** (`:root { --color-gargantua: #e8a13a; ... }`), nunca hardcodeados sueltos.

### JavaScript

- **Modular por responsabilidad**: un archivo por pieza (`js/menu.js` para el header/footer compartido, `js/scroll-viaje.js`, `js/quiz.js`, etc.).
- Cargar cada script solo en la página que lo necesita.
- ES6+ (const/let, arrow functions, módulos si conviene). Sin librerías externas.

### Criterios de aceptación (definición de "terminado" por página)

Una página se considera completa cuando:

- Es **responsive**: se ve y funciona bien en mobile y en desktop.
- El **HTML es válido y semántico** (etiquetas correctas, sin `div` innecesarios donde va un elemento semántico).
- **No hay errores en la consola** del navegador.
- Los **links y assets cargan** correctamente (rutas relativas bien resueltas).
- Respeta la **paleta y tipografía** definidas (vía variables CSS).

### Alcance acotado (lo que NO se hace en esta etapa)

Para no caer en sobreingeniería: sin PWA, sin SEO avanzado, sin testing automatizado, sin optimización extrema ni accesibilidad avanzada (la básica ya la da el HTML semántico). Foco en una web vistosa, semántica y responsive.

### Specs separadas (no van en la constitución)

Las piezas complejas se documentan en **su propia especificación**, colgada de la constitución, no dentro de ella:

- Animación del viaje de la Endurance (escena por escena).
- Cada minijuego (reglas, estados, condición de victoria).

## Decisiones descartadas (y por qué)

- **Astro, React, Preact, Tailwind, TypeScript** — descartados: la cátedra pide HTML/CSS/JS vanilla. Todo el stack se reconstruye sobre las tres tecnologías base y APIs nativas del navegador.
- **Consumo de API de TMDB en vivo** — descartado: el contenido es fijo. Las imágenes van locales y se referencian con rutas relativas.
- **HTML-in-Canvas API** — descartada: es experimental (solo Origin Trial en Chrome con flag), resuelve un problema de UIs 3D que este proyecto no tiene.
- **Peaky Blinders / El Señor de los Anillos / Breaking Bad** — descartadas como temática frente a Interstellar por decisión de diseño (se priorizó el atractivo visual espacial y el ángulo de ciencia real).

## Recursos visuales (links)

**Criterio de uso:** priorizar siempre el material de **mayor calidad y mayor impacto visual**, sin trabarse por el copyright (es un proyecto académico y el uso educativo lo cubre). Buena práctica: **acreditar la fuente** de cada imagen (queda prolijo y profesional ante la cátedra), sobre todo el material de NASA/ESA que lo pide explícitamente.

### Material de la película (stills, personajes, mundos concretos)

- **TMDB — Interstellar**: https://www.themoviedb.org/movie/157336-interstellar (ruta `/movie/` por ser película). Backdrops, pósters, stills.
- **Fanart.tv — Interstellar**: https://fanart.tv/movie/157336/interstellar/ (logo transparente, backdrops limpios, banners).
- **Wikimedia Commons**: https://commons.wikimedia.org/ (buscar "Interstellar", licencia libre).
- **Alpha Coders**: https://alphacoders.com/interstellar — de lo más alto en resolución (hasta 7500×5200 y 8K).
- **WallpaperFlare**: https://www.wallpaperflare.com/search?wallpaper=interstellar — film stills de Gargantúa, la Endurance, el disco de acreción; filtrables por resolución.
- **Wallpaper Cave**: https://wallpapercave.com/interstellar-wallpapers — Endurance, reloj, Cooper, Murph, planeta del agua.
- **Wallpapers.com**: https://wallpapers.com/interstellar — colección amplia, sin registro.
- **WallpaperCat**: https://wallpapercat.com/interstellar-wallpapers — 4K y Full HD, categorizado por elemento (black hole, astronauts, Endurance, clock).

### Material espacial real — dominio público (fondos del viaje, ambientes, sección de ciencia)

Ideal para los fondos ambientales entre mundos, las transiciones del viaje y la sección "La Ciencia". Es legal, gratuito y de altísima calidad. La NASA liberó su fotografía espacial al dominio público (salvo sus logos, que sí están protegidos); el material de Hubble es libre de copyright con la condición de acreditar a NASA y ESA.

- **NASA Image Library**: https://images.nasa.gov/ — archivo oficial. Nebulosas, galaxias, planetas, la Tierra, naves, todo real y de dominio público.
- **ESA/Hubble**: https://esahubble.org/images/ — imágenes del telescopio Hubble (nebulosas espectaculares para fondos). Acreditar "NASA & ESA".
- **Unsplash**: https://unsplash.com/s/photos/nebula — buscar "nebula", "space", "black hole", "galaxy". Cientos de imágenes en 4K, licencia libre sin atribución obligatoria.
- **Rawpixel — NASA**: https://www.rawpixel.com/board/418580/nasa-space-photography-free-public-domain-images — material NASA digitalmente mejorado en alta resolución, dominio público.

### Render científico real de Gargantúa

- **Paper arXiv 1502.03808**: https://arxiv.org/abs/1502.03808 — las figuras del PDF son el render de Gargantúa hecho con física real (código DNGR). Útil para la sección "La Ciencia", junto al still de la película, mostrando la imagen científicamente precisa.

### Trailers / video

- **Trailers**: buscar "Interstellar official trailer" en YouTube y usar el ID del video en el iframe del embed.


## Bibliografía y fuentes científicas

Fuentes reales para redactar la capa educativa con rigor (verificadas):

**Fuente principal (libro)**

- Thorne, Kip. *The Science of Interstellar*. W. W. Norton & Company, 7 de noviembre de 2014. ISBN 978-0393351378. Prólogo de Christopher Nolan. Es LA fuente: Thorne fue el asesor científico y productor ejecutivo de la película; el libro cubre agujeros de gusano, agujeros negros, viaje interestelar y la dilatación temporal, capítulo por capítulo.

**Papers científicos con revisión por pares (derivados de la película)**

- James, O., von Tunzelmann, E., Franklin, P. & Thorne, K. S. "Gravitational lensing by spinning black holes in astrophysics, and in the movie Interstellar." *Classical and Quantum Gravity*, vol. 32, n.º 6, 065001 (13 de febrero de 2015). DOI: 10.1088/0264-9381/32/6/065001. Preprint abierto en arXiv: 1502.03808. Describe el código DNGR (Double Negative Gravitational Renderer) usado para renderizar Gargantúa con lente gravitacional real; derivó en hallazgos científicos nuevos sobre cáusticas.
- James, O., von Tunzelmann, E., Franklin, P. & Thorne, K. S. "Visualizing Interstellar's Wormhole." *American Journal of Physics*, vol. 83, pp. 486–499 (junio de 2015). Sobre la visualización del agujero de gusano.

**Nota de rigor:** al escribir los textos de cada concepto, contrastar contra estas fuentes y mantener la etiqueta de nivel (✓ Real / ~ Especulativo / ✎ Licencia narrativa). El libro de Thorne él mismo distingue qué es ciencia establecida, qué es especulación informada y qué es licencia del guion — conviene seguir ese mismo criterio.
