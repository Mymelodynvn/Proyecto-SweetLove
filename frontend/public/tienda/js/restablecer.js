// restablecer.js — página donde la persona elige su contraseña nueva con el enlace del correo
if (document.querySelector("#restablecer-app")) {
    Vue.createApp({
        // Estado: token de la dirección, campos, errores y avance del envío
        data() {
            return {
                token: new URLSearchParams(location.search).get("token") || "",
                password: "",
                confirm: "",
                error: "",
                sending: false,
                done: false,
                doneMessage: "",
                rules: PASSWORD_RULES_TEXT
            };
        },

        methods: {
            // Valida las contraseñas y las envía a la API junto con el token
            async submit() {
                this.error = "";
                const problem = passwordProblemClient(this.password);
                if (problem) {
                    this.error = problem;
                    return;
                }
                if (this.password !== this.confirm) {
                    this.error = "Las contraseñas no coinciden.";
                    return;
                }

                this.sending = true;
                const { ok, data } = await postJson("/api/auth/reset-password", { token: this.token, password: this.password });
                this.sending = false;

                if (!ok) {
                    this.error = data?.statusMessage || "No pudimos cambiar la contraseña. Intenta de nuevo.";
                    return;
                }
                this.done = true;
                this.doneMessage = data.message;
            },

            // Abre la ventana de inicio de sesión
            openLogin() {
                uiStore.authView = "login";
                uiStore.authOpen = true;
            }
        }
    }).mount("#restablecer-app");
}
