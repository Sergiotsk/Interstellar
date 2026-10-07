// Sonido del simulador sintetizado con Web Audio, sin archivos (research R6). Placeholders hasta el sonido final.
// El AudioContext nace en el primer gesto del jugador: asi no choca con el bloqueo de autoplay.

const CLAVE_MUTE = 'interstellar:minijuegos:mute';
const VOLUMEN = 0.6;
const SUAVE = 0.05; // constante de tiempo de los cambios de ganancia (s)

function leerMute() {
  try {
    return sessionStorage.getItem(CLAVE_MUTE) === 'on';
  } catch {
    return false;
  }
}

function guardarMute(on) {
  try {
    sessionStorage.setItem(CLAVE_MUTE, on ? 'on' : 'off');
  } catch {
    /* sin sessionStorage el mute dura solo esta visita */
  }
}

function bufferRuido(ctx, segundos) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * segundos, ctx.sampleRate);
  const datos = buffer.getChannelData(0);
  for (let i = 0; i < datos.length; i += 1) datos[i] = Math.random() * 2 - 1;
  return buffer;
}

export function crearAudioAcople() {
  let ctx = null;
  let maestro = null;
  let propulsor = null;
  let alarma = null;
  let ruido = null;
  let muteado = leerMute();

  function montarGrafo() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    ctx = new Ctx();
    maestro = ctx.createGain();
    maestro.gain.value = muteado ? 0 : VOLUMEN;
    maestro.connect(ctx.destination);

    const ambiente = ctx.createGain();
    ambiente.gain.value = 0.05;
    ambiente.connect(maestro);
    [55, 82.5].forEach((hz) => {
      const osc = ctx.createOscillator();
      osc.frequency.value = hz;
      osc.connect(ambiente);
      osc.start();
    });

    ruido = bufferRuido(ctx, 2);
    const fuente = ctx.createBufferSource();
    fuente.buffer = ruido;
    fuente.loop = true;
    const filtro = ctx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.value = 900;
    propulsor = ctx.createGain();
    propulsor.gain.value = 0;
    fuente.connect(filtro).connect(propulsor).connect(maestro);
    fuente.start();

    const pitido = ctx.createOscillator();
    pitido.type = 'square';
    pitido.frequency.value = 880;
    alarma = ctx.createGain();
    alarma.gain.value = 0;
    pitido.connect(alarma).connect(maestro);
    pitido.start();
  }

  function reanudar() {
    if (!ctx) montarGrafo();
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
  }

  function actualizar(estado, acciones, enCurso) {
    if (!ctx) return;
    const t = ctx.currentTime;
    const motor = enCurso && (acciones.has('impulso') || acciones.has('freno')) ? 0.22 : 0;
    const rcs = enCurso && (acciones.has('rotarIzquierda') || acciones.has('rotarDerecha')) ? 0.07 : 0;
    propulsor.gain.setTargetAtTime(motor + rcs, t, SUAVE);
    // Pitido intermitente (0.2 s on / 0.2 s off) mientras el acercamiento es peligroso.
    const sonar = enCurso && estado === 'UNSAFE APPROACH' && t % 0.4 < 0.2;
    alarma.gain.setTargetAtTime(sonar ? 0.04 : 0, t, 0.01);
  }

  function golpe() {
    const fuente = ctx.createBufferSource();
    fuente.buffer = ruido;
    const g = ctx.createGain();
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0.7, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    fuente.connect(g).connect(maestro);
    fuente.start(t);
    fuente.stop(t + 0.7);
  }

  function acorde() {
    const t = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((hz, i) => {
      const osc = ctx.createOscillator();
      osc.frequency.value = hz;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.12, t + 0.05 + i * 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
      osc.connect(g).connect(maestro);
      osc.start(t);
      osc.stop(t + 1.5);
    });
  }

  // Zumbido grave y corto: "acople rechazado".
  function zumbido() {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.linearRampToValueAtTime(90, t + 0.35);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.08, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(g).connect(maestro);
    osc.start(t);
    osc.stop(t + 0.45);
  }

  // Doble tono armonico suave: alineado en rango de acople (lock-in).
  function tonoLockIn() {
    const t = ctx.currentTime;
    [587.33, 880].forEach((hz, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(hz, t + i * 0.07);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t + i * 0.07);
      g.gain.linearRampToValueAtTime(0.08, t + i * 0.07 + 0.015);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.1);
      osc.connect(g).connect(maestro);
      osc.start(t + i * 0.07);
      osc.stop(t + i * 0.07 + 0.12);
    });
  }

  function evento(nombre) {
    if (!ctx) return;
    if (nombre === 'impacto') golpe();
    if (nombre === 'acople') acorde();
    if (nombre === 'rechazo') zumbido();
    if (nombre === 'lock-in') tonoLockIn();
  }

  function setMute(on) {
    muteado = on;
    guardarMute(on);
    if (maestro) maestro.gain.setTargetAtTime(on ? 0 : VOLUMEN, ctx.currentTime, SUAVE);
  }

  function cerrar() {
    if (ctx) ctx.close().catch(() => {});
    ctx = null;
  }

  return { reanudar, actualizar, evento, setMute, estaMuteado: () => muteado, cerrar };
}
