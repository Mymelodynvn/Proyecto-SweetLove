/**
 * main.js — arranque de la tienda.
 * Monta cada componente Vue (encabezado, pie, carrito, buscador y login) en su
 * contenedor HTML, solo si ese contenedor existe en la página actual.
 */
const mountComponentApp = (selector, component) => {
    if (document.querySelector(selector)) {
        Vue.createApp(component).mount(selector);
    }
};

mountComponentApp("#site-header", SiteHeader);
mountComponentApp("#site-footer", SiteFooter);
mountComponentApp("#cart-app", CartDrawer);
mountComponentApp("#search-app", SearchModal);
mountComponentApp("#auth-app", AuthModal);
