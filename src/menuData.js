<<<<<<< HEAD
// menuData.js — Generado el 15/06/2026 03:39
=======
// menuData.js — Generado el 14/06/2026 09:23
>>>>>>> 4ca5b12 (animaciones testing)
// ⚠️ No editar manualmente — usar el panel admin

export const CATEGORIAS = [
  { id: 'comidas',   name: 'Comidas',   desc: 'Pizza, hambur, lomitos…',    imageUrl: 'https://bruzz.com.ar/img/pepe.jpg' },
  { id: 'bebidas',   name: 'Bebidas',   desc: 'Cervezas, gaseosas, Vinos..', imageUrl: 'https://bruzz.com.ar/img/pintas.jpg' },
  { id: 'tragos',    name: 'Tragos',    desc: 'Los Mejores Cócteles',        imageUrl: 'https://bruzz.com.ar/img/gin.png' },
  { id: 'postres',   name: 'Postres',   desc: 'Dulce final perfecto',        imageUrl: 'https://bruzz.com.ar/img/postres.jpg' },
  { id: 'cafeteria', name: 'Cafetería', desc: 'Café, infusiones y más',      imageUrl: 'https://bruzz.com.ar/img/cafe.jpg' },
];

export const SUBCATEGORIAS = {
  comidas: [
    { menuKey: 'pizza',       name: 'Pizza',       desc: 'Napolitana & italiana',   imageUrl: 'https://bruzz.com.ar/img/rucula.jpg' },
    { menuKey: 'calzone',     name: 'Calzone',     desc: 'Relleno al horno',        imageUrl: 'https://bruzz.com.ar/img/calzone.jpg' },
    { menuKey: 'hamburgesas', name: 'Hamburgesas', desc: 'Con combos disponibles',  imageUrl: 'https://bruzz.com.ar/img/Bbruzz.jpg' },
    { menuKey: 'lomitos',     name: 'Lomitos',     desc: 'En pan focaccia',         imageUrl: 'https://bruzz.com.ar/img/lomoamericano.jpg' },
    { menuKey: 'sandwich',    name: 'Sandwich',    desc: 'Artesanales & focaccia',  imageUrl: 'https://bruzz.com.ar/img/ternera.jpg' },
    { menuKey: 'papas',       name: 'Papas',       desc: 'Simples o con toppings',  imageUrl: 'https://bruzz.com.ar/img/papas.jpg' },
  ],
  bebidas: [
    { menuKey: 'sinAlcohol', name: 'Sin alcohol', desc: 'Aguas, jugos, gaseosas',  imageUrl: 'https://bruzz.com.ar/img/coca.jpg' },
    { menuKey: 'cervezas',   name: 'Cervezas',    desc: 'Porrones & pintas',       imageUrl: 'https://bruzz.com.ar/img/pintas.jpg' },
    { menuKey: 'vinos',      name: 'Vinos',       desc: 'Tinto, blanco, espumoso', imageUrl: 'https://bruzz.com.ar/img/vino.jpg' },
  ],
};

export const MENU = {

  pizza: {
    title: 'Pizzas', back: 'comidas',
    items: [
      { sep: 'Sin T.A.C.C. — Masa artesanal libre de gluten' },
      { name: 'Pizza Sin T.A.C.C.', price: '$22.000', desc: 'Masa artesanal sin TACC. Elegí la variedad que querés: Napolitana, Cuatro Quesos o Muzza y Jamón.', imageUrl: 'https://bruzz.com.ar/img/1781494602-leomessi20092010-pic-fcb-arsenal62.jpg', sinTacc: true },
      { sep: 'Mini Pizzas BamBino' },
      { name: 'Mini Pizza Bambino', price: '$14.500', desc: 'Mini pizza de muzzarella + bebida + helado + juguete.', imageUrl: 'https://bruzz.com.ar/img/bambino.png', badge: 'Para los peques' },
      { sep: 'Estilo Napolitano - Napolitana Clasica' },
      { name: 'Pepe', price: '$23.300', desc: 'Pizza estilo napolitano, salsa de tomate fresca, mozzarella, pepperoni, orégano.', imageUrl: 'https://bruzz.com.ar/img/pepe.jpg' },
      { name: 'Prosciutto Cotto', price: '$22.000', desc: 'Pizza estilo napolitano, salsa de tomate fresca, mozzarella, jamón cocido, albahaca fresca, olivas verdes, orégano.', imageUrl: 'https://bruzz.com.ar/img/pizzageneral.jpg' },
      { name: 'Fungo', price: '$24.700', desc: 'Pizza estilo napolitano, salsa de tomate fresca, mozzarella, champignones y cherrys confitados en aceite de oliva, pesto Bruzz.', imageUrl: 'https://bruzz.com.ar/img/fungo.png' },
      { name: 'Rúcula', price: '$23.500', desc: 'Pizza estilo napolitano, salsa de tomate fresca, mozzarella, rúcula, jamón crudo, hebras de parmesano, aceite de oliva, olivas negras.', imageUrl: 'https://bruzz.com.ar/img/rucula.jpg' },
      { name: 'Quattro Formaggi', price: '$22.000', desc: 'Pizza estilo napolitano, salsa de tomate fresca, mozzarella, parmesano, sardo, roquefort, orégano.', imageUrl: 'https://bruzz.com.ar/img/pizzageneral.jpg' },
      { name: 'Margherita', price: '$18.900', desc: 'Pizza estilo napolitano, salsa de tomate fresca, mozzarella, albahaca fresca, aceite de oliva.', imageUrl: 'https://bruzz.com.ar/img/pizzageneral.jpg' },
      { name: 'Pizza Bruzz', price: '$29.000', desc: 'Pizza estilo napolitano, salsa de tomate fresca, mozzarella, cebolla caramelizada con roquefort, morrón, lomo ahumado, orégano.', imageUrl: 'https://bruzz.com.ar/img/image.png', badge: '✦ Firma' },
      { name: 'Napolitana', price: '$22.000', desc: 'Pizza estilo napolitano, salsa de tomate fresca, muzzarella, rodajas de tomate fresco, aceite de ajo y orégano.', imageUrl: 'https://bruzz.com.ar/img/pizzageneral.jpg' },
      { name: 'Dolce Pera', price: '$23.000', desc: 'Pizza estilo napolitano, base de aceite de oliva extra virgen, muzzarella, roquefort, pera, nueces, miel, cebolla de verdeo.', imageUrl: 'https://bruzz.com.ar/img/pizzageneral.jpg', badge: '✦ Firma' },
      { name: 'Dolce', price: '$21.900', desc: 'Pizza estilo napolitano, base de aceite de oliva extra virgen, muzzarella, roquefort, sardo, nueces, miel.', imageUrl: 'https://bruzz.com.ar/img/pizzageneral.jpg', badge: '✦ Firma' },
      { name: 'Panceta Affumicata', price: '$23.300', desc: 'Pizza estilo napolitano, salsa de tomate fresca, mozzarella, panceta ahumada, romero, humo, queso parmesano.', imageUrl: 'https://bruzz.com.ar/img/pizzageneral.jpg', badge: '✦ Firma' },
      { name: 'Acciuga', price: '$24.200', desc: 'Pizza estilo napolitano, salsa de tomate fresca, mozzarella, cherrys confitados en oliva, filete de anchoa, orégano.', imageUrl: 'https://bruzz.com.ar/img/pizzageneral.jpg' },
      { name: 'Speciale', price: '$24.300', desc: 'Pizza estilo napolitano, salsa de tomate fresca, mozzarella, morrón, jamón, huevo hilado, aceitunas, orégano.', imageUrl: 'https://bruzz.com.ar/img/pizzageneral.jpg', badge: '✦ Firma' },
      { name: 'Fugazza', price: '$22.600', desc: 'Pizza estilo napolitano, mozzarella, abundante cebolla en pluma, aceite de oliva, aceitunas negras, sal de campo.', imageUrl: 'https://bruzz.com.ar/img/pizzageneral.jpg' },
    ],
  },

  calzone: {
    title: 'Calzone', back: 'comidas',
    items: [
      { name: 'Calzone Margherita', price: '$18.900', desc: 'Salsa de tomate fresca, mozzarella, albahaca fresca, envuelto en masa napolitana.', imageUrl: 'https://bruzz.com.ar/img/calzone.jpg' },
      { name: 'Calzone Prosciutto Cotto', price: '$22.000', desc: 'Salsa de tomate fresca, mozzarella, jamón cocido, albahaca fresca, orégano, envuelto en masa napolitana.', imageUrl: 'https://bruzz.com.ar/img/calzone.jpg' },
      { name: 'Calzone Fungo', price: '$24.700', desc: 'Salsa de tomate fresca, mozzarella, champignones y cherrys confitados en aceite de oliva, pesto Bruzz, envuelto en masa napolitana.', imageUrl: 'https://bruzz.com.ar/img/calzone.jpg' },
    ],
  },

  hamburgesas: {
    title: 'Hamburgesas', back: 'comidas',
    items: [
      { name: 'Hamburgesa Bambino', price: '$14.600', desc: 'Burger Simple + Gaseosa + Helado + Juguete todo en UNO.', imageUrl: 'https://bruzz.com.ar/img/bambino2.png' },
      { name: 'Simple', price: '$12.000', desc: 'Pan de papa Americano, carne de res, lactonesa de la casa, cheddar y papas fritas.', imageUrl: 'https://bruzz.com.ar/img/hamburgesa.jpg' },
      { name: 'Completa', price: '$13.900', desc: 'Pan de papa Americano, carne de res, lactonesa de la casa, lechuga, tomates fresco, bacon, cheddar y papas fritas.', imageUrl: 'https://bruzz.com.ar/img/hamburgesa.jpg' },
      { name: 'Hamb Bruzz', price: '$14.600', desc: 'Pan de papa Americano, carne de res, cheddar, salsa Bruzz, rúcula, cebolla morada, bacon, pepinos encurtidos, barbacoa y papas fritas.', imageUrl: 'https://bruzz.com.ar/img/Bbruzz.jpg', badge: '✦ Firma' },
      { name: 'Veggie', price: '$12.600', desc: 'Pan de papa Americano, medallón Veggie (hay 5 variedades), lechuga, tomate fresco, cheddar, lactonesa de albahaca y papas fritas.', imageUrl: 'https://bruzz.com.ar/img/hamburgesa.jpg' },
      { name: 'Medallón extra', price: '$2.000', desc: 'Extra Carne para una Gran Hamburguesa.', imageUrl: 'https://bruzz.com.ar/img/hamburgesa.jpg' },
      { sep: 'Combos de Hamburgesa + Gaseosa para Ahorrar unos Pesos' },
      { name: 'Combo Simple', price: '$14.800', desc: 'Hamburguesa simple mas gaseosa de 500ml.', imageUrl: 'https://bruzz.com.ar/img/combo.png', badge: 'Combo' },
      { name: 'Combo Completa', price: '$16.500', desc: 'Hamburguesa completa mas gaseosa de 500ml.', imageUrl: 'https://bruzz.com.ar/img/combo.png', badge: 'Combo' },
      { name: 'Combo Bruzz', price: '$17.200', desc: 'Hamburguesa bruzz mas gaseosa de 500ml.', imageUrl: 'https://bruzz.com.ar/img/Bbruzz.jpg', badge: 'Combo' },
      { name: 'Combo Veggie', price: '$15.400', desc: 'Hamburguesa vegana mas gaseosa de 500ml.', imageUrl: 'https://bruzz.com.ar/img/combo.png', badge: 'Combo' },
    ],
  },

  lomitos: {
    title: 'Lomitos', back: 'comidas',
    items: [
      { name: 'Lomito Simple', price: '$22.400', desc: 'Pan de focaccia, lomo 180g, lactonesa de la casa, queso tybo, jamón cocido, chimi de la casa y papas fritas.', imageUrl: 'https://bruzz.com.ar/img/lomoamericano.jpg' },
      { name: 'Lomito Completo', price: '$23.300', desc: 'Pan de focaccia, lomo 180g, lactonesa de la casa, queso tybo, jamón cocido, huevo, lechuga, tomate, chimi de la casa y papas fritas.', imageUrl: 'https://bruzz.com.ar/img/lomoamericano.jpg' },
      { name: 'Lomito Americano', price: '$23.800', desc: 'Pan de focaccia, lomo 180g, lactonesa de la casa, barbacoa, queso cheddar, panceta, huevo, cebolla morada caramelizada y papas fritas.', imageUrl: 'https://bruzz.com.ar/img/lomoamericano.jpg' },
      { name: 'Bife extra (100g)', price: '$6.800', desc: 'Lomo 100%.', imageUrl: 'https://bruzz.com.ar/img/lomoamericano.jpg' },
    ],
  },

  sandwich: {
    title: 'Sandwich', back: 'comidas',
    items: [
      { name: 'Tostato', price: '$9.300', desc: 'Pan artesanal, lactonesa de la casa, jamón cocido, queso dambo y papas fritas.', imageUrl: 'https://bruzz.com.ar/img/ternera.jpg' },
      { name: 'Macerata', price: '$11.900', desc: 'Pan artesanal, lactonesa de la casa, queso dambo, jamón crudo, tomates frescos, rúcula, y papas fritas.', imageUrl: 'https://bruzz.com.ar/img/ternera.jpg' },
      { name: 'Vegetariano', price: '$14.900', desc: 'Pan de focaccia, salsa Bruzz, lechuga, tomate fresco, zucchini y berenjena grillado, queso dambo y papas fritas.', imageUrl: 'https://bruzz.com.ar/img/ternera.jpg' },
      { name: 'Ternera', price: '$19.900', desc: 'Pan de focaccia, lactonesa de albahaca, rúcula, tomates frescos, ternera desmenuzada en vino tinto y papas fritas.', imageUrl: 'https://bruzz.com.ar/img/ternera.jpg' },
    ],
  },

  papas: {
    title: 'Papas', back: 'comidas',
    items: [
      { name: 'Patatines', price: '$7.600', desc: 'Papas fritas Clasicas.', imageUrl: 'https://bruzz.com.ar/img/papas.jpg' },
      { name: 'Papas Carbonara', price: '$10.600', desc: 'Papas fritas, huevo revuelto, parmesano y panceta.', imageUrl: 'https://bruzz.com.ar/img/papas.jpg' },
      { name: 'Papas con Cheddar', price: '$11.200', desc: 'Papas fritas con cheddar, bacon y cebolla de verdeo.', imageUrl: 'https://bruzz.com.ar/img/papas.jpg' },
    ],
  },

  sinAlcohol: {
    title: 'Sin Alcohol', back: 'bebidas',
    items: [
      { name: 'Agua mineral CC', price: '$3.700', desc: '', imageUrl: 'https://bruzz.com.ar/img/agua.jpg' },
      { name: 'Agua con gas CC', price: '$3.700', desc: '', imageUrl: 'https://bruzz.com.ar/img/agua.jpg' },
      { name: 'Agua Saborisada CC', price: '$3.900', desc: '', imageUrl: 'https://bruzz.com.ar/img/aquarius.png' },
      { name: 'Coca cola 500 CC', price: '$3.900', desc: '', imageUrl: 'https://bruzz.com.ar/img/coca.jpg' },
      { name: 'Coca cola Zero 500 CC', price: '$3.900', desc: '', imageUrl: 'https://bruzz.com.ar/img/cocazero.png' },
      { name: 'Fanta CC', price: '$3.900', desc: '', imageUrl: 'https://bruzz.com.ar/img/fanta.jpg' },
      { name: 'Sprite CC', price: '$3.900', desc: '', imageUrl: 'https://bruzz.com.ar/img/sprite.jpg' },
      { name: 'Coca Cola 1.5L', price: '$7.800', desc: '', imageUrl: 'https://bruzz.com.ar/img/coca.jpg' },
      { name: 'Limonada Litro', price: '$7.200', desc: 'Limón exprimido, hielo, azúcar.', imageUrl: 'https://bruzz.com.ar/img/limonada.jpg' },
    ],
  },

  cervezas: {
    title: 'Cervezas', back: 'bebidas',
    items: [
      { sep: 'Pintas Tiradas' },
      { name: 'Blonde Ale', price: '$4.700', desc: 'KRAL alc. 4,5%. Ligera, moderado aroma dulce maltoso, bajo amargor y leve cítrico.', imageUrl: 'https://bruzz.com.ar/img/pintas.jpg' },
      { name: 'IPA', price: '$6.000', desc: 'KRAL. ALC. 5,3% De cuerpo medio, con marcados aromas y sabores cítricos florales.', imageUrl: 'https://bruzz.com.ar/img/pintas.jpg' },
      { name: 'Irish Red', price: '$5.200', desc: 'UN TAL RENE. alc 5%. Roja, con notas dulces, frutal.', imageUrl: 'https://bruzz.com.ar/img/pintas.jpg' },
      { name: 'Negra Stout', price: '$6.200', desc: 'Un tal RENE. Negra, notas a cafe. alc. 4.8% de amargor bajo.', imageUrl: 'https://bruzz.com.ar/img/pintas.jpg' },
      { name: 'Honey Blueberry', price: '$5.600', desc: 'UN TAL RENE. 6% Alc. Rubia, endulzada con miel y notas de blueberry.', imageUrl: 'https://bruzz.com.ar/img/pintas.jpg' },
      { name: 'American Lagger', price: '$4.800', desc: 'BUFON DEL REY. 4,2% alc. Rubia, ligera y refrescante. De amargor bajo. (Medalla de ORO 2023)', imageUrl: 'https://bruzz.com.ar/img/pintas.jpg' },
      { sep: 'Cervezas en Botella' },
      { name: 'Imperial Litro', price: '$9.000', desc: 'Golden o Extra Lagger.', imageUrl: 'https://bruzz.com.ar/img/imperial.jpg' },
      { name: 'Heineken Litro', price: '$9.900', desc: '', imageUrl: 'https://bruzz.com.ar/img/heineken.jpg' },
      { name: 'Heineken 330 CC', price: '$4.200', desc: '', imageUrl: 'https://bruzz.com.ar/img/heineken.jpg' },
      { name: 'Heineken 0.0 330 CC', price: '$3.600', desc: 'Sin Alcohol.', imageUrl: 'https://bruzz.com.ar/img/heineken.jpg' },
      { name: 'Imperial 330 CC', price: '$3.600', desc: '', imageUrl: 'https://bruzz.com.ar/img/imperial.jpg' },
      { name: 'Blue Moon 355 CC', price: '$6.000', desc: '', imageUrl: 'https://bruzz.com.ar/img/blue.jpg' },
      { sep: 'Para Disfrutar con amigos' },
      { name: 'Balde Heineken x6', price: '$21.000', desc: 'Paga 5 y te llevas 6.', imageUrl: 'https://bruzz.com.ar/img/heineken.jpg', badge: 'Balde' },
      { name: 'Balde Imperial Golden x6', price: '$18.000', desc: 'Paga 5 y te llevas 6.', imageUrl: 'https://bruzz.com.ar/img/imperial.jpg', badge: 'Balde' },
      { name: 'Balde Blue Moon x6', price: '$30.000', desc: 'Paga 5 y te llevas 6.', imageUrl: 'https://bruzz.com.ar/img/blue.jpg', badge: 'Balde' },
    ],
  },

  vinos: {
    title: 'Vinos', back: 'bebidas',
    items: [
      { sep: 'Vinos' },
      { name: 'Copa de Vino', price: '$4.000', desc: 'Copa de vino de Las Perdices Malbec reserva.', imageUrl: 'https://bruzz.com.ar/img/vino.jpg' },
      { name: 'Santa Julia Chardonnay', price: '$8.500', desc: 'Vino blanco Chardonnay, Santa Julia.', imageUrl: 'https://bruzz.com.ar/img/santa.jpeg' },
      { name: 'Espumante Dada 7', price: '$19.900', desc: 'Espumante Dada 7.', imageUrl: 'https://bruzz.com.ar/img/dada.jpg' },
      { name: 'Luigi Bosca Malbec', price: '$25.300', desc: 'Vino tinto Malbec, Luigi Bosca.', imageUrl: 'https://bruzz.com.ar/img/bosca.jpg' },
      { name: 'Alma Mora Malbec', price: '$9.500', desc: 'Vino tinto Malbec, Alma Mora.', imageUrl: 'https://bruzz.com.ar/img/alma.jpg' },
      { name: 'Cordero con Piel de Lobo Cabernet Sauvignon', price: '$13.500', desc: 'Vino tinto Cabernet Sauvignon, Cordero con Piel de Lobo.', imageUrl: 'https://bruzz.com.ar/img/cordero.jpg' },
      { name: 'Cordero con Piel de Lobo Blanco Dulce', price: '$12.900', desc: 'Vino blanco dulce, Cordero con Piel de Lobo.', imageUrl: 'https://bruzz.com.ar/img/cordero.jpg' },
      { name: 'Fond de Cave Chardonnay', price: '$11.500', desc: 'Vino blanco Chardonnay, Fond de Cave.', imageUrl: 'https://bruzz.com.ar/img/fond.png' },
      { name: 'Alma Mora Cabernet Sauvignon', price: '$9.500', desc: 'Vino tinto Cabernet Sauvignon, Alma Mora.', imageUrl: 'https://bruzz.com.ar/img/alma.jpg' },
    ],
  },

  tragos: {
    title: 'Tragos', back: 'home',
    items: [
      { sep: 'Clásicos' },
      { name: 'Vaso Fernet c/ Coca', price: '$7.000', desc: 'Fernet Branca con Coca-Cola.', imageUrl: 'https://bruzz.com.ar/img/ferne.png' },
      { name: 'Carpano Orange', price: '$7.000', desc: 'Carpano con jugo de naranja.', imageUrl: 'https://bruzz.com.ar/img/carpani.png' },
      { name: 'Vodka Speed', price: '$7.400', desc: 'Vodka con Speed.', imageUrl: 'https://bruzz.com.ar/img/vodka.png' },
      { name: 'Aperol Orange', price: '$7.000', desc: 'Aperol con jugo de naranja.', imageUrl: 'https://bruzz.com.ar/img/aperol.png' },
      { name: 'Cynar Julep', price: '$7.400', desc: 'Cynar con menta, limón y gaseosa de pomelo.', imageUrl: 'https://bruzz.com.ar/img/cynar.png' },
      { name: 'Campari Tonic', price: '$7.000', desc: 'Campari con agua tónica.', imageUrl: 'https://bruzz.com.ar/img/campari.png' },
      { name: 'Campari Orange', price: '$7.000', desc: 'Campari con jugo de naranja.', imageUrl: 'https://bruzz.com.ar/img/campari.png' },
      { name: 'Mojito', price: '$7.400', desc: 'Ron blanco, menta, limón y soda.', imageUrl: 'https://bruzz.com.ar/img/mojito.png' },
      { name: 'Medida Fernet', price: '$4.300', desc: 'Medida de Fernet Branca.', imageUrl: 'https://bruzz.com.ar/img/ferne.png' },
      { sep: 'Gin Tonic' },
      { name: 'Spirito Gin Tonic', price: '$7.000', desc: 'Gin Spirito con agua tónica.', imageUrl: 'https://bruzz.com.ar/img/gin.png' },
      { name: 'Spirito Gin Tonic Frutos Rojos', price: '$7.600', desc: 'Gin Spirito con tónica y frutos rojos.', imageUrl: 'https://bruzz.com.ar/img/gin.png' },
      { name: 'Tanqueray Gin Tonic', price: '$11.000', desc: 'Gin Tanqueray con agua tónica.', imageUrl: 'https://bruzz.com.ar/img/gin.png' },
      { name: 'Tanqueray Gin Tonic Frutos Rojos', price: '$11.600', desc: 'Gin Tanqueray con tónica y frutos rojos.', imageUrl: 'https://bruzz.com.ar/img/gin.png' },
      { name: 'Beefeater Gin Tonic', price: '$10.000', desc: 'Gin Beefeater con agua tónica.', imageUrl: 'https://bruzz.com.ar/img/gin.png' },
      { name: 'Beefeater Gin Tonic Frutos Rojos', price: '$10.600', desc: 'Gin Beefeater con tónica y frutos rojos.', imageUrl: 'https://bruzz.com.ar/img/gin.png' },
      { sep: 'Promos' },
      { name: 'Promo Bladis', price: '$49.000', desc: '1 botella de Fernet Branca 750cc + 2 Cocas 1,25 lts.', imageUrl: 'https://bruzz.com.ar/img/bladis.png', badge: '🔥 Promo' },
      { sep: 'Jarras' },
      { name: 'Jarra Spirito Gin Tonic', price: '$13.000', desc: 'Jarra de Gin Spirito con agua tónica.', imageUrl: 'https://bruzz.com.ar/img/jarras.png' },
      { name: 'Jarra Spirito Gin Tonic Frutos Rojos', price: '$14.000', desc: 'Jarra de Gin Spirito con tónica y frutos rojos.', imageUrl: 'https://bruzz.com.ar/img/jarrasF.png' },
      { name: 'Jarra de Fernet', price: '$13.000', desc: 'Jarra de Fernet Branca con Coca-Cola.', imageUrl: 'https://bruzz.com.ar/img/FerneJ.png' },
      { name: 'Jarra Beefeater Gin Tonic', price: '$19.000', desc: 'Jarra de Gin Beefeater con agua tónica.', imageUrl: 'https://bruzz.com.ar/img/jarras.png' },
      { name: 'Jarra Beefeater Gin Tonic Frutos Rojos', price: '$20.000', desc: 'Jarra de Gin Beefeater con tónica y frutos rojos.', imageUrl: 'https://bruzz.com.ar/img/jarrasF.png' },
      { name: 'Jarra Tanqueray Gin Tonic', price: '$21.000', desc: 'Jarra de Gin Tanqueray con agua tónica.', imageUrl: 'https://bruzz.com.ar/img/jarras.png' },
      { name: 'Jarra Tanqueray Gin Tonic Frutos Rojos', price: '$22.000', desc: 'Jarra de Gin Tanqueray con tónica y frutos rojos.', imageUrl: 'https://bruzz.com.ar/img/jarrasF.png' },
      { name: 'Promo 2 Jarras de Fernet', price: '$24.000', desc: '2 jarras de Fernet Branca con Coca-Cola.', imageUrl: 'https://bruzz.com.ar/img/FerneJ.png', badge: '🔥 Promo' },
    ],
  },

};

export const POSTRES = [
  { sep: 'Postres' },
  { name: 'Tiramisú Bruzz', price: '$7.500', desc: 'Vanilla, queso crema, cafe, cerveza negra, cacao. Receta de la Casa.', imageUrl: 'https://bruzz.com.ar/img/tiramisu.jpg' },
  { name: 'Flan Con Dulce de Leche', price: '$5.800', desc: 'Flan con Dulce de Leche.', imageUrl: 'https://bruzz.com.ar/img/flan.jpg' },
];

export const CAFETERIA = [
  { sep: 'Cafetería' },
  { name: 'Corto', price: '$2.500', desc: 'Café chico.', imageUrl: 'https://bruzz.com.ar/img/cafe.jpg' },
  { name: 'Lungo', price: '$2.600', desc: 'Café en jarro.', imageUrl: 'https://bruzz.com.ar/img/cafe.jpg' },
  { name: 'Doble', price: '$3.000', desc: 'Café doble.', imageUrl: 'https://bruzz.com.ar/img/cafe.jpg' },
  { name: 'XL', price: '$3.700', desc: 'Café XL.', imageUrl: 'https://bruzz.com.ar/img/cafe.jpg' },
  { name: 'Café con Leche', price: '$3.000', desc: 'Café con leche.', imageUrl: 'https://bruzz.com.ar/img/cafe.jpg' },
  { name: 'Té', price: '$2.000', desc: 'Té. Consultá las variedades disponibles.', imageUrl: 'https://bruzz.com.ar/img/cafe.jpg' },
  { name: 'Chocolatada', price: '$3.000', desc: 'Chocolatada caliente.', imageUrl: 'https://bruzz.com.ar/img/cafe.jpg' },
  { sep: 'Especiales' },
  { name: 'Flat White', price: '$3.000', desc: 'Café doble filtro con leche texturizada.', imageUrl: 'https://bruzz.com.ar/img/cafe.jpg' },
  { name: 'Macchiato', price: '$2.800', desc: 'Café con espuma de leche.', imageUrl: 'https://bruzz.com.ar/img/cafe.jpg' },
  { name: 'Submarino', price: '$3.700', desc: 'Leche texturizada con chocolate en barra.', imageUrl: 'https://bruzz.com.ar/img/cafe.jpg' },
  { name: 'Affogato', price: '$4.500', desc: 'Café con bocha de helado de crema americana.', imageUrl: 'https://bruzz.com.ar/img/cafe.jpg' },
  { name: 'Ristretto', price: '$2.500', desc: 'Shot de café concentrado.', imageUrl: 'https://bruzz.com.ar/img/cafe.jpg' },
  { name: 'Licuados', price: '$5.000', desc: 'Consultá las opciones disponibles.', imageUrl: 'https://bruzz.com.ar/img/cafe.jpg' },
  { name: 'Limonada', price: '$6.900', desc: 'Limonada fresca.', imageUrl: 'https://bruzz.com.ar/img/cafe.jpg' },
];
