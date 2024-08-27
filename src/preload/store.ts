import Store from 'electron-store'
import { LLM } from '../types/llm'

type StoreScheme = {
  projectPath?: string
  llm?: LLM
}

const electronStore = new Store<StoreScheme>()
console.log('store path', electronStore.path)

type Key = keyof StoreScheme
export const store = {
  get<T extends Key>(key: T) {
    return electronStore.get(key)
  },
  set<T extends Key>(key: T, value: StoreScheme[T]) {
    return electronStore.set(key, value)
  }
}

export type ConfigStore = typeof store
