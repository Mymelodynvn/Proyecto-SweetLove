// blog-data.js — contenido del blog
const blogPosts = [
    {
        id: "cupcake-tips",
        title: "5 tips para conservar tus cupcakes frescos toda la semana",
        excerpt: "El secreto no está solo en la receta: la forma en que guardas tus postres define su sabor y textura.",
        content: [
            "El secreto no está solo en la receta: la forma en que guardas tus postres define su sabor y textura. Un cupcake recién horneado es pura magia, pero con los cuidados correctos esa magia puede durar varios días más de lo que imaginas.",
            "Primero, deja enfriar por completo antes de guardar: el vapor atrapado es el enemigo número uno de la crema. Usa un recipiente hermético a temperatura ambiente si los vas a comer en uno o dos días, y refrigera solo cuando la cobertura lleve lácteos frescos. Antes de servir, dales veinte minutos fuera de la nevera para que recuperen su suavidad.",
            "Y el truco que usamos en nuestra cocina: guarda los cupcakes sin decorar y añade la crema el mismo día que los vas a disfrutar. Así cada bocado sabe como recién horneado. Si pides los nuestros, te los entregamos con instrucciones de conservación para que lleguen perfectos a tu celebración."
        ],
        image: "assets/images/cupcakes.jpeg",
        alt: "Cupcakes artesanales",
        category: "Tips",
        date: "12 de agosto, 2026",
        author: "Maryuri",
        featured: true
    },
    {
        id: "chocolate-strawberries",
        title: "Fresas con chocolate: el detalle que nunca falla",
        excerpt: "Paso a paso para lograr una cobertura brillante y colores pastel dignos de una foto.",
        content: [
            "Las fresas con chocolate son ese detalle que funciona para todo: aniversarios, cumpleaños o un simple antojo de viernes. Y aunque parecen sencillas, lograr una cobertura brillante y uniforme tiene su ciencia.",
            "La clave está en el temperado: derretir el chocolate a fuego suave, retirarlo a tiempo y trabajarlo a la temperatura justa para que al enfriar quede firme y con brillo. Las fresas deben estar completamente secas antes de sumergirlas, porque una sola gota de agua puede cortar el chocolate.",
            "Para los colores pastel que ves en nuestras cajas usamos chocolate blanco teñido con colorantes liposolubles, aplicado en capas finas. ¿Prefieres que lo hagamos por ti? Nuestra caja de doce fresas llega lista para regalar, con los colores de tu ocasión especial."
        ],
        image: "assets/images/fresas.jpeg",
        alt: "Fresas con chocolate",
        category: "Recetas",
        date: "5 de agosto, 2026",
        author: "Maryuri",
        featured: false
    },
    {
        id: "perfect-cake",
        title: "Cómo elegir la torta perfecta para tu celebración",
        excerpt: "Tamaños, sabores y diseños: una guía corta para acertar con el pedido en cualquier ocasión.",
        content: [
            "Elegir la torta de una celebración puede sentirse abrumador: tamaños, pisos, sabores, coberturas... Esta guía corta te ayuda a decidir sin estrés y a acertar con el pedido.",
            "Empieza por el número de invitados: calcula una porción generosa por persona y suma un diez por ciento extra. Luego define el sabor pensando en el homenajeado, no en la mayoría — los invitados disfrutan cualquier torta bien hecha, pero la persona del día merece su favorita. En diseño, menos es más: una paleta de dos o tres colores siempre luce elegante.",
            "Nuestro consejo final: pide con al menos una semana de anticipación para tortas personalizadas. Así tenemos tiempo de bocetar el diseño contigo, hacer ajustes y hornear con calma. Escríbenos y armamos juntos la torta de tus sueños."
        ],
        image: "assets/images/cake.jpeg",
        alt: "Torta personalizada",
        category: "Tips",
        date: "29 de julio, 2026",
        author: "Maryuri",
        featured: false
    },
    {
        id: "behind-the-scenes",
        title: "Detrás de cámaras: un día en nuestra cocina",
        excerpt: "Desde el primer batido de la mañana hasta la entrega: así nace cada pedido de Sweet Love.",
        content: [
            "Todos los días en Sweet Love empiezan igual: a las seis de la mañana, con el horno precalentando y la primera tanda de bizcochos en la batidora. Antes de que la ciudad despierte, nuestra cocina ya huele a vainilla.",
            "La mañana es para hornear y la tarde para decorar. Cada pedido tiene su ficha con los detalles acordados: colores, sabores, dedicatorias. Maryuri revisa cada torta antes de empacarla, porque un pedido no sale de la cocina hasta que se ve exactamente como lo soñamos contigo.",
            "El momento favorito del día es la entrega: ver la cara de quien recibe su caja es el motivo por el que hacemos esto. Gracias por dejarnos ser parte de tus celebraciones."
        ],
        image: "assets/images/maryuri.jpeg",
        alt: "Maryuri en la cocina",
        category: "Historias",
        date: "22 de julio, 2026",
        author: "Maryuri",
        featured: false
    },
    {
        id: "mini-donuts-events",
        title: "Mini donas: el detalle perfecto para tu evento",
        excerpt: "Por qué las mesas dulces con porciones pequeñas se robaron el protagonismo en las fiestas.",
        content: [
            "Las mesas dulces cambiaron: hoy las porciones pequeñas se robaron el protagonismo. Y entre todas, las mini donas son las reinas de los eventos — bonitas, fáciles de servir y perfectas para probar varios sabores sin culpa.",
            "Para calcular cuántas necesitas, piensa en dos o tres piezas por invitado si hay más postres en la mesa, o cuatro si son el dulce principal. Nuestros combos de doce vienen en colores coordinados con la paleta de tu evento.",
            "¿Un tip de estilismo? Sírvelas en torres o tablas de madera a distintas alturas: la mesa gana volumen y las fotos quedan de revista. Cuéntanos la fecha de tu evento y te armamos la mesa dulce completa."
        ],
        image: "assets/images/Mini donas pastel.jpeg",
        alt: "Mini donas pastel",
        category: "Eventos",
        date: "15 de julio, 2026",
        author: "Maryuri",
        featured: false
    },
    {
        id: "macarons-art",
        title: "Macarons: el arte francés con toque Sweet Love",
        excerpt: "La historia de este clásico y cómo lo reinventamos con sabores y colores de nuestra carta.",
        content: [
            "El macaron nació en Italia, creció en Francia y hoy es el postre más elegante de cualquier vitrina. Dos tapas de merengue de almendra, un relleno cremoso y ese punto crocante por fuera y suave por dentro que lo hace inconfundible.",
            "Hacerlos bien es un reto: el macaronage — el punto exacto de la mezcla — separa un macaron perfecto de uno agrietado. En nuestra cocina los dejamos reposar hasta que forman su piel característica antes de hornear, y por eso cada tanda toma su tiempo.",
            "Nuestra versión lleva los colores pastel de la casa y rellenos con frutas locales. Prueba la caja de cinco y cuéntanos cuál es tu favorito."
        ],
        image: "assets/images/macarons.jpeg",
        alt: "Macarons pastel",
        category: "Recetas",
        date: "8 de julio, 2026",
        author: "Maryuri",
        featured: false
    },
    {
        id: "surprise-boxes",
        title: "Cajas sorpresa: regala momentos dulces",
        excerpt: "Conoce nuestras nuevas cajas Birthday y arma la tuya con los postres favoritos de esa persona especial.",
        content: [
            "Hay regalos que se guardan y regalos que se disfrutan. Nuestras cajas Birthday son de los segundos: una selección de postres pensada para sorprender a esa persona especial en su día.",
            "Puedes elegir la caja de tres o la de seis, y personalizarla con los sabores favoritos del homenajeado: mini cake, cupcakes, fresas con chocolate o trufas. Cada caja va decorada a mano y con espacio para una dedicatoria escrita.",
            "¿No sabes qué combinar? Cuéntanos cómo es esa persona y te sugerimos la mezcla perfecta. Las entregamos en Medellín el mismo día si pides antes del mediodía."
        ],
        image: "assets/images/combox6.jpeg",
        alt: "Caja sorpresa de postres",
        category: "Novedades",
        date: "1 de julio, 2026",
        author: "Maryuri",
        featured: false
    }
];
