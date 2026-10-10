// Capa DOM del simulador: pantallas, HUD y resultado sobre el lienzo (research R3). Solo lee la partida.
import { deltaOmega, deltaTheta } from './logica/docking.js';
import { textoPuesto } from '../comun/logica/tabla-ranking.js';

const CAUSAS = {
  impacto: 'Impacto a velocidad excesiva',
  angulo: 'Ángulo de entrada incorrecto',
  control: 'Pérdida de control',
  combustible: 'Sin combustible',
};

const pct = (x) => `${Math.round(Math.min(1, Math.max(0, x)) * 100)}%`;
const formatoPuntaje = (n) => `${n.toLocaleString('es-AR')} pts`;

// Lecturas del HUD como texto; pura para poder razonarla aparte del DOM.
export function lecturasHud(partida, config) {
  const { nave, estacion } = partida;
  const sync = 1 - deltaOmega(nave, estacion) / config.peligro.omega;
  const grados = (deltaTheta(nave, estacion) * 180) / Math.PI;
  return {
    sync: pct(sync),
    alineacion: `${grados.toFixed(0)}°`,
    velocidad: `${nave.velAproximacion.toFixed(1)} u/s`,
    distancia: `${Math.round(nave.distancia)} u`,
    combustible: pct(nave.combustible),
  };
}

export function crearOverlays(raiz, { pantallaCompleta = false, tactil = false } = {}) {
  const pantallas = [...raiz.querySelectorAll('[data-pantalla]')];
  const hud = Object.fromEntries([...raiz.querySelectorAll('[data-hud]')].map((el) => [el.dataset.hud, el]));
  const estadoEl = raiz.querySelector('[data-hud-estado]');
  const estadoTexto = raiz.querySelector('[data-hud-estado-texto]');
  const resultado = raiz.querySelector('[data-pantalla="resultado"]');
  const titulo = raiz.querySelector('[data-resultado-titulo]');
  const causa = raiz.querySelector('[data-resultado-causa]');
  const recordEl = raiz.querySelector('[data-resultado-record]');
  const datos = Object.fromEntries([...raiz.querySelectorAll('[data-resultado]')].map((el) => [el.dataset.resultado, el]));
  const soloExito = [...raiz.querySelectorAll('[data-resultado-solo-exito]')];
  const botonPantalla = raiz.querySelector('[data-accion="pantalla"]');
  const indicacionEl = raiz.querySelector('[data-hud-indicacion]');
  const tablero = Object.fromEntries([...raiz.querySelectorAll('[data-instrumento]')].map((el) => [el.dataset.instrumento, el]));
  const ordenEl = raiz.querySelector('[data-orden-acople]');
  const mandos = [...raiz.querySelectorAll('[data-mandos]')];
  const editorEl = raiz.querySelector('[data-editor-nombre]');
  const casillasEl = raiz.querySelector('[data-nombre-casillas]');
  const lecturaNombreEl = raiz.querySelector('[data-nombre-lectura]');
  const accionesResultado = raiz.querySelector('[data-resultado-acciones]');
  const rankings = Object.fromEntries([...raiz.querySelectorAll('[data-ranking]')].map((el) => [el.dataset.ranking, el]));
  const cuentaEl = raiz.querySelector('[data-cuenta]');
  let ultimaIndicacion = null;
  let ultimoEstado = null;

  function mostrar(nombre) {
    pantallas.forEach((el) => {
      const p = el.dataset.pantalla;
      el.hidden = !(p === nombre || (p === 'hud' && nombre === 'pausa'));
    });
    if (nombre !== 'hud') ordenEl.hidden = true;
    // Los mandos tactiles acompanan solo a la partida en curso.
    mandos.forEach((el) => {
      el.hidden = nombre !== 'hud';
    });
    // El control de pantalla completa solo acompana a la partida y al resultado.
    if (botonPantalla) botonPantalla.hidden = !pantallaCompleta || !['hud', 'resultado'].includes(nombre);
    // El foco va al titulo recien cuando la seccion es visible (un elemento hidden no acepta foco).
    if (nombre === 'resultado') titulo.focus();
  }

  function fijar(nombre, variables, ok) {
    const el = tablero[nombre];
    if (!el) return;
    Object.entries(variables).forEach(([k, v]) => el.style.setProperty(`--${k}`, v.toFixed(4)));
    el.dataset.ok = String(ok);
  }

  // Instrumentos de la consola: agujas y barras por variables CSS, LED por tolerancia.
  function pintarInstrumentos(i) {
    fijar('giro', { valor: i.giro, zona: i.giroZona }, i.giroOk);
    fijar('alineacion', { valor: i.alineacion, zona: i.alineacionZona }, i.alineacionOk);
    fijar('velocidad', { valor: i.velocidad, tol: i.velocidadTol, peligro: i.velocidadPeligro }, i.velocidadOk);
    fijar('distancia', { valor: i.distancia, rango: i.distanciaRango }, i.enRango);
    fijar('combustible', { valor: i.combustible }, i.combustible > 0.2);
  }

  function pintarHud(lecturas, estado, nivel, indicacion = '', inst = null) {
    if (inst) pintarInstrumentos(inst);
    Object.entries(lecturas).forEach(([k, v]) => {
      if (hud[k] && hud[k].textContent !== v) hud[k].textContent = v;
    });
    if (estado !== ultimoEstado) {
      ultimoEstado = estado;
      estadoTexto.textContent = estado;
      estadoEl.dataset.nivel = nivel;
      const consolaEl = raiz.querySelector('.acople-consola');
      if (consolaEl) consolaEl.dataset.nivel = nivel;
    }
    if (indicacion !== ultimaIndicacion) {
      ultimaIndicacion = indicacion;
      indicacionEl.textContent = indicacion;
      ordenEl.textContent = indicacion;
      ordenEl.dataset.nivel = nivel;
      ordenEl.hidden = indicacion === '';
    }
  }

  function pintarResultado(desenlace, posicion = -1) {
    const ok = desenlace.exito;
    resultado.classList.toggle('acople-resultado--fallida', !ok);
    titulo.textContent = ok ? 'Acople completo' : 'Misión fallida';
    causa.hidden = ok;
    causa.textContent = ok ? '' : CAUSAS[desenlace.causa] ?? '';
    datos.tiempo.textContent = `${desenlace.tiempoTotal.toFixed(1)} s`;
    datos.combustible.textContent = pct(desenlace.combustibleRestante);
    datos.velocidad.textContent = `${Math.max(0, desenlace.velocidadFinal).toFixed(1)} u/s`;
    soloExito.forEach((el) => {
      el.hidden = !ok;
    });
    if (ok) {
      datos.precision.textContent = pct(desenlace.precision);
      datos.puntaje.textContent = formatoPuntaje(desenlace.puntaje);
    }
    recordEl.textContent = textoPuesto(posicion);
    recordEl.hidden = recordEl.textContent === '';
  }

  // Tabla de puntajes: el bloque entero se oculta si no hay ninguna fila con datos.
  function pintarRanking(cual, filas) {
    const lista = rankings[cual];
    if (!lista) return;
    lista.replaceChildren(
      ...filas.map((f) => {
        const li = document.createElement('li');
        li.className = 'acople-ranking-fila';
        if (f.resaltada) li.classList.add('acople-ranking-fila--resaltada');
        if (f.vacia) li.classList.add('acople-ranking-fila--vacia');
        [f.puesto, f.nombre || '········', f.puntaje || '—'].forEach((texto, i) => {
          const span = document.createElement('span');
          span.className = ['acople-ranking-puesto', 'acople-ranking-nombre', 'acople-ranking-puntaje'][i];
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
        // Boton para poder tocar la casilla y moverle el cursor (010 FR-021).
        const casilla = document.createElement('button');
        casilla.type = 'button';
        casilla.tabIndex = -1;
        casilla.dataset.casilla = String(i);
        casilla.className = 'acople-nombre-casilla';
        if (i === editor.cursor) casilla.classList.add('acople-nombre-casilla--activa');
        casilla.textContent = letra === ' ' ? '_' : letra;
        return casilla;
      }),
    );
    lecturaNombreEl.textContent = `Nombre: ${editor.letras.join('').trim() || 'vacío'}`;
  }

  function enfocarResultado() {
    titulo.focus();
  }

  function pintarPantalla(activa) {
    if (!botonPantalla) return;
    // Se muestra la tecla real: Esc la reserva el navegador para salir de pantalla completa. En tactil no hay Esc.
    if (activa && tactil) {
      botonPantalla.textContent = 'Salir';
    } else if (activa) {
      const tecla = document.createElement('kbd');
      tecla.textContent = 'Esc';
      botonPantalla.replaceChildren(tecla, ' Salir');
    } else {
      botonPantalla.textContent = 'Pantalla completa';
    }
    const salir = tactil ? 'Salir de pantalla completa' : 'Salir de pantalla completa (Esc)';
    botonPantalla.setAttribute('aria-label', activa ? salir : 'Jugar en pantalla completa');
  }

  // Cuenta regresiva previa al arranque; null la oculta.
  function pintarCuenta(n) {
    if (!cuentaEl) return;
    cuentaEl.hidden = n === null;
    cuentaEl.textContent = n === null ? '' : String(n);
  }

  return {
    mostrar,
    pintarHud,
    pintarResultado,
    pintarRanking,
    mostrarEditor,
    pintarEditor,
    enfocarResultado,
    pintarPantalla,
    pintarCuenta,
  };
}
