# Tasks: Layout compartido y Hero de inicio

**Input**: Documentos de diseño en `/specs/001-shared-layout-hero/`

**Prerrequisitos**: plan.md (obligatorio) · spec.md (obligatorio para historias de usuario) · research.md · data-model.md · contracts/ · quickstart.md · `.specify/memory/constitution.md` (autoridad)

**Tests**: Solamente los módulos de **lógica JS** (Principio V de la constitución): `js/layout.js` y la máquina de estados del submenú (`js/submenu-state.js`). La capa presentacional (HTML/CSS, responsive, contraste, foco) **NO** se testea con framework; se valida contra los criterios de aceptación de la spec y los escenarios de `quickstart.md`. Los tests se ejecutan con el corredor integrado de Node **`node --test`** (parte del runtime de Node, no es una dependencia del proyecto — respeta «sin dependencias», Principio I).

**Organización**: Las tareas se agrupan por historia de usuario para permitir implementación y validación independientes de cada historia.

## Formato: `[ID] [P?] [Story] Descripción`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias de tareas incompletas).
- **[Story]**: Historia de usuario a la que pertenece (US1, US2, US3, US4). Fases de Setup/Foundational/Polish **NO** llevan etiqueta de historia.
- **Toda** descripción incluye la ruta exacta de archivo y una acción concreta.
- Los IDs son secuenciales en todo el documento (T001…T030). No se reutilizan IDs. T030 (fase Polish) SUPERSEDE parcialmente a T013 en la presentación mobile; ver su descripción.

## Convenciones de ruta

- **Código fuente** (raíz del repo, estructura de `plan.md` §Project Structure): HTML en `/`, `css/global.css`, `js/layout.js`, `js/nav-data.js`, `assets/img/`, `assets/fonts/`.
- **Documentación** de esta feature: `specs/001-shared-layout-hero/`.
- Nombres kebab-case, minúsculas, sin acentos (constitución, Restricciones). Ej.: `gargantua`, no `Gargantúa`.

## Pila y contratos de referencia

- Vanilla: HTML5 semántico + CSS3 (custom properties en `:root`) + JS ES6+ (ES Modules). Sin build, sin frameworks, sin TypeScript (Principio I).
- `layout.js` consume `nav-data.js` y genera el DOM del contrato `contracts/layout-injection.md`.
- El árbol de navegación sigue `contracts/navigation.md` y `data-model.md` §1.
- Los tokens CSS usan los NOMBRES exactos de `contracts/design-tokens.md` (`--color-*`, `--font-*`, `--focus-anillo`, `--backdrop-oscurecer`).
- Assets según `contracts/assets.md` (catálogo `proyecto-interstellar-base.md`, WebP local, atribución obligatoria).
- Submenú según `data-model.md` §6 (SubmenuState) y `contracts/navigation.md` (disclosure).

---

## Fase 1: Setup (Infraestructura compartida)

**Propósito**: inicialización del proyecto y estructura base del repositorio.

**Independent Test**: la estructura en la raíz del repo permite ubicar cada archivo previsto en `plan.md` (HTML en `/`, `css/`, `js/`, `assets/img`, `assets/fonts`); se puede ejecutar un test de lógica JS mínimo con `node --test`; queda definida la tipografía aprobada para todas las páginas.

- [X] T001 Verificar y crear la estructura de carpetas en la raíz del repo: `/css/`, `/js/`, `/assets/img/`, `/assets/fonts/` (las páginas HTML vivirán en `/`). Confirmar que existen `css/`, `js/` y `assets/` como directorios reales (no archivos) y crear los que falten.
- [X] T002 [P] Seleccionar y documentar la tipografía aprobada (familia limpia, futurista o cinematográfica, vía Google Fonts `<link>` conforme al Principio I) y registrar la elección como nota de diseño en `specs/001-shared-layout-hero/quickstart.md` (sección «Decisión de diseño (typography)»), única ubicación canónica; fijar las familias para `--font-sitio`, `--font-hero-titulo`, `--font-nav` y `--font-texto` (contrato `contracts/design-tokens.md`). Es prerrequisito de decisión para el `<link>` que agregará cada página en su `<head>`.
- [X] T003 [P] Preparar el entorno de tests para lógica JS con el corredor integrado de Node: crear la carpeta `tests/` en la raíz del repo con un archivo base `tests/smoke.test.js` (ESM) de ejemplo que se ejecute correctamente con `node --test tests/`; verificar en consola que pasa. `node --test` es parte del runtime de Node, NO se instala ni se declara como dependencia (Principio I). Definir en esta tarea la convención `tests/*.test.js` para los módulos de lógica.

**Checkpoint**: Setup completo — la estructura y el entorno de tests están listos para la fase Foundational.

---

## Fase 2: Foundational (Prerrequisitos bloqueantes)

**Propósito**: infraestructura central que DEBE estar completa antes de implementar cualquier historia de usuario.

**CRÍTICO**: ninguna historia de usuario puede comenzar hasta que esta fase termine.

**Independent Test**: al ejecutar `node --test tests/` los tests de `js/layout.js` pasan (verdes); `css/global.css` define los tokens contratados en `:root`; en `/assets/img/` existen los backdrops candidatos en WebP con su atribución registrada.

- [X] T004 Crear `js/nav-data.js` — configuración del árbol de navegación como ES Module. Exportar un objeto `NavConfig` con `items[]`: exactamente 8 NavItem (FR-002) con `id`, `label`, `href`, `hasChildren`, `children`, cuyos labels coinciden: Inicio→`index.html`, Mundos→`mundos.html`, Personajes→`personajes.html`, La Ciencia→`ciencia.html`, El Viaje→`viaje.html`, Galería→`galeria.html`, Minijuegos→`minijuegos.html`, Trailer→`trailer.html`. `hasChildren: true` SOLO para los 4 ejes (FR-003); los 21 NavChild (5+6+4+6) con `href = <pagina>.html#<ancla>` según FR-005..FR-008 y `data-model.md` §1 (Mundos: `#tierra #gargantua #miller #mann #tesseract`; Personajes: `#cooper #murph #brand #profesor-brand #mann #tars-case`; Ciencia: `#agujeros-negros #dilatacion-temporal #agujeros-de-gusano #relatividad`; Viaje: `#tierra #agujero-de-gusano #miller #mann #gargantua #tesseract`). Nada de etiquetas truncadas (caso límite).
- [X] T005 Escribir PRIMERO el test que FALLA (Rojo) para `js/layout.js` en `tests/layout.test.js` con `node --test`: importar `js/nav-data.js` y `js/layout.js`, montar un `<body>` de prueba, invocar la inyección y afirmar que produce exactamente el DOM del contrato `contracts/layout-injection.md` (un `<header>` con `<nav><ul>` de 8 ítems de nivel superior, un `<button>` de disclosure por cada eje, un `<ul>` anidado por eje, y un `<footer>` con créditos/fuentes/enlace al repo FR-012/FR-013) coincidente con el NavConfig (Principio V, FR-001). Ejecutar y comprobar que el test falla antes de implementar (Red). No usar dependencias; solo `node --test` y módulos ES nativos.
- [X] T006 Implementar `js/layout.js` (Verde): módulo ES compartido que, al cargarse con `<script type="module">` en cada página, inyecta el `<header>` (con `<nav>` con la estructura del contrato `layout-injection.md`) al inicio del `<body>` y el `<footer>` (créditos, fuentes de imagen, enlace a `https://github.com/Sergiotsk/Interstellar.git`, FR-012/FR-013) al final, consumiendo exclusivamente `nav-data.js` (sin datos propios). `<main>` nunca se reemplaza. Sin `<div>` donde corresponde un elemento semántico (Principio II). Depends on T004 y T005; ejecutar `node --test tests/` y dejar el test en verde.
- [X] T007 [P] Crear `css/global.css` — tokens de diseño como custom properties en `:root` con los NOMBRES exactos de `contracts/design-tokens.md`: `--color-fondo`, `--color-superficie`, `--color-tierra-ocre`, `--color-tierra-oro`, `--color-gargantua` (ÚNICO acento saturado, FR-017), `--color-texto` (blanco roto/crema, NUNCA blanco puro), `--color-texto-atenuado`, `--font-sitio`, `--font-hero-titulo`, `--font-nav`, `--font-texto`, `--focus-anillo`, `--backdrop-oscurecer`. Valores dentro de la paleta aprobada (negros/azules profundos, ocres/dorados, naranja de Gargantúa, crema). Además: reset base, layout con Grid/Flexbox, y estilos base de `header`/`nav`/`footer` (FR-017..FR-019). Nada hardcodeado suelto fuera de `:root`.
- [X] T008 [P] Trabajo de assets de imagen: seleccionar y descargar los candidatos a backdrop (incluido el del Hero) del catálogo aprobado (fuente única de verdad: `/proyecto-interstellar-base.md` en la raíz del repo; digest de fuentes en `contracts/assets.md`), convertirlos/optimizarlos a **WebP local** en `assets/img/` con nombres kebab-case sin acentos, y registrar por cada asset su ID, fuente del catálogo, atribución y condiciones de uso para el pie (FR-013, SC-008). NO hardcodear URLs en código; la decisión de catálogo ya está fijada en `research.md` D5 y `contracts/assets.md`.

**Checkpoint**: Foundational lista — las historias de usuario pueden comenzar (layout.js y nav-data.js en verde; global.css con tokens; assets con atribución).

---

## Fase 3: Historia de Usuario 1 — «Recorrer el sitio desde una navegación común» (Prioridad: P1) ⭐ MVP

**Goal**: encabezado, navegación principal y pie comunes en las 8 páginas desde una única fuente, con submenús disclosure que cumplen FR-009/FR-010/SC-005 y responsive (FR-022).

**Independent Test**: recorrer todas las páginas top-level, abrir/cerrar cada submenú (clic, toque, Enter, Space), comprobar que solo uno queda abierto, que Escape/clic-fuera/abandonar lo cierran restaurando el foco, y que el encabezado/pie son idénticos entre páginas (escenario E1/E2 de `quickstart.md`).

### Tests de la Historia de Usuario 1 (lógica JS — obligatorio por Principio V)

> **NOTA**: estos tests se escriben PRIMERO y deben FALLAR antes de la implementación (Red), salvo los del submenú puro que corren tras `submenu-state.js`.

- [X] T009 [P] [US1] Escribir el test que FALLA (Rojo) para la máquina de estados del submenú en `tests/submenu-state.test.js` con `node --test`: importar `js/submenu-state.js` y cubrir `data-model.md` §6 (StateMachine) — `toggle` (cerrado→abierto / abierto→cerrado), máximo uno abierto (`abrir-otro` cierra el actual), cierre por `navigate`, y `dismiss` (Escape/clic-fuera/abandono) que devuelve el control objetivo para restaurar foco (FR-009, FR-010, SC-005). Ejecutar y comprobar que falla al no existir el módulo (Red).

### Implementación de la Historia de Usuario 1

- [X] T010 [US1] Implementar `js/submenu-state.js` (Verde): módulo ES puro asíncrono/síncrono con la máquina de estados del submenú (estados `cerrado`/`abierto`, eventos `toggle`/`abrir-otro`/`navigate`/`dismiss`, invariantes de máximo-uno-abierto y objetivo de foco) conforme a `data-model.md` §6. Depends on T009; ejecutar `node --test tests/` y dejar el test de submenú en verde.
- [X] T011 [US1] Conectar la interacción disclosure en `js/layout.js`: cada ítem de eje renderiza un `<a>` al destino superior (1 interacción → SC-004) MÁS un `<button>` de disclosure independiente (contrato `contracts/navigation.md`) que alterna con clic, toque, Enter o Space usando `js/submenu-state.js`; solo un submenú abierto; cierra por Escape, clic fuera de la navegación o abandono, y restaura el foco al control (FR-009, FR-010, SC-005); elegir un destino anidado navega a la ancla y cierra el submenú (HU1-E4). Depends on T010. Re-recorrer con `node --test tests/`.
- [X] T012 [US1] Aplicar estilos de foco visible y coherente en `css/global.css`: indicador de foco (anillo al enfocar) para el 100 % de enlaces y controles de la navegación y del sitio usando el token `--focus-anillo` (FR-010, SC-005, SC-007); asegurar que todos los controles/enlaces son nativamente enfocables y que el orden de tabulación sigue la secuencia visual y semántica (FR-010). Verificar en `index.html` y páginas con el teclado (Enter/Space/Escape).
- [X] T013 [US1] Comportamiento responsive de los submenús en `css/global.css`: presentación colapsada/expandida según viewport (mobile vs desktop) manteniendo los invariantes del contrato `contracts/navigation.md`; sin solapamiento, recorte ni desplazamiento horizontal involuntario desde 320 px (FR-022, SC-003); la etiqueta del submenú nunca se trunca perdiendo significado ni se superpone a otros controles (caso límite). Verificar a 320 px, 768 px y 1280 px.

**Checkpoint**: Historia de Usuario 1 funcional y testeable de forma independiente — `node --test tests/` en verde, submenús correctos en mobile/desktop/teclado, layout idéntico en las 8 páginas.

---

## Fase 4: Historia de Usuario 2 — «Descubrir la identidad de Interstellar en el inicio» (Prioridad: P2)

**Goal**: página de inicio con Hero cinematográfico de pantalla completa, header superpuesto, textos legibles e introducción breve (FR-014..FR-016).

**Independent Test**: cargar exclusivamente `index.html` en mobile y desktop y verificar que la presentación inicial ocupa la pantalla disponible, mantiene legibilidad de título/subtítulo/header sin depender de una zona clara del backdrop y conduce a la introducción al scrollear (escenario E3 de `quickstart.md`); la validación se completa con la prueba de 5 personas (SC-010) como puerta de aceptación.

### Implementación de la Historia de Usuario 2

- [X] T014 [US2] Crear `index.html`: página de inicio con `<main>` conteniendo una sección Hero que ocupe la pantalla visible inicial completa (FR-014), con backdrop de Interstellar del catálogo aprobado (asset WebP de `assets/img/` — depende de T008, FR-013), título o logo con alternativa textual comprensible (FR-015, caso límite: el nombre «Interstellar» queda como texto si el logo no carga), subtítulo/tagline identificable, y el header superpuesto sobre la parte superior del Hero sin consumir espacio vertical separado (FR-014, Q2). Incluir en el `<head>` el `<link>` de Google Fonts (depende de T002) y el `<script type="module" src="js/layout.js">` para el layout compartido (depende de T006). El apertura del Hero se oscurece con el token `--backdrop-oscurecer` para legibilidad (FR-019, SC-006). Inmediatamente después del Hero, incluir un bloque intro breve que explique que el sitio recorre los mundos, personajes, viaje y ciencia de Interstellar (FR-016).
- [X] T015 [US2] Casos límite del Hero en `index.html` + `css/global.css`: (a) a 320 px el Hero ocupa la pantalla completa y el header/nav superpuestos siguen legibles y utilizables sin desbordamiento horizontal (FR-022, SC-003); (b) si el backdrop no carga, el contenido principal conserva jerarquía y legibilidad sobre un fondo coherente con la paleta (caso límite, `--color-fondo`); (c) el título/logo conserva su alternativa textual (FR-015). Depends on T014. Verificar a 320 px, 768 px y 1280 px.

**Checkpoint**: Historias 1 y 2 funcionales — el Hero es la puerta de entrada y la identidad es reconocible.

---

## Fase 5: Historia de Usuario 3 — «Llegar a destinos preparados para crecer» (Prioridad: P3)

**Goal**: cada enlace superior y cada destino anidado resuelve a una página o sección reconocible con el layout común; placeholders semánticos (FR-011, FR-020).

**Independent Test**: activar cada enlace superior y cada destino anidado desde una carga inicial limpia; todos abren una página o sección reconocible con el layout común y un placeholder semántico (escenario E4 de `quickstart.md`).

### Implementación de la Historia de Usuario 3

> Las 7 páginas tocan archivos distintos — pueden ejecutarse en paralelo ([P]); cada una depende solo de Foundational (T006/T007).

- [X] T016 [P] [US3] Crear `mundos.html` (eje; rol `axis`, PageRegistry): `<main>` con un placeholder semántico general de la página + secciones ancla para `#tierra`, `#gargantua`, `#miller`, `#mann`, `#tesseract` (FR-005, FR-004, FR-011), cada una con nombre y propósito claros y que se reconoce sin página secundaria (HU3-E2, FR-020). Incluir `<link>` de Google Fonts (T002) y `<script type="module" src="js/layout.js">` (T006). Enlace la navegación compartida queda inyectada.
- [X] T017 [P] [US3] Crear `personajes.html` (eje; rol `axis`): `<main>` con placeholder semántico de la página + secciones ancla para `#cooper`, `#murph`, `#brand`, `#profesor-brand`, `#mann`, `#tars-case` (FR-006, FR-004, FR-011, FR-020). Incluir `<link>` de Google Fonts (T002) y `<script type="module" src="js/layout.js">` (T006).
- [X] T018 [P] [US3] Crear `ciencia.html` (eje; rol `axis`): `<main>` con placeholder semántico de la página + secciones ancla para `#agujeros-negros`, `#dilatacion-temporal`, `#agujeros-de-gusano`, `#relatividad` (FR-007, FR-004, FR-011, FR-020). Nota: en esta feature NO se redacta contenido científico detallado ni etiquetas de rigor (Principio VI no aplica a placeholders; se incorporarán en features posteriores). Incluir `<link>` de Google Fonts (T002) y `<script type="module" src="js/layout.js">` (T006).
- [X] T019 [P] [US3] Crear `viaje.html` (eje; rol `axis`): `<main>` con placeholder semántico de la página + secciones ancla para `#tierra`, `#agujero-de-gusano`, `#miller`, `#mann`, `#gargantua`, `#tesseract` (FR-008, FR-004, FR-011, FR-020); NO incluir animación del viaje de la Endurance ni relato escena por escena (fuera de alcance). Incluir `<link>` de Google Fonts (T002) y `<script type="module" src="js/layout.js">` (T006).
- [X] T020 [P] [US3] Crear `galeria.html` (rol `placeholder`, FR-011): `<main>` con un placeholder semántico que identifique claramente la sección futura de Galería (nombre y propósito) y conserve el layout común (HU3-E1). Incluir `<link>` de Google Fonts (T002) y `<script type="module" src="js/layout.js">` (T006).
- [X] T021 [P] [US3] Crear `minijuegos.html` (rol `placeholder`, FR-011): `<main>` con placeholder semántico que identifique la futura sección de Minijuegos (nombre y propósito) y conserve el layout común. NO implementar reglas, puntajes, estados ni persistencia (fuera de alcance). Incluir `<link>` de Google Fonts (T002) y `<script type="module" src="js/layout.js">` (T006).
- [X] T022 [P] [US3] Crear `trailer.html` (rol `placeholder`, FR-011): `<main>` con placeholder semántico que identifique la futura sección de Trailer (nombre y propósito) y conserve el layout común; el embed de YouTube vía `<iframe>` queda para la feature de esa sección, NO se incluye aquí (out of scope). Incluir `<link>` de Google Fonts (T002) y `<script type="module" src="js/layout.js">` (T006).
- [X] T023 [US3] Asegurar que los destinos ancla no quedan inutilizables por el encabezado superpuesto: agregar en `css/global.css` el espacio de compensación por scroll (p. ej. `scroll-margin-top` sobre las secciones ancla) para que la carga directa de una URL con ancla (ej. `http://localhost:8000/mundos.html#gargantua`) muestre la sección reconocible y usable por debajo del header (caso límite, FR-004, FR-021). Depends on T016..T019. Verificar carga directa de anclas en los 4 ejes.

**Checkpoint**: Historias 1, 2 y 3 funcionales — el mapa completo del sitio navegable sin enlaces rotos ni callejones sin salida.

---

## Fase 6: Historia de Usuario 4 — «Leer una experiencia visual coherente» (Prioridad: P4)

**Goal**: colores, tipografía y jerarquías consistentes en todo el sitio desde los tokens centralizados (FR-017..FR-019, SC-006/SC-007).

**Independent Test**: comparar la presentación del inicio y de todos los placeholders verificando el uso consistente de la paleta, la tipografía, las jerarquías y los estados de foco (escenario E5/E6 de `quickstart.md`).

### Implementación de la Historia de Usuario 4

- [X] T024 [US4] Aplicar los estilos basados en tokens a TODAS las páginas (index, mundos, personajes, ciencia, viaje, galeria, minijuegos, trailer) vía `css/global.css`: paleta (FR-017), jerarquías tipográficas para títulos/navegación/texto usando `--font-*` (FR-018), oscurecimiento de fondos fotográficos con `--backdrop-oscurecer` (FR-019) y estados de foco consistentes (SC-005/SC-007). Los placeholders y el inicio deben leerse consistentes (HU4-E1); el ÚNICO color saturado del sitio es el naranja de Gargantúa (`--color-gargantua`).
- [X] T025 [US4] Verificación de coherencia y ausencia de valores sueltos: revisar en el código de las 8 páginas y de `css/global.css` que no existe ningún color/tipo/reutilizable hardcodeado suelto fuera de `:root` (constitución, sección CSS) y que el contraste de textos y foco se conserva sobre fondos oscuros/fotográficos en distintos tamaños de pantalla (HU4-E2, FR-019, SC-006). Corregir cualquier valor suelto detectado reemplazándolo por el token correspondiente de `contracts/design-tokens.md`.

**Checkpoint**: Historia 4 funcional — el sitio lee con una identidad visual única y coherente; todas las historias son evaluables de forma independiente.

---

## Fase 7: Pulido y preocupaciones transversales

**Propósito**: mejoras y validaciones que afectan a varias historias, más las puertas de calidad de `quickstart.md` y la constitución.

- [X] T026 Ejecutar los escenarios de validación de `quickstart.md` E1–E6 sirviendo el sitio por HTTP (`python -m http.server 8000` o `npx serve`, que requiere HTTP por la política CORS de los ES Modules): E1 (recorrido de las 8 páginas, header/pie idénticos, 21 anclas sin rotos, SC-001/SC-002/SC-004), E2 (submenús desktop/mobile/teclado, SC-005), E3 (Hero fullscreen y legibilidad a 320/768/1280, FR-014..FR-016, SC-003/SC-006), E4 (placeholders y carga directa con ancla, FR-011), E5 (coherencia visual, FR-017..FR-019, SC-007), E6 (ausencia de errores en consola FR-021/SC-009 y assets verificados SC-008). Registrar por persona/escenario el resultado y los defectos encontrados. Puede dividirse en ejecuciones por historia (US1→E1/E2; US2→E3; US3→E4; US4→E5) más E6 transversal.
- [X] T027 Ejecutar la prueba moderada de 5 personas de `quickstart.md` E7 como puerta de aceptación obligatoria (SC-010): reclutar 5 personas que no hayan usado el sitio; pedirles, sin ayuda del moderador y desde `index.html`, identificar la temática de Interstellar y encontrar una sección superior solicitada en menos de 30 segundos; registrar por persona (sí/no, tiempo, observaciones). Puerta: ≥4/5 aciertan. Si no se alcanza, registrar los incidentes como defectos (navegación confusa, submenú que no cierra, texto ilegible, enlaces rotos), corregirlos y re-testear.
- [X] T028 [P] Revisión final de calidad transversal: (a) estructura semántica y jerarquía de encabezados de las 8 páginas — único `<main>`, `alt` correctos por tipo de imagen (decorativa→`alt=""`, informativa→descriptiva) (SC-007, FR-020); (b) verificación de que el 100 % de los assets proviene del catálogo aprobado y tiene su fuente/atribución/condiciones registradas en el pie (SC-008, FR-013) y que el pie expone créditos + enlace a `https://github.com/Sergiotsk/Interstellar.git` (FR-012). Corregir cualquier hallazgo.
- [X] T029 Pasos finales de repositorio y calidad: ejecutar `git diff --check` para detectar espacios al final de línea o conflictos; revisar que los mensajes de commit siguen Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, …) sin atribución a IA ni `Co-Authored-By` (constitución, Commits); confirmar que no hay errores de consola en los recorridos (FR-021, SC-009). Solo revisiones y verificación; no se agrega código de aplicación.
- [X] T030 [P] SUPERSEDE T013 en mobile: navbar responsive con drawer/hamburguesa en `max-width: 63.999rem` (feedback SC-010: el nav que envuelve en 3-4 filas con targets táctiles chicos no respeta principios responsive). Desktop sin cambios. En mobile: header de UNA fila con botón ☰ (min 44×44 px, WCAG 2.5.8), nav oculto por defecto que se despliega como drawer/panel con los 8 ítems apilados (min-height 44 px por item), submenús de ejes como acordeón DENTRO del drawer (modelo de disclosure FR-009 intacto), cierre por: selección de destino, Escape (restaura foco al ☰), clic fuera, y toggle del ☰; `aria-expanded`/`aria-controls` en el ☰; sin overflow horizontal a 320px (FR-022, SC-003); foco visible (SC-005). La presentación mobile anterior (submenús en flujo bajo el disparador) queda reemplazada en el código y sus comentarios; T013 sigue vigente para el modelo de interacción del disclosure y el submenú de escritorio. Depends on T010/T011 (máquina de estados + wiring).

**Checkpoint**: Feature completa tras superar E1–E7 y la prueba de 5 personas (SC-010).

---

## Dependencias y orden de ejecución

### Dependencias de fase

- **Setup (Fase 1)**: sin dependencias — puede comenzar de inmediato.
- **Foundational (Fase 2)**: depende de Setup — **BLOQUEA** todas las historias de usuario.
- **Historias de usuario (Fases 3+)**: todas dependen de Foundational.
  - US1 (P1) → US2 (P2) → US3 (P3) → US4 (P4), en ese orden de prioridad.
- **Polish (Fase final)**: depende de que las historias deseadas estén completas (para E7/SC-010, al menos el MVP US1 y, idealmente, US2 por la identidad).

### Dependencias a nivel de archivo (concretas)

- `js/nav-data.js` (T004) ANTES de `js/layout.js` (T005/T006): `layout.js` consume el árbol de `nav-data.js`.
- Test de `layout.js` (T005, Rojo) ANTES de la implementación (T006, Verde) — Principio V.
- Test de submenú (T009, Rojo) ANTES de `js/submenu-state.js` (T010, Verde) — Principio V.
- `js/layout.js` (T006) ANTES de que cualquier página pueda renderizar el nav compartido (US2 T014, US3 T016..T022).
- `css/global.css` (T007) ANTES de aplicar tokens en las páginas (US4 T024/T025) y de los estilos de submenú/foco (T012/T013).
- Asset backdrop del Hero (T008) ANTES de `index.html` (T014/T015).
- `<link>` de Google Fonts (T002) ANTES de crear los `<head>` de las páginas (T014, T016..T022).

### Dentro de cada historia

- Tests de lógica (si los hay) se escriben y FALLAN antes de la implementación (Red→Green).
- Lógica pura antes de la interacción DOM; interacción antes de la verificación cross-page.

---

## Oportunidades de paralelización

Lista concreta de tareas **[P]** y por qué pueden ejecutarse juntas (archivos distintos, sin dependencias de tareas incompletas):

- **Setup**: T002 (decisión de tipografía) y T003 (entorno de tests) pueden correr en paralelo con T001 ya hecho que arma la estructura — trabajan en archivos/decisiones independientes.
- **Foundational**: T007 (`css/global.css`) y T008 (`assets/img/`) son totalmente independientes y pueden correr en paralelo; T004 (`js/nav-data.js`) también es independiente de T007/T008 (aunque es prerrequisito directo de T005/T006).
- **US1**: T009 (test de submenú en `tests/submenu-state.test.js`) puede correr en paralelo con T007/T008; dentro de US1, T012 (foco en `css/global.css`) es independiente de la lógica JS de T010/T011.
- **US3**: las 7 páginas (T016..T022) son archivos HTML distintos y pueden ejecutarse todas en paralelo tras Foundational. Las 4 páginas de eje (T016..T019) y las 3 de placeholder (T020..T022) son los mejores bloques paralelos.
- **US4 / Polish**: T028 (revisión semántica + verificación de assets) es una revisión independiente que puede correr junto a otras validaciones.

**Notas de paralelización**: los marcadores **[P]** expresan independencia de archivos, NO capacidad de equipo. Es un proyecto de un solo estudiante; se recomienda orden secuencial de prioridad (ver Estrategia). No marcar **[P]** dos tareas que editen el mismo archivo (p. ej. T012, T013 y T030, todas en `css/global.css`).

---

## Ejemplo de ejecución en paralelo: las páginas de la US3

```bash
# Las 4 páginas de eje (archivos distintos, después de Foundational):
Task: "Crear mundos.html"            # T016
Task: "Crear personajes.html"        # T017
Task: "Crear ciencia.html"           # T018
Task: "Crear viaje.html"             # T019

# Las 3 páginas placeholder (archivos distintos):
Task: "Crear galeria.html"           # T020
Task: "Crear minijuegos.html"        # T021
Task: "Crear trailer.html"           # T022
```

```bash
# Foundational en paralelo (archivos distintos):
Task: "Crear css/global.css con tokens"   # T007
Task: "Descargar/optimizar backdrops WebP" # T008
```

---

## Estrategia de implementación

### MVP primero (Historia de Usuario 1)

1. Completar Fase 1: Setup.
2. Completar Fase 2: Foundational (CRÍTICO — bloquea todas las historias): nav-data → test layout (Rojo) → layout (Verde) → global.css → assets.
3. Completar Fase 3: US1 (test submenú Rojo → submenú Verde → interacción → foco → responsive).
4. **PARAR y VALIDAR**: probar US1 de forma independiente (E1/E2) — `node --test tests/` en verde.
5. Entregar/demostrar el MVP si corresponde.

> **Alcance MVP sugerido**: **US1** (Fases 1–3) es el MVP — entrega el layout compartido, la navegación común y el pie aun antes de que exista contenido detallado, cumpliendo el «Board base» de la constitución (Principio III). Sin el layout no hay base para ninguna página.

### Entrega incremental

1. Setup + Foundational → base lista.
2. Añadir US1 → probar independiente → **MVP** (con el layout y la navegación comunes).
3. Añadir US2 → probar independiente (E3) → entregar/demostrar (identidad del Hero).
4. Añadir US3 → probar independiente (E4) → entregar/demostrar (mapa completo navegable).
5. Añadir US4 → probar independiente (E5) → entregar/demostrar (coherencia visual).
6. Polish: E1–E6 + prueba de 5 personas (E7/SC-010) como puerta final.
7. Cada historia añade valor sin romper las anteriores.

### Estrategia para un solo desarrollador (proyecto de alumno)

- Proyecto de un solo estudiante → se recomienda el **orden secuencial de prioridad P1→P2→P3→P4**.
- Los marcadores **[P]** indican independencia de archivos, no un equipo paralelo: sirven para saber qué tareas NO se pisan entre sí si se optimiza el flujo (p. ej. preparar assets mientras se escribe otro módulo), pero el foco es terminar una historia antes de empezar la siguiente.
- Detenerse en cada checkpoint para validar la historia de forma independiente antes de avanzar (constitución: capas y puertas de calidad).

---

## Notas

- **[P]** = archivos distintos, sin dependencias de tareas incompletas.
- La etiqueta **[Story]** mapea la tarea a su historia de usuario para trazabilidad (solo en fases US1–US4; Setup/Foundational/Polish no llevan etiqueta).
- Cada historia debe ser completable y testeable de forma independiente (E1..E7).
- Los tests de lógica se escriben primero y deben fallar antes de implementar (Red→Green, Principio V).
- Commits tras cada tarea o grupo lógico con Conventional Commits (sin atribución a IA).
- Detenerse en cada checkpoint para validar la historia antes de seguir.
- Evitar: tareas vagas, conflictos por mismo archivo, dependencias cruzadas que rompan la independencia de historias.
- **NO** crear tareas para aquello fuera de alcance de la spec (efectos ambientales, animación de la Endurance, minijuegos, contenido detallado, PWA/i18n/SEO avanzado).
- En caso de duda, la `constitution.md` prevalece (Governance).
