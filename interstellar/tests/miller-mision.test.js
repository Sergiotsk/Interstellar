import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/miller/config.js';
import {
  crearPartida,
  saltarIntro,
  conAcciones,
  avanzar,
  pausar,
  reanudar,
  reintentar,
  estadoHud,
} from '../js/minijuegos/miller/logica/mision.js';

const DT = CONFIG.pasoFijoS;
const acc = (...a) => new Set(a);

// Avanza paso a paso (como el loop real) hasta n segundos o hasta que la fase cambie a una de 'hasta'.
function correr(p, segundos, hasta = []) {
  let r = p;
  for (let i = 0; i < Math.round(segundos / DT); i++) {
    r = avanzar(r, DT, CONFIG);
    if (hasta.includes(r.fase)) break;
  }
  return r;
}

const enJuego = (semilla = 7) => correr(crearPartida(CONFIG, { semilla, conIntro: false }), CONFIG.cuentaS + DT * 2);

// Coloca al jugador en un punto (los tests de reglas no necesitan recorrer el mapa).
const ubicar = (p, x, z, extra = {}) => ({ ...p, jugador: { ...p.jugador, x, z, vx: 0, vz: 0, ...extra } });

function conBaliza(p) {
  const { baliza } = p.mapa;
  return avanzar(conAcciones(ubicar(p, baliza.x, baliza.z), acc('accion')), DT, CONFIG);
}

describe('miller/logica/mision.js — camino feliz (US1)', () => {
  test('arranca en intro, o en cuenta si es un reintento', () => {
    const p = crearPartida(CONFIG, { semilla: 1 });
    assert.equal(p.fase, 'intro');
    assert.equal(p.semilla, 1);
    assert.equal(crearPartida(CONFIG, { semilla: 1, conIntro: false }).fase, 'cuenta');
  });

  test('el jugador arranca junto al Ranger, quieto, y la ola oculta', () => {
    const p = crearPartida(CONFIG, { semilla: 1 });
    assert.ok(Math.abs(p.jugador.x - CONFIG.ranger.x) < 60);
    assert.equal(p.jugador.vx, 0);
    assert.equal(p.ola.revelada, false);
    assert.equal(p.balizaRecogida, false);
  });

  test('la intro termina sola o se saltea', () => {
    const p = crearPartida(CONFIG, { semilla: 1 });
    assert.equal(correr(p, CONFIG.introS + DT).fase, 'cuenta');
    assert.equal(saltarIntro(p).fase, 'cuenta');
    assert.equal(saltarIntro(saltarIntro(p)).tFase, 0);
  });

  test('la cuenta termina en exploracion con el evento de inicio', () => {
    const p = crearPartida(CONFIG, { semilla: 1, conIntro: false });
    let r = p;
    const eventos = [];
    for (let i = 0; i < Math.round((CONFIG.cuentaS + 0.1) / DT); i++) {
      r = avanzar(r, DT, CONFIG);
      eventos.push(...r.eventos);
    }
    assert.equal(r.fase, 'exploracion');
    assert.ok(eventos.includes('inicio'));
  });

  test('el tiempo de mision solo corre desde la exploracion', () => {
    const p = crearPartida(CONFIG, { semilla: 1 });
    assert.equal(correr(p, 2).t, 0);
    const juego = enJuego();
    const despues = correr(juego, 1);
    assert.ok(Math.abs(despues.t - juego.t - 1) < 0.02);
  });

  test('moverse aplica las acciones al jugador', () => {
    const p = correr(conAcciones(enJuego(), acc('moverDerecha')), 1);
    assert.ok(p.jugador.vx > 0);
  });

  test('la accion al alcance de la baliza la recoge, revela la ola y pasa a huida', () => {
    const p = conBaliza(enJuego());
    assert.equal(p.balizaRecogida, true);
    assert.equal(p.fase, 'huida');
    assert.equal(p.ola.revelada, true);
    assert.ok(p.eventos.includes('baliza') && p.eventos.includes('olaRevelada'));
  });

  test('sin accion, pasar por encima de la baliza no la recoge', () => {
    const p = enJuego();
    const r = avanzar(ubicar(p, p.mapa.baliza.x, p.mapa.baliza.z), DT, CONFIG);
    assert.equal(r.balizaRecogida, false);
    assert.equal(r.fase, 'exploracion');
  });

  test('con la baliza, entrar al radio del Ranger pasa a despegue y salir vuelve a huida', () => {
    const p = conBaliza(enJuego());
    const adentro = avanzar(ubicar(p, CONFIG.ranger.x, CONFIG.ranger.z), DT, CONFIG);
    assert.equal(adentro.fase, 'despegue');
    const afuera = avanzar(ubicar(adentro, CONFIG.ranger.x + 200, CONFIG.ranger.z), DT, CONFIG);
    assert.equal(afuera.fase, 'huida');
  });

  test('sin la baliza, el radio del Ranger no habilita el despegue', () => {
    const p = avanzar(conAcciones(ubicar(enJuego(), CONFIG.ranger.x, CONFIG.ranger.z), acc('accion')), DT, CONFIG);
    assert.equal(p.fase, 'exploracion');
    assert.equal(p.despegue.carga, 0);
  });

  test('mantener la accion en el radio completa la carga y gana', () => {
    const p = conAcciones(ubicar(conBaliza(enJuego()), CONFIG.ranger.x, CONFIG.ranger.z), acc('accion'));
    const r = correr(p, CONFIG.despegue.tiempo + 0.2, ['exito', 'fracaso']);
    assert.equal(r.fase, 'exito');
    assert.ok(r.eventos.includes('despegue'));
    assert.ok(r.resultado.exito);
  });

  test('pausada no avanza nada; reanudada sigue', () => {
    const p = pausar(conAcciones(enJuego(), acc('moverDerecha')));
    const r = correr(p, 1);
    assert.equal(r.t, p.t);
    assert.equal(r.jugador.x, p.jugador.x);
    assert.equal(r.ola.x, p.ola.x);
    assert.ok(correr(reanudar(r), 0.5).t > r.t);
  });

  test('un dt enorme se acota: no salta fases ni teletransporta la ola', () => {
    const p = conBaliza(enJuego());
    const r = avanzar(p, 5, CONFIG);
    assert.ok(r.t - p.t <= CONFIG.deltaMaxS + 1e-9);
    assert.ok(p.ola.x - r.ola.x < 20);
  });

  test('los eventos son solo los del ultimo avance', () => {
    const p = conBaliza(enJuego());
    assert.deepEqual(avanzar(p, DT, CONFIG).eventos, []);
  });

  test('estadoHud nombra cada momento de la mision', () => {
    const juego = enJuego();
    assert.equal(estadoHud(juego), 'SEARCHING');
    const huida = conBaliza(juego);
    assert.equal(estadoHud(huida), 'BEACON ACQUIRED');
    assert.equal(estadoHud(correr(huida, 2)), 'WAVE INCOMING');
    assert.equal(estadoHud(correr(huida, 4)), 'RETURN TO RANGER');
    assert.equal(estadoHud({ ...huida, fase: 'despegue' }), 'LIFTOFF READY');
    assert.equal(estadoHud({ ...huida, fase: 'exito' }), 'MISSION COMPLETE');
    assert.equal(estadoHud({ ...huida, fase: 'fracaso' }), 'MISSION FAILED');
  });

  test('el nivel de peligro es lejos mientras la ola esta oculta', () => {
    const p = correr(ubicar(enJuego(), CONFIG.mundo.ancho, 45), 0.2);
    assert.equal(p.nivel, 'lejos');
  });

  test('avanzar no muta la partida recibida', () => {
    const p = enJuego();
    const copia = structuredClone(p);
    avanzar(conAcciones(p, acc('moverDerecha')), 0.5, CONFIG);
    assert.deepEqual(structuredClone(p), copia);
  });
});

describe('miller/logica/mision.js — fracaso y reintento (US2)', () => {
  test('la ola alcanza al jugador: fracaso con causa jugador', () => {
    const p = conBaliza(enJuego());
    const r = avanzar({ ...p, ola: { ...p.ola, x: p.jugador.x + 0.1 } }, DT, CONFIG);
    assert.equal(r.fase, 'fracaso');
    assert.equal(r.causa, 'jugador');
    assert.ok(r.eventos.includes('fracaso'));
  });

  test('la ola alcanza al Ranger con el jugador lejos: causa ranger', () => {
    const p = ubicar(conBaliza(enJuego()), CONFIG.ranger.x - 60, 45);
    const r = avanzar({ ...p, ola: { ...p.ola, x: CONFIG.ranger.x + 0.1 } }, DT, CONFIG);
    assert.equal(r.fase, 'fracaso');
    assert.equal(r.causa, 'ranger');
  });

  test('si alcanza a los dos en el mismo paso, la causa es el jugador', () => {
    const p = ubicar(conBaliza(enJuego()), CONFIG.ranger.x + 1, 45);
    const r = avanzar({ ...p, ola: { ...p.ola, x: CONFIG.ranger.x + 1.5 } }, DT, CONFIG);
    assert.equal(r.causa, 'jugador');
  });

  test('si la carga se completa en el mismo paso que llega la ola, gana el despegue', () => {
    const p = conAcciones(ubicar(conBaliza(enJuego()), CONFIG.ranger.x, CONFIG.ranger.z), acc('accion'));
    const casi = { ...p, fase: 'despegue', despegue: { carga: 0.999, soltadas: 0, sostenida: true } };
    const r = avanzar({ ...casi, ola: { ...casi.ola, x: CONFIG.ranger.x + 0.1 } }, DT, CONFIG);
    assert.equal(r.fase, 'exito');
  });

  test('la ola oculta no puede alcanzar a nadie', () => {
    const p = ubicar(enJuego(), CONFIG.mundo.ancho, 45);
    assert.equal(correr(p, 60).fase, 'exploracion');
  });

  test('un choque fuerte suma choques, aturde y emite el evento', () => {
    const p = enJuego();
    const resto = p.mapa.restos[0];
    const r = avanzar(ubicar(p, resto.x - 12, resto.z, { vx: CONFIG.restos.velChoque + 20 }), DT, CONFIG);
    assert.equal(r.choques, 1);
    assert.ok(r.jugador.aturdidoS > 0);
    assert.ok(r.eventos.includes('choque'));
  });

  test('el resultado de un fracaso no puntua', () => {
    const p = conBaliza(enJuego());
    const r = avanzar({ ...p, ola: { ...p.ola, x: p.jugador.x } }, DT, CONFIG);
    assert.equal(r.resultado.exito, false);
    assert.equal(r.resultado.causa, 'jugador');
    assert.equal(r.resultado.puntaje, 0);
    assert.equal(r.resultado.rango, null);
  });

  test('una partida terminada ya no avanza', () => {
    const p = conBaliza(enJuego());
    const r = avanzar({ ...p, ola: { ...p.ola, x: p.jugador.x } }, DT, CONFIG);
    assert.equal(avanzar(r, 1, CONFIG), r);
  });

  test('reintentar arranca limpio en la cuenta, con otro mapa', () => {
    const p = conBaliza(enJuego(7));
    const r = reintentar(p, CONFIG, 8);
    assert.equal(r.fase, 'cuenta');
    assert.equal(r.semilla, 8);
    assert.equal(r.t, 0);
    assert.equal(r.choques, 0);
    assert.equal(r.balizaRecogida, false);
    assert.notDeepEqual(r.mapa, p.mapa);
  });
});

describe('miller/logica/mision.js — resultado y puntaje (US3)', () => {
  function ganar(segundosExtra = 0) {
    const p = conAcciones(ubicar(conBaliza(enJuego()), CONFIG.ranger.x, CONFIG.ranger.z), acc('accion'));
    return correr({ ...p, t: p.t + segundosExtra }, CONFIG.despegue.tiempo + 0.2, ['exito']);
  }

  test('el resultado de un exito trae todas las estadisticas', () => {
    const { resultado: r } = ganar();
    for (const k of ['tiempoMision', 'horasTerrestres', 'margenOla', 'choques', 'asistenciaCase', 'precision', 'factores', 'puntaje', 'rango']) {
      assert.ok(k in r, `falta ${k}`);
    }
    assert.ok(r.puntaje > 0 && r.puntaje <= CONFIG.puntaje.max);
    assert.ok(['S', 'A', 'B', 'C'].includes(r.rango));
    assert.ok(r.margenOla > 0);
    assert.equal(r.precision, 1);
  });

  test('volver mas rapido puntua mas', () => {
    assert.ok(ganar(0).resultado.puntaje > ganar(50).resultado.puntaje);
  });

  test('las horas terrestres corresponden al tiempo de mision', () => {
    const { resultado: r } = ganar(10);
    assert.ok(Math.abs(r.horasTerrestres - r.tiempoMision * 17.045) < 0.1);
  });
});

describe('miller/logica/mision.js — CASE (US5)', () => {
  const enCase = (p) => ubicar(p, p.mapa.caseRobot.x, p.mapa.caseRobot.z);

  test('alcanzar a CASE da el impulso, marca la asistencia y emite el evento', () => {
    const r = avanzar(enCase(enJuego()), DT, CONFIG);
    assert.ok(r.caseRobot.impulsoS > 0);
    assert.equal(r.caseRobot.asistio, true);
    assert.ok(r.eventos.includes('impulso'));
  });

  test('el impulso vence a los duracionS segundos', () => {
    const r = correr(avanzar(enCase(enJuego()), DT, CONFIG), CONFIG.caseRobot.duracionS + 0.1);
    assert.equal(r.caseRobot.impulsoS, 0);
  });

  test('durante la recarga no da otro impulso', () => {
    let r = correr(avanzar(enCase(enJuego()), DT, CONFIG), CONFIG.caseRobot.duracionS + 0.1);
    r = avanzar(enCase(r), DT, CONFIG);
    assert.equal(r.caseRobot.impulsoS, 0);
    assert.ok(!r.eventos.includes('impulso'));
  });

  test('con impulso el jugador corre mas rapido', () => {
    const conImpulso = correr(conAcciones(avanzar(enCase(enJuego()), DT, CONFIG), acc('moverIzquierda')), 1.5);
    const sinImpulso = correr(conAcciones(enJuego(), acc('moverIzquierda')), 1.5);
    assert.ok(Math.abs(conImpulso.jugador.vx) > Math.abs(sinImpulso.jugador.vx));
  });

  test('la asistencia queda en el resultado', () => {
    let p = avanzar(enCase(enJuego()), DT, CONFIG);
    p = conAcciones(ubicar(conBaliza(p), CONFIG.ranger.x, CONFIG.ranger.z), acc('accion'));
    const r = correr(p, CONFIG.despegue.tiempo + 0.2, ['exito']);
    assert.equal(r.resultado.asistenciaCase, true);
  });
});
