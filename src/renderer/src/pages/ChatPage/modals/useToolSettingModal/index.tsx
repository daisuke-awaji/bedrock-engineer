import useModal from '@renderer/hooks/useModal'
import { useSettings } from '@renderer/contexts/SettingsContext'
import toast from 'react-hot-toast'
import { ToolName } from '@/types/tools'
import { toolIcons } from '../../components/Tool/ToolIcons'
import { KnowledgeBaseSettingForm } from './KnowledgeBaseSettingForm'
import { CommandForm } from './CommandForm'
import { BedrockAgent, BedrockAgentSettingForm } from './BedrockAgentSettingForm'

export interface CommandConfig {
  pattern: string
  description: string
}

// 利用可能なシェルのリスト
export const AVAILABLE_SHELLS = [
  { value: '/bin/bash', label: 'Bash' },
  { value: '/bin/zsh', label: 'Zsh' },
  { value: '/bin/sh', label: 'Shell' }
]

// ツールの説明文
const toolDescriptions: { [key in ToolName]: string } = {
  createFolder: 'Create new directories in your project',
  writeToFile: 'Write or update file contents',
  readFiles: 'Read contents from multiple files',
  listFiles: 'View directory structure',
  moveFile: 'Move files between locations',
  copyFile: 'Create file duplicates',
  tavilySearch: 'Search the web for information',
  fetchWebsite: 'Fetch and analyze content from websites',
  generateImage: 'Generate images using LLMs',
  retrieve:
    'Query the Amazon Bedrock Knowledge Base to find relevant information using Retrieval-Augmented Generation (RAG).',
  invokeBedrockAgent:
    '(Experimental) Invoke Amazon Bedrock Agent to interact with LLMs and external tools',
  executeCommand: 'Execute allowed commands with support for wildcards'
}

const useToolSettingModal = () => {
  const {
    tools,
    setTools,
    enabledTools,
    currentLLM,
    knowledgeBases,
    setKnowledgeBases,
    allowedCommands,
    setAllowedCommands,
    shell,
    setShell,
    bedrockAgents = [],
    setBedrockAgents = (agents: BedrockAgent[]) => {
      window.store.set('bedrockAgents', agents)
    }
  } = useSettings()

  const handleClickEnableTool = (toolName: string) => {
    if (!tools) return

    const updatedTools = tools.map((tool) => {
      if (tool.toolSpec?.name === toolName) {
        return { ...tool, enabled: !tool.enabled }
      }
      return tool
    })
    setTools(updatedTools)
  }

  const { Modal, openModal } = useModal()

  const ToolSettingModal = () => {
    return (
      <Modal header="Available Tools" size="8xl">
        <p className="text-gray-700 text-sm pb-4 dark:text-white">
          Choose the tools you want to enable for the AI assistant
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-4">
          {tools?.map((tool) => {
            const toolName = tool.toolSpec?.name
            if (!toolName) return null

            const isCommandTool = toolName === 'executeCommand'
            const isRetrieveTool = toolName === 'retrieve'
            const isBedrockAgentTool = toolName === 'invokeBedrockAgent'

            return (
              <div
                key={toolName}
                className={`
                  ${isCommandTool || isRetrieveTool || isBedrockAgentTool ? 'col-span-full xl:col-span-3' : ''}
                  p-4 rounded-lg
                  border-2 transition-all duration-200
                  ${
                    tool.enabled
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }
                  hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10
                `}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex-grow cursor-pointer"
                    onClick={() => {
                      if (!currentLLM.toolUse) {
                        toast(`${currentLLM.modelName} does not support ToolUse.`)
                        return
                      }
                      handleClickEnableTool(toolName)
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">{toolIcons[toolName]}</div>
                      <div>
                        <span
                          className={`
                            text-sm font-medium
                            ${
                              tool.enabled
                                ? 'text-blue-700 dark:text-blue-300'
                                : 'text-gray-900 dark:text-gray-300'
                            }
                          `}
                        >
                          {toolName === 'retrieve'
                            ? 'retrieve (from Bedrock Knowledge Base)'
                            : toolName}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {toolDescriptions[toolName]}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {isRetrieveTool && tool.enabled && (
                  <KnowledgeBaseSettingForm
                    knowledgeBases={knowledgeBases}
                    setKnowledgeBases={setKnowledgeBases}
                  />
                )}

                {isCommandTool && tool.enabled && (
                  <CommandForm
                    allowedCommands={allowedCommands}
                    setAllowedCommands={setAllowedCommands}
                    shell={shell}
                    setShell={setShell}
                  />
                )}

                {isBedrockAgentTool && tool.enabled && (
                  <BedrockAgentSettingForm
                    bedrockAgents={bedrockAgents}
                    setBedrockAgents={setBedrockAgents}
                  />
                )}
              </div>
            )
          })}
        </div>
      </Modal>
    )
  }

  return { tools, enabledTools, setTools, ToolSettingModal, openModal }
}

export default useToolSettingModal
