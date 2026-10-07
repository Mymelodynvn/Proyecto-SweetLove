// search-modal.js — ventana de búsqueda de productos
const SearchModal = {
    mixins: [addToCartMixin],

    template: `
        <!-- Ventana de búsqueda: se abre y se cierra con ui.searchOpen -->
        <div class="search-modal" :class="{ 'search-modal--open': ui.searchOpen }" :aria-hidden="String(!ui.searchOpen)">
            <!-- Fondo oscuro: al pulsarlo se cierra la ventana -->
            <div class="search-modal__overlay" @click="closeModal"></div>

            <!-- Panel de la ventana -->
            <div class="search-modal__panel" role="dialog" aria-label="Buscar productos">
                <!-- Barra con el campo de búsqueda -->
                <div class="search-modal__bar">
                    <!-- Icono de lupa -->
                    <i class="fa-solid fa-magnifying-glass"></i>

                    <!-- Campo para escribir lo que se busca -->
                    <input type="text" class="search-modal__input" placeholder="Busca tus antojos..." v-model.trim="query" ref="searchInput">

                    <!-- Botón para cerrar la ventana -->
                    <button class="search-modal__close" @click="closeModal" aria-label="Cerrar búsqueda"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <!-- Cuerpo: resultados y productos más vendidos -->
                <div class="search-modal__body">
                    <!-- Resultados (solo cuando hay texto escrito) -->
                    <div v-if="query" class="search-modal__results">
                        <!-- Título de los resultados -->
                        <h3 class="search-modal__title"><i class="fa-solid fa-magnifying-glass"></i>Resultados para: {{ query }}</h3>

                        <!-- Cuadrícula de resultados -->
                        <div class="search-modal__grid">
                            <!-- Un resultado por cada producto encontrado -->
                            <a v-for="product in searchResults" :key="product.id" :href="productsLink" class="search-modal__tile" @click="closeModal">
                                <!-- Imagen del producto -->
                                <img :src="product.image" :alt="product.alt">

                                <!-- Nombre del producto -->
                                <span class="search-modal__tile-name">{{ product.name }}</span>

                                <!-- Precio del producto -->
                                <span class="search-modal__tile-price">{{ formatPrice(product.price) }}</span>

                                <!-- Botón para agregar al carrito -->
                                <button type="button" class="search-modal__tile-add" :class="{ 'is-added': isAdded(product.id) }" @click.prevent.stop="addToCart(product)" aria-label="Agregar al carrito"><i :class="isAdded(product.id) ? 'fa-solid fa-check' : 'fa-solid fa-plus'"></i></button>
                            </a>
                        </div>

                        <!-- Mensaje cuando no hay resultados -->
                        <p v-if="searchResults.length === 0" class="search-modal__empty">No encontramos antojos con ese nombre.</p>
                    </div>

                    <!-- Sección por defecto: los más vendidos -->
                    <div class="search-modal__default">
                        <!-- Título: Más vendidos -->
                        <h3 class="search-modal__title"><i class="fa-solid fa-star"></i>Mas vendidos</h3>

                        <!-- Cuadrícula de productos más vendidos -->
                        <div class="search-modal__grid">
                            <!-- Un producto de los más vendidos -->
                            <a v-for="product in featuredProducts" :key="product.id" :href="productsLink" class="search-modal__tile" @click="closeModal">
                                <!-- Imagen del producto -->
                                <img :src="product.image" :alt="product.alt">

                                <!-- Nombre del producto -->
                                <span class="search-modal__tile-name">{{ product.name }}</span>

                                <!-- Precio del producto -->
                                <span class="search-modal__tile-price">{{ formatPrice(product.price) }}</span>

                                <!-- Botón para agregar al carrito -->
                                <button type="button" class="search-modal__tile-add" :class="{ 'is-added': isAdded(product.id) }" @click.prevent.stop="addToCart(product)" aria-label="Agregar al carrito"><i :class="isAdded(product.id) ? 'fa-solid fa-check' : 'fa-solid fa-plus'"></i></button>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>`,

    // Estado: catálogo, estado de la interfaz y texto de búsqueda
    data() {
        return { catalog: catalogStore, ui: uiStore, query: "" };
    },

    computed: {
        // Productos cuyo nombre contiene el texto buscado (sin distinguir mayúsculas)
        searchResults() {
            const normalizedQuery = this.query.toLowerCase();
            return this.catalog.products.filter((product) => product.name.toLowerCase().includes(normalizedQuery));
        },

        // Los 6 primeros productos del catálogo, mostrados como "Más vendidos"
        featuredProducts() {
            return this.catalog.products.slice(0, 6);
        },

        // Enlace a la sección de productos de la portada
        productsLink() {
            const onHomePage = location.pathname.endsWith("index.html") || location.pathname.endsWith("/");
            return onHomePage ? "#products-section" : "index.html#products-section";
        }
    },

    watch: {
        // Cuando se abre la búsqueda, pone el cursor en el campo de texto
        "ui.searchOpen"(openState) {
            if (openState) {
                Vue.nextTick(() => this.$refs.searchInput.focus());
            }
        }
    },

    methods: {
        // Cierra la ventana de búsqueda
        closeModal() {
            uiStore.searchOpen = false;
        }
    },

    // Al montar el componente, permite cerrar la búsqueda con la tecla Escape
    mounted() {
        document.addEventListener("keydown", (keyEvent) => {
            if (keyEvent.key === "Escape") {
                this.closeModal();
            }
        });
    }
};
