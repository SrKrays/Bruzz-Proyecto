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

export const MUZZA_EXTRA_PRECIO = 2500;
export const PEPINO_EXTRA_PRECIO = 800;   // ⚠ a confirmar con el local

// Extras con cantidad. Las verduras NO se ofrecen como extras pagos.
export const EXTRAS = [
  { id: 'cheddar', name: 'Cheddar extra', desc: 'Sumá más queso',  icon: '🧀', precio: 1500 },
  { id: 'panceta', name: 'Panceta extra', desc: 'Más crocante',    icon: '🥓', precio: 1500 },
  { id: 'huevo',   name: 'Huevo',         desc: 'Aunque no venga en la receta', icon: '🍳', precio: 1200 },
  { id: 'pepino',  name: 'Pepinos extra', desc: 'Más crocantes y ácidos', icon: '🥒', precio: PEPINO_EXTRA_PRECIO },
  // Pizzas y calzones. ⚠ Precio a confirmar con el local.
  { id: 'muzza',   name: 'Muzza extra',   desc: 'Más mozzarella derretida', icon: '🧀', precio: MUZZA_EXTRA_PRECIO },
];

// Salsas y dips (opcionales, cada uno con su precio).
export const DIPS = [
  { id: 'mayo', name: 'Dip de mayo', desc: 'Clásico, cremoso, irresistible', icon: '🥣', precio: 800 },
];

// Estilos de papas fritas (gratis). Se usa en el panel de producto
// y en el selector de papas del resto de los productos.
export const PAPAS_ESTILOS = [
  { id: 'clasicas',  name: 'Clásicas',      desc: 'Con la sal de siempre.', short: 'Con la sal de siempre' },
  { id: 'sazonadas', name: 'Sazonadas 🧡', badge: 'Nuevo', desc: 'Un condimento bien intenso, anaranjado y adictivo — como si te comieras una bolsa entera de Doritos®, pero en papa.', short: 'Sabor intenso y anaranjado' },
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
  'Lomito Americano': ['Lactonesa de la casa', 'Barbacoa', 'Queso cheddar', 'Panceta', 'Huevo', 'Cebolla morada caramelizada'],
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

// Ítems sueltos que ya no se muestran en la carta: ahora son extras dentro del panel
export const HIDDEN_ITEMS = ['Medallón extra', 'Bife extra (100g)'];
const ADD_ONS = HIDDEN_ITEMS;

// ── Variedades de Pizza Sin T.A.C.C. ─────────────────────
export const VARIEDADES_SINTACC = [
  { id: 'napolitana',   name: 'Napolitana',    desc: 'Salsa de tomate fresca, mozzarella, rodajas de tomate fresco, aceite de ajo y orégano.' },
  { id: 'cuatroquesos', name: 'Cuatro Quesos', desc: 'Salsa de tomate fresca, mozzarella, parmesano, sardo, roquefort, orégano.' },
  { id: 'muzzajamon',   name: 'Muzza y Jamón', desc: 'Salsa de tomate fresca, abundante mozzarella, jamón cocido y orégano.' },
];

// ── Medallones de la Veggie ───────────────────────────────
export const MEDALLONES = [
  { id: 'remolacha', name: 'Tabule',          desc: 'Mijo, cebolla de verdeo, tomate deshidratado, harina de garbanzos, fábula de mandioca, aceite de girasol, jugo y ralladura de limón y especias.' },
  { id: 'quinoa',    name: 'Burrito Mexicano', desc: 'Poroto negro, arroz blanco, cebolla, harina de garbanzos, fábula de mandioca, aceite de girasol, jugo y ralladura de limón y especias.' },
  { id: 'garbanzo',  name: 'Curry India',      desc: 'Lentejas, coliflor, espinaca, tomate deshidratado, harina de garbanzos, fábula de mandioca y especias.' },
  { id: 'lentejas',  name: 'Fabel India',      desc: 'Garbanzos, fábula de mandioca, aceite de girasol, harina de garbanzos, perejil, comino y pimienta blanca.' },
];

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
  tab: 'Carne', title: 'Medallones', question: '¿Cuántos medallones querés?', icon: '🍔',
  intro: 'Elegí cuántos medallones de carne querés.',
  unit: 'medallón', options: MEDALLON_OPCIONES, extraPrecio: MEDALLON_EXTRA_PRECIO,
  line: (total) => (total === 2 ? 'Doble (2 medallones)' : `Triple (${total} medallones)`),
};
const CARNE_LOMO = {
  tab: 'Lomo', title: 'Lomo', question: '¿Querés más lomo?', icon: '🥩',
  intro: 'Sumá más lomo a tu sándwich.',
  unit: 'bife', options: BIFE_OPCIONES, extraPrecio: BIFE_EXTRA_PRECIO,
  line: (total) => (total === 2 ? '1 bife extra (100g)' : `${total - 1} bifes extra (100g)`),
};

const VARIANTS_VEGGIE = {
  tab: 'Medallón', title: 'Elegí tu medallón', question: '¿Qué medallón querés?', icon: '🌿', multi: true,
  intro: 'Elegí el medallón Veggie de tu hamburguesa.',
  options: MEDALLONES,
};
const VARIANTS_SINTACC = {
  tab: 'Variedad', title: 'Tu variedad Sin T.A.C.C.', question: '¿Qué variedad querés?', icon: '🌾', multi: false,
  intro: 'Elegí la variedad de tu pizza con masa libre de gluten.',
  options: VARIEDADES_SINTACC,
  byId: Object.fromEntries(VARIEDADES_SINTACC.map((v) => [v.id, parseIngredientes(v.desc)])),
};

/**
 * Devuelve la configuración del panel para un producto, o null si el producto
 * no usa panel (agregados sueltos, bebidas, postres, etc.).
 *   menuKey → clave del menú (hamburgesas, lomitos, sandwich, papas, pizza, calzone)
 */
export function getPanelConfig(menuKey, item) {
  if (!item || item.sep || ADD_ONS.includes(item.name)) return null;
  const name = item.name;

  if (menuKey === 'hamburgesas') {
    const isCombo = name.startsWith('Combo ');
    const baseName = isCombo ? name.replace('Combo ', '').replace(/^Bruzz$/, 'Hamb Bruzz') : name;
    const ingredientes = BURGER_INGREDIENTES[baseName];
    if (!ingredientes) return null;
    const isBambino = name === 'Hamburgesa Bambino';
    const isVeggie = baseName === 'Veggie';
    return {
      variants: isVeggie ? VARIANTS_VEGGIE : null,
      kind: 'burger', visual: 'stack', pan: 'papa', main: isVeggie ? 'veggie' : 'patty',
      base: isVeggie ? ['Pan de papa Americano', 'Medallón Veggie'] : BASE_INGREDIENTES,
      ingredientes,
      carne: isVeggie ? null : CARNE_BURGER,
      // Solo la Simple (y su combo) permite sumar panceta o pepinos; el resto no lleva extras
      extras: (name === 'Simple' || name === 'Combo Simple') ? ['panceta', 'pepino'] : [],
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
      dips: true, sides: [], variants: null,
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
      dips: true, sides: [], variants: null,
    };
  }

  if (menuKey === 'papas') {
    const chips = PAPAS_INFO[name] || parseIngredientes(item.desc);
    return {
      kind: 'papas', visual: 'photo', pan: null, main: null,
      base: [], ingredientes: chips.slice(1), infoChips: chips,
      carne: null, extras: [], dips: true, sides: [], variants: null,
    };
  }

  if (menuKey === 'pizza' || menuKey === 'calzone') {
    const sinTacc = item.sinTacc === true;
    const bambino = name === 'Mini Pizza Bambino';
    const chips = bambino ? ['Muzzarella'] : parseIngredientes(item.desc);
    return {
      kind: 'pizza', visual: 'photo', pan: null, main: null,
      base: sinTacc ? ['Masa artesanal sin TACC'] : (bambino ? [] : ['Masa napolitana']),
      ingredientes: sinTacc ? [] : chips,
      infoChips: sinTacc ? [] : chips,
      carne: null, extras: ['muzza'], dips: false,
      sides: bambino
        ? [{ emoji: '🥤', label: 'Bebida' }, { emoji: '🍦', label: 'Helado' }, { emoji: '🧸', label: 'Juguete' }]
        : [],
      variants: sinTacc ? VARIANTS_SINTACC : null,
    };
  }

  return null;
}
