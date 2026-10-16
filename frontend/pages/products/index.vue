<!-- products/index.vue — catálogo de productos -->
<script setup lang="ts">
import { IconDots, IconPhotoUp, IconPlus, IconSearch, IconStarFilled, IconX } from '@tabler/icons-vue'
import type { Product, ProductFormData, ProductStatus } from '~/composables/use-products'
import { Card, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'

useHead({ title: 'Productos | Sweet Love Admin' })

const { products, loadFromStorage, addProduct, updateProduct, removeProduct, duplicateProduct } = useProducts()

onMounted(loadFromStorage)

const searchTerm = ref('')
const selectedCategory = ref('Todas')
// Opciones del filtro de categoría ("Todas" más las categorías conocidas)
const filterCategories = ['Todas', ...PRODUCT_CATEGORIES]

const filteredProducts = computed(() =>
  products.value.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.value.toLowerCase())
    const matchesCategory = selectedCategory.value === 'Todas' || product.category === selectedCategory.value
    return matchesSearch && matchesCategory
  }),
)

const statusBadgeClass: Record<ProductStatus, string> = {
  Disponible: 'bg-primary/15 text-primary border-transparent',
  'Poco stock': 'bg-chart-5/40 text-foreground border-transparent',
  Agotado: 'bg-destructive/10 text-destructive border-transparent',
}

// Formulario vacío para un producto nuevo
const EMPTY_FORM = (): ProductFormData => ({
  name: '',
  emoji: '🎂',
  image: null,
  category: 'Tortas',
  description: '',
  price: 0,
  stock: 0,
})

const imageFileInput = ref<HTMLInputElement | null>(null)
const imageError = ref('')
// Texto de la URL de imagen que escribe la persona y si la vista previa no pudo cargarla
const imageUrl = ref('')
const previewFailed = ref(false)

// Indica si un texto es una URL web de imagen válida (http o https, sin espacios, hasta 255 caracteres), recibe text
const isValidImageUrl = (text: string) => text.length <= 255 && /^https?:\/\/[^\s/$.?#][^\s]*$/i.test(text)

// Usa la URL escrita como imagen del producto y avisa si no es válida
const applyImageUrl = () => {
  imageError.value = ''
  const url = imageUrl.value.trim()
  if (!url) return
  if (!isValidImageUrl(url)) {
    imageError.value = 'La URL debe empezar con http:// o https://, no tener espacios y medir máximo 255 caracteres.'
    return
  }
  productForm.value.image = url
  imageUrl.value = url
}

// Muestra la URL en su campo solo si la imagen actual es una dirección web, recibe image
const syncImageUrl = (image: string | null) => {
  imageUrl.value = image && /^https?:\/\//i.test(image) ? image : ''
  previewFailed.value = false
}

// Procesa la imagen elegida (la reduce y la deja en el formulario), recibe changeEvent
const handleImageSelection = async (changeEvent: Event) => {
  imageError.value = ''
  const input = changeEvent.target
  if (!(input instanceof HTMLInputElement) || !input.files?.[0]) return
  try {
    productForm.value.image = await readImageAsDataUrl(input.files[0])
    imageUrl.value = ''
  }
  catch (readError) {
    imageError.value = 'No se pudo leer la imagen. Intenta con otro archivo.'
    console.warn('No se pudo procesar la imagen del producto.', readError)
  }
  finally {
    input.value = ''
  }
}

// Quita la imagen del formulario
const removeImage = () => {
  productForm.value.image = null
  imageUrl.value = ''
  imageError.value = ''
}

const isFormDialogOpen = ref(false)
const editingProductId = ref<number | null>(null)
const productForm = ref<ProductFormData>(EMPTY_FORM())

// Cuando cambia la imagen se vuelve a intentar la vista previa
watch(() => productForm.value.image, () => {
  previewFailed.value = false
})

// Abre el diálogo para crear un producto con el formulario vacío
const openCreateDialog = () => {
  editingProductId.value = null
  productForm.value = EMPTY_FORM()
  syncImageUrl(null)
  imageError.value = ''
  isFormDialogOpen.value = true
}

// Abre el diálogo con los datos de un producto existente, recibe product
const openEditDialog = (product: Product) => {
  editingProductId.value = product.id
  productForm.value = {
    name: product.name,
    emoji: product.emoji,
    image: product.image,
    category: product.category,
    description: product.description,
    price: product.price,
    stock: product.stock,
  }
  syncImageUrl(product.image)
  imageError.value = ''
  isFormDialogOpen.value = true
}

// Crea o actualiza el producto en el servidor según corresponda
const submitProductForm = async () => {
  const data: ProductFormData = {
    ...productForm.value,
    price: Number(productForm.value.price),
    stock: Number(productForm.value.stock),
  }
  try {
    if (editingProductId.value === null) {
      await addProduct(data)
    }
    else {
      await updateProduct(editingProductId.value, data)
    }
    isFormDialogOpen.value = false
  } catch (error) {
    console.error('No fue posible guardar el producto.', error)
    window.alert(apiErrorMessage(error, 'No fue posible guardar el producto. Revisa la conexión con la base de datos.'))
  }
}

const productPendingDeletion = ref<Product | null>(null)
const isDeleteDialogOpen = ref(false)

// Pide confirmación antes de eliminar un producto, recibe product
const requestDeletion = (product: Product) => {
  productPendingDeletion.value = product
  isDeleteDialogOpen.value = true
}

// Elimina el producto en el servidor tras la confirmación
const confirmDeletion = async () => {
  if (productPendingDeletion.value) {
    try {
      await removeProduct(productPendingDeletion.value.id)
    } catch (error) {
      console.error('No fue posible eliminar el producto.', error)
    }
  }
  isDeleteDialogOpen.value = false
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="font-heading text-2xl font-bold">Productos</h1>
        <p class="text-muted-foreground">Administra el catálogo de tortas y postres.</p>
      </div>
      <Button @click="openCreateDialog">
        <IconPlus class="size-4" />
        Nuevo producto
      </Button>
    </div>

    <Card>
      <CardContent class="flex flex-col gap-4">
        <div class="flex flex-wrap items-center gap-3">
          <div class="relative min-w-56 flex-1">
            <IconSearch class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input v-model="searchTerm" type="search" placeholder="Buscar producto…" class="pl-9" />
          </div>
          <Select v-model="selectedCategory">
            <SelectTrigger class="w-44">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="category in filterCategories" :key="category" :value="category">
                {{ category }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Calificación</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead class="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="product in filteredProducts" :key="product.id">
              <TableCell class="font-medium">
                <span class="flex items-center gap-2">
                  <img
                    v-if="product.image"
                    :src="product.image"
                    :alt="product.name"
                    class="size-9 shrink-0 rounded-lg object-cover"
                  >
                  <span v-else class="bg-secondary flex size-9 shrink-0 items-center justify-center rounded-lg text-lg">{{ product.emoji }}</span>
                  <span class="flex flex-col">
                    <span>{{ product.name }}</span>
                    <span class="text-muted-foreground max-w-64 truncate text-xs font-normal">{{ product.description }}</span>
                  </span>
                </span>
              </TableCell>
              <TableCell>{{ product.category }}</TableCell>
              <TableCell>{{ formatCop(product.price) }}</TableCell>
              <TableCell>{{ product.stock }}</TableCell>
              <TableCell>
                <span class="flex items-center gap-1.5">
                  <IconStarFilled class="text-chart-5 size-4" />
                  {{ product.rating }}
                </span>
              </TableCell>
              <TableCell>
                <Badge :class="statusBadgeClass[productStatus(product)]">{{ productStatus(product) }}</Badge>
              </TableCell>
              <TableCell class="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon" aria-label="Acciones del producto">
                      <IconDots class="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @select="openEditDialog(product)">Editar</DropdownMenuItem>
                    <DropdownMenuItem @select="duplicateProduct(product.id)">Duplicar</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" @select="requestDeletion(product)">
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
            <TableRow v-if="filteredProducts.length === 0">
              <TableCell colspan="7" class="text-muted-foreground py-8 text-center">
                No se encontraron productos con esos filtros.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Dialog v-model:open="isFormDialogOpen">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{{ editingProductId === null ? 'Nuevo producto' : 'Editar producto' }}</DialogTitle>
          <DialogDescription>
            {{ editingProductId === null
              ? 'Agrega una torta o postre al catálogo.'
              : 'Actualiza la información del producto.' }}
          </DialogDescription>
        </DialogHeader>
        <form id="product-form" class="flex flex-col gap-4" @submit.prevent="submitProductForm">
          <div class="flex flex-col gap-2">
            <Label for="product-image">Imagen del producto</Label>
            <div class="flex items-center gap-3">
              <div class="bg-muted flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
                <img
                  v-if="productForm.image && !previewFailed"
                  :src="productForm.image"
                  alt="Vista previa del producto"
                  class="size-full object-cover"
                  @load="previewFailed = false"
                  @error="previewFailed = true"
                >
                <span v-else class="text-2xl">{{ productForm.emoji }}</span>
              </div>
              <div class="flex flex-col items-start gap-1.5">
                <div class="flex gap-2">
                  <Button type="button" variant="outline" size="sm" @click="imageFileInput?.click()">
                    <IconPhotoUp class="size-4" />
                    {{ productForm.image ? 'Cambiar imagen' : 'Subir imagen' }}
                  </Button>
                  <Button v-if="productForm.image" type="button" variant="ghost" size="sm" @click="removeImage">
                    <IconX class="size-4" />
                    Quitar
                  </Button>
                </div>
                <div class="flex w-full items-center gap-2">
                  <Input
                    id="product-image-url"
                    v-model="imageUrl"
                    type="url"
                    placeholder="o pega la URL de la imagen (https://…)"
                    class="h-8 text-xs"
                    @keydown.enter.prevent="applyImageUrl"
                    @change="applyImageUrl"
                  />
                  <Button type="button" variant="outline" size="sm" @click="applyImageUrl">Usar URL</Button>
                </div>
                <p class="text-muted-foreground text-xs">
                  Sube un archivo o pega una URL. Si no pones imagen se mostrará el emoji.
                </p>
                <p v-if="previewFailed" class="text-destructive text-xs">No se pudo cargar la imagen de esa dirección.</p>
                <p v-if="imageError" class="text-destructive text-xs">{{ imageError }}</p>
              </div>
              <input
                id="product-image"
                ref="imageFileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleImageSelection"
              >
            </div>
          </div>
          <div class="grid grid-cols-[6rem_1fr] gap-4">
            <div class="flex flex-col gap-2">
              <Label for="product-emoji">Emoji</Label>
              <Select v-model="productForm.emoji">
                <SelectTrigger id="product-emoji" class="w-full justify-center text-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent class="w-52 min-w-0">
                  <div class="grid grid-cols-4 place-items-center gap-1 p-1">
                    <SelectItem
                      v-for="emoji in PRODUCT_EMOJIS"
                      :key="emoji"
                      :value="emoji"
                      class="data-checked:bg-secondary size-10 justify-center p-0 text-xl [&>span:first-child]:hidden"
                    >
                      {{ emoji }}
                    </SelectItem>
                  </div>
                </SelectContent>
              </Select>
            </div>
            <div class="flex flex-col gap-2">
              <Label for="product-name">Nombre</Label>
              <Input id="product-name" v-model="productForm.name" placeholder="Torta de zanahoria" required />
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <Label for="product-description">Descripción</Label>
            <Textarea id="product-description" v-model="productForm.description" rows="2" placeholder="Ingredientes, porciones, presentación…" />
          </div>
          <div class="flex flex-col gap-2">
            <Label for="product-category">Categoría</Label>
            <Select v-model="productForm.category">
              <SelectTrigger id="product-category" class="w-full">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="category in PRODUCT_CATEGORIES" :key="category" :value="category">
                  {{ category }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-2">
              <Label for="product-price">Precio (COP)</Label>
              <Input id="product-price" v-model="productForm.price" type="number" min="500" max="99999999" step="500" required />
            </div>
            <div class="flex flex-col gap-2">
              <Label for="product-stock">Cantidad disponible</Label>
              <Input id="product-stock" v-model="productForm.stock" type="number" min="0" max="99999" required />
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" @click="isFormDialogOpen = false">Cancelar</Button>
          <Button type="submit" form="product-form">
            {{ editingProductId === null ? 'Agregar producto' : 'Guardar cambios' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog v-model:open="isDeleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará «{{ productPendingDeletion?.name }}» del catálogo. Esta acción no se puede deshacer.
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
