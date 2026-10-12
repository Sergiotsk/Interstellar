// Las 3 cargas de la fase 1: en el suelo (con su pulso de sonar) y la que el astronauta lleva encima.
import { PALETA_PIXEL } from '../config.js';
import { renderSleekBeacon } from './funciones.js';

function pulso(ctx, time, color) {
  const p = (time * 1.5) % 1;
  ctx.strokeStyle = color.replace('A', String(1 - p));
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 6, p * 50, 0, Math.PI * 2);
  ctx.stroke();
}

// Caja negra del modulo de Miller: naranja de seguridad, con un LED que titila.
function cajaNegra(ctx, time) {
  ctx.fillStyle = PALETA_PIXEL.P12;
  ctx.fillRect(-11, -4, 22, 14);
  ctx.fillStyle = PALETA_PIXEL.P13;
  ctx.fillRect(-10, -12, 20, 14);
  ctx.strokeStyle = PALETA_PIXEL.P11;
  ctx.lineWidth = 1.2;
  ctx.strokeRect(-10, -12, 20, 14);
  ctx.fillStyle = PALETA_PIXEL.P11;
  ctx.fillRect(-6, -9, 12, 2);
  ctx.fillStyle = Math.floor(time * 4) % 2 ? '#ff3b30' : '#661111';
  ctx.beginPath();
  ctx.arc(6, -4, 2, 0, Math.PI * 2);
  ctx.fill();
}

// Muestra del oceano: capsula de vidrio con agua cian que brilla.
function muestra(ctx, time) {
  ctx.fillStyle = PALETA_PIXEL.P11;
  ctx.fillRect(-6, 6, 12, 4);
  ctx.fillRect(-6, -18, 12, 4);
  ctx.fillStyle = 'rgba(239, 231, 214, 0.35)';
  ctx.beginPath();
  ctx.roundRect(-5, -15, 10, 22, 3);
  ctx.fill();
  const nivel = 2 + Math.sin(time * 3) * 1.5;
  ctx.fillStyle = PALETA_PIXEL.P18;
  ctx.beginPath();
  ctx.roundRect(-4, -8 + nivel, 8, 14 - nivel, 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-3, -12, 1.5, 12);
}

export function renderCargaEnSuelo(ctx, c, time) {
  if (c.tipo === 'baliza') return renderSleekBeacon(ctx, c.x, c.y, time);
  ctx.save();
  ctx.translate(Math.round(c.x), Math.round(c.y));
  pulso(ctx, time, c.tipo === 'caja_negra' ? 'rgba(232, 128, 59, A)' : 'rgba(79, 208, 224, A)');
  ctx.translate(0, Math.sin(time * 4) * 2);
  if (c.tipo === 'caja_negra') cajaNegra(ctx, time);
  else muestra(ctx, time);
  ctx.restore();
}

// La que se lleva: chica, flotando sobre la cabeza del astronauta.
export function renderCargaLlevada(ctx, sim, time) {
  if (!sim.cargando) return;
  ctx.save();
  ctx.translate(Math.round(sim.playerX), Math.round(sim.playerY - sim.playerZ - 46 + Math.sin(time * 5) * 2));
  ctx.scale(0.7, 0.7);
  if (sim.cargando === 'caja_negra') cajaNegra(ctx, time);
  else if (sim.cargando === 'muestra') muestra(ctx, time);
  else {
    ctx.fillStyle = PALETA_PIXEL.P13;
    ctx.beginPath();
    ctx.arc(0, -4, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -4, 2.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
