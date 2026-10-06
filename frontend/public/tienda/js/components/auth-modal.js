/**
 * auth-modal.js — ventana de acceso (iniciar sesión y registrarse).
 * Se comunica con la API (/api/auth/login y /api/auth/register). La sesión real
 * queda en una cookie httpOnly del servidor.
 */
const AuthModal = {
    template: `
        <div class="auth-modal" :class="{ 'auth-modal--open': ui.authOpen }" :aria-hidden="String(!ui.authOpen)">
            <div class="auth-modal__overlay" @click="closeAuth"></div>

            <div v-if="ui.authView === 'login'" class="auth-modal__panel" role="dialog" aria-label="Iniciar sesión">
                <button class="auth-modal__close" @click="closeAuth" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>

                <img src="assets/recursos/logo1.png" alt="Sweet Love" class="auth-modal__logo">

                <h2>Iniciar Sesión</h2>

                <p class="form__subtitle">Nos alegra verte otra vez</p>

                <form @submit.prevent="submitLogin">
                    <div class="auth-modal__field">
                        <i class="fa-solid fa-envelope"></i>

                        <input type="email" placeholder="Correo Electrónico" autocomplete="email" v-model.trim="loginForm.email" required>
                    </div>

                    <div class="auth-modal__field">
                        <i class="fa-solid fa-lock"></i>

                        <input :type="showLoginPassword ? 'text' : 'password'" placeholder="Contraseña" autocomplete="current-password" v-model="loginForm.password" required>

                        <button type="button" class="auth-modal__toggle-password" @click="showLoginPassword = !showLoginPassword" aria-label="Mostrar contraseña"><i :class="showLoginPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i></button>
                    </div>

                    <a href="#" class="auth-modal__forgot" @click.prevent>¿Olvidaste tu contraseña?</a>

                    <button type="submit" class="btn__form auth-modal__submit">Ingresar</button>
                </form>

                <p v-if="loginMessage" class="form__subtitle">{{ loginMessage }}</p>

                <p class="form__switch">¿Aún no tienes una cuenta? <a href="#" @click.prevent="ui.authView = 'register'">Regístrate</a></p>
            </div>

            <div v-else class="auth-modal__panel" role="dialog" aria-label="Registrarse">
                <button class="auth-modal__close" @click="closeAuth" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>

                <img src="assets/recursos/logo1.png" alt="Sweet Love" class="auth-modal__logo">

                <h2>Registrarse</h2>

                <p class="form__subtitle">Solo te tomará un minuto</p>

                <form @submit.prevent="submitRegister">
                    <div class="auth-modal__field">
                        <i class="fa-solid fa-user"></i>

                        <input type="text" placeholder="Nombre Completo" autocomplete="name" v-model.trim="registerForm.fullName" required>
                    </div>

                    <div class="auth-modal__field">
                        <i class="fa-solid fa-envelope"></i>

                        <input type="email" placeholder="Correo Electrónico" autocomplete="email" v-model.trim="registerForm.email" required>
                    </div>

                    <div class="auth-modal__field">
                        <i class="fa-solid fa-circle-user"></i>

                        <input type="text" placeholder="Nombre de Usuario" autocomplete="username" v-model.trim="registerForm.username" required>
                    </div>

                    <div class="auth-modal__field">
                        <i class="fa-solid fa-lock"></i>

                        <input :type="showRegisterPassword ? 'text' : 'password'" placeholder="Contraseña" autocomplete="new-password" v-model="registerForm.password" required>

                        <button type="button" class="auth-modal__toggle-password" @click="showRegisterPassword = !showRegisterPassword" aria-label="Mostrar contraseña"><i :class="showRegisterPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i></button>
                    </div>

                    <button type="submit" class="btn__form auth-modal__submit">Registrarme</button>
                </form>

                <p v-if="registerMessage" class="form__subtitle">{{ registerMessage }}</p>

                <p class="form__switch">¿Ya tienes una cuenta? <a href="#" @click.prevent="ui.authView = 'login'">Inicia sesión</a></p>
            </div>
        </div>`,

    /** Estado: vista activa, visibilidad de contraseñas, mensajes y datos de los formularios. */
    data() {
        return {
            ui: uiStore,
            showLoginPassword: false,
            showRegisterPassword: false,
            loginMessage: "",
            registerMessage: "",
            loginForm: { email: "", password: "" },
            registerForm: { fullName: "", email: "", username: "", password: "" }
        };
    },

    methods: {
        /**
         * Envía el correo y la contraseña a la API y muestra el resultado.
         * Si es correcto, deja el usuario en uiStore (el encabezado muestra su nombre) y cierra la ventana.
         */
        async submitLogin() {
            this.loginMessage = "";
            try {
                const response = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(this.loginForm)
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data?.statusMessage || "No fue posible iniciar sesión.");
                uiStore.user = data.user; // la sesión real es la cookie del servidor; esto solo actualiza la pantalla
                this.loginMessage = `Bienvenida, ${data.user.nombre}.`;
                setTimeout(() => this.closeAuth(), 700);
            } catch (error) {
                this.loginMessage = error.message || "No fue posible iniciar sesión.";
            }
        },

        /**
         * Envía los datos de registro a la API.
         * Si se crea la cuenta, cambia a la vista de inicio de sesión con el correo ya escrito.
         */
        async submitRegister() {
            this.registerMessage = "";
            try {
                const response = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        fullName: this.registerForm.fullName,
                        email: this.registerForm.email,
                        password: this.registerForm.password
                    })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data?.statusMessage || "No fue posible crear la cuenta.");
                this.registerMessage = data.message;
                this.ui.authView = "login";
                this.loginForm.email = this.registerForm.email;
                this.loginForm.password = "";
            } catch (error) {
                this.registerMessage = error.message || "No fue posible crear la cuenta.";
            }
        },

        /** Cierra la ventana de acceso. */
        closeAuth() {
            uiStore.authOpen = false;
        }
    },

    /** Al montar el componente, permite cerrar la ventana con la tecla Escape. */
    mounted() {
        document.addEventListener("keydown", (keyEvent) => {
            if (keyEvent.key === "Escape") {
                this.closeAuth();
            }
        });
    }
};
