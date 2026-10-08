// Modulo de pagina del simulador de acople: mount/unmount para swup, carga de Phaser y conexion logica-escena-DOM.
// Ciclo de vida y cancelacion del import: docs/20-notas-de-codigo/minijuegos-acople.md
import { CONFIG } from './config.js';
import { accionDeTecla, presionar, soltar, soltarTodo } from './logica/acciones.js';
import {
  crearPartida,
  iniciar,
  pausar,
  reanudar,
  conAcciones,
  avanzar,
  reintentar,
  solicitarAcople,
  estadoHud,
  nivelDeEstado,
  indicacionHud,
} from './logica/mision.js';
import { leerRanking, posicionEnRanking, insertarEntrada, guardarEnRanking } from './logica/ranking.js';
import { crearEditor, textoEditor, teclaEditor } from './logica/nombre-arcade.js';
import { modoEntrada, requiereGiro } from './logica/dispositivo.js';
import { levantarTodo, accionesTactiles } from './logica/controles-tactiles.js';
import { instrumentos } from './logica/instrumentos.js';
import { crearOverlays, lecturasHud, filasRanking } from './overlays.js';
import { crearEscenaAcople } from './escena-acople.js';
import { crearAudioAcople } from './audio-acople.js';
import * as pantalla from './pantalla-completa.js';
import { conectarControles } from './controles-tactiles.js';

const URL_PHASER = '../../vendor/phaser@4.2.1/phaser.esm.min.js';
const DURACION_INTRO_MS = 8000;
const DURACION_INTRO_CON_RANKING_MS = 13000; // el ranking aparece a los 6 s: que se llegue a leer
const INTERVALO_HUD_MS = 100;

let sesion = null;

function leerPaleta() {
  const css = getComputedStyle(document.documentElement);
  const color = (nombre) => {
    const n = parseInt(css.getPropertyValue(nombre).trim().replace('#', ''), 16);
    return Number.isNaN(n) ? 0xffffff : n;
  };
  return {
    teal: color('--instrumento-teal'),
    ambar: color('--led-ambar'),
    alerta: color('--led-alerta'),
    texto: color('--color-texto'),
    fondo: color('--color-fondo'),
  };
}

// Medidas de la consola desde sus variables CSS (unica fuente): la consola puede estar oculta en la intro.
function medidasConsola(raiz) {
  const css = getComputedStyle(raiz);
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const aPx = (valor) => (valor.trim().endsWith('rem') ? parseFloat(valor) * rem : parseFloat(valor));
  return { alto: aPx(css.getPropertyValue('--alto-consola')) || 0, anchoMax: aPx(css.getPropertyValue('--ancho-consola')) || 0 };
}

function almacenamiento() {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined; // con el almacenamiento bloqueado, el solo acceso puede lanzar
  }
}

// Suelta teclado y dedos: pausa, reintento y fin no dejan la nave acelerando (FR-036, 010 FR-012).
function soltarControles(s) {
  s.acciones = soltarTodo();
  s.toques = levantarTodo();
  s.mandos?.soltar();
}

// Pulso haptico en tactil; en iOS vibrate no existe y queda en no-op.
function vibrar(s, patron) {
  if (s.modo === 'tactil' && !s.audio.estaMuteado()) navigator.vibrate?.(patron);
}

function escuchar(s, objetivo, evento, fn, opciones) {
  objetivo.addEventListener(evento, fn, opciones);
  s.limpiezas.push(() => objetivo.removeEventListener(evento, fn, opciones));
}

function enfocarLienzo(s) {
  s.lienzo.focus({ preventScroll: true });
}

// conGesto: solo dentro de un clic o una tecla el navegador concede la pantalla completa.
function comenzarPartida(s, conGesto) {
  if (s.partida.fase !== 'intro') return;
  clearTimeout(s.temporizadorIntro);
  s.partida = iniciar(s.partida);
  s.ui.mostrar('hud');
  enfocarLienzo(s);
  if (conGesto) entrarPantalla(s);
}

// Reintentar reusa el Game ya creado: solo se reemplaza la partida (sin intro, FR-009).
function volverAJugar(s) {
  s.editor = null;
  s.partida = reintentar(s.partida, CONFIG);
  soltarControles(s);
  s.ui.mostrar('hud');
  enfocarLienzo(s);
  entrarPantalla(s);
}

function pausarPartida(s) {
  if (s.partida.fase !== 'en-curso') return;
  s.partida = pausar(s.partida);
  soltarControles(s);
  s.audio.actualizar(s.estado, s.acciones, false, s.partida.nave.distancia);
  s.ui.mostrar('pausa');
}

// En tactil, ademas de la pantalla completa, se intenta fijar la horizontal (010 R5).
function entrarPantalla(s) {
  const pedido = pantalla.entrar(s.raiz);
  if (s.modo === 'tactil') pedido.then((ok) => ok && pantalla.bloquearHorizontal());
}

function reanudarPartida(s) {
  s.partida = reanudar(s.partida);
  s.ui.mostrar('hud');
  enfocarLienzo(s);
  entrarPantalla(s);
}

// Salir de pantalla completa en plena partida la pausa (FR-042).
function alCambiarPantalla(s) {
  const activa = pantalla.estaActiva(s.raiz);
  s.ui.pintarPantalla(activa);
  if (!activa) pausarPartida(s);
}

function terminarPartida(s) {
  soltarControles(s);
  const { desenlace } = s.partida;
  if (desenlace.exito) {
    s.audio.evento('acople');
    vibrar(s, 40);
  }
  if (desenlace.causa === 'impacto') s.audio.evento('impacto');
  const { entradas, ultimoNombre } = leerRanking(almacenamiento(), CONFIG);
  const posicion = desenlace.exito ? posicionEnRanking(entradas, desenlace.puntaje, CONFIG) : -1;
  s.ranking = entradas;
  s.ui.pintarResultado(desenlace, posicion);
  s.ui.mostrarEditor(posicion >= 0);
  if (posicion >= 0) {
    s.editor = crearEditor(ultimoNombre, CONFIG);
    pintarEditor(s);
  } else {
    s.ui.pintarRanking('resultado', filasRanking(entradas, -1, CONFIG));
  }
  s.ui.mostrar('resultado');
}

// Mientras se carga el nombre, la tabla muestra la fila provisoria con lo que se va tipeando.
function pintarEditor(s) {
  const provisoria = insertarEntrada(
    s.ranking,
    { nombre: textoEditor(s.editor), puntaje: s.partida.desenlace.puntaje },
    CONFIG,
  );
  s.ui.pintarEditor(s.editor);
  s.ui.pintarRanking('resultado', filasRanking(provisoria.entradas, provisoria.posicion, CONFIG));
}

function confirmarNombre(s) {
  const r = guardarEnRanking(s.partida.desenlace, textoEditor(s.editor), almacenamiento(), CONFIG);
  s.editor = null;
  if (r.guardado) s.ranking = r.entradas;
  s.ui.mostrarEditor(false);
  s.ui.pintarRanking('resultado', filasRanking(s.ranking, r.posicion, CONFIG));
  s.ui.enfocarResultado();
}

// Editor de nombre: se traga las teclas que usa (R incluida) para no reiniciar mientras se escribe.
function alPresionarEnEditor(s, e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if ((esEnter(e) || e.key === ' ') && e.target.closest?.('a, button')) return;
  const r = teclaEditor(s.editor, e.key, CONFIG);
  if (!r.manejada) return;
  e.preventDefault();
  // Enter sostenido desde el acople no debe confirmar el nombre de un saque.
  if (r.confirmar) {
    if (!e.repeat) confirmarNombre(s);
    return;
  }
  s.editor = r.editor;
  pintarEditor(s);
}

function tick(s, dt) {
  const fase = s.partida.fase;
  const estadoAnterior = s.estado;
  const acciones = new Set([...s.acciones, ...accionesTactiles(s.toques)]);
  s.partida = avanzar(conAcciones(s.partida, acciones), dt, CONFIG);
  s.estado = estadoHud(s.partida, CONFIG);
  if (s.estado === 'DOCKING RANGE' && estadoAnterior !== 'DOCKING RANGE' && s.partida.fase === 'en-curso') {
    s.audio.evento('lock-in');
  }
  s.audio.actualizar(s.estado, s.acciones, s.partida.fase === 'en-curso', s.partida.nave.distancia);
  const ahora = performance.now();
  if (ahora - s.ultimoHud > INTERVALO_HUD_MS || s.partida.fase !== fase) {
    s.ultimoHud = ahora;
    s.ui.pintarHud(
      lecturasHud(s.partida, CONFIG),
      s.estado,
      nivelDeEstado(s.estado),
      indicacionHud(s.partida, s.estado, s.modo),
      instrumentos(s.partida, CONFIG),
    );
  }
  if (fase === 'en-curso' && (s.partida.fase === 'acoplada' || s.partida.fase === 'fallida')) terminarPartida(s);
}

// e.key y no e.code: el Enter del teclado numerico tiene code 'NumpadEnter' pero key 'Enter'.
const esEnter = (e) => e.key === 'Enter';

// Vertical en tactil: capa de giro encima, partida en pausa e intro detenida; lo de abajo queda intacto (010 R6).
function evaluarGiro(s) {
  const girar = requiereGiro({ modo: s.modo, ancho: window.innerWidth, alto: window.innerHeight });
  if (girar === s.girando) return;
  s.girando = girar;
  s.raiz.querySelector('[data-aviso-giro]').hidden = !girar;
  if (girar) {
    pausarPartida(s);
    clearTimeout(s.temporizadorIntro);
  } else if (s.partida.fase === 'intro') {
    s.temporizadorIntro = setTimeout(() => comenzarPartida(s, false), s.duracionIntro);
  }
}

function alPresionar(s, e) {
  if (s.girando) return;
  s.audio.reanudar();
  const fase = s.partida.fase;
  if (fase === 'pausada') {
    // Esc acaba de sacar al jugador de pantalla completa: no reanuda. Tab recorre las opciones.
    if (e.code === 'Escape' || e.code === 'Tab' || e.target.closest?.('a, button')) return;
    e.preventDefault();
    reanudarPartida(s);
    return;
  }
  if (fase === 'intro' && (e.code === 'Space' || esEnter(e))) {
    e.preventDefault();
    comenzarPartida(s, true);
    return;
  }
  if (s.editor) {
    alPresionarEnEditor(s, e);
    return;
  }
  const terminada = fase === 'acoplada' || fase === 'fallida';
  if (terminada && !e.repeat && (e.code === 'KeyR' || (esEnter(e) && !e.target.closest?.('a, button')))) {
    e.preventDefault();
    volverAJugar(s);
    return;
  }
  if (fase !== 'en-curso') return;
  if (e.key === CONFIG.acople.tecla) {
    e.preventDefault();
    if (!e.repeat) pedirAcople(s);
    return;
  }
  const accion = accionDeTecla(e.code);
  if (!accion) return;
  e.preventDefault();
  s.acciones = presionar(s.acciones, accion);
}

// Enter en plena partida: acopla o rechaza. La transicion a 'acoplada' la detecta tick() en el proximo frame.
function pedirAcople(s) {
  const rechazosAntes = s.partida.rechazos;
  const fase = s.partida.fase;
  s.partida = solicitarAcople(s.partida, CONFIG);
  if (s.partida.rechazos > rechazosAntes) {
    s.audio.evento('rechazo');
    vibrar(s, [30, 40, 30]);
  }
  if (fase === 'en-curso' && s.partida.fase === 'acoplada') terminarPartida(s);
}

function alSoltar(s, e) {
  const accion = accionDeTecla(e.code);
  if (accion) s.acciones = soltar(s.acciones, accion);
}

function alClic(s, e) {
  if (s.girando) return;
  s.audio.reanudar();
  const boton = e.target.closest('[data-accion]');
  if (!boton) return;
  const accion = boton.dataset.accion;
  if (accion === 'saltar-intro') comenzarPartida(s, true);
  if (accion === 'reintentar') volverAJugar(s);
  if (accion === 'confirmar-nombre' && s.editor) confirmarNombre(s);
  if (accion === 'seguir' && s.partida.fase === 'pausada') reanudarPartida(s);
  if (accion === 'acoplar' && s.partida.fase === 'en-curso') {
    pedirAcople(s);
    enfocarLienzo(s); // el foco vuelve al lienzo para seguir pilotando con el teclado
  }
  if (accion === 'pantalla') {
    if (pantalla.estaActiva(s.raiz)) pantalla.salir();
    else entrarPantalla(s);
  }
  if (accion === 'pausar') pausarPartida(s);
  if (accion === 'mute') {
    s.audio.setMute(!s.audio.estaMuteado());
    boton.setAttribute('aria-pressed', String(s.audio.estaMuteado()));
  }
}

async function crearJuego(s) {
  const modulo = await import(URL_PHASER);
  if (sesion !== s) return; // se desmonto mientras Phaser bajaba: descartar
  const Phaser = modulo.default ?? modulo;
  const Escena = crearEscenaAcople(Phaser, {
    obtenerPartida: () => s.partida,
    obtenerNivel: () => nivelDeEstado(s.estado),
    alAvanzar: (dt) => tick(s, dt),
    paleta: leerPaleta(),
    reducirMovimiento: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    obtenerConsola: () => medidasConsola(s.raiz),
  });
  s.game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: s.lienzo,
    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--color-fondo').trim(),
    banner: false,
    audio: { noAudio: true },
    input: { keyboard: false },
    scale: { mode: Phaser.Scale.RESIZE, width: s.lienzo.clientWidth, height: s.lienzo.clientHeight },
    scene: [Escena],
  });
}

function mostrarAviso(raiz, ui) {
  ui.mostrar('aviso');
  raiz.querySelector('[data-pantalla="aviso"] a')?.focus({ preventScroll: true });
}

export async function mount() {
  unmount();
  const raiz = document.querySelector('[data-acople]');
  if (!raiz) return;
  const ui = crearOverlays(raiz, { pantallaCompleta: pantalla.soportada() });

  const modo = modoEntrada({
    punteroGrueso: window.matchMedia('(pointer: coarse)').matches,
    algunPunteroFino: window.matchMedia('(any-pointer: fine)').matches,
    forzado: new URLSearchParams(location.search).get('entrada'),
  });
  raiz.dataset.entrada = modo;
  // Cabina a toda la pantalla visible en tactil: el iPhone no tiene Fullscreen API para elementos (010 R4).
  if (modo === 'tactil') raiz.dataset.cabina = '';

  const s = {
    raiz,
    ui,
    modo,
    lienzo: raiz.querySelector('[data-acople-lienzo]'),
    partida: crearPartida(CONFIG, { conIntro: true }),
    estado: 'APPROACHING',
    acciones: soltarTodo(),
    toques: levantarTodo(),
    mandos: null,
    ranking: [],
    editor: null,
    girando: false,
    duracionIntro: DURACION_INTRO_MS,
    audio: crearAudioAcople(),
    ultimoHud: 0,
    game: null,
    temporizadorIntro: null,
    limpiezas: [],
  };
  sesion = s;

  if (modo === 'tactil') {
    s.mandos = conectarControles(raiz, {
      alCambiar: (toques) => {
        s.toques = toques;
      },
      alTocar: () => s.audio.reanudar(),
    });
    s.limpiezas.push(s.mandos.limpiar);
  }

  raiz.querySelector('[data-accion="mute"]')?.setAttribute('aria-pressed', String(s.audio.estaMuteado()));
  const { entradas } = leerRanking(almacenamiento(), CONFIG);
  ui.mostrar('intro');
  ui.pintarRanking('intro', filasRanking(entradas, -1, CONFIG, { completar: false }));
  ui.pintarPantalla(false);
  s.duracionIntro = entradas.length ? DURACION_INTRO_CON_RANKING_MS : DURACION_INTRO_MS;
  s.temporizadorIntro = setTimeout(() => comenzarPartida(s, false), s.duracionIntro);
  if (modo === 'tactil') {
    evaluarGiro(s);
    escuchar(s, window.matchMedia('(orientation: portrait)'), 'change', () => evaluarGiro(s));
    escuchar(s, window, 'resize', () => evaluarGiro(s));
  }
  escuchar(s, window, 'keydown', (e) => alPresionar(s, e));
  escuchar(s, window, 'keyup', (e) => alSoltar(s, e));
  escuchar(s, raiz, 'click', (e) => alClic(s, e));
  escuchar(s, window, 'blur', () => pausarPartida(s));
  escuchar(s, document, 'fullscreenchange', () => alCambiarPantalla(s));
  escuchar(s, document, 'visibilitychange', () => {
    if (document.hidden) pausarPartida(s);
  });

  try {
    await crearJuego(s);
  } catch (err) {
    console.error('[acople] no se pudo cargar el motor del simulador:', err);
    if (sesion === s) {
      mostrarAviso(raiz, ui);
    }
  }
}

export function unmount() {
  const s = sesion;
  if (!s) return;
  sesion = null; // primero: un import() en vuelo vera que la sesion ya no es la suya
  clearTimeout(s.temporizadorIntro);
  if (pantalla.estaActiva(s.raiz)) pantalla.salir();
  delete s.raiz.dataset.cabina;
  if (s.game) {
    s.game.destroy(true);
    s.game = null;
  }
  s.limpiezas.forEach((limpiar) => limpiar());
  s.limpiezas = [];
  s.audio.cerrar();
}

if (typeof document !== 'undefined' && !window.__SWUP_ROUTER_ACTIVE__) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => mount());
  } else {
    mount();
  }
}
