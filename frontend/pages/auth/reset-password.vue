<!-- reset-password.vue — nueva contraseña: la persona llega desde el enlace del correo y la elige -->
<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Restablecer contraseña | Sweet Love Admin' })

const rules = PASSWORD_RULES_TEXT
const route = useRoute()
const token = computed(() => String(route.query.token ?? ''))
const password = ref('')
const confirmPassword = ref('')
const sending = ref(false)
const errorMessage = ref('')
const doneMessage = ref('')

// Valida las contraseñas y las envía a la API junto con el token del enlace
const submit = async () => {
  errorMessage.value = ''
  const problem = passwordProblem(password.value)
  if (problem) {
    errorMessage.value = problem
    return
  }
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Las contraseñas no coinciden.'
    return
  }

  sending.value = true
  try {
    const response = await $fetch<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: { token: token.value, password: password.value },
    })
    doneMessage.value = response.message
  }
  catch (error) {
    errorMessage.value = apiErrorMessage(error, 'No pudimos cambiar la contraseña. Intenta de nuevo.')
  }
  finally {
    sending.value = false
  }
}
</script>

<template>
  <Card class="w-full max-w-sm">
    <CardHeader>
      <CardTitle class="text-xl">Restablecer contraseña</CardTitle>
      <CardDescription>Crea una nueva contraseña para tu cuenta. {{ rules }}</CardDescription>
    </CardHeader>
    <CardContent>
      <p v-if="!token" class="text-destructive text-sm">
        Este enlace no es válido. Pide uno nuevo desde «¿Olvidaste tu contraseña?».
      </p>
      <div v-else-if="doneMessage" class="flex flex-col gap-4">
        <p class="text-primary text-sm">{{ doneMessage }}</p>
        <Button as-child class="w-full"><NuxtLink to="/auth/sign-in">Iniciar sesión</NuxtLink></Button>
      </div>
      <form v-else class="flex flex-col gap-4" @submit.prevent="submit">
        <div class="flex flex-col gap-2">
          <Label for="password">Nueva contraseña</Label>
          <Input id="password" v-model="password" type="password" autocomplete="new-password" required />
        </div>
        <div class="flex flex-col gap-2">
          <Label for="confirm-password">Confirmar contraseña</Label>
          <Input id="confirm-password" v-model="confirmPassword" type="password" autocomplete="new-password" required />
        </div>
        <p v-if="errorMessage" class="text-destructive text-sm">{{ errorMessage }}</p>
        <Button type="submit" class="w-full" :disabled="sending">{{ sending ? 'Guardando…' : 'Guardar contraseña' }}</Button>
        <p class="text-muted-foreground text-center text-sm">
          <NuxtLink to="/auth/sign-in" class="text-primary hover:underline">Volver a iniciar sesión</NuxtLink>
        </p>
      </form>
    </CardContent>
  </Card>
</template>
