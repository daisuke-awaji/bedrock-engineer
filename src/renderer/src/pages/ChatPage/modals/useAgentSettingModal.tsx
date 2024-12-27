import React, { useState } from 'react'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import useModal from '@renderer/hooks/useModal'

type Agent = {
  name: string
  value: string
  description: string
}

type UseAgentSettingModalProps = {
  initialAgents: Agent[]
  onAgentsChange: (agents: Agent[]) => void
}

export default function useAgentSettingModal({ initialAgents, onAgentsChange }: UseAgentSettingModalProps) {
  const { Modal, openModal } = useModal()
  const [agents, setAgents] = useState<Agent[]>(initialAgents)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [newAgent, setNewAgent] = useState<Agent>({
    name: '',
    value: '',
    description: ''
  })

  const handleAddAgent = () => {
    if (!newAgent.name || !newAgent.value || !newAgent.description) {
      return
    }
    const updatedAgents = [...agents, newAgent]
    setAgents(updatedAgents)
    onAgentsChange(updatedAgents)
    setNewAgent({
      name: '',
      value: '',
      description: ''
    })
  }

  const handleEditAgent = (index: number) => {
    setEditingAgent(agents[index])
  }

  const handleUpdateAgent = () => {
    if (!editingAgent) return
    const updatedAgents = agents.map((agent) =>
      agent.value === editingAgent.value ? editingAgent : agent
    )
    setAgents(updatedAgents)
    onAgentsChange(updatedAgents)
    setEditingAgent(null)
  }

  const handleDeleteAgent = (index: number) => {
    const updatedAgents = agents.filter((_, i) => i !== index)
    setAgents(updatedAgents)
    onAgentsChange(updatedAgents)
  }

  const AgentSettingModal = () => {
    return (
      <Modal header="エージェント管理" size="5xl">
        <div className="p-4">
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">新規エージェントの追加</h3>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">名前</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">識別子</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={newAgent.value}
                  onChange={(e) => setNewAgent({ ...newAgent, value: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                <textarea
                  className="w-full p-2 border rounded"
                  value={newAgent.description}
                  onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                />
              </div>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={handleAddAgent}
              >
                追加
              </button>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">エージェント一覧</h3>
            <div className="grid gap-4">
              {agents.map((agent, index) => (
                <div key={index} className="border p-4 rounded">
                  {editingAgent?.value === agent.value ? (
                    <div className="grid gap-4">
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={editingAgent.name}
                        onChange={(e) =>
                          setEditingAgent({ ...editingAgent, name: e.target.value })
                        }
                      />
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={editingAgent.description}
                        onChange={(e) =>
                          setEditingAgent({ ...editingAgent, description: e.target.value })
                        }
                      />
                      <button
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        onClick={handleUpdateAgent}
                      >
                        更新
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{agent.name}</h4>
                        <p className="text-sm text-gray-600">{agent.description}</p>
                        <p className="text-xs text-gray-400 mt-1">ID: {agent.value}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="text-gray-600 hover:text-blue-500"
                          onClick={() => handleEditAgent(index)}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="text-gray-600 hover:text-red-500"
                          onClick={() => handleDeleteAgent(index)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    )
  }

  return {
    AgentSettingModal,
    openModal,
  }
}