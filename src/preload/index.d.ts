import { ElectronAPI } from '@electron-toolkit/preload'
import { API } from './api'
import { FileHandler } from './file'

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
    store: Store
    file: FileHandler
  }
}
