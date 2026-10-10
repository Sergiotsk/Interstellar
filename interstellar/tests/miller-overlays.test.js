import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/miller/config.js';
import { crearPartida } from '../js/minijuegos/miller/logica/mision.js';
import {
  lecturasHud,
  textoTierra,
  textoTierraLargo,
  fraseResultado,
  textoCausa,
  itemsTirada,
} from '../js/minijuegos/miller/overlays.js';

const HORAS_ANO = 365.25 * 24;
const HORAS_MES = HORAS_ANO / 12;
const base = () => crearPartida(CONFIG, { semilla: 3, conIntro: false });
const conOla = (p, distancia) => ({ ...p, ola: { ...p.ola, revelada: true, x: p.jugador.x + distancia } });

describe('miller/overlays.js — lecturas del HUD (pura)', () => {
  test('tiempo de mision en mm:ss', () => {
    assert.equal(lecturasHud({ ...base(), t: 0 }, CONFIG).tiempo, '00:00');
    assert.equal(lecturasHud({ ...base(), t: 61.9 }, CONFIG).tiempo, '01:01');
  });

  test('sin la ola revelada: distancia en blanco y barra llena', () => {
    const l = lecturasHud(base(), CONFIG);
    assert.equal(l.ola, '—');
    assert.equal(l.segmentos, 5);
  });

  test('con la ola: metros y segmentos que bajan al acercarse', () => {
    const lejos = lecturasHud(conOla(base(), CONFIG.ola.distanciaRevelacion), CONFIG);
    const cerca = lecturasHud(conOla(base(), 60), CONFIG);
    assert.equal(lejos.ola, `${CONFIG.ola.distanciaRevelacion} m`);
    assert.equal(lejos.segmentos, 5);
    assert.equal(cerca.segmentos, 1);
    assert.equal(lecturasHud(conOla(base(), -5), CONFIG).segmentos, 0);
    assert.equal(lecturasHud(conOla(base(), -5), CONFIG).ola, '0 m');
  });

  test('la senal de la baliza se dibuja con 5 marcas', () => {
    const p = base();
    const encima = { ...p, jugador: { ...p.jugador, x: p.mapa.baliza.x, z: p.mapa.baliza.z } };
    assert.equal(lecturasHud(encima, CONFIG).senal, ')))))');
    assert.equal(lecturasHud(p, CONFIG).senal, '·····');
    assert.equal(lecturasHud({ ...p, balizaRecogida: true }, CONFIG).senal, 'ACQUIRED');
  });

  test('carga, estado, nivel y texto del boton de accion', () => {
    const p = base();
    const l = lecturasHud(p, CONFIG);
    assert.equal(l.estado, 'SEARCHING');
    assert.equal(l.nivel, 'lejos');
    assert.equal(l.mostrarCarga, false);
    assert.equal(l.accionTexto, 'Recoger');
    const d = lecturasHud({ ...p, balizaRecogida: true, despegue: { ...p.despegue, carga: 0.5 } }, CONFIG);
    assert.equal(d.carga, 0.5);
    assert.equal(d.mostrarCarga, true);
    assert.equal(d.accionTexto, 'Despegar');
  });
});

describe('miller/overlays.js — tiempo terrestre (licencia narrativa)', () => {
  test('textoTierra compacto: dias y horas, meses y dias, anos y meses', () => {
    assert.equal(textoTierra(0), '0d 00h');
    assert.equal(textoTierra(24 * 3 + 5.5), '3d 05h');
    assert.equal(textoTierra(HORAS_MES + 24 * 12 + 1), '1m 12d');
    assert.equal(textoTierra(HORAS_ANO * 2 + HORAS_MES * 3 + 1), '2y 03m');
  });

  test('textoTierraLargo en castellano con plurales', () => {
    assert.equal(textoTierraLargo(HORAS_MES + 24 * 12 + 1), '1 mes y 12 días');
    assert.equal(textoTierraLargo(HORAS_MES * 2 + 1), '2 meses');
    assert.equal(textoTierraLargo(24 * 1 + 1), '1 día y 1 hora');
    assert.equal(textoTierraLargo(HORAS_ANO + HORAS_MES * 5 + 1), '1 año y 5 meses');
    assert.equal(textoTierraLargo(0.5), 'menos de una hora');
  });
});

describe('miller/overlays.js — textos del resultado', () => {
  const exito = { exito: true, causa: null, tiempoMision: 52.7, horasTerrestres: HORAS_MES + 24 * 12 + 1, margenOla: 263.4, asistenciaCase: true, puntaje: 8420 };
  const fracaso = { ...exito, exito: false, causa: 'ranger', margenOla: 0, asistenciaCase: false, puntaje: 0 };

  test('la frase narrativa dice cuanto paso en la Tierra', () => {
    assert.equal(fraseResultado(exito), 'Volviste. En la Tierra pasaron 1 mes y 12 días.');
    assert.equal(fraseResultado(fracaso), 'El agua no espera.');
  });

  test('la causa del fracaso nombra a la nave de la config', () => {
    assert.equal(textoCausa('jugador', CONFIG), 'La ola te alcanzó.');
    assert.equal(textoCausa('ranger', CONFIG), `La ola alcanzó al ${CONFIG.nombres.nave}.`);
  });

  test('la tirada trae los cinco items en orden con su texto final', () => {
    const items = itemsTirada(exito);
    assert.deepEqual(items.map((i) => i.item), ['tiempo', 'tierra', 'margen', 'case', 'total']);
    const final = Object.fromEntries(items.map((i) => [i.item, i.texto(i.valor)]));
    assert.equal(final.tiempo, '52.7 s');
    assert.equal(final.tierra, '1m 12d');
    assert.equal(final.margen, '263 m');
    assert.equal(final.case, 'SÍ');
    assert.equal(final.total, '8.420 pts');
  });

  test('en un fracaso la tirada no muestra margen ni total', () => {
    assert.deepEqual(itemsTirada(fracaso).map((i) => i.item), ['tiempo', 'tierra', 'case']);
  });
});
