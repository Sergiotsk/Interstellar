# Contrato: Navegación y disclosure de submenús

**Valida**: FR-002..FR-010, SC-002, SC-004, SC-005.

## Shape del árbol (consumida por `layout.js`)

Ver `data-model.md` §1 (NavigationTree/NavConfig). Resumen:

- `items[]`: 8 NavItem (FR-002), con `id`, `label`, `href`, `hasChildren`, `children`.
- `children[]`: 21 NavChild con `id`, `label`, `href = <página>.html#<ancla>` (FR-003..FR-008).
- Validación: cada `href` anidado DEBE resolver a `PageRegistry.hostedAnchors` de su página (FR-021, SC-002); ningún label se trunca perdiendo significado (caso límite).

## Interacción (disclosure)

**Controles**: cada ítem con hijos presenta:
1. un `<a>` hacia su página superior (destino directo: 1 interacción → SC-004), y
2. un `<button>` de submenú independiente (control de disclosure; `aria-label` descriptivo).

**Abrir / alternar** (cualquiera de estos debe alternar el submenú):
- Clic o toque sobre el control de submenú.
- Enter o Space con el control enfocado.

**Invariancia — máximo uno abierto**: al abrir un submenú, cualquier otro submenú abierto se cierra (FR-009). Nunca dos abiertos.

**Cerrar**:
- Activar nuevamente el mismo control (toggle).
- Activar un destino anidado (navega a la sección y cierra; HU1-E4).
- Escape.
- Clic fuera de la navegación.
- Abandonar la navegación (salir del área del menú).

**Foco**: al cerrar por Escape, clic fuera o abandono, el foco vuelve al control de submenú que lo abrió (FR-010). El indicador de foco es visible en todos los controles y enlaces; el orden de tabulación sigue la secuencia visual y semántica del contenido (FR-010, SC-005).

**Responsive**: el modelo de interacción es el mismo en mobile y desktop (FR-009); la presentación (colapsada/expandida según viewport) la resuelve `global.css`, pero los invariantes no cambian. Sobre el Hero, los controles superpuestos conservan contraste legible (FR-019, SC-006).

**Estados y transiciones**: ver `data-model.md` §6 (SubmenuState).