// cuenta.js — página Mi cuenta: datos de la cuenta y cambio de contraseña
if (document.querySelector("#cuenta-app")) {
    Vue.createApp({
        // Estado: sesión compartida, campos, mensajes y avance del envío
        data() {
            return { ui: uiStore, current: "", password: "", confirm: "", error: "", success: "", sending: false, rules: PASSWORD_RULES_TEXT };
        },

        methods: {
            // Valida las contraseñas y pide a la API el cambio
            async submit() {
                this.error = "";
                this.success = "";
                const problem = passwordProblemClient(this.password);
                if (problem) {
                    this.error = problem;
                    return;
                }
                if (this.password !== this.confirm) {
                    this.error = "Las contraseñas nuevas no coinciden.";
                    return;
                }

                this.sending = true;
                const { ok, data } = await postJson("/api/auth/change-password", { currentPassword: this.current, newPassword: this.password });
                this.sending = false;

                if (!ok) {
                    this.error = data?.statusMessage || "No pudimos cambiar la contraseña. Intenta de nuevo.";
                    return;
                }
                this.success = data.message;
                this.current = this.password = this.confirm = "";
            },

            // Abre la ventana de inicio de sesión
            openLogin() {
                uiStore.authView = "login";
                uiStore.authOpen = true;
            },

            // Cierra la sesión en el servidor y vuelve a la portada
            async logout() {
                await postJson("/api/auth/logout");
                uiStore.user = null;
                location.href = "index.html";
            }
        }
    }).mount("#cuenta-app");
}
