// site-header.js — encabezado de la tienda
const SiteHeader = {
    template: `
        <!-- Encabezado de la tienda -->
        <header>
            <!-- Contenedor: menú izquierdo, logo y menú derecho -->
            <div class="container__header">
                <!-- Menú de la izquierda -->
                <nav class="menu-left">
                    <!-- Lista de enlaces: Inicio, Productos y Sobre Nosotros -->
                    <ul>
                        <!-- Enlace a Inicio -->
                        <li><a :href="homeLink">Inicio</a></li>

                        <!-- Enlace a Productos -->
                        <li><a :href="productsLink">Productos</a></li>

                        <!-- Enlace a Sobre Nosotros -->
                        <li><a href="aboutUs.html">Sobre Nosotros</a></li>
                    </ul>
                </nav>

                <!-- Logo: lleva a la portada -->
                <div class="logo">
                    <a href="index.html"><img src="assets/recursos/logo1.png"></a>
                </div>

                <!-- Menú de la derecha -->
                <div class="menu-right">
                    <!-- Enlaces: Blog y Contáctanos -->
                    <nav>
                        <!-- Lista de enlaces -->
                        <ul>
                            <!-- Enlace al blog -->
                            <li><a href="blog.html">Blog</a></li>

                            <!-- Enlace a contacto -->
                            <li><a href="contactUs.html">Contáctanos</a></li>
                        </ul>
                    </nav>

                    <!-- Botones: búsqueda y perfil o sesión -->
                    <div class="actions">
                        <!-- Botón de búsqueda -->
                        <a href="#" aria-label="Buscar" @click.prevent="openSearch"><i class="fa-solid fa-magnifying-glass"></i></a>

                        <!-- Icono de perfil: abre el login (solo sin sesión) -->
                        <a v-if="!ui.user" href="#" aria-label="Perfil" @click.prevent="openLogin"><i class="fa-solid fa-circle-user"></i></a>

                        <!-- Con sesión: saludo, acceso al panel (solo administrador) y cerrar sesión -->
                        <template v-else>
                            <!-- Saludo con el nombre del usuario -->
                            <span class="user-greeting">Hola, {{ ui.user.nombre }}</span>

                            <!-- Enlace al panel de administración (solo administrador) -->
                            <a v-if="ui.user.idRol === 1" href="/admin" class="user-panel-link" aria-label="Ir al panel de administración" title="Panel de administración"><i class="fa-solid fa-gauge"></i></a>

                            <!-- Botón para cerrar sesión -->
                            <a href="#" aria-label="Cerrar sesión" title="Cerrar sesión" @click.prevent="logout"><i class="fa-solid fa-right-from-bracket"></i></a>
                        </template>
                    </div>
                </div>
            </div>

            <!-- Onda decorativa debajo del encabezado -->
            <div class="header-wave-divider"></div>
        </header>`,

    // Estado: referencia al estado de la interfaz (incluye el usuario con sesión iniciada)
    data() {
        return { ui: uiStore };
    },

    computed: {
        // Indica si la página actual es la portada (para usar anclas internas en los enlaces)
        onHomePage() {
            return location.pathname.endsWith("index.html") || location.pathname.endsWith("/");
        },

        // Enlace de "Inicio": ancla interna en la portada, o index.html desde otras páginas
        homeLink() {
            return this.onHomePage ? "#home-section" : "index.html";
        },

        // Enlace de "Productos": ancla de la sección de productos de la portada
        productsLink() {
            return this.onHomePage ? "#products-section" : "index.html#products-section";
        }
    },

    methods: {
        // Abre la ventana de búsqueda
        openSearch() {
            uiStore.searchOpen = true;
        },

        // Abre la ventana de acceso en la vista de inicio de sesión
        openLogin() {
            uiStore.authView = "login";
            uiStore.authOpen = true;
        },

        // Cierra la sesión en el servidor y quita el usuario de la interfaz
        async logout() {
            try {
                await fetch("/api/auth/logout", { method: "POST" });
            } finally {
                uiStore.user = null;
            }
        }
    },

    // Al cargar la página, consulta al servidor si ya hay una sesión iniciada para mostrar el nombre
    async mounted() {
        try {
            const response = await fetch("/api/auth/me");
            if (response.ok) uiStore.user = (await response.json()).user;
        } catch (error) {
            uiStore.user = null;
        }
    }
};
