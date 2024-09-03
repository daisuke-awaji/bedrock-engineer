import React, { useEffect, useState } from 'react'
import { FcElectronics, FcFolder, FcSupport, FcVoicePresentation } from 'react-icons/fc'
import { FiSend } from 'react-icons/fi'
import { RiRobot2Line } from 'react-icons/ri'
import prompts from '@renderer/prompts/prompts'
import useProject from '@renderer/hooks/useProject'
import useLLM from '@renderer/hooks/useLLM'
import useAgentChatSetting from '@renderer/hooks/useAgentChatSetting'
import useTavilySearch from '@renderer/hooks/useTavilySearch'
import useAdvancedSetting from '@renderer/hooks/useAdvancedSetting'
import useToolSettingModal from './useToolSettingModal'
import useScroll from '@renderer/hooks/useScroll'

const agents = [
  {
    name: 'Software Engineer Agent',
    value: 'softwareAgent',
    description:
      'This AI agent understands software project structures and creates files and folders.'
  }
]

export default function ChatPage() {
  const [userInput, setUserInput] = useState('')
  const [chatMessages, setMessages] = useState<any>([])
  const [loading, setLoading] = useState(false)
  const { automode, setAutomode, getAutomode } = useAgentChatSetting()
  const { apikey } = useTavilySearch()
  const tavilySearchEnabled = apikey !== 'tvly-xxxxxxxxxxxxxxxxxxx'
  const { llm } = useLLM()
  const modelId = llm?.modelId

  const [agent, setAgent] = useState('softwareAgent')
  const systemPrompt = prompts.Chat[agent]

  const MAX_ITERATIONS = 10

  const { projectPath, selectDirectory } = useProject()

  const { tools, ToolSettingModal, openModal } = useToolSettingModal()

  const handleClickPromptSubmit = async (input: string, messages) => {
    let loopCount = 0
    if (input) {
      const msgs = [
        ...messages,
        {
          role: 'user',
          content: [{ text: input }]
        }
      ]
      setMessages(msgs)
      setUserInput('')

      setLoading(true)

      const res = await window.api.bedrock.converse({
        messages: msgs,
        modelId,
        system: [
          {
            text: systemPrompt({
              automode: automode,
              workingDir: projectPath,
              useTavilySearch: tavilySearchEnabled
            })
          }
        ],
        toolConfig: {
          tools: tools
            ?.filter((v) => v.enabled)
            .filter((value) => {
              if (value.toolSpec?.name === 'tavilySearch') {
                return tavilySearchEnabled
              }
              return true
            })
        }
      })
      console.log({ res })
      // assistant message
      let assistantResponse = ''
      for (const contentBlock of res.output?.message?.content ?? []) {
        if ('text' in contentBlock) {
          assistantResponse += contentBlock?.text + '\n'
        } else if ('toolUse' in contentBlock) {
          const toolInput = contentBlock.toolUse?.input
          const toolName = contentBlock.toolUse?.name
          const toolUseId = contentBlock.toolUse?.toolUseId

          msgs.push({
            role: 'assistant',
            content: [contentBlock]
          })
          setMessages(msgs)

          const toolResult = await window.api.bedrock.executeTool(toolName, toolInput)
          console.log({ toolName, toolResult })

          msgs.push({
            role: 'user',
            content: [
              {
                toolResult: {
                  toolUseId,
                  content: [{ text: toolResult }],
                  status: 'success'
                }
              }
            ]
          })
          console.log({ msgs })
          setMessages(msgs)

          const messages = msgs.filter((msg) => msg.content !== undefined)
          const toolResponse = await window.api.bedrock.converse({
            messages: messages,
            modelId,
            system: [
              {
                text: systemPrompt({
                  automode: automode,
                  workingDir: projectPath
                })
              }
            ],
            toolConfig: {
              tools: tools
                ?.filter((v) => v.enabled)
                .filter((value) => {
                  if (value.toolSpec?.name === 'tavilySearch') {
                    return tavilySearchEnabled
                  }
                  return true
                })
            }
          })
          console.log({ toolResponse })

          for (const contentBlock of toolResponse.output?.message?.content ?? []) {
            if ('text' in contentBlock) {
              assistantResponse += contentBlock?.text
            }
          }
        }
      }
      msgs.push({
        role: 'assistant',
        content: [{ text: assistantResponse === '' ? 'complete' : assistantResponse }]
      })
      setMessages(msgs)
      setLoading(false)
      if (agent === 'softwareAgent') {
        setUserInput('つづけてください')
      }

      // 再帰処理の中から判断したいので、React のステートではなく、electron の store から参照する
      if (getAutomode()) {
        const complete = msgs.slice(-1)[0]?.content[0]?.text.includes('AUTOMODE_COMPLETE')
        loopCount++
        if (complete || loopCount > MAX_ITERATIONS) {
          setAutomode(false)
          return
        }

        handleClickPromptSubmit(
          'Continue the process until the goal is reached or 10 iterations have been completed. When the goal is reached, say AUTOMODE_COMPLETE.',
          msgs
        )
      }
    } else {
      alert('Please enter a prompt')
    }
  }

  const color = {
    user: '',
    toolResult: 'bg-[#E5BA73]',

    assistant: '', // "bg-[#F7E7DC]",
    toolUse: 'bg-[#E5BA73]' // "bg-[#FFF8F3]",
  }
  const switchColor = (message: any) => {
    if (message.role === 'user') {
      for (const c of message.content) {
        if ('text' in c) return color.user
        if ('toolResult' in c) return color.toolResult
      }

      return color.user
    }
    if (message.role === 'assistant') {
      // if message.content object has key "text"
      for (const c of message.content) {
        if ('text' in c) return color.assistant
        if ('toolUse' in c) return color.toolUse
      }
      return color.assistant
    }

    return color.user
  }

  const renderMessageContent = (message: { content: any }) => {
    // 一旦 message.content の配列要素が１つであると仮定して実装する
    for (const c of message.content) {
      if ('text' in c) {
        return <div className="whitespace-pre-line">{c.text}</div>
      } else if ('toolUse' in c) {
        return (
          <div className="flex flex-col">
            <span className="flex gap-2 items-center">
              <span>ToolUse</span>
              <span className="border rounded-md bg-gray-200 px-2">{c.toolUse.name}</span>
              <span>toolUseId: {c.toolUse.toolUseId}</span>
            </span>

            <div>input</div>

            <span>{JSON.stringify(c.toolUse.input, null, 2)}</span>
          </div>
        )
      } else if ('toolResult' in c) {
        return (
          <div className="flex flex-col">
            <span className="flex gap-2 items-center">
              <span>ToolResult</span>
              <span className="bg-[#28a745] rounded-md px-2 text-white">{c.toolResult.status}</span>
            </span>

            <span className="whitespace-pre-line mt-4 border p-2 rounded-md">
              {c.toolResult.content[0].text}
            </span>
          </div>
        )
      } else {
        throw new Error('Invalid message content')
      }
    }
    return null
  }

  const renderAvator = (message: { role: string; content: any }) => {
    if (message.role === 'user') {
      for (const c of message.content) {
        if ('toolResult' in c) {
          return <FcElectronics />
        } else {
          return <FcVoicePresentation />
        }
      }
    } else if (message.role === 'assistant') {
      for (const c of message.content) {
        if ('toolUse' in c) {
          return <FcElectronics />
        } else {
          return <RiRobot2Line className="h-8" />
        }
      }
    } else {
      throw new Error('Invalid message role')
    }
    return null
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
      handleClickPromptSubmit(userInput, chatMessages)
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
        <div className="flex flex-col gap-2 h-full">
          {chatMessages.length === 0 && agents.length > 1 ? (
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

          {chatMessages.length === 0 ? (
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
          {chatMessages.map((message, index) => (
            <div key={index} className={`my-2 p-2 rounded`}>
              <div className="flex gap-2">
                <div className="text-[28px] pt-2 items-center">{renderAvator(message)}</div>
                <div className={`p-2 rounded-md w-full ${switchColor(message)}`}>
                  {renderMessageContent(message)}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div key="loading-robot" className={`my-2 p-2 rounded`}>
              <div className="flex gap-2">
                <div className="text-[28px] pt-2 items-center">
                  <RiRobot2Line className="h-8 animate-bounce" />
                </div>
                <div className={`p-2 rounded-md w-full`}></div>
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
              <div className="flex flex-col justify-end">
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
              </div>
            </div>

            {/* prompt input form */}
            <textarea
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              className={`block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 mt-2 ${
                automode && loading ? 'bg-gray-300' : 'bg-gray-50'
              }`}
              placeholder="Type your message... "
              disabled={automode && loading}
              value={
                automode && loading
                  ? 'Continue the process until the goal is reached or 10 iterations have been completed. When the goal is reached, say AUTOMODE_COMPLETE.'
                  : userInput
              }
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => onkeydown(e)}
              required
              rows={3}
            />

            <button
              onClick={() => handleClickPromptSubmit(userInput, chatMessages)}
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
