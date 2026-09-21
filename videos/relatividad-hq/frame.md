---
version: alpha
name: Cabina Ranger — Frame (relatividad)
description: >
  Frame companion tomado literalmente de interstellar/DESIGN.md — igual sistema que
  videos/dilatacion-temporal-hq/frame.md. Fondo azul-noche profundo, un unico acento
  saturado (naranja Gargantua), texto crema (nunca blanco puro), recortes diagonales
  angulares, sin nada redondeado-blando. Los niveles de rigor cientifico se distinguen
  por texto + estilo de borde (solido = ciencia real, punteado = licencia narrativa),
  nunca solo por color — regla dura de accesibilidad del proyecto (Principio VI).
  Diagramas propios por escena: malla de curvatura del espacio-tiempo, relojes
  desincronizados, arbol de consecuencias, stat count-up 76 vs 1, pasillo del Tesseract.
unit: the frame — 1920×1080 primary (16:9)
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
  rigor-licencia: "3px dashed ink@40% (etiqueta '✎ Licencia narrativa')"

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
  slide-pad: "8.3cqw"
  gap-md: "1.25cqw"
  radius-ficha: "0.25rem"
  recorte-tecla: "polygon(7px 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%, 0 7px)"

components:
  ficha-concepto:
    backgroundColor: "{colors.surface}"
    border: "1px solid ink@12%"
    rounded: "{spacing.radius-ficha}"
    description: "Superficie de contenido informativa (identica a .concepto figure del sitio)."
  etiqueta-rigor:
    backgroundColor: "{colors.surface}"
    border: "1px solid ink@22%, border-left {borders.rigor-real} o {borders.rigor-licencia}"
    rounded: "999px (pill)"
    typography: "{typography.rigor-tag}"
    description: "Chip inline. El texto SIEMPRE dice el nivel; el borde-izquierdo (solido vs punteado) refuerza, nunca reemplaza al texto."
  numero-hero:
    typography: "{typography.number-hero} figura + {typography.number-unit} unidad"
    accentRule: "el UNICO lugar donde el acento naranja puede tenir el numero"
    description: "Ej: '76 años', '1 década'."
  diagrama-curvatura:
    description: "Malla SVG (grid de lineas) deformada alrededor de una masa central oscura con glow del acento — la curvatura del espacio-tiempo. Las lineas de la malla se doblan hacia la masa (path animado / transform), nunca solo una imagen estatica de una fuerza tirando."
  diagrama-relojes-desync:
    description: "Tres relojes SVG en distintos puntos del frame (distinta 'gravedad' implicita), cada uno con manecillas que giran a velocidad angular DISTINTA en el mismo lapso real — no hay una unica manecilla maestra. El argumento visual es la falta de sincronia, no la velocidad en si."
  arbol-consecuencias:
    description: "Un nodo central (marco de relatividad general) con tres ramas SVG (lineas finas ink@30%) hacia tres nodos hijos: agujero negro / dilatacion temporal / agujero de gusano. Las ramas se dibujan con stroke-dashoffset en secuencia, los nodos aparecen al final de cada rama."
  stat-comparacion:
    description: "Stat card con count-up: '76 años' (grande, acento) vs '1 década' (mas chico, ink) con una barra de proporcion visual entre ambos (barra larga vs barra corta, mismo lenguaje que dilatacion-temporal-hq)."
  pasillo-tesseract:
    description: "Perspectiva SVG de lineas convergentes (pasillo/corredor) con trazo PUNTEADO (ink@40%) — ecoa la etiqueta de licencia narrativa. Un punto de luz (acento, tenue) recorre el pasillo. Nunca solido: el Tesseract es licencia, no ciencia comprobada."
---

# Cabina Ranger — Frame (relatividad)

## Overview

Fondo `{colors.bg}` siempre. Contenido sobre `{colors.surface}` (fichas translucidas) cuando
necesita agruparse; nunca un segundo color saturado. **Naranja `{colors.accent}` es el UNICO
acento con color pleno** — un momento por frame. Todo lo demas vive en la escala
ink/ink-soft/metal/bezel. Nunca blanco puro (`#fff`). Cada escena de concepto/dato lleva un
diagrama SVG propio — el texto solo no alcanza para "calidad".

## Frame Craft Bar

- **Squint**: domina un solo foco por frame — el diagrama, o el numero hero, o el titular.
- **Trinity**: fondo `{colors.bg}` + texto `{colors.ink}` + naranja `{colors.accent}` una sola vez.
- **Rigor**: todo hecho mostrado lleva su etiqueta de rigor visible el tiempo suficiente
  (>= 2s a full alpha), y su estilo de borde hace eco en el diagrama de la misma escena
  cuando aplica (ver `pasillo-tesseract` — punteado = licencia narrativa).

**Safe area**: `slide-pad` ~8.3cqw. **Container law**: `cqw`/`cqh`, nunca `vw`. **No
front-loading**: cada escena revela sus piezas distribuidas en el tiempo (kicker → diagrama
→ texto → etiqueta).

## Colors / Typography

Igual que `dilatacion-temporal-hq/frame.md`: Orbitron (800/900, uppercase) titulares/numeros;
Exo 2 (400/500) cuerpo, etiqueta, labels; Share Tech Mono solo kicker.

## Frame Treatments

> Recipe: ground · composes · focal · diagrama · accent · rigor tag · density.

### 1 · Apertura (pregunta)

**Ground** `{colors.bg}`. **Composes** kicker mono, `display` Orbitron reveal palabra por
palabra. **Focal** "¿Existe un ahora único para todo el universo?". **Density** libre.

### 2 · Concepto (curvatura + relojes desincronizados)

**Ground** `{colors.bg}`. **Composes** `diagrama-curvatura` seguido de `diagrama-relojes-desync`,
`body`, `etiqueta-rigor` (solida). **Focal** la malla deformada y los tres relojes fuera de
sincronía — el hecho se VE. **Density** media-alta (dos diagramas secuenciales en la misma
escena, cada uno con su propio momento).

### 3 · Consecuencias (árbol)

**Ground** `{colors.bg}`. **Composes** `arbol-consecuencias`, `body`, `etiqueta-rigor` (solida).
**Focal** las tres ramas dibujándose desde el nodo central. **Density** media.

### 4 · Número de impacto (76 vs 1)

**Ground** `{colors.bg}`. **Composes** `numero-hero` + `stat-comparacion`, `body` de contexto,
`etiqueta-rigor` (solida). **Focal** "76 años" en acento vs "1 década" en ink. **Density**
libre, el número domina.

### 5 · Tesseract (licencia narrativa)

**Ground** `{colors.bg}`. **Composes** `pasillo-tesseract`, `body`, `etiqueta-rigor` (punteada).
**Focal** el pasillo punteado recorrido por el punto de luz. **Density** media.

### 6 · Cierre (Amelia Brand + fuente)

**Ground** `{colors.bg}`. **Composes** `headline` corto (reveal palabra por palabra),
`etiqueta-rigor` (punteada, "el amor no es física"), fuente citada. **Accent** una palabra
en naranja. **Density** mínima, centrado.

## Composition Rules

### Do

- Fondo `{colors.bg}` en todo frame.
- Racionar el naranja a UN momento por frame; diagramas en ink/ink-soft, nunca acento.
- Toda etiqueta de rigor lleva el texto completo, nunca solo el icono/color.
- El estilo de trazo (sólido = ciencia real / punteado = licencia narrativa) refuerza el
  diagrama de su escena cuando aplica.
- Orbitron uppercase titulares/números; Exo 2 el resto.

### Don't

- Blanco puro, segundo color saturado, o teal.
- Etiqueta de rigor que dependa solo de color.
- Diagramas en color acento.
- Revelar todas las piezas de una escena en el mismo instante.

## Numerals & Claims (hard rule)

Los únicos números permitidos son los que aparecen literalmente en
`capture/extracted/visible-text.txt` (1915, 2 años, 23 años, 51 años, 76 años, 1 década) —
fuente: Thorne, K. *The Science of Interstellar* (2014).

## Pre-Render Self-Audit

- **Squint**: un foco domina por frame.
- **Trinity**: bg + ink + UN naranja; sin blanco puro, sin teal, sin segundo saturado.
- **Rigor**: cada hecho mostrado tiene su etiqueta completa y legible.
- **Diagramas**: cada escena de concepto/dato tiene su propio diagrama SVG.
- **No front-loading**: piezas reveladas distribuidas en el tiempo.
- **Fabricación**: todo número/afirmación trazable a `visible-text.txt`.

## Known Gaps

- Motion vive en las reglas de `hyperframes-animation`, no acá.
- Sin fuentes locales staged: Orbitron/Exo 2/Share Tech Mono se resuelven vía Google Fonts
  en el render — spike de evaluación, no asset final del sitio.
