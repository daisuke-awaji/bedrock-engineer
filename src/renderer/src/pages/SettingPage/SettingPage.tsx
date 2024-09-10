import useLLM from '@renderer/hooks/useLLM'
import useProject from '@renderer/hooks/useProject'
import React from 'react'
import FigmaLogo from '../../assets/images/icons/figma.svg'

import { FcElectronics, FcFolder, FcMindMap, FcGlobe } from 'react-icons/fc'
import useFigma from '@renderer/hooks/useFigmaConfig'
import useTavilySearch from '@renderer/hooks/useTavilySearch'
import useAdvancedSetting from '@renderer/hooks/useAdvancedSetting'
import { Kbd } from 'flowbite-react'
import { useTranslation } from 'react-i18next'

interface InputWithLabelProp extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}
const InputWithLabel: React.FC<InputWithLabelProp> = (props) => {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
        {props.label}
      </label>
      <input
        type={props.type}
        className="bg-white-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        placeholder={props.placeholder}
        defaultValue={props.defaultValue}
        onChange={props.onChange}
        required
        {...props}
      />
    </div>
  )
}

export default function SettingPage() {
  const { t, i18n } = useTranslation()
  const { projectPath, selectDirectory } = useProject()
  const { llm, setLLM, availableModels } = useLLM()
  const { accessToken, setAccessToken } = useFigma()
  const { apikey, setApiKey } = useTavilySearch()
  const { sendMsgKey, setSendMsgKey } = useAdvancedSetting()

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
      <div className="flex flex-col gap-4 min-w-[320px] max-w-[1024px] mx-auto h-full overflow-y-auto">
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
            type="string"
            placeholder={t('Tavily Search API Key')}
            value={apikey}
            onChange={(e) => {
              console.log(e.target.value)
              setApiKey(e.target.value)
            }}
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
              <span>{t('Inference Parameters')}</span>
            </div>
          </label>

          <InputWithLabel
            disabled // TODO
            label={t('Max Tokens')}
            type="number"
            placeholder={t('Max tokens')}
            value={4096}
            min={1}
            max={4096}
            onChange={(e) => {
              console.log(e)
            }}
          />
          <InputWithLabel
            disabled // TODO
            label={t('Temperature')}
            type="number"
            placeholder={t('Temperature')}
            value={0.5}
            min={0}
            max={1.0}
            onChange={(e) => {
              console.log(e)
            }}
          />
          <InputWithLabel
            disabled // TODO
            label={t('topP')}
            type="number"
            placeholder={t('topP')}
            value={0.9}
            min={0}
            max={1}
            onChange={(e) => {
              console.log(e)
            }}
          />
          {/* todo */}
        </div>

        <h2 className="text-lg">{t('Figma')}</h2>

        <div className="flex flex-col gap-2">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            <div className="flex gap-2 items-center">
              <span className="h-3 w-3">
                <FigmaLogo />
              </span>
              <span>{t('Connect to Figma')}</span>
            </div>
          </label>
          <InputWithLabel
            label={t('Personal access token')}
            type="string"
            placeholder={t('Figma personal access token')}
            value={accessToken}
            onChange={(e) => {
              console.log(e.target.value)
              setAccessToken(e.target.value)
            }}
          />
        </div>

        <h2 className="text-lg">{t('Advanced Setting')}</h2>

        <div className="flex flex-col gap-2">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            <div className="flex gap-2 items-center">
              <span>
                {t('When writing a message, press')} <Kbd className="bg-gray-200">Enter</Kbd>{' '}
                {t('to')}
              </span>
            </div>
          </label>
          <div className="flex items-center mb-2" onClick={() => setSendMsgKey('Enter')}>
            <input
              checked={sendMsgKey === 'Enter'}
              onChange={() => setSendMsgKey('Enter')}
              id="default-radio-1"
              type="radio"
              name="default-radio"
              className="cursor-pointer	w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label className="cursor-pointer	ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
              {t('Send the message')}
            </label>
          </div>
          <div className="flex items-center" onClick={() => setSendMsgKey('Cmd+Enter')}>
            <input
              checked={sendMsgKey === 'Cmd+Enter'}
              onChange={() => setSendMsgKey('Cmd+Enter')}
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
