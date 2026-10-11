<!-- change-password-card.vue — tarjeta para cambiar la contraseña de la cuenta con sesión iniciada -->
<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

const rules = PASSWORD_RULES_TEXT
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const sending = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Valida las contraseñas y pide a la API el cambio; al terminar limpia los campos
const submit = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  const problem = passwordProblem(newPassword.value)
  if (problem) {
    errorMessage.value = problem
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Las contraseñas nuevas no coinciden.'
    return
  }

  sending.value = true
  try {
    const response = await $fetch<{ message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: { currentPassword: currentPassword.value, newPassword: newPassword.value },
    })
    successMessage.value = response.message
    currentPassword.value = newPassword.value = confirmPassword.value = ''
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
  <Card>
    <CardHeader>
      <CardTitle>Cambiar contraseña</CardTitle>
      <CardDescription>{{ rules }}</CardDescription>
    </CardHeader>
    <CardContent>
      <form class="flex max-w-md flex-col gap-4" @submit.prevent="submit">
        <div class="flex flex-col gap-2">
          <Label for="current-password">Contraseña actual</Label>
          <Input id="current-password" v-model="currentPassword" type="password" autocomplete="current-password" required />
        </div>
        <div class="flex flex-col gap-2">
          <Label for="new-password">Contraseña nueva</Label>
          <Input id="new-password" v-model="newPassword" type="password" autocomplete="new-password" required />
        </div>
        <div class="flex flex-col gap-2">
          <Label for="repeat-password">Repite la contraseña nueva</Label>
          <Input id="repeat-password" v-model="confirmPassword" type="password" autocomplete="new-password" required />
        </div>
        <p v-if="errorMessage" class="text-destructive text-sm">{{ errorMessage }}</p>
        <p v-if="successMessage" class="text-primary text-sm">{{ successMessage }}</p>
        <Button type="submit" class="w-fit" :disabled="sending">{{ sending ? 'Guardando…' : 'Cambiar contraseña' }}</Button>
      </form>
    </CardContent>
  </Card>
</template>
