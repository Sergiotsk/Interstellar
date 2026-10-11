// Voz grabada que suena por el grafo Web Audio del juego: pasa por su ganancia maestra, asi respeta el mute.

const traerArchivo = (url) => fetch(url).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(r.status))));

export function crearClip(url, traer = traerArchivo) {
  const buffers = new WeakMap();

  // Una descarga y una decodificacion por AudioContext; si falla, el clip queda mudo.
  function cargar(ctx) {
    if (!buffers.has(ctx)) {
      buffers.set(ctx, traer(url).then((datos) => ctx.decodeAudioData(datos)).catch(() => null));
    }
    return buffers.get(ctx);
  }

  return {
    precargar(ctx) {
      if (ctx) cargar(ctx);
    },
    async sonar(ctx, destino, ganancia = 1) {
      if (!ctx || !destino) return false;
      const buffer = await cargar(ctx);
      if (!buffer) return false;
      const volumen = ctx.createGain();
      volumen.gain.value = ganancia;
      const fuente = ctx.createBufferSource();
      fuente.buffer = buffer;
      fuente.connect(volumen).connect(destino);
      fuente.start();
      return true;
    },
  };
}
