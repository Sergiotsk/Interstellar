# Data Model: Rediseño visual de Personajes

Sitio estático sin backend/base de datos — "entidades" acá son unidades de **contenido**
(archivos + estructura DOM), no registros persistidos. Documenta forma, campos y reglas de
validación de cada una, tal como las usa el contrato (`contracts/personajes-page.md`).

## Portada de tripulación

Entidad de una sola instancia: la sección de apertura de `personajes.html`. No tiene campos
propios más allá de agrupar, en orden fijo, un teaser por cada uno de los 6 `Personaje`
existentes (mismo orden que el contrato 003: cooper, murph, brand, profesor-brand, mann,
tars-case).

| Campo | Tipo | Regla |
|---|---|---|
| `personaje_id` | string | Referencia a `Personaje.id` — uno de los 6, sin excepción y sin depender de `Personaje.patron`. |
| `retrato` | ruta | Siempre `Personaje.retrato_respaldo` — nunca un asset nuevo, por eso no tiene dependencia de curación. |
| `enlace` | ancla | `#<personaje_id>`. |

## Personaje

Una de las 6 secciones de `personajes.html`. Ya existe (contrato 003); esta feature no agrega
ni quita personajes, cambia su presentación.

| Campo | Tipo | Regla |
|---|---|---|
| `id` | string (kebab-case) | Uno de `cooper`, `murph`, `brand`, `profesor-brand`, `mann`, `tars-case`. Fijo, no cambia (contrato 003). |
| `nombre` | string | Nombre visible, coincide con `js/nav-data.js`. |
| `rol` | string | Bajada corta para el hero (ej. "Piloto · Endurance"). Nueva — no existía en el contrato 003 como campo propio, vivía implícito en el primer párrafo. |
| `patron` | enum | `completo` (hero + galería + visor) \| `degradado` (contrato 003 vigente). Determinado por disponibilidad de material — ver Estado de disponibilidad de assets, no es un campo editable a mano. |
| `retrato_respaldo` | ruta | `assets/img/personajes-<id>.jpg` — obligatorio siempre, es lo que se muestra en `patron: degradado` y lo que carga el hero como imagen de fondo cuando `patron: completo`. |

## Escena de galería

Uno de los 2-3 tramos que arma la galería de scroll horizontal de un personaje (User Story 2).
Existe solo si `Personaje.patron === 'completo'`.

| Campo | Tipo | Regla |
|---|---|---|
| `orden` | integer | 1..N dentro del riel del personaje. Define el orden de aparición en la tira y la sincronía con el panel de texto. |
| `label` | string | Etiqueta corta tipo "Escena 01 · ..." (`--font-instrumento`, uppercase). |
| `titulo` | string | Título de la escena (`<h3>`). |
| `descripcion` | string (1-2 párrafos) | Cuerpo de texto de la escena. |
| `dato_curioso` | string | Dato de producción/guion — NO afirmación científica (Principio VI no aplica acá, esto es "curiosidad", no ciencia). |
| `fotograma` | ruta | `assets/img/personajes-<id>-escena-NN.jpg`, `NN` = `orden` con cero a la izquierda. |

**Validación**: mínimo 2 escenas por personaje con `patron: completo` (si hay solo 1, no hay
nada que sincronizar en el riel — degrada mejor a `patron: degradado` para ese personaje).

## Tramo de visor (Nav-Ranger)

Uno de los 2-3 tramos cortos de fotogramas consecutivos que cicla el visor (User Story 3).
Existe solo si `Personaje.patron === 'completo'` Y hay tramos curados para ese personaje
específicamente (un personaje puede tener escenas de galería completas y aun así no tener
tramos de visor curados todavía — son curaciones independientes).

| Campo | Tipo | Regla |
|---|---|---|
| `orden_tramo` | integer | Orden del tramo dentro del visor (no confundir con el frame individual). |
| `frames` | ruta[] | Lista ordenada `assets/img/personajes-<id>-visor-NN.jpg`. Sin mínimo estricto de frames por tramo — criterio cualitativo "reconocible como secuencia corta", no un número fijo (ver Edge Cases de spec.md). |
| `intervalo_ms` | integer | Milisegundos entre frames, vive en `data-intervalo` del HTML. Default de referencia: 450. |

**Validación**: la concatenación de todos los `frames` de todos los tramos de un personaje es
la secuencia completa que cicla el visor de esa ficha, en el orden `orden_tramo` → orden dentro
del array `frames`. El ciclador (FR-004) no distingue "tramo" como unidad técnica — es un
criterio de curación de contenido, no una estructura de datos separada en el DOM (el visor solo
ve una lista plana de `<img>`).

## Estado de disponibilidad de assets (inventario, no una entidad versionada)

No es un archivo de datos — es el criterio, ya relevado en `spec.md`/Clarifications, que decide
el campo `Personaje.patron`:

| Personaje | Stills hoy | Escenas de galería posibles | Tramos de visor curados | `patron` resultante |
|---|---|---|---|---|
| `cooper` | 5 | Sí (≥2) | Pendiente de curar | `completo` (galería) — visor pendiente de curación real, ver Tareas |
| `murph` | 4 | Sí (≥2) | Pendiente de curar | `completo` (galería) — visor pendiente de curación real |
| `brand` | 4 (3 reusados de mundos-miller/mann/gargantua) | Sí (3) | No | `completo` (hero + galería) — visor pendiente de curación real |
| `profesor-brand` | 5 (1 hero recortado + 3 escenas + curados del volcado) | Sí (3) | Sí (1 tramo, 3 frames) | `completo` (hero + galería + visor) |
| `mann` | 5 (4 reusados de `mundos-mann.html`) | Sí (3) | Sí (2 tramos, 8 frames) | `completo` (hero + galería + visor) |
| `tars-case` | 1 | No | No | `degradado` |

La curación real de tramos de visor (elegir frames del volcado, optimizar, nombrar) es trabajo
de `/speckit-tasks` + `/speckit-apply` — este documento fija la forma del dato, no lo completa.
