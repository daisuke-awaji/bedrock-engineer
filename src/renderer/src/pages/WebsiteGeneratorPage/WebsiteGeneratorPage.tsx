import React, { useEffect, useState } from 'react'
import { SandpackCodeEditor, SandpackPreview, SandpackProvider } from '@codesandbox/sandpack-react'
import { autocompletion, completionKeymap } from '@codemirror/autocomplete'
import { ToggleSwitch } from 'flowbite-react'
import { FiMaximize, FiSend } from 'react-icons/fi'
import prompts from '../../prompts/prompts'
import { useDebounce } from '@renderer/hooks/use-debounse'
import ReactLogo from '../../assets/images/icons/react.svg'
import VueLogo from '../../assets/images/icons/vue.svg'
import { useChat } from '@renderer/hooks/useChat'

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
  const selectedModel = {
    modelId: 'anthropic.claude-3-haiku-20240307-v1:0'
    // modelId: 'anthropic.claude-3-sonnet-20240229-v1:0'
  }
  const modelId = selectedModel?.modelId

  const handleClickShowCode = () => {
    setShowCode(!showCode)
  }

  const { handleSubmit, messages, loading, lastText } = useChat({
    systemPrompt: prompts['generative-ui'].system['react-ts'],
    modelId: modelId
  })

  useEffect(() => {
    if (messages !== undefined && messages.length > 0) {
      setCode(lastText)
    }
  }, [messages, loading])

  const onkeydown = (e) => {
    if (
      (e.shiftKey && e.key === 'Enter') ||
      (e.metaKey && e.key === 'Enter') ||
      (e.ctrlKey && e.key === 'Enter')
    ) {
      console.log('submit')
      handleSubmit(userInput, messages)
    }
  }

  const debouncedCode = useDebounce(code, 50)

  type Framework = {
    id: string
    name: string
    logo: React.ReactNode
  }
  const supportedFrameworks = [
    {
      id: 'react',
      name: 'React',
      logo: <ReactLogo />
    },
    {
      id: 'vue',
      name: 'Vue',
      logo: <VueLogo />
    }
  ]

  const [selectedFw, setSelectedFw] = useState<string>('react')
  const FrameworkButton: React.FC<Framework> = (fw) => {
    return (
      <button
        type="button"
        className={`
      text-gray-900
      ${selectedFw === fw.id ? 'bg-green-50' : 'bg-white'}
      hover:bg-green-50
      border
      ${selectedFw === fw.id ? 'border-green-600' : 'border-gray-200'}
      focus:ring-4
      focus:outline-none
      focus:ring-gray-100
      font-medium
      rounded-[1rem]
      text-xs
      px-3
      py-1.5
      inline-flex
      items-center
      flex
      gap-2
      `}
        onClick={() => setSelectedFw(fw.id)}
      >
        <div className="w-[18px]">{fw.logo}</div>
        <span>{fw.name}</span>
      </button>
    )
  }

  return (
    <React.Fragment>
      <div className={'flex flex-col h-[calc(100vh-8rem)] overflow-y-auto'}>
        <div className="flex pb-2 justify-between">
          <span className="font-bold flex flex-col gap-2">
            <h1 className="content-center">Website Generator</h1>
            <div className="flex gap-2">
              {supportedFrameworks.map((fw) => (
                <FrameworkButton {...fw} key={fw.id} />
              ))}
            </div>
          </span>
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

            <SandpackPreview
              id="sandpack-preview"
              style={{
                height: '80vh',
                borderRadius: '8px',
                backgroundColor: 'white'
              }}
              showOpenInCodeSandbox={false}
              actionsChildren={
                <button
                  onClick={() => {
                    const iframe = document.getElementById('sandpack-preview')
                    if (iframe) {
                      iframe?.requestFullscreen()
                    }
                  }}
                >
                  <FiMaximize className="text-gray" />
                </button>
              }
            />
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
              onClick={() => handleSubmit(userInput, messages)}
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