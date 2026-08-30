# Contrato: extensión del registro de créditos de imagen

**Valida**: FR-006, FR-007, SC-008, Principio V.

> **SUPERSEDIDO EN PARTE (2026-08-30) — rama `feat/creditos-page`.** El registro de
> atribución por asset se movió del **pie** a la página dedicada `creditos.html`
> (módulo `js/creditos.js`). Donde este contrato dice `buildFooter()` / "el pie",
> léase **`buildCreditosContent()` en `js/creditos.js`** / "la página de créditos".
> El array `ASSET_CREDITS` ahora vive en `js/creditos.js` y su test es
> **`tests/creditos.test.js`**. Las 6 líneas de los retratos de Personajes y su
> sincronía con `assets/img/CREDITOS.md` siguen VIGENTES sin cambios.

## Qué se toca

El pie común lo construye `buildFooter()` en `js/layout.js` a partir del array constante `ASSET_CREDITS`. Los créditos de los retratos de Personajes se agregan **sin cambiar la estructura del pie** (FR-008): solo se extiende la lista de datos, sincronizada con `assets/img/CREDITOS.md`.

## 1. `js/layout.js` — array `ASSET_CREDITS`

Estado actual (features 001 + 002):

```js
const ASSET_CREDITS = [
  'hero-backdrop.jpg — Event Horizon Telescope Collaboration, CC BY 4.0 (Wikimedia Commons)',
  'ciencia-agujero-negro.jpg — NASA/JPL-Caltech (NASA Image Library)',
  'mundos-tierra.jpg — NASA (Blue Marble 2012)',
  'personajes-astronauta.jpg — NASA (astronauta Scott Tingle)',
  'viaje-pilares-de-creacion.jpg — NASA, ESA/Hubble',
  'mundos-gargantua.jpg — © Warner Bros. Pictures / Paramount Pictures, uso académico con atribución (FILMGRAB)',
  'mundos-miller.jpg — © Warner Bros. Pictures / Paramount Pictures, uso académico con atribución (FILMGRAB)',
  'mundos-mann.jpg — © Warner Bros. Pictures / Paramount Pictures, uso académico con atribución (FILMGRAB)',
  'mundos-tesseract.jpg — © Warner Bros. Pictures / Paramount Pictures, uso académico con atribución (FILMGRAB)',
];
```

Cambio: **+6 entradas**. Formato de cada línea (idéntico al de los backdrops de Mundos):
`'<archivo> — © Warner Bros. Pictures / Paramount Pictures, uso académico con atribución (FILMGRAB)'`.

```js
  'personajes-cooper.jpg — © Warner Bros. Pictures / Paramount Pictures, uso académico con atribución (FILMGRAB)',
  'personajes-murph.jpg — © Warner Bros. Pictures / Paramount Pictures, uso académico con atribución (FILMGRAB)',
  'personajes-brand.jpg — © Warner Bros. Pictures / Paramount Pictures, uso académico con atribución (FILMGRAB)',
  'personajes-profesor-brand.jpg — © Warner Bros. Pictures / Paramount Pictures, uso académico con atribución (FILMGRAB)',
  'personajes-mann.jpg — © Warner Bros. Pictures / Paramount Pictures, uso académico con atribución (FILMGRAB)',
  'personajes-tars-case.jpg — © Warner Bros. Pictures / Paramount Pictures, uso académico con atribución (FILMGRAB)',
```

> `personajes-astronauta.jpg` (asset genérico de la feature 001) **no se toca**: no lo referencia el contenido nuevo, pero el archivo sigue en el repo, así que su línea de crédito se conserva. Su eventual retiro es una limpieza posterior fuera de esta feature.

**Convención de honestidad**: cada línea se agrega **cuando** el archivo entra a `assets/img/`. El pie no debe listar un archivo inexistente que produzca 404. Si un still todavía no se descargó, su línea se suma al incorporarse el archivo.

## 2. `assets/img/CREDITOS.md` — tabla de assets

**+6 filas**, una por retrato, con todas las columnas existentes:

| id | nombre de archivo | fuente (catálogo) | URL origen | licencia/condiciones | atribución requerida | estado |
|---|---|---|---|---|---|---|
| `personajes-cooper` | `personajes-cooper.jpg` | FILMGRAB (film-grab.com) | https://film-grab.com/2015/04/17/interstellar/ | Material de la película, uso académico con atribución | "© Warner Bros. Pictures / Paramount Pictures" | `descargado` \| `pendiente` |
| `personajes-murph` | `personajes-murph.jpg` | FILMGRAB (film-grab.com) | https://film-grab.com/2015/04/17/interstellar/ | Material de la película, uso académico con atribución | "© Warner Bros. Pictures / Paramount Pictures" | … |
| `personajes-brand` | `personajes-brand.jpg` | FILMGRAB (film-grab.com) | https://film-grab.com/2015/04/17/interstellar/ | Material de la película, uso académico con atribución | "© Warner Bros. Pictures / Paramount Pictures" | … |
| `personajes-profesor-brand` | `personajes-profesor-brand.jpg` | FILMGRAB (film-grab.com) | https://film-grab.com/2015/04/17/interstellar/ | Material de la película, uso académico con atribución | "© Warner Bros. Pictures / Paramount Pictures" | … |
| `personajes-mann` | `personajes-mann.jpg` | FILMGRAB (film-grab.com) | https://film-grab.com/2015/04/17/interstellar/ | Material de la película, uso académico con atribución | "© Warner Bros. Pictures / Paramount Pictures" | … |
| `personajes-tars-case` | `personajes-tars-case.jpg` | FILMGRAB (film-grab.com) | https://film-grab.com/2015/04/17/interstellar/ | Material de la película, uso académico con atribución | "© Warner Bros. Pictures / Paramount Pictures" | … |

- La `URL origen` puede ajustarse al fotograma concreto elegido en implementación, pero DEBE ser real y verificable (no inventada).
- Actualizar además el bloque **"Resumen de estado"** del archivo (contadores de descargados/pendientes) y la nota de peso (los 6 retratos ≤250 KB c/u, ≤1,5 MB total — FR-007, SC-008).

## 3. Sincronía (invariante)

- Toda línea de `ASSET_CREDITS` tiene su fila en `CREDITOS.md` y viceversa.
- El `id` de la fila = `personajes-<anchorId>`; el `nombre de archivo` = `personajes-<anchorId>.jpg`.
- `estado: descargado` ⇒ el archivo existe en `assets/img/`. Nunca al revés.

## 4. TDD (Principio V) — `tests/layout.test.js`

El test actual del pie **no** afirma sobre los retratos de Personajes, así que extender `ASSET_CREDITS` no lo rompe. Para respetar Red→Green se **agrega un test nuevo**:

```js
test('el pie lista los créditos de los retratos de Personajes (FR-007)', () => {
  const footer = buildFooter();
  for (const archivo of ['personajes-cooper.jpg', 'personajes-murph.jpg',
                         'personajes-brand.jpg', 'personajes-profesor-brand.jpg',
                         'personajes-mann.jpg', 'personajes-tars-case.jpg']) {
    assert.ok(footer.includes(archivo), `falta el crédito de ${archivo}`);
  }
});
```

Orden: escribir este test → `node --test tests/*.test.js` en **rojo** → extender `ASSET_CREDITS` → **verde** → suite completa en verde (`smoke.test.js`, `submenu-state.test.js`, `layout.test.js`).

## Verificación

- **SC-008**: cada retrato de Personajes aparece en `CREDITOS.md` con fuente del catálogo, URL de origen real y atribución no vacía.
- **FR-006 / FR-007**: `buildFooter()` incluye la atribución de los 6 retratos de Personajes.
- **Principio V**: el test de créditos de Personajes existe y pasa; `node --test tests/*.test.js` en verde.
