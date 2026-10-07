// Maquina de estados de la partida de acople; unica funcion que mueve el tiempo es avanzar (data-model: Partida).
import { crearNave, crearEstacion, pasoFisica } from './fisica.js';
import { evaluarSincronia, evaluarContacto, deltaOmega, deltaTheta } from './docking.js';
import { factores, calcularPuntaje } from './scoring.js';

export function crearPartida(config, { conIntro = true } = {}) {
  return {
    fase: conIntro ? 'intro' : 'en-curso',
    tiempo: 0,
    acumulador: 0,
    nave: crearNave(config),
    estacion: crearEstacion(config),
    acciones: new Set(),
    tiempoSinControl: 0,
    tiempoEnRango: 0,
    tiempoEnRangoSeguro: 0,
    desenlace: null,
  };
}

export function iniciar(partida) {
  return partida.fase === 'intro' ? { ...partida, fase: 'en-curso' } : partida;
}

export function conAcciones(partida, acciones) {
  return partida.fase === 'en-curso' ? { ...partida, acciones: new Set(acciones) } : partida;
}

function terminar(p, exito, causa, config) {
  const base = {
    exito,
    causa,
    tiempoTotal: p.tiempo,
    combustibleRestante: p.nave.combustible,
    velocidadFinal: p.nave.velAproximacion,
    precision: null,
    suavidad: null,
    puntaje: null,
  };
  if (exito) {
    const f = factores(
      {
        deltaOmega: deltaOmega(p.nave, p.estacion),
        deltaTheta: deltaTheta(p.nave, p.estacion),
        combustibleRestante: p.nave.combustible,
        tiempoTotal: p.tiempo,
        tiempoEnRango: p.tiempoEnRango,
        tiempoEnRangoSeguro: p.tiempoEnRangoSeguro,
        velocidadFinal: p.nave.velAproximacion,
      },
      config,
    );
    base.precision = f.precision;
    base.suavidad = f.suavidad;
    base.puntaje = calcularPuntaje(f, config);
  }
  return { ...p, fase: exito ? 'acoplada' : 'fallida', acciones: new Set(), desenlace: base };
}

function pasoUnico(p, dt, config) {
  const { nave, estacion } = pasoFisica(p, p.acciones, dt, config);
  const s = evaluarSincronia(nave, estacion, config);
  const sinControl = Math.abs(nave.velAngular) > config.limiteControl;
  const q = {
    ...p,
    nave,
    estacion,
    tiempo: p.tiempo + dt,
    tiempoSinControl: sinControl ? p.tiempoSinControl + dt : 0,
    tiempoEnRango: p.tiempoEnRango + (s.enRango ? dt : 0),
    tiempoEnRangoSeguro: p.tiempoEnRangoSeguro + (s.enRango && s.seguro ? dt : 0),
  };
  if (nave.distancia === 0) {
    const contacto = evaluarContacto(nave, estacion, config);
    return terminar(q, contacto.exito, contacto.exito ? null : contacto.causa, config);
  }
  if (q.tiempoSinControl > config.margenSinControl) return terminar(q, false, 'control', config);
  // Sin combustible y sin acercarse ya no hay forma de llegar al puerto.
  if (nave.combustible === 0 && nave.velAproximacion <= 0) return terminar(q, false, 'combustible', config);
  return q;
}

export function avanzar(partida, dtReal, config) {
  const dt = Math.min(Math.max(0, dtReal), config.deltaMaxS);
  if (partida.fase === 'intro') {
    const { estacion } = partida;
    return { ...partida, estacion: { ...estacion, angulo: estacion.angulo + estacion.velAngular * dt } };
  }
  if (partida.fase !== 'en-curso') return partida;

  const paso = config.pasoFijoS;
  let p = { ...partida, acumulador: partida.acumulador + dt };
  // Tolerancia de redondeo: 2.5 pasos sumados en float no deben perder un paso.
  while (p.acumulador >= paso - 1e-12 && p.fase === 'en-curso') {
    p = { ...pasoUnico(p, paso, config), acumulador: p.acumulador - paso };
  }
  return p;
}

export function reintentar(_partida, config) {
  return crearPartida(config, { conIntro: false });
}

export function estadoHud(partida, config) {
  if (partida.fase === 'acoplada') return 'DOCKED';
  if (partida.fase === 'fallida') return 'MISSION FAILED';
  const s = evaluarSincronia(partida.nave, partida.estacion, config);
  const cerca = partida.nave.distancia <= config.zonaCercana;
  if (cerca && s.peligro) return 'UNSAFE APPROACH';
  if (s.enRango && s.seguro) return 'DOCKING RANGE';
  if (cerca) return 'MATCHING ROTATION';
  return 'APPROACHING';
}

const NIVELES = {
  APPROACHING: 'neutro',
  'MATCHING ROTATION': 'atencion',
  'DOCKING RANGE': 'seguro',
  DOCKED: 'seguro',
  'UNSAFE APPROACH': 'peligro',
  'MISSION FAILED': 'peligro',
};

export function nivelDeEstado(estado) {
  return NIVELES[estado] ?? 'neutro';
}
