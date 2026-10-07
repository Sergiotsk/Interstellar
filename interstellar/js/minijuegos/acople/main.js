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
  estadoHud,
  nivelDeEstado,
} from './logica/mision.js';
import { guardarSiMejor } from './logica/record.js';
import { debeMostrarAvisoDesktop } from './logica/dispositivo.js';
import { crearOverlays, lecturasHud } from './overlays.js';
import { crearEscenaAcople } from './escena-acople.js';
import { crearAudioAcople } from './audio-acople.js';

const URL_PHASER = '../../vendor/phaser@4.2.1/phaser.esm.min.js';
const DURACION_INTRO_MS = 8000;
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

function comenzarPartida(s) {
  if (s.partida.fase !== 'intro') return;
  clearTimeout(s.temporizadorIntro);
  s.partida = iniciar(s.partida);
  s.ui.mostrar('hud');
  enfocarLienzo(s);
}

// Reintentar reusa el Game ya creado: solo se reemplaza la partida (sin intro, FR-009).
function volverAJugar(s) {
  s.partida = reintentar(s.partida, CONFIG);
  s.acciones = soltarTodo();
  s.ui.mostrar('hud');
  enfocarLienzo(s);
}

function pausarPartida(s) {
  if (s.partida.fase !== 'en-curso') return;
  s.partida = pausar(s.partida);
  s.acciones = soltarTodo();
  s.audio.actualizar(s.estado, s.acciones, false);
  s.ui.mostrar('pausa');
}

function reanudarPartida(s) {
  s.partida = reanudar(s.partida);
  s.ui.mostrar('hud');
  enfocarLienzo(s);
}

function terminarPartida(s) {
  s.acciones = soltarTodo();
  const { desenlace } = s.partida;
  if (desenlace.exito) s.audio.evento('acople');
  if (desenlace.causa === 'impacto') s.audio.evento('impacto');
  const infoRecord = guardarSiMejor(desenlace, almacenamiento(), CONFIG);
  s.ui.pintarResultado(desenlace, infoRecord);
  s.ui.mostrar('resultado');
}

function tick(s, dt) {
  const fase = s.partida.fase;
  s.partida = avanzar(conAcciones(s.partida, s.acciones), dt, CONFIG);
  s.estado = estadoHud(s.partida, CONFIG);
  s.audio.actualizar(s.estado, s.acciones, s.partida.fase === 'en-curso');
  const ahora = performance.now();
  if (ahora - s.ultimoHud > INTERVALO_HUD_MS || s.partida.fase !== fase) {
    s.ultimoHud = ahora;
    s.ui.pintarHud(lecturasHud(s.partida, CONFIG), s.estado, nivelDeEstado(s.estado));
  }
  if (fase === 'en-curso' && (s.partida.fase === 'acoplada' || s.partida.fase === 'fallida')) terminarPartida(s);
}

function alPresionar(s, e) {
  s.audio.reanudar();
  const fase = s.partida.fase;
  if (fase === 'pausada') {
    e.preventDefault();
    reanudarPartida(s);
    return;
  }
  if (fase === 'intro' && ['Space', 'Enter', 'Escape'].includes(e.code)) {
    e.preventDefault();
    comenzarPartida(s);
    return;
  }
  const terminada = fase === 'acoplada' || fase === 'fallida';
  if (terminada && (e.code === 'KeyR' || (e.code === 'Enter' && !e.target.closest?.('a, button')))) {
    e.preventDefault();
    volverAJugar(s);
    return;
  }
  if (fase !== 'en-curso') return;
  const accion = accionDeTecla(e.code);
  if (!accion) return;
  e.preventDefault();
  s.acciones = presionar(s.acciones, accion);
}

function alSoltar(s, e) {
  const accion = accionDeTecla(e.code);
  if (accion) s.acciones = soltar(s.acciones, accion);
}

function alClic(s, e) {
  s.audio.reanudar();
  if (s.partida.fase === 'pausada') {
    reanudarPartida(s);
    return;
  }
  const boton = e.target.closest('[data-accion]');
  if (!boton) return;
  const accion = boton.dataset.accion;
  if (accion === 'saltar-intro') comenzarPartida(s);
  if (accion === 'reintentar') volverAJugar(s);
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
  const ui = crearOverlays(raiz);

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
    audio: crearAudioAcople(),
    ultimoHud: 0,
    game: null,
    temporizadorIntro: null,
    limpiezas: [],
  };
  sesion = s;

  raiz.querySelector('[data-accion="mute"]')?.setAttribute('aria-pressed', String(s.audio.estaMuteado()));
  ui.mostrar('intro');
  s.temporizadorIntro = setTimeout(() => comenzarPartida(s), DURACION_INTRO_MS);
  escuchar(s, window, 'keydown', (e) => alPresionar(s, e));
  escuchar(s, window, 'keyup', (e) => alSoltar(s, e));
  escuchar(s, raiz, 'click', (e) => alClic(s, e));
  escuchar(s, window, 'blur', () => pausarPartida(s));
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
