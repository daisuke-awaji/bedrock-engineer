import path from 'path'
import fs from 'fs'
import Store from 'electron-store'
import { ChatSession, ChatMessage } from '../../types/chat/history'
import { store } from '../../preload/store'

export class ChatSessionManager {
  private readonly sessionsDir: string
  private store: Store<{
    activeSessionId?: string
    recentSessions: string[]
  }>

  constructor() {
    const userDataPath = store.get('userDataPath')
    if (!userDataPath) {
      throw new Error('userDataPath is not set in store')
    }

    // セッションファイルを保存するディレクトリを作成
    this.sessionsDir = path.join(userDataPath, 'chat-sessions')
    fs.mkdirSync(this.sessionsDir, { recursive: true })

    // メタデータ用のストアを初期化
    this.store = new Store({
      name: 'chat-sessions-meta',
      defaults: {
        recentSessions: [] as string[]
      }
    })
  }

  private getSessionFilePath(sessionId: string): string {
    return path.join(this.sessionsDir, `${sessionId}.json`)
  }

  private readSessionFile(sessionId: string): ChatSession | null {
    const filePath = this.getSessionFilePath(sessionId)
    try {
      const data = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(data) as ChatSession
    } catch (error) {
      console.error(`Error reading session file ${sessionId}:`, error)
      return null
    }
  }

  private writeSessionFile(sessionId: string, session: ChatSession): void {
    const filePath = this.getSessionFilePath(sessionId)
    try {
      fs.writeFileSync(filePath, JSON.stringify(session, null, 2))
    } catch (error) {
      console.error(`Error writing session file ${sessionId}:`, error)
    }
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

    this.writeSessionFile(id, session)
    this.updateRecentSessions(id)
    return id
  }

  addMessage(sessionId: string, message: ChatMessage): void {
    const session = this.readSessionFile(sessionId)
    if (!session) return

    session.messages.push(message)
    session.updatedAt = Date.now()

    this.writeSessionFile(sessionId, session)
    this.updateRecentSessions(sessionId)
  }

  getSession(sessionId: string): ChatSession | null {
    return this.readSessionFile(sessionId)
  }

  updateSessionTitle(sessionId: string, title: string): void {
    const session = this.readSessionFile(sessionId)
    if (!session) return

    session.title = title
    session.updatedAt = Date.now()

    this.writeSessionFile(sessionId, session)
  }

  deleteSession(sessionId: string): void {
    const filePath = this.getSessionFilePath(sessionId)
    try {
      fs.unlinkSync(filePath)
    } catch (error) {
      console.error(`Error deleting session file ${sessionId}:`, error)
    }

    const recentSessions = this.store.get('recentSessions')
    this.store.set(
      'recentSessions',
      recentSessions.filter((id) => id !== sessionId)
    )
  }

  deleteAllSessions(): void {
    try {
      // セッションディレクトリ内のすべてのJSONファイルを削除
      const files = fs.readdirSync(this.sessionsDir)
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.sessionsDir, file)
          fs.unlinkSync(filePath)
        }
      }

      // メタデータをリセット
      this.store.set('recentSessions', [])
      this.store.delete('activeSessionId')

      console.log('All sessions have been deleted successfully')
    } catch (error) {
      console.error('Error deleting all sessions:', error)
    }
  }

  private updateRecentSessions(sessionId: string): void {
    const recentSessions = this.store.get('recentSessions')
    const updated = [sessionId, ...recentSessions.filter((id) => id !== sessionId)].slice(0, 10)
    this.store.set('recentSessions', updated)
  }

  getRecentSessions(): ChatSession[] {
    const recentIds = this.store.get('recentSessions')
    return recentIds
      .map((id) => this.readSessionFile(id))
      .filter((session): session is ChatSession => session !== null)
      .filter((session) => session.messages.length > 0)
  }

  getAllSessions(): ChatSession[] {
    try {
      const files = fs.readdirSync(this.sessionsDir)
      return files
        .filter((file) => file.endsWith('.json'))
        .map((file) => this.readSessionFile(file.replace('.json', '')))
        .filter((session): session is ChatSession => session !== null)
        .filter((session) => session.messages.length > 0)
    } catch (error) {
      console.error('Error reading sessions directory:', error)
      return []
    }
  }

  setActiveSession(sessionId: string | undefined): void {
    this.store.set('activeSessionId', sessionId)
  }

  getActiveSessionId(): string | undefined {
    return this.store.get('activeSessionId')
  }
}
