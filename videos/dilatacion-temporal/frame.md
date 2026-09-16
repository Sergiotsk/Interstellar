---
version: alpha
name: Cabina Ranger — Frame (video / frame layer)
description: >
  Frame companion tomado literalmente de interstellar/DESIGN.md — la "capa de contenido"
  del sitio (nunca la capa cockpit/teal). Fondo azul-noche profundo, un unico acento
  saturado (naranja Gargantua), texto crema (nunca blanco puro), recortes diagonales
  angulares, sin nada redondeado-blando. Los dos niveles de rigor cientifico se
  distinguen por texto + estilo de borde (solido vs punteado), nunca solo por color —
  regla dura de accesibilidad del proyecto (Principio VI).
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
---

# Cabina Ranger — Frame (video / frame layer)

## Overview

Fondo `{colors.bg}` siempre. Contenido sobre `{colors.surface}` (fichas translucidas) cuando
necesita agruparse; nunca un segundo color saturado. **Naranja `{colors.accent}` es el UNICO
acento con color pleno** — se raciona a un momento por frame (el numero hero, o una palabra de
enfasis). Todo lo demas vive en la escala ink/ink-soft/metal/bezel. Nunca blanco puro (`#fff`)
como color final.

## Frame Craft Bar

- **Squint**: domina un solo foco por frame — o el titular Orbitron, o el numero hero, o la ficha
  de rigor. Nunca dos.
- **Trinity**: fondo `{colors.bg}` + texto `{colors.ink}` + naranja `{colors.accent}` una sola vez
  por frame. Sin grises frios, sin blanco puro.
- **Rigor**: todo hecho mostrado en pantalla lleva su etiqueta de rigor (`etiqueta-rigor`) visible
  el tiempo suficiente para leerse (>= 2s a full alpha).

**Safe area**: `slide-pad` ~8.3cqw en los cuatro bordes (mismo padding que `.scene-content` del
sitio real). **Container law**: todo tamaño relativo al frame usa `cqw`/`cqh`, nunca `vw`.

## Colors

`{colors.bg}` es el piso siempre. `{colors.surface}` agrupa contenido (fichas, chips) sin jamás
oscurecerse ni ganar borde grueso. `{colors.ink}` es la voz (texto principal); `{colors.ink-soft}`
para meta/atenuado. `{colors.accent}` es la única voltage — se usa en el número hero o en UNA
palabra de énfasis por frame, nunca en texto de cuerpo ni en más de un elemento simultáneo.
`{colors.metal}` / `{colors.bezel}` solo si aparece un motivo de "instrumento" (recorte
`recorte-tecla`) — decorativo, no estructural en este video.

## Typography

Orbitron (800/900, uppercase, tracking positivo) para titulares y el número hero — igual que
`--font-hero-titulo` del sitio. Exo 2 (400/500) para cuerpo y la etiqueta de rigor — igual que
`--font-texto`. Share Tech Mono solo para el kicker superior (referencia tipo "NAV · CIENCIA"),
igual que `--font-instrumento`. Nunca mezclar: un titular en Exo 2 o un cuerpo en Orbitron rompe
el registro.

## Frame Treatments

> Recipe: ground · composes · focal · accent · rigor tag (si aplica) · density.

### 1 · Apertura (kicker + titular)

**Ground** `{colors.bg}`. **Composes** kicker mono, `display` Orbitron. **Focal** 2-3 palabras que
plantean la pregunta ("¿Por que el tiempo no corre igual?"). **Accent** ninguno, o una palabra en
naranja. **Density** libre, mucho aire.

### 2 · Concepto (hecho + etiqueta de rigor)

**Ground** `{colors.bg}`. **Composes** `ficha-concepto` opcional, `body` Exo 2, `etiqueta-rigor`.
**Focal** un hecho (1-2 oraciones) con su chip de rigor visible desde que el hecho aparece.
**Accent** una palabra clave en naranja como mucho. **Density** media — el texto respira.

### 3 · Numero de impacto

**Ground** `{colors.bg}`. **Composes** `numero-hero`, `body` de contexto debajo, `etiqueta-rigor`.
**Focal** el numero (1 hora = 7 anios / factor 60.000 / 23 anios) en Orbitron, con su unidad en
Exo 2 mono-peso. **Accent** el numero puede llevar el naranja (regla `numero-hero.accentRule`).
**Density** libre, el numero domina el frame.

### 4 · Cierre

**Ground** `{colors.bg}`. **Composes** `headline` corto, mensaje central del video (`message` del
BRIEF). **Accent** una palabra en naranja. **Density** minima, centrado.

## Composition Rules

### Do

- Fondo `{colors.bg}` en todo frame; ninguna imagen/backdrop oscurecida artificialmente (no hay
  fotos en este video, es tipografico puro).
- Racionar el naranja a UN momento por frame.
- Toda etiqueta de rigor lleva el texto completo ("✓ Ciencia real" / "~ Especulacion plausible"),
  nunca solo el icono ni solo el color de borde.
- Orbitron uppercase para todo titular/numero; Exo 2 para todo cuerpo.

### Don't

- Blanco puro, segundo color saturado, o teal (reservado a la capa cockpit del sitio real — no
  existe en este video).
- Etiqueta de rigor que dependa solo de color para distinguirse.
- Mezclar tipografias fuera del rol asignado.

## Aspect-Ratio Behavior

| Treatment | 16:9 |
| --- | --- |
| Apertura | kicker arriba, titular centrado |
| Concepto | ficha + texto centrados, ancho maximo ~60cqw (columna de lectura) |
| Numero | numero centrado, contexto debajo |
| Cierre | centrado, minimo |

## Numerals & Claims (hard rule)

Los únicos números permitidos en este video son los que aparecen literalmente en
`capture/extracted/visible-text.txt` (1 hora, ~7 años, factor ~60.000, 23 años) — fuente:
Thorne, K. *The Science of Interstellar* (2014). No se inventa ni se redondea de forma distinta
a como está escrito en el sitio.

## Pre-Render Self-Audit

- **Squint**: un foco domina por frame.
- **Trinity**: bg + ink + UN naranja; sin blanco puro, sin teal, sin segundo saturado.
- **Rigor**: cada hecho mostrado tiene su etiqueta completa y legible.
- **Type**: Orbitron uppercase en titulares/números; Exo 2 en cuerpo; Share Tech Mono solo en
  el kicker.
- **Fabricación**: todo número/afirmación trazable a `visible-text.txt`.

## Known Gaps

- Motion vive en `motion-language.md` de la skill, no acá.
- Sin fuentes locales staged (a diferencia de otros presets del pack): Orbitron/Exo 2/Share Tech
  Mono se resuelven vía Google Fonts en el render (igual que en `videos/gargantua-title`), porque
  este es un spike de evaluación — no un asset final del sitio.
