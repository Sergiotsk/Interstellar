import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { leerPalanca, seguirDedo } from '../js/minijuegos/miller/logica/joystick.js';

const OPC = { radio: 50, zonaMuerta: 0.2 };
const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);

describe('miller/logica/joystick.js — palanca analogica flotante', () => {
  test('dentro de la zona muerta no hay movimiento', () => {
    const p = leerPalanca(5, 5, OPC);
    assert.deepEqual([p.x, p.y, p.activo], [0, 0, false]);
  });

  test('en el borde del radio entrega magnitud 1 en la direccion del dedo', () => {
    const p = leerPalanca(50, 0, OPC);
    cerca(p.x, 1);
    cerca(p.y, 0);
    assert.equal(p.activo, true);
  });

  test('pasado el radio la magnitud se satura en 1', () => {
    const p = leerPalanca(0, -300, OPC);
    cerca(p.x, 0);
    cerca(p.y, -1);
  });

  test('la magnitud se reescala desde la zona muerta: a mitad de camino util da 0.5', () => {
    const p = leerPalanca(30, 0, OPC); // 30/50 = 0.6 -> (0.6 - 0.2) / 0.8 = 0.5
    cerca(p.x, 0.5);
  });

  test('en diagonal la magnitud no supera 1', () => {
    const p = leerPalanca(100, 100, OPC);
    cerca(Math.hypot(p.x, p.y), 1);
  });

  test('la perilla se dibuja pegada al radio aunque el dedo se vaya lejos', () => {
    const p = leerPalanca(0, 200, OPC);
    cerca(p.perillaX, 0);
    cerca(p.perillaY, 50);
  });

  test('la perilla sigue al dedo mientras esta dentro del radio', () => {
    const p = leerPalanca(10, -20, OPC);
    assert.deepEqual([p.perillaX, p.perillaY], [10, -20]);
  });
});

describe('seguirDedo — la base se arrastra cuando el dedo se aleja', () => {
  test('si el dedo esta dentro del radio la base no se mueve', () => {
    assert.deepEqual(seguirDedo({ x: 100, y: 100 }, { x: 130, y: 100 }, 50), { x: 100, y: 100 });
  });

  test('si el dedo se pasa la base lo acompana hasta quedar a un radio', () => {
    const base = seguirDedo({ x: 100, y: 100 }, { x: 250, y: 100 }, 50);
    assert.deepEqual(base, { x: 200, y: 100 });
  });
});
