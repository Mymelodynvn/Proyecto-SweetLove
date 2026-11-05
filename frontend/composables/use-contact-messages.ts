// use-contact-messages.ts — mensajes del formulario "Contáctanos" de la tienda (sección Novedades del panel)
export interface ContactMessage {
  id: number
  name: string
  phone: string
  subject: string
  message: string
  // Fecha y hora del mensaje en UTC (ISO 8601, "YYYY-MM-DDTHH:MM:SSZ")
  createdAt: string
}

// Composable de mensajes de contacto: estado compartido y operaciones sobre la API
export const useContactMessages = () => {
  const messages = useState<ContactMessage[]>('contact-messages-db', () => [])
  // Indica si la lista ya se pidió al servidor (evita repetir la carga)
  const loaded = useState('contact-messages-db-loaded', () => false)

  // Carga la lista una sola vez desde la API; si falla, deja la lista vacía y avisa en consola
  const load = async () => {
    if (loaded.value) return
    try {
      messages.value = await $fetch<ContactMessage[]>('/api/contact-messages')
    } catch (error) {
      messages.value = []
      console.warn('No se pudieron cargar los mensajes de contacto desde MySQL.', error)
    } finally {
      loaded.value = true
    }
  }

  // Vuelve a pedir la lista al servidor (para ver los mensajes nuevos); si falla, conserva la información actual
  const refresh = async () => {
    try { messages.value = await $fetch<ContactMessage[]>('/api/contact-messages') } catch { /* se conserva la información actual */ }
  }

  // Elimina un mensaje en el servidor y, si resulta bien, lo quita de la lista, recibe messageId
  const removeMessage = async (messageId: number) => {
    await $fetch(`/api/contact-messages/${messageId}`, { method: 'DELETE' })
    messages.value = messages.value.filter((message) => message.id !== messageId)
  }

  return { messages, loadFromStorage: load, removeMessage, refresh }
}
