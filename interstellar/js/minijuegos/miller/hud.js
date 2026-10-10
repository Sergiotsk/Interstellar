// HUD y pantallas del original (el JSX de App.tsx) sobre el HTML de minijuego-miller.html. Solo lee sim.
import { textoAnosHud, puntajeEnVivo } from './logica/puntaje.js';

const ORBITA = 'MISSION_2_ORBITAL_ASCENT';
const CANONES = { 1: 'LV1 DUAL', 2: 'LV2 TRIPLE', 3: 'LV3 QUAD MAX' };

// Lo que muestra cada lectura (pura, para poder probarla sin DOM).
export function lecturasHud(sim, estado, config, puntajeFinal = null) {
  const orbita = sim.stage === ORBITA;
  const jefe = sim.enemies.find((e) => e.type === 'dreadnought_boss');
  const score = estado === 'PLAYING' || puntajeFinal === null ? puntajeEnVivo(sim) : puntajeFinal;
  return {
    orbita,
    score: String(score).padStart(6, '0'),
    combo: Math.min(4, 1 + Math.floor(sim.combo / 5)),
    tierra: textoAnosHud(sim.elapsedSeconds, config),
    sector: orbita ? sim.sectorName : 'MISSION 01 // SURFACE EXPLORATION',
    altitud: `▲ ${Math.round(sim.altitude)}m / 10,000m`,
    progreso: Math.round((Math.min(sim.targetAltitude, sim.altitude) / sim.targetAltitude) * 100),
    baliza: sim.beaconAcquired ? 'BEACON SECURED // BOARD SPACECRAFT [E]' : 'RETRIEVE MILLER BEACON',
    balizaAsegurada: sim.beaconAcquired,
    stage: orbita ? '🚀 STAGE 02: ORBIT' : '🌊 STAGE 01: SURFACE',
    escudo: Math.round(sim.shipShield),
    casco: Math.round(sim.shipHealth),
    canon: CANONES[sim.weaponPowerLevel],
    misiles: sim.missileStock,
    bombas: sim.bombStock,
    traje: Math.round(sim.playerShieldHp),
    trajeAlerta: Math.round(sim.playerShieldHp) <= 35,
    jefe: jefe ? Math.round((jefe.hp / jefe.maxHp) * 100) : null,
    abordar: sim.controlMode === 'FOOT' && sim.shipBoardPrompt,
    cuenta: sim.phase === 'COUNTDOWN' ? Math.ceil(sim.countdownTimer) : null,
    radar: orbita
      ? 'VERTICAL SHMUP MODE // DODGE BULLETS & SHOOT UPWARDS TO REACH THE ENDURANCE'
      : sim.beaconAcquired
        ? 'BEACON SECURED // RETURN TO RANGER SPACECRAFT [E]'
        : 'EXPLORE WATER SURFACE // RETRIEVE MILLER BEACON',
    ayuda: orbita
      ? 'WASD / Arrows: Move | SPACE / CLICK: Fire | Q: Missiles | B: EMP Bomb'
      : 'WASD / Arrows: Move | SPACE: Jump | SHIFT: Slide | J/CLICK: Shoot | E: Board Ship',
  };
}

export function crearHud(raiz) {
  const $ = (sel) => raiz.querySelector(sel);
  const hud = Object.fromEntries([...raiz.querySelectorAll('[data-hud]')].map((el) => [el.dataset.hud, el]));
  const pantallas = [...raiz.querySelectorAll('[data-pantalla]')];
  const subOrbita = [...raiz.querySelectorAll('[data-sub="orbita"]')];
  const subSuperficie = [...raiz.querySelectorAll('[data-sub="superficie"]')];
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

  function pintar(sim, estado, config, { menu, tactil: esTactil, puntajeFinal }) {
    const l = lecturasHud(sim, estado, config, puntajeFinal);
    const jugando = estado === 'PLAYING';
    raiz.dataset.estado = estado;

    texto('score', l.score);
    hud.combo.hidden = l.combo <= 1;
    texto('combo', `x${l.combo}`);
    texto('tierra', l.tierra);
    texto('sector', l.sector);
    $('[data-hud-ascenso]').hidden = !l.orbita;
    hud.baliza.hidden = l.orbita;
    texto('altitud', l.altitud);
    ancho('progreso', l.progreso);
    texto('baliza', l.baliza);
    hud.baliza.toggleAttribute('data-asegurada', l.balizaAsegurada);
    texto('stage', l.stage);

    $('[data-subbarra]').hidden = !jugando;
    subOrbita.forEach((el) => {
      el.hidden = !l.orbita;
    });
    subSuperficie.forEach((el) => {
      el.hidden = l.orbita;
    });
    ancho('escudo', l.escudo);
    ancho('casco', l.casco);
    texto('canon', l.canon);
    texto('misiles', String(l.misiles));
    texto('bombas', String(l.bombas));
    texto('bombas-tactil', String(l.bombas));
    ancho('traje', l.traje);
    texto('traje-pct', `${l.traje}%`);
    $('[data-hud-traje-icono]').toggleAttribute('data-alerta', l.trajeAlerta);

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

    texto('radar', l.radar);
    texto('ayuda', l.ayuda);

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
      [1100, () => { fila('3').textContent = String(r.aerialInterceptorsDowned); alTick('playTallyTick', true); }],
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
