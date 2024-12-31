import React, { useEffect, useMemo, useState } from 'react'
import AILogo from '../../assets/images/icons/ai.svg'
import { MessageList } from './components/MessageList'
import { InputForm } from './components/InputForm'
import { ExampleScenarios } from './components/ExampleScenarios'
import { useAgentChat } from './hooks/useAgentChat'
import { AgentSelector } from './components/AgentSelector'
import useSetting from '@renderer/hooks/useSetting'
import useScroll from '@renderer/hooks/useScroll'
import useIgnoreFileModal from './modals/useIgnoreFileModal'
import useToolSettingModal from './modals/useToolSettingModal'
import useAgentSettingsModal from './modals/useAgentSettingsModal'
import { FiSettings, FiChevronRight } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import SystemPromptModal from './components/SystemPromptModal'
import { AttachedImage } from './components/InputForm/TextArea'
import { useDefaultAgents } from './hooks/useDefaultAgents'
import { ChatHistory } from './components/ChatHistory'

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

  const allAgents = useMemo(() => {
    return [...baseAgents, ...customAgents]
  }, [baseAgents, customAgents])

  const yyyyMMdd = new Date().toISOString().slice(0, 10)
  const currentAgent = allAgents.find((a) => a.id === selectedAgentId)
  const systemPrompt =
    currentAgent?.system.replace(/{{projectPath}}/g, projectPath).replace(/{{date}}/g, yyyyMMdd) ||
    ''
  const currentScenarios = currentAgent?.scenarios || []

  const { enabledTools, ToolSettingModal, openModal: openToolSettingModal } = useToolSettingModal()
  const { messages, loading, handleSubmit, currentSessionId, setCurrentSessionId } = useAgentChat(
    llm?.modelId,
    systemPrompt,
    enabledTools?.filter((tool) => tool.enabled)
  )

  const onSubmit = (input: string, images: AttachedImage[]) => {
    handleSubmit(input, images)
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

  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId)
  }

  return (
    <React.Fragment>
      <div className="flex h-[calc(100vh-11rem)]">
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* ヘッダー */}
          <div className="flex justify-between items-center mb-4">
            {allAgents.length > 1 ? (
              <AgentSelector
                agents={allAgents}
                selectedAgent={selectedAgentId}
                onSelectAgent={setSelectedAgentId}
                openable={messages.length === 0}
              />
            ) : null}

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
          <div className="flex flex-row h-full">
            {/* チャット履歴サイドパネル */}
            <div
              className={`dark:bg-gray-800 transition-all duration-300 ${
                isHistoryOpen ? 'w-96' : 'w-0'
              } overflow-y-scroll`}
            >
              <ChatHistory
                onSessionSelect={handleSessionSelect}
                currentSessionId={currentSessionId}
              />
            </div>

            {/* 履歴トグルバー */}
            <div className="flex items-center">
              <div
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className="w-4 h-16 bg-gray-100 hover:bg-gray-200 cursor-pointer flex items-center justify-center transition-colors duration-200 rounded-lg"
                title={t('Toggle chat history')}
              >
                <FiChevronRight
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    isHistoryOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </div>

            {/* メイン領域 */}
            <div className="flex flex-col gap-4 w-full overflow-y-scroll">
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
                    <ExampleScenarios
                      scenarios={currentScenarios}
                      onSelectScenario={setUserInput}
                    />
                  )}
                </div>
              ) : null}
              <MessageList messages={messages} loading={loading} />
            </div>
          </div>
          <InputForm
            userInput={userInput}
            loading={loading}
            projectPath={projectPath}
            sendMsgKey={sendMsgKey}
            onSubmit={(input, attachedImages) => onSubmit(input, attachedImages)}
            onChange={setUserInput}
            onOpenToolSettings={openToolSettingModal}
            onSelectDirectory={selectDirectory}
            onOpenIgnoreModal={openIgnoreModal}
          />
        </div>
      </div>
    </React.Fragment>
  )
}
