// Sonido de Miller sintetizado con Web Audio, sin archivos (FR-029). Nace en el primer gesto (autoplay).

const CLAVE_MUTE = 'interstellar:minijuegos:mute'; // compartida con el acople: silenciar es una preferencia del sitio
const SUAVE = 0.08;
const RUMOR_OLA = { lejos: 0.05, cerca: 0.16, inminente: 0.3 };
const PASO_S = 0.3;

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
  for (let i = 0; i < datos.length; i++) datos[i] = Math.random() * 2 - 1;
  return buffer;
}

// perfil: CONFIG.audio[modo]; en tactil el parlante del celular no da graves y se abren los filtros.
export function crearAudioMiller(perfil) {
  let ctx = null;
  let maestro = null;
  let ruido = null;
  let rumor = null;
  let filtroOla = null;
  let motor = null;
  let osciladorMotor = null;
  let proximoPulso = 0;
  let proximoPaso = 0;
  let nivelPrevio = 'lejos';
  let muteado = leerMute();

  function fuenteRuido(destino, { tipo = 'lowpass', frecuencia = 800, q = 0.7, loop = true } = {}) {
    const fuente = ctx.createBufferSource();
    fuente.buffer = ruido;
    fuente.loop = loop;
    const filtro = ctx.createBiquadFilter();
    filtro.type = tipo;
    filtro.frequency.value = frecuencia;
    filtro.Q.value = q;
    fuente.connect(filtro).connect(destino);
    return { fuente, filtro };
  }

  function montarGrafo() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    ctx = new Ctx();
    ruido = bufferRuido(ctx, 2);
    maestro = ctx.createGain();
    maestro.gain.value = muteado ? 0 : perfil.volumen;
    if (perfil.compresor) {
      const compresor = ctx.createDynamicsCompressor();
      compresor.threshold.value = -18;
      compresor.ratio.value = 4;
      maestro.connect(compresor).connect(ctx.destination);
    } else {
      maestro.connect(ctx.destination);
    }

    // Ambiente: agua y viento, ruido filtrado constante y bajito.
    const ambiente = ctx.createGain();
    ambiente.gain.value = 0.05;
    ambiente.connect(maestro);
    fuenteRuido(ambiente, { tipo: 'bandpass', frecuencia: perfil.ambienteFiltro, q: 0.4 }).fuente.start();

    // Rumor de la ola: grave que crece y se abre con la cercania.
    rumor = ctx.createGain();
    rumor.gain.value = 0;
    rumor.connect(maestro);
    const ola = fuenteRuido(rumor, { frecuencia: perfil.olaFiltro[0], q: 1.2 });
    filtroOla = ola.filtro;
    ola.fuente.start();
    const grave = ctx.createOscillator();
    grave.frequency.value = 42;
    grave.connect(rumor);
    grave.start();

    // Motor del Ranger: sube con la carga del despegue.
    motor = ctx.createGain();
    motor.gain.value = 0;
    const filtroMotor = ctx.createBiquadFilter();
    filtroMotor.type = 'lowpass';
    filtroMotor.frequency.value = 900;
    osciladorMotor = ctx.createOscillator();
    osciladorMotor.type = 'sawtooth';
    osciladorMotor.frequency.value = 50;
    osciladorMotor.connect(filtroMotor).connect(motor).connect(maestro);
    osciladorMotor.start();
  }

  function reanudar() {
    if (!ctx) montarGrafo();
    if (ctx?.state === 'suspended') ctx.resume();
  }

  function tono(frecuencia, t, duracion, { tipo = 'sine', ganancia = 0.12, hasta = null } = {}) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = tipo;
    osc.frequency.setValueAtTime(frecuencia, t);
    if (hasta) osc.frequency.exponentialRampToValueAtTime(hasta, t + duracion);
    g.gain.setValueAtTime(ganancia, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
    osc.connect(g).connect(maestro);
    osc.start(t);
    osc.stop(t + duracion + 0.02);
  }

  function rafaga(t, duracion, { frecuencia = 1200, tipo = 'bandpass', ganancia = 0.2, hasta = null } = {}) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(ganancia, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
    g.connect(maestro);
    const { fuente, filtro } = fuenteRuido(g, { tipo, frecuencia, loop: false });
    if (hasta) filtro.frequency.exponentialRampToValueAtTime(hasta, t + duracion);
    fuente.start(t, Math.random());
    fuente.stop(t + duracion + 0.02);
  }

  // estado: { enJuego, revelada, nivel, pulsoHz (o 0), moviendose, carga }
  function actualizar(estado) {
    if (!ctx) return;
    const t = ctx.currentTime;
    const objetivoRumor = estado.revelada && estado.enJuego ? RUMOR_OLA[estado.nivel] : 0;
    rumor.gain.setTargetAtTime(objetivoRumor, t, SUAVE * 4);
    const apertura = { lejos: 0, cerca: 0.5, inminente: 1 }[estado.nivel] ?? 0;
    filtroOla.frequency.setTargetAtTime(perfil.olaFiltro[0] + (perfil.olaFiltro[1] - perfil.olaFiltro[0]) * apertura, t, SUAVE * 4);
    motor.gain.setTargetAtTime(estado.carga * 0.1, t, SUAVE);
    osciladorMotor.frequency.setTargetAtTime(50 + estado.carga * 90, t, SUAVE);

    if (estado.enJuego && estado.pulsoHz > 0 && t >= proximoPulso) {
      tono(880, t, 0.06, { ganancia: 0.05 });
      tono(1320, t + 0.07, 0.06, { ganancia: 0.04 });
      proximoPulso = t + 1 / estado.pulsoHz;
    }
    if (estado.enJuego && estado.moviendose && t >= proximoPaso) {
      rafaga(t, 0.07, { frecuencia: 1100 * (0.9 + Math.random() * 0.2), ganancia: 0.12 });
      proximoPaso = t + PASO_S;
    }
    if (estado.enJuego && estado.nivel === 'inminente' && nivelPrevio !== 'inminente') evento('alarma');
    nivelPrevio = estado.nivel;
  }

  function evento(nombre) {
    if (!ctx) return;
    const t = ctx.currentTime;
    if (nombre === 'baliza') [660, 880, 1320].forEach((f, i) => tono(f, t + i * 0.08, 0.18, { tipo: 'triangle', ganancia: 0.1 }));
    if (nombre === 'banner') {
      tono(80, t, 0.5, { ganancia: 0.3, hasta: 50 });
      rafaga(t, 0.4, { frecuencia: 3000, tipo: 'highpass', ganancia: 0.06, hasta: 600 });
    }
    if (nombre === 'choque') {
      rafaga(t, 0.18, { frecuencia: 500, tipo: 'lowpass', ganancia: 0.4 });
      tono(60, t, 0.2, { ganancia: 0.3 });
    }
    if (nombre === 'impulso') tono(300, t, 0.3, { tipo: 'square', ganancia: 0.05, hasta: 900 });
    if (nombre === 'alarma') [880, 660, 880, 660].forEach((f, i) => tono(f, t + i * 0.12, 0.1, { tipo: 'square', ganancia: 0.05 }));
    if (nombre === 'despegue') {
      rafaga(t, 2.2, { frecuencia: 200, tipo: 'lowpass', ganancia: 0.35, hasta: 2400 });
      tono(60, t, 2, { tipo: 'sawtooth', ganancia: 0.12, hasta: 220 });
    }
    if (nombre === 'fracaso') {
      rafaga(t, 1.6, { frecuencia: 900, tipo: 'lowpass', ganancia: 0.5, hasta: 120 });
      tono(45, t, 1.4, { ganancia: 0.4, hasta: 30 });
    }
    if (nombre === 'tick') tono(1500, t, 0.025, { tipo: 'square', ganancia: 0.035 });
    if (nombre === 'tickFinal') [440, 554, 659].forEach((f) => tono(f, t, 0.45, { tipo: 'triangle', ganancia: 0.06 }));
  }

  function setMute(on) {
    muteado = on;
    guardarMute(on);
    if (ctx) maestro.gain.setTargetAtTime(on ? 0 : perfil.volumen, ctx.currentTime, SUAVE);
  }

  function cerrar() {
    ctx?.close();
    ctx = null;
  }

  return { reanudar, actualizar, evento, setMute, estaMuteado: () => muteado, cerrar };
}
