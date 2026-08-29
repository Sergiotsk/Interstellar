// Maquina de estados del submenu (data-model.md §6, contracts/navigation.md).
// Modulo PURO: sin DOM. Modela las transiciones del submenu de un eje y sus
// invariantes (maximo uno abierto, objetivo de foco al cerrar por dismiss).
//
// Estados: `cerrado` (openSubmenuId === null) / `abierto` (openSubmenuId === id).
// Eventos:
//   - toggle(id): alterna abrir/cerrar. Al abrir, cierra cualquier otro abierto
//     (abrir-otro, maximo uno abierto — FR-009).
//   - open(id): abre, cerrando cualquier otro. NO cierra si ya esta abierto
//     (re-entrada por hover — BUGFIX SC-010).
//   - navigate(): cierra al activar un destino anidado (HU1-E4).
//   - dismiss(): cierra y devuelve el id del control para restaurar foco
//     (Escape / clic fuera / abandono — FR-010).

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

    // Abrir un submenu (hover desktop): si ya esta abierto para el mismo id, no
    // hace nada (re-entrada no debe cerrar, a diferencia de toggle). Si abre uno
    // distinto, cierra el actual (maximo uno abierto).
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

    // Escape / clic fuera / abandono: cierra y devuelve el id del control para
    // restaurar el foco. Si no habia submenu abierto, devuelve null.
    dismiss() {
      const controlObjetivo = openSubmenuId;
      openSubmenuId = null;
      return controlObjetivo;
    },
  };
}
