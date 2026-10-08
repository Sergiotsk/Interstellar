// Parametros de juego del acople: unico lugar con numeros de gameplay y nombres de la pelicula (FR-018, FR-039).
// Unidades de juego: distancia en u, angulos en rad, tiempo en s, combustible como fraccion 0-1.

const congelar = (obj) => {
  Object.values(obj).forEach((v) => {
    if (v && typeof v === 'object') congelar(v);
  });
  return Object.freeze(obj);
};

export const CONFIG = congelar({
  nombres: { estacion: 'Endurance', nave: 'Ranger' },
  teclas: {
    ArrowLeft: 'rotarIzquierda',
    ArrowRight: 'rotarDerecha',
    ArrowUp: 'impulso',
    Space: 'freno',
    KeyA: 'rotarIzquierda',
    KeyD: 'rotarDerecha',
    KeyW: 'impulso',
    KeyS: 'freno',
  },

  pasoFijoS: 1 / 60,
  deltaMaxS: 0.1,

  estacion: { velAngular: 0.9, anguloInicial: 1.2, anguloPuerto: 0 },
  nave: { aceleracionAngular: 0.6, friccionAngular: 0, empuje: 6, frenado: 8, velAngularInicial: 0 },

  distanciaInicial: 600,
  zonaCercana: 150,
  rangoAcople: 40,

  tol: { omega: 0.08, angulo: 0.15, velocidad: 6 },
  peligro: { omega: 0.4, angulo: 0.6, velocidad: 15 },

  limiteControl: 2.4,
  margenSinControl: 2.5,

  combustible: { inicial: 1, consumoRotacion: 0.01, consumoImpulso: 0.03, consumoFreno: 0.03 },

  // Acople manual (FR-014 revisado): Enter dentro del rango; fuera de tolerancia se rechaza.
  acople: { tecla: 'Enter', esperaRechazo: 1, costoRechazo: 0.02, velRebote: 2 },

  puntaje: {
    max: 10000,
    tMin: 30,
    tMax: 90,
    penalizacionRechazo: 0.2,
    pesos: { precision: 0.3, combustible: 0.2, tiempo: 0.15, suavidad: 0.2, velocidad: 0.15 },
  },

  // Tabla de puntajes local estilo fichin: top N con nombre de hasta largoNombre letras.
  ranking: {
    clave: 'interstellar:minijuegos:acople:ranking',
    version: 1,
    tope: 10,
    largoNombre: 8,
    alfabeto: 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ0123456789 ',
    nombrePorDefecto: 'RANGER',
  },
});
