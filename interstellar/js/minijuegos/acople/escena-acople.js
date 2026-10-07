// Unica escena Phaser del acople: vista desde la cabina (research R2). Dibuja la partida, nunca la muta.
// Phaser llega por parametro: este modulo no lo importa (lo carga main.js con import()).

const ESTRELLAS = 260;
const RADIO_ANILLO = 100; // unidades locales del dibujo de la estacion
const RADIO_HUB = 22;
const ESCALA_PANTALLA = 0.42; // radio del anillo en contacto, como fraccion del lado menor
const SUAVIZADO_DISTANCIA = 80; // u: cuanto tarda la estacion en "crecer" al acercarse

export function crearEscenaAcople(Phaser, { obtenerPartida, alAvanzar, obtenerNivel, paleta, reducirMovimiento }) {
  return class EscenaAcople extends Phaser.Scene {
    constructor() {
      super('acople');
      this.nivelDibujado = null;
      this.faseAnterior = null;
      this.giroResidual = 0;
      this.giroAcumulado = 0;
      this.rechazosVistos = 0;
    }

    create() {
      this.crearTexturaChispa();
      this.estrellas = this.add.graphics();
      this.estacion = this.add.graphics();
      this.reticula = this.add.graphics();
      this.nave = this.add.graphics();
      this.crearPropulsores();
      this.dibujarEstrellas();
      this.reubicar(this.scale.width, this.scale.height);
      this.scale.on('resize', (tam) => this.reubicar(tam.width, tam.height));
    }

    crearTexturaChispa() {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture('acople-chispa', 8, 8);
      g.destroy();
    }

    crearPropulsores() {
      const base = {
        lifespan: 380,
        scale: { start: 0.7, end: 0 },
        alpha: { start: 0.8, end: 0 },
        tint: paleta.texto,
        blendMode: 'ADD',
        frequency: 18,
        emitting: false,
      };
      this.rcsIzquierdo = this.add.particles(0, 0, 'acople-chispa', { ...base, speed: { min: 90, max: 160 }, angle: { min: 190, max: 220 } });
      this.rcsDerecho = this.add.particles(0, 0, 'acople-chispa', { ...base, speed: { min: 90, max: 160 }, angle: { min: -40, max: -10 } });
      this.motor = this.add.particles(0, 0, 'acople-chispa', { ...base, tint: paleta.teal, speed: { min: 140, max: 240 }, angle: { min: 80, max: 100 } });
      this.retro = this.add.particles(0, 0, 'acople-chispa', { ...base, speed: { min: 120, max: 200 }, angle: { min: 255, max: 285 } });
    }

    reubicar(ancho, alto) {
      this.centro = { x: ancho / 2, y: alto / 2 };
      this.ladoMenor = Math.min(ancho, alto);
      this.estrellas.setPosition(this.centro.x, this.centro.y);
      this.estacion.setPosition(this.centro.x, this.centro.y);
      this.dibujarNave(ancho, alto);
      this.rcsIzquierdo.setPosition(this.centro.x - this.ladoMenor * 0.22, alto - 34);
      this.rcsDerecho.setPosition(this.centro.x + this.ladoMenor * 0.22, alto - 34);
      this.motor.setPosition(this.centro.x, alto - 8);
      this.retro.setPosition(this.centro.x, alto - this.ladoMenor * 0.12);
      if (this.radioEstrellas < Math.hypot(ancho, alto) / 2) this.dibujarEstrellas();
    }

    dibujarEstrellas() {
      const radio = Math.hypot(this.scale.width, this.scale.height) / 2 + 40;
      this.radioEstrellas = radio;
      const g = this.estrellas;
      g.clear();
      for (let i = 0; i < ESTRELLAS; i += 1) {
        // Distribucion uniforme en el disco: sqrt del azar en el radio.
        const r = Math.sqrt(Math.random()) * radio;
        const a = Math.random() * Math.PI * 2;
        g.fillStyle(paleta.texto, 0.25 + Math.random() * 0.6);
        g.fillCircle(Math.cos(a) * r, Math.sin(a) * r, Math.random() < 0.08 ? 1.6 : 0.9);
      }
    }

    colorDeNivel(nivel) {
      if (nivel === 'peligro') return paleta.alerta;
      if (nivel === 'atencion') return paleta.ambar;
      if (nivel === 'seguro') return paleta.teal;
      return paleta.texto;
    }

    dibujarEstacion(nivel) {
      const g = this.estacion;
      const color = this.colorDeNivel(nivel);
      g.clear();
      g.lineStyle(5, paleta.texto, 0.85);
      g.strokeCircle(0, 0, RADIO_ANILLO);
      for (let i = 0; i < 12; i += 1) {
        const a = (i / 12) * Math.PI * 2;
        g.fillStyle(paleta.texto, 0.9);
        g.fillCircle(Math.cos(a) * RADIO_ANILLO, Math.sin(a) * RADIO_ANILLO, 8);
      }
      g.lineStyle(2, paleta.texto, 0.5);
      for (let i = 0; i < 4; i += 1) {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        g.lineBetween(Math.cos(a) * RADIO_HUB, Math.sin(a) * RADIO_HUB, Math.cos(a) * RADIO_ANILLO, Math.sin(a) * RADIO_ANILLO);
      }
      g.lineStyle(3, color, 1);
      g.strokeCircle(0, 0, RADIO_HUB);
      // Ranura del puerto: apunta hacia arriba cuando el angulo relativo es 0.
      g.fillStyle(color, 1);
      g.fillRect(-4, -RADIO_HUB - 12, 8, 14);
    }

    dibujarNave(ancho, alto) {
      const g = this.nave;
      const cx = ancho / 2;
      const ala = this.ladoMenor * 0.3;
      g.clear();
      g.fillStyle(paleta.fondo, 0.92);
      g.lineStyle(2, paleta.texto, 0.55);
      g.beginPath();
      g.moveTo(cx - ala, alto);
      g.lineTo(cx - ala * 0.35, alto - this.ladoMenor * 0.1);
      g.lineTo(cx + ala * 0.35, alto - this.ladoMenor * 0.1);
      g.lineTo(cx + ala, alto);
      g.closePath();
      g.fillPath();
      g.strokePath();
    }

    dibujarReticula(radioHub, nivel) {
      const g = this.reticula;
      const { x, y } = this.centro;
      const color = this.colorDeNivel(nivel);
      g.clear();
      g.lineStyle(1, color, 0.6);
      g.strokeCircle(x, y, radioHub + 18);
      // Marca de enganche fija: la ranura del puerto tiene que quedar debajo de esta flecha.
      g.fillStyle(color, 0.95);
      const tope = y - radioHub - 26;
      g.fillTriangle(x - 8, tope - 10, x + 8, tope - 10, x, tope);
    }

    actualizarPropulsores(acciones, activo) {
      const encender = (emisor, on) => {
        if (on && !emisor.emitting) emisor.start();
        if (!on && emisor.emitting) emisor.stop();
      };
      encender(this.rcsIzquierdo, activo && acciones.has('rotarDerecha'));
      encender(this.rcsDerecho, activo && acciones.has('rotarIzquierda'));
      encender(this.motor, activo && acciones.has('impulso'));
      encender(this.retro, activo && acciones.has('freno'));
    }

    reaccionarAFin(partida) {
      const camara = this.cameras.main;
      if (partida.fase === 'fallida') {
        const c = Phaser.Display.Color.IntegerToRGB(paleta.alerta);
        camara.flash(280, c.r, c.g, c.b);
        if (partida.desenlace.causa === 'impacto' && !reducirMovimiento) camara.shake(450, 0.02);
        if (partida.desenlace.causa === 'control') this.giroResidual = partida.nave.velAngular;
      } else if (partida.fase === 'acoplada') {
        const c = Phaser.Display.Color.IntegerToRGB(paleta.teal);
        camara.flash(400, c.r, c.g, c.b);
      }
    }

    update(_tiempo, delta) {
      alAvanzar(delta / 1000);
      const partida = obtenerPartida();
      const nivel = obtenerNivel();

      if (partida.fase !== this.faseAnterior) {
        if (partida.fase === 'en-curso' || partida.fase === 'intro') {
          this.giroResidual = 0;
          this.giroAcumulado = 0;
        }
        if (this.faseAnterior === 'en-curso') this.reaccionarAFin(partida);
        this.faseAnterior = partida.fase;
      }
      // Acople rechazado: destello ambar breve (sin sacudida: no es un choque).
      if (partida.rechazos > this.rechazosVistos) {
        const c = Phaser.Display.Color.IntegerToRGB(paleta.ambar);
        this.cameras.main.flash(180, c.r, c.g, c.b);
      }
      this.rechazosVistos = partida.rechazos;

      if (nivel !== this.nivelDibujado) {
        this.dibujarEstacion(nivel);
        this.nivelDibujado = nivel;
      }

      // Tras perder el control, la nave sigue girando sola: solo visual.
      this.giroAcumulado += this.giroResidual * (delta / 1000);
      const anguloNave = partida.nave.angulo + this.giroAcumulado;

      const { nave, estacion } = partida;
      const escala = (this.ladoMenor * ESCALA_PANTALLA * SUAVIZADO_DISTANCIA) / (nave.distancia + SUAVIZADO_DISTANCIA) / RADIO_ANILLO;
      this.estacion.setScale(escala);
      this.estacion.setRotation(estacion.angulo + estacion.anguloPuerto - anguloNave);
      this.estrellas.setRotation(reducirMovimiento ? 0 : -anguloNave);
      this.dibujarReticula(RADIO_HUB * escala, nivel);

      const enCurso = partida.fase === 'en-curso';
      this.actualizarPropulsores(partida.acciones, enCurso && nave.combustible > 0);
      if (enCurso && nivel === 'peligro' && !reducirMovimiento && !this.cameras.main.shakeEffect.isRunning) {
        this.cameras.main.shake(160, 0.003);
      }
    }
  };
}
