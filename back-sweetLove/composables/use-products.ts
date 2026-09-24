/**
 * Sweet Love: archivo documentado en español.
 * Responsabilidad: contiene la lógica correspondiente a su nombre y ubicación.
 */
/**
 * Gestiona el catálogo del administrador.
 * Primero utiliza MySQL mediante la API y conserva un respaldo local si la base no responde.
 */
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

export type ProductFormData = Omit<Product, 'id' | 'rating'>
export type ProductStatus = 'Disponible' | 'Poco stock' | 'Agotado'
export const PRODUCT_CATEGORIES = ['Repostería', 'Tortas', 'Cupcakes', 'Cheesecakes', 'Galletas', 'Brownies', 'Postres']
export const PRODUCT_EMOJIS = ['🎂', '🍰', '🧁', '🍮', '🍓', '🍪', '🍫', '🥧', '🍩']
const LOW_STOCK_THRESHOLD = 5

export const productStatus = (product: Product): ProductStatus => {
  if (product.stock === 0) return 'Agotado'
  if (product.stock <= LOW_STOCK_THRESHOLD) return 'Poco stock'
  return 'Disponible'
}

export const useProducts = () => {
  const products = useState<Product[]>('products-db', () => [])
  const loaded = useState('products-db-loaded', () => false)

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

  const addProduct = async (data: ProductFormData) => {
    // La creación debe pasar por la API para que el registro quede guardado en MySQL.
    const response = await $fetch<{ producto: Record<string, unknown> }>('/api/products', {
      method: 'POST',
      body: data,
    })
    await refresh()
    return response.producto
  }

  const updateProduct = async (productId: number, data: ProductFormData) => {
    // La actualización se realiza directamente sobre la API y MySQL.
    await $fetch(`/api/products/${productId}`, {
      method: 'PUT',
      body: data,
    })
    await refresh()
  }

  const removeProduct = async (productId: number) => {
    try { await $fetch(`/api/products/${productId}`, { method: 'DELETE' }) }
    catch (error) { console.warn('No se pudo eliminar el producto en MySQL.', error); return }
    products.value = products.value.filter((product) => product.id !== productId)
  }

  const duplicateProduct = async (productId: number) => {
    const source = products.value.find((product) => product.id === productId)
    if (!source) return
    await addProduct({ ...source, name: `${source.name} (copia)` })
  }

  const refresh = async () => {
    try { products.value = await $fetch<Product[]>('/api/products') } catch { /* se conserva la información actual */ }
  }

  return { products, loadFromStorage: load, addProduct, updateProduct, removeProduct, duplicateProduct, refresh }
}
