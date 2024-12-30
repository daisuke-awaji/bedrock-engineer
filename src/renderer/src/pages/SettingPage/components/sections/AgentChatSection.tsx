import React from 'react'
import { useTranslation } from 'react-i18next'
import { SettingSection } from '../SettingSection'
import { SettingInput } from '../SettingInput'

interface AgentChatSectionProps {
  tavilySearchApiKey: string
  onUpdateTavilySearchApiKey: (value: string) => void
}

export const AgentChatSection: React.FC<AgentChatSectionProps> = ({
  tavilySearchApiKey,
  onUpdateTavilySearchApiKey
}) => {
  const { t } = useTranslation()

  return (
    <SettingSection title={t('Agent Chat')}>
      <div className="space-y-4">
        <SettingInput
          label={t('Tavily Search API Key')}
          type="password"
          placeholder={'tvly-xxxxxxxxxxxxxxx'}
          value={tavilySearchApiKey}
          onChange={(e) => onUpdateTavilySearchApiKey(e.target.value)}
        />
        <div className="flex gap-1 text-xs text-gray-800 dark:text-gray-200">
          <span>{t('Learn more about Tavily Search, go to')}</span>
          <button
            onClick={() => window.open('https://tavily.com/')}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            https://tavily.com/
          </button>
        </div>
      </div>
    </SettingSection>
  )
}
