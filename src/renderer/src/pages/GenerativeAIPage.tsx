import React, { useState } from 'react'
import {
  SandpackCodeEditor,
  SandpackPreview,
  SandpackProvider,
  SandpackLayout
} from '@codesandbox/sandpack-react'
import { autocompletion, completionKeymap } from '@codemirror/autocomplete'
import { ToggleSwitch } from 'flowbite-react'
import { FiSend } from 'react-icons/fi'
// import useModel from '../../hooks/useModel'
import prompts from '../prompts/prompts'
import Loader from './Loader'
import { streamChatCompletion } from '@renderer/lib/api'

const DEFAULT_INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`

const DEFAULT_APP_TSX = `import React from 'react';

export default function App() {
  return (
    <div>
      <h1>Hello World</h1>
    </div>
  );
}
`

export default function GenerativeUIPage() {
  const [code, setCode] = useState(DEFAULT_APP_TSX)
  const [showCode, setShowCode] = useState(true)
  const [userInput, setUserInput] = useState('')
  const [chatMessages, setMessages] = useState<any>([])
  const [loading, setLoading] = useState(false)
  const selectedModel = {
    modelId: 'anthropic.claude-3-haiku-20240307-v1:0'
  }
  const modelId = selectedModel?.modelId

  const handleClickShowCode = () => {
    setShowCode(!showCode)
  }

  const handleClickPromptSubmit = async (input: string, messages) => {
    if (!input) {
      alert('Please enter a prompt')
      return
    }

    const msgs = [...messages, { role: 'user', content: [{ text: input }] }]
    setMessages(msgs)
    setUserInput('')

    setLoading(true)

    const generator = streamChatCompletion({
      messages: msgs,
      modelId: modelId,
      system: [
        {
          text: prompts['generative-ui'].system['react-ts']
        }
      ]
    })

    let s = ''
    setCode('')

    for await (const json of generator) {
      try {
        const text = json.contentBlockDelta?.delta?.text
        if (text) {
          setCode((prev) => prev + text)
          s = s + text
        }
      } catch (error) {
        console.error(error)
      }
    }
    setCode(s)

    const msgsToset = [...msgs, { role: 'assistant', content: [{ text: s }] }]
    setMessages(msgsToset)

    setLoading(false)
  }

  const onkeydown = (e) => {
    if (
      (e.shiftKey && e.key === 'Enter') ||
      (e.metaKey && e.key === 'Enter') ||
      (e.ctrlKey && e.key === 'Enter')
    ) {
      console.log('submit')
      handleClickPromptSubmit(userInput, chatMessages)
    }
  }

  return (
    <React.Fragment>
      <div className={'flex flex-col h-[calc(100vh-6rem)] overflow-y-auto'}>
        <h1 className="text-lg font-bold">Generative UI</h1>
        <span>React (TypeScript) mode</span>

        {/* <div className="flex gap-2 pt-2">
          {loading && (
            <div className="flex flex-col h-[calc(100vh-8rem)] w-full justify-center items-center content-center align-center">
              <Loader />
            </div>
          )}

          {chatMessages.length === 0 && (
            <div className="flex flex-col h-[calc(100vh-8rem)] w-full justify-center items-center content-center align-center">
              <div className="flex flex-row gap-3">
                <RobotIcon className="h-8" />
                <div className="text-gray-400">website...</div>
              </div>

              <div className="flex items-center gap-2 pt-6 text-xs">
                <button
                  className="px-4 py-2 border rounded-md text-gray-400 hover:text-gray-700 hover:border-gray-300"
                  onClick={() =>
                    setUserInput(
                      "Create simple IT companies website. Use HTML, CSS, JavaScript."
                    )
                  }
                >
                  Simple Website
                </button>
              </div>
            </div>
          )}
        </div> */}

        <SandpackProvider
          template="react-ts"
          files={{
            'App.tsx': { code },
            '/public/index.html': {
              code: DEFAULT_INDEX_HTML
            }
          }}
          options={{
            externalResources: ['https://unpkg.com/@tailwindcss/ui/dist/tailwind-ui.min.css'],
            initMode: 'user-visible',
            recompileMode: 'delayed',
            autorun: true,
            autoReload: true
          }}
          customSetup={{
            dependencies: {
              'lucide-react': 'latest',
              recharts: '2.9.0',
              'react-router-dom': 'latest',
              '@radix-ui/react-accordion': '^1.2.0',
              '@radix-ui/react-alert-dialog': '^1.1.1',
              '@radix-ui/react-aspect-ratio': '^1.1.0',
              '@radix-ui/react-avatar': '^1.1.0',
              '@radix-ui/react-checkbox': '^1.1.1',
              '@radix-ui/react-collapsible': '^1.1.0',
              '@radix-ui/react-dialog': '^1.1.1',
              '@radix-ui/react-dropdown-menu': '^2.1.1',
              '@radix-ui/react-hover-card': '^1.1.1',
              '@radix-ui/react-label': '^2.1.0',
              '@radix-ui/react-menubar': '^1.1.1',
              '@radix-ui/react-navigation-menu': '^1.2.0',
              '@radix-ui/react-popover': '^1.1.1',
              '@radix-ui/react-progress': '^1.1.0',
              '@radix-ui/react-radio-group': '^1.2.0',
              '@radix-ui/react-select': '^2.1.1',
              '@radix-ui/react-separator': '^1.1.0',
              '@radix-ui/react-slider': '^1.2.0',
              '@radix-ui/react-slot': '^1.1.0',
              '@radix-ui/react-switch': '^1.1.0',
              '@radix-ui/react-tabs': '^1.1.0',
              '@radix-ui/react-toast': '^1.2.1',
              '@radix-ui/react-toggle': '^1.1.0',
              '@radix-ui/react-toggle-group': '^1.1.0',
              '@radix-ui/react-tooltip': '^1.1.2',
              'class-variance-authority': '^0.7.0',
              clsx: '^2.1.1',
              'date-fns': '^3.6.0',
              'embla-carousel-react': '^8.1.8',
              'react-day-picker': '^8.10.1',
              'tailwind-merge': '^2.4.0',
              'tailwindcss-animate': '^1.0.7',
              vaul: '^0.9.1'
            }
          }}
        >
          <SandpackLayout>
            {showCode && (
              <>
                <SandpackCodeEditor
                  style={{
                    height: '80vh',
                    borderRadius: '8px'
                  }}
                  showTabs
                  showLineNumbers
                  showRunButton={true}
                  extensions={[autocompletion()]}
                  extensionsKeymap={[completionKeymap as any]}
                />
                <div className="w-[10px] h-[10px]"></div>
              </>
            )}

            <SandpackPreview
              style={{
                height: '80vh',
                borderRadius: '8px',
                backgroundColor: 'white'
              }}
              showOpenInCodeSandbox={false}
            />
          </SandpackLayout>
        </SandpackProvider>

        {/* Buttom Input Field Block */}
        <div className="flex gap-2 fixed bottom-0 left-20 right-5 bottom-3">
          <div className="relative w-full">
            <ToggleSwitch
              checked={showCode}
              onChange={handleClickShowCode}
              label="code"
              color="gray"
            ></ToggleSwitch>
            {/* prompt input form */}
            <input
              className={`block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 mt-2`}
              placeholder="Type your message... (Cmd + Enter / Shift + Enter to send message)"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => onkeydown(e)}
              required
            />
            <button
              onClick={() => handleClickPromptSubmit(userInput, chatMessages)}
              className="absolute end-2.5 bottom-2.5 rounded-lg hover:bg-gray-200 px-2 py-2"
            >
              {loading ? <Loader /> : <FiSend className="text-xl" />}
            </button>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}
