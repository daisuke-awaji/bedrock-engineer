import useModal from '@renderer/hooks/useModal'
import { SettingsContextType, useSettings } from '@renderer/contexts/SettingsContext'
import toast from 'react-hot-toast'
import { memo, useState } from 'react'
import { ToolName } from '@/types/tools'
import { toolIcons } from '../components/Tool/ToolIcons'

interface CommandConfig {
  pattern: string
  description: string
}

// 利用可能なシェルのリスト
const AVAILABLE_SHELLS = [
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
  generateImage: 'Generate images using Amazon Bedrock Stable Diffusion models',
  retrieve:
    'Query the Amazon Bedrock Knowledge Base to find relevant information using Retrieval-Augmented Generation (RAG).',
  executeCommand: 'Execute allowed commands with support for wildcards'
}

// コマンド設定フォームコンポーネント
const CommandForm = memo(
  ({
    allowedCommands,
    setAllowedCommands,
    shell,
    setShell
  }: {
    allowedCommands: CommandConfig[]
    setAllowedCommands: (commands: CommandConfig[]) => void
    shell: string
    setShell: (shell: string) => void
  }) => {
    const [newCommand, setNewCommand] = useState('')
    const [newDescription, setNewDescription] = useState('')

    const handleAddCommand = () => {
      if (newCommand.trim() && newDescription.trim()) {
        setAllowedCommands([
          ...allowedCommands,
          {
            pattern: newCommand.trim(),
            description: newDescription.trim()
          }
        ])
        setNewCommand('')
        setNewDescription('')
      }
    }

    const handleRemoveCommand = (pattern: string) => {
      setAllowedCommands(allowedCommands.filter((cmd) => cmd.pattern !== pattern))
    }

    return (
      <div className="mt-4 space-y-4">
        {/* シェル選択 */}
        <div className="space-y-2">
          <label className="block text-xs text-gray-600 dark:text-gray-400">Command Shell</label>
          <select
            value={shell}
            onChange={(e) => setShell(e.target.value)}
            className="w-full p-2 text-sm border rounded dark:bg-gray-800 dark:border-gray-700"
          >
            {AVAILABLE_SHELLS.map((shellOption) => (
              <option key={shellOption.value} value={shellOption.value}>
                {shellOption.label}
              </option>
            ))}
          </select>
        </div>

        {/* コマンド追加フォーム */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="flex-grow">
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Command Pattern
              </label>
              <input
                type="text"
                value={newCommand}
                onChange={(e) => setNewCommand(e.target.value)}
                placeholder="e.g., ls *"
                className="w-full p-2 text-sm border rounded dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div className="flex-grow">
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Description
              </label>
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="e.g., List directory contents"
                className="w-full p-2 text-sm border rounded dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          </div>
          <button
            onClick={handleAddCommand}
            disabled={!newCommand.trim() || !newDescription.trim()}
            className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Add Command
          </button>
        </div>

        {/* 登録済みコマンドリスト */}
        <div className="space-y-2">
          {allowedCommands.map((command) => (
            <div
              key={command.pattern}
              className="flex flex-col p-3 text-sm bg-gray-100 dark:bg-gray-900 dark:text-gray-300 rounded"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono">{command.pattern}</span>
                <button
                  onClick={() => handleRemoveCommand(command.pattern)}
                  className="text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{command.description}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }
)

CommandForm.displayName = 'CommandForm'

const KnowledgeBaseSettingForm = ({
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
        <div className="flex gap-2">
          <div className="flex-grow">
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Knowledge Base Id
            </label>
            <input
              type="text"
              value={newKnowledgeBaseId}
              onChange={(e) => setKnoledgeBaseId(e.target.value)}
              placeholder="e.g., BM7GYFCKIA"
              className="w-full p-2 text-sm border rounded dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
          <div className="flex-grow">
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Description
            </label>
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="e.g., Stores in-house manuals and past inquiry history"
              className="w-full p-2 text-sm border rounded dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
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
              <span className="font-mono">{kb.knowledgeBaseId}</span>
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
    setShell
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
      <Modal header="Available Tools" size="4xl">
        <p className="text-gray-700 text-sm pb-4 dark:text-white">
          Choose the tools you want to enable for the AI assistant
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools?.map((tool) => {
            const toolName = tool.toolSpec?.name
            if (!toolName) return null

            const isCommandTool = toolName === 'executeCommand'
            const isRetrieveTool = toolName === 'retrieve'

            return (
              <div
                key={toolName}
                className={`
                  ${isCommandTool || isRetrieveTool ? 'col-span-full' : ''}
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
                          {toolName}
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
