---
format: 1920x1080
duration: ~90s
message: "No hay un ahora único para todo el universo: la gravedad decide a qué velocidad pasa el tiempo"
arc: Pregunta → Concepto (curvatura + relojes sin ahora único) → Consecuencias (árbol) → Número de impacto (76 vs 1) → Límite/licencia (Tesseract) → Cierre
audience: visitantes del fan site que ya vieron Interstellar
mode: autonomous
music: none
---

## Frame 1 — Apertura

- status: animated
- src: compositions/frames/01-apertura.html
- duration: 2.925688s (voz ElevenLabs; ~3.43s con solape de crossfade)
- transition_in: cut
- voiceover: "¿Existe un ahora único para todo el universo?"
- scene: Kicker mono + pregunta con reveal palabra por palabra sobre campo estelar

### Video direction

Scene 1 (0.0–0.4s): vacío, campo estelar estático (fondo `{colors.bg}` plano, sin campo real
de estrellas — spike sin asset de fondo, ground plano).
Scene 2 (0.2–0.8s): kicker "LA CIENCIA · RELATIVIDAD" entra (fromTo autoAlpha+y).
Scene 3 (0.5–2.0s): titular "¿Existe un ahora único para todo el universo?" entra palabra por
palabra (stagger ~0.11s, motion: word_reveal), sincronizado con la narración.
Scene 4 (2.0–2.6s): hold — la pregunta queda leída antes del corte.

## Frame 2 — El concepto

- status: animated
- src: compositions/frames/02-concepto.html
- duration: 20.741188s (voz ElevenLabs; ~21.24s con solape de crossfade)
- transition_in: crossfade
- voiceover: "La relatividad general de Einstein no describe la gravedad como una fuerza. La masa curva el espacio y el tiempo, y caer es simplemente seguir esa curvatura. De ahí sale una idea incómoda: no existe un ahora único. Dos relojes idénticos, uno cerca de una masa grande y otro lejos, marcan un ritmo distinto."
- scene: Malla de curvatura del espacio-tiempo deformándose alrededor de una masa central, seguida de tres relojes girando a ritmos desincronizados

### Video direction

Scene 1 (0.0–0.4s): vacío.
Scene 2 (0.4–1.1s): kicker "RELATIVIDAD GENERAL · 1915" entra.
Scene 3 (1.1–2.6s): `diagrama-curvatura` entra — malla SVG (grid de líneas ink@25%) se deforma
hacia una masa central oscura con glow sutil del acento (path/transform animado, no fuerza
tirando).
Scene 4 (1.4–2.2s): cuerpo de texto (primera oración, gravedad = curvatura) entra debajo.
Scene 5 (5.5–6.3s): la malla cede lugar (crossfade suave, misma escena) a
`diagrama-relojes-desync`: tres relojes SVG en distintas posiciones, cada uno con manecilla
girando a velocidad angular distinta en el mismo lapso real — la falta de sincronía ES el
argumento visual.
Scene 6 (6.3–7.2s): cuerpo de texto (segunda oración, "no existe un ahora único") entra debajo,
reemplazando el texto previo.
Scene 7 (14.0–14.6s): etiqueta "✓ Ciencia real" entra (borde sólido).
Scene 8 (14.6–15.0s): hold antes del corte.

## Frame 3 — Las consecuencias

- status: animated
- src: compositions/frames/03-consecuencias.html
- duration: 18.520813s (voz ElevenLabs; ~19.02s con solape de crossfade)
- transition_in: crossfade
- voiceover: "Los otros tres conceptos de esta sección son consecuencias del mismo marco. Un agujero negro es espacio-tiempo curvado al extremo. La dilatación del planeta de Miller es ese tiempo distinto llevado al límite. Y un agujero de gusano es otra solución posible de las mismas ecuaciones."
- scene: Árbol de consecuencias — un nodo central (relatividad general) con tres ramas hacia agujero negro / dilatación temporal / agujero de gusano

### Video direction

Scene 1 (0.0–0.4s): vacío.
Scene 2 (0.4–0.9s): kicker "LAS CONSECUENCIAS" entra.
Scene 3 (0.9–1.5s): nodo central "Relatividad general" (ficha pequeña) entra con scale pop.
Scene 4 (1.8–3.6s): tres ramas SVG (stroke-dashoffset) se dibujan en secuencia (~0.5s cada una,
stagger 0.3s) desde el nodo central hacia tres posiciones.
Scene 5 (2.3–4.1s): los tres nodos hijos ("Agujero negro", "Dilatación temporal", "Agujero de
gusano") aparecen al final de cada rama, en el mismo orden que se dibujan.
Scene 6 (4.5–5.3s): cuerpo de texto entra debajo.
Scene 7 (12.6–13.2s): etiqueta "✓ Ciencia real" entra.
Scene 8 (13.2–13.5s): hold antes del corte.

## Frame 4 — El número de impacto

- status: animated
- src: compositions/frames/04-numero.html
- duration: 14.158313s (voz ElevenLabs; ~14.66s con solape de crossfade)
- transition_in: crossfade
- voiceover: "Sumá los tres saltos de tiempo de la misión: dos años de viaje, veintitrés años en Miller, cincuenta y un años más en Gargantúa. Setenta y seis años pasan en la Tierra mientras Cooper envejece apenas una década."
- scene: Stat hero "76 años" (count-up, acento) vs "1 década" (ink) con barra de proporción visual

### Video direction

Scene 1 (0.0–0.4s): vacío.
Scene 2 (0.4–0.9s): kicker "EL NÚMERO" entra.
Scene 3 (0.9–1.5s): desglose "2 + 23 + 51 años" entra (los tres sumandos, chico, arriba).
Scene 4 (1.7–4.2s): `numero-hero` "76 años" hace count-up desde 0 (proxy onUpdate, seek-safe) en
acento, mientras una barra de proporción se llena en paralelo.
Scene 5 (4.5–5.3s): "1 década" (Cooper) entra al lado en ink, con su propia barra corta —
la disparidad de longitud ES la escena (mismo lenguaje que `barra-comparacion` de
dilatacion-temporal-hq).
Scene 6 (5.6–6.4s): cuerpo de texto entra debajo.
Scene 7 (12.2–12.7s): etiqueta "✓ Ciencia real" entra.
Scene 8 (12.7–13.0s): hold antes del corte.

## Frame 5 — Tesseract: la licencia

- status: animated
- src: compositions/frames/05-tesseract.html
- duration: 16.3265s (voz ElevenLabs; ~16.83s con solape de crossfade)
- transition_in: crossfade
- voiceover: "El tramo final estira la relatividad hasta convertirla en otra cosa. El Tesseract presenta el tiempo como un pasillo que se puede recorrer, y la gravedad se filtra entre dimensiones para mover un reloj. Thorne señala esto como lo más especulativo de todo el guion."
- scene: Pasillo punteado (perspectiva) con un punto de luz recorriéndolo — el trazo PUNTEADO ecoa la etiqueta de licencia narrativa

### Video direction

Scene 1 (0.0–0.4s): vacío.
Scene 2 (0.4–0.9s): kicker "EL TESSERACT" entra.
Scene 3 (0.9–2.2s): `pasillo-tesseract` se dibuja — líneas de perspectiva convergentes con
stroke-dasharray (trazo punteado, mismo lenguaje que la etiqueta de licencia).
Scene 4 (2.2–11.5s): un punto de luz (acento, tenue) recorre el pasillo en loop lento
(motion continuo durante toda la escena).
Scene 5 (2.6–3.4s): cuerpo de texto entra debajo.
Scene 6 (10.9–11.5s): etiqueta "✎ Licencia narrativa" entra (borde punteado — coherente con
el trazo del pasillo).
Scene 7 (11.5–13.0s): hold antes del corte.

## Frame 6 — Cierre

- status: animated
- src: compositions/frames/06-cierre.html
- duration: 17.319125s (voz ElevenLabs; sin solape, hold final hasta el cierre del video)
- transition_in: crossfade
- voiceover: "La frase de Amelia Brand sobre el amor no es física: es la tesis de un personaje. Lo que sí es real: la gravedad decide a qué velocidad pasa el tiempo. Fuente: Thorne, Kip. The Science of Interstellar, dos mil catorce."
- scene: Titular de cierre + etiqueta de licencia (Amelia Brand) + fuente citada — frame final, sin salida

### Video direction

Scene 1 (0.0–0.4s): vacío.
Scene 2 (0.4–1.1s): cuerpo "El amor de Amelia Brand no es física: es la tesis de un
personaje." entra.
Scene 3 (1.3–1.9s): etiqueta "✎ Licencia narrativa" entra (borde punteado).
Scene 4 (3.5–4.6s): titular de cierre "LA GRAVEDAD DECIDE A QUÉ VELOCIDAD PASA EL TIEMPO"
entra palabra por palabra, una palabra ("GRAVEDAD") en acento.
Scene 5 (5.6–6.2s): fuente citada "Thorne, K. — The Science of Interstellar (2014)" entra
debajo.
Scene 6 (6.2–13.5s): hold final — se sostiene el cierre (frame final, sin exit tween).
