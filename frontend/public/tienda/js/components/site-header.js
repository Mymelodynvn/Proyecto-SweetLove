/**
 * site-header.js — encabezado de la tienda.
 * Muestra el menú principal, el logo y los botones de búsqueda y de inicio de sesión.
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

                        <a v-if="!ui.user" href="#" aria-label="Perfil" @click.prevent="openLogin"><i class="fa-solid fa-circle-user"></i></a>

                        <template v-else>
                            <span class="user-greeting">Hola, {{ ui.user.nombre }}</span>

                            <a v-if="ui.user.idRol === 1" href="/admin" class="user-panel-link" aria-label="Ir al panel de administración" title="Panel de administración"><i class="fa-solid fa-gauge"></i></a>

                            <a href="#" aria-label="Cerrar sesión" title="Cerrar sesión" @click.prevent="logout"><i class="fa-solid fa-right-from-bracket"></i></a>
                        </template>
                    </div>
                </div>
            </div>

            <div class="header-wave-divider"></div>
        </header>`,

    /** Estado: referencia al estado de la interfaz (incluye el usuario con sesión iniciada). */
    data() {
        return { ui: uiStore };
    },

    computed: {
        /** Indica si la página actual es la portada (para usar anclas internas en los enlaces). */
        onHomePage() {
            return location.pathname.endsWith("index.html") || location.pathname.endsWith("/");
        },

        /** Enlace de "Inicio": ancla interna en la portada, o index.html desde otras páginas. */
        homeLink() {
            return this.onHomePage ? "#home-section" : "index.html";
        },

        /** Enlace de "Productos": ancla de la sección de productos de la portada. */
        productsLink() {
            return this.onHomePage ? "#products-section" : "index.html#products-section";
        }
    },

    methods: {
        /** Abre la ventana de búsqueda. */
        openSearch() {
            uiStore.searchOpen = true;
        },

        /** Abre la ventana de acceso en la vista de inicio de sesión. */
        openLogin() {
            uiStore.authView = "login";
            uiStore.authOpen = true;
        },

        /** Cierra la sesión en el servidor y quita el usuario de la interfaz. */
        async logout() {
            try {
                await fetch("/api/auth/logout", { method: "POST" });
            } finally {
                uiStore.user = null;
            }
        }
    },

    /** Al cargar la página, consulta al servidor si ya hay una sesión iniciada para mostrar el nombre. */
    async mounted() {
        try {
            const response = await fetch("/api/auth/me");
            if (response.ok) uiStore.user = (await response.json()).user;
        } catch (error) {
            uiStore.user = null;
        }
    }
};
