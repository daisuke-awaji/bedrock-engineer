import React, { useEffect, useState } from 'react'
import { FcFolder, FcSupport, FcVoicePresentation } from 'react-icons/fc'
import { FiSend } from 'react-icons/fi'
import { RiRobot2Line } from 'react-icons/ri'
import prompts from '@renderer/prompts/prompts'
import useProject from '@renderer/hooks/useProject'
import useLLM from '@renderer/hooks/useLLM'
import useTavilySearch from '@renderer/hooks/useTavilySearch'
import useAdvancedSetting from '@renderer/hooks/useAdvancedSetting'
import useToolSettingModal from './useToolSettingModal'
import useScroll from '@renderer/hooks/useScroll'
import { ContentBlock, ConversationRole, Message } from '@aws-sdk/client-bedrock-runtime'
import { Accordion } from 'flowbite-react'
import MD from './MD'

const agents = [
  {
    name: 'Software Engineer Agent',
    value: 'softwareAgent',
    description:
      'This AI agent understands software project structures and creates files and folders.'
  }
]

const renderAvator = (role?: ConversationRole) => {
  // if (content.toolUse || content.toolResult) {
  // return <FcElectronics />
  // }

  if (role === 'assistant') {
    return <RiRobot2Line className="h-8 w-8" />
  } else {
    return <FcVoicePresentation className="h-8 w-8" />
  }
}

type ChatAvatorProps = {
  role?: ConversationRole
}
const ChatAvator: React.FC<ChatAvatorProps> = ({ role }) => {
  return <div className="flex items-center justify-center w-10 h-10">{renderAvator(role)}</div>
}

type JSONCodeBlockProps = {
  json: any
}
const JSONCodeBlock = (props: JSONCodeBlockProps) => {
  const json = JSON.stringify(props.json, null, 2)
  return (
    <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto whitespace-pre-wrap max-h-[50vh] max-w-[90vw]">
      <code>{json}</code>
    </pre>
  )
}

const TextCodeBlock = (props: { text: string }) => {
  return (
    <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto whitespace-pre-wrap max-h-[50vh] max-w-[90vw]">
      <code>{props.text}</code>
    </pre>
  )
}

const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  return (
    <div className="flex gap-4">
      <ChatAvator role={message.role} />
      <div className="flex flex-col gap-2 w-full">
        <span className="text-xs text-gray-500">{message.role}</span>
        {message.content?.map((c, index) => {
          if ('text' in c) {
            const htmlStart = c.text?.indexOf('```html')
            if (htmlStart && htmlStart > 0) {
              const htmlEnd = c.text?.indexOf('```', htmlStart + 6)
              if (htmlEnd) {
                const html = c.text?.substring(htmlStart + 7, htmlEnd)
                return (
                  <div key={index} className="grid grid-cols-2 gap-2">
                    <MD>{c.text}</MD>
                    <iframe srcDoc={html} className="h-full w-full"></iframe>
                  </div>
                )
              }
            }

            return <MD key={index}>{c.text}</MD>
          } else if ('toolUse' in c) {
            return (
              <div key={index} className="flex flex-col gap-2 text-xs">
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
              <div key={index} className="flex flex-col gap-2 text-xs">
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

export default function ChatPage() {
  const [userInput, setUserInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  useEffect(() => {
    console.log(messages)
  }, [messages])
  const [loading, setLoading] = useState(false)
  const { enabledTavilySearch } = useTavilySearch()
  const { llm } = useLLM()
  const modelId = llm?.modelId

  const [agent, setAgent] = useState('softwareAgent')
  const systemPrompt = prompts.Chat[agent]

  const { projectPath, selectDirectory } = useProject()

  const { enabledTools, ToolSettingModal, openModal } = useToolSettingModal()

  const handleClickPromptSubmit = async (input: string, messages: Message[]) => {
    if (!input) {
      return alert('Please enter a prompt')
    }

    const msgs = [...messages]
    const userInputMessage: Message = { role: 'user', content: [{ text: input }] }
    msgs.push(userInputMessage)
    setMessages((prev) => [...prev, userInputMessage])
    setUserInput('')
    setLoading(true)

    const res = await window.api.bedrock.converse({
      messages: msgs,
      modelId,
      system: [
        { text: systemPrompt({ workingDir: projectPath, useTavilySearch: enabledTavilySearch }) }
      ],
      toolConfig: { tools: enabledTools }
    })
    console.log({ tokenUsage: res.usage })
    const assistantMessage: Message = { role: 'assistant', content: res.output?.message?.content }
    msgs.push(assistantMessage)
    setMessages((prev) => [...prev, assistantMessage])

    const lastMessage = msgs[msgs.length - 1]
    const toolUse = res.output?.message?.content?.find((v) => v.toolUse)
    if (toolUse) {
      if (!lastMessage.content) {
        console.warn(lastMessage)
        return null
      }

      const recursivelyExecTool = async (contentBlocks: ContentBlock[]) => {
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

        console.log(toolResults)

        const toolResultMessage: Message = {
          role: 'user',
          content: toolResults
        }
        msgs.push(toolResultMessage)
        setMessages((prev) => [...prev, toolResultMessage])

        const toolResponse = await window.api.bedrock.converse({
          messages: msgs,
          modelId,
          system: [{ text: systemPrompt({ workingDir: projectPath }) }],
          toolConfig: { tools: enabledTools }
        })
        console.log({ tokenUsage: toolResponse.usage })
        const toolResponseMessage: Message = {
          role: 'assistant',
          content: toolResponse.output?.message?.content
        }
        msgs.push(toolResponseMessage)
        setMessages((prev) => [...prev, toolResponseMessage])

        const nextContent = toolResponse.output?.message?.content
        if (nextContent) {
          return recursivelyExecTool(nextContent)
        }
        return
      }

      await recursivelyExecTool(lastMessage.content)
    }

    setLoading(false)
  }

  const [isComposing, setIsComposing] = useState(false)
  const { sendMsgKey } = useAdvancedSetting()
  const onkeydown = (e) => {
    if (e.shiftKey) {
      return
    }
    if (isComposing) {
      return
    }

    const cmdenter = e.key === 'Enter' && (e.metaKey || e.ctrlKey)
    const enter = e.key === 'Enter'

    if ((sendMsgKey === 'Enter' && enter) || (sendMsgKey === 'Cmd+Enter' && cmdenter)) {
      e.preventDefault()
      handleClickPromptSubmit(userInput, messages)
    }
  }

  const exampleSenarios = {
    softwareAgent: [
      {
        title: 'Create a new file',
        content:
          'Create a new file called "test.txt" in the current directory with the content "Hello, World!"'
      },
      {
        title: `Yesterday's News`,
        content: `What news happened in the world yesterday (${new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1).toLocaleDateString('ja')})?`
      },
      {
        title: 'Simple website',
        content: 'Create a cool website for an IT company using HTML, CSS, and JavaScript.'
      },
      {
        title: 'Organizing folders',
        content: `Extract only the png files contained in the ${projectPath} folder and copy them to the ${projectPath}/images folder.`
      },
      {
        title: 'Simple Web API',
        content: `To deploy AWS Lambda with Node.js runtime, please create the source code of lambda.handler written in Node.js and the template file of AWS SAM (YAML format).

This Lambda will be integrated with API Gateway and proxy and will be exposed to the Internet.
The logic written in the source code should be a simple implementation that returns the string "Hello World from AWS Lambda".

## Additional information
Node.js runtime version: nodejs18.x
Deployment region: Tokyo region
`
      },
      {
        title: 'CDK Project',
        content: `Use AWS CDK to create an S3 bucket and create code to upload a file into it.

This set of source code will be created as a cdk project, so create the project structure according to best practices.
Don't forget to create configuration files such as package.json and requirement.yaml.
Implement the code to upload the file in a shell script using bash.
Finally, carefully describe any information required to use or develop this project in README.md.
`
      }
    ]
  }
  const { scrollToBottom } = useScroll()

  useEffect(() => {
    scrollToBottom()
  }, [loading])

  return (
    <React.Fragment>
      <div
        className={`flex flex-col h-[calc(100vh-12rem)] overflow-y-auto mx-auto min-w-[320px] max-w-[2048px]`}
        id="main"
      >
        <ToolSettingModal />
        <div className="flex flex-col gap-4 h-full">
          {messages.length === 0 && agents.length > 1 ? (
            <div className="justify-center flex flex-col items-center gap-2">
              <span className="text-gray-400 text-xs">Select agent</span>
              <select
                className="w-[30vw] bg-gray-50 border border-gray-300 text-gray-600 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5"
                value={agent}
                onChange={(e) => setAgent(e.target.value)}
              >
                {agents.map((agent, index) => (
                  <option key={index} value={agent.value}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {messages.length === 0 ? (
            <div className="flex flex-col pt-12 h-full w-full justify-center items-center content-center align-center gap-1">
              <div className="flex flex-row gap-2 items-center">
                <h1 className="text-lg font-bold">Agent Chat</h1>
                <RiRobot2Line className="text-[1.5rem] font-bold" />
              </div>
              <div className="text-gray-400">
                This AI agent understands software project structures and creates files and folders.
              </div>
              <div className="grid grid-cols-3 gap-2 pt-6 text-xs">
                {exampleSenarios[agent]?.map((senario) => {
                  return (
                    <button
                      key={senario.title}
                      className="px-4 py-2 border rounded-md text-gray-400 hover:text-gray-700 hover:border-gray-300"
                      onClick={() => setUserInput(senario.content)}
                    >
                      {senario.title}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}

          {/* CHAT HISTORY */}
          {messages.map((message, index) => (
            <ChatMessage message={message} key={index} />
          ))}

          {loading && (
            <div key="loading-robot" className="flex gap-4">
              <div className="flex items-center justify-center w-10 h-10">
                <RiRobot2Line className="h-8 w-8 animate-bounce" />
              </div>
              <div className="flex flex-col gap-2 w-full">
                <span className="text-sm text-gray-500">
                  {messages[messages.length - 1]?.role === 'user' ? 'assistant' : 'user'}
                </span>
                <div className="flex gap-2">...</div>
              </div>
            </div>
          )}
        </div>

        {/* Buttom Input Field Block */}
        <div className="flex gap-2 fixed bottom-0 left-20 right-5 bottom-3">
          <div className="relative w-full">
            <div className="flex justify-between mb-2">
              {/* left */}
              <div className="flex flex-col justify-end gap-2 mb-1">
                <label
                  onClick={() => openModal()}
                  className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer hover:text-gray-500"
                >
                  <div className="flex gap-2 items-center">
                    <FcSupport className="text-lg" />
                    <span>Tools</span>
                  </div>
                </label>

                <label
                  onClick={selectDirectory}
                  className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer hover:text-gray-500"
                >
                  <div className="flex gap-2 items-center">
                    <FcFolder className="text-lg" />
                    <span>{projectPath}</span>
                  </div>
                </label>
              </div>

              {/* right */}
              {/* <div className="flex flex-col justify-end">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={automode}
                    className="sr-only peer"
                    onChange={() => setAutomode(!automode)}
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                    Automode (Max iterations: {MAX_ITERATIONS})
                  </span>
                </label>
               </div> */}
            </div>

            {/* prompt input form */}
            <textarea
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              className={`block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 mt-2 ${
                loading ? 'bg-gray-300' : 'bg-gray-50'
              }`}
              placeholder="Type your message... "
              disabled={loading}
              value={loading ? 'Continue until the goal is achieved' : userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => onkeydown(e)}
              required
              rows={3}
            />

            <button
              onClick={() => handleClickPromptSubmit(userInput, messages)}
              className="absolute end-2.5 bottom-2.5 rounded-lg hover:bg-gray-200 px-2 py-2"
            >
              <FiSend className="text-xl" />
            </button>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}
