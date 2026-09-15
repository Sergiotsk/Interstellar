# Research — 006-reset-css (Phase 0)

La spec no dejó `[NEEDS CLARIFICATION]` (las 3 se resolvieron en la sesión del 2026-09-02:
1C split completo, 2C reset total + espaciado repuesto, 3A `prefers-reduced-motion` global).
Quedan decisiones de implementación a fijar antes de tasks.

---

## D1 — Base del reset `:where()`

**Decisión**: reset hecho a mano, tomando de referencia el *Modern CSS Reset* de Andy Bell
y el de Josh Comeau, pero **reproduciendo el efecto del reset actual de `global.css` §2**
más los agregados que pide la spec (FR-007..FR-018). Nada de copiar un reset entero de
tabla: solo las reglas que la spec enumera.

**Contenido acordado** (todas en `:where()` salvo D4):

| Regla | FR |
|---|---|
| `:where(*, *::before, *::after) { box-sizing: border-box }` | FR-007 |
| `:where(*, *::before, *::after) { margin: 0 }` | FR-008 (reset TOTAL) |
| `:where(html) { -webkit-text-size-adjust: 100%; text-size-adjust: 100% }` | (normalización, ya estaba) |
| `:where(body) { min-height: 100vh }` | (ya estaba; `100vh`, no `svh`, para no cambir comportamiento) |
| `:where(ul, ol) { list-style: none; padding: 0 }` (margin ya lo cubre el reset total) | FR-009 |
| `:where(img, picture, svg, video, canvas) { display: block; max-width: 100% }` | FR-010 |
| `:where(input, button, textarea, select) { font: inherit }` | FR-011 |
| `:where(table) { border-collapse: collapse; border-spacing: 0 }` | FR-012 |
| `:where(a) { text-decoration: none; color: inherit }` | FR-013 |
| `:where(button) { background: none; border: 0; cursor: pointer }` | FR-014 |
| `:where(p, li, h1, h2, h3, h4, h5, h6, figcaption, dd) { overflow-wrap: break-word }` | FR-015 |
| bloque `@media (prefers-reduced-motion: reduce)` | FR-016 (ver D4) |

**Rationale**: el sitio ya tenía un reset chico; convertirlo a `:where()` y sumarle lo que
falta es de bajo riesgo y explicable regla por regla (Principio IV). No se agrega
`-webkit-font-smoothing`, `text-wrap: balance/pretty` ni nada opinado que cambie el render
actual: la spec exige "idéntico antes/después".

**Alternativas descartadas**:
- *modern-normalize / normalize.css completos*: traen decenas de reglas para casos que este
  sitio no tiene (`sub`/`sup`, `abbr`, `progress`, `fieldset`…). Ruido; contra Principio IV.
- `text-wrap: balance/pretty` en el reset: mejora real pero **cambia** los quiebres de línea
  de títulos y párrafos → viola "sin regresiones". Queda para una feature de tipografía.

---

## D2 — Regla de reparto: `base.css` vs `layout.css`

**Decisión**: regla mecánica por tipo de selector.

- **`base.css`** = reglas cuyo selector es un **elemento o pseudo-clase pelado**
  (`body` [solo tipografía/color], `h1–h6`, `p`, `a`, `ul`, `ol`, `li`, `:focus-visible`,
  `:target` / `scroll-margin`). Son defaults del sitio que NO son reset (imponen paleta,
  fuente, foco, espaciado de lectura).
- **`layout.css`** = todo lo demás: reglas con **clase o contexto estructural**
  (`header`, `header nav …`, `.nav-toggle`, `.case-icon`, `@keyframes case-*`, `footer`,
  `.hero`, `body.home > header`, `.intro`, `.eje-*`, `.ficha-*`, `.ciencia-*`,
  `.galeria-*`, y sus `@media`).

`body` se parte en 3 archivos, cada uno con SU concern:
- `reset.css`: `body { margin: 0; min-height: 100vh }`
- `base.css`: `body { font-family: var(--font-sitio); color: var(--color-texto) }`
- `layout.css`: `body { display: flex; flex-direction: column; background: var(--color-fondo) }`

**Rationale**: criterio objetivo, sin juicio caso por caso → la reubicación es verificable y
reproducible. Coincide con la intención de la spec (`base.css` = "estilos base de
elementos"; `layout.css` = "layout + componentes compartidos").

**Alternativas descartadas**:
- *5ª hoja `components.css`*: la constitución v1.2.0 fija 4 hojas. Sumar una 5ª sería
  enmendar de nuevo. Los "componentes" caben en `layout.css`.
- *`base.css` por "todo lo global no-componente"*: mete `header`/`footer`/`.hero` en base;
  esos son componentes → van a layout. La regla por tipo de selector es más limpia.

---

## D3 — Espaciado de contenido a reponer (por el reset total de márgenes)

**Hallazgo** (auditoría de `global.css`): el espaciado vertical de las páginas de contenido
está **casi todo explícito** vía clases (`.eje-*`, `.ficha-*`, `.ciencia-*`, `.galeria-*`
tienen sus propios `margin`/`padding`). Lo único que hoy depende de defaults del navegador:

- **`<p>`**: no tiene `margin` propio en `global.css` (solo `line-height` y `font-family`).
  Su separación viene del UA default `margin-block: 1em`. El reset total lo elimina.
- **`<ul>`/`<ol>` de lectura** dentro de secciones de eje/ficha/ciencia: hoy `margin-top: 0`
  + algún `padding-left` por clase; el `margin-bottom` default del UA (`1em`) se pierde.
- **`<h2>`/`<h3>` sueltos** (no dentro de una clase con `margin-bottom`): raros; casi todos
  los títulos ya tienen `margin-bottom` por su clase.

**Decisión**: `base.css` repone, con selectores de elemento pelado (especificidad
`(0,0,1,0)`, sobreescribibles):

```
p            { margin-block-end: 1em; }        /* equivale al default UA */
ul, ol       { margin-block-end: 1em; }
li           { margin-block-end: 0.25em; }     /* si hoy hay algo, replicarlo exacto */
```

Los valores exactos (`1em` vs `1rem` vs lo que dé la medición) se fijan en tasks con
comparación visual: la meta es **byte-idéntico al render actual**, no "un espaciado
razonable".

**Rationale**: 2C pidió reset total + reponer el espaciado en esta feature. Reponerlo con
element selectors mantiene la propiedad de "cualquier clase lo pisa". Es poco: básicamente
`<p>`.

**Alternativas descartadas**:
- *Reset conservador (`margin-block-start: 0` solo)*: era la opción 2B, el usuario eligió 2C.
- *Reponer en `layout.css`*: el espaciado de lectura es "base", no layout (spec FR-001).

---

## D4 — Bloque `prefers-reduced-motion` global (3A)

**Decisión**: en `reset.css`, patrón estándar de resets modernos:

```
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Es la **única** excepción a "especificidad ≤ (0,0,1,0)" (FR-016): usa `*` + `!important`.

**Se elimina** el bloque `@media (prefers-reduced-motion: reduce)` puntual que hoy está en
`global.css` §4b (targetea `.case-icon span` y `header nav button` con `transition: none` y
`animation: none`). Queda cubierto por el bloque global (FR-017).

**Verificación de que no rompe nada** (revisado contra el CSS actual):
- Animación del botón CASE (`case-corre`, `case-rodar` sobre `.case-icon` y sus `span`):
  `animation-duration: 0.01ms` la vuelve instantánea → el ícono queda en su estado final
  (aspa cruzada) sin moverse. OK, mismo efecto que el `animation: none` puntual actual.
- Drawer mostrar/ocultar: usa `display: none` / `.nav-abierto` (JS), **no** transición →
  el bloque no lo toca. OK.
- `filter: var(--backdrop-oscurecer)` del Hero: es `filter`, no `transition`/`animation` →
  no lo toca. OK.
- Video de fondo del Hero: lo pausa `js/layout.js` (lógica), no CSS → intacto (FR-017).
- Futuros efectos scroll-driven / Canvas: el bloque global los cubre de entrada (US2).

**Rationale**: una sola fuente de verdad, red de seguridad para lo que venga. `0.01ms` (no
`0s`) es el patrón canónico: evita que algunos navegadores se salteen el evento
`animationend`/`transitionend` del que puede depender un script.

**Alternativas descartadas**:
- *Liviano sin `!important` (opción 3C)*: el usuario eligió 3A.
- *Dejar además el bloque puntual (opción 3B)*: lógica duplicada, confunde. Se elimina.

---

## D5 — Costo de +3 requests HTTP

**Decisión**: aceptable, sin acción de mitigación en esta feature.

**Rationale**: 4 hojas chicas (reset ~1–2 KB, variables ~1 KB, base ~2 KB, layout ~25 KB
sin gzip) sobre HTTP/2 (multiplexado) + gzip/brotli. El CSS total transferido es
prácticamente el mismo que hoy (~10 KB gzip). No es el elemento LCP (lo es el poster del
Hero). GitHub Pages sirve las 4 en paralelo; con Cloudflare (previsto) mejora. PageSpeed
no penaliza 4 hojas chicas same-origin.

**Alternativas descartadas**:
- *Mantener 1 hoja*: contradice la convención v1.2.0 y el objetivo de la feature.
- *Concatenar en build*: prohibido (Principio I, sin build).
- *`@import`*: prohibido (FR-002) — además serializa la descarga (waterfall), peor que 4
  `<link>` paralelos.

---

## Resumen de decisiones

| ID | Decisión |
|----|----------|
| D1 | Reset `:where()` hecho a mano = reset actual + FRs de la spec; nada opinado que cambie el render. |
| D2 | Reparto base/layout por tipo de selector (elemento pelado → base; clase/contexto → layout). `body` en 3 hojas. |
| D3 | Reponer espaciado en `base.css` con element selectors; en la práctica es sobre todo `<p>`. Valores exactos por comparación visual en tasks. |
| D4 | `prefers-reduced-motion` global agresivo (`*` + `!important`, `0.01ms`) en `reset.css`; se borra el bloque puntual. Verificado que no rompe drawer/filter/video. |
| D5 | +3 requests HTTP: aceptable, sin mitigación. |
