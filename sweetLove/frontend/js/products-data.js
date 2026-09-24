/**
 * Sweet Love: archivo documentado en español.
 * Responsabilidad: contiene la lógica correspondiente a su nombre y ubicación.
 */
const fallbackProductCatalog = [];

/**
 * Solicita los productos al backend y asigna una imagen temporal existente.
 */
const loadProductCatalog = async () => {
    try {
        const response = await fetch('http://127.0.0.1:3000/api/products');
        if (!response.ok) throw new Error('No fue posible obtener los productos.');
        const products = await response.json();

        return products.map((product) => {
            return {
                id: String(product.id || product.idProducto || product.id_producto),
                name: product.name || product.nombre || product.nombreProducto,
                price: Number(product.price || product.precio),
                // Imagen temporal válida mientras se cargan los archivos finales
                image: 'assets/recursos/logo1.png',
                alt: product.name || product.nombre || product.nombreProducto,
                description: product.description || product.descripcion || ''
            };
        });
    } catch (error) {
        console.warn('Se usará el catálogo local porque la API no respondió.', error);
        return fallbackProductCatalog;
    }
}; 