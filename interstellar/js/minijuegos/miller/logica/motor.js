// Un paso de simulacion: el update(dt) completo del original (App.tsx 2989-4103), repartido en modulos.
// main.js lo llama a 60 Hz fijos solo mientras la mision esta en curso y sin menu (como el original).
import { ANIM, TOKENS_HUD } from '../config.js';
import { sonar, mostrarBanner, avanzarEfectos } from './efectos.js';
import { actualizarSuperficie } from './superficie.js';
import { actualizarTransicion, actualizarOrbita } from './orbita.js';
import { actualizarProyectiles, actualizarCaidas } from './proyectiles.js';
import { resultadoFallo } from './puntaje.js';
import { TEXTOS } from './textos.js';

function moverParticulas(sim, dt) {
  for (let i = sim.particles.length - 1; i >= 0; i--) {
    const p = sim.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) sim.particles.splice(i, 1);
  }
}

export function actualizar(sim, entrada, dt, config, rng, dims) {
  // Hit-stop: el mundo se congela unos ms tras un impacto fuerte.
  if (sim.hitStopMsRemaining > 0) {
    sim.hitStopMsRemaining -= dt * 1000;
    sim.oneFrameFlash = false;
    return;
  }
  sim.oneFrameFlash = false;

  sim.screenShake = Math.max(0, sim.screenShake * ANIM.shake.decaimiento - dt * 2);
  sim.redDamageVignette = Math.max(0, sim.redDamageVignette - dt * 2.2);
  sim.empFlashTimer = Math.max(0, sim.empFlashTimer - dt);
  if (sim.shipBoardAnimTimer > 0) sim.shipBoardAnimTimer -= dt;
  avanzarEfectos(sim, dt);

  // 1. Cuenta regresiva.
  if (sim.phase === 'COUNTDOWN') {
    sim.countdownTimer -= dt;
    if (sim.countdownTimer <= 0) {
      sim.phase = 'EXPLORATION';
      mostrarBanner(sim, TEXTOS.fase1[0], TEXTOS.fase1[1], TOKENS_HUD.tealGlow);
    }
    return;
  }

  // 1b. Secuencia de muerte.
  if (sim.isDying) {
    sim.deathTimer -= dt;
    sim.animTick += dt;
    moverParticulas(sim, dt);
    if (sim.deathTimer <= 0) {
      sim.phase = 'FAILED';
      sonar(sim, 'stopWaveRumble');
      sonar(sim, 'playDefeatMotif');
      sim.fin = { estado: 'GAME_OVER', resultado: resultadoFallo(sim, config) };
    }
    return;
  }

  sim.elapsedSeconds += dt;
  sim.animTick += dt;
  sim.enduranceRot += dt * 0.35;

  if (sim.comboTimer > 0) {
    sim.comboTimer -= dt;
    if (sim.comboTimer <= 0) sim.combo = 0;
  }

  // Regeneracion: escudo de la nave o traje (este tras 4 s sin danio).
  if (sim.controlMode === 'SHIP') {
    if (sim.shipShield < 100) sim.shipShield = Math.min(100, sim.shipShield + dt * 12);
  } else if (sim.playerShieldRegenDelay > 0) {
    sim.playerShieldRegenDelay -= dt;
  } else if (sim.playerShieldHp < 100) {
    sim.playerShieldHp = Math.min(100, sim.playerShieldHp + dt * 10);
  }

  if (sim.playerHurtTimer > 0) sim.playerHurtTimer -= dt;

  if (sim.stage === 'MISSION_TRANSITION') {
    actualizarTransicion(sim, dt, rng, dims);
    return;
  }

  if (sim.stage === 'MISSION_2_ORBITAL_ASCENT') {
    actualizarOrbita(sim, entrada, dt, config, rng, dims);
    if (sim.fin) return;
  } else if (sim.stage === 'MISSION_1_SURFACE') {
    if (actualizarSuperficie(sim, entrada, dt, config, rng) === 'muerto') return;
  }

  actualizarProyectiles(sim, dt, rng, dims);
  actualizarCaidas(sim, dt, dims);
  moverParticulas(sim, dt);

  // Camara: sigue al astronauta con adelanto hacia donde mira; en el shmup queda fija.
  if (sim.stage === 'MISSION_1_SURFACE') {
    const targetFocusX = sim.playerX + (sim.playerFacing === 1 ? 50 : -50);
    const targetFocusY = sim.playerY;
    const camLerp = 1 - Math.exp(-7.0 * dt);
    sim.camX += (targetFocusX - sim.camX) * camLerp;
    sim.camY += (targetFocusY - sim.camY) * camLerp;
  } else {
    sim.camX = dims.ancho / 2;
    sim.camY = dims.alto / 2;
  }
}
