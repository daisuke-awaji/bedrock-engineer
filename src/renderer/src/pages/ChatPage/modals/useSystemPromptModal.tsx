import React, { useState } from 'react'
import MD from '@renderer/components/Markdown/MD'
import { Modal } from 'flowbite-react'

interface SystemPromptModalProps {
  isOpen: boolean
  onClose: () => void
  systemPrompt: string
}

export const useSystemPromptModal = () => {
  const [show, setShow] = useState(false)
  const handleOpen = () => {
    setShow(true)
  }
  const handleClose = () => {
    setShow(false)
  }

  return {
    show: show,
    handleOpen: handleOpen,
    handleClose: handleClose,
    SystemPromptModal: SystemPromptModal
  }
}

const SystemPromptModal = React.memo(
  ({ isOpen, onClose, systemPrompt }: SystemPromptModalProps) => {
    if (!isOpen) return null

    return (
      <Modal dismissible show={isOpen} onClose={onClose} size="7xl">
        <Modal.Header>SYSTEM PROMPT</Modal.Header>
        <Modal.Body className="dark:text-white">
          <MD>{systemPrompt}</MD>
        </Modal.Body>
      </Modal>
    )
  }
)

SystemPromptModal.displayName = 'SystemPromptModal'
