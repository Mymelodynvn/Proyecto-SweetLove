// blog-detail.js — detalle de un artículo del blog
if (document.querySelector("#blog-detail-app")) {
    Vue.createApp({
        // Estado: lista de artículos y el identificador solicitado en la URL
        data() {
            return {
                posts: blogPosts,
                requestedId: new URLSearchParams(location.search).get("post")
            };
        },

        computed: {
            // Artículo que se está leyendo (undefined si el identificador no existe)
            post() {
                return this.posts.find((blogPost) => blogPost.id === this.requestedId);
            },

            // Hasta 3 artículos relacionados: de la misma categoría si hay; si no, otros cualesquiera
            relatedPosts() {
                if (!this.post) {
                    return [];
                }

                const otherPosts = this.posts.filter((blogPost) => blogPost.id !== this.post.id);
                const sameCategory = otherPosts.filter((blogPost) => blogPost.category === this.post.category);

                return (sameCategory.length > 0 ? sameCategory : otherPosts).slice(0, 3);
            }
        },

        methods: {
            // Construye el enlace al detalle de un artículo, recibe post
            postLink(post) {
                return `blogDetail.html?post=${post.id}`;
            }
        }
    }).mount("#blog-detail-app");
}
