// verificar.js — página que verifica el correo con el enlace del correo de registro
if (document.querySelector("#verificar-app")) {
    Vue.createApp({
        // Estado: avance de la verificación (cargando, ok o error) y su mensaje
        data() {
            return { state: "loading", message: "Verificando tu correo..." };
        },

        computed: {
            // Icono según el estado
            icon() {
                if (this.state === "ok") return "fa-solid fa-circle-check";
                if (this.state === "error") return "fa-solid fa-circle-xmark";
                return "fa-solid fa-spinner fa-spin";
            }
        },

        // Al cargar la página envía el token de la dirección a la API
        async mounted() {
            const token = new URLSearchParams(location.search).get("token");
            if (!token) {
                this.state = "error";
                this.message = "Este enlace no es válido.";
                return;
            }

            const { ok, data } = await postJson("/api/auth/verify-email", { token });
            this.state = ok ? "ok" : "error";
            this.message = ok ? data.message : data?.statusMessage || "No pudimos verificar tu correo.";
        },

        methods: {
            // Abre la ventana de inicio de sesión
            openLogin() {
                uiStore.authView = "login";
                uiStore.authOpen = true;
            }
        }
    }).mount("#verificar-app");
}
