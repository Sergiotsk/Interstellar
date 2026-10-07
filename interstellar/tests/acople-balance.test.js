import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/acople/config.js';
import { crearPartida, conAcciones, avanzar } from '../js/minijuegos/acople/logica/mision.js';
import { normalizarAngulo } from '../js/minijuegos/acople/logica/docking.js';

const DT = 1 / 60;
const LIMITE_S = 300;

function simular(politica) {
  let p = crearPartida(CONFIG, { conIntro: false });
  while (p.fase === 'en-curso' && p.tiempo < LIMITE_S) {
    p = avanzar(conAcciones(p, politica(p)), DT, CONFIG);
  }
  return p;
}

// Piloto de referencia: sincroniza el giro corrigiendo el angulo, y se acerca solo cuando esta alineado.
function pilotoReferencia({ nave, estacion }) {
  const acciones = new Set();
  const errorAngulo = normalizarAngulo(estacion.angulo + estacion.anguloPuerto - nave.angulo);
  const correccion = Math.max(-0.25, Math.min(0.25, 0.8 * errorAngulo));
  const omegaObjetivo = estacion.velAngular + correccion;
  if (nave.velAngular < omegaObjetivo - 0.03) acciones.add('rotarDerecha');
  if (nave.velAngular > omegaObjetivo + 0.03) acciones.add('rotarIzquierda');

  const alineado = Math.abs(errorAngulo) < 0.1 && Math.abs(nave.velAngular - estacion.velAngular) < 0.06;
  let vObjetivo = nave.distancia > CONFIG.zonaCercana + 40 ? 20 : 4;
  if (!alineado && nave.distancia < CONFIG.zonaCercana + 60) vObjetivo = 0;
  if (nave.velAproximacion < vObjetivo - 0.5) acciones.add('impulso');
  if (nave.velAproximacion > vObjetivo + 0.5) acciones.add('freno');
  return acciones;
}

describe('acople — balance de dificultad (research R9, SC-002)', () => {
  test('el piloto de referencia acopla entre 30 y 90 s simulados', () => {
    const p = simular(pilotoReferencia);
    assert.equal(p.fase, 'acoplada', `termino en ${p.fase} (${p.desenlace?.causa}) a los ${p.tiempo.toFixed(1)} s`);
    assert.ok(p.desenlace.tiempoTotal >= 30 && p.desenlace.tiempoTotal <= 90, `tiempo ${p.desenlace.tiempoTotal.toFixed(1)} s`);
  });
});
