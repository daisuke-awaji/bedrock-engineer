import { ListFoundationModelsCommand } from '@aws-sdk/client-bedrock'
import { getDefaultPromptRouter, models } from '../models'
import { createBedrockClient } from '../client'
import { getAccountId } from '../utils/awsUtils'
import type { LLM } from '../../../../types/llm'
import type { AWSCredentials, ServiceContext } from '../types'

export class ModelService {
  private static readonly CACHE_LIFETIME = 1000 * 60 * 60 // 1 hour
  private modelCache: { [key: string]: any } = {}

  constructor(private context: ServiceContext) {}

  private async listAvailableModels(credentials: AWSCredentials) {
    const client = createBedrockClient(credentials)
    const command = new ListFoundationModelsCommand({})

    try {
      const response = await client.send(command)
      return (
        response.modelSummaries?.map((model) => ({
          modelId: model.modelId || '',
          modelName: model.modelName || ''
        })) || []
      )
    } catch (error) {
      console.error('Error listing foundation models:', error)
      return []
    }
  }

  async listModels() {
    const credentials = this.context.store.get('aws')
    const { region, accessKeyId, secretAccessKey } = credentials
    if (!region || !accessKeyId || !secretAccessKey) {
      console.warn('AWS credentials not configured')
      return []
    }

    const cacheKey = `${region}-${accessKeyId}`
    const cachedData = this.modelCache[cacheKey]

    if (
      cachedData &&
      cachedData._timestamp &&
      Date.now() - cachedData._timestamp < ModelService.CACHE_LIFETIME
    ) {
      return cachedData.filter((model) => !model._timestamp)
    }

    try {
      const availableModels = await this.listAvailableModels(credentials)
      const availableModelIds = availableModels.map((model) => model.modelId)
      const filteredModels = models.filter(
        (model: LLM) =>
          availableModelIds.includes(model.modelId) ||
          availableModelIds.includes(model.modelId.slice(3))
      )

      const accountId = await getAccountId(credentials)
      const promptRouterModels = accountId ? getDefaultPromptRouter(accountId, region) : []
      const result = [...filteredModels, ...promptRouterModels]
      this.modelCache[cacheKey] = [...result, { _timestamp: Date.now() } as any]

      return result
    } catch (error) {
      console.error('Error in listModels:', error)
      return []
    }
  }
}
