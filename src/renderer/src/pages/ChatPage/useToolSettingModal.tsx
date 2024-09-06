import useModal from '@renderer/hooks/useModal'
import useTavilySearch from '@renderer/hooks/useTavilySearch'
import { useEffect, useState } from 'react'
import { ToolState } from 'src/types/agent-chat'

const useToolSettingModal = () => {
  const [tools, setStateTools] = useState<ToolState[]>()

  useEffect(() => {
    const tools = window.store.get('tools')
    if (tools) {
      setStateTools(tools)
    }

    if (window.tools.length !== tools.length) {
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
      <Modal header="Available Tools">
        <p className="text-gray-700 text-sm pb-2">Choose the tool you want to use</p>
        <div className="grid grid-cols-3 items-center justify-center">
          {tools?.map((tool) => {
            return (
              <label
                key={tool.toolSpec?.name}
                className="flex cursor-pointer content-center items-center h-10 w-[340px] gap-2"
                onClick={() => {
                  if (tool.toolSpec?.name) {
                    handleClickEnableTool(tool.toolSpec?.name)
                  }
                }}
              >
                <input type="checkbox" className="sr-only peer" checked={tool.enabled} disabled />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300 hover:text-gray-500">
                  {tool.toolSpec?.name}
                </span>
              </label>
            )
          })}
        </div>
      </Modal>
    )
  }

  const { apikey } = useTavilySearch()
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
