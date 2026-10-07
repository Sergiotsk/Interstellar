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

export function crearOverlays(raiz) {
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
  let ultimoEstado = null;

  function mostrar(nombre) {
    pantallas.forEach((el) => {
      const p = el.dataset.pantalla;
      el.hidden = !(p === nombre || (p === 'hud' && nombre === 'pausa'));
    });
    // El foco va al titulo recien cuando la seccion es visible (un elemento hidden no acepta foco).
    if (nombre === 'resultado') titulo.focus();
  }

  function pintarHud(lecturas, estado, nivel) {
    Object.entries(lecturas).forEach(([k, v]) => {
      if (hud[k] && hud[k].textContent !== v) hud[k].textContent = v;
    });
    if (estado !== ultimoEstado) {
      ultimoEstado = estado;
      estadoTexto.textContent = estado;
      estadoEl.dataset.nivel = nivel;
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

  return { mostrar, pintarHud, pintarResultado };
}
