import {
  ConversationRole,
  ContentBlock,
  Message,
  ToolUseBlockStart,
  ImageFormat
} from '@aws-sdk/client-bedrock-runtime'
import { StreamChatCompletionProps, streamChatCompletion } from '@renderer/lib/api'
import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { ToolState } from '@/types/agent-chat'
import { AttachedImage } from '../components/InputForm/TextArea'
import { ChatMessage } from '@/types/chat/history'

export const useAgentChat = (
  modelId: string,
  systemPrompt?: string,
  enabledTools: ToolState[] = [],
  sessionId?: string
) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(sessionId)
  const abortController = useRef<AbortController | null>(null)
  const { t } = useTranslation()

  // 通信を中断する関数
  const abortCurrentRequest = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort()
      abortController.current = null
    }
    setLoading(false)
  }, [])

  // セッションの初期化
  useEffect(() => {
    if (sessionId) {
      const session = window.chatHistory.getSession(sessionId)
      if (session) {
        // 既存の通信があれば中断
        abortCurrentRequest()
        setMessages(session.messages as Message[])

        setCurrentSessionId(sessionId)
      }
    } else {
      const newSessionId = window.chatHistory.createSession('defaultAgent', modelId, systemPrompt)
      setCurrentSessionId(newSessionId)
    }
  }, [sessionId])

  // コンポーネントのアンマウント時にアクティブな通信を中断
  useEffect(() => {
    return () => {
      abortCurrentRequest()
    }
  }, [])

  // currentSessionId が変わった時の処理
  useEffect(() => {
    if (currentSessionId) {
      // セッション切り替え時に進行中の通信を中断
      abortCurrentRequest()

      const session = window.chatHistory.getSession(currentSessionId)
      if (session) {
        console.log({ sessionをHistoryから復元: session })
        setMessages(session.messages as Message[])

        window.chatHistory.setActiveSession(currentSessionId)
      }
    }
  }, [currentSessionId])

  // メッセージの永続化を行うラッパー関数
  const persistMessage = useCallback(
    (message: Message) => {
      if (currentSessionId && message.role && message.content) {
        const chatMessage: ChatMessage = {
          id: `msg_${Date.now()}`,
          role: message.role,
          content: message.content,
          timestamp: Date.now(),
          metadata: {
            modelId,
            tools: enabledTools
          }
        }
        window.chatHistory.addMessage(currentSessionId, chatMessage)
      }
    },
    [currentSessionId, modelId, enabledTools]
  )

  const streamChat = async (props: StreamChatCompletionProps, currentMessages: Message[]) => {
    // 既存の通信があれば中断
    if (abortController.current) {
      abortController.current.abort()
    }

    // 新しい AbortController を作成
    abortController.current = new AbortController()

    const generator = streamChatCompletion(props, abortController.current.signal)

    let s = ''
    let input = ''
    let role: ConversationRole = 'assistant' // デフォルト値を設定
    let toolUse: ToolUseBlockStart | undefined = undefined
    const content: ContentBlock[] = []

    let messageStart = false
    try {
      for await (const json of generator) {
        if (json.messageStart) {
          role = json.messageStart.role ?? 'assistant' // デフォルト値を設定
          messageStart = true
        } else if (json.messageStop) {
          if (!messageStart) {
            console.warn('messageStop without messageStart')
            console.log(messages)
            await streamChat(props, currentMessages)
            return
          }
          const newMessage = { role, content }
          setMessages([...currentMessages, newMessage])
          currentMessages.push(newMessage)
          persistMessage(newMessage)
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
      if (error.name === 'AbortError') {
        console.log('Chat stream aborted')
        return
      }
      console.error({ streamChatRequestError: error })
      toast.error(t('request error'))
      const errorMessage = {
        role: 'assistant' as const,
        content: [{ text: error.message }]
      }
      setMessages([...currentMessages, errorMessage])
      persistMessage(errorMessage)
      throw error
    } finally {
      // 使用済みの AbortController をクリア
      if (abortController.current?.signal.aborted) {
        abortController.current = null
      }
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
        if (toolUse?.name) {
          try {
            const toolResult = await window.api.bedrock.executeTool(toolUse.name, toolUse.input)
            if (Object.prototype.hasOwnProperty.call(toolResult, 'name')) {
              toolResults.push({
                toolResult: {
                  toolUseId: toolUse.toolUseId,
                  content: [{ json: toolResult }],
                  status: 'success'
                }
              })
            } else {
              toolResults.push({
                toolResult: {
                  toolUseId: toolUse.toolUseId,
                  content: [{ text: toolResult }],
                  status: 'success'
                }
              })
            }
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
    persistMessage(toolResultMessage)

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

    let result
    try {
      setLoading(true)
      const currentMessages = [...messages]

      const imageContents: any =
        attachedImages?.map((image) => ({
          image: {
            format: image.file.type.split('/')[1] as ImageFormat,
            source: {
              bytes: image.base64
            }
          }
        })) ?? []

      const content =
        imageContents.length > 0 ? [...imageContents, { text: userInput }] : [{ text: userInput }]
      const userMessage: Message = {
        role: 'user',
        content
      }

      currentMessages.push(userMessage)
      setMessages((prev) => [...prev, userMessage])
      persistMessage(userMessage)

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
          result = null
        } else {
          result = await recursivelyExecTool(lastMessage.content, currentMessages)
        }
      }
    } catch (error: any) {
      console.error('Error in handleSubmit:', error)
      toast.error(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
    return result
  }

  // チャットをクリアする機能
  const clearChat = useCallback(() => {
    // 進行中の通信を中断
    abortCurrentRequest()

    // 新しいセッションを作成
    const newSessionId = window.chatHistory.createSession('defaultAgent', modelId, systemPrompt)
    setCurrentSessionId(newSessionId)

    // メッセージをクリア
    setMessages([])
  }, [modelId, systemPrompt, abortCurrentRequest])

  const setSession = useCallback(
    (newSessionId: string) => {
      // 進行中の通信を中断してから新しいセッションを設定
      abortCurrentRequest()
      setCurrentSessionId(newSessionId)
    },
    [abortCurrentRequest]
  )

  return {
    messages,
    loading,
    handleSubmit,
    setMessages,
    currentSessionId,
    setCurrentSessionId: setSession, // 中断処理付きのセッション切り替え関数を返す
    clearChat
  }
}
