// Formulario de contacto (contacto.html). El sitio es estatico (GitHub Pages):
// no hay backend propio. El envio real lo hace Web3Forms (endpoint publico y
// gratuito): el <form> postea ahi con una `access_key` y Web3Forms reenvia el
// contenido por correo. SIN JS el POST nativo del <form> ya alcanza (Web3Forms
// redirige a gracias.html via el campo `redirect`). CON JS interceptamos para
// correr la puesta en escena "del otro lado del estante" (css/layout.css §16) y
// resolver el envio con fetch() sin salir de la pagina; si el fetch falla, se
// ofrece un enlace `mailto:` de respaldo.
//
// `construirMailto()` y `direccionDestino()` son puras e importables sin
// navegador (test TDD, Principio V) y hoy son el camino de respaldo.

const DESTINO_USUARIO = 'stschernitschek377';
const DESTINO_DOMINIO = 'alumnos.frh.utn.edu.ar';

export function direccionDestino() {
  return `${DESTINO_USUARIO}@${DESTINO_DOMINIO}`;
}

// Arma el enlace `mailto:` de respaldo a partir de { nombre, email, asunto,
// mensaje }. Asunto y cuerpo van URL-encodeados.
export function construirMailto(datos = {}) {
  const nombre = (datos.nombre || '').trim();
  const email = (datos.email || '').trim();
  const asunto = (datos.asunto || '').trim();
  const mensaje = (datos.mensaje || '').trim();

  const asuntoFinal = asunto || `Contacto desde el sitio${nombre ? ` — ${nombre}` : ''}`;
  const cuerpo = [
    mensaje,
    '',
    '—',
    nombre ? `Nombre: ${nombre}` : null,
    email ? `Correo: ${email}` : null,
    'Enviado desde el formulario de contacto del sitio Interstellar.',
  ]
    .filter((linea) => linea !== null)
    .join('\n');

  const params = `subject=${encodeURIComponent(asuntoFinal)}&body=${encodeURIComponent(cuerpo)}`;
  return `mailto:${direccionDestino()}?${params}`;
}

function leerCampos(form) {
  const valor = (name) => {
    const el = form.elements ? form.elements[name] : null;
    return el ? el.value : '';
  };
  return {
    nombre: valor('name'),
    email: valor('email'),
    asunto: valor('subject'),
    mensaje: valor('message'),
  };
}

export function init() {
  if (typeof document === 'undefined' || typeof document.querySelector !== 'function') {
    return;
  }
  const form = document.querySelector('[data-form-contacto]');
  if (!form || typeof form.addEventListener !== 'function') {
    return;
  }

  const split = typeof form.closest === 'function' ? form.closest('.contacto-split') : null;
  const nota = form.querySelector('[data-form-nota]');
  const rotuloTexto = split ? split.querySelector('[data-rotulo-texto]') : null;

  const ESTADOS = ['is-enviando', 'is-enviado', 'is-error'];
  const fijarEstado = (clase, rotulo) => {
    if (split) {
      split.classList.remove(...ESTADOS);
      if (clase) {
        split.classList.add(clase);
      }
    }
    if (rotuloTexto && rotulo) {
      rotuloTexto.textContent = rotulo;
    }
  };

  // Muestra la linea de log y reinicia la animacion de "tipeo" (CSS §16).
  // `estado` pinta el color (ok / error) y solo el caso 'error' usa innerHTML,
  // siempre con cadenas controladas + un unico <a>.
  const avisar = (contenido, estado) => {
    if (!nota) {
      return;
    }
    if (estado === 'error') {
      nota.innerHTML = contenido;
    } else {
      nota.textContent = contenido;
    }
    if (estado) {
      nota.setAttribute('data-estado', estado);
    } else {
      nota.removeAttribute('data-estado');
    }
    nota.hidden = false;
    nota.classList.remove('is-typing');
    void nota.offsetWidth; // fuerza reflow para relanzar la animacion
    nota.classList.add('is-typing');
  };

  // Tocar cualquier campo tras enviar libera el bloqueo para corregir y reenviar.
  form.addEventListener('focusin', () => {
    if (split && !split.classList.contains('is-enviando')) {
      fijarEstado(null, 'Canal abierto');
    }
  });

  form.addEventListener('submit', (evento) => {
    if (typeof fetch !== 'function') {
      return; // sin fetch: dejamos el POST nativo del <form> hacia Web3Forms
    }
    evento.preventDefault();

    const datos = leerCampos(form);
    if (!datos.nombre.trim() || !datos.mensaje.trim()) {
      avisar('Completá tu nombre y el mensaje antes de empujar el estante.');
      return;
    }

    // Asunto del correo: si el visitante no puso uno, uno por defecto.
    const campoAsunto = form.elements.subject;
    if (campoAsunto && !campoAsunto.value.trim()) {
      campoAsunto.value = `Mensaje desde el sitio Interstellar — ${datos.nombre.trim()}`;
    }

    fijarEstado('is-enviando', 'Mensaje en tránsito');
    avisar('MENSAJE EMPUJADO AL ESTANTE · esperando que lo recojan');
    if (nota && typeof nota.focus === 'function') {
      nota.setAttribute('tabindex', '-1');
      nota.focus();
    }

    // El pulso de luz que cruza hacia Cooper dura ~1600ms (css §16). Si la
    // respuesta llega antes, esperamos a que termine para recién cambiar de
    // estado; si el visitante prefiere sin movimiento, no hay espera.
    const t0 = Date.now();
    const quieto =
      typeof matchMedia === 'function' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rematar = (fn) => {
      const restante = quieto ? 0 : 1600 - (Date.now() - t0);
      if (restante > 0) {
        setTimeout(fn, restante);
      } else {
        fn();
      }
    };

    fetch(form.action, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          rematar(() => {
            fijarEstado('is-enviado', 'Recibido');
            avisar('RECIBIDO DEL OTRO LADO · la respuesta puede tardar', 'ok');
            form.reset();
          });
        } else {
          throw new Error((data && data.message) || 'Web3Forms rechazó el envío');
        }
      })
      .catch(() => {
        rematar(() => {
          fijarEstado('is-error', 'Sin enlace');
          const enlace = `<a href="${construirMailto(datos)}">${direccionDestino()}</a>`;
          avisar(`No se pudo enviar. Probá de nuevo, o escribinos a ${enlace}`, 'error');
        });
      });
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init());
  } else {
    init();
  }
}
