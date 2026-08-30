# Contrato: extensión del registro de créditos de imagen

**Valida**: FR-006, SC-002, SC-008, Principio V.

> **SUPERSEDIDO EN PARTE (2026-08-30) — rama `feat/creditos-page`.** El registro de
> atribución por asset se movió del **pie** a la página dedicada `creditos.html`
> (módulo `js/creditos.js`). Donde este contrato dice `buildFooter()` / "el pie",
> léase **`buildCreditosContent()` en `js/creditos.js`** / "la página de créditos".
> El array `ASSET_CREDITS` ahora vive en `js/creditos.js` (no en `js/layout.js`) y su
> test es **`tests/creditos.test.js`** (no `tests/layout.test.js`). La invariante de
> sincronía con `assets/img/CREDITOS.md` (§3) y la convención de honestidad (no listar
> archivos inexistentes) siguen VIGENTES sin cambios. El pie conserva solo el enlace a
> `creditos.html` + el enlace al repo.

## Qué se toca

El pie común lo construye `buildFooter()` en `js/layout.js` a partir del array constante `ASSET_CREDITS`. Los créditos de los backdrops de Mundos se agregan **sin cambiar la estructura del pie** (FR-008): solo se extiende la lista de datos, sincronizada con `assets/img/CREDITOS.md`.

## 1. `js/layout.js` — array `ASSET_CREDITS`

Estado actual (feature 001):

```js
const ASSET_CREDITS = [
  'hero-backdrop.jpg — Event Horizon Telescope Collaboration, CC BY 4.0 (Wikimedia Commons)',
  'ciencia-agujero-negro.jpg — NASA/JPL-Caltech (NASA Image Library)',
  'mundos-tierra.jpg — NASA (Blue Marble 2012)',
  'personajes-astronauta.jpg — NASA (astronauta Scott Tingle)',
  'viaje-pilares-de-creacion.jpg — NASA, ESA/Hubble',
];
```

Cambio: **+4 entradas** (La Tierra ya está). Formato de cada línea: `'<archivo> — <atribucion> (<fuenteCatalogo>)'`.

```js
  'mundos-gargantua.jpg — <atribución> (<fuente del catálogo>)',
  'mundos-miller.jpg — <atribución> (<fuente del catálogo>)',
  'mundos-mann.jpg — <atribución> (<fuente del catálogo>)',
  'mundos-tesseract.jpg — <atribución> (<fuente del catálogo>)',
```

Los valores concretos de `<atribución>` y `<fuente del catálogo>` se fijan al seleccionar cada archivo (fase de implementación, ver `research.md` D2). No se inventan: si un asset todavía no se descargó, su línea se agrega **cuando** el archivo entra a `assets/img/` (misma convención de honestidad que la 001; el pie no debe listar un archivo inexistente que produzca 404).

## 2. `assets/img/CREDITOS.md` — tabla de assets

**+4 filas**, una por backdrop nuevo, con todas las columnas existentes:

| id | nombre de archivo | fuente (catálogo) | URL origen | licencia/condiciones | atribución requerida | estado |
|---|---|---|---|---|---|---|
| `mundos-gargantua` | `mundos-gargantua.jpg` | … | https://… | … | "…" | `descargado` \| `pendiente` |
| `mundos-miller` | `mundos-miller.jpg` | … | https://… | … | "…" | … |
| `mundos-mann` | `mundos-mann.jpg` | … | https://… | … | "…" | … |
| `mundos-tesseract` | `mundos-tesseract.jpg` | … | https://… | … | "…" | … |

Actualizar además el bloque **"Resumen de estado"** del archivo (contadores de descargados/pendientes).

## 3. Sincronía (invariante)

- Toda línea de `ASSET_CREDITS` tiene su fila en `CREDITOS.md` y viceversa.
- El `id` de la fila = `mundos-<anchorId>`; el `nombre de archivo` = `mundos-<anchorId>.jpg`.
- `estado: descargado` ⇒ el archivo existe en `assets/img/`. Nunca al revés.

## 4. TDD (Principio V) — `tests/layout.test.js`

El test actual del pie **no** afirma sobre líneas de crédito concretas, así que extender `ASSET_CREDITS` no lo rompe. Para respetar Red→Green se **agrega un test nuevo**:

```
test('el pie lista los créditos de los backdrops de Mundos (FR-006)', () => {
  const footer = buildFooter();
  for (const archivo of ['mundos-gargantua.jpg', 'mundos-miller.jpg',
                         'mundos-mann.jpg', 'mundos-tesseract.jpg']) {
    assert.ok(footer.includes(archivo), `falta el crédito de ${archivo}`);
  }
});
```

Orden: escribir este test → `node --test tests/` en **rojo** → extender `ASSET_CREDITS` → **verde** → `node --test tests/` completo en verde (los 3 archivos de test).

## Verificación

- **SC-008**: cada backdrop de Mundos aparece en `CREDITOS.md` con fuente del catálogo, URL de origen real y atribución no vacía.
- **FR-006**: `buildFooter()` incluye la atribución de los 5 backdrops de Mundos (Tierra + los 4 nuevos).
- **Principio V**: el test de créditos de Mundos existe y pasa; `node --test tests/` en verde.
