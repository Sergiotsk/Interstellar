// Modo de entrada del simulador: tactil sin ningun puntero fino; el forzado de la URL manda (010 R1).

const MODOS = ['tactil', 'teclado'];

export function modoEntrada({ punteroGrueso, algunPunteroFino, forzado }) {
  if (MODOS.includes(forzado)) return forzado;
  return punteroGrueso && !algunPunteroFino ? 'tactil' : 'teclado';
}

// Solo horizontal en tactil: en vertical se pausa con el aviso de giro (010 R6).
export function requiereGiro({ modo, ancho, alto }) {
  return modo === 'tactil' && alto > ancho;
}
