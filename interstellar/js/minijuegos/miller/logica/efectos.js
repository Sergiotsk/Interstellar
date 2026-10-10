// Efectos del original (spawnRipple, spawnFloatingText, showBanner) y su avance por paso.
// Los sonidos se piden por cola: la logica no toca Web Audio (main.js la vacia contra el sintetizador).
import { TOKENS_HUD } from '../config.js';

export function sonar(sim, metodo, ...args) {
  sim.sonidos.push([metodo, ...args]);
}

export function onda(sim, x, y, maxRadius = 32, speed = 45, color = 'rgba(158, 194, 207, 0.7)') {
  if (sim.ripples.length > 35) sim.ripples.shift();
  sim.ripples.push({ x, y, radius: 4, maxRadius, alpha: 0.85, speed, color });
}

export function textoFlotante(sim, x, y, text, color = '#ffffff', isCrit = false) {
  if (sim.floatingTexts.length > 25) sim.floatingTexts.shift();
  sim.floatingTexts.push({ x, y, text, color, life: 0.85, maxLife: 0.85, vy: isCrit ? -55 : -40, isCrit });
}

export function mostrarBanner(sim, text, subtext = '', color = TOKENS_HUD.tealGlow, duration = 2.4, isBlinking = false) {
  sim.banner = { text, subtext, color, duration, timer: duration, isBlinking };
  sonar(sim, 'playBannerImpact');
}

// Marcadores y banner como en el original; textos y ondas avanzan aca (en el original quedaban congelados: R7 a/b).
export function avanzarEfectos(sim, dt) {
  for (let i = sim.hitMarkers.length - 1; i >= 0; i--) {
    const hm = sim.hitMarkers[i];
    hm.life -= dt;
    if (hm.life <= 0) sim.hitMarkers.splice(i, 1);
  }
  if (sim.banner) {
    sim.banner.timer -= dt;
    if (sim.banner.timer <= 0) sim.banner = null;
  }
  for (let i = sim.floatingTexts.length - 1; i >= 0; i--) {
    const ft = sim.floatingTexts[i];
    ft.life -= dt;
    ft.y += ft.vy * dt;
    if (ft.life <= 0) sim.floatingTexts.splice(i, 1);
  }
  for (let i = sim.ripples.length - 1; i >= 0; i--) {
    const rip = sim.ripples[i];
    rip.radius += rip.speed * dt;
    if (rip.radius >= rip.maxRadius) sim.ripples.splice(i, 1);
  }
}
