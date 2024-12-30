import { ContentBlock } from '@aws-sdk/client-bedrock-runtime'

// Helper function to reconstruct Uint8Array from serialized object
function reconstructUint8Array(obj: any): Uint8Array {
  if (obj && typeof obj === 'object' && Object.keys(obj).every((key) => !isNaN(Number(key)))) {
    return new Uint8Array(Object.values(obj))
  }
  return obj
}

// Helper function to ensure image data is in the correct format
export function processImageContent(content: ContentBlock[]): ContentBlock[] {
  return content.map((block) => {
    if ('image' in block && block.image) {
      const imageBlock = block.image
      if (imageBlock.source && typeof imageBlock.source === 'object') {
        const source = imageBlock.source as any
        if (source.bytes) {
          // Reconstruct Uint8Array if it was serialized
          const bytes = reconstructUint8Array(source.bytes)
          if (bytes instanceof Uint8Array) {
            return {
              image: {
                format: imageBlock.format,
                source: { bytes }
              }
            }
          }
          // If bytes is a base64 string
          if (typeof bytes === 'string') {
            return {
              image: {
                format: imageBlock.format,
                source: {
                  bytes: new Uint8Array(Buffer.from(bytes, 'base64'))
                }
              }
            }
          }
        }
      }
    }
    return block
  })
}

export function debugImageContent(content: ContentBlock[]) {
  return content.map((content) => {
    if ('image' in content && content.image?.source?.bytes instanceof Uint8Array) {
      return {
        ...content,
        image: {
          ...content.image,
          source: {
            bytes: `[Uint8Array:${content.image.source.bytes.length}bytes]`
          }
        }
      }
    }
    return content
  })
}
