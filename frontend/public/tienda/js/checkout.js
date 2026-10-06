// checkout.js — envío del pedido a la API
// Envía el carrito completo a la API para crear un solo pedido
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
