<!-- team/index.vue — equipo de trabajo -->
<script setup lang="ts">
import {
  IconCheck,
  IconDots,
  IconEye,
  IconEyeOff,
  IconMail,
  IconPhone,
  IconUserPlus,
  IconX,
} from '@tabler/icons-vue'
import type { AdminGrantResult, PermissionKey, TeamMember, TeamMemberFormData, TeamRoleName } from '~/composables/use-team'
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

const { members, loadFromStorage, addMember, updateMember, toggleMemberActive, removeMember, grantAdminAccess, setAdminAccess } = useTeam()

onMounted(loadFromStorage)

const roleBadgeClass: Record<TeamRoleName, string> = {
  Administrador: 'bg-chart-5/40 text-foreground border-transparent',
  Gerente: 'bg-primary/15 text-primary border-transparent',
  Vendedor: 'bg-secondary text-secondary-foreground border-transparent',
  Repostero: 'bg-chart-3/30 text-foreground border-transparent',
}

// Iniciales de un nombre (máximo dos letras), recibe name
const memberInitials = (name: string) =>
  name
    .split(' ')
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')

// Texto legible de un permiso, recibe permissionKey
const permissionLabel = (permissionKey: PermissionKey) =>
  PERMISSIONS.find((permission) => permission.key === permissionKey)?.label ?? permissionKey

// Descripción de lo que puede hacer un rol, recibe roleName
const roleDescription = (roleName: TeamRoleName) =>
  TEAM_ROLES.find((role) => role.name === roleName)?.description ?? ''

// Formulario vacío para un miembro nuevo (rol Vendedor con sus permisos por defecto)
const EMPTY_FORM = (): TeamMemberFormData => ({
  name: '',
  email: '',
  phone: '',
  avatar: null,
  role: 'Vendedor',
  permissions: rolePermissions('Vendedor'),
  active: true,
  userId: null,
})

const isFormDialogOpen = ref(false)
const editingMemberId = ref<number | null>(null)
const editingIsOwner = ref(false)
const memberForm = ref<TeamMemberFormData>(EMPTY_FORM())

// Contraseña de la cuenta que se crea para un Administrador, y estado del guardado
const memberPassword = ref('')
const showMemberPassword = ref(false)
const formError = ref('')
const isSaving = ref(false)

// Avisos de la página: lo que pasó con la cuenta (pageNotice) o por qué no se pudo cambiar el acceso (pageError)
const pageNotice = ref('')
const pageError = ref('')

// El acceso al panel lo tiene solo el rol Administrador con el acceso activo
const grantsPanelAccess = computed(() => memberForm.value.role === 'Administrador' && memberForm.value.active)
// Se pide contraseña cuando hay que crear la cuenta (todavía no tiene una vinculada)
const needsPassword = computed(() => grantsPanelAccess.value && !memberForm.value.userId)

// Reinicia la contraseña y los avisos del formulario al abrirlo
const resetFormState = () => {
  memberPassword.value = ''
  showMemberPassword.value = false
  formError.value = ''
}

// Abre el diálogo para agregar un miembro
const openCreateDialog = () => {
  editingMemberId.value = null
  editingIsOwner.value = false
  memberForm.value = EMPTY_FORM()
  resetFormState()
  isFormDialogOpen.value = true
}

// Abre el diálogo con los datos de un miembro existente, recibe member
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
    userId: member.userId ?? null,
  }
  resetFormState()
  isFormDialogOpen.value = true
}

// Al seleccionar un rol se restablecen los permisos predeterminados; después pueden
// ajustarse de forma individual.
const applyRoleDefaults = (selectedValue: unknown) => {
  const role = TEAM_ROLES.find((definition) => definition.name === selectedValue)
  if (!role) return
  memberForm.value.role = role.name
  memberForm.value.permissions = [...role.permissions]
}

// Indica si el formulario tiene activado un permiso, recibe permissionKey
const isPermissionGranted = (permissionKey: PermissionKey) =>
  memberForm.value.permissions.includes(permissionKey)

// Activa o desactiva un permiso individual en el formulario, recibe permissionKey
const togglePermission = (permissionKey: PermissionKey) => {
  if (isPermissionGranted(permissionKey)) {
    memberForm.value.permissions = memberForm.value.permissions.filter((key) => key !== permissionKey)
  }
  else {
    memberForm.value.permissions = [...memberForm.value.permissions, permissionKey]
  }
}

// Texto que cuenta qué pasó con la cuenta al dar acceso al panel, recibe result, name
const accessMessage = (result: AdminGrantResult, name: string) => {
  if (result.outcome === 'created') return `${name} ya puede iniciar sesión en el panel con su correo y la contraseña que escribiste.`
  if (result.outcome === 'promoted') {
    return result.passwordSet
      ? `La cuenta de ${name} ahora es administradora y usa la contraseña que escribiste.`
      : `${name} ya tenía cuenta en la tienda: ahora también es administradora y entra con su misma contraseña.`
  }
  return `${name} ya era administradora; quedó vinculada con su cuenta.`
}

// Agrega el miembro (si es nuevo) o actualiza el existente; si el rol es Administrador crea o activa su cuenta del panel, y si deja de serlo se la quita
const submitMemberForm = async () => {
  formError.value = ''
  pageNotice.value = ''
  pageError.value = ''
  isSaving.value = true
  try {
    const data: TeamMemberFormData = { ...memberForm.value }
    const original = members.value.find((member) => member.id === editingMemberId.value)
    const hadAccess = Boolean(original?.userId) && original?.role === 'Administrador' && original.active
    let notice = ''

    if (grantsPanelAccess.value && !data.userId) {
      const result = await grantAdminAccess({ name: data.name, email: data.email, phone: data.phone, password: memberPassword.value })
      data.userId = result.userId
      notice = accessMessage(result, data.name)
    }
    else if (data.userId) {
      await setAdminAccess(data.userId, grantsPanelAccess.value)
      if (grantsPanelAccess.value !== hadAccess) {
        notice = grantsPanelAccess.value ? `${data.name} volvió a tener acceso al panel.` : `${data.name} ya no tiene acceso al panel.`
      }
    }

    if (editingMemberId.value === null) {
      addMember(data)
    }
    else {
      updateMember(editingMemberId.value, data)
    }
    pageNotice.value = notice
    isFormDialogOpen.value = false
  }
  catch (error) {
    formError.value = apiErrorMessage(error, 'No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.')
  }
  finally {
    isSaving.value = false
  }
}

// Activa o suspende el acceso de un miembro; si es administrador con cuenta, también se lo da o se lo quita en el servidor, recibe member
const toggleAccess = async (member: TeamMember) => {
  pageNotice.value = ''
  pageError.value = ''
  const nextActive = !member.active

  if (member.role === 'Administrador') {
    if (member.userId) {
      try {
        await setAdminAccess(member.userId, nextActive)
      }
      catch (error) {
        pageError.value = apiErrorMessage(error, 'No se pudo cambiar el acceso. Inténtalo de nuevo.')
        return
      }
    }
    else if (nextActive) {
      pageError.value = `${member.name} todavía no tiene cuenta para entrar al panel. Edita a la persona y escribe una contraseña para crearla.`
      return
    }
  }

  toggleMemberActive(member.id)
}

const previewMember = ref<TeamMember | null>(null)
const isPreviewDialogOpen = ref(false)

// Abre la tarjeta de detalle de un miembro, recibe member
const openPreviewDialog = (member: TeamMember) => {
  previewMember.value = member
  isPreviewDialogOpen.value = true
}

const memberPendingDeletion = ref<TeamMember | null>(null)
const isDeleteDialogOpen = ref(false)

// Pide confirmación antes de eliminar un miembro, recibe member
const requestDeletion = (member: TeamMember) => {
  memberPendingDeletion.value = member
  isDeleteDialogOpen.value = true
}

// Elimina el miembro seleccionado tras la confirmación; si tenía cuenta de administrador, primero le quita el acceso al panel
const confirmDeletion = async () => {
  const member = memberPendingDeletion.value
  isDeleteDialogOpen.value = false
  if (!member) return

  pageNotice.value = ''
  pageError.value = ''
  if (member.userId) {
    try {
      await setAdminAccess(member.userId, false)
    }
    catch (error) {
      pageError.value = apiErrorMessage(error, 'No se pudo quitar el acceso al panel, así que no se eliminó a la persona. Inténtalo de nuevo.')
      return
    }
  }
  removeMember(member.id)
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="font-heading text-2xl font-bold">Equipo</h1>
        <p class="text-muted-foreground">
          Tu equipo de trabajo. Solo las personas con rol Administrador tienen cuenta para entrar al panel.
        </p>
      </div>
      <Button @click="openCreateDialog">
        <IconUserPlus class="size-4" />
        Agregar miembro
      </Button>
    </div>

    <p v-if="pageNotice" class="bg-primary/10 text-foreground rounded-lg px-4 py-3 text-sm" role="status">{{ pageNotice }}</p>
    <p v-if="pageError" class="bg-destructive/10 text-destructive rounded-lg px-4 py-3 text-sm" role="alert">{{ pageError }}</p>

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
                    <DropdownMenuItem v-if="!member.isOwner" @select="toggleAccess(member)">
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
              ? 'Agrega a una persona a tu equipo. Con el rol Administrador también podrá entrar al panel.'
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
              <Input id="member-email" v-model="memberForm.email" type="email" placeholder="persona@sweetlove.com" :disabled="Boolean(memberForm.userId)" required />
              <p v-if="memberForm.userId" class="text-muted-foreground text-xs">Es el correo de su cuenta del panel y no se puede cambiar.</p>
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
            <p class="text-muted-foreground text-xs">
              {{ memberForm.role === 'Administrador'
                ? 'Podrá iniciar sesión en el panel con su correo y su contraseña.'
                : 'Este rol es solo un registro del equipo: no tiene cuenta para entrar al panel.' }}
            </p>
          </div>
          <div v-if="needsPassword" class="flex flex-col gap-2">
            <Label for="member-password">Contraseña de acceso al panel</Label>
            <div class="relative">
              <Input
                id="member-password"
                v-model="memberPassword"
                :type="showMemberPassword ? 'text' : 'password'"
                class="pr-10"
                autocomplete="new-password"
                @keydown.space.prevent
              />
              <button
                type="button"
                class="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center px-3"
                :aria-label="showMemberPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                @click="showMemberPassword = !showMemberPassword"
              >
                <IconEyeOff v-if="showMemberPassword" class="size-4" />
                <IconEye v-else class="size-4" />
              </button>
            </div>
            <p class="text-muted-foreground text-xs">{{ PASSWORD_RULES_TEXT }}</p>
            <p class="text-muted-foreground text-xs">
              Entrégasela a la persona; luego puede cambiarla en su perfil. Si ese correo ya tiene cuenta en la tienda, se conserva su contraseña y puedes dejar este campo vacío.
            </p>
          </div>
          <div class="flex flex-col gap-2">
            <Label>Permisos</Label>
            <p class="text-muted-foreground -mt-1 text-xs">
              El rol define los permisos base; puedes ajustarlos individualmente. Por ahora son una referencia del equipo: quien es Administrador entra a todo el panel.
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
          <p v-if="formError" class="text-destructive text-sm" role="alert">{{ formError }}</p>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" @click="isFormDialogOpen = false">Cancelar</Button>
          <Button type="submit" form="member-form" :disabled="isSaving">
            {{ isSaving ? 'Guardando…' : editingMemberId === null ? 'Agregar miembro' : 'Guardar cambios' }}
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
            {{ memberPendingDeletion?.name }} se quitará del equipo{{ memberPendingDeletion?.userId ? ' y perderá el acceso al panel (su cuenta pasa a ser de cliente de la tienda)' : '' }}. Esta acción no se puede deshacer.
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
