<script setup lang="ts">
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconCake,
  IconMapPin,
  IconRosette,
} from '@tabler/icons-vue'
import type { ProfileData } from '~/composables/use-profile'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Separator } from '~/components/ui/separator'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'

useHead({ title: 'Perfil | Sweet Love Admin' })

const { profile, initials: profileInitials, loadFromStorage, save } = useProfile()

onMounted(loadFromStorage)

const isEditDialogOpen = ref(false)
const editForm = ref<ProfileData>({ ...profile.value })

watch(isEditDialogOpen, (isOpen) => {
  if (isOpen) {
    editForm.value = { ...profile.value }
  }
})

const submitProfile = () => {
  save(editForm.value)
  isEditDialogOpen.value = false
}

const stats = [
  { label: 'Productos publicados', value: '24' },
  { label: 'Pedidos completados', value: '1.240' },
  { label: 'Clientes felices', value: '860' },
  { label: 'Calificación promedio', value: '4.9' },
]

const recentActivity = [
  { title: 'Publicó una nueva entrada en el blog', detail: 'Cómo elegimos los ingredientes de nuestras tortas', date: '15 ago 2026' },
  { title: 'Agregó un nuevo producto', detail: 'Cheesecake de frutos rojos', date: '12 ago 2026' },
  { title: 'Completó 25 pedidos esta semana', detail: 'Semana del 4 al 10 de agosto', date: '10 ago 2026' },
]
</script>

<template>
  <div class="flex flex-col gap-6">
    <Card>
      <CardContent class="flex flex-col gap-6 md:flex-row md:items-center">
        <Avatar class="size-24 self-center md:self-auto">
          <AvatarImage v-if="profile.avatar" :src="profile.avatar" :alt="profile.name" />
          <AvatarFallback class="bg-primary text-primary-foreground text-2xl font-bold">
            {{ profileInitials }}
          </AvatarFallback>
        </Avatar>
        <div class="flex flex-1 flex-col gap-3">
          <div>
            <Badge class="mb-2">{{ profile.role }}</Badge>
            <h1 class="font-heading text-primary text-2xl font-bold">{{ profile.name }}</h1>
          </div>
          <p class="text-muted-foreground max-w-2xl">{{ profile.bio }}</p>
          <div class="flex flex-wrap gap-2">
            <Badge class="bg-primary/15 text-primary gap-1.5 rounded-full border-transparent px-3 py-1.5 text-[13px] font-medium">
              <IconCake class="size-4" />
              Repostería artesanal
            </Badge>
            <Badge class="bg-chart-5/25 text-foreground gap-1.5 rounded-full border-transparent px-3 py-1.5 text-[13px] font-medium">
              <IconRosette class="text-chart-5 size-4" />
              +6 años de experiencia
            </Badge>
            <Badge class="bg-secondary text-secondary-foreground gap-1.5 rounded-full border-transparent px-3 py-1.5 text-[13px] font-medium">
              <IconMapPin class="size-4" />
              {{ profile.location }}
            </Badge>
          </div>
          <div class="flex items-center gap-2">
            <Dialog v-model:open="isEditDialogOpen">
              <DialogTrigger as-child>
                <Button>Editar perfil</Button>
              </DialogTrigger>
              <DialogContent class="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Editar perfil</DialogTitle>
                  <DialogDescription>
                    Actualiza tu información pública. Los cambios se guardan en este navegador.
                  </DialogDescription>
                </DialogHeader>
                <form id="edit-profile-form" class="flex flex-col gap-4" @submit.prevent="submitProfile">
                  <div class="flex flex-col gap-2">
                    <Label>Foto de avatar</Label>
                    <AvatarUpload v-model="editForm.avatar" :fallback-text="profileInitials" />
                  </div>
                  <div class="flex flex-col gap-2">
                    <Label for="profile-name">Nombre</Label>
                    <Input id="profile-name" v-model="editForm.name" required />
                  </div>
                  <div class="flex flex-col gap-2">
                    <Label for="profile-role">Cargo</Label>
                    <Input id="profile-role" v-model="editForm.role" required />
                  </div>
                  <div class="flex flex-col gap-2">
                    <Label for="profile-bio">Descripción</Label>
                    <Textarea id="profile-bio" v-model="editForm.bio" rows="4" required />
                  </div>
                  <div class="flex flex-col gap-2">
                    <Label for="profile-location">Ubicación</Label>
                    <Input id="profile-location" v-model="editForm.location" required />
                  </div>
                  <div class="grid gap-4 sm:grid-cols-2">
                    <div class="flex flex-col gap-2">
                      <Label for="profile-instagram">Instagram</Label>
                      <Input id="profile-instagram" v-model="editForm.instagramUrl" type="url" />
                    </div>
                    <div class="flex flex-col gap-2">
                      <Label for="profile-facebook">Facebook</Label>
                      <Input id="profile-facebook" v-model="editForm.facebookUrl" type="url" />
                    </div>
                  </div>
                </form>
                <DialogFooter>
                  <Button type="button" variant="outline" @click="isEditDialogOpen = false">Cancelar</Button>
                  <Button type="submit" form="edit-profile-form">Guardar cambios</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="icon" as-child>
              <a :href="profile.instagramUrl" target="_blank" rel="noopener" aria-label="Instagram">
                <IconBrandInstagram class="size-4" />
              </a>
            </Button>
            <Button variant="outline" size="icon" as-child>
              <a :href="profile.facebookUrl" target="_blank" rel="noopener" aria-label="Facebook">
                <IconBrandFacebook class="size-4" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <Card v-for="stat in stats" :key="stat.label">
        <CardContent class="flex flex-col gap-1">
          <span class="text-2xl font-bold">{{ stat.value }}</span>
          <span class="text-muted-foreground text-sm">{{ stat.label }}</span>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Actividad reciente</CardTitle>
      </CardHeader>
      <CardContent class="flex flex-col">
        <template v-for="(activity, activityIndex) in recentActivity" :key="activity.title">
          <div class="flex items-start justify-between gap-4 py-3">
            <div>
              <p class="font-medium">{{ activity.title }}</p>
              <p class="text-muted-foreground text-sm">{{ activity.detail }}</p>
            </div>
            <span class="text-muted-foreground shrink-0 text-sm">{{ activity.date }}</span>
          </div>
          <Separator v-if="activityIndex < recentActivity.length - 1" />
        </template>
      </CardContent>
    </Card>
  </div>
</template>
