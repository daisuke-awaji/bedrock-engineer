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

const listModels = async (): Promise<FoundationModelSummary[] | undefined> => {
  const command = new ListFoundationModelsCommand()
  const res = await client.send(command)
  return res.modelSummaries
}

const retrieveAndGenerate = async (props: RetrieveAndGenerateCommandInput) => {
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
