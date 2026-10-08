// Editor de nombre estilo fichin: casillas fijas, flechas recorren el alfabeto; tipear tambien escribe.
import { normalizarNombre } from './ranking.js';

const BLANCO = ' ';

export function crearEditor(inicial, config) {
  const { largoNombre } = config.ranking;
  const nombre = inicial ? normalizarNombre(inicial, config) : '';
  return { letras: [...nombre.padEnd(largoNombre, BLANCO)].slice(0, largoNombre), cursor: 0 };
}

const conLetra = (ed, letra) => ({ ...ed, letras: ed.letras.map((l, i) => (i === ed.cursor ? letra : l)) });

export function cambiarLetra(ed, paso, config) {
  const { alfabeto } = config.ranking;
  const i = alfabeto.indexOf(ed.letras[ed.cursor]);
  return conLetra(ed, alfabeto[(i + paso + alfabeto.length) % alfabeto.length]);
}

export function moverCursor(ed, paso, config) {
  return { ...ed, cursor: Math.min(config.ranking.largoNombre - 1, Math.max(0, ed.cursor + paso)) };
}

export function escribir(ed, caracter, config) {
  const letra = caracter.toUpperCase();
  if (letra.length !== 1 || !config.ranking.alfabeto.includes(letra)) return ed;
  return moverCursor(conLetra(ed, letra), 1, config);
}

export function borrar(ed, config) {
  if (ed.letras[ed.cursor] !== BLANCO) return conLetra(ed, BLANCO);
  if (ed.cursor === 0) return ed;
  return conLetra(moverCursor(ed, -1, config), BLANCO);
}

export function textoEditor(ed) {
  return ed.letras.join('').trim();
}

const FLECHAS = {
  ArrowUp: (ed, c) => cambiarLetra(ed, 1, c),
  ArrowDown: (ed, c) => cambiarLetra(ed, -1, c),
  ArrowRight: (ed, c) => moverCursor(ed, 1, c),
  ArrowLeft: (ed, c) => moverCursor(ed, -1, c),
  Backspace: (ed, c) => borrar(ed, c),
};

// Traduce e.key a una operacion; manejada=false deja pasar la tecla (Tab, F5, atajos).
export function teclaEditor(ed, tecla, config) {
  if (tecla === 'Enter') return { editor: ed, confirmar: true, manejada: true };
  if (FLECHAS[tecla]) return { editor: FLECHAS[tecla](ed, config), confirmar: false, manejada: true };
  if (tecla.length === 1) {
    const editor = escribir(ed, tecla, config);
    return { editor, confirmar: false, manejada: editor !== ed };
  }
  return { editor: ed, confirmar: false, manejada: false };
}
