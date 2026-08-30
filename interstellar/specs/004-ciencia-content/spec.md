# Feature Specification: Contenido del eje La Ciencia

**Feature Branch**: `feat/004-ciencia-content`

**Created**: 2026-08-29

**Status**: Draft

**Input**: User description: "Contenido del eje La Ciencia: desarrollar las 4 secciones ancla de ciencia.html (Agujeros negros, Dilatación temporal, Agujeros de gusano, Relatividad) con contenido real que reemplace los placeholders de la feature 001. Cada concepto explica la física de forma divulgativa y la contrasta con cómo aparece en Interstellar, con una etiqueta de nivel de rigor visible por afirmación (✓ Ciencia real / ~ Especulación plausible / ✎ Licencia narrativa, Principio VI de la constitución). Todo texto científico se verifica contra fuentes reales antes de redactarse: fuente principal The Science of Interstellar (Kip Thorne, 2014) y papers derivados (arXiv 1502.03808 y equivalentes); la fuente de cada dato debe poder citarse. Mantiene intactos el layout compartido, la navegación, la base visual por tokens y las anclas ya definidas. Puede reutilizar imágenes ya acreditadas (ciencia-agujero-negro.jpg) y/o incorporar nuevas del catálogo aprobado con atribución en CREDITOS.md. Respeta la constitución 1.1.0: HTML semántico, sin frameworks, sin build, rutas internas relativas (GitHub Pages), responsive desde 320px, sin errores de consola."

## Contexto

El eje La Ciencia se creó como esqueleto navegable en la feature 001: `ciencia.html`
existe, hereda el layout compartido y expone cuatro secciones ancla con texto placeholder
("Sección futura dedicada a…"). El submenú de navegación de La Ciencia (feature 001)
ya ofrece exactamente cuatro destinos anidados: Agujeros negros, Dilatación temporal,
Agujeros de gusano y Relatividad, resueltos como anclas dentro de `ciencia.html`
(`#agujeros-negros`, `#dilatacion-temporal`, `#agujeros-de-gusano`, `#relatividad`).

Esta feature reemplaza esos placeholders por explicaciones reales de cada concepto,
siguiendo el patrón de las features 002 (Mundos) y 003 (Personajes) pero con una
diferencia central: es el único eje que activa el **Principio VI** de la constitución
(Rigor Científico Verificado). Cada afirmación científica se contrasta contra fuentes
reales **antes** de escribirse y lleva una **etiqueta de nivel de rigor visible**.

## Clarifications

### Session 2026-08-29

- Q: ¿La revisión por una persona con formación en física (SC-004) es puerta bloqueante? → A: Se **elimina** la exigencia de un revisor con formación en física. La garantía de rigor queda en que **cada afirmación etiquetada se pueda contrastar contra una fuente validada** del conjunto aprobado (Thorne 2014 / arXiv 1502.03808 / AJP 83 2015) y que ninguna `✎ Licencia narrativa` esté presentada como `✓ Ciencia real`. Esa verificación la hace quien tenga las fuentes a mano, no un experto.
- Q: ¿Qué granularidad tiene la etiqueta de rigor? → A: Una etiqueta **por afirmación** (inline). Cada frase o idea con contenido científico lleva su propio `✓ Ciencia real` / `~ Especulación plausible` / `✎ Licencia narrativa`; una sección puede tener varias etiquetas de distinto nivel. No se resuelve con una etiqueta por sección.
- Q: ¿Cómo se muestran las fuentes? → A: Un bloque **«Fuentes»** visible por sección (`<h3>` + lista de 1 a 3 referencias del conjunto Thorne 2014 / arXiv 1502.03808 / AJP 83 "Visualizing Interstellar's Wormhole" 2015). Además, el mapeo afirmación→fuente se registra en `research.md` para la revisión de SC-005.
- Q: ¿Qué sub-estructura usa cada sección? → A: Dos bloques con `<h3>` — **«La ciencia»** (la física real en lenguaje divulgativo) y **«En Interstellar»** (a qué escena(s) corresponde y cómo la película lo representa) — más el bloque **«Fuentes»**. Las etiquetas de rigor van inline sobre cada afirmación dentro de «La ciencia» y «En Interstellar». Sin un bloque separado de juicio de rigor: ese juicio lo dan las etiquetas.
- Q: ¿Se agregan imágenes científicas nuevas? → A: No. La feature es **solo texto** y reutiliza `assets/img/ciencia-agujero-negro.jpg` (ya descargada y acreditada desde la feature 001) en `#agujeros-negros`. No se incorporan imágenes nuevas, no se toca `js/layout.js` ni `assets/img/CREDITOS.md`. El único archivo de sitio que cambia es `ciencia.html` (más `css/global.css` si el tratamiento visual de las etiquetas lo exige).
- Q: ¿Qué ángulo propio tiene la sección Relatividad? → A: **Marco unificador**. `#relatividad` explica qué es la relatividad general (el espacio‑tiempo se curva con la masa, no hay tiempo absoluto) y presenta a los agujeros negros, la dilatación temporal y los agujeros de gusano como **consecuencias** de ese marco. No re‑explica en profundidad esos tres conceptos: los referencia como casos derivados. Es la sección paraguas, aunque en el orden de la página vaya última.

## User Scenarios & Testing *(mandatory)*

### Historia de usuario 1 - Entender la física real detrás de Interstellar (Prioridad: P1)

Como visitante, quiero leer en `ciencia.html` una explicación divulgativa de cada uno de
los cuatro conceptos científicos de la película para entender qué es cada fenómeno y por
qué importa, sin necesitar formación en física.

**Por qué esta prioridad**: Es el valor central de la feature y el diferencial del
proyecto ("la capa educativa de ciencia real"). Convierte los cuatro placeholders en
contenido que enseña.

**Prueba independiente**: Se puede probar abriendo `ciencia.html`, recorriendo las cuatro
secciones ancla y verificando que cada una explica el concepto en lenguaje llano y lo
relaciona con una o más escenas de Interstellar, sin que quede ningún texto placeholder.

**Escenarios de aceptación**:

1. **Dado** que una persona sin formación en física abre `ciencia.html`, **Cuando** lee la
   sección de un concepto cualquiera, **Entonces** puede explicar en una o dos frases qué
   es ese fenómeno y dónde aparece en la película, y no ve el texto "Sección futura
   dedicada a…".
2. **Dado** que una persona recorre las cuatro secciones, **Cuando** compara sus textos,
   **Entonces** cada concepto tiene contenido propio y diferenciado (agujeros negros:
   horizonte de eventos, disco de acreción, lente gravitacional; dilatación temporal: por
   qué una hora en Miller equivale a años en la Tierra; agujeros de gusano: puente de
   Einstein-Rosen, atajo en el espacio-tiempo; relatividad: el marco general que une a los
   tres anteriores).
3. **Dado** que una persona activa un destino anidado del submenú La Ciencia (por ejemplo
   "Dilatación temporal"), **Cuando** llega a la sección `#dilatacion-temporal`,
   **Entonces** encuentra el contenido real de ese concepto, reconocible y ubicado por
   debajo del encabezado.

---

### Historia de usuario 2 - Distinguir ciencia real de licencia narrativa (Prioridad: P1)

Como visitante, quiero que cada afirmación esté etiquetada según su nivel de rigor
(`✓ Ciencia real` / `~ Especulación plausible` / `✎ Licencia narrativa`) para saber qué
partes de Interstellar son física establecida y cuáles son licencia del guion.

**Por qué esta prioridad**: Es lo que la constitución (Principio VI) llama "el diferencial
de madurez del proyecto". Sin las etiquetas, el contenido de HU1 sería divulgación
genérica; con ellas, es criterio. Tiene la misma prioridad que HU1 porque el Principio VI
lo exige como condición de aceptación, no como mejora.

**Prueba independiente**: Se puede probar recorriendo `ciencia.html` y verificando que
cada afirmación con contenido científico lleva una de las tres etiquetas, que las tres
etiquetas aparecen al menos una vez en la página, y que ninguna licencia narrativa está
presentada como ciencia real.

**Escenarios de aceptación**:

1. **Dado** que una persona lee una afirmación científica en cualquier sección, **Cuando**
   la termina de leer, **Entonces** encuentra junto a ella una etiqueta visible de uno de
   los tres niveles (`✓` / `~` / `✎`) con su significado identificable.
2. **Dado** que una persona recorre la página completa, **Cuando** revisa las etiquetas,
   **Entonces** encuentra las tres usadas al menos una vez (por ejemplo: la visualización
   de Gargantúa como `✓`, atravesar un agujero de gusano como `~`, la comunicación por
   gravedad del Tesseract como `✎`).
3. **Dado** que una persona revisa una afirmación etiquetada `✓ Ciencia real`, **Cuando**
   la contrasta con la fuente citada en el bloque «Fuentes» y con el mapeo de
   `research.md`, **Entonces** la afirmación tiene respaldo en esa fuente y no es una
   extrapolación del guion.
4. **Dado** que una persona busca de dónde sale un dato, **Cuando** consulta la sección o
   sus referencias, **Entonces** puede llegar a la fuente concreta (libro de Thorne o
   paper) que lo respalda.

---

### Historia de usuario 3 - Seguir navegando y compartiendo sin fricción (Prioridad: P3)

Como visitante, quiero que al agregar el contenido de La Ciencia se conserven la
navegación común, las anclas y la coherencia visual del resto del sitio para moverme y
compartir secciones concretas igual que antes.

**Por qué esta prioridad**: Protege lo entregado por las features 001–003. Es una garantía
de no-regresión más que una capacidad nueva.

**Prueba independiente**: Se puede probar recorriendo `ciencia.html` junto con otra página
del sitio y verificando que el encabezado, el submenú, el pie y los estados de foco siguen
comportándose igual, y que las cuatro anclas resuelven con carga directa.

**Escenarios de aceptación**:

1. **Dado** que una persona compara `ciencia.html` con otra página superior, **Cuando**
   observa encabezado, navegación y pie, **Entonces** los encuentra idénticos en contenido
   y comportamiento.
2. **Dado** que una persona abre directamente `ciencia.html#relatividad`, **Cuando** carga
   la página, **Entonces** la sección de Relatividad queda visible y usable por debajo del
   encabezado superpuesto.
3. **Dado** que una persona recorre la página con teclado, **Cuando** enfoca enlaces y
   controles, **Entonces** el indicador de foco sigue visible y el orden de tabulación
   sigue la secuencia del contenido.

---

### Casos límite

- Si una sección mezcla afirmaciones de distinto nivel de rigor, cada afirmación DEBE
  llevar su propia etiqueta; no se resuelve con una única etiqueta de sección que
  promedie.
- Si el viewport tiene 320 px de ancho, el texto, las etiquetas de rigor y cualquier
  imagen DEBEN permanecer dentro del viewport, sin desplazamiento horizontal involuntario.
- Si una imagen científica no puede cargarse, el texto DEBE conservar jerarquía y
  legibilidad sobre un fondo coherente con la paleta.
- Si una persona llega con una URL con ancla directa, la sección de destino DEBE existir,
  ser reconocible y no quedar tapada por el encabezado.
- Si la tipografía aprobada no carga, el texto DEBE seguir siendo legible con jerarquía
  clara (heredado de la base visual de la feature 001).
- Si un concepto no tiene una fuente verificable para una afirmación, esa afirmación NO se
  incluye (Principio VI: no se redacta de memoria).

## Requirements *(mandatory)*

### Requisitos funcionales

- **FR-001**: `ciencia.html` DEBE reemplazar el texto placeholder de las cuatro secciones
  (`#agujeros-negros`, `#dilatacion-temporal`, `#agujeros-de-gusano`, `#relatividad`) por
  contenido real, conservando exactamente los mismos identificadores de ancla y el mismo
  orden.
- **FR-002**: Cada sección DEBE seguir la misma plantilla de tres bloques, idéntica para
  las cuatro: «La ciencia» (bloque con `<h3>` y párrafos que explican la física real del
  concepto en lenguaje divulgativo), «En Interstellar» (bloque con `<h3>` y párrafos sobre
  a qué escena(s) corresponde y cómo la película lo representa) y «Fuentes» (bloque con
  `<h3>` y una lista de 1 a 3 referencias). Los tres bloques, en ese orden, en las cuatro
  secciones.
- **FR-003**: Los bloques «La ciencia» y «En Interstellar» DEBEN llevar etiquetas de nivel
  de rigor **inline** y visibles (`✓ Ciencia real`, `~ Especulación plausible`,
  `✎ Licencia narrativa`; Principio VI). **Unidad de etiquetado**: cada párrafo (`<p>`)
  con contenido científico agrupa afirmaciones de un **único** nivel de rigor y termina
  con **una** etiqueta de ese nivel; si una idea es de otro nivel, va en un párrafo aparte
  con su propia etiqueta. Una sección puede tener varias etiquetas de distinto nivel; NO
  se admite una única etiqueta de sección que promedie, ni etiquetas a mitad de frase.
- **FR-004**: Las tres etiquetas de rigor (`✓` / `~` / `✎`) DEBEN aparecer al menos una
  vez en la página, con su significado identificable para el lector (leyenda o texto
  asociado la primera vez que aparecen).
- **FR-005**: Ninguna afirmación clasificable como `✎ Licencia narrativa` DEBE presentarse
  como `✓ Ciencia real`; presentar licencia narrativa como ciencia real es un defecto de
  contenido que bloquea la aceptación (Principio VI).
- **FR-006**: El contenido de cada concepto DEBE cubrir sus elementos característicos:
  Agujeros negros (horizonte de eventos, disco de acreción, lente gravitacional /
  distorsión de la luz, singularidad; caso Gargantúa); Dilatación temporal (el tiempo
  corre más lento cerca de una masa grande; por qué una hora en el planeta de Miller
  equivale a ~7 años fuera); Agujeros de gusano (puente de Einstein-Rosen, atajo
  hipotético entre dos puntos del espacio-tiempo, necesidad de "materia exótica" para
  mantenerlo abierto); Relatividad (marco de Einstein: el espacio-tiempo se curva con la
  masa y no hay tiempo absoluto; los agujeros negros, la dilatación temporal y los
  agujeros de gusano se presentan como consecuencias de este marco, referenciados como
  casos derivados y no re-explicados en profundidad).
- **FR-007**: Todo texto científico DEBE poder respaldarse en una fuente real verificada
  antes de su redacción: fuente principal *The Science of Interstellar* (Kip Thorne, 2014)
  y papers derivados (arXiv 1502.03808; AJP 83 "Visualizing Interstellar's Wormhole",
  2015). Cada sección DEBE mostrar un bloque **«Fuentes»** con 1 a 3 referencias de ese
  conjunto, citadas donde apliquen a las afirmaciones de la sección. El mapeo detallado
  afirmación→fuente se registra en `research.md` de esta feature para la revisión de
  SC-005 (no se renderiza en la página).
- **FR-008**: La feature NO incorpora imágenes nuevas. La sección `#agujeros-negros`
  reutiliza `assets/img/ciencia-agujero-negro.jpg`, ya presente y acreditada desde la
  feature 001 (NASA/JPL-Caltech), referenciada con ruta relativa; su crédito ya figura en
  `assets/img/CREDITOS.md` y en `ASSET_CREDITS`, por lo que esta feature NO toca esos
  archivos ni `js/layout.js`. Las otras tres secciones son solo texto. El render del paper
  arXiv (`gargantua-render.jpg`) queda descartado (licencia sin verificar).
- **FR-009**: La página DEBE conservar el layout compartido inyectado (encabezado,
  navegación y pie comunes), la base visual por tokens y una única región `<main>`; no
  DEBE duplicar ni redefinir el encabezado o el pie.
- **FR-010**: La página NO DEBE incluir animaciones, efectos de scroll ni el relato escena
  por escena del viaje de la Endurance; eso pertenece a la especificación de la animación
  del viaje. Las referencias a escenas son textuales.
- **FR-011**: La estructura DEBE ser semántica y jerárquica: un único `<h1>` de página, un
  `<h2>` por concepto, un `<h3>` por cada uno de los tres bloques de la plantilla
  («La ciencia», «En Interstellar», «Fuentes» — FR-002), elementos de sección con su `id`
  de ancla, `<figure>`/`<img>` con alternativa textual adecuada según sea informativa o
  decorativa, y el bloque «Fuentes» como lista real (`<ul>`/`<ol>`). Cada etiqueta de
  rigor DEBE incluir texto real con su nivel (no solo color ni solo un símbolo sin
  significado accesible).
- **FR-012**: La experiencia DEBE adaptarse sin pérdida de contenido a viewports desde
  320 px hasta escritorio, sin desplazamiento horizontal involuntario, y las imágenes no
  DEBEN desbordar su contenedor.
- **FR-013**: El recorrido completo de `ciencia.html` (carga, scroll, apertura de anclas)
  DEBE finalizar sin errores en la consola del navegador.
- **FR-014**: Todas las rutas internas (hojas de estilo, scripts, imágenes, enlaces a
  otras páginas del sitio y a anclas) DEBEN ser relativas, nunca absolutas con `/` inicial
  (constitución 1.1.0: el sitio se sirve bajo el subpath `/Interstellar/` en GitHub
  Pages).
- **FR-015**: Las cuatro anclas DEBEN seguir resolviendo mediante carga directa (por
  ejemplo `ciencia.html#agujeros-de-gusano`) y quedar utilizables por debajo del
  encabezado, conservando la compensación de scroll de la base.
- **FR-016**: Si se agrega un tratamiento visual para las etiquetas de rigor (color,
  fondo, borde), DEBE tomarse de la paleta ya aprobada (feature 001) — sin introducir un
  segundo color saturado además del naranja de Gargantúa. La información del nivel NUNCA
  depende solo del color.

### Entidades clave

- **Concepto científico**: una de las cuatro entradas del eje. Atributos: identificador de
  ancla (`agujeros-negros`, `dilatacion-temporal`, `agujeros-de-gusano`, `relatividad`),
  nombre visible ("Agujeros negros", "Dilatación temporal", "Agujeros de gusano",
  "Relatividad"), bloque «La ciencia», bloque «En Interstellar», bloque «Fuentes» (lista
  de 1 a 3 referencias), conjunto de afirmaciones cada una con su etiqueta de rigor inline,
  e imagen opcional con su atribución. Orden de presentación: Agujeros negros → Dilatación temporal
  → Agujeros de gusano → Relatividad (el mismo del submenú de la feature 001).
- **Afirmación con rigor**: una frase o idea concreta del contenido, con una etiqueta
  asociada (`✓ Ciencia real` / `~ Especulación plausible` / `✎ Licencia narrativa`) y una
  fuente que la respalda.
- **Referencia**: una entrada del bloque «Fuentes» de una sección — cita corta de una de
  las tres fuentes aprobadas (Thorne 2014 / arXiv 1502.03808 / AJP 83 2015).

## Success Criteria *(mandatory)*

### Resultados medibles

- **SC-001**: El 100 % de las cuatro secciones de `ciencia.html` presenta contenido real;
  ningún texto placeholder ("Sección futura dedicada a…") permanece en la página.
- **SC-002**: Cada una de las cuatro secciones usa la misma plantilla de tres bloques
  («La ciencia», «En Interstellar», «Fuentes»), verificable comparando su estructura de
  `<h3>`.
- **SC-003**: El 100 % de los párrafos con contenido científico de los bloques «La
  ciencia» y «En Interstellar» termina con una etiqueta de rigor (`✓` / `~` / `✎`), y
  ningún párrafo mezcla niveles; las tres etiquetas aparecen al menos una vez en la página.
- **SC-004**: Contrastando la página contra las fuentes citadas y el mapeo de
  `research.md`, el 100 % de las afirmaciones etiquetadas `✓ Ciencia real` tiene respaldo
  en una fuente validada del conjunto aprobado, y **ninguna** afirmación etiquetada
  `✎ Licencia narrativa` está presentada como ciencia real (Principio VI, puerta de
  aceptación). La verificación no requiere un revisor con formación en física: es un
  chequeo afirmación‑contra‑fuente que hace quien tenga las fuentes a mano.
- **SC-005**: Las cuatro secciones muestran su bloque «Fuentes» con al menos una
  referencia verificable del conjunto aprobado (Thorne 2014 / arXiv 1502.03808 / AJP 83
  2015); y `research.md` mapea cada afirmación a su fuente, de modo que para cualquier
  afirmación tomada al azar se puede exhibir su respaldo.
- **SC-006**: En pruebas a 320 px, 768 px y 1280 px de ancho, todo el contenido, las
  etiquetas de rigor y las imágenes de `ciencia.html` permanecen dentro del viewport, sin
  recorte ni desplazamiento horizontal involuntario.
- **SC-007**: La carga directa de las cuatro anclas (`#agujeros-negros`,
  `#dilatacion-temporal`, `#agujeros-de-gusano`, `#relatividad`) lleva en el 100 % de los
  casos a una sección reconocible y utilizable por debajo del encabezado.
- **SC-008**: El recorrido completo de `ciencia.html` finaliza sin errores en consola en
  las dos versiones más recientes de Chrome, Edge y Firefox (Safari fuera del alcance de
  verificación, conforme a la enmienda 2026-08-28 de la feature 001).
- **SC-009** *(verificación blanda, no bloqueante)*: En una revisión con tres personas sin
  formación en física, al menos dos, tras leer una sección elegida al azar, pueden
  explicar en una o dos frases qué es ese concepto y dónde aparece en la película. Si no
  se alcanza, se ajusta la redacción y se re-verifica, pero no frena la entrega.
- **SC-010**: La única imagen de la página (`ciencia-agujero-negro.jpg`) se referencia con
  ruta relativa y su atribución ya registrada; no se agregan imágenes ni entradas de
  crédito nuevas.

## Assumptions

- La feature 004 se construye sobre las features 001–003 (ya implementadas y fusionadas):
  reutiliza el módulo de inyección de layout, los tokens de `css/global.css`, el pie con
  `ASSET_CREDITS` y la compensación de scroll de anclas. No re-implementa nada de eso.
- El conjunto de conceptos y sus anclas están fijados por la feature 001: cuatro destinos
  (`#agujeros-negros`, `#dilatacion-temporal`, `#agujeros-de-gusano`, `#relatividad`).
- Los textos se redactan en español, con tono divulgativo. A diferencia de las features
  002 y 003, este eje SÍ hace afirmaciones científicas y por lo tanto activa el Principio
  VI: verificación contra fuente y etiqueta de rigor por afirmación.
- La profundidad por concepto es acotada: 2 a 4 párrafos por sección en total, más las
  etiquetas de rigor. No se busca un tratado; se busca divulgación con criterio.
- La verificación de rigor (SC-004, SC-005) es un chequeo afirmación‑contra‑fuente sobre
  el conjunto aprobado (*The Science of Interstellar*, Thorne 2014; arXiv 1502.03808; AJP
  "Visualizing Interstellar's Wormhole", 2015); NO requiere un revisor con formación en
  física. El registro de qué fuente respalda qué afirmación vive en `research.md` de esta
  feature y es la base de esa verificación.
- La tipografía y la paleta aprobadas se mantienen sin cambios; esta feature no introduce
  tokens nuevos salvo, si hiciera falta, para el tratamiento visual de las etiquetas de
  rigor (dentro de la paleta existente, sin segundo color saturado).
- El único archivo de sitio que se modifica es `ciencia.html`. No se toca `js/layout.js`,
  ni `tests/`, ni `assets/img/` ni `assets/img/CREDITOS.md` (la imagen reutilizada ya está
  registrada). Si el tratamiento visual de las etiquetas de rigor exige CSS, se agrega a
  `css/global.css` como patrón reutilizable, sin tokens nuevos. Las páginas de los otros
  ejes siguen igual.
- El eje El Viaje (contenido) queda fuera de alcance: aunque el documento base fusiona
  conceptualmente Ciencia y Viaje, la navegación los mantiene como ejes separados y esta
  feature se limita a `ciencia.html`.
- Se asume JavaScript habilitado en el navegador para la inyección del layout compartido.

## Dependencies

- Features 001 (layout, navegación, base visual, pie con `ASSET_CREDITS`), 002 y 003
  (patrón de contenido por eje, política de imágenes y `CREDITOS.md`), todas fusionadas.
- Constitución v1.1.0 (Principio VI activo; rutas internas relativas obligatorias).
- Archivo `ciencia.html` y sus cuatro anclas ya presentes.
- Fuentes bibliográficas verificables: Thorne (2014); arXiv 1502.03808; AJP 83 (2015).
