import { ChatMessage } from '../types/chat/history'
import { SessionMetadata } from '../types/chat/history'
import { ChatSessionManager } from '../main/store/chatSession'

const chatSessionManager = new ChatSessionManager()

export const chatHistory = {
  createSession(agentId: string, modelId: string, systemPrompt?: string) {
    return chatSessionManager.createSession(agentId, modelId, systemPrompt)
  },

  addMessage(sessionId: string, message: ChatMessage) {
    return chatSessionManager.addMessage(sessionId, message)
  },

  getSession(sessionId: string) {
    return chatSessionManager.getSession(sessionId)
  },

  updateSessionTitle(sessionId: string, title: string) {
    return chatSessionManager.updateSessionTitle(sessionId, title)
  },

  deleteSession(sessionId: string) {
    return chatSessionManager.deleteSession(sessionId)
  },

  deleteAllSessions() {
    return chatSessionManager.deleteAllSessions()
  },

  getRecentSessions(): SessionMetadata[] {
    return chatSessionManager.getRecentSessions()
  },

  getAllSessionMetadata(): SessionMetadata[] {
    return chatSessionManager.getAllSessionMetadata()
  },

  setActiveSession(sessionId: string | undefined) {
    return chatSessionManager.setActiveSession(sessionId)
  },

  getActiveSessionId() {
    return chatSessionManager.getActiveSessionId()
  }
}
