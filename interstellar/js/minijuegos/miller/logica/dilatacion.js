// Reloj de dilatacion: 1 h en Miller = 7 anos en la Tierra. Licencia narrativa de la pelicula (FR-014).

const HORAS_ANO = 365.25 * 24;
const HORAS_MES = HORAS_ANO / 12;

export function horasTerrestres(segundos, config) {
  return (segundos * config.dilatacion.anosPorHora * HORAS_ANO) / 3600;
}

export function formatoTierra(horas) {
  const anos = Math.floor(horas / HORAS_ANO);
  const restoAno = horas - anos * HORAS_ANO;
  const meses = Math.floor(restoAno / HORAS_MES);
  const dias = Math.floor((restoAno - meses * HORAS_MES) / 24);
  return { anos, meses, dias };
}
