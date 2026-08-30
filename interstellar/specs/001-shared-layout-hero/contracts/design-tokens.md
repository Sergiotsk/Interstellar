# Contrato: Tokens de diseño (`:root` en `css/global.css`)

**Valida**: FR-017..FR-019, FR-010 (foco), SC-006, SC-007.

## Regla general

Toda paleta y todo valor reutilizable se define como custom property en `:root` de `css/global.css`; las páginas DEBEN consumir tokens, nunca valores hardcodeados sueltos (constitución, sección CSS). Los nombres siguientes son el contrato: la implementación fija los valores dentro de los límites descritos (paleta de FR-017 y constitución).

## Tokens requeridos (nombre → rol)

| Token | Rol | Límites |
|---|---|---|
| `--color-fondo` | Fondo base del sitio | Negro o azul profundo (paleta espacio) |
| `--color-superficie` | Superficies: header, nav, footer, tarjetas | Del paleta espacio; admite transparencia para superposición sobre backdrops |
| `--color-tierra-ocre` | Acentos de la Tierra | Ocre terroso |
| `--color-tierra-oro` | Acentos de la Tierra | Dorado |
| `--color-gargantua` | ÚNICO acento saturado | Naranja de Gargantúa; ningún otro color saturado en el sitio |
| `--color-texto` | Texto principal | Blanco roto / crema; NUNCA blanco puro |
| `--color-texto-atenuado` | Textos secundarios (subtitle, meta) | Variante atenuada del texto sobre fondos oscuros |
| `--font-sitio` | Familia tipográfica aprobada | Google Fonts vía `<link>`; fallback legible si falla la carga (caso límite) |
| `--font-hero-titulo` | Tipografía del título del Hero | Refleja la jerarquía de entrada (FR-015, FR-018) |
| `--font-nav` | Tipografía de la navegación | Refleja la jerarquía de navegación (FR-018) |
| `--font-texto` | Tipografía del cuerpo | Refleja la jerarquía de lectura (FR-018) |
| `--focus-anillo` | Indicador de foco (outline) de controles y enlaces | Visible en el 100 % de los elementos interactivos (FR-010, SC-005) |
| `--backdrop-oscurecer` | Tratamiento de oscurecimiento de backdrops | `filter: brightness(...)` sobre fondo fotográfico (FR-019, constitución) |

## Reglas de aplicación

- El 100 % de los valores reutilizables viven en `:root`; una página no define un color suelto que ya representa un rol de la tabla.
- Todo fondo fotográfico usa `--backdrop-oscurecer` (FR-019); texto y foco sobre el Hero y sobre fondos oscuros conservan contraste en todos los tamaños admitidos (SC-006).
- El indicador de foco es visible y consistente en todas las páginas (FR-010, SC-007).
- Jerarquías tipográficas coherentes entre la página de inicio y los placeholders (FR-018, HU4).

## Verificación

- FR-017: revisión de paleta en todas las páginas; el único color saturado es el naranja de Gargantúa.
- SC-007: revisión de jerarquía tipográfica y de foco según la constitución (§«Flujo de Trabajo y Puertas de Calidad»).
- Inspección de código: ausencia de valores de paleta hardcodeados fuera de `:root`.