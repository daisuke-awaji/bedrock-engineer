/// <reference types="vite/client" />

import { ChatMessage, ChatSession } from '../../types/chat/history'

interface ChatHistoryAPI {
  createSession(agentId: string, modelId: string, systemPrompt?: string): string
  addMessage(sessionId: string, message: ChatMessage): void
  getSession(sessionId: string): ChatSession | null
  updateSessionTitle(sessionId: string, title: string): void
  deleteSession(sessionId: string): void
  getAllSessions(): ChatSession[]
  setActiveSession(sessionId: string | undefined): void
  getActiveSessionId(): string | undefined
}

declare global {
  interface Window extends PreloadAPIs {}
}
