# Contract — Marcado `<picture>` y swap en CSS

Forma exacta del marcado tras migrar una sección. Rutas siempre **relativas** (subpath
`/Interstellar/`).

## 1. Imagen de contenido (`<img>` → `<picture>`)

**Antes**:
```html
<img src="assets/img/mundos-tierra-granja.jpg"
     alt="La casa de campo de los Cooper rodeada por un maizal alto."
     loading="lazy" width="960" height="402">
```

**Después**:
```html
<picture>
  <source type="image/webp" srcset="assets/img/mundos-tierra-granja.webp">
  <img src="assets/img/mundos-tierra-granja.jpg"
       alt="La casa de campo de los Cooper rodeada por un maizal alto."
       width="960" height="402"
       loading="lazy" decoding="async">
</picture>
```

Reglas:
- `<source>` **antes** del `<img>`; `type="image/webp"`; `srcset` con la ruta del `.webp`.
- `<img>` conserva `src` al **respaldo** (formato original), `alt`, y SIEMPRE `width` +
  `height` (intrínsecos del respaldo — anti-CLS).
- `loading="lazy"` si la imagen está bajo el fold; se **omite** si es visible al cargar.
- `decoding="async"` siempre.
- **LCP**: la imagen más grande del primer render de la página lleva `fetchpriority="high"`
  (y nunca `loading="lazy"`). En este sitio: el poster del hero (`index.html`) y la primera
  imagen visible de `galeria.html`. Una sola por página.
- No se agregan clases nuevas salvo que el CSS existente lo requiera; `<picture>` es
  `display: inline` por defecto — si el layout dependía de `img { display:block }` vía
  selector, verificar que el selector alcance al `img` dentro de `picture` (lo hace: el
  `img` sigue existiendo).

## 2. Poster del `<video>` del hero (sin `<picture>`)

El atributo `poster` no admite `<picture>`. Se deja apuntando al archivo optimizado:
```html
<video ... poster="assets/img/hero-gargantua.jpg"> ... </video>
```
El pipeline lo trata como contexto `poster-hero` (ancho ≤ 1280). Se genera
`hero-gargantua.webp` como subproducto pero el `poster` no lo usa. El `poster` no admite
`fetchpriority`; su carga la gobierna el `<video autoplay>`. No se agrega `<link rel="preload">`.

## 3. Fondo de CSS (`background-image`)

**Antes** (`css/mundos.css`):
```css
.mundo-portada-granja { background-image: url("../assets/img/terra-granja.jpg"); }
```

**Después**:
```css
.mundo-portada-granja { background-image: url("../assets/img/terra-granja.webp"); }
```

Reglas:
- Swap directo de la extensión a `.webp`. Sin `image-set()` con fallback: la baseline
  evergreen del proyecto soporta WebP y el repo ya lo hace (`terra-orbita.webp`).
- El `.jpg` de respaldo se genera igual (queda en `assets/img/`) pero el CSS no lo
  referencia.
- Rutas relativas desde `css/` (`../assets/img/...`), sin cambios.

## 4. Checklist de aceptación por sección migrada

- [ ] Todos los `<img>` de contenido de la sección están envueltos en `<picture>` con
      `<source type="image/webp">`.
- [ ] Todos los `<img>` tienen `width` + `height` + `decoding="async"`.
- [ ] `loading="lazy"` solo donde corresponde (no en imágenes visibles al inicio).
- [ ] La imagen LCP de la página (poster del hero / 1ª de la galería) lleva
      `fetchpriority="high"` y NO lleva `loading="lazy"`. Solo una por página.
- [ ] `alt` con sentido (o vacío si decorativa) en todos.
- [ ] Los `background-image` de la sección apuntan a `.webp`.
- [ ] En el navegador: la sección se ve igual; las imágenes se sirven como WebP (DevTools →
      Network → Type `webp`).
- [ ] Sin errores en consola; links/assets cargan (rutas relativas OK).
- [ ] Peso de las imágenes de la sección: baja ≥ 25 % y bajo el tope vigente.
- [ ] `node --test` en verde.
- [ ] Segundo `node tools/optimize-img.mjs <seccion>` ⇒ `git status` limpio.
