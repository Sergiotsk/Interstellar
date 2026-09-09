# Contract — `tools/optimize-img.mjs` (CLI)

Script Node ESM de mantenimiento del repo. Corre **local**, nunca en CI.

## Invocación

```bash
node tools/optimize-img.mjs <seccion> [--dry-run] [--force]
node tools/optimize-img.mjs --all      [--dry-run] [--force]
```

(Opcional: `package.json` puede exponer `"scripts": { "optimize": "node tools/optimize-img.mjs" }`
→ `pnpm optimize <seccion>`.)

### Argumentos

| Arg | Obligatorio | Descripción |
|---|---|---|
| `<seccion>` | uno de `<seccion>` \| `--all` | Nombre de sección del data-model (`mundos-portada`, `galeria`, `filmstrip-tierra`, `filmstrip-gargantua`, `mundos-hub`, `personajes`, `ciencia`, `contacto`, `hero`). |
| `--all` | — | Procesa todas las secciones. |
| `--dry-run` | no | Lista qué archivos generaría/actualizaría y el delta de peso, **sin escribir**. |
| `--force` | no | Regenera aunque el `.webp` ya exista (para re-tunear parámetros). Sin `--force`, un archivo cuya fuente es el propio `assets/img/` y ya tiene `.webp` se **saltea** (idempotencia). |

## Entradas

Por cada imagen de la sección (según un mapa `seccion → [nombreLogico, contexto]` embebido
en el script o derivado de convención):

1. Si existe `assets/_source/img/<seccion>/<nombreLogico>.<ext>` → esa es la fuente.
2. Si no → `assets/img/<nombreLogico>.<ext>` (la imagen servida actual) es la fuente.

Formatos de entrada aceptados: `jpg`, `jpeg`, `png`. Otros (`svg`, `webp` ya existentes) se
**ignoran** (log informativo).

## Salidas

En `assets/img/` (versionado), por cada fuente:

| Archivo | Cuándo |
|---|---|
| `<nombreLogico>.webp` | siempre |
| `<nombreLogico>.<extOriginal>` | siempre (respaldo; para backdrops de CSS queda disponible aunque el CSS no lo use) |

Parámetros (de `research.md` R2):
- WebP: `quality` 74 (backdrops/fotos) u 80 (retratos), `effort` 5, sin metadata.
- Respaldo JPEG: `mozjpeg: true`, `quality` 78, `progressive: true`, sin metadata.
- Respaldo PNG (si `tieneAlfa`): `png({ palette: true })`.
- Resize: `resize({ width: min(anchoObjetivo, anchoFuente), withoutEnlargement: true })`.

## Garantías

- **Idempotencia** (SC-005): segundo run sin tocar fuentes ⇒ `git status` limpio.
  - Fuente en `assets/_source/`: salida determinista (misma fuente + params + versión de
    `sharp`); el script compara buffers y solo escribe si cambió.
  - Fuente = el propio `assets/img/<n>.<ext>` (no hay original): una vez que existe
    `<n>.webp`, el archivo se **saltea** (re-encodear sería pérdida generacional). `--force`
    para regenerar.
- **Aislamiento**: solo escribe dentro de `assets/img/`. No toca `*.html`, `css/`, `tests/`,
  ni imágenes de otras secciones.
- **Sin red**: no descarga nada.
- **No corre en deploy**: no se referencia desde `.github/workflows/deploy-pages.yml`.

## Códigos de salida

| Código | Significado |
|---|---|
| `0` | OK (incluye `--dry-run` sin errores). |
| `1` | Argumento inválido (sección desconocida, falta arg). |
| `2` | Una o más fuentes no encontradas ni en `_source/` ni en `img/`. |
| `3` | Error de procesamiento de `sharp` en al menos una imagen (se informa cuáles; las demás sí se escriben). |

## Salida por consola

- Por imagen: `nombreLogico  <ancho_fuente>→<ancho_salida>  <bytes_antes> → <bytes_despues> (−NN%)`.
- Al final: total de la sección antes/después, % de reducción, y si supera el tope de peso
  conocido de esa sección (warning, no error).
- `--dry-run` antepone `[dry]` y no escribe.

## No objetivos del contrato

- No genera múltiples resoluciones (`srcset`), no genera AVIF.
- No edita el marcado HTML/CSS (eso es trabajo manual de la tarea de migración de la
  sección).
- No gestiona `CREDITOS.md`.
