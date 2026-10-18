// ════════════════════════════════════════════════════════════
//  🍔 Configuración del panel de producto (personalizador)
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

// Lomitos: el menú ya vende "Bife extra (100g)" a $8.000.
export const BIFE_EXTRA_PRECIO = 8000;
export const BIFE_OPCIONES = [
  { total: 1, name: 'Lomo 180g',     desc: 'La receta original' },
  { total: 2, name: 'Con bife extra', desc: '+100g de lomo' },
  { total: 3, name: 'Doble bife extra', desc: '+200g de lomo' },
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

// Estilos de papas fritas (gratis). Se usa en el panel de producto
// y en el selector de papas del resto de los productos.
export const PAPAS_ESTILOS = [
  { id: 'clasicas',  name: 'Clásicas',      desc: 'Con la sal de siempre.' },
  { id: 'sazonadas', name: 'Sazonadas 🧡', badge: 'Nuevo', desc: 'Un condimento bien intenso, anaranjado y adictivo — como si te comieras una bolsa entera de Doritos®, pero en papa.' },
];

// Ingredientes base de toda hamburguesa (no se pueden quitar). Se muestran en
// la pestaña de información para que el cliente vea la composición completa.
export const BASE_INGREDIENTES = ['Pan de papa Americano', 'Carne de res'];

// ── Recetas (ingredientes que el cliente puede quitar, sin costo) ──
const BURGER_INGREDIENTES = {
  'Simple':     ['Lactonesa de la casa', 'Cheddar'],
  'Completa':   ['Lactonesa de la casa', 'Lechuga', 'Tomate', 'Bacon', 'Cheddar'],
  'Di Lusso':   ['Cheddar', 'Lactonesa de la casa', 'Ketchup', 'Cebolla', 'Bacon'],
  'Hamb Bruzz': ['Cheddar', 'Salsa Bruzz', 'Rúcula', 'Cebolla morada', 'Bacon', 'Pepinos encurtidos', 'Barbacoa'],
  'Veggie':     ['Lechuga', 'Tomate', 'Cheddar', 'Lactonesa de albahaca'],
  // Combo infantil: se arma sobre la Simple
  'Hamburgesa Bambino': ['Lactonesa de la casa', 'Cheddar'],
};

const LOMO_INGREDIENTES = {
  'Lomito Simple':   ['Lactonesa de la casa', 'Queso tybo', 'Jamón cocido', 'Chimi de la casa'],
  'Lomito Completo': ['Lactonesa de la casa', 'Queso tybo', 'Jamón cocido', 'Huevo', 'Lechuga', 'Tomate', 'Chimi de la casa'],
  'Lomito Americano': ['Lactonesa de la casa', 'Barbacoa', 'Cheddar', 'Panceta', 'Huevo', 'Cebolla morada caramelizada'],
};

const SANDWICH = {
  'Tostato':     { pan: 'artesanal', main: null,      base: ['Pan artesanal'],  ingredientes: ['Lactonesa de la casa', 'Jamón cocido', 'Queso dambo'] },
  'Macerata':    { pan: 'artesanal', main: null,      base: ['Pan artesanal'],  ingredientes: ['Lactonesa de la casa', 'Queso dambo', 'Jamón crudo', 'Tomate', 'Rúcula'] },
  'Vegetariano': { pan: 'focaccia',  main: null,      base: ['Pan de focaccia'], ingredientes: ['Salsa Bruzz', 'Lechuga', 'Tomate', 'Zucchini y berenjena grillado', 'Queso dambo'] },
  'Ternera':     { pan: 'focaccia',  main: 'ternera', base: ['Pan de focaccia', 'Ternera desmenuzada en vino tinto'], ingredientes: ['Lactonesa de albahaca', 'Rúcula', 'Tomate'] },
};

// Chips de información para productos "de muestra" (pizza, calzone, papas)
const PAPAS_INFO = {
  'Patatines':         ['Papas fritas clásicas'],
  'Papas Carbonara':   ['Papas fritas', 'Huevo revuelto', 'Parmesano', 'Panceta'],
  'Papas con Cheddar': ['Papas fritas', 'Cheddar', 'Bacon', 'Cebolla de verdeo'],
};

// Productos sueltos del menú que son agregados (no abren el panel)
const ADD_ONS = ['Medallón extra', 'Bife extra (100g)'];

// Separa la descripción en ingredientes (para pizzas y calzones)
export function parseIngredientes(desc = '') {
  return desc
    .replace(/\.\s*$/, '')
    .split(/,\s*|\s+y\s+|\s+\+\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => !/^(pizza estilo|masa artesanal|elegí|envuelto)/i.test(s))
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1));
}

const CARNE_BURGER = {
  tab: 'Carne', title: 'Medallones', icon: '🍔',
  intro: 'Elegí cuántos medallones de carne querés.',
  unit: 'medallón', options: MEDALLON_OPCIONES, extraPrecio: MEDALLON_EXTRA_PRECIO,
  line: (total) => `${total} medallones de carne (+${total - 1} extra)`,
};
const CARNE_LOMO = {
  tab: 'Lomo', title: 'Lomo', icon: '🥩',
  intro: 'Sumá más lomo a tu sándwich.',
  unit: 'bife', options: BIFE_OPCIONES, extraPrecio: BIFE_EXTRA_PRECIO,
  line: (total) => (total === 2 ? '1 bife extra (100g)' : `${total - 1} bifes extra (100g)`),
};

/**
 * Devuelve la configuración del panel para un producto, o null si el producto
 * no usa panel (agregados sueltos, bebidas, postres, etc.).
 *   menuKey → clave del menú (hamburgesas, lomitos, sandwich, papas, pizza, calzone)
 */
export function getPanelConfig(menuKey, item) {
  if (!item || item.sep || ADD_ONS.includes(item.name)) return null;
  // Flujos especiales que siguen con su selector propio dentro de la tarjeta
  if (item.sinTacc === true || item.name === 'Veggie') return null;
  const name = item.name;

  if (menuKey === 'hamburgesas') {
    const isCombo = name.startsWith('Combo ');
    const baseName = isCombo ? name.replace('Combo ', '').replace(/^Bruzz$/, 'Hamb Bruzz') : name;
    const ingredientes = BURGER_INGREDIENTES[baseName];
    if (!ingredientes) return null;
    const isBambino = name === 'Hamburgesa Bambino';
    const isVeggie = baseName === 'Veggie';
    return {
      kind: 'burger', visual: 'stack', pan: 'papa', main: isVeggie ? 'veggie' : 'patty',
      base: isVeggie ? ['Pan de papa Americano', 'Medallón Veggie'] : BASE_INGREDIENTES,
      ingredientes,
      carne: isVeggie ? null : CARNE_BURGER,
      extras: isVeggie ? ['cheddar', 'huevo'] : ['cheddar', 'panceta', 'huevo'],
      dips: true,
      sides: isBambino
        ? [{ emoji: '🥤', label: 'Gaseosa' }, { emoji: '🍦', label: 'Helado' }, { emoji: '🧸', label: 'Juguete' }]
        : isCombo ? [{ emoji: '🥤', label: 'Gaseosa 500ml' }] : [],
    };
  }

  if (menuKey === 'lomitos') {
    const ingredientes = LOMO_INGREDIENTES[name];
    if (!ingredientes) return null;
    return {
      kind: 'lomo', visual: 'stack', pan: 'focaccia', main: 'lomo',
      base: ['Pan de focaccia', 'Lomo 180g'],
      ingredientes,
      carne: CARNE_LOMO,
      extras: ['cheddar', 'panceta', 'huevo'],
      dips: true, sides: [],
    };
  }

  if (menuKey === 'sandwich') {
    const c = SANDWICH[name];
    if (!c) return null;
    return {
      kind: 'sandwich', visual: 'stack', pan: c.pan, main: c.main,
      base: c.base, ingredientes: c.ingredientes,
      carne: null,
      extras: name === 'Vegetariano' ? ['cheddar', 'huevo'] : ['cheddar', 'panceta', 'huevo'],
      dips: true, sides: [],
    };
  }

  if (menuKey === 'papas') {
    return {
      kind: 'papas', visual: 'photo', pan: null, main: null,
      base: [], ingredientes: [], infoChips: PAPAS_INFO[name] || parseIngredientes(item.desc),
      carne: null, extras: [], dips: true, sides: [],
    };
  }

  if (menuKey === 'pizza' || menuKey === 'calzone') {
    return {
      kind: 'pizza', visual: 'photo', pan: null, main: null,
      base: [], ingredientes: [],
      infoChips: parseIngredientes(item.desc),
      carne: null, extras: [], dips: false, sides: [],
    };
  }

  return null;
}
