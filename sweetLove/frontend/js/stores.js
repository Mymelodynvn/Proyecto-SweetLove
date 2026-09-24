/**
 * Sweet Love: archivo documentado en español.
 * Responsabilidad: contiene la lógica correspondiente a su nombre y ubicación.
 */
/**
 * Estado global del frontend: carrito de compras, catálogo y controles de interfaz.
 */
const CART_STORAGE_KEY = "sweetlove-cart";
const TAX_RATE_PERCENT = 19;
const ADDED_FEEDBACK_MS = 1600;

const readStoredItems = () => {
    try {
        const storedItems = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));

        if (!Array.isArray(storedItems)) {
            return [];
        }

        return storedItems.map((cartItem) => ({
            ...cartItem,
            image: cartItem.image.startsWith("assets/") ? cartItem.image : `assets/${cartItem.image}`
        }));
    } catch (parseError) {
        return [];
    }
};

const formatPrice = (value) => `$${value.toLocaleString("es-CO")}`;

const cartStore = Vue.reactive({
    items: readStoredItems(),

    get count() {
        return this.items.length;
    },

    get total() {
        return this.items.reduce((accumulatedTotal, cartItem) => accumulatedTotal + cartItem.price * cartItem.quantity, 0);
    },

    get subtotal() {
        return Math.round(this.total / (1 + TAX_RATE_PERCENT / 100));
    },

    get tax() {
        return this.total - this.subtotal;
    },

    persist() {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
    },

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

    removeItem(productId) {
        this.items = this.items.filter((cartItem) => cartItem.id !== productId);
        this.persist();
    }
});

const catalogStore = Vue.reactive({
    // Se inicia con el catálogo local y luego se reemplaza por los datos de MySQL.
    products: fallbackProductCatalog,
    loaded: false
});

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

const uiStore = Vue.reactive({
    searchOpen: false,
    drawerOpen: false,
    authOpen: false,
    authView: "login"
});

Vue.watchEffect(() => {
    document.body.classList.toggle("no-scroll", uiStore.searchOpen || uiStore.drawerOpen || uiStore.authOpen);
});

const addToCartMixin = {
    data() {
        return { addedIds: [] };
    },

    methods: {
        formatPrice,

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

        isAdded(productId) {
            return this.addedIds.includes(productId);
        }
    }
};
