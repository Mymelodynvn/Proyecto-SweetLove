<!--
  sign-in.vue — inicio de sesión del panel.
  Valida credenciales contra /api/auth/login; si es administrador, entra al panel.
-->
<script setup lang="ts">
import { IconEye, IconEyeOff } from '@tabler/icons-vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import type { UserSession } from '~/composables/useAuth'
import { Checkbox } from '~/components/ui/checkbox'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Iniciar sesión | Sweet Love Admin' })
const email = ref('')
const password = ref('')
/** Muestra u oculta la contraseña escrita, para poder verificar lo que se teclea. */
const showPassword = ref(false)
const loginError = ref('')

/**
 * Envía el correo y la contraseña. Si son correctos guarda el usuario y navega al panel (administrador) o al inicio.
 * Si fallan, muestra el mensaje del servidor.
 */
const handleLogin = async () => {
  loginError.value = ''
  try {
    const response = await $fetch<{ user: UserSession }>('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })
    // Solo las cuentas de administrador pueden usar el panel.
    if (response.user.idRol !== 1) {
      await $fetch('/api/auth/logout', { method: 'POST' })
      loginError.value = 'Esta cuenta no tiene acceso al panel de administración.'
      return
    }
    useAuth().setUser(response.user)
    await navigateTo('/admin')
  } catch (error) {
    // Muestra el mensaje que envía la API (p. ej. "Correo o contraseña incorrectos.").
    const failure = error as { data?: { statusMessage?: string }, statusCode?: number }
    // Errores 5xx (502 Bad Gateway, 500...) significan que el backend no responde o falló.
    const serverFailed = (failure.statusCode ?? 0) >= 500
    loginError.value = serverFailed
      ? 'No se pudo conectar con el servidor. Verifica que el backend esté en marcha (npm run dev:backend) y que la base de datos responda.'
      : failure.data?.statusMessage || 'No fue posible iniciar sesión.'
  }
}

</script>

<template>
  <Card class="w-full max-w-sm">
    <CardHeader>
      <CardTitle class="text-xl">Iniciar sesión</CardTitle>
      <CardDescription>Bienvenida de nuevo. Ingresa tus datos para continuar.</CardDescription>
    </CardHeader>
    <CardContent>
      <form class="flex flex-col gap-4" @submit.prevent="handleLogin">
        <div class="flex flex-col gap-2">
          <Label for="email">Correo electrónico</Label>
          <Input id="email" v-model="email" type="email" placeholder="hola@sweetlove.com" required />
        </div>
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <Label for="password">Contraseña</Label>
            <NuxtLink to="/auth/forgot-password" class="text-primary text-sm hover:underline">
              ¿Olvidaste tu contraseña?
            </NuxtLink>
          </div>
          <div class="relative">
            <Input id="password" v-model="password" :type="showPassword ? 'text' : 'password'" class="pr-10" required />
            <button
              type="button"
              class="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
              :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              @click="showPassword = !showPassword"
            >
              <IconEyeOff v-if="showPassword" class="size-4" />
              <IconEye v-else class="size-4" />
            </button>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <Checkbox id="remember" />
          <Label for="remember" class="font-normal">Recordarme</Label>
        </div>
        <p v-if="loginError" class="text-destructive text-sm">{{ loginError }}</p>
        <Button type="submit" class="w-full">Ingresar</Button>
        <p class="text-muted-foreground text-center text-sm">
          ¿No tienes una cuenta?
          <NuxtLink to="/auth/sign-up" class="text-primary hover:underline">Regístrate</NuxtLink>
        </p>
      </form>
    </CardContent>
  </Card>
</template>
