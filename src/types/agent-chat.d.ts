import { Tool } from '@aws-sdk/client-bedrock-runtime'

export type AgentChatConfig = {
  automode: boolean
  ignoreFiles?: string[]
}

export type SendMsgKey = 'Enter' | 'Cmd+Enter'

export type ToolState = {
  enabled: boolean
} & Tool

export type Scenario = {
  title: string
  content: string
}

export type Agent = {
  id: string
  name: string
  description: string
  system: string
  scenarios: Scenario[]
}

export type CustomAgent = Agent & {
  isCustom?: boolean
}

export type AgentSettings = {
  customAgents: CustomAgent[]
}

export type KnowledgeBase = {
  knowledgeBaseId: string
  description: string
}
