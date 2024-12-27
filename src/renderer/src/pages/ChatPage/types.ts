import { SendMsgKey, ToolState } from '../../../../types/agent-chat'

export type MessageRecommendation = {
  title: string
  content: string
}

export type Scenario = {
  title: string
  content: string
}

export type AgentScenarios = {
  [key: string]: Scenario[]
}

export type Agent = {
  name: string
  value: string
  description: string
  system: string
}

// Re-export types from agent-chat for convenience
export type { SendMsgKey, ToolState }
