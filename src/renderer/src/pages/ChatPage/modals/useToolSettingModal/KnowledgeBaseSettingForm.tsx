import { SettingsContextType } from '@renderer/contexts/SettingsContext'
import { useState } from 'react'

export const KnowledgeBaseSettingForm = ({
  knowledgeBases,
  setKnowledgeBases
}: {
  knowledgeBases: SettingsContextType['knowledgeBases']
  setKnowledgeBases: (knowledgeBase: SettingsContextType['knowledgeBases']) => void
}) => {
  const [newKnowledgeBaseId, setKnoledgeBaseId] = useState('')
  const [newDescription, setNewDescription] = useState('')

  const handleAddKB = () => {
    if (newKnowledgeBaseId.trim() && newDescription.trim()) {
      setKnowledgeBases([
        ...knowledgeBases,
        {
          knowledgeBaseId: newKnowledgeBaseId.trim(),
          description: newDescription.trim()
        }
      ])
      setKnoledgeBaseId('')
      setNewDescription('')
    }
  }

  const handleRemoveKB = (knowledgeBaseId: string) => {
    setKnowledgeBases(knowledgeBases.filter((cmd) => cmd.knowledgeBaseId !== knowledgeBaseId))
  }

  return (
    <div className="mt-4 space-y-4">
      {/* KnowledgeBase 追加フォーム */}
      <div className="flex flex-col gap-2">
        <div className="flex-grow">
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            Knowledge Base Id
          </label>
          <input
            type="text"
            value={newKnowledgeBaseId}
            onChange={(e) => setKnoledgeBaseId(e.target.value)}
            placeholder="e.g., BM7GYFCKIA"
            className="w-full p-2 text-sm border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
          />
        </div>
        <div className="flex-grow">
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Description</label>
          <input
            type="text"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="e.g., Stores in-house manuals and past inquiry history"
            className="w-full p-2 text-sm border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
          />
        </div>

        <button
          onClick={handleAddKB}
          disabled={!newKnowledgeBaseId.trim() || !newDescription.trim()}
          className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Add Knowledge Base
        </button>
      </div>

      {/* 登録済み KnowledgeBase リスト */}
      <div className="space-y-2">
        {knowledgeBases.map((kb) => (
          <div
            key={kb.knowledgeBaseId}
            className="flex flex-col p-3 text-sm bg-gray-100 dark:bg-gray-900 dark:text-gray-300 rounded"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono">Knowledge Base ID: {kb.knowledgeBaseId}</span>
              <button
                onClick={() => handleRemoveKB(kb.knowledgeBaseId)}
                className="text-red-500 hover:text-red-600"
              >
                Remove
              </button>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{kb.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
