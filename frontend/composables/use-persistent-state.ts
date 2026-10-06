/**
 * use-persistent-state.ts — estado guardado en el navegador.
 * Patrón compartido para datos del panel que no tienen tabla en MySQL (blog, equipo, preferencias).
 * Los datos viven en localStorage: son locales a ese navegador y no se comparten.
 */
// Patrón compartido para guardar configuraciones locales del administrador cuando no existe una tabla equivalente en MySQL.
/**
 * Crea un estado reactivo con respaldo en localStorage.
 * @param {string} stateKey Clave del estado compartido de Nuxt.
 * @param {string} storageKey Clave en localStorage.
 * @param {() => StateType} defaultValue Función que entrega el valor inicial.
 * @returns Estado `state` y las funciones loadFromStorage y persist.
 */
export const usePersistentState = <StateType>(
  stateKey: string,
  storageKey: string,
  defaultValue: () => StateType,
) => {
  const state = useState<StateType>(stateKey, defaultValue)

  /** Lee los datos guardados; si están dañados, los descarta y se queda con los valores por defecto. */
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

  /** Guarda el estado actual en localStorage. */
  const persist = () => {
    localStorage.setItem(storageKey, JSON.stringify(state.value))
  }

  return { state, loadFromStorage, persist }
}
