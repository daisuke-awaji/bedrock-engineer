import { Message } from '@aws-sdk/client-bedrock-runtime'
import React from 'react'
import { Avatar } from './Avatar'
import { Accordion } from 'flowbite-react'
import { JSONCodeBlock } from '../CodeBlocks/JSONCodeBlock'
import { TextCodeBlock } from '../CodeBlocks/TextCodeBlock'
import CodeRenderer from '../Code/CodeRenderer'

type ChatMessageProps = {
  message: Message
}

// Helper function to convert various image data formats to data URL
function convertImageToDataUrl(imageData: any, format: string = 'png'): string {
  if (!imageData) return ''

  // If it's already a base64 string
  if (typeof imageData === 'string') {
    // Check if it's already a data URL
    if (imageData.startsWith('data:')) {
      return imageData
    }
    // Convert base64 to data URL
    return `data:image/${format};base64,${imageData}`
  }

  // If it's a Uint8Array
  if (imageData instanceof Uint8Array) {
    // Convert Uint8Array to base64
    const binary = Array.from(imageData)
      .map((byte) => String.fromCharCode(byte))
      .join('')
    const base64 = btoa(binary)
    return `data:image/${format};base64,${base64}`
  }

  // If it's a plain object (serialized Uint8Array)
  if (typeof imageData === 'object' && 'bytes' in imageData) {
    return convertImageToDataUrl(imageData.bytes, format)
  }

  console.warn('Unsupported image data format:', imageData)
  return ''
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div className="flex gap-4">
      <Avatar role={message.role} />
      <div className="flex flex-col gap-2 w-full">
        <span className="text-xs text-gray-500">{message.role}</span>
        {message.content?.map((c, index) => {
          if ('text' in c) {
            return <CodeRenderer key={index} text={c.text} />
          } else if ('toolUse' in c) {
            return (
              <div key={index} className="flex flex-col gap-2 text-xs w-full">
                <Accordion className="w-full" collapseAll>
                  <Accordion.Panel>
                    <Accordion.Title>
                      <span>Tool Use</span>
                      <span className="ml-2 border rounded-md bg-gray-200 px-2">
                        {c.toolUse?.name}
                      </span>
                      <span className="ml-2">{c.toolUse?.toolUseId}</span>
                    </Accordion.Title>
                    <Accordion.Content>
                      <JSONCodeBlock json={c.toolUse?.input} />
                    </Accordion.Content>
                  </Accordion.Panel>
                </Accordion>
              </div>
            )
          } else if ('toolResult' in c) {
            return (
              <div key={index} className="flex flex-col gap-2 text-xs w-full">
                <Accordion className="w-full" collapseAll>
                  <Accordion.Panel>
                    <Accordion.Title>
                      <span>Tool Result</span>
                      <span
                        className={`ml-2 rounded-md px-2 ${c.toolResult?.status === 'success' ? 'bg-[#28a745] text-white' : 'bg-[#be1f1f] text-white'}`}
                      >
                        {c.toolResult?.status}
                      </span>
                      <span className="ml-2">{c.toolResult?.toolUseId}</span>
                    </Accordion.Title>
                    <Accordion.Content className="w-full">
                      {c.toolResult?.content?.map((content, index) => {
                        if ('text' in content) {
                          return <TextCodeBlock key={index} text={content.text ?? ''} />
                        } else {
                          return <JSONCodeBlock key={index} json={content} />
                        }
                      })}
                    </Accordion.Content>
                  </Accordion.Panel>
                </Accordion>
              </div>
            )
          } else if ('image' in c) {
            const imageUrl = convertImageToDataUrl(c.image?.source?.bytes)
            return (
              <div key={index} className="max-w-lg">
                <img
                  src={imageUrl}
                  alt="image"
                  className="rounded-lg shadow-sm max-h-[512px] object-contain"
                />
              </div>
            )
          } else {
            console.error(c)
            console.error('Invalid message content')
            return <CodeRenderer key={index} text={JSON.stringify(c)} />
          }
        })}
      </div>
    </div>
  )
}
