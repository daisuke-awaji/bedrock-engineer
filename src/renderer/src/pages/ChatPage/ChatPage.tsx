import React, { useEffect, useMemo, useState } from 'react'
import AILogo from '../../assets/images/icons/ai.svg'
import { MessageList } from './components/MessageList'
import { InputForm } from './components/InputForm'
import { ExampleScenarios } from './components/ExampleScenarios'
import { useChat } from './hooks/useChat'
import { AgentSelector } from './components/AgentSelector'
import useSetting from '@renderer/hooks/useSetting'
import useScroll from '@renderer/hooks/useScroll'
import useIgnoreFileModal from './modals/useIgnoreFileModal'
import useToolSettingModal from './modals/useToolSettingModal'
import useAgentSettingsModal from './modals/useAgentSettingsModal'
import { useDefaultAgents } from './hooks/useDefaultAgents'
import { FiSettings } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import SystemPromptModal from './components/SystemPromptModal'

export default function ChatPage() {
  const [userInput, setUserInput] = useState('')
  const { t } = useTranslation()
  const {
    currentLLM: llm,
    projectPath,
    selectDirectory,
    sendMsgKey,
    selectedAgentId,
    setSelectedAgentId
  } = useSetting()

  const {
    customAgents,
    AgentSettingsModal,
    openModal: openAgentSettingsModal
  } = useAgentSettingsModal()

  const baseAgents = useDefaultAgents()

  // カスタムエージェントと基本エージェントを結合
  const allAgents = useMemo(() => {
    return [...baseAgents, ...customAgents]
  }, [baseAgents, customAgents])

  const currentAgent = allAgents.find((a) => a.id === selectedAgentId)
  const systemPrompt = currentAgent?.system.replace(/{{projectPath}}/g, projectPath) || ''
  const currentScenarios = currentAgent?.scenarios || []

  const { enabledTools, ToolSettingModal, openModal: openToolSettingModal } = useToolSettingModal()
  const { messages, loading, handleSubmit } = useChat(
    llm?.modelId,
    systemPrompt,
    enabledTools?.filter((tool) => tool.enabled)
  )
  const onSubmit = (input: string) => {
    handleSubmit(input)
    setUserInput('')
  }

  const { scrollToBottom } = useScroll()
  const { openModal: openIgnoreModal, IgnoreFileModal } = useIgnoreFileModal()

  const [showSystemPrompt, setShowSystemPrompt] = useState(false)
  const handleOpenSystemPrompt = () => {
    setShowSystemPrompt(true)
  }
  const handleCloseSystemPrompt = () => {
    setShowSystemPrompt(false)
  }

  useEffect(() => {
    scrollToBottom()
  }, [loading, messages.length])

  return (
    <React.Fragment>
      <div className={`flex flex-col h-[calc(100vh-11rem)] overflow-y-auto`} id="main">
        <div className="flex justify-between items-center mb-4">
          <div>
            {messages.length === 0 && allAgents.length > 1 ? (
              <AgentSelector
                agents={allAgents}
                selectedAgent={selectedAgentId}
                onSelectAgent={setSelectedAgentId}
              />
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openAgentSettingsModal}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              title={t('agent settings')}
            >
              <FiSettings className="w-5 h-5" />
            </button>
            <span
              className="text-xs text-gray-400 font-thin cursor-pointer hover:text-gray-700"
              onClick={handleOpenSystemPrompt}
            >
              SYSTEM_PROMPT
            </span>
          </div>
        </div>

        <SystemPromptModal
          isOpen={showSystemPrompt}
          onClose={handleCloseSystemPrompt}
          systemPrompt={systemPrompt}
        />
        <AgentSettingsModal />
        <ToolSettingModal />
        <IgnoreFileModal />

        <div className="flex flex-col gap-4 h-full">
          {messages.length === 0 ? (
            <div className="flex flex-col pt-12 h-full w-full justify-center items-center content-center align-center gap-1">
              <div className="flex flex-row gap-3 items-center mb-2">
                <div className="h-6 w-6">
                  <AILogo />
                </div>
                <h1 className="text-lg font-bold dark:text-white">Agent Chat</h1>
              </div>
              <div className="text-gray-400">{currentAgent?.description}</div>
              {currentAgent && (
                <ExampleScenarios scenarios={currentScenarios} onSelectScenario={setUserInput} />
              )}
            </div>
          ) : null}

          <MessageList messages={messages} loading={loading} />
        </div>

        <InputForm
          userInput={userInput}
          loading={loading}
          projectPath={projectPath}
          sendMsgKey={sendMsgKey}
          onSubmit={onSubmit}
          onChange={setUserInput}
          onOpenToolSettings={openToolSettingModal}
          onSelectDirectory={selectDirectory}
          onOpenIgnoreModal={openIgnoreModal}
        />
      </div>
    </React.Fragment>
  )
}
