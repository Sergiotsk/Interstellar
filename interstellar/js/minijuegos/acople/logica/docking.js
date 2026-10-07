// Sincronia nave-estacion y resolucion del contacto con el puerto (data-model: variables derivadas).

const DOS_PI = Math.PI * 2;

export function normalizarAngulo(rad) {
  const r = ((rad % DOS_PI) + DOS_PI) % DOS_PI;
  return r > Math.PI ? r - DOS_PI : r;
}

export function deltaOmega(nave, estacion) {
  return Math.abs(nave.velAngular - estacion.velAngular);
}

export function deltaTheta(nave, estacion) {
  return Math.abs(normalizarAngulo(estacion.angulo + estacion.anguloPuerto - nave.angulo));
}

export function evaluarSincronia(nave, estacion, config) {
  const dw = deltaOmega(nave, estacion);
  const dt = deltaTheta(nave, estacion);
  const v = nave.velAproximacion;
  const { tol, peligro } = config;
  return {
    deltaOmega: dw,
    deltaTheta: dt,
    enRango: nave.distancia <= config.rangoAcople,
    seguro: dw <= tol.omega && dt <= tol.angulo && v <= tol.velocidad,
    peligro: dw > peligro.omega || dt > peligro.angulo || v > peligro.velocidad,
  };
}

export function evaluarContacto(nave, estacion, config) {
  const { tol } = config;
  if (nave.velAproximacion > tol.velocidad) return { exito: false, causa: 'impacto' };
  if (deltaTheta(nave, estacion) > tol.angulo || deltaOmega(nave, estacion) > tol.omega) {
    return { exito: false, causa: 'angulo' };
  }
  return { exito: true };
}
