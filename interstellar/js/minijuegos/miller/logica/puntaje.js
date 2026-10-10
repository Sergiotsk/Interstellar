// Formulas de puntaje y tiempo terrestre del original (App.tsx: draw del HUD, muerte y acople).

const HORAS_ANO = 365.25 * 24;

export function horasTerrestres(segundos, config) {
  return segundos * config.horasTerrestresPorSegundo;
}

export function anosTerrestres(segundos, config) {
  return horasTerrestres(segundos, config) / HORAS_ANO;
}

// "0y 4m" de la barra superior (earthYearsDisplay).
export function textoAnosHud(segundos, config) {
  const anos = anosTerrestres(segundos, config);
  return `${Math.floor(anos)}y ${Math.floor((anos % 1) * 12)}m`;
}

export function puntajeEnVivo(sim) {
  return Math.max(0, Math.floor(sim.altitude * 2.5) + sim.enemiesDestroyed * 200 + sim.aerialInterceptorsDowned * 350);
}

export function puntajeFallo(sim) {
  return Math.max(0, Math.floor(sim.elapsedSeconds * 15) + sim.enemiesDestroyed * 150 + sim.aerialInterceptorsDowned * 350);
}

export function puntajeVictoria(sim) {
  return Math.max(
    1000,
    45000 -
      Math.floor(sim.elapsedSeconds * 25) +
      sim.enemiesDestroyed * 200 +
      sim.aerialInterceptorsDowned * 400 +
      (sim.caseAssisting ? 3000 : 0),
  );
}

export function rangoDe(total) {
  if (total >= 40000) return 'S';
  if (total >= 30000) return 'A';
  if (total >= 20000) return 'B';
  return 'C';
}

function base(sim, config) {
  return {
    missionTime: Math.floor(sim.elapsedSeconds),
    earthYearsLost: anosTerrestres(sim.elapsedSeconds, config).toFixed(1),
    enemiesDestroyed: sim.enemiesDestroyed,
    aerialInterceptorsDowned: sim.aerialInterceptorsDowned,
  };
}

export function resultadoVictoria(sim, config) {
  const finalScore = puntajeVictoria(sim);
  return { ...base(sim, config), finalScore, rank: rangoDe(finalScore), deathReason: null };
}

export function resultadoFallo(sim, config) {
  return { ...base(sim, config), finalScore: puntajeFallo(sim), rank: 'FAILED', deathReason: sim.deathReason };
}
