import {
  BedrockAgentRuntimeClient,
  RetrieveAndGenerateCommand,
  RetrieveAndGenerateCommandInput,
  RetrieveCommand,
  RetrieveCommandInput
} from '@aws-sdk/client-bedrock-agent-runtime'
import { createAgentRuntimeClient } from '../client'
import type { ServiceContext } from '../types'

export class AgentService {
  private agentClient: BedrockAgentRuntimeClient
  constructor(private context: ServiceContext) {
    this.agentClient = createAgentRuntimeClient(this.context.store.get('aws'))
  }

  async retrieveAndGenerate(props: RetrieveAndGenerateCommandInput) {
    const command = new RetrieveAndGenerateCommand(props)
    const res = await this.agentClient.send(command)
    return res
  }

  async retrieve(props: RetrieveCommandInput) {
    const command = new RetrieveCommand(props)
    const res = await this.agentClient.send(command)
    return res
  }
}
