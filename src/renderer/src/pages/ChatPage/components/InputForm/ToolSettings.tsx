import React from 'react'
import { FcSupport } from 'react-icons/fc'

type ToolSettingsProps = {
  onOpenToolSettings: () => void
}

export const ToolSettings: React.FC<ToolSettingsProps> = ({ onOpenToolSettings }) => {
  return (
    <label
      onClick={onOpenToolSettings}
      className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer hover:text-gray-500"
    >
      <div className="flex gap-2 items-center">
        <FcSupport className="text-lg" />
        <span>Tools</span>
      </div>
    </label>
  )
}