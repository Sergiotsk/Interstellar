# Phase 0 — Research: optimización de imágenes + `<picture>`/WebP

Contexto: sitio estático vanilla sin build, Node 25.9.0 en local, constitución v2.3.0
habilita `tools/` + devDependencies de tooling. Doc de referencia previo del repo:
`docs/10-aprendizaje/01-optimizacion-imagenes-web.md`.

---

## R1 — Herramienta del pipeline

**Decision**: script Node ESM único (`tools/optimize-img.mjs`) sobre **`sharp`** (libvips),
pinneado a versión exacta como `devDependency`.

**Rationale**:
- `sharp` hace **resize + WebP + JPEG (mozjpeg) en una sola herramienta**, rápida
  (libvips), con buena calidad-por-byte; es lo que usan Next/Astro por dentro.
- Una sola dependencia, un solo archivo, API declarativa (cadena `sharp(input).resize(...).webp(...)`).
  Legible y defendible (Principio IV).
- El doc de aprendizaje del repo ya la señala como la opción correcta para "pipeline en Node".

**Alternatives considered**:
- **`@squoosh/cli`**: sería "squoosh headless" (mismos codecs). **Descartado**: Google
  archivó el proyecto, sin mantenimiento, rompe con Node nuevo.
- **CLIs sueltos** (`cwebp`, `cjpeg`/mozjpeg, `oxipng`, `jpegoptim`): funcionan pero son 3-4
  instalaciones vía brew/scoop, cada una con su sintaxis; más partes móviles para el mismo
  resultado.
- **Pillow (Python)**: no hay runtime Python del proyecto; sumar Python entero para esto es
  desproporcionado. (Existe un Python global de scoop con Pillow, pero atarse a eso no es
  reproducible para otra máquina.)
- **Herramienta web (squoosh.app / TinyJPG)**: es justo lo que esta feature elimina —
  manual y no reproducible.

---

## R2 — Formato de salida y parámetros

**Decision**:
- **WebP**: `webp({ quality: 74, effort: 5 })` para fotos/backdrops; `quality: 80` para
  retratos de personajes (imagen informativa, no oscurecida). `effort` fijo (determinismo).
- **Respaldo**: mismo formato que el original (`jpeg({ mozjpeg: true, quality: 78, progressive: true })`
  para JPEG; `png()` con paleta si el original es PNG con alfa).
- **Metadata**: NO se preserva (no llamar `withMetadata()`) → salida más chica y
  determinista; la atribución vive en `CREDITOS.md`, no en EXIF.
- **Resize**: `resize({ width: <ancho-objetivo>, withoutEnlargement: true })` — nunca
  agranda un original más chico.
- **Idempotencia**: versión de `sharp` pinneada + parámetros fijos + sin metadata ⇒ mismo
  input produce el mismo byte-output. El script compara y solo escribe si cambió; re-run sin
  cambios de fuente ⇒ `git status` limpio (SC-005).

**Rationale**: `quality 74-80` es el punto dulce web (el doc del repo usa ~78 para JPEG;
WebP rinde ~25-35 % menos a calidad equivalente, así que 74 WebP ≈ 78 JPEG en percepción).
`mozjpeg: true` ≈ 10-20 % más chico en el respaldo. Los backdrops van oscurecidos
(`--backdrop-oscurecer: brightness(0.4)`) → toleran compresión agresiva.

**Alternatives considered**: AVIF (~50 % más chico) — **fuera de alcance** (encoder lento,
otro archivo por imagen, soporte algo menor); se puede sumar después sin rehacer el pipeline.

---

## R3 — Anchos objetivo por contexto de uso

**Decision** (ancho de salida en px; regla base: ~2× el ancho de render real, con tope):

| Contexto | Ancho objetivo | Base |
|---|---|---|
| Poster del hero (`hero-gargantua.jpg`) | 1280 | Ya optimizado a 1024×576; se deja ≤ 1280, es el LCP. |
| Backdrop de mundo (`<img>` y CSS) | 2560 | Pantalla completa en monitor común × ~1.3; van oscurecidos. |
| Backdrop de la portada scroll de mundos (CSS `background-image`) | 2560 | Ídem; incluye `terra-*`, `mundos-gargantua-*`. |
| Miniatura de galería (grid) | 800 | El grid es multi-columna; la miniatura nunca pasa ~380 px CSS. |
| Vista ampliada de galería (lightbox / `figure > a`) | 1600 | Ocupa casi viewport en desktop. |
| Frame de tira de celuloide (filmstrip) | 900 | Cada frame es una franja; altura fija, ancho moderado. |
| Retrato de personaje (`.ficha-retrato img`) | 720 | Flota a la izquierda en desktop (~320-360 px CSS). |

**Rationale**: los `<img>` de galería ya declaran `width`/`height` intrínsecos (1280,
960...) — el ancho objetivo se define por el tamaño de **render**, no por el del archivo
actual. Verificación fina de cada `max-width` real se hace al migrar cada sección (tarea).

**Open**: confirmar el ancho de lightbox de galería contra `css/layout.css` §14 al migrar
esa sección. No bloquea el plan (default 1600 razonable).

---

## R4 — Marcado `<picture>` y swap en CSS

**Decision — contenido (`<img>`)**:

```html
<picture>
  <source type="image/webp" srcset="assets/img/<n>.webp">
  <img src="assets/img/<n>.jpg" alt="<descriptivo>" width="<w>" height="<h>"
       loading="lazy" decoding="async">
</picture>
```

- `width`/`height` = dimensiones **intrínsecas del archivo de respaldo** (anti-CLS, FR-006).
- `loading="lazy"` en todo lo que está bajo el fold; se OMITE en imágenes visibles al
  inicio. `decoding="async"` en todas.
- El poster del `<video>` del hero: NO `<picture>` (el atributo `poster` no lo admite) →
  queda `poster="assets/img/hero-gargantua.jpg"` optimizado como imagen suelta (FR-010).

**Decision — fondo de CSS (`background-image`)**: swap directo de `url("...jpg")` a
`url("...webp")` en `css/mundos.css`. Sin `image-set()` con fallback: la baseline evergreen
del proyecto soporta WebP de forma universal y el repo ya lo hace con `terra-orbita.webp`.
El respaldo `.jpg` se genera igual (queda disponible) pero el CSS no lo referencia.

**Rationale**: `<picture>` con `type="image/webp"` es el mecanismo estándar de negociación
de formato del lado del cliente, sin JS y sin build. El swap CSS directo es el patrón que
el proyecto ya adoptó; agregar `image-set()` sería redundante para esta baseline.

---

## R5 — Créditos de los derivados

**Decision**: los `.webp` derivados **no se listan** en `CREDITOS.md` ni en `ASSET_CREDITS`
(`js/creditos.js`). Heredan el crédito de su imagen original.

**Rationale (verificado en código)**: `tests/creditos.test.js` solo valida el array
`ASSET_CREDITS` escrito a mano — `length === 56`, formato `/^[a-z0-9-]+\.(jpg|webp) — \S.*/`,
y presencia de nombres puntuales en el HTML generado. **Ningún test lee el directorio
`assets/img/`.** Por lo tanto agregar archivos `.webp` derivados no rompe nada y no exige un
"stub". Lo único a tocar: la **nota narrativa** "solo JPEG" en `assets/img/CREDITOS.md`
(2026-08-28) y el doc `docs/10-aprendizaje/01-...`, que hoy afirman que el proyecto no usa
WebP.

**Nota**: si en el futuro se quiere un chequeo de "todo `<img>`/`background` apunta a un
archivo existente", eso es una feature aparte (smoke test de assets), fuera de alcance.

---

## R6 — Orden de secciones y criterio de "lista para migrar"

**Decision**: una tarea por sección, en este orden sugerido (de mayor ganancia / menor
riesgo a menor):

1. **mundos — portada scroll + backdrops CSS** (`css/mundos.css`, `terra-*`,
   `mundos-gargantua-*`): las imágenes más pesadas del sitio (`mundos-gargantua.jpg` 337 KB,
   sobre presupuesto). Mayor ganancia.
2. **galería** (50 `<img>`): mayor volumen; ya tienen `loading`/`width`/`height` → solo
   envolver en `<picture>` + generar derivados.
3. **filmstrip tierra** (20) y **filmstrip gargantúa** (15).
4. **mundos hub** (5 `<img>`), **fichas de mundos** (mann/miller/tesseract, 1 c/u).
5. **personajes** (6 `<img>` — hoy SIN `width`/`height` ni `loading`: más trabajo de
   marcado).
6. **ciencia**, **contacto**, **gracias** (1 `<img>` c/u).
7. **index / hero**: solo el poster (ya está bien; verificar tamaño).

**Criterio "lista para migrar"**: el contenido de esa sección está cerrado (sin cambios de
imágenes pendientes) según el estado del repo / memoria del proyecto.

**Rationale**: empezar por mundos da la mejor relación esfuerzo/impacto y ejercita el
camino CSS `background-image` (el más distinto) temprano.

---

## R7 — Medición de peso e idempotencia

**Decision**:
- **Peso por sección**: sumar bytes de las imágenes que la sección referencia, antes y
  después. Objetivo: baja ≥ 25 % (SC-002) y total bajo el tope de la feature que fijó esa
  sección (002 para mundos: 5 backdrops ≤ 1,2 MB; 005 para galería).
- **Idempotencia**: tras correr el pipeline, `git status --porcelain` sobre `assets/img/`
  debe quedar vacío en una segunda corrida sin tocar fuentes (SC-005). El script hace
  `--dry-run` para listar qué cambiaría sin escribir.
- **Deploy**: no se agrega step al workflow `deploy-pages.yml`; se verifica que sigue
  publicando `assets/` tal cual (FR-014, SC-008).

**Rationale**: métricas simples, verificables desde la terminal, sin herramientas nuevas.

---

## Resumen de decisiones

| # | Decisión |
|---|---|
| R1 | `sharp` (devDependency pinneada), script único `tools/optimize-img.mjs` |
| R2 | WebP q74/80 effort 5; respaldo JPEG mozjpeg q78 progressive; sin metadata; `withoutEnlargement` |
| R3 | Tabla de anchos por contexto (2560 backdrop / 1600 lightbox / 900 filmstrip / 800 thumb / 720 retrato / 1280 poster) |
| R4 | `<picture>`+`<source type=image/webp>` para `<img>`; swap directo a `.webp` en CSS; poster del hero suelto |
| R5 | Derivados `.webp` NO se listan en créditos; se actualiza la nota "solo JPEG" |
| R6 | Orden: mundos → galería → filmstrips → hub/fichas → personajes → sueltas → hero |
| R7 | Peso antes/después por sección; `git status` limpio en re-run; deploy sin cambios |
