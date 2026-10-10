// Puntaje 0-10000: suma ponderada de factores en [0, 1]; el tiempo pesa mas (FR-015, R9).

const unidad = (v) => Math.min(1, Math.max(0, v));

export function factores({ tiempo, margen, choques, precision }, config) {
  const { tMin, tMax, margenMax, maxChoques } = config.puntaje;
  return {
    tiempo: unidad((tMax - tiempo) / (tMax - tMin)),
    margen: unidad(margen / margenMax),
    choques: unidad(1 - choques / maxChoques),
    precision: unidad(precision),
  };
}

export function calcularPuntaje(f, config) {
  const { max, pesos } = config.puntaje;
  const total = Object.keys(pesos).reduce((suma, k) => suma + pesos[k] * f[k], 0);
  return Math.round(max * total);
}

export function rangoDe(puntaje, config) {
  const { S, A, B } = config.puntaje.rangos;
  if (puntaje >= S) return 'S';
  if (puntaje >= A) return 'A';
  if (puntaje >= B) return 'B';
  return 'C';
}
