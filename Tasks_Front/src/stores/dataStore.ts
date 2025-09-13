import { create } from 'zustand'

interface DataState {
  loading: Record<string, boolean>
  cache: Record<string, any>
  setLoading: (key: string, loading: boolean) => void
  setCache: (key: string, data: any) => void
  getCache: (key: string) => any
  clearCache: (key?: string) => void
}

export const useDataStore = create<DataState>((set, get) => ({
  loading: {},
  cache: {},
  
  setLoading: (key, loading) => 
    set((state) => ({ loading: { ...state.loading, [key]: loading } })),
  
  setCache: (key, data) => 
    set((state) => ({ cache: { ...state.cache, [key]: data } })),
  
  getCache: (key) => get().cache[key],
  
  clearCache: (key) => {
    if (key) {
      set((state) => {
        const newCache = { ...state.cache }
        delete newCache[key]
        return { cache: newCache }
      })
    } else {
      set({ cache: {} })
    }
  }
}))
