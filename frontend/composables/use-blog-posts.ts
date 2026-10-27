// use-blog-posts.ts — artículos del blog del panel
export type PostStatus = 'Publicado' | 'Borrador'

// Artículo del blog tal como lo maneja el panel
export interface BlogPost {
  id: number
  title: string
  excerpt: string
  // Contenido Markdown que se muestra mediante markdown-preview.vue.
  content: string
  category: string
  emoji: string
  date: string
  status: PostStatus
}

// Campos que el formulario permite editar (el id, la fecha y el estado los asigna el sistema)
export type BlogPostFormData = Omit<BlogPost, 'id' | 'date' | 'status'>

// Categorías disponibles al escribir un artículo
export const BLOG_CATEGORIES = ['Repostería', 'Recetas', 'Tendencias', 'Historia', 'Noticias']

// Blog: vacío hasta que la persona administradora publique sus propios artículos
const DEFAULT_POSTS = (): BlogPost[] => []

// Fecha de hoy en formato corto colombiano (p. ej. "5 oct 2026")
const formatToday = () =>
  new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })

// Composable del blog: lista de artículos y operaciones para crearlos, editarlos, publicarlos y borrarlos
export const useBlogPosts = () => {
  const { state: posts, loadFromStorage, persist } = usePersistentState<BlogPost[]>(
    'blog-posts',
    'sweet-love-admin-blog-posts',
    DEFAULT_POSTS,
  )

  // Calcula el siguiente identificador libre (máximo actual + 1)
  const nextId = () => posts.value.reduce((maxId, post) => Math.max(maxId, post.id), 0) + 1

  // Crea un artículo nuevo en estado Borrador y lo guarda, recibe data
  const addPost = (data: BlogPostFormData) => {
    posts.value.unshift({ ...data, id: nextId(), date: 'Sin publicar', status: 'Borrador' })
    persist()
  }

  // Actualiza el contenido de un artículo existente y lo guarda, recibe postId, data
  const updatePost = (postId: number, data: BlogPostFormData) => {
    const target = posts.value.find((post) => post.id === postId)
    if (!target) return
    Object.assign(target, data)
    persist()
  }

  // Alterna un artículo entre Publicado y Borrador, ajustando su fecha, recibe postId
  const togglePostStatus = (postId: number) => {
    const target = posts.value.find((post) => post.id === postId)
    if (!target) return
    if (target.status === 'Publicado') {
      target.status = 'Borrador'
      target.date = 'Sin publicar'
    }
    else {
      target.status = 'Publicado'
      target.date = formatToday()
    }
    persist()
  }

  // Elimina un artículo y guarda el cambio, recibe postId
  const removePost = (postId: number) => {
    posts.value = posts.value.filter((post) => post.id !== postId)
    persist()
  }

  return { posts, loadFromStorage, addPost, updatePost, togglePostStatus, removePost }
}
