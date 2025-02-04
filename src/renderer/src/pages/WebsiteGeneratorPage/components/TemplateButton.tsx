import React from 'react'
import { SupportedTemplate } from '../templates'
import { sleep } from '@renderer/lib/util'

interface TemplateButtonProps extends SupportedTemplate {
  isSelected: boolean
  onSelect: (id: SupportedTemplate['id']) => void
  onRefresh: () => void
}

export const TemplateButton: React.FC<TemplateButtonProps> = ({
  id,
  name,
  logo,
  isSelected,
  onSelect,
  onRefresh
}) => {
  return (
    <button
      type="button"
      className={`
        text-gray-900
        ${isSelected ? 'bg-green-50' : 'bg-white'}
        hover:bg-green-50
        border
        ${isSelected ? 'border-green-600' : 'border-gray-200'}
        focus:ring-4
        focus:outline-none
        focus:ring-gray-100
        font-medium
        rounded-[1rem]
        text-xs
        px-3
        py-1.5
        inline-flex
        items-center
        flex
        gap-2
        dark:bg-gray-800
        dark:text-white
        dark:border-gray-600
        dark:hover:bg-gray-700
      `}
      onClick={async () => {
        onSelect(id)
        await sleep(100)
        onRefresh()
      }}
    >
      <div className="w-[18px]">{logo}</div>
      <span>{name}</span>
    </button>
  )
}