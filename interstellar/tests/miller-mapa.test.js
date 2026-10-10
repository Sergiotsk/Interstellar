import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/miller/config.js';
import { crearRng } from '../js/minijuegos/miller/logica/azar.js';
import { crearMapa } from '../js/minijuegos/miller/logica/mapa.js';

const mapa = (semilla) => crearMapa(CONFIG, crearRng(semilla));
const SEMILLAS = [1, 2, 3, 42, 99, 1234, 777, 2026];

describe('miller/logica/mapa.js — mapa reproducible por semilla (FR-012)', () => {
  test('la misma semilla da el mismo mapa', () => {
    assert.deepEqual(mapa(42), mapa(42));
    assert.notDeepEqual(mapa(1), mapa(2));
  });

  test('el Ranger sale de la config', () => {
    const { ranger } = mapa(1);
    assert.deepEqual(ranger, { x: CONFIG.ranger.x, z: CONFIG.ranger.z, radio: CONFIG.ranger.radio });
  });

  for (const s of SEMILLAS) {
    test(`semilla ${s}: baliza en su ventana y dentro de la franja`, () => {
      const { baliza } = mapa(s);
      assert.ok(baliza.x >= CONFIG.baliza.ventanaX[0] && baliza.x <= CONFIG.baliza.ventanaX[1]);
      assert.ok(baliza.z >= 0 && baliza.z <= CONFIG.mundo.profundidad);
    });

    test(`semilla ${s}: restos completos, separados y lejos del Ranger y la baliza`, () => {
      const { restos, ranger, baliza } = mapa(s);
      assert.equal(restos.length, CONFIG.restos.cantidad);
      restos.forEach((r, i) => {
        assert.ok([0, 1, 2].includes(r.variante));
        assert.ok(r.z >= 0 && r.z <= CONFIG.mundo.profundidad);
        assert.ok(Math.abs(r.x - ranger.x) > ranger.radio + r.ancho, 'resto encima del Ranger');
        assert.ok(Math.hypot(r.x - baliza.x, r.z - baliza.z) > 30, 'resto encima de la baliza');
        restos.slice(i + 1).forEach((o) => {
          assert.ok(Math.hypot(r.x - o.x, r.z - o.z) >= CONFIG.restos.separacionMin);
        });
      });
    });

    test(`semilla ${s}: en cada x queda un hueco de paso en z`, () => {
      const { restos } = mapa(s);
      for (let x = 0; x <= CONFIG.mundo.ancho; x += 4) {
        const ocupados = restos
          .filter((r) => Math.abs(r.x - x) < r.ancho / 2)
          .map((r) => [r.z - r.prof / 2, r.z + r.prof / 2])
          .sort((a, b) => a[0] - b[0]);
        let borde = 0;
        let hueco = 0;
        for (const [desde, hasta] of ocupados) {
          hueco = Math.max(hueco, desde - borde);
          borde = Math.max(borde, hasta);
        }
        hueco = Math.max(hueco, CONFIG.mundo.profundidad - borde);
        assert.ok(hueco >= CONFIG.restos.huecoMinZ, `x=${x}: hueco ${hueco}`);
      }
    });

    test(`semilla ${s}: CASE entre el Ranger y la baliza`, () => {
      const { caseRobot, ranger, baliza } = mapa(s);
      assert.ok(caseRobot.x > ranger.x && caseRobot.x < baliza.x);
      assert.ok(caseRobot.z >= 0 && caseRobot.z <= CONFIG.mundo.profundidad);
    });
  }
});
