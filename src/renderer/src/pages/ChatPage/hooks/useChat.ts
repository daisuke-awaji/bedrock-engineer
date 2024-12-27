import {
  ConversationRole,
  ContentBlock,
  Message,
  ToolUseBlockStart
} from '@aws-sdk/client-bedrock-runtime'
import { StreamChatCompletionProps, streamChatCompletion } from '@renderer/lib/api'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { ToolState } from '../../../../../types/types'

export const useChat = (
  modelId?: string,
  systemPrompt?: string,
  enabledTools: ToolState[] = []
) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()

  const handleSubmit = async (userInput: string) => {
    if (!userInput) {
      return toast.error('Please enter a message')
    }

    if (!modelId) {
      return toast.error('Please select a model')
    }

    const msgs = [...messages]
    const userInputMessage: Message = { role: 'user', content: [{ text: userInput }] }
    msgs.push(userInputMessage)
    setMessages((prev) => [...prev, userInputMessage])
    setLoading(true)

    await streamChat({
      messages: msgs,
      modelId,
      system: [{ text: systemPrompt ?? '' }],
      toolConfig: { tools: enabledTools }
    })

    const lastMessage = msgs[msgs.length - 1]
    console.log(lastMessage)
    if (lastMessage.content?.find((v) => v.toolUse)) {
      if (!lastMessage.content) {
        console.warn(lastMessage)
        return null
      }

      await recursivelyExecTool(lastMessage.content, msgs)
    }

    setLoading(false)

    async function recursivelyExecTool(contentBlocks: ContentBlock[], msgs: Message[]) {
      const contentBlock = contentBlocks.find((block) => block.toolUse)
      if (!contentBlock) {
        return
      }

      const toolResults: any = []
      for (const contentBlock of contentBlocks) {
        if (Object.keys(contentBlock).includes('toolUse')) {
          const toolUse = contentBlock.toolUse
          if (toolUse) {
            try {
              const toolResult = await window.api.bedrock.executeTool(toolUse.name, toolUse.input)
              toolResults.push({
                toolResult: {
                  toolUseId: toolUse.toolUseId,
                  content: [{ text: toolResult }],
                  status: 'success'
                }
              })
            } catch (e: any) {
              console.error(e)
              toolResults.push({
                toolResult: {
                  toolUseId: toolUse.toolUseId,
                  content: [{ text: e }],
                  status: 'error'
                }
              })
            }
          }
        }
      }

      const toolResultMessage: Message = {
        role: 'user',
        content: toolResults
      }
      msgs.push(toolResultMessage)
      setMessages((prev) => [...prev, toolResultMessage])

      if (!modelId) return

      const stopReason = await streamChat({
        messages: msgs,
        modelId,
        system: [
          {
            text: systemPrompt ?? ''
          }
        ],
        toolConfig: { tools: enabledTools }
      })

      if (stopReason === 'tool_use') {
        const a = msgs[msgs.length - 1].content
        if (a !== undefined) {
          return recursivelyExecTool(a, msgs)
        }
      }
    }

    async function streamChat(props: StreamChatCompletionProps) {
      const generator = streamChatCompletion(props)

      let s = ''
      let input = ''
      let role: ConversationRole | undefined = undefined
      let toolUse: ToolUseBlockStart | undefined = undefined
      const content: ContentBlock[] = []

      try {
        for await (const json of generator) {
          if (json.messageStart) {
            role = json.messageStart.role
          }

          if (json.messageStop) {
            setMessages([...msgs, { role, content }])
            msgs.push({ role, content })

            const stopReason = json.messageStop.stopReason
            return stopReason
          }

          if (json.contentBlockStart) {
            toolUse = json.contentBlockStart.start?.toolUse
          }

          if (json.contentBlockStop) {
            if (toolUse) {
              let parseInput: string
              try {
                parseInput = JSON.parse(input)
              } catch (e) {
                parseInput = input
              }

              content.push({
                toolUse: { name: toolUse?.name, toolUseId: toolUse?.toolUseId, input: parseInput }
              })
            } else {
              content.push({ text: s })
            }
            input = ''
          }

          if (json.contentBlockDelta) {
            const text = json.contentBlockDelta.delta?.text
            if (text) {
              s = s + text
              setMessages([...msgs, { role, content: [{ text: s }] }])
            }

            if (toolUse) {
              input = input + json.contentBlockDelta.delta?.toolUse?.input

              setMessages([
                ...msgs,
                {
                  role,
                  content: [
                    { text: s },
                    {
                      toolUse: { name: toolUse?.name, toolUseId: toolUse?.toolUseId, input: input }
                    }
                  ]
                }
              ])
            }
          }
        }
      } catch (error: any) {
        console.error({ streamChatRequestError: error })
        toast.error(t('request error'))
        setMessages([...msgs, { role: 'assistant', content: [{ text: error.message }] }])
        setLoading(false)
      }
      throw new Error('unexpected end of stream')
    }
    return
  }

  return {
    messages,
    loading,
    handleSubmit,
    setMessages
  }
}
