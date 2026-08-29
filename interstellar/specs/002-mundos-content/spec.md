# Feature Specification: Contenido del eje Mundos

**Feature Branch**: `feat/002-mundos-content`

**Created**: 2026-08-28

**Status**: Draft

**Input**: User description: "Contenido del eje Mundos: desarrollar las 5 secciones ancla de mundos.html (La Tierra, Gargantúa, Planeta de Miller, Planeta de Mann, El Tesseract) con contenido real que reemplace los placeholders de la feature 001. Cada mundo debe presentar: una descripción de qué es y su rol en la trama de Interstellar, sus características visuales y físicas relevantes (agua y olas gigantes en Miller, hielo y nubes congeladas en Mann, disco de acreción en Gargantúa, la biblioteca infinita del Tesseract, la Tierra afectada por la plaga y las tormentas de polvo), un backdrop del catálogo aprobado de proyecto-interstellar-base.md con su atribución en el pie. Mantiene intactos el layout compartido, la navegación, la base visual por tokens y las anclas ya definidas (#tierra #gargantua #miller #mann #tesseract). No incluye contenido científico detallado con etiquetas de rigor (eso es del eje La Ciencia) ni animaciones (eso es la spec de la Endurance). Debe respetar la constitución: HTML semántico, sin frameworks, imágenes WebP locales con atribución, responsive desde 320px, sin errores de consola."

## Clarifications

### Session 2026-08-28

- Q: ¿Cada sección de mundo lleva una sola imagen de fondo o una galería por mundo? → A: Una imagen (backdrop) por mundo; 5 en total. Las galerías multi-imagen quedan fuera de alcance (candidatas a una feature posterior o a `galeria.html`).
- Q: ¿El texto de cada mundo sigue una sub-estructura fija o es prosa libre? → A: Sub-estructura fija por mundo: «Qué es» y «En la historia» como bloques con `<h3>` y uno o más párrafos; «Rasgos distintivos» como lista. Las cinco secciones usan la misma plantilla.
- Q: ¿Qué presupuesto de peso para los 5 backdrops de la página? → A: ≤250 KB por imagen y ≤1,2 MB sumando las cinco imágenes; WebP a resolución de escritorio.
- Q: ¿El chequeo de comprensión con 3 personas (SC-006) es puerta obligatoria o verificación blanda? → A: Verificación blanda, no bloqueante: se corre y se registran observaciones; si falla, se ajusta el texto, pero no frena la entrega. A diferencia de SC-010 de la feature 001, no es puerta de aceptación.

### Session 2026-08-29

- Q: ¿Qué formato de imagen usa la feature 002 para los backdrops de Mundos? → A: JPEG, alineado con la enmienda formal aprobada de la feature 001 (2026-08-28, `assets/img/CREDITOS.md`): el catálogo aprobado sirve JPG/TIF y no hay conversión sin agregar tooling (Principio I). El presupuesto de peso (≤250 KB por imagen, ≤1,2 MB total) se mantiene igual.
- Q: ¿Qué política de licencia aplica al backdrop de Gargantúa? → A: Preferir imagen de agujero negro de licencia clara (NASA/ESA). Si se usa un still de la película para el disco de acreción, se admite bajo uso académico con atribución `© Warner Bros. Pictures`, registrado en `CREDITOS.md` (política del documento base, ya aplicada en la feature 001). El render del paper arXiv 1502.03808 queda descartado (licencia de republicación sin verificar).
- Q: ¿El tope de peso de 250 KB por imagen y el de 1,2 MB total son ambos alcanzables? → A: El tope que gobierna es el total (1,2 MB). Con `mundos-tierra.jpg` (~229 KB) ya presente, los cuatro backdrops nuevos comparten ≈970 KB (≈243 KB de promedio); 250 KB es el techo absoluto por imagen. Si la suma se excede, se recomprime.

## User Scenarios & Testing *(mandatory)*

### Historia de usuario 1 - Conocer cada mundo de Interstellar (Prioridad: P1)

Como visitante, quiero leer en `mundos.html` una explicación real de cada uno de los cinco mundos de la película para entender qué es cada lugar y qué papel cumple en la historia, sin depender de haber visto Interstellar.

**Por qué esta prioridad**: Es el valor central de la feature. Convierte los cinco placeholders "Sección futura dedicada a…" en contenido que informa; sin esto, el eje Mundos sigue siendo un esqueleto navegable pero vacío.

**Prueba independiente**: Se puede probar abriendo `mundos.html`, recorriendo las cinco secciones ancla y verificando que cada una describe qué es el mundo, su rol en la trama y sus rasgos distintivos, sin que quede ningún texto placeholder.

**Escenarios de aceptación**:

1. **Dado** que una persona abre `mundos.html`, **Cuando** lee la sección de un mundo cualquiera, **Entonces** encuentra (a) qué es el lugar, (b) su rol en la trama de Interstellar y (c) al menos un rasgo visual o físico distintivo, y no ve el texto "Sección futura dedicada a…".
2. **Dado** que una persona no vio la película, **Cuando** termina de leer una sección de mundo, **Entonces** puede explicar en una frase qué es ese mundo y por qué aparece en la historia.
3. **Dado** que una persona activa un destino anidado del submenú Mundos (por ejemplo "Gargantúa"), **Cuando** llega a la sección `#gargantua`, **Entonces** encuentra el contenido real de ese mundo, reconocible y ubicado por debajo del encabezado.
4. **Dado** que una persona recorre las cinco secciones, **Cuando** compara sus textos, **Entonces** cada mundo tiene contenido propio y diferenciado (Tierra: plaga y tormentas de polvo; Miller: océano global y olas montañosas; Mann: superficie helada y nubes congeladas; Gargantúa: agujero negro con disco de acreción; Tesseract: estructura del tiempo tras la estantería de Murph).

---

### Historia de usuario 2 - Ver cada mundo con su identidad visual (Prioridad: P2)

Como visitante, quiero que cada mundo tenga una imagen de fondo cinematográfica propia y coherente con la película para reconocer visualmente el lugar y percibir su "clima" antes de leer.

**Por qué esta prioridad**: El impacto visual es un objetivo explícito del proyecto y de la cátedra. Depende del contenido textual (P1) para tener dónde apoyarse, pero se evalúa como una capa independiente.

**Prueba independiente**: Se puede probar cargando `mundos.html` en mobile y desktop y verificando que cada sección de mundo muestra un backdrop distinto, oscurecido para legibilidad, con su fuente acreditada en el pie común.

**Escenarios de aceptación**:

1. **Dado** que una persona abre una sección de mundo, **Cuando** aparece el bloque, **Entonces** ve un backdrop propio de ese mundo, distinto del de los otros cuatro, con tratamiento de oscurecimiento que mantiene el texto legible.
2. **Dado** que una persona busca la procedencia de una imagen, **Cuando** revisa el pie común, **Entonces** encuentra la fuente, la atribución y las condiciones de uso de cada backdrop de Mundos.
3. **Dado** que el backdrop de un mundo no puede cargarse, **Cuando** se muestra la sección, **Entonces** el texto conserva jerarquía y legibilidad sobre un fondo coherente con la paleta del sitio.
4. **Dado** que una persona abre la página a 320 px de ancho, **Cuando** recorre las secciones, **Entonces** ninguna imagen desborda el viewport ni genera desplazamiento horizontal involuntario.

---

### Historia de usuario 3 - Seguir navegando y compartiendo sin fricción (Prioridad: P3)

Como visitante, quiero que al agregar el contenido de Mundos se conserven la navegación común, las anclas y la coherencia visual del resto del sitio para moverme y compartir secciones concretas igual que antes.

**Por qué esta prioridad**: Protege lo entregado por la feature 001. Es una garantía de no-regresión más que una capacidad nueva.

**Prueba independiente**: Se puede probar recorriendo `mundos.html` junto con otra página del sitio y verificando que el encabezado, el submenú, el pie y los estados de foco siguen comportándose igual, y que las cinco anclas resuelven con carga directa.

**Escenarios de aceptación**:

1. **Dado** que una persona compara `mundos.html` con otra página superior, **Cuando** observa encabezado, navegación y pie, **Entonces** los encuentra idénticos en contenido y comportamiento.
2. **Dado** que una persona abre directamente `mundos.html#mann`, **Cuando** carga la página, **Entonces** la sección de Mann queda visible y usable por debajo del encabezado superpuesto.
3. **Dado** que una persona recorre la página con teclado, **Cuando** enfoca enlaces y controles, **Entonces** el indicador de foco sigue visible y el orden de tabulación sigue la secuencia del contenido.

---

### Casos límite

- Si el backdrop de un mundo no carga, el contenido principal DEBE conservar legibilidad y jerarquía sobre un fondo coherente con la paleta.
- Si el viewport tiene 320 px de ancho, el texto y las imágenes de cada mundo DEBEN permanecer dentro del viewport, sin recorte de contenido ni desplazamiento horizontal involuntario.
- Si el texto de una sección es extenso, la maquetación NO DEBE romper el layout compartido ni desplazar las anclas de las demás secciones.
- Si una persona llega con una URL con ancla directa, la sección de destino DEBE existir, ser reconocible y no quedar tapada por el encabezado.
- Si la tipografía aprobada no carga, el texto DEBE seguir siendo legible con jerarquía clara (heredado de la base visual de la feature 001).
- Si una imagen es puramente decorativa, su alternativa textual DEBE ser vacía; si aporta información, DEBE tener texto alternativo descriptivo.

## Requirements *(mandatory)*

### Requisitos funcionales

- **FR-001**: `mundos.html` DEBE reemplazar el texto placeholder de las cinco secciones (`#tierra`, `#gargantua`, `#miller`, `#mann`, `#tesseract`) por contenido real, conservando exactamente los mismos identificadores de ancla.
- **FR-002**: Cada sección de mundo DEBE seguir la misma plantilla de tres bloques: «Qué es» (bloque con `<h3>` y uno o más párrafos que describen el lugar), «En la historia» (bloque con `<h3>` y uno o más párrafos sobre su rol en la trama de Interstellar) y «Rasgos distintivos» (bloque con `<h3>` y una lista de rasgos visuales y físicos característicos). Las cinco secciones DEBEN usar los tres bloques.
- **FR-003**: El contenido de cada mundo DEBE cubrir sus elementos característicos reconocibles: La Tierra (plaga de cultivos / *blight*, tormentas de polvo, colapso de la agricultura); Planeta de Miller (océano que cubre el planeta, olas del tamaño de montañas, proximidad extrema a Gargantúa); Planeta de Mann (superficie de hielo, nubes congeladas, aparente habitabilidad); Gargantúa (agujero negro supermasivo, disco de acreción, horizonte de eventos, distorsión visual por lente gravitacional); El Tesseract (estructura que representa el tiempo como espacio recorrible, ubicada tras la estantería de la habitación de Murph).
- **FR-004**: Cada sección de mundo DEBE mostrar un backdrop propio, distinto de los otros cuatro, proveniente del catálogo de fuentes de `/proyecto-interstellar-base.md`.
- **FR-005**: Cada backdrop DEBE recibir el tratamiento de oscurecimiento definido por el token `--backdrop-oscurecer` de la base visual, y el texto superpuesto DEBE conservar contraste legible sin depender de una zona clara específica de la imagen.
- **FR-006**: Cada imagen incorporada DEBE tener su fuente, atribución y condiciones de uso registradas de forma visible o accesible desde el pie común (mecanismo `FooterContent.imageSources` de la feature 001).
- **FR-007**: Las imágenes DEBEN almacenarse como archivos JPEG locales en `assets/img/` (formato del catálogo aprobado; enmienda de la feature 001), referenciadas con rutas relativas y con nombres en kebab-case, minúsculas y sin acentos. Cada backdrop DEBE pesar 250 KB o menos (tope por imagen). El **tope que gobierna** es la suma de los cinco backdrops de la página: DEBE ser 1,2 MB o menos; como `mundos-tierra.jpg` ya existe (~229 KB), los cuatro backdrops nuevos comparten un presupuesto de ≈970 KB (≈243 KB de promedio). Si la suma se excede, se recomprime `mundos-tierra.jpg` o los backdrops nuevos hasta cumplir.
- **FR-008**: La página DEBE conservar el layout compartido inyectado (encabezado, navegación y pie comunes), la base visual por tokens y una única región `<main>`; no DEBE duplicar ni redefinir el encabezado o el pie.
- **FR-009**: La página NO DEBE incluir textos científicos detallados ni etiquetas de nivel de rigor (`✓` / `~` / `✎`); esos contenidos pertenecen al eje La Ciencia.
- **FR-010**: La página NO DEBE incluir animaciones, efectos de scroll ni el relato escena por escena del viaje de la Endurance; eso pertenece a la especificación de la animación del viaje.
- **FR-011**: La estructura DEBE ser semántica y jerárquica: un único `<h1>` de página, un `<h2>` por mundo, un `<h3>` por cada uno de los tres bloques de la plantilla (FR-002), elementos de sección con su `id` de ancla, y `<figure>`/`<img>` con alternativa textual adecuada según sea informativa o decorativa.
- **FR-012**: La experiencia DEBE adaptarse sin pérdida de contenido a viewports desde 320 px hasta escritorio, sin desplazamiento horizontal involuntario, y las imágenes no DEBEN desbordar su contenedor.
- **FR-013**: El recorrido completo de `mundos.html` (carga, scroll, apertura de anclas) DEBE finalizar sin errores en la consola del navegador.
- **FR-014**: Si se agrega un acento de color por mundo para reforzar su "clima visual", ese acento DEBE tomarse de la paleta ya aprobada (feature 001) — sin introducir un segundo color saturado además del naranja de Gargantúa. La diferenciación visual mínima entre mundos ya la garantiza el backdrop propio de FR-004.
- **FR-015**: Las cinco anclas DEBEN seguir resolviendo mediante carga directa (por ejemplo `mundos.html#gargantua`) y quedar utilizables por debajo del encabezado, conservando la compensación de scroll de la base.

### Entidades clave

- **Mundo**: una de las cinco escenas-destino del eje. Atributos: identificador de ancla (`tierra`, `gargantua`, `miller`, `mann`, `tesseract`), nombre visible ("La Tierra", "Gargantúa", "Planeta de Miller", "Planeta de Mann", "El Tesseract"), bloque «Qué es», bloque «En la historia», lista de «Rasgos distintivos», backdrop asociado y su atribución. Orden de presentación: Tierra → Gargantúa → Miller → Mann → Tesseract (el mismo del documento y de la feature 001).
- **Crédito de imagen**: por cada backdrop de Mundos, la fuente del catálogo, el enlace a la fuente y las condiciones de uso, expuestos en el pie común (misma estructura que la feature 001).

## Success Criteria *(mandatory)*

### Resultados medibles

- **SC-001**: El 100 % de las cinco secciones de `mundos.html` presenta contenido real; ningún texto placeholder ("Sección futura dedicada a…") permanece en la página.
- **SC-002**: Cada uno de los cinco mundos tiene un backdrop propio y distinto, y el 100 % de esos backdrops está acreditado en el pie común con fuente identificable.
- **SC-003**: En pruebas a 320 px, 768 px y 1280 px de ancho, todo el contenido y todas las imágenes de `mundos.html` permanecen dentro del viewport, sin recorte ni desplazamiento horizontal involuntario.
- **SC-004**: La carga directa de las cinco anclas (`#tierra`, `#gargantua`, `#miller`, `#mann`, `#tesseract`) lleva en el 100 % de los casos a una sección reconocible y utilizable por debajo del encabezado.
- **SC-005**: El recorrido completo de `mundos.html` finaliza sin errores en consola en las dos versiones más recientes de Chrome, Edge y Firefox (Safari fuera del alcance de verificación, conforme a la enmienda 2026-08-28 de la feature 001).
- **SC-006** *(verificación blanda, no bloqueante)*: En una revisión con tres personas que no hayan visto la película, al menos dos, tras leer una sección de mundo elegida al azar, pueden explicar en una frase qué es ese mundo y su papel en la historia. Si no se alcanza, se ajusta la redacción y se re-verifica, pero no frena la entrega de la feature.
- **SC-007**: En el 100 % de las secciones evaluadas en mobile y desktop, el título y el texto sobre el backdrop se leen sin depender de una zona clara específica de la imagen.
- **SC-008**: El 100 % de las imágenes nuevas de esta feature proviene del catálogo aprobado de `/proyecto-interstellar-base.md`, está en formato JPEG local con ruta relativa y tiene su atribución registrada en `assets/img/CREDITOS.md`.
- **SC-009**: La suma de los cinco backdrops de `mundos.html` (los cuatro nuevos más `mundos-tierra.jpg`) es 1,2 MB o menos, y ningún backdrop individual supera 250 KB, verificado sobre los archivos servidos.

## Assumptions

- La feature 002 se construye sobre la feature 001 (ya implementada y fusionada a `main`): reutiliza el módulo de inyección de layout, los tokens de `css/global.css`, el pie con `imageSources` y la compensación de scroll de anclas. No re-implementa nada de eso.
- El alcance es una **sección por mundo con un backdrop**; las galerías multi-imagen por mundo y la página `galeria.html` quedan fuera de esta feature (candidatas a una feature posterior).
- Los textos se redactan en español, con tono divulgativo y cinematográfico, describiendo la película. No requieren verificación contra fuentes científicas ni etiquetas de rigor: eso es responsabilidad del eje La Ciencia (Principio VI de la constitución).
- La profundidad por mundo es acotada: 1 o 2 párrafos en «Qué es», 1 o 2 en «En la historia» y 3 a 6 puntos en «Rasgos distintivos». No se busca un ensayo por mundo.
- La tipografía y la paleta aprobadas en la feature 001 se mantienen sin cambios; esta feature no introduce tokens nuevos.
- Las imágenes se sirven en JPEG, igual que el resto del sitio (enmienda aprobada de la feature 001): el catálogo aprobado entrega JPG/TIF y no se agrega tooling de conversión (Principio I).
- El backdrop de La Tierra puede reutilizar `assets/img/mundos-tierra.jpg` ya presente y acreditado (NASA, Blue Marble); si se usa tal cual, esa sección no agrega un asset nuevo.
- Solo se modifican `mundos.html` y `assets/img/` (más el registro de créditos que ya consume el pie). Las páginas de los otros ejes siguen como placeholders.
- Se asume JavaScript habilitado en el navegador para la inyección del layout compartido (misma asunción que la feature 001).
- Los "spoilers" se limitan a lo imprescindible para explicar el rol de cada mundo en la historia.
