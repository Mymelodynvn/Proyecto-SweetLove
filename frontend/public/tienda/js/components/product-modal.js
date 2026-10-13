// product-modal.js — ventana de detalle de un producto: foto, descripción, cantidad y botón para agregarlo al carrito

// Texto que se muestra cuando el producto no tiene descripción
const PRODUCT_DEFAULT_DESCRIPTION = "Postre artesanal hecho con mucho amor por Sweet Love.";
// Cantidad máxima que se puede agregar de una vez
const PRODUCT_MAX_QUANTITY = 20;
// Unidades restantes a partir de las cuales se avisa que quedan pocas
const PRODUCT_LOW_STOCK = 5;
// Milisegundos que se muestra el aviso "¡Añadido!"
const PRODUCT_ADDED_MS = 2500;

const ProductModal = {
    template: `
        <!-- Ventana de detalle del producto: se abre cuando ui.productId tiene el producto elegido -->
        <div class="product-modal" :class="{ 'product-modal--open': open }" :aria-hidden="String(!open)">
            <!-- Fondo oscuro: al pulsarlo se cierra la ventana -->
            <div class="product-modal__overlay" @click="close"></div>

            <!-- Panel con la foto a la izquierda y los datos a la derecha -->
            <div class="product-modal__panel" role="dialog" aria-label="Detalle del producto" v-if="product">
                <!-- Botón para cerrar la ventana -->
                <button class="product-modal__close" @click="close" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>

                <!-- Foto del producto -->
                <div class="product-modal__media">
                    <!-- Imagen del producto -->
                    <img :src="product.image" :alt="product.alt">
                </div>

                <!-- Datos del producto -->
                <div class="product-modal__info">
                    <!-- Nombre del producto -->
                    <h2>{{ product.name }}</h2>

                    <!-- Precio del producto -->
                    <p class="product-modal__price">{{ formatPrice(product.price) }}</p>

                    <!-- Disponibilidad: agotado o pocas unidades -->
                    <p v-if="stockLabel" class="product-modal__stock" :class="{ 'product-modal__stock--out': soldOut }">{{ stockLabel }}</p>

                    <!-- Descripción del producto -->
                    <p class="product-modal__description">{{ description }}</p>

                    <!-- Selector de cantidad (se oculta si está agotado) -->
                    <div v-if="!soldOut" class="product-modal__quantity">
                        <!-- Texto de la cantidad -->
                        <span>Cantidad</span>

                        <!-- Botones para quitar o agregar unidades -->
                        <div class="qty">
                            <!-- Quitar una unidad -->
                            <button type="button" class="qty-btn" @click="changeQuantity(-1)" :disabled="quantity <= 1" aria-label="Quitar una unidad"><i class="fa-solid fa-minus"></i></button>

                            <!-- Cantidad elegida -->
                            <span class="qty-value">{{ quantity }}</span>

                            <!-- Agregar una unidad -->
                            <button type="button" class="qty-btn" @click="changeQuantity(1)" :disabled="quantity >= maxQuantity" aria-label="Agregar una unidad"><i class="fa-solid fa-plus"></i></button>
                        </div>
                    </div>

                    <!-- Botón para agregar al carrito (cambia a "¡Añadido!" un momento) -->
                    <button type="button" class="btn__text-agg product-modal__add" :class="{ 'is-added': added }" :disabled="soldOut" @click="addToCart"><i :class="added ? 'fa-solid fa-check' : 'fa-solid fa-bag-shopping'"></i>{{ soldOut ? 'Agotado' : added ? '¡Añadido!' : 'Agregar al carrito' }}</button>

                    <!-- Enlace para ver el carrito (solo después de agregar) -->
                    <p v-if="added" class="product-modal__cart-link"><a href="#" @click.prevent="openCart">Ver mi carrito</a></p>
                </div>
            </div>
        </div>`,

    // Estado: ventana y catálogo compartidos, cantidad elegida y si se acaba de agregar
    data() {
        return { ui: uiStore, catalog: catalogStore, quantity: 1, added: false, addedTimer: null };
    },

    computed: {
        // Producto elegido, o null si la ventana está cerrada o el producto ya no existe
        product() {
            return this.catalog.products.find((item) => item.id === this.ui.productId) || null;
        },

        // Indica si la ventana debe verse abierta
        open() {
            return Boolean(this.product);
        },

        // Indica si el producto está agotado (solo se sabe si la API informó las existencias)
        soldOut() {
            return Number.isFinite(this.product?.stock) && this.product.stock <= 0;
        },

        // Cantidad máxima que se puede elegir: las existencias, hasta un tope
        maxQuantity() {
            const stock = this.product?.stock;
            return Number.isFinite(stock) && stock > 0 ? Math.min(stock, PRODUCT_MAX_QUANTITY) : PRODUCT_MAX_QUANTITY;
        },

        // Texto de disponibilidad: "Agotado", "Quedan N" o vacío si hay suficientes
        stockLabel() {
            const stock = this.product?.stock;
            if (!Number.isFinite(stock)) return "";
            if (stock <= 0) return "Agotado por ahora";
            return stock <= PRODUCT_LOW_STOCK ? `¡Quedan solo ${stock}!` : "";
        },

        // Descripción del producto o el texto por defecto
        description() {
            return this.product?.description || PRODUCT_DEFAULT_DESCRIPTION;
        }
    },

    watch: {
        // Al abrir otro producto se reinicia la cantidad y el aviso de agregado
        "ui.productId"() {
            this.quantity = 1;
            this.added = false;
            clearTimeout(this.addedTimer);
        }
    },

    methods: {
        formatPrice,

        // Cierra la ventana
        close() {
            uiStore.productId = null;
        },

        // Suma o resta unidades sin salirse de los límites, recibe delta
        changeQuantity(delta) {
            this.quantity = Math.min(this.maxQuantity, Math.max(1, this.quantity + delta));
        },

        // Agrega al carrito la cantidad elegida y muestra "¡Añadido!" un momento
        addToCart() {
            if (!this.product || this.soldOut) return;
            cartStore.addItem(this.product, this.quantity);
            this.added = true;
            clearTimeout(this.addedTimer);
            this.addedTimer = setTimeout(() => {
                this.added = false;
            }, PRODUCT_ADDED_MS);
        },

        // Cierra la ventana y abre el carrito lateral
        openCart() {
            this.close();
            uiStore.drawerOpen = true;
        }
    },

    // Al montar el componente, permite cerrar la ventana con la tecla Escape
    mounted() {
        document.addEventListener("keydown", (keyEvent) => {
            if (keyEvent.key === "Escape") {
                this.close();
            }
        });
    }
};
