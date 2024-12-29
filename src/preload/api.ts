import { Message, ToolConfiguration } from '@aws-sdk/client-bedrock-runtime'
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
  }
}

export type API = typeof api
