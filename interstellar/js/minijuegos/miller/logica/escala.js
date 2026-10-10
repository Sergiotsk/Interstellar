// Escala entera del lienzo: con factores fraccionarios el pixel art se deforma (R6).

export function escalaEntera(ancho, alto, base) {
  return Math.max(1, Math.floor(Math.min(ancho / base.ancho, alto / base.alto)));
}
