export const CATEGORIAS = [
  {
    id: 'comidas',
    name: 'Comidas',
    desc: 'Pizza, hambur, lomitos…',
    imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/fungo.jpg',
  },
  {
    id: 'bebidas',
    name: 'Bebidas',
    desc: 'Cervezas, gaseosaS , Vinos..',
    imageUrl: 'https://69f636d2a0be0e562863ff1f.imgix.net/tirada/247dba7a3dd5c107800f3f20ff8db32f.jpg',
  },
  {
    id: 'tragos',
    name: 'Tragos',
    desc: 'Los Mejores Cócteles',
    imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/tragos%20general.jpg?w=720&h=812&rect=0%2C213%2C720%2C812',
  },
  {
    id: 'postres',
    name: 'Postres',
    desc: 'Dulce final perfecto',
    imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/bogatto.jpg',
  },
];

export const SUBCATEGORIAS = {
  comidas: [
    { menuKey: 'pizza',       name: 'Pizza',        desc: 'Napolitana & italiana',    imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/fungo.jpg' },
    { menuKey: 'calzone',     name: 'Calzone',      desc: 'Relleno al horno',         imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/calzone%20fungo.jpg' },
    { menuKey: 'hamburgesas', name: 'Hamburgesas',  desc: 'Con combos disponibles',   imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/HSimple.jpg' },
    { menuKey: 'lomitos',     name: 'Lomitos',      desc: 'En pan focaccia',          imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/Lomo.jpg' },
    { menuKey: 'sandwich',    name: 'Sandwich',     desc: 'Artesanales & focaccia',   imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/ternera.jpg' },
    { menuKey: 'papas',       name: 'Papas',        desc: 'Simples o con toppings',   imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/papas%20cheddar.jpg' },  ],
  bebidas: [
    { menuKey: 'sinAlcohol', name: 'Sin alcohol', desc: 'Aguas, jugos, gaseosas', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/FANTA.jpg' },
    { menuKey: 'cervezas',   name: 'Cervezas',    desc: 'Porrones & pintas',      imageUrl: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&q=80' },
    { menuKey: 'vinos',      name: 'Vinos',       desc: 'Tinto, blanco, espumoso', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/Cordero.jpg' },
  ],
};

export const MENU = {

  pizza: {
    title: 'Pizzas', back: 'comidas',
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
    items: [
      { sep: 'Estilo Napolitano - Napolitana Clasica' },
      { name: 'Pepe',               price: '$23.300', desc: 'Pizza estilo napolitano, salsa de tomate fresca, mozzarella, pepperoni, orégano',                                                       imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80' },
      { name: 'Prosciutto Cotto',   price: '$22.000', desc: 'Pizza estilo napolitano, salsa de tomate fresca, mozzarella, jamón cocido, albahacas fresca, olivas verdes, orégano.',                                     imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/prosutto.jpg' },
      { name: 'Fungo',              price: '$24.700', desc: 'Pizza estilo napolitano, salsa de tomate fresca, mozzarella, champignones y cherrys confitados en aceite de oliva, pesto Bruzz.',                                    imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/fungo.jpg' },
      { name: 'Rúcula',             price: '$23.500', desc: 'Pizza estilo napolitano, salsa de tomate fresca, mozzarella, rúcula, jamón crudo, hebras de parmesano, aceite de oliva, olivas negras.',                                    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80' },
      { name: 'Quattro Formaggi',   price: '$22.000', desc: 'Pizza estilo napolitano, salsa de tomate fresca, mozzarella, parmesano, sardo, roquefort, orégano.',                                                      imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80' },
      { name: 'Margherita',         price: '$18.900', desc: 'Pizza estilo napolitano, salsa de tomate fresca, mozzarella, albahaca fresca, aceite de oliva.',                                                 imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=8₀' },
      { name: 'Pizza Bruzz',        price: '$24.500', desc: 'Pizza estilo napolitano, salsa de tomate fresca, mozzarella, cebolla caramelizada con un toque de roquefort, morrón, lomo ahumado, orégano.', badge: '✦ Firma',          imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/bruzz.jpg' },
      { name: 'Napolitana',         price: '$22.000', desc: 'Pizza estilo napolitano, salsa de tomate fresca, muzzarella, rodajas de tomate fresco, aceite de ajo y orégano.',                                            imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80' },
      { name: 'Dolce Pera',         price: '$23.000', desc: 'Pizza estilo napolitano, base de aceite de oliva extra virgen, muzzarella, roquefort, pera, nueces, miel, cebolla de verdeo.',   badge: '✦ Firma',                       imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80' },
      { name: 'Dolce',              price: '$21.900', desc: 'Pizza estilo napolitano, base de aceite de oliva extra virgen, muzzarella, roquefort, sardo, nueces, miel.',                     badge: '✦ Firma',                             imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80' },
      { name: 'Panceta Affumicata', price: '$23.300', desc: 'Pizza estilo napolitano, salsa de tomate fresca, mozzarella, panceta ahumada, romero, humo, queso parmesano.',                      badge: '✦ Firma',                          imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80' },
      { name: 'Acciuga',            price: '$24.200', desc: 'Pizza estilo napolitano, salsa de tomate fresca, mozzarella, cherrys confitados en oliva, filete de anchoa, orégano..',                                    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80' },
      { name: 'Speciale',           price: '$24.300', desc: 'Pizza estilo napolitano, salsa de tomate fresca, mozzarella, morrón, jamón, huevo hilado, aceitunas, orégano.',          badge: '✦ Firma',                                  imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80' },
      { name: 'Fugazza',            price: '$22.600', desc: 'Pizza estilo napolitano, mozzarella, abundante cebolla en pluma, aceite de oliva, aceitunas negras, sal de campo.',                                 imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80' },
      { name: 'Mini Pizza Bambino',  price: '$14.500', desc: 'Mini pizza de muzzarella + bebida + helado + juguete.', badge: 'Para los peques', imageUrl: '' },

    ],
  },

  calzone: {
    title: 'Calzone', back: 'comidas',
    imageUrl: 'https://69f636d2a0be0e562863ff1f.imgix.net/cazone/e52c26c01fea14ac13443f7810be56fe.jpg',
    items: [
      { name: 'Calzone Margherita',       price: '$18.900', desc: 'Salsa de tomate fresca, mozzarella, albahaca fresca, envuelto en masa de pizza estilo napolitano',                        imageUrl: 'https://69f636d2a0be0e562863ff1f.imgix.net/cazone/e52c26c01fea14ac13443f7810be56fe.jpg' },
      { name: 'Calzone Prosciutto Cotto', price: '$22.000', desc: 'Salsa de tomate fresca, mozzarella, jamón cocido, albahacas fresca, orégano, envuelto en masa de pizza estilo napolitano.',               imageUrl: 'https://69f636d2a0be0e562863ff1f.imgix.net/cazone/e52c26c01fea14ac13443f7810be56fe.jpg' },
      { name: 'Calzone Fungo',            price: '$24.700', desc: 'Salsa de tomate fresca, mozzarella, champignones y cherrys confitados en aceite de oliva, pesto Bruzz, envuelto en masa de pizza estilo napolitano.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/calzone%20fungo.jpg' },
    ],
  },

  hamburgesas: {
    title: 'Hamburgesas', back: 'comidas',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    items: [
      { name: 'Simple',         price: '$12.000', desc: 'Pan de papa Americano, carne de res, lactonesa de la casa, cheddar y papas fritas.',                                                                                 imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/HSimple.jpg' },
      { name: 'Completa',       price: '$13.900', desc: 'Pan de papa Americano, carne de res, lactonesa de la casa, lechuga, tomates fresco, bacon, cheddar y papas fritas.',                                                                                 imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/Completa.jpg' },
      { name: 'Hamb Bruzz',     price: '$14.600', desc: 'Pan de papa Americano, carne de res, cheddar, salsa Bruzz, rúcula, cebolla morada, bacon, pepinos encurtidos, barbacoa y papas fritas.', badge: '✦ Firma',                       imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/Hbruzz.jpg' },
      { name: 'Veggie',         price: '$12.600', desc: 'Pan de papa Americano, medallón Veggie (hay 5 variedades), lechuga, tomate fresco, cheddar, lactonesa de albahaca y papas fritas' , imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80' , },
      { name: 'Medallón extra', price: '$2.000',  desc: 'Extra Carne para una Gran Hamburguesa.',   imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80' },
      { sep: 'Combos de Hamburgesa + Gaseosa para Ahorrar unos Pesos' },
      { name: 'Combo Simple',   price: '$14.600', desc: 'Hamburguesa simple mas gaseosa de 500ml.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/HSimple.jpg' },
      { name: 'Combo Completa', price: '$16.300', desc: 'Hamburguesa completa mas gaseosa de 500lml.',   imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/Completa.jpg'  },
      { name: 'Combo Bruzz',    price: '$17.000', desc: 'Hamburguesa bruzz mas gaseosa de 500ml.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/Hbruzz.jpg' },
      { name: 'Combo Veggie',   price: '$15.100', desc: 'Hamburguesa vegana mas gaseosa de 500ml', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80' },
      {sep:'BAMBINO: Burger + Gaseosa + Helado + Jugete todo en UNO'},
      { name: 'Hamburgesa Bambino',   price: '$14.600', desc: 'Burger Simple + Gaseosa + Helado + Jugete todo en UNO', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/0c9c52e9a3063c7c8171e358c8a0282c.jpg' },

  ],
  },

  lomitos: {
    title: 'Lomitos', back: 'comidas',
    imageUrl: 'https://69f636d2a0be0e562863ff1f.imgix.net/lomito/a74f20fa48e15e1c4bc971a6b0b41875.jpg',
    items: [
      { name: 'Simple',            price: '$21.600', desc: 'Pan de focaccia, lomo 180g, lactonesa de la casa, queso tybo, jamón cocido, chimi de la casa y papas fritas', imageUrl: 'https://69f636d2a0be0e562863ff1f.imgix.net/lomito/a74f20fa48e15e1c4bc971a6b0b41875.jpg' },
      { name: 'Completo',          price: '$22.500', desc: 'Pan de focaccia, lomo 180g, lactonesa de la casa, queso tybo, jamón cocido, huevo, lechuga, tomate, chimi de la casa y papas fritas.', imageUrl: 'https://69f636d2a0be0e562863ff1f.imgix.net/lomito/a74f20fa48e15e1c4bc971a6b0b41875.jpg' },
      { name: 'Americano',         price: '$23.000', desc: 'Pan de focaccia, lomo 180g, lactonesa de la casa, barbacoa, queso cheddar, panceta, huevo, cebolla morada caramelizada y papas fritas..', imageUrl: 'https://69f636d2a0be0e562863ff1f.imgix.net/lomito/a74f20fa48e15e1c4bc971a6b0b41875.jpg' },
      { name: 'Bife extra (100g)', price: '$6.500',  desc: 'Lomo 100%.', imageUrl: 'https://69f636d2a0be0e562863ff1f.imgix.net/lomito/a74f20fa48e15e1c4bc971a6b0b41875.jpg' },
    ],
  },

  sandwich: {
    title: 'Sandwich', back: 'comidas',
    imageUrl: 'https://69f636d2a0be0e562863ff1f.imgix.net/pagweb/eeeeeeeeee.jpg',
    items: [
      { name: 'Tostato',     price: '$9.300',  desc: 'Pan artesanal, lactonesa de la casa, jamón cocido, queso dambo y papas fritas.', imageUrl: 'https://69f636d2a0be0e562863ff1f.imgix.net/pagweb/eeeeeeeeee.jpg' },
      { name: 'Macerata',    price: '$11.900', desc: 'Pan artesanal, lactonesa de la casa, queso dambo, jamón crudo, tomates frescos, rúcula, y papas fritas.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/maserata.jpg' },
      { name: 'Vegetariano', price: '$14.900', desc: 'Pan de focaccia, salsa Bruzz, lechuga, tomate fresco, zucchini y berenjena grillado, queso dambo y papas fritas.', imageUrl: 'https://69f636d2a0be0e562863ff1f.imgix.net/pagweb/eeeeeeeeee.jpg' },
      { name: 'Ternera',     price: '$19.900', desc: 'Pan de focaccia, lactonesa de albahaca, rúcula, tomates frescos, ternera desmenuzada en vino tinto y papas fritas.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/ternera.jpg' },
    ],
  },

  papas: {
    title: 'Papas', back: 'comidas',
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80',
    items: [
      { name: 'Patatines',         price: '$6.900',  desc: 'Papas fritas Clasicas.', imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80' },
      { name: 'Papas Carbonara',   price: '$9.900',  desc: 'Papas fritas, huevo revuelto, parmesano y panceta.', imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80' },
      { name: 'Papas con Cheddar', price: '$10.500', desc: 'Papas fritas con cheddar, bacon y cebolla de verdeo.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/papas%20cheddar.jpg' },
    ],
  },

  // BEdidas ------------------------------------------------------------------------------------------------------------------------------

  sinAlcohol: {
    title: 'Sin Alcohol', back: 'bebidas',
    imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/Sprite.jpg',
    items: [
      { name: 'Agua mineral',  price: '$3.700', desc: '', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/agua.jpg' },
      { name: 'Agua con gas',  price: '$3.700', desc: '', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/agua.jpg' },
      { name: 'Agua Saborisada',  price: '$3.900', desc: '', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/AGUAs.jpg' },
      { name: 'Coca cola 500ml', price: '$3.900', desc: '', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/cocajpg.jpg' },
      { name: 'Coca cola Zero 500ml', price: '$3.900', desc: '', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/cocajpg.jpg' },
      { name: 'Fanta', price: '$3.900', desc: '', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/FANTA.jpg' },
      { name: 'Srite', price: '$3.900', desc: '', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/Sprite.jpg' },
      { name: 'Coca Cola 1.5L', price: '$7.800', desc: '', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/cocajpg.jpg' },
      { name: 'Limonada Litro',      price: '$ 7.200 ', desc: 'Limón exprimido, hielo, azúcar.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/LIMONADA.jpg' },
    ],
  },

  cervezas: {
    title: 'Cervezas', back: 'bebidas',
    imageUrl: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800&q=80',
    items: [
      { sep: 'Pintas Tiradas' },
      { name: 'Blonde Ale',     price: '$4.700', desc: 'KRAL alc. 4,5%. Ligera, moderado aroma dulce maltoso, bajo amargor y leve cítrico.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Tirada/Tirada.jpg' },
      { name: 'IPA', price: '$6.000', desc: 'KRAL. ALC. 5,3% De cuerpo medio, con marcados aromas y sabores cítricos florales.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Tirada/Tirada.jpg' },
      { name: ' IRISH RED',      price: '$5.200', desc: 'UN TAL RENE . alc 5%. Roja, con notas dulces, frutal.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Tirada/Tirada.jpg' },
      { name: 'NEGRA STOUT',     price: '$6.200', desc: '372. Negra, notas a cafe. alc. 4.8% de amargor bajo.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Tirada/Tirada.jpg' },
      { name: ' HONEY BLUEBERRY',      price: '$5.600', desc: 'UN TAL RENE. 6% Alc. Rubia, endulzada con miel y notas de blueberry.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Tirada/Tirada.jpg' },
      { name: ' IRISH RED',      price: '$4.800', desc: 'BUFON DEL REY. 4,2% alc. Rubia, ligera y refrescante. De amargor bajo. ( Medalla de ORO 2023)', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Tirada/Tirada.jpg' },
      
            { sep: 'Cervezas en Botella ' },
      { name: 'IMPERIAL LITRO',     price: '9.000', desc: 'Golden o Extra Lagger', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/2947fa2967cf31e1a80ac8bb59d91e35.jpg' },
      { name: 'HEINEKEN LITRO ', price: '$9.900', desc: '', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/heineken.jpg' },
      { name: 'Heineken lata',      price: '$4.200', desc: '', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/heineken.jpg' },
      { name: 'HEINEKEN 330 CC',     price: '$4.200', desc: '', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/heineken.jpg' },
      { name: 'HEINEKEN Zero 330 CC',     price: '$3.600', desc: '', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/heineken.jpg' },
      { name: 'IMPERIAL 330 CC',     price: '$3.600', desc: '', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/2947fa2967cf31e1a80ac8bb59d91e35.jpg' },
      { name: 'BLUE MOON 335 CC',     price: '$6.000', desc: '', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/blue%20moon.jpg' },

                  { sep: 'Para Disfrutar con amigos ' },
{ name: 'Balde Heineken x6', price: '$21.000', desc: 'Balde 6x5 Heineken 330cc.', badge: ' Balde', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/heineken.jpg' },
{ name: 'Balde Imperial Golden x6', price: '$18.000', desc: 'Balde 6x5 Imperial Golden 330cc.', badge: ' Balde', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/2947fa2967cf31e1a80ac8bb59d91e35.jpg' },
{ name: 'Balde Blue Moon x6', price: '$30.000', desc: 'Balde 6x5 Blue Moon 355cc.', badge: ' Balde', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/blue%20moon.jpg' },

    ],
  },


    vinos: {
    title: 'Vinos', back: 'bebidas',
    imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/Cordero.jpg',
    items: [
      { sep: 'Vinos' },
{ name: 'Santa Julia Chardonnay', price: '$8.500', desc: 'Vino blanco Chardonnay, Santa Julia.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/vinos.jpg' },
{ name: 'Espumante Dada 7', price: '$19.900', desc: 'Espumante Dada 7.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/vinos.jpg' },
{ name: 'Luigi Bosca Malbec', price: '$25.300', desc: 'Vino tinto Malbec, Luigi Bosca.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/vinos.jpg' },
{ name: 'Alma Mora Malbec', price: '$9.500', desc: 'Vino tinto Malbec, Alma Mora.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/vinos.jpg' },
{ name: 'Cordero con Piel de Lobo Cabernet Sauvignon', price: '$13.500', desc: 'Vino tinto Cabernet Sauvignon, Cordero con Piel de Lobo.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/vinos.jpg' },
{ name: 'Cordero con Piel de Lobo Blanco Dulce', price: '$12.900', desc: 'Vino blanco dulce, Cordero con Piel de Lobo.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/vinos.jpg' },
{ name: 'Fond de Cave Chardonnay', price: '$11.500', desc: 'Vino blanco Chardonnay, Fond de Cave.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/vinos.jpg' },
{ name: 'Alma Mora Cabernet Sauvignon', price: '$9.500', desc: 'Vino tinto Cabernet Sauvignon, Alma Mora.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/vinos.jpg' },
    ],
  },

  tragos: {
    title: 'Tragos', back: 'home',
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80',
    items: [
  { sep: 'Clásicos' },
{ name: 'Vaso Fernet c/ Coca', price: '$7.000', desc: 'Fernet Branca con Coca-Cola.', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80' },
{ name: 'Carpano Orange', price: '$7.000', desc: 'Carpano con jugo de naranja.', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80' },
{ name: 'Vodka Speed', price: '$7.400', desc: 'Vodka con Speed.', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80' },
{ name: 'Aperol Orange', price: '$7.000', desc: 'Aperol con jugo de naranja.', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80' },
{ name: 'Cynar Julep', price: '$7.400', desc: 'Cynar con menta y limón.', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80' },
{ name: 'Campari Tonic', price: '$7.000', desc: 'Campari con agua tónica.', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80' },
{ name: 'Campari Orange', price: '$7.000', desc: 'Campari con jugo de naranja.', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80' },
{ name: 'Mojito', price: '$7.400', desc: 'Ron blanco, menta, lima y soda.', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80' },
{ name: 'Medida Fernet', price: '$4.300', desc: 'Medida de Fernet Branca.', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80' },
{ sep: 'Gin Tonic' },
{ name: 'Spirito Gin Tonic', price: '$7.000', desc: 'Gin Spirito con agua tónica.', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80' },
{ name: 'Spirito Gin Tonic Frutos Rojos', price: '$7.600', desc: 'Gin Spirito con tónica y frutos rojos.', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80' },
{ name: 'Tanqueray Gin Tonic', price: '$11.000', desc: 'Gin Tanqueray con agua tónica.', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80' },
{ name: 'Tanqueray Gin Tonic Frutos Rojos', price: '$11.600', desc: 'Gin Tanqueray con tónica y frutos rojos.', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80' },
{ name: 'Beefeater Gin Tonic', price: '$10.000', desc: 'Gin Beefeater con agua tónica.', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80' },
{ name: 'Beefeater Gin Tonic Frutos Rojos', price: '$10.600', desc: 'Gin Beefeater con tónica y frutos rojos.', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80' },

{ sep: 'Promos' },
{ name: 'Promo Bladis', price: '$49.000', desc: '1 botella de Fernet Branca 750cc + 2 Cocas 1,25 lts.', badge: '🔥 Promo', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80' },

{ sep: 'Jarras' },
{ name: 'Jarra Spirito Gin Tonic', price: '$13.000', desc: 'Jarra de Gin Spirito con agua tónica.', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80' },
{ name: 'Jarra Spirito Gin Tonic Frutos Rojos', price: '$14.000', desc: 'Jarra de Gin Spirito con tónica y frutos rojos.', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80' },
{ name: 'Jarra de Fernet', price: '$13.000', desc: 'Jarra de Fernet Branca con Coca-Cola.', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80' },
{ name: 'Jarra Beefeater Gin Tonic', price: '$19.000', desc: 'Jarra de Gin Beefeater con agua tónica.', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80' },
{ name: 'Jarra Beefeater Gin Tonic Frutos Rojos', price: '$20.000', desc: 'Jarra de Gin Beefeater con tónica y frutos rojos.', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80' },
{ name: 'Jarra Tanqueray Gin Tonic', price: '$21.000', desc: 'Jarra de Gin Tanqueray con agua tónica.', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80' },
{ name: 'Jarra Tanqueray Gin Tonic Frutos Rojos', price: '$22.000', desc: 'Jarra de Gin Tanqueray con tónica y frutos rojos.', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80' },
{ name: 'Promo 2 Jarras de Fernet', price: '$24.000', desc: '2 jarras de Fernet Branca con Coca-Cola.', badge: '🔥 Promo', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80' },
    ],
  },
};

export const POSTRES = [
    { sep: 'Postres' },

  { name: 'Tiramisú Bruzz',     price: '$6.500', desc: 'Bizcochuelo, mascarpone, café espresso, cacao. Receta de la casa.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/tiramisu.jpg' },
  { name: 'Flan Con Dulse de Leche', price: '$5.800', desc: 'Flan Espectacula con Dulse de Leche', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/flan.jpg' },

{ sep: 'Cafetería' },
{ name: 'Corto', price: '$2.500', desc: 'Café chico.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/cafe.jpg' },
{ name: 'Lungo', price: '$2.600', desc: 'Café en jarro.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/cafe.jpg' },
{ name: 'Doble', price: '$3.000', desc: 'Café doble.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/cafe.jpg' },
{ name: 'XL', price: '$3.700', desc: 'Café XL.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/cafe.jpg' },
{ name: 'Café con Leche', price: '$3.000', desc: 'Café con leche.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/cafe.jpg' },
{ name: 'Té', price: '$2.000', desc: 'Té. Consultá las variedades disponibles.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/cafe.jpg' },
{ name: 'Chocolatada', price: '$3.000', desc: 'Chocolatada caliente.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/cafe.jpg' },
{ sep: 'Especiales' },
{ name: 'Flat White', price: '$3.000', desc: 'Café doble filtro con leche texturizada.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/cafe.jpg' },
{ name: 'Bombón', price: '$4.200', desc: 'Café, leche condensada, leche texturizada y crema batida.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/cafe.jpg' },
{ name: 'Macchiato', price: '$2.800', desc: 'Café con espuma de leche.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/cafe.jpg' },
{ name: 'Latte Moka', price: '$4.200', desc: 'Café, sirope de chocolate y leche texturizada.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/cafe.jpg' },
{ name: 'Submarino', price: '$3.700', desc: 'Leche texturizada con chocolate en barra.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/cafe.jpg' },
{ name: 'Affogato', price: '$4.500', desc: 'Café con bocha de helado de crema americana.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/cafe.jpg' },
{ name: 'Ristretto', price: '$2.500', desc: 'Shot de café concentrado.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/cafe.jpg' },
{ name: 'Latte Bruzz', price: '$4.200', desc: 'Café, leche condensada, salsa de chocolate, leche texturizada y cacao amargo.', badge: '✦ Casa', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/cafe.jpg' },
{ name: 'Latte Avellanas', price: '$4.200', desc: 'Café, sirope de avellana y leche texturizada.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/cafe.jpg' },
{ name: 'Licuados', price: '$5.000', desc: 'Consultá las opciones disponibles.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/cafe.jpg' },
{ name: 'Limonada', price: '$6.900', desc: 'Limonada fresca.', imageUrl: 'https://69f969104ee83435ba386e9c.imgix.net/Bruzz/cafe.jpg' },


];
