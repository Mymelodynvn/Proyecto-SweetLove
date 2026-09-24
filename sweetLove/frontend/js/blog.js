/**
 * Archivo del proyecto Sweet Love.
 * Propósito: contiene la lógica correspondiente al módulo indicado por su nombre.
 * Los comentarios y nombres de funciones mantienen la intención del código en español.
 */
if (document.querySelector("#blog-app")) {
    Vue.createApp({
        data() {
            return { posts: blogPosts, activeCategory: "Todos" };
        },

        computed: {
            categories() {
                return ["Todos", ...new Set(this.posts.map((post) => post.category))];
            },

            featuredPost() {
                return this.posts.find((post) => post.featured);
            },

            filteredPosts() {
                const gridPosts = this.posts.filter((post) => !post.featured);

                if (this.activeCategory === "Todos") {
                    return gridPosts;
                }

                return gridPosts.filter((post) => post.category === this.activeCategory);
            }
        },

        methods: {
            postLink(post) {
                return `blogDetail.html?post=${post.id}`;
            }
        }
    }).mount("#blog-app");
}
