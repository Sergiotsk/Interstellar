# Modelo de datos — Layout compartido y Hero de inicio

**Fase**: 1 (Diseño)
**Feature**: `001-shared-layout-hero`
**Fecha**: 2026-08-28

**Propósito**: en un sitio estático, el "dato" es configuración y estructura de contenido. Este modelo describe las entidades que consumirán los módulos JS y el CSS, con sus reglas de validación mapeadas a los FR de la spec. Es el insumo del contrato de navegación y del módulo `nav-data.js`.

## 1. NavigationTree / NavConfig

**Descripción**: árbol de navegación que alimenta a `layout.js` para renderizar el header/nav. Es la única fuente de verdad de la estructura (FR-001).

### NavItem (nivel superior)

| Campo | Tipo | Descripción | Validación |
|---|---|---|---|
| `id` | string kebab-case | Identificador estable del ítem | Único; minúsculas, sin acentos (constitución) |
| `label` | string | Etiqueta visible | DEBE coincidir exactamente con FR-002: Inicio, Mundos, Personajes, La Ciencia, El Viaje, Galería, Minijuegos, Trailer |
| `href` | string (ruta relativa) | Destino de nivel superior | Resuelve a una página existente del PageRegistry (FR-011, FR-021); rutas relativas |
| `hasChildren` | boolean | True para los cuatro ejes: Mundos, Personajes, La Ciencia, El Viaje | DEBE ser true solo para los ejes (FR-003); false para el resto |
| `children` | NavChild[] | Destinos anidados del eje | Solo si `hasChildren`; lista vacía en caso contrario |

### NavChild (destino anidado)

| Campo | Tipo | Descripción | Validación |
|---|---|---|---|
| `id` | string kebab-case | Identificador de la sección (ancla) | Coincide con un `hostedAnchor` del PageRegistry de su página (FR-021, SC-002) |
| `label` | string | Etiqueta visible del destino anidado | Corresponde a FR-005..FR-008; sin truncado que pierda significado (caso límite) |
| `href` | string | `<página-superior>.html#<ancla>` | DEBE ser `<parentPage>.html#<id>`; ruta válida (FR-021) |

### Árbol de referencia (derivado literal de FR-002..FR-008)

| Nivel superior | href | Destinos anidados (href) |
|---|---|---|
| Inicio | index.html | — |
| Mundos | mundos.html | La Tierra `#tierra` · Gargantúa `#gargantua` · Planeta de Miller `#miller` · Planeta de Mann `#mann` · El Tesseract `#tesseract` |
| Personajes | personajes.html | Cooper `#cooper` · Murph `#murph` · Dr. Brand `#brand` · Profesor Brand `#profesor-brand` · Mann `#mann` · TARS & CASE `#tars-case` |
| La Ciencia | ciencia.html | Agujeros negros `#agujeros-negros` · Dilatación temporal `#dilatacion-temporal` · Agujeros de gusano `#agujeros-de-gusano` · Relatividad `#relatividad` |
| El Viaje | viaje.html | Tierra `#tierra` · Agujero de gusano `#agujero-de-gusano` · Miller `#miller` · Mann `#mann` · Gargantúa `#gargantua` · Tesseract `#tesseract` |
| Galería | galeria.html | — |
| Minijuegos | minijuegos.html | — |
| Trailer | trailer.html | — |

**Reglas**: 8 ítems top-level exactos (FR-002); solo los cuatro ejes tienen hijos (FR-003); cada `href` anidado resuelve a un `hostedAnchor` del PageRegistry (FR-021); ningún enlace roto (SC-002); total 21 destinos anidados.

## 2. PageRegistry

**Descripción**: registro de las 8 páginas, su rol en esta feature y las anclas que alojan (FR-002, FR-011).

| Campo | Tipo | Descripción | Validación |
|---|---|---|---|
| `file` | string kebab-case | Nombre del archivo HTML | En la raíz del repo; kebab-case, minúsculas, sin acentos |
| `label` | string | Título/destino top-level | Coincide con un `label` del NavigationTree (SC-001, SC-002) |
| `role` | enum | Rol en la feature | `hero` (index), `axis` (ejes con anclas), `placeholder` (sin contenido definitivo) |
| `hostedAnchors` | string[] | Anclas que aloja la página | Únicas dentro de la misma página; coinciden con los `href` anidados que la referencian (FR-021) |

### Registro de referencia

| file | label | role | hostedAnchors |
|---|---|---|---|
| index.html | Inicio | hero | — |
| mundos.html | Mundos | axis | tierra, gargantua, miller, mann, tesseract |
| personajes.html | Personajes | axis | cooper, murph, brand, profesor-brand, mann, tars-case |
| ciencia.html | La Ciencia | axis | agujeros-negros, dilatacion-temporal, agujeros-de-gusano, relatividad |
| viaje.html | El Viaje | axis | tierra, agujero-de-gusano, miller, mann, gargantua, tesseract |
| galeria.html | Galería | placeholder | — |
| minijuegos.html | Minijuegos | placeholder | — |
| trailer.html | Trailer | placeholder | — |

**Reglas**: las 8 páginas DEBEN existir (FR-011); cada `href` de NavChild DEBE apuntar a `<file>#<hostedAnchor>` de su página (FR-021); cada página de rol `placeholder` y cada sección ancla de los ejes DEBEN mostrar un placeholder semántico con nombre y propósito, conservando el layout común (FR-011, SC-002); `index.html` cumple el rol de Hero (FR-014).

## 3. DesignTokens

**Descripción**: catálogo de tokens CSS en `:root` de `css/global.css` que las páginas DEBEN consumir (FR-017..FR-019). El contrato `contracts/design-tokens.md` fija los nombres; los valores concretos se resuelven en implementación dentro de los límites de la paleta, sin hardcodear valores sueltos.

| Token (rol) | Uso | Validación |
|---|---|---|
| Paleta — espacio | Negros y azules profundos para fondos y superficies | FR-017; SC-007 |
| Paleta — Tierra | Ocres y dorados terrosos para acentos | FR-017 |
| Paleta — acento único | Naranja de Gargantúa como ÚNICO acento saturado del sitio | FR-017 |
| Paleta — texto | Blancos rotos / crema; PROHIBIDO blanco puro | FR-017; SC-006 |
| Tipografía | Familia aprobada (Google Fonts vía `<link>`) y jerarquías para títulos, navegación y texto | FR-018; constitución (tipografía) |
| Oscurecimiento de backdrops | Tratamiento `filter: brightness(...)` / gradiente oscuro sobre fondos fotográficos | FR-019; constitución (diseño) |
| Foco | Indicador visible en todos los controles y enlaces interactivos | FR-010, FR-019; SC-005, SC-007 |

**Reglas**: el 100 % de los valores reutilizables vive en `:root` (constitución); la tipografía preserva un fallback legible si la fuente no carga (caso límite); todo backdrop se oscurece (FR-019); el foco es siempre visible (FR-010).

## 4. HeroContent

**Descripción**: contenido del Hero de `index.html` (FR-014..FR-016).

| Campo | Tipo | Descripción | Validación |
|---|---|---|---|
| `backdrop` | AssetRef | Imagen de fondo del catálogo aprobado, WebP local, oscurecida | FR-013, FR-015, FR-019, SC-008 |
| `title` / `logo` | string / asset | Título o logo de la obra | Si es logo, DEBE tener alternativa textual legible (FR-015; caso límite: fallback textual del nombre) |
| `tagline` | string | Subtítulo/tagline | Legible sobre el backdrop oscurecido en todos los tamaños (SC-003, SC-006) |
| `intro` | string | Bloque breve inmediatamente posterior al Hero | Explica que el sitio recorre los mundos, personajes, viaje y ciencia de Interstellar (FR-016) |

**Reglas**: el Hero ocupa la pantalla visible inicial completa, con el header superpuesto en su parte superior sin consumir espacio vertical separado (FR-014, SC-003); si el backdrop no carga, el contenido conserva jerarquía y legibilidad sobre un fondo de la paleta (caso límite); el header y la nav superpuestos conservan contraste (FR-019, SC-006).

## 5. FooterContent

**Descripción**: contenido del pie común (FR-012, FR-013).

> **Actualizado (2026-08-30):** `imageSources` se movió del pie a la página `creditos.html`
> (ver §5b). El pie quedó mínimo: `credits` + enlace a `creditos.html` + `repoUrl`.

| Campo | Tipo | Descripción | Validación |
|---|---|---|---|
| `credits` | string | Disclaimer / créditos del proyecto | Presentes en las 8 páginas (FR-012, SC-001) |
| `creditsUrl` | string | `creditos.html` — enlace a la página de créditos y fuentes | Presente en las 8 páginas (FR-013) |
| `repoUrl` | string | `https://github.com/Sergiotsk/Interstellar.git` o equivalente aprobado | FR-012 |

## 5b. CreditsPageContent

**Descripción**: contenido de `creditos.html` (módulo `js/creditos.js`). Materializa la
atribución que antes vivía en el pie (FR-013, SC-008).

| Campo | Tipo | Descripción | Validación |
|---|---|---|---|
| `intro` | string | Nota de fuentes del material visual (catálogo aprobado) | FR-013 |
| `imageSources` | AssetCredit[] | Por cada material visual: fuente del catálogo, atribución y condiciones de uso | Obligatorio para el 100 % de los assets descargados (FR-013, SC-008); sincronía 1:1 con `assets/img/CREDITOS.md` |

**AssetCredit** = `{ assetId, source (fuente del catálogo), attribution, usageUrl }`.
En código: array `ASSET_CREDITS` de strings `'<archivo> — <atribución> (<fuente>)'`.

## 6. SubmenuState

**Descripción**: máquina de estados del submenú de un eje (FR-009, FR-010, SC-005).

**Estados**
- `cerrado` (inicial)
- `abierto`

**Eventos y transiciones**

| Evento | Disparador | Transición | Invariantes |
|---|---|---|---|
| `toggle` | Clic, toque, Enter o Space sobre el control | `cerrado→abierto` / `abierto→cerrado` | Al abrir, cierra cualquier otro submenú abierto (máximo uno abierto) |
| `abrir-otro` | Abrir el control de otro submenú | El submenú actual `abierto→cerrado` | Nunca dos submenús abiertos |
| `navigate` | Activar un destino anidado | `abierto→cerrado` + navegación | El submenú se cierra al elegir destino (HU1-E4) |
| `dismiss` | Escape, clic fuera de la navegación, abandonar la navegación | `abierto→cerrado` | Foco restaurado al control del submenú (FR-010) |

**Invariantes**
- A lo sumo un submenú `abierto` en todo momento (FR-009, SC-005).
- Foco visible en todos los controles y enlaces, y orden de tabulación coherente (FR-010, SC-005).
- Al cerrar por `dismiss`, el foco vuelve al control del submenú correspondiente (FR-010).
- Cambiar de página o redimensionar la ventana no deja contenido bloqueado u oculto (caso límite).
- La etiqueta del submenú nunca se trunca perdiendo significado ni se superpone a otros controles (caso límite).