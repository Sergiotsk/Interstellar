// Muerte en la nave: el casco se raja de punta a cola y las dos mitades se separan a la deriva.
// Cada mitad es la nave entera dibujada con un clip a un lado de la grieta.
import { renderSleekRanger } from './funciones.js';

// Grieta en zigzag, en coordenadas locales de la nave (punta hacia -y).
const GRIETA = [
  [0, -62],
  [5, -44],
  [-4, -30],
  [6, -16],
  [-5, -2],
  [4, 12],
  [-3, 32],
];
const PIVOTE_Y = -14; // centro de giro de cada mitad, a media nave

const sat = (v) => Math.min(1, Math.max(0, v));
const salida = (v) => 1 - (1 - v) * (1 - v);

function trazarGrieta(ctx) {
  ctx.beginPath();
  GRIETA.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
}

function mitad(ctx, lado, k, time) {
  const abre = salida(sat((k - 0.15) / 0.85));
  ctx.save();
  // Se separa hacia su lado, deriva un poco hacia abajo y gira hacia afuera.
  ctx.translate(lado * abre * 48, abre * 14);
  ctx.translate(0, PIVOTE_Y);
  ctx.rotate(lado * abre * 0.65);
  ctx.translate(0, -PIVOTE_Y);

  ctx.beginPath();
  GRIETA.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.lineTo(lado * 90, 40);
  ctx.lineTo(lado * 90, -70);
  ctx.closePath();
  ctx.save();
  ctx.clip();
  // Identidad dentro de renderSleekRanger: rota angle + PI/2 = 0. Motores apagados y sin escudo.
  renderSleekRanger(ctx, 0, 0, -Math.PI / 2, 0, false, false, false, false, false, time, 0, 1);
  ctx.restore();

  // Borde de la grieta al rojo vivo, que se enfria a medida que se alejan.
  const calor = 1 - sat((k - 0.2) / 0.7);
  if (calor > 0) {
    trazarGrieta(ctx);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = `rgba(255, 120, 40, ${0.45 * calor})`;
    ctx.lineWidth = 7;
    ctx.stroke();
    ctx.strokeStyle = `rgba(255, 230, 170, ${calor})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
}

// k: progreso de la muerte, 0..1.
export function renderNaveRota(ctx, x, y, angle, k, time) {
  ctx.save();
  // Impacto: sacudon antes de partirse.
  const temblor = k < 0.15 ? (1 - k / 0.15) * 4 : 0;
  ctx.translate(Math.round(x + Math.sin(time * 90) * temblor), Math.round(y + Math.cos(time * 77) * temblor));
  ctx.rotate(angle + Math.PI / 2);
  ctx.globalAlpha = 1 - sat((k - 0.7) / 0.3);

  if (k < 0.15) {
    // Antes de separarse: nave entera con la grieta encendiendose.
    renderSleekRanger(ctx, 0, 0, -Math.PI / 2, 0, false, false, false, false, false, time, 0, 1);
    trazarGrieta(ctx);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = `rgba(255, 230, 170, ${k / 0.15})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  } else {
    mitad(ctx, -1, k, time);
    mitad(ctx, 1, k, time);
  }

  // Destello del golpe fatal.
  const flash = 1 - sat(k / 0.2);
  if (flash > 0) {
    ctx.globalAlpha = 1;
    const g = ctx.createRadialGradient(0, PIVOTE_Y, 0, 0, PIVOTE_Y, 80);
    g.addColorStop(0, `rgba(255, 255, 255, ${0.9 * flash})`);
    g.addColorStop(0.4, `rgba(255, 170, 80, ${0.5 * flash})`);
    g.addColorStop(1, 'rgba(255, 120, 40, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, PIVOTE_Y, 80, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
