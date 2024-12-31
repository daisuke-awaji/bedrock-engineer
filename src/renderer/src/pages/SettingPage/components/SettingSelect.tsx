import React from 'react'

interface SettingSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  description?: string
  error?: string
  options: {
    label: string
    value: string
    disabled?: boolean
  }[]
  groups?: {
    label: string
    options: {
      label: string
      value: string
      disabled?: boolean
    }[]
  }[]
}

export const SettingSelect: React.FC<SettingSelectProps> = ({
  label,
  description,
  error,
  options,
  groups,
  className,
  ...selectProps
}) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-900 dark:text-white">{label}</label>
      {description && <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>}
      <select
        {...selectProps}
        className={`
          bg-white dark:bg-gray-800
          border border-gray-300 dark:border-gray-600
          text-gray-900 dark:text-white
          text-sm rounded-lg
          focus:ring-blue-500 dark:focus:ring-blue-500
          focus:border-blue-500 dark:focus:border-blue-500
          block w-full p-2.5
          ${error ? 'border-red-500 dark:border-red-500' : ''}
          ${className || ''}
        `}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
        {groups?.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error}</p>}
    </div>
  )
}
