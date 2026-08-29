# Feature Specification: Contenido del eje Personajes

**Feature Branch**: `feat/003-personajes-content`

**Created**: 2026-08-29

**Status**: Draft

**Input**: User description: "comencemos con los personajes"

## Contexto

El eje Personajes se creó como esqueleto navegable en la feature 001: `personajes.html`
existe, hereda el layout compartido y expone seis secciones ancla con texto placeholder
("Sección futura dedicada a…"). El submenú de navegación de Personajes (feature 001,
FR-006) ya ofrece exactamente seis destinos anidados: Cooper, Murph, Dr. Brand, Profesor
Brand, Mann y TARS & CASE, resueltos como anclas dentro de `personajes.html`
(`#cooper`, `#murph`, `#brand`, `#profesor-brand`, `#mann`, `#tars-case`).

Esta feature reemplaza esos placeholders por fichas reales de cada personaje, siguiendo el
mismo patrón que la feature 002 (Mundos): contenido divulgativo que describe la película,
una plantilla fija por ficha y coherencia total con el layout, la navegación y la base
visual ya entregados. No aporta contenido científico con etiquetas de rigor (eso es del
eje La Ciencia) ni animaciones (eso es la spec de la Endurance).

## Clarifications

### Session 2026-08-29

- Q: ¿Cada ficha de personaje lleva imagen propia, una compartida, o la feature es solo texto? → A: Una imagen por ficha (6 en total): stills de la película, uso académico con atribución `© Warner Bros. Pictures`, registrados en `assets/img/CREDITOS.md` — mismo criterio que la feature 002 (FILMGRAB). No hay catálogo aprobado de retratos con licencia clara, por lo que el render científico y los retratos de dominio público quedan descartados. Presupuesto: ≤250 KB por imagen.
- Q: ¿Qué sub-estructura usa cada ficha y se acredita al reparto? → A: Bloques fijos con `<h3>`, idénticos para las seis fichas: «Quién es» (párrafos que presentan al personaje), «Su papel en la historia» (párrafos sobre su rol en la trama) y «Rasgos distintivos» (lista de rasgos de carácter y de arco). Además, cada ficha lleva una línea breve de crédito con el actor o actriz que interpreta al personaje.
- Q: ¿La imagen de cada personaje es un backdrop a pantalla completa o un retrato en línea? → A: Retrato enmarcado en línea: `<figure>` con `<img>` y `<figcaption>`, maquetado junto o sobre el texto de la ficha, sin tratamiento de oscurecimiento (`--backdrop-oscurecer`). El lenguaje de backdrop a sección completa queda reservado para el eje Mundos (feature 002).
- Q: Cuando un personaje lo interpretan varios actores, ¿la línea de crédito nombra solo al principal o a todos? → A: A todos los intérpretes relevantes, con su etapa o rol entre paréntesis, en una misma línea por ficha (ej.: «Murph — Jessica Chastain (adulta), Mackenzie Foy (niña), Ellen Burstyn (anciana)»; TARS y CASE incluyen su crédito de voz con la fórmula «voz de …»). El formato es consistente en las seis fichas.
- Q: ¿Dónde vive la línea de crédito de reparto en el marcado? → A: En un elemento de texto propio de la ficha (por ejemplo un `<p>`), separado de la imagen y ubicado cerca del retrato. El `<figcaption>` solo describe la imagen (quién aparece y de qué escena). La atribución `© Warner Bros. Pictures` de cada still se expone en el pie común, igual que en las features 001 y 002.

## User Scenarios & Testing *(mandatory)*

### Historia de usuario 1 - Conocer a cada personaje de Interstellar (Prioridad: P1)

Como visitante, quiero leer en `personajes.html` una ficha real de cada uno de los seis
personajes (o grupos) del menú para entender quién es cada uno y qué papel cumple en la
misión Endurance, sin depender de haber visto Interstellar.

**Por qué esta prioridad**: Es el valor central de la feature. Convierte los seis
placeholders "Sección futura dedicada a…" en contenido que informa; sin esto, el eje
Personajes sigue siendo un esqueleto navegable pero vacío.

**Prueba independiente**: Se puede probar abriendo `personajes.html`, recorriendo las seis
secciones ancla y verificando que cada una describe quién es el personaje, su papel en la
historia y sus rasgos distintivos, sin que quede ningún texto placeholder.

**Escenarios de aceptación**:

1. **Dado** que una persona abre `personajes.html`, **Cuando** lee la sección de un
   personaje cualquiera, **Entonces** encuentra (a) quién es, (b) su papel en la trama de
   Interstellar y (c) al menos un rasgo distintivo de carácter o de arco, y no ve el texto
   "Sección futura dedicada a…".
2. **Dado** que una persona no vio la película, **Cuando** termina de leer una ficha,
   **Entonces** puede explicar en una frase quién es ese personaje y por qué importa en la
   historia.
3. **Dado** que una persona activa un destino anidado del submenú Personajes (por ejemplo
   "Dr. Brand"), **Cuando** llega a la sección `#brand`, **Entonces** encuentra la ficha
   real de Amelia Brand, reconocible y ubicada por debajo del encabezado.
4. **Dado** que una persona recorre las seis secciones, **Cuando** compara sus textos,
   **Entonces** cada ficha tiene contenido propio y diferenciado (Cooper: piloto y padre
   que parte en la misión; Murph: la hija que resuelve la ecuación de la gravedad;
   Dr. Brand: científica del Endurance e hija del Profesor; Profesor Brand: líder de la
   NASA y su "Plan A"; Mann: el científico celebrado que traiciona a la tripulación;
   TARS & CASE: los robots tácticos de la misión).

---

### Historia de usuario 2 - Distinguir a las dos figuras "Brand" y al grupo TARS & CASE (Prioridad: P2)

Como visitante, quiero que la ficha diferencie con claridad a la Dra. Amelia Brand del
Profesor John Brand, y que TARS & CASE se presenten como una sola ficha de los dos robots,
para no confundir a los personajes que comparten nombre o función.

**Por qué esta prioridad**: Es la principal fuente de ambigüedad del eje. Dos personajes
apellidados "Brand" con anclas distintas (`#brand`, `#profesor-brand`) y un destino
(`#tars-case`) que agrupa dos robots exigen un tratamiento explícito para que la navegación
y el contenido sean coherentes.

**Prueba independiente**: Se puede probar abriendo `#brand` y `#profesor-brand` por
separado y verificando que cada ficha nombra al personaje correcto, su relación entre
ambos (padre e hija) y su rol distinto; y abriendo `#tars-case` y verificando que la ficha
cubre a los dos robots y qué hace cada uno.

**Escenarios de aceptación**:

1. **Dado** que una persona abre `personajes.html#brand`, **Cuando** lee la ficha,
   **Entonces** identifica a Amelia Brand como la astrónoma de la tripulación del
   Endurance e hija del Profesor Brand, sin confundirla con su padre.
2. **Dado** que una persona abre `personajes.html#profesor-brand`, **Cuando** lee la
   ficha, **Entonces** identifica a John Brand como el líder de la NASA en la Tierra y
   entiende en qué consiste su "Plan A", distinto del rol de su hija.
3. **Dado** que una persona abre `personajes.html#tars-case`, **Cuando** lee la ficha,
   **Entonces** entiende que TARS y CASE son dos robots de la misión, con qué tripulante
   va cada uno y qué los distingue.

---

### Historia de usuario 3 - Seguir navegando y compartiendo sin fricción (Prioridad: P3)

Como visitante, quiero que al agregar el contenido de Personajes se conserven la
navegación común, las anclas y la coherencia visual del resto del sitio para moverme y
compartir secciones concretas igual que antes.

**Por qué esta prioridad**: Protege lo entregado por la feature 001. Es una garantía de
no-regresión más que una capacidad nueva.

**Prueba independiente**: Se puede probar recorriendo `personajes.html` junto con otra
página del sitio y verificando que el encabezado, el submenú, el pie y los estados de foco
siguen comportándose igual, y que las seis anclas resuelven con carga directa.

**Escenarios de aceptación**:

1. **Dado** que una persona compara `personajes.html` con otra página superior, **Cuando**
   observa encabezado, navegación y pie, **Entonces** los encuentra idénticos en contenido
   y comportamiento.
2. **Dado** que una persona abre directamente `personajes.html#mann`, **Cuando** carga la
   página, **Entonces** la sección de Mann queda visible y usable por debajo del
   encabezado superpuesto.
3. **Dado** que una persona recorre la página con teclado, **Cuando** enfoca enlaces y
   controles, **Entonces** el indicador de foco sigue visible y el orden de tabulación
   sigue la secuencia del contenido.

---

### Casos límite

- Si la imagen de un personaje no carga, el contenido principal DEBE conservar legibilidad
  y jerarquía sobre un fondo coherente con la paleta.
- Si el viewport tiene 320 px de ancho, el texto y cualquier imagen de cada ficha DEBEN
  permanecer dentro del viewport, sin recorte de contenido ni desplazamiento horizontal
  involuntario.
- Si el texto de una ficha es extenso, la maquetación NO DEBE romper el layout compartido
  ni desplazar las anclas de las demás secciones.
- Si una persona llega con una URL con ancla directa, la sección de destino DEBE existir,
  ser reconocible y no quedar tapada por el encabezado.
- Si la tipografía aprobada no carga, el texto DEBE seguir siendo legible con jerarquía
  clara (heredado de la base visual de la feature 001).
- Si una imagen es puramente decorativa, su alternativa textual DEBE ser vacía; si aporta
  información, DEBE tener texto alternativo descriptivo.
- El personaje del Dr. Mann implica una revelación central de la trama; el texto DEBE
  poder explicar su papel sin exceder el mínimo de spoiler imprescindible (misma política
  que la feature 002).

## Requirements *(mandatory)*

### Requisitos funcionales

- **FR-001**: `personajes.html` DEBE reemplazar el texto placeholder de las seis secciones
  (`#cooper`, `#murph`, `#brand`, `#profesor-brand`, `#mann`, `#tars-case`) por contenido
  real, conservando exactamente los mismos identificadores de ancla y el mismo orden.
- **FR-002**: Cada ficha DEBE seguir la misma plantilla de tres bloques, idéntica para las
  seis secciones: «Quién es» (bloque con `<h3>` y uno o más párrafos que presentan al
  personaje), «Su papel en la historia» (bloque con `<h3>` y uno o más párrafos sobre su
  rol en la trama de Interstellar) y «Rasgos distintivos» (bloque con `<h3>` y una lista
  de rasgos de carácter y de arco). Además, cada ficha DEBE incluir una línea de crédito
  de reparto que nombre a **todos** los intérpretes relevantes del personaje, con su etapa
  o rol entre paréntesis (por ejemplo, las tres actrices de Murph; la voz de TARS y la de
  CASE con la fórmula «voz de …»). Esa línea DEBE ir en un elemento de texto propio de la
  ficha (no dentro del `<figcaption>`), cerca del retrato, con formato consistente en las
  seis fichas.
- **FR-003**: El contenido de cada ficha DEBE cubrir sus elementos reconocibles:
  **Cooper** (ex piloto de la NASA reconvertido en agricultor; padre de Murph y Tom;
  pilota el Endurance a través del agujero de gusano; su motor es la promesa de volver con
  Murph; termina dentro del Tesseract);
  **Murph** (de niña cree que hay un "fantasma" en su habitación; de adulta es científica
  de la NASA junto al Profesor Brand; resuelve la ecuación de la gravedad con los datos que
  Cooper le transmite; el resentimiento por el abandono de su padre marca su arco);
  **Dr. Brand** (Amelia Brand, astrónoma de la tripulación del Endurance, hija del Profesor
  Brand; defiende seguir a Edmunds; sobrevive y queda estableciendo el Plan B en el planeta
  de Edmunds);
  **Profesor Brand** (John Brand, líder de la NASA clandestina; mentor; trabaja en el
  "Plan A" —la ecuación de la gravedad para despegar las estaciones de la Tierra— y
  confiesa en su lecho de muerte que el Plan A no era viable sin datos del interior de un
  agujero negro y que el Plan B —embriones— era siempre el plan real);
  **Mann** (Dr. Mann, "el mejor de nosotros", científico célebre de las misiones Lazarus;
  falsificó sus datos para que lo rescataran de un planeta helado inhabitable; intenta
  matar a Cooper y muere en un acoplamiento fallido; encarna el instinto de supervivencia
  y la cobardía bajo aislamiento);
  **TARS & CASE** (robots tácticos ex-Marines, de diseño monolítico, con ajustes de humor y
  sinceridad; TARS acompaña a Cooper —sarcástico y leal—, CASE queda con Brand; TARS se
  lanza a Gargantúa para recoger los datos cuánticos).
- **FR-004**: Las fichas de Dr. Brand (`#brand`) y Profesor Brand (`#profesor-brand`)
  DEBEN dejar explícita la relación padre-hija y el rol distinto de cada uno, de modo que
  ninguna de las dos pueda confundirse con la otra.
- **FR-005**: La ficha `#tars-case` DEBE presentar a TARS y a CASE como dos robots de la
  misión dentro de una única sección, indicando con qué tripulante va cada uno y qué los
  distingue.
- **FR-006**: Cada ficha DEBE mostrar una imagen propia del personaje (still de la
  película), distinta de las otras cinco, como **retrato enmarcado en línea**: un
  `<figure>` con `<img>` y `<figcaption>`, maquetado junto o sobre el texto de la ficha.
  La imagen NO lleva tratamiento de oscurecimiento y el texto de la ficha NO se superpone
  sobre ella; el patrón de backdrop a sección completa (`eje-con-backdrop`,
  `--backdrop-oscurecer`) NO se usa en este eje. Las seis imágenes provienen de material
  de la película bajo uso académico con atribución `© Warner Bros. Pictures` (misma
  fuente y política que la feature 002). Si la imagen no carga, el `<figure>` DEBE
  degradar a un fondo coherente con la paleta sin romper la maqueta de la ficha.
- **FR-007**: Cada imagen DEBE almacenarse como archivo local en `assets/img/` (formato
  del catálogo aprobado; enmienda de la feature 001), referenciada con ruta relativa, con
  nombre en kebab-case, minúsculas y sin acentos (por ejemplo `personajes-cooper.jpg`), y
  DEBE tener su fuente, atribución y condiciones de uso registradas en
  `assets/img/CREDITOS.md` y expuestas desde el pie común (mecanismo
  `FooterContent.imageSources` de la feature 001). Cada imagen DEBE pesar 250 KB o menos;
  el presupuesto total de la página se fija en la fase de planificación, alineado con el
  criterio de la feature 002.
- **FR-008**: La página DEBE conservar el layout compartido inyectado (encabezado,
  navegación y pie comunes), la base visual por tokens y una única región `<main>`; no
  DEBE duplicar ni redefinir el encabezado o el pie.
- **FR-009**: La página NO DEBE incluir textos científicos detallados ni etiquetas de
  nivel de rigor (`✓` / `~` / `✎`); esos contenidos pertenecen al eje La Ciencia.
- **FR-010**: La página NO DEBE incluir animaciones, efectos de scroll ni el relato escena
  por escena del viaje de la Endurance; eso pertenece a la especificación de la animación
  del viaje.
- **FR-011**: La estructura DEBE ser semántica y jerárquica: un único `<h1>` de página, un
  `<h2>` por personaje o grupo, un `<h3>` por cada uno de los tres bloques de la plantilla
  (FR-002), elementos de sección con su `id` de ancla, y `<figure>` con `<img>` (alternativa
  textual descriptiva del personaje que muestra) y `<figcaption>` que describe la imagen
  (quién aparece y de qué escena). La línea de crédito de reparto NO va en el `<figcaption>`:
  es un elemento de texto propio de la ficha (FR-002).
- **FR-012**: La experiencia DEBE adaptarse sin pérdida de contenido a viewports desde
  320 px hasta escritorio, sin desplazamiento horizontal involuntario, y las imágenes no
  DEBEN desbordar su contenedor.
- **FR-013**: El recorrido completo de `personajes.html` (carga, scroll, apertura de
  anclas) DEBE finalizar sin errores en la consola del navegador.
- **FR-014**: Si se agrega un acento de color por ficha, ese acento DEBE tomarse de la
  paleta ya aprobada (feature 001) — sin introducir un segundo color saturado además del
  naranja de Gargantúa.
- **FR-015**: Las seis anclas DEBEN seguir resolviendo mediante carga directa (por ejemplo
  `personajes.html#profesor-brand`) y quedar utilizables por debajo del encabezado,
  conservando la compensación de scroll de la base.
- **FR-016**: El texto DEBE limitar los spoilers a lo imprescindible para explicar el rol
  de cada personaje en la historia (misma política que la feature 002), en particular en
  las fichas de Mann y del Profesor Brand.

### Entidades clave

- **Personaje (ficha)**: una de las seis entradas del eje. Atributos: identificador de
  ancla (`cooper`, `murph`, `brand`, `profesor-brand`, `mann`, `tars-case`), nombre
  visible ("Cooper", "Murph", "Dr. Brand", "Profesor Brand", "Mann", "TARS & CASE"),
  bloque «Quién es», bloque «Su papel en la historia», lista de «Rasgos distintivos»,
  crédito de reparto (todos los intérpretes relevantes, con etapa o rol) e imagen asociada
  con su atribución. Orden de
  presentación: Cooper → Murph → Dr. Brand → Profesor Brand → Mann → TARS & CASE (el mismo
  del submenú de la feature 001).
- **Crédito de imagen**: por cada imagen de personaje, la fuente, el enlace de origen y las
  condiciones de uso (`© Warner Bros. Pictures`, uso académico con atribución),
  registrados en `assets/img/CREDITOS.md` y expuestos en el pie común (misma estructura que
  las features 001 y 002).

## Success Criteria *(mandatory)*

### Resultados medibles

- **SC-001**: El 100 % de las seis secciones de `personajes.html` presenta contenido real;
  ningún texto placeholder ("Sección futura dedicada a…") permanece en la página.
- **SC-002**: Cada una de las seis fichas usa la misma plantilla de bloques, verificable
  comparando su estructura de encabezados.
- **SC-003**: En pruebas a 320 px, 768 px y 1280 px de ancho, todo el contenido y todas
  las imágenes de `personajes.html` permanecen dentro del viewport, sin recorte ni
  desplazamiento horizontal involuntario.
- **SC-004**: La carga directa de las seis anclas (`#cooper`, `#murph`, `#brand`,
  `#profesor-brand`, `#mann`, `#tars-case`) lleva en el 100 % de los casos a una sección
  reconocible y utilizable por debajo del encabezado.
- **SC-005**: El recorrido completo de `personajes.html` finaliza sin errores en consola
  en las dos versiones más recientes de Chrome, Edge y Firefox (Safari fuera del alcance
  de verificación, conforme a la enmienda 2026-08-28 de la feature 001).
- **SC-006** *(verificación blanda, no bloqueante)*: En una revisión con tres personas que
  no hayan visto la película, al menos dos, tras leer una ficha elegida al azar, pueden
  explicar en una frase quién es ese personaje y su papel en la historia. Si no se
  alcanza, se ajusta la redacción y se re-verifica, pero no frena la entrega de la feature.
- **SC-007**: En una revisión con tres personas, las tres distinguen sin ayuda a la
  Dra. Amelia Brand del Profesor John Brand tras leer ambas fichas.
- **SC-008**: El 100 % de las seis imágenes de personaje está en formato local con ruta
  relativa y tiene su atribución (`© Warner Bros. Pictures`) registrada en
  `assets/img/CREDITOS.md`; ninguna imagen individual supera 250 KB y el total de la
  página respeta el presupuesto fijado en planificación.
- **SC-009**: Cada una de las seis fichas incluye la línea de crédito de reparto con
  todos los intérpretes relevantes del personaje y su etapa o rol; el formato es idéntico
  en las seis (verificable comparándolas). La ficha de Murph nombra a sus tres actrices y
  la de TARS & CASE incluye el crédito de voz de ambos robots.

## Assumptions

- La feature 003 se construye sobre las features 001 y 002 (ya implementadas): reutiliza el
  módulo de inyección de layout, los tokens de `css/global.css`, el pie con `imageSources`
  y la compensación de scroll de anclas. No re-implementa nada de eso.
- El conjunto de personajes y sus anclas están fijados por la feature 001: seis destinos
  (`#cooper`, `#murph`, `#brand`, `#profesor-brand`, `#mann`, `#tars-case`). Otros
  personajes (Tom, Romilly, Doyle, Donald, Edmunds) quedan fuera de alcance; pueden
  mencionarse dentro de una ficha si el relato lo exige, sin sección propia.
- Los textos se redactan en español, con tono divulgativo y cinematográfico, describiendo
  la película. No requieren verificación contra fuentes científicas ni etiquetas de rigor:
  eso es responsabilidad del eje La Ciencia (Principio VI de la constitución).
- La profundidad por ficha es acotada, en línea con la feature 002: 1 o 2 párrafos por
  bloque de prosa y 3 a 6 puntos en la lista de rasgos. No se busca un ensayo por
  personaje.
- La tipografía y la paleta aprobadas en las features 001 y 002 se mantienen sin cambios;
  esta feature no introduce tokens nuevos.
- Solo se modifican `personajes.html`, `assets/img/` (seis stills nuevos) y
  `assets/img/CREDITOS.md`. Las páginas de los otros ejes siguen como placeholders.
- Las imágenes se sirven en JPEG, igual que el resto del sitio (enmienda aprobada de la
  feature 001): no se agrega tooling de conversión (Principio I).
- Se asume JavaScript habilitado en el navegador para la inyección del layout compartido
  (misma asunción que las features 001 y 002).
- "TARS & CASE" se trata como una única ficha de dos robots, conforme al único destino
  `#tars-case` del submenú.

## Dependencies

- Features 001 (layout compartido, navegación, base visual, pie con `imageSources`) y 002
  (patrón de contenido por eje, política de imágenes y `CREDITOS.md`), ambas fusionadas.
- Archivo `personajes.html` y sus seis anclas ya presentes.
