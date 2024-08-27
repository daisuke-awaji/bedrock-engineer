import { ElectronAPI } from '@electron-toolkit/preload'
import { API } from './api'
import { FileHandler } from './file'
import { ConfigStore } from './store'

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
    store: ConfigStore
    file: FileHandler
  }
}
