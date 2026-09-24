import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { sincronizarAudioRuta } from '../js/layout.js';

describe('js/swup-router.js — enrutador SPA y persistencia de audio', () => {
  let fakeSessionStorage;
  let fakeAudio;

  beforeEach(() => {
    fakeSessionStorage = {};
    globalThis.sessionStorage = {
      getItem(k) { return fakeSessionStorage[k] ?? null; },
      setItem(k, v) { fakeSessionStorage[k] = String(v); },
    };
  });

  test('sincronizarAudioRuta no pausa el audio entre páginas estándar cuando la preferencia es on', () => {
    sessionStorage.setItem('interstellar:musica', 'on');
    // En páginas normales, la navegación gapless no debe pausar la música
    sincronizarAudioRuta('personajes.html');
    assert.equal(sessionStorage.getItem('interstellar:musica'), 'on');
  });

  test('sincronizarAudioRuta maneja la excepción de trailer.html', () => {
    sessionStorage.setItem('interstellar:musica', 'on');
    sincronizarAudioRuta('trailer.html');
    // La preferencia sigue siendo 'on' para recordar el estado
    assert.equal(sessionStorage.getItem('interstellar:musica'), 'on');

    // Al salir de trailer.html hacia otra sección, reanuda normalmente
    sincronizarAudioRuta('mundos.html');
    assert.equal(sessionStorage.getItem('interstellar:musica'), 'on');
  });
});
