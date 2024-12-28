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

export const useChat = (
  modelId?: string,
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
    let role: ConversationRole | undefined = undefined
    let toolUse: ToolUseBlockStart | undefined = undefined
    const content: ContentBlock[] = []

    try {
      for await (const json of generator) {
        if (json.messageStart) {
          role = json.messageStart.role
        }

        if (json.messageStop) {
          setMessages([...currentMessages, { role, content }])
          currentMessages.push({ role, content })

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

    if (!modelId) return

    const stopReason = await streamChat(
      {
        messages: currentMessages,
        modelId,
        system: systemPrompt ? [{ text: systemPrompt }] : undefined,
        toolConfig: { tools: enabledTools }
      },
      currentMessages
    )

    if (stopReason === 'tool_use') {
      const lastMessage = currentMessages[currentMessages.length - 1].content
      if (lastMessage) {
        return recursivelyExecTool(lastMessage, currentMessages)
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
          toolConfig: { tools: enabledTools }
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
