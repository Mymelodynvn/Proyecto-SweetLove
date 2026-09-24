<!--
  @file SiteHeader.vue
  @description Componente de cabecera principal para el proyecto Sweet Love.
  Administra el menú de navegación, enlaces dinámicos, apertura del modal de autenticación (AuthModal)
  y la visualización de la sesión reactiva del usuario mediante useAuth().

  @project Sweet Love E-Commerce
  @component SiteHeader
-->
<template>
  <header>
    <div class="container__header">
      <!-- Menú Izquierdo -->
      <nav class="menu-left">
        <ul>
          <li><a :href="homeLink">Inicio</a></li>
          <li><a :href="productsLink">Productos</a></li>
          <li><NuxtLink to="/about-us">Sobre Nosotros</NuxtLink></li>
        </ul>
      </nav>

      <!-- Logotipo de la Marca -->
      <div class="logo">
        <NuxtLink to="/">
          <img src="/assets/recursos/logo1.png" alt="Sweet Love Logo">
        </NuxtLink>
      </div>

      <!-- Menú Derecho y Acciones -->
      <div class="menu-right">
        <nav>
          <ul>
            <li><NuxtLink to="/blog">Blog</NuxtLink></li>
            <li><NuxtLink to="/contact-us">Contáctanos</NuxtLink></li>
          </ul>
        </nav>

        <div class="actions">
          <!-- Botón de Búsqueda -->
          <a href="#" aria-label="Buscar" @click.prevent="openSearch">
            <i class="fa-solid fa-magnifying-glass"></i>
          </a>

          <!-- Estado A: Usuario NO autenticado -->
          <a
            v-if="!isLoggedIn"
            href="#"
            aria-label="Perfil"
            title="Iniciar Sesión"
            @click.prevent="openLogin"
          >
            <i class="fa-solid fa-circle-user"></i>
          </a>

          <!-- Estado B: Usuario SÍ autenticado -->
          <div v-else class="user-badge flex items-center gap-2">
            <!-- Acceso directo al Dashboard si el usuario es Administrador (idRol = 1) -->
            <NuxtLink
              v-if="user?.idRol === 1"
              to="/admin"
              class="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-semibold hover:bg-primary/20 transition"
            >
              Admin
            </NuxtLink>

            <span class="user-badge__name">
              <i class="fa-solid fa-circle-user"></i> {{ user?.nombre }}
            </span>

            <button
              class="user-badge__logout"
              title="Cerrar Sesión"
              @click.prevent="logout"
            >
              <i class="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="header-wave-divider"></div>

    <!-- Modal de Autenticación Integrada -->
    <AuthModal ref="authModalRef" />
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const route = useRoute()
const authModalRef = ref()

/** Estado global de sesión del usuario */
const { user, logout, isLoggedIn } = useAuth()

/**
 * Evalúa si la vista actual corresponde a la portada principal.
 */
const onHomePage = computed(() => route.path === '/')

/** Rutas dinámicas para la navegación interna */
const homeLink = computed(() => (onHomePage.value ? '#home-section' : '/'))
const productsLink = computed(() => (onHomePage.value ? '#products-section' : '/#products-section'))

/**
 * Abre la modal de autenticación invocando el método expuesto por AuthModal.vue
 */
const openLogin = () => {
  authModalRef.value?.openModal('login')
}

const openSearch = () => {
  // Manejo de modal o desplegable de búsqueda
}
</script>