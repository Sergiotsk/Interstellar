import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/miller/config.js';
import { moverJugador, resolverRestos } from '../js/minijuegos/miller/logica/fisica.js';

const DT = CONFIG.pasoFijoS;
const VMAX = CONFIG.jugador.aceleracion / CONFIG.jugador.arrastre;
const base = (extra = {}) => ({ x: 1000, z: 45, vx: 0, vz: 0, aturdidoS: 0, mirando: 'der', quietoS: 0, ...extra });
const acciones = (...a) => new Set(a);
const correr = (j, accs, segundos, opciones) => {
  let r = j;
  for (let i = 0; i < Math.round(segundos / DT); i++) r = moverJugador(r, accs, DT, CONFIG, opciones);
  return r;
};

describe('miller/logica/fisica.js — moverJugador (R4)', () => {
  test('manteniendo una direccion converge a la velocidad terminal', () => {
    const j = correr(base(), acciones('moverDerecha'), 3);
    assert.ok(Math.abs(j.vx - VMAX) < 1, `vx=${j.vx}`);
    assert.equal(j.mirando, 'der');
  });

  test('al soltar frena gradualmente sin invertir el sentido', () => {
    let j = correr(base(), acciones('moverDerecha'), 2);
    const v0 = j.vx;
    j = moverJugador(j, acciones(), DT, CONFIG);
    assert.ok(j.vx < v0 && j.vx > 0);
    j = correr(j, acciones(), 3);
    assert.ok(j.vx >= 0 && j.vx < 1);
  });

  test('la profundidad se recorre mas lento que el largo', () => {
    const j = correr(base({ z: 0 }), acciones('moverAbajo'), 0.5);
    const k = correr(base(), acciones('moverDerecha'), 0.5);
    assert.ok(j.vz > 0 && j.vz < k.vx);
    assert.ok(Math.abs(j.vz / k.vx - CONFIG.jugador.factorProfundidad) < 0.01);
  });

  test('arriba aleja de la camara (z baja) y abajo acerca (z sube)', () => {
    assert.ok(moverJugador(base(), acciones('moverArriba'), DT, CONFIG).vz < 0);
    assert.ok(moverJugador(base(), acciones('moverAbajo'), DT, CONFIG).vz > 0);
  });

  test('respeta los limites del mundo y de la franja, frenando en el borde', () => {
    const izq = correr(base({ x: 5 }), acciones('moverIzquierda'), 1);
    assert.equal(izq.x, 0);
    assert.equal(izq.vx, 0);
    assert.equal(izq.mirando, 'izq');
    const fondo = correr(base({ z: 3 }), acciones('moverArriba'), 1);
    assert.equal(fondo.z, 0);
    const frente = correr(base({ z: 85 }), acciones('moverAbajo'), 1);
    assert.equal(frente.z, CONFIG.mundo.profundidad);
    const der = correr(base({ x: CONFIG.mundo.ancho - 5 }), acciones('moverDerecha'), 1);
    assert.equal(der.x, CONFIG.mundo.ancho);
  });

  test('aturdido no acelera y el aturdimiento se descuenta', () => {
    const j = moverJugador(base({ aturdidoS: 0.5 }), acciones('moverDerecha'), DT, CONFIG);
    assert.equal(j.vx, 0);
    assert.ok(Math.abs(j.aturdidoS - (0.5 - DT)) < 1e-9);
    const k = correr(base({ aturdidoS: 0.1 }), acciones(), 0.5);
    assert.equal(k.aturdidoS, 0);
  });

  test('el impulso de CASE multiplica la velocidad terminal', () => {
    const j = correr(base(), acciones('moverDerecha'), 3, { impulso: CONFIG.caseRobot.impulso });
    assert.ok(Math.abs(j.vx - VMAX * CONFIG.caseRobot.impulso) < 1);
  });

  test('cuenta el tiempo quieto (para la animacion idle)', () => {
    const j = correr(base(), acciones(), 1);
    assert.ok(Math.abs(j.quietoS - 1) < 1e-6);
    assert.equal(moverJugador(j, acciones('moverDerecha'), DT, CONFIG).quietoS, 0);
  });

  test('no muta el jugador recibido', () => {
    const j = base();
    moverJugador(j, acciones('moverDerecha'), DT, CONFIG);
    assert.deepEqual(j, base());
  });
});

describe('miller/logica/fisica.js — resolverRestos', () => {
  const resto = { x: 1000, z: 45, ancho: 16, prof: 10, variante: 0 };

  test('sin superposicion no cambia nada', () => {
    const j = base({ x: 900 });
    const r = resolverRestos(j, [resto], CONFIG);
    assert.equal(r.jugador, j);
    assert.equal(r.choque, false);
  });

  test('superpuesto en x pero en otra profundidad no colisiona', () => {
    const j = base({ x: 1000, z: 80 });
    assert.equal(resolverRestos(j, [resto], CONFIG).jugador, j);
  });

  test('superpuesto lo saca fuera del resto por el eje de menor penetracion', () => {
    const j = base({ x: 1000 - 12, z: 45, vx: 10 });
    const r = resolverRestos(j, [resto], CONFIG);
    const minimo = (CONFIG.jugador.caja.ancho + resto.ancho) / 2;
    assert.ok(Math.abs(r.jugador.x - resto.x) >= minimo - 1e-9);
    assert.equal(r.jugador.vx, 0);
    assert.equal(r.choque, false);
  });

  test('a velocidad de choque aturde y lo reporta', () => {
    const j = base({ x: 1000 - 12, vx: CONFIG.restos.velChoque + 5 });
    const r = resolverRestos(j, [resto], CONFIG);
    assert.equal(r.choque, true);
    assert.equal(r.jugador.aturdidoS, CONFIG.restos.aturdimientoS);
  });
});
