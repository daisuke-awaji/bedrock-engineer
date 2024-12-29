import {
  BedrockRuntimeClient,
  ConverseCommand,
  ConverseCommandOutput,
  ConverseStreamCommand,
  ConverseStreamCommandOutput,
  Message,
  ContentBlock
} from '@aws-sdk/client-bedrock-runtime'
import { BedrockClient, ListFoundationModelsCommand } from '@aws-sdk/client-bedrock'
import {
  BedrockAgentRuntimeClient,
  RetrieveAndGenerateCommand,
  RetrieveAndGenerateCommandInput
} from '@aws-sdk/client-bedrock-agent-runtime'
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts'
import { getDefaultPromptRouter, models } from './models'
import { store } from '../../preload/store'
import { LLM } from '../../types/llm'

export type CallConverseAPIProps = {
  modelId: string
  messages: Message[]
  system: [{ text: string }]
  toolConfig?: ConverseCommand['input']['toolConfig']
}

// Helper function to reconstruct Uint8Array from serialized object
function reconstructUint8Array(obj: any): Uint8Array {
  if (obj && typeof obj === 'object' && Object.keys(obj).every((key) => !isNaN(Number(key)))) {
    return new Uint8Array(Object.values(obj))
  }
  return obj
}

// Helper function to ensure image data is in the correct format
function processImageContent(content: ContentBlock[]): ContentBlock[] {
  return content.map((block) => {
    if ('image' in block && block.image) {
      const imageBlock = block.image
      if (imageBlock.source && typeof imageBlock.source === 'object') {
        const source = imageBlock.source as any
        if (source.bytes) {
          // Reconstruct Uint8Array if it was serialized
          const bytes = reconstructUint8Array(source.bytes)
          if (bytes instanceof Uint8Array) {
            return {
              image: {
                format: imageBlock.format,
                source: { bytes }
              }
            }
          }
          // If bytes is a base64 string
          if (typeof bytes === 'string') {
            return {
              image: {
                format: imageBlock.format,
                source: {
                  bytes: new Uint8Array(Buffer.from(bytes, 'base64'))
                }
              }
            }
          }
        }
      }
    }
    return block
  })
}

const converse = async (props: CallConverseAPIProps): Promise<ConverseCommandOutput> => {
  const { modelId, messages, system, toolConfig } = props

  // Process messages to ensure image data is in correct format
  const processedMessages = messages.map((msg) => ({
    ...msg,
    content: Array.isArray(msg.content) ? processImageContent(msg.content) : msg.content
  }))

  const { maxTokens, temperature, topP } = store.get('inferenceParams')
  const command = new ConverseCommand({
    modelId,
    messages: processedMessages,
    system,
    toolConfig,
    inferenceConfig: { maxTokens, temperature, topP }
  })

  console.debug(
    'Processed message sample:',
    processedMessages.map((msg) => ({
      ...msg,
      content: Array.isArray(msg.content)
        ? msg.content.map((content) => {
            if ('image' in content && content.image?.source?.bytes instanceof Uint8Array) {
              return {
                ...content,
                image: {
                  ...content.image,
                  source: {
                    bytes: `[Uint8Array:${content.image.source.bytes.length}bytes]`
                  }
                }
              }
            }
            return content
          })
        : msg.content
    }))
  )

  const { region, accessKeyId, secretAccessKey } = store.get('aws')
  const runtimeClient = new BedrockRuntimeClient({
    credentials: {
      accessKeyId,
      secretAccessKey
    },
    region
  })
  return runtimeClient.send(command)
}

const MAX_RETRIES = 30 // 最大再試行回数
const RETRY_DELAY = 5000 // 再試行間隔 (ミリ秒)
const converseStream = async (
  props: CallConverseAPIProps,
  retries = 0
): Promise<ConverseStreamCommandOutput> => {
  const { region, accessKeyId, secretAccessKey } = store.get('aws')
  const runtimeClient = new BedrockRuntimeClient({
    credentials: {
      accessKeyId,
      secretAccessKey
    },
    region
  })

  try {
    const { modelId, messages, system, toolConfig } = props

    // Process messages to ensure image data is in correct format
    const processedMessages = messages.map((msg) => ({
      ...msg,
      content: Array.isArray(msg.content) ? processImageContent(msg.content) : msg.content
    }))

    const command = new ConverseStreamCommand({
      modelId,
      messages: processedMessages,
      system,
      toolConfig,
      inferenceConfig: store.get('inferenceParams')
    })

    console.debug(
      'Sending command with processed messages:',
      processedMessages.map((msg) => ({
        ...msg,
        content: Array.isArray(msg.content)
          ? msg.content.map((content) => {
              if ('image' in content && content.image?.source?.bytes instanceof Uint8Array) {
                return {
                  ...content,
                  image: {
                    ...content.image,
                    source: {
                      bytes: `[Uint8Array:${content.image.source.bytes.length}bytes]`
                    }
                  }
                }
              }
              return content
            })
          : msg.content
      }))
    )

    return await runtimeClient.send(command)
  } catch (error: any) {
    if (error.name === 'ThrottlingException') {
      console.log({ retry: retries, error, errorName: error.name })
      if (retries >= MAX_RETRIES) {
        throw error
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
      return converseStream(props, retries + 1)
    }
    console.log({ error })
    throw error
  }
}

const getAccountId = async () => {
  try {
    const { region, accessKeyId, secretAccessKey } = store.get('aws')
    const sts = new STSClient({
      credentials: {
        accessKeyId,
        secretAccessKey
      },
      region
    })
    const command = new GetCallerIdentityCommand({})
    const res = await sts.send(command)
    return res.Account
  } catch (error) {
    console.error('Error getting AWS account ID:', error)
    return null
  }
}

const modelCache: { [key: string]: any } = {}
const CACHE_LIFETIME = 1000 * 60 * 60 // 1時間

const listAvailableModels = async (
  region: string,
  credentials: { accessKeyId: string; secretAccessKey: string }
) => {
  const client = new BedrockClient({ credentials, region })
  const command = new ListFoundationModelsCommand({})

  try {
    const response = await client.send(command)
    return (
      response.modelSummaries?.map((model) => ({
        modelId: model.modelId || '',
        modelName: model.modelName || ''
      })) || []
    )
  } catch (error) {
    console.error('Error listing foundation models:', error)
    return []
  }
}

const listModels = async () => {
  const { region, accessKeyId, secretAccessKey } = store.get('aws')
  if (!region || !accessKeyId || !secretAccessKey) {
    console.warn('AWS credentials not configured')
    return []
  }

  const cacheKey = `${region}-${accessKeyId}`
  const cachedData = modelCache[cacheKey]

  if (cachedData && cachedData._timestamp && Date.now() - cachedData._timestamp < CACHE_LIFETIME) {
    return cachedData.filter((model) => !model._timestamp)
  }

  try {
    const availableModels = await listAvailableModels(region, { accessKeyId, secretAccessKey })
    const availableModelIds = availableModels.map((model) => model.modelId)
    const filteredModels = models.filter(
      (model: LLM) =>
        availableModelIds.includes(model.modelId) ||
        availableModelIds.includes(model.modelId.slice(3))
    )

    const accountId = await getAccountId()
    const promptRouterModels = accountId ? getDefaultPromptRouter(accountId, region) : []
    const result = [...filteredModels, ...promptRouterModels]
    modelCache[cacheKey] = [...result, { _timestamp: Date.now() } as any]

    return result
  } catch (error) {
    console.error('Error in listModels:', error)
    return []
  }
}

const retrieveAndGenerate = async (props: RetrieveAndGenerateCommandInput) => {
  const { region, accessKeyId, secretAccessKey } = store.get('aws')
  const agentClient = new BedrockAgentRuntimeClient({
    credentials: {
      accessKeyId,
      secretAccessKey
    },
    region
  })

  const command = new RetrieveAndGenerateCommand(props)
  const res = await agentClient.send(command)
  return res
}

export const bedrock = {
  listModels,
  converse,
  converseStream,
  retrieveAndGenerate
}

export type BedrockService = typeof bedrock
