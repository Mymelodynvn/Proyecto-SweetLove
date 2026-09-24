/**
 * Sweet Love: archivo documentado en español.
 * Responsabilidad: contiene la lógica correspondiente a su nombre y ubicación.
 */
/**
 * Envía el carrito completo a la API para crear un solo pedido.
 *
 * El modelo de datos normalizado permite que un pedido tenga varias líneas
 * en la tabla itempedido. Por eso todos los productos del carrito se envían
 * en un único registro de pedido.
 */
const createOrder = async (customer, paymentMethod = 'Pendiente') => {
    const items = cartStore.items.map((item) => ({
        productId: Number(item.id),
        quantity: Number(item.quantity)
    }));

    if (items.length === 0) {
        throw new Error('El carrito está vacío.');
    }

    const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...customer,
            items,
            paymentMethod
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.statusMessage || 'No se pudo registrar el pedido.');
    }

    const result = await response.json();

    // Vacía el carrito solamente después de confirmar que la API creó el pedido.
    cartStore.items = [];
    cartStore.persist();

    return result;
};


// Conecta el formulario visual con la función que registra el pedido.
const checkoutForm = document.querySelector("#checkout-form");
if (checkoutForm) {
    const itemsLabel = document.querySelector("#checkout-items");
    const totalLabel = document.querySelector("#checkout-total");
    const messageLabel = document.querySelector("#checkout-message");

    itemsLabel.textContent = cartStore.items.length
        ? cartStore.items.map((item) => `${item.name} x${item.quantity}`).join(", ")
        : "El carrito está vacío.";
    totalLabel.textContent = `Total: ${formatPrice(cartStore.total)}`;

    checkoutForm.addEventListener("submit", async (submitEvent) => {
        submitEvent.preventDefault();
        messageLabel.hidden = false;
        messageLabel.className = "checkout-message";
        messageLabel.textContent = "Registrando pedido...";

        try {
            const formData = new FormData(checkoutForm);
            const customer = Object.fromEntries(formData.entries());
            const result = await createOrder(customer, customer.paymentMethod);
            messageLabel.className = "checkout-message success";
            messageLabel.textContent = `Pedido #SL${String(result.idPedido).padStart(4, "0")} registrado correctamente.`;
            checkoutForm.reset();
            itemsLabel.textContent = "El pedido fue registrado.";
            totalLabel.textContent = "Total enviado: " + formatPrice(result.total);
        } catch (error) {
            messageLabel.className = "checkout-message error";
            messageLabel.textContent = error.message;
        }
    });
}
