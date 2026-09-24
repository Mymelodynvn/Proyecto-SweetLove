/**
 * Archivo del proyecto Sweet Love.
 * Propósito: contiene la lógica correspondiente al módulo indicado por su nombre.
 * Los comentarios y nombres de funciones mantienen la intención del código en español.
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

                <form @submit.prevent="handleLogin">
                    <div class="auth-modal__field">
                        <i class="fa-solid fa-envelope"></i>
                        <input type="email" placeholder="Correo Electrónico" autocomplete="email" v-model.trim="loginForm.email" required>
                    </div>

                    <div class="auth-modal__field">
                        <i class="fa-solid fa-lock"></i>
                        <input :type="showLoginPassword ? 'text' : 'password'" placeholder="Contraseña" autocomplete="current-password" v-model="loginForm.password" required>
                        <button type="button" class="auth-modal__toggle-password" @click="showLoginPassword = !showLoginPassword" aria-label="Mostrar contraseña">
                            <i :class="showLoginPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
                        </button>
                    </div>

                    <a href="#" class="auth-modal__forgot" @click.prevent>¿Olvidaste tu contraseña?</a>

                    <button type="submit" class="btn__form auth-modal__submit">Ingresar</button>
                </form>

                <p class="form__switch">¿Aún no tienes una cuenta? <a href="#" @click.prevent="ui.authView = 'register'">Regístrate</a></p>
            </div>

            <div v-else class="auth-modal__panel" role="dialog" aria-label="Registrarse">
                <button class="auth-modal__close" @click="closeAuth" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>

                <img src="assets/recursos/logo1.png" alt="Sweet Love" class="auth-modal__logo">

                <h2>Registrarse</h2>

                <p class="form__subtitle">Solo te tomará un minuto</p>

                <form @submit.prevent="handleRegister">
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
                        <button type="button" class="auth-modal__toggle-password" @click="showRegisterPassword = !showRegisterPassword" aria-label="Mostrar contraseña">
                            <i :class="showRegisterPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
                        </button>
                    </div>

                    <button type="submit" class="btn__form auth-modal__submit">Registrarme</button>
                </form>

                <p class="form__switch">¿Ya tienes una cuenta? <a href="#" @click.prevent="ui.authView = 'login'">Inicia sesión</a></p>
            </div>
        </div>`,

    data() {
        return {
            ui: uiStore,
            showLoginPassword: false,
            showRegisterPassword: false,
            loginForm: { email: "", password: "" },
            registerForm: { fullName: "", email: "", username: "", password: "" }
        };
    },

    methods: {
        closeAuth() {
            uiStore.authOpen = false;
        },

        async handleLogin() {
            try {
                const response = await fetch('http://127.0.0.1:3000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: this.loginForm.email,
                        password: this.loginForm.password
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.statusMessage || 'Error al iniciar sesión');
                }

                // Guardar la sesión en el almacenamiento local del navegador
                const user = data.user || data;
                localStorage.setItem('sweet_love_user', JSON.stringify(user));

                alert(`¡Bienvenid@ ${user.nombre || ''}!`);
                this.closeAuth();

                // Redirigir al panel admin si es idRol = 1 o recargar si es cliente
                if (user.idRol === 1) {
                    window.location.href = 'http://127.0.0.1:3000/admin';
                } else {
                    window.location.reload();
                }
            } catch (error) {
                alert(error.message);
            }
        },

        async handleRegister() {
            try {
                const response = await fetch('http://127.0.0.1:3000/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nombre: this.registerForm.fullName,
                        email: this.registerForm.email,
                        username: this.registerForm.username,
                        contrasena: this.registerForm.password
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.statusMessage || 'Error al registrar usuario');
                }

                alert('¡Registro exitoso! Ya puedes iniciar sesión.');
                this.ui.authView = 'login';
            } catch (error) {
                alert(error.message);
            }
        }
    },

    mounted() {
        document.addEventListener("keydown", (keyEvent) => {
            if (keyEvent.key === "Escape") {
                this.closeAuth();
            }
        });
    }
};