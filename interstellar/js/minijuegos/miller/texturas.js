// Texturas Phaser a partir de los mapas de caracteres de sprites.js; lo usan la escena y la galeria de depuracion.

export const hex = (n) => `#${n.toString(16).padStart(6, '0')}`;

export function crearTexturasSprites(escena, { sprites, leyenda, paleta }) {
  Object.entries(sprites).forEach(([nombre, sprite]) => {
    Object.entries(sprite.frames).forEach(([id, filas]) => {
      const clave = `${nombre}-${id}`;
      if (escena.textures.exists(clave)) return;
      const lienzo = document.createElement('canvas');
      lienzo.width = sprite.ancho;
      lienzo.height = sprite.alto;
      const ctx = lienzo.getContext('2d');
      filas.forEach((fila, y) => {
        [...fila].forEach((c, x) => {
          if (c === '.') return;
          ctx.fillStyle = hex(paleta[leyenda[c]]);
          ctx.fillRect(x, y, 1, 1);
        });
      });
      escena.textures.addCanvas(clave, lienzo);
    });
  });
}

export function crearAnimacionesSprites(escena, animaciones) {
  Object.entries(animaciones).forEach(([clave, a]) => {
    if (escena.anims.exists(clave)) return;
    escena.anims.create({
      key: clave,
      frames: a.frames.map((f) => ({ key: `${a.sprite}-${f}` })),
      frameRate: a.fps,
      repeat: a.loop ? -1 : 0,
    });
  });
}
