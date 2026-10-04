// Lógica pura del favicon (feature favicon). Sin dependencias: el contenedor
// .ico se arma a mano con PNG embebido (formato Vista+) para no sumar librerías.
// Testeado en tests/make-favicon.test.js.

// Tamaños que se embeben en el .ico. Es el mismo trío que incluye
// sharp al rasterizar; Windows/Chrome/Firefox eligen el que corresponde.
export const ICO_SIZES = [16, 32, 48];

// Arma un .ico multi-size a partir de imágenes PNG ya rasterizadas.
// Formato ICO: ICONDIR (6 B) + ICONDIRENTRY (16 B c/u) + blobs PNG pegados.
// images: [{ size: number, png: Buffer }]
export function buildIco(images) {
  const count = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type = 1 (icon)
  header.writeUInt16LE(count, 4);

  const entries = Buffer.alloc(16 * count);
  let offset = 6 + 16 * count;
  images.forEach(({ size, png }, i) => {
    const e = i * 16;
    const dim = size >= 256 ? 0 : size; // 0 = 256 (convención ICO)
    entries.writeUInt8(dim, e + 0); // ancho
    entries.writeUInt8(dim, e + 1); // alto
    entries.writeUInt8(0, e + 2); // colores de paleta (0 = truecolor)
    entries.writeUInt8(0, e + 3); // reservado
    entries.writeUInt16LE(1, e + 4); // planos
    entries.writeUInt16LE(32, e + 6); // bits por píxel
    entries.writeUInt32LE(png.length, e + 8); // bytes de la imagen
    entries.writeUInt32LE(offset, e + 12); // offset desde el inicio del archivo
    offset += png.length;
  });

  return Buffer.concat([header, entries, ...images.map((img) => img.png)]);
}
