---
format: 1920x1080
duration: 71.8s
message: "Una hora en Miller son siete años afuera: es relatividad general pura, no ciencia ficción"
arc: Pregunta → Concepto (diagrama de relojes) → Número de impacto (stat + count-up) → Consecuencia (comparación de barras) → Límite honesto (diagrama de órbita punteada) → Cierre
audience: visitantes del fan site que ya vieron Interstellar
mode: autonomous
voice: ef_dora (Kokoro, local, español)
---

## Frame 1 — Apertura

- status: outline
- src: compositions/frames/01-apertura.html
- duration: 3.4s
- transition_in: cut
- voiceover: "¿Por qué el tiempo no corre igual?"
- scene: Kicker mono + pregunta con reveal palabra por palabra sobre campo estelar

Scene 1 (0.0–0.5s): vacío, solo campo estelar estático.
Scene 2 (0.2–0.8s): kicker "LA CIENCIA · DILATACIÓN TEMPORAL" entra (fromTo autoAlpha+y).
Scene 3 (0.5–2.4s): titular entra palabra por palabra (stagger ~0.12s entre palabras, motion: word_reveal) sincronizado con el inicio de la narración.
Scene 4 (2.4–3.4s): hold — la pregunta queda leída antes del corte.

## Frame 2 — El concepto

- status: outline
- src: compositions/frames/02-concepto.html
- duration: 10.9s
- transition_in: crossfade
- voiceover: "Cuanto más fuerte es la gravedad en un lugar, más lento pasa el tiempo ahí. Los relojes atómicos la miden; el GPS la corrige para no acumular errores de kilómetros."
- scene: Diagrama de dos relojes (uno cerca de una masa gravitatoria, uno lejos) girando a ritmos distintos + hecho + etiqueta de rigor

Scene 1 (0.0–0.4s): vacío.
Scene 2 (0.4–1.2s): diagrama entra — dos relojes SVG (manecillas en 12) a los lados de una masa oscura central con glow sutil.
Scene 3 (1.2–10.5s): las manecillas giran continuamente — el reloj cercano a la masa gira lento (motion: rotate lento), el lejano gira rápido (rotate normal) — la diferencia de velocidad ES el argumento visual.
Scene 4 (1.0–1.7s): cuerpo de texto entra debajo del diagrama.
Scene 5 (9.9–10.5s): etiqueta "✓ Ciencia real" entra (borde sólido).
Scene 6 (10.5–10.9s): hold antes del corte.

## Frame 3 — El número: Miller

- status: outline
- src: compositions/frames/03-miller.html
- duration: 16.9s
- transition_in: crossfade
- voiceover: "En el planeta de Miller, una hora en la superficie equivale a unos siete años para quien espera lejos. Un factor de alrededor de sesenta mil, alcanzable muy cerca del horizonte de un agujero negro que gira muy rápido. Thorne hizo las cuentas con Gargantúa y los números cierran."
- scene: Stat card estilo count-up (inspirado en mk-progress-stat del registry) — "× 60.000" con count-up + barra de progreso, más "1 hora = 7 años"

Scene 1 (0.0–0.4s): vacío.
Scene 2 (0.4–0.9s): kicker "EN EL PLANETA DE MILLER" entra.
Scene 3 (0.9–1.7s): "1 hora = 7 años" entra con scale pop.
Scene 4 (2.5–4.5s): stat card entra: "× 60.000" hace count-up desde 0 (proxy onUpdate, seek-safe) mientras una barra de progreso se llena en paralelo — factor de dilatación.
Scene 5 (5.0–5.7s): contexto ("alcanzable muy cerca del horizonte...") entra debajo.
Scene 6 (15.9–16.5s): etiqueta "✓ Ciencia real" entra.
Scene 7 (16.5–16.9s): hold antes del corte.

## Frame 4 — La consecuencia

- status: outline
- src: compositions/frames/04-consecuencia.html
- duration: 18.9s
- transition_in: crossfade
- voiceover: "La nave Endurance, en una órbita más alta y lejana, casi no sufre esa dilatación. Por eso Romilly acumula veintitrés años esperando en la nave. Y por eso una demora de horas en Miller le cuesta décadas a Cooper, que vuelve para encontrar a sus hijos crecidos. El mecanismo es relatividad general pura, sin trucos."
- scene: Comparación de dos barras horizontales — "Miller: unas horas" (barra minúscula) vs "Endurance: 23 años" (barra larga) — la disparidad ES la escena

Scene 1 (0.0–0.4s): vacío.
Scene 2 (0.4–0.9s): kicker "LA CONSECUENCIA" entra.
Scene 3 (0.9–1.5s): el par de barras (ejes vacíos, labels) entra.
Scene 4 (1.5–1.9s): barra "Miller: unas horas" crece (scaleX 0→1, rápido, ~0.4s — la brevedad ES el punto).
Scene 5 (2.2–3.4s): barra "Endurance: 23 años" crece (scaleX 0→1, más lento y dramático, ~1.2s).
Scene 6 (4.0–4.7s): cuerpo de texto (Cooper/hijos crecidos) entra debajo.
Scene 7 (17.9–18.5s): etiqueta "✓ Ciencia real" entra.
Scene 8 (18.5–18.9s): hold antes del corte.

## Frame 5 — El límite honesto

- status: outline
- src: compositions/frames/05-limite.html
- duration: 14.0s
- transition_in: crossfade
- voiceover: "Lo que la película fuerza un poco: que un planeta con océano y condiciones para la vida orbite de forma estable tan cerca de Gargantúa. Las mareas y la energía en esa zona serían brutales. Thorne lo admite como un caso límite."
- scene: Diagrama de órbita punteada (planeta muy cerca de un agujero negro) — el trazo PUNTEADO ecoa visualmente la etiqueta "~ Especulación plausible"

Scene 1 (0.0–0.4s): vacío.
Scene 2 (0.4–0.9s): kicker "EL LÍMITE HONESTO" entra.
Scene 3 (0.9–2.0s): la órbita se dibuja (stroke-dashoffset, trazo punteado — mismo lenguaje visual que el borde punteado de la etiqueta de especulación) alrededor de una silueta oscura central; el planeta aparece al final del trazo.
Scene 4 (2.0–13.5s): el planeta orbita continuamente sobre el trazo punteado ya dibujado.
Scene 5 (2.5–3.2s): cuerpo de texto entra.
Scene 6 (13.1–13.7s): etiqueta "~ Especulación plausible" entra (borde punteado — coherente con el trazo de la órbita).
Scene 7 (13.7–14.0s): hold antes del corte.

## Frame 6 — Cierre

- status: outline
- src: compositions/frames/06-cierre.html
- duration: 7.7s
- transition_in: crossfade
- voiceover: "Una hora en Miller son siete años afuera. Fuente: Thorne, Kip. The Science of Interstellar, dos mil catorce."
- scene: Titular de cierre + fuente citada — frame final, sin salida

Scene 1 (0.0–0.4s): vacío.
Scene 2 (0.4–1.1s): titular entra palabra por palabra.
Scene 3 (1.6–2.2s): fuente citada entra debajo.
Scene 4 (2.2–7.7s): hold final — se sostiene el cierre (frame final, sin exit tween).
