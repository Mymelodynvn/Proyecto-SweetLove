<!-- Página de proveedores del administrador -->
<script setup lang="ts">
import { IconDots, IconPlus } from '@tabler/icons-vue'
import type { Supplier, SupplierFormData } from '~/composables/use-suppliers'
import { Card, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'

useHead({ title: 'Proveedores | Sweet Love Admin' })

const { suppliers, loadFromStorage, addSupplier, updateSupplier, removeSupplier } = useSuppliers()

onMounted(loadFromStorage)

// Formulario vacío para un proveedor nuevo
const EMPTY_FORM = (): SupplierFormData => ({ name: '', email: '', phone: '' })

const isFormDialogOpen = ref(false)
const editingSupplierId = ref<number | null>(null)
const supplierForm = ref<SupplierFormData>(EMPTY_FORM())
const formError = ref('')

// Abre el diálogo para crear un proveedor con el formulario vacío
const openCreateDialog = () => {
  editingSupplierId.value = null
  supplierForm.value = EMPTY_FORM()
  formError.value = ''
  isFormDialogOpen.value = true
}

// Abre el diálogo con los datos de un proveedor existente, recibe supplier
const openEditDialog = (supplier: Supplier) => {
  editingSupplierId.value = supplier.id
  supplierForm.value = { name: supplier.name, email: supplier.email, phone: supplier.phone }
  formError.value = ''
  isFormDialogOpen.value = true
}

// Crea o actualiza el proveedor en el servidor según corresponda
const submitSupplierForm = async () => {
  formError.value = ''
  try {
    if (editingSupplierId.value === null) {
      await addSupplier(supplierForm.value)
    }
    else {
      await updateSupplier(editingSupplierId.value, supplierForm.value)
    }
    isFormDialogOpen.value = false
  } catch (error) {
    console.error('No fue posible guardar el proveedor.', error)
    formError.value = apiErrorMessage(error, 'No fue posible guardar el proveedor. Revisa la conexión con la base de datos.')
  }
}

const supplierPendingDeletion = ref<Supplier | null>(null)
const isDeleteDialogOpen = ref(false)

// Pide confirmación antes de eliminar un proveedor, recibe supplier
const requestDeletion = (supplier: Supplier) => {
  supplierPendingDeletion.value = supplier
  isDeleteDialogOpen.value = true
}

// Elimina el proveedor en el servidor tras la confirmación
const confirmDeletion = async () => {
  if (supplierPendingDeletion.value) {
    try {
      await removeSupplier(supplierPendingDeletion.value.id)
    } catch (error) {
      console.error('No fue posible eliminar el proveedor.', error)
    }
  }
  isDeleteDialogOpen.value = false
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="font-heading text-2xl font-bold">Proveedores</h1>
        <p class="text-muted-foreground">Proveedores registrados en la base de datos de Sweet Love.</p>
      </div>
      <Button @click="openCreateDialog">
        <IconPlus class="size-4" />
        Agregar proveedor
      </Button>
    </div>

    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Proveedor</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Usuario asociado</TableHead>
              <TableHead class="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="item in suppliers" :key="item.id">
              <TableCell class="font-medium">{{ item.name }}</TableCell>
              <TableCell>{{ item.email || 'No registrado' }}</TableCell>
              <TableCell>{{ item.phone }}</TableCell>
              <TableCell>{{ item.userId ?? 'Sin usuario' }}</TableCell>
              <TableCell class="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon" aria-label="Acciones del proveedor">
                      <IconDots class="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @select="openEditDialog(item)">Editar</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" @select="requestDeletion(item)">
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
            <TableRow v-if="!suppliers.length">
              <TableCell colspan="5" class="text-muted-foreground py-8 text-center">
                No hay proveedores registrados.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Dialog v-model:open="isFormDialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ editingSupplierId === null ? 'Agregar proveedor' : 'Editar proveedor' }}</DialogTitle>
          <DialogDescription>
            {{ editingSupplierId === null
              ? 'Registra quién te abastece un producto.'
              : 'Actualiza los datos de este proveedor.' }}
          </DialogDescription>
        </DialogHeader>
        <form id="supplier-form" class="flex flex-col gap-4" @submit.prevent="submitSupplierForm">
          <div class="flex flex-col gap-2">
            <Label for="supplier-name">Nombre</Label>
            <Input id="supplier-name" v-model="supplierForm.name" placeholder="Dulces del Valle" required />
          </div>
          <div class="flex flex-col gap-2">
            <Label for="supplier-email">Correo electrónico</Label>
            <Input id="supplier-email" v-model="supplierForm.email" type="email" placeholder="ventas@proveedor.com" />
          </div>
          <div class="flex flex-col gap-2">
            <Label for="supplier-phone">Teléfono</Label>
            <Input id="supplier-phone" v-model="supplierForm.phone" type="tel" placeholder="300 000 0000" required />
          </div>
          <p v-if="formError" class="text-destructive text-sm">{{ formError }}</p>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" @click="isFormDialogOpen = false">Cancelar</Button>
          <Button type="submit" form="supplier-form">
            {{ editingSupplierId === null ? 'Agregar proveedor' : 'Guardar cambios' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog v-model:open="isDeleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar proveedor?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará «{{ supplierPendingDeletion?.name }}». Los productos que tenía quedarán sin proveedor, pero no se eliminarán. Esta acción no se puede deshacer.
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
