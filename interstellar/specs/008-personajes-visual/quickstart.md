# Quickstart: validar el rediseño de Personajes

Guía de validación manual end-to-end. Sitio estático sin build — abrir directo con un server
estático local (mismo criterio que se usó para los spikes de esta feature).

## Prerrequisitos

- Rama `sec/personajes` (ya activa).
- Un server estático corriendo desde la raíz de `interstellar/` (ej.
  `python -m http.server 8080`) — no abrir con `file://` directo, algunos `fetch`/módulos ES
  pueden fallar por CORS.
- Fotogramas curados ya presentes en `assets/img/personajes-{cooper,murph}-{escena,visor}-NN.jpg`
  (ver `data-model.md` para la convención de nombre) — sin esto, US3/US4 no tienen nada que
  mostrar para validar.

## Escenario 0 — Portada de tripulación en mosaico (User Story 1)

1. Abrir `http://localhost:8080/personajes.html` (sin ancla).
2. **Esperado**: portada a pantalla casi completa con los 6 retratos (nombre + rol), sin
   depender de qué personajes ya tengan hero/galería/visor curados.
3. Hacer clic en cada uno de los 6 retratos — **esperado**: navega a la sección correspondiente
   (`#cooper`, `#murph`, `#brand`, `#profesor-brand`, `#mann`, `#tars-case`).
4. En consola: `document.querySelectorAll('main h1').length` → debe dar `1`.
5. Achicar la ventana a 320px — la grilla de 6 se reacomoda sin scroll horizontal.

## Escenario 1 — Hero full-bleed (User Story 2)

1. Abrir `http://localhost:8080/personajes.html#cooper`.
2. **Esperado**: imagen de fondo casi a pantalla completa, degradado inferior, ficha (rol +
   nombre + bajada) legible sobre el degradado.
3. Repetir con `#murph` y con uno de los 4 personajes en `patron: degradado` (ej. `#mann`) —
   **este último NO debe tener hero full-bleed**, debe verse igual que hoy (retrato rectangular
   + ficha, contrato 003).
4. Achicar la ventana a 320px de ancho — sin scroll horizontal en ningún hero.

## Escenario 2 — Galería de escenas sincronizada (User Story 3)

1. En `#cooper`, scrollear lentamente dentro de la sección de galería.
2. **Esperado**: la tira de fotogramas inferior se desplaza horizontalmente atada al scroll; el
   panel de texto superior cambia (corte duro, sin fundido) exactamente cuando un nuevo
   fotograma queda centrado/resaltado.
3. Abrir DevTools → Rendering → forzar `prefers-reduced-motion: reduce`. Recargar.
   **Esperado**: texto y tira en flujo normal (sin riel alto, sin sticky), tira scrolleable con
   el mouse/rueda a mano, primera escena visible por defecto.
4. Simular fallo de red del script de GSAP (DevTools → Network → bloquear
   `js/vendor/gsap@3.13.0/*`). Recargar. **Esperado**: mismo comportamiento de flujo normal que
   el punto anterior — la página sigue siendo legible.

## Escenario 3 — Visor Nav-Ranger (User Story 4)

1. En `#cooper`, scrollear hasta el bloque de cierre ("Su papel en la historia" + visor).
2. **Esperado**: el visor cicla sus fotogramas en loop, a intervalo constante (revisar
   `data-intervalo` en el HTML), sin fundido entre frames.
3. Scrollear el visor fuera de la pantalla y volver a verificar en DevTools (Performance o un
   `console.log` temporal) que el `setInterval` se pausó mientras estaba fuera de vista.
4. Con `prefers-reduced-motion: reduce` activo, recargar `#cooper` — **esperado**: el visor
   muestra solo su primer fotograma, fijo.
5. Ir a `#mann` (personaje sin material curado) — **esperado**: no hay visor ni hueco vacío en
   su lugar.

## Escenario 4 — Degradado de los 4 personajes sin material (User Story 5 / FR-009)

1. Visitar `#brand`, `#profesor-brand`, `#mann`, `#tars-case`.
2. **Esperado**: las 4 fichas se ven exactamente como hoy (antes de esta feature) — retrato
   rectangular informativo, sin hero full-bleed, sin galería, sin visor, sin huecos ni errores.

## Escenario 5 — Seguridad del volcado de fotogramas (FR-010)

1. Correr `git status` en la raíz del repo.
2. **Esperado**: `assets/cap-that.com_interstellar(2014)/` NO aparece como archivo para
   commitear (debe estar como ignorado, o directamente no listado).

## Checklist de cierre (mapea a Success Criteria de spec.md)

- [ ] SC-001 — Cooper y Murph con patrón completo, sin huecos ni errores de consola.
- [ ] SC-002 — Los 4 restantes, patrón degradado completo, sin ficha rota.
- [ ] SC-003 — Sin scroll horizontal a 320/768/1280px en ninguna ficha.
- [ ] SC-004 — `prefers-reduced-motion` respetado en galería y visor.
- [ ] SC-005 — Galería legible con GSAP bloqueado.
- [ ] SC-006 — Recorrido completo en Chrome, Edge y Firefox sin errores/404 en consola.
- [ ] SC-007 — `git status` limpio respecto al volcado de fotogramas.
- [ ] SC-008 — Portada en mosaico con los 6 enlaces funcionando y un único `<h1>` en la página.
