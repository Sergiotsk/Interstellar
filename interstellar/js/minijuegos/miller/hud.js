// HUD flotante y pantallas sobre el HTML de minijuego-miller.html. Solo lee sim.
// Reemplaza las tres franjas del original (barra superior, sub-barra y "tactical radar" de texto)
// por paneles en las esquinas y un radar de verdad.
import { textoAnosHud, puntajeEnVivo } from './logica/puntaje.js';
import { contactosRadar } from './logica/radar.js';

const ORBITA = 'MISSION_2_ORBITAL_ASCENT';
const CANONES = { 1: 'LV1 DUAL', 2: 'LV2 TRIPLE', 3: 'LV3 QUAD MAX' };
const SEGMENTOS = 10;
const AYUDA_SEGUNDOS = 7;
const AYUDA = {
  superficie: 'WASD / Arrows: Move · SPACE: Jump · SHIFT: Slide · J / CLICK: Shoot · E: Board the Ranger',
  orbita: 'WASD / Arrows: Move · SPACE / CLICK: Fire · Q: Missiles · B: EMP Bomb',
};

// Lo que muestra cada lectura (pura, para poder probarla sin DOM).
export function lecturasHud(sim, estado, config, puntajeFinal = null) {
  const orbita = sim.stage === ORBITA;
  const jefe = sim.enemies.find((e) => e.type === 'dreadnought_boss');
  const score = estado === 'PLAYING' || puntajeFinal === null ? puntajeEnVivo(sim) : puntajeFinal;
  const traje = Math.round(sim.playerShieldHp);
  return {
    orbita,
    score: String(score).padStart(6, '0'),
    combo: Math.min(4, 1 + Math.floor(sim.combo / 5)),
    tierra: textoAnosHud(sim.elapsedSeconds, config),
    objetivo: orbita ? sim.sectorName : sim.beaconAcquired ? 'BEACON SECURED // BOARD THE RANGER [E]' : 'RETRIEVE MILLER BEACON',
    balizaAsegurada: sim.beaconAcquired,
    altitud: `▲ ${Math.round(sim.altitude)}m / 10,000m`,
    progreso: Math.round((Math.min(sim.targetAltitude, sim.altitude) / sim.targetAltitude) * 100),
    escudo: Math.round(sim.shipShield),
    casco: Math.round(sim.shipHealth),
    canon: CANONES[sim.weaponPowerLevel],
    misiles: sim.missileStock,
    bombas: sim.bombStock,
    traje,
    segmentosTraje: Math.ceil((traje / 100) * SEGMENTOS),
    trajeAlerta: traje <= 35,
    jefe: jefe ? Math.round((jefe.hp / jefe.maxHp) * 100) : null,
    abordar: sim.controlMode === 'FOOT' && sim.shipBoardPrompt,
    cuenta: sim.phase === 'COUNTDOWN' ? Math.ceil(sim.countdownTimer) : null,
    ayuda: orbita ? AYUDA.orbita : AYUDA.superficie,
  };
}

// --- Radar ---

const COLORES_RADAR = {
  baliza: '#e8803b',
  ranger: '#efe7d6',
  case: '#c2b8a3',
  enemigo: '#ff3b30',
  sumergido: 'rgba(255, 59, 48, 0.45)',
  jefe: '#ff3b30',
  endurance: '#7ee7f8',
};

function marcaDeBorde(ctx, c, color) {
  const a = Math.atan2(c.y, c.x);
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(a);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(4, 0);
  ctx.lineTo(-5, -5);
  ctx.lineTo(-5, 5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function dibujarContacto(ctx, c, tiempo) {
  const color = COLORES_RADAR[c.tipo];
  if (c.fuera) {
    marcaDeBorde(ctx, c, color);
    return;
  }
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  if (c.tipo === 'baliza') {
    const s = 5 + Math.sin(tiempo * 6) * 1.5;
    ctx.beginPath();
    ctx.moveTo(c.x, c.y - s);
    ctx.lineTo(c.x + s, c.y);
    ctx.lineTo(c.x, c.y + s);
    ctx.lineTo(c.x - s, c.y);
    ctx.closePath();
    ctx.fill();
  } else if (c.tipo === 'ranger') {
    ctx.beginPath();
    ctx.moveTo(c.x, c.y - 6);
    ctx.lineTo(c.x + 5, c.y + 4);
    ctx.lineTo(c.x - 5, c.y + 4);
    ctx.closePath();
    ctx.fill();
  } else if (c.tipo === 'sumergido') {
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 3, 0, Math.PI * 2);
    ctx.stroke();
  } else if (c.tipo === 'endurance') {
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 7, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    const r = c.tipo === 'jefe' ? 6 : c.tipo === 'case' ? 2 : 2.6;
    ctx.beginPath();
    ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function dibujarRadar(ctx, sim, config, tiempo) {
  const { radio } = config.radar;
  const lado = ctx.canvas.width;
  const { contactos, ola } = contactosRadar(sim, config);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, lado, lado);
  ctx.translate(lado / 2, lado / 2);

  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, radio + 4, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = 'rgba(7, 21, 23, 0.82)';
  ctx.fill();

  // Barrido: un abanico que gira, como los radares de la cabina del sitio.
  const barrido = (tiempo * 1.6) % (Math.PI * 2);
  const abanico = ctx.createLinearGradient(0, 0, Math.cos(barrido) * radio, Math.sin(barrido) * radio);
  abanico.addColorStop(0, 'rgba(79, 208, 224, 0.0)');
  abanico.addColorStop(1, 'rgba(79, 208, 224, 0.28)');
  ctx.fillStyle = abanico;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, radio + 4, barrido - 0.5, barrido);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(79, 208, 224, 0.22)';
  ctx.lineWidth = 1;
  [radio / 3, (radio * 2) / 3, radio].forEach((r) => {
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.beginPath();
  ctx.moveTo(-radio, 0);
  ctx.lineTo(radio, 0);
  ctx.moveTo(0, -radio);
  ctx.lineTo(0, radio);
  ctx.stroke();

  // El frente de la ola: lo de mas alla de la linea se tine, para leer de un vistazo cuanto margen queda.
  if (ola) {
    const nx = ola.y2 - ola.y1;
    const ny = ola.x1 - ola.x2;
    const largo = Math.hypot(nx, ny) || 1;
    const fx = (nx / largo) * radio * 3;
    const fy = (ny / largo) * radio * 3;
    ctx.fillStyle = 'rgba(158, 194, 207, 0.18)';
    ctx.beginPath();
    ctx.moveTo(ola.x1, ola.y1);
    ctx.lineTo(ola.x2, ola.y2);
    ctx.lineTo(ola.x2 - fx, ola.y2 - fy);
    ctx.lineTo(ola.x1 - fx, ola.y1 - fy);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#9ec2cf';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(ola.x1, ola.y1);
    ctx.lineTo(ola.x2, ola.y2);
    ctx.stroke();
  }
  ctx.restore();

  ctx.strokeStyle = 'rgba(79, 208, 224, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, radio + 4, 0, Math.PI * 2);
  ctx.stroke();

  contactos.forEach((c) => dibujarContacto(ctx, c, tiempo));

  // Vos, en el centro.
  ctx.fillStyle = '#4fd0e0';
  ctx.beginPath();
  ctx.moveTo(0, -5);
  ctx.lineTo(4, 4);
  ctx.lineTo(0, 2);
  ctx.lineTo(-4, 4);
  ctx.closePath();
  ctx.fill();
}

// --- DOM ---

export function crearHud(raiz) {
  const $ = (sel) => raiz.querySelector(sel);
  const hud = Object.fromEntries([...raiz.querySelectorAll('[data-hud]')].map((el) => [el.dataset.hud, el]));
  const pantallas = [...raiz.querySelectorAll('[data-pantalla]')];
  const capa = $('[data-hud-capa]');
  const visor = $('.mw-visor');
  const segmentosTraje = [...raiz.querySelectorAll('[data-segmentos="traje"] i')];
  const radar = $('[data-radar]').getContext('2d');
  const banner = $('[data-banner]');
  const bannerTexto = $('[data-banner-texto]');
  const bannerSub = $('[data-banner-sub]');
  const tactil = $('[data-tactil]');
  let temporizadores = [];
  let ultimo = {};

  const texto = (clave, valor) => {
    if (ultimo[clave] === valor || !hud[clave]) return;
    ultimo[clave] = valor;
    hud[clave].textContent = valor;
  };
  const ancho = (clave, pct) => {
    if (ultimo[`ancho-${clave}`] === pct || !hud[clave]) return;
    ultimo[`ancho-${clave}`] = pct;
    hud[clave].style.width = `${Math.max(0, pct)}%`;
  };
  const programar = (fn, ms) => temporizadores.push(setTimeout(fn, ms));

  // El HUD se alinea al canvas (que puede tener franjas a los costados), no al visor.
  function alinearAlCanvas() {
    const canvas = visor.querySelector('canvas');
    if (!canvas) return;
    const c = canvas.getBoundingClientRect();
    const v = visor.getBoundingClientRect();
    const caja = `${Math.round(c.left - v.left)},${Math.round(c.top - v.top)},${Math.round(c.width)},${Math.round(c.height)}`;
    if (ultimo.caja === caja) return;
    ultimo.caja = caja;
    const [x, y, w, h] = caja.split(',');
    Object.assign(capa.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` });
  }

  function pintar(sim, estado, config, { menu, tactil: esTactil, puntajeFinal }) {
    const l = lecturasHud(sim, estado, config, puntajeFinal);
    const jugando = estado === 'PLAYING';
    raiz.dataset.estado = estado;
    capa.hidden = !jugando;
    alinearAlCanvas();

    texto('score', l.score);
    hud.combo.hidden = l.combo <= 1;
    texto('combo', `x${l.combo}`);
    texto('tierra', l.tierra);
    texto('objetivo', l.objetivo);
    capa.toggleAttribute('data-baliza-asegurada', l.balizaAsegurada && !l.orbita);
    $('[data-hud-ascenso]').hidden = !l.orbita;
    texto('altitud', l.altitud);
    ancho('progreso', l.progreso);

    $('[data-vitales="superficie"]').hidden = l.orbita;
    $('[data-vitales="orbita"]').hidden = !l.orbita;
    if (ultimo.segmentos !== l.segmentosTraje) {
      ultimo.segmentos = l.segmentosTraje;
      segmentosTraje.forEach((s, i) => s.toggleAttribute('data-lleno', i < l.segmentosTraje));
    }
    texto('traje-pct', `${l.traje}%`);
    capa.toggleAttribute('data-traje-alerta', l.trajeAlerta && !l.orbita);
    ancho('escudo', l.escudo);
    ancho('casco', l.casco);
    texto('canon', l.canon);
    texto('misiles', String(l.misiles));
    texto('bombas', String(l.bombas));
    texto('bombas-tactil', String(l.bombas));

    // Ayuda de controles: los primeros segundos de cada fase.
    if (l.orbita && ultimo.inicioOrbita === undefined) ultimo.inicioOrbita = sim.elapsedSeconds;
    const desde = l.orbita ? sim.elapsedSeconds - ultimo.inicioOrbita : sim.elapsedSeconds;
    hud.ayuda.hidden = !(jugando && !esTactil && desde < AYUDA_SEGUNDOS);
    texto('ayuda', l.ayuda);

    if (jugando) dibujarRadar(radar, sim, config, sim.animTick);

    $('[data-jefe]').hidden = !(jugando && l.jefe !== null);
    if (l.jefe !== null) ancho('jefe', l.jefe);
    $('[data-abordar]').hidden = !(jugando && l.abordar);

    if (sim.banner) {
      banner.hidden = false;
      if (ultimo.banner !== sim.banner) {
        ultimo.banner = sim.banner;
        bannerTexto.textContent = sim.banner.text;
        bannerTexto.style.color = sim.banner.color;
        bannerSub.textContent = sim.banner.subtext ?? '';
        banner.toggleAttribute('data-parpadeo', Boolean(sim.banner.isBlinking));
      }
    } else {
      banner.hidden = true;
    }

    $('[data-cuenta]').hidden = !(jugando && l.cuenta !== null);
    if (l.cuenta !== null) texto('cuenta', String(l.cuenta));

    tactil.hidden = !(esTactil && jugando && !sim.isDying && !menu);
    tactil.querySelector('[data-grupo="orbita"]').hidden = !l.orbita;
    tactil.querySelector('[data-grupo="superficie"]').hidden = l.orbita;
    tactil.querySelector('[data-control="abordar"]').hidden = !l.abordar;
  }

  function mostrar(...nombres) {
    pantallas.forEach((el) => {
      el.hidden = !nombres.includes(el.dataset.pantalla);
    });
  }

  // Tirada de la victoria: 5 pasos con los tiempos del original (300, 400, 400, 400 y 500 ms).
  function victoria(r, alTick) {
    cancelar();
    const fila = (n) => raiz.querySelector(`[data-tirada="${n}"]`);
    ['1', '2', '3', '4', 'total'].forEach((n) => {
      fila(n).textContent = '---';
    });
    $('[data-sello]').hidden = true;
    $('[data-guardar]').hidden = false;
    $('[data-guardado]').hidden = true;
    const pasos = [
      [300, () => { fila('1').textContent = `${r.missionTime}s`; alTick('playTallyTick', true); }],
      [700, () => { fila('2').textContent = `${r.earthYearsLost} yrs`; alTick('playTallyTick', true); }],
      [1100, () => { fila('3').textContent = String(r.aerialInterceptorsDowned + r.enemiesDestroyed); alTick('playTallyTick', true); }],
      [1500, () => {
        fila('4').textContent = '100% PERFECT LOCK';
        fila('total').textContent = String(r.finalScore);
        alTick('playTallyTick', true);
      }],
      [2000, () => {
        texto('rango', r.rank);
        $('[data-sello]').hidden = false;
        alTick('playBannerImpact');
      }],
    ];
    pasos.forEach(([ms, fn]) => programar(fn, ms));
    mostrar('victoria');
  }

  function guardado() {
    $('[data-guardar]').hidden = true;
    $('[data-guardado]').hidden = false;
  }

  // Fallo: el "AUTO RETRY IN" del original baja de 9 a 0 con un tick por segundo y no reinicia solo.
  function fallo(r, alTick) {
    cancelar();
    $('[data-fallo-titulo]').textContent = r.deathReason === 'damage' ? 'HULL / TRAJE DESTRUIDO' : 'ALCANZADO POR LA OLA';
    raiz.querySelector('[data-fallo="tiempo"]').textContent = `${r.missionTime}s`;
    raiz.querySelector('[data-fallo="anos"]').textContent = `${r.earthYearsLost} yrs`;
    raiz.querySelector('[data-fallo="puntaje"]').textContent = String(r.finalScore || 0);
    hud.reintento.textContent = '9';
    for (let n = 8; n >= 0; n--) {
      programar(() => {
        hud.reintento.textContent = String(n);
        if (n > 0) alTick('playTallyTick');
      }, (9 - n) * 1000);
    }
    mostrar('fallo');
  }

  function pintarHall(filas) {
    $('[data-hall]').replaceChildren(
      ...filas.map((f, i) => {
        const tr = document.createElement('tr');
        [String(i + 1), f.nombre, f.anos, f.rango || 'A', String(f.puntaje)].forEach((t) => {
          const td = document.createElement('td');
          td.textContent = t;
          tr.append(td);
        });
        return tr;
      }),
    );
  }

  function pintarMutes({ sfx, bgm }) {
    texto('sfx', sfx ? 'Muted' : 'Enabled');
    texto('bgm', bgm ? 'Muted' : 'Enabled');
  }

  function cancelar() {
    temporizadores.forEach(clearTimeout);
    temporizadores = [];
  }

  function reiniciar() {
    ultimo = {};
  }

  return { pintar, mostrar, victoria, guardado, fallo, pintarHall, pintarMutes, cancelar, reiniciar };
}
