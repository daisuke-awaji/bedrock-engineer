export interface ImageGenerationOptions {
  aspect_ratio: '1:1' | '16:9' | '2:3' | '3:2' | '4:5' | '5:4' | '9:16' | '9:21'
  /** Seed for deterministic generation */
  seed?: number
  /** Image style to apply */
  output_format: 'png' | 'jpeg' | 'webp'
}

export type StabilityModel =
  | 'stability.sd3-large-v1:0'
  | 'stability.sd3-5-large-v1:0'
  | 'stability.stable-image-core-v1:0'
  | 'stability.stable-image-core-v1:1'
  | 'stability.stable-image-ultra-v1:0'
  | 'stability.stable-image-ultra-v1:1'

export type AspectRatio = '1:1' | '16:9' | '2:3' | '3:2' | '4:5' | '5:4' | '9:16' | '9:21'

export interface GenerateImageRequest {
  modelId: StabilityModel
  prompt: string
  negativePrompt?: string
  aspect_ratio?: AspectRatio
  /** Seed for deterministic generation */
  seed?: number

  // Default png
  output_format?: 'png' | 'jpeg' | 'webp'
}

export interface GeneratedImage {
  seeds: number[]
  finish_reasons: string[]
  images: string[]
}
