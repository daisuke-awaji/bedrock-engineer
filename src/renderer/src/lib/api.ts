import { ConverseStreamOutput } from '@aws-sdk/client-bedrock-runtime'

type StreamChatCompletionProps = {
  modelId: string
  system: { text: string }[]
  messages: { role: string; content: { text: string }[] }[]
}

export async function* streamChatCompletion(
  props: StreamChatCompletionProps
): AsyncGenerator<ConverseStreamOutput, void, unknown> {
  const res = await fetch('http://localhost:3000/converse/stream', {
    method: 'POST',
    body: JSON.stringify(props),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  const reader = res.body?.getReader()

  if (res.status !== 200 || !reader) {
    throw new Error('Request failed')
  }

  const decoder = new TextDecoder('utf-8')
  let done = false
  while (!done) {
    const { done: readDone, value } = await reader.read()
    if (readDone) {
      done = readDone
      reader.releaseLock()
    } else {
      let token = decoder.decode(value, { stream: true })

      const boundary = token.lastIndexOf(`\n`)
      // 2つ以上の JSON オブジェクトが連なっている場合
      if (boundary !== -1) {
        const completeData = token.substring(0, boundary)
        token = token.substring(boundary + 1)

        for (const chunk of completeData.split('\n')) {
          if (chunk) {
            try {
              yield JSON.parse(chunk)
            } catch (e) {
              console.error(`Error parsing JSON:`, e)
            }
          }
        }
      } else {
        yield JSON.parse(token)
      }
    }
  }
}
