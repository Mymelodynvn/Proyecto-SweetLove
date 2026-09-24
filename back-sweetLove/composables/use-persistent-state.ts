/**
 * Archivo del proyecto Sweet Love.
 * Propósito: contiene la lógica correspondiente al módulo indicado por su nombre.
 * Los comentarios y nombres de funciones mantienen la intención del código en español.
 */
// Patrón compartido para guardar configuraciones locales del administrador cuando no existe una tabla equivalente en MySQL.
export const usePersistentState = <StateType>(
  stateKey: string,
  storageKey: string,
  defaultValue: () => StateType,
) => {
  const state = useState<StateType>(stateKey, defaultValue)

  const loadFromStorage = () => {
    const stored = localStorage.getItem(storageKey)
    if (!stored) return
    try {
      state.value = JSON.parse(stored)
    }
    catch (parseError) {
      console.warn(`Stored data for "${storageKey}" is corrupt, using defaults.`, parseError)
      localStorage.removeItem(storageKey)
    }
  }

  const persist = () => {
    localStorage.setItem(storageKey, JSON.stringify(state.value))
  }

  return { state, loadFromStorage, persist }
}
