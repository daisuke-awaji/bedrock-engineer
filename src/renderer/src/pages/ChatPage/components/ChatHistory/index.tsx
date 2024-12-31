import React, { useEffect, useState } from 'react'
import { ChatSession } from '@/types/chat/history'
import { useTranslation } from 'react-i18next'
import { FiMoreHorizontal, FiEdit2, FiTrash2 } from 'react-icons/fi'

interface ChatHistoryProps {
  onSessionSelect: (sessionId: string) => void
  currentSessionId?: string
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ onSessionSelect, currentSessionId }) => {
  const [recentSessions, setRecentSessions] = useState<ChatSession[]>([])
  const [editingSessionId, setEditingSessionId] = useState<string>()
  const [editTitle, setEditTitle] = useState('')
  const [menuOpenSessionId, setMenuOpenSessionId] = useState<string>()
  const [isComposing, setIsComposing] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    const sessions = window.chatHistory.getAllSessions()
    setRecentSessions(sessions)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (editingSessionId && !target.closest('.editing-input')) {
        setEditingSessionId(undefined)
      }
      setMenuOpenSessionId(undefined)
    }
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [editingSessionId])

  const handleSessionClick = (sessionId: string) => {
    onSessionSelect(sessionId)
  }

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    window.chatHistory.deleteSession(sessionId)
    setRecentSessions(window.chatHistory.getAllSessions())
    setMenuOpenSessionId(undefined)
  }

  const startEditing = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingSessionId(session.id)
    setEditTitle(session.title)
    setMenuOpenSessionId(undefined)
  }

  const saveTitle = (sessionId: string, e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation()
    if (editTitle.trim()) {
      window.chatHistory.updateSessionTitle(sessionId, editTitle.trim())
      setRecentSessions(window.chatHistory.getAllSessions())
    }
    setEditingSessionId(undefined)
  }

  const toggleMenu = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpenSessionId(menuOpenSessionId === sessionId ? undefined : sessionId)
  }

  const handleCompositionStart = () => {
    setIsComposing(true)
  }

  const handleCompositionEnd = () => {
    setIsComposing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent, sessionId: string) => {
    if (isComposing) return

    if (e.key === 'Enter') {
      saveTitle(sessionId, e)
    } else if (e.key === 'Escape') {
      setEditingSessionId(undefined)
    }
  }

  if (recentSessions.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">{t('No chat history')}</div>
    )
  }

  return (
    <div className="chat-history p-4">
      <h2 className="text-md font-semibold mb-4 text-gray-800 dark:text-gray-200">
        {t('Chat History')}
      </h2>
      <div className="session-list space-y-2">
        {recentSessions.map((session) => (
          <div
            key={session.id}
            onClick={() => handleSessionClick(session.id)}
            className={`session-item p-3 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200
              ${currentSessionId === session.id ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
          >
            <div className="flex justify-between items-center min-h-[32px]">
              {editingSessionId === session.id ? (
                <div
                  className="flex items-center w-full editing-input"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border rounded dark:bg-gray-800 dark:border-gray-600 min-w-0"
                    autoFocus
                    onKeyDown={(e) => handleKeyDown(e, session.id)}
                    onCompositionStart={handleCompositionStart}
                    onCompositionEnd={handleCompositionEnd}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <div className="relative flex-1 min-w-0 pr-2">
                    <h3
                      className="font-medium text-gray-800 dark:text-gray-200 text-sm truncate"
                      title={session.title}
                    >
                      {session.title}
                    </h3>
                  </div>
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={(e) => toggleMenu(session.id, e)}
                      className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <FiMoreHorizontal className="w-4 h-4" />
                    </button>
                    {menuOpenSessionId === session.id && (
                      <div
                        className="absolute right-1 mt-1 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="py-1">
                          <button
                            onClick={(e) => startEditing(session, e)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <FiEdit2 className="w-4 h-4" />
                            {t('Edit title')}
                          </button>
                          <button
                            onClick={(e) => handleDeleteSession(session.id, e)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 border-t border-gray-100 dark:border-gray-700"
                          >
                            <FiTrash2 className="w-4 h-4" />
                            {t('Delete')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
