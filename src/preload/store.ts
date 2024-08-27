import Store from 'electron-store'
import { LLM } from '../types/llm'
import { AgentChatConfig } from '../types/agent-chat'

type StoreScheme = {
  projectPath?: string
  llm?: LLM
  agentChatConfig: AgentChatConfig
  figma: {
    personalAccessToken: string
  }
  tavilySearch: {
    apikey: string
  }
}

const electronStore = new Store<StoreScheme>()
console.log('store path', electronStore.path)

const init = () => {
  const pjPath = electronStore.get('projectPath')
  if (!pjPath) {
    const defaultProjectPath = process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME']
    electronStore.set('projectPath', defaultProjectPath)
  }
}

init()

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
