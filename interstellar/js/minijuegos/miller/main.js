// Modulo de pagina de Miller: mount/unmount para swup y el flujo del componente App del original
// (START -> PLAYING -> VICTORY | GAME_OVER, con menu de pausa), sin React.
import { CONFIG } from './config.js';
import { crearRng } from './logica/azar.js';
import { crearSim } from './logica/estado.js';
import { actualizar } from './logica/motor.js';
import { abordar, dispararMisil, detonarEmp, cambiarArma } from './logica/nave.js';
import { sonar } from './logica/efectos.js';
import { leerHall, filasHall, guardarEnHall } from './logica/hall-of-fame.js';
import { modoEntrada, requiereGiro } from '../comun/logica/dispositivo.js';
import * as pantalla from '../comun/pantalla-completa.js';
import { crearHud } from './hud.js';
import { crearEscenaMiller } from './escena-miller.js';
import { SynthAudio, crearMusica } from './audio-miller.js';
import { conectarTactil } from './controles.js';

const URL_PHASER = '../../vendor/phaser@4.2.1/phaser.esm.min.js';
const URL_MUSICA = 'assets/audio/minijuegos/miller-ambiente.mp3';
const DIMS = { ancho: CONFIG.baseCanvasWidth, alto: CONFIG.baseCanvasHeight };
const INTERVALO_HUD_MS = 50;

// El useInput del helper del Playground: mapeo por e.key.
const TECLAS_MOVIMIENTO = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', a: 'left', d: 'right', w: 'up', s: 'down' };
const TECLAS_CONFIRMAR = ['Enter', ' '];
const TECLAS_DISPARO = ['j', 'J', 'x', 'X', 'z', 'Z', 'Enter'];

let sesion = null;

function almacenamiento() {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

const entradaVacia = () => ({ left: false, right: false, up: false, down: false, confirm: false, tap: false, pointerDown: false });

function escuchar(s, objetivo, evento, fn, opciones) {
  objetivo.addEventListener(evento, fn, opciones);
  s.limpiezas.push(() => objetivo.removeEventListener(evento, fn, opciones));
}

function nuevaSim() {
  const semilla = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
  return { sim: crearSim(CONFIG, crearRng(semilla), DIMS), rng: crearRng(semilla + 1) };
}

// La logica pide sonidos por cola; aca se tocan con el sintetizador del original.
function vaciarSonidos(s) {
  for (const [metodo, ...args] of s.sim.sonidos) s.audio[metodo]?.(...args);
  s.sim.sonidos.length = 0;
}

function actualizarMusica(s) {
  s.musica.sonar(s.estado === 'PLAYING' && !s.menu);
}

function pintar(s, forzar = false) {
  const ahora = performance.now();
  if (!forzar && ahora - s.ultimoHud < INTERVALO_HUD_MS) return;
  s.ultimoHud = ahora;
  s.hud.pintar(s.sim, s.estado, CONFIG, { menu: s.menu, tactil: s.modo === 'tactil', puntajeFinal: s.sim.fin?.resultado.finalScore ?? null });
}

// initGame del original.
function iniciar(s) {
  s.hud.cancelar();
  const { sim, rng } = nuevaSim();
  s.sim = sim;
  s.rng = rng;
  s.entrada = entradaVacia();
  s.estado = 'PLAYING';
  s.menu = false;
  s.audio.resume();
  sonar(s.sim, 'playBannerImpact');
  s.hud.reiniciar();
  s.hud.mostrar();
  actualizarMusica(s);
  pintar(s, true);
  if (s.modo === 'tactil' && !pantalla.estaActiva(s.raiz)) pantalla.entrar(s.raiz).then((ok) => ok && pantalla.bloquearHorizontal());
  s.lienzo.focus({ preventScroll: true });
}

function terminar(s) {
  const { estado, resultado } = s.sim.fin;
  s.estado = estado;
  s.entrada = entradaVacia();
  s.audio.stopWaveRumble();
  actualizarMusica(s);
  pintar(s, true);
  const tick = (metodo, ...args) => s.audio[metodo]?.(...args);
  if (estado === 'VICTORY') {
    s.hud.victoria(resultado, tick);
    s.raiz.querySelector('[data-nombre]').value = s.ultimoNombre;
  } else {
    s.hud.fallo(resultado, tick);
  }
}

function alternarMenu(s, abrir = !s.menu) {
  if (s.estado !== 'PLAYING' || s.menu === abrir) return;
  s.menu = abrir;
  s.entrada = entradaVacia();
  s.hud.pintarMutes({ sfx: s.audio.getMuteState(), bgm: s.musica.estaMuteada() });
  s.hud.mostrar(...(abrir ? ['menu'] : []));
  actualizarMusica(s);
  pintar(s, true);
}

function abrirModal(s, nombre) {
  if (nombre === 'ranking') s.hud.pintarHall(filasHall(leerHall(almacenamiento(), CONFIG)));
  s.modal = nombre;
  s.hud.mostrar(...s.pantallasBase(), nombre);
}

function cerrarModal(s) {
  s.modal = null;
  s.hud.mostrar(...s.pantallasBase());
}

function paso(s, dt) {
  if (s.estado !== 'PLAYING' || s.menu || s.girando) return;
  actualizar(s.sim, s.entrada, dt, CONFIG, s.rng, DIMS);
  vaciarSonidos(s);
  if (s.sim.fin) terminar(s);
  else pintar(s);
}

// Handlers de teclado del original: useInput (movimiento y confirmar) + el listener global de App.
function alPresionar(s, e) {
  if (e.target.closest?.('input')) return;
  s.audio.resume();

  if (e.key === 'Escape') {
    if (s.modal) cerrarModal(s);
    else alternarMenu(s);
    return;
  }
  if (s.estado === 'GAME_OVER' && [' ', 'Enter', 'r', 'R'].includes(e.key)) {
    e.preventDefault();
    iniciar(s);
    return;
  }
  if (s.estado !== 'PLAYING' || s.menu) return;

  const mov = TECLAS_MOVIMIENTO[e.key];
  if (mov) {
    e.preventDefault();
    s.entrada[mov] = true;
  }
  if (TECLAS_CONFIRMAR.includes(e.key)) s.entrada.confirm = true;
  if (s.sim.isDying) return;

  const sim = s.sim;
  const enSuperficie = sim.stage === 'MISSION_1_SURFACE';
  if (['e', 'E', 'f', 'F'].includes(e.key)) {
    if (enSuperficie) {
      e.preventDefault();
      if (Math.hypot(sim.playerX - sim.shipX, sim.playerY - sim.shipY) <= CONFIG.shipBoardingRadius) abordar(sim);
      else cambiarArma(sim);
    }
  } else if (['b', 'B'].includes(e.key)) {
    e.preventDefault();
    detonarEmp(sim);
  } else if (['q', 'Q', 'm', 'M'].includes(e.key)) {
    if (sim.stage === 'MISSION_2_ORBITAL_ASCENT') dispararMisil(sim);
    else cambiarArma(sim);
  } else if (e.key === '1') cambiarArma(sim, 'pulse');
  else if (e.key === '2') cambiarArma(sim, 'scatter');
  else if (e.key === '3') cambiarArma(sim, 'rocket');
  else if (['Shift', 'c', 'C'].includes(e.key)) sim.touchSlide = true;
  else if (e.key === ' ') {
    e.preventDefault();
    if (enSuperficie) sim.touchJump = true;
    else sim.touchShoot = true;
  } else if (TECLAS_DISPARO.includes(e.key)) sim.touchShoot = true;
  vaciarSonidos(s);
}

function alSoltar(s, e) {
  const mov = TECLAS_MOVIMIENTO[e.key];
  if (mov) s.entrada[mov] = false;
  if (TECLAS_CONFIRMAR.includes(e.key)) s.entrada.confirm = false;
  if ([' ', ...TECLAS_DISPARO].includes(e.key)) s.sim.touchShoot = false;
}

function alClic(s, e) {
  const boton = e.target.closest('[data-accion]');
  if (!boton) return;
  s.audio.resume();
  const accion = boton.dataset.accion;
  if (accion === 'iniciar' || accion === 'reintentar') iniciar(s);
  if (accion === 'manual') abrirModal(s, 'manual');
  if (accion === 'ranking') abrirModal(s, 'ranking');
  if (accion === 'cerrar') cerrarModal(s);
  if (accion === 'menu') alternarMenu(s, true);
  if (accion === 'reanudar') alternarMenu(s, false);
  if (accion === 'sfx') s.audio.toggleMute();
  if (accion === 'bgm') {
    s.musica.alternarMute();
    actualizarMusica(s);
  }
  if (accion === 'sfx' || accion === 'bgm') s.hud.pintarMutes({ sfx: s.audio.getMuteState(), bgm: s.musica.estaMuteada() });
  if (accion === 'abandonar') {
    s.menu = false;
    s.estado = 'START';
    s.hud.mostrar('inicio');
    actualizarMusica(s);
    pintar(s, true);
  }
  if (accion === 'abordar') abordar(s.sim);
  if (accion === 'misil') dispararMisil(s.sim);
  if (accion === 'emp') detonarEmp(s.sim);
  if (accion === 'arma') cambiarArma(s.sim, 'pulse');
  if (accion === 'pantalla') {
    if (pantalla.estaActiva(s.raiz)) pantalla.salir();
    else pantalla.entrar(s.raiz);
  }
  vaciarSonidos(s);
}

function guardarNombre(s, e) {
  e.preventDefault();
  const r = s.sim.fin?.resultado;
  if (!r) return;
  const input = s.raiz.querySelector('[data-nombre]');
  guardarEnHall(almacenamiento(), CONFIG, { nombre: input.value, puntaje: r.finalScore, anos: `${r.earthYearsLost}y`, rango: r.rank });
  s.ultimoNombre = input.value.trim().toUpperCase() || CONFIG.ranking.nombrePorDefecto;
  s.hud.guardado();
  s.audio.playTallyTick(true);
}

// El clic sobre el lienzo dispara, como el pointerdown del canvas en el useInput original.
function conectarPuntero(s) {
  const presionar = (abajo) => () => {
    s.entrada.tap = abajo;
    s.entrada.pointerDown = abajo;
  };
  escuchar(s, s.lienzo, 'pointerdown', (e) => {
    s.audio.resume();
    s.lienzo.setPointerCapture?.(e.pointerId);
    presionar(true)();
  });
  ['pointerup', 'pointercancel'].forEach((t) => escuchar(s, s.lienzo, t, presionar(false)));
}

function evaluarGiro(s) {
  const girar = requiereGiro({ modo: s.modo, ancho: window.innerWidth, alto: window.innerHeight });
  if (girar === s.girando) return;
  s.girando = girar;
  s.raiz.querySelector('[data-aviso-giro]').hidden = !girar;
  if (girar) alternarMenu(s, true);
}

async function crearJuego(s) {
  const modulo = await import(URL_PHASER);
  if (sesion !== s) return; // se desmonto mientras Phaser bajaba: descartar
  const Phaser = modulo.default ?? modulo;
  const factor = s.modo === 'tactil' ? 1 : Math.min(2, window.devicePixelRatio || 1);
  const Escena = crearEscenaMiller(Phaser, { obtenerSim: () => s.sim, alPaso: (dt) => paso(s, dt), config: CONFIG, factor });
  s.game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: s.lienzo,
    width: DIMS.ancho * factor,
    height: DIMS.alto * factor,
    backgroundColor: '#000000',
    banner: false,
    audio: { noAudio: true },
    input: { keyboard: false, mouse: false, touch: false, gamepad: false },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [Escena],
  });
}

export async function mount() {
  unmount();
  const raiz = document.querySelector('[data-miller]');
  if (!raiz) return;
  const modo = modoEntrada({
    punteroGrueso: window.matchMedia('(pointer: coarse)').matches,
    algunPunteroFino: window.matchMedia('(any-pointer: fine)').matches,
    forzado: new URLSearchParams(location.search).get('entrada'),
  });
  raiz.dataset.entrada = modo;
  if (modo === 'tactil') raiz.dataset.cabina = '';

  const { sim, rng } = nuevaSim();
  const s = {
    raiz,
    modo,
    lienzo: raiz.querySelector('[data-miller-lienzo]'),
    hud: crearHud(raiz),
    sim,
    rng,
    entrada: entradaVacia(),
    estado: 'START',
    menu: false,
    modal: null,
    girando: false,
    ultimoHud: 0,
    ultimoNombre: CONFIG.ranking.nombrePorDefecto,
    audio: new SynthAudio(),
    musica: crearMusica(URL_MUSICA, CONFIG.defaultMusicVolume),
    game: null,
    limpiezas: [],
    // Pantalla que queda debajo de un modal (ranking o manual).
    pantallasBase: () => ({ START: ['inicio'], VICTORY: ['victoria'], GAME_OVER: ['fallo'] })[s.estado] ?? (s.menu ? ['menu'] : []),
  };
  sesion = s;

  s.hud.mostrar('inicio');
  pintar(s, true);
  raiz.querySelector('[data-accion="pantalla"]').hidden = !pantalla.soportada();

  escuchar(s, window, 'keydown', (e) => alPresionar(s, e));
  escuchar(s, window, 'keyup', (e) => alSoltar(s, e));
  escuchar(s, raiz, 'click', (e) => alClic(s, e));
  escuchar(s, raiz.querySelector('[data-guardar]'), 'submit', (e) => guardarNombre(s, e));
  escuchar(s, window, 'blur', () => {
    s.entrada = entradaVacia();
    alternarMenu(s, true);
  });
  escuchar(s, document, 'visibilitychange', () => {
    if (document.hidden) alternarMenu(s, true);
  });
  conectarPuntero(s);
  if (modo === 'tactil') {
    s.limpiezas.push(
      conectarTactil(raiz, {
        obtenerSim: () => s.sim,
        alGesto: () => s.audio.resume(),
        acciones: {
          abordar: () => abordar(s.sim),
          emp: () => detonarEmp(s.sim),
          misil: () => dispararMisil(s.sim),
        },
      }),
    );
    evaluarGiro(s);
    escuchar(s, window, 'resize', () => evaluarGiro(s));
    escuchar(s, window.matchMedia('(orientation: portrait)'), 'change', () => evaluarGiro(s));
  }

  if (new URLSearchParams(location.search).has('autoplay')) iniciar(s);

  try {
    await crearJuego(s);
  } catch (err) {
    console.error('[miller] no se pudo cargar el motor del simulador:', err);
    if (sesion === s) s.hud.mostrar('aviso');
  }
}

export function unmount() {
  const s = sesion;
  if (!s) return;
  sesion = null; // primero: un import() en vuelo vera que la sesion ya no es la suya
  s.hud.cancelar();
  if (pantalla.estaActiva(s.raiz)) pantalla.salir();
  delete s.raiz.dataset.cabina;
  s.game?.destroy(true);
  s.game = null;
  s.limpiezas.forEach((fn) => fn());
  s.limpiezas = [];
  s.audio.cerrar();
  s.musica.cerrar();
}

if (typeof document !== 'undefined' && !window.__SWUP_ROUTER_ACTIVE__) {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => mount());
  else mount();
}
