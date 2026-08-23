<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { PinInput, PinInputGroup, PinInputSlot } from '~/components/ui/pin-input'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Verificación OTP | Sweet Love Admin' })

const otpCode = ref<string[]>([])
</script>

<template>
  <Card class="w-full max-w-sm">
    <CardHeader>
      <CardTitle class="text-xl">Verificación OTP</CardTitle>
      <CardDescription>
        Ingresa el código de 6 dígitos que enviamos a tu correo.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form class="flex flex-col gap-4" @submit.prevent>
        <div class="flex justify-center">
          <PinInput id="otp" v-model="otpCode" placeholder="○" otp>
            <PinInputGroup>
              <PinInputSlot v-for="slotNumber in 6" :key="slotNumber" :index="slotNumber - 1" />
            </PinInputGroup>
          </PinInput>
        </div>
        <Button type="submit" class="w-full">Verificar código</Button>
        <p class="text-muted-foreground text-center text-sm">
          ¿No recibiste el código?
          <button type="button" class="text-primary hover:underline">Reenviar</button>
        </p>
      </form>
    </CardContent>
  </Card>
</template>
