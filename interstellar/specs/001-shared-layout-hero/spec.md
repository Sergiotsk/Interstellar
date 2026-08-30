# Especificación de feature: Layout compartido y Hero de inicio

**Rama de feature**: `feat/001-shared-layout-hero` (mergeada a `main` vía PR #2)

**Creada**: 2026-08-28

**Estado**: Implementada — pendiente enmiendas de consistencia post-análisis (ver Clarifications, enmienda 2026-08-28)

**Entrada**: Descripción del usuario: "Crear la capa fundacional del sitio Interstellar: layout compartido, navegación multinivel responsive, pie común, página de inicio con Hero cinematográfico, base visual centralizada y páginas de destino placeholder navegables."

## Clarifications

### Session 2026-08-28

- Q: ¿Qué comportamiento deben tener los submenús de navegación en desktop y mobile? → A: Clic, toque, Enter o Space alternan el submenú; solo uno permanece abierto. Escape, clic exterior o abandonar la navegación lo cierran y restauran el foco.
- Q: ¿Cómo debe ubicarse el encabezado respecto del Hero en la primera pantalla? → A: El Hero ocupa la pantalla completa y el encabezado se superpone sobre su parte superior.
- Q: ¿En cuáles navegadores debe funcionar obligatoriamente la feature para considerarse aprobada? → A: Las dos versiones más recientes de Chrome, Edge, Firefox y Safari.

### Session 2026-08-28 (enmienda posterior)

- Q: ¿Se mantiene Safari dentro del alcance de verificación de SC-009? → A: No. Safari se retira del alcance de verificación por falta de entorno de pruebas (desarrollo en Windows, sin macOS/iOS ni tooling cross-browser). Los navegadores obligatorios quedan en las dos versiones más recientes de Chrome, Edge y Firefox. Riesgo asumido y documentado: WebKit (~18-20 % de usuarios reales) no recibe verificación explícita; el CSS empleado (`color-mix`, `100svh` con fallback, `:focus-visible`, prefijos `-webkit-`) es compatible con Safari 16.2+, por lo que el riesgo estimado es bajo.
- Q: ¿La prueba con cinco personas debe aprobarse obligatoriamente antes de considerar terminada la feature? → A: Sí. Al menos 4 de 5 personas deben reconocer la temática y encontrar una sección en menos de 30 segundos.
- Q: ¿Qué tipos de imágenes pueden usarse para el Hero y los placeholders de esta feature? → A: Las fuentes detalladas en proyecto-interstellar-base.md, priorizando calidad, impacto visual y coherencia con la película, con procedencia documentada.

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia de usuario 1 - Recorrer el sitio desde una navegación común (Prioridad: P1)

Como visitante, quiero encontrar la misma navegación principal y el mismo pie en todas las páginas para comprender la estructura del sitio y moverme entre sus secciones desde cualquier dispositivo.

**Por qué esta prioridad**: El layout compartido es la base de todas las páginas posteriores y entrega valor aun antes de que exista contenido detallado.

**Prueba independiente**: Se puede probar recorriendo todas las páginas de nivel superior, abriendo y cerrando los submenús disponibles y verificando que el encabezado, la navegación y el pie mantengan el mismo contenido y comportamiento.

**Escenarios de aceptación**:

1. **Dado** que una persona visita cualquier página del sitio en escritorio, **Cuando** usa la navegación principal, **Entonces** puede acceder a Inicio, Mundos, Personajes, La Ciencia, El Viaje, Galería, Minijuegos y Trailer sin encontrar destinos rotos.
2. **Dado** que una persona visita cualquier página del sitio en un dispositivo móvil, **Cuando** toca el control de un submenú, **Entonces** puede alternarlo, identificar y activar todas sus opciones sin superposición, recorte ni desplazamiento horizontal involuntario, y cualquier otro submenú abierto se cierra.
3. **Dado** que una persona navega usando solamente teclado, **Cuando** enfoca un control de submenú y presiona Enter o Space, **Entonces** alterna ese submenú, mantiene solo uno abierto y puede cerrarlo con Escape, con foco visible, orden coherente y restauración del foco al control correspondiente.
4. **Dado** que una persona abre mediante clic, toque, Enter o Space un submenú de Mundos, Personajes, La Ciencia o El Viaje, **Cuando** elige un destino anidado, **Entonces** llega a la sección identificada dentro de la página superior correspondiente y el submenú se cierra.

---

### Historia de usuario 2 - Descubrir la identidad de Interstellar en el inicio (Prioridad: P2)

Como visitante que llega por primera vez, quiero una presentación visual clara y cinematográfica para reconocer inmediatamente la temática del sitio y entender qué recorrido ofrece.

**Por qué esta prioridad**: El Hero comunica la identidad y propósito del proyecto; depende del layout fundacional, pero puede evaluarse como experiencia de entrada independiente.

**Prueba independiente**: Se puede probar cargando exclusivamente la página de inicio en mobile y desktop y verificando que la presentación inicial ocupe la pantalla disponible, mantenga sus textos legibles y conduzca a una introducción breve al continuar el recorrido; la validación se completa ejecutando la prueba moderada definida en SC-010 como puerta de aceptación.

**Escenarios de aceptación**:

1. **Dado** que una persona abre la página de inicio, **Cuando** aparece la primera vista, **Entonces** ve un Hero que ocupa la pantalla completa, con un backdrop relacionado con Interstellar, el título o logo y un subtítulo identificable, mientras el encabezado se superpone sobre su parte superior sin consumir espacio vertical separado.
2. **Dado** que el backdrop contiene zonas visualmente intensas, **Cuando** se muestran el título y el subtítulo, **Entonces** ambos permanecen legibles gracias al tratamiento oscuro de la imagen y al contraste del texto.
3. **Dado** que una persona avanza por debajo del Hero, **Cuando** llega al siguiente bloque, **Entonces** encuentra una introducción breve que explica el carácter cinematográfico y educativo del sitio.

---

### Historia de usuario 3 - Llegar a destinos preparados para crecer (Prioridad: P3)

Como visitante, quiero que cada enlace superior tenga un destino válido aunque su contenido detallado todavía no esté desarrollado, para explorar el mapa completo sin callejones sin salida.

**Por qué esta prioridad**: Evita enlaces rotos y establece el alcance futuro sin adelantar el contenido de otras features.

**Prueba independiente**: Se puede probar activando cada enlace superior y cada destino anidado desde una carga inicial limpia; todos deben abrir una página o sección reconocible con el layout común.

**Escenarios de aceptación**:

1. **Dado** que una página interna todavía no posee contenido definitivo, **Cuando** una persona llega desde el menú, **Entonces** encuentra un placeholder semántico que identifica claramente la sección futura y conserva el encabezado y pie comunes.
2. **Dado** que una persona activa un destino anidado, **Cuando** carga la página superior, **Entonces** el destino señalado existe y puede reconocerse sin requerir una página secundaria independiente.

---

### Historia de usuario 4 - Leer una experiencia visual coherente (Prioridad: P4)

Como visitante, quiero colores, tipografía y jerarquías consistentes para leer cómodamente y reconocer una identidad visual única en todo el sitio.

**Por qué esta prioridad**: La coherencia visual sostiene la legibilidad y permite que las páginas futuras crezcan sobre una base común.

**Prueba independiente**: Se puede probar comparando la presentación del inicio y de todos los placeholders, verificando el uso consistente de la paleta, la tipografía, las jerarquías y los estados de foco.

**Escenarios de aceptación**:

1. **Dado** que una persona recorre distintas páginas, **Cuando** compara fondos, textos, acentos y tipografía, **Entonces** percibe una aplicación consistente de la base visual definida para el proyecto.
2. **Dado** que una persona lee textos o enfoca un control sobre fondos oscuros o fotográficos, **Cuando** cambia el tamaño de pantalla, **Entonces** el contenido conserva contraste legible y el indicador de foco continúa siendo visible.

---

### Casos límite

- Si el viewport tiene un ancho reducido de 320 px, el Hero debe ocupar la pantalla completa y el encabezado y la navegación superpuestos en su parte superior, el título y el subtítulo deben permanecer legibles y utilizables sin desbordamiento horizontal.
- Si el título o logo visual no puede cargarse, el nombre de la obra debe seguir disponible como texto comprensible.
- Si el backdrop del Hero no puede cargarse, el contenido principal debe conservar legibilidad y jerarquía sobre un fondo coherente con la paleta.
- Si una persona abre directamente una URL con ancla, la sección de destino debe existir, ser identificable y no quedar inutilizable por el encabezado.
- Si un submenú está abierto, presionar Escape, hacer clic fuera o abandonar la navegación debe cerrarlo y restaurar el foco a su control; cambiar de página o el ancho de la ventana tampoco debe dejar contenido bloqueado u oculto.
- Si una etiqueta de navegación ocupa más espacio por el ancho disponible, no debe truncarse de forma que pierda su significado ni superponerse con otros controles.
- Si la carga de la tipografía aprobada falla, el texto debe seguir siendo legible y mantener una jerarquía visual clara.

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **FR-001**: Todas las páginas incluidas DEBEN presentar un encabezado, una navegación principal y un pie comunes cuyo contenido se mantenga desde una única fuente compartida, sin copias independientes que puedan divergir.
- **FR-002**: La navegación principal DEBE incluir exactamente estos destinos superiores reconocibles: Inicio, Mundos, Personajes, La Ciencia, El Viaje, Galería, Minijuegos y Trailer.
- **FR-003**: La navegación DEBE ofrecer destinos anidados para los cuatro ejes de contenido: Mundos, Personajes, La Ciencia y El Viaje.
- **FR-004**: Los destinos anidados DEBEN resolverse como secciones identificadas dentro de su página superior; esta feature no debe crear páginas secundarias independientes para esos destinos.
- **FR-005**: Mundos DEBE ofrecer destinos para La Tierra, Gargantúa, Planeta de Miller, Planeta de Mann y El Tesseract.
- **FR-006**: Personajes DEBE ofrecer destinos para Cooper, Murph, Dr. Brand, Profesor Brand, Mann y TARS & CASE.
- **FR-007**: La Ciencia DEBE ofrecer destinos para Agujeros negros, Dilatación temporal, Agujeros de gusano y Relatividad.
- **FR-008**: El Viaje DEBE ofrecer destinos para Tierra, Agujero de gusano, Miller, Mann, Gargantúa y Tesseract, sin incluir en esta feature la animación ni el relato detallado del recorrido.
- **FR-009**: En mobile y desktop, cada control de submenú DEBE aplicar el mismo modelo de alternancia mediante clic, toque, Enter o Space, y la navegación DEBE mantener como máximo un submenú abierto a la vez.
- **FR-010**: Un submenú abierto DEBE cerrarse al presionar Escape, hacer clic fuera o abandonar la navegación y DEBE restaurar el foco a su control; además, el foco de teclado DEBE ser visible en todos los controles y enlaces interactivos, y su orden de recorrido DEBE seguir la secuencia visual y semántica del contenido.
- **FR-011**: Cada destino superior DEBE resolver a una página disponible; las páginas internas sin contenido definitivo DEBEN mostrar un placeholder semántico con nombre y propósito de la sección, además del layout común.
- **FR-012**: El pie común DEBE mostrar créditos del proyecto, fuentes del material visual utilizado y un enlace al repositorio `https://github.com/Sergiotsk/Interstellar.git` o a su destino equivalente aprobado.
- **FR-013**: Cada material visual incluido, especialmente el backdrop del Hero, DEBE provenir de las fuentes detalladas en `proyecto-interstellar-base.md` (archivo en la raíz del repositorio, fuente única de verdad del catálogo), priorizando calidad, impacto visual y coherencia con la película, y DEBE tener su fuente, atribución y condiciones de uso registradas de forma visible o accesible desde los créditos.
- **FR-014**: La página de inicio DEBE contener una región principal cuyo Hero ocupe la pantalla visible inicial completa; el encabezado DEBE superponerse sobre la parte superior del Hero en lugar de consumir espacio vertical separado.
- **FR-015**: El Hero DEBE presentar un backdrop de Interstellar, un título o logo con alternativa textual y un subtítulo o tagline, manteniendo todos los textos legibles sobre la imagen.
- **FR-016**: La página de inicio DEBE incluir, inmediatamente después del Hero, una introducción breve que explique que el sitio recorre los mundos, personajes, viaje y ciencia de Interstellar.
- **FR-017**: La base visual DEBE centralizar y aplicar consistentemente una paleta compuesta por negros y azules profundos, ocres y dorados, naranja de Gargantúa como único acento saturado, y blancos rotos o crema para texto.
- **FR-018**: La tipografía aprobada y sus jerarquías para títulos, navegación y texto DEBEN definirse de forma común y aplicarse consistentemente en todas las páginas incluidas.
- **FR-019**: Los fondos fotográficos DEBEN recibir un tratamiento de oscurecimiento suficiente para mantener una lectura clara; el texto, los enlaces y los estados de foco, incluidos los del encabezado y la navegación superpuestos sobre el Hero, DEBEN conservar contraste legible en todos los tamaños admitidos.
- **FR-020**: Cada página DEBE usar una estructura semántica válida, con un único contenido principal, encabezados jerarquizados y elementos descriptivos adecuados; las imágenes informativas DEBEN tener texto alternativo y las decorativas una alternativa vacía.
- **FR-021**: Todos los enlaces, destinos anidados y materiales visuales incluidos DEBEN cargar correctamente mediante rutas válidas y no DEBEN producir errores visibles ni errores en la consola durante los recorridos de aceptación.
- **FR-022**: La experiencia DEBE adaptarse sin pérdida de contenido ni controles a viewports desde 320 px de ancho hasta pantallas de escritorio, sin desplazamiento horizontal involuntario.

### Alcance

**Incluido**:

- Layout base compartido para Inicio y todas las páginas superiores previstas.
- Navegación principal multinivel y responsive, con interacción por teclado, tacto y puntero.
- Pie común con créditos, fuentes y enlace al repositorio o equivalente.
- Página de inicio con Hero de pantalla completa e introducción breve.
- Páginas placeholder para Mundos, Personajes, La Ciencia, El Viaje, Galería, Minijuegos y Trailer.
- Secciones placeholder que funcionan como destinos anidados dentro de Mundos, Personajes, La Ciencia y El Viaje.
- Base común de paleta, tipografía, estructura, navegación, texto, contraste y responsive.

**Fuera de alcance**:

- Efectos ambientales de polvo, estrellas, grano, viñeta o disco de acreción animado.
- Animación del viaje de la Endurance y cualquier relato escena por escena.
- Minijuegos, reglas, puntajes, estados o persistencia.
- Contenido detallado de mundos, personajes, ciencia, viaje, galería y trailer.
- Auditorías avanzadas de accesibilidad, internacionalización, SEO avanzado, PWA y consumo de contenido en vivo.

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **SC-001**: El 100 % de las ocho páginas superiores previstas muestra el mismo conjunto de encabezado, navegación y pie, sin diferencias de contenido entre ellas.
- **SC-002**: El 100 % de los ocho destinos superiores y de los destinos anidados definidos conduce a una página o sección existente y reconocible, sin enlaces rotos.
- **SC-003**: En pruebas a 320 px, 768 px y 1280 px de ancho, el Hero ocupa la pantalla visible inicial completa, el encabezado permanece superpuesto sobre su parte superior sin consumir espacio vertical separado, y todo el contenido y todos los controles permanecen visibles y utilizables sin desplazamiento horizontal involuntario.
- **SC-004**: Una persona puede llegar desde Inicio a cualquiera de los siete destinos superiores restantes en un máximo de dos interacciones después de disponer de la navegación.
- **SC-005**: En pruebas de navegación en mobile y desktop, clic, toque, Enter y Space alternan cada submenú, solo uno permanece abierto, y Escape, clic exterior o abandonar la navegación lo cierran y restauran el foco; además, el 100 % de los enlaces y controles puede enfocarse, muestra un indicador visible y puede activarse sin puntero.
- **SC-006**: En el 100 % de las vistas del Hero evaluadas en mobile y desktop, el título, el subtítulo, el encabezado y la navegación superpuestos, y la introducción se leen sin depender de una zona clara específica del backdrop.
- **SC-007**: El 100 % de las páginas incluidas supera la revisión de estructura semántica y jerarquía de encabezados definida en la constitución (§«Flujo de Trabajo y Puertas de Calidad» — criterios de aceptación por página), y todas las imágenes cumplen su tratamiento alternativo correspondiente.
- **SC-008**: El 100 % de los materiales visuales publicados en esta feature proviene del catálogo de fuentes de `proyecto-interstellar-base.md` y posee una fuente identificable en los créditos, incluida la imagen principal del Hero.
- **SC-009**: Los recorridos completos de navegación, carga directa de páginas y apertura de anclas finalizan sin errores en consola en las dos versiones más recientes de Chrome, Edge y Firefox. Safari queda fuera del alcance de verificación (ver Clarifications, enmienda 2026-08-28).
- **SC-010**: Como puerta de aceptación obligatoria antes de considerar completa la feature, en una prueba moderada con cinco personas, al menos cuatro identifican la temática de Interstellar y encuentran una sección superior solicitada en menos de 30 segundos desde la página de inicio.

## Suposiciones

- El sitio es público, estático y no requiere autenticación, perfiles ni datos personales.
- Las capacidades interactivas del navegador están habilitadas; no se exige funcionamiento cuando la persona las desactiva explícitamente.
- La tipografía aprobada será una familia legible de carácter limpio, futurista o cinematográfico, disponible mediante una fuente permitida por la constitución; su elección concreta se cerrará durante el diseño sin alterar el alcance funcional.
- El backdrop del Hero y los materiales visuales de esta feature se seleccionarán del catálogo de `proyecto-interstellar-base.md`, priorizando calidad, impacto visual y coherencia con la película, y se almacenarán con una atribución compatible con su licencia o condiciones de uso.
- Los textos científicos detallados y sus etiquetas de rigor no forman parte de los placeholders; se incorporarán en features posteriores con verificación de fuentes.
- Las páginas placeholder existen para garantizar navegación completa, no para anticipar contenido editorial ni interacción propia de cada sección.
- Las pruebas de compatibilidad se realizarán sobre las dos versiones más recientes de Chrome, Edge y Firefox, conforme a la constitución; Safari queda fuera del alcance de verificación (ver Clarifications, enmienda 2026-08-28).
- El repositorio público indicado es el destino aprobado para el enlace del pie mientras no se designe un equivalente diferente.
