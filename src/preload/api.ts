import { Message, ToolConfiguration } from '@aws-sdk/client-bedrock-runtime'
import { ipcRenderer } from 'electron'
import { executeTool } from './tools/tools'

export type CallConverseAPIProps = {
  modelId: string
  messages: Message[]
  system: [{ text: string }]
  toolConfig?: ToolConfiguration
}

export const api = {
  bedrock: {
    executeTool
  },
  contextMenu: {
    onContextMenuCommand: (callback: (command: string) => void) => {
      ipcRenderer.on('context-menu-command', (_event, command) => {
        callback(command)
      })
    }
  },
  images: {
    getLocalImage: (path: string) => ipcRenderer.invoke('get-local-image', path)
  }
}

export type API = typeof api