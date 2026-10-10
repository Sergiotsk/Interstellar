# Sistema de diseño — "Miller's Wave Escape" (Interstellar × Metal Slug)

> Pegalo junto con `PromptMiniJuegoMiller.md`. **Cuando hablen de lo visual, el sonido o la animación, manda este documento**: reemplaza lo que el prompt dice de "minimalista" y "nada arcade" para el MUNDO del juego. El HUD sigue minimalista.
>
> Fórmula: **la factura artesanal y la animación con peso de Metal Slug**, usadas con la **paleta, la seriedad y el concepto de cabina** del sitio Interstellar. Es un homenaje de estilo: **no se copia ningún sprite, fuente, sonido, frase ni personaje de SNK**. Todo es original.

---

## 1. Concepto rector

**"Estás en la cabina de la Ranger, mirando por la ventana un mundo dibujado a mano."**

El juego tiene dos capas que **nunca** se mezclan, igual que el sitio:

| Capa | Qué es | Estilo | Acento saturado |
|------|--------|--------|-----------------|
| **Mundo** (canvas Phaser) | El océano, la ola, los personajes, los restos y las partículas | **Pixel art detallado al estilo Metal Slug**: sprites con mucho detalle, animación cuadro por cuadro, peso físico y cada impacto con su exageración | **Naranja Gargantúa `#e8803b`**, solo para lo de máxima jerarquía |
| **Cabina** (HUD y overlays en HTML) | Las lecturas, los estados, los banners, el ranking y los controles táctiles | Instrumento de nave: monoespaciado, líneas finas, recortes diagonales y LEDs | **Teal `#4fd0e0`**, más ámbar y rojo como LEDs |

**Reglas de oro:**
1. El **teal no entra al mundo**. Si algo dentro del canvas brilla teal, está mal.
2. En el mundo, el naranja Gargantúa marca **una sola cosa por pantalla**: la baliza y su señal, la llama de despegue o el sello del resultado.
3. **Nunca blanco puro.** El tope de luz es crema `#efe7d6`. El blanco solo aparece 1 frame en un destello de impacto.
4. Lo que se toma de Metal Slug es el **oficio**: la densidad de detalle, la animación con anticipación y rebote, la física exagerada, las partículas generosas y la "tirada" de puntaje. El **tono** sigue siendo el de Interstellar: épico, melancólico y tenso. Hay humor, pero solo en gestos chicos (las animaciones idle), nunca en la muerte.

---

## 2. Resolución y render del pixel art

| Parámetro | Valor | Por qué |
|-----------|-------|---------|
| Resolución interna | **480 × 270** (16:9) | Es el "tamaño Metal Slug" llevado a pantalla ancha: deja espacio para sprites detallados sin perder la grilla |
| Escalado | **Entero** (×2, ×3, ×4…), centrado, con letterbox `#0a0e1a` | Si la escala no es entera, los píxeles se deforman |
| Phaser | `pixelArt: true`, `roundPixels: true`, `antialias: false` | El pixel queda nítido |
| CSS del canvas | `image-rendering: pixelated` | Ídem, del lado del navegador |
| Unidad de diseño | **1 px de juego** (un "gpx") | Todas las medidas del mundo se expresan en gpx, nunca en px de pantalla |
| Tamaño de los personajes | Astronauta: **16 × 24 gpx**. CASE: **12 × 28 gpx**. Ranger: **96 × 40 gpx** | Personajes chicos en un mundo enorme, lo que comunica inmensidad |

**Cómo se hacen los sprites sin archivos externos:** cada sprite se define en el código como un **mapa de caracteres** (un string por fila, un carácter por índice de paleta), y al cargar se convierte en textura con `generateTexture` o en un canvas offscreen. Ejemplo:

```js
// '.' = transparente; cada letra es un índice de PALETA_PIXEL
const ASTRONAUTA_IDLE_0 = [
  '.....AAAA.......',
  '....ABBBBA......',
  '....BCCCCB......',
  // ...24 filas
];
```

- Cada animación es un array de frames con esos mapas. **Nada de imágenes descargadas.**
- Contorno: **1 gpx oscuro** (`P0` o `P1`) alrededor de los personajes, al estilo Metal Slug. Los fondos van **sin contorno**, para separar los planos.
- Sombreado: tres tonos por material (sombra, base y luz), con la luz arriba a la izquierda. El brillo especular (1-2 px) va en crema solo sobre el metal y el casco.

---

## 3. Paleta

### 3.1 Tokens del sitio (no se tocan)

| Token CSS | Hex | Phaser | Capa |
|-----------|-----|--------|------|
| `--color-fondo` | `#0a0e1a` | `0x0a0e1a` | Fondo y letterbox |
| `--color-texto` | `#efe7d6` | `0xefe7d6` | Texto y luz máxima del mundo |
| `--color-texto-atenuado` | `#a8a294` | `0xa8a294` | Texto secundario |
| `--color-gargantua` | `#e8803b` | `0xe8803b` | Mundo: máxima jerarquía |
| `--color-tierra-ocre` | `#a8793f` | `0xa8793f` | Mundo: óxido y cables |
| `--color-tierra-oro` | `#d4a94e` | `0xd4a94e` | Mundo: viseras y chispas |
| `--instrumento-teal` | `#4fd0e0` | `0x4fd0e0` | **Solo en la cabina** |
| `--instrumento-pantalla` | `#0c2529` | `0x0c2529` | Fondo de los paneles del HUD |
| `--led-ambar` | `#e0a94a` | `0xe0a94a` | LED de estado |
| `--led-alerta` | `#d0453a` | `0xd0453a` | LED de alerta |
| `--cockpit-metal` / `-alto` | `#12161a` / `#1c2226` | — | Paneles del HUD |
| `--cockpit-bezel` / `-brillo` | `#3d454c` / `#4a5560` | — | Bordes del HUD |
| `--color-case` | `#9aa6b6` | `0x9aa6b6` | Cuerpo de CASE |

### 3.2 Paleta de pixel art del mundo (`PALETA_PIXEL`, 20 colores como máximo)

Son tonos derivados de los tokens. Es una paleta **cerrada**: ningún sprite usa un color que no esté acá.

| Índice | Hex | Rol |
|--------|-----|-----|
| P0 | `#0a0e1a` | Contorno y negro |
| P1 | `#161c2b` | Sombra profunda |
| P2 | `#2a3346` | Agua en sombra y frente de la ola |
| P3 | `#3f4c5f` | Agua base |
| P4 | `#5d6c7e` | Agua iluminada |
| P5 | `#8a98a6` | Espuma en sombra y cielo bajo |
| P6 | `#b9c0c4` | Cielo y espuma |
| P7 | `#efe7d6` | Luz máxima y espuma de cresta |
| P8 | `#3d454c` | Metal en sombra (Ranger, restos) |
| P9 | `#6b7680` | Metal base |
| P10 | `#9aa6b6` | Metal con luz y CASE |
| P11 | `#c9cfd6` | Traje del astronauta |
| P12 | `#8e959c` | Sombra del traje |
| P13 | `#a8793f` | Óxido y correas |
| P14 | `#d4a94e` | Visera y chispa |
| P15 | `#e8803b` | **Baliza y llama** (jerarquía máxima) |
| P16 | `#7a3d1c` | Sombra del naranja |
| P17 | `#d0453a` | Luz de emergencia de la Ranger (puntual) |

**Variación por tensión (sin agregar colores):** a medida que se acerca la ola, el mundo se **desatura y oscurece** en pasos: se baja 1 índice la rampa de agua y de cielo en 3 escalones (lejos, cerca, inminente). Nunca con un tinte rojo sobre todo el mundo: el rojo vive en el HUD.

---

## 4. Tipografía

| Uso | Familia | Tratamiento "Metal Slug" |
|-----|---------|--------------------------|
| Banners (`MISSION 02 START`, `MISSION COMPLETE`, `MISSION FAILED`) | `'Orbitron'` 900, fallback `'Exo 2', system-ui, sans-serif` | Uppercase, `letter-spacing: 0.06em`. **Sombra dura escalonada** sin blur: `text-shadow: 2px 2px 0 #0a0e1a, 4px 4px 0 #0a0e1a`. Relleno con un gradiente vertical de 2 tonos en franjas duras (`linear-gradient(#efe7d6 0 55%, #d4a94e 55% 100%)` con `background-clip: text`) |
| Lecturas del HUD | `'Share Tech Mono'`, fallback `ui-monospace, monospace` | Teal con un glow suave, como en el sitio. Los números usan `font-variant-numeric: tabular-nums` |
| Narrativa (intro y resultado) | `'Exo 2'` 400–600 | Crema, frases cortas y fade. **Sin** efectos arcade: acá manda Interstellar |
| Contadores del resultado ("tirada") | `'Share Tech Mono'` | Los números suben con un tick por paso, como la tirada de puntos de un fichín |

Si las fuentes no cargan, se usan los fallbacks. **No se usa ninguna fuente pixel de terceros.**

---

## 5. Animación: el corazón del "estilo Metal Slug"

### 5.1 Tokens de tiempo

```js
const ANIM = {
  fpsSprite: 12,          // cuadro por cuadro "en dos" (24 fps / 2): da el pulso de animación a mano
  fpsSpriteRapido: 15,    // correr, chapotear
  hitStopMs: 70,          // congelar el mundo en un impacto fuerte
  shake: { leve: 1, medio: 2, fuerte: 4, decaimiento: 0.85 }, // en gpx, con decaimiento por frame
  squash: { x: 1.15, y: 0.85, ms: 90 },
  stretch: { x: 0.9, y: 1.12, ms: 90 },
  bannerEntradaMs: 280,
  bannerRetencionMs: 1200,
  idleEsperaS: 3,         // tiempo quieto antes de la animación idle
  tickTiradaMs: 40,
};
```

### 5.2 Principios (en orden de importancia)

1. **Cuadro por cuadro, no tweens, en los personajes.** Los sprites cambian de frame a 12 fps. Los tweens se reservan para la cámara, el UI y las partículas. Esto es lo que da el "hecho a mano".
2. **Anticipación → acción → rebote.** Cada acción tiene 3 tiempos:
   - **Saltar o chapotear:** agacharse 2 frames → impulso → caer con squash.
   - **Recoger la baliza:** agacharse → tirón → levantarla sobre la cabeza 1 segundo (pose de trofeo) mientras la baliza late en naranja.
   - **Despegue:** la Ranger tiembla y escupe agua y vapor → se hunde 2 gpx → sale disparada con stretch.
3. **Peso en el agua.** El agua frena: correr es pesado, con las rodillas altas y un chapoteo en cada paso (2-4 gotas por pisada). Al frenar, el personaje se inclina hacia adelante un frame.
4. **Hit-stop + shake + destello** en los impactos (chocar contra restos, que la ola rompa cerca): se congela el mundo 70 ms, hay un destello de 1 frame en P7 y un shake con decaimiento. **Máximo 3 destellos por segundo** (por fotosensibilidad).
5. **Animaciones idle con personalidad** (la firma de Metal Slug), a los 3 s sin input, sutiles y con el tono de la película:
   - El astronauta **mira su reloj de muñeca**: guiño al reloj de dilatación, y el contador `EARTH TIME LOST` parpadea en ámbar cuando lo hace.
   - Se sacude el agua de una bota.
   - CASE gira medio bloque sobre su eje y vuelve.
6. **CASE, el compañero.** Es un monolito de 4 bloques (el mismo concepto que el ícono del menú del sitio). Al rescatar al jugador o al llevar la baliza **rueda en aspa**: los bloques se separan, cruzan en ángulos desparejos y giran, igual que la animación del botón CASE del sitio. Hace el papel del "rehén que te da un ítem" de Metal Slug: si el jugador lo alcanza, CASE se pone a su lado y le da un **impulso de velocidad** de 2 s.
7. **Muerte seria, pero física.** Si la ola atrapa al jugador: el sprite se tambalea 3 frames → la pared de agua (P2 a P7) barre la pantalla de derecha a izquierda → el frame se congela en blanco-crema → aparece el sello `MISSION FAILED`. Sin gore y sin comedia.
8. **Partículas generosas pero con tope:** gotas, espuma, vapor, chispas de óxido, rocío de la ola. Cada una es un rectángulo de 1-2 gpx con la paleta cerrada, gravedad y una vida corta. Se reutilizan desde un pool (sin crear objetos por frame). Tope configurable, 300 por defecto y 150 en táctil.

### 5.3 La ola (pieza central)

- Se construye con **parallax de 3 planos**: lejos (silueta P2, lenta), medio (cuerpo con vetas P3-P4) y frente (cresta con espuma P6-P7 animada a 12 fps).
- Al principio es una **línea en el horizonte que no se reconoce** como ola: el jugador la lee mal a propósito, como en la película ("no son montañas").
- Cuando la línea "se revela", la cámara hace un **zoom-out de 2 pasos enteros** para mostrar la escala y suena el rumor grave.
- La cresta tira **rocío hacia adelante** que llega antes que la ola: es un aviso legible.

### 5.4 Cámara

- Sigue al jugador con un lerp de 0.1 y un **look-ahead hacia donde está la ola**, para que siempre se la vea venir.
- Con la ola cerca, aplica un **shake leve continuo** que crece en 3 escalones.

### 5.5 `prefers-reduced-motion`

- Sin shake, sin destellos y con el hit-stop a 0.
- El parallax de la ola se mueve al 30 %.
- Los banners aparecen con fade, sin rebote.
- La animación cuadro por cuadro **se mantiene**, porque es información.

---

## 6. Cabina: HUD y overlays (HTML sobre el canvas)

Mantiene el lenguaje del sitio y le suma la **disposición clásica de un fichín**.

```
┌──────────────────────────────────────────────────────────────┐
│ ◆ SCORE 004 200            MISSION TIME 00:41    ● ● (LEDs) │
│ EARTH TIME LOST 29y 08m                 WAVE DISTANCE ▮▮▮▯▯ │
│                                                              │
│                    (mundo pixel art)                         │
│                                                              │
│ BEACON SIGNAL ))))·                       STATUS: SEARCHING │
└──────────────────────────────────────────────────────────────┘
```

- **Arriba a la izquierda:** el puntaje, como en Metal Slug, y abajo los años perdidos. **Arriba a la derecha:** el tiempo de misión y la barra de distancia de la ola, que es segmentada (5 bloques, al estilo de las barras de un fichín) y pasa de teal a ámbar y a rojo.
- **Paneles:** fondo `#0c2529` al 80 %, borde de 1px `#3d454c`, `clip-path: var(--recorte-tecla)` y una grilla fina de instrumento. **Sin bordes redondeados.**
- **Banners de misión:** entran desde los costados con `steps(6)` y un rebote final de 1 paso, se quedan 1,2 s y salen con fade:
  - `MISSION 02 START` al terminar la cuenta 3-2-1.
  - `BEACON ACQUIRED!`
  - `WAVE INCOMING!` en ámbar y con un parpadeo de 2 Hz.
  - `MISSION COMPLETE!` o `MISSION FAILED` como **sello** que cae con squash y un shake leve.
- **Cuenta regresiva 3-2-1:** dígitos de Orbitron 900 gigantes con sombra dura, cada uno con un squash al aparecer.
- **Controles táctiles:** son teclas de consola con `--recorte-tecla`, bezel y un LED que se enciende en teal mientras se presionan. El joystick es una base circular con una grilla y un nudo cuadrado biselado, no una burbuja redondeada.

---

## 7. Pantalla de resultado: la "tirada" Metal Slug

1. El sello `MISSION COMPLETE!` o `MISSION FAILED` cae (ver 5.2).
2. Los ítems se cuentan **uno por uno**, con un tick sonoro cada 40 ms:
   - `MISSION TIME`
   - `EARTH TIME LOST`, que lleva un chip `✎ Licencia narrativa` en la primera aparición
   - `WAVE MARGIN`
   - `CASE ASSIST`
   - `TOTAL`
3. Aparece un **rango** según el puntaje: `S`, `A`, `B` o `C`, estampado en naranja Gargantúa. Es lo único naranja de esa pantalla.
4. Si el puntaje entra al top 10, se abre el editor de nombre arcade (8 letras).
5. Hay una **cuenta de "continue"** al estilo fichín: `RETRY? 9…0`, con los botones **Reintentar** y **Salir**. Al llegar a 0 queda en espera; nunca sale solo.
6. Debajo va una **frase narrativa en español**, una sola. Por ejemplo, si ganó: *"Volviste. Allá pasaron 23 años."* Si perdió: *"El agua no espera."*

---

## 8. Sonido (Web Audio, sintetizado)

| Evento | Carácter Metal Slug | Adaptado a Interstellar |
|--------|---------------------|-------------------------|
| Pasos en el agua | Foley exagerado | Chapoteo con ruido filtrado y pitch aleatorio de ±10 % |
| Baliza | "Ítem conseguido" brillante | Pulso de 2 notas que se acelera al acercarse; al recogerla, un arpegio corto ascendente |
| Banner | Voz del locutor | **Sin voz.** Un golpe grave metálico + barrido de ruido |
| Impacto | Golpe seco | Golpe seco + 70 ms de silencio durante el hit-stop |
| Ola | — | Rumor grave en crescendo y un filtro que se abre con la cercanía |
| Tirada del resultado | Tick por punto | Tick corto y seco, con un cierre en acorde al terminar |
| Despegue | — | Rugido de motor y barrido ascendente; la música del juego entra a pleno |

---

## 9. Lo que NO se hace

- Usar sprites, fuentes, sonidos, la voz del locutor, los logos, los personajes o el texto literal de Metal Slug o de SNK.
- Usar material, frames o música de la película dentro del juego.
- Poner teal en el mundo, o más de un elemento naranja por pantalla.
- Usar blanco puro de forma sostenida, o más de 3 destellos por segundo.
- Escalar con valores no enteros, aplicar antialias al pixel art o meter tweens en el cuerpo de los personajes.
- Hacer comedia con la muerte o con la ola.
- Usar bordes redondeados en el HUD.
- Agregar colores fuera de `PALETA_PIXEL`.

---

## 10. Entregables que tiene que traer el código

- `PALETA_PIXEL`, `ANIM` y `TOKENS_HUD` como objetos congelados dentro del bloque `config.js`.
- Los sprites como mapas de caracteres en un bloque propio: `// ===== sprites.js =====`.
- Una tabla de animaciones (`nombre → frames, fps, loop`) para que se pueda revisar sin leer la escena.
- Una página de prueba, oculta tras `?debug=sprites`, que muestre cada animación en loop sobre fondo `#0a0e1a`.
