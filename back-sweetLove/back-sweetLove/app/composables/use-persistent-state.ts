// Shared client-side persistence pattern for admin mock data (localStorage).
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
