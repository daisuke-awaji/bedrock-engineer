import { ElectronAPI } from '@electron-toolkit/preload'
import { ChatMessage, ChatSession } from '../types/chat/history'

interface ChatHistoryAPI {
  createSession(agentId: string, modelId: string, systemPrompt?: string): string
  addMessage(sessionId: string, message: ChatMessage): void
  getSession(sessionId: string): ChatSession | null
  updateSessionTitle(sessionId: string, title: string): void
  deleteSession(sessionId: string): void
  getRecentSessions(): ChatSession[]
  getAllSessions(): ChatSession[]
  setActiveSession(sessionId: string | undefined): void
  getActiveSessionId(): string | undefined
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
    store: any // 既存のstore型があればそれに合わせてください
    file: any // 既存のfile型があればそれに合わせてください
    tools: any // 既存のtools型があればそれに合わせてください
    chatHistory: ChatHistoryAPI
  }
}
