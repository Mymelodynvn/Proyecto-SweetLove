// use-suppliers.ts — proveedores del panel
export interface Supplier {
  id: number
  name: string
  email: string
  phone: string
  userId: number | null
}

// Campos que el formulario permite editar (el id y el usuario asociado no se editan aquí)
export type SupplierFormData = Omit<Supplier, 'id' | 'userId'>

// Composable de proveedores: estado compartido y operaciones sobre la API
export const useSuppliers = () => {
  const suppliers = useState<Supplier[]>('suppliers-db', () => [])
  // Indica si los proveedores ya se pidieron al servidor (evita repetir la carga)
  const loaded = useState('suppliers-db-loaded', () => false)

  // Carga la lista una sola vez desde la API; si falla, deja la lista vacía y avisa en consola
  const load = async () => {
    if (loaded.value) return
    try {
      suppliers.value = await $fetch<Supplier[]>('/api/suppliers')
    } catch (error) {
      suppliers.value = []
      console.warn('No se pudieron cargar los proveedores desde MySQL.', error)
    } finally {
      loaded.value = true
    }
  }

  // Vuelve a pedir la lista al servidor; si falla, conserva la información actual
  const refresh = async () => {
    try { suppliers.value = await $fetch<Supplier[]>('/api/suppliers') } catch { /* se conserva la información actual */ }
  }

  // Crea un proveedor en el servidor y recarga la lista, recibe data
  const addSupplier = async (data: SupplierFormData) => {
    await $fetch('/api/suppliers', { method: 'POST', body: data })
    await refresh()
  }

  // Actualiza un proveedor en el servidor y recarga la lista, recibe supplierId, data
  const updateSupplier = async (supplierId: number, data: SupplierFormData) => {
    await $fetch(`/api/suppliers/${supplierId}`, { method: 'PUT', body: data })
    await refresh()
  }

  // Elimina un proveedor en el servidor y, si resulta bien, lo quita de la lista, recibe supplierId
  const removeSupplier = async (supplierId: number) => {
    await $fetch(`/api/suppliers/${supplierId}`, { method: 'DELETE' })
    suppliers.value = suppliers.value.filter((supplier) => supplier.id !== supplierId)
  }

  return { suppliers, loadFromStorage: load, addSupplier, updateSupplier, removeSupplier, refresh }
}
