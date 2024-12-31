import React from 'react'
import { useTranslation } from 'react-i18next'
import { FcElectronics, FcMindMap } from 'react-icons/fc'
import { SettingSection } from '../SettingSection'
import { SettingSelect } from '../SettingSelect'
import { SettingInput } from '../SettingInput'
import { LLM } from '@/types/llm'

interface BedrockSectionProps {
  currentLLM: LLM
  availableModels: LLM[]
  inferenceParams: {
    maxTokens: number
    temperature: number
    topP: number
  }
  onUpdateLLM: (modelId: string) => void
  onUpdateInferenceParams: (params: Partial<BedrockSectionProps['inferenceParams']>) => void
}

export const BedrockSection: React.FC<BedrockSectionProps> = ({
  currentLLM,
  availableModels,
  inferenceParams,
  onUpdateLLM,
  onUpdateInferenceParams
}) => {
  const { t } = useTranslation()

  const modelOptions = availableModels.map((model) => ({
    value: model.modelId,
    label: model.modelName
  }))

  return (
    <div className="space-y-6">
      <SettingSection title={t('Amazon Bedrock')} icon={FcElectronics}>
        <SettingSelect
          label={t('LLM (Large Language Model)')}
          value={currentLLM?.modelId}
          options={modelOptions}
          onChange={(e) => onUpdateLLM(e.target.value)}
        />
      </SettingSection>

      <SettingSection title={t('Inference Parameters')} icon={FcMindMap}>
        <div className="space-y-4">
          <SettingInput
            label={t('Max Tokens')}
            type="number"
            placeholder={t('Max tokens')}
            value={inferenceParams.maxTokens}
            min={1}
            max={4096}
            onChange={(e) => {
              onUpdateInferenceParams({ maxTokens: parseInt(e.target.value, 10) })
            }}
          />

          <SettingInput
            label={t('Temperature')}
            type="number"
            placeholder={t('Temperature')}
            value={inferenceParams.temperature}
            min={0}
            max={1.0}
            step={0.1}
            onChange={(e) => {
              onUpdateInferenceParams({ temperature: parseFloat(e.target.value) })
            }}
          />

          <SettingInput
            label={t('topP')}
            type="number"
            placeholder={t('topP')}
            value={inferenceParams.topP}
            min={0}
            max={1}
            step={0.1}
            onChange={(e) => {
              onUpdateInferenceParams({ topP: parseFloat(e.target.value) })
            }}
          />
        </div>
      </SettingSection>
    </div>
  )
}
