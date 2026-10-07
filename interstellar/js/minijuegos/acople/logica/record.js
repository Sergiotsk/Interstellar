// Mejor puntaje en localStorage; storage inyectado y nunca lanza (FR-027/028, research R13).

function esValido(r, version) {
  return (
    r !== null &&
    typeof r === 'object' &&
    r.v === version &&
    Number.isInteger(r.puntaje) &&
    r.puntaje >= 0
  );
}

export function leerRecord(storage = globalThis.localStorage, config) {
  try {
    const crudo = storage.getItem(config.record.clave);
    if (crudo === null) return null;
    const r = JSON.parse(crudo);
    return esValido(r, config.record.version) ? r : null;
  } catch {
    return null;
  }
}

export function guardarSiMejor(desenlace, storage, config, ahora = new Date()) {
  const vigente = leerRecord(storage, config);
  if (!desenlace.exito || !Number.isInteger(desenlace.puntaje)) return { guardado: false, record: vigente };
  if (vigente && desenlace.puntaje <= vigente.puntaje) return { guardado: false, record: vigente };

  const record = {
    v: config.record.version,
    puntaje: desenlace.puntaje,
    fecha: ahora.toISOString(),
    tiempoS: desenlace.tiempoTotal,
    combustible: desenlace.combustibleRestante,
    velocidadFinal: desenlace.velocidadFinal,
    precision: desenlace.precision,
  };
  try {
    storage.setItem(config.record.clave, JSON.stringify(record));
    return { guardado: true, record };
  } catch {
    return { guardado: false, record: vigente };
  }
}
