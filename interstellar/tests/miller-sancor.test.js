// Jefe final del ascenso: el show de drones "SANCOR SEGUROS" que hay que derribar punto a punto antes de la Endurance.
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/miller/config.js';
import { crearRng } from '../js/minijuegos/miller/logica/azar.js';
import { crearSim } from '../js/minijuegos/miller/logica/estado.js';
import { actualizarOrbita } from '../js/minijuegos/miller/logica/orbita.js';
import { actualizarProyectiles } from '../js/minijuegos/miller/logica/proyectiles.js';
import { detonarEmp } from '../js/minijuegos/miller/logica/nave.js';
import { armarFormacion, posicionDron, PRESENTACION_S } from '../js/minijuegos/miller/logica/sancor.js';
import { puntajeEnVivo } from '../js/minijuegos/miller/logica/puntaje.js';

const DT = 1 / 60;
const DIMS = { ancho: 960, alto: 540 };
const QUIETO = { left: false, right: false, up: false, down: false, confirm: false, tap: false, pointerDown: false };
const enOrbita = () => {
  const sim = crearSim(CONFIG, crearRng(5), DIMS);
  Object.assign(sim, { phase: 'EXPLORATION', stage: 'MISSION_2_ORBITAL_ASCENT', controlMode: 'SHIP', shipX: 480, shipY: 455, enemies: [], enemySpawnTimer: 99, bossSpawned: true });
  return sim;
};
const orbita = (sim, segundos, r = crearRng(11)) => {
  for (let i = 0; i < Math.round(segundos / DT) && !sim.fin; i++) {
    sim.elapsedSeconds += DT;
    actualizarOrbita(sim, QUIETO, DT, CONFIG, r, DIMS);
  }
};
const tiroA = (sim, x, y) => sim.bullets.push({ x, y: y + 10, vx: 0, vy: -920, type: 'ship_cannon', damage: 35, life: 1, maxLife: 1 });

describe('sancor.js — la formacion', () => {
  test('el texto tiene tres renglones: SANCOR / SEGUROS / ESTELARES', () => {
    const f = armarFormacion(DIMS);
    const renglones = new Set(f.drones.filter((d) => !d.logo).map((d) => Math.floor(d.cy / 9)));
    assert.deepEqual([...renglones].sort(), [0, 1, 2]);
    const ultimo = f.drones.filter((d) => !d.logo && d.cy >= 18);
    assert.equal(Math.max(...ultimo.map((d) => d.cx)) > Math.max(...f.drones.filter((d) => !d.logo && d.cy < 9).map((d) => d.cx)), true);
  });

  test('la resistencia crece hacia arriba: ESTELARES 2, SEGUROS 3, SANCOR 4; el logo 2', () => {
    const f = armarFormacion(DIMS);
    const vidas = (filtro) => new Set(f.drones.filter(filtro).map((d) => d.vida));
    assert.deepEqual([...vidas((d) => d.palabra === 0)], [4]);
    assert.deepEqual([...vidas((d) => d.palabra === 1)], [3]);
    assert.deepEqual([...vidas((d) => d.palabra === 2)], [2]);
    assert.deepEqual([...vidas((d) => d.logo)], [2]);
  });

  test('cada dron paga segun su palabra: logo y SANCOR 300, SEGUROS 150, ESTELARES 100', () => {
    const f = armarFormacion(DIMS);
    const puntos = (filtro) => new Set(f.drones.filter(filtro).map((d) => d.puntos));
    assert.deepEqual([...puntos((d) => d.logo)], [300]);
    assert.deepEqual([...puntos((d) => d.palabra === 0)], [300]);
    assert.deepEqual([...puntos((d) => d.palabra === 1)], [150]);
    assert.deepEqual([...puntos((d) => d.palabra === 2)], [100]);
  });

  test('arma el logo y el texto con todos los drones vivos', () => {
    const f = armarFormacion(DIMS);
    assert.ok(f.drones.length > 200, `drones ${f.drones.length}`);
    assert.equal(f.vivos, f.drones.length);
    assert.ok(f.drones.some((d) => d.logo) && f.drones.some((d) => !d.logo));
    assert.ok(f.drones.every((d) => d.vivo));
  });

  test('a la altitud objetivo aparece la formacion y la Endurance espera', () => {
    const sim = enOrbita();
    sim.altitude = sim.targetAltitude;
    orbita(sim, 1);
    assert.ok(sim.formacion);
    assert.equal(sim.enduranceDescending, false);
  });

  test('con el Dreadnought vivo la formacion no entra', () => {
    const sim = enOrbita();
    Object.assign(sim, { altitude: sim.targetAltitude, bossActive: true, bossSpawned: true });
    orbita(sim, 0.2);
    assert.equal(sim.formacion, null);
  });

  test('mientras la formacion vive no hay oleadas', () => {
    const sim = enOrbita();
    sim.altitude = sim.targetAltitude;
    sim.enemySpawnTimer = 0;
    orbita(sim, 3);
    assert.equal(sim.enemies.length, 0);
  });

  test('se presenta como el show: logo, nube, formacion y grito; recien despues pelea', () => {
    const sim = enOrbita();
    sim.altitude = sim.targetAltitude;
    const fases = [];
    for (let i = 0; i < Math.round((PRESENTACION_S + 0.5) / DT); i++) {
      sim.elapsedSeconds += DT;
      actualizarOrbita(sim, QUIETO, DT, CONFIG, crearRng(11), DIMS);
      if (sim.formacion && fases.at(-1) !== sim.formacion.fase) fases.push(sim.formacion.fase);
      if (sim.formacion.fase !== 'combate') assert.ok(!sim.bullets.some((b) => b.isEnemy));
    }
    assert.deepEqual(fases, ['logo', 'nube', 'formacion', 'grito', 'combate']);
  });

  test('el grito de la tribuna suena una sola vez, al armarse SANCOR SEGUROS', () => {
    const sim = enOrbita();
    sim.altitude = sim.targetAltitude;
    orbita(sim, PRESENTACION_S + 1);
    assert.equal(sim.sonidos.filter(([m]) => m === 'vozSancor').length, 1);
  });

  test('durante la presentacion es invulnerable', () => {
    const sim = enOrbita();
    sim.altitude = sim.targetAltitude;
    orbita(sim, PRESENTACION_S - 1);
    const f = sim.formacion;
    const d = f.drones.reduce((a, x) => (x.cy > a.cy ? x : a));
    const p = posicionDron(f, d, sim.elapsedSeconds);
    tiroA(sim, p.x, p.y);
    actualizarProyectiles(sim, DT, crearRng(3), DIMS);
    assert.equal(sim.dronesSancor, 0);
    sim.bombStock = 1;
    detonarEmp(sim);
    assert.equal(sim.dronesSancor, 0);
  });

  test('los drones devuelven fuego en combate', () => {
    const sim = enOrbita();
    sim.altitude = sim.targetAltitude;
    orbita(sim, PRESENTACION_S + 2);
    assert.ok(sim.bullets.some((b) => b.isEnemy));
  });

  const soloDispara = (fuego) => {
    const sim = enOrbita();
    sim.altitude = sim.targetAltitude;
    orbita(sim, PRESENTACION_S + 0.2);
    const f = sim.formacion;
    for (const k of Object.keys(f.fuego)) f.fuego[k] = k === fuego ? 0 : 99;
    sim.bullets = [];
    orbita(sim, DT);
    return sim.bullets.filter((b) => b.isEnemy);
  };

  test('SEGUROS dispara rafagas: 3 balas rapidas en fila hacia la nave', () => {
    const balas = soloDispara('rafaga');
    assert.equal(balas.length, 3);
    const ang = balas.map((b) => Math.atan2(b.vy, b.vx).toFixed(3));
    assert.equal(new Set(ang).size, 1, 'misma direccion');
    assert.ok(balas.every((b) => Math.hypot(b.vx, b.vy) > 260));
  });

  test('SANCOR dispara pesado: abanico de 5 orbes lentos que pegan mas', () => {
    const balas = soloDispara('pesado');
    assert.equal(balas.length, 5);
    assert.ok(balas.every((b) => Math.hypot(b.vx, b.vy) < 260 && b.damage > 12 && b.pesada));
  });

  test('una palabra sin drones vivos deja de disparar su patron', () => {
    const sim = enOrbita();
    sim.altitude = sim.targetAltitude;
    orbita(sim, PRESENTACION_S + 0.2);
    const f = sim.formacion;
    for (const d of f.drones) if (d.palabra === 0) d.vivo = false;
    f.vivos = f.drones.filter((d) => d.vivo).length;
    for (const k of Object.keys(f.fuego)) f.fuego[k] = k === 'pesado' ? 0 : 99;
    sim.bullets = [];
    orbita(sim, DT);
    assert.equal(sim.bullets.filter((b) => b.isEnemy).length, 0);
  });

  test('con la mitad caida pasa a la segunda fase y dispara en abanico', () => {
    const sim = enOrbita();
    sim.altitude = sim.targetAltitude;
    orbita(sim, PRESENTACION_S + 0.2);
    const f = sim.formacion;
    f.drones.slice(0, Math.ceil(f.drones.length / 2) + 1).forEach((d) => { d.vivo = false; });
    f.vivos = f.drones.filter((d) => d.vivo).length;
    sim.bullets = [];
    f.fuego.plasma = 0;
    orbita(sim, DT);
    assert.equal(f.furia, true);
    assert.equal(sim.bullets.filter((b) => b.isEnemy).length, 3);
  });
});

describe('sancor.js — derribo punto a punto', () => {
  const formada = () => {
    const sim = enOrbita();
    sim.altitude = sim.targetAltitude;
    orbita(sim, PRESENTACION_S + 0.2);
    sim.bullets = [];
    return sim;
  };

  test('el tiro que le saca la ultima vida voltea el dron, consume la bala, explota y suma puntos', () => {
    const sim = formada();
    const f = sim.formacion;
    // El mas bajo: una bala que sube le pega primero al dron que tiene delante.
    const d = f.drones.reduce((a, x) => (x.cy > a.cy ? x : a));
    d.vida = 1;
    const p = posicionDron(f, d, sim.elapsedSeconds);
    const antes = puntajeEnVivo(sim);
    tiroA(sim, p.x, p.y);
    actualizarProyectiles(sim, DT, crearRng(3), DIMS);
    assert.equal(d.vivo, false);
    assert.equal(f.vivos, f.drones.length - 1);
    assert.equal(sim.dronesSancor, 1);
    assert.equal(sim.bullets.length, 0);
    assert.ok(sim.particles.length > 0);
    assert.equal(puntajeEnVivo(sim) - antes, d.puntos);
  });

  test('SANCOR aguanta tiros: los primeros solo le gastan el blindaje, el ultimo lo voltea y paga sus puntos', () => {
    const sim = formada();
    const f = sim.formacion;
    // Pie de una letra de SANCOR: debajo queda el interlineado, asi la bala no choca otro dron antes.
    const d = f.drones.find((x) => x.palabra === 0 && x.cy === 6);
    const antes = puntajeEnVivo(sim);
    for (let i = 0; i < d.resistencia - 1; i++) {
      const p = posicionDron(f, d, sim.elapsedSeconds);
      tiroA(sim, p.x, p.y);
      actualizarProyectiles(sim, DT, crearRng(3), DIMS);
      assert.equal(sim.bullets.length, 0, 'la bala se consume aunque no voltee');
    }
    assert.equal(d.vivo, true);
    assert.equal(d.vida, 1);
    assert.equal(puntajeEnVivo(sim), antes);
    const p = posicionDron(f, d, sim.elapsedSeconds);
    tiroA(sim, p.x, p.y);
    actualizarProyectiles(sim, DT, crearRng(3), DIMS);
    assert.equal(d.vivo, false);
    assert.equal(puntajeEnVivo(sim) - antes, d.puntos);
  });

  test('una bala rapida no atraviesa la formacion sin pegar', () => {
    const sim = formada();
    const f = sim.formacion;
    const d = f.drones.find((x) => x.vivo);
    const p = posicionDron(f, d, sim.elapsedSeconds);
    sim.bullets.push({ x: p.x, y: p.y + 13, vx: 0, vy: -920, type: 'ship_cannon', damage: 35, life: 1, maxLife: 1 });
    actualizarProyectiles(sim, DT, crearRng(3), DIMS);
    assert.equal(sim.bullets.length, 0);
    assert.equal(f.drones.filter((x) => x.vida < x.resistencia).length, 1);
  });

  test('la EMP le saca una vida a un punado de drones', () => {
    const sim = formada();
    sim.bombStock = 1;
    detonarEmp(sim);
    assert.ok(sim.formacion.drones.some((d) => d.vida < d.resistencia));
    assert.equal(sim.formacion.vivos, sim.formacion.drones.length - sim.dronesSancor);
  });

  test('sin drones vivos cae la formacion y baja la Endurance', () => {
    const sim = formada();
    const f = sim.formacion;
    for (const d of f.drones.slice(1)) d.vivo = false;
    f.vivos = 1;
    const ultimo = f.drones[0];
    ultimo.vida = 1;
    const p = posicionDron(f, ultimo, sim.elapsedSeconds);
    tiroA(sim, p.x, p.y);
    actualizarProyectiles(sim, DT, crearRng(3), DIMS);
    assert.equal(sim.formacion, null);
    assert.equal(sim.formacionDerribada, true);
    orbita(sim, 12);
    assert.equal(sim.enduranceDescending, true);
    assert.equal(sim.fin.estado, 'VICTORY');
  });
});
