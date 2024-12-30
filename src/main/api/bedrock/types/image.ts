export interface ImageGenerationOptions {
  aspect_ratio: AspectRatio
  /** Seed for deterministic generation */
  seed?: number
  output_format: OutputFormat
}

export type ImageGeneratorModel =
  | 'stability.sd3-large-v1:0'
  | 'stability.sd3-5-large-v1:0'
  | 'stability.stable-image-core-v1:0'
  | 'stability.stable-image-core-v1:1'
  | 'stability.stable-image-ultra-v1:0'
  | 'stability.stable-image-ultra-v1:1'
  | 'amazon.nova-canvas-v1:0'
  | 'amazon.titan-image-generator-v2:0'
  | 'amazon.titan-image-generator-v1'

export type AspectRatio = '1:1' | '16:9' | '2:3' | '3:2' | '4:5' | '5:4' | '9:16' | '9:21'
export type OutputFormat = 'png' | 'jpeg' | 'webp'

export interface GenerateImageRequest {
  modelId: ImageGeneratorModel
  prompt: string
  negativePrompt?: string
  aspect_ratio?: AspectRatio
  /** Seed for deterministic generation */
  seed?: number
  /** Default png */
  output_format?: OutputFormat
}

export interface GeneratedImage {
  seeds?: number[]
  finish_reasons?: string[]
  images: string[]
}
