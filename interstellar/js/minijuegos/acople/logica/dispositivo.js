// Decide si mostrar el aviso "disponible en desktop": tactil sin ningun puntero fino (research R7).

export function debeMostrarAvisoDesktop({ punteroGrueso, algunPunteroFino }) {
  return Boolean(punteroGrueso) && !algunPunteroFino;
}
