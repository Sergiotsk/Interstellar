// Capa DOM del simulador: pantallas, HUD y resultado sobre el lienzo (research R3). Solo lee la partida.
import { deltaOmega, deltaTheta } from './logica/docking.js';

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

export function crearOverlays(raiz, { pantallaCompleta = false } = {}) {
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
  let ultimaIndicacion = null;
  let ultimoEstado = null;

  function mostrar(nombre) {
    pantallas.forEach((el) => {
      const p = el.dataset.pantalla;
      el.hidden = !(p === nombre || (p === 'hud' && nombre === 'pausa'));
    });
    if (nombre !== 'hud') ordenEl.hidden = true;
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
    }
    if (indicacion !== ultimaIndicacion) {
      ultimaIndicacion = indicacion;
      indicacionEl.textContent = indicacion;
      ordenEl.textContent = indicacion;
      ordenEl.dataset.nivel = nivel;
      ordenEl.hidden = indicacion === '';
    }
  }

  function pintarResultado(desenlace, infoRecord = null) {
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
    pintarRecord(ok, infoRecord);
  }

  function pintarRecord(ok, info) {
    if (!ok || !info || !info.record) {
      recordEl.hidden = true;
      return;
    }
    recordEl.hidden = false;
    recordEl.textContent = info.guardado ? '★ Nuevo récord' : `Récord vigente: ${formatoPuntaje(info.record.puntaje)}`;
  }

  // Si el motor no carga, el aviso pasa a explicar la falla en vez de pedir desktop.
  function mostrarFalla() {
    raiz.querySelector('#aviso-titulo').textContent = 'Simulador fuera de línea';
    raiz.querySelector('[data-aviso-texto]').textContent = 'No se pudo cargar el simulador. Probá recargar la página.';
  }

  function pintarPantalla(activa) {
    if (!botonPantalla) return;
    botonPantalla.textContent = activa ? 'Salir ✕' : 'Pantalla completa';
    botonPantalla.setAttribute('aria-label', activa ? 'Salir de pantalla completa' : 'Jugar en pantalla completa');
  }

  return { mostrar, pintarHud, pintarResultado, mostrarFalla, pintarPantalla };
}
