# Research: Rediseño visual de Personajes

No quedaron `NEEDS CLARIFICATION` en el Technical Context del plan — el proyecto es un sitio
estático vanilla con patrones ya establecidos (GSAP vendorizado, riel+sticky+scrub, módulo por
página) que esta feature reutiliza en vez de decidir desde cero. Este documento fija el
**porqué** de cada decisión de diseño técnico, para que quede trazable en `/speckit-tasks`.

## 1. Hero full-bleed: reutilizar `.mundo-portada-escena`, no crear un patrón nuevo

- **Decision**: el hero de cada ficha usa el mismo mecanismo CSS que
  `.mundo-portada-escena` (`css/mundos.css`): `position: relative`, `min-height` cercano a
  pantalla completa, imagen de fondo absoluta + scrim con `linear-gradient`, contenido apoyado
  abajo con `align-items: flex-end`.
- **Rationale**: ya está resuelto, probado en 5 páginas de Mundos, y valida directamente FR-001
  (reutilizar el mecanismo, no inventar uno). Cero JS: es puro CSS, no depende de ningún
  degradado.
- **Alternatives considered**: hero partido en 2 columnas (imagen recortada + ficha con bezel),
  que era el patrón anterior a esta ronda de spikes — descartado explícitamente por el usuario
  tras comparar ambos en vivo (ver Clarifications de spec.md).

## 2. Galería de escenas: riel + sticky + scrub, mismo mecanismo que `js/mundo-portada.js`

- **Decision**: un `ScrollTrigger` por ficha con `scrub`, que mueve la tira de fotogramas en
  `x` y, en el `onUpdate`, alterna la clase `.activa` entre los bloques de texto y los
  fotogramas según el `progress` — corte duro, sin crossfade.
- **Rationale**: mecanismo ya validado en el spike (`spikes/personajes-galeria-vertical.html`)
  y en producción en 5 páginas de Mundos; reutilizar reduce superficie de bugs y mantiene el
  sitio consistente (Principio IV: todo el código debe poder explicarse, y este patrón ya está
  documentado y entendido).
- **Alternatives considered**: CSS puro con `scroll-snap` sin JS (más simple, pero pierde la
  sincronización dura texto↔fotograma que pide la Historia 2); IntersectionObserver por
  fotograma en vez de scrub (más JS, sin ninguna ventaja sobre el patrón ya vendorizado).

## 3. Visor Nav-Ranger: ciclador propio, no reutilizar `js/filmstrip.js`

- **Decision**: módulo nuevo y chico dentro de `js/personajes.js` — `setInterval` que
  intercambia la clase `.is-activo` entre `<img>` superpuestas (`opacity`), con un
  `IntersectionObserver` que pausa/reanuda el intervalo según visibilidad. Sin GSAP: no hay
  scroll-link, es un ciclado a tiempo fijo.
- **Rationale**: `js/filmstrip.js` resuelve un problema distinto (tira que se desliza
  continuamente en loop horizontal, con desaceleración a hover) — forzar ese mecanismo a un
  "reemplazo in-situ de fotograma" sería más complejo que escribir el ciclador nuevo, y
  mezclaría dos estéticas (celuloide vs. instrumento) en un mismo componente. Ya se validó en
  los tres spikes de esta ronda.
- **Alternatives considered**: reusar `js/filmstrip.js` con la tira comprimida a un solo
  fotograma de ancho (visualmente forzado, descartado); usar un `<video>` con clips cortos en
  vez de fotogramas sueltos (agrega peso y una dependencia de codec/formato nueva sin necesidad,
  cuando el efecto buscado es "stop-motion", no reproducción fluida).

## 4. Intervalo del ciclador: 450ms como default configurable, no un valor fijo en CSS

- **Decision**: el intervalo vive en un atributo `data-intervalo` (milisegundos) en el HTML de
  cada visor, con un fallback en JS si falta el atributo. Valor de referencia: 450ms.
- **Rationale**: permite afinar la velocidad por personaje/tramo sin tocar JS (ej. una escena de
  acción puede pedir un intervalo más corto que una escena contemplativa), y quedó validado como
  patrón de ajuste manual durante los spikes.
- **Alternatives considered**: valor fijo hardcodeado en JS (menos flexible); CSS
  `animation-duration` con `steps()` (técnicamente posible, pero mezclar la lógica de pausa por
  `IntersectionObserver` con una animación CSS pura complica el control de estado más que
  `setInterval`).

## 5. Curación de fotogramas: convención de nombre y no-versionado del volcado

- **Decision**: fotogramas curados se optimizan y versionan en `assets/img/` con el patrón
  `personajes-<id>-escena-NN.jpg` (galería) y `personajes-<id>-visor-NN.jpg` (visor), `NN` de
  dos dígitos por orden de aparición. El volcado completo
  (`assets/cap-that.com_interstellar(2014)/`) permanece gitignoreado sin excepción (FR-010).
- **Rationale**: mismo criterio de nombre `kebab-case` descriptivo por responsabilidad que ya
  exige la constitución, y evita ambigüedad entre "still de respaldo" (`personajes-cooper.jpg`),
  "fotograma de galería" y "fotograma de visor" cuando un mismo personaje termine teniendo los
  tres tipos.
- **Alternatives considered**: reusar los nombres descriptivos ya existentes
  (`personajes-cooper-casco.jpg`) para los fotogramas nuevos también — descartado porque no
  escala: un tramo de 4-6 frames consecutivos no tiene, en general, un nombre descriptivo único
  por frame, y el sufijo `-NN` dice de una el orden dentro del tramo.

## 6b. Portada de tripulación: portar `.galeria-grid` a `css/personajes.css`, no crear una grilla nueva

- **Decision** (corregido tras el merge de `main`, que trajo el split de CSS en hojas por
  página — feature 006): `.galeria-grid` vive en `css/galeria.css` (hoja específica de
  `galeria.html`), no en un `css/global.css` compartido (ese archivo ya no existe). Siguiendo
  el mismo criterio que ya documenta `css/personajes.css` en su propia cabecera ("Cut-paste
  textual, sin cambio de valor" — así se portó `.ficha-personaje` desde `layout.css`), el
  patrón `<ul class="galeria-grid"><li><figure><a>` se **copia textual** a
  `css/personajes.css`, no se cross-linkea `css/galeria.css` desde `personajes.html`.
- **Rationale**: mismo criterio que el resto del plan — reutilizar el patrón visual antes que
  inventar uno, pero respetando la convención de hojas por página ya establecida (contrato 006
  C5: cada página enlaza solo su propia hoja de 5º nivel). Cross-linkear la hoja de otra
  página acoplaría Personajes a cambios futuros de Galería sin necesidad.
- **Alternatives considered**: `<link>` a `css/galeria.css` desde `personajes.html` —
  descartado, rompe la convención de aislamiento por página ya vigente en el sitio. CSS Grid
  nuevo a medida — descartado, mismo motivo que antes (duplicaría sin necesidad lo que ya
  existe).

## 6. Módulo JS: `js/personajes.js` nuevo, no ampliar `js/mundo-portada.js`

- **Decision**: toda la lógica de esta feature (armar el riel de galería + el ciclador del
  visor) vive en un módulo nuevo `js/personajes.js`, cargado solo desde `personajes.html`.
- **Rationale**: la constitución exige "un módulo por responsabilidad, cargado solo en la
  página que lo usa" y "sin variables globales" — ampliar `mundo-portada.js` acoplaría dos
  páginas independientes a un mismo archivo y arriesgaría romper Mundos al tocar Personajes.
- **Alternatives considered**: importar y reusar funciones exportadas de `mundo-portada.js`
  (ej. una función genérica "armar riel scrub") — se descarta para esta iteración por alcance:
  el mecanismo se COPIA con la misma forma (mismo criterio que ya se usó al portar el patrón
  entre specs anteriores — ver `filmstrip-mundos-tierra` y páginas de Mundos, cada una con su
  propio script), no se abstrae a una librería compartida todavía. Si en el futuro un tercer
  lugar del sitio necesita el mismo riel, ahí se justifica extraer un helper común — no antes
  (evita abstracción prematura).
