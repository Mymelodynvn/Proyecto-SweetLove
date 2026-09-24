/**
 * Sweet Love: archivo documentado en español.
 * Responsabilidad: contiene la lógica correspondiente a su nombre y ubicación.
 */
/**
 * Controla la vista del carrito de compras del frontend.
 * Expone el contenido del carrito, el contador de productos y el formato
 * monetario utilizado por la interfaz.
 */
if (document.querySelector("#cart-page-app")) {
    Vue.createApp({
        data() {
            return { cart: cartStore };
        },

        computed: {
            countLabel() {
                return this.cart.count === 1
                    ? "1 producto en tu pedido"
                    : `${this.cart.count} productos en tu pedido`;
            }
        },

        methods: {
            formatPrice
        }
    }).mount("#cart-page-app");
}
