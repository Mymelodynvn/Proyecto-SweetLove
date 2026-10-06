/**
 * products-data.js — catálogo de productos de la tienda.
 * El catálogo real se pide a la API (/api/products). Si la API no responde, se usa
 * un catálogo de respaldo local para que la tienda no quede vacía.
 */
/**
 * Catálogo de respaldo utilizado por el frontend cuando la API no está disponible.
 * El catálogo principal se carga desde MySQL mediante la ruta /api/products.
 */
const fallbackProductCatalog = [
    {
        id: "cupcakes",
        name: "Cupcakes",
        price: 8000,
        image: "assets/images/cupcakes.jpeg",
        alt: "Cupcakes"
    },
    {
        id: "custom-cakes",
        name: "Cakes Personalizados",
        price: 200000,
        image: "assets/images/cake.jpeg",
        alt: "Cakes personalizados"
    },
    {
        id: "mini-donuts-x12",
        name: "Mini Donas x12",
        price: 40000,
        image: "assets/images/Mini donas pastel.jpeg",
        alt: "Mini donas x12"
    },
    {
        id: "birthday-box-x3",
        name: "Caja Birthday x3",
        price: 60000,
        image: "assets/images/combox3.jpeg",
        alt: "Caja Birthday x3"
    },
    {
        id: "chocolate-strawberries-x12",
        name: "Fresas con Chocolate x12",
        price: 40000,
        image: "assets/images/fresas.jpeg",
        alt: "Fresas con chocolate x12"
    },
    {
        id: "birthday-box-x6",
        name: "Caja Birthday x6",
        price: 85000,
        image: "assets/images/combox6.jpeg",
        alt: "Caja Birthday x6"
    },
    {
        id: "macarons-x5",
        name: "Macarrons x5",
        price: 25000,
        image: "assets/images/macarons.jpeg",
        alt: "Macarrons x5"
    },
    {
        id: "chocolate-truffles-x12",
        name: "Trufas de Chocolate x12",
        price: 50000,
        image: "assets/images/trufas.jpeg",
        alt: "Trufas de chocolate x12"
    },
    {
        id: "meringues-x12",
        name: "Suspiros x12",
        price: 20000,
        image: "assets/images/suspiros.jpeg",
        alt: "Suspiros x12"
    }
];


/**
 * Solicita los productos reales al backend y conserva los datos de respaldo si la conexión falla.
 */
const loadProductCatalog = async () => {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('No fue posible obtener los productos.');
        const products = await response.json();
        return products.map((product) => ({
            id: String(product.id),
            name: product.name,
            price: Number(product.price),
            image: product.image || 'assets/recursos/logo.png',
            alt: product.name,
            description: product.description || ''
        }));
    } catch (error) {
        console.warn('Se usará el catálogo local porque la API no respondió.', error);
        return fallbackProductCatalog;
    }
};
