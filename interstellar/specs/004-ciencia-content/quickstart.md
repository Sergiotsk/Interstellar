# Guía rápida de validación — Contenido del eje La Ciencia

**Feature**: `004-ciencia-content` | **Fecha**: 2026-08-29

**Propósito**: guía de ejecución y validación de la feature. No documenta implementación
(eso es `tasks.md`). Referencia contratos y modelo de datos, no los duplica.

## Prerrequisitos

- Features 001–003 fusionadas en `main` (layout compartido, tokens, pie con
  `ASSET_CREDITS`, `scroll-margin-top` de anclas, patrón de contenido por eje).
- Navegador evergreen: últimas 2 versiones de Chrome, Edge o Firefox (Safari fuera del
  alcance de verificación).
- Node instalado (para `node --test`; parte del runtime, no una dependencia del repo).
- Nada que instalar, sin build.

## Servir localmente

Los ES Modules requieren HTTP (no `file://`). Desde la raíz del repositorio:

```text
python -m http.server 8000        # o  npx serve  o cualquier servidor estático
```

Abrir `http://localhost:8000/ciencia.html`.

## Ejecutar los tests de lógica

```text
node --test tests/*.test.js
```

> Nota: `node --test tests/` (arg de directorio) está roto en Node 25; usar el glob
> `tests/*.test.js`.

Esta feature **no cambia lógica**: la suite (`smoke.test.js`, `submenu-state.test.js`,
`layout.test.js`) DEBE seguir en verde **sin modificaciones**. Si algún test cambia, algo
se hizo fuera de alcance.

## Escenarios de validación

### E1 — Contenido real en las 4 secciones (HU1, FR-001..FR-002, FR-006, SC-001)

1. Abrir `ciencia.html` y recorrer las 4 secciones (`#agujeros-negros`,
   `#dilatacion-temporal`, `#agujeros-de-gusano`, `#relatividad`).
2. Verificar que cada una tiene los tres bloques en orden: «La ciencia», «En Interstellar»,
   «Fuentes» (`<h2>` + 3 `<h3>`).
3. Confirmar que **ningún** texto "Sección futura dedicada a…" permanece (SC-001).
4. Comprobar la cobertura mínima de FR-006 por concepto (tabla en `data-model.md` §1).
5. Confirmar que `#relatividad` funciona como sección paraguas: explica la relatividad
   general y menciona los otros tres temas como consecuencias, sin re-explicarlos en
   profundidad.

### E2 — Etiquetas de rigor por afirmación (HU2, FR-003, FR-004, SC-003)

1. Recorrer «La ciencia» y «En Interstellar» de las 4 secciones: cada `<p>` con contenido
   científico termina con una etiqueta `.rigor` visible.
2. Confirmar que aparecen las tres clases (`rigor-real`, `rigor-plausible`,
   `rigor-licencia`) al menos una vez en la página.
3. Verificar que cada etiqueta muestra **texto** con el nivel (`✓ Ciencia real`, etc.), no
   solo un glifo ni solo color (FR-011, FR-016).
4. Verificar el `<dl class="rigor-leyenda">` en la intro: 3 pares `<dt>`/`<dd>` con el
   significado de cada nivel, una sola vez en la página (FR-004).

### E3 — Verificación del Principio VI (HU2, FR-005, FR-007, SC-004, SC-005) — puerta de aceptación

1. Abrir `research.md` §D6 (tabla afirmación→fuente→etiqueta).
2. Para cada afirmación de la página, localizar su fila en §D6 y confirmar que el nivel
   materializado (`rigor-real` / `-plausible` / `-licencia`) **coincide** con el de la
   tabla. **Ninguna** afirmación catalogada `licencia` puede aparecer como `✓ Ciencia
   real` (SC-004).
3. Confirmar que cada sección tiene su bloque «Fuentes» con ≥1 referencia del conjunto
   aprobado (Thorne 2014 / arXiv 1502.03808 / AJP 83 2015) y que esa referencia respalda
   al menos una afirmación de la sección (SC-005).
4. Esta revisión es un chequeo afirmación‑contra‑fuente: la hace quien tenga las fuentes a
   mano, **no requiere formación en física** (clarificación 2026-08-29).

### E4 — Rutas relativas (FR-014, constitución 1.1.0)

1. Revisar el HTML de `ciencia.html`: ningún `href` ni `src` empieza con `/`
   (`css/global.css`, `js/layout.js`, `assets/img/ciencia-agujero-negro.jpg`, enlaces a
   otras páginas del sitio — todos relativos).
2. Servir bajo un subpath (o abrir en `http://localhost:8000/ciencia.html`) y confirmar
   que CSS, script e imagen cargan (sin 404).
3. Confirmar que ninguna referencia a una escena es un enlace a `viaje.html#…` (el eje El
   Viaje todavía es placeholder); las referencias van en prosa (FR-010).

### E5 — No regresión: navegación, anclas, foco (HU3, FR-009, FR-013, FR-015, SC-007, SC-008)

1. Comparar encabezado, submenú y pie de `ciencia.html` con otra página (ej.
   `personajes.html`): idénticos en contenido y comportamiento (FR-009).
2. Carga directa de las 4 anclas (`http://localhost:8000/ciencia.html#agujeros-de-gusano`,
   etc.): la sección queda visible y usable por debajo del encabezado (SC-007, FR-015).
3. Recorrer con teclado: foco visible, orden de tabulación coherente con el contenido.
4. DevTools → Console: **sin errores ni 404** durante carga, scroll y apertura de anclas,
   en Chrome, Edge y Firefox (FR-013, SC-008). `node --test tests/*.test.js` en verde y
   sin cambios.

### E6 — Responsive (FR-012, SC-006)

1. A 320 px, 768 px y 1280 px de ancho: todo el contenido, las etiquetas `.rigor`, la
   `<dl>` de leyenda y la imagen de `#agujeros-negros` permanecen dentro del viewport, sin
   desplazamiento horizontal involuntario, sin recorte.
2. Verificar que una etiqueta de rigor al final de una línea no genera desbordamiento
   horizontal a 320 px (`white-space: nowrap` + `margin-left`, pero el `<p>` envuelve).

### E7 — Comprensión del contenido (SC-009 — verificación blanda, NO bloqueante)

1. Con 3 personas sin formación en física: cada una lee una sección al azar.
2. Registrar si puede explicar en una o dos frases qué es ese concepto y dónde aparece en
   la película.
3. Meta orientativa: ≥ 2 de 3. Si no se alcanza, ajustar la redacción y re-verificar. **No
   frena la entrega.**

## Referencias

- Contrato: `contracts/ciencia-page.md` (estructura DOM + CSS de la etiqueta de rigor).
- Datos: `data-model.md`.
- Decisiones y **tabla afirmación→fuente→etiqueta**: `research.md` (§D6).
- Requisitos y criterios: `spec.md`.
- Base heredada: `specs/001-shared-layout-hero/` … `specs/003-personajes-content/`.
- Constitución: `.specify/memory/constitution.md` (Principio VI; rutas relativas 1.1.0).
