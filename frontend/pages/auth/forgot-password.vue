<!-- forgot-password.vue — recuperación de contraseña: pide a la API que envíe el enlace por correo -->
<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Olvidé mi contraseña | Sweet Love Admin' })

const email = ref('')
const sending = ref(false)
const message = ref('')
const errorMessage = ref('')

// Pide a la API el enlace de recuperación y muestra su respuesta (igual exista o no la cuenta)
const submit = async () => {
  message.value = ''
  errorMessage.value = emailProblem(email.value)
  if (errorMessage.value) return
  sending.value = true
  try {
    const response = await $fetch<{ message: string }>('/api/auth/forgot-password', { method: 'POST', body: { email: email.value } })
    message.value = response.message
  }
  catch (error) {
    errorMessage.value = apiErrorMessage(error, 'No pudimos enviar el enlace. Intenta de nuevo.')
  }
  finally {
    sending.value = false
  }
}
</script>

<template>
  <Card class="w-full max-w-sm">
    <CardHeader>
      <CardTitle class="text-xl">¿Olvidaste tu contraseña?</CardTitle>
      <CardDescription>
        Ingresa tu correo y te enviaremos un enlace para restablecerla.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form class="flex flex-col gap-4" @submit.prevent="submit">
        <div class="flex flex-col gap-2">
          <Label for="email">Correo electrónico</Label>
          <Input id="email" v-model="email" type="email" placeholder="hola@sweetlove.com" required @keydown.space.prevent />
        </div>
        <p v-if="errorMessage" class="text-destructive text-sm">{{ errorMessage }}</p>
        <p v-if="message" class="text-primary text-sm">{{ message }}</p>
        <Button type="submit" class="w-full" :disabled="sending">{{ sending ? 'Enviando…' : 'Enviar enlace' }}</Button>
        <p class="text-muted-foreground text-center text-sm">
          <NuxtLink to="/auth/sign-in" class="text-primary hover:underline">Volver a iniciar sesión</NuxtLink>
        </p>
      </form>
    </CardContent>
  </Card>
</template>
