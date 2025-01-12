import { ConverseService } from './services/converseService'
import { ModelService } from './services/modelService'
import { AgentService } from './services/agentService'
import { ImageService } from './services/imageService'
import type { ServiceContext } from './types'
import type { GenerateImageRequest, GeneratedImage } from './types/image'

export class BedrockService {
  private converseService: ConverseService
  private modelService: ModelService
  private agentService: AgentService
  private imageService: ImageService

  constructor(context: ServiceContext) {
    this.converseService = new ConverseService(context)
    this.modelService = new ModelService(context)
    this.agentService = new AgentService(context)
    this.imageService = new ImageService(context)
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

  async retrieve(props: Parameters<AgentService['retrieve']>[0]) {
    return this.agentService.retrieve(props)
  }

  async invokeAgent(props: Parameters<AgentService['invokeAgent']>[0]) {
    return this.agentService.invokeAgent(props)
  }

  async generateImage(request: GenerateImageRequest): Promise<GeneratedImage> {
    return this.imageService.generateImage(request)
  }

  isImageModelSupported(modelId: string): boolean {
    return this.imageService.isModelSupported(modelId)
  }
}

// Re-export types for convenience
export * from './types'
export * from './types/image'
