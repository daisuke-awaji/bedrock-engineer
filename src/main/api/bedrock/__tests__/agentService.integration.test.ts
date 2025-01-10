import { describe, test, beforeAll } from '@jest/globals'
import { BedrockService } from '../index'
import type { Store } from '../types'

// Skip these tests if not in integration test environment
const INTEGRATION_TEST = process.env.INTEGRATION_TEST === 'true'

// Create a mock store for testing
function createMockStore(initialState: Record<string, any> = {}): Store {
  const store = {
    state: { ...initialState },
    get(key: string) {
      if (key === 'aws') {
        return {
          region: process.env.AWS_REGION || 'us-west-2',
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      }
      if (key === 'inferenceParams') {
        return {
          maxTokens: 8192,
          temperature: 0.5,
          topP: 0.9
        }
      }
      return this.state[key]
    },
    set(key: string, value: any) {
      this.state[key] = value
    }
  }
  return store
}

// Only run these tests if INTEGRATION_TEST is true
;(INTEGRATION_TEST ? describe : describe.skip)('ImageService Integration Tests', () => {
  let bedrockService: BedrockService

  beforeAll(async () => {
    const mockStore = createMockStore()
    bedrockService = new BedrockService({ store: mockStore })
  })

  test('retrieve', async () => {
    const prompt = 'A serene mountain landscape at sunset with a calm lake reflection'

    const result = await bedrockService.retrieve({
      knowledgeBaseId: 'OOUYEZK6CG',
      retrievalQuery: {
        text: prompt
      }
    })

    console.log(result)
  }, 30000)
})
