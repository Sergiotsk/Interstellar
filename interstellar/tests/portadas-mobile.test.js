import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const leer = (ruta) => readFileSync(new URL(ruta, import.meta.url), 'utf8');

// Cuerpo del primer @media que contiene `selector` (balanceando llaves).
function bloqueMedia(css, consulta, selector) {
  let desde = 0;
  while (true) {
    const ini = css.indexOf(`@media (${consulta}) {`, desde);
    if (ini === -1) {
      return null;
    }
    let prof = 0;
    let fin = ini;
    for (let i = css.indexOf('{', ini); i < css.length; i++) {
      if (css[i] === '{') prof++;
      if (css[i] === '}' && --prof === 0) {
        fin = i;
        break;
      }
    }
    const cuerpo = css.slice(ini, fin + 1);
    if (cuerpo.includes(selector)) {
      return cuerpo;
    }
    desde = fin;
  }
}

describe('portadas en mobile — mosaico con pocas franjas', () => {
  test('personajes: en mobile se ocultan las franjas 4 y 5 (quedan 4 de 6)', () => {
    const css = leer('../css/personajes.css');
    const bloque = bloqueMedia(css, 'max-width: 48rem', '.portada-tripulacion-mosaico img:nth-child(4)');
    assert.ok(bloque, 'falta el @media mobile que oculta franjas del mosaico de personajes');
    assert.match(bloque, /\.portada-tripulacion-mosaico img:nth-child\(5\)/);
    assert.match(bloque, /display:\s*none/);
  });

  test('mundos: en mobile se oculta la franja 5 (quedan 4 de 5)', () => {
    const css = leer('../css/mundos.css');
    const bloque = bloqueMedia(css, 'max-width: 47.99rem', '.mundos-intro-mosaico img:nth-child(n+5)');
    assert.ok(bloque, 'falta el @media mobile que oculta franjas del mosaico de mundos');
    assert.match(bloque, /display:\s*none/);
  });

  test('en desktop no se oculta ninguna franja (reglas solo dentro de @media)', () => {
    const fuera = (css, sel) => css.replace(/@media[^{]*\{(?:[^{}]|\{[^{}]*\})*\}/g, '').includes(sel);
    assert.equal(fuera(leer('../css/personajes.css'), 'mosaico img:nth-child'), false);
    assert.equal(fuera(leer('../css/mundos.css'), 'mosaico img:nth-child'), false);
  });
});
