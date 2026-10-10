// draw() del original (App.tsx 4106-4352): dibuja un cuadro completo en el contexto 2D del CanvasTexture.
// La escala por devicePixelRatio (el prepareCanvas del original) la fija la escena antes de llamar.
import { PALETA_PIXEL } from '../config.js';
import {
  renderShmupSpaceBackground,
  renderEnduranceMothership,
  renderObstacles,
  renderDropItem,
  renderShmupEnemy,
  renderSleekRanger,
  renderBullet,
  renderDynamicOceanBody,
  renderSleekBeacon,
  renderSleekCase,
  renderEnhancedMegatidalWave,
  renderExpressiveAstronaut,
  renderHitMarkers,
  renderFloatingTexts,
} from './funciones.js';
import { renderBioDrone, renderTrenchLurker, renderMira } from './fauna.js';

const ETAPAS_ESPACIO = ['MISSION_2_ORBITAL_ASCENT', 'VICTORY_ENDURANCE_DOCKED', 'MISSION_TRANSITION'];

function dibujarEspacio(ctx, sim, time, canvasWidth, canvasHeight) {
  renderShmupSpaceBackground(ctx, sim.stars, sim.sector, sim.altitude, time, canvasWidth, canvasHeight);

  if (sim.enduranceDescending || sim.stage === 'VICTORY_ENDURANCE_DOCKED') {
    renderEnduranceMothership(ctx, sim.enduranceX, sim.enduranceY, sim.enduranceRot, sim.enduranceDocked ? 1.0 : sim.dockingLerp, time);
  }

  renderObstacles(ctx, sim.obstacles, time);
  for (const drop of sim.drops) renderDropItem(ctx, drop, time);
  for (const enemy of sim.enemies) renderShmupEnemy(ctx, enemy, time);

  renderSleekRanger(ctx, sim.shipX, sim.shipY, sim.shipAngle, sim.shipRoll, true, true, false, false, false, time, sim.shipShield, sim.weaponPowerLevel);

  for (const b of sim.bullets) renderBullet(ctx, b);

  for (const p of sim.particles) {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
    ctx.fill();
  }
}

function dibujarSuperficie(ctx, sim, time, canvasWidth, canvasHeight) {
  ctx.translate(Math.floor(canvasWidth / 2), Math.floor(canvasHeight / 2));
  ctx.translate(-Math.round(sim.camX), -Math.round(sim.camY));

  renderDynamicOceanBody(ctx, sim.camX, sim.camY, time, sim.ripples, sim.waterParticles);

  for (const d of sim.debris) {
    ctx.save();
    ctx.translate(d.x, d.y);
    ctx.fillStyle = PALETA_PIXEL.P11;
    ctx.beginPath();
    ctx.arc(0, 0, d.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (!sim.beaconAcquired) renderSleekBeacon(ctx, sim.beaconX, sim.beaconY, time);

  renderSleekCase(ctx, sim.caseX, sim.caseY, sim.caseAnim, sim.caseAssisting, time);
  renderEnhancedMegatidalWave(ctx, sim.waveAngle, sim.waveDistance, time);

  // El Ranger estacionado.
  renderSleekRanger(ctx, sim.shipX, sim.shipY, sim.shipAngle, 0, false, false, false, false, true, time, 100, 1);

  if (sim.shipBoardPrompt) {
    ctx.save();
    ctx.translate(sim.shipX, sim.shipY - 55);
    const bob = Math.sin(time * 6) * 4;
    ctx.fillStyle = 'rgba(7, 21, 23, 0.92)';
    ctx.strokeStyle = '#4fd0e0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-80, -18 + bob, 160, 24, 4);
    ctx.fill();
    ctx.stroke();
    ctx.font = 'bold 10px Orbitron, sans-serif';
    ctx.fillStyle = '#4fd0e0';
    ctx.textAlign = 'center';
    ctx.fillText('[E] / TAP: PILOTAR NAVE', 0, -2 + bob);
    ctx.restore();
  }

  // Fauna (nuevo): las alimanas sumergidas van bajo el astronauta; el resto, por profundidad en pantalla.
  for (const e of sim.enemies) {
    if (e.type === 'trench_lurker' && e.state === 'submerged') renderTrenchLurker(ctx, e, time);
  }
  for (const e of sim.enemies) {
    if (e.type === 'bio_drone') renderBioDrone(ctx, e, time);
    else if (e.type === 'trench_lurker' && e.state !== 'submerged') renderTrenchLurker(ctx, e, time);
  }

  for (const drop of sim.drops) renderDropItem(ctx, drop, time);

  renderExpressiveAstronaut(
    ctx,
    sim.playerX,
    sim.playerY,
    sim.playerZ,
    sim.playerFacing,
    sim.state,
    sim.aimAngle,
    sim.equippedWeapon,
    sim.shootFlashTimer,
    sim.playerHurtTimer,
    sim.playerShieldHp,
    sim.animTick,
    time,
    sim.isDying,
    Math.min(1, Math.max(0, 1 - sim.deathTimer / sim.deathMaxTimer)),
  );

  for (const b of sim.bullets) renderBullet(ctx, b);

  // La mira del autoapuntado (el original la calculaba pero no la dibujaba).
  if (sim.phase !== 'COUNTDOWN' && !sim.isDying && sim.controlMode === 'FOOT') {
    renderMira(ctx, sim.crosshairX, sim.crosshairY, sim.hasTargetLock, time);
  }
}

// azar() solo mueve el temblor de pantalla, que es puramente visual (como el Math.random del original).
export function dibujar(ctx, sim, { ancho: canvasWidth, alto: canvasHeight }, azar = Math.random) {
  const time = sim.elapsedSeconds;

  if (sim.oneFrameFlash || sim.empFlashTimer > 0) {
    ctx.fillStyle = sim.empFlashTimer > 0 ? '#a855f7' : PALETA_PIXEL.P17;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    return;
  }

  // El fondo del lienzo: el original lo dejaba en negro por CSS (bg-black).
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.save();
  if (sim.screenShake > 0.2) {
    ctx.translate((azar() * 2 - 1) * sim.screenShake, (azar() * 2 - 1) * sim.screenShake);
  }

  if (ETAPAS_ESPACIO.includes(sim.stage)) dibujarEspacio(ctx, sim, time, canvasWidth, canvasHeight);
  else dibujarSuperficie(ctx, sim, time, canvasWidth, canvasHeight);

  renderHitMarkers(ctx, sim.hitMarkers);
  renderFloatingTexts(ctx, sim.floatingTexts);
  ctx.restore();

  if (sim.redDamageVignette > 0.01) {
    const grad = ctx.createRadialGradient(canvasWidth / 2, canvasHeight / 2, canvasHeight * 0.25, canvasWidth / 2, canvasHeight / 2, canvasWidth * 0.75);
    grad.addColorStop(0, 'rgba(209, 69, 58, 0)');
    grad.addColorStop(1, `rgba(209, 69, 58, ${sim.redDamageVignette * 0.55})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }
}
