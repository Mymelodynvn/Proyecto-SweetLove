<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { Switch } from '~/components/ui/switch'
import { Separator } from '~/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

useHead({ title: 'Configuración | Sweet Love Admin' })

const storeName = ref('Sweet Love · Handmade Cakes')
const storeDescription = ref('Repostería artesanal en Medellín: tortas, cupcakes y postres hechos con amor.')
const storePhone = ref('300 000 0000')
const storeAddress = ref('Medellín, Colombia')
const storeCurrency = ref('COP')

const notifyNewOrder = ref(true)
const notifyLowStock = ref(true)
const notifyNewReview = ref(false)
const notifyNewsletter = ref(true)

const { isDark, toggle } = useThemeMode()
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 class="font-heading text-2xl font-bold">Configuración</h1>
      <p class="text-muted-foreground">Ajustes de la tienda, notificaciones y seguridad.</p>
    </div>

    <Tabs default-value="store">
      <TabsList>
        <TabsTrigger value="store">Tienda</TabsTrigger>
        <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        <TabsTrigger value="security">Seguridad</TabsTrigger>
      </TabsList>

      <TabsContent value="store">
        <Card>
          <CardHeader>
            <CardTitle>Información de la tienda</CardTitle>
            <CardDescription>Estos datos se muestran en el sitio público de Sweet Love.</CardDescription>
          </CardHeader>
          <CardContent class="flex max-w-2xl flex-col gap-4">
            <div class="flex flex-col gap-2">
              <Label for="store-name">Nombre de la tienda</Label>
              <Input id="store-name" v-model="storeName" />
            </div>
            <div class="flex flex-col gap-2">
              <Label for="store-description">Descripción</Label>
              <Textarea id="store-description" v-model="storeDescription" rows="3" />
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="flex flex-col gap-2">
                <Label for="store-phone">Teléfono / WhatsApp</Label>
                <Input id="store-phone" v-model="storePhone" type="tel" />
              </div>
              <div class="flex flex-col gap-2">
                <Label for="store-address">Ubicación</Label>
                <Input id="store-address" v-model="storeAddress" />
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <Label for="store-currency">Moneda</Label>
              <Select id="store-currency" v-model="storeCurrency">
                <SelectTrigger class="w-56">
                  <SelectValue placeholder="Moneda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COP">Peso colombiano (COP)</SelectItem>
                  <SelectItem value="USD">Dólar (USD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Tema oscuro</p>
                <p class="text-muted-foreground text-sm">El panel usa el tema oscuro de Sweet Love por defecto.</p>
              </div>
              <Switch :model-value="isDark" aria-label="Tema oscuro" @update:model-value="toggle" />
            </div>
            <div>
              <Button>Guardar cambios</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notificaciones</CardTitle>
            <CardDescription>Elige qué avisos quieres recibir.</CardDescription>
          </CardHeader>
          <CardContent class="flex max-w-2xl flex-col gap-5">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Nuevos pedidos</p>
                <p class="text-muted-foreground text-sm">Recibe un aviso cada vez que entra un pedido.</p>
              </div>
              <Switch v-model="notifyNewOrder" aria-label="Notificar nuevos pedidos" />
            </div>
            <Separator />
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Stock bajo</p>
                <p class="text-muted-foreground text-sm">Avisa cuando un producto esté por agotarse.</p>
              </div>
              <Switch v-model="notifyLowStock" aria-label="Notificar stock bajo" />
            </div>
            <Separator />
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Nuevas reseñas</p>
                <p class="text-muted-foreground text-sm">Avisa cuando un cliente deje una reseña.</p>
              </div>
              <Switch v-model="notifyNewReview" aria-label="Notificar nuevas reseñas" />
            </div>
            <Separator />
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Resumen semanal</p>
                <p class="text-muted-foreground text-sm">Un correo con las ventas y novedades de la semana.</p>
              </div>
              <Switch v-model="notifyNewsletter" aria-label="Recibir resumen semanal" />
            </div>
            <div>
              <Button>Guardar preferencias</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security">
        <Card>
          <CardHeader>
            <CardTitle>Seguridad</CardTitle>
            <CardDescription>Actualiza tu contraseña de acceso al panel.</CardDescription>
          </CardHeader>
          <CardContent>
            <form class="flex max-w-md flex-col gap-4" @submit.prevent>
              <div class="flex flex-col gap-2">
                <Label for="current-password">Contraseña actual</Label>
                <Input id="current-password" type="password" required />
              </div>
              <div class="flex flex-col gap-2">
                <Label for="new-password">Nueva contraseña</Label>
                <Input id="new-password" type="password" required />
              </div>
              <div class="flex flex-col gap-2">
                <Label for="confirm-new-password">Confirmar nueva contraseña</Label>
                <Input id="confirm-new-password" type="password" required />
              </div>
              <div>
                <Button type="submit">Actualizar contraseña</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
