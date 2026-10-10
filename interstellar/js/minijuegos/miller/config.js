// Configuracion y tokens de "Miller's Wave Escape": constants.ts del prototipo del Playground, sin cambios de valores.
// Unidades: px logicos sobre un lienzo de 960x540, segundos y px/s.

const congelar = (obj) => {
  Object.values(obj).forEach((v) => {
    if (v && typeof v === 'object') congelar(v);
  });
  return Object.freeze(obj);
};

export const PALETA_PIXEL = congelar({
  P0: 'rgba(0,0,0,0)', // transparente
  P1: '#0a0e1a', // abismo / cielo
  P2: '#141c2b', // silueta lejana de la ola
  P3: '#1a2a3a', // agua oscura
  P4: '#243d4f', // agua media
  P5: '#35586c', // agua clara / base de espuma
  P6: '#588094', // rocio de la ola
  P7: '#9ec2cf', // brillo de espuma / ondas
  P8: '#efe7d6', // crema: luz maxima / casco del traje
  P9: '#c2b8a3', // sombra del traje / aleacion de CASE
  P10: '#7a756b', // gris profundo del traje / costuras
  P11: '#3d3b36', // botas / restos de metal
  P12: '#1b1b1a', // gunmetal / chasis
  P13: '#e8803b', // naranja Gargantua: baliza, llama, sello de rango
  P14: '#f7a952', // nucleo del propulsor / destello de la baliza
  P15: '#c94b32', // alerta / rojo critico
  P16: '#4287f5', // LED de CASE
  P17: '#ffffff', // blanco puro: solo el destello de 1 frame
  P18: '#4fd0e0', // energia cian / plasma de pulso
  P19: '#7ee7f8', // cian blanco de alta energia
  P20: '#a855f7', // violeta del vacio / EMP
});

export const ANIM = congelar({
  fpsSprite: 12,
  fpsSpriteRapido: 16,
  hitStopMs: 65,
  shake: { leve: 1.5, medio: 3.5, fuerte: 6.0, decaimiento: 0.88 },
  squash: { x: 1.15, y: 0.85, ms: 90 },
  stretch: { x: 0.9, y: 1.12, ms: 90 },
  bannerEntradaMs: 280,
  bannerRetencionMs: 1200,
  idleEsperaS: 2.5,
  tickTiradaMs: 40,
});

export const TOKENS_HUD = congelar({
  panelBg: '#0c2529',
  panelDark: '#071517',
  bezelBorder: '#3d454c',
  bezelDark: '#23282c',
  tealGlow: '#4fd0e0',
  tealMuted: 'rgba(79, 208, 224, 0.4)',
  amberLed: '#e0a94a',
  redLed: '#d0453a',
  gargantuaOrange: '#e8803b',
  creamLight: '#efe7d6',
  abyssBlack: '#0a0e1a',
  fontFamily: "'Share Tech Mono', 'Courier New', monospace",
  fontBanner: "'Orbitron', 'Exo 2', 'Impact', sans-serif",
});

export const CONFIG = congelar({
  title: "Miller's Wave Escape: Deep Space Run & Gun",
  baseCanvasWidth: 960,
  baseCanvasHeight: 540,

  targetFPS: 60,
  stepMs: 1000 / 60,
  maxSubSteps: 5,

  defaultMusicVolume: 0.5,
  defaultSfxVolume: 0.75,

  playerBaseSpeed: 260,
  playerSprintSpeed: 370,
  playerAcceleration: 2300,
  waterDragCoeff: 4.0,
  jumpVelocity: 350,
  gravity: 860,
  playerMaxHp: 100,
  slideSpeed: 460,
  slideDuration: 0.32,

  waveInitialDistance: 2200,
  waveSpeedBase: 38,
  waveSpeedFlight: 115,
  waveMaxSpeed: 170,
  liftoffHoldDuration: 1.2,
  landerTriggerRadius: 95,
  beaconPickupRadius: 58,
  caseTriggerRadius: 62,
  debrisObstacleCount: 16,

  shipMaxSpeed: 460,
  shipBoostSpeed: 720,
  shipThrustAccel: 480,
  shipTurnRate: 3.0,
  shipAirDrag: 0.95,
  shipBoardingRadius: 120,

  mission2TargetDistance: 10000,
  enduranceDockingRadius: 160,

  // Integracion con el sitio (no estaba en el original).
  // 1 h en Miller = 7 anos en la Tierra: 7 x 365,25 x 24 / 3600 = 17,045 h por segundo (el original usaba 17,518).
  horasTerrestresPorSegundo: (7 * 365.25 * 24) / 3600,
  ranking: {
    clave: 'interstellar:minijuegos:miller:ranking',
    version: 1,
    tope: 10,
    largoNombre: 8,
    alfabeto: 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ0123456789 ',
    nombrePorDefecto: 'COOPER',
  },
});
