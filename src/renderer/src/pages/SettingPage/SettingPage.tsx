import React, { useState } from 'react'

import { FcElectronics, FcFolder, FcMindMap, FcGlobe, FcKey } from 'react-icons/fc'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { Kbd } from 'flowbite-react'
import { useTranslation } from 'react-i18next'
import useSetting from '@renderer/hooks/useSetting'
import { AWS_REGIONS } from '@renderer/constants/aws-regions'

interface InputWithLabelProp extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

const InputWithLabel: React.FC<InputWithLabelProp> = (props) => {
  const [showPassword, setShowPassword] = useState(false)
  const { ...inputProps } = props

  const isPassword = props.type === 'password'

  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
        {props.label}
      </label>
      <div className="relative">
        <input
          {...inputProps}
          type={!showPassword ? props.type : 'text'}
          className="bg-white-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
        {isPassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  )
}

export default function SettingPage() {
  const { t, i18n } = useTranslation()
  const {
    projectPath,
    selectDirectory,
    currentLLM: llm,
    updateLLM: setLLM,
    availableModels,
    sendMsgKey,
    updateSendMsgKey,
    tavilySearchApiKey,
    setTavilySearchApiKey,
    awsRegion,
    setAwsRegion,
    awsAccessKeyId,
    setAwsAccessKeyId,
    awsSecretAccessKey,
    setAwsSecretAccessKey,
    inferenceParams,
    updateInferenceParams
  } = useSetting()

  const handleChangeLLMSelect = (e) => {
    const selectedModelId = e.target.value
    const selectedModel = availableModels.find((model) => model.modelId === selectedModelId)
    if (selectedModel) {
      setLLM(selectedModel)
    } else {
      alert(t('Invalid model'))
    }
  }

  const handleChangeLanguage = (e) => {
    const newLanguage = e.target.value
    i18n.changeLanguage(newLanguage)
    window.store.set('language', newLanguage)
  }

  return (
    <React.Fragment>
      <div className="flex flex-col gap-4 min-w-[320px] max-w-[1024px] mx-auto h-full overflow-y-auto dark:text-white md:pr-16 md:pl-16 pr-8 pl-8">
        <h1 className="text-lg font-bold">{t('Setting')}</h1>

        <h2 className="text-lg">{t('Project Setting')}</h2>
        <div className="flex flex-col gap-2">
          <label
            onClick={selectDirectory}
            className="block mb-2 text-md font-medium text-gray-900 dark:text-white cursor-pointer hover:text-gray-500"
          >
            <div className="flex gap-2 items-center">
              <FcFolder className="text-lg" />
              <span>{projectPath}</span>
            </div>
          </label>
        </div>

        <h2 className="text-lg">{t('Language')}</h2>
        <div className="flex flex-col gap-2">
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            <div className="flex gap-2 items-center">
              <FcGlobe className="text-lg" />
              <span>{t('Select Language')}</span>
            </div>
          </label>
          <select
            className="bg-white-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={i18n.language}
            onChange={handleChangeLanguage}
          >
            <option value="en">English</option>
            <option value="ja">日本語</option>
          </select>
        </div>

        <h2 className="text-lg">{t('Agent Chat')}</h2>
        <div className="flex flex-col gap-2">
          <InputWithLabel
            label={t('Tavily Search API Key')}
            type="password"
            placeholder={'tvly-xxxxxxxxxxxxxxx'}
            value={tavilySearchApiKey}
            onChange={(e) => {
              console.log(e.target.value)
              setTavilySearchApiKey(e.target.value)
            }}
          />
          <span className="text-xs flex gap-1 text-gray-800 dark:text-gray-200">
            <span>Learn more about Tavily Search, go to</span>
            <span onClick={() => open('https://tavily.com/')} className="cursor-pointer">
              https://tavily.com/
            </span>
          </span>
        </div>

        <h2 className="text-lg">{t('AWS Settings')}</h2>
        <div className="flex flex-col gap-2">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              <div className="flex gap-2 items-center">
                <FcKey className="text-lg" />
                <span>{t('AWS Credentials')}</span>
              </div>
            </label>
          </div>

          {/* AWS Region Select Box */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              {t('AWS Region')}
            </label>
            <select
              className="bg-white-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={awsRegion}
              onChange={(e) => setAwsRegion(e.target.value)}
            >
              <option value="">{t('Select a region')}</option>
              <optgroup label={t('Bedrock Supported Regions')}>
                {AWS_REGIONS.filter((region) => region.bedrockSupported).map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name} ({region.id})
                  </option>
                ))}
              </optgroup>
              <optgroup label={t('Other Regions')}>
                {AWS_REGIONS.filter((region) => !region.bedrockSupported).map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name} ({region.id})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <InputWithLabel
            label={t('AWS Access Key ID')}
            type="string"
            placeholder="AKXXXXXXXXXXXXXXXXXX"
            value={awsAccessKeyId}
            onChange={(e) => setAwsAccessKeyId(e.target.value)}
          />
          <InputWithLabel
            label={t('AWS Secret Access Key')}
            type="password"
            placeholder="****************************************"
            value={awsSecretAccessKey}
            onChange={(e) => setAwsSecretAccessKey(e.target.value)}
          />
        </div>

        <h2 className="text-lg">{t('Amazon Bedrock')}</h2>

        {/* LLM Select Box */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            <div className="flex gap-2 items-center">
              <FcElectronics className="text-lg" />
              <span>{t('LLM (Large Language Model)')}</span>
            </div>
          </label>
          <select
            className="bg-white-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={llm?.modelId}
            onChange={handleChangeLLMSelect}
          >
            {availableModels.map((model, index) => (
              <option key={index} value={model.modelId}>
                {model.modelName}
              </option>
            ))}
          </select>
        </div>

        {/* Inference Parameters */}
        <div className="flex flex-col gap-2">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            <div className="flex gap-2 items-center">
              <FcMindMap className="text-lg" />
              <span className="dark:text-white">{t('Inference Parameters')}</span>
            </div>
          </label>

          <InputWithLabel
            label={t('Max Tokens')}
            type="number"
            placeholder={t('Max tokens')}
            value={inferenceParams.maxTokens}
            min={1}
            max={4096}
            onChange={(e) => {
              updateInferenceParams({ maxTokens: parseInt(e.target.value, 10) })
            }}
          />
          <InputWithLabel
            label={t('Temperature')}
            type="number"
            placeholder={t('Temperature')}
            value={inferenceParams.temperature}
            min={0}
            max={1.0}
            step={0.1}
            onChange={(e) => {
              updateInferenceParams({ temperature: parseFloat(e.target.value) })
            }}
          />
          <InputWithLabel
            label={t('topP')}
            type="number"
            placeholder={t('topP')}
            value={inferenceParams.topP}
            min={0}
            max={1}
            step={0.1}
            onChange={(e) => {
              updateInferenceParams({ topP: parseFloat(e.target.value) })
            }}
          />
        </div>

        <h2 className="text-lg">{t('Advanced Setting')}</h2>

        <div className="flex flex-col gap-2">
          <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
            <div className="flex gap-2 items-center">
              <span>
                {t('When writing a message, press')} <Kbd className="bg-gray-200">Enter</Kbd>{' '}
                {t('to')}
              </span>
            </div>
          </label>
          <div className="flex items-center mb-2" onClick={() => updateSendMsgKey('Enter')}>
            <input
              checked={sendMsgKey === 'Enter'}
              onChange={() => updateSendMsgKey('Enter')}
              id="default-radio-1"
              type="radio"
              name="default-radio"
              className="cursor-pointer	w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label className="cursor-pointer	ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
              {t('Send the message')}
            </label>
          </div>
          <div className="flex items-center" onClick={() => updateSendMsgKey('Cmd+Enter')}>
            <input
              checked={sendMsgKey === 'Cmd+Enter'}
              onChange={() => updateSendMsgKey('Cmd+Enter')}
              id="default-radio-2"
              type="radio"
              name="default-radio"
              className="cursor-pointer	w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label className="cursor-pointer	ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
              {t('Start a new line (use')} <Kbd className="bg-gray-200">⌘</Kbd> +{' '}
              <Kbd className="bg-gray-200">Enter</Kbd> {t('to send)')}
            </label>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}
