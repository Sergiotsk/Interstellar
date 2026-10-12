// Obstaculos de la fase 1: geiseres (burbujas de aviso y columna de agua) y chatarra electrificada (chispas y arcos).
import { CONFIG, PALETA_PIXEL } from '../config.js';
import { faseGeiser, faseChatarra } from '../logica/obstaculos-superficie.js';

const O = CONFIG.obstaculos;

function geiser(ctx, g, time) {
  const G = O.geiser;
  const fase = faseGeiser(g, G);
  ctx.save();
  ctx.translate(Math.round(g.x), Math.round(g.y));

  // Boca del geiser: un ojo de agua mas oscuro.
  ctx.fillStyle = 'rgba(10, 14, 26, 0.45)';
  ctx.beginPath();
  ctx.ellipse(0, 0, G.radio * 0.6, G.radio * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();

  if (fase === 'aviso') {
    // Burbujas que suben cada vez mas rapido: hay que salir de ahi.
    const u = 1 - (g.periodo - G.erupcion - g.t) / G.aviso;
    ctx.strokeStyle = `rgba(158, 194, 207, ${0.4 + 0.5 * u})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, G.radio, G.radio * 0.4, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = PALETA_PIXEL.P7;
    for (let i = 0; i < 6; i++) {
      const a = i * 1.7 + time * (3 + u * 6);
      ctx.beginPath();
      ctx.arc(Math.cos(a) * G.radio * 0.5, Math.sin(a) * G.radio * 0.2 - u * 4, 1.5 + u * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (fase === 'erupcion') {
    // Columna de agua alta que sube de golpe y se abre en rocio: tiene que leerse como peligro.
    const u = 1 - (g.periodo - g.t) / G.erupcion;
    const alto = 120 * Math.sin(Math.PI * Math.min(1, 0.25 + u));
    const grad = ctx.createLinearGradient(0, 0, 0, -alto);
    grad.addColorStop(0, 'rgba(126, 231, 248, 0.95)');
    grad.addColorStop(0.6, 'rgba(158, 194, 207, 0.85)');
    grad.addColorStop(1, 'rgba(239, 231, 214, 0.5)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-G.radio * 0.55, 0);
    ctx.quadraticCurveTo(-10, -alto * 0.5, -18, -alto);
    ctx.lineTo(18, -alto);
    ctx.quadraticCurveTo(10, -alto * 0.5, G.radio * 0.55, 0);
    ctx.closePath();
    ctx.fill();
    // Corona de rocio.
    ctx.fillStyle = 'rgba(239, 231, 214, 0.85)';
    for (let i = 0; i < 7; i++) {
      const a = Math.PI + (i / 6) * Math.PI;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 22, -alto + Math.sin(a) * 10 + Math.sin(time * 20 + i) * 2, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(239, 231, 214, 0.9)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, G.radio, G.radio * 0.4, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function chatarra(ctx, z, time) {
  const Z = O.chatarra;
  const fase = faseChatarra(z, Z);
  ctx.save();
  ctx.translate(Math.round(z.x), Math.round(z.y));

  // Manchon de restos metalicos hundidos: siempre visible, para que se pueda esquivar.
  ctx.fillStyle = 'rgba(61, 59, 54, 0.55)';
  ctx.beginPath();
  ctx.ellipse(0, 0, z.radio, z.radio * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = fase === 'activa' ? 'rgba(126, 231, 248, 0.9)' : fase === 'aviso' ? 'rgba(126, 231, 248, 0.45)' : 'rgba(122, 117, 107, 0.6)';
  ctx.lineWidth = fase === 'activa' ? 2 : 1.2;
  ctx.stroke();

  if (fase !== 'apagada') {
    // Arcos electricos que saltan entre los restos; en aviso son pocos y tenues.
    const arcos = fase === 'activa' ? 5 : 2;
    ctx.strokeStyle = fase === 'activa' ? PALETA_PIXEL.P19 : 'rgba(126, 231, 248, 0.5)';
    ctx.lineWidth = fase === 'activa' ? 1.8 : 1;
    for (let i = 0; i < arcos; i++) {
      const semilla = Math.floor(time * 18) + i * 7;
      const a = (semilla * 2.39) % (Math.PI * 2);
      const r = z.radio * (0.3 + ((semilla * 0.37) % 0.6));
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * r * 0.5 + Math.sin(semilla) * 4, Math.sin(a) * r * 0.22);
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.45);
      ctx.stroke();
    }
  }
  ctx.restore();
}

export function renderObstaculosSuperficie(ctx, sim, time) {
  for (const z of sim.chatarra) chatarra(ctx, z, time);
  for (const g of sim.geiseres) geiser(ctx, g, time);
}
