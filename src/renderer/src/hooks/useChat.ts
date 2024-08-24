import { streamChatCompletion } from '@renderer/lib/api'
import { useState } from 'react'

type UseChatProps = {
  systemPrompt: string
  modelId: string
}
export const useChat = (props: UseChatProps) => {
  const [messages, setMessages] = useState<{ role: string; content: { text: string }[] }[]>([])
  const [loading, setLoading] = useState(false)
  const [lastText, setLatestText] = useState('')

  const handleSubmit = async (input: string, messages) => {
    if (!input) {
      alert('Please enter a prompt')
      return
    }

    const msgs = [...messages, { role: 'user', content: [{ text: input }] }]
    setMessages(msgs)

    setLoading(true)

    const generator = streamChatCompletion({
      messages: msgs,
      modelId: props.modelId,
      system: [
        {
          text: props.systemPrompt
        }
      ]
    })

    let s = ''
    for await (const json of generator) {
      try {
        const text = json.contentBlockDelta?.delta?.text
        if (text) {
          setMessages([...msgs, { role: 'assistant', content: [{ type: 'text', text }] }])
          s = s + text
          setLatestText(s)
        }
      } catch (error) {
        console.error(error)
      }
    }
    setLoading(false)

    const msgsToset = [...msgs, { role: 'assistant', content: [{ text: s }] }]
    setMessages(msgsToset)
  }

  const initChat = () => setMessages([])

  return { messages, handleSubmit, loading, initChat, lastText }
}
