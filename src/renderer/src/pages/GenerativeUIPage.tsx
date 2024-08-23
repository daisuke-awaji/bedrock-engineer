import React, { useState } from 'react'
import { SandpackCodeEditor, SandpackPreview, SandpackProvider } from '@codesandbox/sandpack-react'
import { autocompletion, completionKeymap } from '@codemirror/autocomplete'
import { ToggleSwitch } from 'flowbite-react'
import { FiSend } from 'react-icons/fi'
import prompts from '../prompts/prompts'
import { streamChatCompletion } from '@renderer/lib/api'
import { useDebounce } from '@renderer/hooks/use-debounse'

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
    <div className="m-2">
      <h1>Hello World</h1>
    </div>
  );
}
`

export default function WebsiteGeneratorPage() {
  const [code, setCode] = useState(DEFAULT_APP_TSX)
  const [showCode, setShowCode] = useState(true)
  const [userInput, setUserInput] = useState('')
  const [chatMessages, setMessages] = useState<any>([])
  const [loading, setLoading] = useState(false)
  const selectedModel = {
    modelId: 'anthropic.claude-3-haiku-20240307-v1:0'
    // modelId: 'anthropic.claude-3-sonnet-20240229-v1:0'
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
    setLoading(false)
    setCode(s)

    const msgsToset = [...msgs, { role: 'assistant', content: [{ text: s }] }]
    setMessages(msgsToset)
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

  const debouncedCode = useDebounce(code, 100)

  return (
    <React.Fragment>
      <div className={'flex flex-col h-[calc(100vh-6rem)] overflow-y-auto'}>
        <div className="flex pb-2 justify-between">
          <span className="font-bold flex gap-2">
            {/* <div className="content-center"> */}
            {/* <StepFunctionLogo /> */}
            {/* <FiFeather className="font-bold text-[2.5rem]" /> */}
            {/* </div> */}
            <h1 className="content-center">Website Generator</h1>
          </span>
          {/* <button className="hover:bg-gray-100 p-3 rounded-full"> */}
          {/* <BsGear /> */}
          {/* </button> */}
        </div>

        <SandpackProvider
          template="react-ts"
          // template="vue-ts"
          files={{
            'App.tsx': { code: debouncedCode },
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
              recharts: '2.9.0',
              'react-router-dom': 'latest',
              'react-icons': 'latest',
              'date-fns': 'latest'
            }
          }}
        >
          <div className="flex gap-2">
            {showCode && (
              <SandpackCodeEditor
                style={{
                  height: '80vh',
                  borderRadius: '8px',
                  overflowX: 'scroll',
                  maxWidth: '50vw'
                }}
                showTabs
                showLineNumbers
                showRunButton={true}
                extensions={[autocompletion()]}
                extensionsKeymap={[completionKeymap as any]}
              />
            )}

            {loading ? (
              <div className="h-[80vh] w-full">loading...</div>
            ) : (
              <SandpackPreview
                style={{
                  height: '80vh',
                  borderRadius: '8px',
                  backgroundColor: 'white'
                }}
                showOpenInCodeSandbox={false}
              />
            )}
          </div>
        </SandpackProvider>

        {/* Buttom Input Field Block */}
        <div className="flex gap-2 fixed bottom-0 left-20 right-5 bottom-3">
          <div className="relative w-full">
            <div className="flex gap-2 justify-between">
              <div>
                <button
                  className="cursor-pointer rounded-full border p-2 text-xs hover:border-gray-300 hover:bg-gray-50"
                  onClick={() => {
                    setUserInput(`以下の条件で、観葉植物を専門に取り扱うECサイトの基本的な構造とレイアウトを作成してください。
<条件>
- レイアウトのイメージは Amazon.com です。
- EC サイトの名前は「Green Village」です。
- グリーン系のカラーテーマにしてください。
</条件>
前の出力に続けて、商品の植物をカード形式で表示する部分を追加してください。
前の出力に続けて、ショッピングカートに追加する機能を作成してください。
前の出力に続けて、現在何が買い物カゴに入っているのか確認し、合計金額の計算もできる機能を作成してください。`)
                  }}
                >
                  観葉植物のECサイト
                </button>
                <button
                  className="cursor-pointer rounded-full border p-2 text-xs hover:border-gray-300 hover:bg-gray-50"
                  onClick={() => {
                    setUserInput(`かっこいいIT企業のウェブサイトを作ってください。`)
                  }}
                >
                  IT企業のウェブサイト
                </button>
                <button
                  className="cursor-pointer rounded-full border p-2 text-xs hover:border-gray-300 hover:bg-gray-50"
                  onClick={() => {
                    setUserInput(`TODOアプリを SPA で実装してください。
TODOの追加、削除ができるようにしてください
Tailwind CSSでおしゃれなデザインにしてください`)
                  }}
                >
                  TODO アプリ
                </button>
              </div>
              <ToggleSwitch
                checked={showCode}
                onChange={handleClickShowCode}
                label="show code"
                color="gray"
              ></ToggleSwitch>
            </div>

            {/* prompt input form */}
            <input
              className={`block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 mt-2`}
              placeholder="What kind of website will you create? (Cmd + Enter / Shift + Enter to send message)"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => onkeydown(e)}
              required
              disabled={loading}
            />
            <button
              onClick={() => handleClickPromptSubmit(userInput, chatMessages)}
              className="absolute end-2.5 bottom-2.5 rounded-lg hover:bg-gray-200 px-2 py-2"
            >
              {/* {loading ? (
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1.3, 1],
                    x: [0, 50, 100, 200],
                    y: [0, -50, -80, -80],
                    borderRadius: ['20%', '50%', '20%']
                  }}
                  transition={{
                    duration: 2,
                    ease: 'easeInOut',
                    times: [0, 0.5, 1],
                    repeat: NaN,
                    repeatDelay: 1
                  }}
                >
                  <FiSend className="text-xl" />
                </motion.div>
              ) : ( */}
              <FiSend className="text-xl" />
              {/* )} */}
            </button>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}
