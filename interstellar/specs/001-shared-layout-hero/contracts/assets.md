# Contrato: Assets de imagen — sourcing y atribución

**Valida**: FR-013, FR-021, SC-008, Q5.

## Fuentes permitidas (catálogo aprobado)

Únicamente las fuentes detalladas en `proyecto-interstellar-base.md`:

- **Material de la película**: TMDB, Fanart.tv, Wikimedia Commons, Alpha Coders, WallpaperFlare, Wallpaper Cave, Wallpapers.com, WallpaperCat.
- **Material espacial real (dominio público)**: NASA Image Library, ESA/Hubble, Unsplash, Rawpixel (NASA).
- **Render científico**: figuras del paper arXiv 1502.03808 (sección La Ciencia).
- **Trailer**: embed de YouTube vía `<iframe>`.

Cualquier asset fuera de este catálogo queda PROHIBIDO en esta feature (FR-013, SC-008).

## Formato y rutas

- Imágenes locales en `assets/img/`, referenciadas con rutas relativas desde cada página (FR-021).
- Formato WebP, optimizadas a resoluciones razonables a mano (constitución); nombres kebab-case, minúsculas, sin acentos.
- La falla de carga de un asset NO debe romper la legibilidad: el logo y el backdrop cuentan con fallback (nombre como texto / fondo de paleta) (casos límites de la spec).

## Tratamiento

- Todo backdrop fotográfico se oscurece con el token `--backdrop-oscurecer` para garantizar lectura (FR-019).
- Imágenes decorativas → `alt=""`; imágenes informativas → `alt` descriptivo (FR-020, SC-007).

## Atribución obligatoria

> **Actualizado (2026-08-30):** el registro de atribución por asset se movió del pie a una **página dedicada** `creditos.html` (módulo `js/creditos.js`, array `ASSET_CREDITS`), **enlazada desde el pie común de todas las páginas**. La regla de fondo no cambia: cada imagen sigue acreditada y la atribución sigue siendo alcanzable desde cualquier página en un clic. El pie conserva el enlace al repo y suma el enlace a `creditos.html`.

- Cada asset se registra en la página de créditos (`CreditsPageContent.imageSources`, `data-model.md` §5) con: fuente del catálogo, atribución y condiciones de uso (SC-008); sincronizado 1:1 con `assets/img/CREDITOS.md`.
- La atribución cubre el 100 % de los materiales publicados, incluida la imagen principal del Hero (FR-013).
- El pie común de las 8 páginas expone el enlace a `creditos.html` y el enlace al repositorio `https://github.com/Sergiotsk/Interstellar.git` (FR-012).

## Verificación

- SC-008: comparación de cada asset contra el catálogo aprobado y presencia de su fuente identificable en los créditos, dentro de la revisión final y de la prueba de 5 personas (SC-010).