// ════════════════════════════════════════════════════════════
//  🍔 Configuración del personalizador de hamburguesas
//  Para cambiar precios o ingredientes: editar SOLO este archivo.
//  (No depende del panel admin ni de "Publicar cambios".)
// ════════════════════════════════════════════════════════════

// Precio de cada medallón adicional sobre la receta base (que trae 1).
export const MEDALLON_EXTRA_PRECIO = 4500;

// Opciones de medallones: total de carnes en la hamburguesa.
export const MEDALLON_OPCIONES = [
  { total: 1, name: 'Simple', desc: 'La receta original' },
  { total: 2, name: 'Doble',  desc: '+1 medallón de carne' },
  { total: 3, name: 'Triple', desc: '+2 medallones de carne' },
];

// Extras con cantidad. Las verduras NO se ofrecen como extras pagos.
export const EXTRAS = [
  { id: 'cheddar', name: 'Cheddar extra', desc: 'Sumá más queso',  icon: '🧀', precio: 1500 },
  { id: 'panceta', name: 'Panceta extra', desc: 'Más crocante',    icon: '🥓', precio: 1500 },
  { id: 'huevo',   name: 'Huevo',         desc: 'Aunque no venga en la receta', icon: '🍳', precio: 1200 },
];

// Salsas y dips (opcionales, cada uno con su precio).
export const DIPS = [
  { id: 'mayo', name: 'Dip de mayo', desc: 'Clásico, cremoso, irresistible', icon: '🥣', precio: 800 },
];

// Hamburguesas que usan el personalizador (clave = nombre exacto del item
// en el menú) y los ingredientes que el cliente puede quitar (sin costo).
export const BURGER_CONFIG = {
  'Simple': {
    ingredientes: ['Lactonesa de la casa', 'Cheddar'],
  },
  'Completa': {
    ingredientes: ['Lactonesa de la casa', 'Lechuga', 'Tomate', 'Bacon', 'Cheddar'],
  },
  'Di Lusso': {
    ingredientes: ['Cheddar', 'Lactonesa de la casa', 'Ketchup', 'Cebolla', 'Bacon'],
  },
  'Hamb Bruzz': {
    ingredientes: ['Cheddar', 'Salsa Bruzz', 'Rúcula', 'Cebolla morada', 'Bacon', 'Pepinos encurtidos', 'Barbacoa'],
  },
};
