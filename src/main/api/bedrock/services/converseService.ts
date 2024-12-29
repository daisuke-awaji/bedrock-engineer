import {
  ConverseCommand,
  ConverseCommandOutput,
  ConverseStreamCommand,
  ConverseStreamCommandOutput
} from '@aws-sdk/client-bedrock-runtime'
import { createRuntimeClient } from '../client'
import { processImageContent } from '../utils/imageUtils'
import type { CallConverseAPIProps, ServiceContext } from '../types'

export class ConverseService {
  constructor(private context: ServiceContext) {}

  async converse(props: CallConverseAPIProps): Promise<ConverseCommandOutput> {
    const { modelId, messages, system, toolConfig } = props

    // Process messages to ensure image data is in correct format
    const processedMessages = messages.map((msg) => ({
      ...msg,
      content: Array.isArray(msg.content) ? processImageContent(msg.content) : msg.content
    }))

    const { maxTokens, temperature, topP } = this.context.store.get('inferenceParams')
    const command = new ConverseCommand({
      modelId,
      messages: processedMessages,
      system,
      toolConfig,
      inferenceConfig: { maxTokens, temperature, topP }
    })

    const runtimeClient = createRuntimeClient(this.context.store.get('aws'))
    return runtimeClient.send(command)
  }

  private static readonly MAX_RETRIES = 30
  private static readonly RETRY_DELAY = 5000

  async converseStream(
    props: CallConverseAPIProps,
    retries = 0
  ): Promise<ConverseStreamCommandOutput> {
    const runtimeClient = createRuntimeClient(this.context.store.get('aws'))

    try {
      const { modelId, messages, system, toolConfig } = props

      const processedMessages = messages.map((msg) => ({
        ...msg,
        content: Array.isArray(msg.content) ? processImageContent(msg.content) : msg.content
      }))

      const command = new ConverseStreamCommand({
        modelId,
        messages: processedMessages,
        system,
        toolConfig,
        inferenceConfig: this.context.store.get('inferenceParams')
      })

      return await runtimeClient.send(command)
    } catch (error: any) {
      if (error.name === 'ThrottlingException') {
        console.log({ retry: retries, error, errorName: error.name })
        if (retries >= ConverseService.MAX_RETRIES) {
          throw error
        }
        await new Promise((resolve) => setTimeout(resolve, ConverseService.RETRY_DELAY))
        return this.converseStream(props, retries + 1)
      }
      console.log({ error })
      throw error
    }
  }
}
