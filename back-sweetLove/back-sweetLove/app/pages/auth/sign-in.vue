<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Checkbox } from '~/components/ui/checkbox'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Iniciar sesión | Sweet Love Admin' })
</script>

<template>
  <Card class="w-full max-w-sm">
    <CardHeader>
      <CardTitle class="text-xl">Iniciar sesión</CardTitle>
      <CardDescription>Bienvenida de nuevo. Ingresa tus datos para continuar.</CardDescription>
    </CardHeader>
    <CardContent>
      <form class="flex flex-col gap-4" @submit.prevent>
        <div class="flex flex-col gap-2">
          <Label for="email">Correo electrónico</Label>
          <Input id="email" type="email" placeholder="hola@sweetlove.com" required />
        </div>
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <Label for="password">Contraseña</Label>
            <NuxtLink to="/auth/forgot-password" class="text-primary text-sm hover:underline">
              ¿Olvidaste tu contraseña?
            </NuxtLink>
          </div>
          <Input id="password" type="password" required />
        </div>
        <div class="flex items-center gap-2">
          <Checkbox id="remember" />
          <Label for="remember" class="font-normal">Recordarme</Label>
        </div>
        <Button type="submit" class="w-full">Ingresar</Button>
        <p class="text-muted-foreground text-center text-sm">
          ¿No tienes una cuenta?
          <NuxtLink to="/auth/sign-up" class="text-primary hover:underline">Regístrate</NuxtLink>
        </p>
      </form>
    </CardContent>
  </Card>
</template>
