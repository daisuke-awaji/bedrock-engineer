import Store from 'electron-store'
import { ChatHistoryStore, ChatSession, ChatMessage } from '../../types/chat/history'

export class ChatSessionManager {
  private store: Store<ChatHistoryStore>

  constructor() {
    this.store = new Store<ChatHistoryStore>({
      name: 'chat-sessions',
      defaults: {
        sessions: {},
        recentSessions: []
      }
    })
  }

  createSession(agentId: string, modelId: string, systemPrompt?: string): string {
    const id = `session_${Date.now()}`
    const session: ChatSession = {
      id,
      title: `Chat ${new Date().toLocaleString()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      agentId,
      modelId,
      systemPrompt
    }

    const sessions = this.store.get('sessions')
    this.store.set('sessions', {
      ...sessions,
      [id]: session
    })

    this.updateRecentSessions(id)
    return id
  }

  addMessage(sessionId: string, message: ChatMessage): void {
    const sessions = this.store.get('sessions')
    const session = sessions[sessionId]
    if (!session) return

    session.messages.push(message)
    session.updatedAt = Date.now()

    this.store.set('sessions', {
      ...sessions,
      [sessionId]: session
    })

    this.updateRecentSessions(sessionId)
  }

  getSession(sessionId: string): ChatSession | null {
    const sessions = this.store.get('sessions')
    return sessions[sessionId] || null
  }

  updateSessionTitle(sessionId: string, title: string): void {
    const sessions = this.store.get('sessions')
    const session = sessions[sessionId]
    if (!session) return

    session.title = title
    session.updatedAt = Date.now()

    this.store.set('sessions', {
      ...sessions,
      [sessionId]: session
    })
  }

  deleteSession(sessionId: string): void {
    const sessions = this.store.get('sessions')
    const { [sessionId]: deletedSession, ...remainingSessions } = sessions
    console.log({ deletedSession })
    this.store.set('sessions', remainingSessions)

    const recentSessions = this.store.get('recentSessions')
    this.store.set(
      'recentSessions',
      recentSessions.filter((id) => id !== sessionId)
    )
  }

  private updateRecentSessions(sessionId: string): void {
    const recentSessions = this.store.get('recentSessions')
    const updated = [sessionId, ...recentSessions.filter((id) => id !== sessionId)].slice(0, 10)
    this.store.set('recentSessions', updated)
  }

  getRecentSessions(): ChatSession[] {
    const recentIds = this.store.get('recentSessions')
    const sessions = this.store.get('sessions')
    return recentIds
      .map((id) => sessions[id])
      .filter((id) => id.messages.length > 0) // TODO: そもそも Session を作成するタイミングを調整することで length === 0 の Session が含まれないようにする
      .filter(Boolean)
  }

  getAllSessions(): ChatSession[] {
    const sessions = this.store.get('sessions')
    return Object.values(sessions).filter((i) => i.messages.length > 0)
  }
}
