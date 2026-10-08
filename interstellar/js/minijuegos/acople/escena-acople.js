// Unica escena Phaser del acople: vista desde la cabina (research R2). Dibuja la partida, nunca la muta.
// Phaser llega por parametro: este modulo no lo importa (lo carga main.js con import()).

const ESTRELLAS = 260;
const RADIO_ANILLO = 100; // unidades locales del dibujo de la estacion
const RADIO_HUB = 22;
const ESCALA_PANTALLA = 0.42; // radio del anillo en contacto, como fraccion del lado menor
const SUAVIZADO_DISTANCIA = 80; // u: cuanto tarda la estacion en "crecer" al acercarse
const MODULO_DANADO = 2; // módulo reventado por la esclusa de Mann (60 deg)

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
      this.inerciaRanger = { roll: 0, pitch: 0 };
      this.techoConsola = 0;
    }

    create() {
      this.crearTexturaChispa();
      this.estrellas = this.add.graphics();
      this.graficoPolvo = this.add.graphics();
      this.graficoEscombros = this.add.graphics();
      this.graficoVenting = this.add.graphics();
      this.estacion = this.add.graphics();
      this.graficoSellado = this.add.graphics();
      this.lucesEstacion = this.add.graphics();
      this.graficoRanger = this.add.graphics();
      this.reticula = this.add.graphics();
      this.animSellado = null;
      this.crearPropulsores();
      this.crearPolvoEspacial();
      this.crearEscombros();
      this.crearVenting();
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

    crearEscombros() {
      const aDanado = (MODULO_DANADO / 12) * Math.PI * 2;
      this.escombros = Array.from({ length: 22 }, () => {
        // Polígonos irregulares que simulan chapas metálicas dobladas
        const nPuntos = Math.random() < 0.6 ? 3 : 4;
        const forma = [];
        for (let j = 0; j < nPuntos; j += 1) {
          const ang = (j / nPuntos) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
          const rad = 0.5 + Math.random() * 0.9;
          forma.push({ x: Math.cos(ang) * rad, y: Math.sin(ang) * rad });
        }
        return {
          angulo: aDanado + (Math.random() - 0.3) * 1.3,
          distancia: RADIO_ANILLO + (Math.random() - 0.2) * 45,
          velDistancia: 1.2 + Math.random() * 3.5,
          velOrbital: (Math.random() - 0.5) * 0.14,
          rotacion: Math.random() * Math.PI * 2,
          velRotacion: (Math.random() - 0.5) * 3.2,
          tamano: 2.2 + Math.random() * 3.6,
          alfa: 0.45 + Math.random() * 0.45,
          forma,
        };
      });
    }

    crearVenting() {
      this.venting = Array.from({ length: 30 }, () => ({
        progreso: Math.random(),
        desvio: (Math.random() - 0.5) * 0.4,
        velFactor: 0.75 + Math.random() * 0.6,
        radio: 1.0 + Math.random() * 2.2,
        alfa: 0.35 + Math.random() * 0.45,
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
      this.techoConsola = techo;
      this.centro = { x: cx, y: techo / 2 };
      this.ladoMenor = Math.min(ancho, techo);
      this.estrellas.setPosition(cx, alto / 2);
      this.graficoPolvo.setPosition(cx, alto / 2);
      this.graficoEscombros.setPosition(this.centro.x, this.centro.y);
      this.graficoVenting.setPosition(this.centro.x, this.centro.y);
      this.estacion.setPosition(this.centro.x, this.centro.y);
      this.graficoSellado.setPosition(this.centro.x, this.centro.y);
      this.lucesEstacion.setPosition(this.centro.x, this.centro.y);

      // Fuselaje exterior del Ranger proyectado hacia adelante sobre el parabrisas
      const wMorro = Math.min(anchoConsola * 0.44, 380);
      const hMorro = Math.min(62, techo * 0.17);
      const wChine = wMorro * 0.46;
      this.graficoRanger.setPosition(cx, techo);
      this.dibujarRanger(wMorro, hMorro, wChine);

      // Propulsores RCS y retro ubicados exactamente en sus toberas mecánicas del Ranger
      this.rcsIzquierdo.setPosition(cx - wChine, techo - hMorro * 0.38);
      this.rcsDerecho.setPosition(cx + wChine, techo - hMorro * 0.38);
      this.motorIzquierdo.setPosition(cx - anchoConsola * 0.47, techo + consola.alto * 0.5);
      this.motorDerecho.setPosition(cx + anchoConsola * 0.47, techo + consola.alto * 0.5);
      this.retro.setPosition(cx, techo - hMorro);
      if (this.radioEstrellas < Math.hypot(ancho, alto) / 2) this.dibujarEstrellas();
    }

    dibujarRanger(w, h, wChine) {
      const g = this.graficoRanger;
      g.clear();

      // Fuselaje lifting-body del Ranger visto hacia adelante desde la cabina
      // Coordenadas locales: (0, 0) es el centro superior de la consola
      const yPunta = -h;
      const yChine = -h * 0.38;
      const xChineL = -wChine;
      const xChineR = wChine;
      const xBaseL = -w * 0.5;
      const xBaseR = w * 0.5;

      // 1. Faceta dorsal babor / izquierda (expuesta a la luz ambiental de Gargantúa)
      g.fillStyle(0x1e2736, 0.96);
      g.fillPoints([
        { x: 0, y: yPunta },
        { x: xChineL, y: yChine },
        { x: xBaseL, y: 0 },
        { x: 0, y: 0 },
      ], true);

      // 2. Faceta dorsal estribor / derecha (en penumbra/sombra propia)
      g.fillStyle(0x131a24, 0.96);
      g.fillPoints([
        { x: 0, y: yPunta },
        { x: 0, y: 0 },
        { x: xBaseR, y: 0 },
        { x: xChineR, y: yChine },
      ], true);

      // 3. Losetas térmicas cerámicas negras (TPS) - líneas de panelado longitudinal y transversal
      g.lineStyle(1, 0x090d14, 0.75);
      // Costuras transversales
      for (const k of [0.28, 0.56, 0.82]) {
        const yK = yPunta * (1 - k);
        const yKL = yPunta * (1 - k) + (yChine - yPunta) * k;
        const xKL = xChineL * k;
        const xKR = xChineR * k;
        g.lineBetween(0, yK, xKL, yKL);
        g.lineBetween(0, yK, xKR, yKL);
      }
      // Costuras longitudinales intermedias
      g.lineBetween(xChineL * 0.5, yChine * 0.5, xBaseL * 0.65, 0);
      g.lineBetween(xChineR * 0.5, yChine * 0.5, xBaseR * 0.65, 0);

      // 4. Cresta dorsal central (quilla superior del Ranger con reflejo especular)
      g.lineStyle(1.8, 0x90b8dc, 0.75);
      g.lineBetween(0, 0, 0, yPunta);

      // 5. Aristas laterales de los chines (bordes aerodinámicos afilados)
      // Chine izquierdo iluminado
      g.lineStyle(2, 0xd8e8f8, 0.85);
      g.lineBetween(xBaseL, 0, xChineL, yChine);
      g.lineBetween(xChineL, yChine, 0, yPunta);

      // Chine derecho en sombra
      g.lineStyle(1.4, 0x3d4f64, 0.6);
      g.lineBetween(xBaseR, 0, xChineR, yChine);
      g.lineBetween(xChineR, yChine, 0, yPunta);

      // 6. Pods estructurales de propulsores RCS en los chines
      // Pod izquierdo
      g.fillStyle(0x101620, 1);
      g.fillRect(xChineL - 5, yChine - 4, 10, 8);
      g.lineStyle(1, 0x475b73, 0.8);
      g.strokeRect(xChineL - 5, yChine - 4, 10, 8);
      // Toberas oscuras del RCS izquierdo
      g.fillStyle(0x000000, 1);
      g.fillCircle(xChineL - 2, yChine - 1, 1.4);
      g.fillCircle(xChineL + 2, yChine - 1, 1.4);
      // Marca stencil amarilla de advertencia
      g.lineStyle(1, 0xd4a017, 0.7);
      g.lineBetween(xChineL - 4, yChine + 3, xChineL + 4, yChine + 3);

      // Pod derecho
      g.fillStyle(0x101620, 1);
      g.fillRect(xChineR - 5, yChine - 4, 10, 8);
      g.lineStyle(1, 0x3a4b60, 0.7);
      g.strokeRect(xChineR - 5, yChine - 4, 10, 8);
      // Toberas oscuras del RCS derecho
      g.fillStyle(0x000000, 1);
      g.fillCircle(xChineR - 2, yChine - 1, 1.4);
      g.fillCircle(xChineR + 2, yChine - 1, 1.4);
      g.lineStyle(1, 0xd4a017, 0.7);
      g.lineBetween(xChineR - 4, yChine + 3, xChineR + 4, yChine + 3);

      // 7. Sensor frontal / cono de la sonda de acople en la punta del morro
      g.fillStyle(0x222e3e, 1);
      g.fillTriangle(-6, yPunta, 6, yPunta, 0, yPunta - 7);
      g.lineStyle(1.2, 0x8cb4d8, 0.9);
      g.strokeTriangle(-6, yPunta, 6, yPunta, 0, yPunta - 7);
      // Puerto de sensor retro
      g.fillStyle(0x000000, 1);
      g.fillCircle(0, yPunta - 2, 1.8);

      // 8. Junta de estanqueidad inferior del parabrisas (gasket de titanio y goma)
      g.lineStyle(3, 0x0a0e14, 0.98);
      g.lineBetween(xBaseL, 0, xBaseR, 0);
      g.lineStyle(1.2, 0x2e3d50, 0.7);
      g.lineBetween(xBaseL, -1, xBaseR, -1);
    }

    dibujarEstrellas() {
      const radio = Math.hypot(this.scale.width, this.scale.height) / 2 + 40;
      this.radioEstrellas = radio;
      const g = this.estrellas;
      g.clear();

      // 1. Gargantúa en el fondo cósmico lejano (lejana silueta astronómica)
      const gx = -radio * 0.75;
      const gy = -radio * 0.68;
      const rHorizonte = 11;

      // Resplandor coronal muy tenue y compacto en la lejanía
      g.fillStyle(0xd47a24, 0.04);
      g.fillCircle(gx, gy, 55);
      g.fillStyle(0xc87018, 0.06);
      g.fillCircle(gx, gy, 32);

      // Anillo de lente gravitacional superior (arco curvo distorsionado)
      g.lineStyle(1.2, 0xdf8a28, 0.35);
      g.beginPath();
      g.arc(gx, gy, 24, -2.8, -0.34, false);
      g.strokePath();

      // Disco de acreción ecuatorial inclinado atravesando el agujero negro
      g.lineStyle(1.6, 0xffc468, 0.75);
      g.lineBetween(gx - 30, gy + 4, gx + 30, gy - 4);
      g.lineStyle(1.0, 0xdf8a28, 0.45);
      g.lineBetween(gx - 36, gy + 5, gx + 36, gy - 5);

      // Sombra central del horizonte de eventos (núcleo negro absoluto con borde dorado)
      g.fillStyle(0x000000, 0.96);
      g.fillCircle(gx, gy, rHorizonte);
      g.lineStyle(1.2, 0xffe8b0, 0.65);
      g.strokeCircle(gx, gy, rHorizonte);

      // 2. Campo estelar con magnitudes y clasificación espectral
      for (let i = 0; i < ESTRELLAS; i += 1) {
        const r = Math.sqrt(Math.random()) * radio;
        const a = Math.random() * Math.PI * 2;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        const rnd = Math.random();

        if (rnd < 0.12) {
          // Estrellas blanco-azuladas cálidas (Clase O/B) con halo difuso
          g.fillStyle(0x70c0ff, 0.18);
          g.fillCircle(x, y, 3.2);
          g.fillStyle(0xd0eaff, 0.9);
          g.fillCircle(x, y, 1.4);
        } else if (rnd < 0.24) {
          // Enanas doradas / ambarinas (Clase K/M)
          g.fillStyle(paleta.ambar, 0.22);
          g.fillCircle(x, y, 2.6);
          g.fillStyle(0xffe0a0, 0.85);
          g.fillCircle(x, y, 1.2);
        } else {
          // Estrellas de fondo estándar con varianza de brillo
          const alfa = 0.2 + Math.random() * 0.65;
          const tam = Math.random() < 0.15 ? 1.3 : 0.8;
          g.fillStyle(paleta.texto, alfa);
          g.fillCircle(x, y, tam);
        }
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

      // Vector de iluminación dominante de Gargantúa (~135°, arriba-izquierda)
      const anguloLuz = Math.PI * 0.75;

      // 1. Armazón concéntrico y anillo tubular presurizado continuo de tránsito
      // Armazón exterior e interior de celosía
      g.lineStyle(1.2, paleta.texto, 0.28);
      g.strokeCircle(0, 0, RADIO_ANILLO - 8);
      g.strokeCircle(0, 0, RADIO_ANILLO + 8);

      // Tubo presurizado continuo de tránsito de tripulación
      g.lineStyle(6.5, paleta.fondo, 0.95);
      g.strokeCircle(0, 0, RADIO_ANILLO);
      g.lineStyle(1.4, paleta.texto, 0.55);
      g.strokeCircle(0, 0, RADIO_ANILLO - 3.2);
      g.strokeCircle(0, 0, RADIO_ANILLO + 3.2);

      // Costillas radiales de refuerzo estructural y juntas de expansión cada 10°
      for (let k = 0; k < 36; k += 1) {
        const aRib = (k / 36) * Math.PI * 2;
        const cosR = Math.cos(aRib);
        const sinR = Math.sin(aRib);
        g.lineStyle(1, paleta.texto, 0.22);
        g.lineBetween(cosR * (RADIO_ANILLO - 3.2), sinR * (RADIO_ANILLO - 3.2), cosR * (RADIO_ANILLO + 3.2), sinR * (RADIO_ANILLO + 3.2));
      }

      // Arco de luz especular en el anillo exterior expuesto a Gargantúa
      g.lineStyle(2.0, 0xffffff, 0.38);
      g.beginPath();
      g.arc(0, 0, RADIO_ANILLO + 3.2, anguloLuz - Math.PI / 2.5, anguloLuz + Math.PI / 2.5, false);
      g.strokePath();

      // 2. 12 módulos habitables y naves de descenso (Landers)
      const hl = 8.5; // semilargo tangencial estándar
      const hw = 5.5; // semiancho radial estándar
      for (let i = 0; i < 12; i += 1) {
        const a = (i / 12) * Math.PI * 2;
        const cosA = Math.cos(a);
        const sinA = Math.sin(a);
        const cx = cosA * RADIO_ANILLO;
        const cy = sinA * RADIO_ANILLO;
        const tx = -sinA;
        const ty = cosA;

        // Incidencia normal de la luz: [-1 = sombra total, +1 = luz frontal]
        const dotLuz = Math.cos(a - anguloLuz);
        const factorLuz = (dotLuz + 1) / 2; // [0, 1]

        if (i === MODULO_DANADO) {
          // Módulo dañado (explosión de esclusa de Mann)
          g.fillStyle(paleta.fondo, 0.95);
          g.fillPoints([
            { x: cx - tx * hl * 0.95 - cosA * hw * 0.8, y: cy - ty * hl * 0.95 - sinA * hw * 0.8 },
            { x: cx - tx * hl * 0.2 + cosA * hw * 0.35, y: cy - ty * hl * 0.2 + sinA * hw * 0.35 },
            { x: cx + tx * hl * 0.3 - cosA * hw * 0.2, y: cy + ty * hl * 0.3 - sinA * hw * 0.2 },
            { x: cx + tx * hl * 0.85 + cosA * hw * 0.65, y: cy + ty * hl * 0.85 + sinA * hw * 0.65 },
            { x: cx + tx * hl * 0.65 - cosA * hw * 0.95, y: cy + ty * hl * 0.65 - sinA * hw * 0.95 },
          ], true);

          g.lineStyle(1.8, paleta.alerta, 0.9);
          g.strokePoints([
            { x: cx - tx * hl, y: cy - ty * hl },
            { x: cx - tx * hl * 0.3 + cosA * hw * 0.7, y: cy - ty * hl * 0.3 + sinA * hw * 0.7 },
            { x: cx + tx * hl * 0.1 - cosA * hw * 0.3, y: cy + ty * hl * 0.1 - sinA * hw * 0.3 },
            { x: cx + tx * hl * 0.8 + cosA * hw * 0.85, y: cy + ty * hl * 0.8 + sinA * hw * 0.85 },
          ], false);

          g.lineStyle(1.3, paleta.ambar, 0.8);
          g.lineBetween(cx - tx * 4, cy - ty * 4, cx + cosA * 5, cy + sinA * 5);
          g.lineBetween(cx + tx * 3, cy + ty * 3, cx - cosA * 4, cy - sinA * 4);
          g.lineBetween(cx - cosA * 3, cy - sinA * 3, cx + tx * 5, cy + ty * 5);
          continue;
        }

        // Naves pesadas Lander en módulos 3 y 9 (silueta asimétrica y robusta del film)
        if (i === 3 || i === 9) {
          const lhl = 12.5; // cuerpo más ancho y angular
          const lhw = 8.5; // sobresale más radialmente
          const pLander = [
            { x: cx - tx * (lhl * 0.7) - cosA * (lhw * 0.9), y: cy - ty * (lhl * 0.7) - sinA * (lhw * 0.9) },
            { x: cx - tx * lhl + cosA * (lhw * 0.2), y: cy - ty * lhl + sinA * (lhw * 0.2) },
            { x: cx - tx * (lhl * 0.8) + cosA * lhw, y: cy - ty * (lhl * 0.8) + sinA * lhw },
            { x: cx + tx * (lhl * 0.8) + cosA * lhw, y: cy + ty * (lhl * 0.8) + sinA * lhw },
            { x: cx + tx * lhl + cosA * (lhw * 0.2), y: cy + ty * lhl + sinA * (lhw * 0.2) },
            { x: cx + tx * (lhl * 0.7) - cosA * (lhw * 0.9), y: cy + ty * (lhl * 0.7) - sinA * (lhw * 0.9) },
          ];

          g.fillStyle(paleta.fondo, 0.97);
          g.fillPoints(pLander, true);

          const alfaBordeL = 0.55 + factorLuz * 0.45;
          g.lineStyle(1.8 + factorLuz * 0.4, paleta.texto, alfaBordeL);
          g.strokePoints(pLander, true);

          // Ventral TPS: losetas cerámicas y paneles térmicos oscuros
          g.lineStyle(1, 0x090d14, 0.7);
          g.lineBetween(cx - tx * (lhl * 0.6) + cosA * (lhw * 0.4), cy - ty * (lhl * 0.6) + sinA * (lhw * 0.4), cx + tx * (lhl * 0.6) + cosA * (lhw * 0.4), cy + ty * (lhl * 0.6) + sinA * (lhw * 0.4));
          g.lineBetween(cx - tx * (lhl * 0.5) + cosA * (lhw * 0.7), cy - ty * (lhl * 0.5) + sinA * (lhw * 0.7), cx + tx * (lhl * 0.5) + cosA * (lhw * 0.7), cy + ty * (lhl * 0.5) + sinA * (lhw * 0.7));

          // Toberas gemelas del motor vertical del Lander
          g.fillStyle(0x06090e, 1);
          g.fillCircle(cx - tx * 4.5 + cosA * (lhw - 1.2), cy - ty * 4.5 + sinA * (lhw - 1.2), 1.6);
          g.fillCircle(cx + tx * 4.5 + cosA * (lhw - 1.2), cy + ty * 4.5 + sinA * (lhw - 1.2), 1.6);

          // Abrazaderas de anclaje de titanio al anillo de la estación
          g.lineStyle(2, paleta.texto, 0.75);
          g.lineBetween(cx - tx * 5.5 - cosA * (lhw * 0.9), cy - ty * 5.5 - sinA * (lhw * 0.9), cx - tx * 5.5 - cosA * (lhw * 1.2), cy - ty * 5.5 - sinA * (lhw * 1.2));
          g.lineBetween(cx + tx * 5.5 - cosA * (lhw * 0.9), cy + ty * 5.5 - sinA * (lhw * 0.9), cx + tx * 5.5 - cosA * (lhw * 1.2), cy + ty * 5.5 - sinA * (lhw * 1.2));

          if (dotLuz > 0.1) {
            g.lineStyle(2.0, 0xffffff, dotLuz * 0.8);
            g.lineBetween(pLander[2].x, pLander[2].y, pLander[3].x, pLander[3].y);
          }
          continue;
        }

        // Módulos habitables cilíndricos estándar
        const p1 = { x: cx - tx * hl - cosA * hw, y: cy - ty * hl - sinA * hw };
        const p2 = { x: cx + tx * hl - cosA * hw, y: cy + ty * hl - sinA * hw };
        const p3 = { x: cx + tx * hl + cosA * hw, y: cy + ty * hl + sinA * hw };
        const p4 = { x: cx - tx * hl + cosA * hw, y: cy - ty * hl + sinA * hw };

        const alfaFondo = 0.88 + factorLuz * 0.1;
        g.fillStyle(paleta.fondo, alfaFondo);
        g.fillPoints([p1, p2, p3, p4], true);

        const alfaBorde = 0.5 + factorLuz * 0.48;
        g.lineStyle(1.5 + factorLuz * 0.5, paleta.texto, alfaBorde);
        g.strokePoints([p1, p2, p3, p4], true);

        // Highlight metálico brillante en la arista exterior si mira a Gargantúa
        if (dotLuz > 0.1) {
          g.lineStyle(1.6, 0xffffff, dotLuz * 0.75);
          g.lineBetween(p2.x, p2.y, p3.x, p3.y);
        }

        // Escotilla circular central de acceso con marco
        g.fillStyle(paleta.fondo, 1);
        g.fillCircle(cx, cy, 2.2);
        g.lineStyle(1, paleta.texto, 0.4 + factorLuz * 0.35);
        g.strokeCircle(cx, cy, 2.2);

        // Paneles radiadores térmicos disipadores en módulos pares
        if (i % 2 === 0) {
          g.lineStyle(1.2, paleta.texto, 0.35 + factorLuz * 0.35);
          g.lineBetween(cx + cosA * hw - tx * 3, cy + sinA * hw - ty * 3, cx + cosA * (hw + 5.5) - tx * 3, cy + sinA * (hw + 5.5) - ty * 3);
          g.lineBetween(cx + cosA * hw + tx * 3, cy + sinA * hw + ty * 3, cx + cosA * (hw + 5.5) + tx * 3, cy + sinA * (hw + 5.5) + ty * 3);
          // Aleta transversal
          g.lineBetween(cx + cosA * (hw + 3) - tx * 3, cy + sinA * (hw + 3) - ty * 3, cx + cosA * (hw + 3) + tx * 3, cy + sinA * (hw + 3) + ty * 3);
        }
      }

      // 3. 4 brazos estructurales dobles con celosía hacia el hub
      for (let i = 0; i < 4; i += 1) {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const deltaA = 0.04;
        const a1 = a - deltaA;
        const a2 = a + deltaA;
        const dotBrazo = Math.cos(a - anguloLuz);
        const alfaBrazo = 0.45 + (dotBrazo + 1) * 0.22;

        g.lineStyle(1.5, paleta.texto, alfaBrazo);
        g.lineBetween(Math.cos(a1) * RADIO_HUB, Math.sin(a1) * RADIO_HUB, Math.cos(a - 0.015) * (RADIO_ANILLO - 8), Math.sin(a - 0.015) * (RADIO_ANILLO - 8));
        g.lineBetween(Math.cos(a2) * RADIO_HUB, Math.sin(a2) * RADIO_HUB, Math.cos(a + 0.015) * (RADIO_ANILLO - 8), Math.sin(a + 0.015) * (RADIO_ANILLO - 8));

        // Travesaños diagonales de celosía
        for (let k = 0.35; k <= 0.85; k += 0.25) {
          const rK = RADIO_HUB + (RADIO_ANILLO - 8 - RADIO_HUB) * k;
          g.lineStyle(1, paleta.texto, alfaBrazo * 0.6);
          g.lineBetween(Math.cos(a1) * rK, Math.sin(a1) * rK, Math.cos(a2) * (rK + 6), Math.sin(a2) * (rK + 6));
        }
      }

      // 4. Hub de atraque central cilíndrico con relieve
      g.fillStyle(paleta.fondo, 0.96);
      g.fillCircle(0, 0, RADIO_HUB);
      g.lineStyle(1.8, paleta.texto, 0.5);
      g.strokeCircle(0, 0, RADIO_HUB * 0.62);
      g.lineStyle(2.8, color, 1);
      g.strokeCircle(0, 0, RADIO_HUB);

      // Semicírculo iluminado en el hub central expuesto a Gargantúa
      g.lineStyle(2.2, 0xffffff, 0.7);
      g.beginPath();
      g.arc(0, 0, RADIO_HUB, anguloLuz - Math.PI / 2.2, anguloLuz + Math.PI / 2.2, false);
      g.strokePath();

      // 5. Collarín de acople andrógino APAS con 3 pétalos guía a 120°
      // Pétalo 0 a -90° (-Y): es el pétalo maestro que coincide con la flecha de la retícula HUD
      for (let p = 0; p < 3; p += 1) {
        const angPetalo = -Math.PI / 2 + (p * Math.PI * 2) / 3;
        const npx = Math.cos(angPetalo);
        const npy = Math.sin(angPetalo);
        const tpx = -npy;
        const tpy = npx;

        const rBase = RADIO_HUB;
        const rTip = RADIO_HUB + 13;
        const wBase = 7.5;
        const wTip = 4.0;

        const pt1 = { x: npx * rBase - tpx * (wBase * 0.5), y: npy * rBase - tpy * (wBase * 0.5) };
        const pt2 = { x: npx * rTip - tpx * (wTip * 0.5), y: npy * rTip - tpy * (wTip * 0.5) };
        const pt3 = { x: npx * rTip + tpx * (wTip * 0.5), y: npy * rTip + tpy * (wTip * 0.5) };
        const pt4 = { x: npx * rBase + tpx * (wBase * 0.5), y: npy * rBase + tpy * (wBase * 0.5) };

        // Hoja guía del pétalo
        g.fillStyle(color, 0.95);
        g.fillPoints([pt1, pt2, pt3, pt4], true);

        // Bisel de deslizamiento metálico
        g.lineStyle(1.4, 0xffffff, 0.75);
        g.strokePoints([pt1, pt2, pt3, pt4], true);

        // Pétalo maestro (p === 0): ranura índice central de alineación
        if (p === 0) {
          g.lineStyle(1.8, paleta.fondo, 0.95);
          g.lineBetween(npx * (rBase - 2), npy * (rBase - 2), npx * (rTip + 1), npy * (rTip + 1));
          // Pasador de captura hidráulico en la punta
          g.fillStyle(0xffffff, 0.9);
          g.fillCircle(npx * rTip, npy * rTip, 1.8);
        }
      }
    }

    dibujarReticula(radioHub, nivel) {
      const g = this.reticula;
      const { x, y } = this.centro;
      const color = this.colorDeNivel(nivel);
      g.clear();

      // Círculo HUD de captura exterior
      g.lineStyle(1, color, 0.6);
      g.strokeCircle(x, y, radioHub + 18);

      // Marcas de cuadrante de precisión aeroespacial
      const rInt = radioHub + 14;
      const rExt = radioHub + 22;
      g.lineStyle(1.2, color, 0.75);
      g.lineBetween(x - rExt, y, x - rInt, y);
      g.lineBetween(x + rInt, y, x + rExt, y);
      g.lineBetween(x, y + rInt, x, y + rExt);

      // Marca de enganche fija superior (flecha guía del puerto)
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
        camara.flash(320, c.r, c.g, c.b);
        if (!reducirMovimiento) camara.shake(220, 0.01);
        this.dispararEfectoSellado();
      }
    }

    dispararEfectoSellado() {
      this.animSellado = { activo: true, tiempo: 0, duracion: 1.4 };
      const nParticulas = 48;
      this.vaporSellado = Array.from({ length: nParticulas }, (_, i) => {
        const angulo = (i / nParticulas) * Math.PI * 2 + (Math.random() - 0.5) * 0.12;
        return {
          angulo,
          distancia: RADIO_HUB,
          velocidad: 70 + Math.random() * 90,
          radio: 1.5 + Math.random() * 2.5,
          alfa: 0.85 + Math.random() * 0.15,
        };
      });
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

    actualizarEscombros(dtS) {
      const g = this.graficoEscombros;
      g.clear();
      g.setPosition(this.estacion.x, this.estacion.y);
      g.setScale(this.estacion.scaleX);
      g.setRotation(this.estacion.rotation);

      const aDanado = (MODULO_DANADO / 12) * Math.PI * 2;

      for (let i = 0; i < this.escombros.length; i += 1) {
        const d = this.escombros[i];
        if (!reducirMovimiento) {
          d.distancia += d.velDistancia * dtS;
          d.angulo += d.velOrbital * dtS;
          d.rotacion += d.velRotacion * dtS;
          if (d.distancia > RADIO_ANILLO * 2.2) {
            d.distancia = RADIO_ANILLO + Math.random() * 8;
            d.angulo = aDanado + (Math.random() - 0.3) * 0.5;
          }
        }

        const x = Math.cos(d.angulo) * d.distancia;
        const y = Math.sin(d.angulo) * d.distancia;

        const cosR = Math.cos(d.rotacion);
        const sinR = Math.sin(d.rotacion);
        const puntos = d.forma.map((pt) => ({
          x: x + (pt.x * cosR - pt.y * sinR) * d.tamano,
          y: y + (pt.x * sinR + pt.y * cosR) * d.tamano,
        }));

        g.fillStyle(paleta.fondo, d.alfa);
        g.fillPoints(puntos, true);
        g.lineStyle(1.2, paleta.texto, d.alfa);
        g.strokePoints(puntos, true);
      }
    }

    actualizarVenting(tiempo, dtS) {
      const g = this.graficoVenting;
      g.clear();
      if (reducirMovimiento) return;

      g.setPosition(this.estacion.x, this.estacion.y);
      g.setScale(this.estacion.scaleX);
      g.setRotation(this.estacion.rotation);

      const aDanado = (MODULO_DANADO / 12) * Math.PI * 2;
      const mx = Math.cos(aDanado) * RADIO_ANILLO;
      const my = Math.sin(aDanado) * RADIO_ANILLO;

      // El chorro de despresurización escapa tangencial/radialmente
      const anguloBase = aDanado + 0.35;
      const largoJet = 75;

      for (let i = 0; i < this.venting.length; i += 1) {
        const p = this.venting[i];
        p.progreso += dtS * 1.6 * p.velFactor;
        if (p.progreso > 1) {
          p.progreso = Math.random() * 0.08;
          p.desvio = (Math.random() - 0.5) * 0.4;
        }

        const d = p.progreso * largoJet;
        const ang = anguloBase + p.desvio + p.progreso * 0.25;
        const px = mx + Math.cos(ang) * d;
        const py = my + Math.sin(ang) * d;

        const alfa = (1 - p.progreso) * p.alfa;
        const radio = p.radio * (0.8 + p.progreso * 2.4);

        g.fillStyle(0xffffff, alfa * 0.75);
        g.fillCircle(px, py, radio * 0.6);
        g.fillStyle(paleta.teal, alfa * 0.35);
        g.fillCircle(px, py, radio);
      }

      // Destello / arco eléctrico ocasional de cortocircuito
      if (Math.sin(tiempo * 0.02) > 0.88 && Math.random() < 0.45) {
        g.lineStyle(1.5, paleta.alerta, 0.95);
        const ox = (Math.random() - 0.5) * 8;
        const oy = (Math.random() - 0.5) * 8;
        g.lineBetween(mx + ox, my + oy, mx + ox + (Math.random() - 0.5) * 7, my + oy + (Math.random() - 0.5) * 7);
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

    actualizarSellado(dtS) {
      if (!this.animSellado || !this.animSellado.activo) return;
      const g = this.graficoSellado;
      g.clear();
      g.setPosition(this.estacion.x, this.estacion.y);
      g.setScale(this.estacion.scaleX);
      g.setRotation(this.estacion.rotation);

      this.animSellado.tiempo += dtS;
      const tNorm = Math.min(1, this.animSellado.tiempo / this.animSellado.duracion);

      // 1. Onda de choque / anillo de sellado expansivo
      const radioOnda = RADIO_HUB + (RADIO_ANILLO - RADIO_HUB) * Math.pow(tNorm, 0.6);
      const alfaOnda = (1 - tNorm) * 0.95;
      g.lineStyle(3.2 * (1 - tNorm * 0.5), paleta.teal, alfaOnda);
      g.strokeCircle(0, 0, radioOnda);
      g.lineStyle(1.4, 0xffffff, alfaOnda * 0.85);
      g.strokeCircle(0, 0, radioOnda * 0.94);

      if (tNorm > 0.08) {
        const t2 = (tNorm - 0.08) / 0.92;
        const r2 = RADIO_HUB + (RADIO_ANILLO - RADIO_HUB) * Math.pow(t2, 0.6);
        const a2 = (1 - t2) * 0.6;
        g.lineStyle(1.2, paleta.teal, a2);
        g.strokeCircle(0, 0, r2);
      }

      // 2. Chorro radial de despresurización de la esclusa (vapor en 360°)
      if (this.vaporSellado && !reducirMovimiento) {
        for (let i = 0; i < this.vaporSellado.length; i += 1) {
          const p = this.vaporSellado[i];
          p.distancia += p.velocidad * dtS;
          p.velocidad *= Math.max(0, 1 - dtS * 2.4); // desaceleración en el vacío
          const alfaP = (1 - tNorm) * p.alfa;
          const radioP = p.radio * (1 + tNorm * 2.2);

          const px = Math.cos(p.angulo) * p.distancia;
          const py = Math.sin(p.angulo) * p.distancia;

          g.fillStyle(0xffffff, alfaP * 0.8);
          g.fillCircle(px, py, radioP * 0.6);
          g.fillStyle(paleta.teal, alfaP * 0.45);
          g.fillCircle(px, py, radioP);
        }
      }

      // 3. Pestillos de traba mecánica en el hub (clamps de titanio)
      if (tNorm < 0.65) {
        const alfaClamp = Math.min(1, (1 - tNorm / 0.65) * 1.5);
        g.fillStyle(paleta.teal, alfaClamp);
        for (let k = 0; k < 4; k += 1) {
          const aClamp = (k / 4) * Math.PI * 2;
          const cx = Math.cos(aClamp) * (RADIO_HUB + 4);
          const cy = Math.sin(aClamp) * (RADIO_HUB + 4);
          g.fillCircle(cx, cy, 3.5);
        }
      }

      if (tNorm >= 1) {
        this.animSellado.activo = false;
        g.clear();
      }
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
          if (this.graficoSellado) this.graficoSellado.clear();
          if (this.animSellado) this.animSellado.activo = false;
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
      this.actualizarEscombros(dtS);
      this.actualizarVenting(tiempo, dtS);
      this.actualizarBalizas(tiempo);
      this.actualizarSellado(dtS);

      const enCurso = partida.fase === 'en-curso';
      this.actualizarPropulsores(partida.acciones, enCurso && nave.combustible > 0);
      if (enCurso && nivel === 'peligro' && !reducirMovimiento && !this.cameras.main.shakeEffect.isRunning) {
        this.cameras.main.shake(160, 0.003);
      }

      // Inercia física reactiva del fuselaje del Ranger (cabeceo en impulso/freno y balanceo en alabeo)
      const acciones = partida.acciones;
      let targetRoll = 0;
      let targetPitch = 0;

      if (enCurso && nave.combustible > 0) {
        if (acciones.has('rotarIzquierda')) targetRoll += 0.035;
        if (acciones.has('rotarDerecha')) targetRoll -= 0.035;
        if (acciones.has('impulso')) targetPitch -= 5.0; // Inercia frontal: morro se hunde por aceleración
        if (acciones.has('freno')) targetPitch += 4.0; // Inercia retrógrada: morro cabecea hacia arriba
      }

      if (partida.fase === 'fallida' && this.giroResidual && !reducirMovimiento) {
        targetRoll += Math.sin(tiempo * 0.008) * 0.05;
      }

      if (reducirMovimiento) {
        this.inerciaRanger.roll = 0;
        this.inerciaRanger.pitch = 0;
      } else {
        const factorDamping = Math.min(1, dtS * 8.5);
        this.inerciaRanger.roll += (targetRoll - this.inerciaRanger.roll) * factorDamping;
        this.inerciaRanger.pitch += (targetPitch - this.inerciaRanger.pitch) * factorDamping;
      }

      this.graficoRanger.setRotation(this.inerciaRanger.roll);
      this.graficoRanger.setY(this.techoConsola + this.inerciaRanger.pitch);
    }
  };
}
