// Tabla de puntajes local (top N con nombre); storage inyectado y nunca lanza.

const VACIO = Object.freeze({ entradas: [], ultimoNombre: '' });

const esPuntaje = (p) => Number.isInteger(p) && p >= 0;
const esEntrada = (e) => e !== null && typeof e === 'object' && typeof e.nombre === 'string' && esPuntaje(e.puntaje);

// Letras fuera del alfabeto: se prueba sin tilde (Ú→U) antes de descartarlas.
export function normalizarNombre(texto, config) {
  const { alfabeto, largoNombre, nombrePorDefecto } = config.ranking;
  const letras = [...String(texto ?? '').toUpperCase()].map((c) => {
    if (alfabeto.includes(c)) return c;
    const base = c.normalize('NFD').replace(/\p{M}/gu, '');
    return alfabeto.includes(base) ? base : '';
  });
  const nombre = letras.join('').trim().slice(0, largoNombre).trim();
  return nombre || nombrePorDefecto;
}

export function leerRanking(storage = globalThis.localStorage, config) {
  try {
    const crudo = storage.getItem(config.ranking.clave);
    if (crudo === null) return { ...VACIO };
    const r = JSON.parse(crudo);
    if (r === null || typeof r !== 'object' || r.v !== config.ranking.version || !Array.isArray(r.entradas)) {
      return { ...VACIO };
    }
    const entradas = r.entradas
      .filter(esEntrada)
      .sort((a, b) => b.puntaje - a.puntaje)
      .slice(0, config.ranking.tope);
    return { entradas, ultimoNombre: typeof r.ultimoNombre === 'string' ? r.ultimoNombre : '' };
  } catch {
    return { ...VACIO };
  }
}

// Indice donde entraria el puntaje; -1 si no entra. En un empate gana el que ya estaba.
export function posicionEnRanking(entradas, puntaje, config) {
  if (!esPuntaje(puntaje)) return -1;
  const i = entradas.findIndex((e) => puntaje > e.puntaje);
  const posicion = i === -1 ? entradas.length : i;
  return posicion < config.ranking.tope ? posicion : -1;
}

export function insertarEntrada(entradas, entrada, config) {
  const posicion = posicionEnRanking(entradas, entrada.puntaje, config);
  if (posicion === -1) return { entradas, posicion };
  const nuevas = [...entradas.slice(0, posicion), entrada, ...entradas.slice(posicion)].slice(0, config.ranking.tope);
  return { entradas: nuevas, posicion };
}

export function guardarEnRanking(desenlace, nombre, storage, config, ahora = new Date()) {
  const { entradas } = leerRanking(storage, config);
  const sinGuardar = { guardado: false, entradas, posicion: -1 };
  if (!desenlace.exito) return sinGuardar;

  const limpio = normalizarNombre(nombre, config);
  const r = insertarEntrada(
    entradas,
    {
      nombre: limpio,
      puntaje: desenlace.puntaje,
      fecha: ahora.toISOString(),
      tiempoS: desenlace.tiempoTotal,
      combustible: desenlace.combustibleRestante,
      velocidadFinal: desenlace.velocidadFinal,
      precision: desenlace.precision,
    },
    config,
  );
  if (r.posicion === -1) return sinGuardar;
  try {
    storage.setItem(
      config.ranking.clave,
      JSON.stringify({ v: config.ranking.version, entradas: r.entradas, ultimoNombre: limpio }),
    );
    return { guardado: true, ...r };
  } catch {
    return sinGuardar;
  }
}
