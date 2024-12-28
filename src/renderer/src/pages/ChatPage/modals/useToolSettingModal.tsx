import useModal from '@renderer/hooks/useModal'
import useSetting from '@renderer/hooks/useSetting'
import { useEffect, useState } from 'react'
import { ToolState } from 'src/types/agent-chat'
import {
  FaFolderPlus,
  FaFileSignature,
  FaFileAlt,
  FaList,
  FaArrowRight,
  FaCopy,
  FaSearch
} from 'react-icons/fa'

// ツール名とアイコンのマッピング
const toolIcons: { [key: string]: React.ReactElement } = {
  createFolder: <FaFolderPlus className="text-blue-500 size-6" />,
  writeToFile: <FaFileSignature className="text-green-500 size-6" />,
  readFiles: <FaFileAlt className="text-yellow-500 size-6" />,
  listFiles: <FaList className="text-purple-500 size-6" />,
  moveFile: <FaArrowRight className="text-orange-500 size-6" />,
  copyFile: <FaCopy className="text-indigo-500 size-6" />,
  tavilySearch: <FaSearch className="text-red-500 size-6" />
}

// ツールの説明文
const toolDescriptions: { [key: string]: string } = {
  createFolder: 'Create new directories in your project',
  writeToFile: 'Write or update file contents',
  readFiles: 'Read contents from multiple files',
  listFiles: 'View directory structure',
  moveFile: 'Move files between locations',
  copyFile: 'Create file duplicates',
  tavilySearch: 'Search the web for information'
}

const useToolSettingModal = () => {
  const [tools, setStateTools] = useState<ToolState[]>()

  useEffect(() => {
    const tools = window.store.get('tools')
    if (tools) {
      setStateTools(tools)
    }

    if (window.tools?.length !== tools?.length) {
      const t = window.tools
        .map((tool) => {
          if (!tool.toolSpec?.name) return
          return { ...tool, enabled: true }
        })
        .filter((item) => item !== undefined)

      console.log({ toolUpdated: t })
      window.store.set('tools', t)
    }
  }, [])

  const handleClickEnableTool = (toolName: string) => {
    const updatedTools = tools?.map((tool) => {
      if (tool.toolSpec?.name === toolName) {
        return { ...tool, enabled: !tool.enabled }
      }
      return tool
    })
    if (updatedTools) {
      setTools(updatedTools)
    }
  }

  const setTools = (updateTools: ToolState[]) => {
    window.store.set('tools', updateTools)
    setStateTools(updateTools)
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
            return (
              <div
                key={toolName}
                className={`
                  cursor-pointer p-4 rounded-lg
                  border-2 transition-all duration-200
                  ${
                    tool.enabled
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }
                  hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10
                `}
                onClick={() => {
                  if (toolName) {
                    handleClickEnableTool(toolName)
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">{toolName && toolIcons[toolName]}</div>
                  <div className="flex-grow">
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
                      {toolName && toolDescriptions[toolName]}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Modal>
    )
  }

  const { tavilySearchApiKey: apikey } = useSetting()
  const tavilySearchEnabled = apikey !== 'tvly-xxxxxxxxxxxxxxxxxxx'
  const enabledTools = tools
    ?.filter((v) => v.enabled)
    .filter((value) => {
      if (value.toolSpec?.name === 'tavilySearch') {
        return tavilySearchEnabled
      }
      return true
    })

  return { tools, enabledTools, setTools, ToolSettingModal, openModal }
}

export default useToolSettingModal
