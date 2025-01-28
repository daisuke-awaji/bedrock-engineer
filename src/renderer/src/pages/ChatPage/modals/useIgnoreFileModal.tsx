import { Modal } from 'flowbite-react'
import React from 'react'
import { useEffect, useState } from 'react'

export const useIgnoreFileModal = () => {
  const [show, setShow] = useState(false)

  const handleOpen = () => setShow(true)
  const handleClose = () => setShow(false)

  return {
    show: show,
    handleOpen: handleOpen,
    handleClose: handleClose,
    IgnoreFileModal: IgnoreFileModal
  }
}

interface IgnoreFileModalProps {
  isOpen: boolean
  onClose: () => void
}
const IgnoreFileModal = React.memo(({ isOpen, onClose }: IgnoreFileModalProps) => {
  const [ignoreFiles, setStateIgnoreFiles] = useState<string>()

  useEffect(() => {
    const config = window.store.get('agentChatConfig')
    if (config?.ignoreFiles) {
      setStateIgnoreFiles(config.ignoreFiles.join('\n'))
    }
  }, [])

  const setIgnoreFiles = (str: string) => {
    setStateIgnoreFiles(str)
    const arr = str.split('\n').filter((item) => item.trim() !== '')
    const config = window.store.get('agentChatConfig')
    window.store.set('agentChatConfig', {
      ...config,
      ignoreFiles: arr
    })
  }

  return (
    <Modal dismissible show={isOpen} onClose={onClose} size="4xl">
      <Modal.Header>Ignore Files</Modal.Header>
      <Modal.Body>
        <p className="text-gray-700 text-sm pb-2 dark:text-white">
          The files and folders listed below will not be read by various tools. Enter each file and
          folder on a new line.
        </p>
        <textarea
          className={`block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 mt-2 dark:bg-gray-800 dark:text-white`}
          placeholder={`.git\n.vscode\nor other files...`}
          value={ignoreFiles}
          onChange={(e) => setIgnoreFiles(e.target.value)}
          required
          rows={10}
        />
      </Modal.Body>
    </Modal>
  )
})

IgnoreFileModal.displayName = 'IgnoreFileModal'
