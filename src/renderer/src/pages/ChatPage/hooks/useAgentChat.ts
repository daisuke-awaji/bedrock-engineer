import {
  ConversationRole,
  ContentBlock,
  Message,
  ToolUseBlockStart,
  ImageFormat
} from '@aws-sdk/client-bedrock-runtime'
import { StreamChatCompletionProps, streamChatCompletion } from '@renderer/lib/api'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { ToolState } from '@/types/agent-chat'
import { AttachedImage } from '../components/InputForm/TextArea'

export const useAgentChat = (
  modelId: string,
  systemPrompt?: string,
  enabledTools: ToolState[] = []
) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()

  const streamChat = async (props: StreamChatCompletionProps, currentMessages: Message[]) => {
    const generator = streamChatCompletion(props)

    let s = ''
    let input = ''
    let role: ConversationRole | undefined = 'assistant' // 必ず初回は assistant から帰ってくる
    let toolUse: ToolUseBlockStart | undefined = undefined
    const content: ContentBlock[] = []

    let messageStart = false
    try {
      for await (const json of generator) {
        if (json.messageStart) {
          role = json.messageStart.role
          messageStart = true
        } else if (json.messageStop) {
          // messageStart で始まらず、messageStop が連続して2回以上帰ってくる場合がある。これは Claude のバグな気がするが、、、念の為リトライしておく
          if (!messageStart) {
            console.warn('messageStop without messageStart')
            console.log(messages)
            await streamChat(props, currentMessages)
            return
          }
          setMessages([...currentMessages, { role, content }])
          currentMessages.push({ role, content })
          console.log(currentMessages)

          const stopReason = json.messageStop.stopReason
          return stopReason
        } else if (json.contentBlockStart) {
          toolUse = json.contentBlockStart.start?.toolUse
        } else if (json.contentBlockStop) {
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
        } else if (json.contentBlockDelta) {
          const text = json.contentBlockDelta.delta?.text
          if (text) {
            s = s + text
            setMessages([...currentMessages, { role, content: [{ text: s }] }])
          }

          if (toolUse) {
            input = input + json.contentBlockDelta.delta?.toolUse?.input

            setMessages([
              ...currentMessages,
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
        } else {
          console.error('unexpected json:', json)
        }
      }
    } catch (error: any) {
      console.error({ streamChatRequestError: error })
      toast.error(t('request error'))
      setMessages([...currentMessages, { role: 'assistant', content: [{ text: error.message }] }])
      throw error
    }
    throw new Error('unexpected end of stream')
  }

  const recursivelyExecTool = async (contentBlocks: ContentBlock[], currentMessages: Message[]) => {
    const contentBlock = contentBlocks.find((block) => block.toolUse)
    if (!contentBlock) {
      return
    }

    const toolResults: ContentBlock[] = []
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
                content: [{ text: e.toString() }],
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
    currentMessages.push(toolResultMessage)
    setMessages((prev) => [...prev, toolResultMessage])

    const stopReason = await streamChat(
      {
        messages: currentMessages,
        modelId,
        system: systemPrompt ? [{ text: systemPrompt }] : undefined,
        toolConfig: enabledTools.length ? { tools: enabledTools } : undefined
      },
      currentMessages
    )

    if (stopReason === 'tool_use') {
      const lastMessage = currentMessages[currentMessages.length - 1].content
      if (lastMessage) {
        await recursivelyExecTool(lastMessage, currentMessages)
        return
      }
    }
  }

  const handleSubmit = async (userInput: string, attachedImages?: AttachedImage[]) => {
    if (!userInput && (!attachedImages || attachedImages.length === 0)) {
      return toast.error('Please enter a message or attach images')
    }

    if (!modelId) {
      return toast.error('Please select a model')
    }

    try {
      setLoading(true)
      const currentMessages = [...messages]

      const imageContents: any =
        attachedImages?.map((image) => ({
          image: {
            format: image.file.type.split('/')[1] as ImageFormat,
            source: {
              bytes: image.base64 // ここでbase64文字列をそのまま送信
            }
          }
        })) ?? []

      const content =
        imageContents.length > 0 ? [...imageContents, { text: userInput }] : [{ text: userInput }]
      const userMessage: Message = {
        role: 'user',
        content: content
      }

      currentMessages.push(userMessage)
      setMessages((prev) => [...prev, userMessage])

      await streamChat(
        {
          messages: currentMessages,
          modelId,
          system: systemPrompt ? [{ text: systemPrompt }] : undefined,
          toolConfig: enabledTools.length ? { tools: enabledTools } : undefined
        },
        currentMessages
      )

      const lastMessage = currentMessages[currentMessages.length - 1]
      if (lastMessage.content?.find((v) => v.toolUse)) {
        if (!lastMessage.content) {
          console.warn(lastMessage)
          return null
        }

        await recursivelyExecTool(lastMessage.content, currentMessages)
      }
    } catch (error: any) {
      console.error('Error in handleSubmit:', error)
      toast.error(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return {
    messages,
    loading,
    handleSubmit,
    setMessages
  }
}
