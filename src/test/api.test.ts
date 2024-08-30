import { jest, expect, test, describe } from '@jest/globals'
// import { api } from '../preload/api'
// import { GetFileComponentsResponse, type GetFileResponse } from '@figma/rest-api-spec'
// import axios from 'axios'
import * as Figma from 'figma-js'
import getRandomPort from '../preload/lib/random-port'
import { BedrockClient, ListFoundationModelsCommand } from '@aws-sdk/client-bedrock'
import {
  BedrockAgentRuntimeClient,
  RetrieveAndGenerateCommand
} from '@aws-sdk/client-bedrock-agent-runtime'

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

  test('bedrock knowledge base', async () => {
    const client = new BedrockAgentRuntimeClient({ region: 'ap-northeast-1' })

    const promptTemplate = `お客様からのお問い合わせ内容と参考ドキュメントとして与えられるデザインシステムの内容を元に、React のコンポーネントソースコードとその説明文をJSON 配列の形式で出力してください。

    <rule>
    - お客様のお問い合わせ内容に対して参考ドキュメントは以下です。
      $search_results$
    - React コンポーネントのサイズや色、その他の全般的なアクセシビリティに関わる推奨事項は慎重に検討をし、限りなくドキュメントに従うように回答してください。
    - GitHub に記載されているソースコードを優先的に検索してください。
    </rule>

    JSON配列の構造とそのサンプルは以下のとおりです。
    指定された問い合わせないように対してバリエーションを持たせて、説明文章とソースコードを複数個提示してください。
    最低 5 件、最大 30 件までとします。
    <schema>
      [
        {
          "description": "ReactコンポーネントAに対する説明",
          "code": "ReactコンポーネントAのコード"
        },
        {
          "description": "ReactコンポーネントBに対する説明",
          "code": "ReactコンポーネントBのコード"
        }
      ]
    </schema>
    <schema-rule>
    - description プロパティには React のソースコードに関する説明を記述します。
    - code プロパティには React のソースコード以外の形式では出力しないでください。
    - そのほか、このスキーマ構造の前後に説明文などは一切含めてはいけません。説明が必要な場合は description プロパティに含めてください。
    </schema-rule>
    `

    const inputText =
      'Button テンプレートを使った React のサンプルコード\n 青い色のボタンが望ましいです。style も付与してください。'

    const retrieveAndGen = new RetrieveAndGenerateCommand({
      input: {
        text: inputText
      },
      retrieveAndGenerateConfiguration: {
        type: 'KNOWLEDGE_BASE',
        knowledgeBaseConfiguration: {
          knowledgeBaseId: '4YEZHG5NSQ',
          modelArn:
            'arn:aws:bedrock:ap-northeast-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0',
          generationConfiguration: {
            promptTemplate: {
              textPromptTemplate: promptTemplate
            }
          }
        }
      }
    })

    const { output } = await client.send(retrieveAndGen)
    // console.log(citations)
    console.log({ input: { promptTemplate, inputText }, output })
    console.log(output?.text)
  })
})
