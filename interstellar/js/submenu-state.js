// Maquina de estados del submenu (data-model.md §6, contracts/navigation.md). Modulo PURO: sin DOM.
// Invariante: maximo un submenu abierto. Eventos: toggle(id), open(id), navigate(), dismiss().

export function createSubmenuState() {
  let openSubmenuId = null;

  return {
    get openSubmenuId() {
      return openSubmenuId;
    },

    // Al abrir un submenu, cierra cualquier otro que este abierto (maximo uno abierto).
    toggle(id) {
      if (openSubmenuId === id) {
        openSubmenuId = null; // abierto -> cerrado (toggle del mismo control)
      } else {
        openSubmenuId = id; // cerrado -> abierto; cierra el eventual otro (abrir-otro)
      }
    },

    // Abre id sin cerrar si ya esta abierto (a diferencia de toggle; BUGFIX SC-010, re-entrada).
    open(id) {
      if (openSubmenuId === id) {
        return; // ya abierto: mantener, no cerrar
      }
      openSubmenuId = id; // abre el nuevo y cierra cualquier otro
    },

    // Activar un destino anidado: cierra el submenu (abierto -> cerrado).
    navigate() {
      openSubmenuId = null;
    },

    // Cierra y devuelve el id del control para restaurar el foco (null si no habia abierto).
    dismiss() {
      const controlObjetivo = openSubmenuId;
      openSubmenuId = null;
      return controlObjetivo;
    },
  };
}
