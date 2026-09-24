/**
 * Archivo del proyecto Sweet Love.
 * Propósito: contiene la lógica correspondiente al módulo indicado por su nombre.
 * Los comentarios y nombres de funciones mantienen la intención del código en español.
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
