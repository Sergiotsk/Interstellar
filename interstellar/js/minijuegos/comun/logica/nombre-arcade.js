// Nombre del ranking tipeado con el teclado (fisico o nativo del celular): se sanea en cada tecla.

// Mayusculas, sin tildes (Ñ se respeta), solo el alfabeto y sin espacios al principio.
export function sanearEntrada(texto, config) {
  const { alfabeto, largoNombre } = config.ranking;
  const letras = [...String(texto ?? '').toUpperCase()].map((c) => {
    if (alfabeto.includes(c)) return c;
    const base = c.normalize('NFD').replace(/\p{M}/gu, '');
    return alfabeto.includes(base) ? base : '';
  });
  return letras.join('').trimStart().slice(0, largoNombre);
}
