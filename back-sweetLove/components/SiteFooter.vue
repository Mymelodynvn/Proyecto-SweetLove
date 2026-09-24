<!--
  @file SiteFooter.vue
  @description Componente correspondiente al pie de página (Footer) de la plataforma Sweet Love.
  Contiene los enlaces a redes sociales, navegación secundaria, horario de atención e información legal.

  @project Sweet Love E-Commerce
  @component SiteFooter
-->
<template>
  <footer class="footer">
    <div class="container__footer">
      <!-- Columna 1: Identidad -->
      <div class="footer__box">
        <div class="footer__logo">
          <img src="/assets/recursos/logo1.png" alt="Sweet Love Logo">
        </div>
        <p class="footer__description">
          Repostería artesanal hecha con ingredientes de calidad y mucho amor para endulzar tus momentos especiales.
        </p>
      </div>

      <!-- Columna 2: Navegación -->
      <div class="footer__box">
        <h3>Navegación</h3>
        <ul>
          <li><a href="/">Inicio</a></li>
          <li><a href="/#products-section">Productos</a></li>
          <li><a href="aboutUs.html">Sobre Nosotros</a></li>
          <li><a href="blog.html">Blog</a></li>
          <li><a href="contactUs.html">Contáctanos</a></li>
        </ul>
      </div>

      <!-- Columna 3: Redes y Atención -->
      <div class="footer__box">
        <h3>Síguenos</h3>
        <div class="footer__socials">
          <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram">
            <i class="fa-brands fa-instagram"></i>
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook">
            <i class="fa-brands fa-facebook"></i>
          </a>
          <a href="https://wa.me/" target="_blank" rel="noopener" aria-label="WhatsApp">
            <i class="fa-brands fa-whatsapp"></i>
          </a>
        </div>
      </div>
    </div>

    <div class="footer__copyright">
      <p>&copy; {{ currentYear }} Sweet Love. Todos los derechos reservados.</p>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

/**
 * Retorna el año actual para la cláusula de copyright de manera dinámica.
 * @returns {number}
 */
const currentYear = computed(() => new Date().getFullYear())
</script>