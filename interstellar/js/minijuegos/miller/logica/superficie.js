// Fase 1 a pie: bloque MISSION_1_SURFACE del update() original (App.tsx 3669-3933), con rng en lugar de Math.random.
// Devuelve 'muerto' si la ola alcanzo al jugador en este paso (el original hacia return).
import { ANIM, PALETA_PIXEL } from '../config.js';
import { sonar, onda, mostrarBanner } from './efectos.js';
import { matarJugador } from './danio.js';
import { TEXTOS } from './textos.js';

export function actualizarSuperficie(sim, entrada, dt, config, rng) {
  let moveX = 0;
  let moveY = 0;
  if (entrada.left) moveX -= 1;
  if (entrada.right) moveX += 1;
  if (entrada.up) moveY -= 1;
  if (entrada.down) moveY += 1;

  if (sim.touchDir.active) {
    moveX += sim.touchDir.x;
    moveY += sim.touchDir.y;
  }

  const isMoving = Math.abs(moveX) > 0.01 || Math.abs(moveY) > 0.01;
  const inputLen = Math.hypot(moveX, moveY);
  if (inputLen > 1) {
    moveX /= inputLen;
    moveY /= inputLen;
  }

  if (isMoving) {
    const targetAimAngle = Math.atan2(moveY, moveX);
    let angleDiff = targetAimAngle - sim.aimAngle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    sim.aimAngle += angleDiff * Math.min(1, 30 * dt);

    if (moveX > 0.05) sim.playerFacing = 1;
    else if (moveX < -0.05) sim.playerFacing = -1;
  }

  // Mira a 160 px; si hay un blanco a menos de 60 de la mira, se fija sobre el.
  const aimDist = 160;
  const shoulderX = sim.playerX + sim.playerFacing * 2;
  const shoulderY = sim.playerY - sim.playerZ - 6;
  let targetCrossX = shoulderX + Math.cos(sim.aimAngle) * aimDist;
  let targetCrossY = shoulderY + Math.sin(sim.aimAngle) * aimDist;

  let targetedEnemy = null;
  let minCrossDist = 60;
  for (const e of sim.enemies) {
    const eY = e.y - (e.z ?? 0);
    const d = Math.hypot(targetCrossX - e.x, targetCrossY - eY);
    if (d < minCrossDist) {
      minCrossDist = d;
      targetedEnemy = e;
    }
  }

  if (targetedEnemy) {
    sim.hasTargetLock = true;
    sim.lockedEnemyId = targetedEnemy.id;
    targetCrossX = targetedEnemy.x;
    targetCrossY = targetedEnemy.y - (targetedEnemy.z ?? 0);
    sim.aimAngle = Math.atan2(targetCrossY - shoulderY, targetCrossX - shoulderX);
  } else {
    sim.hasTargetLock = false;
    sim.lockedEnemyId = null;
  }

  sim.crosshairX = targetCrossX;
  sim.crosshairY = targetCrossY;

  const distToParkedShip = Math.hypot(sim.playerX - sim.shipX, sim.playerY - sim.shipY);
  sim.shipBoardPrompt = distToParkedShip <= config.shipBoardingRadius;

  // Coyote time y buffer de salto.
  if (sim.isGrounded) sim.coyoteTimer = 0.12;
  else sim.coyoteTimer = Math.max(0, sim.coyoteTimer - dt);

  if (sim.touchJump) sim.jumpBufferTimer = 0.14;
  else sim.jumpBufferTimer = Math.max(0, sim.jumpBufferTimer - dt);
  sim.touchJump = false;

  // Slide.
  if (sim.slideCooldown > 0) sim.slideCooldown -= dt;
  if (sim.touchSlide && sim.slideCooldown <= 0 && sim.isGrounded && sim.slideTimer <= 0) {
    sim.slideTimer = config.slideDuration;
    sim.slideCooldown = 0.7;
    sim.state = 'slide';
    sim.playerVx = sim.playerFacing * config.slideSpeed;
    sonar(sim, 'playSlideDash');
    onda(sim, sim.playerX, sim.playerY + 14, 50, 75, 'rgba(79, 208, 224, 0.8)');
  }
  sim.touchSlide = false;

  if (sim.slideTimer > 0) {
    sim.slideTimer -= dt;
    sim.playerX += sim.playerVx * dt;
    sim.playerVx *= 0.94;
  } else {
    const baseSpeed = config.playerBaseSpeed;
    const sprintSpeed = config.playerSprintSpeed;
    const accel = config.playerAcceleration;
    const drag = config.waterDragCoeff;
    const gravity = config.gravity;
    const jumpVel = config.jumpVelocity;

    if (sim.caseBoostTimer > 0) sim.caseBoostTimer -= dt;
    const effectiveMaxSpeed = sim.caseBoostTimer > 0 ? sprintSpeed : baseSpeed;

    const canJump = (sim.isGrounded || sim.coyoteTimer > 0) && sim.jumpBufferTimer > 0;
    if (canJump && sim.playerStunTimer <= 0) {
      sim.isGrounded = false;
      sim.coyoteTimer = 0;
      sim.jumpBufferTimer = 0;
      sim.playerVz = jumpVel;
      sim.state = 'jump';
      sonar(sim, 'playJumpSwoosh');
      sonar(sim, 'playWaterSplash', 1.4);
      onda(sim, sim.playerX, sim.playerY + 14, 42, 60);
    }

    if (!sim.isGrounded) {
      sim.playerVz -= gravity * dt;
      sim.playerZ += sim.playerVz * dt;
      if (sim.playerZ <= 0) {
        sim.playerZ = 0;
        sim.playerVz = 0;
        sim.isGrounded = true;
        sonar(sim, 'playWaterSplash', 1.2);
        onda(sim, sim.playerX, sim.playerY + 14, 48, 55);
      }
    }

    sim.playerVx += moveX * accel * dt;
    sim.playerVy += moveY * accel * dt;
    sim.playerVx -= sim.playerVx * drag * dt;
    sim.playerVy -= sim.playerVy * drag * dt;

    const currentSpeed = Math.hypot(sim.playerVx, sim.playerVy);
    if (currentSpeed > effectiveMaxSpeed) {
      sim.playerVx = (sim.playerVx / currentSpeed) * effectiveMaxSpeed;
      sim.playerVy = (sim.playerVy / currentSpeed) * effectiveMaxSpeed;
    }

    sim.playerX += sim.playerVx * dt;
    sim.playerY += sim.playerVy * dt;

    if (sim.playerHurtTimer > 0) {
      sim.state = 'hurt';
    } else if (!sim.isGrounded) {
      sim.state = sim.playerVz > 0 ? 'jump' : 'fall';
    } else if (currentSpeed > 30) {
      sim.state = 'run';
      if (rng() < 0.3) {
        sonar(sim, 'playWaterSplash', 0.7);
        onda(sim, sim.playerX - sim.playerFacing * 8, sim.playerY + 14, 26, 40);
      }
    } else {
      sim.state = 'idle';
    }
  }

  // Armas a pie.
  if (sim.fireCooldown > 0) sim.fireCooldown -= dt;
  if (sim.shootFlashTimer > 0) sim.shootFlashTimer -= dt;

  const isShooting = entrada.tap || entrada.pointerDown || sim.touchShoot;
  if (isShooting && sim.fireCooldown <= 0 && sim.slideTimer <= 0) {
    const angle = sim.aimAngle;
    const muzzleX = sim.playerX + sim.playerFacing * 2 + Math.cos(angle) * 22;
    const muzzleY = sim.playerY - sim.playerZ - 6 + Math.sin(angle) * 22;

    if (sim.equippedWeapon === 'pulse') {
      sim.fireCooldown = 0.12;
      sim.shootFlashTimer = 0.08;
      sonar(sim, 'playPulseCarbine');
      sim.bullets.push({
        x: muzzleX,
        y: muzzleY,
        vx: Math.cos(angle) * 880,
        vy: Math.sin(angle) * 880,
        type: 'pulse',
        damage: 26,
        life: 1.3,
        maxLife: 1.3,
      });
    }
  }

  // Baliza: sonar por distancia y recogida.
  const distToBeacon = Math.hypot(sim.playerX - sim.beaconX, sim.playerY - sim.beaconY);
  if (!sim.beaconAcquired) {
    const sonarInterval = Math.max(0.3, Math.min(1.8, distToBeacon / 480));
    if (sim.elapsedSeconds - sim.lastSonarTime >= sonarInterval) {
      sim.lastSonarTime = sim.elapsedSeconds;
      sonar(sim, 'playBeaconSonar', Math.min(2.0, Math.max(0.8, 1.8 - distToBeacon / 600)));
    }

    if (distToBeacon <= config.beaconPickupRadius) {
      sim.beaconAcquired = true;
      sim.phase = 'RETRIEVED';
      sim.waveSpeed = config.waveSpeedFlight;
      sim.screenShake = ANIM.shake.fuerte * 2;
      sonar(sim, 'playBeaconAcquired');
      mostrarBanner(sim, TEXTOS.baliza[0], TEXTOS.baliza[1], PALETA_PIXEL.P13, 2.5, true);
    }
  }

  // CASE: impulso al alcanzarlo y despues sigue al jugador.
  const distToCase = Math.hypot(sim.playerX - sim.caseX, sim.playerY - sim.caseY);
  if (distToCase < config.caseTriggerRadius && sim.caseBoostTimer <= 0) {
    sim.caseAssisting = true;
    sim.caseBoostTimer = 2.5;
    sonar(sim, 'playCaseBoost');
  }

  if (sim.caseAssisting) {
    const followX = sim.playerX - 42;
    const followY = sim.playerY - 8;
    sim.caseVx += (followX - sim.caseX) * 9 * dt;
    sim.caseVy += (followY - sim.caseY) * 9 * dt;
    sim.caseVx *= 0.88;
    sim.caseVy *= 0.88;
    sim.caseX += sim.caseVx * dt;
    sim.caseY += sim.caseVy * dt;
    sim.caseAnim = Math.hypot(sim.caseVx, sim.caseVy) > 35 ? 'roll' : 'idle';
  }

  // La ola avanza en diagonal; la distancia se mide sobre su direccion.
  sim.waveDistance -= sim.waveSpeed * dt;
  const waveDirX = Math.cos(sim.waveAngle);
  const waveDirY = Math.sin(sim.waveAngle);
  const playerProj = sim.playerX * waveDirX + sim.playerY * waveDirY;
  const distWaveToPlayer = sim.waveDistance - playerProj;

  const waveProximity = Math.max(0, 1 - distWaveToPlayer / 750);
  sonar(sim, 'updateWaveRumble', waveProximity);

  if (distWaveToPlayer <= -30 && !sim.isDying) {
    matarJugador(sim, 'wave', rng);
    return 'muerto';
  }
  return undefined;
}
