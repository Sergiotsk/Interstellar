# Guía rápida de validación — Contenido del eje Personajes

**Feature**: `003-personajes-content` | **Fecha**: 2026-08-29

**Propósito**: guía de ejecución y validación de la feature. No documenta implementación (eso es `tasks.md`). Referencia contratos y modelo de datos, no los duplica.

## Prerrequisitos

- Features 001 y 002 fusionadas en `main` (layout compartido, tokens, pie común, `scroll-margin-top` de anclas, patrón de contenido por eje, `CREDITOS.md`). Nota (2026-08-30): la atribución por asset se movió del pie a `creditos.html` (`js/creditos.js`); el pie la enlaza.
- Navegador evergreen: últimas 2 versiones de Chrome, Edge o Firefox (Safari fuera del alcance de verificación).
- Node instalado (para `node --test`; parte del runtime, no una dependencia del repo).
- Nada que instalar, sin build.

## Servir localmente

Los ES Modules requieren HTTP (no `file://`). Desde la raíz del repositorio:

```text
python -m http.server 8000        # o  npx serve  o cualquier servidor estático
```

Abrir `http://localhost:8000/personajes.html`.

## Ejecutar los tests de lógica

```text
node --test tests/*.test.js
```

> Nota: `node --test tests/` (arg de directorio) está roto en Node 25; usar el glob `tests/*.test.js` o `node --test` sin argumento.

Debe pasar en verde: `smoke.test.js`, `submenu-state.test.js`, `layout.test.js` y `creditos.test.js` (la aserción de créditos de Personajes se movió a este último cuando la lista pasó de `buildFooter()` a `buildCreditosContent()` — ver `contracts/footer-credits.md`).

## Escenarios de validación

### E1 — Contenido real en las 6 fichas (HU1, FR-001..FR-003, SC-001)

1. Abrir `personajes.html` y recorrer las 6 fichas (`#cooper`, `#murph`, `#brand`, `#profesor-brand`, `#mann`, `#tars-case`).
2. Verificar que cada una tiene los tres bloques en orden: «Quién es», «Su papel en la historia», «Rasgos distintivos» (`<h2>` + 3 `<h3>` + `<ul>` de 3–6 ítems).
3. Confirmar que **ningún** texto "Sección futura dedicada a…" permanece (SC-001).
4. Comprobar la cobertura mínima de FR-003 por ficha (tabla en `data-model.md` §1).
5. Confirmar que `personajes.html` no contiene las etiquetas `✓` / `~` / `✎` ni párrafos de física detallada (FR-009 — eso es del eje La Ciencia).

### E2 — Distinción Brand y ficha única TARS & CASE (HU2, FR-004, FR-005, SC-007)

1. Abrir `#brand`: la ficha nombra a **Amelia Brand**, astrónoma del Endurance, e indica que es **hija** del Profesor Brand.
2. Abrir `#profesor-brand`: la ficha nombra a **John Brand**, líder de la NASA, e indica que es el **padre** de Amelia y en qué consiste su "Plan A".
3. Abrir `#tars-case`: una sola sección que cubre a **TARS y a CASE**, con qué tripulante va cada uno y qué los distingue.
4. Prueba blanda con 3 personas: las 3 distinguen a Amelia del Profesor tras leer ambas fichas (SC-007).

### E3 — Retrato en línea por ficha (HU1, FR-006, FR-011)

1. En cada ficha, verificar un `<figure class="ficha-retrato">` con un `<img>` propio (distinto de las otras 5) y un `<figcaption>` que describe la imagen.
2. Confirmar que el `<img>` tiene `alt` **descriptivo** del personaje (no vacío) y que **no** hay oscurecimiento ni backdrop a sección completa (no se usa `.eje-con-backdrop`).
3. Verificar que la línea de reparto es un `<p class="ficha-reparto">` **fuera** del `<figure>`, y que la atribución `© Warner Bros.` **no** está en el `<figcaption>` sino en `creditos.html` (enlazada desde el pie).
4. Simular fallo de carga (renombrar temporalmente un `.jpg` o bloquear la imagen en DevTools): el `<figure>` conserva un fondo coherente con la paleta y la maqueta de la ficha no se rompe (caso límite).

### E4 — Reparto completo y consistente (SC-009)

1. Las 6 fichas tienen su `<p class="ficha-reparto">` con el mismo formato.
2. `#murph` nombra a Jessica Chastain (adulta), Mackenzie Foy (niña) y Ellen Burstyn (anciana).
3. `#tars-case` incluye el crédito de voz de ambos robots ("voz de …").

### E5 — Créditos e imágenes (FR-006, FR-007, SC-008)

1. Abrir `creditos.html` (enlace "Créditos y fuentes" en el pie): los 6 retratos de Personajes figuran con su atribución `© Warner Bros. Pictures` (mecanismo `ASSET_CREDITS` en `js/creditos.js`).
2. Verificar `assets/img/CREDITOS.md`: 6 filas nuevas con fuente del catálogo (FILMGRAB), URL de origen real y `estado` correcto; "Resumen de estado" y nota de peso actualizados.
3. Medir cada `assets/img/personajes-*.jpg`: ≤ 250 KB por archivo; suma de los 6 ≤ 1,5 MB.
4. Confirmar formato JPEG y ruta relativa en el `src`.

### E6 — No regresión: navegación, anclas, foco, responsive (HU3, FR-008, FR-012, FR-013, FR-015, SC-003, SC-004, SC-005)

1. Comparar encabezado, submenú y pie de `personajes.html` con otra página (ej. `mundos.html`): idénticos en contenido y comportamiento (FR-008).
2. Carga directa de las 6 anclas (`http://localhost:8000/personajes.html#profesor-brand`, etc.): la sección queda visible y usable por debajo del encabezado (SC-004, FR-015).
3. Recorrer con teclado: foco visible, orden de tabulación coherente con el contenido.
4. A 320 px, 768 px y 1280 px: todo el contenido y las imágenes dentro del viewport, sin desplazamiento horizontal involuntario, sin recorte, sin imágenes desbordadas (SC-003). En mobile el retrato se apila sobre el texto; en desktop va en su columna.
5. DevTools → Console: **sin errores ni 404** durante carga, scroll y apertura de anclas, en Chrome, Edge y Firefox (FR-013, SC-005).

### E7 — Comprensión del contenido (SC-006 — verificación blanda, NO bloqueante)

1. Con 3 personas que no vieron la película: cada una lee una ficha al azar.
2. Registrar si puede explicar en una frase quién es ese personaje y su papel en la historia.
3. Meta orientativa: ≥ 2 de 3. Si no se alcanza, ajustar la redacción y re-verificar. **No frena la entrega**.

## Referencias

- Contratos: `contracts/personajes-page.md` (estructura DOM) · `contracts/footer-credits.md` (registro de créditos).
- Datos: `data-model.md`.
- Decisiones: `research.md`.
- Requisitos y criterios: `spec.md`.
- Base heredada: `specs/001-shared-layout-hero/` (layout, tokens, pie, assets) · `specs/002-mundos-content/` (patrón de contenido por eje, política de imágenes).
