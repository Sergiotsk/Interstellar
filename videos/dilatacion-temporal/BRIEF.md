---
workflow: faceless-explainer
flow: automation
storyboard: no
message: "Una hora en Miller son siete años afuera: es relatividad general pura, no ciencia ficción"
destination: sitio-interstellar-spike
aspect: 1920x1080
language: es
length: 75s
angle: concept
---

## Intent

Mini-explicador sobre dilatación temporal gravitacional, con foco en el planeta de
Miller (Interstellar), para evaluar si HyperFrames sirve como pipeline de video
para la sección "La Ciencia" del fan site. Tono: divulgación seria pero accesible,
sin solemnidad. Silencioso (sin narración ni música) — el video se apoya en
tipografía y datos en pantalla.

## Assets

Ninguno (visuales inventados, faceless).

## Customizations

- Los dos niveles de rigor científico (✓ Ciencia real / ~ Especulación plausible)
  deben quedar visualmente distinguibles en cada hecho, con la MISMA convención
  del sitio: la distinción se lee en el texto/etiqueta, nunca solo por color
  (Principio VI y accesibilidad de la constitución del proyecto).
- Paleta y tipografía tomadas literalmente de interstellar/DESIGN.md: fondo
  `#0a0e1a`, acento único `#e8803b` (Gargantúa), texto crema `#efe7d6`, texto
  atenuado `#a8a294`; Orbitron para títulos, Exo 2 para cuerpo.

## Notes

- Fuente única de los hechos: interstellar/ciencia.html#dilatacion-temporal
  (texto ya verificado contra Thorne, K. "The Science of Interstellar", 2014).
  No se inventa ciencia nueva, no se agregan datos que no estén en esa sección.
- Spike de evaluación en rama spike/hframes, mismo repo que videos/gargantua-title.
- Sin sesión HeyGen / sin TTS local instalado → silencioso por decisión propia,
  no por fallback forzado.
