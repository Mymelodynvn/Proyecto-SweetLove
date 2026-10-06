// products.js — listado de productos de la portada
if (document.querySelector("#products-app")) {
    Vue.createApp({
        mixins: [addToCartMixin],

        // Estado: expone el catálogo compartido para pintar las tarjetas de producto
        data() {
            return { catalog: catalogStore };
        }
    }).mount("#products-app");
}
