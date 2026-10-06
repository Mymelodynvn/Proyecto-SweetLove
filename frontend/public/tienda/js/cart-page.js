// cart-page.js — página completa del carrito (cart.html)
if (document.querySelector("#cart-page-app")) {
    Vue.createApp({
        // Estado: referencia al carrito compartido (cartStore)
        data() {
            return { cart: cartStore };
        },

        computed: {
            // Texto con la cantidad de productos, en singular o plural
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
