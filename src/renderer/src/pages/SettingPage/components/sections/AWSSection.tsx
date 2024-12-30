import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FcKey } from 'react-icons/fc'
import { SettingSection } from '../SettingSection'
import { SettingInput } from '../SettingInput'
import { SettingSelect } from '../SettingSelect'
import { IAMPolicyModal } from '../IAMPolicyModal'
import { AWS_REGIONS } from '@renderer/constants/aws-regions'

interface AWSSectionProps {
  awsRegion: string
  awsAccessKeyId: string
  awsSecretAccessKey: string
  onUpdateRegion: (region: string) => void
  onUpdateAccessKeyId: (id: string) => void
  onUpdateSecretAccessKey: (key: string) => void
}

export const AWSSection: React.FC<AWSSectionProps> = ({
  awsRegion,
  awsAccessKeyId,
  awsSecretAccessKey,
  onUpdateRegion,
  onUpdateAccessKeyId,
  onUpdateSecretAccessKey
}) => {
  const { t } = useTranslation()
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false)

  const regionGroups = [
    {
      label: t('Bedrock Supported Regions'),
      options: AWS_REGIONS.filter((region) => region.bedrockSupported).map((region) => ({
        value: region.id,
        label: `${region.name} (${region.id})`
      }))
    },
    {
      label: t('Other Regions'),
      options: AWS_REGIONS.filter((region) => !region.bedrockSupported).map((region) => ({
        value: region.id,
        label: `${region.name} (${region.id})`
      }))
    }
  ]

  return (
    <>
      <SettingSection title={t('AWS Settings')} icon={FcKey}>
        <div className="space-y-4">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {t('This application requires specific IAM permissions to access Amazon Bedrock.')}{' '}
            <button
              onClick={() => setIsPolicyModalOpen(true)}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t('View required IAM policies')}
            </button>
          </p>

          <SettingSelect
            label={t('AWS Region')}
            value={awsRegion}
            options={[{ value: '', label: t('Select a region') }]}
            groups={regionGroups}
            onChange={(e) => onUpdateRegion(e.target.value)}
          />

          <SettingInput
            label={t('AWS Access Key ID')}
            type="string"
            placeholder="AKXXXXXXXXXXXXXXXXXX"
            value={awsAccessKeyId}
            onChange={(e) => onUpdateAccessKeyId(e.target.value)}
          />

          <SettingInput
            label={t('AWS Secret Access Key')}
            type="password"
            placeholder="****************************************"
            value={awsSecretAccessKey}
            onChange={(e) => onUpdateSecretAccessKey(e.target.value)}
          />
        </div>
      </SettingSection>

      <IAMPolicyModal isOpen={isPolicyModalOpen} onClose={() => setIsPolicyModalOpen(false)} />
    </>
  )
}
