import Store from 'electron-store'
import { LLM } from '../types/llm'
import { AgentChatConfig, SendMsgKey, ToolState } from '../types/agent-chat'

type StoreScheme = {
  projectPath?: string
  llm?: LLM
  agentChatConfig: AgentChatConfig
  tools: ToolState[]
  figma: {
    personalAccessToken: string
  }
  websiteGenerator: {
    // 今だけ Knowledge base にしておく、今後透過的に GitHub のデータソースを元に推論できるUIと機能を実装する
    knowledgeBaseId: string
    enableKnowledgeBase: boolean
  }
  tavilySearch: {
    apikey: string
  }
  apiEndpoint: string
  advancedSetting: {
    keybinding: {
      sendMsgKey: SendMsgKey
    }
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

  const keybinding = electronStore.get('advancedSetting')?.keybinding
  if (!keybinding) {
    electronStore.set('advancedSetting', {
      keybinding: {
        sendMsgKey: 'Enter'
      }
    })
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
