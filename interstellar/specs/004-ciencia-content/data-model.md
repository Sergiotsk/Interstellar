# Modelo de datos — Contenido del eje La Ciencia

**Fase**: 1 (Diseño)
**Feature**: `004-ciencia-content`
**Fecha**: 2026-08-29

**Propósito**: en un sitio estático, el "dato" es la estructura del contenido y su
respaldo. Este modelo describe las entidades que se materializan como HTML en
`ciencia.html`, con sus reglas de validación mapeadas a los FR de la spec y al Principio VI.

## 1. Concepto científico

**Descripción**: una de las cuatro entradas del eje. Se materializa como un
`<section id="…" class="concepto">` dentro del `<main>` de `ciencia.html`.

| Campo | Tipo | Descripción | Validación |
|---|---|---|---|
| `anchorId` | string kebab-case | `id` de la sección y ancla de navegación | Uno de: `agujeros-negros`, `dilatacion-temporal`, `agujeros-de-gusano`, `relatividad`. NO cambia respecto de la feature 001 (FR-001, FR-015). |
| `nombre` | string | Título visible (`<h2>`) | Uno de: "Agujeros negros", "Dilatación temporal", "Agujeros de gusano", "Relatividad". Coincide con el `label` del `NavChild` en `js/nav-data.js`. |
| `laCiencia` | bloque | «La ciencia»: `<h3>` + párrafos de física real divulgativa, cada uno con su etiqueta de rigor inline | Obligatorio en las 4 secciones (FR-002). Cubre los elementos de FR-006 para ese concepto. |
| `enInterstellar` | bloque | «En Interstellar»: `<h3>` + párrafos sobre a qué escena(s) corresponde y cómo la película lo representa, cada uno con su etiqueta de rigor inline | Obligatorio en las 4 secciones (FR-002). Referencias a escenas **textuales**, sin enlaces a anclas de otros ejes (FR-010). |
| `fuentes` | bloque + lista | «Fuentes»: `<h3>` + `<ul>` de 1 a 3 referencias del conjunto aprobado | Obligatorio en las 4 secciones (FR-002, FR-007). Al menos una referencia verificable por sección (SC-005). |
| `imagen` | AssetRef \| null | Solo `#agujeros-negros`: `<figure>` reutilizando `ciencia-agujero-negro.jpg`. Las otras tres: `null` | Ruta relativa, `alt` descriptivo (informativa, FR-011). Sin `--backdrop-oscurecer`. NO agrega entrada de crédito (ya registrada, feature 001). |

**Reglas**:

- Exactamente 4 secciones de concepto, en este orden: Agujeros negros → Dilatación
  temporal → Agujeros de gusano → Relatividad (mismo orden que `js/nav-data.js`).
- Ninguna sección conserva el texto placeholder "Sección futura dedicada a…" (SC-001).
- La sección de introducción de la página (el `<section>` con `<h1>La Ciencia</h1>` sin
  `id`) se mantiene o se ajusta levemente; NO recibe la plantilla de tres bloques y SÍ
  aloja la leyenda de rigor (ver §3).
- Jerarquía de encabezados: un único `<h1>` → un `<h2>` por concepto → un `<h3>` por cada
  uno de los tres bloques (FR-011). Sin saltos de nivel.
- `#relatividad` es la **sección paraguas**: explica la relatividad general y presenta
  agujeros negros / dilatación / agujeros de gusano como consecuencias, referenciándolos
  como casos derivados; NO los re-explica en profundidad (clarificación 2026-08-29).

### Cobertura mínima por concepto (FR-006)

| Concepto | «La ciencia» debe cubrir |
|---|---|
| Agujeros negros | horizonte de eventos, disco de acreción, lente gravitacional / distorsión de la luz, singularidad; caso Gargantúa |
| Dilatación temporal | el tiempo corre más lento cerca de una masa grande; por qué 1 h en Miller ≈ 7 años fuera |
| Agujeros de gusano | puente de Einstein-Rosen, atajo hipotético en el espacio-tiempo, necesidad de "materia exótica" |
| Relatividad | espacio-tiempo curvo con la masa, no hay tiempo absoluto; los otros tres temas como consecuencias |

## 2. Afirmación con rigor

**Descripción**: una idea concreta del contenido (habitualmente un párrafo), con su nivel
de rigor y su fuente. Se materializa como un `<p>` que termina con un
`<span class="rigor rigor-<nivel>">`.

| Campo | Tipo | Descripción | Validación |
|---|---|---|---|
| `texto` | string | La afirmación en lenguaje divulgativo | Redactada solo si tiene respaldo en una fuente aprobada (Principio VI; caso límite "sin fuente → no se incluye"). |
| `nivel` | enum | `real` \| `plausible` \| `licencia` | Se materializa como clase `rigor-real` / `rigor-plausible` / `rigor-licencia` y como texto visible `✓ Ciencia real` / `~ Especulación plausible` / `✎ Licencia narrativa`. |
| `fuente` | ref | Entrada de la tabla §D6 de `research.md` ([T] / [P1] / [P2]) | Toda afirmación de nivel `real` o `plausible` tiene una fila en `research.md` §D6 (SC-005). |

**Reglas**:

- Cada `<p>` de «La ciencia» y «En Interstellar» agrupa afirmaciones de **un único** nivel
  y termina con **una** etiqueta `.rigor` (convención de maquetado, `research.md` D2). Un
  párrafo sin contenido científico (puramente introductorio) puede no llevar etiqueta.
- El texto del `<span class="rigor …">` DEBE incluir el nivel escrito, no solo el glifo ni
  solo color (FR-011, FR-016).
- Ninguna afirmación clasificada `licencia` en `research.md` §D6 puede materializarse con
  clase/texto `rigor-real` (FR-005, SC-004 — puerta de aceptación).
- Las tres etiquetas aparecen al menos una vez en la página (FR-004, SC-003); ver la
  cobertura en `research.md` §D6.

## 3. Leyenda de rigor

**Descripción**: la explicación única de los tres niveles. Se materializa como un
`<dl class="rigor-leyenda">` en la `<section>` de introducción, entre el `<p>` de
encuadre y la primera sección de concepto.

| Campo | Tipo | Descripción | Validación |
|---|---|---|---|
| entradas | 3 pares `<dt>`/`<dd>` | `<dt>` = etiqueta (`✓ Ciencia real`, etc.); `<dd>` = su significado en una frase | Exactamente 3, en el orden `real` → `plausible` → `licencia`. Texto del significado alineado con el Principio VI de la constitución. |

**Reglas**:

- Una sola leyenda en toda la página (FR-004). Las etiquetas inline no repiten la
  definición.
- La leyenda es texto real; no depende de `title=""` ni de color.

## 4. AssetRef (imagen de `#agujeros-negros`)

**Descripción**: referencia a la única imagen de la página.

| Campo | Valor | Validación |
|---|---|---|
| `archivo` | `ciencia-agujero-negro.jpg` | Ya presente en `assets/img/` (feature 001). No se descarga ni se re-optimiza. |
| `ruta` | `assets/img/ciencia-agujero-negro.jpg` | Ruta relativa (FR-014). |
| `alt` | Descriptivo (imagen informativa: ilustración de un agujero negro / disco de acreción) | NO vacío (FR-011). |
| `credito` | Ya en `ASSET_CREDITS` y `CREDITOS.md` como `"NASA/JPL-Caltech"` (feature 001) | NO se agrega ni se modifica (SC-010). |

## 5. Impacto sobre artefactos existentes

| Artefacto | Cambio | Regla / validación |
|---|---|---|
| `ciencia.html` | Reescritura del `<main>`: `<section>` de intro con `<dl>` de leyenda + 4 `<section id class="concepto">` con plantilla de 3 bloques y `<span class="rigor">` inline; `<figure>` en `#agujeros-negros` | Criterios de aceptación (`quickstart.md` E1–E7) |
| `css/global.css` | +1 sección 13 "concepto de ciencia + etiqueta de rigor": `.concepto h3/p/ul/li/figure`, `.rigor` + `.rigor-real/-plausible/-licencia`, `.rigor-leyenda`. Sin tokens nuevos; sin segundo color saturado (FR-016) | Revisión visual (SC-006); FR-016 |
| `js/layout.js` | **Sin cambios** | La imagen ya está en `ASSET_CREDITS` |
| `js/nav-data.js` | **Sin cambios** | Las 4 anclas ya están definidas |
| `tests/layout.test.js` | **Sin cambios** | No hay cambio de lógica; suite queda en verde |
| `assets/img/CREDITOS.md` | **Sin cambios** | No se agregan imágenes (SC-010) |
| `research.md` (spec) | Tabla §D6 afirmación→fuente→etiqueta | Base de SC-004 y SC-005 |
