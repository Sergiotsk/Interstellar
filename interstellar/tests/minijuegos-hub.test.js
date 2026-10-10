import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { textoRecord } from '../js/minijuegos/hub.js';

describe('js/minijuegos/hub.js — record en la bahia 1', () => {
  test('sin record muestra "Sin registro"', () => {
    assert.equal(textoRecord(null), 'Sin registro');
  });

  test('con record muestra el puntaje con separador de miles', () => {
    assert.equal(textoRecord({ puntaje: 7421 }), 'Récord: 7.421 pts');
    assert.equal(textoRecord({ puntaje: 0 }), 'Récord: 0 pts');
  });
});

describe('js/minijuegos/hub.js — record por capitulo (011)', () => {
  const guardado = (clave, puntaje) => [clave, JSON.stringify({ v: 1, entradas: [{ nombre: 'COOPER', puntaje }], ultimoNombre: 'COOPER' })];

  test('cada bahia lee su propio ranking: acople y Miller no se mezclan', async () => {
    const { recordDe, MISIONES } = await import('../js/minijuegos/hub.js');
    const datos = new Map([
      guardado('interstellar:minijuegos:acople:ranking', 7421),
      guardado('interstellar:minijuegos:miller:ranking', 8840),
    ]);
    const storage = { getItem: (k) => datos.get(k) ?? null };
    const porMision = Object.fromEntries(MISIONES.map((m) => [m.mision, recordDe(storage, m.config)?.puntaje]));
    assert.deepEqual(porMision, { acople: 7421, miller: 8840 });
  });

  test('sin almacenamiento no hay record y no lanza', async () => {
    const { recordDe, MISIONES } = await import('../js/minijuegos/hub.js');
    MISIONES.forEach((m) => assert.equal(recordDe(undefined, m.config), null));
  });
});
