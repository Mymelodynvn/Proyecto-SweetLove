/**
 * cart-drawer.js — carrito lateral (drawer) y botón flotante del carrito.
 * Lista los productos, permite cambiar cantidades o quitarlos y muestra subtotal, IVA y total.
 */
const CartDrawer = {
    template: `
        <div class="cart-drawer" :class="{ 'cart-drawer--open': ui.drawerOpen }" :aria-hidden="String(!ui.drawerOpen)">
            <div class="cart-drawer__overlay" @click="closeDrawer"></div>

            <aside class="cart-drawer__panel" role="dialog" aria-label="Carrito de compras">
                <div class="cart-drawer__header">
                    <h2>Tu carrito</h2>

                    <button class="cart-drawer__close" @click="closeDrawer" aria-label="Cerrar carrito"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <div class="cart-drawer__items">
                    <p v-if="cart.count === 0" class="cart-drawer__empty">Aún no has añadido productos a tu carrito.</p>

                    <article v-for="cartItem in cart.items" :key="cartItem.id" class="cart-drawer__item">
                        <img :src="cartItem.image" :alt="cartItem.name" class="cart-thumb">

                        <div class="cart-drawer__item-info">
                            <h3 class="prod-name">{{ cartItem.name }}</h3>

                            <div class="qty">
                                <button class="qty-btn" @click="cart.changeQuantity(cartItem.id, -1)" aria-label="Quitar uno"><i class="fa-solid fa-minus"></i></button>

                                <span class="qty-value">{{ cartItem.quantity }}</span>

                                <button class="qty-btn" @click="cart.changeQuantity(cartItem.id, 1)" aria-label="Agregar uno"><i class="fa-solid fa-plus"></i></button>
                            </div>
                        </div>

                        <div class="cart-drawer__item-side">
                            <span class="cart-drawer__item-subtotal">{{ formatPrice(cartItem.price * cartItem.quantity) }}</span>

                            <button class="cart-drawer__item-remove" @click="cart.removeItem(cartItem.id)" aria-label="Eliminar producto"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </article>
                </div>

                <div class="cart-drawer__summary">
                    <div class="summary-row">
                        <span>Subtotal</span>

                        <span>{{ formatPrice(cart.subtotal) }}</span>
                    </div>

                    <div class="summary-row">
                        <span>IVA (19%)</span>

                        <span>{{ formatPrice(cart.tax) }}</span>
                    </div>

                    <div class="summary-row summary-row--total">
                        <span>Total</span>

                        <span class="total-value">{{ formatPrice(cart.total) }}</span>
                    </div>

                    <a href="#" class="btn-checkout">Finalizar pedido</a>

                    <a href="cart.html" class="btn-continue">Ver carrito completo</a>
                </div>
            </aside>
        </div>

        <div class="cart-button-trigger" role="button" tabindex="0" aria-label="Abrir carrito" @click="openDrawer" @keydown.enter="openDrawer">
            <i class="fa-solid fa-bag-shopping"></i>

            <span v-if="cart.count > 0" :key="cart.count" class="cart-button-trigger__badge cart-button-trigger__badge--pop">{{ cart.count }}</span>
        </div>`,

    /** Estado: carrito compartido (cartStore) y estado de la interfaz (uiStore). */
    data() {
        return { cart: cartStore, ui: uiStore };
    },

    methods: {
        formatPrice,

        /** Abre el panel lateral del carrito. */
        openDrawer() {
            uiStore.drawerOpen = true;
        },

        /** Cierra el panel lateral del carrito. */
        closeDrawer() {
            uiStore.drawerOpen = false;
        }
    },

    /** Al montar el componente, permite cerrar el carrito con la tecla Escape. */
    mounted() {
        document.addEventListener("keydown", (keyEvent) => {
            if (keyEvent.key === "Escape") {
                this.closeDrawer();
            }
        });
    }
};
