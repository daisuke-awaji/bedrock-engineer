import { Message } from '@aws-sdk/client-bedrock-runtime'
import React from 'react'
import { Avatar } from './Avatar'
import { Accordion } from 'flowbite-react'
import { JSONCodeBlock } from '../CodeBlocks/JSONCodeBlock'
import { TextCodeBlock } from '../CodeBlocks/TextCodeBlock'
import CodeRenderer from '../Code/CodeRenderer'

type ChatMessageProps = {
  message: Message
  showCodePreview: boolean
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
          } else {
            throw new Error('Invalid message content')
          }
        })}
      </div>
    </div>
  )
}
