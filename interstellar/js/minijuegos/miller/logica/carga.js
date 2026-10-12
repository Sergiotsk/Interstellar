// Fase 1 (nuevo): baliza + 2 cargas. Se llevan de a una hasta el Ranger; al cargarlas la ola retrocede.
// Con las 3 a bordo beaconAcquired pasa a true y abordar() habilita el despegue (nave.js no cambia).
import { ANIM, PALETA_PIXEL } from '../config.js';
import { sonar, textoFlotante, mostrarBanner } from './efectos.js';
import { emboscada } from './fauna.js';

export const NOMBRES_CARGA = Object.freeze({ baliza: 'BALIZA DE MILLER', caja_negra: 'CAJA NEGRA', muestra: 'MUESTRA DEL OCÉANO' });

const entre = (rng, [min, max]) => min + rng() * (max - min);

// Los extras salen a ambos lados de la direccion de la baliza: siempre del lado contrario a la ola.
export function crearCargas(config, rng, bX, bY, beaconAngle) {
  const C = config.carga;
  const cargas = [{ tipo: 'baliza', x: bX, y: bY, estado: 'suelo' }];
  ['caja_negra', 'muestra'].slice(0, C.extras).forEach((tipo, i) => {
    const lado = i % 2 ? -1 : 1;
    const angulo = beaconAngle + lado * entre(rng, C.separacionAngular);
    const distancia = entre(rng, C.distanciaExtra);
    cargas.push({ tipo, x: Math.round(Math.cos(angulo) * distancia), y: Math.round(Math.sin(angulo) * distancia), estado: 'suelo' });
  });
  return cargas;
}

function masCercanaEnSuelo(sim) {
  let mejor = null;
  let dMin = Infinity;
  for (const c of sim.cargas) {
    if (c.estado !== 'suelo') continue;
    const d = Math.hypot(sim.playerX - c.x, sim.playerY - c.y);
    if (d < dMin) {
      dMin = d;
      mejor = c;
    }
  }
  return { carga: mejor, distancia: dMin };
}

function recoger(sim, c, config, rng) {
  c.estado = 'llevando';
  sim.cargando = c.tipo;
  if (!sim.huida) {
    sim.huida = true;
    sim.phase = 'RETRIEVED';
    sim.waveSpeed = config.waveSpeedFlight;
  }
  sim.screenShake = ANIM.shake.fuerte * 2;
  sonar(sim, 'playBeaconAcquired');
  mostrarBanner(sim, `¡${NOMBRES_CARGA[c.tipo]} RECUPERADA!`, 'LLEVALA AL RANGER', PALETA_PIXEL.P13, 2.2, true);
  emboscada(sim, config, rng);
}

function cargarEnNave(sim, config) {
  const c = sim.cargas.find((x) => x.estado === 'llevando');
  c.estado = 'cargada';
  sim.cargando = null;
  sim.cargasCargadas++;
  sim.waveDistance += config.carga.retrasoOla;
  sonar(sim, 'playPickup', true);
  textoFlotante(sim, sim.shipX, sim.shipY - 40, '+ LA OLA RETROCEDE', PALETA_PIXEL.P18, true);
  const total = sim.cargas.length;
  if (sim.cargasCargadas < total) {
    mostrarBanner(sim, `${NOMBRES_CARGA[c.tipo]} CARGADA ${sim.cargasCargadas}/${total}`, 'VOLVÉ POR LA SIGUIENTE', PALETA_PIXEL.P18, 2.0);
    return;
  }
  sim.beaconAcquired = true;
  sonar(sim, 'playPowerupChime');
  mostrarBanner(sim, `CARGA COMPLETA ${total}/${total}`, '¡SUBÍ AL RANGER [E] PARA EL ASCENSO!', PALETA_PIXEL.P13, 2.5, true);
}

export function actualizarCargas(sim, config, rng) {
  if (sim.cargando) {
    if (Math.hypot(sim.playerX - sim.shipX, sim.playerY - sim.shipY) <= config.shipBoardingRadius) cargarEnNave(sim, config);
    return;
  }

  // Sonar hacia la carga en el suelo mas cercana: mas rapido y mas agudo cuanto mas cerca.
  const { carga, distancia } = masCercanaEnSuelo(sim);
  if (!carga) return;
  const intervalo = Math.max(0.3, Math.min(1.8, distancia / 480));
  if (sim.elapsedSeconds - sim.lastSonarTime >= intervalo) {
    sim.lastSonarTime = sim.elapsedSeconds;
    sonar(sim, 'playBeaconSonar', Math.min(2.0, Math.max(0.8, 1.8 - distancia / 600)));
  }
  if (distancia <= config.beaconPickupRadius) recoger(sim, carga, config, rng);
}
