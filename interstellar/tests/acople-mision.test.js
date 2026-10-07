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
  reintentar,
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

describe('acople/logica/mision.js — causas de fallo y reintento (US2)', () => {
  const correr = (p, segundos) => {
    let q = p;
    for (let t = 0; t < segundos && q.fase === 'en-curso'; t += CONFIG.deltaMaxS) q = avanzar(q, CONFIG.deltaMaxS, CONFIG);
    return q;
  };

  test('giro sobre el limite de control sostenido mas alla del margen -> control', () => {
    const p = correr(sincronizada({ velAngular: CONFIG.limiteControl + 0.5 }), CONFIG.margenSinControl + 0.5);
    assert.equal(p.fase, 'fallida');
    assert.equal(p.desenlace.causa, 'control');
  });

  test('si el giro vuelve bajo el limite antes del margen, el contador se resetea', () => {
    let p = correr(sincronizada({ velAngular: CONFIG.limiteControl + 0.5 }), CONFIG.margenSinControl / 2);
    assert.ok(p.tiempoSinControl > 0);
    p = { ...p, nave: { ...p.nave, velAngular: W } };
    p = avanzar(p, CONFIG.deltaMaxS, CONFIG);
    assert.equal(p.tiempoSinControl, 0);
    assert.equal(p.fase, 'en-curso');
  });

  test('sin combustible y sin acercarse -> combustible', () => {
    const p = avanzar(sincronizada({ combustible: 0, velAproximacion: 0 }), 0.05, CONFIG);
    assert.equal(p.fase, 'fallida');
    assert.equal(p.desenlace.causa, 'combustible');
  });

  test('sin combustible pero acercandose: no falla hasta el contacto', () => {
    let p = avanzar(sincronizada({ combustible: 0, velAproximacion: 2, distancia: 5 }), 0.05, CONFIG);
    assert.equal(p.fase, 'en-curso');
    p = correr(p, 10);
    assert.equal(p.fase, 'acoplada');
  });

  test('todo fallo trae estadisticas completas y puntaje null (FR-026)', () => {
    const p = avanzar(sincronizada({ combustible: 0, velAproximacion: 0 }), 0.05, CONFIG);
    const d = p.desenlace;
    assert.equal(d.exito, false);
    assert.equal(d.puntaje, null);
    for (const k of ['tiempoTotal', 'combustibleRestante', 'velocidadFinal']) assert.equal(typeof d[k], 'number', k);
  });

  test('reintentar devuelve una partida nueva en curso, sin intro y con valores iniciales', () => {
    const fallida = avanzar(sincronizada({ distancia: 0.01, velAproximacion: 99 }), 0.05, CONFIG);
    const p = reintentar(fallida, CONFIG);
    assert.equal(p.fase, 'en-curso');
    assert.equal(p.tiempo, 0);
    assert.equal(p.desenlace, null);
    assert.equal(p.nave.distancia, CONFIG.distanciaInicial);
    assert.equal(p.nave.combustible, CONFIG.combustible.inicial);
  });
});
