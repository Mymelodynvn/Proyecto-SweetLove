// checkout-page.js — página de finalizar pedido: valida el formulario y crea el pedido con Mercado Pago

// Reglas de cada campo: devuelven el mensaje de error, o una cadena vacía si el valor es válido
const CHECKOUT_RULES = {
    name: (value) => (value.length >= 2 && value.length <= 50 ? "" : "Escribe tu nombre (entre 2 y 50 letras)."),
    lastName: (value) => (value.length >= 2 && value.length <= 50 ? "" : "Escribe tu apellido (entre 2 y 50 letras)."),
    email: (value) => emailProblemClient(value),
    phone: (value) => {
        // Se cuentan solo los dígitos: se aceptan espacios, guiones, paréntesis y el signo +
        const digits = value.replace(/\D/g, "");
        const validChars = /^\+?[\d\s().-]+$/.test(value) && value.length <= 20;
        return validChars && digits.length >= 7 && digits.length <= 10 ? "" : "Escribe un celular válido (entre 7 y 10 números).";
    },
    address: (value) => (value.length >= 6 && value.length <= 150 ? "" : "Escribe la dirección de entrega con la ciudad (entre 6 y 150 caracteres).")
};

// Número de WhatsApp de Sweet Love (con código de país, sin el signo +)
const CHECKOUT_WHATSAPP_NUMBER = "573215771432";

// Mensaje que se envía por WhatsApp cuando el carrito está vacío: pide información de los productos
const CHECKOUT_WHATSAPP_EMPTY_MESSAGE = "Hola, Sweet Love. Quisiera recibir más información sobre sus productos.";

// Arma el mensaje de WhatsApp con el carrito, el total y los datos de entrega que ya se hayan escrito; si el carrito está vacío, pide información, recibe items, total, form
const buildWhatsappMessage = (items, total, form) => {
    if (items.length === 0) return CHECKOUT_WHATSAPP_EMPTY_MESSAGE;

    const lines = ["Hola, Sweet Love. Quiero continuar mi compra por WhatsApp.", "", "Mi pedido:"];
    items.forEach((item) => lines.push(`- ${item.quantity} x ${item.name}: ${formatPrice(item.price * item.quantity)}`));
    lines.push("", `Total: ${formatPrice(total)} (IVA incluido)`);

    const fullName = `${form.name} ${form.lastName}`.trim();
    const details = [];
    if (fullName) details.push(`Nombre: ${fullName}`);
    if (form.phone) details.push(`Celular: ${form.phone}`);
    if (form.address) details.push(`Dirección: ${form.address}`);
    if (details.length > 0) lines.push("", "Mis datos:", ...details);

    return lines.join("\n");
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
                needsLogin: false,
                sending: false,
                placed: null
            };
        },

        computed: {
            // Enlace al chat de WhatsApp con el mensaje del carrito (o el de "más información" si no hay productos)
            whatsappUrl() {
                const message = buildWhatsappMessage(this.cart.items, this.cart.total, this.form);
                return `https://wa.me/${CHECKOUT_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
            }
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

            // Abre la ventana de inicio de sesión (cuando el correo del pedido ya tiene una cuenta)
            openLogin() {
                uiStore.authView = "login";
                uiStore.authOpen = true;
            },

            // Valida el formulario, crea el pedido y lleva al cliente a pagar en Mercado Pago
            async submit() {
                if (this.sending) return;
                this.serverError = "";
                this.needsLogin = false;
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
                    this.needsLogin = error.code === "LOGIN_REQUIRED";
                } finally {
                    this.sending = false;
                }
            }
        }
    }).mount("#checkout-app");
}
