# Feature Specification: Galería de imágenes

**Feature Branch**: `feat/005-galeria`

**Created**: 2026-08-30

**Status**: Draft

**Input**: User description: "Galería de imágenes de Interstellar: página galeria.html que reúne el material gráfico del sitio (backdrops y stills de la película) más imágenes nuevas sourcedas de TMDB/ESA-Hubble, organizado por categorías (Mundos, Personajes, Ciencia, Viaje). Grid responsive, cada imagen con caption y crédito, link a creditos.html."

## Contexto

`galeria.html` se creó como esqueleto navegable en la feature 001: existe, hereda el
layout compartido (encabezado, submenú, pie), figura en `NavConfig` como destino superior
sin hijos y hoy muestra un único párrafo placeholder ("Esta sección reunirá las
imágenes del sitio…").

Esta feature reemplaza ese placeholder por una galería real: una cuadrícula de imágenes
organizada en cuatro categorías que se corresponden con los cuatro ejes del sitio
(Mundos, Personajes, La Ciencia, El Viaje). La galería reúne las imágenes ya presentes en
`assets/img/` (features 001–004) y suma imágenes nuevas para dar cuerpo a cada categoría.
Toda imagen mantiene la política de atribución vigente: registro en
`assets/img/CREDITOS.md`, línea en `creditos.html` (array `ASSET_CREDITS`) y enlace desde
el pie común.

No introduce animaciones ni efectos de scroll (eso es capa "atmósfera" y la spec de la
animación de la Endurance), ni contenido científico con etiquetas de rigor (eje La
Ciencia), ni lógica JavaScript nueva.

## Clarifications

### Session 2026-08-30

- Q: ¿La galería solo cura las imágenes que ya están en el sitio o suma imágenes nuevas? → A: Suma imágenes nuevas. Reutiliza las 15 imágenes ya descargadas (features 001–004) y añade entre 3 y 4 imágenes nuevas por categoría. Fuente: FILMGRAB (`film-grab.com`), fotogramas de la película, uso académico con atribución `© Warner Bros. Pictures / Paramount Pictures` (fancaps.net se evaluó y descartó — solo cubre los primeros ~50 min; ver `research.md` D1). El manifiesto exacto está en `research.md` D4; las imágenes ya se descargaron y optimizaron (Pillow, sin tooling nuevo).
- Q: ¿Cómo se organiza la galería? → A: Cuatro secciones con ancla, una por eje, en el mismo orden del menú: Mundos (`#mundos`), Personajes (`#personajes`), La Ciencia (`#ciencia`), El Viaje (`#viaje`). Cada sección es una cuadrícula responsive de figuras. No hay filtro interactivo (eso exigiría un módulo JS con TDD; queda fuera de alcance como posible mejora futura).
- Q: ¿Qué pasa al activar una imagen? → A: Cada miniatura es un enlace (`<a href>`) al archivo de imagen local, que se abre solo en el propio navegador (la imagen sin el recorte 3:2 del tile, a su tamaño de archivo). No existe un máster de mayor resolución: los assets del sitio ya están optimizados a ≤ 250 KB, así que el enlace no promete "resolución completa", solo la imagen aislada y sin recortar, apta para zoom nativo. Sin visor modal / lightbox (evita JavaScript nuevo y respeta la construcción en capas, Principio III). El encabezado de cada categoría enlaza además a la página del eje correspondiente (`mundos.html`, `personajes.html`, `ciencia.html`, `viaje.html`), de modo que la galería funciona también como índice visual.
- Q: ¿Formato de las imágenes nuevas? → A: JPEG, igual que el resto del sitio (enmienda aprobada de la feature 001): las fuentes sirven JPG y no se agrega tooling de conversión (Principio I). Cada archivo ≤ 250 KB.
- Q: ¿Se fija ahora un tope de peso de la página y se exige carga diferida? → A: Sí. Peso total de `galeria.html` ≤ 4 MB (con cada imagen ≤ 250 KB); si el sourcing se pasa, se baja la cantidad de imágenes por categoría antes que subir el tope. Además, cada `<img>` de miniatura lleva `loading="lazy"` (atributo nativo, sin JS). Se agregan FR-008a y SC-011.
- Q: ¿La galería reserva un lugar para el póster / logo de la película o el render científico de Gargantúa? → A: No como categoría propia. El render científico de Gargantúa (`ciencia-gargantua-render`, hoy `pendiente` en `CREDITOS.md` con licencia sin confirmar) puede sumarse a la categoría La Ciencia solo si su licencia se aclara en `research.md`; si no, queda fuera. No se agrega una quinta categoría.
- Q: Si los assets ya están optimizados a ≤ 250 KB y no hay máster de mayor resolución, ¿qué hace el enlace de cada miniatura? → A: Abre el mismo archivo local, aislado en el navegador — la imagen sin el recorte 3:2 del tile, a su tamaño de archivo, apta para zoom nativo. No promete "resolución completa" (no existe una variante más grande) ni abre un visor modal. Se reformulan FR-004, HU2 y SC-008 en consecuencia.
- Q: ¿Las miniaturas se recortan a un formato uniforme o respetan el aspect ratio nativo de cada imagen? → A: Tiles uniformes. Todas las miniaturas comparten el mismo `aspect-ratio` (3:2), con recorte centrado (`object-fit: cover`), formando una cuadrícula regular. El recorte de miniatura es una decisión de diseño aceptable siempre que el motivo principal de la imagen quede dentro del encuadre central; la imagen aislada (enlace de cada figura) se ve sin recortar. No hay masonry ni alturas dispares.

## User Scenarios & Testing *(mandatory)*

### Historia de usuario 1 - Recorrer las imágenes del sitio en un solo lugar (Prioridad: P1)

Como visitante, quiero abrir `galeria.html` y ver, agrupadas por eje, las imágenes de
Interstellar que usa el sitio, para tener una vista panorámica del material gráfico sin
recorrer página por página.

**Por qué esta prioridad**: Es el valor central de la feature. Convierte el placeholder en
la galería que el menú promete desde la feature 001; sin esto, "Galería" es un destino
vacío.

**Prueba independiente**: Se puede probar abriendo `galeria.html` y verificando que
aparecen las cuatro categorías (Mundos, Personajes, La Ciencia, El Viaje), cada una con
una cuadrícula de imágenes reales del sitio y ningún texto placeholder.

**Escenarios de aceptación**:

1. **Dado** que una persona abre `galeria.html`, **Cuando** recorre la página, **Entonces**
   encuentra cuatro secciones tituladas Mundos, Personajes, La Ciencia y El Viaje, en ese
   orden, y no ve el texto "Esta sección reunirá las imágenes del sitio…".
2. **Dado** que una persona mira la sección Mundos, **Cuando** cuenta las imágenes,
   **Entonces** ve al menos las cinco de los mundos ya presentes en el sitio (La Tierra,
   Gargantúa, Miller, Mann, el Tesseract) más las imágenes nuevas de esa categoría.
3. **Dado** que una persona mira cualquier imagen de la galería, **Cuando** lee su pie,
   **Entonces** encuentra una descripción de qué muestra y a qué eje pertenece.
4. **Dado** que una persona compara la galería con las páginas de los ejes, **Cuando**
   revisa las imágenes, **Entonces** las que ya aparecían en `mundos.html`,
   `personajes.html`, `ciencia.html` y `viaje.html` están también en la categoría que les
   corresponde, sin duplicar el archivo en `assets/img/`.

---

### Historia de usuario 2 - Ver una imagen en detalle y saber de dónde viene (Prioridad: P2)

Como visitante, quiero ampliar una imagen que me interesa y poder verificar su fuente y su
atribución, para usarla como referencia con la información de crédito a mano.

**Por qué esta prioridad**: Es la razón de ser de una galería (mirar en detalle) y a la vez
la garantía de cumplimiento de la política de atribución obligatoria del proyecto
(constitución, "Assets"). Depende de que exista la galería (HU1).

**Prueba independiente**: Se puede probar activando una miniatura y verificando que se
abre la imagen aislada y sin recortar, y siguiendo el enlace del pie a `creditos.html` y
comprobando que la imagen figura ahí con su fuente y su atribución.

**Escenarios de aceptación**:

1. **Dado** que una persona activa una miniatura (clic o teclado), **Cuando** se resuelve
   el enlace, **Entonces** ve la imagen aislada en el navegador, sin el recorte 3:2 del
   tile y a su tamaño de archivo.
2. **Dado** que una persona quiere el crédito de una imagen, **Cuando** sigue el enlace a
   créditos desde el pie común, **Entonces** encuentra esa imagen listada en
   `creditos.html` con su fuente, su enlace de origen y su atribución.
3. **Dado** que una imagen de la galería es nueva (no estaba en el sitio antes),
   **Cuando** se revisa `assets/img/CREDITOS.md`, **Entonces** tiene una fila con estado
   `descargado` y una línea espejo en el array `ASSET_CREDITS` de `creditos.html`
   (sincronía 1:1).

---

### Historia de usuario 3 - Usar la galería como índice visual de los ejes (Prioridad: P3)

Como visitante, quiero que cada categoría de la galería me lleve a la página del eje
correspondiente, para pasar de "ver la imagen" a "leer el contenido" sin volver al menú.

**Por qué esta prioridad**: Suma valor de navegación con costo bajo (un enlace por
categoría), pero la galería cumple su función principal aunque este enlace no exista.

**Prueba independiente**: Se puede probar activando el enlace del encabezado de cada
categoría y verificando que lleva a `mundos.html`, `personajes.html`, `ciencia.html` y
`viaje.html` respectivamente.

**Escenarios de aceptación**:

1. **Dado** que una persona está en la categoría "Personajes" de la galería, **Cuando**
   activa el enlace de su encabezado, **Entonces** llega a `personajes.html`.
2. **Dado** que una persona recorre la galería con teclado, **Cuando** tabula por los
   enlaces de categoría y las miniaturas, **Entonces** el foco es visible y el orden sigue
   la secuencia del contenido.

---

### Casos límite

- Si una imagen no carga, su `<figure>` DEBE conservar el pie y un espacio coherente con
  la paleta, sin romper la cuadrícula ni desplazar las demás figuras.
- Si el viewport tiene 320 px de ancho, la cuadrícula DEBE colapsar a una sola columna sin
  desplazamiento horizontal involuntario ni recorte de los pies.
- Si una categoría tiene muchas imágenes, la página NO DEBE romper el layout compartido ni
  volver inutilizables las anclas de las otras categorías al cargarse de forma directa.
- Si una persona llega con `galeria.html#viaje` (carga directa), la sección de destino
  DEBE existir, ser reconocible y no quedar tapada por el encabezado superpuesto.
- Si la tipografía aprobada no carga, los pies y los títulos DEBEN seguir siendo legibles
  con jerarquía clara (heredado de la base visual de la feature 001).
- Si el render científico de Gargantúa no obtiene una licencia clara en `research.md`, la
  categoría La Ciencia DEBE quedar completa sin esa imagen; ninguna imagen con licencia
  sin confirmar entra a la galería.
- Si dos ejes comparten el mismo archivo conceptual (p. ej. una imagen de Gargantúa útil
  para Mundos y para La Ciencia), la imagen se muestra en UNA sola categoría para no
  duplicar figuras; el archivo en `assets/img/` es único.

## Requirements *(mandatory)*

### Requisitos funcionales

- **FR-001**: `galeria.html` DEBE reemplazar el párrafo placeholder por una galería con
  exactamente cuatro secciones de categoría, con `id` de ancla `mundos`, `personajes`,
  `ciencia` y `viaje`, en ese orden (el mismo del menú superior).
- **FR-002**: Cada sección de categoría DEBE presentar sus imágenes como una cuadrícula
  responsive de figuras. Todas las secciones usan la misma estructura: un `<h2>` de
  categoría, un enlace a la página del eje correspondiente y una lista de `<figure>`.
- **FR-002a**: Las miniaturas DEBEN renderizarse como tiles uniformes: todas con el mismo
  `aspect-ratio` (3:2) y recorte centrado (`object-fit: cover`), en una cuadrícula
  regular. NO se usa masonry ni alturas dispares. El recorte de miniatura es aceptable
  siempre que el motivo principal de cada imagen quede en el encuadre central; la
  selección del encuadre es parte de la preparación de cada asset.
- **FR-003**: Cada imagen DEBE representarse con un `<figure>` que contiene un `<img>` con
  texto alternativo descriptivo de lo que muestra y un `<figcaption>` que describe la
  imagen e indica a qué eje pertenece.
- **FR-004**: Cada miniatura DEBE ser un enlace (`<a href>`) al archivo de imagen local
  dentro de `assets/img/`, con ruta relativa, que abre la imagen aislada (sin el recorte
  3:2 del tile, a su tamaño de archivo). NO se implementa visor modal, lightbox, zoom ni
  ningún comportamiento que requiera JavaScript nuevo. No existe una variante de mayor
  resolución: el enlace apunta al mismo archivo optimizado que usa el tile.
- **FR-005**: La galería DEBE reutilizar las imágenes ya presentes en `assets/img/`
  (features 001–004), ubicando cada una en la categoría del eje que le corresponde, sin
  crear copias del archivo.
- **FR-006**: La galería DEBE sumar entre 2 y 4 imágenes nuevas por categoría. Cada imagen
  nueva DEBE almacenarse como archivo local en `assets/img/`, con nombre en kebab-case,
  minúsculas y sin acentos, referenciada con ruta relativa.
- **FR-007**: Cada imagen nueva DEBE tener su fuente, URL de origen, licencia/condiciones
  y atribución registradas en `assets/img/CREDITOS.md` (fila con estado `descargado`) y
  una línea espejo en el array `ASSET_CREDITS` de `creditos.html` (sincronía 1:1 exigida
  por `CREDITOS.md`). Ninguna imagen con licencia sin confirmar entra a la galería.
- **FR-008**: Cada imagen (reutilizada o nueva) DEBE pesar 250 KB o menos, en formato
  JPEG. El peso total de `galeria.html` (suma de todas las imágenes que referencia) DEBE
  ser 4 MB o menos. Si el sourcing de imágenes nuevas hace superar ese tope, se reduce la
  cantidad de imágenes por categoría (mínimo 2 nuevas por categoría, FR-006) antes que
  elevar el tope.
- **FR-008a**: Cada `<img>` de miniatura de la galería DEBE llevar `loading="lazy"` para
  diferir la carga de las imágenes fuera del viewport. Es atributo nativo del navegador;
  no se agrega JavaScript ni tooling (Principio I).
- **FR-009**: El encabezado de cada categoría DEBE incluir un enlace a la página del eje
  correspondiente: Mundos → `mundos.html`, Personajes → `personajes.html`, La Ciencia →
  `ciencia.html`, El Viaje → `viaje.html` (rutas relativas).
- **FR-010**: La página DEBE conservar el layout compartido inyectado (encabezado,
  navegación y pie comunes), la base visual por tokens y una única región `<main>`; no
  DEBE duplicar ni redefinir el encabezado o el pie.
- **FR-011**: La estructura DEBE ser semántica y jerárquica: un único `<h1>` de página, un
  `<h2>` por categoría, elementos de sección con su `id` de ancla, y `<figure>` /
  `<figcaption>` para cada imagen. Un `<div>` solo es aceptable como contenedor de layout
  sin significado.
- **FR-012**: La experiencia DEBE adaptarse sin pérdida de contenido a viewports desde
  320 px hasta escritorio, sin desplazamiento horizontal involuntario; la cuadrícula
  colapsa a una columna en anchos chicos y ninguna imagen desborda su contenedor.
- **FR-013**: El recorrido completo de `galeria.html` (carga, scroll, apertura de anclas,
  activación de miniaturas) DEBE finalizar sin errores en la consola del navegador.
- **FR-014**: La página NO DEBE introducir un segundo color saturado además del naranja de
  Gargantúa; cualquier acento se toma de la paleta ya aprobada (feature 001).
- **FR-015**: La página NO DEBE incluir animaciones, efectos de scroll, campos de
  estrellas ni el relato del viaje de la Endurance; eso pertenece a la capa "atmósfera" y
  a la especificación de la animación del viaje.
- **FR-016**: La página NO DEBE incluir lógica JavaScript propia más allá de la inyección
  del layout compartido que ya usan todas las páginas; es capa exclusivamente
  presentacional (Principio V: se valida por criterios de aceptación, no con tests).
- **FR-017**: Las cuatro anclas (`#mundos`, `#personajes`, `#ciencia`, `#viaje`) DEBEN
  resolver mediante carga directa (por ejemplo `galeria.html#ciencia`) y quedar utilizables
  por debajo del encabezado, conservando la compensación de scroll de la base.
- **FR-018**: Si una imagen no carga, su `<figure>` DEBE degradar a un fondo coherente con
  la paleta sin romper la cuadrícula; el `<figcaption>` permanece legible.

### Entidades clave

- **Categoría de galería**: una de las cuatro agrupaciones, alineada 1:1 con un eje del
  sitio. Atributos: identificador de ancla (`mundos`, `personajes`, `ciencia`, `viaje`),
  nombre visible ("Mundos", "Personajes", "La Ciencia", "El Viaje"), enlace a la página
  del eje, y una colección ordenada de ítems de imagen. Orden de presentación: Mundos →
  Personajes → La Ciencia → El Viaje.
- **Ítem de imagen**: una entrada de la galería. Atributos: id del asset (coincide con
  `CREDITOS.md`), nombre de archivo local, texto alternativo, pie (qué muestra + eje),
  categoría a la que pertenece, y si es reutilizada (features 001–004) o nueva de esta
  feature.
- **Crédito de imagen**: por cada imagen nueva, la fuente, el enlace de origen, la
  licencia/condiciones y la atribución requerida, registrados en `assets/img/CREDITOS.md`
  y expuestos en `creditos.html` (misma estructura que las features 001–004).

## Success Criteria *(mandatory)*

### Resultados medibles

- **SC-001**: `galeria.html` presenta las cuatro categorías (Mundos, Personajes, La
  Ciencia, El Viaje) con contenido real; ningún texto placeholder permanece en la página.
- **SC-002**: El 100 % de las imágenes que el sitio ya usaba en las páginas de los cuatro
  ejes (features 001–004) aparece en la galería, en la categoría correcta, sin archivos
  duplicados en `assets/img/`.
- **SC-003**: Cada categoría suma entre 2 y 4 imágenes nuevas; la galería tiene en total al
  menos 24 imágenes.
- **SC-004**: El 100 % de las imágenes nuevas está en formato local con ruta relativa,
  pesa 250 KB o menos, y tiene su fila en `assets/img/CREDITOS.md` (estado `descargado`) y
  su línea espejo en `ASSET_CREDITS` de `creditos.html`. La verificación de sincronía 1:1
  no encuentra filas huérfanas en ninguno de los dos sentidos.
- **SC-005**: En pruebas a 320 px, 768 px y 1280 px de ancho, toda la galería permanece
  dentro del viewport, sin recorte de los pies ni desplazamiento horizontal involuntario;
  la cuadrícula muestra una sola columna a 320 px. El recorte de las miniaturas por
  `object-fit: cover` es esperado (FR-002a) y no cuenta como defecto; la imagen enlazada
  se ve aislada y sin recortar.
- **SC-006**: La carga directa de las cuatro anclas (`#mundos`, `#personajes`, `#ciencia`,
  `#viaje`) lleva en el 100 % de los casos a una categoría reconocible y utilizable por
  debajo del encabezado.
- **SC-007**: El recorrido completo de `galeria.html` finaliza sin errores en consola en
  las dos versiones más recientes de Chrome, Edge y Firefox (Safari fuera del alcance de
  verificación, conforme a la enmienda 2026-08-28 de la feature 001).
- **SC-008**: Desde cualquier imagen, en dos pasos (activar miniatura → ver la imagen
  aislada sin recorte; y seguir el enlace del pie → encontrarla en `creditos.html`) una
  persona obtiene la imagen sin recortar y su atribución.
- **SC-009**: El enlace del encabezado de cada una de las cuatro categorías lleva a la
  página del eje correcto (`mundos.html`, `personajes.html`, `ciencia.html`, `viaje.html`).
- **SC-010** *(verificación blanda, no bloqueante)*: En una revisión con tres personas, las
  tres identifican sin ayuda a qué eje pertenece una imagen elegida al azar, leyendo solo
  su pie. Si no se alcanza, se ajustan los pies y se re-verifica, sin frenar la entrega.
- **SC-011**: El peso total de `galeria.html` (documento + CSS + todas las imágenes que
  referencia) es 4 MB o menos, y el 100 % de las miniaturas de la galería lleva
  `loading="lazy"`.

## Assumptions

- La feature 005 se construye sobre las features 001–004 (todas fusionadas): reutiliza el
  módulo de inyección de layout, los tokens de `css/global.css`, el pie con el enlace a
  `creditos.html`, el array `ASSET_CREDITS` de `js/creditos.js` y la compensación de
  scroll de anclas. No re-implementa nada de eso.
- Categorías = los cuatro ejes del menú, sin una quinta agrupación. El póster/logo de la
  película y el render científico de Gargantúa NO son categorías; el render puede sumarse a
  "La Ciencia" solo si su licencia se aclara en `research.md`.
- Reparto de las 15 imágenes reutilizadas por categoría (ajustable en `plan.md`):
  Mundos → `mundos-tierra`, `mundos-gargantua`, `mundos-miller`, `mundos-mann`,
  `mundos-tesseract`; Personajes → `personajes-cooper`, `personajes-murph`,
  `personajes-brand`, `personajes-profesor-brand`, `personajes-mann`,
  `personajes-tars-case`, `personajes-astronauta`; La Ciencia → `ciencia-agujero-negro`,
  `hero-backdrop` (M87); El Viaje → `viaje-pilares-de-creacion`. El reparto de las 13
  nuevas está en `research.md` D5.
- Imágenes nuevas: **13 en total** (Mundos 4, El Viaje 3, Personajes 3, La Ciencia 3),
  dentro del tope de 4 MB de la página (FR-008) — suman ~1,5 MB. Fuente única: FILMGRAB
  (`film-grab.com`), fotogramas de la película, uso académico con atribución
  `© Warner Bros. Pictures / Paramount Pictures` (misma política que features 002/003).
  fancaps.net se evaluó y descartó (solo cubre los primeros ~50 min de la película; ver
  `research.md` D1). El manifiesto completo (id, archivo, still de origen, dimensión, peso,
  categoría) está en `research.md` D4. **Las 13 ya están descargadas, optimizadas a JPEG
  ≤ 250 KB (Pillow, cap 1280 px, sin tooling nuevo en el repo) y registradas en
  `CREDITOS.md` + `ASSET_CREDITS`**; la fase de implementación solo las maqueta en
  `galeria.html`.
- Formato JPEG para todas las imágenes (enmienda aprobada de la feature 001). La
  conversión a WebP queda como mejora opcional para una ronda posterior con herramienta
  externa.
- La galería es capa presentacional pura: sin filtro interactivo, sin lightbox, sin
  módulo JS. Un filtro por categoría con JavaScript queda registrado como posible mejora
  futura, con su propia spec y TDD (Principio V).
- La cuadrícula se resuelve con CSS Grid/Flexbox. Si hace falta CSS específico de página se
  decide en `plan.md` entre una sección nueva en `css/global.css` o un `css/galeria.css`;
  toda la paleta y los valores reutilizables siguen viviendo como variables en `:root`.
- Los pies se redactan en español, con tono descriptivo y cinematográfico. No requieren
  verificación científica ni etiquetas de rigor (eso es del eje La Ciencia).
- Solo se modifican `galeria.html`, `assets/img/` (imágenes nuevas), `assets/img/CREDITOS.md`,
  `js/creditos.js` (nuevas entradas en `ASSET_CREDITS`) y, si `plan.md` lo decide,
  `css/global.css` o un `css/galeria.css` nuevo. Las páginas de los ejes y el resto de los
  placeholders (`minijuegos.html`, `trailer.html`) siguen igual.
- Se asume JavaScript habilitado para la inyección del layout compartido (misma asunción
  que las features 001–004).

## Dependencies

- Features 001 (layout compartido, navegación, base visual, pie con enlace a créditos),
  002, 003 y 004 (patrón de contenido por eje, política de imágenes, `CREDITOS.md` y
  `ASSET_CREDITS`), todas fusionadas en `main`.
- Archivo `galeria.html` y su entrada en `NavConfig` (`js/nav-data.js`) ya presentes.
- Las 15 imágenes de features 001–004 ya descargadas en `assets/img/` y registradas en
  `CREDITOS.md` / `creditos.html`, más las 13 nuevas de esta feature (ver `research.md`).
  Total en el catálogo: 28.
