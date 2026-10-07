// Puntaje del acople: 5 factores en [0,1] ponderados por config (FR-025, data-model: Puntaje).

const acotar = (x) => Math.min(1, Math.max(0, x));

export function factores(datos, config) {
  const { tol } = config;
  const { tMin, tMax } = config.puntaje;
  return {
    precision: acotar(1 - 0.5 * (datos.deltaOmega / tol.omega + datos.deltaTheta / tol.angulo)),
    combustible: acotar(datos.combustibleRestante),
    tiempo: acotar((tMax - datos.tiempoTotal) / (tMax - tMin)),
    suavidad: acotar(
      (datos.tiempoEnRango > 0 ? datos.tiempoEnRangoSeguro / datos.tiempoEnRango : 1) -
        config.puntaje.penalizacionRechazo * (datos.rechazos ?? 0),
    ),
    velocidad: acotar(1 - datos.velocidadFinal / tol.velocidad),
  };
}

export function calcularPuntaje(f, config) {
  const { max, pesos } = config.puntaje;
  const suma = Object.keys(pesos).reduce((total, k) => total + pesos[k] * f[k], 0);
  return Math.min(max, Math.max(0, Math.round(max * suma)));
}
