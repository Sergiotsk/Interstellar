// Configuración del árbol de navegación (única fuente de verdad, FR-002..FR-008).
// Los labels coinciden exactamente con FR-002 y FR-005..FR-008; ids y hrefs en kebab-case sin acentos.

const mundos = {
  id: 'mundos',
  label: 'Mundos',
  href: 'mundos.html',
  hasChildren: true,
  children: [
    { id: 'tierra', label: 'La Tierra', href: 'mundos.html#tierra' },
    { id: 'gargantua', label: 'Gargantúa', href: 'mundos.html#gargantua' },
    { id: 'miller', label: 'Planeta de Miller', href: 'mundos.html#miller' },
    { id: 'mann', label: 'Planeta de Mann', href: 'mundos.html#mann' },
    { id: 'tesseract', label: 'El Tesseract', href: 'mundos.html#tesseract' },
  ],
};

const personajes = {
  id: 'personajes',
  label: 'Personajes',
  href: 'personajes.html',
  hasChildren: true,
  children: [
    { id: 'cooper', label: 'Cooper', href: 'personajes.html#cooper' },
    { id: 'murph', label: 'Murph', href: 'personajes.html#murph' },
    { id: 'brand', label: 'Dr. Brand', href: 'personajes.html#brand' },
    { id: 'profesor-brand', label: 'Profesor Brand', href: 'personajes.html#profesor-brand' },
    { id: 'mann', label: 'Mann', href: 'personajes.html#mann' },
    { id: 'tars-case', label: 'TARS & CASE', href: 'personajes.html#tars-case' },
  ],
};

const laCiencia = {
  id: 'la-ciencia',
  label: 'La Ciencia',
  href: 'ciencia.html',
  hasChildren: true,
  children: [
    { id: 'agujeros-negros', label: 'Agujeros negros', href: 'ciencia.html#agujeros-negros' },
    { id: 'dilatacion-temporal', label: 'Dilatación temporal', href: 'ciencia.html#dilatacion-temporal' },
    { id: 'agujeros-de-gusano', label: 'Agujeros de gusano', href: 'ciencia.html#agujeros-de-gusano' },
    { id: 'relatividad', label: 'Relatividad', href: 'ciencia.html#relatividad' },
  ],
};

const elViaje = {
  id: 'el-viaje',
  label: 'El Viaje',
  href: 'viaje.html',
  hasChildren: true,
  children: [
    { id: 'tierra', label: 'Tierra', href: 'viaje.html#tierra' },
    { id: 'agujero-de-gusano', label: 'Agujero de gusano', href: 'viaje.html#agujero-de-gusano' },
    { id: 'miller', label: 'Miller', href: 'viaje.html#miller' },
    { id: 'mann', label: 'Mann', href: 'viaje.html#mann' },
    { id: 'gargantua', label: 'Gargantúa', href: 'viaje.html#gargantua' },
    { id: 'tesseract', label: 'Tesseract', href: 'viaje.html#tesseract' },
  ],
};

export const NavConfig = {
  items: [
    { id: 'inicio', label: 'Inicio', href: 'index.html', hasChildren: false, children: [] },
    mundos,
    personajes,
    laCiencia,
    elViaje,
    { id: 'galeria', label: 'Galería', href: 'galeria.html', hasChildren: false, children: [] },
    { id: 'minijuegos', label: 'Minijuegos', href: 'minijuegos.html', hasChildren: false, children: [] },
    { id: 'trailer', label: 'Trailer', href: 'trailer.html', hasChildren: false, children: [] },
  ],
};