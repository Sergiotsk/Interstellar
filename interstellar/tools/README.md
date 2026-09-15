# tools/

Scripts de mantenimiento del repo. **Corren en local, en la máquina del desarrollador —
nunca en CI ni en el deploy.** Node ESM, sin framework. Sus salidas se commitean y se sirven
tal cual (constitución v2.3.0, § Principio I).

- `optimize-img.mjs` — optimiza imágenes a WebP + respaldo, **por sección**. Ver
  `specs/007-optimizacion-imagenes-webp/contracts/optimize-img-cli.md`.
- `optimize-img.lib.mjs` — funciones puras del pipeline (anchos, nombres, mapa de
  secciones). Testeado en `tests/optimize-img.test.js`.

## Optimizar imágenes por sección

El script trabaja **de a una sección** (o todas con `--all`). Dos formas de
invocarlo, equivalentes:

```bash
cd interstellar

node tools/optimize-img.mjs <seccion> [--dry-run] [--force]
# o, vía el script de package.json (pnpm reenvía los args, sin "--"):
pnpm optimize <seccion> [--dry-run] [--force]
```

**Secciones** (una por corrida): `mundos-portada`, `mundos-hub`,
`filmstrip-tierra`, `filmstrip-gargantua`, `personajes`, `ciencia`, `contacto`,
`hero`, `galeria`. Sin argumento válido, el script las lista.

**Flags:**

| Flag | Efecto |
|---|---|
| `--dry-run` | muestra qué haría (archivos, pesos, % de reducción) **sin escribir nada** |
| `--force` | regenera aunque el `.webp` ya exista — para re-tunear parámetros |
| `--all` | recorre todas las secciones en vez de `<seccion>` |

**Flujo típico:**

```bash
pnpm optimize ciencia --dry-run     # 1. ver el impacto
pnpm optimize ciencia               # 2. escribir los .webp + fallback
git add assets/img && git status    # 3. los derivados se commitean
```

Entrada: `assets/_source/img/<seccion>/` si hay originales crudos (gitignored);
si no, usa las imágenes actuales de `assets/img/`. El script avisa si una sección
no llega al −25 % o si supera el tope de peso.
