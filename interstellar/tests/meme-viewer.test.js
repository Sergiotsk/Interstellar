import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createMemeViewerState,
  formatCounter,
  MEMES_DATA,
} from '../js/meme-viewer.js';

test('MEMES_DATA contiene memes válidos de Interstellar y de "estamos trabajando"', () => {
  assert.ok(Array.isArray(MEMES_DATA));
  assert.ok(MEMES_DATA.length >= 6, 'Debe haber al menos 6 memes curados');

  const tieneTrabajando = MEMES_DATA.some(
    (m) => m.category === 'trabajando' || m.tagline.toLowerCase().includes('trabajando') || m.tagline.toLowerCase().includes('código') || m.tagline.toLowerCase().includes('desarrollador'),
  );
  assert.ok(tieneTrabajando, 'Debe incluir memes relacionados con "estamos trabajando / programando"');

  for (const meme of MEMES_DATA) {
    assert.ok(meme.id, 'Cada meme debe tener un ID de Giphy');
    assert.ok(meme.title, 'Cada meme debe tener un título');
    assert.ok(meme.tagline, 'Cada meme debe tener un remate humorístico');
  }
});

test('createMemeViewerState: inicialización por defecto', () => {
  const state = createMemeViewerState(MEMES_DATA);
  assert.equal(state.currentIndex, 0);
  assert.equal(state.current().id, MEMES_DATA[0].id);
  assert.equal(state.total, MEMES_DATA.length);
});

test('createMemeViewerState: navegación circular next() y prev()', () => {
  const mockMemes = [
    { id: '1', title: 'Uno', tagline: 'T1' },
    { id: '2', title: 'Dos', tagline: 'T2' },
    { id: '3', title: 'Tres', tagline: 'T3' },
  ];
  const state = createMemeViewerState(mockMemes, 0);

  // Avanzar
  assert.equal(state.next().id, '2');
  assert.equal(state.next().id, '3');
  // Al llegar al final, vuelve al inicio
  assert.equal(state.next().id, '1');

  // Retroceder desde el inicio da la vuelta al final
  assert.equal(state.prev().id, '3');
  assert.equal(state.prev().id, '2');
  assert.equal(state.prev().id, '1');
});

test('createMemeViewerState: random() selecciona un índice válido', () => {
  const mockMemes = [
    { id: '1', title: 'Uno', tagline: 'T1' },
    { id: '2', title: 'Dos', tagline: 'T2' },
    { id: '3', title: 'Tres', tagline: 'T3' },
  ];
  const state = createMemeViewerState(mockMemes, 0);

  for (let i = 0; i < 15; i++) {
    const item = state.random();
    assert.ok(item, 'Debe retornar un meme');
    assert.ok(['1', '2', '3'].includes(item.id));
  }
});

test('createMemeViewerState: manejo de lista vacía', () => {
  const state = createMemeViewerState([]);
  assert.equal(state.currentIndex, 0);
  assert.equal(state.total, 0);
  assert.equal(state.current(), null);
  assert.equal(state.next(), null);
  assert.equal(state.prev(), null);
  assert.equal(state.random(), null);
});

test('formatCounter devuelve formato de display de cabina espacial [ X / Y ]', () => {
  assert.equal(formatCounter(0, 8), '[ 1 / 8 ]');
  assert.equal(formatCounter(4, 8), '[ 5 / 8 ]');
  assert.equal(formatCounter(0, 0), '[ 0 / 0 ]');
});
