---
workflow: faceless-explainer
flow: automation
storyboard: no
message: "No hay un ahora único para todo el universo: la gravedad decide a qué velocidad pasa el tiempo"
destination: sitio-interstellar-spike
aspect: 1920x1080
language: es
length: ~72s
angle: concept
---

## Intent

Explicador de relatividad general para la sección "Relatividad" de `interstellar/ciencia.html`,
siguiendo el mismo patrón de calidad que `videos/dilatacion-temporal-hq/`: cada escena es una
sub-composición HTML separada con su propio diagrama animado (nunca texto plano con fade-in),
las duraciones salen de la narración real (TTS primero, visuales después), paleta y tipografía
de `interstellar/DESIGN.md`.

## Assets

Ninguno (visuales inventados, faceless). Narración nueva vía Kokoro, voz `ef_dora` (misma voz
que `videos/dilatacion-temporal-hq/`).

## Customizations

- Cada escena tiene un diagrama propio: curvatura del espacio-tiempo (malla deformada), relojes
  desincronizados sin "ahora" único, árbol de consecuencias (agujero negro / dilatación / agujero
  de gusano), cuenta 76 años vs 1 década (stat count-up + comparación de barras), Tesseract como
  pasillo del tiempo, frase de Amelia Brand.
- Los tres niveles de rigor científico (✓ ciencia real / ✎ licencia narrativa) se distinguen por
  texto + estilo de borde (nunca solo color), igual que en el sitio real.
- Paleta y tipografía de interstellar/DESIGN.md, igual que en dilatacion-temporal-hq.

## Notes

- Fuente única de los hechos: `interstellar/ciencia.html#relatividad`. No se inventa ciencia nueva.
- Repetición de patrón ya usado (BRIEF.md conocido, flow: automation) — sin interrogatorio de
  intención.
- Spike de evaluación en rama spike/hframes.
