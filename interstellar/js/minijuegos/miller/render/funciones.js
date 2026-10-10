// Funciones de dibujo del prototipo del Playground (App.tsx, "PROCEDURAL CANVAS RENDERING FUNCTIONS"),
// pasadas de TypeScript a JavaScript quitando solo los tipos (research R3). La logica de dibujo no se toco.
import { PALETA_PIXEL } from '../config.js';

/**
 * VERTICAL SHMUP COSMIC SKY & SPEED SCROLLING STARFIELD
 */
export function renderShmupSpaceBackground(
  ctx,
  stars,
  sector,
  altitude,
  time,
  canvasWidth,
  canvasHeight,
) {
  ctx.save();
  // Deep space background gradient reflecting altitude
  const skyGrad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  if (sector >= 5) {
    skyGrad.addColorStop(0, '#020308');
    skyGrad.addColorStop(0.5, '#050713');
    skyGrad.addColorStop(1, '#080c1e');
  } else if (sector >= 3) {
    skyGrad.addColorStop(0, '#040714');
    skyGrad.addColorStop(0.5, '#091024');
    skyGrad.addColorStop(1, '#0e1832');
  } else {
    skyGrad.addColorStop(0, '#0a1020');
    skyGrad.addColorStop(0.5, '#0e1a2e');
    skyGrad.addColorStop(1, '#16283d');
  }
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Parallax Nebula Clouds
  ctx.save();
  const neb1Y = (time * 45) % (canvasHeight + 400) - 200;
  const nebGrad = ctx.createRadialGradient(canvasWidth * 0.3, neb1Y, 40, canvasWidth * 0.3, neb1Y, 320);
  nebGrad.addColorStop(0, sector >= 4 ? 'rgba(168, 85, 247, 0.12)' : 'rgba(79, 208, 224, 0.1)');
  nebGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = nebGrad;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const neb2Y = (time * 65 + 300) % (canvasHeight + 400) - 200;
  const nebGrad2 = ctx.createRadialGradient(canvasWidth * 0.75, neb2Y, 30, canvasWidth * 0.75, neb2Y, 280);
  nebGrad2.addColorStop(0, 'rgba(232, 128, 59, 0.09)');
  nebGrad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = nebGrad2;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.restore();

  // Scrolling Stars & Warp Streaks
  for (const s of stars) {
    ctx.fillStyle = s.color;
    ctx.globalAlpha = s.alpha;

    if (s.speed > 160) {
      // Warp speed lines
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x, s.y + s.speed * 0.08);
      ctx.lineWidth = s.size;
      ctx.strokeStyle = s.color;
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1.0;

  // Gargantua Accretion Disk in Upper Space (Sectors 3 to 5)
  if (sector >= 2) {
    ctx.save();
    const gAlpha = Math.min(1.0, (altitude - 2000) / 4000);
    ctx.globalAlpha = gAlpha;
    const gX = canvasWidth * 0.82;
    const gY = 110;
    ctx.translate(gX, gY);

    const haloGrad = ctx.createRadialGradient(0, 0, 15, 0, 0, 110);
    haloGrad.addColorStop(0, 'rgba(247, 169, 82, 0.35)');
    haloGrad.addColorStop(0.5, 'rgba(232, 128, 59, 0.15)');
    haloGrad.addColorStop(1, 'rgba(10, 14, 26, 0)');
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 110, 0, Math.PI * 2);
    ctx.fill();

    // Accretion light lens
    ctx.strokeStyle = PALETA_PIXEL.P13;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(0, -3, 50, 40, 0, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();

    // Equatorial Disk
    ctx.save();
    ctx.scale(1, 0.28);
    const diskGrad = ctx.createRadialGradient(0, 0, 20, 0, 0, 85);
    diskGrad.addColorStop(0, '#ffffff');
    diskGrad.addColorStop(0.25, PALETA_PIXEL.P14);
    diskGrad.addColorStop(0.7, PALETA_PIXEL.P13);
    diskGrad.addColorStop(1, 'rgba(232, 128, 59, 0)');
    ctx.fillStyle = diskGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 85, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Event horizon core
    ctx.fillStyle = '#020306';
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#fff6e0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 22.5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  ctx.restore();
}

/**
 * GRAND ENDURANCE MOTHERSHIP (ORBITAL FINALE ARRIVAL)
 */
export function renderEnduranceMothership(
  ctx,
  x,
  y,
  rotAngle,
  dockingProgress,
  time,
) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.rotate(rotAngle);

  const radius = 150;
  const numModules = 12;

  // 1. Tractor Docking Guide Cone (Active pulsing glow)
  ctx.save();
  const pulse = 0.6 + Math.sin(time * 6) * 0.3;
  const tractorGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, radius + 110);
  tractorGrad.addColorStop(0, `rgba(79, 208, 224, ${0.5 * pulse})`);
  tractorGrad.addColorStop(0.5, `rgba(126, 231, 248, ${0.25 * pulse})`);
  tractorGrad.addColorStop(1, 'rgba(10, 14, 26, 0)');
  ctx.fillStyle = tractorGrad;
  ctx.beginPath();
  ctx.arc(0, 0, radius + 110, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Outer Ring Truss Framework
  ctx.strokeStyle = PALETA_PIXEL.P11;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = PALETA_PIXEL.P9;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  // 3. Spokes to Central Hub
  for (let i = 0; i < 4; i++) {
    const spokeAngle = (Math.PI / 2) * i;
    ctx.strokeStyle = PALETA_PIXEL.P10;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(spokeAngle) * radius, Math.sin(spokeAngle) * radius);
    ctx.stroke();

    ctx.strokeStyle = PALETA_PIXEL.P8;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(spokeAngle) * radius, Math.sin(spokeAngle) * radius);
    ctx.stroke();
  }

  // 4. Central Docking Hub & Airlock Rings
  ctx.fillStyle = PALETA_PIXEL.P12;
  ctx.beginPath();
  ctx.arc(0, 0, 40, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = PALETA_PIXEL.P8;
  ctx.beginPath();
  ctx.arc(0, 0, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETA_PIXEL.P11;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Docking Clamp Aperture Glow
  ctx.fillStyle = '#06131c';
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = PALETA_PIXEL.P18;
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // 5. Twelve Modular Perimeter Pods
  for (let i = 0; i < numModules; i++) {
    const angle = (Math.PI * 2 * i) / numModules;
    const px = Math.cos(angle) * radius;
    const py = Math.sin(angle) * radius;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle + Math.PI / 2);

    ctx.fillStyle = PALETA_PIXEL.P8;
    ctx.beginPath();
    ctx.roundRect(-16, -12, 32, 24, 3);
    ctx.fill();
    ctx.strokeStyle = PALETA_PIXEL.P11;
    ctx.lineWidth = 1.4;
    ctx.stroke();

    ctx.fillStyle = PALETA_PIXEL.P12;
    ctx.fillRect(-11, -10, 22, 4);

    const isLit = (i + Math.floor(time * 4)) % 3 === 0;
    ctx.fillStyle = isLit ? PALETA_PIXEL.P18 : PALETA_PIXEL.P13;
    ctx.beginPath();
    ctx.arc(0, 5, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 6. Docking Alignment Ring HUD
  ctx.strokeStyle = 'rgba(79, 208, 224, 0.9)';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.arc(0, 0, radius + 36, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.restore();
}

/**
 * SHMUP & GALAGA STYLE ENEMY RENDERING
 */
export function renderShmupEnemy(ctx, enemy, time) {
  ctx.save();
  ctx.translate(Math.round(enemy.x), Math.round(enemy.y));

  const isFlash = enemy.flashTimer > 0;
  const angle = enemy.angle !== undefined ? enemy.angle : Math.atan2(enemy.vy, enemy.vx);

  if (enemy.type === 'dreadnought_boss') {
    // Flagship Dreadnought Boss (Sector 5 Finale)
    const hpPct = Math.max(0, enemy.hp / enemy.maxHp);
    const bossFlash = isFlash || enemy.state === 'boss_defeated';

    // Outer Heavy Wings
    ctx.fillStyle = bossFlash ? '#ffffff' : '#181b24';
    ctx.beginPath();
    ctx.moveTo(0, 55);
    ctx.lineTo(85, -20);
    ctx.lineTo(110, -50);
    ctx.lineTo(60, -60);
    ctx.lineTo(0, -45);
    ctx.lineTo(-60, -60);
    ctx.lineTo(-110, -50);
    ctx.lineTo(-85, -20);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = PALETA_PIXEL.P15;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Armor Plates
    ctx.fillStyle = bossFlash ? '#ffcccc' : '#2b1b22';
    ctx.beginPath();
    ctx.moveTo(0, 45);
    ctx.lineTo(65, -15);
    ctx.lineTo(40, -40);
    ctx.lineTo(-40, -40);
    ctx.lineTo(-65, -15);
    ctx.closePath();
    ctx.fill();

    // Twin Rotating Plasma Cannons
    const turretRot = time * 3;
    [-45, 45].forEach((tx) => {
      ctx.save();
      ctx.translate(tx, 5);
      ctx.rotate(turretRot);
      ctx.fillStyle = '#d0453a';
      ctx.fillRect(-6, -6, 12, 12);
      ctx.fillStyle = '#ff7766';
      ctx.fillRect(-2, -14, 4, 16);
      ctx.restore();
    });

    // Central Core Eye (Glows red/purple)
    const corePulse = 0.7 + Math.sin(time * 8) * 0.3;
    ctx.fillStyle = `rgba(232, 75, 50, ${corePulse})`;
    ctx.beginPath();
    ctx.arc(0, -10, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -10, 7, 0, Math.PI * 2);
    ctx.fill();

    // Shield Aura if above 50% HP
    if (hpPct > 0.5) {
      ctx.strokeStyle = `rgba(168, 85, 247, ${0.4 + Math.sin(time * 6) * 0.25})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 105, 0, Math.PI * 2);
      ctx.stroke();
    }

  } else if (enemy.type === 'galaga_striker') {
    // Galaxian/Galaga style Striker Hornet
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillStyle = isFlash ? '#ffffff' : '#e8803b';
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(16, 12);
    ctx.lineTo(0, 6);
    ctx.lineTo(-16, 12);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#d0453a';
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(10, 8);
    ctx.lineTo(0, 3);
    ctx.lineTo(-10, 8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#f7a952';
    ctx.beginPath();
    ctx.arc(0, -4, 4, 0, Math.PI * 2);
    ctx.fill();

  } else if (enemy.type === 'armored_gunship') {
    // Heavy Armored Cruiser
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillStyle = isFlash ? '#ffffff' : PALETA_PIXEL.P12;
    ctx.beginPath();
    ctx.roundRect(-24, -18, 48, 36, 6);
    ctx.fill();
    ctx.strokeStyle = PALETA_PIXEL.P15;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = PALETA_PIXEL.P15;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();

    [-18, 18].forEach((tx) => {
      ctx.fillStyle = PALETA_PIXEL.P13;
      ctx.fillRect(tx - 3, -14, 6, 28);
    });

  } else if (enemy.type === 'cargo_drone') {
    // Cargo Drone (Drops high-tier powerups)
    ctx.fillStyle = isFlash ? '#ffffff' : '#22c55e';
    ctx.beginPath();
    ctx.roundRect(-16, -16, 32, 32, 6);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cross symbol
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-4, -10, 8, 20);
    ctx.fillRect(-10, -4, 20, 8);

  } else {
    // Fast Scout Drone
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillStyle = isFlash ? '#ffffff' : '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.lineTo(12, 10);
    ctx.lineTo(0, 5);
    ctx.lineTo(-12, 10);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -2, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Health bar (except for dreadnought which gets top screen boss bar)
  if (enemy.type !== 'dreadnought_boss' && enemy.hp < enemy.maxHp) {
    const hpPct = Math.max(0, enemy.hp / enemy.maxHp);
    const barW = enemy.type === 'armored_gunship' ? 38 : 22;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(-barW / 2, -26, barW, 4);
    ctx.fillStyle = enemy.type === 'armored_gunship' ? '#e8803b' : '#d0453a';
    ctx.fillRect(-barW / 2, -26, barW * hpPct, 4);
  }

  ctx.restore();
}

/**
 * HIGH-DEFINITION INTERSTELLAR RANGER SPACESHIP (Vertical Shmup / Surface)
 */
export function renderSleekRanger(
  ctx,
  x,
  y,
  angle,
  roll,
  isPiloted,
  isThrusting,
  isBoosting,
  isBraking,
  isLanded,
  time,
  shields = 100,
  weaponLevel = 1,
) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));

  // Dynamic Ocean Shadow when landed on surface
  if (isLanded) {
    ctx.save();
    ctx.translate(0, 16);
    ctx.fillStyle = 'rgba(10, 14, 26, 0.65)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 62, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Rotate & banking animation
  ctx.rotate(angle + Math.PI / 2);
  ctx.scale(1 - Math.abs(roll) * 0.18, 1);
  ctx.rotate(roll * 0.14);

  // Thruster Flames
  const engineFiring = isThrusting || isBoosting || isPiloted;
  if (engineFiring) {
    const boostMultiplier = isBoosting ? 2.4 : isThrusting ? 1.4 : 1.0;
    const flameLength = (28 + Math.random() * 16) * boostMultiplier;
    const flickerW = (3 + Math.random() * 4) * (isBoosting ? 1.5 : 1);

    [-22, 22].forEach((nx) => {
      const gradOuter = ctx.createLinearGradient(nx, 24, nx, 24 + flameLength);
      gradOuter.addColorStop(0, isBoosting ? '#4fd0e0' : PALETA_PIXEL.P13);
      gradOuter.addColorStop(0.4, isBoosting ? '#7ee7f8' : PALETA_PIXEL.P14);
      gradOuter.addColorStop(1, 'rgba(232, 128, 59, 0)');

      ctx.fillStyle = gradOuter;
      ctx.beginPath();
      ctx.moveTo(nx - 10 - flickerW, 24);
      ctx.lineTo(nx + 10 + flickerW, 24);
      ctx.lineTo(nx, 24 + flameLength);
      ctx.closePath();
      ctx.fill();

      const gradCore = ctx.createLinearGradient(nx, 24, nx, 24 + flameLength * 0.6);
      gradCore.addColorStop(0, '#ffffff');
      gradCore.addColorStop(0.5, isBoosting ? '#ffffff' : '#7ee7f8');
      gradCore.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = gradCore;
      ctx.beginPath();
      ctx.moveTo(nx - 4, 24);
      ctx.lineTo(nx + 4, 24);
      ctx.lineTo(nx, 24 + flameLength * 0.6);
      ctx.closePath();
      ctx.fill();
    });
  }

  // Landing Gear Struts when landed
  if (isLanded) {
    ctx.strokeStyle = PALETA_PIXEL.P11;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-45, 12);
    ctx.lineTo(-54, 25);
    ctx.lineTo(-60, 26);
    ctx.moveTo(45, 12);
    ctx.lineTo(54, 25);
    ctx.lineTo(60, 26);
    ctx.stroke();
  }

  // Main Delta Hull Chassis
  ctx.fillStyle = PALETA_PIXEL.P12;
  ctx.beginPath();
  ctx.moveTo(0, -56);
  ctx.lineTo(26, -24);
  ctx.lineTo(68, 14);
  ctx.lineTo(64, 24);
  ctx.lineTo(34, 24);
  ctx.lineTo(32, 26);
  ctx.lineTo(16, 26);
  ctx.lineTo(14, 20);
  ctx.lineTo(-14, 20);
  ctx.lineTo(-16, 26);
  ctx.lineTo(-32, 26);
  ctx.lineTo(-34, 24);
  ctx.lineTo(-64, 24);
  ctx.lineTo(-68, 14);
  ctx.lineTo(-26, -24);
  ctx.closePath();
  ctx.fill();

  // Ceramic Hull (High contrast white / cream)
  const hullGrad = ctx.createLinearGradient(0, -50, 0, 22);
  hullGrad.addColorStop(0, '#ffffff');
  hullGrad.addColorStop(0.6, PALETA_PIXEL.P8);
  hullGrad.addColorStop(1, PALETA_PIXEL.P9);

  ctx.fillStyle = hullGrad;
  ctx.beginPath();
  ctx.moveTo(0, -52);
  ctx.lineTo(22, -22);
  ctx.lineTo(60, 12);
  ctx.lineTo(56, 20);
  ctx.lineTo(30, 20);
  ctx.lineTo(12, 16);
  ctx.lineTo(-12, 16);
  ctx.lineTo(-30, 20);
  ctx.lineTo(-56, 20);
  ctx.lineTo(-60, 12);
  ctx.lineTo(-22, -22);
  ctx.closePath();
  ctx.fill();

  // Hull Panel Seams
  ctx.strokeStyle = PALETA_PIXEL.P10;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-18, -10);
  ctx.lineTo(-48, 14);
  ctx.moveTo(18, -10);
  ctx.lineTo(48, 14);
  ctx.stroke();

  // Weapon Upgrade Visuals (Twin / Triple / Quad blasters)
  ctx.fillStyle = PALETA_PIXEL.P11;
  ctx.fillRect(-52, 2, 8, 16);
  ctx.fillRect(44, 2, 8, 16);
  ctx.fillStyle = weaponLevel >= 3 ? '#a855f7' : PALETA_PIXEL.P18;
  ctx.fillRect(-50, -2, 4, 6);
  ctx.fillRect(46, -2, 4, 6);

  if (weaponLevel >= 2) {
    // Center heavy plasma conduit
    ctx.fillStyle = '#e8803b';
    ctx.fillRect(-4, -48, 8, 10);
  }

  // Wingtip Navigation LEDs
  const strobe = Math.floor(time * 6) % 2 === 0;
  ctx.fillStyle = strobe ? '#ff3b30' : '#881111';
  ctx.beginPath();
  ctx.arc(-62, 18, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = strobe ? '#34c759' : '#116622';
  ctx.beginPath();
  ctx.arc(62, 18, 3, 0, Math.PI * 2);
  ctx.fill();

  // Cockpit Canopy Glass
  ctx.fillStyle = isPiloted ? '#041520' : PALETA_PIXEL.P1;
  ctx.beginPath();
  ctx.moveTo(0, -42);
  ctx.lineTo(9, -28);
  ctx.lineTo(7, -14);
  ctx.lineTo(-7, -14);
  ctx.lineTo(-9, -28);
  ctx.closePath();
  ctx.fill();

  if (isPiloted) {
    ctx.fillStyle = PALETA_PIXEL.P18;
    ctx.beginPath();
    ctx.arc(0, -26, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -26, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Shield Glow Ring
  if (shields > 10) {
    const shieldAlpha = Math.min(0.5, (shields / 100) * 0.45);
    ctx.strokeStyle = `rgba(79, 208, 224, ${shieldAlpha})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, -8, 72, 54, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * HIGH-DEFINITION RUN-AND-GUN ASTRONAUT
 */
export function renderExpressiveAstronaut(
  ctx,
  x,
  y,
  z,
  facing,
  state,
  aimAngle,
  weapon,
  shootFlashTimer,
  hurtTimer,
  shieldHp,
  animTick,
  time,
  isDying = false,
  deathProgress = 0,
) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y - z));

  if (isDying) {
    ctx.scale(facing, 1);
    const impactFlinch = deathProgress < 0.25 ? Math.sin((deathProgress / 0.25) * Math.PI) * 6 : 0;
    const easeProgress = Math.min(1, Math.max(0, (deathProgress - 0.15) * 1.35));
    const fallAngle = easeProgress * (Math.PI * 0.46);
    const bounceOffset = deathProgress > 0.65 ? Math.sin((deathProgress - 0.65) * Math.PI * 3) * 2.5 : 0;
    const collapseY = easeProgress * 15 + bounceOffset;

    ctx.fillStyle = `rgba(209, 69, 58, ${Math.max(0, 0.65 - deathProgress * 0.35)})`;
    ctx.beginPath();
    ctx.ellipse(-easeProgress * 6, 18 + collapseY * 0.2, 18 + deathProgress * 24, 6 + deathProgress * 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(-impactFlinch - easeProgress * 12, collapseY);
    ctx.rotate(-fallAngle);

    const isFatalHitStrobe = deathProgress < 0.3 && Math.floor(time * 30) % 2 === 0;
    const suitHullColor = isFatalHitStrobe
      ? '#ffffff'
      : deathProgress > 0.5
      ? PALETA_PIXEL.P10
      : PALETA_PIXEL.P9;

    ctx.fillStyle = PALETA_PIXEL.P12;
    ctx.beginPath();
    ctx.roundRect(-16, -20, 8, 22, 2);
    ctx.fill();

    ctx.fillStyle = suitHullColor;
    ctx.beginPath();
    ctx.roundRect(-8, -10, 16, 18, 3);
    ctx.fill();

    ctx.fillStyle = suitHullColor;
    ctx.beginPath();
    ctx.arc(0, -18, 9.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = deathProgress < 0.35 ? PALETA_PIXEL.P15 : '#0a0d14';
    ctx.beginPath();
    ctx.ellipse(3, -18, 5.5, 4.5, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    return;
  }

  ctx.scale(facing, 1);

  // Water Shadow
  ctx.fillStyle = 'rgba(10, 14, 26, 0.65)';
  ctx.beginPath();
  const shadowScale = Math.max(0.4, 1 - z / 120);
  ctx.ellipse(0, 20 + z * 0.15, 16 * shadowScale, 5 * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();

  const isHurt = hurtTimer > 0;
  if (isHurt) {
    const flinchAngle = Math.sin(hurtTimer * 30) * 0.12;
    ctx.rotate(-flinchAngle);
    if (Math.floor(time * 35) % 2 === 0) {
      ctx.fillStyle = 'rgba(232, 75, 50, 0.55)';
      ctx.beginPath();
      ctx.arc(0, -6, 24, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  let bodyBob = 0;
  let torsoLean = 0;
  let leftLegAngle = 0;
  let rightLegAngle = 0;

  if (state === 'slide') {
    ctx.rotate(0.25);
    ctx.translate(0, 8);
    ctx.fillStyle = PALETA_PIXEL.P7;
    ctx.beginPath();
    ctx.ellipse(-14, 12, 16, 6, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETA_PIXEL.P9;
    ctx.fillRect(-12, 4, 18, 6);
    ctx.fillStyle = PALETA_PIXEL.P8;
    ctx.beginPath();
    ctx.roundRect(-10, -8, 18, 13, 3);
    ctx.fill();
    ctx.fillStyle = PALETA_PIXEL.P8;
    ctx.beginPath();
    ctx.arc(-2, -14, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETA_PIXEL.P13;
    ctx.beginPath();
    ctx.ellipse(3, -14, 5, 4.5, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (state === 'run') {
    const cycle = (animTick * 14) % (Math.PI * 2);
    leftLegAngle = Math.sin(cycle) * 0.75;
    rightLegAngle = -Math.sin(cycle) * 0.75;
    bodyBob = Math.abs(Math.sin(cycle * 2)) * 3;
    torsoLean = 0.12;
  } else if (state === 'jump' || state === 'fall') {
    torsoLean = state === 'jump' ? -0.1 : 0.08;
    leftLegAngle = 0.35;
    rightLegAngle = -0.45;
    bodyBob = -2;
  } else {
    bodyBob = Math.sin(time * 3) * 1.5;
  }

  // PLSS Backpack
  ctx.fillStyle = PALETA_PIXEL.P10;
  ctx.beginPath();
  ctx.roundRect(-14, -22 + bodyBob, 8, 22, 2);
  ctx.fill();
  ctx.fillStyle = PALETA_PIXEL.P8;
  ctx.fillRect(-13, -20 + bodyBob, 6, 18);

  // Legs
  ctx.save();
  ctx.translate(-3, 2 + bodyBob);
  ctx.rotate(leftLegAngle);
  ctx.fillStyle = PALETA_PIXEL.P9;
  ctx.fillRect(-3, 0, 5, 10);
  ctx.fillStyle = PALETA_PIXEL.P11;
  ctx.fillRect(-5, 9, 8, 5);
  ctx.restore();

  ctx.save();
  ctx.translate(4, 2 + bodyBob);
  ctx.rotate(rightLegAngle);
  ctx.fillStyle = PALETA_PIXEL.P8;
  ctx.fillRect(-3, 0, 5, 10);
  ctx.fillStyle = PALETA_PIXEL.P11;
  ctx.fillRect(-5, 9, 8, 5);
  ctx.restore();

  // Torso
  ctx.save();
  ctx.translate(0, -6 + bodyBob);
  ctx.rotate(torsoLean);
  ctx.fillStyle = PALETA_PIXEL.P8;
  ctx.beginPath();
  ctx.roundRect(-7, -10, 15, 19, 3);
  ctx.fill();

  // Helmet & Visor
  ctx.fillStyle = PALETA_PIXEL.P8;
  ctx.beginPath();
  ctx.arc(0, -18, 9.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETA_PIXEL.P13;
  ctx.beginPath();
  ctx.ellipse(3.5, -18, 5.5, 5, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Weapon Aim Arm
  let localArmAngle = facing === 1 ? aimAngle : Math.PI - aimAngle;
  while (localArmAngle > Math.PI) localArmAngle -= Math.PI * 2;
  while (localArmAngle < -Math.PI) localArmAngle += Math.PI * 2;
  localArmAngle = Math.max(-Math.PI * 0.48, Math.min(Math.PI * 0.45, localArmAngle));

  ctx.save();
  ctx.translate(2, -6);
  ctx.rotate(localArmAngle);
  ctx.fillStyle = PALETA_PIXEL.P8;
  ctx.fillRect(-2, -3, 8, 6);
  ctx.fillStyle = PALETA_PIXEL.P12;
  ctx.fillRect(2, -4, 18, 7);
  ctx.fillStyle = PALETA_PIXEL.P18;
  ctx.fillRect(8, -3, 6, 3);

  if (shootFlashTimer > 0) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(24, 0, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.restore(); // Torso
  ctx.restore(); // Main transform
}

/**
 * BULLETS & MISSILES
 */
export function renderBullet(ctx, b) {
  ctx.save();
  ctx.translate(Math.round(b.x), Math.round(b.y));
  const angle = Math.atan2(b.vy, b.vx);
  ctx.rotate(angle);

  if (b.type === 'ship_cannon') {
    ctx.fillStyle = PALETA_PIXEL.P19;
    ctx.beginPath();
    ctx.roundRect(-22, -5, 44, 10, 4);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-14, -2.5, 28, 5);
  } else if (b.type === 'homing_missile') {
    ctx.fillStyle = PALETA_PIXEL.P11;
    ctx.fillRect(-14, -4.5, 22, 9);
    ctx.fillStyle = PALETA_PIXEL.P15;
    ctx.beginPath();
    ctx.moveTo(8, -4.5);
    ctx.lineTo(15, 0);
    ctx.lineTo(8, 4.5);
    ctx.closePath();
    ctx.fill();
    // Flame trail
    ctx.fillStyle = PALETA_PIXEL.P14;
    ctx.beginPath();
    ctx.moveTo(-14, -3);
    ctx.lineTo(-24 - Math.random() * 10, 0);
    ctx.lineTo(-14, 3);
    ctx.closePath();
    ctx.fill();
  } else if (b.isEnemy) {
    // High visibility glowing enemy plasma orbs
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = PALETA_PIXEL.P18;
    ctx.beginPath();
    ctx.roundRect(-10, -3, 20, 6, 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * HIT MARKERS & FLOATING TEXTS
 */
export function renderHitMarkers(ctx, markers) {
  for (const hm of markers) {
    ctx.save();
    ctx.translate(Math.round(hm.x), Math.round(hm.y));
    const prog = hm.life / hm.maxLife;
    ctx.strokeStyle = hm.isCrit ? '#ff3b30' : '#4fd0e0';
    ctx.lineWidth = 2.0;
    ctx.globalAlpha = Math.max(0, prog);

    const s = 7 + (1 - prog) * 4;
    ctx.beginPath();
    ctx.moveTo(-s, -s);
    ctx.lineTo(s, s);
    ctx.moveTo(s, -s);
    ctx.lineTo(-s, s);
    ctx.stroke();

    ctx.restore();
  }
}

export function renderFloatingTexts(ctx, texts) {
  for (const ft of texts) {
    ctx.save();
    const prog = ft.life / ft.maxLife;
    ctx.globalAlpha = Math.max(0, prog);
    ctx.fillStyle = ft.color;
    ctx.font = ft.isCrit ? 'bold 13px Orbitron, sans-serif' : 'bold 11px Share Tech Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, Math.round(ft.x), Math.round(ft.y));
    ctx.restore();
  }
}

/**
 * POWER-UPS & ITEM DROPS
 */
export function renderDropItem(ctx, drop, time) {
  ctx.save();
  ctx.translate(Math.round(drop.x), Math.round(drop.y));
  const bob = Math.sin(time * 5 + drop.id) * 3;

  if (drop.type === 'weapon_upgrade') {
    // Glowing weapon capsule (Dual -> Triple -> Quad)
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.roundRect(-10, -10 + bob, 20, 20, 4);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = 'bold 10px Orbitron, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('P', 0, 4 + bob);

  } else if (drop.type === 'emp_bomb') {
    ctx.fillStyle = '#e8803b';
    ctx.beginPath();
    ctx.arc(0, bob, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = 'bold 10px Orbitron, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('B', 0, 4 + bob);

  } else if (drop.type === 'energy_cell') {
    ctx.fillStyle = PALETA_PIXEL.P18;
    ctx.beginPath();
    ctx.roundRect(-8, -10 + bob, 16, 20, 3);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-5, -7 + bob, 10, 4);

  } else if (drop.type === 'missile_pod') {
    ctx.fillStyle = PALETA_PIXEL.P15;
    ctx.beginPath();
    ctx.roundRect(-8, -8 + bob, 16, 16, 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-5, -5 + bob, 10, 3);
  }

  ctx.restore();
}

/**
 * OCEAN WATER ENVIRONMENT (MISSION 1)
 */
export function renderDynamicOceanBody(
  ctx,
  camX,
  camY,
  time,
  ripples,
  waterParticles,
) {
  ctx.save();
  const oceanGrad = ctx.createRadialGradient(camX, camY, 150, camX, camY, 1800);
  oceanGrad.addColorStop(0, '#153246');
  oceanGrad.addColorStop(0.35, '#0e2333');
  oceanGrad.addColorStop(0.75, '#0a1724');
  oceanGrad.addColorStop(1, '#060c14');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(camX - 2200, camY - 2200, 4400, 4400);

  // Caustics
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let cy = camY - 1000; cy <= camY + 1000; cy += 80) {
    ctx.beginPath();
    let first = true;
    for (let cx = camX - 1200; cx <= camX + 1200; cx += 50) {
      const wave1 = Math.sin(cx * 0.012 + cy * 0.008 + time * 2.2) * 14;
      const wave2 = Math.cos(cx * 0.024 - cy * 0.016 + time * 1.6) * 8;
      const py = cy + wave1 + wave2;
      if (first) {
        ctx.moveTo(cx, py);
        first = false;
      } else {
        ctx.lineTo(cx, py);
      }
    }
    ctx.strokeStyle = 'rgba(79, 208, 224, 0.12)';
    ctx.lineWidth = 2.0;
    ctx.stroke();
  }
  ctx.restore();

  // Ripples
  for (const rip of ripples) {
    ctx.save();
    const progress = rip.radius / rip.maxRadius;
    const ripAlpha = Math.max(0, (1 - progress) * rip.alpha);
    ctx.strokeStyle = rip.color;
    ctx.globalAlpha = ripAlpha;
    ctx.lineWidth = Math.max(1, 2.5 * (1 - progress * 0.6));
    ctx.beginPath();
    ctx.ellipse(rip.x, rip.y, rip.radius, rip.radius * 0.35, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

/**
 * 1,000M MEGATIDAL WAVE (MISSION 1)
 */
export function renderEnhancedMegatidalWave(
  ctx,
  waveAngle,
  waveDistance,
  time,
) {
  ctx.save();
  const waveDirX = Math.cos(waveAngle);
  const waveDirY = Math.sin(waveAngle);
  const perpX = -waveDirY;
  const perpY = waveDirX;

  const waveSpan = 2200;
  const wallDepth = 600;
  const crestCenter = {
    x: waveDirX * waveDistance,
    y: waveDirY * waveDistance,
  };

  const getCrestOffset = (s) => {
    return (
      Math.sin(s * 0.005 + time * 2.8) * 22 +
      Math.cos(s * 0.012 - time * 3.5) * 12 +
      Math.sin(s * 0.028 + time * 5.2) * 6
);
  };

  const undertowGrad = ctx.createLinearGradient(
    crestCenter.x,
    crestCenter.y,
    crestCenter.x + waveDirX * wallDepth,
    crestCenter.y + waveDirY * wallDepth,
);
  undertowGrad.addColorStop(0, '#1a3344');
  undertowGrad.addColorStop(0.2, '#122533');
  undertowGrad.addColorStop(0.55, '#0a141e');
  undertowGrad.addColorStop(1, '#020407');

  ctx.fillStyle = undertowGrad;
  ctx.beginPath();
  const segments = 50;
  const step = (waveSpan * 2) / segments;

  for (let i = -segments / 2; i <= segments / 2; i++) {
    const s = i * step;
    const offset = getCrestOffset(s);
    const px = crestCenter.x + perpX * s + waveDirX * offset;
    const py = crestCenter.y + perpY * s + waveDirY * offset;
    if (i === -segments / 2) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }

  ctx.lineTo(crestCenter.x - perpX * waveSpan + waveDirX * wallDepth, crestCenter.y - perpY * waveSpan + waveDirY * wallDepth);
  ctx.lineTo(crestCenter.x + perpX * waveSpan + waveDirX * wallDepth, crestCenter.y + perpY * waveSpan + waveDirY * wallDepth);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * CASE COMPANION
 */
export function renderSleekCase(
  ctx,
  x,
  y,
  anim,
  isAssisting,
  time,
) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));

  ctx.fillStyle = 'rgba(10, 14, 26, 0.6)';
  ctx.beginPath();
  ctx.ellipse(0, 18, 16, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  if (anim === 'roll') {
    ctx.rotate(time * 9);
    for (let i = 0; i < 4; i++) {
      ctx.rotate((Math.PI / 2) * i);
      ctx.fillStyle = i % 2 === 0 ? PALETA_PIXEL.P9 : PALETA_PIXEL.P10;
      ctx.fillRect(-4, -24, 8, 24);
    }
  } else {
    ctx.fillStyle = PALETA_PIXEL.P8;
    ctx.beginPath();
    ctx.roundRect(-10, -24, 20, 40, 2);
    ctx.fill();
    ctx.strokeStyle = PALETA_PIXEL.P12;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = PALETA_PIXEL.P12;
    ctx.fillRect(-3, -9, 6, 3);
    ctx.fillStyle = isAssisting ? '#7ee7f8' : PALETA_PIXEL.P16;
    ctx.fillRect(-2, -8, 4, 2);
  }

  ctx.restore();
}

/**
 * TELEMETRY BEACON
 */
export function renderSleekBeacon(ctx, x, y, time) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));

  const pulse = (time * 1.5) % 1;
  ctx.strokeStyle = `rgba(232, 128, 59, ${1 - pulse})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 6, pulse * 50, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = PALETA_PIXEL.P11;
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.lineTo(-10, 12);
  ctx.lineTo(10, 12);
  ctx.closePath();
  ctx.fill();

  const coreY = -14 + Math.sin(time * 4) * 2;
  ctx.fillStyle = PALETA_PIXEL.P13;
  ctx.beginPath();
  ctx.arc(0, coreY, 6.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, coreY, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * ASTEROIDS & SPACE MINES (Sector 3)
 */
export function renderObstacles(ctx, obstacles, time) {
  for (const obs of obstacles) {
    ctx.save();
    ctx.translate(Math.round(obs.x), Math.round(obs.y));
    ctx.rotate(obs.rot);

    if (obs.type === 'asteroid') {
      ctx.fillStyle = '#2a333d';
      ctx.beginPath();
      const points = 7;
      for (let i = 0; i < points; i++) {
        const a = (Math.PI * 2 * i) / points;
        const rad = obs.radius * (0.8 + Math.sin(i * 2.3 + obs.id) * 0.25);
        const px = Math.cos(a) * rad;
        const py = Math.sin(a) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#4a5968';
      ctx.lineWidth = 2;
      ctx.stroke();

    } else if (obs.type === 'space_mine') {
      ctx.fillStyle = '#1a1a24';
      ctx.beginPath();
      ctx.arc(0, 0, obs.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d0453a';
      ctx.lineWidth = 2;
      ctx.stroke();

      for (let i = 0; i < 6; i++) {
        const a = (Math.PI * 2 * i) / 6;
        ctx.strokeStyle = '#8a2020';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * obs.radius, Math.sin(a) * obs.radius);
        ctx.lineTo(Math.cos(a) * (obs.radius + 8), Math.sin(a) * (obs.radius + 8));
        ctx.stroke();
      }

      const blink = Math.floor(time * 8) % 2 === 0;
      ctx.fillStyle = blink ? '#ff3b30' : '#440000';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
