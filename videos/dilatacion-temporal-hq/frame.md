---
version: alpha
name: Cabina Ranger — Frame v2 (video / frame layer)
description: >
  Frame companion tomado literalmente de interstellar/DESIGN.md — la "capa de contenido"
  del sitio (nunca la capa cockpit/teal). Fondo azul-noche profundo, un unico acento
  saturado (naranja Gargantua), texto crema (nunca blanco puro), recortes diagonales
  angulares, sin nada redondeado-blando. Los dos niveles de rigor cientifico se
  distinguen por texto + estilo de borde (solido vs punteado), nunca solo por color —
  regla dura de accesibilidad del proyecto (Principio VI). v2: suma diagramas propios
  (relojes, barras de comparacion, orbita punteada) en vez de solo tipografia.
unit: the frame — 1920×1080 primary (16:9, unico ratio de este spike)
principle: atoms are sacred · composition is free · numbers come from the script

colors:
  bg: "#0a0e1a"
  surface: "rgba(20,28,49,0.88)"
  metal: "#12161a"
  bezel: "#3d454c"
  ink: "#efe7d6"
  ink-soft: "#a8a294"
  accent: "#e8803b"

borders:
  hairline: "1px solid ink@12%"
  bezel: "1px solid {colors.bezel}"
  rigor-real: "3px solid ink@55% (etiqueta '✓ Ciencia real')"
  rigor-plausible: "3px dashed ink@40% (etiqueta '~ Especulacion plausible')"

typography:
  kicker:      { fontFamily: "Share Tech Mono", cqw: 0.85, weight: 400, tracking: "0.16em", upper: true }
  body:        { fontFamily: "Exo 2", cqw: 1.35, weight: 400, lineHeight: 1.5 }
  rigor-tag:   { fontFamily: "Exo 2", cqw: 0.85, weight: 500 }
  headline:    { fontFamily: "Orbitron", cqw: 3.6, weight: 800, tracking: "0.03em", upper: true, lineHeight: 1.15 }
  display:     { fontFamily: "Orbitron", cqw: 5.5, weight: 800, tracking: "0.02em", upper: true, lineHeight: 1.05 }
  number-hero: { fontFamily: "Orbitron", cqw: 8.5, weight: 900, lineHeight: 0.95 }
  number-unit: { fontFamily: "Exo 2", cqw: 1.6, weight: 500 }
  bar-label:   { fontFamily: "Exo 2", cqw: 1.1, weight: 500 }

spacing:
  slide-pad: "8.3cqw"   # ~160px @1920, igual al padding de .scene-content del sitio
  gap-md: "1.25cqw"
  radius-ficha: "0.25rem"
  recorte-tecla: "polygon(7px 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%, 0 7px)"

components:
  ficha-concepto:
    backgroundColor: "{colors.surface}"
    border: "1px solid ink@12%"
    rounded: "{spacing.radius-ficha}"
    description: "Superficie de contenido informativa (identica a .ficha-personaje / .concepto figure del sitio) — nunca oscurecida, nunca clip-path angular."
  etiqueta-rigor:
    backgroundColor: "{colors.surface}"
    border: "1px solid ink@22%, border-left {borders.rigor-real} o {borders.rigor-plausible}"
    rounded: "999px (pill)"
    typography: "{typography.rigor-tag}"
    description: "Chip inline. El texto SIEMPRE dice el nivel ('✓ Ciencia real' / '~ Especulacion plausible'); el borde-izquierdo (solido grueso vs punteado) refuerza, nunca reemplaza al texto."
  numero-hero:
    typography: "{typography.number-hero} figura + {typography.number-unit} unidad"
    accentRule: "el UNICO lugar donde el acento naranja puede tenir el numero (licencia narrativa / dato de maxima jerarquia); de lo contrario el numero va en ink crema"
    description: "Ej: '1 hora = 7 anios', 'factor ~60.000', '23 anios'."
  diagrama-relojes:
    description: "Dos circulos SVG (esfera de reloj) con una manecilla cada uno, a los lados de una masa oscura central con glow del acento. El reloj cercano gira LENTO, el lejano gira RAPIDO (misma unidad de tiempo real) — la diferencia de velocidad angular ES el argumento visual del concepto. Trazo `{borders.hairline}`, manecilla en `{colors.ink}`."
  barra-comparacion:
    description: "Dos barras horizontales con label + valor. La barra crece (scaleX 0->1, transform-origin left) desde un trazo `{borders.hairline}` vacio hasta su longitud final. Barra 'corta' = horas (crece rapido, ~0.4s); barra 'larga' = anios (crece lento y dramatico, ~1.2s). Relleno en `{colors.ink}` al 70% de opacidad, nunca el acento (no es el foco de maxima jerarquia)."
  orbita-punteada:
    description: "Elipse SVG con `stroke-dasharray` (trazo punteado) alrededor de una silueta oscura central (agujero negro simplificado, sin disco de acrecion — eso ya se uso en gargantua-title). El trazo se DIBUJA con `stroke-dashoffset` animado; un punto (el planeta) recorre la elipse en loop lento. El punteado ecoa deliberadamente `{borders.rigor-plausible}` — mismo lenguaje visual para 'especulacion'."
---

# Cabina Ranger — Frame v2 (video / frame layer)

## Overview

Fondo `{colors.bg}` siempre. Contenido sobre `{colors.surface}` (fichas translucidas) cuando
necesita agruparse; nunca un segundo color saturado. **Naranja `{colors.accent}` es el UNICO
acento con color pleno** — se raciona a un momento por frame (el numero hero, o una palabra de
enfasis). Todo lo demas vive en la escala ink/ink-soft/metal/bezel. Nunca blanco puro (`#fff`)
como color final. **Diferencia con v1**: cada escena de concepto/dato lleva un diagrama SVG
propio (reloj, barra, orbita) — el texto solo no alcanza para "calidad", el diagrama es el
argumento visual.

## Frame Craft Bar

- **Squint**: domina un solo foco por frame — el diagrama, o el numero hero, o el titular.
  El texto de apoyo nunca compite en peso visual con el foco.
- **Trinity**: fondo `{colors.bg}` + texto `{colors.ink}` + naranja `{colors.accent}` una sola vez
  por frame. Sin grises frios, sin blanco puro.
- **Rigor**: todo hecho mostrado en pantalla lleva su etiqueta de rigor (`etiqueta-rigor`) visible
  el tiempo suficiente para leerse (>= 2s a full alpha), y su estilo de borde debe hacer eco en
  el diagrama de la misma escena cuando sea posible (ver `orbita-punteada`).

**Safe area**: `slide-pad` ~8.3cqw en los cuatro bordes. **Container law**: todo tamaño relativo
al frame usa `cqw`/`cqh`, nunca `vw`. **No front-loading**: cada escena revela sus piezas
distribuidas a lo largo de toda su duracion (kicker → diagrama → texto → etiqueta), nunca todo
de una vez al `t=0`.

## Colors

`{colors.bg}` es el piso siempre. `{colors.surface}` agrupa contenido sin jamás oscurecerse ni
ganar borde grueso. `{colors.ink}` es la voz; `{colors.ink-soft}` para meta/atenuado. `{colors.accent}`
es la única voltage — número hero o UNA palabra de énfasis, nunca en diagramas de apoyo (los
diagramas van en la escala ink/ink-soft, nunca acento — el acento se reserva para el dato, no
para la ilustración).

## Typography

Orbitron (800/900, uppercase) para titulares y números hero. Exo 2 (400/500) para cuerpo,
etiqueta de rigor y labels de diagrama. Share Tech Mono solo para el kicker superior.

## Frame Treatments

> Recipe: ground · composes · focal · diagrama · accent · rigor tag · density.

### 1 · Apertura (kicker + titular palabra por palabra)

**Ground** `{colors.bg}`. **Composes** kicker mono, `display` Orbitron con reveal por palabra.
**Focal** la pregunta gancho. **Accent** ninguno. **Density** libre, mucho aire.

### 2 · Concepto (diagrama de relojes)

**Ground** `{colors.bg}`. **Composes** `diagrama-relojes`, `body` Exo 2, `etiqueta-rigor`.
**Focal** los dos relojes girando a ritmos distintos — el hecho se VE, no solo se lee.
**Density** media.

### 3 · Numero de impacto (stat + count-up)

**Ground** `{colors.bg}`. **Composes** `numero-hero`, stat secundario con count-up + barra de
progreso, `body` de contexto, `etiqueta-rigor`. **Focal** "1 hora = 7 años" + "× 60.000".
**Accent** el numero puede llevar el naranja. **Density** libre, el numero domina.

### 4 · Comparación (barras)

**Ground** `{colors.bg}`. **Composes** `barra-comparacion` (par), `body`, `etiqueta-rigor`.
**Focal** la disparidad de longitud entre las dos barras. **Density** media.

### 5 · Límite (órbita punteada)

**Ground** `{colors.bg}`. **Composes** `orbita-punteada`, `body`, `etiqueta-rigor` (punteada,
coherente con el trazo). **Focal** el planeta orbitando pegado al agujero negro. **Density** media.

### 6 · Cierre

**Ground** `{colors.bg}`. **Composes** `headline` corto (reveal por palabra), fuente citada.
**Accent** una palabra en naranja. **Density** minima, centrado.

## Composition Rules

### Do

- Fondo `{colors.bg}` en todo frame.
- Racionar el naranja a UN momento por frame; los diagramas van en ink/ink-soft, nunca acento.
- Toda etiqueta de rigor lleva el texto completo, nunca solo el icono ni solo el color de borde.
- El estilo de trazo (sólido/punteado) de un diagrama puede reforzar el nivel de rigor de su
  escena cuando aplica (ver `orbita-punteada`).
- Orbitron uppercase para titulares/números; Exo 2 para todo lo demás.

### Don't

- Blanco puro, segundo color saturado, o teal.
- Etiqueta de rigor que dependa solo de color para distinguirse.
- Diagramas en color acento (compiten con el número/dato real).
- Revelar todas las piezas de una escena en el mismo instante (front-loading).

## Numerals & Claims (hard rule)

Los únicos números permitidos son los que aparecen literalmente en
`capture/extracted/visible-text.txt` (1 hora, ~7 años, factor ~60.000, 23 años) — fuente:
Thorne, K. *The Science of Interstellar* (2014).

## Pre-Render Self-Audit

- **Squint**: un foco domina por frame (diagrama o número).
- **Trinity**: bg + ink + UN naranja; sin blanco puro, sin teal, sin segundo saturado.
- **Rigor**: cada hecho mostrado tiene su etiqueta completa y legible.
- **Diagramas**: cada escena de concepto/dato tiene su propio diagrama SVG, no solo texto.
- **No front-loading**: las piezas de cada escena se revelan distribuidas en el tiempo.
- **Fabricación**: todo número/afirmación trazable a `visible-text.txt`.

## Known Gaps

- Motion vive en las reglas de `hyperframes-animation`, no acá.
- Sin fuentes locales staged: Orbitron/Exo 2/Share Tech Mono se resuelven vía Google Fonts en
  el render — spike de evaluación, no asset final del sitio.
