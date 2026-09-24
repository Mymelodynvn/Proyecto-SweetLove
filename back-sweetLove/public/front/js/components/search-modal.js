/**
 * Archivo del proyecto Sweet Love.
 * Propósito: contiene la lógica correspondiente al módulo indicado por su nombre.
 * Los comentarios y nombres de funciones mantienen la intención del código en español.
 */
const SearchModal = {
    mixins: [addToCartMixin],

    template: `
        <div class="search-modal" :class="{ 'search-modal--open': ui.searchOpen }" :aria-hidden="String(!ui.searchOpen)">
            <div class="search-modal__overlay" @click="closeModal"></div>

            <div class="search-modal__panel" role="dialog" aria-label="Buscar productos">
                <div class="search-modal__bar">
                    <i class="fa-solid fa-magnifying-glass"></i>

                    <input type="text" class="search-modal__input" placeholder="Busca tus antojos..." v-model.trim="query" ref="searchInput">

                    <button class="search-modal__close" @click="closeModal" aria-label="Cerrar búsqueda"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <div class="search-modal__body">
                    <div v-if="query" class="search-modal__results">
                        <h3 class="search-modal__title"><i class="fa-solid fa-magnifying-glass"></i>Resultados para: {{ query }}</h3>

                        <div class="search-modal__grid">
                            <a v-for="product in searchResults" :key="product.id" :href="productsLink" class="search-modal__tile" @click="closeModal">
                                <img :src="product.image" :alt="product.alt">

                                <span class="search-modal__tile-name">{{ product.name }}</span>

                                <span class="search-modal__tile-price">{{ formatPrice(product.price) }}</span>

                                <button type="button" class="search-modal__tile-add" :class="{ 'is-added': isAdded(product.id) }" @click.prevent.stop="addToCart(product)" aria-label="Agregar al carrito"><i :class="isAdded(product.id) ? 'fa-solid fa-check' : 'fa-solid fa-plus'"></i></button>
                            </a>
                        </div>

                        <p v-if="searchResults.length === 0" class="search-modal__empty">No encontramos antojos con ese nombre.</p>
                    </div>

                    <div class="search-modal__default">
                        <h3 class="search-modal__title"><i class="fa-solid fa-star"></i>Mas vendidos</h3>

                        <div class="search-modal__grid">
                            <a v-for="product in featuredProducts" :key="product.id" :href="productsLink" class="search-modal__tile" @click="closeModal">
                                <img :src="product.image" :alt="product.alt">

                                <span class="search-modal__tile-name">{{ product.name }}</span>

                                <span class="search-modal__tile-price">{{ formatPrice(product.price) }}</span>

                                <button type="button" class="search-modal__tile-add" :class="{ 'is-added': isAdded(product.id) }" @click.prevent.stop="addToCart(product)" aria-label="Agregar al carrito"><i :class="isAdded(product.id) ? 'fa-solid fa-check' : 'fa-solid fa-plus'"></i></button>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>`,

    data() {
        return { catalog: catalogStore, ui: uiStore, query: "" };
    },

    computed: {
        searchResults() {
            const normalizedQuery = this.query.toLowerCase();
            return this.catalog.products.filter((product) => product.name.toLowerCase().includes(normalizedQuery));
        },

        featuredProducts() {
            return this.catalog.products.slice(0, 6);
        },

        productsLink() {
            const onHomePage = location.pathname.endsWith("index.html") || location.pathname.endsWith("/");
            return onHomePage ? "#products-section" : "index.html#products-section";
        }
    },

    watch: {
        "ui.searchOpen"(openState) {
            if (openState) {
                Vue.nextTick(() => this.$refs.searchInput.focus());
            }
        }
    },

    methods: {
        closeModal() {
            uiStore.searchOpen = false;
        }
    },

    mounted() {
        document.addEventListener("keydown", (keyEvent) => {
            if (keyEvent.key === "Escape") {
                this.closeModal();
            }
        });
    }
};
