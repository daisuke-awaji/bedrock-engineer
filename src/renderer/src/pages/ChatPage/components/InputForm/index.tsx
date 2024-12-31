import React, { useState } from 'react'
import { AttachedImage, TextArea } from './TextArea'
import { ToolSettings } from './ToolSettings'
import { DirectorySelector } from './DirectorySelector'
import { SendMsgKey } from '@/types/agent-chat'
import { FiTrash2 } from 'react-icons/fi'

type InputFormProps = {
  userInput: string
  loading: boolean
  projectPath?: string
  sendMsgKey?: SendMsgKey
  onSubmit: (input: string, attachedImages: AttachedImage[]) => void
  onChange: (input: string) => void
  onOpenToolSettings: () => void
  onSelectDirectory: () => void
  onOpenIgnoreModal: () => void
  onClearChat: () => void
  hasMessages: boolean
}

export const InputForm: React.FC<InputFormProps> = ({
  userInput,
  loading,
  projectPath = '',
  sendMsgKey = 'Enter',
  onSubmit,
  onChange,
  onOpenToolSettings,
  onSelectDirectory,
  onOpenIgnoreModal,
  onClearChat,
  hasMessages
}) => {
  const [isComposing, setIsComposing] = useState(false)

  return (
    <div className="flex gap-2 fixed bottom-0 left-20 right-5 bottom-3">
      <div className="relative w-full">
        <div className="flex justify-between mb-2">
          {/* left */}
          <div className="flex flex-col justify-end gap-2 mb-1">
            <ToolSettings onOpenToolSettings={onOpenToolSettings} />
            <DirectorySelector
              projectPath={projectPath}
              onSelectDirectory={onSelectDirectory}
              onOpenIgnoreModal={onOpenIgnoreModal}
            />
          </div>

          {/* right */}
          {hasMessages && (
            <div className="flex items-end mb-1">
              <button
                onClick={onClearChat}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors duration-200"
                title={'Clear chat'}
              >
                <FiTrash2 />
              </button>
            </div>
          )}
        </div>

        <TextArea
          value={userInput}
          onChange={onChange}
          disabled={loading}
          onSubmit={(userInput, attachedImages) => onSubmit(userInput, attachedImages)}
          isComposing={isComposing}
          setIsComposing={setIsComposing}
          sendMsgKey={sendMsgKey}
        />
      </div>
    </div>
  )
}
