import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { aplicarVolumenNativo, accionPorVisibilidad } from '../js/layout.js';

describe('musica de fondo en mobile — volumen nativo (iOS)', () => {
  test('aplicarVolumenNativo devuelve true si el navegador respeta audio.volume', () => {
    const audio = { volume: 1 };
    assert.equal(aplicarVolumenNativo(audio, 0.32), true);
    assert.equal(audio.volume, 0.32);
  });

  test('aplicarVolumenNativo devuelve false si volume es de solo lectura (iOS Safari)', () => {
    const audio = {
      get volume() {
        return 1;
      },
      set volume(_v) {
        /* iOS ignora la asignacion */
      },
    };
    assert.equal(aplicarVolumenNativo(audio, 0.32), false);
  });
});

describe('musica de fondo en mobile — pausa al ocultarse la pagina', () => {
  const base = {
    oculto: false,
    sonando: false,
    pausadoPorOculto: false,
    preferida: true,
    silenciadoPorTrailer: false,
  };

  test('pausa si la pagina se oculta mientras suena', () => {
    assert.equal(accionPorVisibilidad({ ...base, oculto: true, sonando: true }), 'pausar');
  });

  test('no hace nada si se oculta y la musica ya estaba pausada', () => {
    assert.equal(accionPorVisibilidad({ ...base, oculto: true, sonando: false }), null);
  });

  test('reanuda al volver solo si la pausa la causo el ocultamiento y la preferencia sigue on', () => {
    assert.equal(accionPorVisibilidad({ ...base, pausadoPorOculto: true }), 'reanudar');
  });

  test('no reanuda si el usuario apago la musica mientras tanto', () => {
    assert.equal(accionPorVisibilidad({ ...base, pausadoPorOculto: true, preferida: false }), null);
  });

  test('no reanuda si el trailer la tiene silenciada', () => {
    assert.equal(
      accionPorVisibilidad({ ...base, pausadoPorOculto: true, silenciadoPorTrailer: true }),
      null,
    );
  });

  test('no reanuda si no fue pausada por el ocultamiento', () => {
    assert.equal(accionPorVisibilidad({ ...base, pausadoPorOculto: false }), null);
  });
});

describe('musica de fondo en mobile — CSS', () => {
  const css = readFileSync(new URL('../css/layout.css', import.meta.url), 'utf8');

  test('el interruptor se muestra por debajo de 60rem', () => {
    const bloque = css.match(/@media \(max-width: 59\.99rem\) \{\s*\.musica-toggle \{[^}]*\}/);
    assert.ok(bloque, 'falta el bloque mobile de .musica-toggle');
    assert.match(bloque[0], /display:\s*inline-flex/);
    assert.match(bloque[0], /min-height:\s*44px/);
  });
});
