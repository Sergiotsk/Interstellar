# Feature Specification: Optimización de imágenes + semántica `<picture>`/WebP, incremental por sección

**Feature Branch**: `main` (excepción consciente a la convención `sec/<seccion>`: tooling transversal aplicado de a poco — ver Assumptions)

**Created**: 2026-09-08

**Status**: Draft

**Input**: User description: "Optimización de imágenes y semántica `<picture>`/WebP, aplicada de forma incremental por sección. Reemplazar el flujo manual de optimizar imágenes en squoosh.app por un pipeline local reproducible, versionado en el repo, y migrar el marcado de imágenes a `<picture>` con fuente WebP y fallback al formato original."

## Clarifications

### Session 2026-09-08

- Q: ¿Se fijan los anchos objetivo por contexto con los valores del research o se ajustan? → A: Se fijan tal cual: poster-hero 1280, backdrop-mundo 2560, galería-miniatura 800, galería-ampliada 1600, filmstrip-frame 900, retrato-personaje 720 (px de ancho).
- Q: ¿La aceptación de peso por sección exige un tope absoluto además del −25% relativo? → A: Sí: se reusan los topes de features previas (002: cada backdrop de mundos ≤ 250 KB y los 5 de `mundos.html` ≤ 1,2 MB; 005: tope vigente de la galería). Las secciones sin tope previo solo deben cumplir el −25%.
- Q: ¿La imagen LCP de cada página lleva marca de prioridad de carga? → A: Sí: `fetchpriority="high"` en el `<img>` del LCP (poster del hero; primera imagen visible de la galería). Sin `<link rel="preload">`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Optimizar las imágenes de una sección con un comando (Priority: P1)

Cuando el desarrollador termina el contenido de una sección, coloca los originales de mejor
calidad en `assets/_source/img/<seccion>/`, corre **un solo comando** apuntando a esa
sección, y obtiene en `assets/img/` las versiones ligeras listas para servir (formato
moderno + respaldo), redimensionadas al tamaño real de uso. No abre ninguna web externa ni
arrastra archivos a mano.

**Why this priority**: Es el núcleo de la feature y lo que motivó pedirla. Sin esto no hay
nada: es la máquina que reemplaza el trabajo manual y no reproducible en squoosh.app. Con
solo esta historia ya hay valor entregable — el desarrollador puede optimizar cualquier
sección terminada de forma consistente y registrada en el repo.

**Independent Test**: Colocar los originales de una sección en `assets/_source/img/`, correr
el comando para esa sección, y verificar que en `assets/img/` aparecen las salidas
esperadas (versión WebP + respaldo, redimensionadas), que los bytes son sensiblemente
menores que el original, y que volver a correr el comando no cambia nada.

**Acceptance Scenarios**:

1. **Given** una carpeta `assets/_source/img/galeria/` con imágenes originales, **When** el
   desarrollador corre el pipeline para la sección `galeria`, **Then** por cada original se
   generan en `assets/img/` una versión WebP y una de respaldo en el formato original,
   ambas con el ancho objetivo del contexto "galería", sin superar el tamaño del original.
2. **Given** una imagen original más chica que el ancho objetivo de su contexto, **When**
   se corre el pipeline, **Then** la imagen NO se agranda: se conserva su ancho real.
3. **Given** una sección ya procesada, **When** se vuelve a correr el pipeline sobre ella
   sin cambiar los originales, **Then** los archivos de salida quedan byte a byte iguales
   (0 cambios en git).
4. **Given** el pipeline corriendo, **When** termina, **Then** no ha tocado ningún archivo
   fuera de `assets/img/` (ni HTML, ni CSS, ni otras secciones).

---

### User Story 2 - Un visitante recibe imágenes modernas y sin saltos de layout (Priority: P2)

Un visitante abre una página ya migrada (por ejemplo en un teléfono con conexión lenta). El
navegador descarga las imágenes en formato moderno si lo soporta (bastante más livianas), la
página no "salta" mientras las imágenes cargan, y las imágenes que están fuera de la
pantalla inicial no se descargan hasta que hacen falta.

**Why this priority**: Es el beneficio de cara al usuario final y a las métricas de
rendimiento (LCP, CLS). Depende de que exista el pipeline (US1) para tener las versiones
WebP, pero se verifica de forma independiente página por página.

**Independent Test**: Abrir una página migrada en el navegador, confirmar que la respuesta
de las imágenes es WebP cuando el navegador lo soporta, que el contenido no se desplaza al
cargar las imágenes, y que las imágenes bajo el pliegue solo se piden al hacer scroll.

**Acceptance Scenarios**:

1. **Given** una página migrada abierta en un navegador que soporta el formato moderno,
   **When** carga, **Then** las imágenes de contenido se sirven en ese formato moderno.
2. **Given** el mismo marcado en un navegador que NO soporta el formato moderno, **When**
   carga, **Then** las imágenes se sirven en el formato de respaldo, sin imágenes rotas.
3. **Given** una página migrada, **When** las imágenes terminan de cargar, **Then** el
   contenido alrededor no se desplazó (no hubo reflow por imágenes sin dimensiones).
4. **Given** una página migrada con imágenes por debajo del pliegue, **When** se abre sin
   hacer scroll, **Then** esas imágenes no se descargaron todavía.
5. **Given** el hero de la página de inicio, **When** carga, **Then** su imagen de portada
   (poster del video) se sirve optimizada y NO difiere su carga (es la imagen más grande
   visible al inicio).

---

### User Story 3 - Los derivados no distorsionan el registro de créditos (Priority: P3)

Cuando una sección incorpora sus archivos WebP derivados, la atribución de fuente del
proyecto sigue siendo correcta y sin ruido: cada derivado **hereda** el crédito de su
imagen original y NO aparece como una entrada propia en el registro. La suite de tests
queda en verde.

**Why this priority**: Es una condición de "no ensuciar lo que ya funciona". El registro de
créditos (`assets/img/CREDITOS.md` + su espejo en código) es la fuente de verdad de
atribución; un `.webp` derivado de un `.jpg` ya acreditado no es una fuente nueva y no debe
sumar filas ni alterar los conteos del test. El registro de imágenes originales no cambia.

**Independent Test**: Agregar los WebP derivados de una sección, correr la suite de tests
del proyecto y verificar que queda en verde, y revisar que el registro de créditos no ganó
entradas por los derivados.

**Acceptance Scenarios**:

1. **Given** una sección con sus archivos `.webp` derivados agregados a `assets/img/`,
   **When** se corre la suite de tests del proyecto, **Then** queda en verde sin cambios en
   el registro de créditos.
2. **Given** un archivo `.webp` que es derivado de una imagen original ya acreditada,
   **When** se revisa el registro de créditos, **Then** el derivado NO tiene entrada propia:
   la atribución del original lo cubre.
3. **Given** una imagen original nueva sin atribución, **When** se revisa el registro,
   **Then** sigue exigiéndose su crédito (la regla de "derivados heredan" no afloja el
   control sobre fuentes nuevas).
4. **Given** la convención de "solo JPEG" anotada en el registro de créditos (2026-08-28),
   **When** esta feature entra, **Then** esa nota queda actualizada para reflejar que ahora
   se sirve WebP con respaldo.

---

### Edge Cases

- **Imagen sin original guardado**: la mayoría del material NO tiene su original crudo en el
  repo (`assets/_source/` es local y gitignored). En ese caso la versión actual en
  `assets/img/` se toma como fuente y se acepta una única recompresión con pérdida.
- **Imágenes referenciadas solo desde CSS** (`background-image`, p. ej. los backdrops de la
  portada de mundos): SÍ entran al pipeline para reducir bytes (son de las más pesadas del
  sitio). El CSS pasa a apuntar directo al `.webp` (respaldo por soporte universal en la
  baseline; el proyecto ya lo hace con `terra-orbita.webp`). El elemento `<picture>` no
  aplica acá: es solo para `<img>`.
- **PNG con transparencia**: el derivado WebP conserva el canal alfa; el respaldo se
  mantiene en PNG (no se degrada a un formato sin alfa).
- **SVG y otros vectoriales**: quedan fuera del pipeline; se sirven tal cual.
- **Poster del `<video>` del hero**: se optimiza como imagen suelta; el atributo `poster`
  no admite el elemento `<picture>`, así que no se migra ese marcado.
- **Tiras de fotogramas / filmstrip** (muchas imágenes en una sola vista): todas difieren
  su carga salvo las visibles al inicio; el pipeline las procesa como cualquier contexto,
  con su propio ancho objetivo.
- **Re-ejecución parcial**: correr el pipeline para una sección no debe alterar los
  archivos de otra sección.
- **Original más chico que el ancho objetivo**: nunca se agranda.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El proyecto MUST ofrecer un pipeline de optimización de imágenes reproducible
  que se ejecute con un solo comando en la máquina del desarrollador, con opción de correr
  para una sección específica o para todo el material.
- **FR-002**: Por cada imagen fuente, el pipeline MUST producir (a) una versión en formato
  moderno de compresión superior y (b) una versión de respaldo en el formato original,
  ambas redimensionadas a un **ancho objetivo definido por el contexto de uso**, sin
  agrandar nunca una imagen fuente más chica que ese ancho.
- **FR-003**: Las salidas del pipeline MUST escribirse en `assets/img/`, versionarse en el
  repo y servirse sin transformación adicional. Los originales sin optimizar NO se
  versionan: cuando existan, viven localmente en `assets/_source/img/<seccion>/` (gitignored);
  cuando no existan, el pipeline toma como fuente el archivo actual de `assets/img/`.
- **FR-004**: El pipeline MUST ser idempotente: re-ejecutarlo sobre material ya procesado,
  sin cambios en los originales, no MUST producir diferencias en los archivos de salida.
- **FR-005**: Cada imagen de **contenido** (`<img>`) migrada MUST ofrecer al navegador la
  versión en formato moderno con **respaldo automático** al formato original cuando ese
  formato no esté soportado, sin dejar imágenes rotas en ningún navegador de la baseline.
- **FR-005b**: Cada imagen **de fondo referenciada desde CSS** (`background-image`) MUST
  pasar por el pipeline de bytes y MUST servirse en formato moderno; dado el soporte
  universal en la baseline evergreen del proyecto, el respaldo explícito es opcional para
  este caso (precedente ya existente en el repo).
- **FR-006**: Cada imagen migrada MUST declarar sus **dimensiones intrínsecas** de modo que
  la carga de la imagen no provoque desplazamiento del contenido (reflow / CLS).
- **FR-007**: Las imágenes fuera del viewport inicial MUST diferir su carga (`loading="lazy"`);
  las visibles al inicio MUST NOT diferirla. La imagen más grande del primer render de cada
  página (LCP: el poster del hero; la primera imagen visible de la galería) MUST marcarse
  como prioritaria de carga (`fetchpriority="high"` en el `<img>`). No se usa
  `<link rel="preload">`.
- **FR-008**: Toda imagen migrada MUST tener texto alternativo con sentido, vacío si la
  imagen es puramente decorativa.
- **FR-009**: La migración del marcado MUST aplicarse **por sección**, siendo cada sección
  una unidad entregable y verificable de forma independiente. Una sección no se MUST migrar
  hasta que su contenido esté cerrado.
- **FR-010**: La imagen de portada del video del hero MUST optimizarse como imagen suelta
  (sin el elemento `<picture>`).
- **FR-011**: Los archivos derivados (p. ej. el `.webp` de una imagen) MUST NOT sumar
  entradas al registro de créditos ni alterar sus conteos: heredan la atribución de su
  imagen original. Tras incorporar los derivados de una sección, la suite de tests del
  proyecto MUST permanecer en verde sin cambios en el registro.
- **FR-011b**: La nota "solo JPEG" del registro de créditos (`assets/img/CREDITOS.md`,
  2026-08-28) y el documento de aprendizaje `docs/10-aprendizaje/01-optimizacion-imagenes-web.md`
  MUST actualizarse para reflejar que ahora se sirve WebP con respaldo vía pipeline local.
- **FR-012**: El pipeline MUST NOT romper el mapeo entre cada imagen original y su
  atribución de fuente. El 100 % de las imágenes originales MUST conservar su crédito
  verificable (Principio VI de la constitución).
- **FR-013**: Cada sección migrada MUST reducir el peso total de sus imágenes respecto del
  estado previo. Además, donde una feature previa fijó un tope absoluto, la sección migrada
  MUST NOT superarlo: cada backdrop de `mundos.html` ≤ 250 KB y los 5 juntos ≤ 1,2 MB
  (feature 002); la galería, su tope vigente (feature 005 / enmienda SC-011). Las secciones
  sin tope previo solo deben cumplir la reducción relativa.
- **FR-014**: El pipeline MUST NOT ejecutarse en CI ni en el despliegue. El publicado de
  GitHub Pages MUST seguir publicando los archivos del repo tal cual, sin paso de build.

### Key Entities

- **Imagen fuente**: la mejor versión disponible de una imagen. Puede ser un original crudo
  en `assets/_source/img/<seccion>/` (local, gitignored) o, para la mayoría del material que
  no lo tiene, el propio archivo actual de `assets/img/`. Atributos: nombre lógico, sección,
  formato, dimensiones.
- **Derivados servibles**: por cada imagen fuente, los archivos en `assets/img/` que se
  sirven — la versión WebP y, para las de contenido (`<img>`), la de respaldo en el formato
  original — con el ancho objetivo de su contexto. Un derivado hereda el crédito de su
  fuente y no se lista aparte.
- **Contexto de uso**: categoría que determina el **ancho objetivo de salida** (px), fijado
  en Clarifications:

  | Contexto | Ancho objetivo |
  |---|---|
  | Portada del hero (`poster`) | 1280 |
  | Backdrop de mundo (`<img>` y `background-image`) | 2560 |
  | Miniatura de galería (grid) | 800 |
  | Vista ampliada de galería (lightbox) | 1600 |
  | Fotograma de tira de celuloide (filmstrip) | 900 |
  | Retrato de personaje | 720 |

  Regla: `anchoSalida = min(anchoObjetivo, anchoFuente)` — nunca agranda.
- **Sección**: unidad de aplicación incremental. Conjunto inicial: inicio/hero, hub de
  mundos, Tierra, Gargantúa, Mann, Miller, Tesseract, personajes, ciencia, galería,
  créditos, contacto.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Optimizar las imágenes de una sección terminada requiere menos de 1 minuto de
  trabajo manual (un comando más una revisión visual) y **cero** visitas a herramientas web
  externas.
- **SC-002**: Cada sección migrada reduce el peso de sus imágenes en al menos un **25 %**
  respecto del estado previo, y —donde exista un tope absoluto de una feature previa (002,
  005)— queda por debajo de ese tope.
- **SC-003**: En las páginas migradas, los visitantes cuyo navegador soporta el formato
  moderno (≥ 95 % según la baseline evergreen del proyecto) lo reciben; el resto recibe el
  respaldo sin imágenes rotas.
- **SC-004**: Las páginas migradas no presentan desplazamiento de layout perceptible
  atribuible a imágenes durante la carga (contribución de imágenes al CLS ≈ 0).
- **SC-005**: Re-ejecutar el pipeline sobre una sección ya procesada produce **0 cambios**
  en el control de versiones.
- **SC-006**: La suite de tests del proyecto queda en verde después de cada sección migrada.
- **SC-007**: El 100 % de las imágenes migradas conserva una atribución de fuente
  verificable.
- **SC-008**: El despliegue de GitHub Pages sigue funcionando sin modificar el workflow de
  publicación (no se agrega ningún paso de build).

## Assumptions

- **Aplicación incremental sobre `main`**: por ser tooling transversal que se aplica sección
  por sección a lo largo del tiempo (no una sección nueva), el trabajo se hace en `main` con
  un commit chico por sección, como excepción consciente a la convención `sec/<seccion>`.
  Acordado con el responsable del proyecto.
- **Un solo ancho por contexto de uso**: no se generan múltiples resoluciones por imagen ni
  se usa selección responsive por ancho de viewport en esta versión.
- **Un solo formato moderno** (WebP): AVIF queda fuera de alcance.
- **Originales NO versionados** (decisión 1B): `assets/_source/` sigue local y gitignored
  (política existente del repo). La reproducibilidad es "quien tenga los originales
  re-ejecuta"; desde el repo solo, el pipeline re-optimiza a partir de la versión actual de
  `assets/img/` (una recompresión aceptada). La mayoría del material ya no tiene original
  crudo guardado.
- **Backdrops de CSS incluidos** (decisión 3): las imágenes raster referenciadas desde
  `background-image` (portada de mundos, etc.) entran al pipeline de bytes; el CSS pasa a
  apuntar al `.webp`. El elemento `<picture>` se aplica solo a `<img>`.
- **Créditos: los derivados heredan** (decisión 2): no hay rework del modelo de créditos.
  Los `.webp` derivados no se listan; heredan el crédito del original. Ningún test escanea
  `assets/img/`, así que no hace falta un stub de código; sí se actualiza la nota "solo
  JPEG" del registro. El rediseño del modelo de créditos queda fuera de alcance.
- **Video del hero**: su optimización ya se hizo en una tarea anterior; queda fuera de
  alcance. Solo se toca su imagen de portada.
- **Dependencia de la constitución v2.3.0** (ratificada, commit `7c93ded`): habilita
  `tools/`, `assets/_source/` y las dependencias de tooling exclusivas de desarrollo que el
  pipeline necesita.
- **Sitio estático sin build**: el pipeline corre localmente, fuera de CI; sus salidas se
  commitean y se sirven tal cual.

### Out of Scope

- AVIF u otros formatos modernos adicionales a WebP.
- Selección responsive multi-ancho (`srcset` / `sizes` con varias resoluciones).
- Rediseño del sistema de créditos (los derivados simplemente heredan el crédito del
  original).
- Versionado de los originales sin optimizar (`assets/_source/` sigue local / gitignored).
- Re-optimización del video de fondo del hero (ya hecho; solo se toca su imagen de portada).
- Ejecución del pipeline en CI o en el despliegue.
