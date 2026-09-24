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

                        <!-- Si NO hay usuario autenticado -->
                        <a v-if="!user" href="#" aria-label="Perfil" @click.prevent="openLogin" title="Iniciar Sesión">
                            <i class="fa-solid fa-circle-user"></i>
                        </a>

                        <!-- Si SÍ hay usuario autenticado: Insignia estilizada -->
                        <div v-else class="user-badge">
                            <span class="user-badge__name">
                                <i class="fa-solid fa-circle-user"></i> {{ user.nombre }}
                            </span>
                            <button @click.prevent="logout" class="user-badge__logout" title="Cerrar Sesión">
                                <i class="fa-solid fa-right-from-bracket"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="header-wave-divider"></div>
        </header>`,

    data() {
        return {
            user: null
        };
    },

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
        },

        logout() {
            localStorage.removeItem('sweet_love_user');
            this.user = null;
            window.location.reload();
        }
    },

    mounted() {
        const savedUser = localStorage.getItem('sweet_love_user');
        if (savedUser) {
            try {
                this.user = JSON.parse(savedUser);
            } catch (error) {
                console.error("Error al leer la sesión de localStorage:", error);
            }
        }
    }
};