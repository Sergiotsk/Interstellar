import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { NavConfig } from '../js/nav-data.js';
import { buildHeader, buildFooter, renderLayout, init } from '../js/layout.js';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function countMatches(html, pattern) {
  return (html.match(pattern) ?? []).length;
}

describe('js/layout.js — contrato layout-injection.md', () => {
  const header = buildHeader(NavConfig);
  const footer = buildFooter();

  test('8 ítems de nivel superior con su destino (FR-002)', () => {
    assert.equal(NavConfig.items.length, 8);
    for (const item of NavConfig.items) {
      assert.ok(
        header.includes(`href="${escapeHtml(item.href)}"`),
        `falta el destino ${item.href}`,
      );
      assert.ok(
        header.includes(`>${escapeHtml(item.label)}<`),
        `falta el label ${item.label}`,
      );
    }
  });

  test('un solo <header> con un <nav> que contiene un <ul>', () => {
    assert.equal(countMatches(header, /<header>/g), 1);
    assert.equal(countMatches(header, /<nav\b/g), 1);
    assert.ok(header.startsWith('<header>'));
    assert.ok(header.includes('<nav'));
    assert.ok(header.includes('<ul>'));
  });

  test('el header incluye el toggle de navegación con aria-controls hacia el nav (T030)', () => {
    // El boton ☰ se inyecta ANTES del <nav> y fuera de el, para que
    // collectDisclosures(nav) nunca lo confunda con un disclosure de submenu.
    assert.ok(header.includes('<header>'));
    assert.ok(header.includes('<button type="button" class="nav-toggle"'));
    assert.ok(header.includes('aria-expanded="false"'));
    assert.ok(header.includes('aria-controls="nav-principal"'));
    assert.ok(header.includes('aria-label="Abrir menú de navegación"'));
    assert.ok(header.includes('<nav id="nav-principal"'));
    // El toggle va fuera del <nav>: despues del <header> y antes del <nav>.
    const toggleIdx = header.indexOf('class="nav-toggle"');
    const navIdx = header.indexOf('<nav');
    assert.ok(toggleIdx < navIdx, 'el toggle va antes del <nav>');
  });

  test('hasChildren: true solo en los 4 ejes (FR-003)', () => {
    const axes = NavConfig.items.filter((item) => item.hasChildren);
    assert.equal(axes.length, 4);
    assert.deepEqual(
      axes.map((axis) => axis.label),
      ['Mundos', 'Personajes', 'La Ciencia', 'El Viaje'],
    );
  });

  test('21 destinos anidados con href <pagina>.html#<ancla> (FR-005..FR-008)', () => {
    const items = NavConfig.items.filter((item) => item.hasChildren);
    const children = items.flatMap((item) => item.children);
    assert.equal(children.length, 21);
    for (const child of children) {
      assert.match(child.href, /^[a-z-]+\.html#[a-z-]+$/);
      assert.ok(header.includes(`href="${escapeHtml(child.href)}"`));
      assert.ok(header.includes(`>${escapeHtml(child.label)}<`));
    }
  });

  test('cada eje renderiza un <button> de disclosure, un <ul> anidado y sus hijos', () => {
    const axes = NavConfig.items.filter((item) => item.hasChildren);
    // En el header hay `axes.length` disclosure de submenu + 1 toggle (T030).
    assert.equal(countMatches(header, /<button\b/g), axes.length + 1);
    assert.equal(countMatches(header, /<ul\b/g), 1 + axes.length);
    for (const axis of axes) {
      assert.match(
        header,
        new RegExp(`<button[^>]*aria-controls="submenu-${axis.id}"[^>]*>`),
      );
      assert.ok(header.includes(`id="submenu-${axis.id}"`));
      for (const child of axis.children) {
        assert.ok(header.includes(`href="${escapeHtml(child.href)}"`));
      }
    }
  });

  test('el footer tiene créditos, sección de fuentes y enlace al repo (FR-012, FR-013)', () => {
    assert.ok(footer.startsWith('<footer>'));
    assert.ok(countMatches(footer, /<footer>/g) === 1);
    assert.match(footer, /Interstellar/i);
    assert.match(footer, /Fuent/i);
    assert.ok(footer.includes('https://github.com/Sergiotsk/Interstellar.git'));
  });

  test('el pie lista los créditos de los backdrops de Mundos (FR-006)', () => {
    for (const archivo of [
      'mundos-gargantua.jpg',
      'mundos-miller.jpg',
      'mundos-mann.jpg',
      'mundos-tesseract.jpg',
    ]) {
      assert.ok(footer.includes(archivo), `falta el crédito de ${archivo}`);
    }
  });

  test('el pie lista los créditos de los retratos de Personajes (FR-007)', () => {
    for (const archivo of [
      'personajes-cooper.jpg',
      'personajes-murph.jpg',
      'personajes-brand.jpg',
      'personajes-profesor-brand.jpg',
      'personajes-mann.jpg',
      'personajes-tars-case.jpg',
    ]) {
      assert.ok(footer.includes(archivo), `falta el crédito de ${archivo}`);
    }
  });

  test('layout.js no lleva datos propios: sin argumento produce el mismo header que con NavConfig', () => {
    assert.equal(buildHeader(), buildHeader(NavConfig));
  });

  test('renderLayout devuelve header y footer listos para inyectar', () => {
    const layout = renderLayout(NavConfig);
    assert.ok(layout.header.startsWith('<header>'));
    assert.ok(layout.footer.startsWith('<footer>'));
  });

  test('init inyecta el header al inicio del body y el footer al final', () => {
    const calls = [];
    const fakeBody = {
      insertAdjacentHTML(position, html) {
        calls.push({ position, html });
      },
    };
    globalThis.document = { body: fakeBody };
    init();
    assert.equal(calls.length, 2);
    assert.equal(calls[0].position, 'afterbegin');
    assert.ok(calls[0].html.startsWith('<header>'));
    assert.equal(calls[1].position, 'beforeend');
    assert.ok(calls[1].html.startsWith('<footer>'));
  });
});