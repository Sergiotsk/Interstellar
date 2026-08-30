# Guía rápida de validación — Layout compartido y Hero de inicio

**Feature**: `001-shared-layout-hero` | **Fecha**: 2026-08-28

**Propósito**: guía de ejecución y validación de la feature (NO documenta implementación — eso pertenece a `tasks.md`, que se crea en la Fase 2). Referencias a contratos y modelo de datos enlazadas, no duplicadas.

## Prerrequisitos

- Navegador evergreen moderno: últimas 2 versiones de Chrome, Edge, Firefox o Safari (ver `research.md` D6).
- Nada que instalar; sin build. El sitio se sirve tal cual está escrito (constitución I).

## Servir localmente

Los ES Modules (`<script type="module">`) requieren servirse por HTTP, no por `file://` (política CORS). Desde la raíz del repositorio:

```text
python -m http.server 8000        # o
npx serve                          # o cualquier servidor estático
```

Abrir http://localhost:8000/ (en producción: GitHub Pages, deploy estático automático vía GitHub Actions en cada push a `main` → https://sergiotsk.github.io/Interstellar/).

## Escenarios de validación

### E1 — Recorrido completo de la navegación (HU1, SC-001, SC-002, SC-004)

1. Desde Inicio, verificar que existen los 8 destinos superiores: Inicio, Mundos, Personajes, La Ciencia, El Viaje, Galería, Minijuegos, Trailer (FR-002), y que cada uno es alcanzable en ≤ 2 interacciones (SC-004).
2. Visitar las 8 páginas y comprobar header, navegación y pie idénticos (SC-001, FR-001).
3. Activar cada destino anidado de los 4 ejes (21 en total) y confirmar que llega a la sección ancla correspondiente, sin enlaces rotos (SC-002, FR-021).

### E2 — Submenús: desktop, mobile y teclado (HU1, FR-009, FR-010, SC-005)

0. Nota T030: en `max-width: 63.999rem` la navegación se presenta como drawer hamburguesa de una fila (☰ 44×44 px, WCAG 2.5.8); los submenús de los ejes se abren como acordeón DENTRO del drawer (mismo modelo de disclosure FR-009). Desktop (`≥64rem`) conserva el dropdown por hover/clic. T013 sigue vigente para el modelo de interacción del disclosure y el submenú de escritorio.

1. En desktop y en viewport móvil: abrir el drawer (☰) en mobile, alternar cada submenú con clic y con toque; verificar que solo uno permanece abierto y que ninguna opción queda superpuesta, recortada o genera desplazamiento horizontal involuntario; cada ítem ocupa al menos 44 px de alto (HU1-E2, FR-021).
2. Con teclado: enfocar un control de submenú, alternar con Enter y con Space, cerrar con Escape; verificar foco visible, orden coherente y restauración del foco al control (HU1-E3).
3. Cerrar con clic fuera y al abandonar la navegación; elegir un destino anidado y verificar que el submenú se cierra (HU1-E4).
4. Referencia de comportamiento: `contracts/navigation.md` y `data-model.md` §6 (SubmenuState).

### E3 — Hero fullscreen y legibilidad (HU2, FR-014..FR-016, SC-003, SC-006)

1. A 320 px, 768 px y 1280 px de ancho: el Hero ocupa la pantalla visible inicial completa; el header se superpone en su parte superior sin consumir espacio vertical separado; sin overflow horizontal (SC-003).
2. Título/logo y subtítulo legibles en cada ancho sin depender de una zona clara del backdrop; el header superpuesto conserva contraste (SC-006, FR-019).
3. Scrollear más allá del Hero hasta la introducción breve que enmarca el carácter cinematográfico y educativo del sitio (HU2-E3, FR-016).

### E4 — Placeholders y anclas con carga directa (HU3, FR-011, SC-002)

1. Galería, Minijuegos, Trailer y las secciones de los 4 ejes muestran un placeholder semántico con nombre y propósito, conservando header y pie (FR-011, HU3-E1).
2. Cargar de forma directa URLs con ancla (ej. `http://localhost:8000/mundos.html#gargantua`): la sección existe, se reconoce y no queda inutilizable por el encabezado (caso límite).

### E5 — Coherencia visual (HU4, FR-017..FR-019, SC-006, SC-007)

1. Comparar inicio y placeholders: paleta, tipografía y jerarquías consistentes; el único acento saturado es el naranja de Gargantúa (FR-017, HU4-E1).
2. Verificar contraste de textos y foco sobre fondos oscuros o fotográficos en distintos tamaños de pantalla (HU4-E2, FR-019).
3. Estructura semántica: único `<main>`, encabezados jerárquicos, `alt` correctos por tipo de imagen (SC-007, FR-020). Referencia: `contracts/layout-injection.md`.

### E6 — Ausencia de errores y assets verificados (FR-021, SC-009, SC-008)

1. Recorridos completos (navegación, carga directa, anclas) sin errores en consola en Chrome, Edge, Firefox y Safari (SC-009).
2. Confirmar que cada imagen proviene del catálogo aprobado y está acreditada en `creditos.html` (enlazada desde el pie de todas las páginas) (SC-008). Referencia: `contracts/assets.md`.

### E7 — Prueba moderada de 5 personas (SC-010) — puerta de aprobación obligatoria

**Procedimiento**:
1. Reclutar 5 personas que no hayan usado el sitio.
2. Sin ayuda del moderador y partiendo de `index.html`, pedir a cada persona: (a) identificar la temática del sitio; (b) encontrar una sección superior solicitada (por ejemplo "Mundos" o "La Ciencia") en menos de 30 segundos.
3. Registrar por persona: resultado (sí/no), tiempo de búsqueda y observaciones.

**Puerta de aprobación**: al menos 4 de 5 personas (≥4/5) identifican la temática de Interstellar Y encuentran la sección solicitada en menos de 30 segundos. Si no se alcanza, la feature NO se considera completa (Q4, SC-010): registrar los incidentes (navegación confusa, submenú que no cierra, texto ilegible, enlaces rotos) como defectos, corregirlos y re-testear.

## Referencias

- Contratos: `contracts/README.md` (índice) · `contracts/layout-injection.md` · `contracts/navigation.md` · `contracts/design-tokens.md` · `contracts/assets.md`.
- Datos y estados: `data-model.md`.
- Decisiones de diseño: `research.md`.
- Requisitos: `spec.md`.

## Decisión de diseño (typography)

**Aprobada** (T002): pairing cinematográfico/futurista con soporte completo de español (ñ, á é í ó ú, ¿ ¡) vía Google Fonts `<link>` (Principio I).

- `--font-hero-titulo`: **Orbitron** (500–900) — display geométrico de ciencia ficción, la voz cinematográfica del título del Hero (FR-015, FR-018).
- `--font-sitio`: **Exo 2** (300–700) — familia base del sitio; limpia, moderna y legible.
- `--font-nav`: **Exo 2** (500–600) — coherencia con la familia del sitio para la navegación (FR-018).
- `--font-texto`: **Exo 2** (300–400) — cuerpo de lectura.

**Fallback (caso límite)**: cada stack declara `sans-serif` genérico; si la fuente no carga, el texto conserva jerarquía y legibilidad sobre la paleta.

**`<link>` de Google Fonts para el `<head>` de cada página (T014, T016..T022)**:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&family=Orbitron:wght@500;600;700;800;900&display=swap" rel="stylesheet">
```

**Stacks sugeridos para `css/global.css` (`:root`, T007)**:

```css
--font-sitio: 'Exo 2', ui-sans-serif, system-ui, sans-serif;
--font-hero-titulo: 'Orbitron', var(--font-sitio);
--font-nav: 'Exo 2', ui-sans-serif, system-ui, sans-serif;
--font-texto: 'Exo 2', ui-sans-serif, system-ui, sans-serif;
```