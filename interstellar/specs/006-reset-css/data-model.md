# Data Model — 006-reset-css (Phase 1)

No hay entidades de datos de negocio. Las "entidades" son los **4 archivos CSS** y el
**bloque `<link>`** de cada página. El corazón de este documento es el **mapa de
reubicación** de `css/global.css` (secciones 0–14 + 4b) hacia las 4 hojas.

---

## Entidad 1 — `css/reset.css` (NUEVO)

**Responsabilidad**: reset y normalización entre navegadores. Especificidad 0 (`:where()`)
salvo el bloque de movimiento reducido.

**Contenido** (ver research.md D1 y D4 para el detalle):

- `box-sizing: border-box` global.
- `margin: 0` global (reset TOTAL).
- `-webkit-text-size-adjust` / `text-size-adjust`.
- `body { min-height: 100vh }`.
- Listas: `list-style: none; padding: 0`.
- Media (`img, picture, svg, video, canvas`): `display: block; max-width: 100%`.
- Form controls: `font: inherit`.
- Tablas: `border-collapse: collapse; border-spacing: 0`.
- Enlaces: `text-decoration: none; color: inherit`.
- Botones: `background: none; border: 0; cursor: pointer`.
- `overflow-wrap: break-word` en texto y encabezados.
- `@media (prefers-reduced-motion: reduce)` global agresivo (`*` + `!important`, `0.01ms`).

**Invariante**: toda regla ≤ especificidad `(0,0,1,0)`, **excepto** el bloque
`prefers-reduced-motion` (única excepción permitida por FR-016).

---

## Entidad 2 — `css/variables.css` (NUEVO)

**Responsabilidad**: recursos y tokens globales. Migración **textual** de `global.css`,
sin cambios de valor.

**Contenido**:

| De `global.css` | Qué |
|---|---|
| §0 Fuentes locales | los 2 `@font-face` (`exo2-latin-var.woff2`, `orbitron-latin-var.woff2`) |
| §1 Tokens de diseño | todo el bloque `:root { … }` (paleta, `--font-*`, `--focus-anillo`, `--backdrop-oscurecer`, `--color-case`) |

**Nota**: `@font-face` no es un token pero es un recurso global que va de la mano con los
`--font-*`. Se agrupa acá (research.md D1).

---

## Entidad 3 — `css/base.css` (NUEVO)

**Responsabilidad**: estilos base de **elementos pelados** (no reset, no componentes) +
espaciado vertical del contenido de lectura.

**Contenido**:

| Origen | Reglas | Nota |
|---|---|---|
| `global.css` §2 (parte "tema") | `body { font-family: var(--font-sitio); color: var(--color-texto) }` | era parte del "reset base"; es tema, no reset |
| `global.css` §2 (parte "tema") | `h1–h6 { font-family: var(--font-hero-titulo); font-weight: 700; line-height: 1.2; color: var(--color-texto) }` | idem |
| `global.css` §2 (parte "tema") | `a { color: var(--color-texto); text-decoration: underline; text-underline-offset: 0.2em }` | idem; el reset dejó `a` sin decoración → acá se define la del sitio |
| `global.css` §3 | `p { font-family: var(--font-texto); line-height: 1.6 }` | dedup: hoy hay 2 reglas `p` (§2 line-height, §3 font-family) → se unifican |
| `global.css` §6 | Foco visible base (`:focus-visible { … }`) | pseudo-clase pelada → base |
| `global.css` §9 | Compensación de scroll para anclas (`scroll-margin` / `:target`) | comportamiento base de todos los anclajes |
| **NUEVO (research.md D3)** | `p { margin-block-end: <medido> }`, `ul, ol { margin-block-end: <medido> }`, y `li` si aplica | repone el espaciado que el reset total quitó; valor exacto por comparación visual en tasks |

---

## Entidad 4 — `css/layout.css` (NUEVO)

**Responsabilidad**: layout del sitio + todos los componentes compartidos. Migración
**textual** de `global.css` §3–§14 (salvo lo que se fue a base.css), sin cambios de valor.

| De `global.css` | Qué va a `layout.css` |
|---|---|
| §3 Layout base | `body { display: flex; flex-direction: column; background: var(--color-fondo) }`, `main { flex: 1 0 auto; width: 100% }` |
| §4 Header / navegación | completa |
| §4b Botón CASE + drawer | completa **salvo** el `@media (prefers-reduced-motion: reduce)` → **ese bloque se ELIMINA** (cubierto por reset.css, research.md D4) |
| §5 Footer | completa |
| §7 Hero de inicio | completa (incluye `body.home > header`, `@keyframes case-*` si estuvieran acá — están en §4b) |
| §8 Introducción | completa (`.intro`) |
| §10 Páginas internas / placeholders | completa |
| §11 Sección de eje con backdrop | completa |
| §12 Ficha de personaje | completa |
| §13 Concepto de ciencia + etiqueta de rigor | completa |
| §14 Galería | completa |

**Nota**: `@keyframes` (`case-corre`, `case-rodar`) van a `layout.css` con las reglas que
los usan.

---

## Entidad 5 — Bloque `<link>` del `<head>` (9 páginas)

**Estado actual** (cada página):
```html
<link rel="stylesheet" href="css/global.css">
```

**Estado objetivo** (cada página, mismo orden siempre):
```html
<link rel="stylesheet" href="css/reset.css">
<link rel="stylesheet" href="css/variables.css">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/layout.css">
```

**Reglas**:
- Las 4 hojas, en ese orden exacto, en las 9 páginas.
- Ninguna página referencia `css/global.css` (FR-003).
- Rutas relativas (`css/…`), nunca `/css/…` (constitución).
- Sin `@import` en ninguna hoja (FR-002).

**Páginas**: `index.html`, `mundos.html`, `personajes.html`, `ciencia.html`, `viaje.html`,
`galeria.html`, `trailer.html`, `minijuegos.html`, `creditos.html`.

---

## Transición / orden de operaciones (para tasks)

1. Crear las 4 hojas nuevas repartiendo `global.css` según el mapa (sin cambiar valores;
   solo `reset.css` es contenido nuevo + `base.css` suma el espaciado repuesto).
2. Actualizar el `<head>` de las 9 páginas (1 `<link>` → 4).
3. Comparar visualmente cada página antes/después (capturas). Ajustar `base.css` (D3) hasta
   render idéntico.
4. Borrar `css/global.css`.
5. Actualizar comentarios de `js/layout.js` que citan `global.css` (no funcional).
6. `node --test tests/*.test.js` → 26/26.
