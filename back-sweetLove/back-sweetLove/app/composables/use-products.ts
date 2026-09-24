export interface Product {
  id: number
  name: string
  emoji: string
  // Downscaled data URL; the emoji is the fallback when no photo is set.
  image: string | null
  category: string
  description: string
  price: number
  stock: number
  rating: string
}

export type ProductFormData = Omit<Product, 'id' | 'rating'>

export type ProductStatus = 'Disponible' | 'Poco stock' | 'Agotado'

export const PRODUCT_CATEGORIES = ['Tortas', 'Cupcakes', 'Cheesecakes', 'Galletas', 'Brownies', 'Postres']

export const PRODUCT_EMOJIS = ['🎂', '🍰', '🧁', '🍮', '🍓', '🍪', '🍫', '🥧', '🍩', '🍭', '🍬', '🥛', '☕', '🍨', '🍯', '🥐']

const LOW_STOCK_THRESHOLD = 5

export const productStatus = (product: Product): ProductStatus => {
  if (product.stock === 0) return 'Agotado'
  if (product.stock <= LOW_STOCK_THRESHOLD) return 'Poco stock'
  return 'Disponible'
}

const DEFAULT_PRODUCTS = (): Product[] => [
  { id: 1, name: 'Torta de chocolate', emoji: '🎂', image: null, category: 'Tortas', description: 'Bizcocho húmedo de cacao con ganache.', price: 120000, stock: 12, rating: '5.0' },
  { id: 2, name: 'Torta red velvet', emoji: '🍰', image: null, category: 'Tortas', description: 'Clásica red velvet con frosting de queso crema.', price: 135000, stock: 8, rating: '4.9' },
  { id: 3, name: 'Torta personalizada de cumpleaños', emoji: '🎂', image: null, category: 'Tortas', description: 'Diseño a medida según la ocasión.', price: 150000, stock: 5, rating: '5.0' },
  { id: 4, name: 'Cupcakes de fresa (x6)', emoji: '🧁', image: null, category: 'Cupcakes', description: 'Caja de 6 con buttercream de fresa natural.', price: 36000, stock: 24, rating: '4.8' },
  { id: 5, name: 'Cupcakes de vainilla (x6)', emoji: '🧁', image: null, category: 'Cupcakes', description: 'Caja de 6 con vainilla de Madagascar.', price: 32000, stock: 4, rating: '4.7' },
  { id: 6, name: 'Cheesecake de maracuyá', emoji: '🍮', image: null, category: 'Cheesecakes', description: 'Base de galleta y coulis de maracuyá.', price: 95000, stock: 3, rating: '4.9' },
  { id: 7, name: 'Cheesecake de frutos rojos', emoji: '🍓', image: null, category: 'Cheesecakes', description: 'Horneado lento con salsa de frutos rojos.', price: 98000, stock: 6, rating: '4.8' },
  { id: 8, name: 'Galletas decoradas (x12)', emoji: '🍪', image: null, category: 'Galletas', description: 'Docena decorada con glasé real.', price: 48000, stock: 0, rating: '4.8' },
  { id: 9, name: 'Brownies artesanales (x9)', emoji: '🍫', image: null, category: 'Brownies', description: 'Con nuez y centro fudgy.', price: 42000, stock: 15, rating: '4.7' },
  { id: 10, name: 'Postre de tres leches', emoji: '🥛', image: null, category: 'Postres', description: 'Porción individual bañada en tres leches.', price: 18000, stock: 10, rating: '4.9' },
]

export const useProducts = () => {
  const { state: products, loadFromStorage, persist } = usePersistentState<Product[]>(
    'products',
    'sweet-love-admin-products',
    DEFAULT_PRODUCTS,
  )

  const nextId = () =>
    products.value.reduce((maxId, product) => Math.max(maxId, product.id), 0) + 1

  const addProduct = (data: ProductFormData) => {
    products.value.push({ ...data, id: nextId(), rating: '—' })
    persist()
  }

  const updateProduct = (productId: number, data: ProductFormData) => {
    const target = products.value.find((product) => product.id === productId)
    if (!target) return
    Object.assign(target, data)
    persist()
  }

  const removeProduct = (productId: number) => {
    products.value = products.value.filter((product) => product.id !== productId)
    persist()
  }

  const duplicateProduct = (productId: number) => {
    const source = products.value.find((product) => product.id === productId)
    if (!source) return
    products.value.push({ ...source, id: nextId(), name: `${source.name} (copia)` })
    persist()
  }

  return { products, loadFromStorage, addProduct, updateProduct, removeProduct, duplicateProduct }
}
