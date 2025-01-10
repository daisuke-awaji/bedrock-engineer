import React, { useEffect, useState } from 'react'
import useModal from '@renderer/hooks/useModal'
import { CustomAgent } from '@/types/agent-chat'
import { nanoid } from 'nanoid'
import { FiPlus, FiTrash, FiEdit2, FiZap } from 'react-icons/fi'
import useSetting from '@renderer/hooks/useSetting'
import { useTranslation } from 'react-i18next'
import { useAgentGenerator } from '../hooks/useAgentGenerator'
import toast from 'react-hot-toast'
import { replacePlaceholders } from '../utils/placeholder'

const AgentForm: React.FC<{
  agent?: CustomAgent
  onSave: (agent: CustomAgent) => void
  onCancel: () => void
}> = ({ agent, onSave, onCancel }) => {
  const { projectPath, allowedCommands, knowledgeBases } = useSetting()
  const { t } = useTranslation()
  const { generateAgentSystemPrompt, generatedAgentSystemPrompt, isGenerating } =
    useAgentGenerator()

  const [formData, setFormData] = useState<CustomAgent>({
    id: agent?.id || `custom_agent_${nanoid(8)}`,
    name: agent?.name || '',
    description: agent?.description || '',
    system: agent?.system || '',
    scenarios: agent?.scenarios || [],
    isCustom: true
  })
  const [showPreview, setShowPreview] = useState(false)
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

  const getPreviewText = (text: string): string => {
    if (!text) return text
    const path = projectPath || t('noProjectPath')
    return replacePlaceholders(text, {
      projectPath: path,
      allowedCommands: allowedCommands,
      knowledgeBases: knowledgeBases
    })
  }

  const handleAutoGenerate = async () => {
    if (!formData.name || !formData.description) {
      toast.error(t('pleaseEnterNameAndDescription'))
      return
    }

    await generateAgentSystemPrompt(formData.name, formData.description)
  }

  useEffect(() => {
    if (generatedAgentSystemPrompt) {
      setFormData({
        ...formData,
        system: generatedAgentSystemPrompt
      })
    }
  }, [generatedAgentSystemPrompt])

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Name</label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('nameDescription')}</p>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
            text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
          placeholder={t('namePlaceholder')}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Description
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
          {t('descriptionDescription')}
        </p>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
            text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
          placeholder={t('descriptionPlaceholder')}
        />
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleAutoGenerate}
          disabled={isGenerating}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 dark:bg-green-700
            border border-transparent rounded-md shadow-sm hover:bg-green-700 dark:hover:bg-green-600
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-900
            disabled:opacity-50"
        >
          <FiZap />
          <span>{isGenerating ? t('generating') : t('autoGenerate')}</span>
        </button>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          System Prompt
        </label>
        <div className="mb-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-pre-line">
            {t('systemPromptInfo')}
          </p>
          <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
              {t('placeholders')}
            </p>
            <div className="mt-1 flex items-center space-x-2">
              <code className="text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 dark:text-gray-300">
                {`{{projectPath}}`}
              </code>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('projectPathPlaceholder')}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('{{projectPath}}')
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                {t('copy')}
              </button>
            </div>
            <div className="mt-1 flex items-center space-x-2">
              <code className="text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 dark:text-gray-300">
                {`{{date}}`}
              </code>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('datePlaceholder')}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('{{date}}')
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                {t('copy')}
              </button>
            </div>
            <div className="mt-1 flex items-center space-x-2">
              <code className="text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 dark:text-gray-300">
                {`{{allowedCommands}}`}
              </code>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('allowedCommandsPlaceholder')}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('{{allowedCommands}}')
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                {t('copy')}
              </button>
            </div>
            <div className="mt-1 flex items-center space-x-2">
              <code className="text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 dark:text-gray-300">
                {`{{knowledgeBases}}`}
              </code>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('knowledgeBasesPlaceholder')}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('{{knowledgeBases}}')
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                {t('copy')}
              </button>
            </div>
          </div>
        </div>
        <textarea
          value={formData.system}
          onChange={(e) => setFormData({ ...formData, system: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
            text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-96"
          required
          placeholder={t('systemPromptPlaceholder')}
        />
        {(formData.system.includes('{{projectPath}}') ||
          formData.system.includes('{{date}}') ||
          formData.system.includes('{{allowedCommands}}')) && (
          <div className="mt-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              {showPreview ? t('hidePreview') : t('showPreview')}
            </button>
            {showPreview && (
              <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                  {t('previewResult')}
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {getPreviewText(formData.system)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Scenarios {t('optional')}
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('scenariosDescription')}</p>
        <div className="space-y-2">
          {formData.scenarios.map((scenario, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={scenario.title}
                readOnly
                className="flex-2 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
                  text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <input
                type="text"
                value={scenario.content}
                readOnly
                className="flex-1 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
                  text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => removeScenario(index)}
                title={t('deleteScenario')}
                className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
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
            placeholder={t('scenarioTitlePlaceholder')}
            className="flex-2 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
              text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <input
            type="text"
            value={newScenario.content}
            onChange={(e) => setNewScenario({ ...newScenario, content: e.target.value })}
            placeholder={t('scenarioContentPlaceholder')}
            className="flex-1 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
              text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <button
            type="button"
            onClick={addScenario}
            className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            <FiPlus />
          </button>
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800
            border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
        >
          {t('cancel')}
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 border border-transparent
            rounded-md shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2
            focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
        >
          {t('save')}
        </button>
      </div>
    </form>
  )
}

const useAgentSettingsModal = () => {
  const { Modal, openModal: openModalBase, closeModal } = useModal()
  const [editingAgent, setEditingAgent] = useState<CustomAgent | null>(null)
  const { customAgents, saveCustomAgents } = useSetting()
  const { t } = useTranslation()

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
    <Modal header={t('customAgents')} size="4xl">
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
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 border border-transparent
                  rounded-md shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2
                  focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
              >
                {t('addNewAgent')}
              </button>
            </div>
            <div className="space-y-2">
              {customAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700
                    rounded-lg bg-white dark:bg-gray-800"
                >
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{agent.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{agent.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingAgent(agent)}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      title={t('editAgent')}
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDeleteAgent(agent.id!)}
                      className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      title={t('deleteAgent')}
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
