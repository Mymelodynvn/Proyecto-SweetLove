// back-to-top.js — botón flotante que sube al inicio de la página (siempre visible)
const BackToTop = {
    template: `
        <!-- Botón flotante "volver arriba" -->
        <button type="button" class="back-to-top" aria-label="Volver arriba" @click="scrollToTop">
            <i class="fa-solid fa-arrow-up"></i>
        </button>`,

    methods: {
        // Sube suavemente al inicio de la página
        scrollToTop() {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }
};
