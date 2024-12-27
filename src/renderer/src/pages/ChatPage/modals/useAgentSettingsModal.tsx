import React, { useState } from 'react'
import useModal from '@renderer/hooks/useModal'
import { CustomAgent } from '@/types/agent-chat'
import { nanoid } from 'nanoid'
import { FiPlus, FiTrash, FiEdit2 } from 'react-icons/fi'
import useSetting from '@renderer/hooks/useSetting'

const AgentForm: React.FC<{
  agent?: CustomAgent
  onSave: (agent: CustomAgent) => void
  onCancel: () => void
}> = ({ agent, onSave, onCancel }) => {
  const [formData, setFormData] = useState<CustomAgent>({
    id: agent?.id || `custom_agent_${nanoid(8)}`, // 自動生成された識別子
    name: agent?.name || '',
    description: agent?.description || '',
    system: agent?.system || '',
    scenarios: agent?.scenarios || [],
    isCustom: true
  })

  const [newScenario, setNewScenario] = useState({ title: '', content: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const addScenario = () => {
    if (newScenario.title && newScenario.content) {
      setFormData({
        ...formData,
        scenarios: [...formData.scenarios, newScenario]
      })
      setNewScenario({ title: '', content: '' })
    }
  }

  const removeScenario = (index: number) => {
    setFormData({
      ...formData,
      scenarios: formData.scenarios.filter((_, i) => i !== index)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <p className="text-xs text-gray-500 mb-1">
          エージェントの表示名を入力してください。（例：プログラミング講師、技術ドキュメント作成者）
        </p>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
          placeholder="例: プログラミングメンター"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <p className="text-xs text-gray-500 mb-1">
          このエージェントの役割や特徴を簡潔に説明してください。
        </p>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
          placeholder="例: プログラミングの基礎から応用までを教えるAIメンター"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">System Prompt</label>
        <p className="text-xs text-gray-500 mb-1">
          エージェントの振る舞いを定義するシステムプロンプトを入力してください。
          どのような役割を果たし、どのように応答するべきかを詳細に記述します。
        </p>
        <textarea
          value={formData.system}
          onChange={(e) => setFormData({ ...formData, system: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-96"
          required
          placeholder="例: あなたは経験豊富なプログラミングメンターです。以下の方針で指導を行ってください：
- 初心者にも分かりやすい言葉で説明する
- 具体的なコード例を示しながら説明する
- 学習者の質問に対して丁寧に回答する
- 適切なフィードバックを提供し、理解度を確認する"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Scenarios（オプション）</label>
        <p className="text-xs text-gray-500 mb-1">
          よく使用するやり取りのパターンをシナリオとして登録できます。
          シナリオのタイトルと具体的な内容を入力してください。
        </p>
        <div className="space-y-2">
          {formData.scenarios.map((scenario, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={scenario.title}
                readOnly
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => removeScenario(index)}
                className="p-2 text-red-600 hover:text-red-800"
              >
                <FiTrash />
              </button>
            </div>
          ))}
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newScenario.title}
            onChange={(e) => setNewScenario({ ...newScenario, title: e.target.value })}
            placeholder="シナリオのタイトル（例: Python基礎レッスン）"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <input
            type="text"
            value={newScenario.content}
            onChange={(e) => setNewScenario({ ...newScenario, content: e.target.value })}
            placeholder="シナリオの内容（例: Pythonの基本文法について説明してください）"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <button
            type="button"
            onClick={addScenario}
            className="p-2 text-blue-600 hover:text-blue-800"
          >
            <FiPlus />
          </button>
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save
        </button>
      </div>
    </form>
  )
}

const useAgentSettingsModal = () => {
  const { Modal, openModal: openModalBase, closeModal } = useModal()
  const [editingAgent, setEditingAgent] = useState<CustomAgent | null>(null)
  const { customAgents, saveCustomAgents } = useSetting()

  const handleSaveAgent = (agent: CustomAgent) => {
    const updatedAgents = editingAgent?.id
      ? customAgents.map((a) => (a.id === agent.id ? agent : a))
      : [...customAgents, agent]
    saveCustomAgents(updatedAgents)
    setEditingAgent(null)
    closeModal()
  }

  const handleDeleteAgent = (id: string) => {
    const updatedAgents = customAgents.filter((agent) => agent.id !== id)
    saveCustomAgents(updatedAgents)
  }

  const AgentSettingsModal: React.FC = () => (
    <Modal header="Custom Agents" size="4xl">
      <div className="space-y-4">
        {editingAgent ? (
          <AgentForm
            agent={editingAgent}
            onSave={handleSaveAgent}
            onCancel={() => setEditingAgent(null)}
          />
        ) : (
          <>
            <div className="flex justify-end">
              <button
                onClick={() => setEditingAgent({} as CustomAgent)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add New Agent
              </button>
            </div>
            <div className="space-y-2">
              {customAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{agent.name}</h3>
                    <p className="text-sm text-gray-500">{agent.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingAgent(agent)}
                      className="p-2 text-blue-600 hover:text-blue-800"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDeleteAgent(agent.id!)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <FiTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Modal>
  )

  return {
    customAgents,
    AgentSettingsModal,
    openModal: openModalBase
  }
}

export default useAgentSettingsModal
