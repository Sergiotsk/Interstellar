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

  test('actualizarPieSeccionesCondicional oculta marcos en la home', async () => {
    const { actualizarPieSeccionesCondicional } = await import('../js/layout.js');
    const fakeMarco1 = { hidden: false };
    const fakeMarco2 = { hidden: false };
    globalThis.window = { innerHeight: 800 };
    globalThis.document = {
      body: { classList: { contains: (cls) => cls === 'home' } },
      documentElement: { scrollHeight: 1200 },
      querySelectorAll: (sel) => (sel === 'footer .pie-secciones-marco' ? [fakeMarco1, fakeMarco2] : []),
    };

    actualizarPieSeccionesCondicional();
    assert.equal(fakeMarco1.hidden, true);
    assert.equal(fakeMarco2.hidden, true);
  });

  test('actualizarPieSeccionesCondicional muestra marcos solo si hay scroll fuera de home', async () => {
    const { actualizarPieSeccionesCondicional } = await import('../js/layout.js');
    const fakeMarco = { hidden: true };
    globalThis.window = { innerHeight: 800 };
    globalThis.document = {
      body: { classList: { contains: () => false } },
      documentElement: { scrollHeight: 1200 },
      querySelectorAll: (sel) => (sel === 'footer .pie-secciones-marco' ? [fakeMarco] : []),
    };

    actualizarPieSeccionesCondicional();
    assert.equal(fakeMarco.hidden, false);

    // Sin scroll
    globalThis.document.documentElement.scrollHeight = 800;
    actualizarPieSeccionesCondicional();
    assert.equal(fakeMarco.hidden, true);
  });

  test('shouldIgnoreVisit ignora archivos estáticos, multimedia y atributos especiales', async () => {
    const { shouldIgnoreVisit } = await import('../js/swup-router.js');
    assert.equal(shouldIgnoreVisit('assets/img/foto.jpg'), true);
    assert.equal(shouldIgnoreVisit('assets/img/foto.png'), true);
    assert.equal(shouldIgnoreVisit('assets/img/foto.webp'), true);
    assert.equal(shouldIgnoreVisit('assets/doc.pdf'), true);
    assert.equal(shouldIgnoreVisit('assets/audio/cancion.mp3'), true);

    // Páginas HTML válidas para SPA
    assert.equal(shouldIgnoreVisit('personajes.html'), false);
    assert.equal(shouldIgnoreVisit('galeria.html'), false);
    assert.equal(shouldIgnoreVisit('/mundos-miller.html'), false);

    // Elementos con data-no-swup o download
    const fakeElNoSwup = { closest: (sel) => (sel === '[data-no-swup]' ? {} : null) };
    assert.equal(shouldIgnoreVisit('personajes.html', fakeElNoSwup), true);

    const fakeElDownload = { closest: (sel) => (sel === '[download]' ? {} : null) };
    assert.equal(shouldIgnoreVisit('archivo.html', fakeElDownload), true);
  });
});
