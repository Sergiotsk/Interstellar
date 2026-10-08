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

    // Canal de música: órgano de tubos procedural tipo Zimmer (FR-037 / research R6)
    canalMusica = ctx.createGain();
    canalMusica.gain.value = 0;
    filtroMusica = ctx.createBiquadFilter();
    filtroMusica.type = 'lowpass';
    filtroMusica.frequency.value = 450;
    filtroMusica.Q.value = 2.2;
    canalMusica.connect(filtroMusica).connect(maestro);
  }

  let canalMusica = null;
  let filtroMusica = null;
  let proximoPasoMusica = 0;
  let pasoMusica = 0;
  const DUR_CORCHEA = 0.226; // ~133 BPM (tempo de No Time for Caution)

  // Ostinato en Re menor (Dm -> Bb -> C -> A)
  const SECUENCIA_ORGANO = [
    // Compás 1: Dm
    293.66, 349.23, 440.00, 587.33, 440.00, 349.23, 293.66, 349.23,
    // Compás 2: Bb
    293.66, 349.23, 466.16, 587.33, 466.16, 349.23, 293.66, 349.23,
    // Compás 3: C
    329.63, 392.00, 523.25, 659.25, 523.25, 392.00, 329.63, 392.00,
    // Compás 4: A
    329.63, 440.00, 554.37, 659.25, 554.37, 440.00, 329.63, 440.00,
  ];

  const PEDALES_ORGANO = {
    0: 73.42,  // D2
    8: 58.27,  // Bb1
    16: 65.41, // C2
    24: 55.00, // A1
  };

  // Síntesis aditiva de órgano de tubos (registros 16', 8', 4' y 2')
  function tocarNotaOrgano(f0, t, dur, ganancia = 0.045, pedal = false) {
    if (!ctx || !canalMusica) return;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.linearRampToValueAtTime(ganancia, t + 0.02);
    env.gain.setValueAtTime(ganancia, t + dur * 0.75);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.06);
    env.connect(canalMusica);

    const parciales = pedal
      ? [
          { mult: 0.5, tipo: 'triangle', g: 0.8 },
          { mult: 1, tipo: 'sine', g: 0.5 },
        ]
      : [
          { mult: 1, tipo: 'sine', g: 0.6 },
          { mult: 2, tipo: 'sine', g: 0.35 },
          { mult: 3, tipo: 'sine', g: 0.15 },
          { mult: 4, tipo: 'triangle', g: 0.08 },
        ];

    parciales.forEach(({ mult, tipo, g }) => {
      const osc = ctx.createOscillator();
      osc.type = tipo;
      osc.frequency.setValueAtTime(f0 * mult, t);
      const subG = ctx.createGain();
      subG.gain.value = g;
      osc.connect(subG).connect(env);
      osc.start(t);
      osc.stop(t + dur + 0.08);
    });
  }

  function reanudar() {
    if (!ctx) montarGrafo();
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
  }

  let proximoTic = 0;

  // Pulso percusivo analógico tipo reloj de cabina (tensión en aproximación).
  function sonarTic(t, agudo = false) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(agudo ? 480 : 320, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.035);
    g.gain.setValueAtTime(0.055, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
    osc.connect(g).connect(maestro);
    osc.start(t);
    osc.stop(t + 0.04);
  }

  function actualizar(estado, acciones, enCurso, distancia = 999) {
    if (!ctx) return;
    const t = ctx.currentTime;
    const motor = enCurso && (acciones.has('impulso') || acciones.has('freno')) ? 0.22 : 0;
    const rcs = enCurso && (acciones.has('rotarIzquierda') || acciones.has('rotarDerecha')) ? 0.07 : 0;
    propulsor.gain.setTargetAtTime(motor + rcs, t, SUAVE);
    // Pitido intermitente (0.2 s on / 0.2 s off) mientras el acercamiento es peligroso.
    const sonar = enCurso && estado === 'UNSAFE APPROACH' && t % 0.4 < 0.2;
    alarma.gain.setTargetAtTime(sonar ? 0.04 : 0, t, 0.01);

    // Pulso rítmico tipo reloj de cabina al entrar en zona cercana (< 150 u)
    if (enCurso && distancia < 155) {
      if (t >= proximoTic) {
        const rapido = distancia < 65;
        sonarTic(t, rapido);
        proximoTic = t + (rapido ? 0.5 : 1.0);
      }
    } else {
      proximoTic = t + 0.2;
    }

    // Musicalización procedural: órgano de tubos de tensión
    if (canalMusica && filtroMusica) {
      if (enCurso) {
        // Apertura gradual de filtro y ganancia según distancia
        const cercania = Math.max(0, Math.min(1, (180 - distancia) / 150));
        const freqFiltro = 450 + cercania * 2200; // 450 Hz -> 2650 Hz
        const volMusica = 0.14 + cercania * 0.14;
        filtroMusica.frequency.setTargetAtTime(freqFiltro, t, 0.2);
        canalMusica.gain.setTargetAtTime(volMusica, t, 0.2);

        if (t >= proximoPasoMusica) {
          if (proximoPasoMusica === 0) proximoPasoMusica = t;
          const indice = pasoMusica % SECUENCIA_ORGANO.length;
          const notaHz = SECUENCIA_ORGANO[indice];
          tocarNotaOrgano(notaHz, proximoPasoMusica, DUR_CORCHEA * 0.92, 0.048, false);

          const pedalHz = PEDALES_ORGANO[indice];
          if (pedalHz) {
            tocarNotaOrgano(pedalHz, proximoPasoMusica, DUR_CORCHEA * 7.2, 0.065, true);
          }

          pasoMusica += 1;
          proximoPasoMusica += DUR_CORCHEA;
        }
      } else {
        canalMusica.gain.setTargetAtTime(0, t, 0.25);
        proximoPasoMusica = 0;
        pasoMusica = 0;
      }
    }
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
