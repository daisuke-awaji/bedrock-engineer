import { useState } from 'react'
import type { Agent } from '@renderer/types/agent'
import { Modal } from 'flowbite-react'
import { useSettings } from '@renderer/contexts/SettingsContext'
import toast from 'react-hot-toast'

type AgentDetailModalProps = {
  agent: Agent | null
  show: boolean
  onClose: () => void
}

export const AgentDetailModal = ({ agent, show, onClose }: AgentDetailModalProps) => {
  const { customAgents, saveCustomAgents } = useSettings()
  const [isAdding, setIsAdding] = useState(false)

  if (!agent) return null

  const handleSaveAsCustomAgent = () => {
    setIsAdding(true)
    try {
      // Check if agent already exists
      const exists = customAgents.some((existingAgent) => existingAgent.id === agent.id)
      if (exists) {
        toast.error('This agent is already in your custom agents')
        return
      }

      // Convert to CustomAgent format
      const customAgent = {
        id: agent.id,
        name: agent.title,
        description: agent.systemPrompt.split('\n')[0], // First line as description
        system: agent.systemPrompt,
        scenarios: [],
        isCustom: true
      }

      // Save to custom agents
      saveCustomAgents([...customAgents, customAgent])
      toast.success('Agent added to your custom agents')
      onClose()
    } catch (error) {
      console.error('Error saving custom agent:', error)
      toast.error('Failed to save agent')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Modal dismissible show={show} onClose={onClose} size="4xl">
      <Modal.Header>
        <div className="flex items-center gap-4">
          <img
            src={agent.author.avatar}
            alt={agent.author.name}
            className="h-12 w-12 rounded-full"
          />
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{agent.title}</h3>
            <div className="flex flex-wrap gap-2">
              {agent.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body>
        <div className="space-y-6">
          <div>
            <h4 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">Author</h4>
            <a
              href={agent.author.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-500 hover:underline"
            >
              {agent.author.name}
            </a>
          </div>

          <div>
            <h4 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
              System Prompt
            </h4>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <pre className="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400">
                {agent.systemPrompt}
              </pre>
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <div className="flex w-full justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Close
          </button>
          <button
            onClick={handleSaveAsCustomAgent}
            disabled={isAdding}
            className="rounded-lg bg-green-600 dark:bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 disabled:opacity-50"
          >
            {isAdding ? 'Adding...' : 'Add to My Agents'}
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  )
}
