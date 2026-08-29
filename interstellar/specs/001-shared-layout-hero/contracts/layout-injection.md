# Contrato: Inyección de layout (`js/layout.js`)

**Valida**: FR-001, SC-001, Principio II (HTML semántico), Principio V (TDD).

## Propósito y garantía

`js/layout.js` es el ÚNICO módulo que genera el encabezado, la navegación principal y el pie común. Las páginas HTML declaran únicamente su `<main>` (y, en `index.html`, las secciones del Hero). No existe copia de header/footer en ningún HTML (FR-001). Esta es la fuente única de verdad estructural del sitio.

## Configuración que consume

- `nav-data.js` (mismo patrón ES Module): exporta el árbol de navegación según `contracts/navigation.md` y `data-model.md` §1 (NavConfig). `layout.js` no tiene datos propios: cada lista y destino sale de ahí.

## DOM que DEBE producir (estructura fija)

```text
<body>
  <header>                          <!-- único por página -->
    <nav>
      <ul>                          <!-- nivel superior, 8 ítems (FR-002) -->
        <li><a href="...">...</a></li>
        <li><a href="...">...</a>
          <button aria-label="...">▼</button>   <!-- control de submenú -->
          <ul>                                   <!-- solo para los 4 ejes (FR-003) -->
            <li><a href="mundos.html#gargantua">...</a></li>
          </ul>
        </li>
      </ul>
    </nav>
  </header>
  <main>                            <!-- contenido propio de la página -->
    ...
  </main>
  <footer>                          <!-- único por página -->
    ... créditos, fuentes de imagen y enlace al repo (FR-012, FR-013)
  </footer>
</body>
```

- Encabezado y pie se insertan como hijos del `<body>` (al inicio y al final); `<main>` nunca se reemplaza.
- Los ítems con hijos incluyen un control de disclosure separado del enlace (el `<button>`), conforme a `contracts/navigation.md`.
- Etiquetas: `<header>`, `<nav>`, `<main>`, `<footer>`, `<ul>`/`<li>`, `<a>`, `<button>`; sin `<div>` donde corresponde un elemento semántico (Principio II).
- Enlaces e imágenes con `alt` correctos y rutas relativas (FR-020, FR-021).

## Hooks / montaje

- `layout.js` se carga con `<script type="module">` en cada página e inserta el header al inicio del `body` y el footer al final.
- **Contrato con CSS (`global.css`)**: el CSS apunta a los elementos generados por este módulo (estructura de arriba); no se requieren IDs por página. Si una página futura necesita estilos propios sobre el header/footer, se hace con tokens y clases utilitarias de `global.css`, nunca modificando la estructura generada.
- `nav-data.js` y `layout.js` se cargan en todas las páginas de esta feature (todas usan el layout compartido).

## Verificación

- TDD Red-Green-Refactor sobre `layout.js`: el árbol renderizado coincide con el NavConfig de `nav-data.js` (Principio V).
- SC-001: el conjunto header/nav/footer es idéntico en las 8 páginas.