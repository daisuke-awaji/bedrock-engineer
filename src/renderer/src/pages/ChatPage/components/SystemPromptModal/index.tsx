import React from 'react'
import MD from '@renderer/components/Markdown/MD'
import { Modal } from 'flowbite-react'

interface SystemPromptModalProps {
  isOpen: boolean
  onClose: () => void
  systemPrompt: string
}

const SystemPromptModal = React.memo(
  ({ isOpen, onClose, systemPrompt }: SystemPromptModalProps) => {
    if (!isOpen) return null

    return (
      <Modal dismissible show={isOpen} onClose={onClose} size="7xl">
        <Modal.Header>SYSTEM PROMPT</Modal.Header>
        <Modal.Body>
          <MD>{systemPrompt}</MD>
        </Modal.Body>
      </Modal>
    )
  }
)

SystemPromptModal.displayName = 'SystemPromptModal'

export default SystemPromptModal
