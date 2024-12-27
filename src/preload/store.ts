import Store from 'electron-store'
import { LLM, InferenceParameters } from '../types/llm'
import { AgentChatConfig, SendMsgKey, ToolState } from '../types/agent-chat'
import { CustomAgent } from '../types/agent-chat'

type StoreScheme = {
  projectPath?: string
  llm?: LLM
  inferenceParams: InferenceParameters
  language: 'ja' | 'en'
  agentChatConfig: AgentChatConfig
  tools: ToolState[]
  websiteGenerator: {
    knowledgeBaseId: string
    enableKnowledgeBase: boolean
    modelId: string
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
  aws: {
    region: string
    accessKeyId: string
    secretAccessKey: string
  }
  customAgents: CustomAgent[]
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

  const language = electronStore.get('language')
  if (language === undefined) {
    electronStore.set('language', 'en')
  }

  // Initialize AWS settings if not present
  const awsConfig = electronStore.get('aws')
  if (!awsConfig) {
    electronStore.set('aws', {
      region: 'us-east-1',
      accessKeyId: '',
      secretAccessKey: ''
    })
  }

  // Initialize inference parameters if not present
  const inferenceParams = electronStore.get('inferenceParams')
  if (!inferenceParams) {
    electronStore.set('inferenceParams', {
      maxTokens: 4096,
      temperature: 0.5,
      topP: 0.9
    })
  }

  // Initialize custom agents if not present
  const customAgents = electronStore.get('customAgents')
  if (!customAgents) {
    electronStore.set('customAgents', [])
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
