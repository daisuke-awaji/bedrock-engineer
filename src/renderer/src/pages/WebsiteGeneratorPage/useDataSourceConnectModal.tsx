import useModal from '@renderer/hooks/useModal'
import useWebsiteGeneratorSettings from '@renderer/hooks/useWebsiteGeneratorSetting'
import { ToggleSwitch } from 'flowbite-react'
import { BsDatabase } from 'react-icons/bs'
import { FiCpu } from 'react-icons/fi'

const useDataSourceConnectModal = () => {
  const { Modal, openModal } = useModal()
  const {
    kbId,
    setKnowledgeBaseId,
    enableKnowledgeBase,
    setEnableKnowledgeBase,
    modelId,
    setModelId
  } = useWebsiteGeneratorSettings()

  const DataSourceConnectModal = () => (
    <Modal header="Connect Datasource">
      <div className="flex flex-col gap-3">
        <p className="text-gray-700 text-sm pb-2 dark:text-white">
          Currently, only support Knowledge base for Amazon Bedrock. <br />
          In advance, store the source code of your design system or existing github projects in the
          knowledge base. If you do not want to connect, leave the field blank.
        </p>
        <div className="grid grid-cols-3 items-center justify-center">
          <label className="flex items-center gap-2 block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            <BsDatabase className="text-lg" />
            Knowledge base ID
          </label>
          <input
            type="string"
            className="col-span-2 bg-white-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="12345ABCDE"
            defaultValue={kbId}
            onChange={(e) => setKnowledgeBaseId(e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-3 items-center justify-center ">
          <div></div>
          <div className="grid grid-cols-3 items-center justify-center cursor-pointer">
            <ToggleSwitch
              checked={enableKnowledgeBase}
              onChange={() => setEnableKnowledgeBase(!enableKnowledgeBase)}
              color="gray"
            ></ToggleSwitch>
            <span
              className="col-span-1 text-sm text-gray-500 hover:text-gray-700"
              onClick={() => setEnableKnowledgeBase(!enableKnowledgeBase)}
            >
              {enableKnowledgeBase ? 'Enable' : 'Disable'}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 items-center justify-center">
          <label className="flex items-center gap-2 block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            <FiCpu className="text-lg" />
            Model Id
          </label>
          <div className="col-span-2 flex flex-col">
            <input
              type="string"
              className="bg-white-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="anthropic.claude-3-haiku-20240307-v1:0"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
            />
            <span
              className="text-xs text-gray-500 pt-1 cursor-pointer hover:text-gray-700"
              onClick={() => setModelId('anthropic.claude-3-haiku-20240307-v1:0')}
            >
              Set default value
            </span>
          </div>
        </div>
      </div>
    </Modal>
  )

  return { kbId, DataSourceConnectModal, openModal, enableKnowledgeBase, modelId }
}

export default useDataSourceConnectModal
