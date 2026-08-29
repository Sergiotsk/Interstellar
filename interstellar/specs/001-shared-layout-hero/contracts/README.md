# Contratos — Layout compartido y Hero de inicio

**Feature**: `001-shared-layout-hero` | **Fecha**: 2026-08-28

Índice de los contratos que fijan las "interfaces" internas de esta feature: el módulo de layout compartido, el árbol de navegación y su interacción, los tokens de diseño y los assets. Cada contrato referencia los FR/SC de la spec que valida.

| Contrato | Alcance |
|---|---|
| [layout-injection.md](./layout-injection.md) | DOM que produce `js/layout.js`, hooks/mount que consume el CSS y el shape que consume de `nav-data.js`; garantía de fuente única (FR-001, SC-001) |
| [navigation.md](./navigation.md) | Forma del árbol de navegación y contrato de interacción disclosure de submenús (FR-002..FR-010, SC-002/SC-004/SC-005) |
| [design-tokens.md](./design-tokens.md) | Nombres y roles de tokens CSS en `:root` que las páginas DEBEN consumir (FR-017..FR-019) |
| [assets.md](./assets.md) | Sourcing, formato y atribución obligatoria de imágenes (FR-013, FR-021, SC-008) |

Documentos de diseño asociados: [data-model.md](../data-model.md) (entidades y estados) · [research.md](../research.md) (decisiones y justificación) · [quickstart.md](../quickstart.md) (escenarios de validación) · [spec.md](../spec.md) (requisitos).