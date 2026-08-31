# Guía rápida de validación — Galería de imágenes

**Feature**: `005-galeria` | **Fecha**: 2026-08-30

**Propósito**: guía de ejecución y validación de la feature. NO documenta implementación
(eso es `tasks.md`). Referencias a `spec.md`, `data-model.md` y `contracts/galeria-page.md`
enlazadas, no duplicadas.

## Prerrequisitos

- Navegador evergreen: últimas 2 versiones de Chrome, Edge o Firefox. Safari fuera del
  alcance de verificación (enmienda 2026-08-28 de la feature 001).
- Nada que instalar; sin build.

## Servir localmente

Los ES Modules requieren HTTP. Desde la raíz del repositorio:

```text
python -m http.server 8000        # o npx serve, o cualquier servidor estático
```

Abrir `http://localhost:8000/galeria.html`.

## Comprobación previa (fase de sourcing, ya hecha)

```text
node --test tests/creditos.test.js tests/layout.test.js tests/submenu-state.test.js tests/smoke.test.js
```

- Esperado: **26/26 en verde**. `tests/creditos.test.js` afirma `ASSET_CREDITS.length === 28`.
- Las 13 imágenes nuevas existen en `assets/img/` y cada una pesa ≤ 250 KB
  (`data-model.md`; máx. `mundos-mann-hielo.jpg` 244 KB).

## Escenarios de validación

### E1 — Las cuatro categorías, en orden (HU1, FR-001, SC-001)

1. Abrir `galeria.html`. Verificar un único `<h1>` "Galería" y una intro breve.
2. Recorrer la página: aparecen 4 secciones tituladas **Mundos**, **Personajes**,
   **La Ciencia**, **El Viaje**, en ese orden.
3. Confirmar que NO queda el texto placeholder "Esta sección reunirá las imágenes del
   sitio…".
4. Inspeccionar el DOM: las 4 secciones tienen `id` = `mundos`, `personajes`, `ciencia`,
   `viaje` (`contracts/galeria-page.md` C2).

### E2 — Cuadrícula de figuras y reparto (HU1, FR-002, FR-011, SC-002, SC-003)

1. En cada categoría hay un `<ul class="galeria-grid">` con `<li><figure>` por imagen.
2. Contar las figuras por categoría: Mundos 9, Personajes 10, La Ciencia 5, El Viaje 4
   (total 28; `data-model.md`).
3. Verificar que cada imagen que ya aparecía en `mundos.html`, `personajes.html`,
   `ciencia.html` y `viaje.html` está también en la categoría que le corresponde
   (SC-002), sin archivos duplicados en `assets/img/`.
4. Cada categoría suma entre 3 y 4 imágenes nuevas de esta feature (SC-003).

### E3 — Tile uniforme y enlace a la imagen (HU2, FR-002a, FR-004, SC-005, SC-008)

1. Todas las miniaturas se ven con la misma proporción (3:2) y recorte centrado; la
   cuadrícula es regular, sin alturas dispares.
2. Activar una miniatura (clic y con teclado): se abre la imagen **aislada** en el
   navegador, sin el recorte 3:2, a su tamaño de archivo (`assets/img/<archivo>.jpg`, ruta
   relativa). No hay visor modal ni lightbox.
3. Desde el pie común, seguir el enlace a `creditos.html`: la imagen figura ahí con su
   fuente y su atribución (las 28 están listadas; SC-008).

### E4 — Carga diferida y peso (FR-008, FR-008a, SC-011)

1. En DevTools → Network, recargar `galeria.html` con caché desactivada. Las imágenes
   fuera del viewport NO se descargan hasta hacer scroll (todas las `<img>` de la galería
   llevan `loading="lazy"`).
2. Peso total del documento + CSS + todas las imágenes referenciadas: **≤ 4 MB** (SC-011;
   estimado ~3 MB).
3. Ninguna respuesta de imagen supera 250 KB (FR-008).

### E5 — Enlace por categoría al eje (HU3, FR-009, SC-009)

1. En cada categoría, bajo el `<h2>`, hay un enlace con texto explícito ("Ir a la página
   de Mundos", etc.).
2. Activarlo lleva a `mundos.html` / `personajes.html` / `ciencia.html` / `viaje.html`
   respectivamente (ruta relativa).

### E6 — Anclas con carga directa (FR-017, SC-006)

1. Abrir directamente `http://localhost:8000/galeria.html#ciencia` (y las otras 3 anclas).
2. La sección de destino existe, es reconocible y queda utilizable por debajo del
   encabezado superpuesto (compensación de scroll de la sección 9 de `global.css`).

### E7 — Responsive (HU1, FR-012, SC-005)

1. A 320 px de ancho: la cuadrícula muestra **una sola columna**; no hay desplazamiento
   horizontal involuntario; los pies no se recortan.
2. A 768 px y 1280 px: 2–3 columnas, todo dentro del viewport, ninguna imagen desborda su
   contenedor.
3. El recorte de las miniaturas por `object-fit: cover` es esperado (FR-002a) y no cuenta
   como defecto.

### E8 — Semántica, foco y consola (FR-011, FR-013, SC-007)

1. Estructura: un `<h1>`, un `<h2>` por categoría, `<ul>/<li>/<figure>/<figcaption>`
   reales; ningún `<div>` donde va un elemento semántico.
2. Recorrer con teclado: el foco es visible en el enlace de cada categoría y en cada
   miniatura; el orden de tabulación sigue el contenido.
3. Recorrido completo (carga, scroll, apertura de anclas, activación de miniaturas): **sin
   errores en la consola** en Chrome, Edge y Firefox (SC-007).

### E9 — Coherencia visual (FR-014, FR-015)

1. Paleta y tipografía consistentes con el resto del sitio (tokens de `:root`); el único
   color saturado sigue siendo el naranja de Gargantúa.
2. Sin animaciones de aparición, sin campos de estrellas, sin efectos de scroll.

### E10 — Degradación si una imagen no carga (FR-018)

1. En DevTools, bloquear una imagen de la galería y recargar.
2. Su `<figure>` conserva el hueco del tile (por `aspect-ratio` + `width`/`height`), el
   `<figcaption>` permanece legible y la cuadrícula no se rompe ni desplaza las demás
   figuras.

### E11 — Verificación blanda de los pies (SC-010, no bloqueante)

1. Con tres personas: cada una lee el pie de una imagen elegida al azar (sin verla) y dice
   a qué eje pertenece.
2. Meta: las tres aciertan. Si no, se ajustan los pies y se re-verifica; no frena la
   entrega.

## Referencias

- Requisitos y criterios: `spec.md`.
- Entidades y reparto de las 28 imágenes: `data-model.md`.
- Estructura DOM y CSS de la sección 14: `contracts/galeria-page.md`.
- Fuente de las imágenes nuevas y manifiesto: `research.md`.
