import { ConversationRole, ContentBlock } from '@aws-sdk/client-bedrock-runtime'
import { ToolState } from '../agent-chat'

type AttachedImage = {
  file: File
  preview: string
  base64: string
}

export interface ChatMessage {
  id: string
  role: ConversationRole
  content: ContentBlock[]
  timestamp: number
  metadata?: {
    modelId?: string
    tools?: ToolState[]
    images?: AttachedImage[]
  }
}

export interface ChatSession {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  messages: ChatMessage[]
  agentId: string
  systemPrompt?: string
  modelId: string
}

export interface ChatHistoryStore {
  sessions: {
    [key: string]: ChatSession
  }
  activeSessionId?: string
  recentSessions: string[] // 最近使用したセッションID（最大10個）
}