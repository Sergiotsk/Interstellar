// Palanca analogica flotante: desplazamiento del dedo respecto de la base -> vector de movimiento en [-1, 1].

export const PALANCA = Object.freeze({ radio: 56, zonaMuerta: 0.15 });

// La magnitud se reescala desde la zona muerta para que el primer milimetro util no pegue un salto.
export function leerPalanca(dx, dy, { radio, zonaMuerta } = PALANCA) {
  const dist = Math.hypot(dx, dy);
  const tope = Math.min(1, radio / (dist || 1));
  const perillaX = dx * tope;
  const perillaY = dy * tope;
  const crudo = Math.min(1, dist / radio);
  if (crudo <= zonaMuerta) return { x: 0, y: 0, activo: false, perillaX, perillaY };
  const magnitud = (crudo - zonaMuerta) / (1 - zonaMuerta);
  return { x: (dx / dist) * magnitud, y: (dy / dist) * magnitud, activo: true, perillaX, perillaY };
}

// Si el dedo se pasa del radio, la base lo acompana: se puede cambiar de rumbo sin volver al centro.
export function seguirDedo(base, dedo, radio) {
  const dx = dedo.x - base.x;
  const dy = dedo.y - base.y;
  const dist = Math.hypot(dx, dy);
  if (dist <= radio) return base;
  const k = (dist - radio) / dist;
  return { x: base.x + dx * k, y: base.y + dy * k };
}
