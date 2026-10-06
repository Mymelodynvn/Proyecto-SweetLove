/**
 * use-blog-posts.ts — artículos del blog del panel.
 * El esquema de la base de datos no tiene tabla de blog, por eso los artículos se
 * guardan en localStorage del navegador (ver usePersistentState). No se comparten entre equipos.
 */
export type PostStatus = 'Publicado' | 'Borrador'

/** Artículo del blog tal como lo maneja el panel. */
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

/** Campos que el formulario permite editar (el id, la fecha y el estado los asigna el sistema). */
export type BlogPostFormData = Omit<BlogPost, 'id' | 'date' | 'status'>

/** Categorías disponibles al escribir un artículo. */
export const BLOG_CATEGORIES = ['Repostería', 'Recetas', 'Tendencias', 'Historia', 'Noticias']

/**
 * Artículos de ejemplo que se muestran la primera vez, antes de que existan datos guardados.
 * @returns {BlogPost[]} Lista inicial de artículos.
 */
const DEFAULT_POSTS = (): BlogPost[] => [
  {
    id: 1,
    title: 'Cómo elegimos los ingredientes de nuestras tortas',
    excerpt: 'Detrás de cada torta hay una selección cuidadosa de ingredientes frescos y locales de Medellín.',
    content: '## Ingredientes con historia\n\nEn **Sweet Love** creemos que una torta memorable empieza mucho antes del horno.\n\n- Cacao de origen colombiano\n- Frutas frescas de plazas locales de Medellín\n- Mantequilla y lácteos de productores de Antioquia\n\n> Cada ingrediente cuenta una historia, y nosotras la horneamos.\n\nVisita nuestra [tienda](https://sweetlove.com) para conocer el catálogo completo.',
    category: 'Repostería',
    emoji: '🍫',
    date: '15 ago 2026',
    status: 'Publicado',
  },
  {
    id: 2,
    title: '5 tendencias de decoración para tortas de cumpleaños',
    excerpt: 'Desde el estilo vintage hasta los acabados en crema de mantequilla: lo que más piden nuestros clientes.',
    content: '## Lo que más piden este año\n\n1. Estilo *vintage* con bordes de crema\n2. Acabados en **buttercream** texturizado\n3. Flores naturales comestibles\n4. Colores pastel de la paleta Sweet Love\n5. Toppers personalizados\n\n¿Tienes una idea en mente? Escríbenos y la hacemos realidad.',
    category: 'Tendencias',
    emoji: '🎂',
    date: '8 ago 2026',
    status: 'Publicado',
  },
  {
    id: 3,
    title: 'La historia de Sweet Love: de Venezuela a Medellín',
    excerpt: 'Maryuri cuenta cómo empezó este emprendimiento y qué la inspira a crear momentos dulces.',
    content: '## Un sueño que cruzó fronteras\n\nMaryuri llegó a Medellín con una maleta llena de recetas y muchas ganas de **endulzar la vida** de quienes la rodean.\n\nHoy, más de *6 años después*, Sweet Love es sinónimo de repostería artesanal hecha con amor.',
    category: 'Historia',
    emoji: '🧁',
    date: '1 ago 2026',
    status: 'Publicado',
  },
  {
    id: 4,
    title: 'Receta: brownies artesanales para principiantes',
    excerpt: 'Una guía paso a paso para lograr brownies húmedos por dentro y crocantes por fuera.',
    content: '## Brownies para principiantes\n\n### Ingredientes\n\n- 200 g de chocolate oscuro\n- 150 g de mantequilla\n- 3 huevos\n- 180 g de azúcar\n- 90 g de harina de trigo\n\n### Preparación\n\n1. Derrite el chocolate con la mantequilla a fuego lento.\n2. Bate los huevos con el azúcar hasta blanquear.\n3. Integra todo con la harina **sin sobre batir**.\n4. Hornea 22 minutos a 175 °C.\n\n> El secreto: sácalos cuando el centro aún se vea húmedo.',
    category: 'Recetas',
    emoji: '🍪',
    date: 'Sin publicar',
    status: 'Borrador',
  },
]

/**
 * Fecha de hoy en formato corto colombiano (p. ej. "5 oct 2026").
 * @returns {string} Fecha formateada.
 */
const formatToday = () =>
  new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })

/**
 * Composable del blog: lista de artículos y operaciones para crearlos, editarlos, publicarlos y borrarlos.
 * @returns Estado `posts` y las funciones addPost, updatePost, togglePostStatus y removePost.
 */
export const useBlogPosts = () => {
  const { state: posts, loadFromStorage, persist } = usePersistentState<BlogPost[]>(
    'blog-posts',
    'sweet-love-admin-blog-posts',
    DEFAULT_POSTS,
  )

  /**
   * Calcula el siguiente identificador libre (máximo actual + 1).
   * @returns {number} Identificador nuevo.
   */
  const nextId = () => posts.value.reduce((maxId, post) => Math.max(maxId, post.id), 0) + 1

  /**
   * Crea un artículo nuevo en estado Borrador y lo guarda.
   * @param {BlogPostFormData} data Datos del formulario.
   */
  const addPost = (data: BlogPostFormData) => {
    posts.value.unshift({ ...data, id: nextId(), date: 'Sin publicar', status: 'Borrador' })
    persist()
  }

  /**
   * Actualiza el contenido de un artículo existente y lo guarda.
   * @param {number} postId Identificador del artículo.
   * @param {BlogPostFormData} data Nuevos datos.
   */
  const updatePost = (postId: number, data: BlogPostFormData) => {
    const target = posts.value.find((post) => post.id === postId)
    if (!target) return
    Object.assign(target, data)
    persist()
  }

  /**
   * Alterna un artículo entre Publicado y Borrador, ajustando su fecha.
   * @param {number} postId Identificador del artículo.
   */
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

  /**
   * Elimina un artículo y guarda el cambio.
   * @param {number} postId Identificador del artículo.
   */
  const removePost = (postId: number) => {
    posts.value = posts.value.filter((post) => post.id !== postId)
    persist()
  }

  return { posts, loadFromStorage, addPost, updatePost, togglePostStatus, removePost }
}
