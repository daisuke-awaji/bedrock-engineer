import { Tool } from '@aws-sdk/client-bedrock-runtime'

export type AgentChatConfig = {
  automode: boolean
  ignoreFiles?: string[]
}

export type SendMsgKey = 'Enter' | 'Cmd+Enter'

export type ToolState = {
  enabled: boolean
} & Tool
