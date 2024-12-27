import React, { createContext, useContext, useState, useEffect } from 'react'
import { SendMsgKey } from 'src/types/agent-chat'
import { InferenceParameters, LLM } from 'src/types/llm'
import { listModels } from '@renderer/lib/api'

const DEFAULT_INFERENCE_PARAMS: InferenceParameters = {
  maxTokens: 4096,
  temperature: 0.5,
  topP: 0.9
}

interface SettingsContextType {
  // Advanced Settings
  sendMsgKey: SendMsgKey | undefined
  updateSendMsgKey: (key: SendMsgKey) => void

  // LLM Settings
  currentLLM: LLM
  updateLLM: (selectedModel: LLM) => void
  availableModels: LLM[]
  llmError: any

  // Inference Parameters
  inferenceParams: InferenceParameters
  updateInferenceParams: (params: Partial<InferenceParameters>) => void

  // Project Settings
  projectPath: string
  setProjectPath: (path: string) => void
  selectDirectory: () => Promise<void>

  // Tavily Search Settings
  tavilySearchApiKey: string
  setTavilySearchApiKey: (apiKey: string) => void
  enabledTavilySearch: boolean

  // AWS Settings
  awsRegion: string
  setAwsRegion: (region: string) => void
  awsAccessKeyId: string
  setAwsAccessKeyId: (accessKeyId: string) => void
  awsSecretAccessKey: string
  setAwsSecretAccessKey: (secretAccessKey: string) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Advanced Settings
  const [sendMsgKey, setSendMsgKey] = useState<SendMsgKey>()

  // LLM Settings
  const [llmError, setLLMError] = useState<any>()
  const [currentLLM, setCurrentLLM] = useState<LLM>({
    modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
    modelName: 'Claude 3 Haiku'
  })
  const [availableModels, setAvailableModels] = useState<LLM[]>([])
  const [inferenceParams, setInferenceParams] =
    useState<InferenceParameters>(DEFAULT_INFERENCE_PARAMS)

  // Project Settings
  const [projectPath, setProjectPath] = useState<string>('')

  // Tavily Search Settings
  const [tavilySearchApiKey, setStateApiKey] = useState<string>('')

  // AWS Settings
  const [awsRegion, setStateAwsRegion] = useState<string>('')
  const [awsAccessKeyId, setStateAwsAccessKeyId] = useState<string>('')
  const [awsSecretAccessKey, setStateAwsSecretAccessKey] = useState<string>('')

  // Initialize all settings
  useEffect(() => {
    // Load Advanced Settings
    const advancedSetting = window.store.get('advancedSetting')
    setSendMsgKey(advancedSetting?.keybinding?.sendMsgKey)

    // Load LLM Settings
    const storedLLM = window.store.get('llm')
    if (storedLLM) {
      setCurrentLLM(storedLLM)
    }

    // Load Inference Parameters
    const storedInferenceParams = window.store.get('inferenceParams')
    if (storedInferenceParams) {
      setInferenceParams(storedInferenceParams)
    }

    // Load Project Settings
    const path = window.store.get('projectPath')
    if (path) {
      setProjectPath(path)
    }

    // Load Tavily Search Settings
    const tavilySearchConfig = window.store.get('tavilySearch')
    if (tavilySearchConfig) {
      setStateApiKey(tavilySearchConfig.apikey)
    }

    // Load AWS Settings
    const awsConfig = window.store.get('aws')
    if (awsConfig) {
      setStateAwsRegion(awsConfig.region || '')
      setStateAwsAccessKeyId(awsConfig.accessKeyId || '')
      setStateAwsSecretAccessKey(awsConfig.secretAccessKey || '')
    }
  }, [])

  useEffect(() => {
    fetchModels()
  }, [awsRegion, awsAccessKeyId, awsSecretAccessKey])

  // Methods
  const updateSendMsgKey = (key: SendMsgKey) => {
    setSendMsgKey(key)
    window.store.set('advancedSetting', {
      keybinding: { sendMsgKey: key }
    })
  }

  const fetchModels = async () => {
    try {
      const models = await listModels()
      if (models) {
        setAvailableModels(models as LLM[])
      }
    } catch (e: any) {
      console.log(e)
      setLLMError(e)
      throw e
    }
  }

  const updateLLM = (selectedModel: LLM) => {
    setCurrentLLM(selectedModel)
    window.store.set('llm', selectedModel)
  }

  const updateInferenceParams = (params: Partial<InferenceParameters>) => {
    const updatedParams = { ...inferenceParams, ...params }
    setInferenceParams(updatedParams)
    window.store.set('inferenceParams', updatedParams)
  }

  const selectDirectory = async () => {
    const path = await window.file.handleFolderOpen()
    if (path) {
      setProjectPath(path)
      window.store.set('projectPath', path)
    }
  }

  const setTavilySearchApiKey = (apikey: string) => {
    setStateApiKey(apikey)
    window.store.set('tavilySearch', {
      apikey: apikey
    })
  }

  const setAwsRegion = (region: string) => {
    setStateAwsRegion(region)
    saveAwsConfig(region, awsAccessKeyId, awsSecretAccessKey)
  }

  const setAwsAccessKeyId = (accessKeyId: string) => {
    setStateAwsAccessKeyId(accessKeyId)
    saveAwsConfig(awsRegion, accessKeyId, awsSecretAccessKey)
  }

  const setAwsSecretAccessKey = (secretAccessKey: string) => {
    setStateAwsSecretAccessKey(secretAccessKey)
    saveAwsConfig(awsRegion, awsAccessKeyId, secretAccessKey)
  }

  const saveAwsConfig = (region: string, accessKeyId: string, secretAccessKey: string) => {
    window.store.set('aws', {
      region,
      accessKeyId,
      secretAccessKey
    })
  }

  const enabledTavilySearch = tavilySearchApiKey.length > 0

  const value = {
    // Advanced Settings
    sendMsgKey,
    updateSendMsgKey,

    // LLM Settings
    currentLLM,
    updateLLM,
    availableModels,
    llmError,

    // Inference Parameters
    inferenceParams,
    updateInferenceParams,

    // Project Settings
    projectPath,
    setProjectPath,
    selectDirectory,

    // Tavily Search Settings
    tavilySearchApiKey,
    setTavilySearchApiKey,
    enabledTavilySearch,

    // AWS Settings
    awsRegion,
    setAwsRegion,
    awsAccessKeyId,
    setAwsAccessKeyId,
    awsSecretAccessKey,
    setAwsSecretAccessKey
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
