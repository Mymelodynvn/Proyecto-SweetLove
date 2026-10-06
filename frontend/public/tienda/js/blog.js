/**
 * blog.js — página del blog.
 * Lista los artículos, permite filtrarlos por categoría y destaca el artículo principal.
 */
if (document.querySelector("#blog-app")) {
    Vue.createApp({
        /** Estado: todos los artículos y la categoría seleccionada ("Todos" por defecto). */
        data() {
            return { posts: blogPosts, activeCategory: "Todos" };
        },

        computed: {
            /** Categorías disponibles, sin repetir, precedidas por "Todos". */
            categories() {
                return ["Todos", ...new Set(this.posts.map((post) => post.category))];
            },

            /** Artículo marcado como destacado (se muestra en grande). */
            featuredPost() {
                return this.posts.find((post) => post.featured);
            },

            /** Artículos del listado (sin el destacado) que cumplen la categoría elegida. */
            filteredPosts() {
                const gridPosts = this.posts.filter((post) => !post.featured);

                if (this.activeCategory === "Todos") {
                    return gridPosts;
                }

                return gridPosts.filter((post) => post.category === this.activeCategory);
            }
        },

        methods: {
            /**
             * Construye el enlace al detalle de un artículo.
             * @param {object} post Artículo del blog.
             * @returns {string} URL relativa de blogDetail.html.
             */
            postLink(post) {
                return `blogDetail.html?post=${post.id}`;
            }
        }
    }).mount("#blog-app");
}
