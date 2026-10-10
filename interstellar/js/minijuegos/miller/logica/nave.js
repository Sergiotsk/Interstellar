// Acciones de la nave: boardSpaceship, startMission2Transition, fireShipMissile, triggerEmpBomb y switchWeapon.
import { ANIM, PALETA_PIXEL, TOKENS_HUD } from '../config.js';
import { sonar, textoFlotante, mostrarBanner } from './efectos.js';
import { TEXTOS } from './textos.js';

const ARMAS = ['pulse', 'scatter', 'rocket'];

export function iniciarTransicion(sim) {
  sim.stage = 'MISSION_TRANSITION';
  sim.controlMode = 'SHIP';
  sim.transitionTimer = 1.2;
  sim.screenShake = ANIM.shake.fuerte * 1.8;
  sim.oneFrameFlash = true;
  // El original dejaba sonando el rumor de la ola durante todo el shmup.
  sonar(sim, 'stopWaveRumble');
  sonar(sim, 'playRangerThruster');
  sonar(sim, 'playPowerupChime');
  mostrarBanner(sim, TEXTOS.fase2[0], TEXTOS.fase2[1], PALETA_PIXEL.P13, 3.2, true);
}

export function abordar(sim) {
  if (sim.controlMode === 'SHIP' || sim.isDying) return;
  sim.controlMode = 'SHIP';
  sim.shipBoardAnimTimer = 0.4;
  sim.screenShake = ANIM.shake.medio;
  sim.oneFrameFlash = true;
  sonar(sim, 'playShipBoard');

  if (sim.beaconAcquired && sim.stage === 'MISSION_1_SURFACE') {
    iniciarTransicion(sim);
  } else {
    mostrarBanner(sim, TEXTOS.sistemas[0], TEXTOS.sistemas[1], TOKENS_HUD.tealGlow, 2.2);
  }
}

export function dispararMisil(sim) {
  if (sim.missileStock <= 0 || sim.shipMissileCooldown > 0 || sim.isDying) return;
  sim.missileStock--;
  sim.shipMissileCooldown = 0.3;
  sim.screenShake = ANIM.shake.medio;
  sonar(sim, 'playMissileLaunch');

  let nearestEnemyId;
  let minDist = 1200;
  for (const e of sim.enemies) {
    const d = Math.hypot(e.x - sim.shipX, e.y - sim.shipY);
    if (d < minDist) {
      minDist = d;
      nearestEnemyId = e.id;
    }
  }

  [-18, 18].forEach((offset) => {
    sim.bullets.push({
      x: sim.shipX + offset,
      y: sim.shipY - 20,
      vx: offset * 2.5,
      vy: -620,
      type: 'homing_missile',
      damage: 90,
      life: 2.8,
      maxLife: 2.8,
      targetEnemyId: nearestEnemyId,
    });
  });
}

export function detonarEmp(sim) {
  if (sim.bombStock <= 0 || sim.stage !== 'MISSION_2_ORBITAL_ASCENT' || sim.isDying) return;
  sim.bombStock--;
  sim.empFlashTimer = 0.35;
  sim.screenShake = ANIM.shake.fuerte * 2.2;
  sonar(sim, 'playEmpBomb');

  sim.bullets = sim.bullets.filter((b) => !b.isEnemy);
  for (const e of sim.enemies) {
    e.hp -= 220;
    e.flashTimer = 0.25;
    textoFlotante(sim, e.x, e.y - 15, '220 EMP!', '#a855f7', true);
  }
  // Como en el original: les baja la vida, pero los obstaculos nunca revisan su hp.
  for (const obs of sim.obstacles) obs.hp -= 300;

  mostrarBanner(sim, 'EMP PULSE DETONATED', 'AIRSPACE THREATS CLEARED', '#a855f7', 1.8);
}

export function cambiarArma(sim, arma) {
  sim.equippedWeapon = arma ?? ARMAS[(ARMAS.indexOf(sim.equippedWeapon) + 1) % ARMAS.length];
  sonar(sim, 'playTallyTick');
}
