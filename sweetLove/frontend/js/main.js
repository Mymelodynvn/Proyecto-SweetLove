/**
 * Archivo del proyecto Sweet Love.
 * Propósito: contiene la lógica correspondiente al módulo indicado por su nombre.
 * Los comentarios y nombres de funciones mantienen la intención del código en español.
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
