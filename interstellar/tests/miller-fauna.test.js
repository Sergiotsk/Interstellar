// Fase 1 con enemigos: drones y alimanas (los tipos bio_drone y trench_lurker que el original declaraba sin implementar),
// autoapuntado y el arreglo de los disparos que desaparecian lejos del origen.
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../js/minijuegos/miller/config.js';
import { crearRng } from '../js/minijuegos/miller/logica/azar.js';
import { crearSim } from '../js/minijuegos/miller/logica/estado.js';
import { generarFauna, moverFauna, crearDron, crearAlimana, crearCangrejo, emboscada, esFauna } from '../js/minijuegos/miller/logica/fauna.js';
import { actualizarSuperficie } from '../js/minijuegos/miller/logica/superficie.js';
import { actualizarProyectiles } from '../js/minijuegos/miller/logica/proyectiles.js';

const DT = 1 / 60;
const DIMS = { ancho: 960, alto: 540 };
const F = CONFIG.fauna;
const QUIETO = { left: false, right: false, up: false, down: false, confirm: false, tap: false, pointerDown: false };
const fijo = (v) => () => v;
const nueva = () => Object.assign(crearSim(CONFIG, crearRng(4), DIMS), { phase: 'EXPLORATION' });
const sonidos = (sim) => sim.sonidos.map(([m]) => m);
const correrFauna = (sim, seg, rng = crearRng(9)) => {
  for (let i = 0; i < Math.round(seg / DT); i++) {
    sim.elapsedSeconds += DT;
    moverFauna(sim, DT, CONFIG, rng);
  }
};

describe('fauna.js — aparicion', () => {
  test('nada aparece en la gracia inicial; despues aparecen fuera de pantalla', () => {
    const sim = nueva();
    sim.elapsedSeconds = F.primerSpawnS - 0.5;
    generarFauna(sim, DT, CONFIG, crearRng(1));
    assert.equal(sim.enemies.length, 0);
    sim.elapsedSeconds = F.primerSpawnS + 0.1;
    sim.faunaTimer = 0;
    generarFauna(sim, DT, CONFIG, crearRng(1));
    assert.equal(sim.enemies.length, 1);
    const e = sim.enemies[0];
    assert.ok(['bio_drone', 'trench_lurker', 'tide_crab'].includes(e.type));
    const d = Math.hypot(e.x - sim.playerX, e.y - sim.playerY);
    assert.ok(d >= F.distanciaSpawn[0] && d <= F.distanciaSpawn[1], `distancia ${d}`);
  });

  test('respeta el tope de enemigos vivos', () => {
    const sim = nueva();
    sim.elapsedSeconds = 100;
    for (let i = 0; i < 50; i++) {
      sim.faunaTimer = 0;
      generarFauna(sim, DT, CONFIG, crearRng(i));
    }
    assert.equal(sim.enemies.length, F.maxVivos);
  });

  test('en la huida (primera carga recogida) aparecen mas seguido', () => {
    const sim = nueva();
    sim.elapsedSeconds = 100;
    generarFauna(sim, DT, CONFIG, fijo(0.99));
    const normal = sim.faunaTimer;
    const huida = nueva();
    huida.elapsedSeconds = 100;
    huida.huida = true;
    generarFauna(huida, DT, CONFIG, fijo(0.99));
    assert.ok(huida.faunaTimer < normal);
  });
});

describe('fauna.js — mas presion por cada carga a bordo', () => {
  test('el tope de vivos sube con cada carga cargada', () => {
    const vivos = (cargas) => {
      const sim = nueva();
      Object.assign(sim, { elapsedSeconds: 100, huida: true, cargasCargadas: cargas });
      for (let i = 0; i < 80; i++) {
        sim.faunaTimer = 0;
        generarFauna(sim, DT, CONFIG, crearRng(i));
      }
      return sim.enemies.length;
    };
    assert.equal(vivos(0), F.huida.maxVivos);
    assert.equal(vivos(2), F.huida.maxVivos + 2 * F.huida.porCarga.maxVivos);
  });

  test('el intervalo se acorta con cada carga cargada', () => {
    const intervalo = (cargas) => {
      const sim = nueva();
      Object.assign(sim, { elapsedSeconds: 100, huida: true, cargasCargadas: cargas });
      generarFauna(sim, DT, CONFIG, fijo(0.99));
      return sim.faunaTimer;
    };
    assert.ok(Math.abs(intervalo(2) - intervalo(0) * F.huida.porCarga.factorIntervalo ** 2) < 1e-9);
  });

  test('la emboscada respeta el tope que sube con las cargas', () => {
    const sim = nueva();
    Object.assign(sim, { huida: true, cargasCargadas: 1 });
    for (let i = 0; i < 8; i++) emboscada(sim, CONFIG, crearRng(i));
    assert.equal(sim.enemies.filter(esFauna).length, F.huida.maxVivos + F.huida.porCarga.maxVivos);
  });
});

describe('fauna.js — cangrejo kamikaze', () => {
  test('corre por el suelo hacia el jugador', () => {
    const sim = nueva();
    sim.enemies.push(crearCangrejo(sim, sim.playerX + 300, sim.playerY));
    correrFauna(sim, 0.5);
    const c = sim.enemies[0];
    assert.equal(c.type, 'tide_crab');
    assert.equal(c.z, 0);
    const d = Math.hypot(c.x - sim.playerX, c.y - sim.playerY);
    assert.ok(Math.abs(d - (300 - F.cangrejo.vel * 0.5)) < 2, `distancia ${d}`);
  });

  test('cerca se arma, explota y dania', () => {
    const sim = nueva();
    sim.enemies.push(crearCangrejo(sim, sim.playerX + 30, sim.playerY));
    correrFauna(sim, DT);
    assert.equal(sim.enemies[0].state, 'armado');
    assert.equal(sim.playerShieldHp, 100, 'avisa antes de explotar');
    correrFauna(sim, F.cangrejo.armado + 0.05);
    assert.equal(sim.enemies.length, 0);
    assert.equal(sim.playerShieldHp, 100 - F.cangrejo.danio);
    assert.ok(sonidos(sim).includes('playExplosion'));
  });

  test('si te alejas mientras se arma, la explosion no te alcanza', () => {
    const sim = nueva();
    sim.enemies.push(crearCangrejo(sim, sim.playerX + 30, sim.playerY));
    correrFauna(sim, DT);
    sim.playerX += F.cangrejo.radioExplosion + 100;
    correrFauna(sim, F.cangrejo.armado + 0.05);
    assert.equal(sim.enemies.length, 0);
    assert.equal(sim.playerShieldHp, 100);
  });

  test('saltando por encima de la explosion no dania', () => {
    const sim = nueva();
    sim.enemies.push(crearCangrejo(sim, sim.playerX + 30, sim.playerY));
    correrFauna(sim, DT);
    sim.playerZ = 40;
    correrFauna(sim, F.cangrejo.armado + 0.05);
    assert.equal(sim.playerShieldHp, 100);
  });

  test('muerto a tiros no explota ni dania, y suma la baja', () => {
    const sim = nueva();
    const c = crearCangrejo(sim, sim.playerX + 20, sim.playerY);
    sim.enemies.push(c);
    sim.bullets.push({ x: c.x, y: c.y, vx: 0, vy: 0, type: 'pulse', damage: F.cangrejo.hp, life: 1, maxLife: 1 });
    actualizarProyectiles(sim, DT, fijo(0.9), DIMS);
    assert.equal(sim.enemies.length, 0);
    assert.equal(sim.enemiesDestroyed, 1);
    assert.equal(sim.playerShieldHp, 100);
  });
});

describe('fauna.js — dron', () => {
  test('flota a su altura, se acerca hasta su distancia y dispara plasma al jugador', () => {
    const sim = nueva();
    sim.enemies.push(crearDron(sim, sim.playerX + 600, sim.playerY));
    correrFauna(sim, 6);
    const dron = sim.enemies[0];
    assert.equal(dron.z, F.dron.z);
    const d = Math.hypot(dron.x - sim.playerX, dron.y - sim.playerY);
    assert.ok(d < 600 - 100, `no se acerco: ${d}`);
    const balas = sim.bullets.filter((b) => b.isEnemy && b.type === 'drone_plasma');
    assert.ok(balas.length >= 2);
    assert.equal(balas[0].damage, F.dron.danio);
    assert.ok(sonidos(sim).includes('playEnemyLaser'));
  });
});

describe('fauna.js — alimana', () => {
  test('sumergida avanza hacia el jugador; cerca salta, cae y vuelve a hundirse', () => {
    const sim = nueva();
    sim.enemies.push(crearAlimana(sim, sim.playerX + 400, sim.playerY));
    const a = sim.enemies[0];
    assert.equal(a.state, 'submerged');
    const estados = new Set();
    for (let i = 0; i < 60 * 12; i++) {
      sim.elapsedSeconds += DT;
      moverFauna(sim, DT, CONFIG, crearRng(i));
      estados.add(a.state);
    }
    assert.ok(estados.has('leap'), 'nunca salto');
    assert.ok(estados.has('aiming'), 'nunca escupio');
    assert.ok(sim.bullets.some((b) => b.type === 'lurker_spit'));
  });

  test('si cae encima del jugador lo muerde', () => {
    const sim = nueva();
    const a = crearAlimana(sim, sim.playerX, sim.playerY);
    Object.assign(a, { state: 'leap', z: 1, vz: -50 });
    sim.enemies.push(a);
    moverFauna(sim, DT, CONFIG, crearRng(1));
    assert.equal(sim.playerShieldHp, 100 - F.alimana.danioMordida);
  });
});

describe('fauna.js — la ola los barre', () => {
  test('un enemigo detras del frente de la ola desaparece', () => {
    const sim = nueva();
    const dir = { x: Math.cos(sim.waveAngle), y: Math.sin(sim.waveAngle) };
    sim.enemies.push(crearDron(sim, dir.x * (sim.waveDistance + 50), dir.y * (sim.waveDistance + 50)));
    moverFauna(sim, DT, CONFIG, crearRng(1));
    assert.equal(sim.enemies.length, 0);
  });
});

describe('superficie.js — autoapuntado y fijacion', () => {
  test('fija al enemigo mas cercano dentro del rango y del cono, y suena la fijacion', () => {
    const sim = nueva();
    sim.aimAngle = 0;
    sim.enemies.push(crearDron(sim, sim.playerX + 250, sim.playerY + 60));
    actualizarSuperficie(sim, QUIETO, DT, CONFIG, crearRng(1));
    assert.equal(sim.hasTargetLock, true);
    assert.ok(sonidos(sim).includes('playTargetLock'));
    assert.equal(sim.crosshairX, sim.enemies[0].x);
  });

  test('no fija enemigos a la espalda, fuera de rango ni sumergidos', () => {
    const atras = nueva();
    atras.aimAngle = 0;
    atras.enemies.push(crearDron(atras, atras.playerX - 200, atras.playerY));
    actualizarSuperficie(atras, QUIETO, DT, CONFIG, crearRng(1));
    assert.equal(atras.hasTargetLock, false);

    const lejos = nueva();
    lejos.aimAngle = 0;
    lejos.enemies.push(crearDron(lejos, lejos.playerX + F.autoapuntado.rango + 80, lejos.playerY));
    actualizarSuperficie(lejos, QUIETO, DT, CONFIG, crearRng(1));
    assert.equal(lejos.hasTargetLock, false);

    const agua = nueva();
    agua.aimAngle = 0;
    agua.enemies.push(crearAlimana(agua, agua.playerX + 150, agua.playerY));
    actualizarSuperficie(agua, QUIETO, DT, CONFIG, crearRng(1));
    assert.equal(agua.hasTargetLock, false);
  });
});

describe('proyectiles.js — disparos en la superficie', () => {
  test('lejos del origen los disparos no desaparecen al nacer (bug del original)', () => {
    const sim = nueva();
    Object.assign(sim, { playerX: 400, playerY: -500, camX: 450, camY: -500 });
    sim.bullets.push({ x: 420, y: -506, vx: 880, vy: 0, type: 'pulse', damage: 26, life: 1.3, maxLife: 1.3 });
    actualizarProyectiles(sim, DT, crearRng(1), DIMS);
    assert.equal(sim.bullets.length, 1);
  });

  test('se descartan cuando salen de la vista de la camara', () => {
    const sim = nueva();
    Object.assign(sim, { camX: 0, camY: 0 });
    sim.bullets.push({ x: 600, y: 0, vx: 880, vy: 0, type: 'pulse', damage: 26, life: 1.3, maxLife: 1.3 });
    actualizarProyectiles(sim, DT, crearRng(1), DIMS);
    assert.equal(sim.bullets.length, 0);
  });

  test('pegarle a un dron cuenta su altura; matarlo suma a enemiesDestroyed', () => {
    const sim = nueva();
    const dron = crearDron(sim, 200, 100);
    dron.hp = 10;
    sim.enemies.push(dron);
    sim.bullets.push({ x: 200, y: 100 - F.dron.z, vx: 0, vy: 0, type: 'pulse', damage: 26, life: 1, maxLife: 1 });
    actualizarProyectiles(sim, DT, fijo(0.9), DIMS);
    assert.equal(sim.enemies.length, 0);
    assert.equal(sim.enemiesDestroyed, 1);
    assert.equal(sim.aerialInterceptorsDowned, 0);
  });

  test('una alimana sumergida no recibe disparos', () => {
    const sim = nueva();
    sim.enemies.push(crearAlimana(sim, 200, 100));
    sim.bullets.push({ x: 200, y: 100, vx: 0, vy: 0, type: 'pulse', damage: 26, life: 1, maxLife: 1 });
    actualizarProyectiles(sim, DT, fijo(0.9), DIMS);
    assert.equal(sim.enemies[0].hp, F.alimana.hp);
    assert.equal(sim.bullets.length, 1);
  });
});
