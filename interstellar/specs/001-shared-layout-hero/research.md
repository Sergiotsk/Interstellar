# Investigación y decisiones de diseño — Layout compartido y Hero de inicio

**Fase**: 0 (Investigación)
**Feature**: `001-shared-layout-hero`
**Fecha**: 2026-08-28

## Estado

No quedan incógnitas abiertas (sin NEEDS CLARIFICATION). La constitución y las clarificaciones Q1–Q5 de la spec resuelven cada punto. Este archivo consolida las decisiones de diseño con su justificación y las alternativas evaluadas.

## D1 — Header/footer compartido vía un único módulo JS (FR-001)

- **Decisión**: un solo módulo ES (`js/layout.js`) inyecta el `<header>` (con `<nav>`) y el `<footer>` en cada página, consumiendo el árbol de navegación de `js/nav-data.js`. Las páginas solo declaran su `<main>` y las secciones propias.
- **Rationale**: FR-001 exige contenido común desde una única fuente compartida sin copias que puedan divergir; elimina la duplicación manual (que rompería SC-001). La constitución lista el "helper de inyección de header/footer" entre los módulos de lógica JS con TDD (Principio V), lo que cierra el enfoque.
- **Alternatives considered**: (a) replicar el header/footer a mano en cada HTML — descartado: divergencia garantizada (rompe FR-001 y SC-001); (b) Web Components nativos — descartado: sobreingeniería para esta etapa, sin beneficio frente a un módulo simple que ya produce elementos semánticos (Principio II).

## D2 — Destinos anidados como anclas dentro de la misma página (FR-004)

- **Decisión**: los submenús de los cuatro ejes resuelven a secciones con ancla dentro de la página superior (`mundos.html#gargantua`), implementadas como secciones placeholder identificables.
- **Rationale**: FR-004 prohíbe crear páginas secundarias independientes en esta feature; la constitución fija las anclas como comportamiento por defecto hasta que la spec del eje justifique archivo separado por volumen de contenido.
- **Alternatives considered**: (a) archivos separados por destino (ej. `mundos/gargantua.html`) — descartado: su justificación pertenece a las specs de cada eje, no a esta feature; (b) sin destinos anidados — descartado: rompe SC-002 y la promesa de navegación multinivel del documento base.

## D3 — Tokens de diseño como variables CSS en `:root` (FR-017..FR-019)

- **Decisión**: toda la paleta, tipografía, oscurecimiento de backdrops y foco se definen como custom properties en `:root` de `css/global.css`; las páginas solo consumen tokens (nunca valores hardcodeados sueltos).
- **Rationale**: la constitución (sección CSS) y el documento base lo exigen; el contrato `contracts/design-tokens.md` fija los nombres de tokens que usarán las páginas futuras, garantizando coherencia visual (FR-017/018/019, SC-006/007).
- **Alternatives considered**: (a) valores hardcodeados por página — descartado: rompe FR-017 y el criterio de aceptación de paleta vía variables; (b) preprocesador (Sass/PostCSS) — descartado: viola el Principio I (sin build).

## D4 — Sin build, sin frameworks: archivos servidos tal cual (constitución)

- **Decisión**: HTML5/CSS3/JS ES6+ vanilla. Sin bundler, transpilación, minificación ni autoprefixer; los ES Modules se sirven directamente; el deploy estático (GitHub Pages vía GitHub Actions) no requiere configuración.
- **Rationale**: Principio I y la consigna de la cátedra (fundamentos web en vanilla); los archivos que se escriben son los que se sirven.
- **Alternatives considered**: (a) bundler + transpilación — descartado: viola el Principio I; (b) inyección del partial vía `fetch` de HTML remoto — descartado: requiere servidor obligatorio y no es testeable por TDD como unidad de lógica; el módulo ES con datos mantiene la única fuente de verdad (FR-001) y es el módulo que la constitución designa para TDD.

## D5 — Imágenes: catálogo aprobado, WebP local, oscurecimiento, atribución (Q5 + FR-013 + SC-008)

- **Decisión**: los backdrops (incluido el del Hero) y los placeholders provienen únicamente del catálogo de `proyecto-interstellar-base.md` (TMDB, Fanart.tv, Wikimedia Commons, Alpha Coders, WallpaperFlare, Wallpaper Cave, Wallpapers.com, WallpaperCat; material espacial de NASA Image Library, ESA/Hubble, Unsplash, Rawpixel NASA; figuras de arXiv 1502.03808; trailers por embed de YouTube). Se guardan locales en `assets/img/`, optimizados a WebP y referenciados con rutas relativas; todo material lleva fuente y condiciones de uso registradas en los créditos; los backdrops se oscurecen para legibilidad.
- **Rationale**: FR-013 + SC-008 obligan al catálogo aprobado y a fuente identificable (NASA/ESA lo exigen explícitamente); FR-019 exige legibilidad sobre fondo fotográfico; el documento base descarta el consumo de API en vivo.
- **Alternatives considered**: (a) hotlinking desde las fuentes — descartado: contenido fijo y local, rutas relativas, sin optimización posible; (b) PNG/JPG en resolución original — descartado: la constitución pide WebP y resoluciones razonables para no cargar de más.

## D6 — Baseline: últimas 2 versiones de Chrome, Edge, Firefox (Q3, enmendada 2026-08-28)

- **Decisión**: navegadores evergreen, últimas 2 versiones; sin polyfills.
- **Rationale**: clarificación Q3 + constitución (Baseline) + SC-009 (recorridos sin errores en esas versiones).
- **Alternatives considered**: (a) soporte retroactivo amplio con polyfills — descartado: la constitución lo prohíbe; (b) validar solo Chrome — descartado: Q3 y SC-009 exigen Chrome, Edge y Firefox.
- **Enmienda 2026-08-28**: Safari se retira del alcance de verificación por falta de entorno de pruebas en Windows (sin macOS/iOS ni tooling cross-browser). Riesgo WebKit (~18-20 % de usuarios) asumido y documentado; el CSS usado es compatible con Safari 16.2+, riesgo estimado bajo.

## D7 — División de pruebas: TDD en la lógica JS, aceptación en la presentación (constitución V)

- **Decisión**: `layout.js` (inyección de header/footer y construcción del árbol DOM) se desarrolla con TDD estricto Red-Green-Refactor; la capa presentacional (HTML/CSS, responsive, contraste, foco) se valida contra los criterios de aceptación y los SC del spec.
- **Rationale**: Principio V protege donde hay ramas de decisión y regresiones reales; forzar TDD sobre markup y estilos sería sobreingeniería y contradice el alcance acotado del proyecto.
- **Alternatives considered**: (a) suite automatizada de HTML/CSS — descartado: la constitución lo excluye para la presentación; (b) omitir tests del módulo de inyección — descartado: viola el Principio V.

## D8 — Modelo de interacción de submenús: disclosure con máximo uno abierto y restauración de foco (Q1 + FR-009/FR-010)

- **Decisión**: cada ítem de eje con hijos presenta un enlace al destino superior (label) más un control de submenú separado (button de disclosure). Clic, toque, Enter o Space alternan; solo un submenú permanece abierto; Escape, clic fuera o abandonar la navegación cierran y restauran el foco al control; la etiqueta nunca se trunca perdiendo significado.
- **Rationale**: Q1 fija el modelo de alternancia; SC-004 exige llegar a cualquier destino superior en ≤2 interacciones, lo que se cumple porque el label es un enlace directo (1 interacción) y el control de submenú es un foco independiente (abre la siguiente); FR-010 exige foco visible, orden coherente y restauración del foco.
- **Alternatives considered**: (a) un único control que alterna y a la vez navega — descartado: mezcla navegación y disclosure, genera comportamiento ambiguo y complica la restauración de foco; (b) apertura por hover en desktop — descartado: Q1 define la activación por clic/toque/Enter/Space como el comportamiento que DEBE verificarse (el hover no debe ser el mecanismo de apertura principal por no ser operable por teclado).