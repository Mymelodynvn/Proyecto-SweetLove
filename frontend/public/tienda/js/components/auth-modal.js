// auth-modal.js — ventana de acceso (iniciar sesión, registrarse y recuperar la contraseña)

// Reglas de contraseña que se muestran en los formularios (el servidor las vuelve a comprobar)
const PASSWORD_RULES_TEXT = "De 8 a 16 caracteres, sin espacios ni los caracteres < o >, con al menos una letra y un número.";

// Devuelve el problema de un correo (texto) o una cadena vacía si es válido: sin espacios y con forma de correo, recibe email
const emailProblemClient = (email) => {
    if (/\s/.test(email)) return "El correo no puede tener espacios.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Escribe un correo válido, por ejemplo tucorreo@ejemplo.com.";
    if (email.length > 100) return "El correo admite máximo 100 caracteres.";
    return "";
};

// Devuelve el problema de una contraseña (texto) o una cadena vacía si cumple las reglas básicas, recibe password
const passwordProblemClient = (password) => {
    if (/\s/.test(password)) return "La contraseña no puede tener espacios.";
    if (/[<>]/.test(password)) return "La contraseña no puede tener los caracteres < ni >.";
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    if (password.length > 16) return "La contraseña admite máximo 16 caracteres.";
    if (!/\p{L}/u.test(password) || !/\d/.test(password)) return "La contraseña debe tener al menos una letra y un número.";
    return "";
};

// Envía un JSON por POST a la API y devuelve { ok, status, data } sin lanzar errores de red, recibe path, body
const postJson = async (path, body = {}) => {
    try {
        const response = await fetch(path, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        return { ok: response.ok, status: response.status, data: await response.json().catch(() => ({})) };
    } catch (error) {
        return { ok: false, status: 0, data: { statusMessage: "No pudimos conectar con el servidor. Intenta de nuevo." } };
    }
};

const AuthModal = {
    template: `
        <!-- Ventana de login y registro: se abre y se cierra con ui.authOpen -->
        <div class="auth-modal" :class="{ 'auth-modal--open': ui.authOpen }" :aria-hidden="String(!ui.authOpen)">
            <!-- Fondo oscuro: al pulsarlo se cierra la ventana -->
            <div class="auth-modal__overlay" @click="closeAuth"></div>

            <!-- Panel de inicio de sesión -->
            <div v-if="ui.authView === 'login'" class="auth-modal__panel" role="dialog" aria-label="Iniciar sesión">
                <!-- Botón para cerrar la ventana -->
                <button class="auth-modal__close" @click="closeAuth" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>

                <!-- Logo -->
                <img src="assets/recursos/logo1.png" alt="Sweet Love" class="auth-modal__logo">

                <!-- Título -->
                <h2>Iniciar Sesión</h2>

                <!-- Subtítulo -->
                <p class="form__subtitle">Nos alegra verte otra vez</p>

                <!-- Formulario de login: envía el correo y la contraseña a la API -->
                <form @submit.prevent="submitLogin">
                    <!-- Campo: correo electrónico -->
                    <div class="auth-modal__field">
                        <i class="fa-solid fa-envelope"></i>

                        <input type="email" placeholder="Correo Electrónico" autocomplete="email" v-model="loginForm.email" @keydown.space.prevent required>
                    </div>

                    <!-- Campo: contraseña, con botón para mostrarla u ocultarla -->
                    <div class="auth-modal__field">
                        <i class="fa-solid fa-lock"></i>

                        <input :type="showLoginPassword ? 'text' : 'password'" placeholder="Contraseña" autocomplete="current-password" v-model="loginForm.password" required>

                        <!-- Botón para mostrar u ocultar la contraseña -->
                        <button type="button" class="auth-modal__toggle-password" @click="showLoginPassword = !showLoginPassword" aria-label="Mostrar contraseña"><i :class="showLoginPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i></button>
                    </div>

                    <!-- Enlace que abre la recuperación de contraseña -->
                    <a href="#" class="auth-modal__forgot" @click.prevent="openForgot">¿Olvidaste tu contraseña?</a>

                    <!-- Botón para ingresar -->
                    <button type="submit" class="btn__form auth-modal__submit">Ingresar</button>
                </form>

                <!-- Mensaje con el resultado del login -->
                <p v-if="loginMessage" class="form__subtitle">{{ loginMessage }}</p>

                <!-- Enlace para pedir otra vez el correo de verificación (solo si la cuenta está sin verificar) -->
                <p v-if="needsVerification" class="form__switch"><a href="#" @click.prevent="resendVerification">Reenviar correo de verificación</a></p>

                <!-- Enlace para pasar al registro -->
                <p class="form__switch">¿Aún no tienes una cuenta? <a href="#" @click.prevent="ui.authView = 'register'">Regístrate</a></p>
            </div>

            <!-- Panel de registro -->
            <div v-else-if="ui.authView === 'register'" class="auth-modal__panel" role="dialog" aria-label="Registrarse">
                <!-- Botón para cerrar la ventana -->
                <button class="auth-modal__close" @click="closeAuth" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>

                <!-- Logo -->
                <img src="assets/recursos/logo1.png" alt="Sweet Love" class="auth-modal__logo">

                <!-- Título -->
                <h2>Registrarse</h2>

                <!-- Subtítulo -->
                <p class="form__subtitle">Solo te tomará un minuto</p>

                <!-- Formulario de registro: envía nombre, correo y contraseña a la API -->
                <form @submit.prevent="submitRegister">
                    <!-- Campo: nombre completo -->
                    <div class="auth-modal__field">
                        <i class="fa-solid fa-user"></i>

                        <input type="text" placeholder="Nombre Completo" autocomplete="name" v-model.trim="registerForm.fullName" required>
                    </div>

                    <!-- Campo: correo electrónico -->
                    <div class="auth-modal__field">
                        <i class="fa-solid fa-envelope"></i>

                        <input type="email" placeholder="Correo Electrónico" autocomplete="email" v-model="registerForm.email" @keydown.space.prevent required>
                    </div>

                    <!-- Campo: contraseña, con botón para mostrarla u ocultarla -->
                    <div class="auth-modal__field">
                        <i class="fa-solid fa-lock"></i>

                        <input :type="showRegisterPassword ? 'text' : 'password'" placeholder="Contraseña" autocomplete="new-password" v-model="registerForm.password" @keydown.space.prevent required>

                        <!-- Botón para mostrar u ocultar la contraseña -->
                        <button type="button" class="auth-modal__toggle-password" @click="showRegisterPassword = !showRegisterPassword" aria-label="Mostrar contraseña"><i :class="showRegisterPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i></button>
                    </div>

                    <!-- Reglas de la contraseña -->
                    <p class="auth-modal__hint">{{ passwordRules }}</p>

                    <!-- Botón para registrarse -->
                    <button type="submit" class="btn__form auth-modal__submit" :disabled="busy">Registrarme</button>
                </form>

                <!-- Mensaje con el resultado del registro -->
                <p v-if="registerMessage" class="form__subtitle">{{ registerMessage }}</p>

                <!-- Enlace para volver al login -->
                <p class="form__switch">¿Ya tienes una cuenta? <a href="#" @click.prevent="ui.authView = 'login'">Inicia sesión</a></p>
            </div>

            <!-- Panel para recuperar la contraseña -->
            <div v-else class="auth-modal__panel" role="dialog" aria-label="Recuperar contraseña">
                <!-- Botón para cerrar la ventana -->
                <button class="auth-modal__close" @click="closeAuth" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>

                <!-- Logo -->
                <img src="assets/recursos/logo1.png" alt="Sweet Love" class="auth-modal__logo">

                <!-- Título -->
                <h2>Recuperar contraseña</h2>

                <!-- Subtítulo -->
                <p class="form__subtitle">Te enviaremos un enlace para elegir una nueva</p>

                <!-- Formulario de recuperación: envía el correo a la API -->
                <form @submit.prevent="submitForgot">
                    <!-- Campo: correo electrónico -->
                    <div class="auth-modal__field">
                        <i class="fa-solid fa-envelope"></i>

                        <input type="email" placeholder="Correo Electrónico" autocomplete="email" v-model="forgotForm.email" @keydown.space.prevent required>
                    </div>

                    <!-- Botón para enviar el enlace -->
                    <button type="submit" class="btn__form auth-modal__submit" :disabled="busy">Enviar enlace</button>
                </form>

                <!-- Mensaje con el resultado del envío -->
                <p v-if="forgotMessage" class="form__subtitle">{{ forgotMessage }}</p>

                <!-- Enlace para volver al login -->
                <p class="form__switch">¿Ya la recordaste? <a href="#" @click.prevent="ui.authView = 'login'">Inicia sesión</a></p>
            </div>
        </div>`,

    // Estado: vista activa, visibilidad de contraseñas, mensajes y datos de los formularios
    data() {
        return {
            ui: uiStore,
            showLoginPassword: false,
            showRegisterPassword: false,
            loginMessage: "",
            registerMessage: "",
            forgotMessage: "",
            needsVerification: false,
            busy: false,
            passwordRules: PASSWORD_RULES_TEXT,
            loginForm: { email: "", password: "" },
            registerForm: { fullName: "", email: "", password: "" },
            forgotForm: { email: "" }
        };
    },

    methods: {
        // Envía el correo y la contraseña a la API y muestra el resultado
        async submitLogin() {
            this.loginMessage = "";
            this.needsVerification = false;
            const emailProblem = emailProblemClient(this.loginForm.email);
            if (emailProblem) {
                this.loginMessage = emailProblem;
                return;
            }
            const { ok, data } = await postJson("/api/auth/login", this.loginForm);
            if (!ok) {
                // Con el código EMAIL_NOT_VERIFIED se ofrece reenviar el correo de verificación
                this.needsVerification = data?.code === "EMAIL_NOT_VERIFIED";
                this.loginMessage = data?.statusMessage || "No fue posible iniciar sesión.";
                return;
            }
            uiStore.user = data.user; // la sesión real es la cookie del servidor; esto solo actualiza la pantalla
            this.loginMessage = `Hola, ${data.user.nombre}.`;
            setTimeout(() => this.closeAuth(), 700);
        },

        // Valida la contraseña y envía los datos de registro a la API; al terminar vuelve al login con el aviso
        async submitRegister() {
            this.registerMessage = "";
            const problem = emailProblemClient(this.registerForm.email) || passwordProblemClient(this.registerForm.password);
            if (problem) {
                this.registerMessage = problem;
                return;
            }

            this.busy = true;
            const { ok, data } = await postJson("/api/auth/register", { ...this.registerForm });
            this.busy = false;
            if (!ok) {
                this.registerMessage = data?.statusMessage || "No fue posible crear la cuenta.";
                return;
            }

            this.ui.authView = "login";
            this.loginForm.email = this.registerForm.email;
            this.loginForm.password = "";
            this.loginMessage = data.message;
            this.needsVerification = Boolean(data.needsVerification);
        },

        // Abre la vista de recuperación con el correo ya escrito en el login
        openForgot() {
            this.forgotForm.email = this.loginForm.email;
            this.forgotMessage = "";
            this.ui.authView = "forgot";
        },

        // Pide a la API el enlace para restablecer la contraseña y muestra su respuesta
        async submitForgot() {
            this.forgotMessage = emailProblemClient(this.forgotForm.email);
            if (this.forgotMessage) return;
            this.busy = true;
            const { ok, data } = await postJson("/api/auth/forgot-password", this.forgotForm);
            this.busy = false;
            this.forgotMessage = ok ? data.message : data?.statusMessage || "No pudimos enviar el enlace. Intenta de nuevo.";
        },

        // Pide otra vez el correo de verificación para el correo escrito en el login
        async resendVerification() {
            const { ok, data } = await postJson("/api/auth/resend-verification", { email: this.loginForm.email });
            this.loginMessage = ok ? data.message : data?.statusMessage || "No pudimos enviar el correo. Intenta de nuevo.";
        },

        // Cierra la ventana de acceso
        closeAuth() {
            uiStore.authOpen = false;
        }
    },

    // Al montar el componente, permite cerrar la ventana con la tecla Escape
    mounted() {
        document.addEventListener("keydown", (keyEvent) => {
            if (keyEvent.key === "Escape") {
                this.closeAuth();
            }
        });
    }
};
