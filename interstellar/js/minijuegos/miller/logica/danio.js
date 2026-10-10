// Danio y muerte del jugador: applyPlayerDamage y triggerPlayerDeath del original.
import { ANIM, PALETA_PIXEL } from '../config.js';
import { sonar, textoFlotante, mostrarBanner } from './efectos.js';
import { TEXTOS } from './textos.js';

export function matarJugador(sim, reason = 'damage', rng) {
  if (sim.isDying) return;

  sim.isDying = true;
  sim.deathReason = reason;
  sim.deathTimer = 1.6;
  sim.deathMaxTimer = 1.6;
  sim.state = 'dying';
  sim.playerShieldHp = 0;
  sim.shipHealth = 0;

  sim.screenShake = ANIM.shake.fuerte * 2.8;
  sim.hitStopMsRemaining = ANIM.hitStopMs * 1.8;
  sim.redDamageVignette = 1.0;
  sim.oneFrameFlash = true;

  sonar(sim, 'playPlayerDeath');
  sonar(sim, 'stopWaveRumble');

  const [texto, sub] = reason === 'damage' ? TEXTOS.colapso : TEXTOS.alcanzado;
  mostrarBanner(sim, texto, sub, PALETA_PIXEL.P15, 1.6, true);

  const px = sim.controlMode === 'SHIP' ? sim.shipX : sim.playerX;
  const py = sim.controlMode === 'SHIP' ? sim.shipY : sim.playerY;
  for (let i = 0; i < 36; i++) {
    const angle = (Math.PI * 2 * i) / 36;
    const spd = 60 + rng() * 180;
    sim.particles.push({
      x: px,
      y: py,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd - 30,
      life: 0.6 + rng() * 0.7,
      maxLife: 1.3,
      color: i % 3 === 0 ? PALETA_PIXEL.P15 : i % 3 === 1 ? PALETA_PIXEL.P13 : '#ffffff',
      size: 3 + rng() * 3,
    });
  }
}

export function aplicarDanio(sim, amount, sourceX, sourceY, reason = 'damage', rng) {
  if (sim.isDying || sim.stage === 'VICTORY_ENDURANCE_DOCKED') return;
  if (sim.slideTimer > 0) return;

  if (sim.controlMode === 'SHIP') {
    if (sim.shipShield > 0) {
      sim.shipShield = Math.max(0, sim.shipShield - amount);
      textoFlotante(sim, sim.shipX, sim.shipY - 30, `-${Math.round(amount)} SHIELD`, '#4fd0e0', false);
    } else {
      sim.shipHealth = Math.max(0, sim.shipHealth - amount);
      textoFlotante(sim, sim.shipX, sim.shipY - 30, `-${Math.round(amount)} HULL`, PALETA_PIXEL.P15, true);
    }
    sim.screenShake = ANIM.shake.medio;
    sonar(sim, 'playHitMarker', true);
    if (sim.shipHealth <= 0) matarJugador(sim, reason, rng);
    return;
  }

  sim.playerShieldHp = Math.max(0, sim.playerShieldHp - amount);
  sim.playerShieldRegenDelay = 4.0;
  sim.playerHurtTimer = 0.45;
  sim.screenShake = Math.min(12, ANIM.shake.medio * (1 + amount / 18));
  sim.redDamageVignette = Math.min(1.0, 0.45 + amount / 25);
  sim.hitStopMsRemaining = ANIM.hitStopMs;

  textoFlotante(sim, sim.playerX, sim.playerY - 26, `-${amount} HP`, PALETA_PIXEL.P15, true);

  if (sim.playerShieldHp <= 0) {
    matarJugador(sim, reason, rng);
  } else {
    sonar(sim, 'playPlayerHurt');
    sonar(sim, 'playHitStopThud');
  }
}
