// Galeria de depuracion (?debug=sprites): cada animacion en loop sobre el fondo del sitio (FR-032). No se enlaza.
import { crearTexturasSprites, crearAnimacionesSprites, hex } from './texturas.js';

const COLUMNAS = 4;
const ANCHO_CELDA = 120;
const ALTO_CELDA = 66;

export function crearEscenaGaleria(Phaser, { sprites, animaciones, leyenda, paleta }) {
  return class EscenaGaleria extends Phaser.Scene {
    constructor() {
      super('galeria');
    }

    create() {
      crearTexturasSprites(this, { sprites, leyenda, paleta });
      crearAnimacionesSprites(this, animaciones);
      Object.entries(animaciones).forEach(([clave, a], i) => {
        const x = (i % COLUMNAS) * ANCHO_CELDA + ANCHO_CELDA / 2;
        const y = Math.floor(i / COLUMNAS) * ALTO_CELDA + ALTO_CELDA - 14;
        const s = this.add.sprite(x, y, `${a.sprite}-${a.frames[0]}`).setOrigin(0.5, 1);
        if (a.sprite === 'ranger') s.setScale(0.75);
        // Las que no hacen loop se repiten igual: en la galeria importa verlas.
        s.play({ key: clave, repeat: -1, repeatDelay: a.loop ? 0 : 600 });
        this.add
          .text(x, y + 2, clave, { fontFamily: 'monospace', fontSize: '7px', color: hex(paleta.P6) })
          .setOrigin(0.5, 0);
      });
    }
  };
}
