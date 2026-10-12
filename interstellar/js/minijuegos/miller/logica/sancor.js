// Jefe final del ascenso: un show de drones "SANCOR SEGUROS ESTELARES" (parodia) que bloquea la llegada de la Endurance.
// Fases: entrada (se arma) -> presentacion (se luce, invulnerable) -> combate; con la mitad caida entra en furia.
import { ANIM } from '../config.js';
import { sonar, textoFlotante, mostrarBanner } from './efectos.js';
import { crearRng } from './azar.js';

const GLIFOS = {
  S: [' ####', '#    ', '#    ', ' ### ', '    #', '    #', '#### '],
  A: [' ### ', '#   #', '#   #', '#####', '#   #', '#   #', '#   #'],
  N: ['#   #', '##  #', '# # #', '#  ##', '#   #', '#   #', '#   #'],
  C: [' ####', '#    ', '#    ', '#    ', '#    ', '#    ', ' ####'],
  O: [' ### ', '#   #', '#   #', '#   #', '#   #', '#   #', ' ### '],
  R: ['#### ', '#   #', '#   #', '#### ', '# #  ', '#  # ', '#   #'],
  E: ['#####', '#    ', '#    ', '#### ', '#    ', '#    ', '#####'],
  G: [' ####', '#    ', '#    ', '#  ##', '#   #', '#   #', ' ### '],
  U: ['#   #', '#   #', '#   #', '#   #', '#   #', '#   #', ' ### '],
  P: ['#### ', '#   #', '#   #', '#### ', '#    ', '#    ', '#    '],
  I: [' ### ', '  #  ', '  #  ', '  #  ', '  #  ', '  #  ', ' ### '],
  L: ['#    ', '#    ', '#    ', '#    ', '#    ', '#    ', '#####'],
  D: ['#### ', '#   #', '#   #', '#   #', '#   #', '#   #', '#### '],
  T: ['#####', '  #  ', '  #  ', '  #  ', '  #  ', '  #  ', '  #  '],
};

export const MAGENTA = '#ff2d8f';
export const BLANCO = '#fff2f8';

const LOGO_DIAM = 16; // en celdas
const LOGO_C = LOGO_DIAM / 2 - 0.5;
const TEXTO_X = LOGO_DIAM + 3;
const RENGLONES = ['SANCOR', 'SEGUROS', 'ESTELARES'];
const COLS = TEXTO_X + Math.max(...RENGLONES.map((r) => r.length)) * 6 - 1;
const FILAS = RENGLONES.length * 9 - 2;
const LOGO_Y = (FILAS - LOGO_DIAM) / 2; // el logo queda centrado en alto respecto del texto
const Y_OBJETIVO = 44;
const EMP_CADA = 5; // la EMP le saca una vida a uno de cada 5 drones vivos

// Por renglon de RENGLONES: golpes que aguanta cada dron, puntos que paga y su patron de fuego.
const PALABRAS = [
  { vida: 4, puntos: 300, fuego: 'pesado' }, // SANCOR
  { vida: 3, puntos: 150, fuego: 'rafaga' }, // SEGUROS
  { vida: 2, puntos: 100, fuego: 'plasma' }, // ESTELARES
];
const DE_LOGO = { vida: 2, puntos: 300, fuego: 'plasma' };

// Cada patron tiene su reloj: borrar una palabra entera apaga su fuego.
const FUEGOS = {
  plasma: {
    inicio: 1.2,
    cada: (f) => (f.furia ? 0.5 : 0.45) + 0.75 * (f.vivos / f.drones.length),
    tirar: (sim, p, a, f) => (f.furia ? [-0.25, 0, 0.25] : [0]).forEach((o) => disparo(sim, p, a + o)),
  },
  rafaga: {
    inicio: 2.2,
    cada: (f) => (f.furia ? 1.6 : 2.4),
    tirar: (sim, p, a) => [0, 1, 2].forEach((i) => disparo(sim, { x: p.x - Math.cos(a) * i * 16, y: p.y - Math.sin(a) * i * 16 }, a, { vel: 340, danio: 9 })),
  },
  pesado: {
    inicio: 3.2,
    cada: (f) => (f.furia ? 2.4 : 3.4),
    tirar: (sim, p, a, f) => {
      const n = f.furia ? 7 : 5;
      for (let i = 0; i < n; i++) disparo(sim, p, a + (i - (n - 1) / 2) * 0.22, { vel: 170, danio: 16, pesada: true });
    },
  },
};

// La presentacion imita el show del estadio: logo gigante -> nube -> SANCOR SEGUROS -> grito de la tribuna.
const DURACION = { logo: 3.2, nube: 3.2, formacion: 2.8, grito: 2.5 };
const SIGUIENTE = { logo: 'nube', nube: 'formacion', formacion: 'grito', grito: 'combate' };
export const PRESENTACION_S = DURACION.logo + DURACION.nube + DURACION.formacion + DURACION.grito;

function texto(lista, palabra, n) {
  [...palabra].forEach((letra, i) => {
    // Una letra sin glifo (o un espacio) queda como hueco en vez de romper la formacion.
    (GLIFOS[letra] ?? []).forEach((renglon, f) => {
      [...renglon].forEach((c, k) => {
        if (c === '#') lista.push({ cx: TEXTO_X + i * 6 + k, cy: n * 9 + f, logo: false, palabra: n });
      });
    });
  });
}

function segmento(lista, ax, ay, bx, by, r, c) {
  const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) * r));
  for (let i = 0; i < n; i++) {
    const t = i / n;
    lista.push({ cx: c + (ax + (bx - ax) * t) * r, cy: c + (ay + (by - ay) * t) * r, logo: true });
  }
}

const frac = (v) => v - Math.floor(v);
const sat = (v) => Math.min(1, Math.max(0, v));
const suave = (v) => v * v * (3 - 2 * v);

export function armarFormacion({ ancho, alto }) {
  const drones = [];
  const r = LOGO_DIAM / 2;
  for (let i = 0; i < 34; i++) {
    const a = (i / 34) * Math.PI * 2;
    drones.push({ cx: LOGO_C + Math.cos(a) * r, cy: LOGO_C + Math.sin(a) * r, logo: true });
  }
  // El isotipo: dos triangulos opuestos, como el del logo.
  segmento(drones, -0.5, -0.08, 0.5, -0.08, r, LOGO_C);
  segmento(drones, 0.5, -0.08, -0.15, -0.62, r, LOGO_C);
  segmento(drones, -0.15, -0.62, -0.5, -0.08, r, LOGO_C);
  segmento(drones, 0.5, 0.08, -0.5, 0.08, r, LOGO_C);
  segmento(drones, -0.5, 0.08, 0.15, 0.62, r, LOGO_C);
  segmento(drones, 0.15, 0.62, 0.5, 0.08, r, LOGO_C);
  const enLogo = drones.length;
  drones.forEach((d) => { d.cy += LOGO_Y; });
  RENGLONES.forEach((r, i) => texto(drones, r, i));
  // Azar fijo por dron (no consume rng): solo mueve la coreografia y el titileo.
  drones.forEach((d, i) => {
    d.azar = frac(Math.sin(i * 127.1) * 43758.5453);
    d.azar2 = frac(d.azar * 97.31 + 0.17);
    // En el logo gigante, los drones de las letras se suman al dibujo del logo.
    d.ancla = d.logo ? i : Math.floor(d.azar2 * enLogo);
    d.vivo = true;
    const perfil = d.logo ? DE_LOGO : PALABRAS[d.palabra] ?? DE_LOGO;
    d.resistencia = d.vida = perfil.vida;
    d.puntos = perfil.puntos;
    d.fuego = perfil.fuego;
    d.golpe = 0;
  });

  const paso = Math.min(6, (ancho * 0.86) / COLS);
  const anchoF = COLS * paso;
  return {
    drones,
    vivos: drones.length,
    paso,
    ancho: anchoF,
    alto: FILAS * paso,
    anchoPantalla: ancho,
    xBase: (ancho - anchoF) / 2,
    vaiven: ((ancho - anchoF) / 2) * 0.8,
    y: Y_OBJETIVO,
    centroX: ancho / 2,
    centroY: alto * 0.3,
    pasoGrande: (Math.min(ancho, alto) * 0.5) / LOGO_DIAM,
    radioNube: Math.min(ancho * 0.42, alto * 0.45),
    t: 0,
    fase: 'logo',
    faseT: 0,
    vaivenAng: 0,
    ola: 0,
    furia: false,
    fuego: Object.fromEntries(Object.entries(FUEGOS).map(([k, v]) => [k, v.inicio])),
  };
}

export function origenX(f) {
  return f.xBase + Math.sin(f.vaivenAng) * f.vaiven;
}

function enLogo(f, d) {
  const a = f.drones[d.ancla];
  const respira = 1 + 0.03 * Math.sin(f.t * 2);
  const jit = d.logo ? 0 : f.pasoGrande * 0.45;
  return {
    x: f.centroX + (a.cx - LOGO_C) * f.pasoGrande * respira + Math.cos(d.azar * 6.28) * jit,
    y: f.centroY + (a.cy - LOGO_Y - LOGO_C) * f.pasoGrande * respira + Math.sin(d.azar * 6.28) * jit,
  };
}

function enNube(f, d) {
  const giro = d.azar2 > 0.5 ? 0.7 : -0.5;
  const ang = d.azar * Math.PI * 2 + f.t * giro;
  const rad = Math.sqrt(d.azar2) * f.radioNube;
  return {
    x: f.centroX + Math.cos(ang) * rad,
    y: f.centroY + Math.sin(ang) * rad * 0.55 + Math.sin(f.t * 1.5 + d.azar * 10) * 6,
  };
}

// desliz: en el show las letras entran barriendo desde la izquierda.
function enFormacion(f, d, time, desliz = 0) {
  return {
    x: origenX(f) - desliz + d.cx * f.paso + Math.sin(time * 1.3 + d.azar * 9) * 0.6,
    y: f.y + d.cy * f.paso + Math.cos(time * 1.1 + d.azar * 7) * 0.6 + Math.sin(d.cx * 0.4 - f.t * 6) * f.ola,
  };
}

const mezcla = (a, b, k) => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k });

export function posicionDron(f, d, time) {
  if (f.fase === 'logo') return enLogo(f, d);
  if (f.fase === 'nube') {
    const k = suave(sat((f.faseT / 1.6 - d.azar2 * 0.4) / 0.6));
    return mezcla(enLogo(f, d), enNube(f, d), k);
  }
  if (f.fase === 'formacion') {
    const u = f.faseT / DURACION.formacion;
    const desliz = (1 - suave(sat(u / 0.85))) * f.anchoPantalla * 0.6;
    const k = suave(sat((u - d.azar * 0.35) / 0.65));
    return mezcla(enNube(f, d), enFormacion(f, d, time, desliz), k);
  }
  return enFormacion(f, d, time);
}

// 0..1: en el logo los drones se encienden de a uno, como en el estadio.
export function brilloDron(f, d) {
  return f.fase === 'logo' ? sat((f.faseT - d.azar * 1.4) / 0.35) : 1;
}

export function iniciarFormacion(sim, dims) {
  sim.formacion = armarFormacion(dims);
  sonar(sim, 'playGalagaDive');
  mostrarBanner(sim, 'WARNING', 'UNKNOWN FORMATION INBOUND', '#ff2d8f', 2.4, true);
}

function avanzarFase(sim, f, dt) {
  f.faseT += dt;
  if (f.fase === 'grito') f.ola = f.paso * 1.4 * Math.sin((Math.PI * f.faseT) / DURACION.grito);
  if (f.fase === 'combate' || f.faseT < DURACION[f.fase]) return;

  f.fase = SIGUIENTE[f.fase];
  f.faseT = 0;
  if (f.fase === 'nube') {
    sonar(sim, 'playGalagaDive');
  } else if (f.fase === 'grito') {
    sonar(sim, 'vozSancor');
    mostrarBanner(sim, 'SANCOR SEGUROS ESTELARES', 'FINAL BOSS · DRONE SHOW', '#ff2d8f', DURACION.grito);
  } else if (f.fase === 'combate') {
    f.ola = 0;
    sonar(sim, 'playTargetLock');
    mostrarBanner(sim, 'ENGAGE', 'DESTROY EVERY DRONE', '#ff2d8f', 1.6);
  }
}

function disparo(sim, p, a, { vel = 260, danio = 12, pesada = false } = {}) {
  const life = 620 / vel;
  sim.bullets.push({ x: p.x, y: p.y, vx: Math.cos(a) * vel, vy: Math.sin(a) * vel, type: 'drone_plasma', damage: danio, life, maxLife: life, isEnemy: true, pesada });
}

export function actualizarFormacion(sim, dt, rng) {
  const f = sim.formacion;
  f.t += dt;
  avanzarFase(sim, f, dt);
  if (f.fase !== 'combate') return;
  f.vaivenAng += dt * (f.furia ? 0.95 : 0.5);

  if (!f.furia && f.vivos <= f.drones.length / 2) {
    f.furia = true;
    sonar(sim, 'playBannerImpact');
    mostrarBanner(sim, 'OVERDRIVE', 'FORMATION ENRAGED', '#ff2d8f', 1.4);
  }

  for (const d of f.drones) if (d.golpe > 0) d.golpe = Math.max(0, d.golpe - dt);

  // Cada palabra tira su patron desde uno de sus drones vivos; en furia, todos se aceleran.
  for (const [nombre, fuego] of Object.entries(FUEGOS)) {
    f.fuego[nombre] -= dt;
    if (f.fuego[nombre] > 0) continue;
    f.fuego[nombre] = fuego.cada(f);
    const tiradores = f.drones.filter((d) => d.vivo && d.fuego === nombre);
    if (!tiradores.length) continue;
    const d = tiradores[Math.floor(rng() * tiradores.length)];
    const p = posicionDron(f, d, sim.elapsedSeconds);
    fuego.tirar(sim, p, Math.atan2(sim.shipY - p.y, sim.shipX - p.x), f);
    sonar(sim, 'playEnemyLaser');
  }
}

function explosion(sim, x, y, color, n, rng) {
  for (let i = 0; i < n; i++) {
    const a = rng() * Math.PI * 2;
    const spd = 40 + rng() * 120;
    sim.particles.push({ x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, life: 0.45, maxLife: 0.45, color: i % 2 ? color : BLANCO, size: 1.5 + rng() * 2 });
  }
}

function derribarDron(sim, d, time, rng) {
  const f = sim.formacion;
  const p = posicionDron(f, d, time);
  const { puntos } = d;
  d.vivo = false;
  f.vivos--;
  sim.dronesSancor++;
  sim.puntosSancor += puntos;
  explosion(sim, p.x, p.y, MAGENTA, 6, rng);
  textoFlotante(sim, p.x, p.y - 8, `+${puntos}`, MAGENTA, false);
  if (f.vivos > 0) return;

  sim.formacion = null;
  sim.formacionDerribada = true;
  sim.screenShake = ANIM.shake.fuerte * 3;
  sonar(sim, 'playExplosion', true);
  explosion(sim, p.x, p.y, MAGENTA, 40, rng);
  mostrarBanner(sim, 'DRONE SHOW CLEARED!', 'APPROACHING THE ENDURANCE', '#7ee7f8', 3.0, true);
}

// Le saca una vida; con vida de sobra solo chispea y queda blindado un poco menos.
function danarDron(sim, d, time, rng) {
  d.vida--;
  if (d.vida <= 0) return derribarDron(sim, d, time, rng);
  d.golpe = 0.12;
  const p = posicionDron(sim.formacion, d, time);
  explosion(sim, p.x, p.y, BLANCO, 3, rng);
}

// Choque bala-dron sobre el tramo recorrido en el paso: a 920 px/s una bala salta 15 px, mas que un dron.
export function impactarFormacion(sim, b, dt, rng) {
  const f = sim.formacion;
  if (!f || f.fase !== 'combate') return false;
  const time = sim.elapsedSeconds;
  const r = f.paso * 0.7 + 3;
  const x0 = b.x - b.vx * dt;
  const y0 = b.y - b.vy * dt;
  const ox = origenX(f);
  const holgura = 70 + r;
  if (Math.max(b.x, x0) < ox - holgura || Math.min(b.x, x0) > ox + f.ancho + holgura) return false;
  if (Math.max(b.y, y0) < f.y - holgura || Math.min(b.y, y0) > f.y + f.alto + holgura) return false;

  const sx = b.x - x0;
  const sy = b.y - y0;
  const largo2 = sx * sx + sy * sy || 1;
  let mejor = null;
  let mejorT = Infinity;
  for (const d of f.drones) {
    if (!d.vivo) continue;
    const p = posicionDron(f, d, time);
    const t = Math.max(0, Math.min(1, ((p.x - x0) * sx + (p.y - y0) * sy) / largo2));
    if (Math.hypot(x0 + sx * t - p.x, y0 + sy * t - p.y) < r && t < mejorT) {
      mejor = d;
      mejorT = t;
    }
  }
  if (!mejor) return false;
  sonar(sim, 'playHitMarker', false);
  danarDron(sim, mejor, time, rng);
  return true;
}

export function empFormacion(sim) {
  const f = sim.formacion;
  if (!f || f.fase !== 'combate') return;
  const rng = crearRng(sim.dronesSancor + 1);
  f.drones.filter((d) => d.vivo).forEach((d, i) => {
    if (i % EMP_CADA === 0 && sim.formacion) danarDron(sim, d, sim.elapsedSeconds, rng);
  });
}
