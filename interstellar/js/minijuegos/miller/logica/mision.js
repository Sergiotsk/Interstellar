// Maquina de estados de la mision: intro -> cuenta -> exploracion -> huida <-> despegue -> exito | fracaso.
// Estado inmutable; el tiempo entra como dt y el azar solo al crear el mapa (semilla).
import { crearRng } from './azar.js';
import { crearMapa } from './mapa.js';
import { moverJugador, resolverRestos } from './fisica.js';
import { crearOla, revelarOla, avanzarOla, nivelPeligro } from './ola.js';
import { alAlcance } from './baliza.js';
import { enRadio, crearDespegue, cargar } from './despegue.js';
import { horasTerrestres } from './dilatacion.js';
import { factores, calcularPuntaje, rangoDe } from './scoring.js';

const EN_JUEGO = ['exploracion', 'huida', 'despegue'];
const FINALES = ['exito', 'fracaso'];
const BANNER_BALIZA_S = 1.5;
const BANNER_OLA_S = 3.5;

export function crearPartida(config, { semilla, conIntro = true }) {
  const mapa = crearMapa(config, crearRng(semilla));
  return {
    fase: conIntro ? 'intro' : 'cuenta',
    pausada: false,
    semilla,
    mapa,
    t: 0,
    tFase: 0,
    tBaliza: null,
    acumulador: 0,
    jugador: { x: mapa.ranger.x + 50, z: mapa.ranger.z + 15, vx: 0, vz: 0, aturdidoS: 0, mirando: 'der', quietoS: 0 },
    acciones: new Set(),
    balizaRecogida: false,
    ola: crearOla(config),
    despegue: crearDespegue(),
    choques: 0,
    caseRobot: { ...mapa.caseRobot, asistio: false, impulsoS: 0, recargaS: 0 },
    nivel: 'lejos',
    eventos: [],
    causa: null,
    resultado: null,
  };
}

export function saltarIntro(partida) {
  return partida.fase === 'intro' ? { ...partida, fase: 'cuenta', tFase: 0 } : partida;
}

export function conAcciones(partida, acciones) {
  return { ...partida, acciones: new Set(acciones) };
}

export function pausar(partida) {
  return FINALES.includes(partida.fase) ? partida : { ...partida, pausada: true };
}

export function reanudar(partida) {
  return { ...partida, pausada: false };
}

export function reintentar(_partida, config, semilla) {
  return crearPartida(config, { semilla, conIntro: false });
}

// Pausada o terminada devuelve la MISMA partida: el loop procesa eventos solo si la referencia cambio.
export function avanzar(partida, dtReal, config) {
  if (partida.pausada || FINALES.includes(partida.fase)) return partida;
  const paso = config.pasoFijoS;
  let p = { ...partida, eventos: [], acumulador: partida.acumulador + Math.min(dtReal, config.deltaMaxS) };
  const eventos = [];
  while (p.acumulador >= paso && !FINALES.includes(p.fase)) {
    p = pasoFijo({ ...p, acumulador: p.acumulador - paso }, paso, config);
    eventos.push(...p.eventos);
  }
  return { ...p, eventos };
}

function pasoFijo(p, dt, config) {
  if (p.fase === 'intro') {
    const tFase = p.tFase + dt;
    return tFase >= config.introS ? { ...p, fase: 'cuenta', tFase: 0, eventos: [] } : { ...p, tFase, eventos: [] };
  }
  if (p.fase === 'cuenta') {
    const tFase = p.tFase + dt;
    return tFase >= config.cuentaS
      ? { ...p, fase: 'exploracion', tFase: 0, eventos: ['inicio'] }
      : { ...p, tFase, eventos: [] };
  }
  if (EN_JUEGO.includes(p.fase)) return pasoDeJuego(p, dt, config);
  return p;
}

function pasoDeJuego(p, dt, config) {
  const eventos = [];
  const { ranger, restos, baliza } = p.mapa;
  const accion = p.acciones.has('accion');

  let caseRobot = {
    ...p.caseRobot,
    impulsoS: Math.max(0, p.caseRobot.impulsoS - dt),
    recargaS: Math.max(0, p.caseRobot.recargaS - dt),
  };
  const tocaCase = Math.hypot(p.jugador.x - caseRobot.x, p.jugador.z - caseRobot.z) <= config.caseRobot.radio;
  if (tocaCase && caseRobot.recargaS <= 0) {
    caseRobot = { ...caseRobot, asistio: true, impulsoS: config.caseRobot.duracionS, recargaS: config.caseRobot.recargaS };
    eventos.push('impulso');
  }

  const impulso = caseRobot.impulsoS > 0 ? config.caseRobot.impulso : 1;
  const movido = moverJugador(p.jugador, p.acciones, dt, config, { impulso });
  const { jugador, choque } = resolverRestos(movido, restos, config);
  if (choque) eventos.push('choque');

  let { fase, balizaRecogida, tBaliza } = p;
  let ola = avanzarOla(p.ola, dt, config);
  // La baliza se evalua antes que el radio del Ranger (R8).
  if (!balizaRecogida && accion && alAlcance(jugador, baliza, config)) {
    balizaRecogida = true;
    tBaliza = p.t + dt;
    ola = revelarOla(ola, config, jugador.x);
    fase = 'huida';
    eventos.push('baliza', 'olaRevelada');
  }
  if (balizaRecogida) {
    const dentro = enRadio(jugador, ranger);
    if (fase === 'huida' && dentro) fase = 'despegue';
    else if (fase === 'despegue' && !dentro) fase = 'huida';
  }
  const despegue = cargar(p.despegue, fase === 'despegue' && accion, dt, config);

  const siguiente = {
    ...p,
    fase,
    t: p.t + dt,
    tFase: fase === p.fase ? p.tFase + dt : 0,
    tBaliza,
    jugador,
    balizaRecogida,
    ola,
    despegue,
    caseRobot,
    choques: p.choques + (choque ? 1 : 0),
    nivel: ola.revelada ? nivelPeligro(ola.x - jugador.x, config) : 'lejos',
    eventos,
  };

  // Si la carga se completa en el mismo paso que llega la ola, gana el despegue: la accion ya estaba hecha.
  if (despegue.carga >= 1) {
    eventos.push('despegue');
    return { ...siguiente, fase: 'exito', resultado: crearResultado(siguiente, config, null) };
  }
  if (ola.revelada) {
    const causa = ola.x <= jugador.x ? 'jugador' : ola.x <= ranger.x ? 'ranger' : null;
    if (causa) {
      eventos.push('fracaso');
      return { ...siguiente, fase: 'fracaso', causa, resultado: crearResultado(siguiente, config, causa) };
    }
  }
  return siguiente;
}

function crearResultado(p, config, causa) {
  const exito = causa === null;
  const datos = {
    tiempo: p.t,
    margen: exito ? p.ola.x - p.mapa.ranger.x : 0,
    choques: p.choques,
    precision: 1 - Math.min(p.despegue.soltadas, config.despegue.maxSoltadas) / config.despegue.maxSoltadas,
  };
  const f = factores(datos, config);
  const puntaje = exito ? calcularPuntaje(f, config) : 0;
  return {
    exito,
    causa,
    tiempoMision: p.t,
    horasTerrestres: horasTerrestres(p.t, config),
    margenOla: datos.margen,
    choques: p.choques,
    asistenciaCase: p.caseRobot.asistio,
    precision: datos.precision,
    factores: f,
    puntaje,
    rango: exito ? rangoDe(puntaje, config) : null,
  };
}

export function estadoHud(partida) {
  const { fase, t, tBaliza } = partida;
  if (fase === 'exito') return 'MISSION COMPLETE';
  if (fase === 'fracaso') return 'MISSION FAILED';
  if (fase === 'despegue') return 'LIFTOFF READY';
  if (fase === 'huida') {
    const desde = t - tBaliza;
    if (desde < BANNER_BALIZA_S) return 'BEACON ACQUIRED';
    if (desde < BANNER_OLA_S) return 'WAVE INCOMING';
    return 'RETURN TO RANGER';
  }
  return 'SEARCHING';
}
