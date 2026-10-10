// Capa DOM de Miller: HUD, banners, cuenta, resultado con "tirada" y ranking sobre el lienzo. Solo lee la partida.
import { ANIM } from './config.js';
import { estadoHud } from './logica/mision.js';
import { intensidadSenal } from './logica/baliza.js';
import { formatoTierra, horasTerrestres } from './logica/dilatacion.js';
import { textoPuesto } from '../comun/logica/tabla-ranking.js';

const MARCAS_SENAL = 5;
const SEGMENTOS_OLA = 5;
const PASOS_TIRADA = 12;
const SEGUNDOS_CONTINUE = 9;

const dos = (n) => String(n).padStart(2, '0');
const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

// --- Textos puros (testeables sin DOM) ---

export function textoTierra(horas) {
  const { anos, meses, dias } = formatoTierra(horas);
  if (anos > 0) return `${anos}y ${dos(meses)}m`;
  if (meses > 0) return `${meses}m ${dos(dias)}d`;
  return `${dias}d ${dos(Math.floor(horas - dias * 24))}h`;
}

export function textoTierraLargo(horas) {
  const { anos, meses, dias } = formatoTierra(horas);
  const unir = (a, b) => (b ? `${a} y ${b}` : a);
  if (anos > 0) return unir(plural(anos, 'año', 'años'), meses ? plural(meses, 'mes', 'meses') : '');
  if (meses > 0) return unir(plural(meses, 'mes', 'meses'), dias ? plural(dias, 'día', 'días') : '');
  const horasSueltas = Math.floor(horas - dias * 24);
  if (dias === 0 && horasSueltas === 0) return 'menos de una hora';
  if (dias === 0) return plural(horasSueltas, 'hora', 'horas');
  return unir(plural(dias, 'día', 'días'), horasSueltas ? plural(horasSueltas, 'hora', 'horas') : '');
}

export function lecturasHud(partida, config) {
  const { t, ola, jugador, balizaRecogida, despegue, mapa } = partida;
  const distancia = Math.max(0, ola.x - jugador.x);
  const tramo = config.ola.distanciaRevelacion / SEGMENTOS_OLA;
  const marcas = Math.round(intensidadSenal(jugador, mapa.baliza, config) * MARCAS_SENAL);
  return {
    tiempo: `${dos(Math.floor(t / 60))}:${dos(Math.floor(t % 60))}`,
    tierra: textoTierra(horasTerrestres(t, config)),
    ola: ola.revelada ? `${Math.round(distancia)} m` : '—',
    segmentos: ola.revelada ? Math.min(SEGMENTOS_OLA, Math.ceil(distancia / tramo)) : SEGMENTOS_OLA,
    senal: balizaRecogida ? 'ACQUIRED' : ')'.repeat(marcas) + '·'.repeat(MARCAS_SENAL - marcas),
    carga: despegue.carga,
    mostrarCarga: balizaRecogida,
    estado: estadoHud(partida),
    nivel: partida.nivel,
    accionTexto: balizaRecogida ? 'Despegar' : 'Recoger',
  };
}

export function fraseResultado(resultado) {
  return resultado.exito ? `Volviste. En la Tierra pasaron ${textoTierraLargo(resultado.horasTerrestres)}.` : 'El agua no espera.';
}

export function textoCausa(causa, config) {
  return causa === 'ranger' ? `La ola alcanzó al ${config.nombres.nave}.` : 'La ola te alcanzó.';
}

// Items de la tirada en orden; cada uno sabe dibujarse en cualquier punto del conteo.
export function itemsTirada(resultado) {
  const items = [
    { item: 'tiempo', valor: resultado.tiempoMision, texto: (v) => `${v.toFixed(1)} s` },
    { item: 'tierra', valor: resultado.horasTerrestres, texto: (v) => textoTierra(v) },
    { item: 'margen', valor: resultado.margenOla, texto: (v) => `${Math.round(v)} m` },
    { item: 'case', valor: null, texto: () => (resultado.asistenciaCase ? 'SÍ' : 'NO') },
    { item: 'total', valor: resultado.puntaje, texto: (v) => `${Math.round(v).toLocaleString('es-AR')} pts` },
  ];
  return resultado.exito ? items : items.filter((i) => i.item !== 'margen' && i.item !== 'total');
}

// --- DOM ---

export function crearOverlays(raiz, { pantallaCompleta = false, tactil = false, config } = {}) {
  const pantallas = [...raiz.querySelectorAll('[data-pantalla]')];
  const hudEl = raiz.querySelector('[data-pantalla="hud"]');
  const hud = Object.fromEntries([...raiz.querySelectorAll('[data-hud]')].map((el) => [el.dataset.hud, el]));
  const segmentos = [...raiz.querySelectorAll('[data-hud-ola] span')];
  const despegueEl = raiz.querySelector('[data-hud-despegue]');
  const cargaEl = raiz.querySelector('[data-hud-carga]');
  const accionTextoEl = raiz.querySelector('[data-accion-texto]');
  const mandos = [...raiz.querySelectorAll('[data-mandos]')];
  const botonPantalla = raiz.querySelector('[data-accion="pantalla"]');
  const cuentaEl = raiz.querySelector('[data-cuenta]');
  const bannerEl = raiz.querySelector('[data-banner]');
  const resultado = raiz.querySelector('[data-pantalla="resultado"]');
  const titulo = raiz.querySelector('[data-resultado-titulo]');
  const causaEl = raiz.querySelector('[data-resultado-causa]');
  const items = Object.fromEntries([...raiz.querySelectorAll('[data-item]')].map((el) => [el.dataset.item, el]));
  const valores = Object.fromEntries([...raiz.querySelectorAll('[data-resultado]')].map((el) => [el.dataset.resultado, el]));
  const rangoEl = raiz.querySelector('[data-rango]');
  const fraseEl = raiz.querySelector('[data-frase]');
  const recordEl = raiz.querySelector('[data-resultado-record]');
  const continueEl = raiz.querySelector('[data-continue]');
  const editorEl = raiz.querySelector('[data-editor-nombre]');
  const casillasEl = raiz.querySelector('[data-nombre-casillas]');
  const lecturaNombreEl = raiz.querySelector('[data-nombre-lectura]');
  const accionesResultado = raiz.querySelector('[data-resultado-acciones]');
  const rankings = Object.fromEntries([...raiz.querySelectorAll('[data-ranking]')].map((el) => [el.dataset.ranking, el]));
  raiz.querySelectorAll('[data-nombre]').forEach((el) => {
    el.textContent = config.nombres[el.dataset.nombre] ?? el.textContent;
  });

  let temporizadores = [];
  let ultimo = {};
  const programar = (fn, ms) => temporizadores.push(setTimeout(fn, ms));

  function cancelar() {
    temporizadores.forEach(clearTimeout);
    temporizadores = [];
  }

  function mostrar(nombre) {
    pantallas.forEach((el) => {
      const p = el.dataset.pantalla;
      el.hidden = !(p === nombre || (p === 'hud' && nombre === 'pausa'));
    });
    mandos.forEach((el) => {
      el.hidden = nombre !== 'hud';
    });
    if (botonPantalla) botonPantalla.hidden = !pantallaCompleta || !['hud', 'resultado', 'intro'].includes(nombre);
    if (nombre !== 'hud') pintarCuenta(null);
  }

  // Solo se toca el DOM si el texto cambio: el HUD se pinta varias veces por segundo.
  function fijarTexto(clave, el, texto) {
    if (!el || ultimo[clave] === texto) return;
    ultimo[clave] = texto;
    el.textContent = texto;
  }

  function pintarHud(l) {
    ['tiempo', 'tierra', 'ola', 'senal', 'estado'].forEach((k) => fijarTexto(k, hud[k], l[k]));
    fijarTexto('accion', accionTextoEl, l.accionTexto);
    if (ultimo.nivel !== l.nivel) {
      ultimo.nivel = l.nivel;
      hudEl.dataset.nivel = l.nivel;
    }
    if (ultimo.segmentos !== l.segmentos) {
      ultimo.segmentos = l.segmentos;
      segmentos.forEach((s, i) => s.toggleAttribute('data-encendido', i < l.segmentos));
    }
    despegueEl.hidden = !l.mostrarCarga;
    cargaEl.style.setProperty('--carga', l.carga.toFixed(3));
  }

  // n = null la oculta; cada digito nuevo reinicia el squash.
  function pintarCuenta(n) {
    if (!cuentaEl) return;
    const texto = n === null ? '' : String(n);
    if (cuentaEl.textContent === texto && !cuentaEl.hidden === (n !== null)) return;
    cuentaEl.hidden = n === null;
    cuentaEl.textContent = texto;
    cuentaEl.removeAttribute('data-golpe');
    void cuentaEl.offsetWidth; // reflow: reinicia la animacion
    if (n !== null) cuentaEl.setAttribute('data-golpe', '');
  }

  function banner(texto, tipo = 'normal') {
    bannerEl.hidden = true;
    bannerEl.textContent = texto;
    bannerEl.dataset.tipo = tipo;
    void bannerEl.offsetWidth;
    bannerEl.hidden = false;
    programar(() => {
      if (bannerEl.textContent === texto) bannerEl.hidden = true;
    }, ANIM.bannerEntradaMs + ANIM.bannerRetencionMs);
  }

  // Tirada estilo fichin: cada item cuenta de 0 a su valor con un tick, uno detras del otro.
  function pintarResultado(r, { posicion = -1, alTick = () => {}, alTerminar = () => {} } = {}) {
    cancelar();
    bannerEl.hidden = true;
    resultado.classList.toggle('miller-resultado--fallida', !r.exito);
    titulo.textContent = r.exito ? 'Mission complete!' : 'Mission failed';
    causaEl.hidden = r.exito;
    causaEl.textContent = r.exito ? '' : textoCausa(r.causa, config);
    Object.values(items).forEach((el) => {
      el.hidden = true;
    });
    rangoEl.hidden = true;
    fraseEl.textContent = '';
    recordEl.hidden = true;
    continueEl.textContent = '';
    accionesResultado.hidden = true;
    editorEl.hidden = true;

    let demora = ANIM.bannerEntradaMs;
    itemsTirada(r).forEach(({ item, valor, texto }) => {
      const pasos = valor === null ? 1 : PASOS_TIRADA;
      for (let k = 1; k <= pasos; k++) {
        programar(() => {
          items[item].hidden = false;
          valores[item].textContent = valor === null ? texto() : texto((valor * k) / pasos);
          alTick(k === pasos);
        }, demora);
        demora += ANIM.tickTiradaMs;
      }
      demora += ANIM.tickTiradaMs * 3;
    });
    programar(() => {
      if (r.exito) {
        rangoEl.textContent = r.rango;
        rangoEl.hidden = false;
      }
      fraseEl.textContent = fraseResultado(r);
      recordEl.textContent = textoPuesto(posicion);
      recordEl.hidden = recordEl.textContent === '';
      alTerminar();
    }, demora + ANIM.tickTiradaMs * 4);
  }

  function mostrarAcciones(visible) {
    accionesResultado.hidden = !visible;
  }

  // RETRY? 9..0 como un fichin; al llegar a 0 queda esperando, nunca sale solo.
  function iniciarContinue() {
    for (let n = SEGUNDOS_CONTINUE; n >= 0; n--) {
      programar(() => {
        continueEl.textContent = n > 0 ? `RETRY? ${n}` : 'RETRY?';
      }, (SEGUNDOS_CONTINUE - n) * 1000);
    }
  }

  function pintarRanking(cual, filas) {
    const lista = rankings[cual];
    if (!lista) return;
    lista.replaceChildren(
      ...filas.map((f) => {
        const li = document.createElement('li');
        li.className = 'miller-ranking-fila';
        if (f.resaltada) li.classList.add('miller-ranking-fila--resaltada');
        if (f.vacia) li.classList.add('miller-ranking-fila--vacia');
        [f.puesto, f.nombre || '········', f.puntaje || '—'].forEach((texto, i) => {
          const span = document.createElement('span');
          span.className = ['miller-ranking-puesto', 'miller-ranking-nombre', 'miller-ranking-puntaje'][i];
          span.textContent = texto;
          li.append(span);
        });
        return li;
      }),
    );
    lista.closest('[data-ranking-bloque]').hidden = filas.every((f) => f.vacia);
  }

  function mostrarEditor(visible) {
    editorEl.hidden = !visible;
    accionesResultado.hidden = visible;
  }

  function pintarEditor(editor) {
    casillasEl.replaceChildren(
      ...editor.letras.map((letra, i) => {
        const casilla = document.createElement('button');
        casilla.type = 'button';
        casilla.tabIndex = -1;
        casilla.dataset.casilla = String(i);
        casilla.className = 'miller-nombre-casilla';
        if (i === editor.cursor) casilla.classList.add('miller-nombre-casilla--activa');
        casilla.textContent = letra === ' ' ? '_' : letra;
        return casilla;
      }),
    );
    lecturaNombreEl.textContent = `Nombre: ${editor.letras.join('').trim() || 'vacío'}`;
  }

  function enfocarResultado() {
    titulo.focus({ preventScroll: true });
  }

  function pintarPantalla(activa) {
    if (!botonPantalla) return;
    if (activa && tactil) {
      botonPantalla.textContent = 'Salir';
    } else if (activa) {
      const tecla = document.createElement('kbd');
      tecla.textContent = 'Esc';
      botonPantalla.replaceChildren(tecla, ' Salir');
    } else {
      botonPantalla.textContent = 'Pantalla completa';
    }
    botonPantalla.setAttribute('aria-label', activa ? 'Salir de pantalla completa' : 'Jugar en pantalla completa');
  }

  function reiniciarHud() {
    ultimo = {};
  }

  return {
    mostrar,
    pintarHud,
    pintarCuenta,
    banner,
    pintarResultado,
    mostrarAcciones,
    iniciarContinue,
    pintarRanking,
    mostrarEditor,
    pintarEditor,
    enfocarResultado,
    pintarPantalla,
    reiniciarHud,
    cancelar,
  };
}
