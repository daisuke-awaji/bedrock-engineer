import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { api } from './api'
import { store } from './store'
import { file } from './file'
import { tools } from './tools/tools'

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('store', store)
    contextBridge.exposeInMainWorld('file', file)
    contextBridge.exposeInMainWorld('tools', tools)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.store = store
  // @ts-ignore (define in dts)
  window.file = file
  // @ts-ignore (define in dts)
  window.tools = tools
}
