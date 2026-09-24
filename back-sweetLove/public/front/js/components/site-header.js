/**
 * Archivo del proyecto Sweet Love.
 * Propósito: contiene la lógica correspondiente al módulo indicado por su nombre.
 * Los comentarios y nombres de funciones mantienen la intención del código en español.
 */
const SiteHeader = {
    template: `
        <header>
            <div class="container__header">
                <nav class="menu-left">
                    <ul>
                        <li><a :href="homeLink">Inicio</a></li>

                        <li><a :href="productsLink">Productos</a></li>

                        <li><a href="aboutUs.html">Sobre Nosotros</a></li>
                    </ul>
                </nav>

                <div class="logo">
                    <a href="index.html"><img src="assets/recursos/logo1.png"></a>
                </div>

                <div class="menu-right">
                    <nav>
                        <ul>
                            <li><a href="blog.html">Blog</a></li>

                            <li><a href="contactUs.html">Contáctanos</a></li>
                        </ul>
                    </nav>

                    <div class="actions">
                        <a href="#" aria-label="Buscar" @click.prevent="openSearch"><i class="fa-solid fa-magnifying-glass"></i></a>

                        <a href="#" aria-label="Perfil" @click.prevent="openLogin"><i class="fa-solid fa-circle-user"></i></a>
                    </div>
                </div>
            </div>

            <div class="header-wave-divider"></div>
        </header>`,

    computed: {
        onHomePage() {
            return location.pathname.endsWith("index.html") || location.pathname.endsWith("/");
        },

        homeLink() {
            return this.onHomePage ? "#home-section" : "index.html";
        },

        productsLink() {
            return this.onHomePage ? "#products-section" : "index.html#products-section";
        }
    },

    methods: {
        openSearch() {
            uiStore.searchOpen = true;
        },

        openLogin() {
            uiStore.authView = "login";
            uiStore.authOpen = true;
        }
    }
};
