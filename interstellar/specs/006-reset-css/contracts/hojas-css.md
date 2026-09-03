# Contrato — Hojas CSS y orden de carga (006-reset-css)

Este contrato lo consumen las 9 páginas HTML y toda hoja/feature futura. Si algo de acá
falla, la cascada del sitio queda mal.

---

## C1 — Bloque `<link>` obligatorio (verbatim, 9 páginas)

En el `<head>` de **cada** página, en este orden exacto, después del `<title>` y antes de
cualquier otro estilo:

```html
<link rel="stylesheet" href="css/reset.css">
<link rel="stylesheet" href="css/variables.css">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/layout.css">
```

- **Orden fijo**: `reset → variables → base → layout`. No se reordena.
- **Rutas relativas** (`css/…`). Nunca `/css/…` (rompe bajo `/Interstellar/`).
- **Sin `@import`** dentro de ninguna de las 4 hojas.
- Un CSS propio de página pesada (si alguna vez existe) se carga con un 5º `<link>`
  **después** de `layout.css`.

**Páginas**: `index.html`, `mundos.html`, `personajes.html`, `ciencia.html`, `viaje.html`,
`galeria.html`, `trailer.html`, `minijuegos.html`, `creditos.html`.

**Verificación**:
```
for p in index mundos personajes ciencia viaje galeria trailer minijuegos creditos; do
  echo "== $p =="; rg -n 'rel="stylesheet"' "$p.html"
done
```
Cada salida debe ser exactamente las 4 líneas, en orden. Cero apariciones de `global.css`.

---

## C2 — Invariante de especificidad de `reset.css`

- **Toda** regla de `css/reset.css` tiene especificidad ≤ `(0,0,1,0)`.
  En la práctica: selectores `:where(...)` (especificidad `(0,0,0,0)`) o, a lo sumo, un
  selector de un solo tipo de elemento.
- **Única excepción**: el bloque `@media (prefers-reduced-motion: reduce)`, que usa
  `*, *::before, *::after` + `!important`.

**Verificación** (manual, leyendo la hoja): fuera del bloque `@media`, ningún selector
tiene `.clase`, `#id`, `[attr]`, `:not(...)` con argumento específico, ni combinadores que
sumen especificidad. Ningún `!important` fuera del bloque `@media`.

**Prueba funcional** (SC-006): agregar temporalmente en `layout.css`
`ul { list-style: square }` y confirmar que aparecen los cuadraditos **sin** tocar
`reset.css` ni usar `!important`. Quitar la prueba.

---

## C3 — `css/global.css` no existe

- El archivo `css/global.css` se **elimina** del repo.
- **Ninguna** página, hoja ni doc de proyecto lo referencia.

**Verificación**:
```
test ! -f css/global.css && echo OK-borrado
rg -l "global\.css" --glob '!specs/**' --glob '!docs/**' .    # esperado: sin resultados
```

---

## C4 — Contenido migrado sin cambio de valor

`variables.css`, `base.css` y `layout.css` reciben el contenido de `global.css` **sin
alterar ningún valor** (colores, tamaños, tiempos, selectores). Las únicas diferencias
permitidas respecto de `global.css`:

1. `reset.css` es contenido **nuevo** (reset `:where()` + `prefers-reduced-motion` global).
2. `base.css` **suma** las reglas de espaciado vertical que repone lo que el reset total
   quitó (research.md D3) — su valor se calibra para que el render sea idéntico.
3. El bloque `@media (prefers-reduced-motion: reduce)` puntual de `global.css` §4b **se
   borra** (queda cubierto por `reset.css`).
4. Dedup: las 2 reglas `p { … }` de `global.css` (§2 y §3) se unifican en una sola en
   `base.css`.

**Verificación**: SC-003 (comparación visual página por página, cero diferencias).

---

## C5 — Extensión: CSS propio por página pesada (5º `<link>`)

Para features futuras (cada **minijuego**, o cualquier página con UI densa hecha con CSS +
JS vanilla), el patrón es:

```html
<link rel="stylesheet" href="css/reset.css">
<link rel="stylesheet" href="css/variables.css">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/layout.css">
<link rel="stylesheet" href="css/minijuego-<slug>.css">   <!-- 5º, SOLO en esa página -->
```

**Reglas del 5º `<link>`**:
- Va **siempre después** de `layout.css`.
- Solo en la(s) página(s) que lo usan (no global).
- `href` relativo (`css/…`), sin `@import`.
- Nombre `kebab-case` por responsabilidad (`css/minijuego-navegacion.css`, no `css/juego.css`).
- Usa los tokens de `variables.css` (`var(--color-…)`, `var(--font-…)`); nada de valores de
  paleta hardcodeados.
- Puede usar `.clases` y contexto libremente: gracias a que `reset.css` es especificidad 0,
  cualquier `.game-board`, `.tile`, `.hud`, `@keyframes` propio del juego gana sin
  `!important` ni subir especificidad.
- El JS del juego es un **ES module** cargado solo en esa página (constitución, § JavaScript).

**Esta feature (006) NO crea ninguna hoja de página** — solo fija este contrato para que las
features de minijuegos lo sigan.
