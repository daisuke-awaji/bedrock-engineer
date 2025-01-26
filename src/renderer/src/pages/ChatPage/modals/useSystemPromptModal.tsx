import React, { useState } from 'react'
import MD from '@renderer/components/Markdown/MD'
import { Modal } from 'flowbite-react'
import useSetting from '@renderer/hooks/useSetting'

interface SystemPromptModalProps {
  isOpen: boolean
  onClose: () => void
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

const SystemPromptModal = React.memo(({ isOpen, onClose }: SystemPromptModalProps) => {
  if (!isOpen) return null

  const { currentAgentSystemPrompt: systemPrompt } = useSetting()

  return (
    <Modal dismissible show={isOpen} onClose={onClose} size="7xl">
      <Modal.Header>SYSTEM PROMPT</Modal.Header>
      <Modal.Body className="dark:text-white">
        <MD>{systemPrompt}</MD>
      </Modal.Body>
    </Modal>
  )
})
