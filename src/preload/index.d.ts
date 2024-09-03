import { ElectronAPI } from '@electron-toolkit/preload'
import { API } from './api'
import { FileHandler } from './file'
import { ConfigStore } from './store'
import { Tool } from '@aws-sdk/client-bedrock-runtime'

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
    store: ConfigStore
    file: FileHandler
    tools: Tool[]
  }
}
