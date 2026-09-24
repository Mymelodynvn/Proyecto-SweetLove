<!--
  Archivo del proyecto Sweet Love.
  Propósito: contiene la interfaz o lógica descrita por su nombre y ubicación.
  Los comentarios internos explican la responsabilidad de los bloques principales.
-->
<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Checkbox } from '~/components/ui/checkbox'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Iniciar sesión | Sweet Love Admin' })
const email = ref('')
const password = ref('')
const loginError = ref('')

const handleLogin = async () => {
  loginError.value = ''
  try {
    const response = await $fetch<{ user: { name: string; role: string } }>('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })
    localStorage.setItem('sweet-love-admin-user', JSON.stringify(response.user))
    await navigateTo('/')
  } catch (error) {
    loginError.value = error instanceof Error ? error.message : 'No fue posible iniciar sesión.'
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
          <Input id="password" v-model="password" type="password" required />
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
