// use-persistent-state.ts — estado guardado en el navegador
// Patrón compartido para guardar configuraciones locales del administrador cuando no existe una tabla equivalente en MySQL.
// Crea un estado reactivo con respaldo en localStorage, recibe stateKey, storageKey, defaultValue
export const usePersistentState = <StateType>(
  stateKey: string,
  storageKey: string,
  defaultValue: () => StateType,
) => {
  const state = useState<StateType>(stateKey, defaultValue)

  // Lee los datos guardados; si están dañados, los descarta y se queda con los valores por defecto
  const loadFromStorage = () => {
    const stored = localStorage.getItem(storageKey)
    if (!stored) return
    try {
      state.value = JSON.parse(stored)
    }
    catch (parseError) {
      console.warn(`Los datos guardados de "${storageKey}" están dañados; se usarán los valores por defecto.`, parseError)
      localStorage.removeItem(storageKey)
    }
  }

  // Guarda el estado actual en localStorage
  const persist = () => {
    localStorage.setItem(storageKey, JSON.stringify(state.value))
  }

  return { state, loadFromStorage, persist }
}
