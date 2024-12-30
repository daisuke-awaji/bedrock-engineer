import React, { createContext, useContext, useState, useEffect } from 'react'
import { SendMsgKey, ToolState } from 'src/types/agent-chat'
import { InferenceParameters, LLM } from 'src/types/llm'
import { listModels } from '@renderer/lib/api'
import { CustomAgent } from '@/types/agent-chat'
import { Tool } from '@aws-sdk/client-bedrock-runtime'

const DEFAULT_INFERENCE_PARAMS: InferenceParameters = {
  maxTokens: 4096,
  temperature: 0.5,
  topP: 0.9
}

// TODO: リージョンに応じて動的にツールの enum を設定したい
// "us-east-1",  "us-west-2", "ap-northeast-1" 以外は generateImage ツールを無効化する
const isGenerateImageTool = (name: string) => name === 'generateImage'

const supportGenerateImageToolRegions: string[] = [
  'us-east-1',
  'us-west-2',
  'ap-northeast-1',
  'eu-west-1',
  'eu-west-2',
  'ap-south-1'
]
const availableImageGenerationModelsMap: Record<string, string[]> = {
  'us-east-1': [
    'amazon.nova-canvas-v1:0',
    'amazon.titan-image-generator-v1',
    'amazon.titan-image-generator-v2:0'
  ],
  'us-west-2': [
    'stability.sd3-large-v1:0',
    'stability.sd3-5-large-v1:0',
    'stability.stable-image-core-v1:0',
    'stability.stable-image-core-v1:1',
    'stability.stable-image-ultra-v1:0',
    'stability.stable-image-ultra-v1:1',
    'amazon.titan-image-generator-v2:0',
    'amazon.titan-image-generator-v1'
  ],
  'ap-northeast-1': ['amazon.titan-image-generator-v2:0', 'amazon.titan-image-generator-v1'],
  'ap-south-1': ['amazon.titan-image-generator-v1'],
  'eu-west-1': ['amazon.titan-image-generator-v1'],
  'eu-west-2': ['amazon.titan-image-generator-v1']
}

const compareTools = (savedTools: ToolState[], windowTools: typeof window.tools): boolean => {
  if (savedTools.length !== windowTools.length) return true

  const savedToolNames = new Set(savedTools.map((tool) => tool.toolSpec?.name))
  const windowToolNames = new Set(windowTools.map((tool) => tool.toolSpec?.name))

  // 名前のセットが異なる場合は変更があったとみなす
  if (savedToolNames.size !== windowToolNames.size) return true

  // 各ツールの名前を比較
  for (const name of savedToolNames) {
    if (!windowToolNames.has(name)) return true
  }

  // ツールの詳細な内容を比較
  for (const windowTool of windowTools) {
    const savedTool = savedTools.find((tool) => tool.toolSpec?.name === windowTool.toolSpec?.name)

    if (!savedTool) return true

    // ツールの重要なプロパティを比較
    if (JSON.stringify(windowTool.toolSpec) !== JSON.stringify(savedTool.toolSpec)) {
      return true
    }
  }

  return false
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

  // Custom Agents Settings
  customAgents: CustomAgent[]
  saveCustomAgents: (agents: CustomAgent[]) => void

  // Selected Agent Settings
  selectedAgentId: string
  setSelectedAgentId: (agentId: string) => void

  // Tools Settings
  tools: ToolState[]
  setTools: (tools: ToolState[]) => void
  enabledTools: ToolState[]
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Advanced Settings
  const [sendMsgKey, setSendMsgKey] = useState<SendMsgKey>()

  // LLM Settings
  const [llmError, setLLMError] = useState<any>()
  const [currentLLM, setCurrentLLM] = useState<LLM>({
    modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
    modelName: 'Claude 3 Haiku',
    toolUse: true
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

  // Custom Agents Settings
  const [customAgents, setCustomAgents] = useState<CustomAgent[]>([])

  // Selected Agent Settings
  const [selectedAgentId, setSelectedAgentId] = useState<string>('softwareAgent')

  // Tools Settings
  const [tools, setStateTools] = useState<ToolState[]>([])

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

    // Load Custom Agents
    const savedAgents = window.store.get('customAgents')
    if (savedAgents) {
      setCustomAgents(savedAgents)
    }

    // Load Selected Agent
    const savedAgentId = window.store.get('selectedAgentId')
    if (savedAgentId) {
      setSelectedAgentId(savedAgentId)
    }

    // Load Tools Settings
    const savedTools = window.store.get('tools')
    const toolsNeedUpdate = compareTools(savedTools, window.tools)
    if (toolsNeedUpdate) {
      const initialTools = window.tools
        .map((tool) => {
          if (!tool.toolSpec?.name) {
            return
          }
          // 既存の enabled 状態を保持
          const existingTool = savedTools.find(
            (saved) => saved.toolSpec?.name === tool.toolSpec?.name
          )
          return {
            ...tool,
            enabled: existingTool ? existingTool.enabled : true
          } as Tool
        })
        .filter((item): item is ToolState => item !== undefined)

      setStateTools(initialTools)
      window.store.set('tools', initialTools)
    } else if (savedTools) {
      setStateTools(savedTools)
    }
  }, [])

  useEffect(() => {
    fetchModels()
    if (awsRegion) {
      const updatedTools = replaceGenerateImageModels(tools, awsRegion)
      setStateTools(updatedTools)
      window.store.set('tools', updatedTools)
    }
  }, [awsRegion, awsAccessKeyId, awsSecretAccessKey])

  useEffect(() => {
    if (currentLLM) {
      // currentLLM が ToolUse をサポートしないモデルだった場合ツールを全て disabled にする
      if (!currentLLM.toolUse) {
        const updatedTools = tools.map((tool) => ({ ...tool, enabled: false }))
        setStateTools(updatedTools)
        window.store.set('tools', updatedTools)
      } else {
        // currentLLM が ToolUse をサポートするモデルだった場合、ツールを全て enabled 状態にする
        const updatedTools = tools.map((tool) => ({ ...tool, enabled: true }))
        setStateTools(updatedTools)
        window.store.set('tools', updatedTools)
      }
    }
  }, [currentLLM])

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

  const saveCustomAgents = (agents: CustomAgent[]) => {
    setCustomAgents(agents)
    window.store.set('customAgents', agents)
  }

  const setTools = (newTools: ToolState[]) => {
    setStateTools(newTools)
    window.store.set('tools', newTools)
  }

  const enabledTavilySearch = tavilySearchApiKey.length > 0

  const enabledTools = tools
    .filter((tool) => tool.enabled)
    .filter((tool) => {
      if (tool.toolSpec?.name === 'tavilySearch') {
        return enabledTavilySearch
      }
      return true
    })

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
    setAwsSecretAccessKey,

    // Custom Agents Settings
    customAgents,
    saveCustomAgents,

    // Selected Agent Settings
    selectedAgentId,
    setSelectedAgentId: (agentId: string) => {
      setSelectedAgentId(agentId)
      window.store.set('selectedAgentId', agentId)
    },

    // Tools Settings
    tools,
    setTools,
    enabledTools
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
function replaceGenerateImageModels(tools: ToolState[], awsRegion: string) {
  const updatedTools = tools.map((tool) => {
    if (tool.toolSpec?.name && isGenerateImageTool(tool.toolSpec?.name)) {
      if (supportGenerateImageToolRegions.includes(awsRegion)) {
        console.log('generateImage tool is enabled.')
        return {
          ...tool,
          toolSpec: {
            ...tool.toolSpec,
            inputSchema: {
              ...tool.toolSpec.inputSchema,
              json: {
                ...(tool.toolSpec.inputSchema?.json as any),
                properties: {
                  ...(tool.toolSpec.inputSchema?.json as any).properties,
                  modelId: {
                    ...((tool.toolSpec.inputSchema?.json as any).properties.modelId as any),
                    enum: availableImageGenerationModelsMap[awsRegion],
                    default: availableImageGenerationModelsMap[awsRegion][0]
                  }
                }
              }
            }
          },
          enabled: true
        }
      } else {
        console.log('generateImage tool is disabled.')
        return { ...tool, enabled: false }
      }
    }
    return tool
  })
  console.log(updatedTools)
  return updatedTools
}
