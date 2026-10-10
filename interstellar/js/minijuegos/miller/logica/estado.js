// Estado inicial de la mision: initGame del original con el azar inyectado (rng en lugar de Math.random).
// Unica diferencia: la superficie arranca sin el bio_drone invisible del original (R7 c).

export function crearSim(config, rng, { ancho, alto }) {
  const obstacleCount = config.debrisObstacleCount;
  const waveDir = Math.PI * 0.72;
  const beaconAngle = waveDir + Math.PI + (rng() * 0.5 - 0.25);
  const beaconDist = 580 + rng() * 140;
  const bX = Math.round(Math.cos(beaconAngle) * beaconDist);
  const bY = Math.round(Math.sin(beaconAngle) * beaconDist);

  const debris = [{ x: bX + 24, y: bY + 12, radius: 36, isMain: true }];
  for (let i = 0; i < obstacleCount; i++) {
    const a = rng() * Math.PI * 2;
    const d = 150 + rng() * 640;
    const dx = Math.round(Math.cos(a) * d);
    const dy = Math.round(Math.sin(a) * d);
    if (Math.hypot(dx, dy) > 120 && Math.hypot(dx - bX, dy - bY) > 90) {
      debris.push({ x: dx, y: dy, radius: 16 + rng() * 10 });
    }
  }

  const stars = [];
  for (let i = 0; i < 90; i++) {
    stars.push({
      x: rng() * ancho,
      y: rng() * alto,
      speed: 60 + rng() * 220,
      size: 1 + rng() * 2,
      color: rng() < 0.25 ? '#7ee7f8' : rng() < 0.5 ? '#efe7d6' : '#ffffff',
      alpha: 0.3 + rng() * 0.7,
    });
  }

  return {
    stage: 'MISSION_1_SURFACE',
    controlMode: 'FOOT',

    shipX: 0,
    shipY: 0,
    shipVx: 0,
    shipVy: 0,
    shipAngle: -Math.PI / 2,
    shipRoll: 0,
    shipHealth: 100,
    shipMaxHealth: 100,
    shipShield: 100,
    shipWeaponCooldown: 0,
    shipMissileCooldown: 0,
    shipBoardPrompt: false,
    shipBoardAnimTimer: 0,
    missileStock: 8,
    bombStock: 2,
    weaponPowerLevel: 1,
    combo: 0,
    comboTimer: 0,

    altitude: 0,
    targetAltitude: config.mission2TargetDistance,
    sector: 1,
    sectorName: 'SECTOR 1: TROPOSPHERE',
    scrollSpeed: 280,
    stars,
    obstacles: [],
    nextObstacleId: 1,

    bossActive: false,
    bossSpawned: false,
    bossHp: 650,
    bossMaxHp: 650,
    bossPhase: 1,

    enduranceX: ancho / 2,
    enduranceY: -280,
    enduranceRot: 0,
    enduranceDescending: false,
    enduranceDocked: false,
    dockingLerp: 0,
    transitionTimer: 0,

    playerX: 0,
    playerY: 60,
    playerZ: 0,
    playerVz: 0,
    playerVx: 0,
    playerVy: 0,
    playerFacing: 1,
    isGrounded: true,
    coyoteTimer: 0.12,
    jumpBufferTimer: 0,
    playerStunTimer: 0,
    playerHurtTimer: 0,
    playerShieldHp: 100,
    playerShieldRegenDelay: 0,
    state: 'idle',
    isDying: false,
    deathTimer: 0,
    deathMaxTimer: 1.8,
    deathReason: 'damage',
    aimAngle: 0,
    crosshairX: bX * 0.5,
    crosshairY: bY * 0.5,
    hasTargetLock: false,
    lockedEnemyId: null,
    equippedWeapon: 'pulse',
    ammoScatter: 30,
    ammoRocket: 10,
    fireCooldown: 0,
    shootFlashTimer: 0,
    slideTimer: 0,
    slideCooldown: 0,
    animTick: 0,

    enemiesDestroyed: 0,
    aerialInterceptorsDowned: 0,

    redDamageVignette: 0,
    empFlashTimer: 0,

    caseX: 120,
    caseY: -50,
    caseVx: 0,
    caseVy: 0,
    caseAnim: 'idle',
    caseAssisting: false,
    caseBoostTimer: 0,

    landerX: 0,
    landerY: 0,
    beaconX: bX,
    beaconY: bY,
    beaconAcquired: false,
    lastSonarTime: 0,

    waveAngle: waveDir,
    waveDistance: config.waveInitialDistance,
    waveSpeed: config.waveSpeedBase,

    bullets: [],
    enemies: [],
    drops: [],
    floatingTexts: [],
    hitMarkers: [],
    particles: [],
    casings: [],
    ripples: [],
    waterParticles: [],
    debris,

    enemySpawnTimer: 2.2,
    wavePatternTimer: 0,
    nextEnemyId: 2,
    nextDropId: 1,

    camX: 0,
    camY: 50,
    screenShake: 0,
    hitStopMsRemaining: 0,
    oneFrameFlash: false,

    countdownTimer: 2.5,
    phase: 'COUNTDOWN',
    banner: null,
    elapsedSeconds: 0,

    touchDir: { x: 0, y: 0, active: false },
    touchShoot: false,
    touchBomb: false,
    touchMissile: false,
    touchJump: false,
    touchSlide: false,

    // Del port: cola de sonidos para el sintetizador y fin de la partida (lo que eran los setState).
    sonidos: [],
    fin: null,
  };
}
