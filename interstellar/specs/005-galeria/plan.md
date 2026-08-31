# Implementation Plan: Galería de imágenes

**Branch**: `feat/005-galeria` | **Date**: 2026-08-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-galeria/spec.md`

**Note**: Este plan es la salida de `/speckit-plan`; su definición describe el flujo de ejecución del diseño.

## Summary

La feature reemplaza el párrafo placeholder de `galeria.html` por una galería real: cuatro
secciones ancla (`#mundos`, `#personajes`, `#ciencia`, `#viaje`), una por eje del sitio, en
el orden del menú. Cada sección tiene un `<h2>`, un enlace a la página del eje y una
cuadrícula responsive de figuras. Cada figura es un `<figure>` con un `<img>` (tile
uniforme 3:2, `object-fit: cover`, `loading="lazy"`) envuelto en un `<a href>` al archivo
local, más un `<figcaption>` que describe la imagen e indica su eje.

La galería agrupa **28 imágenes**: las 15 ya presentes en `assets/img/` (features 001–004)
y **13 nuevas** ya descargadas de FILMGRAB, optimizadas a JPEG ≤ 250 KB y registradas en
`assets/img/CREDITOS.md` + `ASSET_CREDITS` (`js/creditos.js`) — ver `research.md` D4/D5. El
contador del test de créditos ya se actualizó (15 → 28) y la suite queda en verde.

Técnicamente es **capa presentacional pura**: se reescribe el `<main>` de `galeria.html`
con HTML semántico y se agrega la **sección 14** a `css/global.css` con el patrón de la
cuadrícula. No hay módulo JS nuevo (sin filtro, sin lightbox), no se toca `js/layout.js`
ni `js/nav-data.js`, y `tests/` no cambia salvo el contador ya ajustado en
`tests/creditos.test.js`. Rutas internas relativas (constitución 1.1.0).

## Technical Context

**Language/Version**: HTML5 semántico, CSS3 (custom properties), JavaScript ES6+ (ES
Modules). Sin cambios respecto de las features 001–004.

**Primary Dependencies**: Ninguna en runtime. Google Fonts vía `<link>` (ya presente en
`galeria.html`). Sin build. Herramientas fuera del repo, solo para preparar assets:
`curl` (descarga) y Pillow (re-encode) — no entran al repo (Principio I).

**Storage**: N/A. Contenido estático y fijo.

**Testing**: Sin cambio de lógica JS. El único cambio en `tests/` es el contador de
`ASSET_CREDITS` en `tests/creditos.test.js` (15 → 28), ya aplicado, para mantener la
sincronía 1:1 con `CREDITOS.md` (FR-007). La suite `node --test tests/*.test.js` DEBE
quedar en verde (26/26). El resto de la feature es HTML/CSS presentacional, validado
contra los criterios de aceptación y `quickstart.md` (Principio V).

**Target Platform**: Navegadores evergreen, últimas 2 versiones de Chrome, Edge y Firefox;
sin polyfills. Safari fuera del alcance de verificación (enmienda 2026-08-28 de la feature
001, heredada por SC-007). `loading="lazy"` es atributo nativo soportado por el baseline.

**Project Type**: Sitio web estático multi-página, sin paso de build. Esta feature toca
una página (`galeria.html`) y una hoja de estilo compartida (`css/global.css`); los
cambios en `assets/img/`, `CREDITOS.md` y `js/creditos.js` ya están hechos (sourcing).

**Performance Goals**: Sin errores de consola en el recorrido de `galeria.html` (FR-013,
SC-007). Peso total de la página ≤ 4 MB (FR-008, SC-011); con las 28 imágenes actuales el
total ronda **~3 MB** (15 reutilizadas ~2,6 MB + 13 nuevas ~1,5 MB, menos las que ya no
se cuentan dos veces). `loading="lazy"` en el 100 % de las miniaturas difiere la carga
fuera del viewport (FR-008a, SC-011).

**Constraints**: Sin frameworks/librerías/TypeScript y sin build (Principio I). Sin
módulo JS propio (FR-016): la galería no tiene filtro ni lightbox. Tiles uniformes 3:2 con
`object-fit: cover` (FR-002a); el recorte de miniatura es esperado y no es defecto
(SC-005). Rutas internas relativas, nunca absolutas con `/` (constitución 1.1.0 / GitHub
Pages subpath — implícito en FR-004/FR-009). Responsive desde 320 px sin desplazamiento
horizontal; cuadrícula a 1 columna a 320 px (FR-012, SC-005). Cuatro anclas `#mundos`
`#personajes` `#ciencia` `#viaje` utilizables con carga directa (FR-017, SC-006). Sin
animaciones ni efectos de atmósfera (FR-015). Ningún segundo color saturado además del
naranja de Gargantúa (FR-014). Atribución obligatoria: sincronía 1:1 `CREDITOS.md` ↔
`ASSET_CREDITS` (FR-007, SC-004) — ya satisfecha.

**Scale/Scope**: 1 página HTML reescrita en su `<main>` (1 sección de intro + 4 secciones
de categoría, ~28 `<figure>` en total); 1 sección CSS nueva (sección 14) reutilizable; 0
módulos JS nuevos; 0 tests nuevos (solo el contador ya ajustado). Sourcing de 13 imágenes
ya cerrado (`research.md`).

## Constitution Check

*GATE: Debe pasar antes de la Fase 0. Se re-evalúa después de la Fase 1 (diseño).*

### Puertas derivadas de los principios

| # | Puerta | Evaluación |
|---|--------|-----------|
| I | Stack vanilla: HTML5 semántico + CSS puro + JS ES6+; sin frameworks/librerías/TypeScript; sin build; única dependencia de red: Google Fonts vía `<link>`. | **COMPLIES**: no se agrega dependencia ni tooling al repo. `curl` y Pillow se usaron fuera del repo para preparar assets (mismo criterio que features 002/003, ver `CREDITOS.md`). El `<img loading="lazy">` es plataforma nativa, no una librería. |
| II | HTML semántico primero: elementos correctos, único `<main>`, encabezados jerárquicos, `alt` (vacío si decorativa), foco visible y tabulación coherente. | **COMPLIES**: FR-011 fija `h1 > h2`; la galería es un `<ul>`/`<li>` real (colección) con `<figure>`/`<figcaption>` por imagen; cada `<img>` informativo lleva `alt` descriptivo; el enlace de cada miniatura y el de cada eje son `<a>` reales con texto propio; el foco visible se hereda de la sección 6 de `global.css`. |
| III | Construcción en capas: base → atmósfera → minijuegos; prohibido sumar efectos sobre una base sin aprobar. | **COMPLIES**: la base (001) y el patrón de página interna (secciones 10–13 de `global.css`) están aprobados y fusionados. La galería es **base** (cuadrícula estática); sin animación, sin Canvas, sin scroll-effects (FR-015). |
| IV | Comprensión sobre generación: el agente no improvisa estructura ni convenciones fuera de constitución/spec; ante ambigüedad, pregunta. | **COMPLIES**: `spec.md` §Clarifications cerró las decisiones abiertas (organización por eje, tiles 3:2, enlace a archivo sin lightbox, tope de peso + `lazy`, fuente FILMGRAB). El sourcing de imágenes se decidió con el usuario (`research.md` D1). |
| V | TDD en la lógica JS; aceptación en la presentación. | **COMPLIES / no aplica TDD**: no hay lógica JS nueva. El único toque en `tests/` es el contador de `ASSET_CREDITS` (15 → 28) para reflejar el catálogo real; sigue siendo una aserción de sincronía, ya en verde. Todo lo demás (HTML de `galeria.html`, CSS sección 14) es presentacional, validado por `quickstart.md`. |
| VI | Rigor científico verificado; textos científicos etiquetados. | **NO APLICA**: la galería no tiene textos científicos ni etiquetas de rigor (FR: los pies son descriptivos, no divulgación científica). Eso es responsabilidad del eje La Ciencia (feature 004). |

### Restricciones técnicas y puertas de calidad

- **Estructura de carpetas**: HTML en `/`, CSS en `css/`, imágenes en `assets/img/` — **COMPLIES** (no se crean carpetas).
- **Nombres**: kebab-case, minúsculas, sin acentos para ids, clases y archivos (`#mundos`, `.galeria-grid`, `mundos-miller-oceano.jpg`) — **COMPLIES**.
- **CSS**: `css/global.css` de base + CSS por página pesada solo si hace falta; nada hardcodeado suelto. — **COMPLIES**: la cuadrícula va como **sección 14** de `global.css` (~35 líneas, reutilizable), no como `css/galeria.css` (no es página pesada: es un grid + figure). Solo se consumen tokens existentes (`--color-texto-atenuado`, `--color-superficie`, `--focus-anillo`); **sin tokens nuevos** y sin segundo color saturado (FR-014). |
- **JS**: ES Modules, sin variables globales — **COMPLIES**: no se toca JS de layout; `js/creditos.js` solo sumó 13 strings al array `ASSET_CREDITS` (dato, no lógica). |
- **Header/footer**: partial único inyectado por `js/layout.js` — **COMPLIES**: `galeria.html` sigue sin declarar header ni footer propios (FR-010); ya carga `js/layout.js`. |
- **Assets**: locales, rutas relativas, atribución en `CREDITOS.md` + `creditos.html` — **COMPLIES**: las 13 nuevas ya están registradas con estado `descargado` y línea espejo en `ASSET_CREDITS` (sincronía 1:1 verificada, SC-004); las 15 reutilizadas ya estaban. Todos los `src`/`href` de `galeria.html` serán relativos (`assets/img/…`, `mundos.html`, …). |
- **Baseline**: evergreen, últimas 2 versiones, sin Safari — **COMPLIES** (SC-007). `loading="lazy"`, `object-fit`, `aspect-ratio` y CSS Grid están en el baseline. |
- **Submenús de ejes**: anclas dentro de la misma página — **COMPLIES**: las 4 anclas de la galería (`#mundos` …) son destinos dentro de `galeria.html`; no cambian el submenú de ningún eje. |
- **Commits**: Conventional Commits, sin atribución a IA ni `Co-Authored-By` — **COMPLIES** (este comando no commitea). |
- **Criterios de aceptación por página**: responsive, HTML válido y semántico, sin errores de consola, links y assets OK, paleta/tipografía vía variables — **COMPLIES** (reflejados en `quickstart.md`). Sin textos de ciencia (no aplica el criterio del Principio VI). |

**Resultado**: el plan COMPLIES con todas las puertas. No hay violaciones que justificar.

### Re-evaluación post-Fase 1

Sin cambios: los artefactos de diseño (`data-model.md`, `contracts/galeria-page.md`,
`quickstart.md`) no introducen dependencias, tokens, carpetas ni lógica. La sección 14 de
`global.css` reutiliza tokens existentes y el patrón `section[id]` ya definido (sección
10). COMPLIES.

## Project Structure

### Documentation (esta feature)

```text
specs/005-galeria/
├── plan.md              # Este archivo (salida de /speckit-plan)
├── spec.md              # Salida de /speckit-specify + /speckit-clarify
├── research.md          # Fase 0 — fuente FILMGRAB, descarte de fancaps, manifiesto de las 13
├── data-model.md        # Salida de Fase 1 — Categoría, Ítem de imagen, reparto de las 28
├── quickstart.md        # Salida de Fase 1 — escenarios de validación
├── contracts/
│   └── galeria-page.md  # Estructura DOM de galeria.html + CSS de la sección 14
├── checklists/
│   └── requirements.md  # Validación de la spec (en verde)
└── tasks.md             # Salida de Fase 2 (/speckit-tasks — NO la crea /speckit-plan)
```

### Source Code (raíz del repositorio)

```text
/
├── galeria.html               # SE REESCRIBE el <main>: 1 <section> de intro (h1 + p) +
                               #  4 <section id="mundos|personajes|ciencia|viaje"> con
                               #  <h2>, enlace al eje y <ul class="galeria-grid"> de <figure>
                               #  (FR-001..FR-005, FR-009..FR-013, FR-017)
/css/
├── global.css                 # SE AGREGA la sección 14 "Galería (feature 005)":
                               #  .galeria-grid (grid auto-fill/minmax), .galeria-grid img
                               #  (aspect-ratio 3/2, object-fit cover), figure/figcaption,
                               #  .galeria-eje-enlace, degradación de figura, 1 columna a 320 px.
                               #  Sin tokens nuevos, sin 2.º color saturado (FR-002a, FR-012, FR-014)
/js/
├── layout.js                  # SIN CAMBIOS
├── nav-data.js                # SIN CAMBIOS (galeria ya está en NavConfig, sin hijos)
├── creditos.js                # YA MODIFICADO (sourcing): +13 líneas en ASSET_CREDITS
/tests/
├── creditos.test.js           # YA MODIFICADO (sourcing): contador 15 → 28
├── layout.test.js             # SIN CAMBIOS
├── submenu-state.test.js      # SIN CAMBIOS
/assets/img/
├── mundos-tierra-tormenta.jpg …  # YA DESCARGADAS (13 nuevas, ver research.md D4)
└── CREDITOS.md                # YA MODIFICADO (sourcing): +13 filas `descargado` + resumen de peso
/sitemap.xml                   # YA REESCRITO a mano (9 URLs) — fuera del alcance de la feature,
                               #  se corrigió en el camino
```

**Structure Decision**: Sitio estático en la raíz del repo, sin cambios de arquitectura.
La feature es de **presentación**: reescribe una página y agrega un bloque CSS
reutilizable. El sourcing de las 13 imágenes nuevas (descarga + optimización + registro en
`CREDITOS.md`/`ASSET_CREDITS`) ya se completó antes de este plan y se documenta en
`research.md`; lo que resta es maquetar `galeria.html` y la sección 14 de `global.css`.

## Complexity Tracking

> Sin violaciones registradas; no se requiere tabla.
