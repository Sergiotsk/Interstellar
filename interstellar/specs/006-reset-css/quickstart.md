# Quickstart — Verificación de 006-reset-css (Phase 1)

Guía para validar que la feature cumple, sin tests de framework (capa presentacional,
Principio V). Cada bloque mapea a criterios de éxito de `spec.md`.

## Prerrequisitos

- Servir el sitio localmente desde `interstellar/`:
  ```
  python -m http.server 8899
  ```
- Un navegador evergreen para la comparación visual.
- `node` para la suite de tests JS.

---

## E1 — Estructura de las 4 hojas (SC-004, SC-005 · FR-001, FR-002, FR-003)

```
ls css/                              # esperado: reset.css variables.css base.css layout.css  (NO global.css)
test ! -f css/global.css && echo "OK: global.css borrado"
for p in index mundos personajes ciencia viaje galeria trailer minijuegos creditos; do
  echo "== $p =="; rg -n 'rel="stylesheet"' "$p.html"
done
rg -l "global\.css" --glob '!specs/**' --glob '!docs/**' .    # esperado: SIN resultados
rg -n "@import" css/                 # esperado: SIN resultados
```

**Pasa si**: cada página tiene exactamente los 4 `<link>` en orden
`reset → variables → base → layout`; `global.css` no existe ni se referencia; sin `@import`.

---

## E2 — Cero regresión visual, página por página (SC-003 · FR-004, FR-014, US1-AS3)

Procedimiento (antes de tocar nada, sacar el set "antes"; después, el set "después"):

1. Con `git stash` / una rama, tener a mano el estado **con `global.css`**.
2. Para cada una de las 9 páginas, a **≈360 px** y **≈1280 px** de ancho:
   - Captura "antes" (global.css) y "después" (4 hojas).
   - Comparar. **Cero diferencias perceptibles** en layout, tipografía, colores, espaciado,
     foco, Hero, drawer abierto, secciones de contenido.
3. Zonas de riesgo a mirar con lupa: separación entre párrafos (reset total de márgenes),
   botón CASE y drawer, backdrops del Hero y de las secciones de eje, la galería.

**Pasa si**: las 18 comparaciones (9 páginas × 2 anchos) no muestran diferencias. Si alguna
difiere, ajustar `base.css` (espaciado, research.md D3) y repetir.

---

## E3 — Invariante de especificidad de `reset.css` (SC-001 · FR-006, FR-016)

Leer `css/reset.css` regla por regla:

- Fuera del bloque `@media (prefers-reduced-motion: reduce)`: **ningún** selector con
  `.clase`, `#id`, `[attr]`, combinadores que sumen especificidad, ni `!important`.
  Todo `:where(...)` o un único tipo de elemento.
- El bloque `@media` puede usar `*, *::before, *::after` + `!important` (única excepción).
- FR-018 — `reset.css` NO impone diseño:
  `rg -n '#[0-9a-fA-F]{3}|var\(--(color|font)|[0-9.]+rem' css/reset.css` → sin resultados.
  Valores permitidos: `inherit`, `currentColor`, `0`, `100%`, `1px`, `0.01ms`.

Prueba funcional (SC-006): agregar temporal en `layout.css`
`ul { list-style: square }` → deben verse los cuadraditos sin tocar `reset.css`. Repetir la
idea con `a { color: red }`, `button { background: lime }`, `img { border: 2px solid }`,
`ol { padding-left: 3rem }`. Quitar las pruebas.

**Pasa si**: las 5 reglas de prueba aplican sin `!important` ni subir especificidad.

---

## E4 — `prefers-reduced-motion` global (SC-007 · FR-016, FR-017, US2)

1. Activar "reducir movimiento" en el SO (Windows: Configuración → Accesibilidad → Efectos
   visuales → Efectos de animación = OFF).
2. Recargar cada una de las 9 páginas.
3. Abrir el menú CASE en cada una: el ícono **no** debe animarse (queda en su pose final),
   sin parpadeos. Navegar, pasar el mouse por los enlaces: los cambios de estado son
   instantáneos, nada se rompe ni desaparece.
4. Confirmar que el `@media` puntual de `global.css` §4b **ya no existe** (`rg -n
   "prefers-reduced-motion" css/` → solo aparece en `reset.css`).

**Pasa si**: ninguna de las 9 páginas muestra animación/transición CSS con la preferencia
activa, y todas siguen navegables y legibles.

---

## E5 — Texto largo sin desborde a 320 px (SC-008 · FR-015, US3)

1. En `mundos.html` (o cualquiera), agregar temporalmente en un `<p>` y en un `<h2>` una
   palabra larga artificial: `Supercalifragilisticoexpialidocious-dilatacion-temporal-gargantua`.
2. Ancho del viewport a **320 px**.
3. La palabra debe **cortarse**; **no** debe aparecer scroll horizontal en la página.
4. Quitar la palabra de prueba.

**Pasa si**: sin scroll horizontal en el `<p>` ni en el `<h2>` a 320 px.

---

## E6 — Tests JS en verde (SC-009 · FR-021)

```
node --test tests/*.test.js
```

**Pasa si**: 26/26. (La feature es solo CSS + `<link>`; no debería tocar nada de lógica.)

---

## Checklist de cierre

- [ ] E1 estructura de 4 hojas + `global.css` borrado + sin `@import`
- [ ] E2 cero regresión visual en las 9 páginas × 2 anchos
- [ ] E3 especificidad de `reset.css` ≤ (0,0,1,0) salvo `prefers-reduced-motion`
- [ ] E4 `prefers-reduced-motion` global funciona; bloque puntual eliminado
- [ ] E5 sin desborde a 320 px con palabra larga
- [ ] E6 `node --test` 26/26
