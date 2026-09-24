<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Checkbox } from '~/components/ui/checkbox'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Registrarse | Sweet Love Admin' })
</script>

<template>
  <Card class="w-full max-w-sm">
    <CardHeader>
      <CardTitle class="text-xl">Crear cuenta</CardTitle>
      <CardDescription>Completa tus datos para registrarte en el panel.</CardDescription>
    </CardHeader>
    <CardContent>
      <form class="flex flex-col gap-4" @submit.prevent>
        <div class="flex flex-col gap-2">
          <Label for="name">Nombre completo</Label>
          <Input id="name" type="text" placeholder="Maryuri de Mendoza" required />
        </div>
        <div class="flex flex-col gap-2">
          <Label for="email">Correo electrónico</Label>
          <Input id="email" type="email" placeholder="hola@sweetlove.com" required />
        </div>
        <div class="flex flex-col gap-2">
          <Label for="password">Contraseña</Label>
          <Input id="password" type="password" required />
        </div>
        <div class="flex items-center gap-2">
          <Checkbox id="terms" required />
          <Label for="terms" class="font-normal">Acepto los términos y condiciones</Label>
        </div>
        <Button type="submit" class="w-full">Crear cuenta</Button>
        <p class="text-muted-foreground text-center text-sm">
          ¿Ya tienes una cuenta?
          <NuxtLink to="/auth/sign-in" class="text-primary hover:underline">Inicia sesión</NuxtLink>
        </p>
      </form>
    </CardContent>
  </Card>
</template>
