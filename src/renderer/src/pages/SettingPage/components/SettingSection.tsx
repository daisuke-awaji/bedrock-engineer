import React from 'react'
import { IconType } from 'react-icons'

interface SettingSectionProps {
  title: string
  icon?: IconType
  children: React.ReactNode
}

export const SettingSection: React.FC<SettingSectionProps> = ({ title, icon: Icon, children }) => {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white">
        {Icon && (
          <div className="flex gap-2 items-center">
            <Icon className="text-lg" />
            <span>{title}</span>
          </div>
        )}
        {!Icon && title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}
