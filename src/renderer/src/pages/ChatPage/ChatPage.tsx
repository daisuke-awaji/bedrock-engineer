import React, { useEffect, useState } from 'react'
import AILogo from '../../assets/images/icons/ai.svg'
import { MessageList } from './components/MessageList'
import { InputForm } from './components/InputForm'
import { ExampleScenarios } from './components/ExampleScenarios'
import { useChat } from './hooks/useChat'
import { AgentSelector } from './components/AgentSelector'
import useSetting from '@renderer/hooks/useSetting'
import useModal from '@renderer/hooks/useModal'
import useScroll from '@renderer/hooks/useScroll'
import { useTranslation } from 'react-i18next'
import { Agent, AgentScenarios } from './types'
import MD from '../../components/Markdown/MD'
import useIgnoreFileModal from './modals/useIgnoreFileModal'
import useToolSettingModal from './modals/useToolSettingModal'
import agents from './constants/agents'
import { getAgentCoreRuleForToolUse } from '@renderer/prompts/prompts'

export default function ChatPage() {
  const { t } = useTranslation()
  const [userInput, setUserInput] = useState('')
  const [showCodePreview, setShowCodePreview] = useState(false)
  const [agent, setAgent] = useState<Agent['value']>('softwareAgent')

  const {
    currentLLM: llm,
    projectPath,
    selectDirectory,
    enabledTavilySearch,
    sendMsgKey
  } = useSetting()

  const exampleScenarios: AgentScenarios = {
    softwareAgent: [
      {
        title: t('Latest News in this week'),
        content: t('What news happened in the world this week ({{date}})', {
          date: new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate() - 7
          ).toLocaleDateString('ja')
        })
      },
      {
        title: t('Organizing folders'),
        content: t(
          'Extract only the png files contained in the {{projectPath}} folder and copy them to the {{imagePath}} folder.',
          {
            projectPath: projectPath,
            imagePath: `${projectPath}/images`
          }
        )
      },
      {
        title: t('Simple website'),
        content: t('Create a cool website for an IT company using HTML, CSS, and JavaScript.')
      },
      {
        title: t('Simple Web API'),
        content: t('simpleWebAPIContent')
      },
      {
        title: t('CDK Project'),
        content: t('cdkProjectContent')
      },
      {
        title: t('Understanding the source code'),
        content: t('Understanding the source code content', {
          projectPath: projectPath
        })
      },
      {
        title: t('Refactoring'),
        content: t('RefactoringContent', {
          projectPath: projectPath
        })
      },
      {
        title: t('Testcode'),
        content: t('TestcodeContent', {
          projectPath: projectPath
        })
      }
    ]
  }

  const currentAgent = agents.find((a) => a.value === agent)
  const systemPrompt =
    currentAgent?.system + '\n\n' + getAgentCoreRuleForToolUse({ workingDir: projectPath })

  const { enabledTools, ToolSettingModal, openModal: openToolSettingModal } = useToolSettingModal()
  const { messages, loading, handleSubmit } = useChat(
    llm?.modelId,
    systemPrompt,
    enabledTools?.filter((tool) => tool.enabled)
  )

  const { scrollToBottom } = useScroll()
  const { openModal: openIgnoreModal, IgnoreFileModal } = useIgnoreFileModal()
  const { Modal: SystemPromptModal, openModal: openSystemPromptModal } = useModal()

  useEffect(() => {
    scrollToBottom()
  }, [loading, messages.length])

  return (
    <React.Fragment>
      <div
        className={`flex flex-col h-[calc(100vh-12rem)] overflow-y-auto mx-auto min-w-[320px] max-w-[2048px]`}
        id="main"
      >
        <div className="flex justify-end">
          <span
            className="text-xs text-gray-400 font-thin cursor-pointer hover:text-gray-700"
            onClick={openSystemPromptModal}
          >
            SYSTEM_PROMPT
          </span>
        </div>

        <SystemPromptModal header="SYSTEM PROMPT" size="7xl">
          <MD>{systemPrompt}</MD>
        </SystemPromptModal>
        <ToolSettingModal />
        <IgnoreFileModal />

        <div className="flex flex-col gap-4 h-full">
          {messages.length === 0 && agents.length > 1 ? (
            <AgentSelector agents={agents} selectedAgent={agent} onSelectAgent={setAgent} />
          ) : null}

          {messages.length === 0 ? (
            <div className="flex flex-col pt-12 h-full w-full justify-center items-center content-center align-center gap-1">
              <div className="flex flex-row gap-3 items-center mb-2">
                <div className="h-6 w-6">
                  <AILogo />
                </div>
                <h1 className="text-lg font-bold dark:text-white">Agent Chat</h1>
              </div>
              <div className="text-gray-400">{currentAgent?.description}</div>
              <ExampleScenarios
                scenarios={exampleScenarios[agent]}
                onSelectScenario={setUserInput}
              />
            </div>
          ) : null}

          <MessageList messages={messages} loading={loading} showCodePreview={showCodePreview} />
        </div>

        <InputForm
          userInput={userInput}
          loading={loading}
          projectPath={projectPath}
          sendMsgKey={sendMsgKey}
          onSubmit={handleSubmit}
          onChange={setUserInput}
          onOpenToolSettings={openToolSettingModal}
          onSelectDirectory={selectDirectory}
          onOpenIgnoreModal={openIgnoreModal}
        />
      </div>
    </React.Fragment>
  )
}
