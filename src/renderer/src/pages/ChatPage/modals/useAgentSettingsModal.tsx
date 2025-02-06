import React, { useState } from 'react'
import { CustomAgent } from '@/types/agent-chat'
import { FiMoreVertical, FiSearch } from 'react-icons/fi'
import useSetting from '@renderer/hooks/useSetting'
import { useTranslation } from 'react-i18next'
import { Modal, Dropdown } from 'flowbite-react'
import { TbRobot } from 'react-icons/tb'
import { AgentForm } from '../components/AgentForm/AgentForm'

export const useAgentSettingsModal = () => {
  const [show, setShow] = useState(false)

  const handleOpen = () => setShow(true)
  const handleClose = () => setShow(false)

  return {
    show,
    handleOpen,
    handleClose,
    AgentSettingsModal: AgentSettingsModal
  }
}

interface AgentSettingModalProps {
  isOpen: boolean
  onClose: () => void
}

const AgentSettingsModal = React.memo(({ isOpen, onClose }: AgentSettingModalProps) => {
  const [editingAgent, setEditingAgent] = useState<CustomAgent | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const { customAgents, saveCustomAgents } = useSetting()
  const { t } = useTranslation()

  const handleSaveAgent = (agent: CustomAgent) => {
    const updatedAgents = editingAgent?.id
      ? customAgents.map((a) => (a.id === agent.id ? agent : a))
      : [...customAgents, agent]
    saveCustomAgents(updatedAgents)
    setEditingAgent(null)
    onClose()
  }

  const handleDeleteAgent = (id: string) => {
    const updatedAgents = customAgents.filter((agent) => agent.id !== id)
    saveCustomAgents(updatedAgents)
  }

  const handleDuplicateAgent = (agent: CustomAgent) => {
    const newAgent = {
      ...agent,
      id: crypto.randomUUID(),
      name: `${agent.name} (${t('copy')})`
    }
    saveCustomAgents([...customAgents, newAgent])
  }

  const filteredAgents = customAgents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Modal
      dismissible
      show={isOpen}
      onClose={() => {
        setEditingAgent(null)
        onClose()
      }}
      size="8xl"
    >
      <Modal.Header className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editingAgent ? t('editAgent') : t('customAgents')}
          </h3>
        </div>
      </Modal.Header>
      <Modal.Body className="p-6">
        <div className="space-y-6 min-h-[800px]">
          {editingAgent ? (
            <AgentForm
              agent={editingAgent}
              onSave={handleSaveAgent}
              onCancel={() => setEditingAgent(null)}
            />
          ) : (
            <>
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiSearch className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="search"
                    className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg
                      bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700
                      dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
                      dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder={t('searchAgents')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => setEditingAgent({} as CustomAgent)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-700
                    border border-transparent rounded-lg shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    dark:focus:ring-offset-gray-900 whitespace-nowrap flex gap-2 items-center"
                >
                  {t('addNewAgent')}
                </button>
              </div>
              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {filteredAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="group relative flex items-start p-4 border border-gray-200
                      dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:border-blue-500
                      dark:hover:border-blue-400 transition-all duration-200 cursor-pointer"
                    onClick={() => setEditingAgent(agent)}
                  >
                    <div className="flex-shrink-0 mr-4">
                      <div
                        className="w-10 h-10 flex items-center justify-center
                        bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                      >
                        <TbRobot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 relative pr-10">
                      <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1 pr-6 truncate">
                        {agent.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 break-words">
                        {agent.description || t('noDescription')}
                      </p>
                      <div className="absolute right-0 top-0" onClick={(e) => e.stopPropagation()}>
                        <Dropdown
                          label=""
                          dismissOnClick={true}
                          renderTrigger={() => (
                            <button
                              className="p-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400
                                dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <FiMoreVertical className="w-4 h-4" />
                            </button>
                          )}
                        >
                          <Dropdown.Item onClick={() => setEditingAgent(agent)} className="w-28">
                            {t('edit')}
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleDuplicateAgent(agent)}>
                            {t('duplicate')}
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => handleDeleteAgent(agent.id!)}
                            className="text-red-600 dark:text-red-400"
                          >
                            {t('delete')}
                          </Dropdown.Item>
                        </Dropdown>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Modal.Body>
    </Modal>
  )
})

AgentSettingsModal.displayName = 'AgentSettingsModal'
