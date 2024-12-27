import React from 'react'
import { FcFolder } from 'react-icons/fc'

type DirectorySelectorProps = {
  projectPath: string
  onSelectDirectory: () => void
  onOpenIgnoreModal: () => void
}

export const DirectorySelector: React.FC<DirectorySelectorProps> = ({
  projectPath,
  onSelectDirectory,
  onOpenIgnoreModal
}) => {
  return (
    <div className="flex gap-2">
      <label
        onClick={onSelectDirectory}
        className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer hover:text-gray-500"
      >
        <div className="flex gap-2 items-center">
          <FcFolder className="text-lg" />
          <span>{projectPath}</span>
        </div>
      </label>
      <label
        onClick={onOpenIgnoreModal}
        className="block text-sm font-medium text-gray-500 dark:text-white cursor-pointer hover:text-gray-500"
      >
        .ignore
      </label>
    </div>
  )
}