// Controles tactiles del original: D-pad de 4 direcciones y botones de accion por fase.
// Escriben en los campos touch* de sim, igual que los onPointerDown del JSX; las acciones puntuales van por callback.

export function conectarTactil(raiz, { obtenerSim, alGesto, acciones }) {
  const dpad = [...raiz.querySelectorAll('[data-dir]')];
  const botones = [...raiz.querySelectorAll('[data-control]')];
  const limpiezas = [];
  const escuchar = (el, tipo, fn) => {
    el.addEventListener(tipo, fn);
    limpiezas.push(() => el.removeEventListener(tipo, fn));
  };

  dpad.forEach((boton) => {
    const [x, y] = boton.dataset.dir.split(',').map(Number);
    const soltar = () => {
      boton.removeAttribute('data-activo');
      const sim = obtenerSim();
      if (sim.touchDir.x === x && sim.touchDir.y === y) sim.touchDir.active = false;
    };
    escuchar(boton, 'pointerdown', (e) => {
      e.preventDefault();
      alGesto();
      boton.setAttribute('data-activo', '');
      obtenerSim().touchDir = { x, y, active: true };
    });
    // El original solo soltaba con pointerup; cancel y leave evitan que la direccion quede pegada.
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((t) => escuchar(boton, t, soltar));
    escuchar(boton, 'contextmenu', (e) => e.preventDefault());
  });

  botones.forEach((boton) => {
    const control = boton.dataset.control;
    escuchar(boton, 'pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      alGesto();
      boton.setAttribute('data-activo', '');
      const sim = obtenerSim();
      if (control === 'fuego') sim.touchShoot = true;
      else if (control === 'salto') sim.touchJump = true;
      else if (control === 'slide') sim.touchSlide = true;
      else acciones[control]?.();
    });
    const soltar = () => {
      boton.removeAttribute('data-activo');
      if (control === 'fuego') obtenerSim().touchShoot = false;
    };
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((t) => escuchar(boton, t, soltar));
    escuchar(boton, 'contextmenu', (e) => e.preventDefault());
  });

  return () => limpiezas.forEach((fn) => fn());
}
