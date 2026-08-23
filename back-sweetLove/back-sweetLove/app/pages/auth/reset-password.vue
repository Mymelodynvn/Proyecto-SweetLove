<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Restablecer contraseña | Sweet Love Admin' })
</script>

<template>
  <Card class="w-full max-w-sm">
    <CardHeader>
      <CardTitle class="text-xl">Restablecer contraseña</CardTitle>
      <CardDescription>Crea una nueva contraseña para tu cuenta.</CardDescription>
    </CardHeader>
    <CardContent>
      <form class="flex flex-col gap-4" @submit.prevent>
        <div class="flex flex-col gap-2">
          <Label for="password">Nueva contraseña</Label>
          <Input id="password" type="password" required />
        </div>
        <div class="flex flex-col gap-2">
          <Label for="confirm-password">Confirmar contraseña</Label>
          <Input id="confirm-password" type="password" required />
        </div>
        <Button type="submit" class="w-full">Guardar contraseña</Button>
        <p class="text-muted-foreground text-center text-sm">
          <NuxtLink to="/auth/sign-in" class="text-primary hover:underline">Volver a iniciar sesión</NuxtLink>
        </p>
      </form>
    </CardContent>
  </Card>
</template>
