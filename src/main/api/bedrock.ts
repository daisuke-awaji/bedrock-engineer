import {
  BedrockRuntimeClient,
  ConverseCommand,
  ConverseCommandOutput,
  ConverseStreamCommand,
  ConverseStreamCommandOutput,
  Message
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

const converse = async (props: CallConverseAPIProps): Promise<ConverseCommandOutput> => {
  const { modelId, messages, system, toolConfig } = props
  const { maxTokens, temperature, topP } = store.get('inferenceParams')
  const command = new ConverseCommand({
    modelId,
    messages,
    system,
    toolConfig,
    inferenceConfig: { maxTokens, temperature, topP }
  })
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
    const command = new ConverseStreamCommand({
      modelId,
      messages,
      system,
      toolConfig,
      inferenceConfig: store.get('inferenceParams')
    })
    return await runtimeClient.send(command)
  } catch (error: any) {
    if (error.name === 'ThrottlingException') {
      console.log({ retry: retries, error, errorName: error.name })
      if (retries >= MAX_RETRIES) {
        // 最大再試行回数に達した場合はエラーをスローする
        throw error
      }

      // 一定時間待ってから再試行
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
      return converseStream(props, retries + 1)
    }
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

// 利用可能なモデルの取得とキャッシュ
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

  // キャッシュが有効な場合はキャッシュを返す
  if (cachedData && cachedData._timestamp && Date.now() - cachedData._timestamp < CACHE_LIFETIME) {
    return cachedData.filter((model) => !model._timestamp)
  }

  try {
    // 利用可能なモデルを取得
    const availableModels = await listAvailableModels(region, { accessKeyId, secretAccessKey })

    // models のうち、availableModels に存在しない要素を除外
    const availableModelIds = availableModels.map((model) => model.modelId)
    const filteredModels = models.filter(
      (model: LLM) =>
        availableModelIds.includes(model.modelId) ||
        availableModelIds.includes(model.modelId.slice(3)) // cross region inference
    )

    // Prompt Routerを取得
    const accountId = await getAccountId()
    const promptRouterModels = accountId ? getDefaultPromptRouter(accountId, region) : []

    // 結果をキャッシュに保存
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
