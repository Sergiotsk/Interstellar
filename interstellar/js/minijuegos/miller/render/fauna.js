// Dibujo de la fauna de la Fase 1 y de la mira: nuevo (el original no los dibujaba), en el estilo de render/funciones.js:
// Canvas 2D procedural con PALETA_PIXEL, sombra en el agua y destello blanco al recibir un impacto.
import { PALETA_PIXEL } from '../config.js';

function barraDeVida(ctx, e, alto) {
  if (e.hp >= e.maxHp) return;
  const pct = Math.max(0, e.hp / e.maxHp);
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(-11, alto, 22, 4);
  ctx.fillStyle = '#d0453a';
  ctx.fillRect(-11, alto, 22 * pct, 4);
}

// Dron biomecanico: flota a e.z sobre el agua con dos rotores y un ojo rojo que late.
export function renderBioDrone(ctx, e, time) {
  const flash = e.flashTimer > 0;
  const bob = Math.sin(time * 4 + e.id) * 3;
  ctx.save();
  ctx.translate(Math.round(e.x), Math.round(e.y));

  ctx.fillStyle = 'rgba(10, 14, 26, 0.55)';
  ctx.beginPath();
  ctx.ellipse(0, 12, 15, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(0, -e.z + bob);
  ctx.scale(e.facing, 1);

  ctx.strokeStyle = PALETA_PIXEL.P11;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-8, -3);
  ctx.lineTo(-17, -9);
  ctx.moveTo(8, -3);
  ctx.lineTo(17, -9);
  ctx.stroke();

  const giro = Math.abs(Math.sin(time * 38 + e.id));
  ctx.fillStyle = 'rgba(158, 194, 207, 0.4)';
  [-17, 17].forEach((rx) => {
    ctx.beginPath();
    ctx.ellipse(rx, -10, 3 + giro * 8, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = flash ? '#ffffff' : PALETA_PIXEL.P12;
  ctx.beginPath();
  ctx.roundRect(-11, -8, 22, 16, 5);
  ctx.fill();
  ctx.strokeStyle = PALETA_PIXEL.P10;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.fillStyle = PALETA_PIXEL.P9;
  ctx.fillRect(-7, -6, 14, 3);

  const latido = 0.6 + Math.sin(time * 9 + e.id) * 0.4;
  ctx.fillStyle = `rgba(232, 75, 50, ${0.25 * latido})`;
  ctx.beginPath();
  ctx.arc(4, 2, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETA_PIXEL.P15;
  ctx.beginPath();
  ctx.arc(4, 2, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(4, 1, 1.5, 1.5);

  ctx.scale(e.facing, 1);
  barraDeVida(ctx, e, -20);
  ctx.restore();
}

// Alimana de trinchera: sumergida es una sombra con estela y dos ojos; al saltar muestra el cuerpo y las fauces.
export function renderTrenchLurker(ctx, e, time) {
  const flash = e.flashTimer > 0;
  ctx.save();
  ctx.translate(Math.round(e.x), Math.round(e.y));

  if (e.state === 'submerged') {
    ctx.strokeStyle = 'rgba(158, 194, 207, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 22 + Math.sin(time * 5 + e.id) * 3, 8, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(4, 9, 16, 0.6)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 17, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    const parpadeo = Math.floor(time * 3 + e.id) % 5 !== 0;
    if (parpadeo) {
      ctx.fillStyle = PALETA_PIXEL.P14;
      [-4, 4].forEach((ox) => ctx.fillRect(ox * e.facing - 1, -2, 2.5, 2));
    }
    ctx.restore();
    return;
  }

  const sombra = Math.max(0.35, 1 - e.z / 90);
  ctx.fillStyle = 'rgba(10, 14, 26, 0.6)';
  ctx.beginPath();
  ctx.ellipse(0, 6, 18 * sombra, 6 * sombra, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(0, -e.z);
  ctx.scale(e.facing, 1);
  const arco = e.state === 'leap' ? Math.max(-0.5, Math.min(0.5, -e.vz / 500)) : 0;
  ctx.rotate(arco);

  // Aletas dorsales.
  ctx.fillStyle = flash ? '#ffffff' : PALETA_PIXEL.P3;
  [-10, -3, 4].forEach((sx) => {
    ctx.beginPath();
    ctx.moveTo(sx - 4, -6);
    ctx.lineTo(sx, -14);
    ctx.lineTo(sx + 3, -6);
    ctx.closePath();
    ctx.fill();
  });

  // Cuerpo de anguila.
  ctx.fillStyle = flash ? '#ffffff' : PALETA_PIXEL.P4;
  ctx.beginPath();
  ctx.ellipse(-2, 0, 18, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = flash ? '#ffffff' : PALETA_PIXEL.P5;
  ctx.beginPath();
  ctx.ellipse(-2, 3, 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cola.
  ctx.fillStyle = flash ? '#ffffff' : PALETA_PIXEL.P3;
  ctx.beginPath();
  ctx.moveTo(-18, 0);
  ctx.lineTo(-28, -6 + Math.sin(time * 14) * 3);
  ctx.lineTo(-28, 6 + Math.sin(time * 14) * 3);
  ctx.closePath();
  ctx.fill();

  // Fauces: se abren cuando apunta para escupir.
  const apertura = e.state === 'aiming' ? 5 : 2;
  ctx.fillStyle = PALETA_PIXEL.P15;
  ctx.beginPath();
  ctx.moveTo(15, -1);
  ctx.lineTo(22, -apertura);
  ctx.lineTo(22, apertura);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = PALETA_PIXEL.P14;
  ctx.fillRect(9, -4, 3, 2.5);

  if (e.state === 'aiming') {
    ctx.fillStyle = 'rgba(158, 194, 207, 0.7)';
    for (let i = 0; i < 4; i++) ctx.fillRect(-14 + i * 8, 8 + Math.sin(time * 20 + i) * 2, 2, 2);
  }

  ctx.rotate(-arco);
  ctx.scale(e.facing, 1);
  barraDeVida(ctx, e, -22);
  ctx.restore();
}

// Mira del autoapuntado: anillo cian libre; con un blanco fijado, corchetes rojos que giran y la leyenda LOCK.
export function renderMira(ctx, x, y, fijada, time) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  if (fijada) {
    ctx.rotate(time * 2.5);
    ctx.strokeStyle = '#ff3b30';
    ctx.lineWidth = 2;
    const s = 15;
    const l = 6;
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => {
      ctx.beginPath();
      ctx.moveTo(sx * s, sy * (s - l));
      ctx.lineTo(sx * s, sy * s);
      ctx.lineTo(sx * (s - l), sy * s);
      ctx.stroke();
    });
    ctx.rotate(-time * 2.5);
    ctx.fillStyle = '#ff3b30';
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = 'bold 8px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LOCK', 0, -21);
  } else {
    ctx.strokeStyle = 'rgba(79, 208, 224, 0.75)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    [[0, -14, 0, -6], [0, 6, 0, 14], [-14, 0, -6, 0], [6, 0, 14, 0]].forEach(([x1, y1, x2, y2]) => {
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    });
    ctx.stroke();
  }
  ctx.restore();
}
