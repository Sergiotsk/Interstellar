# DESIGN.md — Núcleo de diseño del sitio Interstellar

> Documento portable del sistema de diseño. Consolida lo que hoy vive disperso en
> `css/reset.css`, `css/variables.css`, `css/base.css`, `css/layout.css` (+ las
> hojas de página `mundos.css` / `cielo.css` / `personajes.css` / `ciencia.css` /
> `galeria.css` / `contacto.css`), los contratos de `specs/` y
> `proyecto-interstellar-base.md`.
>
> **Uso previsto:** llevar el "core" del diseño a herramientas externas
> (Claude Design u otras) para plantear mejoras sin necesidad de leer todo el CSS.
> Todos los valores de acá salen del código actual en `main` — si el CSS cambia,
> este archivo hay que actualizarlo a mano.

---

## 1. Concepto rector

**"Estás en la cabina de la Ranger."**

El sitio se divide en dos capas visuales que NUNCA se mezclan:

| Capa | Qué es | Metáfora | Acento saturado |
|------|--------|----------|-----------------|
| **Cockpit / chrome** | header, drawer de navegación, footer, LEDs, "teclas", rótulos de instrumento | El **panel de instrumentos** de la nave | **Teal** (`--instrumento-teal`) |
| **Contenido / narrativa** | `<main>`: heros, secciones, fichas, galería, texto | **La vista por la ventana** de la cabina | **Naranja de Gargantúa** (`--color-gargantua`) |

Reglas de oro derivadas del concepto (constitución del proyecto, v2.1.0):

1. El **teal** está **ACOTADO al chrome**. Nunca baja al contenido narrativo.
2. En el contenido, el **único** color saturado es el naranja de Gargantúa. Se
   reserva para señal de máxima jerarquía / licencia narrativa.
3. **Nunca blanco puro.** El texto es crema (`#efe7d6`). El blanco puro solo
   aparece como `#fff` dentro de `color-mix()` para "encender" un estado.
4. Estética **angular, metálica, de instrumento**: recortes diagonales, bezels,
   grilla fina, glows sutiles. Nada redondeado-blando.
5. Los fondos fotográficos van **siempre oscurecidos** (`brightness(0.4)`) para
   sostener el contraste del texto encima.

---

## 2. Restricciones técnicas (no negociables)

- **HTML semántico + CSS + JavaScript vanilla.** Sin frameworks, sin build, sin
  TypeScript, sin Tailwind. (Restricción de cátedra — Programación IV.)
- **Contenido estático y fijo.** No hay API en vivo ni buscador.
- **Multipágina.** Una página HTML por sección. El `<header>` y el `<footer>` se
  **inyectan por JS compartido** (`js/layout.js`) desde una única fuente de
  verdad (`js/nav-data.js`) — no se copian a mano en cada HTML.
- **Hosting: GitHub Pages vía Actions.** URL con subcarpeta
  (`sergiotsk.github.io/Interstellar/`) → **todas las rutas relativas**, sin
  `/` inicial.
- **Tipografías self-hosted** (`assets/fonts/*.woff2`, subset latin). Sin Google
  Fonts, sin request bloqueante de terceros.

---

## 3. Tokens de diseño

Fuente: `css/variables.css` (`:root`). Los **nombres** están contratados en
`specs/001-shared-layout-hero/contracts/design-tokens.md` — no renombrar.

### 3.1 Color — capa contenido / espacio

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-fondo` | `#0a0e1a` | Fondo base del sitio (azul noche profundo) |
| `--color-superficie` | `rgba(20, 28, 49, 0.88)` | Superficies de contenido: tarjetas, fichas, figuras, chips. Translúcida para superponerse a backdrops |
| `--color-texto` | `#efe7d6` | Texto principal (crema) |
| `--color-texto-atenuado` | `#a8a294` | Texto secundario: subtítulos, meta, captions |

### 3.2 Color — acentos de contenido

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-gargantua` | `#e8803b` | **Único** acento saturado del contenido. Señal de máxima jerarquía / licencia narrativa. Es también el color del anillo de foco en el contenido |
| `--color-tierra-ocre` | `#a8793f` | Acento terroso de la Tierra (ocre) — uso puntual |
| `--color-tierra-oro` | `#d4a94e` | Acento terroso de la Tierra (dorado) — uso puntual |

### 3.3 Color — capa cockpit (chrome)

| Token | Valor | Uso |
|-------|-------|-----|
| `--instrumento-teal` | `#4fd0e0` | Acento de la capa cockpit: enlaces del drawer, teclas encendidas, filos "encendidos", LED SYS, anillo de foco en el chrome |
| `--instrumento-pantalla` | `#0c2529` | Fondo de "pantalla apagada" para paneles |
| `--led-ambar` | `#e0a94a` | LED de estado (PWR) |
| `--led-alerta` | `#d0453a` | LED de alerta (uso puntual) |
| `--color-case` | `#9aa6b6` | Gunmetal claro. **Único acento frío en reposo**: el botón de navegación CASE cuando está cerrado. En hover/abierto pasa a teal |

### 3.4 Color — metal del cockpit (bandas, bezels, teclas)

| Token | Valor | Uso |
|-------|-------|-----|
| `--cockpit-metal` | `#12161a` | Base de la banda de instrumentos (más oscura y menos azul que `--color-superficie`) |
| `--cockpit-metal-alto` | `#1c2226` | Cara superior del gradiente de panel |
| `--cockpit-bezel` | `#3d454c` | Borde metálico (1px) |
| `--cockpit-bezel-brillo` | `#4a5560` | Reflejo del bezel (línea clara, `inset 0 1px 0`) |

### 3.5 Tipografía

| Token | Familia | Fallback | Uso |
|-------|---------|----------|-----|
| `--font-hero-titulo` | `'Orbitron'` (400–900, variable) | `'Exo 2', system-ui, sans-serif` | Títulos y display: `h1`–`h6`, heros |
| `--font-sitio` / `--font-texto` / `--font-nav` | `'Exo 2'` (100–900, variable) | `system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif` | Cuerpo, párrafos, listas, navegación en desktop |
| `--font-instrumento` | `'Share Tech Mono'` (400) | `ui-monospace, 'Cascadia Code', Consolas, monospace` | UI de instrumentos: rótulo `NAV · RANGER`, enlaces del drawer, lecturas del footer |

`font-display: swap` en las tres. Un solo `.woff2` por familia (variable font)
cubre todo el eje de peso.

### 3.6 Forma / geometría

| Token | Valor | Uso |
|-------|-------|-----|
| `--recorte-tecla` | `polygon(7px 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%, 0 7px)` | Recorte diagonal de las "teclas" del cockpit: esquina **superior-izquierda + inferior-derecha** cortadas a 7px. Shape simétrico a 180° |

Otros `clip-path` recurrentes (definidos inline en `layout.css`, no tokenizados):

- **Banda del header:** esquinas **inferiores** cortadas (12px vertical, 20px
  horizontal) → marco de la ventana de la cabina.
- **Footer:** espejo del header — esquinas **superiores** cortadas.
- **Drawer / dropdowns:** esquina superior-derecha cortada (10–12px) → "sale"
  del botón CASE.

### 3.7 Efectos / filtros

| Token | Valor | Uso |
|-------|-------|-----|
| `--backdrop-oscurecer` | `brightness(0.4)` | Filtro obligatorio sobre **todo** fondo fotográfico (`.hero-backdrop`, `.eje-backdrop`) |
| `--focus-anillo` | `var(--color-gargantua)` en `:root`; reasignado a `var(--instrumento-teal)` dentro de `header` y `footer` | Color del anillo de foco. La regla global de `:focus-visible` consume esta property → cada capa impone su acento |

### 3.8 Escalas no tokenizadas (viven inline — candidatas a tokenizar)

| Concepto | Valores usados |
|----------|----------------|
| Radio de borde (contenido) | `2px` (galería, superficies), `0.25rem` (fichas, figuras), `999px` (chips de rigor) |
| Transición estándar | `0.15s ease` (color, borde, fondo, glow); `0.2s ease` (transform del botón CASE) |
| Grilla fina de instrumento | `repeating-linear-gradient(90deg, transparent 0 22px, rgba(255,255,255, .015–.025) 22px 23px)` |
| `backdrop-filter` de la banda header | `blur(8px)` |
| Target táctil mínimo | `44px` (WCAG 2.5.8) — botones de nav, `▼`, enlaces del drawer |
| Ancho de columna de lectura | `max-width: 60rem` (sección), `42–46rem` (párrafo) |
| Breakpoints | `22rem` (oculta `NAV · RANGER` largo), `30rem`, `48rem` (float del retrato), `60rem` (drawer → barra desktop) |

---

## 4. Sistema tipográfico aplicado

Base: `css/base.css`.

- `body`: `--font-sitio`, `color: --color-texto`.
- `h1`–`h6`: `--font-hero-titulo`, `font-weight: 700`, `line-height: 1.2`,
  `color: --color-texto`.
- `p`: `--font-texto`, `line-height: 1.6`, `margin-block: 1em`.
- **Espaciado vertical repuesto del UA** (el reset borra todos los márgenes):
  `h1 .67em · h2 .83em · h3 1em · h4 1.33em · h5 1.67em · h6 2.33em` (margin-block-end),
  `ul, ol` → `1em`.
- Enlaces (`base.css`): `color: --color-texto`, `text-decoration: underline`,
  `text-underline-offset: 0.2em`. El reset los deja neutros (`color: inherit`,
  sin subrayado); el estilo real lo pone `base.css`.

### Escalas fluidas por contexto

| Contexto | `font-size` | Peso | `letter-spacing` | Notas |
|----------|-------------|------|------------------|-------|
| Hero `h1` (home) | `clamp(1.5rem, 7vw, 5.5rem)` | 800 | `0.05em` | `text-transform: uppercase`, halo `text-shadow: 0 0 1.5rem var(--color-fondo)` |
| Hero tagline | `clamp(1rem, 2.5vw, 1.35rem)` | — | — | `line-height: 1.65`, `--color-texto-atenuado`, halo `0 0 1rem` |
| `h1` páginas internas | `clamp(1.75rem, 5vw, 3rem)` | 800 | `0.05em` | uppercase |
| `section[id] h2` | `clamp(1.25rem, 3vw, 1.75rem)` | 700 | `0.04em` | — |
| `h3` de ficha / concepto | `clamp(1rem, ~2.2vw, 1.15–1.2rem)` | 700 | `0.03em` | — |
| Rótulo `NAV · RANGER` | `0.7rem` | 400 | `0.22em` | `--font-instrumento`, uppercase, `text-shadow` teal |
| Enlaces del drawer | `0.95rem` | 400 | `0.12em` | `--font-instrumento`, uppercase, teal + glow |
| Enlaces submenú | `0.82rem` (drawer) / `0.78rem` (desktop) | 400 | `0.08em` | `word-break: break-word` |
| Footer (`.tele`) | `0.82rem` | 400 | `0.04–0.06em` | `--font-instrumento`, `--color-texto-atenuado` |
| Chip de rigor | `0.78rem` | 500 | — | `--font-texto` |

---

## 5. Cascada de hojas CSS

Contrato: `specs/006-reset-css/contracts/hojas-css.md`. Orden fijo de `<link>`:

1. **`reset.css`** — normalización entre navegadores. Selectores `:where(...)`
   → especificidad `(0,0,0,0)`: cualquier regla posterior lo pisa sin
   `!important`. **No impone decisiones de diseño** (nada de paleta ni familias).
   Única excepción: bloque `@media (prefers-reduced-motion: reduce)` con `*` +
   `!important`.
2. **`variables.css`** — `@font-face` + todos los tokens en `:root`.
3. **`base.css`** — defaults del sitio sobre **elementos pelados** (tipografía,
   color, foco, espaciado de lectura). Regla de reparto: selector de elemento o
   pseudo-clase pelada → acá.
4. **`layout.css`** — layout del sitio y **componentes** compartidos por TODAS las
   páginas (header, footer, hero de la home, placeholders de página, aviso de
   spoiler). ~1300 líneas. Las secciones page-specific §11–§16 se movieron a
   hojas de 5º nivel el 2026-09-10 (contrato C6): `mundos.css` (+§11 eje-backdrop),
   `cielo.css` (§15 campo estelar, opt-in `body.con-cielo`, en 11 páginas),
   `personajes.css`, `ciencia.css`, `galeria.css`, `contacto.css`.
5. *(Opcional, por página)* Un `<link>` propio **después** de `layout.css`, solo
   en las páginas que lo usan. Orden: hoja de área (`mundos.css` / `personajes.css`
   / …) y `cielo.css` al final. `index.html`, `creditos.html` y `viaje.html` cargan
   solo las 4 hojas base.

---

## 6. Componentes

### 6.1 Header — banda de instrumentos

- Una fila, `justify-content: flex-end` → botón CASE a la **derecha**.
  `padding: 0.8rem 1rem 0.95rem`. `position: relative; z-index: 20`.
- El fondo lo pinta **`header::before`** (no el `<header>`) para que su
  `clip-path` no recorte al drawer:
  - Grilla fina + gradiente metálico translúcido (`color-mix` con `--cockpit-metal*`).
  - `backdrop-filter: blur(8px)` → en la home se lee como HUD sobre el Hero.
  - **Filo inferior "encendido":** `border-bottom` teñido de teal + `box-shadow`
    `inset` con línea de luz teal + reflejo `--cockpit-bezel-brillo` + sombra
    interior negra.
  - `clip-path`: esquinas inferiores cortadas.
- Por llevar `backdrop-filter`, `header::before` crea stacking context → el
  botón CASE (`.nav-toggle`) y el rótulo (`.cockpit-brand`) necesitan
  `position: relative; z-index: 1`.
- En `body.home`: `header` pasa a `position: absolute; top/left/right: 0;
  z-index: 20` → se **superpone** al Hero. En el resto de las páginas queda en
  flujo normal.

### 6.2 Rótulo `NAV · RANGER` (`.cockpit-brand`)

- `<a>` al inicio, extremo izquierdo de la banda (`position: absolute; left: 3rem`).
- `--font-instrumento`, `0.7rem`, `letter-spacing: 0.22em`, uppercase, teal con
  `text-shadow` de glow.
- Dos LEDs a su izquierda vía `::before` (SYS, teal) y `::after` (PWR, ámbar):
  círculos de `7px` + halo `box-shadow`, **titilan** desincronizados
  (`cockpit-led-pulso` 2.6s / 1.9s).
- A `≤22rem` se recorta a solo `NAV` (`.cockpit-brand-ext { display: none }`).
- A `≥60rem` desaparece (la barra de teclas ocupa la banda).

### 6.3 Botón CASE (`.nav-toggle`) — única navegación

- **Ícono:** 4 barras **verticales** (la hamburguesa de 3 líneas horizontales
  "girada" 90°) → referencia al monolito del robot CASE. `28×24px`, `gap: 4px`,
  barras de `4px` con `currentColor`.
- **Reposo:** `--color-case` (gunmetal), sin caja (`border: 0`, fondo
  transparente). **Hover / abierto:** `--instrumento-teal`.
- **Al abrir el menú** (`aria-expanded="true"`): dos animaciones simultáneas
  evocando a CASE corriendo y rodando en Miller:
  - `case-corre` (2.6s, `forwards`): fase 1 = una zancada (las barras pivotan
    desde los "hombros", abren en X, se juntan para el salto, con rebote
    vertical); fase 2 = las patas convergen al centro y cruzan en ángulos
    desparejos → aspa tipo spinner. Cada barra con sus propios ángulos
    (`--abre`, `--junta`, `--cruz`) y `animation-delay` negativo (cascada).
  - `case-rodar` (4.6s, `linear infinite`): gira todo el ícono, parejo.

### 6.4 Drawer de navegación (`#nav-principal`, `header nav`)

**Es la única navegación en todos los viewports.** Cerrado por defecto; JS le
pone `.nav-abierto`.

- **Mobile / tablet (`<60rem`):** panel flotante bajo el botón CASE.
  `position: absolute; top: 100%; right: 0.75rem`.
  `width: min(22rem, calc(100vw - 1.5rem))`, `max-height: calc(100dvh - 100%)`,
  scroll interno.
  Panel metálico: grilla fina + gradiente `--cockpit-metal-alto → --cockpit-metal`,
  `border: 1px solid --cockpit-bezel`, reflejo `inset` + sombra proyectada,
  `clip-path` con esquina sup-der cortada.
- **Estructura DOM** (la produce `buildHeader` en `js/layout.js`, contrato
  `layout-injection.md`):
  ```
  header > nav > ul (nivel superior) > li
    ├─ a               (destino directo)
    ├─ button          (control de disclosure del submenú — ▼)
    └─ ul[hidden]      (solo los 4 ejes — destinos anidados; hidden = colapso funcional)
  ```
- **Ítem = "tecla de panel":** `header nav > ul > li > a` lleva
  `clip-path: var(--recorte-tecla)`, `border: 1px solid transparent`, LED
  (`::before`, teal, `opacity: 0.4` en reposo), alto táctil `44px`.
  Se **enciende** en `:hover`, `:focus-visible` y `[aria-current="page"]`:
  borde teal (`color-mix` 42%), fondo `linear-gradient` teal tenue, texto a
  `color-mix(teal 82–88%, #fff)` + glow, LED a `opacity: 1` con halo mayor.
- **Control `▼`** (`header nav button`): botón independiente del enlace, misma
  "tecla" (`--recorte-tecla`), gradiente metálico, bezel. `aria-expanded="true"`
  → `transform: rotate(180deg)` (▼→▲) + se enciende en teal.
- **Submenú** (`ul ul`): cae a su propia fila dentro del `<li>`
  (`flex-wrap: wrap`, `flex: 1 0 100%`), con sangría `1rem`. El atributo
  `hidden` es el colapso funcional — ninguna regla de autor declara `display`
  sobre él para que `hidden` siempre gane (BUGFIX SC-010).
- **Desktop (`≥60rem`):** el `<nav>` vuelve al flujo (`position: static`, sin
  panel/`clip-path`/caja). `> ul` pasa a `flex-direction: row`, centrado,
  `gap: 0.5rem 0.55rem`.
  - La **tecla es el `<li>` entero**; su cara (fondo + bezel + `--recorte-tecla`)
    va en `li::before` (absoluto, `z-index: 0`) para que el `clip-path` no
    recorte el dropdown.
  - Encendido por `:hover`, `:focus-within`, `:has(> a[aria-current="page"])`.
  - `▼` = glifo en la cara de la tecla, sin caja visible pero con `padding`
    simétrico (`0.4rem 0.45rem` → hit area ~24px) y `0.62rem`. El padding
    simétrico no corre el centro → el `rotate(180deg)` gira sobre el propio eje.
  - Submenú = **dropdown flotante** (`position: absolute; top: 100%`,
    `z-index: 30`), `min-width: 13rem`, panel metálico con `clip-path`.
    Apertura **solo por clic/teclado en el botón `▼`** (disclosure) — sin
    hover-open: cruzar la barra con el ratón no despliega nada. Cierra con
    Escape, clic fuera o al elegir un destino anidado; una vez abierto **no** se
    cierra por `mouseleave`.

### 6.5 Footer — consola inferior

- Espejo del header: grilla fina + gradiente metálico, **filo superior
  "encendido"** (borde teal + luz teal `inset`), `clip-path` con esquinas
  **superiores** cortadas.
- `text-align: center`, `--font-instrumento`, `0.82rem`,
  `color: --color-texto-atenuado`. `padding: 1.7rem 1rem 1.4rem`.
- `footer,header { --focus-anillo: var(--instrumento-teal) }` → el anillo de
  foco de todo el chrome es teal.
- **Fila de teclas `.tele`** (`flex-wrap`, centrado, `gap: 0.5rem 0.55rem`),
  `flex: 0 0 auto` (nunca a lo ancho):
  - `.tele-accion` → tecla-**botón**: un `<a>` la ocupa entera y es el destino.
    Se enciende (bezel teal + fondo teal + glow del texto `.tele-v`) en
    `:hover` / `:focus-within`.
  - `.tele` a secas (CREW) → **display de lectura**: mismo aspecto, sin acción.
  - Cada una: `border: 1px solid --cockpit-bezel`, gradiente metálico,
    `clip-path: var(--recorte-tecla)`.
- **`.led`** (componente reutilizable, siempre `aria-hidden`): círculo `7px` +
  halo `box-shadow`. Variantes `.led-ambar`, `.led-alerta`. Titileo
  `cockpit-led-pulso` (2.6s; alerta 1.4s).

### 6.6 Hero de inicio (`.hero`)

- Solo en `body.home`. `min-height: 100svh` (con `100vh` de respaldo),
  flex centrado, `overflow: hidden`, `text-align: center`,
  `background-color: var(--color-fondo)` de respaldo.
- **`.hero-backdrop`**: `<video>` decorativo (`aria-hidden`, loop mudo del
  agujero negro), `position: absolute; inset: 0`, `object-fit: cover`,
  `filter: var(--backdrop-oscurecer)`. `poster` (`hero-gargantua.jpg`) cubre
  mientras carga y si falla. `js/layout.js` lo **pausa** con
  `prefers-reduced-motion` → queda el poster fijo.
- **`.hero-contenido`** (`<hgroup>`): `z-index: 1`, `max-width: 60rem`,
  `padding: 5.5rem 1.25rem 4rem` (reserva superior para no chocar con el header
  superpuesto). Contiene solo `h1` + `.hero-tagline` (la "introducción breve"
  original se disolvió en la tagline → la home entra en **una pantalla sin
  scroll**).
- **Home sin scroll:** `body.home` es flex-column con `min-height: 100svh`;
  `body.home .hero` anula su `100svh` (`min-height: 0; flex: 1 0 auto`) y toma
  el alto que sobra tras el footer → Hero + consola entran juntos en la
  pantalla.

### 6.7 Páginas internas — presentación coherente

- `body:not(.home) main > section:first-child` = bloque de presentación:
  `max-width: 60rem`, `margin: 0 auto`, `padding: 4rem 1.25rem 2rem`,
  `text-align: center`. `h1` fluido + `p` (`max-width: 42rem`,
  `--color-texto-atenuado`, `line-height: 1.7`).
- `section[id]` = destinos ancla: `max-width: 60rem`, `margin: 0 auto`,
  `padding: 2.25rem 1.25rem`,
  `border-top: 1px solid color-mix(in srgb, var(--color-texto) 12%, transparent)`.
  `scroll-margin-top: 5.5rem` (header de ~4.25rem + respiro) para carga directa
  con `#ancla`.

### 6.8 Sección con backdrop (`.eje-con-backdrop`) — patrón reutilizable

Feature 002. Cualquier `section[id]` de contenido puede llevar imagen de fondo
propia.

- `.eje-con-backdrop`: `position: relative`, `overflow: hidden`,
  `isolation: isolate`, `background-color: var(--color-fondo)` (respaldo).
- `.eje-backdrop`: `<img>` **decorativo** (`alt=""`), `position: absolute;
  inset: 0`, `object-fit: cover`, `filter: var(--backdrop-oscurecer)`,
  `z-index: 0`.
- `.eje-contenido`: `position: relative; z-index: 1`. Sobre foto, el texto
  secundario **sube** de `--color-texto-atenuado` a `--color-texto`, y
  `h2`/`h3` llevan halo `text-shadow: 0 0 1rem var(--color-fondo)`.

### 6.9 Ficha de personaje (`.ficha-personaje`) — patrón reutilizable

Feature 003. Retrato **informativo** (NO usa el patrón backdrop: sin
oscurecer, sin posición absoluta).

- `.ficha-retrato` (`<figure>`): `background-color: var(--color-superficie)`,
  `border: 1px solid color-mix(texto 12%)`, `border-radius: 0.25rem`,
  `overflow: hidden`. Si no tiene `<img>` → `display: none` (no deja hueco roto).
- `figcaption`: `0.85rem`, `--color-texto-atenuado`.
- `≥48rem`: el retrato **flota a la izquierda** (`float: left; width: 15rem;
  margin: 0.25rem 1.75rem 1rem 0`), el texto lo rodea (maqueta tipo ficha de
  revista). Mobile: en flujo, arriba del texto.
- `.ficha-reparto`: línea de crédito de reparto, `font-style: italic`,
  `0.9rem`, fuera del `<figure>`.

### 6.10 Concepto de ciencia + etiqueta de rigor (`.concepto`, `.rigor`)

Feature 004. **La distinción de nivel se lee en el TEXTO, nunca solo por color**
(FR-016 — accesibilidad).

- `.rigor` (chip `<span>` inline): `border: 1px solid color-mix(texto 22%)`,
  `border-radius: 999px`, `background: var(--color-superficie)`,
  `color: var(--color-texto)`, `0.78rem`, `font-weight: 500`. El texto dice el
  nivel: `"✓ Ciencia real"`, etc.
- El `border-left` refuerza el nivel (nunca única señal):
  - `.rigor-real` → `3px solid` `color-mix(texto 55%)`.
  - `.rigor-plausible` → `3px dashed` `color-mix(texto 40%)`.
  - `.rigor-licencia` → `3px solid var(--color-gargantua)` (el único acento
    saturado del contenido, reservado a la licencia narrativa).
- `.rigor-leyenda` (`<dl>`): grid `max-content 1fr`, colapsa a 1 columna a
  `≤30rem`.
- `.concepto figure`: figura ilustrativa informativa, misma caja que
  `.ficha-retrato` (superficie + borde 12% + radius `0.25rem`),
  `max-width: 32rem`.

### 6.11 Galería (`.galeria-grid`)

Feature 005. Sin segundo color saturado, solo tokens existentes.

- `display: grid`, `gap: 0.75rem`,
  `grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr))`
  → 1 columna sin desbordar a 320px.
- Tiles uniformes: `img { aspect-ratio: 3 / 2; object-fit: cover }` — el recorte
  de miniatura es **intencional**.
- `figure > a`: `background: var(--color-superficie)`, `border-radius: 2px`,
  `overflow: hidden`.
- `.galeria-eje-enlace`: enlace al eje, `--font-nav`, subrayado con
  `text-decoration-color` atenuado que se satura en hover.

### 6.12 Cielo (`.cielo`) — campo estelar + estrella fugaz

`css/cielo.css` (era `layout.css` §15 hasta el 2026-09-10; contrato C6). Capa de
CONTENIDO (crema, nada de teal). `js/layout.js` inyecta
`<div class="cielo" aria-hidden><i></i><i></i><i></i></div>` como **primer hijo
del `<body>`**, pero **solo** en las páginas con `class="… con-cielo"` — las
mismas 11 que enlazan `cielo.css`. Va en todas **menos** tres: `index` (el
`<video>` full-bleed del Hero lo taparía por completo), `viaje` (trae escena
three.js propia) y `creditos` (mínima). Antes vivía en `mundos.css` acotado a
`body.mundos-hub`.

- `.cielo`: `position: fixed; inset: 0; z-index: 0; overflow: hidden;
  pointer-events: none; contain: layout paint`. El `<header>` ya lleva
  `z-index: 20` en todas las páginas; `body.con-cielo > main, > footer` suben a
  `z-index: 1` para quedar por encima.
- **Campo estelar:** dos capas de `box-shadow` (posiciones y brillos irregulares,
  ~435 estrellas en total). `.cielo::before` lejana (muchas, tenues, `1px`);
  `.cielo::after` cercana (menos, brillantes, `1.5px`). Cada capa **deriva**
  (`cielo-deriva-lejos/cerca`, 260s / 170s) y **titila** (`cielo-titileo-lejos/cerca`,
  11s / 7s) a distinto ritmo. Color `rgba(239, 231, 214, α)` — nunca `#fff`.
- **Estrella fugaz:** 3 `<i>` con `animation: cielo-fugaz` de duración/demora
  distintas (14s+3s / 22s+10s / 28s+18s) → irregular, "cada tanto". Cada raya
  viaja abajo-izquierda vía la propiedad `translate` (el `rotate: -33deg` fijo
  orienta cabeza + cola) y solo es visible ~1 s por ciclo. La cola es
  `i::before` (`linear-gradient` crema→transparent), apuntando al revés del viaje.
- **Mobile (`≤48rem`):** se apaga `.cielo::after` (mitad de estrellas) y la
  deriva de la capa lejana (queda solo el titileo); una sola fugaz. En celular el
  efecto casi no se aprecia y `box-shadow` + `translate` de una capa grande es lo
  caro de pintar.
- **`prefers-reduced-motion`:** el reset global congela la deriva; las fugaces se
  **retiran** (`display: none`) para no quedar clavadas a mitad de vuelo.

---

## 7. Movimiento

- **Transiciones:** `0.15s ease` para color / borde / fondo / glow;
  `0.2s ease` para el `transform` del ícono CASE. Nada más largo en UI.
- **Animaciones con nombre:**
  - `cockpit-led-pulso` — `opacity: 1 ↔ 0.4`, duraciones desincronizadas
    (1.4s / 1.9s / 2.6s) para que los LEDs no titilen en fase.
  - `case-corre` + `case-rodar` — apertura del menú (ver §6.3).
  - `cielo-deriva-lejos/cerca` + `cielo-titileo-lejos/cerca` + `cielo-fugaz` —
    campo estelar y estrella fugaz (ver §6.12). Lentísimas (170–260s la deriva) o
    intermitentes (la fugaz se ve ~1s cada 14–28s).
- **`prefers-reduced-motion: reduce`** (bloque global en `reset.css`, `*` +
  `!important`): `animation-duration: 0.01ms`, `animation-iteration-count: 1`,
  `transition-duration: 0.01ms`, `scroll-behavior: auto`. `0.01ms` (no `0s`)
  para no romper los eventos `animationend` / `transitionend`. El `<video>` del
  Hero lo pausa `js/layout.js` con la misma media query; la **estrella fugaz** se
  oculta con `display: none` (el `iteration-count: 1` la dejaría clavada).

---

## 8. Accesibilidad (invariantes)

1. **Foco visible en el 100% de controles y enlaces.** `:focus-visible` →
   `outline: 2px solid var(--focus-anillo)` + `outline-offset: 2px` +
   `box-shadow: 0 0 0 2px var(--color-fondo)` (doble anillo: el halo oscuro
   delimita el anillo de color sobre fondos fotográficos). El color es naranja
   en el contenido, teal en el chrome (via `--focus-anillo`).
2. **Targets táctiles ≥ 44px** (WCAG 2.5.8) en toda la navegación — es la única
   navegación en todos los viewports.
3. **La información nunca depende solo del color:** niveles de rigor por texto +
   estilo de borde; `aria-current="page"` además del encendido visual;
   `aria-expanded` en los disclosures.
4. **Contraste sostenido sobre fondo oscuro:** texto crema sobre `#0a0e1a`;
   fondos fotográficos siempre a `brightness(0.4)`; halos `text-shadow` en
   títulos sobre imagen.
5. **Imágenes decorativas** (`alt=""` + `aria-hidden` donde corresponde):
   backdrops, LEDs, ícono CASE. Imágenes **informativas** (retratos, figuras de
   ciencia) llevan `alt` real y NO se oscurecen.
6. **Sin overflow horizontal a 320px:** `overflow-wrap: break-word` global,
   anchos `min(…, 100vw - …)`, `word-break` en labels largos del submenú.

---

## 9. Mapa de navegación (fuente: `js/nav-data.js`)

```
Inicio        index.html
Mundos        mundos.html      → #tierra #gargantua #miller #mann #tesseract
Personajes    personajes.html  → #cooper #murph #brand #profesor-brand #mann #tars-case
La Ciencia    ciencia.html     → #agujeros-negros #dilatacion-temporal #agujeros-de-gusano #relatividad
El Viaje      viaje.html       → #tierra #agujero-de-gusano #miller #mann #gargantua #tesseract
Galería       galeria.html
Minijuegos    minijuegos.html
Trailer       trailer.html
```

Los **4 ejes** (Mundos / Personajes / La Ciencia / El Viaje) reemplazan al eje
"temporadas → capítulos" de una serie y son los únicos con submenú.
`labels` con acentos; `id`/`href` en kebab-case sin acentos.

---

## 10. Checklist para proponer mejoras (leer antes de tocar)

- [ ] ¿La mejora respeta la separación **cockpit (teal) ≠ contenido (naranja)**?
- [ ] ¿Introduce un color nuevo? → salvo caso muy justificado, **no**. El
      contenido tiene un solo acento saturado.
- [ ] ¿Usa blanco puro como color final? → **no**, solo dentro de `color-mix`
      para "encender".
- [ ] ¿Agrega un valor mágico repetido? → tokenizarlo en `variables.css`
      (candidatos en §3.8).
- [ ] ¿Rompe la familia angular (recortes diagonales, bezels)? → revisar.
- [ ] ¿Anima algo? → confirmar que el bloque `prefers-reduced-motion` lo cubre.
- [ ] ¿Toca navegación? → mantener `44px`, `aria-*`, y que el atributo `hidden`
      siga ganando sobre cualquier `display` de autor.
- [ ] ¿Suma dependencia externa (fuente, script, CDN)? → **no** (vanilla +
      self-hosted + rutas relativas para GitHub Pages).
- [ ] ¿Cambia estructura del `<header>`/`<footer>`? → hay que tocar
      `js/layout.js` y su contrato, no solo CSS.
```
