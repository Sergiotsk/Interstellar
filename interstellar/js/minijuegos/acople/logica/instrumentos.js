// Lecturas normalizadas para los instrumentos de la consola: agujas y barras en [-1,1] / [0,1].
import { normalizarAngulo } from './docking.js';

const acotar = (x, min = 0, max = 1) => Math.min(max, Math.max(min, x));
const ESCALA_VELOCIDAD = 1.5; // la barra llega a 1,5 veces el umbral de peligro

export function instrumentos(partida, config) {
  const { nave, estacion } = partida;
  const { tol, peligro } = config;
  const difGiro = nave.velAngular - estacion.velAngular;
  const difAngulo = normalizarAngulo(estacion.angulo + estacion.anguloPuerto - nave.angulo);
  const topeVelocidad = peligro.velocidad * ESCALA_VELOCIDAD;

  return {
    giro: acotar(difGiro / peligro.omega, -1, 1),
    giroZona: tol.omega / peligro.omega,
    giroOk: Math.abs(difGiro) <= tol.omega,

    alineacion: acotar(difAngulo / peligro.angulo, -1, 1),
    alineacionZona: tol.angulo / peligro.angulo,
    alineacionOk: Math.abs(difAngulo) <= tol.angulo,

    velocidad: acotar(nave.velAproximacion / topeVelocidad),
    velocidadTol: tol.velocidad / topeVelocidad,
    velocidadPeligro: peligro.velocidad / topeVelocidad,
    velocidadOk: nave.velAproximacion >= 0 && nave.velAproximacion <= tol.velocidad,

    distancia: acotar(nave.distancia / config.distanciaInicial),
    distanciaRango: config.rangoAcople / config.distanciaInicial,
    enRango: nave.distancia <= config.rangoAcople,

    combustible: acotar(nave.combustible),
  };
}
