// Escena Phaser de Miller: Phaser pone el loop y el escalado; el dibujo es el Canvas 2D del original,
// hecho sobre un CanvasTexture que se sube como textura en cada cuadro (research R2).
import { dibujar } from './render/dibujar.js';

const CLAVE_TEXTURA = 'miller-mundo';

// factor: resolucion del lienzo (el prepareCanvas del original con devicePixelRatio, acotado).
// obtenerDims: tamano logico actual; cambia al entrar o salir de pantalla completa (logica/visor.js).
export function crearEscenaMiller(Phaser, { obtenerSim, obtenerDims, alPaso, config, factor }) {
  return class EscenaMiller extends Phaser.Scene {
    constructor() {
      super('miller');
      this.acumulado = 0;
      this.dims = null;
    }

    create() {
      this.imagen = null;
      this.preparar(obtenerDims());
    }

    // Rearma la textura y el tamano del juego; Scale.FIT lo ajusta al contenedor sin deformar.
    preparar(dims) {
      this.dims = dims;
      this.imagen?.destroy();
      if (this.textures.exists(CLAVE_TEXTURA)) this.textures.remove(CLAVE_TEXTURA);
      this.lienzo = this.textures.createCanvas(CLAVE_TEXTURA, dims.ancho * factor, dims.alto * factor);
      this.ctx = this.lienzo.getContext();
      this.imagen = this.add.image(0, 0, CLAVE_TEXTURA).setOrigin(0);
      this.scale.setGameSize(dims.ancho * factor, dims.alto * factor);
    }

    // Paso fijo de 60 Hz con 5 subpasos como maximo: el createFixedStepper del original.
    update(_tiempo, delta) {
      const dims = obtenerDims();
      if (dims.ancho !== this.dims.ancho || dims.alto !== this.dims.alto) this.preparar(dims);

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
      dibujar(this.ctx, sim, this.dims);
      this.lienzo.refresh();
    }
  };
}
