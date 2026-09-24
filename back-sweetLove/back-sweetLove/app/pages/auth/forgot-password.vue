<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Olvidé mi contraseña | Sweet Love Admin' })
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
      <form class="flex flex-col gap-4" @submit.prevent>
        <div class="flex flex-col gap-2">
          <Label for="email">Correo electrónico</Label>
          <Input id="email" type="email" placeholder="hola@sweetlove.com" required />
        </div>
        <Button type="submit" class="w-full">Enviar enlace</Button>
        <p class="text-muted-foreground text-center text-sm">
          <NuxtLink to="/auth/sign-in" class="text-primary hover:underline">Volver a iniciar sesión</NuxtLink>
        </p>
      </form>
    </CardContent>
  </Card>
</template>
