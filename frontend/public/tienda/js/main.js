// main.js — arranque de la tienda
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
mountComponentApp("#product-app", ProductModal);
mountComponentApp("#back-to-top-app", BackToTop);
