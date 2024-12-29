import { store } from '../../../preload/store'
import { ConverseService } from './services/converseService'
import { ModelService } from './services/modelService'
import { AgentService } from './services/agentService'
import type { ServiceContext } from './types'

export class BedrockService {
  private converseService: ConverseService
  private modelService: ModelService
  private agentService: AgentService

  constructor(context: ServiceContext) {
    this.converseService = new ConverseService(context)
    this.modelService = new ModelService(context)
    this.agentService = new AgentService(context)
  }

  async listModels() {
    return this.modelService.listModels()
  }

  async converse(props: Parameters<ConverseService['converse']>[0]) {
    return this.converseService.converse(props)
  }

  async converseStream(props: Parameters<ConverseService['converseStream']>[0]) {
    return this.converseService.converseStream(props)
  }

  async retrieveAndGenerate(props: Parameters<AgentService['retrieveAndGenerate']>[0]) {
    return this.agentService.retrieveAndGenerate(props)
  }
}

// Create default instance with electron store
export const bedrock = new BedrockService({ store })

// Re-export types for convenience
export * from './types'
