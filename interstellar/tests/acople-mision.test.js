import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/acople/config.js';
import {
  crearPartida,
  iniciar,
  conAcciones,
  avanzar,
  estadoHud,
  nivelDeEstado,
  reintentar,
  pausar,
  reanudar,
  solicitarAcople,
  indicacionHud,
} from '../js/minijuegos/acople/logica/mision.js';

const W = CONFIG.estacion.velAngular;

// Partida en curso con la nave ya sincronizada y alineada con el puerto.
function sincronizada(naveExtra = {}) {
  const p = crearPartida(CONFIG, { conIntro: false });
  const angulo = p.estacion.angulo + p.estacion.anguloPuerto;
  return { ...p, nave: { ...p.nave, angulo, velAngular: W, ...naveExtra } };
}

describe('acople/logica/mision.js — fases y avance', () => {
  test('con intro arranca en intro e iniciar pasa a en-curso', () => {
    const p = crearPartida(CONFIG, { conIntro: true });
    assert.equal(p.fase, 'intro');
    assert.equal(iniciar(p).fase, 'en-curso');
  });

  test('sin intro arranca en en-curso', () => {
    assert.equal(crearPartida(CONFIG, { conIntro: false }).fase, 'en-curso');
  });

  test('por defecto arranca con intro', () => {
    assert.equal(crearPartida(CONFIG).fase, 'intro');
  });

  test('conAcciones se ignora fuera de en-curso', () => {
    const intro = crearPartida(CONFIG);
    assert.equal(conAcciones(intro, new Set(['impulso'])).acciones.size, 0);
    const curso = crearPartida(CONFIG, { conIntro: false });
    assert.ok(conAcciones(curso, new Set(['impulso'])).acciones.has('impulso'));
  });

  test('avanzar recorta un delta enorme a deltaMaxS', () => {
    const p = avanzar(crearPartida(CONFIG, { conIntro: false }), 5, CONFIG);
    assert.ok(Math.abs(p.tiempo - CONFIG.deltaMaxS) <= CONFIG.pasoFijoS);
  });

  test('avanzar aplica pasos fijos y acumula el resto', () => {
    const paso = CONFIG.pasoFijoS;
    const p = avanzar(crearPartida(CONFIG, { conIntro: false }), paso * 2.5, CONFIG);
    assert.ok(Math.abs(p.tiempo - paso * 2) < 1e-12);
    const q = avanzar(p, paso * 0.5, CONFIG);
    assert.ok(Math.abs(q.tiempo - paso * 3) < 1e-12);
  });

  test('el tiempo solo corre en en-curso; en intro la estacion igual gira', () => {
    const intro = crearPartida(CONFIG);
    const p = avanzar(intro, 0.05, CONFIG);
    assert.equal(p.tiempo, 0);
    assert.ok(p.estacion.angulo > intro.estacion.angulo);
    assert.equal(p.nave.distancia, intro.nave.distancia);
  });

  test('tocar el puerto lento y alineado NO acopla: rebota', () => {
    let p = sincronizada({ distancia: 0.01, velAproximacion: 2 });
    p = avanzar(p, 0.05, CONFIG);
    assert.equal(p.fase, 'en-curso');
    assert.ok(p.nave.velAproximacion < 0, 'rebota hacia atras');
  });

  test('contacto rapido -> fallida por impacto, sin puntaje', () => {
    let p = sincronizada({ distancia: 0.01, velAproximacion: CONFIG.tol.velocidad + 5 });
    p = avanzar(p, 0.05, CONFIG);
    assert.equal(p.fase, 'fallida');
    assert.equal(p.desenlace.causa, 'impacto');
    assert.equal(p.desenlace.puntaje, null);
  });

  test('terminada, avanzar ya no cambia nada', () => {
    const p = solicitarAcople(sincronizada({ distancia: CONFIG.rangoAcople - 1, velAproximacion: 2 }), CONFIG);
    assert.equal(avanzar(p, 0.05, CONFIG), p);
  });

  test('cuenta el tiempo en rango y el tiempo en rango seguro', () => {
    let p = sincronizada({ distancia: CONFIG.rangoAcople - 1, velAproximacion: 1 });
    p = avanzar(p, 0.05, CONFIG);
    assert.ok(p.tiempoEnRango > 0);
    assert.ok(Math.abs(p.tiempoEnRango - p.tiempoEnRangoSeguro) < 1e-12);
  });
});

describe('acople/logica/mision.js — estado del HUD', () => {
  test('APPROACHING lejos del puerto', () => {
    assert.equal(estadoHud(crearPartida(CONFIG, { conIntro: false }), CONFIG), 'APPROACHING');
  });

  test('MATCHING ROTATION cerca sin sincronia', () => {
    const p = sincronizada({ distancia: CONFIG.zonaCercana - 1, velAngular: W + CONFIG.tol.omega * 2, velAproximacion: 1 });
    assert.equal(estadoHud(p, CONFIG), 'MATCHING ROTATION');
  });

  test('DOCKING RANGE en rango y todo seguro', () => {
    assert.equal(estadoHud(sincronizada({ distancia: CONFIG.rangoAcople - 1, velAproximacion: 1 }), CONFIG), 'DOCKING RANGE');
  });

  test('UNSAFE APPROACH cerca y con peligro (tiene prioridad sobre DOCKING RANGE)', () => {
    const p = sincronizada({ distancia: CONFIG.rangoAcople - 1, velAproximacion: CONFIG.peligro.velocidad + 1 });
    assert.equal(estadoHud(p, CONFIG), 'UNSAFE APPROACH');
  });

  test('DOCKED y MISSION FAILED segun la fase', () => {
    const ok = solicitarAcople(sincronizada({ distancia: CONFIG.rangoAcople - 1, velAproximacion: 2 }), CONFIG);
    assert.equal(estadoHud(ok, CONFIG), 'DOCKED');
    const mal = avanzar(sincronizada({ distancia: 0.01, velAproximacion: 99 }), 0.05, CONFIG);
    assert.equal(estadoHud(mal, CONFIG), 'MISSION FAILED');
  });

  test('nivelDeEstado agrupa los estados en niveles visuales', () => {
    assert.equal(nivelDeEstado('APPROACHING'), 'neutro');
    assert.equal(nivelDeEstado('MATCHING ROTATION'), 'atencion');
    assert.equal(nivelDeEstado('DOCKING RANGE'), 'seguro');
    assert.equal(nivelDeEstado('DOCKED'), 'seguro');
    assert.equal(nivelDeEstado('UNSAFE APPROACH'), 'peligro');
    assert.equal(nivelDeEstado('MISSION FAILED'), 'peligro');
    assert.equal(nivelDeEstado('DOCKING REJECTED'), 'atencion');
  });
});

describe('acople/logica/mision.js — acople manual con Enter (FR-014 revisado)', () => {
  const enRango = (extra = {}) => sincronizada({ distancia: CONFIG.rangoAcople - 1, velAproximacion: 2, ...extra });

  test('en rango y todo en tolerancia: acopla con puntaje', () => {
    const p = solicitarAcople(enRango(), CONFIG);
    assert.equal(p.fase, 'acoplada');
    assert.equal(p.desenlace.exito, true);
    assert.ok(Number.isInteger(p.desenlace.puntaje) && p.desenlace.puntaje > 0);
    assert.ok(p.desenlace.precision >= 0 && p.desenlace.precision <= 1);
    assert.equal(p.desenlace.velocidadFinal, 2);
  });

  test('fuera de tolerancia: rechazo con motivo, espera y costo, sin fallar', () => {
    const lejos = solicitarAcople(sincronizada({ distancia: CONFIG.rangoAcople + 50 }), CONFIG);
    assert.equal(lejos.fase, 'en-curso');
    assert.equal(lejos.motivoRechazo, 'distancia');
    assert.equal(lejos.esperaRechazo, CONFIG.acople.esperaRechazo);
    assert.equal(lejos.rechazos, 1);
    assert.ok(Math.abs(lejos.nave.combustible - (1 - CONFIG.acople.costoRechazo)) < 1e-12);
  });

  test('el motivo sigue la prioridad distancia > velocidad > giro > angulo', () => {
    const motivo = (extra) => solicitarAcople(enRango(extra), CONFIG).motivoRechazo;
    assert.equal(motivo({ velAproximacion: CONFIG.tol.velocidad + 1, angulo: 1 }), 'velocidad');
    assert.equal(motivo({ velAngular: W + CONFIG.tol.omega * 2, angulo: 1 }), 'giro');
    assert.equal(motivo({ angulo: CONFIG.tol.angulo * 2 }), 'angulo');
  });

  test('durante la espera, Enter se ignora; al terminar la espera se puede reintentar', () => {
    let p = solicitarAcople(sincronizada({ distancia: CONFIG.rangoAcople + 50 }), CONFIG);
    assert.equal(solicitarAcople(p, CONFIG), p);
    p = { ...p, nave: { ...p.nave, distancia: CONFIG.rangoAcople - 1, velAproximacion: 0 } };
    for (let t = 0; t < CONFIG.acople.esperaRechazo + 0.2; t += 0.1) p = avanzar(p, 0.1, CONFIG);
    assert.equal(p.esperaRechazo, 0);
    assert.equal(solicitarAcople(p, CONFIG).fase, 'acoplada');
  });

  test('fuera de en-curso se ignora', () => {
    const intro = crearPartida(CONFIG);
    assert.equal(solicitarAcople(intro, CONFIG), intro);
  });

  test('cada rechazo baja el puntaje final', () => {
    const limpio = solicitarAcople(enRango(), CONFIG).desenlace.puntaje;
    let p = solicitarAcople(enRango({ velAproximacion: CONFIG.tol.velocidad + 1 }), CONFIG);
    p = { ...p, esperaRechazo: 0, nave: { ...p.nave, velAproximacion: 2, combustible: 1 } };
    assert.ok(solicitarAcople(p, CONFIG).desenlace.puntaje < limpio);
  });

  test('estadoHud muestra DOCKING REJECTED durante la espera', () => {
    const p = solicitarAcople(enRango({ velAproximacion: CONFIG.tol.velocidad + 1 }), CONFIG);
    assert.equal(estadoHud(p, CONFIG), 'DOCKING REJECTED');
  });

  test('indicacionHud: invita a acoplar en rango y explica el rechazo', () => {
    assert.equal(indicacionHud(enRango(), 'DOCKING RANGE'), 'PRESS ENTER TO DOCK');
    const r = solicitarAcople(sincronizada({ distancia: CONFIG.rangoAcople + 50 }), CONFIG);
    assert.equal(indicacionHud(r, 'DOCKING REJECTED'), 'REJECTED · TOO FAR');
    assert.equal(indicacionHud(crearPartida(CONFIG, { conIntro: false }), 'APPROACHING'), '');
  });
});

describe('acople/logica/mision.js — causas de fallo y reintento (US2)', () => {
  const correr = (p, segundos) => {
    let q = p;
    for (let t = 0; t < segundos && q.fase === 'en-curso'; t += CONFIG.deltaMaxS) q = avanzar(q, CONFIG.deltaMaxS, CONFIG);
    return q;
  };

  test('giro sobre el limite de control sostenido mas alla del margen -> control', () => {
    const p = correr(sincronizada({ velAngular: CONFIG.limiteControl + 0.5 }), CONFIG.margenSinControl + 0.5);
    assert.equal(p.fase, 'fallida');
    assert.equal(p.desenlace.causa, 'control');
  });

  test('si el giro vuelve bajo el limite antes del margen, el contador se resetea', () => {
    let p = correr(sincronizada({ velAngular: CONFIG.limiteControl + 0.5 }), CONFIG.margenSinControl / 2);
    assert.ok(p.tiempoSinControl > 0);
    p = { ...p, nave: { ...p.nave, velAngular: W } };
    p = avanzar(p, CONFIG.deltaMaxS, CONFIG);
    assert.equal(p.tiempoSinControl, 0);
    assert.equal(p.fase, 'en-curso');
  });

  test('sin combustible y sin acercarse -> combustible', () => {
    const p = avanzar(sincronizada({ combustible: 0, velAproximacion: 0 }), 0.05, CONFIG);
    assert.equal(p.fase, 'fallida');
    assert.equal(p.desenlace.causa, 'combustible');
  });

  test('sin combustible pero acercandose: no falla y todavia puede acoplar', () => {
    const p = avanzar(sincronizada({ combustible: 0, velAproximacion: 2, distancia: CONFIG.rangoAcople - 1 }), 0.05, CONFIG);
    assert.equal(p.fase, 'en-curso');
    assert.equal(solicitarAcople(p, CONFIG).fase, 'acoplada');
  });

  test('sin combustible, el rebote en el puerto deja a la nave alejandose -> combustible', () => {
    const p = correr(sincronizada({ combustible: 0, velAproximacion: 2, distancia: 1 }), 2);
    assert.equal(p.fase, 'fallida');
    assert.equal(p.desenlace.causa, 'combustible');
  });

  test('todo fallo trae estadisticas completas y puntaje null (FR-026)', () => {
    const p = avanzar(sincronizada({ combustible: 0, velAproximacion: 0 }), 0.05, CONFIG);
    const d = p.desenlace;
    assert.equal(d.exito, false);
    assert.equal(d.puntaje, null);
    for (const k of ['tiempoTotal', 'combustibleRestante', 'velocidadFinal']) assert.equal(typeof d[k], 'number', k);
  });

  test('reintentar devuelve una partida nueva en curso, sin intro y con valores iniciales', () => {
    const fallida = avanzar(sincronizada({ distancia: 0.01, velAproximacion: 99 }), 0.05, CONFIG);
    const p = reintentar(fallida, CONFIG);
    assert.equal(p.fase, 'en-curso');
    assert.equal(p.tiempo, 0);
    assert.equal(p.desenlace, null);
    assert.equal(p.nave.distancia, CONFIG.distanciaInicial);
    assert.equal(p.nave.combustible, CONFIG.combustible.inicial);
  });
});

describe('acople/logica/mision.js — pausa por foco (US5, FR-036)', () => {
  test('pausar desde en-curso pasa a pausada y suelta las acciones', () => {
    const p = pausar(conAcciones(crearPartida(CONFIG, { conIntro: false }), new Set(['impulso'])));
    assert.equal(p.fase, 'pausada');
    assert.equal(p.acciones.size, 0);
  });

  test('en pausada la fisica no avanza', () => {
    const p = pausar(sincronizada({ velAproximacion: 5 }));
    const q = avanzar(p, 0.1, CONFIG);
    assert.equal(q.nave.distancia, p.nave.distancia);
    assert.equal(q.tiempo, p.tiempo);
  });

  test('reanudar vuelve a en-curso', () => {
    assert.equal(reanudar(pausar(crearPartida(CONFIG, { conIntro: false }))).fase, 'en-curso');
  });

  test('pausar fuera de en-curso no tiene efecto', () => {
    const intro = crearPartida(CONFIG);
    assert.equal(pausar(intro), intro);
    const ok = solicitarAcople(sincronizada({ distancia: CONFIG.rangoAcople - 1, velAproximacion: 2 }), CONFIG);
    assert.equal(pausar(ok), ok);
  });
});

describe('acople/logica/mision.js — no se acopla alejandose del puerto', () => {
  const enRango = (extra = {}) => sincronizada({ distancia: CONFIG.rangoAcople - 1, velAproximacion: 2, ...extra });

  test('con velocidad negativa el acople se rechaza por DRIFTING AWAY', () => {
    const p = solicitarAcople(enRango({ velAproximacion: -1 }), CONFIG);
    assert.equal(p.fase, 'en-curso');
    assert.equal(p.motivoRechazo, 'alejandose');
    assert.equal(indicacionHud(p, 'DOCKING REJECTED'), 'REJECTED · DRIFTING AWAY');
  });

  test('alejandose en rango no es DOCKING RANGE', () => {
    assert.notEqual(estadoHud(enRango({ velAproximacion: -1 }), CONFIG), 'DOCKING RANGE');
  });

  test('quieto (v = 0) en rango si acopla', () => {
    assert.equal(solicitarAcople(enRango({ velAproximacion: 0 }), CONFIG).fase, 'acoplada');
  });
});

describe('acople/logica/mision.js — indicacion del HUD en modo tactil (010 FR-008)', () => {
  const enRango = (extra = {}) => sincronizada({ distancia: CONFIG.rangoAcople - 1, velAproximacion: 2, ...extra });

  test('en tactil invita a tocar; sin modo sigue pidiendo Enter', () => {
    assert.equal(indicacionHud(enRango(), 'DOCKING RANGE', 'tactil'), 'TAP TO DOCK');
    assert.equal(indicacionHud(enRango(), 'DOCKING RANGE'), 'PRESS ENTER TO DOCK');
    assert.equal(indicacionHud(enRango(), 'DOCKING RANGE', 'teclado'), 'PRESS ENTER TO DOCK');
  });

  test('el rechazo no cambia con el modo', () => {
    const r = solicitarAcople(sincronizada({ distancia: CONFIG.rangoAcople + 50 }), CONFIG);
    assert.equal(indicacionHud(r, 'DOCKING REJECTED', 'tactil'), 'REJECTED · TOO FAR');
  });
});
