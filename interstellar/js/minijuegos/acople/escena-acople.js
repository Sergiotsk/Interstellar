// Unica escena Phaser del acople: vista desde la cabina (research R2). Dibuja la partida, nunca la muta.
// Phaser llega por parametro: este modulo no lo importa (lo carga main.js con import()).

const ESTRELLAS = 260;
const RADIO_ANILLO = 100; // unidades locales del dibujo de la estacion
const RADIO_HUB = 22;
const ESCALA_PANTALLA = 0.42; // radio del anillo en contacto, como fraccion del lado menor
const SUAVIZADO_DISTANCIA = 80; // u: cuanto tarda la estacion en "crecer" al acercarse

// obtenerConsola() -> { alto, anchoMax } en px: la consola es DOM; la escena solo necesita su silueta.
export function crearEscenaAcople(Phaser, { obtenerPartida, alAvanzar, obtenerNivel, paleta, reducirMovimiento, obtenerConsola }) {
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
      this.graficoPolvo = this.add.graphics();
      this.estacion = this.add.graphics();
      this.lucesEstacion = this.add.graphics();
      this.reticula = this.add.graphics();
      this.crearPropulsores();
      this.crearPolvoEspacial();
      this.dibujarEstrellas();
      this.reubicar(this.scale.width, this.scale.height);
      this.scale.on('resize', (tam) => this.reubicar(tam.width, tam.height));
    }

    crearPolvoEspacial() {
      this.polvo = Array.from({ length: 70 }, () => ({
        angulo: Math.random() * Math.PI * 2,
        distanciaNorm: Math.random(),
        velocidadFactor: 0.6 + Math.random() * 0.8,
        radio: 0.8 + Math.random() * 1.3,
        alfa: 0.2 + Math.random() * 0.45,
      }));
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
      // Motor principal: dos toberas a los costados de la consola, escape hacia afuera y abajo.
      this.motorIzquierdo = this.add.particles(0, 0, 'acople-chispa', { ...base, tint: paleta.teal, speed: { min: 140, max: 240 }, angle: { min: 125, max: 150 } });
      this.motorDerecho = this.add.particles(0, 0, 'acople-chispa', { ...base, tint: paleta.teal, speed: { min: 140, max: 240 }, angle: { min: 30, max: 55 } });
      this.retro = this.add.particles(0, 0, 'acople-chispa', { ...base, speed: { min: 120, max: 200 }, angle: { min: 255, max: 285 } });
    }

    reubicar(ancho, alto) {
      // El espacio "util" es lo que queda por encima de la consola: ahi se centra la estacion.
      const consola = obtenerConsola();
      const techo = alto - consola.alto;
      const anchoConsola = Math.min(consola.anchoMax, ancho * 0.94);
      const cx = ancho / 2;
      this.centro = { x: cx, y: techo / 2 };
      this.ladoMenor = Math.min(ancho, techo);
      this.estrellas.setPosition(cx, alto / 2);
      this.graficoPolvo.setPosition(cx, alto / 2);
      this.estacion.setPosition(this.centro.x, this.centro.y);
      // Esquinas superiores del trapecio (clip-path 6%-94%) y mitad de sus lados.
      this.rcsIzquierdo.setPosition(cx - anchoConsola * 0.44, techo);
      this.rcsDerecho.setPosition(cx + anchoConsola * 0.44, techo);
      this.motorIzquierdo.setPosition(cx - anchoConsola * 0.47, techo + consola.alto * 0.5);
      this.motorDerecho.setPosition(cx + anchoConsola * 0.47, techo + consola.alto * 0.5);
      this.retro.setPosition(cx, techo);
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

      // Armazon circular concéntrico (truss del anillo)
      g.lineStyle(1.5, paleta.texto, 0.4);
      g.strokeCircle(0, 0, RADIO_ANILLO - 7);
      g.strokeCircle(0, 0, RADIO_ANILLO + 7);
      g.lineStyle(2.5, paleta.texto, 0.7);
      g.strokeCircle(0, 0, RADIO_ANILLO);

      // 12 módulos habitables prismáticos orientados tangencialmente
      const hl = 8.5; // semilargo tangencial
      const hw = 5.5; // semiancho radial
      for (let i = 0; i < 12; i += 1) {
        const a = (i / 12) * Math.PI * 2;
        const cosA = Math.cos(a);
        const sinA = Math.sin(a);
        const cx = cosA * RADIO_ANILLO;
        const cy = sinA * RADIO_ANILLO;
        const tx = -sinA;
        const ty = cosA;

        // Vértices del módulo rectangular rotado
        const p1 = { x: cx - tx * hl - cosA * hw, y: cy - ty * hl - sinA * hw };
        const p2 = { x: cx + tx * hl - cosA * hw, y: cy + ty * hl - sinA * hw };
        const p3 = { x: cx + tx * hl + cosA * hw, y: cy + ty * hl + sinA * hw };
        const p4 = { x: cx - tx * hl + cosA * hw, y: cy - ty * hl + sinA * hw };

        // Fuselaje con relleno metálico oscuro y borde claro
        g.fillStyle(paleta.fondo, 0.95);
        g.fillPoints([p1, p2, p3, p4], true);
        g.lineStyle(1.8, paleta.texto, 0.95);
        g.strokePoints([p1, p2, p3, p4], true);

        // Ventana / textura central del módulo
        g.lineStyle(1, paleta.texto, 0.5);
        g.lineBetween(cx - tx * 3, cy - ty * 3, cx + tx * 3, cy + ty * 3);

        // Paneles radiadores disipadores en módulos pares
        if (i % 2 === 0) {
          g.lineStyle(1.2, paleta.texto, 0.45);
          g.lineBetween(cx + cosA * hw, cy + sinA * hw, cx + cosA * (hw + 5), cy + sinA * (hw + 5));
        }
      }

      // 4 brazos estructurales dobles con celosía hacia el hub
      for (let i = 0; i < 4; i += 1) {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const deltaA = 0.04;
        const a1 = a - deltaA;
        const a2 = a + deltaA;

        g.lineStyle(1.5, paleta.texto, 0.65);
        g.lineBetween(Math.cos(a1) * RADIO_HUB, Math.sin(a1) * RADIO_HUB, Math.cos(a - 0.015) * (RADIO_ANILLO - 7), Math.sin(a - 0.015) * (RADIO_ANILLO - 7));
        g.lineBetween(Math.cos(a2) * RADIO_HUB, Math.sin(a2) * RADIO_HUB, Math.cos(a + 0.015) * (RADIO_ANILLO - 7), Math.sin(a + 0.015) * (RADIO_ANILLO - 7));

        // Travesaños diagonales de celosía
        for (let k = 0.35; k <= 0.85; k += 0.25) {
          const rK = RADIO_HUB + (RADIO_ANILLO - 7 - RADIO_HUB) * k;
          g.lineStyle(1, paleta.texto, 0.4);
          g.lineBetween(Math.cos(a1) * rK, Math.sin(a1) * rK, Math.cos(a2) * (rK + 6), Math.sin(a2) * (rK + 6));
        }
      }

      // Hub de atraque central cilíndrico
      g.fillStyle(paleta.fondo, 0.95);
      g.fillCircle(0, 0, RADIO_HUB);
      g.lineStyle(2, paleta.texto, 0.5);
      g.strokeCircle(0, 0, RADIO_HUB * 0.6);
      g.lineStyle(3, color, 1);
      g.strokeCircle(0, 0, RADIO_HUB);

      // Ranura guía del puerto de acople (apunta a -Y cuando ángulo relativo es 0)
      g.fillStyle(color, 1);
      g.fillRect(-5, -RADIO_HUB - 13, 10, 15);

      // Muescas guía trapezoidales
      g.fillTriangle(-5, -RADIO_HUB - 13, -11, -RADIO_HUB - 7, -5, -RADIO_HUB - 7);
      g.fillTriangle(5, -RADIO_HUB - 13, 11, -RADIO_HUB - 7, 5, -RADIO_HUB - 7);
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
      encender(this.motorIzquierdo, activo && acciones.has('impulso'));
      encender(this.motorDerecho, activo && acciones.has('impulso'));
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

    actualizarPolvo(nave, dt, anguloNave) {
      const g = this.graficoPolvo;
      g.clear();
      if (reducirMovimiento) return;
      g.setRotation(-anguloNave);
      const radioMax = this.radioEstrellas || 400;
      const v = nave.velAproximacion;
      const deltaZ = (0.02 + v * 0.05) * dt;

      for (let i = 0; i < this.polvo.length; i += 1) {
        const p = this.polvo[i];
        p.distanciaNorm += deltaZ * p.velocidadFactor;
        if (p.distanciaNorm > 1) {
          p.distanciaNorm = 0.04 + Math.random() * 0.08;
          p.angulo = Math.random() * Math.PI * 2;
        } else if (p.distanciaNorm < 0) {
          p.distanciaNorm = 0.95;
        }
        const r = p.distanciaNorm * radioMax;
        const alfa = p.alfa * Math.min(1, p.distanciaNorm * 2.5);
        g.fillStyle(paleta.texto, alfa);
        g.fillCircle(Math.cos(p.angulo) * r, Math.sin(p.angulo) * r, p.radio * (0.6 + p.distanciaNorm * 0.8));
      }
    }

    actualizarBalizas(tiempo) {
      const g = this.lucesEstacion;
      g.clear();
      if (reducirMovimiento) return;
      g.setPosition(this.estacion.x, this.estacion.y);
      g.setScale(this.estacion.scaleX);
      g.setRotation(this.estacion.rotation);

      // Doble flash estroboscopico aeroespacial cada 1.25s
      const ciclo = (tiempo % 1250) / 1250;
      const flash = ciclo < 0.07 || (ciclo > 0.14 && ciclo < 0.21);
      if (!flash) return;

      const r = RADIO_ANILLO;
      const dibujarLuz = (x, y, color) => {
        g.fillStyle(color, 1);
        g.fillCircle(x, y, 3.5);
        g.fillStyle(color, 0.3);
        g.fillCircle(x, y, 7.5);
      };

      // Balizas blancas en modulos superior e inferior (indices 0 y 6)
      dibujarLuz(0, -r, 0xffffff);
      dibujarLuz(0, r, 0xffffff);
      // Baliza roja a babor (oeste / modulo 9) y verde/teal a estribor (este / modulo 3)
      dibujarLuz(-r, 0, paleta.alerta);
      dibujarLuz(r, 0, paleta.teal);
    }

    update(tiempo, delta) {
      alAvanzar(delta / 1000);
      const partida = obtenerPartida();
      const nivel = obtenerNivel();
      const dtS = delta / 1000;

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
      this.giroAcumulado += this.giroResidual * dtS;
      const anguloNave = partida.nave.angulo + this.giroAcumulado;

      const { nave, estacion } = partida;
      const escala = (this.ladoMenor * ESCALA_PANTALLA * SUAVIZADO_DISTANCIA) / (nave.distancia + SUAVIZADO_DISTANCIA) / RADIO_ANILLO;
      this.estacion.setScale(escala);
      this.estacion.setRotation(estacion.angulo + estacion.anguloPuerto - anguloNave);
      this.estrellas.setRotation(reducirMovimiento ? 0 : -anguloNave);
      this.dibujarReticula(RADIO_HUB * escala, nivel);

      this.actualizarPolvo(nave, dtS, anguloNave);
      this.actualizarBalizas(tiempo);

      const enCurso = partida.fase === 'en-curso';
      this.actualizarPropulsores(partida.acciones, enCurso && nave.combustible > 0);
      if (enCurso && nivel === 'peligro' && !reducirMovimiento && !this.cameras.main.shakeEffect.isRunning) {
        this.cameras.main.shake(160, 0.003);
      }
    }
  };
}
