// stores.js — estado global de la tienda: cartStore (carrito), catalogStore (catálogo), uiStore (ventanas abiertas) y addToCartMixin
const CART_STORAGE_KEY = "sweetlove-cart";
const TAX_RATE_PERCENT = 19;
const ADDED_FEEDBACK_MS = 1600;

// Devuelve la ruta de imagen lista para usar en la tienda, recibe imagePath
const normalizeImagePath = (imagePath) => {
    if (!imagePath) return "assets/recursos/logo.png";
    if (/^(\/|https?:|assets\/)/.test(imagePath)) return imagePath;
    return `assets/${imagePath}`;
};

// Lee el carrito guardado en localStorage (persiste entre visitas)
const readStoredItems = () => {
    try {
        const storedItems = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));

        if (!Array.isArray(storedItems)) {
            return [];
        }

        return storedItems.map((cartItem) => ({
            ...cartItem,
            image: normalizeImagePath(cartItem.image)
        }));
    } catch (parseError) {
        return [];
    }
};

// Da formato de pesos colombianos a un valor, recibe value
const formatPrice = (value) => `$${value.toLocaleString("es-CO")}`;

// Carrito de compras
const cartStore = Vue.reactive({
    items: readStoredItems(),

    // Cantidad de productos distintos en el carrito
    get count() {
        return this.items.length;
    },

    // Total a pagar (IVA incluido): suma de precio por cantidad de cada producto
    get total() {
        return this.items.reduce((accumulatedTotal, cartItem) => accumulatedTotal + cartItem.price * cartItem.quantity, 0);
    },

    // Valor antes de IVA, deducido del total con la tasa TAX_RATE_PERCENT
    get subtotal() {
        return Math.round(this.total / (1 + TAX_RATE_PERCENT / 100));
    },

    // Valor del IVA (total menos subtotal)
    get tax() {
        return this.total - this.subtotal;
    },

    // Guarda el carrito en localStorage para conservarlo entre visitas
    persist() {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
    },

    // Agrega un producto al carrito; si ya está, suma una unidad, recibe product
    addItem(product) {
        const existingItem = this.items.find((cartItem) => cartItem.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }

        this.persist();
    },

    // Suma o resta unidades de un producto; si queda en 0 o menos, lo quita, recibe productId, quantityChange
    changeQuantity(productId, quantityChange) {
        const targetItem = this.items.find((cartItem) => cartItem.id === productId);

        if (!targetItem) {
            return;
        }

        if (targetItem.quantity + quantityChange <= 0) {
            this.removeItem(productId);
            return;
        }

        targetItem.quantity += quantityChange;
        this.persist();
    },

    // Quita un producto del carrito, recibe productId
    removeItem(productId) {
        this.items = this.items.filter((cartItem) => cartItem.id !== productId);
        this.persist();
    }
});

// Catálogo de la tienda
const catalogStore = Vue.reactive({
    // Se carga el catálogo desde la API conectada a MySQL.
    products: fallbackProductCatalog,
    loaded: false
});

// Carga el catálogo real desde la API una sola vez; si falla, se conserva el de respaldo
const loadCatalogFromApi = async () => {
    if (catalogStore.loaded) return;

    try {
        const products = await loadProductCatalog();
        catalogStore.products = products;
    } finally {
        catalogStore.loaded = true;
    }
};

// Carga el catálogo al iniciar el frontend.
loadCatalogFromApi();

// Estado de la interfaz: qué ventanas (búsqueda, carrito, acceso) están abiertas
const uiStore = Vue.reactive({
    searchOpen: false,
    drawerOpen: false,
    authOpen: false,
    authView: "login",
    // Usuario con sesión iniciada ({ nombre, idRol... }) o null. Lo llena el login y /api/auth/me.
    user: null
});

Vue.watchEffect(() => {
    document.body.classList.toggle("no-scroll", uiStore.searchOpen || uiStore.drawerOpen || uiStore.authOpen);
});

// Mixin de Vue: agrega productos al carrito y muestra un check temporal en el botón
const addToCartMixin = {
    // Estado local: ids de productos recién agregados (para el aviso visual)
    data() {
        return { addedIds: [] };
    },

    methods: {
        formatPrice,

        // Agrega el producto al carrito y marca el botón como "agregado" durante 1,6 segundos, recibe product
        addToCart(product) {
            cartStore.addItem(product);

            if (this.addedIds.includes(product.id)) {
                return;
            }

            this.addedIds.push(product.id);

            setTimeout(() => {
                this.addedIds = this.addedIds.filter((addedId) => addedId !== product.id);
            }, ADDED_FEEDBACK_MS);
        },

        // Indica si el producto fue agregado hace poco (para mostrar el check), recibe productId
        isAdded(productId) {
            return this.addedIds.includes(productId);
        }
    }
};
