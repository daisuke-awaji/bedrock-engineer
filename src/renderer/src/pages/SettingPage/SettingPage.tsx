import useLLM from '@renderer/hooks/useLLM'
import useProject from '@renderer/hooks/useProject'
import React from 'react'
import FigmaLogo from '../../assets/images/icons/figma.svg'

import { FcElectronics, FcFolder, FcMindMap } from 'react-icons/fc'
import useFigma from '@renderer/hooks/useFigmaConfig'
import useTavilySearch from '@renderer/hooks/useTavilySearch'

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
  const { projectPath, selectDirectory } = useProject()
  const { llm, setLLM, availableModels } = useLLM()
  const { accessToken, setAccessToken } = useFigma()
  const { apikey, setApiKey } = useTavilySearch()

  const handleChangeLLMSelect = (e) => {
    const selectedModelId = e.target.value
    const selectedModel = availableModels.find((model) => model.modelId === selectedModelId)
    if (selectedModel) {
      setLLM(selectedModel)
    } else {
      alert('Invalid model')
    }
  }

  return (
    <React.Fragment>
      <div className="flex flex-col gap-4 min-w-[320px] max-w-[1024px] mx-auto h-full overflow-y-auto">
        <h1 className="text-lg font-bold">Setting</h1>

        <h2 className="text-lg">Project Setting</h2>
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

        <h2 className="text-lg">Agent Chat</h2>
        <div className="flex flex-col gap-2">
          <InputWithLabel
            label="Tavily Search API Key"
            type="string"
            placeholder="Tavily Search API Key"
            value={apikey}
            onChange={(e) => {
              console.log(e.target.value)
              setApiKey(e.target.value)
            }}
          />
        </div>

        <h2 className="text-lg">Amazon Bedrock</h2>

        {/* LLM Select Box */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            <div className="flex gap-2 items-center">
              <FcElectronics className="text-lg" />
              <span>LLM (Large Language Model)</span>
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
              <span>Inference Parameters</span>
            </div>
          </label>

          <InputWithLabel
            disabled // TODO
            label="Max Tokens"
            type="number"
            placeholder="Max tokens"
            value={2048}
            min={1}
            max={4096}
            onChange={(e) => {
              console.log(e)
            }}
          />
          <InputWithLabel
            disabled // TODO
            label="Temperture"
            type="number"
            placeholder="Temperture"
            value={0.5}
            min={0}
            max={1.0}
            onChange={(e) => {
              console.log(e)
            }}
          />
          <InputWithLabel
            disabled // TODO
            label="topP"
            type="number"
            placeholder="topP"
            value={0.9}
            min={0}
            max={1}
            onChange={(e) => {
              console.log(e)
            }}
          />
          {/* todo */}
        </div>

        <div className="flex flex-col gap-2">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            <div className="flex gap-2 items-center">
              <span className="h-3 w-3">
                <FigmaLogo />
              </span>
              <span>Connect to Figma</span>
            </div>
          </label>
          <InputWithLabel
            label="Personal access token"
            type="string"
            placeholder="Figma personal access token"
            value={accessToken}
            onChange={(e) => {
              console.log(e.target.value)
              setAccessToken(e.target.value)
            }}
          />
        </div>
      </div>
    </React.Fragment>
  )
}
