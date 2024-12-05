import {
  BedrockRuntimeClient,
  ConverseCommand,
  ConverseCommandOutput,
  ConverseStreamCommand,
  ConverseStreamCommandOutput,
  Message
} from '@aws-sdk/client-bedrock-runtime'
import {
  BedrockAgentRuntimeClient,
  RetrieveAndGenerateCommand,
  RetrieveAndGenerateCommandInput
} from '@aws-sdk/client-bedrock-agent-runtime'
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts' // ES Modules import
import { getDefaultPromptRouter, models } from './models'
import { store } from '../../preload/store'

export type CallConverseAPIProps = {
  modelId: string
  messages: Message[]
  system: [{ text: string }]
}

const converse = async (props: CallConverseAPIProps): Promise<ConverseCommandOutput> => {
  const { modelId, messages, system } = props
  const { maxTokens, temperature, topP } = store.get('inferenceParams')
  const command = new ConverseCommand({
    modelId,
    messages,
    system,
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
    const { modelId, messages, system } = props
    const command = new ConverseStreamCommand({
      modelId,
      messages,
      system,
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
  const sts = new STSClient()
  const command = new GetCallerIdentityCommand({})
  const res = await sts.send(command)
  return res.Account
}

// TODO: キャッシュの仕掛けはちゃんとまた後で考える
let cache = {}
const listModels = async () => {
  const accountId = await getAccountId()
  if (!accountId) {
    return models
  }

  const { region } = store.get('aws')
  const c = cache[`${region}-promptRouter`]

  if (!c) {
    const defaultPromptRouterModels = getDefaultPromptRouter(accountId, region) // TODO: region はユーザにて設定可能にする
    cache[`${region}-promptRouter`] = defaultPromptRouterModels
    return [...models, ...defaultPromptRouterModels]
  }

  return [...models, ...c]
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
