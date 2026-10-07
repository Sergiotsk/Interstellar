// Modulo de pagina del simulador de acople: mount/unmount para swup, carga de Phaser y conexion logica-escena-DOM.
// Ciclo de vida y cancelacion del import: docs/20-notas-de-codigo/minijuegos-acople.md
import { CONFIG } from './config.js';
import { accionDeTecla, presionar, soltar, soltarTodo } from './logica/acciones.js';
import { crearPartida, iniciar, conAcciones, avanzar, estadoHud, nivelDeEstado, reintentar } from './logica/mision.js';
import { guardarSiMejor } from './logica/record.js';
import { crearOverlays, lecturasHud } from './overlays.js';
import { crearEscenaAcople } from './escena-acople.js';

const URL_PHASER = 'https://cdn.jsdelivr.net/npm/phaser@4.2.1/dist/phaser.esm.min.js';
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

function escuchar(s, objetivo, evento, fn, opciones) {
  objetivo.addEventListener(evento, fn, opciones);
  s.limpiezas.push(() => objetivo.removeEventListener(evento, fn, opciones));
}

function comenzarPartida(s) {
  if (s.partida.fase !== 'intro') return;
  clearTimeout(s.temporizadorIntro);
  s.partida = iniciar(s.partida);
  s.ui.mostrar('hud');
  s.lienzo.focus({ preventScroll: true });
}

// Reintentar reusa el Game ya creado: solo se reemplaza la partida (sin intro, FR-009).
function volverAJugar(s) {
  s.partida = reintentar(s.partida, CONFIG);
  s.acciones = soltarTodo();
  s.ui.mostrar('hud');
  s.lienzo.focus({ preventScroll: true });
}

function almacenamiento() {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined; // con el almacenamiento bloqueado, el solo acceso puede lanzar
  }
}

function terminarPartida(s) {
  s.acciones = soltarTodo();
  const infoRecord = guardarSiMejor(s.partida.desenlace, almacenamiento(), CONFIG);
  s.ui.pintarResultado(s.partida.desenlace, infoRecord);
  s.ui.mostrar('resultado');
}

function tick(s, dt) {
  const fase = s.partida.fase;
  s.partida = avanzar(conAcciones(s.partida, s.acciones), dt, CONFIG);
  s.estado = estadoHud(s.partida, CONFIG);
  const ahora = performance.now();
  if (ahora - s.ultimoHud > INTERVALO_HUD_MS || s.partida.fase !== fase) {
    s.ultimoHud = ahora;
    s.ui.pintarHud(lecturasHud(s.partida, CONFIG), s.estado, nivelDeEstado(s.estado));
  }
  if (fase === 'en-curso' && (s.partida.fase === 'acoplada' || s.partida.fase === 'fallida')) terminarPartida(s);
}

function alPresionar(s, e) {
  const fase = s.partida.fase;
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
  const boton = e.target.closest('[data-accion]');
  if (!boton) return;
  if (boton.dataset.accion === 'saltar-intro') comenzarPartida(s);
  if (boton.dataset.accion === 'reintentar') volverAJugar(s);
}

async function crearJuego(s) {
  const modulo = await import(URL_PHASER);
  if (sesion !== s) return; // se desmonto mientras Phaser bajaba
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

export async function mount() {
  unmount();
  const raiz = document.querySelector('[data-acople]');
  if (!raiz) return;

  const s = {
    raiz,
    lienzo: raiz.querySelector('[data-acople-lienzo]'),
    ui: crearOverlays(raiz),
    partida: crearPartida(CONFIG, { conIntro: true }),
    estado: 'APPROACHING',
    acciones: soltarTodo(),
    ultimoHud: 0,
    game: null,
    temporizadorIntro: null,
    limpiezas: [],
  };
  sesion = s;

  s.ui.mostrar('intro');
  s.temporizadorIntro = setTimeout(() => comenzarPartida(s), DURACION_INTRO_MS);
  escuchar(s, window, 'keydown', (e) => alPresionar(s, e));
  escuchar(s, window, 'keyup', (e) => alSoltar(s, e));
  escuchar(s, raiz, 'click', (e) => alClic(s, e));

  try {
    await crearJuego(s);
  } catch (err) {
    console.error('[acople] no se pudo cargar el motor del simulador:', err);
  }
}

export function unmount() {
  const s = sesion;
  if (!s) return;
  sesion = null;
  clearTimeout(s.temporizadorIntro);
  s.limpiezas.forEach((limpiar) => limpiar());
  s.limpiezas = [];
  if (s.game) {
    s.game.destroy(true);
    s.game = null;
  }
}

if (typeof document !== 'undefined' && !window.__SWUP_ROUTER_ACTIVE__) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => mount());
  } else {
    mount();
  }
}
