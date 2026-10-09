// checkout-page.js — página de finalizar pedido: valida el formulario y crea el pedido con Mercado Pago

// Reglas de cada campo: devuelven el mensaje de error, o una cadena vacía si el valor es válido
const CHECKOUT_RULES = {
    name: (value) => (value.length >= 2 ? "" : "Escribe tu nombre."),
    lastName: (value) => (value.length >= 2 ? "" : "Escribe tu apellido."),
    email: (value) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Escribe un correo válido, por ejemplo tucorreo@ejemplo.com."),
    phone: (value) => {
        // Se cuentan solo los dígitos: se aceptan espacios, guiones, paréntesis y el signo +
        const digits = value.replace(/\D/g, "");
        return digits.length >= 7 && digits.length <= 15 ? "" : "Escribe un celular válido (entre 7 y 15 números).";
    },
    address: (value) => (value.length >= 6 ? "" : "Escribe la dirección de entrega con la ciudad.")
};

if (document.querySelector("#checkout-app")) {
    Vue.createApp({
        // Estado: carrito y sesión compartidos, datos del formulario, errores y estado del envío
        data() {
            return {
                cart: cartStore,
                ui: uiStore,
                form: { name: "", lastName: "", email: "", phone: "", address: "" },
                errors: {},
                serverError: "",
                sending: false,
                placed: null
            };
        },

        watch: {
            // Si hay sesión iniciada, rellena los datos de la cuenta en los campos que estén vacíos
            "ui.user": {
                immediate: true,
                handler(user) {
                    if (!user) return;
                    if (!this.form.name) this.form.name = user.nombre || "";
                    if (!this.form.lastName) this.form.lastName = (user.apellido || "").trim();
                    if (!this.form.email) this.form.email = user.email || "";
                }
            }
        },

        methods: {
            formatPrice,

            // Valida un solo campo y guarda o quita su mensaje de error, recibe field
            validateField(field) {
                const message = CHECKOUT_RULES[field](this.form[field]);
                if (message) this.errors[field] = message;
                else delete this.errors[field];
                return !message;
            },

            // Valida todos los campos; si alguno falla, pone el cursor en el primero, recibe ninguno
            validateAll() {
                const results = Object.keys(CHECKOUT_RULES).map((field) => this.validateField(field));
                const firstInvalid = Object.keys(CHECKOUT_RULES).find((field) => this.errors[field]);
                if (firstInvalid) {
                    const ids = { name: "name", lastName: "lastname", email: "email", phone: "phone", address: "address" };
                    document.getElementById(`checkout-${ids[firstInvalid]}`)?.focus();
                }
                return results.every(Boolean);
            },

            // Valida el formulario, crea el pedido y lleva al cliente a pagar en Mercado Pago
            async submit() {
                if (this.sending) return;
                this.serverError = "";
                if (!this.validateAll()) return;

                this.sending = true;
                try {
                    const result = await createOrder({ ...this.form }, "Mercado Pago");

                    // Con enlace de pago: se va a Mercado Pago
                    if (result.initPoint) {
                        window.location.href = result.initPoint;
                        return;
                    }

                    // Sin enlace: el pedido quedó registrado pero no se pudo iniciar el pago
                    this.placed = result;
                } catch (error) {
                    // Muestra el motivo real (producto sin stock, producto no disponible, etc.)
                    this.serverError = error.message || "No pudimos registrar tu pedido. Intenta de nuevo.";
                } finally {
                    this.sending = false;
                }
            }
        }
    }).mount("#checkout-app");
}
