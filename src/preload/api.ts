import { BedrockClient, ListFoundationModelsCommand } from '@aws-sdk/client-bedrock'
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
import * as Figma from 'figma-js'

import NodeCache from 'node-cache'
import { store } from './store'
const cache = new NodeCache()

const client = new BedrockClient()
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
  const command = new ListFoundationModelsCommand()

  // TODO: API Cache の機構はあとで考える
  const cached = cache.get('listModels')
  if (cached) {
    return cached
  }
  const res = await client.send(command)
  const result = res.modelSummaries
    ?.filter((value) => {
      return (
        value.providerName === 'Anthropic' &&
        value.modelLifecycle?.status === 'ACTIVE' &&
        value.inferenceTypesSupported?.includes('ON_DEMAND') &&
        value.modelName?.includes('Claude 3')
      )
    })
    .map((value) => {
      return {
        modelId: value.modelId,
        modelName: value.modelName
      }
    })

  result?.push({
    modelId: 'us.anthropic.claude-3-5-sonnet-20240620-v1:0',
    modelName: 'Claude 3.5 Sonnet (cross region inference)'
  })

  cache.set('listModels', result, 180)
  return result
}

const getFile = async (fileKey: string) => {
  const client = Figma.Client({
    personalAccessToken: store.get('figma').personalAccessToken
  })
  const res = await client.file(fileKey)
  return res.data
}

export const api = {
  bedrock: {
    listModels,
    converse,
    converseStream,
    executeTool
  },
  figma: {
    getFile
  }
}

export type API = typeof api
