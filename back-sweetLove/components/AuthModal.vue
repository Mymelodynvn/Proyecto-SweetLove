<!--
  @file AuthModal.vue
  @description Componente de ventana modal para la autenticación y registro de usuarios en Sweet Love.
  Se comunica con los endpoints REST (/api/auth/login y /api/auth/register) y gestiona
  el estado global de la sesión mediante useAuth() y la navegación por roles.

  @project Sweet Love E-Commerce
  @component AuthModal
-->
<template>
  <div v-if="isOpen" class="auth-modal auth-modal--open">
    <div class="auth-modal__overlay" @click="closeModal"></div>

    <!-- Panel 1: Iniciar Sesión -->
    <div v-if="currentView === 'login'" class="auth-modal__panel" role="dialog" aria-label="Iniciar sesión">
      <button class="auth-modal__close" @click="closeModal" aria-label="Cerrar">
        <i class="fa-solid fa-xmark"></i>
      </button>

      <img src="/assets/recursos/logo1.png" alt="Sweet Love" class="auth-modal__logo">

      <h2>Iniciar Sesión</h2>
      <p class="form__subtitle">Nos alegra verte otra vez</p>

      <form @submit.prevent="handleLogin">
        <div class="auth-modal__field">
          <i class="fa-solid fa-envelope"></i>
          <input type="email" placeholder="Correo Electrónico" v-model.trim="loginForm.email" required>
        </div>

        <div class="auth-modal__field">
          <i class="fa-solid fa-lock"></i>
          <input :type="showLoginPassword ? 'text' : 'password'" placeholder="Contraseña" v-model="loginForm.password" required>
          <button type="button" class="auth-modal__toggle-password" @click="showLoginPassword = !showLoginPassword">
            <i :class="showLoginPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
          </button>
        </div>

        <button type="submit" class="btn__form auth-modal__submit" :disabled="loading">
          {{ loading ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </form>

      <p class="form__switch">¿Aún no tienes una cuenta? <a href="#" @click.prevent="currentView = 'register'">Regístrate</a></p>
    </div>

    <!-- Panel 2: Registro de Usuario -->
    <div v-else class="auth-modal__panel" role="dialog" aria-label="Registrarse">
      <button class="auth-modal__close" @click="closeModal" aria-label="Cerrar">
        <i class="fa-solid fa-xmark"></i>
      </button>

      <img src="/assets/recursos/logo1.png" alt="Sweet Love" class="auth-modal__logo">

      <h2>Registrarse</h2>
      <p class="form__subtitle">Solo te tomará un minuto</p>

      <form @submit.prevent="handleRegister">
        <div class="auth-modal__field">
          <i class="fa-solid fa-user"></i>
          <input type="text" placeholder="Nombre Completo" v-model.trim="registerForm.fullName" required>
        </div>

        <div class="auth-modal__field">
          <i class="fa-solid fa-envelope"></i>
          <input type="email" placeholder="Correo Electrónico" v-model.trim="registerForm.email" required>
        </div>

        <div class="auth-modal__field">
          <i class="fa-solid fa-circle-user"></i>
          <input type="text" placeholder="Nombre de Usuario" v-model.trim="registerForm.username" required>
        </div>

        <div class="auth-modal__field">
          <i class="fa-solid fa-lock"></i>
          <input :type="showRegisterPassword ? 'text' : 'password'" placeholder="Contraseña" v-model="registerForm.password" required>
          <button type="button" class="auth-modal__toggle-password" @click="showRegisterPassword = !showRegisterPassword">
            <i :class="showRegisterPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
          </button>
        </div>

        <button type="submit" class="btn__form auth-modal__submit" :disabled="loading">
          {{ loading ? 'Registrando...' : 'Registrarme' }}
        </button>
      </form>

      <p class="form__switch">¿Ya tienes una cuenta? <a href="#" @click.prevent="currentView = 'login'">Inicia sesión</a></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { UserSession } from '~/composables/useAuth'

const { setUser } = useAuth()

const isOpen = ref(false)
const loading = ref(false)
const currentView = ref<'login' | 'register'>('login')
const showLoginPassword = ref(false)
const showRegisterPassword = ref(false)

const loginForm = reactive({ email: '', password: '' })
const registerForm = reactive({ fullName: '', email: '', username: '', password: '' })

/**
 * Abre la ventana modal de autenticación.
 * @param {'login' | 'register'} view - Vista inicial deseada
 */
const openModal = (view: 'login' | 'register' = 'login') => {
  currentView.value = view
  isOpen.value = true
}

/**
 * Cierra la ventana modal y restablece la visibilidad de las contraseñas.
 */
const closeModal = () => {
  isOpen.value = false
  showLoginPassword.value = false
  showRegisterPassword.value = false
}

// Expone los métodos para ser llamados desde el Header o Navbar mediante ref
defineExpose({
  openModal,
  closeModal,
  isOpen
})

/**
 * Envía las credenciales al servidor de Nuxt y procesa la redirección por rol.
 * @async
 */
const handleLogin = async () => {
  loading.value = true
  try {
    const data = await $fetch<UserSession>('/api/auth/login', {
      method: 'POST',
      body: {
        email: loginForm.email,
        password: loginForm.password
      }
    })

    // Guarda el usuario autenticado en el estado global reactivo de Nuxt
    setUser(data)

    alert(`¡Bienvenid@ ${data.nombre || ''}!`)
    closeModal()

    // Redirección por Rol de Usuario (1 = Administrador, 2 = Cliente)
    if (data.idRol === 1) {
      await navigateTo('/admin')
    }
  } catch (error: any) {
    alert(error.data?.statusMessage || error.message || 'Error al iniciar sesión')
  } finally {
    loading.value = false
  }
}

/**
 * Envía la solicitud de registro al servidor.
 * @async
 */
const handleRegister = async () => {
  loading.value = true
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        nombre: registerForm.fullName,
        email: registerForm.email,
        username: registerForm.username,
        contrasena: registerForm.password
      }
    })

    alert('¡Registro exitoso! Ya puedes iniciar sesión.')
    currentView.value = 'login'

    // Resetea el formulario de registro
    registerForm.fullName = ''
    registerForm.email = ''
    registerForm.username = ''
    registerForm.password = ''
  } catch (error: any) {
    alert(error.data?.statusMessage || error.message || 'Error al registrar usuario')
  } finally {
    loading.value = false
  }
}
</script>