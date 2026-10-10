// Escena Phaser de Miller: Phaser pone el loop y el escalado; el dibujo es el Canvas 2D del original,
// hecho sobre un CanvasTexture que se sube como textura en cada cuadro (research R2).
import { dibujar } from './render/dibujar.js';

const CLAVE_TEXTURA = 'miller-mundo';

// factor: resolucion del lienzo (el prepareCanvas del original con devicePixelRatio, acotado).
export function crearEscenaMiller(Phaser, { obtenerSim, alPaso, config, factor }) {
  const dims = { ancho: config.baseCanvasWidth, alto: config.baseCanvasHeight };

  return class EscenaMiller extends Phaser.Scene {
    constructor() {
      super('miller');
      this.acumulado = 0;
    }

    create() {
      if (this.textures.exists(CLAVE_TEXTURA)) this.textures.remove(CLAVE_TEXTURA);
      this.lienzo = this.textures.createCanvas(CLAVE_TEXTURA, dims.ancho * factor, dims.alto * factor);
      this.ctx = this.lienzo.getContext();
      this.add.image(0, 0, CLAVE_TEXTURA).setOrigin(0);
    }

    // Paso fijo de 60 Hz con 5 subpasos como maximo: el createFixedStepper del original.
    update(_tiempo, delta) {
      const paso = config.stepMs;
      this.acumulado += Math.min(delta, paso * config.maxSubSteps);
      let pasos = 0;
      while (this.acumulado >= paso && pasos < config.maxSubSteps) {
        alPaso(paso / 1000);
        this.acumulado -= paso;
        pasos += 1;
      }

      const sim = obtenerSim();
      if (!sim) return;
      this.ctx.setTransform(factor, 0, 0, factor, 0, 0);
      dibujar(this.ctx, sim, dims);
      this.lienzo.refresh();
    }
  };
}
