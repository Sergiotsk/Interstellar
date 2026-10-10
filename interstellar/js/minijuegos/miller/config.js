// Parametros del capitulo 2 (Miller): unico lugar con numeros de gameplay y nombres de la pelicula.
// Unidades: distancia en gpx (pixel de juego, base 480x270), tiempo en s, velocidad en gpx/s.

const congelar = (obj) => {
  Object.values(obj).forEach((v) => {
    if (v && typeof v === 'object') congelar(v);
  });
  return Object.freeze(obj);
};

export const CONFIG = congelar({
  nombres: { planeta: 'Miller', nave: 'Ranger', robot: 'CASE' },
  teclas: {
    ArrowUp: 'moverArriba',
    ArrowDown: 'moverAbajo',
    ArrowLeft: 'moverIzquierda',
    ArrowRight: 'moverDerecha',
    KeyW: 'moverArriba',
    KeyS: 'moverAbajo',
    KeyA: 'moverIzquierda',
    KeyD: 'moverDerecha',
    Space: 'accion',
    Enter: 'accion',
    Escape: 'pausa',
  },

  pasoFijoS: 1 / 60,
  deltaMaxS: 0.1,
  introS: 7,
  cuentaS: 3,

  // x recorre el mapa; z es la profundidad dentro de la franja de agua (belt-scroller, R2).
  mundo: { ancho: 2400, profundidad: 90, horizonte: 150, base: { ancho: 480, alto: 270 } },

  // Velocidad terminal = aceleracion / arrastre = 75 gpx/s.
  jugador: { aceleracion: 315, arrastre: 4.2, factorProfundidad: 0.6, caja: { ancho: 10, prof: 6 }, alcanceBaliza: 14 },
  ranger: { x: 80, z: 45, radio: 36 },
  baliza: { ventanaX: [1800, 2200], pulsoMinHz: 0.8, pulsoMaxHz: 6, rangoSenal: 900 },
  restos: { cantidad: 18, desdeX: 220, hastaX: 2300, separacionMin: 60, huecoMinZ: 20, caja: { ancho: 16, prof: 10 }, velChoque: 50, aturdimientoS: 0.8 },

  // La ola se revela a distanciaRevelacion del jugador al recoger la baliza (R7).
  ola: { xInicial: 2800, distanciaRevelacion: 520, velHuida: 55, aceleracion: 1.2, umbrales: { cerca: 360, inminente: 150 } },

  despegue: { tiempo: 1.5, decaimientoCarga: 0.8, maxSoltadas: 3 },
  caseRobot: { radio: 16, impulso: 1.5, duracionS: 2, recargaS: 8 },
  dilatacion: { anosPorHora: 7 },

  puntaje: {
    max: 10000,
    tMin: 45,
    tMax: 90,
    margenMax: 500,
    maxChoques: 5,
    pesos: { tiempo: 0.45, margen: 0.25, choques: 0.15, precision: 0.15 },
    rangos: { S: 9000, A: 7500, B: 5000 },
  },

  particulas: { tope: { teclado: 300, tactil: 150 } },

  // El parlante del celular no da graves: en tactil se sube el volumen y se abren los filtros.
  audio: {
    teclado: { volumen: 0.75, olaFiltro: [120, 900], ambienteFiltro: 700, compresor: false },
    tactil: { volumen: 1, olaFiltro: [400, 2000], ambienteFiltro: 1800, compresor: true },
  },

  ranking: {
    clave: 'interstellar:minijuegos:miller:ranking',
    version: 1,
    tope: 10,
    largoNombre: 8,
    alfabeto: 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ0123456789 ',
    nombrePorDefecto: 'RANGER',
  },
});

// Paleta cerrada del mundo (DesignSystem §3.2): ningun sprite usa un color fuera de esta lista.
export const PALETA_PIXEL = congelar({
  P0: 0x0a0e1a,
  P1: 0x161c2b,
  P2: 0x2a3346,
  P3: 0x3f4c5f,
  P4: 0x5d6c7e,
  P5: 0x8a98a6,
  P6: 0xb9c0c4,
  P7: 0xefe7d6,
  P8: 0x3d454c,
  P9: 0x6b7680,
  P10: 0x9aa6b6,
  P11: 0xc9cfd6,
  P12: 0x8e959c,
  P13: 0xa8793f,
  P14: 0xd4a94e,
  P15: 0xe8803b,
  P16: 0x7a3d1c,
  P17: 0xd0453a,
});

// Tokens de tiempo de animacion (DesignSystem §5.1).
export const ANIM = congelar({
  fpsSprite: 12,
  fpsSpriteRapido: 15,
  hitStopMs: 70,
  shake: { leve: 1, medio: 2, fuerte: 4, decaimiento: 0.85 },
  squash: { x: 1.15, y: 0.85, ms: 90 },
  stretch: { x: 0.9, y: 1.12, ms: 90 },
  bannerEntradaMs: 280,
  bannerRetencionMs: 1200,
  idleEsperaS: 3,
  tickTiradaMs: 40,
  maxDestellosPorS: 3,
});
