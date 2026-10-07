import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/acople/config.js';
import {
  crearPartida,
  iniciar,
  conAcciones,
  avanzar,
  estadoHud,
  nivelDeEstado,
} from '../js/minijuegos/acople/logica/mision.js';

const W = CONFIG.estacion.velAngular;

// Partida en curso con la nave ya sincronizada y alineada con el puerto.
function sincronizada(naveExtra = {}) {
  const p = crearPartida(CONFIG, { conIntro: false });
  const angulo = p.estacion.angulo + p.estacion.anguloPuerto;
  return { ...p, nave: { ...p.nave, angulo, velAngular: W, ...naveExtra } };
}

describe('acople/logica/mision.js — fases y avance', () => {
  test('con intro arranca en intro e iniciar pasa a en-curso', () => {
    const p = crearPartida(CONFIG, { conIntro: true });
    assert.equal(p.fase, 'intro');
    assert.equal(iniciar(p).fase, 'en-curso');
  });

  test('sin intro arranca en en-curso', () => {
    assert.equal(crearPartida(CONFIG, { conIntro: false }).fase, 'en-curso');
  });

  test('por defecto arranca con intro', () => {
    assert.equal(crearPartida(CONFIG).fase, 'intro');
  });

  test('conAcciones se ignora fuera de en-curso', () => {
    const intro = crearPartida(CONFIG);
    assert.equal(conAcciones(intro, new Set(['impulso'])).acciones.size, 0);
    const curso = crearPartida(CONFIG, { conIntro: false });
    assert.ok(conAcciones(curso, new Set(['impulso'])).acciones.has('impulso'));
  });

  test('avanzar recorta un delta enorme a deltaMaxS', () => {
    const p = avanzar(crearPartida(CONFIG, { conIntro: false }), 5, CONFIG);
    assert.ok(Math.abs(p.tiempo - CONFIG.deltaMaxS) <= CONFIG.pasoFijoS);
  });

  test('avanzar aplica pasos fijos y acumula el resto', () => {
    const paso = CONFIG.pasoFijoS;
    const p = avanzar(crearPartida(CONFIG, { conIntro: false }), paso * 2.5, CONFIG);
    assert.ok(Math.abs(p.tiempo - paso * 2) < 1e-12);
    const q = avanzar(p, paso * 0.5, CONFIG);
    assert.ok(Math.abs(q.tiempo - paso * 3) < 1e-12);
  });

  test('el tiempo solo corre en en-curso; en intro la estacion igual gira', () => {
    const intro = crearPartida(CONFIG);
    const p = avanzar(intro, 0.05, CONFIG);
    assert.equal(p.tiempo, 0);
    assert.ok(p.estacion.angulo > intro.estacion.angulo);
    assert.equal(p.nave.distancia, intro.nave.distancia);
  });

  test('contacto sincronizado y lento -> acoplada con puntaje entero', () => {
    let p = sincronizada({ distancia: 0.01, velAproximacion: 2 });
    p = avanzar(p, 0.05, CONFIG);
    assert.equal(p.fase, 'acoplada');
    assert.equal(p.desenlace.exito, true);
    assert.equal(p.desenlace.causa, null);
    assert.ok(Number.isInteger(p.desenlace.puntaje) && p.desenlace.puntaje > 0);
    assert.ok(p.desenlace.precision >= 0 && p.desenlace.precision <= 1);
  });

  test('contacto rapido -> fallida por impacto, sin puntaje', () => {
    let p = sincronizada({ distancia: 0.01, velAproximacion: CONFIG.tol.velocidad + 5 });
    p = avanzar(p, 0.05, CONFIG);
    assert.equal(p.fase, 'fallida');
    assert.equal(p.desenlace.causa, 'impacto');
    assert.equal(p.desenlace.puntaje, null);
  });

  test('terminada, avanzar ya no cambia nada', () => {
    const p = avanzar(sincronizada({ distancia: 0.01, velAproximacion: 2 }), 0.05, CONFIG);
    assert.equal(avanzar(p, 0.05, CONFIG), p);
  });

  test('cuenta el tiempo en rango y el tiempo en rango seguro', () => {
    let p = sincronizada({ distancia: CONFIG.rangoAcople - 1, velAproximacion: 1 });
    p = avanzar(p, 0.05, CONFIG);
    assert.ok(p.tiempoEnRango > 0);
    assert.ok(Math.abs(p.tiempoEnRango - p.tiempoEnRangoSeguro) < 1e-12);
  });
});

describe('acople/logica/mision.js — estado del HUD', () => {
  test('APPROACHING lejos del puerto', () => {
    assert.equal(estadoHud(crearPartida(CONFIG, { conIntro: false }), CONFIG), 'APPROACHING');
  });

  test('MATCHING ROTATION cerca sin sincronia', () => {
    const p = sincronizada({ distancia: CONFIG.zonaCercana - 1, velAngular: W + CONFIG.tol.omega * 2, velAproximacion: 1 });
    assert.equal(estadoHud(p, CONFIG), 'MATCHING ROTATION');
  });

  test('DOCKING RANGE en rango y todo seguro', () => {
    assert.equal(estadoHud(sincronizada({ distancia: CONFIG.rangoAcople - 1, velAproximacion: 1 }), CONFIG), 'DOCKING RANGE');
  });

  test('UNSAFE APPROACH cerca y con peligro (tiene prioridad sobre DOCKING RANGE)', () => {
    const p = sincronizada({ distancia: CONFIG.rangoAcople - 1, velAproximacion: CONFIG.peligro.velocidad + 1 });
    assert.equal(estadoHud(p, CONFIG), 'UNSAFE APPROACH');
  });

  test('DOCKED y MISSION FAILED segun la fase', () => {
    const ok = avanzar(sincronizada({ distancia: 0.01, velAproximacion: 2 }), 0.05, CONFIG);
    assert.equal(estadoHud(ok, CONFIG), 'DOCKED');
    const mal = avanzar(sincronizada({ distancia: 0.01, velAproximacion: 99 }), 0.05, CONFIG);
    assert.equal(estadoHud(mal, CONFIG), 'MISSION FAILED');
  });

  test('nivelDeEstado agrupa los estados en niveles visuales', () => {
    assert.equal(nivelDeEstado('APPROACHING'), 'neutro');
    assert.equal(nivelDeEstado('MATCHING ROTATION'), 'atencion');
    assert.equal(nivelDeEstado('DOCKING RANGE'), 'seguro');
    assert.equal(nivelDeEstado('DOCKED'), 'seguro');
    assert.equal(nivelDeEstado('UNSAFE APPROACH'), 'peligro');
    assert.equal(nivelDeEstado('MISSION FAILED'), 'peligro');
  });
});
