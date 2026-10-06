// use-products.ts — catálogo de productos del panel
export interface Product {
  id: number
  name: string
  emoji: string
  image: string | null
  category: string
  description: string
  price: number
  stock: number
  rating: string
  active?: boolean
  supplierId?: number | null
}

// Campos que el formulario permite editar (el id y el rating no se editan)
export type ProductFormData = Omit<Product, 'id' | 'rating'>
// Estado de existencias que se muestra en la interfaz
export type ProductStatus = 'Disponible' | 'Poco stock' | 'Agotado'
// Categorías ofrecidas en el formulario y el filtro (aún no se guardan en la base)
export const PRODUCT_CATEGORIES = ['Repostería', 'Tortas', 'Cupcakes', 'Cheesecakes', 'Galletas', 'Brownies', 'Postres']
// Emojis ofrecidos para identificar un producto sin imagen
export const PRODUCT_EMOJIS = ['🎂', '🍰', '🧁', '🍮', '🍓', '🍪', '🍫', '🥧', '🍩']
// Unidades a partir de las cuales (o por debajo) un producto se marca como "Poco stock"
const LOW_STOCK_THRESHOLD = 5

// Calcula el estado de existencias de un producto, recibe product
export const productStatus = (product: Product): ProductStatus => {
  if (product.stock === 0) return 'Agotado'
  if (product.stock <= LOW_STOCK_THRESHOLD) return 'Poco stock'
  return 'Disponible'
}

// Composable de productos: estado compartido y operaciones sobre la API
export const useProducts = () => {
  const products = useState<Product[]>('products-db', () => [])
  // Indica si los productos ya se pidieron al servidor (evita repetir la carga)
  const loaded = useState('products-db-loaded', () => false)

  // Carga el catálogo una sola vez desde la API; si falla, deja la lista vacía y avisa en consola
  const load = async () => {
    if (loaded.value) return
    try {
      const response = await $fetch<Product[]>('/api/products')
      products.value = response
    } catch (error) {
      products.value = []
      console.warn('No se pudieron cargar los productos desde MySQL.', error)
    } finally {
      loaded.value = true
    }
  }

  // Crea un producto en el servidor y recarga la lista, recibe data
  const addProduct = async (data: ProductFormData) => {
    // La creación debe pasar por la API para que el registro quede guardado en MySQL.
    const response = await $fetch<{ producto: Record<string, unknown> }>('/api/products', {
      method: 'POST',
      body: data,
    })
    await refresh()
    return response.producto
  }

  // Actualiza un producto en el servidor y recarga la lista, recibe productId, data
  const updateProduct = async (productId: number, data: ProductFormData) => {
    // La actualización se realiza directamente sobre la API y MySQL.
    await $fetch(`/api/products/${productId}`, {
      method: 'PUT',
      body: data,
    })
    await refresh()
  }

  // Elimina un producto en el servidor y, si resulta bien, lo quita de la lista, recibe productId
  const removeProduct = async (productId: number) => {
    try { await $fetch(`/api/products/${productId}`, { method: 'DELETE' }) }
    catch (error) { console.warn('No se pudo eliminar el producto en MySQL.', error); return }
    products.value = products.value.filter((product) => product.id !== productId)
  }

  // Crea una copia del producto con " (copia)" al final del nombre, recibe productId
  const duplicateProduct = async (productId: number) => {
    const source = products.value.find((product) => product.id === productId)
    if (!source) return
    await addProduct({ ...source, name: `${source.name} (copia)` })
  }

  // Vuelve a pedir el catálogo al servidor; si falla, conserva la lista actual
  const refresh = async () => {
    try { products.value = await $fetch<Product[]>('/api/products') } catch { /* se conserva la información actual */ }
  }

  return { products, loadFromStorage: load, addProduct, updateProduct, removeProduct, duplicateProduct, refresh }
}
