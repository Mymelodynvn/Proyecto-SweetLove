<script setup lang="ts">
import {
  IconCheck,
  IconDots,
  IconMail,
  IconPhone,
  IconUserPlus,
  IconX,
} from '@tabler/icons-vue'
import type { PermissionKey, TeamMember, TeamMemberFormData, TeamRoleName } from '~/composables/use-team'
import { Card, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Switch } from '~/components/ui/switch'
import { Checkbox } from '~/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Separator } from '~/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'

useHead({ title: 'Equipo | Sweet Love Admin' })

const { members, loadFromStorage, addMember, updateMember, toggleMemberActive, removeMember } = useTeam()

onMounted(loadFromStorage)

const roleBadgeClass: Record<TeamRoleName, string> = {
  Administrador: 'bg-chart-5/40 text-foreground border-transparent',
  Gerente: 'bg-primary/15 text-primary border-transparent',
  Vendedor: 'bg-secondary text-secondary-foreground border-transparent',
  Repostero: 'bg-chart-3/30 text-foreground border-transparent',
}

const memberInitials = (name: string) =>
  name
    .split(' ')
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')

const permissionLabel = (permissionKey: PermissionKey) =>
  PERMISSIONS.find((permission) => permission.key === permissionKey)?.label ?? permissionKey

const roleDescription = (roleName: TeamRoleName) =>
  TEAM_ROLES.find((role) => role.name === roleName)?.description ?? ''

const EMPTY_FORM = (): TeamMemberFormData => ({
  name: '',
  email: '',
  phone: '',
  avatar: null,
  role: 'Vendedor',
  permissions: rolePermissions('Vendedor'),
  active: true,
})

const isFormDialogOpen = ref(false)
const editingMemberId = ref<number | null>(null)
const editingIsOwner = ref(false)
const memberForm = ref<TeamMemberFormData>(EMPTY_FORM())

const openCreateDialog = () => {
  editingMemberId.value = null
  editingIsOwner.value = false
  memberForm.value = EMPTY_FORM()
  isFormDialogOpen.value = true
}

const openEditDialog = (member: TeamMember) => {
  editingMemberId.value = member.id
  editingIsOwner.value = member.isOwner
  memberForm.value = {
    name: member.name,
    email: member.email,
    phone: member.phone,
    avatar: member.avatar,
    role: member.role,
    permissions: [...member.permissions],
    active: member.active,
  }
  isFormDialogOpen.value = true
}

// Picking a role resets the checkboxes to that role's defaults; they can
// still be adjusted individually afterwards.
const applyRoleDefaults = (selectedValue: unknown) => {
  const role = TEAM_ROLES.find((definition) => definition.name === selectedValue)
  if (!role) return
  memberForm.value.role = role.name
  memberForm.value.permissions = [...role.permissions]
}

const isPermissionGranted = (permissionKey: PermissionKey) =>
  memberForm.value.permissions.includes(permissionKey)

const togglePermission = (permissionKey: PermissionKey) => {
  if (isPermissionGranted(permissionKey)) {
    memberForm.value.permissions = memberForm.value.permissions.filter((key) => key !== permissionKey)
  }
  else {
    memberForm.value.permissions = [...memberForm.value.permissions, permissionKey]
  }
}

const submitMemberForm = () => {
  if (editingMemberId.value === null) {
    addMember(memberForm.value)
  }
  else {
    updateMember(editingMemberId.value, memberForm.value)
  }
  isFormDialogOpen.value = false
}

const previewMember = ref<TeamMember | null>(null)
const isPreviewDialogOpen = ref(false)

const openPreviewDialog = (member: TeamMember) => {
  previewMember.value = member
  isPreviewDialogOpen.value = true
}

const memberPendingDeletion = ref<TeamMember | null>(null)
const isDeleteDialogOpen = ref(false)

const requestDeletion = (member: TeamMember) => {
  memberPendingDeletion.value = member
  isDeleteDialogOpen.value = true
}

const confirmDeletion = () => {
  if (memberPendingDeletion.value) {
    removeMember(memberPendingDeletion.value.id)
  }
  isDeleteDialogOpen.value = false
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="font-heading text-2xl font-bold">Equipo</h1>
        <p class="text-muted-foreground">
          Personas con acceso al panel y los permisos de cada una.
        </p>
      </div>
      <Button @click="openCreateDialog">
        <IconUserPlus class="size-4" />
        Agregar miembro
      </Button>
    </div>

    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Miembro</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Permisos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Ingreso</TableHead>
              <TableHead class="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="member in members" :key="member.id">
              <TableCell>
                <span class="flex items-center gap-3">
                  <Avatar class="size-9">
                    <AvatarImage v-if="member.avatar" :src="member.avatar" :alt="member.name" />
                    <AvatarFallback class="bg-primary text-primary-foreground text-xs font-semibold">
                      {{ memberInitials(member.name) }}
                    </AvatarFallback>
                  </Avatar>
                  <span class="flex flex-col">
                    <span class="font-medium">
                      {{ member.name }}
                      <Badge v-if="member.isOwner" variant="outline" class="ml-1 text-[10px]">Propietaria</Badge>
                    </span>
                    <span class="text-muted-foreground text-xs">{{ member.email }}</span>
                  </span>
                </span>
              </TableCell>
              <TableCell>
                <Badge :class="roleBadgeClass[member.role]">{{ member.role }}</Badge>
              </TableCell>
              <TableCell>
                <span class="text-muted-foreground text-sm">
                  {{ member.permissions.length }} de {{ PERMISSIONS.length }}
                </span>
              </TableCell>
              <TableCell>
                <Badge :class="member.active ? 'bg-primary/15 text-primary border-transparent' : 'bg-muted text-muted-foreground border-transparent'">
                  {{ member.active ? 'Activo' : 'Inactivo' }}
                </Badge>
              </TableCell>
              <TableCell>{{ member.joinedDate }}</TableCell>
              <TableCell class="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon" aria-label="Acciones del miembro">
                      <IconDots class="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @select="openPreviewDialog(member)">Ver información</DropdownMenuItem>
                    <DropdownMenuItem @select="openEditDialog(member)">Editar</DropdownMenuItem>
                    <DropdownMenuItem v-if="!member.isOwner" @select="toggleMemberActive(member.id)">
                      {{ member.active ? 'Desactivar acceso' : 'Activar acceso' }}
                    </DropdownMenuItem>
                    <template v-if="!member.isOwner">
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" @select="requestDeletion(member)">
                        Eliminar
                      </DropdownMenuItem>
                    </template>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Dialog v-model:open="isFormDialogOpen">
      <DialogContent class="max-h-[85svh] overflow-x-hidden overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{{ editingMemberId === null ? 'Agregar miembro' : 'Editar miembro' }}</DialogTitle>
          <DialogDescription>
            {{ editingMemberId === null
              ? 'Da acceso al panel a una persona de tu equipo.'
              : 'Actualiza los datos y permisos de esta persona.' }}
          </DialogDescription>
        </DialogHeader>
        <form id="member-form" class="flex flex-col gap-4" @submit.prevent="submitMemberForm">
          <div class="flex flex-col gap-2">
            <Label>Foto de avatar</Label>
            <AvatarUpload
              v-model="memberForm.avatar"
              :fallback-text="memberInitials(memberForm.name) || '??'"
            />
          </div>
          <div class="flex flex-col gap-2">
            <Label for="member-name">Nombre completo</Label>
            <Input id="member-name" v-model="memberForm.name" placeholder="Nombre y apellido" required />
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-2">
              <Label for="member-email">Correo electrónico</Label>
              <Input id="member-email" v-model="memberForm.email" type="email" placeholder="persona@sweetlove.com" required />
            </div>
            <div class="flex flex-col gap-2">
              <Label for="member-phone">Teléfono</Label>
              <Input id="member-phone" v-model="memberForm.phone" type="tel" placeholder="300 000 0000" required />
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <Label for="member-role">Rol</Label>
            <Select
              :model-value="memberForm.role"
              :disabled="editingIsOwner"
              @update:model-value="applyRoleDefaults"
            >
              <SelectTrigger
                id="member-role"
                class="w-full py-2 data-[size=default]:h-auto *:data-[slot=select-value]:flex! *:data-[slot=select-value]:line-clamp-none *:data-[slot=select-value]:flex-col *:data-[slot=select-value]:items-start *:data-[slot=select-value]:gap-0.5"
              >
                <SelectValue placeholder="Rol">
                  <span>{{ memberForm.role }}</span>

                  <span class="text-muted-foreground text-xs font-normal">
                    {{ roleDescription(memberForm.role) }}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="role in TEAM_ROLES" :key="role.name" :value="role.name">
                  <span class="flex flex-col gap-0.5 text-left">
                    <span>{{ role.name }}</span>
                    <span class="text-muted-foreground text-xs">{{ role.description }}</span>
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="flex flex-col gap-2">
            <Label>Permisos</Label>
            <p class="text-muted-foreground -mt-1 text-xs">
              El rol define los permisos base; puedes ajustarlos individualmente.
            </p>
            <div class="grid gap-2 rounded-lg border p-3 sm:grid-cols-2">
              <label
                v-for="permission in PERMISSIONS"
                :key="permission.key"
                class="flex cursor-pointer items-center gap-2 text-sm"
              >
                <Checkbox
                  :model-value="isPermissionGranted(permission.key)"
                  :disabled="editingIsOwner"
                  @update:model-value="togglePermission(permission.key)"
                />
                {{ permission.label }}
              </label>
            </div>
          </div>
          <div v-if="!editingIsOwner" class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium">Acceso activo</p>
              <p class="text-muted-foreground text-xs">Desactívalo para suspender el acceso sin eliminar a la persona.</p>
            </div>
            <Switch v-model="memberForm.active" aria-label="Acceso activo" />
          </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" @click="isFormDialogOpen = false">Cancelar</Button>
          <Button type="submit" form="member-form">
            {{ editingMemberId === null ? 'Agregar miembro' : 'Guardar cambios' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="isPreviewDialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader class="flex-row items-center gap-3">
          <Avatar class="size-12">
            <AvatarImage v-if="previewMember?.avatar" :src="previewMember.avatar" :alt="previewMember.name" />
            <AvatarFallback class="bg-primary text-primary-foreground font-semibold">
              {{ previewMember ? memberInitials(previewMember.name) : '' }}
            </AvatarFallback>
          </Avatar>
          <div class="flex flex-col gap-1 text-left">
            <DialogTitle>{{ previewMember?.name }}</DialogTitle>
            <DialogDescription>
              {{ previewMember ? roleDescription(previewMember.role) : '' }}
            </DialogDescription>
          </div>
        </DialogHeader>
        <div v-if="previewMember" class="flex flex-col gap-4">
          <div class="flex flex-wrap items-center gap-2">
            <Badge :class="roleBadgeClass[previewMember.role]">{{ previewMember.role }}</Badge>
            <Badge :class="previewMember.active ? 'bg-primary/15 text-primary border-transparent' : 'bg-muted text-muted-foreground border-transparent'">
              {{ previewMember.active ? 'Activo' : 'Inactivo' }}
            </Badge>
            <span class="text-muted-foreground text-sm">Desde {{ previewMember.joinedDate }}</span>
          </div>
          <div class="flex flex-col gap-2 text-sm">
            <p class="flex items-center gap-2">
              <IconMail class="text-muted-foreground size-4" />
              {{ previewMember.email }}
            </p>
            <p class="flex items-center gap-2">
              <IconPhone class="text-muted-foreground size-4" />
              {{ previewMember.phone }}
            </p>
          </div>
          <Separator />

          <div class="flex flex-col gap-2">
            <p class="text-sm font-medium">Permisos</p>

            <div class="grid gap-1.5 sm:grid-cols-2">
              <span
                v-for="permission in PERMISSIONS"
                :key="permission.key"
                class="flex items-center gap-2 text-sm"
                :class="previewMember.permissions.includes(permission.key) ? '' : 'text-muted-foreground/60'"
              >
                <IconCheck v-if="previewMember.permissions.includes(permission.key)" class="text-primary size-4" />
                <IconX v-else class="text-muted-foreground/60 size-4" />
                {{ permission.label }}
              </span>
            </div>
          </div>

          <Separator />

          <div class="flex flex-col gap-1">
            <p class="text-sm font-medium">Actividad reciente</p>

            <template v-if="(previewMember.activity?.length ?? 0) > 0">
              <template v-for="(activityEntry, activityIndex) in previewMember.activity" :key="activityEntry.title">
                <div class="flex items-start justify-between gap-4 py-2">
                  <div>
                    <p class="text-sm font-medium">{{ activityEntry.title }}</p>

                    <p class="text-muted-foreground text-xs">{{ activityEntry.detail }}</p>
                  </div>

                  <span class="text-muted-foreground shrink-0 text-xs">{{ activityEntry.date }}</span>
                </div>

                <Separator v-if="activityIndex < (previewMember.activity?.length ?? 0) - 1" />
              </template>
            </template>

            <p v-else class="text-muted-foreground text-sm">Sin actividad registrada todavía.</p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" @click="isPreviewDialogOpen = false">Cerrar</Button>
          <Button
            v-if="previewMember"
            type="button"
            @click="isPreviewDialogOpen = false; openEditDialog(previewMember)"
          >
            Editar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog v-model:open="isDeleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar miembro?</AlertDialogTitle>
          <AlertDialogDescription>
            {{ memberPendingDeletion?.name }} perderá el acceso al panel. Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            class="bg-destructive text-white hover:bg-destructive/90"
            @click="confirmDeletion"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
