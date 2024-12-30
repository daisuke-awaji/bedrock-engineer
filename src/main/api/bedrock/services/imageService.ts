import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import type { ServiceContext } from '../types'
import type {
  AspectRatio,
  GenerateImageRequest,
  GeneratedImage,
  StabilityModel
} from '../types/image'

type ModelType = 'core' | 'ultra' | 'sd3'

interface CoreModelRequest {
  prompt: string
  negative_prompt?: string
  aspect_ratio?: AspectRatio
  style_preset?: string
  seed?: number
  output_format: 'png' | 'jpeg' | 'webp'
}

interface SD3ModelRequest extends CoreModelRequest {
  mode: 'text-to-image' | 'image-to-image'
}

export class ImageService {
  private runtimeClient: BedrockRuntimeClient

  constructor(private context: ServiceContext) {
    const { region, accessKeyId, secretAccessKey } = this.context.store.get('aws')
    if (!accessKeyId || !secretAccessKey) {
      throw new Error('AWS credentials not configured')
    }

    this.runtimeClient = new BedrockRuntimeClient({
      credentials: {
        accessKeyId,
        secretAccessKey
      },
      region
    })
  }

  private getModelType(modelId: StabilityModel): ModelType {
    if (modelId.includes('core')) return 'core'
    if (modelId.includes('ultra')) return 'ultra'
    if (modelId.includes('sd3')) return 'sd3'
    throw new Error(`Unknown model type for modelId: ${modelId}`)
  }

  private buildRequestBody(
    modelType: ModelType,
    request: GenerateImageRequest
  ): CoreModelRequest | SD3ModelRequest {
    const { prompt, negativePrompt, aspect_ratio, seed, output_format = 'png' } = request

    switch (modelType) {
      case 'core':
        return {
          prompt,
          negative_prompt: negativePrompt,
          aspect_ratio,
          seed,
          output_format
        }

      case 'ultra':
        return {
          prompt,
          negative_prompt: negativePrompt,
          aspect_ratio,
          seed,
          output_format
        }

      case 'sd3':
        return {
          prompt,
          negative_prompt: negativePrompt,
          aspect_ratio,
          seed,
          mode: 'text-to-image',
          output_format
        }
    }
  }

  async generateImage(request: GenerateImageRequest): Promise<GeneratedImage> {
    const { modelId } = request

    // Validate model ID
    if (!this.isModelSupported(modelId)) {
      throw new Error(
        `Model ${modelId} is not supported. Supported models: ${this.getSupportedModels().join(', ')}`
      )
    }

    const modelType = this.getModelType(modelId)
    const requestBody = this.buildRequestBody(modelType, request)

    try {
      const command = new InvokeModelCommand({
        modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(requestBody)
      })

      const response = await this.runtimeClient.send(command)
      const responseBody = new TextDecoder().decode(response.body)
      const result = JSON.parse(responseBody)

      // Handle different response formats
      if (modelType === 'core' || modelType === 'ultra' || modelType === 'sd3') {
        if (!result.images || !Array.isArray(result.images)) {
          throw new Error('Invalid response format from Bedrock')
        }
        return result
      } else {
        // 未実装
        throw new Error('Unsupported model type')
      }
    } catch (error: any) {
      console.error('Error generating image:', error)
      if (error.name === 'UnrecognizedClientException') {
        throw new Error('AWS authentication failed. Please check your credentials and permissions.')
      }
      if (error.name === 'ValidationException') {
        throw new Error(`Invalid request parameters: ${error.message}`)
      }
      throw error
    }
  }

  // Helper method to validate model compatibility
  isModelSupported(modelId: string): modelId is StabilityModel {
    return this.getSupportedModels().includes(modelId as StabilityModel)
  }

  private getSupportedModels(): StabilityModel[] {
    return [
      'stability.sd3-large-v1:0',
      'stability.sd3-5-large-v1:0',
      'stability.stable-image-core-v1:0',
      'stability.stable-image-core-v1:1',
      'stability.stable-image-ultra-v1:0',
      'stability.stable-image-ultra-v1:1'
    ]
  }
}
