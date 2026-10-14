// Dibuja el show de drones "SANCOR SEGUROS" (el jefe final del ascenso) desde sim.formacion.
import { posicionDron, brilloDron, MAGENTA, BLANCO } from '../logica/sancor.js';

// nitido (desktop): cada dron es un LED de cuerpo opaco con punto caliente; en pantalla grande el halo difuso se lee borroso.
export function renderShowDrones(ctx, f, time, nitido = false) {
  if (!f) return;
  ctx.save();
  for (const d of f.drones) {
    const encendido = brilloDron(f, d);
    if (!d.vivo || encendido <= 0) continue;
    const { x, y } = posicionDron(f, d, time);
    // Una ola que barre las letras de magenta a blanco, como en el show real.
    const ola = Math.sin(d.cx * 0.35 - time * 2.2 + d.cy * 0.15);
    const color = d.logo || ola < 0.25 ? MAGENTA : BLANCO;
    ctx.fillStyle = color;
    const brillo = encendido * (0.75 + 0.25 * Math.sin(time * 5 + d.azar * 20));

    ctx.globalAlpha = (nitido ? 0.12 : 0.2) * brillo;
    ctx.beginPath();
    ctx.arc(x, y, f.paso * (nitido ? 0.5 : 0.45), 0, Math.PI * 2);
    ctx.fill();
    // Recien golpeado: destello blanco y nucleo agrandado.
    if (d.golpe > 0) ctx.fillStyle = BLANCO;
    ctx.globalAlpha = nitido ? encendido : brillo;
    ctx.beginPath();
    ctx.arc(x, y, f.paso * (d.golpe > 0 ? 0.42 : nitido ? 0.36 : 0.32), 0, Math.PI * 2);
    ctx.fill();
    if (nitido && color === MAGENTA && d.golpe <= 0) {
      ctx.fillStyle = BLANCO;
      ctx.globalAlpha = 0.85 * brillo;
      ctx.beginPath();
      ctx.arc(x, y, f.paso * 0.14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = color;
    }

    // Blindaje: un anillo por cada golpe de sobra que le queda.
    if (encendido >= 1 && d.vida > 1) {
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = nitido ? 1 : 0.8;
      ctx.globalAlpha = (nitido ? 0.7 : 0.55) * brillo;
      for (let i = 1; i < d.vida; i++) {
        ctx.beginPath();
        ctx.arc(x, y, f.paso * (0.32 + 0.14 * i) + (nitido ? 0.5 : 0), 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}
