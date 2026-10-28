// back-to-top.js — botón flotante que sube al inicio de la página
const BackToTop = {
    template: `
        <!-- Botón flotante "volver arriba": aparece al bajar lo suficiente en la página -->
        <button type="button" class="back-to-top" :class="{ 'back-to-top--visible': visible }" aria-label="Volver arriba" @click="scrollToTop">
            <i class="fa-solid fa-arrow-up"></i>
        </button>`,

    data() {
        return { visible: false };
    },

    methods: {
        // Muestra el botón solo después de bajar una pantalla completa
        updateVisibility() {
            this.visible = window.scrollY > window.innerHeight;
        },

        // Sube suavemente al inicio de la página
        scrollToTop() {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    },

    mounted() {
        this.updateVisibility();
        window.addEventListener("scroll", this.updateVisibility, { passive: true });
    }
};
