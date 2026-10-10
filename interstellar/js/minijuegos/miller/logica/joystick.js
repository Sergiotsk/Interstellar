// Joystick virtual -> acciones digitales de 8 direcciones; la fisica no necesita entrada analogica (R13).

// sin(22,5 grados): cada direccion ocupa un sector de 45 grados.
const UMBRAL_EJE = Math.sin(Math.PI / 8);

export function accionesDeJoystick(dx, dy, zonaMuerta) {
  const largo = Math.hypot(dx, dy);
  if (largo < zonaMuerta) return [];
  const acciones = [];
  if (Math.abs(dx) > largo * UMBRAL_EJE) acciones.push(dx > 0 ? 'moverDerecha' : 'moverIzquierda');
  if (Math.abs(dy) > largo * UMBRAL_EJE) acciones.push(dy > 0 ? 'moverAbajo' : 'moverArriba');
  return acciones;
}
