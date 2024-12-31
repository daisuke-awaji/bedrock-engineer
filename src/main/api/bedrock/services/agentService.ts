import {
  RetrieveAndGenerateCommand,
  RetrieveAndGenerateCommandInput
} from '@aws-sdk/client-bedrock-agent-runtime'
import { createAgentRuntimeClient } from '../client'
import type { ServiceContext } from '../types'

export class AgentService {
  constructor(private context: ServiceContext) {}

  async retrieveAndGenerate(props: RetrieveAndGenerateCommandInput) {
    const agentClient = createAgentRuntimeClient(this.context.store.get('aws'))
    const command = new RetrieveAndGenerateCommand(props)
    const res = await agentClient.send(command)
    return res
  }
}
