/**
 * Archivo del proyecto Sweet Love.
 * Propósito: contiene la lógica correspondiente al módulo indicado por su nombre.
 * Los comentarios y nombres de funciones mantienen la intención del código en español.
 */
if (document.querySelector("#blog-detail-app")) {
    Vue.createApp({
        data() {
            return {
                posts: blogPosts,
                requestedId: new URLSearchParams(location.search).get("post")
            };
        },

        computed: {
            post() {
                return this.posts.find((blogPost) => blogPost.id === this.requestedId);
            },

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
            postLink(post) {
                return `blogDetail.html?post=${post.id}`;
            }
        }
    }).mount("#blog-detail-app");
}
