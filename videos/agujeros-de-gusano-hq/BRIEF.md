---
workflow: faceless-explainer
flow: automation
storyboard: no
message: "Un atajo real en las ecuaciones de Einstein — pero nunca vimos uno, ni siquiera de forma indirecta"
destination: sitio-interstellar-spike
aspect: 1920x1080
language: es
length: ~72s
angle: concept
---

## Intent

Explicador de agujeros de gusano para la sección "Agujeros de gusano" de
`interstellar/ciencia.html`, siguiendo el mismo patrón de calidad que
`videos/dilatacion-temporal-hq/`: cada escena es una sub-composición HTML separada con su
propio diagrama animado (nunca texto plano con fade-in), las duraciones salen de la
narración real (TTS primero, visuales después), paleta y tipografía de
`interstellar/DESIGN.md`.

## Assets

Ninguno (visuales inventados, faceless). Narración nueva vía Kokoro, voz `ef_dora` (misma
voz que `videos/dilatacion-temporal-hq/`).

## Customizations

- Cada escena tiene un diagrama propio: túnel/atajo entre dos puntos del espacio-tiempo
  (concepto), morph de embudo incorrecto → esfera correcta (representación real en la
  película), túnel que se cierra vs. materia exótica que lo apuntala (problema de
  mantenerlo abierto), comparación agujero negro fotografiado (EHT) vs agujero de gusano
  nunca detectado (checkmark vs. X), atajo hacia Saturno que habilita la misión, y un
  ícono de "diseño intencional" para la capa de ficción de seres de dimensiones
  superiores.
- Los tres niveles de rigor científico (✓ ciencia real / ~ especulación plausible /
  ✎ licencia narrativa) se distinguen por texto + estilo de borde (nunca solo color),
  igual que en el sitio real.
- Paleta y tipografía de interstellar/DESIGN.md, igual que en dilatacion-temporal-hq.

## Notes

- Fuente única de los hechos: `interstellar/ciencia.html#agujeros-de-gusano` tal como está
  en el momento de producir este video. No se inventa ciencia nueva.
- Repetición de patrón ya usado (BRIEF.md conocido, flow: automation) — sin interrogatorio
  de intención.
- Spike de evaluación en rama spike/hframes.
