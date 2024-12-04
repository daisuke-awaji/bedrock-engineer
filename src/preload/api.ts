import { Message, ToolConfiguration } from '@aws-sdk/client-bedrock-runtime'
import { executeTool } from './tools'
import models from './models'

export type CallConverseAPIProps = {
  modelId: string
  messages: Message[]
  system: [{ text: string }]
  toolConfig?: ToolConfiguration
}

const listModels = async () => {
  return models
}

export const api = {
  bedrock: {
    listModels,
    executeTool
  }
}

export type API = typeof api
