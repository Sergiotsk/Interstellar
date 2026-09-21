---
workflow: faceless-explainer
flow: automation
storyboard: no
message: "Una hora en Miller son siete años afuera: es relatividad general pura, no ciencia ficción"
destination: sitio-interstellar-spike
aspect: 1920x1080
language: es
length: 72s
angle: concept
---

## Intent

Segunda pasada del explicador de dilatación temporal gravitacional (planeta de Miller),
esta vez siguiendo el flujo recomendado de `/faceless-explainer` con más cuidado: se
busca en el catálogo de HyperFrames antes de inventar visuales, cada escena es una
sub-composición separada (no todo en un único `index.html`), y las duraciones salen de
la narración real (TTS primero, visuales después) — al revés de como se hizo la v1.

## Assets

Ninguno (visuales inventados, faceless). Narración reutilizada de
`videos/dilatacion-temporal/narration/` (Kokoro, voz `ef_dora`, ya verificada).

## Customizations

- Cada escena tiene un diagrama propio distinto (relojes a distinta velocidad, stat
  count-up, comparación de barras, órbita punteada) en vez de solo texto con fade-in —
  objetivo explícito: mejorar la calidad visual plana de la v1.
- El trazo PUNTEADO de la escena 5 (órbita) ecoa deliberadamente el borde punteado de
  la etiqueta "~ Especulación plausible" — refuerzo visual del mismo criterio de rigor.
- Los dos niveles de rigor científico siguen distinguiéndose por texto + estilo de
  borde (nunca solo color), igual que en el sitio real.
- Paleta y tipografía de interstellar/DESIGN.md, igual que en la v1.

## Notes

- Fuente única de los hechos: interstellar/ciencia.html#dilatacion-temporal. No se
  inventa ciencia nueva.
- v1 (`videos/dilatacion-temporal/`) queda como referencia de comparación, no se borra.
- Spike de evaluación en rama spike/hframes.
