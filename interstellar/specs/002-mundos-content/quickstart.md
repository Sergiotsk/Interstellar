# Guía rápida de validación — Contenido del eje Mundos

**Feature**: `002-mundos-content` | **Fecha**: 2026-08-29

**Propósito**: guía de ejecución y validación de la feature. No documenta implementación (eso es `tasks.md`). Referencia contratos y modelo de datos, no los duplica.

## Prerrequisitos

- Feature 001 fusionada en `main` (layout compartido, tokens, pie común, `scroll-margin-top` de anclas). Nota (2026-08-30): la atribución por asset se movió del pie a `creditos.html` (`js/creditos.js`); el pie la enlaza.
- Navegador evergreen: últimas 2 versiones de Chrome, Edge o Firefox (Safari fuera del alcance de verificación).
- Node instalado (para `node --test`; es parte del runtime, no una dependencia del repo).
- Nada que instalar, sin build.

## Servir localmente

Los ES Modules requieren HTTP (no `file://`). Desde la raíz del repositorio:

```text
python -m http.server 8000        # o  npx serve  o cualquier servidor estático
```

Abrir `http://localhost:8000/mundos.html`.

## Ejecutar los tests de lógica

```text
node --test tests/*.test.js
```

> Nota: `node --test tests/` (arg de directorio) está roto en Node 25; usar el glob `tests/*.test.js` o `node --test` sin argumento.

Debe pasar en verde: `smoke.test.js`, `submenu-state.test.js`, `layout.test.js` y `creditos.test.js` (la aserción de créditos de Mundos se movió a este último cuando la lista pasó de `buildFooter()` a `buildCreditosContent()` — ver `contracts/footer-credits.md`).

## Escenarios de validación

### E1 — Contenido real en las 5 secciones (HU1, FR-001..FR-003, SC-001)

1. Abrir `mundos.html` y recorrer las 5 secciones (`#tierra`, `#gargantua`, `#miller`, `#mann`, `#tesseract`).
2. Verificar que cada una tiene los tres bloques en orden: «Qué es», «En la historia», «Rasgos distintivos» (`<h2>` + 3 `<h3>` + `<ul>` de 3–6 ítems).
3. Confirmar que **ningún** texto "Sección futura dedicada a…" permanece (SC-001).
4. Comprobar la cobertura mínima de FR-003 por mundo (tabla en `data-model.md` §1): Tierra→plaga/polvo; Miller→océano/olas/cercanía a Gargantúa; Mann→hielo/nubes congeladas; Gargantúa→agujero negro/disco de acreción/lente gravitacional; Tesseract→tiempo recorrible/estantería de Murph.

### E2 — Identidad visual por mundo (HU2, FR-004, FR-005, SC-002, SC-007)

1. En cada sección, verificar un backdrop propio (`img.eje-backdrop`), distinto de los otros cuatro, oscurecido, con el texto legible encima sin depender de una zona clara (SC-007).
2. Simular fallo de carga (renombrar temporalmente un `.jpg` o bloquear la imagen en DevTools): la sección conserva jerarquía y legibilidad sobre `--color-fondo` (caso límite).
3. Abrir `creditos.html` (enlace "Créditos y fuentes" en el pie): los 5 backdrops de Mundos (Tierra + 4 nuevos) figuran con su fuente y atribución (FR-006, SC-002).
4. Verificar `assets/img/CREDITOS.md`: 4 filas nuevas con fuente del catálogo, URL de origen real y `estado` correcto; "Resumen de estado" actualizado.

### E3 — Peso de imágenes (FR-007, SC-009)

1. Medir el tamaño de cada `assets/img/mundos-*.jpg`: ≤ 250 KB por archivo.
2. Sumar los 5 backdrops de Mundos: ≤ 1,2 MB en total.
3. Confirmar formato JPEG (no WebP) y ruta relativa en el `src` (SC-008).

### E4 — No regresión: navegación, anclas, foco (HU3, FR-008, FR-013, FR-015, SC-004, SC-005)

1. Comparar encabezado, submenú y pie de `mundos.html` con otra página (ej. `ciencia.html`): idénticos en contenido y comportamiento (FR-008).
2. Carga directa de las 5 anclas (`http://localhost:8000/mundos.html#gargantua`, etc.): la sección queda visible y usable por debajo del encabezado (SC-004, FR-015).
3. Recorrer con teclado: foco visible, orden de tabulación coherente con el contenido.
4. DevTools → Console: **sin errores ni 404** durante carga, scroll y apertura de anclas, en Chrome, Edge y Firefox (FR-013, SC-005).

### E5 — Responsive (FR-012, SC-003)

1. A 320 px, 768 px y 1280 px de ancho: todo el contenido y las imágenes dentro del viewport, sin desplazamiento horizontal involuntario, sin recorte, sin imágenes desbordadas.
2. Texto extenso de una sección: no rompe el layout compartido ni desplaza las anclas de las demás secciones (caso límite).

### E6 — Comprensión del contenido (SC-006 — verificación blanda, NO bloqueante)

1. Con 3 personas que no vieron la película: cada una lee una sección de mundo al azar.
2. Registrar si puede explicar en una frase qué es ese mundo y su papel en la historia.
3. Meta orientativa: ≥ 2 de 3. Si no se alcanza, ajustar la redacción y re-verificar. **No frena la entrega** (a diferencia de SC-010 de la feature 001).

## Referencias

- Contratos: `contracts/mundos-page.md` (estructura DOM) · `contracts/footer-credits.md` (registro de créditos).
- Datos: `data-model.md`.
- Decisiones: `research.md`.
- Requisitos y criterios: `spec.md`.
- Base heredada: `specs/001-shared-layout-hero/` (layout, tokens, pie, assets).
