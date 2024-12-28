import React from 'react'
import { FiLoader, FiSend } from 'react-icons/fi'

type TextAreaProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
  isComposing: boolean
  setIsComposing: (value: boolean) => void
  sendMsgKey?: 'Enter' | 'Cmd+Enter'
}

export const TextArea: React.FC<TextAreaProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  isComposing,
  setIsComposing,
  sendMsgKey = 'Enter'
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.shiftKey) {
      return
    }
    if (isComposing) {
      return
    }

    const cmdenter = e.key === 'Enter' && (e.metaKey || e.ctrlKey)
    const enter = e.key === 'Enter'

    if ((sendMsgKey === 'Enter' && enter) || (sendMsgKey === 'Cmd+Enter' && cmdenter)) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className="relative w-full">
      <textarea
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        className={`block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 dark:text-white dark:bg-gray-800`}
        placeholder="Type your message... "
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => !disabled && handleKeyDown(e)}
        required
        rows={3}
      />
      <button
        onClick={onSubmit}
        disabled={disabled}
        className={`absolute end-2.5 bottom-2.5 rounded-lg ${disabled ? '' : 'hover:bg-gray-200'} px-2 py-2 dark:text-white dark:hover:bg-gray-700`}
      >
        {disabled ? <FiLoader className="text-xl animate-spin" /> : <FiSend className="text-xl" />}
      </button>
    </div>
  )
}
