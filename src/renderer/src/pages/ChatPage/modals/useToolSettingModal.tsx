import useModal from '@renderer/hooks/useModal'
import { useSettings } from '@renderer/contexts/SettingsContext'
import {
  FaFolderPlus,
  FaFileSignature,
  FaFileAlt,
  FaList,
  FaArrowRight,
  FaCopy,
  FaSearch,
  FaGlobe,
  FaImage,
  FaTerminal
} from 'react-icons/fa'
import toast from 'react-hot-toast'
import { memo, useState } from 'react'

// ツール名とアイコンのマッピング
const toolIcons: { [key: string]: React.ReactElement } = {
  createFolder: <FaFolderPlus className="text-blue-500 size-6" />,
  writeToFile: <FaFileSignature className="text-green-500 size-6" />,
  readFiles: <FaFileAlt className="text-yellow-500 size-6" />,
  listFiles: <FaList className="text-purple-500 size-6" />,
  moveFile: <FaArrowRight className="text-orange-500 size-6" />,
  copyFile: <FaCopy className="text-indigo-500 size-6" />,
  tavilySearch: <FaSearch className="text-red-500 size-6" />,
  fetchWebsite: <FaGlobe className="text-teal-500 size-6" />,
  generateImage: <FaImage className="text-pink-500 size-6" />,
  executeCommand: <FaTerminal className="text-gray-500 size-6" />
}

// ツールの説明文
const toolDescriptions: { [key: string]: string } = {
  createFolder: 'Create new directories in your project',
  writeToFile: 'Write or update file contents',
  readFiles: 'Read contents from multiple files',
  listFiles: 'View directory structure',
  moveFile: 'Move files between locations',
  copyFile: 'Create file duplicates',
  tavilySearch: 'Search the web for information',
  fetchWebsite: 'Fetch and analyze content from websites',
  generateImage: 'Generate images using Amazon Bedrock Stable Diffusion models',
  executeCommand: 'Execute allowed commands with support for wildcards'
}

// コマンド入力フォームコンポーネント
const CommandForm = memo(
  ({
    allowedCommands,
    setAllowedCommands
  }: {
    allowedCommands: string[]
    setAllowedCommands: (commands: string[]) => void
  }) => {
    const [newCommand, setNewCommand] = useState('')

    const handleAddCommand = () => {
      if (newCommand.trim()) {
        setAllowedCommands([...allowedCommands, newCommand.trim()])
        setNewCommand('')
      }
    }

    const handleRemoveCommand = (command: string) => {
      setAllowedCommands(allowedCommands.filter((cmd) => cmd !== command))
    }

    return (
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            value={newCommand}
            onChange={(e) => setNewCommand(e.target.value)}
            placeholder="Enter command pattern (e.g., npm run * or git status)"
            className="flex-grow p-2 text-sm border rounded dark:bg-gray-800 dark:border-gray-700"
          />
          <button
            onClick={handleAddCommand}
            className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Add
          </button>
        </div>
        <div className="space-y-2">
          {allowedCommands.map((command) => (
            <div
              key={command}
              className="flex items-center justify-between p-2 text-sm bg-gray-100 dark:bg-gray-800 rounded"
            >
              <span className="font-mono">{command}</span>
              <button
                onClick={() => handleRemoveCommand(command)}
                className="text-red-500 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }
)

CommandForm.displayName = 'CommandForm'

const useToolSettingModal = () => {
  const { tools, setTools, enabledTools, currentLLM, allowedCommands, setAllowedCommands } =
    useSettings()

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

            return (
              <div
                key={toolName}
                className={`
                  ${isCommandTool ? 'col-span-full' : ''}
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

                {isCommandTool && tool.enabled && (
                  <CommandForm
                    allowedCommands={allowedCommands}
                    setAllowedCommands={setAllowedCommands}
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
