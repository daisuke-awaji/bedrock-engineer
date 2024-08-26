// import { ipcRenderer } from 'electron'

// export const store = {
//   get(key: string) {
//     return ipcRenderer.sendSync('electron-store-get', key)
//   },
//   set(property: string, value: string) {
//     ipcRenderer.send('electron-store-set', property, value)
//   }
// }

export const store = {
  counter: 0
}

export type Store = typeof store
