import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/miller/config.js';
import { crearPartida, conAcciones, avanzar } from '../js/minijuegos/miller/logica/mision.js';

const DT = CONFIG.pasoFijoS;
const SEMILLAS = Array.from({ length: 20 }, (_, i) => 101 + i * 37);
const TOPE_S = 180;

// Piloto de referencia: va derecho al objetivo y esquiva por z el resto que tiene adelante.
// Juega "bien pero humano": no busca a CASE ni optimiza la trayectoria.
function piloto(p) {
  const { jugador: j, mapa } = p;
  const objetivo = p.balizaRecogida ? mapa.ranger : mapa.baliza;
  const acciones = new Set();

  if (p.balizaRecogida && Math.hypot(j.x - objetivo.x, j.z - objetivo.z) < mapa.ranger.radio * 0.6) {
    acciones.add('accion');
    return acciones;
  }
  if (!p.balizaRecogida && Math.hypot(j.x - objetivo.x, j.z - objetivo.z) <= CONFIG.jugador.alcanceBaliza * 0.8) {
    acciones.add('accion');
  }

  const sentido = Math.sign(objetivo.x - j.x);
  const margenZ = (CONFIG.jugador.caja.prof + CONFIG.restos.caja.prof) / 2 + 3;
  const adelante = mapa.restos.find(
    (r) => (r.x - j.x) * sentido > 0 && Math.abs(r.x - j.x) < 45 && Math.abs(r.z - j.z) < margenZ,
  );
  let zDeseada = objetivo.z;
  if (adelante) zDeseada = adelante.z > CONFIG.mundo.profundidad / 2 ? adelante.z - margenZ - 4 : adelante.z + margenZ + 4;

  if (Math.abs(objetivo.x - j.x) > 2) acciones.add(sentido > 0 ? 'moverDerecha' : 'moverIzquierda');
  if (zDeseada < j.z - 2) acciones.add('moverArriba');
  else if (zDeseada > j.z + 2) acciones.add('moverAbajo');
  return acciones;
}

function jugar(semilla) {
  let p = crearPartida(CONFIG, { semilla, conIntro: false });
  for (let i = 0; i < TOPE_S / DT && !['exito', 'fracaso'].includes(p.fase); i++) {
    p = avanzar(conAcciones(p, piloto(p)), DT, CONFIG);
  }
  return p;
}

describe('miller — balance con la configuracion por defecto (FR-011, SC-002)', () => {
  const partidas = SEMILLAS.map((s) => ({ semilla: s, p: jugar(s) }));

  test('el piloto de referencia gana en las 20 semillas', () => {
    const perdidas = partidas.filter(({ p }) => p.fase !== 'exito').map(({ semilla, p }) => `${semilla}:${p.fase}/${p.causa}`);
    assert.deepEqual(perdidas, []);
  });

  test('cada victoria dura entre 45 y 90 s', () => {
    const fuera = partidas
      .filter(({ p }) => p.fase === 'exito')
      .map(({ semilla, p }) => [semilla, Math.round(p.t * 10) / 10])
      .filter(([, t]) => t < 45 || t > 90);
    assert.deepEqual(fuera, []);
  });

  test('la ola llega con tension: el margen al despegar no es enorme', () => {
    const margenes = partidas.filter(({ p }) => p.fase === 'exito').map(({ p }) => p.resultado.margenOla);
    const promedio = margenes.reduce((a, b) => a + b, 0) / margenes.length;
    assert.ok(promedio < CONFIG.puntaje.margenMax * 1.5, `margen promedio ${Math.round(promedio)}`);
  });
});
