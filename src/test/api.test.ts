import { expect, test, describe } from '@jest/globals'
import { api } from '../preload/api'

describe('api', () => {
  test('should return 1', () => {
    expect(1).toBe(1)
  })

  test('list available foundation models', async () => {
    const res = await api.bedrock.listModels()
    console.log(res)
  })

  test.skip('call converse stream', async () => {
    const res = await api.bedrock.converseStream({
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
      system: [{ text: 'hello' }],
      messages: [{ role: 'user', content: [{ text: 'hi' }] }]
    })

    if (res.stream === undefined) {
      return
    }

    for await (const item of res.stream) {
      if (item.contentBlockDelta) {
        console.log(item.contentBlockDelta.delta?.text)
      }
    }
  })
})
