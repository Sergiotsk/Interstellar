// Obstaculos de la fase 1: escombros solidos (se saltan), geiseres que lanzan y chatarra electrificada.
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/miller/config.js';
import { crearRng } from '../js/minijuegos/miller/logica/azar.js';
import { crearSim } from '../js/minijuegos/miller/logica/estado.js';
import { actualizarObstaculos, faseGeiser, faseChatarra } from '../js/minijuegos/miller/logica/obstaculos-superficie.js';

const DT = 1 / 60;
const DIMS = { ancho: 960, alto: 540 };
const O = CONFIG.obstaculos;
const G = O.geiser;
const Z = O.chatarra;
const r = () => crearRng(3);
// Mapa vacio con el jugador quieto en (0, 0) y en el suelo.
const limpia = () => {
  const sim = Object.assign(crearSim(CONFIG, crearRng(2), DIMS), { phase: 'EXPLORATION' });
  Object.assign(sim, { debris: [], geiseres: [], chatarra: [], playerX: 0, playerY: 0, playerZ: 0, playerVx: 0, playerVy: 0, isGrounded: true });
  return sim;
};
const geiser = (fase) => {
  const t = { reposo: 0, aviso: G.periodo[0] - G.erupcion - G.aviso + 0.1, erupcion: G.periodo[0] - G.erupcion + 0.1 }[fase];
  return { x: 0, y: 0, periodo: G.periodo[0], t, golpeo: false };
};
const chatarra = (fase) => {
  const t = { apagada: 0, aviso: Z.apagada + 0.1, activa: Z.apagada + Z.aviso + 0.1 }[fase];
  return { x: 0, y: 0, radio: Z.radio[0], t, tick: 0 };
};

describe('obstaculos-superficie.js — escombros solidos', () => {
  test('en el suelo empujan al jugador hacia afuera y frenan la velocidad contra el escombro', () => {
    const sim = limpia();
    sim.debris = [{ x: 30, y: 0, radius: 20 }];
    sim.playerVx = 200;
    actualizarObstaculos(sim, DT, CONFIG, r());
    assert.ok(Math.abs(sim.playerX - (30 - 20 - O.radioJugador)) < 1e-6, `x ${sim.playerX}`);
    assert.ok(sim.playerVx <= 0);
  });

  test('saltando se pasan por arriba', () => {
    const sim = limpia();
    sim.debris = [{ x: 30, y: 0, radius: 20 }];
    Object.assign(sim, { playerZ: O.alturaSalto + 5, isGrounded: false, playerVx: 200 });
    actualizarObstaculos(sim, DT, CONFIG, r());
    assert.equal(sim.playerX, 0);
    assert.equal(sim.playerVx, 200);
  });
});

describe('obstaculos-superficie.js — geiseres', () => {
  test('el ciclo: reposo, aviso y erupcion', () => {
    assert.equal(faseGeiser(geiser('reposo'), G), 'reposo');
    assert.equal(faseGeiser(geiser('aviso'), G), 'aviso');
    assert.equal(faseGeiser(geiser('erupcion'), G), 'erupcion');
  });

  test('en erupcion dania y lanza por el aire, una sola vez por erupcion', () => {
    const sim = limpia();
    sim.geiseres = [geiser('erupcion')];
    actualizarObstaculos(sim, DT, CONFIG, r());
    assert.equal(sim.playerShieldHp, 100 - G.danio);
    assert.equal(sim.playerVz, G.impulso);
    assert.equal(sim.isGrounded, false);
    Object.assign(sim, { playerZ: 0, isGrounded: true });
    actualizarObstaculos(sim, DT, CONFIG, r());
    assert.equal(sim.playerShieldHp, 100 - G.danio);
  });

  test('en aviso no hace nada', () => {
    const sim = limpia();
    sim.geiseres = [geiser('aviso')];
    actualizarObstaculos(sim, DT, CONFIG, r());
    assert.equal(sim.playerShieldHp, 100);
    assert.equal(sim.isGrounded, true);
  });

  test('vuelve a golpear en la erupcion siguiente', () => {
    const sim = limpia();
    const g = geiser('erupcion');
    sim.geiseres = [g];
    actualizarObstaculos(sim, DT, CONFIG, r());
    Object.assign(sim, { playerZ: 0, isGrounded: true, playerShieldHp: 100 });
    g.t = g.periodo - 0.01;
    actualizarObstaculos(sim, 0.05, CONFIG, r());
    assert.equal(g.golpeo, false, 'al cerrar el ciclo se rearma');
    g.t = geiser('erupcion').t;
    actualizarObstaculos(sim, DT, CONFIG, r());
    assert.equal(sim.playerShieldHp, 100 - G.danio);
  });
});

describe('obstaculos-superficie.js — chatarra electrificada', () => {
  test('el ciclo: apagada, aviso y activa', () => {
    assert.equal(faseChatarra(chatarra('apagada'), Z), 'apagada');
    assert.equal(faseChatarra(chatarra('aviso'), Z), 'aviso');
    assert.equal(faseChatarra(chatarra('activa'), Z), 'activa');
  });

  test('activa: dania por tick parado encima', () => {
    const sim = limpia();
    sim.chatarra = [chatarra('activa')];
    actualizarObstaculos(sim, DT, CONFIG, r());
    assert.equal(sim.playerShieldHp, 100 - Z.danio);
    actualizarObstaculos(sim, DT, CONFIG, r());
    assert.equal(sim.playerShieldHp, 100 - Z.danio, 'espera el tick');
    actualizarObstaculos(sim, Z.tick, CONFIG, r());
    assert.equal(sim.playerShieldHp, 100 - 2 * Z.danio);
  });

  test('saltando o apagada no dania', () => {
    const sim = limpia();
    sim.chatarra = [chatarra('activa')];
    Object.assign(sim, { playerZ: 20, isGrounded: false });
    actualizarObstaculos(sim, DT, CONFIG, r());
    assert.equal(sim.playerShieldHp, 100);
    const otra = limpia();
    otra.chatarra = [chatarra('apagada')];
    actualizarObstaculos(otra, DT, CONFIG, r());
    assert.equal(otra.playerShieldHp, 100);
  });
});

describe('obstaculos-superficie.js — ubicacion', () => {
  test('geiseres y chatarra lejos del Ranger y de las cargas', () => {
    for (let semilla = 1; semilla < 25; semilla++) {
      const sim = crearSim(CONFIG, crearRng(semilla), DIMS);
      assert.equal(sim.geiseres.length, G.cantidad);
      assert.equal(sim.chatarra.length, Z.cantidad);
      for (const o of [...sim.geiseres, ...sim.chatarra]) {
        assert.ok(Math.hypot(o.x, o.y) > O.lejosDelRanger, 'lejos del Ranger');
        for (const c of sim.cargas) assert.ok(Math.hypot(o.x - c.x, o.y - c.y) > O.lejosDeCargas, 'lejos de las cargas');
      }
    }
  });
});
