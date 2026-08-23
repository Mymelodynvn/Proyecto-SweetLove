<script setup lang="ts">
import { IconCalendar, IconDots, IconPlus } from '@tabler/icons-vue'
import type { BlogPost, BlogPostFormData, PostStatus } from '~/composables/use-blog-posts'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
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

useHead({ title: 'Blog | Sweet Love Admin' })

const { posts, loadFromStorage, addPost, updatePost, togglePostStatus, removePost } = useBlogPosts()

onMounted(loadFromStorage)

const statusBadgeClass: Record<PostStatus, string> = {
  Publicado: 'bg-primary/15 text-primary border-transparent',
  Borrador: 'bg-chart-5/40 text-foreground border-transparent',
}

const EMPTY_FORM = (): BlogPostFormData => ({
  title: '',
  excerpt: '',
  content: '',
  category: 'Repostería',
  emoji: '🎂',
})

const isFormDialogOpen = ref(false)
const editingPostId = ref<number | null>(null)
const postForm = ref<BlogPostFormData>(EMPTY_FORM())

const openCreateDialog = () => {
  editingPostId.value = null
  postForm.value = EMPTY_FORM()
  isFormDialogOpen.value = true
}

const openEditDialog = (post: BlogPost) => {
  editingPostId.value = post.id
  postForm.value = {
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    emoji: post.emoji,
  }
  isFormDialogOpen.value = true
}

const readingPost = ref<BlogPost | null>(null)
const isReadDialogOpen = ref(false)

const openReadDialog = (post: BlogPost) => {
  readingPost.value = post
  isReadDialogOpen.value = true
}

const submitPostForm = () => {
  if (editingPostId.value === null) {
    addPost(postForm.value)
  }
  else {
    updatePost(editingPostId.value, postForm.value)
  }
  isFormDialogOpen.value = false
}

const postPendingDeletion = ref<BlogPost | null>(null)
const isDeleteDialogOpen = ref(false)

const requestDeletion = (post: BlogPost) => {
  postPendingDeletion.value = post
  isDeleteDialogOpen.value = true
}

const confirmDeletion = () => {
  if (postPendingDeletion.value) {
    removePost(postPendingDeletion.value.id)
  }
  isDeleteDialogOpen.value = false
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="font-heading text-2xl font-bold">Blog</h1>
        <p class="text-muted-foreground">Publica novedades, recetas e historias de Sweet Love.</p>
      </div>
      <Button @click="openCreateDialog">
        <IconPlus class="size-4" />
        Nueva entrada
      </Button>
    </div>

    <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <Card v-for="post in posts" :key="post.id" class="flex flex-col">
        <CardHeader>
          <div class="flex items-start justify-between gap-2">
            <span class="bg-secondary flex size-11 items-center justify-center rounded-lg text-xl">{{ post.emoji }}</span>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="icon" aria-label="Acciones de la entrada">
                  <IconDots class="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @select="openReadDialog(post)">Leer</DropdownMenuItem>
                <DropdownMenuItem @select="openEditDialog(post)">Editar</DropdownMenuItem>
                <DropdownMenuItem @select="togglePostStatus(post.id)">
                  {{ post.status === 'Publicado' ? 'Pasar a borrador' : 'Publicar' }}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" @select="requestDeletion(post)">
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardTitle class="leading-snug">
            <button type="button" class="text-left hover:underline" @click="openReadDialog(post)">
              {{ post.title }}
            </button>
          </CardTitle>
          <CardDescription>{{ post.excerpt }}</CardDescription>
        </CardHeader>
        <CardFooter class="mt-auto flex items-center justify-between">
          <span class="text-muted-foreground flex items-center gap-1.5 text-sm">
            <IconCalendar class="size-4" />
            {{ post.date }}
          </span>
          <span class="flex gap-2">
            <Badge variant="outline">{{ post.category }}</Badge>
            <Badge :class="statusBadgeClass[post.status]">{{ post.status }}</Badge>
          </span>
        </CardFooter>
      </Card>
    </div>

    <Dialog v-model:open="isFormDialogOpen">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{{ editingPostId === null ? 'Nueva entrada' : 'Editar entrada' }}</DialogTitle>
          <DialogDescription>
            {{ editingPostId === null
              ? 'Las entradas nuevas se crean como borrador; publícalas desde su menú.'
              : 'Actualiza el contenido de la entrada.' }}
          </DialogDescription>
        </DialogHeader>
        <form id="post-form" class="flex flex-col gap-4" @submit.prevent="submitPostForm">
          <div class="grid grid-cols-[6rem_1fr] gap-4">
            <div class="flex flex-col gap-2">
              <Label for="post-emoji">Emoji</Label>
              <Select v-model="postForm.emoji">
                <SelectTrigger id="post-emoji" class="w-full justify-center text-lg">
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
              <Label for="post-title">Título</Label>
              <Input id="post-title" v-model="postForm.title" placeholder="Título de la entrada" required />
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <Label for="post-excerpt">Resumen</Label>
            <Textarea id="post-excerpt" v-model="postForm.excerpt" rows="2" placeholder="Un adelanto de la entrada…" required />
          </div>
          <div class="flex flex-col gap-2">
            <Label for="post-content">Contenido (Markdown)</Label>
            <MarkdownEditor
              v-model="postForm.content"
              input-id="post-content"
              :rows="8"
              placeholder="## Título&#10;&#10;Escribe con **negritas**, *cursivas*, listas y [enlaces](https://…)"
              required
            />
          </div>
          <div class="flex flex-col gap-2">
            <Label for="post-category">Categoría</Label>
            <Select v-model="postForm.category">
              <SelectTrigger id="post-category" class="w-full">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="category in BLOG_CATEGORIES" :key="category" :value="category">
                  {{ category }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" @click="isFormDialogOpen = false">Cancelar</Button>
          <Button type="submit" form="post-form">
            {{ editingPostId === null ? 'Crear entrada' : 'Guardar cambios' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="isReadDialogOpen">
      <DialogContent class="max-h-[85svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div class="flex items-center gap-3">
            <span class="bg-secondary flex size-11 shrink-0 items-center justify-center rounded-lg text-xl">{{ readingPost?.emoji }}</span>
            <div class="flex flex-col gap-1 text-left">
              <DialogTitle class="leading-snug">{{ readingPost?.title }}</DialogTitle>
              <DialogDescription>
                {{ readingPost?.category }} · {{ readingPost?.date }}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <MarkdownPreview v-if="readingPost" :markdown="readingPost.content" />
      </DialogContent>
    </Dialog>

    <AlertDialog v-model:open="isDeleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar entrada?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará «{{ postPendingDeletion?.title }}» del blog. Esta acción no se puede deshacer.
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
