// Sprites originales como mapas de caracteres: un string por fila, un caracter por color de la leyenda (FR-024).
// '.' es transparente. Los sprites grandes se rasterizan con figuras simples para no escribir 40 filas a mano.

export const LEYENDA = Object.freeze({
  O: 'P0', // contorno
  o: 'P1', // sombra profunda
  A: 'P2', // vidrio y agua en sombra
  a: 'P3',
  w: 'P4',
  e: 'P5',
  E: 'P6', // espuma
  H: 'P7', // brillo crema
  m: 'P8', // metal en sombra
  M: 'P9', // metal base
  C: 'P10', // metal con luz y CASE
  S: 'P11', // traje
  s: 'P12', // sombra del traje
  R: 'P13', // oxido y correas
  v: 'P13', // sombra de la visera
  V: 'P14', // visera y chispa
  N: 'P15', // naranja Gargantua: baliza y llama
  n: 'P16',
  r: 'P17', // luz de emergencia
});

const vacia = (ancho) => '.'.repeat(ancho);
const desplazarX = (filas, dx) =>
  filas.map((f) => (dx > 0 ? '.'.repeat(dx) + f.slice(0, f.length - dx) : f.slice(-dx) + '.'.repeat(-dx)));
const desplazarY = (filas, dy) => {
  const ancho = filas[0].length;
  const relleno = Array(Math.abs(dy)).fill(vacia(ancho));
  return dy > 0 ? [...relleno, ...filas.slice(0, filas.length - dy)] : [...filas.slice(-dy), ...relleno];
};
const reemplazar = (filas, de, a) => filas.map((f) => f.replaceAll(de, a));

// --- Mini rasterizador: lienzo de caracteres mutable solo mientras se arma el sprite ---
const lienzo = (ancho, alto) => Array.from({ length: alto }, () => Array(ancho).fill('.'));
const rect = (l, x, y, ancho, alto, c) => {
  for (let j = y; j < y + alto; j++) for (let i = x; i < x + ancho; i++) if (l[j]?.[i] !== undefined) l[j][i] = c;
};
const aFilas = (l) => l.map((f) => f.join(''));
// Contorno de 1 gpx oscuro alrededor de lo dibujado, al estilo Metal Slug.
const contornear = (l) => {
  const lleno = (x, y) => l[y]?.[x] !== undefined && l[y][x] !== '.';
  const marcas = [];
  l.forEach((fila, y) =>
    fila.forEach((c, x) => {
      if (c === '.' && (lleno(x - 1, y) || lleno(x + 1, y) || lleno(x, y - 1) || lleno(x, y + 1))) marcas.push([x, y]);
    }),
  );
  marcas.forEach(([x, y]) => (l[y][x] = 'O'));
  return l;
};

// --- Astronauta 16x24, mirando a la derecha: cabeza + torso + piernas intercambiables ---
const CABEZA = [
  '......OOOO......',
  '.....OSSSSO.....',
  '....OSHSSSVO....',
  '....OSSSVVVO....',
  '....OSSSVVvO....',
  '....OSSSSvvO....',
  '.....OSSSSO.....',
  '...OOOOmmOO.....',
];
const TORSO = [
  '..OMMMOSSSSO....',
  '..OMmMOSSSSSO...',
  '..OMmMOSRSSSsO..',
  '..OMmMOSRSSsSSO.',
  '..OMmMOSSSsOSSO.',
  '..OMMMOsSSsO.OO.',
  '...OOOOsssssO...',
  '......OSSSSO....',
];
const TORSO_BRAZO_ARRIBA = [
  '..OMMMOSSSSO....',
  '..OMmMOSSSSO....',
  '..OMmMOSRSSO....',
  '..OMmMOSRSSO....',
  '..OMmMOSSSsO....',
  '..OMMMOsSSsO....',
  '...OOOOsssO.....',
  '......OSSSSO....',
];
const CABEZA_TROFEO = [
  '......OOOO..OO..',
  '.....OSSSSO.OSO.',
  '....OSHSSSVOOSO.',
  '....OSSSVVVOOSO.',
  '....OSSSVVvOSSO.',
  '....OSSSSvvOSO..',
  '.....OSSSSOOSO..',
  '...OOOOmmOOSO...',
];
const TORSO_RELOJ = [
  '..OMMMOSSSSO....',
  '..OMmMOSSSSSO...',
  '..OMmMOSRSSOSO..',
  '..OMmMOSRSSOHO..',
  '..OMmMOSSSsOOO..',
  '..OMMMOsSSsO....',
  '...OOOOsssssO...',
  '......OSSSSO....',
];
const PIERNAS_QUIETO = [
  '......OSsOSsO...',
  '......OSsOSsO...',
  '......OSsOSsO...',
  '......OSsOSsO...',
  '......OSsOSsO...',
  '.....OmmOOmmO...',
  '.....OmmmOmmmO..',
  '.....OOOOOOOOO..',
];
const PIERNAS_ADELANTE = [
  '......OSsOSsO...',
  '......OSsOSSsO..',
  '.....OSsO.OSsO..',
  '.....OSsO..OSsO.',
  '....OSsO...OSsO.',
  '....OmmO...OmmmO',
  '...OmmmO...OOOOO',
  '...OOOOO........',
];
const PIERNAS_CRUCE = [
  '......OSsOSsO...',
  '......OSsOSsO...',
  '.......OSsSsO...',
  '.......OSssO....',
  '......OSsSsO....',
  '......OmmOmmO...',
  '.....OmmmOmmmO..',
  '.....OOOOOOOOO..',
];
const PIERNAS_ATRAS = [
  '......OSsOSsO...',
  '.....OSSsOSsO...',
  '....OSsO.OSsO...',
  '...OSsO..OSsO...',
  '...OSsO...OSsO..',
  '..OmmmO...OmmO..',
  '..OOOOO...OmmmO.',
  '..........OOOOO.',
];

const quieto = [...CABEZA, ...TORSO, ...PIERNAS_QUIETO];
const agachado = [vacia(16), vacia(16), ...CABEZA, ...TORSO, ...PIERNAS_QUIETO.slice(2)];

const astronauta = {
  ancho: 16,
  alto: 24,
  frames: {
    idle0: quieto,
    idle1: [vacia(16), ...CABEZA, ...TORSO.slice(0, 7), ...PIERNAS_QUIETO],
    correr0: [...CABEZA, ...TORSO, ...PIERNAS_ADELANTE],
    correr1: [...CABEZA, ...TORSO, ...PIERNAS_CRUCE],
    correr2: [...CABEZA, ...TORSO, ...PIERNAS_ATRAS],
    agacharse: agachado,
    trofeo: [...CABEZA_TROFEO, ...TORSO_BRAZO_ARRIBA, ...PIERNAS_QUIETO],
    aturdido0: reemplazar(quieto, 'V', 'v'),
    aturdido1: desplazarX(reemplazar(quieto, 'V', 'v'), -1),
    tambaleo0: desplazarX(agachado, -1),
    tambaleo1: agachado,
    tambaleo2: desplazarX(agachado, 1),
    reloj0: [...CABEZA, ...TORSO_RELOJ, ...PIERNAS_QUIETO],
    reloj1: reemplazar([...CABEZA, ...TORSO_RELOJ, ...PIERNAS_QUIETO], 'H', 'V'),
  },
};

// --- Ranger 96x40 de perfil, nariz a la derecha ---
function cascoRanger({ luz }) {
  const l = lienzo(96, 40);
  rect(l, 30, 12, 41, 2, 'C');
  rect(l, 20, 14, 59, 2, 'C');
  rect(l, 12, 16, 73, 2, 'M');
  rect(l, 8, 18, 83, 8, 'M');
  rect(l, 10, 26, 79, 2, 'm');
  rect(l, 14, 28, 67, 2, 'm');
  rect(l, 34, 12, 27, 1, 'H');
  rect(l, 64, 15, 13, 3, 'A');
  rect(l, 66, 15, 2, 1, 'E');
  [30, 44, 58].forEach((x) => rect(l, x, 18, 1, 8, 'm'));
  rect(l, 20, 21, 60, 1, 'm');
  rect(l, 2, 17, 9, 10, 'm');
  rect(l, 0, 19, 2, 6, 'o');
  rect(l, 24, 30, 2, 5, 'm');
  rect(l, 70, 30, 2, 5, 'm');
  rect(l, 16, 35, 21, 1, 'M');
  rect(l, 62, 35, 21, 1, 'M');
  rect(l, 16, 36, 21, 1, 'm');
  rect(l, 62, 36, 21, 1, 'm');
  rect(l, 50, 11, 1, 1, luz ? 'r' : 'n');
  return contornear(l);
}

function conLlama(l, alto) {
  for (let j = 0; j < alto; j++) {
    const margen = Math.floor(j / 2);
    rect(l, 40 + margen, 31 + j, 17 - margen * 2, 1, j % 3 === 2 ? 'V' : 'N');
  }
  return l;
}

const ranger = {
  ancho: 96,
  alto: 40,
  frames: {
    quieto0: aFilas(cascoRanger({ luz: true })),
    quieto1: aFilas(cascoRanger({ luz: false })),
    despegue0: aFilas(conLlama(cascoRanger({ luz: true }), 3)),
    despegue1: desplazarY(aFilas(conLlama(cascoRanger({ luz: true }), 5)), 1),
    despegue2: desplazarY(aFilas(conLlama(cascoRanger({ luz: true }), 8)), -2),
  },
};

// --- Baliza 8x8: el unico naranja del mundo mientras se la busca ---
const BALIZA = [
  '..OOOO..',
  '.OmmmmO.',
  '.OMNNMO.',
  '.OMNNMO.',
  '.OMMMMO.',
  '.OmMMmO.',
  '.OmmmmO.',
  '..OOOO..',
];
const baliza = {
  ancho: 8,
  alto: 8,
  frames: {
    pulso0: BALIZA,
    pulso1: reemplazar(BALIZA, 'N', 'n'),
    pulso2: reemplazar(reemplazar(BALIZA, 'M', 'V'), 'm', 'M'),
  },
};

// --- Restos de la sonda 16x10 ---
const restos = {
  ancho: 16,
  alto: 10,
  frames: {
    resto0: [
      vacia(16),
      '..........OO....',
      '........OOMMO...',
      '......OOMMMmO...',
      '....OOMMMMmmO...',
      '..OOMMMHMMmmmO..',
      '.OMMMMMMMmmmmO..',
      '.OmmmmmmmmmmO...',
      '..OOOOOOOOOO....',
      vacia(16),
    ],
    resto1: [
      vacia(16),
      '...O............',
      '..OMO.....OOOO..',
      '..OMO....OAaAaO.',
      '..OMO...OAaAaAO.',
      '..OMMOOOAaAaAO..',
      '..OMmmmOAAAAO...',
      '.OMmmmmmOOOO....',
      '.OOOOOOOO.......',
      vacia(16),
    ],
    resto2: [
      vacia(16),
      '....OOOO........',
      '...OMMRMO..OO...',
      '..OMMRRMMOOMMO..',
      '..OMRRMMMMMMmO..',
      '.OMMMMMmmMMmmO..',
      '.OmmMMmmmmmmO...',
      '..OOmmmmmmOO....',
      '....OOOOOO......',
      vacia(16),
    ],
  },
};

// --- CASE 12x28: cuatro bloques verticales; en "aspa" se desfasan como el icono del menu del sitio ---
function cuerpoCase(desfases, led) {
  const l = lienzo(12, 28);
  desfases.forEach((dy, k) => {
    const x = k * 3;
    const y = 2 + dy;
    rect(l, x, y, 3, 24, 'O');
    rect(l, x + 1, y + 1, 1, 22, 'C');
    rect(l, x + 2, y + 1, 1, 22, 'M');
    rect(l, x + 1, y + 2, 1, 1, 'H');
  });
  if (led) rect(l, 4, 8 + desfases[1], 1, 1, 'V');
  return aFilas(l);
}

const caseRobot = {
  ancho: 12,
  alto: 28,
  frames: {
    quieto0: cuerpoCase([0, 0, 0, 0], true),
    quieto1: cuerpoCase([0, 0, 0, 0], false),
    aspa0: cuerpoCase([-2, 1, -1, 2], true),
    aspa1: cuerpoCase([1, -2, 2, -1], true),
    aspa2: cuerpoCase([2, -1, 1, -2], true),
    aspa3: cuerpoCase([-1, 2, -2, 1], true),
  },
};

// --- Particulas ---
const gota = { ancho: 2, alto: 2, frames: { gota: ['EH', 'eE'] } };
const espuma = { ancho: 3, alto: 2, frames: { espuma: ['EHE', '.E.'] } };

export const SPRITES = Object.freeze({ astronauta, ranger, baliza, restos, caseRobot, gota, espuma });

const repetir = (frames, veces) => frames.flatMap((f) => Array(veces).fill(f));

// Tabla de animaciones: se revisa aca sin leer la escena (DesignSystem §10).
export const ANIMACIONES = Object.freeze({
  'astronauta-quieto': { sprite: 'astronauta', frames: repetir(['idle0', 'idle1'], 6), fps: 12, loop: true },
  'astronauta-correr': { sprite: 'astronauta', frames: ['correr0', 'correr1', 'correr2', 'correr1'], fps: 15, loop: true },
  'astronauta-agacharse': { sprite: 'astronauta', frames: ['agacharse', 'agacharse'], fps: 12, loop: false },
  'astronauta-trofeo': { sprite: 'astronauta', frames: ['agacharse', 'trofeo'], fps: 12, loop: false },
  'astronauta-aturdido': { sprite: 'astronauta', frames: ['aturdido0', 'aturdido1'], fps: 12, loop: true },
  'astronauta-tambaleo': { sprite: 'astronauta', frames: ['tambaleo0', 'tambaleo1', 'tambaleo2'], fps: 12, loop: false },
  'astronauta-reloj': { sprite: 'astronauta', frames: repetir(['reloj0', 'reloj1'], 6), fps: 12, loop: true },
  'ranger-quieto': { sprite: 'ranger', frames: repetir(['quieto0', 'quieto1'], 12), fps: 12, loop: true },
  'ranger-despegue': { sprite: 'ranger', frames: ['despegue0', 'despegue1', 'despegue2', 'despegue1'], fps: 15, loop: true },
  'baliza-pulso': { sprite: 'baliza', frames: ['pulso0', 'pulso2', 'pulso0', 'pulso1'], fps: 12, loop: true },
  'case-quieto': { sprite: 'caseRobot', frames: repetir(['quieto0', 'quieto1'], 12), fps: 12, loop: true },
  'case-aspa': { sprite: 'caseRobot', frames: ['aspa0', 'aspa1', 'aspa2', 'aspa3'], fps: 15, loop: true },
});
