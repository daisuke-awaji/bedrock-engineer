import { jest, expect, test, describe } from '@jest/globals'
// import { api } from '../preload/api'
// import { GetFileComponentsResponse, type GetFileResponse } from '@figma/rest-api-spec'
// import axios from 'axios'
import * as Figma from 'figma-js'
import getRandomPort from '../preload/lib/random-port'
import { BedrockClient, ListFoundationModelsCommand } from '@aws-sdk/client-bedrock'

jest.setTimeout(300000)

describe('api', () => {
  test('should return 1', () => {
    expect(1).toBe(1)
  })

  test.skip('list available foundation models', async () => {
    const client = new BedrockClient()
    const command = new ListFoundationModelsCommand()
    const res = await client.send(command)
    const result = res.modelSummaries
      ?.filter((value) => {
        return (
          value.providerName === 'Anthropic' &&
          value.modelLifecycle?.status === 'ACTIVE' &&
          value.inferenceTypesSupported?.includes('ON_DEMAND') &&
          value.modelName?.includes('Claude 3')
        )
      })
      .map((value) => {
        return {
          modelId: value.modelId,
          modelName: value.modelName
        }
      })
    console.log(result)
  })

  // test.skip('call converse stream', async () => {
  //   const res = await api.bedrock.converseStream({
  //     modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
  //     system: [{ text: 'hello' }],
  //     messages: [{ role: 'user', content: [{ text: 'hi' }] }]
  //   })

  //   if (res.stream === undefined) {
  //     return
  //   }

  //   for await (const item of res.stream) {
  //     if (item.contentBlockDelta) {
  //       console.log(item.contentBlockDelta.delta?.text)
  //     }
  //   }
  // })

  test.skip('figma api', async () => {
    const fileKey = 'OTZ9duRPzWibEEwMa7tqcm'
    const client = Figma.Client({
      personalAccessToken: 'token'
    })
    const res = await client.file(fileKey)
    console.log(JSON.stringify(res.data, null, 2))
  })

  test.skip('port', async () => {
    const p = await getRandomPort(3000)
    console.log(p)
  })
})
