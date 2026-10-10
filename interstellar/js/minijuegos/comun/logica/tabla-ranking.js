// Filas de la tabla de puntajes y texto del puesto: los muestran los dos capitulos igual, como un fichin.

// completar rellena hasta el tope con puestos vacios.
export function filasRanking(entradas, resaltar, config, { completar = true } = {}) {
  const total = completar ? config.ranking.tope : entradas.length;
  return Array.from({ length: total }, (_, i) => {
    const e = entradas[i];
    return {
      puesto: String(i + 1).padStart(2, '0'),
      nombre: e ? e.nombre : '',
      puntaje: e ? e.puntaje.toLocaleString('es-AR') : '',
      resaltada: i === resaltar,
      vacia: !e,
    };
  });
}

export function textoPuesto(posicion) {
  if (posicion === 0) return '★ Nuevo récord';
  return posicion > 0 ? `★ Entraste al ranking · puesto ${posicion + 1}` : '';
}
