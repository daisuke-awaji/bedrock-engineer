import {
  BedrockRuntimeClient,
  ConverseCommand,
  ConverseCommandOutput,
  ConverseStreamCommand,
  ConverseStreamCommandOutput,
  Message,
  ToolConfiguration
} from '@aws-sdk/client-bedrock-runtime'
import { executeTool } from './tools'

const runtimeClient = new BedrockRuntimeClient()

const inferenceConfig = {
  maxTokens: 4096, // 8192,
  temperature: 0,
  topP: 0.9
}

export type CallConverseAPIProps = {
  modelId: string
  messages: Message[]
  system: [{ text: string }]
  toolConfig?: ToolConfiguration
}

// sleep
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const converse = async (props: CallConverseAPIProps): Promise<ConverseCommandOutput> => {
  const { modelId, messages, system, toolConfig } = props

  const command = new ConverseCommand({
    modelId,
    messages,
    system,
    toolConfig: toolConfig?.tools?.length === 0 ? undefined : toolConfig,
    inferenceConfig
  })
  const MAX_ATTEMPTS = 30
  let attempt = 0
  const retrySend = async () => {
    attempt += 1
    try {
      const res = await runtimeClient.send(command)
      return res
    } catch (e) {
      console.warn(e)
      await sleep(5000)
      if (attempt < MAX_ATTEMPTS) {
        return retrySend()
      } else {
        throw new Error('Max attempts reached')
      }
    }
  }

  return retrySend()
}

const converseStream = async (
  props: CallConverseAPIProps
): Promise<ConverseStreamCommandOutput> => {
  const { modelId, messages, system } = props
  const command = new ConverseStreamCommand({
    modelId,
    messages,
    system
  })
  return runtimeClient.send(command)
}

const listModels = async () => {
  const models = [
    {
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      modelName: 'Claude 3 Sonnet'
    },
    {
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
      modelName: 'Claude 3 Haiku'
    },
    {
      modelId: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
      modelName: 'Claude 3.5 Sonnet'
    },
    {
      modelId: 'us.anthropic.claude-3-5-sonnet-20240620-v1:0',
      modelName: 'Claude 3.5 Sonnet (cross region inference)'
    },
    {
      modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
      modelName: 'Claude 3.5 Sonnet v2'
    },
    {
      modelId: 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
      modelName: 'Claude 3.5 Sonnet v2 (cross region inference)'
    }
  ]

  return models
}

export const api = {
  bedrock: {
    listModels,
    converse,
    converseStream,
    executeTool
  }
}

export type API = typeof api
