export const CATEGORIAS = [
  {
    id: 'comidas',
    name: 'Comidas',
    desc: 'Pizza, hambur, lomitos…',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80',
  },
  {
    id: 'bebidas',
    name: 'Bebidas',
    desc: 'Cervezas, gaseosas…',
    imageUrl: 'https://69f636d2a0be0e562863ff1f.imgix.net/tirada/247dba7a3dd5c107800f3f20ff8db32f.jpg',
  },
  {
    id: 'tragos',
    name: 'Tragos',
    desc: 'Los Mejores Cócteles',
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80',
  },
  {
    id: 'postres',
    name: 'Postres',
    desc: 'Dulce final perfecto',
    imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80',
  },
];

export const SUBCATEGORIAS = {
  comidas: [
    { menuKey: 'pizza',       name: 'Pizza',        desc: 'Napolitana & italiana',    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80' },
    { menuKey: 'calzone',     name: 'Calzone',      desc: 'Relleno al horno',         imageUrl: 'https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?w=600&q=80' },
    { menuKey: 'hamburgesas', name: 'Hamburgesas',  desc: 'Con combos disponibles',   imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80' },
    { menuKey: 'lomitos',     name: 'Lomitos',      desc: 'En pan focaccia',          imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&q=80' },
    { menuKey: 'sandwich',    name: 'Sandwich',     desc: 'Artesanales & focaccia',   imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80' },
    { menuKey: 'papas',       name: 'Papas',        desc: 'Simples o con toppings',   imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80' },  ],
  bebidas: [
    { menuKey: 'sinAlcohol', name: 'Sin alcohol', desc: 'Aguas, jugos, gaseosas', imageUrl: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=600&q=80' },
    { menuKey: 'cervezas',   name: 'Cervezas',    desc: 'Porrones & pintas',      imageUrl: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&q=80' },
  ],
};

export const MENU = {

  pizza: {
    title: 'Pizzas', back: 'comidas',
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
    items: [
      { sep: 'Estilo Napolitano - Napolitana Clasica' },
      { name: 'Pepe',               price: '$23.300', desc: 'Salsa de tomate fresca, mozzarella, pepperoni, orégano.',                                                       imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80' },
      { name: 'Prosciutto Cotto',   price: '$22.000', desc: 'Salsa de tomate, mozzarella, jamón cocido, albahaca fresca, olivas verdes.',                                     imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80' },
      { name: 'Fungo',              price: '$24.700', desc: 'Salsa de tomate, mozzarella, champignones, cherrys confitados, pesto Bruzz.',                                    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80' },
      { name: 'Rúcula',             price: '$23.500', desc: 'Salsa de tomate, mozzarella, rúcula, jamón crudo, parmesano, olivas negras.',                                    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80' },
      { name: 'Quattro Formaggi',   price: '$22.000', desc: 'Salsa de tomate, mozzarella, parmesano, sardo, roquefort.',                                                      imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80' },
      { name: 'Margherita',         price: '$18.900', desc: 'Salsa de tomate fresca, mozzarella, albahaca, aceite de oliva.',                                                 imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=8₀' },
      { name: 'Pizza Bruzz',        price: '$24.500', desc: 'Salsa de tomate, mozzarella, cebolla caramelizada, roquefort, morrón, lomo ahumado.', badge: '✦ Firma',          imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80' },
      { sep: 'Estilo Italiana' },
      { name: 'Napolitana',         price: '$22.000', desc: 'Salsa de tomate, muzzarella, tomate fresco, aceite de ajo, orégano.',                                            imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80' },
      { name: 'Dolce Pera',         price: '$23.000', desc: 'Base aceite oliva, muzzarella, roquefort, pera, nueces, miel, cebolla de verdeo.',                               imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80' },
      { name: 'Dolce',              price: '$21.900', desc: 'Base aceite oliva, muzzarella, roquefort, sardo, nueces, miel.',                                                 imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80' },
      { name: 'Panceta Affumicata', price: '$23.300', desc: 'Salsa de tomate, mozzarella, panceta ahumada, romero, parmesano.',                                               imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80' },
      { name: 'Acciuga',            price: '$24.200', desc: 'Salsa de tomate, mozzarella, cherrys confitados, filete de anchoa, orégano.',                                    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80' },
      { name: 'Speciale',           price: '$24.300', desc: 'Salsa de tomate, mozzarella, morrón, jamón, huevo hilado, aceitunas.',                                           imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80' },
      { name: 'Fugazza',            price: '$22.600', desc: 'Mozzarella, cebolla en pluma, aceite de oliva, aceitunas negras, sal de campo.',                                 imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80' },
    ],
  },

  calzone: {
    title: 'Calzone', back: 'comidas',
    imageUrl: 'https://69f636d2a0be0e562863ff1f.imgix.net/cazone/e52c26c01fea14ac13443f7810be56fe.jpg',
    items: [
      { name: 'Calzone Margherita',       price: '$18.900', desc: 'Salsa de tomate fresca, mozzarella, albahaca fresca.',                        imageUrl: 'https://69f636d2a0be0e562863ff1f.imgix.net/cazone/e52c26c01fea14ac13443f7810be56fe.jpg' },
      { name: 'Calzone Prosciutto Cotto', price: '$22.000', desc: 'Salsa de tomate, mozzarella, jamón cocido, albahaca, orégano.',               imageUrl: 'https://69f636d2a0be0e562863ff1f.imgix.net/cazone/e52c26c01fea14ac13443f7810be56fe.jpg' },
      { name: 'Calzone Fungo',            price: '$24.700', desc: 'Salsa de tomate, mozzarella, champignones, cherrys confitados, pesto Bruzz.', imageUrl: 'https://69f636d2a0be0e562863ff1f.imgix.net/cazone/e52c26c01fea14ac13443f7810be56fe.jpg' },
    ],
  },

  hamburgesas: {
    title: 'Hamburgesas', back: 'comidas',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    items: [
      { name: 'Simple',         price: '$12.000', desc: 'Pan de papa americano, carne de res, lactonesa, cheddar y papas fritas.',                                                                                 imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80' },
      { name: 'Completa',       price: '$13.900', desc: 'Pan de papa, carne, lactonesa, lechuga, tomate, bacon, cheddar y papas.',                                                                                 imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80' },
      { name: 'Hamb Bruzz',     price: '$14.600', desc: 'Pan de papa, carne, cheddar, salsa Bruzz, rúcula, cebolla morada, bacon, pepinos encurtidos, barbacoa y papas.', badge: '✦ Firma',                       imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80' },
      { name: 'Veggie',         price: '$12.600', desc: 'Pan de papa, medallón veggie (5 variedades), lechuga, tomate, cheddar, lactonesa de albahaca y papas. ' , imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80' , },
      { name: 'Medallón extra', price: '$2.000',  desc: '',                                                                                                                                                        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80' },
      { sep: 'Combos de Hamburgesa + Gaseosa para Ahorrar unos Pesos' },
      { name: 'Combo Simple',   price: '$14.600', desc: '', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80' },
      { name: 'Combo Completa', price: '$16.300', desc: '', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80' },
      { name: 'Combo Bruzz',    price: '$17.000', desc: '', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80' },
      { name: 'Combo Veggie',   price: '$15.100', desc: '', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80' },
      {sep:'BAMBINO: Burger + Gaseosa + Helado + Jugete todo en UNO'},
      { name: 'Hamburgesa Bambino',   price: '$14.600', desc: '', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80' },

  ],
  },

  lomitos: {
    title: 'Lomitos', back: 'comidas',
    imageUrl: 'https://69f636d2a0be0e562863ff1f.imgix.net/lomito/a74f20fa48e15e1c4bc971a6b0b41875.jpg',
    items: [
      { name: 'Simple',            price: '$21.600', desc: 'Pan focaccia, lomo 180g, lactonesa, queso tybo, jamón cocido, chimi y papas.', imageUrl: 'https://69f636d2a0be0e562863ff1f.imgix.net/lomito/a74f20fa48e15e1c4bc971a6b0b41875.jpg' },
      { name: 'Completo',          price: '$22.500', desc: 'Pan focaccia, lomo 180g, lactonesa, tybo, jamón, huevo, lechuga, tomate, chimi y papas.', imageUrl: 'https://69f636d2a0be0e562863ff1f.imgix.net/lomito/a74f20fa48e15e1c4bc971a6b0b41875.jpg' },
      { name: 'Americano',         price: '$23.000', desc: 'Pan focaccia, lomo 180g, barbacoa, cheddar, panceta, huevo, cebolla caramelizada y papas.', imageUrl: 'https://69f636d2a0be0e562863ff1f.imgix.net/lomito/a74f20fa48e15e1c4bc971a6b0b41875.jpg' },
      { name: 'Bife extra (100g)', price: '$6.500',  desc: 'Lomo 100%.', imageUrl: 'https://69f636d2a0be0e562863ff1f.imgix.net/lomito/a74f20fa48e15e1c4bc971a6b0b41875.jpg' },
    ],
  },

  sandwich: {
    title: 'Sandwich', back: 'comidas',
    imageUrl: 'https://69f636d2a0be0e562863ff1f.imgix.net/pagweb/eeeeeeeeee.jpg',
    items: [
      { name: 'Tostato',     price: '$9.300',  desc: 'Pan artesanal, lactonesa, jamón cocido, queso dambo y papas fritas.', imageUrl: 'https://69f636d2a0be0e562863ff1f.imgix.net/pagweb/eeeeeeeeee.jpg' },
      { name: 'Macerata',    price: '$11.900', desc: 'Pan artesanal, lactonesa, dambo, jamón crudo, tomates frescos, rúcula y papas.', imageUrl: 'https://69f636d2a0be0e562863ff1f.imgix.net/pagweb/eeeeeeeeee.jpg' },
      { name: 'Vegetariano', price: '$14.900', desc: 'Pan focaccia, salsa Bruzz, lechuga, tomate, zucchini y berenjena grillados, dambo y papas.', imageUrl: 'https://69f636d2a0be0e562863ff1f.imgix.net/pagweb/eeeeeeeeee.jpg' },
      { name: 'Ternera',     price: '$19.900', desc: 'Pan focaccia, lactonesa de albahaca, rúcula, tomates, ternera desmenuzada en vino tinto y papas.', imageUrl: 'https://69f636d2a0be0e562863ff1f.imgix.net/pagweb/eeeeeeeeee.jpg' },
    ],
  },

  papas: {
    title: 'Papas', back: 'comidas',
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80',
    items: [
      { name: 'Patatines',         price: '$6.900',  desc: 'Papas fritas estilo napolitano.', imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80' },
      { name: 'Papas Carbonara',   price: '$9.900',  desc: 'Papas fritas, huevo revuelto, parmesano y panceta.', imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80' },
      { name: 'Papas con Cheddar', price: '$10.500', desc: 'Papas fritas con cheddar, bacon y cebolla de verdeo.', imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80' },
    ],
  },

  bambino: {
    title: 'Menú Bambino', back: 'comidas',
    imageUrl: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&q=80',
    items: [
      { name: 'Mini Pizza Bambino',  price: '$14.500', desc: 'Mini pizza de muzzarella + bebida + helado + juguete.', badge: 'Para los peques', imageUrl: '' },
      { name: 'Mini Burger Bambino', price: '$14.500', desc: 'Hamburguesa con queso y papas + bebida + helado + juguete.', badge: 'Para los peques', imageUrl: '' },
    ],
  },

  sinAlcohol: {
    title: 'Sin Alcohol', back: 'bebidas',
    imageUrl: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=800&q=80',
    items: [
      { name: 'Agua mineral',  price: '$2.500', desc: '', imageUrl: '' },
      { name: 'Agua con gas',  price: '$2.500', desc: '', imageUrl: '' },
      { name: 'Gaseosa 500ml', price: '$2.600', desc: '', imageUrl: '' },
      { name: 'Limonada',      price: '$4.200', desc: 'Limón exprimido, hielo, azúcar.', imageUrl: '' },
      { name: 'Jugo natural',  price: '$4.500', desc: 'A elección del día.', imageUrl: '' },
    ],
  },

  cervezas: {
    title: 'Cervezas', back: 'bebidas',
    imageUrl: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800&q=80',
    items: [
      { name: 'Quilmes porrón',     price: '$3.800', desc: '', imageUrl: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800&q=80' },
      { name: 'Stella Artois lata', price: '$4.200', desc: '', imageUrl: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800&q=80' },
      { name: 'Heineken lata',      price: '$4.500', desc: '', imageUrl: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800&q=80' },
      { name: 'Imperial pinta',     price: '$5.200', desc: '', imageUrl: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800&q=80' },
    ],
  },

  // ✅ tragos: lista única con separador (sin subcategorías)
  tragos: {
    title: 'Tragos', back: 'home',
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80',
    items: [
      { sep: 'Clásicos' },
      { name: 'Fernet con Cola', price: '$5.800', desc: 'Fernet Branca con Coca-Cola.', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80' },
      { name: 'Aperol Spritz',   price: '$6.500', desc: 'Aperol, Jugo de Naranja, soda, Rodaja de Naranja.', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80' },
      { name: 'Campari Soda',    price: '$5.500', desc: 'Campari con soda bien fría.', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80' },
      { sep: 'Bruzz Specials' },
      { name: 'Cynar Gulep',      price: '$7.200', desc: 'Gin, limón, almíbar, clara de huevo, espuma.', badge: '✦ Casa', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80' },
      { name: 'Mojito Italiano', price: '$7.000', desc: 'Ron blanco, menta, lima, soda, albahaca.',                     imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80' },
    ],
  },
};

export const POSTRES = [
  { name: 'Tiramisú Bruzz',     price: '$6.500', desc: 'Bizcochuelo, mascarpone, café espresso, cacao. Receta de la casa.', imageUrl: 'https://69f636d2a0be0e562863ff1f.imgix.net/postres/273a1cba2505799c5ec72003e7fd18eb.jpg' },
  { name: 'Flan Con Dulse de Leche', price: '$5.800', desc: 'Flan Espectacula con Dulse de Leche', imageUrl: 'https://69f636d2a0be0e562863ff1f.imgix.net/postres/273a1cba2505799c5ec72003e7fd18eb.jpg' },
  { name: 'Cafecito',        price: '$5.200', desc: 'cafe (ya no se que pone son las 5)', imageUrl: 'https://69f636d2a0be0e562863ff1f.imgix.net/postres/273a1cba2505799c5ec72003e7fd18eb.jpg' },
];
