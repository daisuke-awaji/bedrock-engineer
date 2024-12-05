import {
  BedrockClient,
  FoundationModelSummary,
  ListFoundationModelsCommand
} from '@aws-sdk/client-bedrock'
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

const client = new BedrockClient()
const runtimeClient = new BedrockRuntimeClient()
const agentClient = new BedrockAgentRuntimeClient({ region: 'ap-northeast-1' }) // TODO

export type CallConverseAPIProps = {
  modelId: string
  messages: Message[]
  system: [{ text: string }]
}

const converse = async (props: CallConverseAPIProps): Promise<ConverseCommandOutput> => {
  const { modelId, messages, system } = props
  const command = new ConverseCommand({
    modelId,
    messages,
    system
  })
  return runtimeClient.send(command)
}

const MAX_RETRIES = 30 // 最大再試行回数
const RETRY_DELAY = 5000 // 再試行間隔 (ミリ秒)
const converseStream = async (
  props: CallConverseAPIProps,
  retries = 0
): Promise<ConverseStreamCommandOutput> => {
  try {
    const command = new ConverseStreamCommand(props)
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

/**
 * TODO: 指定したリージョンで利用可能なモデルを取得する処理は後ほど実装する
 */
const listModelsByFetch = async (): Promise<FoundationModelSummary[] | undefined> => {
  const command = new ListFoundationModelsCommand()
  const res = await client.send(command)
  return res.modelSummaries
}

const getAccountId = async () => {
  const sts = new STSClient()
  const command = new GetCallerIdentityCommand({})
  const res = await sts.send(command)
  return res.Account
}

const listModels = async () => {
  const accountId = await getAccountId()
  if (!accountId) {
    return models
  }

  const defaultPromptRouterModels = getDefaultPromptRouter(accountId, 'us-east-1') // TODO: region はユーザにて設定可能にする

  return [...models, ...defaultPromptRouterModels]
}

const retrieveAndGenerate = async (props: RetrieveAndGenerateCommandInput) => {
  const command = new RetrieveAndGenerateCommand(props)
  const res = await agentClient.send(command)
  return res
}

export const bedrock = {
  listModels,
  listModelsByFetch,
  converse,
  converseStream,
  retrieveAndGenerate
}

export type BedrockService = typeof bedrock
