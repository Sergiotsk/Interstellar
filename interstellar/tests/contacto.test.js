import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { construirMailto, direccionDestino } from '../js/contacto.js';

describe('js/contacto.js — enlace mailto del formulario de contacto', () => {
  test('direccionDestino compone usuario@dominio (no va como texto plano en el fuente)', () => {
    assert.equal(direccionDestino(), 'stschernitschek377@alumnos.frh.utn.edu.ar');
  });

  test('construirMailto arma mailto: con destino, subject y body codificados', () => {
    const url = construirMailto({ nombre: 'Cooper', mensaje: 'Hola mundo' });
    assert.ok(url.startsWith('mailto:stschernitschek377@alumnos.frh.utn.edu.ar?'));
    assert.match(url, /[?&]subject=/);
    assert.match(url, /[?&]body=/);
    // Todo el enlace va URL-encodeado: sin espacios ni saltos de línea crudos.
    assert.ok(!/\s/.test(url), 'el mailto no debe tener espacios sin codificar');

    const legible = decodeURIComponent(url);
    assert.match(legible, /Hola mundo/);
    assert.match(legible, /Nombre: Cooper/);
  });

  test('usa el asunto propio si se pasa; si no, uno por defecto con el nombre', () => {
    assert.match(
      decodeURIComponent(construirMailto({ nombre: 'Murph', mensaje: 'x' })),
      /subject=Contacto desde el sitio — Murph/,
    );
    assert.match(
      decodeURIComponent(
        construirMailto({ nombre: 'Murph', asunto: 'Bug en la galería', mensaje: 'x' }),
      ),
      /subject=Bug en la galería/,
    );
  });

  test('incluye el correo del remitente en el cuerpo solo si se completó', () => {
    assert.match(
      decodeURIComponent(construirMailto({ nombre: 'A', email: 'a@b.com', mensaje: 'm' })),
      /Correo: a@b\.com/,
    );
    assert.doesNotMatch(
      decodeURIComponent(construirMailto({ nombre: 'A', mensaje: 'm' })),
      /Correo:/,
    );
  });

  test('recorta espacios de los campos antes de armar el enlace', () => {
    const legible = decodeURIComponent(
      construirMailto({ nombre: '  Amelia  ', mensaje: '  probando  ' }),
    );
    assert.match(legible, /Nombre: Amelia\n/);
    assert.doesNotMatch(legible, /Nombre: {2}Amelia/);
  });
});
