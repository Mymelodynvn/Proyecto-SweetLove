// cart-drawer.js — carrito lateral (drawer) y botón flotante del carrito
const CartDrawer = {
    template: `
        <!-- Carrito lateral: se abre y se cierra con ui.drawerOpen -->
        <div class="cart-drawer" :class="{ 'cart-drawer--open': ui.drawerOpen }" :aria-hidden="String(!ui.drawerOpen)">
            <!-- Fondo oscuro: al pulsarlo se cierra el carrito -->
            <div class="cart-drawer__overlay" @click="closeDrawer"></div>

            <!-- Panel del carrito -->
            <aside class="cart-drawer__panel" role="dialog" aria-label="Carrito de compras">
                <!-- Título y botón de cerrar -->
                <div class="cart-drawer__header">
                    <!-- Título -->
                    <h2>Tu carrito</h2>

                    <!-- Botón para cerrar el carrito -->
                    <button class="cart-drawer__close" @click="closeDrawer" aria-label="Cerrar carrito"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <!-- Lista de productos del carrito -->
                <div class="cart-drawer__items">
                    <!-- Mensaje cuando el carrito está vacío -->
                    <p v-if="cart.count === 0" class="cart-drawer__empty">Aún no has añadido productos a tu carrito.</p>

                    <!-- Un producto del carrito -->
                    <article v-for="cartItem in cart.items" :key="cartItem.id" class="cart-drawer__item">
                        <!-- Imagen del producto -->
                        <img :src="cartItem.image" :alt="cartItem.name" class="cart-thumb">

                        <!-- Nombre del producto y cantidad -->
                        <div class="cart-drawer__item-info">
                            <!-- Nombre del producto -->
                            <h3 class="prod-name">{{ cartItem.name }}</h3>

                            <!-- Botones para cambiar la cantidad -->
                            <div class="qty">
                                <!-- Quitar una unidad -->
                                <button class="qty-btn" @click="cart.changeQuantity(cartItem.id, -1)" aria-label="Quitar uno"><i class="fa-solid fa-minus"></i></button>

                                <!-- Cantidad actual -->
                                <span class="qty-value">{{ cartItem.quantity }}</span>

                                <!-- Agregar una unidad -->
                                <button class="qty-btn" @click="cart.changeQuantity(cartItem.id, 1)" aria-label="Agregar uno"><i class="fa-solid fa-plus"></i></button>
                            </div>
                        </div>

                        <!-- Subtotal del producto y botón de eliminar -->
                        <div class="cart-drawer__item-side">
                            <!-- Subtotal del producto (precio por cantidad) -->
                            <span class="cart-drawer__item-subtotal">{{ formatPrice(cartItem.price * cartItem.quantity) }}</span>

                            <!-- Eliminar el producto del carrito -->
                            <button class="cart-drawer__item-remove" @click="cart.removeItem(cartItem.id)" aria-label="Eliminar producto"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </article>
                </div>

                <!-- Resumen del pedido: subtotal, IVA, total y botones -->
                <div class="cart-drawer__summary">
                    <!-- Subtotal -->
                    <div class="summary-row">
                        <span>Subtotal</span>

                        <span>{{ formatPrice(cart.subtotal) }}</span>
                    </div>

                    <!-- IVA -->
                    <div class="summary-row">
                        <span>IVA (19%)</span>

                        <span>{{ formatPrice(cart.tax) }}</span>
                    </div>

                    <!-- Total a pagar -->
                    <div class="summary-row summary-row--total">
                        <span>Total</span>

                        <span class="total-value">{{ formatPrice(cart.total) }}</span>
                    </div>

                    <!-- Botón que lleva a la página de finalizar pedido -->
                    <a href="checkout.html" class="btn-checkout">Finalizar pedido</a>

                    <!-- Enlace al carrito completo -->
                    <a href="cart.html" class="btn-continue">Ver carrito completo</a>
                </div>
            </aside>
        </div>

        <!-- Botón flotante que abre el carrito -->
        <div class="cart-button-trigger" role="button" tabindex="0" aria-label="Abrir carrito" @click="openDrawer" @keydown.enter="openDrawer">
            <i class="fa-solid fa-bag-shopping"></i>

            <!-- Insignia con la cantidad de productos -->
            <span v-if="cart.count > 0" :key="cart.count" class="cart-button-trigger__badge cart-button-trigger__badge--pop">{{ cart.count }}</span>
        </div>`,

    // Estado: carrito compartido (cartStore) y estado de la interfaz (uiStore)
    data() {
        return { cart: cartStore, ui: uiStore };
    },

    methods: {
        formatPrice,

        // Abre el panel lateral del carrito
        openDrawer() {
            uiStore.drawerOpen = true;
        },

        // Cierra el panel lateral del carrito
        closeDrawer() {
            uiStore.drawerOpen = false;
        }
    },

    // Al montar el componente, permite cerrar el carrito con la tecla Escape
    mounted() {
        document.addEventListener("keydown", (keyEvent) => {
            if (keyEvent.key === "Escape") {
                this.closeDrawer();
            }
        });
    }
};
