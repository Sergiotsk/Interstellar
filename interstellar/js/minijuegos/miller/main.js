// Modulo de pagina de Miller: mount/unmount para swup, carga de Phaser y conexion logica-escena-DOM.
// Mismo ciclo de vida que el acople: docs/20-notas-de-codigo/minijuegos-acople.md
import { CONFIG, PALETA_PIXEL, ANIM } from './config.js';
import { SPRITES, ANIMACIONES, LEYENDA } from './sprites.js';
import { crearPartida, saltarIntro, conAcciones, avanzar, pausar, reanudar, reintentar, estadoHud } from './logica/mision.js';
import { escalaEntera } from './logica/escala.js';
import { intensidadSenal, frecuenciaPulso } from './logica/baliza.js';
import { accionDeTecla, accionesDe, presionar, soltar, soltarTodo } from '../comun/logica/acciones.js';
import { leerRanking, posicionEnRanking, insertarEntrada, guardarEnRanking } from '../comun/logica/ranking.js';
import { crearEditor, textoEditor, teclaEditor, fijarCursor } from '../comun/logica/nombre-arcade.js';
import { modoEntrada, requiereGiro } from '../comun/logica/dispositivo.js';
import { filasRanking } from '../comun/logica/tabla-ranking.js';
import * as pantalla from '../comun/pantalla-completa.js';
import { crearOverlays, lecturasHud } from './overlays.js';
import { crearEscenaMiller } from './escena-miller.js';
import { crearEscenaGaleria } from './escena-galeria.js';
import { crearAudioMiller } from './audio-miller.js';
import { conectarControles } from './controles-tactiles.js';

const URL_PHASER = '../../vendor/phaser@4.2.1/phaser.esm.min.js';
const INTERVALO_HUD_MS = 100;
const ESPERA_RESULTADO_MS = { exito: 1600, fracaso: 1400 }; // dejan ver el despegue o el barrido de la ola
const EN_JUEGO = ['exploracion', 'huida', 'despegue'];
const FINALES = ['exito', 'fracaso'];
const VELOCIDAD_PASOS = 10;

let sesion = null;

function almacenamiento() {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined; // con el almacenamiento bloqueado, el solo acceso puede lanzar
  }
}

// La semilla del mapa: fija por URL para reproducir un mapa, o nueva en cada partida.
function nuevaSemilla() {
  const fija = Number.parseInt(new URLSearchParams(location.search).get('semilla'), 10);
  return Number.isInteger(fija) ? fija : (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
}

function escuchar(s, objetivo, evento, fn, opciones) {
  objetivo.addEventListener(evento, fn, opciones);
  s.limpiezas.push(() => objetivo.removeEventListener(evento, fn, opciones));
}

function programar(s, fn, ms) {
  const id = setTimeout(fn, ms);
  s.temporizadores.push(id);
  return id;
}

function soltarControles(s) {
  s.acciones = soltarTodo();
  s.tactiles = new Set();
  s.mandos?.soltar();
}

function accionesEfectivas(s) {
  return new Set([...s.acciones, ...s.tactiles]);
}

function vibrar(s, patron) {
  if (s.modo === 'tactil' && !s.audio.estaMuteado()) navigator.vibrate?.(patron);
}

function enfocarLienzo(s) {
  s.lienzo.focus({ preventScroll: true });
}

// En tactil, el gesto que arranca la partida tambien pide pantalla completa y horizontal.
function entrarPantalla(s) {
  if (s.modo !== 'tactil' || pantalla.estaActiva(s.raiz)) return;
  pantalla.entrar(s.raiz).then((ok) => ok && pantalla.bloquearHorizontal());
}

function ajustarEscala(s) {
  const canvas = s.game?.canvas;
  if (!canvas) return;
  const { base } = CONFIG.mundo;
  const k = escalaEntera(s.lienzo.clientWidth, s.lienzo.clientHeight, base);
  canvas.style.width = `${base.ancho * k}px`;
  canvas.style.height = `${base.alto * k}px`;
}

function comenzar(s) {
  if (s.partida.fase !== 'intro') return;
  s.partida = saltarIntro(s.partida);
  s.ui.mostrar('hud');
  entrarPantalla(s);
  enfocarLienzo(s);
}

function pausarPartida(s) {
  const { fase, pausada } = s.partida;
  if (pausada || !(EN_JUEGO.includes(fase) || fase === 'cuenta')) return;
  s.partida = pausar(s.partida);
  soltarControles(s);
  s.ui.mostrar('pausa');
}

function reanudarPartida(s) {
  if (!s.partida.pausada || s.girando) return;
  s.partida = reanudar(s.partida);
  s.ui.mostrar('hud');
  entrarPantalla(s);
  enfocarLienzo(s);
}

// Reintentar reusa el Game ya creado: partida nueva (otra semilla, sin intro) y la escena rearma el mapa.
function volverAJugar(s) {
  if (!s.puedeReintentar) return;
  s.ui.cancelar();
  s.editor = null;
  s.puedeReintentar = false;
  s.partida = reintentar(s.partida, CONFIG, nuevaSemilla());
  soltarControles(s);
  s.escena?.reiniciar();
  s.ui.reiniciarHud();
  s.ui.mostrar('hud');
  entrarPantalla(s);
  enfocarLienzo(s);
}

function habilitarReintento(s) {
  s.puedeReintentar = true;
  s.ui.mostrarAcciones(true);
  s.ui.iniciarContinue();
  s.ui.enfocarResultado();
}

function terminarPartida(s) {
  soltarControles(s);
  const r = s.partida.resultado;
  const { entradas, ultimoNombre } = leerRanking(almacenamiento(), CONFIG);
  const posicion = r.exito ? posicionEnRanking(entradas, r.puntaje, CONFIG) : -1;
  s.ranking = entradas;
  s.ui.mostrar('resultado');
  s.ui.pintarRanking('resultado', filasRanking(entradas, -1, CONFIG));
  s.ui.pintarResultado(r, {
    posicion,
    alTick: () => s.audio.evento('tick'),
    alTerminar: () => {
      s.audio.evento('tickFinal');
      if (posicion >= 0) {
        s.editor = crearEditor(ultimoNombre || CONFIG.ranking.nombrePorDefecto, CONFIG);
        s.ui.mostrarEditor(true);
        pintarEditor(s);
      } else {
        habilitarReintento(s);
      }
    },
  });
  s.ui.enfocarResultado();
}

// Mientras se carga el nombre, la tabla muestra la fila provisoria con lo que se va tipeando.
function pintarEditor(s) {
  const provisoria = insertarEntrada(s.ranking, { nombre: textoEditor(s.editor), puntaje: s.partida.resultado.puntaje }, CONFIG);
  s.ui.pintarEditor(s.editor);
  s.ui.pintarRanking('resultado', filasRanking(provisoria.entradas, provisoria.posicion, CONFIG));
}

function confirmarNombre(s) {
  const r = s.partida.resultado;
  const desenlace = { exito: r.exito, puntaje: r.puntaje, tiempoTotal: r.tiempoMision };
  const guardado = guardarEnRanking(desenlace, textoEditor(s.editor), almacenamiento(), CONFIG);
  s.editor = null;
  if (guardado.guardado) s.ranking = guardado.entradas;
  s.ui.mostrarEditor(false);
  s.ui.pintarRanking('resultado', filasRanking(s.ranking, guardado.posicion, CONFIG));
  habilitarReintento(s);
}

function alPresionarEnEditor(s, e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if ((e.key === 'Enter' || e.key === ' ') && e.target.closest?.('a, button')) return;
  const r = teclaEditor(s.editor, e.key, CONFIG);
  if (!r.manejada) return;
  e.preventDefault();
  // La accion sostenida del despegue no debe confirmar el nombre de un saque.
  if (r.confirmar) {
    if (!e.repeat) confirmarNombre(s);
    return;
  }
  s.editor = r.editor;
  pintarEditor(s);
}

// Eventos de la logica -> escena, sonido, banners y hit-stop.
function procesarEventos(s, eventos) {
  for (const nombre of eventos) {
    s.escena?.evento(nombre);
    if (nombre === 'inicio') {
      s.ui.banner('Mission 02 start');
      s.audio.evento('banner');
    }
    if (nombre === 'baliza') {
      s.ui.banner('Beacon acquired!');
      s.audio.evento('baliza');
      vibrar(s, 30);
    }
    if (nombre === 'choque') {
      s.audio.evento('choque');
      if (!s.reducirMovimiento) s.congeladoHasta = performance.now() + ANIM.hitStopMs;
      vibrar(s, 50);
    }
    if (nombre === 'impulso') s.audio.evento('impulso');
    if (nombre === 'despegue') s.audio.evento('despegue');
    if (nombre === 'fracaso') {
      s.audio.evento('fracaso');
      vibrar(s, [60, 40, 120]);
    }
  }
}

function tick(s, dt) {
  // Hit-stop: el mundo se congela unos ms en un impacto fuerte; la escena sigue dibujando.
  if (performance.now() < s.congeladoHasta) return;
  const antes = s.partida;
  const entrada = conAcciones(antes, accionesEfectivas(s));
  const nueva = avanzar(entrada, dt, CONFIG);
  if (nueva === entrada) return; // pausada o terminada: no hay eventos nuevos
  s.partida = nueva;
  procesarEventos(s, nueva.eventos);

  if (antes.fase === 'intro' && nueva.fase === 'cuenta') s.ui.mostrar('hud');
  s.ui.pintarCuenta(nueva.fase === 'cuenta' ? Math.max(1, Math.ceil(CONFIG.cuentaS - nueva.tFase)) : null);

  const estado = estadoHud(nueva);
  if (estado === 'WAVE INCOMING' && s.estado !== 'WAVE INCOMING') {
    s.ui.banner('Wave incoming!', 'alerta');
    s.audio.evento('banner');
  }
  s.estado = estado;

  const enJuego = EN_JUEGO.includes(nueva.fase);
  const { jugador, mapa, balizaRecogida, despegue } = nueva;
  s.audio.actualizar({
    enJuego,
    revelada: nueva.ola.revelada,
    nivel: nueva.nivel,
    pulsoHz: enJuego && !balizaRecogida ? frecuenciaPulso(intensidadSenal(jugador, mapa.baliza, CONFIG), CONFIG) : 0,
    moviendose: Math.hypot(jugador.vx, jugador.vz) > VELOCIDAD_PASOS,
    carga: nueva.fase === 'despegue' ? despegue.carga : 0,
  });

  const ahora = performance.now();
  if (ahora - s.ultimoHud > INTERVALO_HUD_MS || antes.fase !== nueva.fase) {
    s.ultimoHud = ahora;
    s.ui.pintarHud(lecturasHud(nueva, CONFIG));
  }
  if (!FINALES.includes(antes.fase) && FINALES.includes(nueva.fase)) {
    soltarControles(s);
    programar(s, () => terminarPartida(s), ESPERA_RESULTADO_MS[nueva.fase]);
  }
}

// Vertical en tactil: capa de giro encima y partida en pausa (mismo criterio que el acople, 010 R6).
function evaluarGiro(s) {
  const girar = requiereGiro({ modo: s.modo, ancho: window.innerWidth, alto: window.innerHeight });
  if (girar === s.girando) return;
  s.girando = girar;
  s.raiz.querySelector('[data-aviso-giro]').hidden = !girar;
  if (girar) pausarPartida(s);
}

function alPresionar(s, e) {
  if (s.girando) return;
  s.audio.reanudar();
  const { fase, pausada } = s.partida;
  if (pausada) {
    // Esc acaba de sacar al jugador de pantalla completa: no reanuda. Tab recorre las opciones.
    if (e.code === 'Escape' || e.code === 'Tab' || e.target.closest?.('a, button')) return;
    e.preventDefault();
    reanudarPartida(s);
    return;
  }
  if (fase === 'intro' && (e.code === 'Space' || e.key === 'Enter')) {
    e.preventDefault();
    comenzar(s);
    return;
  }
  if (s.editor) {
    alPresionarEnEditor(s, e);
    return;
  }
  if (FINALES.includes(fase)) {
    if (!e.repeat && (e.code === 'KeyR' || (e.key === 'Enter' && !e.target.closest?.('a, button')))) {
      e.preventDefault();
      volverAJugar(s);
    }
    return;
  }
  const accion = accionDeTecla(e.code, CONFIG.teclas);
  if (!accion) return;
  e.preventDefault();
  if (accion === 'pausa') pausarPartida(s);
  else s.acciones = presionar(s.acciones, accion);
}

function alSoltar(s, e) {
  const accion = accionDeTecla(e.code, CONFIG.teclas);
  if (accion) s.acciones = soltar(s.acciones, accion);
}

function clicEnEditor(s, e) {
  const tecla = e.target.closest('[data-tecla-editor]');
  if (tecla) {
    const r = teclaEditor(s.editor, tecla.dataset.teclaEditor, CONFIG);
    if (r.confirmar) confirmarNombre(s);
    else {
      s.editor = r.editor;
      pintarEditor(s);
    }
    return true;
  }
  const casilla = e.target.closest('[data-casilla]');
  if (casilla) {
    s.editor = fijarCursor(s.editor, Number(casilla.dataset.casilla), CONFIG);
    pintarEditor(s);
    return true;
  }
  return false;
}

function alClic(s, e) {
  if (s.girando) return;
  s.audio.reanudar();
  if (s.editor && clicEnEditor(s, e)) return;
  const boton = e.target.closest('[data-accion]');
  if (!boton) return;
  const accion = boton.dataset.accion;
  if (accion === 'saltar-intro') comenzar(s);
  if (accion === 'reintentar') volverAJugar(s);
  if (accion === 'confirmar-nombre' && s.editor) confirmarNombre(s);
  if (accion === 'seguir') reanudarPartida(s);
  if (accion === 'pausar') pausarPartida(s);
  if (accion === 'pantalla') {
    if (pantalla.estaActiva(s.raiz)) pantalla.salir();
    else pantalla.entrar(s.raiz).then((ok) => ok && s.modo === 'tactil' && pantalla.bloquearHorizontal());
  }
  if (accion === 'mute') {
    s.audio.setMute(!s.audio.estaMuteado());
    boton.setAttribute('aria-pressed', String(s.audio.estaMuteado()));
  }
}

// Salir de pantalla completa en plena partida la pausa.
function alCambiarPantalla(s) {
  const activa = pantalla.estaActiva(s.raiz);
  s.ui.pintarPantalla(activa);
  if (!activa) pausarPartida(s);
}

async function crearJuego(s, depurarSprites) {
  const modulo = await import(URL_PHASER);
  if (sesion !== s) return; // se desmonto mientras Phaser bajaba: descartar
  const Phaser = modulo.default ?? modulo;
  const comunes = { sprites: SPRITES, animaciones: ANIMACIONES, leyenda: LEYENDA, paleta: PALETA_PIXEL };
  const Escena = depurarSprites
    ? crearEscenaGaleria(Phaser, comunes)
    : crearEscenaMiller(Phaser, {
        ...comunes,
        config: CONFIG,
        obtenerPartida: () => s.partida,
        alAvanzar: (dt) => tick(s, dt),
        alCrear: (escena) => {
          s.escena = escena;
        },
        reducirMovimiento: s.reducirMovimiento,
        topeParticulas: CONFIG.particulas.tope[s.modo],
      });
  const { base } = CONFIG.mundo;
  s.game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: s.lienzo,
    width: base.ancho,
    height: base.alto,
    pixelArt: true,
    roundPixels: true,
    antialias: false,
    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--color-fondo').trim(),
    banner: false,
    audio: { noAudio: true },
    input: { keyboard: false, mouse: false, touch: false, gamepad: false },
    scale: { mode: Phaser.Scale.NONE, width: base.ancho, height: base.alto },
    scene: [Escena],
  });
  s.game.events.once('ready', () => ajustarEscala(s));
  ajustarEscala(s);
}

export async function mount() {
  unmount();
  const raiz = document.querySelector('[data-miller]');
  if (!raiz) return;
  const parametros = new URLSearchParams(location.search);
  const modo = modoEntrada({
    punteroGrueso: window.matchMedia('(pointer: coarse)').matches,
    algunPunteroFino: window.matchMedia('(any-pointer: fine)').matches,
    forzado: parametros.get('entrada'),
  });
  const ui = crearOverlays(raiz, { pantallaCompleta: pantalla.soportada(), tactil: modo === 'tactil', config: CONFIG });
  raiz.dataset.entrada = modo;
  // Cabina a toda la pantalla visible en tactil: el iPhone no tiene Fullscreen API para elementos.
  if (modo === 'tactil') raiz.dataset.cabina = '';

  const s = {
    raiz,
    ui,
    modo,
    lienzo: raiz.querySelector('[data-miller-lienzo]'),
    partida: crearPartida(CONFIG, { semilla: nuevaSemilla(), conIntro: true }),
    estado: 'SEARCHING',
    acciones: soltarTodo(),
    tactiles: new Set(),
    mandos: null,
    ranking: [],
    editor: null,
    puedeReintentar: false,
    girando: false,
    congeladoHasta: 0,
    ultimoHud: 0,
    reducirMovimiento: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    audio: crearAudioMiller(CONFIG.audio[modo]),
    game: null,
    escena: null,
    temporizadores: [],
    limpiezas: [],
  };
  sesion = s;

  if (modo === 'tactil') {
    s.mandos = conectarControles(raiz, {
      alCambiar: (acciones) => {
        s.tactiles = acciones;
      },
      alTocar: () => s.audio.reanudar(),
      acciones: accionesDe(CONFIG.teclas),
    });
    s.limpiezas.push(s.mandos.limpiar);
  }

  raiz.querySelector('[data-accion="mute"]')?.setAttribute('aria-pressed', String(s.audio.estaMuteado()));
  const { entradas } = leerRanking(almacenamiento(), CONFIG);
  ui.pintarRanking('intro', filasRanking(entradas, -1, CONFIG, { completar: false }));
  const depurarSprites = parametros.get('debug') === 'sprites';
  ui.mostrar(depurarSprites ? 'ninguna' : 'intro');
  ui.pintarPantalla(false);
  ui.pintarHud(lecturasHud(s.partida, CONFIG));

  if (modo === 'tactil') {
    evaluarGiro(s);
    escuchar(s, window.matchMedia('(orientation: portrait)'), 'change', () => evaluarGiro(s));
  }
  escuchar(s, window, 'resize', () => {
    if (modo === 'tactil') evaluarGiro(s);
    ajustarEscala(s);
  });
  escuchar(s, window, 'keydown', (e) => alPresionar(s, e));
  escuchar(s, window, 'keyup', (e) => alSoltar(s, e));
  escuchar(s, raiz, 'click', (e) => alClic(s, e));
  escuchar(s, window, 'blur', () => pausarPartida(s));
  escuchar(s, document, 'fullscreenchange', () => {
    alCambiarPantalla(s);
    ajustarEscala(s);
  });
  escuchar(s, document, 'visibilitychange', () => {
    if (document.hidden) pausarPartida(s);
  });

  try {
    await crearJuego(s, depurarSprites);
  } catch (err) {
    console.error('[miller] no se pudo cargar el motor del simulador:', err);
    if (sesion === s) {
      ui.mostrar('aviso');
      raiz.querySelector('[data-pantalla="aviso"] a')?.focus({ preventScroll: true });
    }
  }
}

export function unmount() {
  const s = sesion;
  if (!s) return;
  sesion = null; // primero: un import() en vuelo vera que la sesion ya no es la suya
  s.temporizadores.forEach(clearTimeout);
  s.ui.cancelar();
  if (pantalla.estaActiva(s.raiz)) pantalla.salir();
  delete s.raiz.dataset.cabina;
  if (s.game) {
    s.game.destroy(true);
    s.game = null;
  }
  s.escena = null;
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
