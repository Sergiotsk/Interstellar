# Feature Specification: Rediseño visual de Personajes — hero cinematográfico, galería de escenas y visor Nav-Ranger

**Feature Branch**: `sec/personajes`

**Created**: 2026-09-14

**Status**: Draft

**Input**: User description: "Rediseño visual de la sección Personajes (personajes.html), reemplazando el spec.md existente (que describía un enfoque de 'stickers' recortados sin fondo, ya descartado tras validar en spikes/ otra dirección): 1) HERO full-bleed por personaje (imagen de fondo ~92svh + scrim + ficha apoyada abajo, mismo mecanismo que `.mundo-portada-escena`). 2) Galería de escenas sin cambios respecto al patrón ya construido en el spike 'tira inferior stop motion' (panel de texto 30% arriba + tira de fotogramas 70% abajo, riel+sticky+scrub con GSAP/ScrollTrigger, corte duro sincronizado, degradado sin JS a flujo normal). 3) NUEVO — visor 'Nav-Ranger' al cierre de cada ficha, en fila junto al texto: piel de instrumentos del cockpit (no la estética de celuloide), ciclador de fotogramas en loop (~450ms, sin crossfade) que muestra 2-3 tramos CORTOS de escena real curados desde el volcado local `assets/cap-that.com_interstellar(2014)/` (11.713 frames, gitignoreado, nunca se versiona completo — solo los frames elegidos se optimizan a `assets/img/`). 4) Dependencia de contenido: solo Cooper y Murph tienen hoy material suficiente (4-5 stills); los otros 4 personajes (Brand, Profesor Brand, Mann, TARS/CASE) tienen 1-2 stills, insuficiente para galería+visor. 5) Las 6 fichas deben migrar al patrón nuevo, con degradado documentado para las que aún no tengan material curado."

## Clarifications

### Session 2026-09-14

- Q: ¿Esta spec reemplaza o convive con la spec.md anterior (enfoque de "stickers" recortados sin fondo)? → A: La reemplaza por completo. El enfoque de "stickers" (recorte con canal alfa vía remove.bg/rembg) se descarta tras validar tres prototipos (`spikes/personajes-*.html`) y confirmar visualmente el patrón hero + galería de escenas + visor Nav-Ranger como dirección definitiva. No queda ninguna referencia funcional al patrón de sticker en esta feature.
- Q: ¿Qué pasa con los 4 personajes (Brand, Profesor Brand, Mann, TARS/CASE) que hoy no tienen material suficiente para armar su galería de escenas ni su visor? → A: Mismo criterio de degradado que ya usaba el spec anterior para el sticker faltante — esa ficha puntual se queda en el patrón visual vigente hoy (contrato 003: retrato rectangular informativo + los 3 bloques de texto) hasta que se cure material suficiente. No bloquea el cierre de la feature para Cooper y Murph.
- Q: ¿De dónde salen los fotogramas del visor Nav-Ranger y cómo se decide cuáles? → A: Se curan a mano desde el volcado local `assets/cap-that.com_interstellar(2014)/` (11.713 frames numerados, gitignoreado — nunca se versiona completo). Cada visor muestra 2-3 tramos cortos (4-6 frames consecutivos cada uno) de escenas puntuales con foco en ese personaje, no imágenes sueltas sin relación entre sí. Los frames elegidos se optimizan y versionan en `assets/img/` con su fila correspondiente en `CREDITOS.md` (mismo criterio que toda imagen del sitio).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Portada de tripulación en mosaico (Priority: P1)

Un visitante que entra a `personajes.html` ve, antes de cualquier ficha individual, una
portada a pantalla casi completa con los 6 miembros de la tripulación presentados como un
mosaico de retratos — cada uno clickeable, salta directo a su ficha (`#cooper`, `#murph`, etc.).
Reemplaza a la intro actual, que hoy es solo un `<h1>Personajes</h1>` y un párrafo de texto
plano, sin ninguna referencia visual a quiénes son los 6.

**Why this priority**: Es la puerta de entrada a toda la sección — sin portada, el visitante
cae directo en la ficha de Cooper sin contexto de que hay 6 personajes. Además resuelve de
forma natural la jerarquía de encabezados: el `<h1>Personajes</h1>` vive acá, en la portada, y
cada ficha individual usa `<h2>` sin ambigüedad (ya era así en el contrato 003; esta portada lo
hace visualmente explícito en vez de ser un párrafo suelto).

**Independent Test**: Abrir `personajes.html` y verificar que la portada muestra los 6
retratos con nombre/rol, que cada uno es un enlace ancla funcional a su ficha, y que sigue
existiendo exactamente un `<h1>` en toda la página (el de esta portada).

**Acceptance Scenarios**:

1. **Given** `personajes.html` cargada, **When** el visitante llega a la portada, **Then** ve
   un mosaico con los 6 personajes (retrato + nombre + rol breve), a pantalla casi completa.
2. **Given** el mosaico, **When** el visitante hace clic o toca uno de los 6 retratos, **Then**
   navega directo a la ficha de ese personaje (`#<id>`).
3. **Given** un personaje con `patron: degradado` (sin hero/galería/visor propios, ver
   FR-009), **When** aparece en el mosaico, **Then** se ve igual de completo que los demás —
   el mosaico usa el retrato de respaldo ya existente (`assets/img/personajes-<id>.jpg`), que
   está disponible para los 6 sin excepción, así que el mosaico nunca depende de la curación de
   contenido pendiente (US5).
4. **Given** un ancho de viewport de 320px, **When** se ve el mosaico, **Then** los retratos se
   reacomodan en una grilla responsive sin generar scroll horizontal.

---

### User Story 2 - Hero cinematográfico por personaje (Priority: P1)

Un visitante que entra a la ficha de un personaje (ej. `personajes.html#cooper`) ve, antes que
nada, una imagen del personaje a pantalla casi completa — no un retrato chico flotando en un
panel — con su rol, nombre y una bajada breve apoyados abajo sobre un degradado que garantiza
legibilidad. Se siente como abrir el dossier de un tripulante, no leer una entrada de
enciclopedia.

**Why this priority**: Es el cambio de mayor impacto visual y el primero que ve cualquier
visitante al entrar a una ficha. Sin esto, el resto de la feature (galería, visor) queda
colgando de un hero viejo que no está a la altura.

**Independent Test**: Abrir cualquier ficha con hero implementado y verificar que la imagen de
fondo cubre casi toda la altura del viewport, que el texto (rol + nombre + bajada) es legible
sobre el degradado sin importar el brillo de la imagen de fondo, y que el patrón es idéntico
(mismos tokens, mismo mecanismo) al ya usado en `.mundo-portada-escena`.

**Acceptance Scenarios**:

1. **Given** `personajes.html#cooper` en escritorio, **When** el visitante llega a la ficha,
   **Then** ve una imagen de fondo de altura cercana a la pantalla completa, con un degradado
   inferior y la ficha (rol, nombre, bajada) apoyada sobre ese degradado, totalmente legible.
2. **Given** un ancho de viewport de 320px, **When** se ve el hero de cualquier personaje,
   **Then** no genera scroll horizontal ni desborda la pantalla.
3. **Given** los personajes con material insuficiente para galería/visor (ver FR-009), **When**
   se visita su ficha, **Then** el hero nuevo igual se aplica (no depende de la disponibilidad
   de fotogramas adicionales, solo del retrato principal ya existente en `assets/img/`).

---

### User Story 3 - Galería de escenas con texto sincronizado (Priority: P1)

Un visitante que scrollea dentro de la ficha de un personaje ve un panel de texto (título,
descripción y un dato curioso) en la parte superior de la pantalla, mientras una tira de
fotogramas se desplaza horizontalmente en la parte inferior, atada al mismo scroll — a medida
que un fotograma queda "activo" en la tira, el texto de arriba cambia en corte duro para
corresponder a esa escena puntual. Se lee como avanzar frame a frame por 2-3 momentos clave del
personaje.

**Why this priority**: Ya es el patrón validado y sin cambios pendientes de diseño (viene del
spike "tira inferior stop motion"); es la segunda pieza central de la ficha, junto al hero.

**Independent Test**: Con GSAP cargado, scrollear la galería de un personaje y verificar que el
texto superior cambia en sincronía exacta con el fotograma resaltado de la tira inferior. Sin
GSAP / con `prefers-reduced-motion: reduce`, verificar que el texto y la tira quedan en flujo
normal (texto de la primera escena visible, tira scrolleable a mano), sin ningún hueco ni
error.

**Acceptance Scenarios**:

1. **Given** GSAP cargado y sin preferencia de movimiento reducido, **When** el visitante
   scrollea la galería, **Then** el fotograma centrado en la tira inferior queda resaltado
   (borde encendido) y el panel de texto superior muestra exactamente la escena correspondiente
   a ese fotograma, con transición en corte duro (sin crossfade).
2. **Given** `prefers-reduced-motion: reduce` activo o GSAP no disponible, **When** se visita la
   galería, **Then** el panel de texto y la tira de fotogramas quedan en flujo de documento
   normal (sin riel, sin sticky), la tira es scrolleable a mano (swipe/rueda), y toda la
   información de las escenas sigue siendo accesible.
3. **Given** cualquiera de los dos escenarios anteriores, **When** se mide el contenido visible,
   **Then** el dato curioso y la descripción de cada escena son idénticos en ambos casos — el
   mecanismo de scroll nunca oculta contenido de forma permanente.

---

### User Story 4 - Visor Nav-Ranger con secuencias reales (Priority: P2)

Al cierre de la ficha de un personaje, junto al bloque de texto "Su papel en la historia", un
visitante ve un panel con la estética de un instrumento de navegación de la nave Ranger —no la
tira de celuloide que ya usan las páginas de Mundos— donde un pequeño visor cicla en loop, cada
~450ms, una sucesión de fotogramas reales de 2-3 tramos cortos de escena de la película,
enfocados en ese personaje puntual. Da la sensación de estar viendo una grabación de archivo del
personaje en acción, no una imagen estática ni un GIF genérico.

**Why this priority**: Es la pieza diferencial nueva de esta feature (no existía en el rediseño
original de "sticker"), pero la ficha ya es funcional y visualmente completa con el hero (US2) y
la galería (US3) aunque el visor no esté — por eso queda en P2, no P1.

**Independent Test**: Para un personaje con secuencias curadas, verificar que el visor cicla sus
fotogramas en loop infinito a intervalo constante mientras está en pantalla, se detiene fuera de
viewport, y respeta `prefers-reduced-motion` mostrando solo el primer fotograma fijo. Verificar
además — inspeccionando los fotogramas elegidos— que no son imágenes sueltas sin relación, sino
tramos consecutivos reconocibles como una escena.

**Acceptance Scenarios**:

1. **Given** un personaje con secuencias curadas y sin preferencia de movimiento reducido,
   **When** el visor está en pantalla, **Then** los fotogramas se reemplazan en loop infinito a
   intervalo constante (~450ms, ajustable), sin crossfade.
2. **Given** el mismo visor, **When** sale del viewport (scroll), **Then** el ciclador se pausa
   (no sigue consumiendo CPU/batería fuera de pantalla) y retoma al volver a entrar.
3. **Given** `prefers-reduced-motion: reduce` activo, **When** se visita la ficha, **Then** el
   visor muestra únicamente su primer fotograma, fijo, sin ciclar.
4. **Given** un personaje sin secuencias curadas todavía (ver FR-009), **When** se visita su
   ficha, **Then** no aparece el visor ni un hueco vacío en su lugar — la ficha completa degrada
   al patrón vigente hoy (contrato 003).

---

### User Story 5 - Migración completa de las 6 fichas (Priority: P3)

Con el tiempo, a medida que se curan más fotogramas del volcado local para Brand, Profesor
Brand, Mann y TARS/CASE, cada una de esas fichas migra al patrón nuevo (US2 + US3 + US4) sin
requerir cambios de código adicionales — solo la curación de contenido.

**Why this priority**: Depende enteramente de un insumo externo a esta feature de código (curar
fotogramas de personajes con poco material hoy). Cooper y Murph ya cubren el alcance mínimo
viable y demuestran el patrón completo; el resto es expansión de contenido, no de producto.

**Independent Test**: Para un personaje recién curado, agregar sus imágenes con la convención de
nombre definida (ver Key Entities) y verificar que su ficha migra automáticamente al patrón
nuevo sin tocar HTML/CSS/JS de la página.

**Acceptance Scenarios**:

1. **Given** un personaje sin material curado hoy, **When** se agregan sus stills adicionales y
   sus fotogramas de secuencia con la convención de nombre esperada, **Then** su ficha pasa a
   mostrar hero + galería + visor sin requerir un cambio de código para ese personaje puntual.

---

### Edge Cases

- ¿Qué pasa con los 4 personajes sin material suficiente hoy (Brand, Profesor Brand, Mann,
  TARS/CASE)? → Degradan al patrón vigente del contrato 003 (retrato rectangular + los 3
  bloques de texto), sin hueco vacío ni error (FR-009, Clarifications).
- ¿Qué pasa si una escena de la galería o un tramo del visor tiene menos frames de los
  esperados (ej. solo 2 en vez de 4-6)? → El componente funciona igual con el material
  disponible; no hay un mínimo estricto de frames por tramo, solo el criterio cualitativo de
  "reconocible como secuencia corta de una escena", no una imagen suelta.
- ¿Qué pasa si el visitante llega por ancla directa (`personajes.html#murph`) antes de que GSAP
  registre los `ScrollTrigger` del riel o arranque el ciclador del visor? → El contenido debe
  ser legible de inmediato: el estado "sin JS armado" y el estado "JS ya armado" deben mostrar
  la misma información, solo difiere el mecanismo de scroll/animación.
- ¿Qué pasa si falla la carga de un fotograma individual del visor o de la tira (404, archivo
  corrupto) mientras el resto sí carga? → Ese fotograma puntual queda vacío/roto sin romper el
  resto del ciclador ni de la tira — mismo criterio de tolerancia a fallos que ya usa
  `js/filmstrip.js` y `js/mundo-portada.js` en el resto del sitio.
- ¿Qué pasa con el volcado de 11.713 fotogramas (`assets/cap-that.com_interstellar(2014)/`) si
  alguien intenta commitearlo por error? → Debe estar excluido por `.gitignore` (ya corregido en
  esta rama); ningún flujo de esta feature depende de que ese material esté versionado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE reemplazar el retrato rectangular chico del hero de cada ficha
  (patrón vigente del contrato 003) por un hero full-bleed (imagen de fondo cercana a la altura
  completa del viewport, scrim degradado, ficha de rol/nombre/bajada apoyada sobre el scrim),
  reutilizando el mismo mecanismo visual que `.mundo-portada-escena` (`css/mundos.css`) en vez
  de crear un patrón nuevo.
- **FR-002**: El sistema DEBE implementar la galería de escenas con el mecanismo ya validado en
  el spike (panel de texto 30% arriba / tira de fotogramas 70% abajo, riel + `position: sticky`
  + `ScrollTrigger` scrub, corte duro sincronizado entre texto activo y fotograma activo),
  reusando GSAP 3.13 + `ScrollTrigger` ya vendorizados en `js/vendor/gsap@3.13.0/`, sin agregar
  dependencias nuevas ni CDN en tiempo de ejecución.
- **FR-003**: El sistema DEBE agregar un visor "Nav-Ranger" al cierre de cada ficha con material
  suficiente (ver FR-009), en fila junto al bloque de texto "Su papel en la historia" (se apila
  en mobile), con la piel visual de instrumentos del cockpit (mismos tokens que el nav del
  header: `--cockpit-metal`, `--cockpit-bezel`, `--instrumento-teal`, `--font-instrumento`) —
  explícitamente DISTINTA de la estética de tira de celuloide de `#en-celuloide` /
  `js/filmstrip.js`, que resuelve un mecanismo diferente (desplazamiento continuo vs. reemplazo
  in-situ de fotogramas).
- **FR-004**: El ciclador del visor Nav-Ranger DEBE reemplazar el fotograma activo a un
  intervalo constante configurable (valor de referencia ~450ms) en loop infinito mientras el
  visor está en el viewport, sin transición de crossfade (corte duro, efecto stop-motion), y
  DEBE pausarse cuando el visor sale de vista (`IntersectionObserver` u equivalente) para no
  consumir recursos de más.
- **FR-005**: Los fotogramas de cada visor Nav-Ranger DEBEN ser una curación de 2-3 tramos
  cortos de escena real (varios frames consecutivos por tramo) con foco en ese personaje,
  extraídos del volcado local `assets/cap-that.com_interstellar(2014)/` — NO imágenes sueltas
  sin relación temporal entre sí. Los frames elegidos DEBEN optimizarse y versionarse en
  `assets/img/` (no el volcado completo, que permanece gitignoreado) con su fila correspondiente
  en `CREDITOS.md`.
- **FR-006**: El sistema DEBE degradar a una versión completamente estática y legible cuando
  GSAP no está disponible o cuando el visitante tiene `prefers-reduced-motion: reduce` activo:
  la galería de escenas queda en flujo normal (sin riel, tira scrolleable a mano) y el visor
  Nav-Ranger muestra únicamente su primer fotograma, fijo, sin ciclar. El hero (FR-001), al ser
  puramente CSS, no depende de este degradado.
- **FR-007**: El sistema DEBE mantener sin romper la estructura semántica de contenido heredada
  del contrato 003 en lo que no es puramente visual: el `<h2>` con el nombre del personaje, los
  bloques temáticos «Quién es» → «Su papel en la historia» → «Rasgos distintivos» (o su
  equivalente reorganizado entre hero/galería/cierre) y la `<p class="ficha-reparto">` por
  ficha. El contrato 003 se actualiza o se reemplaza por un contrato nuevo de esta feature que
  documente explícitamente qué reglas de `.ficha-personaje` / `.ficha-retrato` quedan
  reemplazadas por el patrón nuevo (hero + galería + visor) y cuáles del contenido semántico se
  heredan sin cambios.
- **FR-008**: El sistema DEBE respetar los tokens de diseño vigentes (`DESIGN.md`): el naranja
  Gargantúa (`--color-gargantua`) como único acento saturado de contenido, el teal
  (`--instrumento-teal`) acotado al chrome/instrumentos (incluido el visor Nav-Ranger, que es
  chrome de instrumento, no contenido), ningún blanco puro fuera de `color-mix()`.
- **FR-009**: Si un personaje no tiene material suficiente (stills insuficientes para armar 2-3
  escenas de galería, o sin tramos curados para el visor), esa ficha individual DEBE degradar
  por completo al patrón vigente hoy del contrato 003 (retrato rectangular informativo + los 3
  bloques de texto), sin hueco vacío ni error — no una migración parcial a medias del patrón
  nuevo. Hoy esto aplica a Brand, Profesor Brand, Mann y TARS/CASE; Cooper y Murph tienen
  material suficiente para el patrón completo.
- **FR-010**: El sistema NO DEBE versionar el volcado completo de fotogramas
  (`assets/cap-that.com_interstellar(2014)/`, ni volcados equivalentes) en el historial de git
  — permanece excluido vía `.gitignore`. Solo los fotogramas curados y optimizados que
  efectivamente se usan en `assets/img/` se versionan.
- **FR-011**: El sistema DEBE seguir cumpliendo las invariantes de accesibilidad del sitio
  (DESIGN.md §8): foco visible, sin dependencia exclusiva del color, contraste sostenido sobre
  el scrim del hero, y ningún salto de layout (CLS) causado por la carga asíncrona de imágenes
  o del script de animación. Las imágenes del visor y la tira son decorativas/de refuerzo — la
  información real de la ficha sigue viviendo en el texto semántico, no exclusivamente en ellas.
- **FR-012**: El sistema DEBE reemplazar la intro de página actual (`<h1>Personajes</h1>` +
  párrafo plano) por una portada en mosaico con los 6 personajes como retratos clickeables que
  saltan a su ficha (`#<id>`), a pantalla casi completa. El `<h1>` de toda la página vive en
  esta portada; ninguna ficha individual repite un `<h1>`. La portada usa el retrato de respaldo
  ya existente de cada personaje (`assets/img/personajes-<id>.jpg`) — no depende de que ese
  personaje tenga material curado para hero/galería/visor (FR-009), así que aplica a los 6 desde
  el primer corte de esta feature.

### Key Entities

- **Portada de tripulación**: sección de apertura de toda la página `personajes.html` — mosaico
  de 6 retratos clickeables (uno por personaje) con nombre/rol, a pantalla casi completa.
  Reemplaza a la intro de texto plano actual y aloja el único `<h1>` de la página (FR-012).
  Usa el retrato de respaldo de los 6 personajes, disponible sin excepción.
- **Hero full-bleed**: sección de apertura de cada ficha — imagen de fondo + scrim + panel de
  rol/nombre/bajada. Reemplaza al retrato rectangular chico del contrato 003 para las 6 fichas
  (FR-001), sin depender de la disponibilidad de material adicional.
- **Galería de escenas**: riel con panel de texto (30%) + tira de fotogramas (70%), scroll
  horizontal atado a scroll vertical vía GSAP/ScrollTrigger, corte duro sincronizado (FR-002).
  Depende de 2-3 escenas curadas con stills suficientes por personaje.
- **Visor Nav-Ranger**: panel con piel de instrumento de cockpit que cicla en loop 2-3 tramos
  cortos de fotogramas curados del volcado local, con convención de nombre a fijar en
  `/speckit-plan` (valor de referencia: `assets/img/personajes-<id>-visor-NN.jpg`, ver FR-005).
- **Volcado local de fotogramas** (`assets/cap-that.com_interstellar(2014)/`): 11.713 frames
  numerados secuencialmente, material de referencia gitignoreado (FR-010) — fuente de curación
  para el visor y, potencialmente, para completar el material faltante de los 4 personajes
  pendientes (US5).
- **Contrato 003** (`specs/003-personajes-content/contracts/personajes-page.md`): documento de
  reglas de estructura que esta feature actualiza parcialmente (reemplaza las reglas visuales de
  `.ficha-personaje`/`.ficha-retrato` por el patrón hero+galería+visor) y mantiene vigente donde
  no es puramente visual (FR-007).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Cooper y Murph (los 2 personajes con material suficiente hoy) usan el patrón
  completo (hero + galería + visor) — 0 huecos vacíos, 0 errores de consola.
- **SC-002**: Los 4 personajes sin material suficiente (Brand, Profesor Brand, Mann, TARS/CASE)
  se muestran completos con el patrón de degradado (contrato 003 vigente) — sin ficha rota ni a
  medio migrar.
- **SC-003**: A 320px, 768px y 1280px de ancho de viewport, ninguna ficha (hero, galería o
  visor) genera desplazamiento horizontal ni desborda su contenedor.
- **SC-004**: Con `prefers-reduced-motion: reduce` activo, el 100% de las galerías y visores
  implementados se muestra completo y legible sin ninguna animación de scroll ni ciclado.
- **SC-005**: Bloqueando la carga del módulo de GSAP, las fichas con galería siguen siendo
  completamente legibles (texto y tira en flujo normal) sin contenido faltante.
- **SC-006**: Recorrido completo de la página en Chrome, Edge y Firefox sin errores ni 404 en
  consola.
- **SC-007**: `git status` nunca muestra el volcado completo de fotogramas como candidato a
  commit (verificación directa de FR-010).
- **SC-008**: La portada en mosaico muestra los 6 personajes con enlace funcional a su ficha, y
  la página conserva exactamente un `<h1>` en todo momento (verificación directa de FR-012).

## Assumptions

- El patrón de "sticker recortado sin fondo" del spec anterior queda completamente descartado;
  no hay trabajo de recorte con canal alfa pendiente para esta feature.
- La curación de fotogramas (elegir tramos de escena, optimizar, nombrar, documentar en
  `CREDITOS.md`) es trabajo de contenido que se resuelve en las fases de tasks/apply de esta
  feature, no en el diseño técnico — el spec solo fija la convención y el criterio de "tramos
  cortos reconocibles", no los frames puntuales.
- Cooper y Murph son el alcance mínimo viable (US2 + US3 + US4 para ambos); la migración de los
  4 personajes restantes (US5) es expansión de contenido y no bloquea el cierre de esta feature.
  La portada en mosaico (US1) aplica a los 6 personajes desde el primer corte, sin dependencia
  de contenido — reusa los retratos de respaldo ya existentes.
- Se reutiliza el patrón de degradado progresivo ya validado en `js/mundo-portada.js`
  (`gsap.matchMedia()`, import dinámico de `js/vendor/gsap@3.13.0/`) en vez de diseñar un
  mecanismo nuevo de carga de GSAP.
- El contrato 003 no se elimina: se actualiza in-place o se reemplaza por un contrato 008 que
  documenta explícitamente qué reglas visuales derogó y cuáles heredó sin cambios.
- Fuera de alcance: cambios a la navegación (`js/nav-data.js`), a otras páginas del sitio, o al
  contenido narrativo ya escrito (nombres, reparto) — solo se toca la presentación visual y se
  suma el visor Nav-Ranger como pieza nueva.
