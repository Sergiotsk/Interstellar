// Fisica simplificada de 2 ejes: rotacion de la nave y aproximacion 1D sobre el eje de la estacion (research R2).

export function crearNave(config) {
  return {
    angulo: 0,
    velAngular: config.nave.velAngularInicial,
    distancia: config.distanciaInicial,
    velAproximacion: 0,
    combustible: config.combustible.inicial,
  };
}

export function crearEstacion(config) {
  return {
    angulo: config.estacion.anguloInicial,
    velAngular: config.estacion.velAngular,
    anguloPuerto: config.estacion.anguloPuerto,
  };
}

function consumo(acciones, c) {
  let total = 0;
  if (acciones.has('rotarIzquierda')) total += c.consumoRotacion;
  if (acciones.has('rotarDerecha')) total += c.consumoRotacion;
  if (acciones.has('impulso')) total += c.consumoImpulso;
  if (acciones.has('freno')) total += c.consumoFreno;
  return total;
}

export function pasoFisica({ nave, estacion }, acciones, dt, config) {
  const conControl = nave.combustible > 0;
  const n = config.nave;

  let velAngular = nave.velAngular;
  let velAproximacion = nave.velAproximacion;
  let combustible = nave.combustible;

  if (conControl) {
    if (acciones.has('rotarIzquierda')) velAngular -= n.aceleracionAngular * dt;
    if (acciones.has('rotarDerecha')) velAngular += n.aceleracionAngular * dt;
    if (acciones.has('impulso')) velAproximacion += n.empuje * dt;
    if (acciones.has('freno')) velAproximacion -= n.frenado * dt;
    combustible = Math.max(0, combustible - consumo(acciones, config.combustible) * dt);
  }
  velAngular -= velAngular * n.friccionAngular * dt;

  return {
    nave: {
      angulo: nave.angulo + velAngular * dt,
      velAngular,
      distancia: Math.max(0, nave.distancia - velAproximacion * dt),
      velAproximacion,
      combustible,
    },
    estacion: { ...estacion, angulo: estacion.angulo + estacion.velAngular * dt },
  };
}
