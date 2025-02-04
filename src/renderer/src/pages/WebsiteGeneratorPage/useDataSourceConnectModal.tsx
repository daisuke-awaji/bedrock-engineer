import { KnowledgeBase } from '@/types/agent-chat'
import useWebsiteGeneratorSettings from '@renderer/hooks/useWebsiteGeneratorSetting'
import { Button, Label, Modal, TextInput, ToggleSwitch } from 'flowbite-react'
import React, { useState } from 'react'
import { BsDatabase } from 'react-icons/bs'

export const useDataSourceConnectModal = () => {
  const [show, setShow] = useState(false)

  const handleOpen = () => setShow(true)
  const handleClose = () => setShow(false)

  return {
    show,
    handleOpen,
    handleClose,
    DataSourceConnectModal: DataSourceConnectModal
  }
}

interface DataSourceConnectModalProps {
  isOpen: boolean
  onClose: () => void
}

const DataSourceConnectModal = React.memo(({ isOpen, onClose }: DataSourceConnectModalProps) => {
  const { knowledgeBases, setKnowledgeBases, enableKnowledgeBase, setEnableKnowledgeBase } =
    useWebsiteGeneratorSettings()
  const [newKnowledgeBase, setNewKnowledgeBase] = useState<KnowledgeBase>({
    knowledgeBaseId: '',
    description: ''
  })

  const handleAddKnowledgeBase = () => {
    if (newKnowledgeBase.knowledgeBaseId && newKnowledgeBase.description) {
      setKnowledgeBases([...knowledgeBases, newKnowledgeBase])
      setNewKnowledgeBase({ knowledgeBaseId: '', description: '' }) // フォームをリセット
    }
  }

  const handleRemoveKnowledgeBase = (index: number) => {
    const updatedKnowledgeBases = knowledgeBases.filter((_, i) => i !== index)
    setKnowledgeBases(updatedKnowledgeBases)
  }

  return (
    <Modal dismissible show={isOpen} onClose={onClose}>
      <Modal.Header>Connect Knowledge Base</Modal.Header>
      <Modal.Body>
        <div className="flex flex-col gap-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BsDatabase className="text-lg text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Knowledge Base Connection
              </span>
            </div>
            <ToggleSwitch
              checked={enableKnowledgeBase}
              onChange={() => setEnableKnowledgeBase(!enableKnowledgeBase)}
              label={enableKnowledgeBase ? 'Enabled' : 'Disabled'}
            />
          </div>

          <div className="space-y-4">
            {knowledgeBases.length > 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Currently connected knowledge bases:
              </div>
            )}

            {knowledgeBases.length > 0 ? (
              <div className="space-y-2">
                {knowledgeBases.map((kb, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900 dark:text-white">
                        {kb.knowledgeBaseId}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {kb.description}
                      </div>
                    </div>
                    <Button
                      size="xs"
                      color="failure"
                      onClick={() => handleRemoveKnowledgeBase(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                No knowledge bases connected
              </div>
            )}
          </div>

          {/* Add New Knowledge Base Form */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Label>Add New Knowledge Base</Label>
            <div className="grid gap-4">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="kbId" value="Knowledge Base ID" />
                </div>
                <TextInput
                  id="kbId"
                  value={newKnowledgeBase.knowledgeBaseId}
                  onChange={(e) =>
                    setNewKnowledgeBase({ ...newKnowledgeBase, knowledgeBaseId: e.target.value })
                  }
                  placeholder="e.g., BM7GYFCKIA"
                />
              </div>
              <div>
                <div className="mb-2 block flex flex-col gap-1">
                  <Label htmlFor="description" value="Description" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    This is where you outline the data you store, and how it will be referenced in
                    the knowledge base when generating your website.
                  </span>
                </div>
                <TextInput
                  id="description"
                  value={newKnowledgeBase.description}
                  onChange={(e) =>
                    setNewKnowledgeBase({ ...newKnowledgeBase, description: e.target.value })
                  }
                  placeholder="e.g., Knowledge base of our in-house design system (React component source code)"
                />
              </div>
              <Button
                onClick={handleAddKnowledgeBase}
                disabled={!newKnowledgeBase.knowledgeBaseId || !newKnowledgeBase.description}
              >
                Add Knowledge Base
              </Button>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
})

DataSourceConnectModal.displayName = 'DataSourceConnectModal'

export default useDataSourceConnectModal
