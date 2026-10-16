// pago-resultado.js — página a la que vuelve el cliente después de pagar con Mercado Pago

// Mensajes según el resultado del pago (llega en la dirección: ?resultado=exito, fallo o pendiente)
const PAGO_MENSAJES = {
    exito: {
        icono: "fa-solid fa-circle-check",
        titulo: "¡Pago recibido!",
        mensaje: "Gracias por tu compra. Ya estamos preparando tu pedido con mucho amor."
    },
    fallo: {
        icono: "fa-solid fa-circle-xmark",
        titulo: "No se pudo completar el pago",
        mensaje: "Tu pedido quedó registrado, pero el pago no se realizó. Puedes volver a la tienda y hacer tu pedido de nuevo."
    },
    pendiente: {
        icono: "fa-solid fa-clock",
        titulo: "Pago en proceso",
        mensaje: "Mercado Pago está confirmando tu pago. Tu pedido quedará aprobado cuando termine."
    }
};

// Resultado que corresponde a cada estado de pago que devuelve el backend
const ESTADO_A_RESULTADO = { Aprobado: "exito", Rechazado: "fallo", Expirado: "fallo", Cancelado: "fallo", "En proceso": "pendiente" };

if (document.querySelector("#pago-app")) {
    Vue.createApp({
        // Estado: el resultado que viene en la dirección de la página
        data() {
            return { resultado: new URLSearchParams(location.search).get("resultado") };
        },

        computed: {
            // Mensaje que se muestra; si el resultado no se reconoce, se usa el de "pendiente"
            detalle() {
                return PAGO_MENSAJES[this.resultado] || PAGO_MENSAJES.pendiente;
            }
        },

        // Al cargar, pide al backend el estado real del pedido (el pedido y su código vienen en la dirección de regreso) y lo muestra
        async mounted() {
            const params = new URLSearchParams(location.search);
            const orderId = Number(params.get("pedido"));
            const token = params.get("t");
            if (!Number.isInteger(orderId) || orderId < 1 || !token) return;

            const { ok, data } = await postJson("/api/payments/confirm", { orderId, token });
            if (ok && ESTADO_A_RESULTADO[data.status]) this.resultado = ESTADO_A_RESULTADO[data.status];
        }
    }).mount("#pago-app");
}
