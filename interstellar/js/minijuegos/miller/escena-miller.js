// Escena Phaser de Miller: belt-scroller de 480x270 en pixel art. Dibuja la partida, nunca la muta.
// Phaser llega por parametro (lo importa main.js con import()). Coordenadas: x del mundo, y = horizonte + z.
import { frecuenciaPulso, intensidadSenal } from './logica/baliza.js';
import { hex, crearTexturasSprites, crearAnimacionesSprites } from './texturas.js';

const ANCHO = 480;
const ALTO = 270;
const ADELANTO_CAMARA = 170; // el jugador va a un tercio de la pantalla: se ve lo que viene
const MIRADA_OLA = 60; // con la ola revelada, la camara mira un poco hacia ella
const VISTAZO_S = 1.5; // al revelarse la ola, la camara "mira atras" (reemplaza al zoom-out, research R17)
const VISTAZO_PX = 170;
const RECORTE_AGUA = 4; // agua hasta las rodillas: se ocultan las ultimas filas del sprite
const OSCURECER = { lejos: 0, cerca: 0.12, inminente: 0.24 };
const SHAKE = { lejos: 0, cerca: 0.002, inminente: 0.005 };
const VEL_BARRIDO = 320; // gpx/s: la ola sigue barriendo la pantalla tras el fracaso


export function crearEscenaMiller(Phaser, { obtenerPartida, alAvanzar, alCrear, config, paleta, sprites, animaciones, leyenda, reducirMovimiento, topeParticulas }) {
  const { horizonte } = config.mundo;
  const color = (indice) => paleta[indice];

  return class EscenaMiller extends Phaser.Scene {
    constructor() {
      super('miller');
      this.vistazo = 0;
      this.trofeo = 0;
      this.barrido = null;
      this.despegueT = 0;
      this.destellos = [];
      this.nivelVisual = 0;
      this.ultimoPaso = 0;
      this.ultimaOnda = 0;
    }

    create() {
      this.crearTexturas();
      this.crearAnimaciones();
      this.crearFondo();
      this.crearEntidades();
      this.crearParticulas();
      this.olaLejos = this.add.graphics().setScrollFactor(0).setDepth(-5);
      this.ondas = this.add.graphics().setDepth(500);
      this.velo = this.add.rectangle(0, 0, ANCHO, ALTO, color('P0'), 0).setOrigin(0).setScrollFactor(0).setDepth(750);
      this.olaFrente = this.add.graphics().setScrollFactor(0).setDepth(800);
      this.cameras.main.setRoundPixels(true);
      alCrear?.(this);
    }

    // --- Texturas a partir de los mapas de caracteres (sprites.js) ---
    crearTexturas() {
      crearTexturasSprites(this, { sprites, leyenda, paleta });
      this.texturaCielo();
      this.texturaNubes();
      this.texturaAgua();
    }

    crearAnimaciones() {
      crearAnimacionesSprites(this, animaciones);
    }

    // Tramado de dos tonos: transicion de color sin salir de la paleta cerrada.
    tramar(ctx, x, y, ancho, alto, c1, c2, proporcion) {
      for (let j = 0; j < alto; j++) {
        for (let i = 0; i < ancho; i++) {
          const umbral = ((i + j * 2) % 4) / 4;
          ctx.fillStyle = hex(color(proporcion(j / alto) > umbral ? c2 : c1));
          ctx.fillRect(x + i, y + j, 1, 1);
        }
      }
    }

    texturaCielo() {
      if (this.textures.exists('cielo')) return;
      const lienzo = document.createElement('canvas');
      lienzo.width = ANCHO;
      lienzo.height = horizonte;
      const ctx = lienzo.getContext('2d');
      ctx.fillStyle = hex(color('P6'));
      ctx.fillRect(0, 0, ANCHO, horizonte);
      this.tramar(ctx, 0, horizonte * 0.35, ANCHO, horizonte * 0.65, 'P6', 'P5', (f) => f);
      ctx.fillStyle = hex(color('P7'));
      ctx.fillRect(0, horizonte - 2, ANCHO, 1);
      this.textures.addCanvas('cielo', lienzo);
    }

    texturaNubes() {
      if (this.textures.exists('nubes')) return;
      const lienzo = document.createElement('canvas');
      lienzo.width = 256;
      lienzo.height = 50;
      const ctx = lienzo.getContext('2d');
      [[30, 22, 40, 9], [110, 14, 60, 11], [190, 28, 34, 7], [230, 10, 30, 6]].forEach(([x, y, rx, ry]) => {
        ctx.fillStyle = hex(color('P7'));
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = hex(color('P6'));
        ctx.fillRect(x - rx * 0.8, y + ry * 0.5, rx * 1.6, 2);
      });
      this.textures.addCanvas('nubes', lienzo);
    }

    texturaAgua() {
      if (this.textures.exists('agua')) return;
      const alto = ALTO - horizonte;
      const lienzo = document.createElement('canvas');
      lienzo.width = 128;
      lienzo.height = alto;
      const ctx = lienzo.getContext('2d');
      this.tramar(ctx, 0, 0, 128, alto, 'P3', 'P4', (f) => f * 0.9);
      // Vetas de reflejo: el cielo brillante sobre agua plomiza.
      for (let k = 0; k < 40; k++) {
        const y = Math.floor((k * 37) % alto);
        const x = Math.floor((k * 53) % 128);
        ctx.fillStyle = hex(color(y > alto * 0.6 ? 'P5' : 'P4'));
        ctx.fillRect(x, y, 3 + (k % 5) * 2, 1);
      }
      ctx.fillStyle = hex(color('P5'));
      ctx.fillRect(0, 0, 128, 1);
      this.textures.addCanvas('agua', lienzo);
    }

    crearFondo() {
      this.add.image(0, 0, 'cielo').setOrigin(0).setScrollFactor(0).setDepth(-10);
      this.nubes = this.add.tileSprite(0, 24, ANCHO, 50, 'nubes').setOrigin(0).setScrollFactor(0).setDepth(-9);
      this.agua = this.add.tileSprite(0, horizonte, ANCHO, ALTO - horizonte, 'agua').setOrigin(0).setScrollFactor(0).setDepth(-4);
    }

    crearEntidades() {
      const p = obtenerPartida();
      const { ranger, restos, baliza } = p.mapa;
      this.ranger = this.add.sprite(ranger.x, horizonte + ranger.z, 'ranger-quieto0').setOrigin(0.5, 1).setDepth(ranger.z);
      this.ranger.play('ranger-quieto');
      this.restos = restos.map((r) =>
        this.add.sprite(r.x, horizonte + r.z + r.prof / 2, `restos-resto${r.variante}`).setOrigin(0.5, 1).setDepth(r.z),
      );
      this.restos.forEach((s) => s.setCrop(0, 0, 16, 10 - 2));
      this.baliza = this.add.sprite(baliza.x, horizonte + baliza.z, 'baliza-pulso0').setOrigin(0.5, 1).setDepth(baliza.z);
      this.baliza.play('baliza-pulso');
      this.caseRobot = this.add.sprite(p.caseRobot.x, horizonte + p.caseRobot.z, 'caseRobot-quieto0').setOrigin(0.5, 1).setDepth(p.caseRobot.z);
      this.caseRobot.play('case-quieto');
      this.caseRobot.setCrop(0, 0, 12, 28 - RECORTE_AGUA);
      this.astronauta = this.add.sprite(p.jugador.x, horizonte + p.jugador.z, 'astronauta-idle0').setOrigin(0.5, 1);
      this.astronauta.play('astronauta-quieto');
      this.astronauta.setCrop(0, 0, 16, 24 - RECORTE_AGUA);
      this.cameras.main.scrollX = Math.max(0, p.jugador.x - ADELANTO_CAMARA);
    }

    // Reemplaza las entidades del mapa al reintentar (otra semilla, otro mapa).
    reiniciar() {
      [this.ranger, this.baliza, this.caseRobot, this.astronauta, ...this.restos].forEach((s) => s.destroy());
      this.particulas.forEach((q) => {
        q.vida = 0;
      });
      this.ondasActivas.forEach((o) => {
        o.vida = 0;
      });
      this.vistazo = 0;
      this.trofeo = 0;
      this.barrido = null;
      this.despegueT = 0;
      this.crearEntidades();
    }

    // --- Particulas: pool preasignado, sin crear objetos por frame (FR-031) ---
    crearParticulas() {
      this.particulas = Array.from({ length: topeParticulas }, () => ({ x: 0, y: 0, vx: 0, vy: 0, vida: 0, color: 0, tam: 1, gravedad: 0 }));
      this.ondasActivas = Array.from({ length: 12 }, () => ({ x: 0, y: 0, vida: 0 }));
      this.graficoParticulas = this.add.graphics().setDepth(600);
    }

    emitir(n, x, y, { vx = 0, vy = -40, dispersion = 30, colores = ['P6', 'P7'], vida = 0.5, gravedad = 220, tam = 1 } = {}) {
      let emitidas = 0;
      for (const q of this.particulas) {
        if (emitidas >= n) break;
        if (q.vida > 0) continue;
        q.x = x;
        q.y = y;
        q.vx = vx + (Math.random() - 0.5) * dispersion;
        q.vy = vy + (Math.random() - 0.5) * dispersion * 0.6;
        q.vida = vida * (0.6 + Math.random() * 0.6);
        q.color = color(colores[emitidas % colores.length]);
        q.gravedad = gravedad;
        q.tam = tam;
        emitidas++;
      }
    }

    onda(x, y) {
      const o = this.ondasActivas.find((w) => w.vida <= 0);
      if (!o) return;
      o.x = x;
      o.y = y;
      o.vida = 1;
    }

    actualizarParticulas(dt) {
      const g = this.graficoParticulas;
      g.clear();
      for (const q of this.particulas) {
        if (q.vida <= 0) continue;
        q.vida -= dt;
        q.vy += q.gravedad * dt;
        q.x += q.vx * dt;
        q.y += q.vy * dt;
        g.fillStyle(q.color, 1);
        g.fillRect(Math.round(q.x), Math.round(q.y), q.tam, q.tam);
      }
      this.ondas.clear();
      for (const o of this.ondasActivas) {
        if (o.vida <= 0) continue;
        o.vida -= dt * 1.4;
        const r = (1 - o.vida) * 12 + 3;
        this.ondas.lineStyle(1, color('P5'), Math.max(0, o.vida));
        this.ondas.strokeEllipse(Math.round(o.x), Math.round(o.y), r * 2, r * 0.7);
      }
    }

    // --- Eventos de la logica (los reenvia main.js) ---
    evento(nombre) {
      const j = this.astronauta;
      if (nombre === 'baliza') {
        this.trofeo = 1;
        this.vistazo = VISTAZO_S;
        this.emitir(10, j.x, j.y - 18, { vy: -60, colores: ['P14', 'P7'], vida: 0.6 });
      }
      if (nombre === 'choque') this.impacto(j.x, j.y - 6);
      if (nombre === 'impulso') this.emitir(8, j.x, j.y - 4, { vy: -30, colores: ['P10', 'P6'], vida: 0.4 });
      if (nombre === 'fracaso') {
        this.barrido = obtenerPartida().ola.x;
        this.destellar();
      }
      if (nombre === 'despegue') this.despegueT = 0.0001;
    }

    // Hit-stop lo aplica main.js; aca va el shake, el destello y las chispas de oxido.
    impacto(x, y) {
      this.emitir(8, x, y, { vy: -70, dispersion: 60, colores: ['P13', 'P14', 'P7'], vida: 0.4 });
      if (reducirMovimiento) return;
      this.cameras.main.shake(140, 0.008);
      this.destellar();
    }

    // Maximo 3 destellos por segundo (fotosensibilidad, DesignSystem §5.2).
    destellar() {
      if (reducirMovimiento) return;
      const ahora = this.time.now;
      this.destellos = this.destellos.filter((t) => ahora - t < 1000);
      if (this.destellos.length >= 3) return;
      this.destellos.push(ahora);
      const c = color('P7');
      this.cameras.main.flash(60, (c >> 16) & 255, (c >> 8) & 255, c & 255);
    }

    // --- Ola: banda en el horizonte (plano lejano) + pared que barre la franja (planos medio y frente) ---
    dibujarOla(p, tiempo) {
      const lejos = this.olaLejos;
      const frente = this.olaFrente;
      lejos.clear();
      frente.clear();
      if (!p.ola.revelada) return;
      const distancia = Math.max(0, p.ola.x - p.jugador.x);
      const cercania = 1 - Math.min(1, distancia / config.ola.distanciaRevelacion);

      // Al principio es una linea que no se reconoce como ola ("no son montanas").
      const altoLejos = Math.round(2 + cercania * 70);
      lejos.fillStyle(color('P2'), 1);
      lejos.fillRect(0, horizonte - altoLejos, ANCHO, altoLejos);
      lejos.fillStyle(color('P3'), 1);
      lejos.fillRect(0, horizonte - altoLejos, ANCHO, 1);

      const xOla = this.barrido ?? p.ola.x;
      const fx = Math.round(xOla - this.cameras.main.scrollX);
      if (fx > ANCHO + 8) return;
      const alto = Math.round(80 + cercania * 70);
      const techo = horizonte - alto;
      const ritmo = reducirMovimiento ? 0.3 : 1;
      const cuadro = Math.floor((tiempo / 83) * ritmo); // la cresta se anima a 12 fps

      frente.fillStyle(color('P2'), 1);
      frente.fillRect(fx, techo, ANCHO - fx + 8, ALTO - techo);
      // Vetas del cuerpo cayendo (plano medio).
      for (let x = fx + 3; x < ANCHO; x += 7) {
        const y = techo + ((x * 13 + cuadro * 4) % (ALTO - techo));
        frente.fillStyle(color((x / 7) % 2 ? 'P3' : 'P4'), 1);
        frente.fillRect(x, y, 1, 14);
      }
      // Cresta con espuma en el frente, irregular a 12 fps.
      for (let y = techo; y < ALTO; y += 2) {
        const salto = (y * 7 + cuadro * 3) % 5;
        frente.fillStyle(color(salto > 2 ? 'P7' : 'P6'), 1);
        frente.fillRect(fx - salto, y, 2 + salto, 2);
      }
      frente.fillStyle(color('P7'), 1);
      frente.fillRect(fx - 4, techo, ANCHO - fx + 12, 3);
      // Rocio adelantado: llega antes que la ola y avisa.
      if (p.nivel !== 'lejos' && cuadro % 2 === 0) {
        this.emitir(2, this.cameras.main.scrollX + fx - 2, techo + Math.random() * alto, {
          vx: -90,
          vy: -10,
          dispersion: 40,
          gravedad: 30,
          colores: ['P6', 'P7'],
          vida: 0.9,
        });
      }
    }

    // --- Cuadro a cuadro ---
    update(tiempo, delta) {
      const dtReal = Math.min(delta, 100) / 1000;
      alAvanzar(dtReal);
      const p = obtenerPartida();
      const j = p.jugador;
      const cam = this.cameras.main;

      this.vistazo = Math.max(0, this.vistazo - dtReal);
      this.trofeo = Math.max(0, this.trofeo - dtReal);
      const mirada = (p.ola.revelada ? MIRADA_OLA : 0) + (this.vistazo > 0 ? VISTAZO_PX : 0);
      const objetivo = Math.max(0, Math.min(config.mundo.ancho + 160 - ANCHO, j.x - ADELANTO_CAMARA + mirada));
      cam.scrollX += (objetivo - cam.scrollX) * 0.1;
      this.nubes.tilePositionX = cam.scrollX * 0.15;
      this.agua.tilePositionX = cam.scrollX;

      this.dibujarAstronauta(p, dtReal, tiempo);
      this.dibujarCompaneros(p, dtReal);
      this.dibujarRanger(p, dtReal);

      if (this.barrido !== null) this.barrido -= VEL_BARRIDO * dtReal;
      this.dibujarOla(p, tiempo);

      const meta = OSCURECER[p.nivel] ?? 0;
      this.nivelVisual += (meta - this.nivelVisual) * 0.05;
      this.velo.setFillStyle(color('P0'), this.nivelVisual);
      if (!reducirMovimiento && SHAKE[p.nivel] && !cam.shakeEffect.isRunning && p.fase !== 'exito') cam.shake(220, SHAKE[p.nivel]);

      this.actualizarParticulas(dtReal);
    }

    dibujarAstronauta(p, dt, tiempo) {
      const j = p.jugador;
      const s = this.astronauta;
      const y = horizonte + j.z;
      s.setPosition(Math.round(j.x), Math.round(y)).setDepth(j.z + 0.5);
      s.setFlipX(j.mirando === 'izq');
      const velocidad = Math.hypot(j.vx, j.vz);

      let anim = 'astronauta-quieto';
      if (p.fase === 'exito') {
        s.setVisible(false);
        return;
      }
      if (p.fase === 'fracaso') anim = 'astronauta-tambaleo';
      else if (j.aturdidoS > 0) anim = 'astronauta-aturdido';
      else if (this.trofeo > 0 && velocidad < 12) anim = 'astronauta-trofeo';
      else if (velocidad > 10) anim = 'astronauta-correr';
      else if (j.quietoS > 3) anim = 'astronauta-reloj';
      s.play(anim, true);
      s.setVisible(true);

      // Chapoteo con peso: gotas en cada pisada y ondas alrededor de las rodillas.
      if (velocidad > 10 && tiempo - this.ultimoPaso > 140) {
        this.ultimoPaso = tiempo;
        this.emitir(2 + Math.floor(Math.random() * 3), j.x, y - RECORTE_AGUA, { vx: -j.vx * 0.2, vy: -55, colores: ['P6', 'P7', 'P5'] });
      }
      if (velocidad > 4 && tiempo - this.ultimaOnda > 380) {
        this.ultimaOnda = tiempo;
        this.onda(j.x, y - RECORTE_AGUA + 1);
      }
    }

    dibujarCompaneros(p, dt) {
      const { baliza } = p.mapa;
      if (!p.balizaRecogida) {
        const intensidad = intensidadSenal(p.jugador, baliza, config);
        this.baliza.anims.timeScale = frecuenciaPulso(intensidad, config) / 3;
        this.baliza.setVisible(true);
      } else if (this.trofeo > 0) {
        // Pose de trofeo: la baliza en alto un segundo, despues va guardada.
        this.baliza.setPosition(this.astronauta.x, this.astronauta.y - 22).setDepth(this.astronauta.depth + 0.1);
      } else {
        this.baliza.setVisible(false);
      }

      const c = p.caseRobot;
      const asistiendo = c.impulsoS > 0;
      const destinoX = asistiendo ? p.jugador.x - 16 : c.x;
      const destinoZ = asistiendo ? Math.max(0, p.jugador.z - 4) : c.z;
      const s = this.caseRobot;
      const xActual = s.x + (destinoX - s.x) * 0.2;
      const zActual = s.depth + (destinoZ - s.depth) * 0.2;
      s.setPosition(Math.round(xActual), Math.round(horizonte + zActual)).setDepth(zActual);
      s.play(asistiendo ? 'case-aspa' : 'case-quieto', true);
    }

    dibujarRanger(p, dt) {
      const s = this.ranger;
      const { ranger } = p.mapa;
      const base = horizonte + ranger.z;
      if (this.despegueT > 0) {
        // Despegue: tiembla, se hunde 2 gpx y sale disparado con stretch.
        this.despegueT += dt;
        const t = this.despegueT;
        const subida = t < 0.25 ? -2 : (t - 0.25) ** 2 * 260;
        s.setPosition(ranger.x + (t < 0.25 ? Math.round(Math.sin(t * 90)) : 0), Math.round(base - subida));
        s.setScale(1, t > 0.25 && t < 0.6 ? 1.12 : 1);
        s.play('ranger-despegue', true);
        s.setCrop();
        this.emitir(3, ranger.x - 8 + Math.random() * 16, s.y, { vy: 30, dispersion: 50, colores: ['P6', 'P5', 'P7'], gravedad: -20, vida: 0.8 });
        return;
      }
      const cargando = p.despegue.carga > 0 && p.fase === 'despegue';
      s.setPosition(ranger.x + (cargando && !reducirMovimiento ? Math.round(Math.sin(this.time.now / 25) * p.despegue.carga) : 0), base);
      s.play(cargando ? 'ranger-despegue' : 'ranger-quieto', true);
      s.setCrop(0, 0, 96, 40 - RECORTE_AGUA);
      if (cargando && Math.random() < p.despegue.carga) {
        this.emitir(1, ranger.x - 30 + Math.random() * 60, base - 2, { vy: -40, colores: ['P6', 'P7'], vida: 0.4 });
      }
    }
  };
}
