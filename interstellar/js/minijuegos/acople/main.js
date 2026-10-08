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
import { debeMostrarAvisoDesktop } from './logica/dispositivo.js';
import { instrumentos } from './logica/instrumentos.js';
import { crearOverlays, lecturasHud, filasRanking } from './overlays.js';
import { crearEscenaAcople } from './escena-acople.js';
import { crearAudioAcople } from './audio-acople.js';
import * as pantalla from './pantalla-completa.js';

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
  if (conGesto) pantalla.entrar(s.raiz);
}

// Reintentar reusa el Game ya creado: solo se reemplaza la partida (sin intro, FR-009).
function volverAJugar(s) {
  s.editor = null;
  s.partida = reintentar(s.partida, CONFIG);
  s.acciones = soltarTodo();
  s.ui.mostrar('hud');
  enfocarLienzo(s);
  pantalla.entrar(s.raiz);
}

function pausarPartida(s) {
  if (s.partida.fase !== 'en-curso') return;
  s.partida = pausar(s.partida);
  s.acciones = soltarTodo();
  s.audio.actualizar(s.estado, s.acciones, false, s.partida.nave.distancia);
  s.ui.mostrar('pausa');
}

function reanudarPartida(s) {
  s.partida = reanudar(s.partida);
  s.ui.mostrar('hud');
  enfocarLienzo(s);
  pantalla.entrar(s.raiz);
}

// Salir de pantalla completa en plena partida la pausa (FR-042).
function alCambiarPantalla(s) {
  const activa = pantalla.estaActiva(s.raiz);
  s.ui.pintarPantalla(activa);
  if (!activa) pausarPartida(s);
}

function terminarPartida(s) {
  s.acciones = soltarTodo();
  const { desenlace } = s.partida;
  if (desenlace.exito) s.audio.evento('acople');
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
  s.partida = avanzar(conAcciones(s.partida, s.acciones), dt, CONFIG);
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
      indicacionHud(s.partida, s.estado),
      instrumentos(s.partida, CONFIG),
    );
  }
  if (fase === 'en-curso' && (s.partida.fase === 'acoplada' || s.partida.fase === 'fallida')) terminarPartida(s);
}

// e.key y no e.code: el Enter del teclado numerico tiene code 'NumpadEnter' pero key 'Enter'.
const esEnter = (e) => e.key === 'Enter';

function alPresionar(s, e) {
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
  if (s.partida.rechazos > rechazosAntes) s.audio.evento('rechazo');
  if (fase === 'en-curso' && s.partida.fase === 'acoplada') terminarPartida(s);
}

function alSoltar(s, e) {
  const accion = accionDeTecla(e.code);
  if (accion) s.acciones = soltar(s.acciones, accion);
}

function alClic(s, e) {
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
    else pantalla.entrar(s.raiz);
  }
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

  const aviso = debeMostrarAvisoDesktop({
    punteroGrueso: window.matchMedia('(pointer: coarse)').matches,
    algunPunteroFino: window.matchMedia('(any-pointer: fine)').matches,
  });
  if (aviso) {
    mostrarAviso(raiz, ui);
    return; // sin teclado no se juega: ni siquiera se descarga el motor
  }

  const s = {
    raiz,
    ui,
    lienzo: raiz.querySelector('[data-acople-lienzo]'),
    partida: crearPartida(CONFIG, { conIntro: true }),
    estado: 'APPROACHING',
    acciones: soltarTodo(),
    ranking: [],
    editor: null,
    audio: crearAudioAcople(),
    ultimoHud: 0,
    game: null,
    temporizadorIntro: null,
    limpiezas: [],
  };
  sesion = s;

  raiz.querySelector('[data-accion="mute"]')?.setAttribute('aria-pressed', String(s.audio.estaMuteado()));
  const { entradas } = leerRanking(almacenamiento(), CONFIG);
  ui.mostrar('intro');
  ui.pintarRanking('intro', filasRanking(entradas, -1, CONFIG, { completar: false }));
  ui.pintarPantalla(false);
  const duracionIntro = entradas.length ? DURACION_INTRO_CON_RANKING_MS : DURACION_INTRO_MS;
  s.temporizadorIntro = setTimeout(() => comenzarPartida(s, false), duracionIntro);
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
      ui.mostrarFalla();
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
