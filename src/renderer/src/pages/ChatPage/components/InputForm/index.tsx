import React, { useState } from 'react'
import { TextArea } from './TextArea'
import { ToolSettings } from './ToolSettings'
import { DirectorySelector } from './DirectorySelector'
import { SendMsgKey } from '@/types/agent-chat'

type InputFormProps = {
  userInput: string
  loading: boolean
  projectPath?: string
  sendMsgKey?: SendMsgKey
  onSubmit: (input: string) => void
  onChange: (input: string) => void
  onOpenToolSettings: () => void
  onSelectDirectory: () => void
  onOpenIgnoreModal: () => void
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
  onOpenIgnoreModal
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
        </div>

        <TextArea
          value={userInput}
          onChange={onChange}
          disabled={loading}
          onSubmit={() => onSubmit(userInput)}
          isComposing={isComposing}
          setIsComposing={setIsComposing}
          sendMsgKey={sendMsgKey}
        />
      </div>
    </div>
  )
}
