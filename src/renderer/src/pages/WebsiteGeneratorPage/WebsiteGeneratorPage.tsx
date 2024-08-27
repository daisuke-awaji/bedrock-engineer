import React, { useEffect, useState } from 'react'
import { ToggleSwitch } from 'flowbite-react'
import { FiSend } from 'react-icons/fi'
import prompts from '../../prompts/prompts'
import ReactLogo from '../../assets/images/icons/react.svg'
import VueLogo from '../../assets/images/icons/vue.svg'
import VanillaLogo from '../../assets/images/icons/vanilla.svg'
import FigmaLogo from '../../assets/images/icons/figma.svg'
import { useChat } from '@renderer/hooks/useChat'
import ReactSandpack from './ReactSandpack'
import VueSandpack from './VueSandpack'
import VanillaSandpack from './VanillaSandpack'
import useLLM from '@renderer/hooks/useLLM'

type Framework = {
  id: string
  name: string
  logo: React.ReactNode
}

export default function WebsiteGeneratorPage() {
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
    },
    {
      id: 'vanilla',
      name: 'Vanilla',
      logo: <VanillaLogo />
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
        onClick={async () => {
          const sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec))

          handleRefresh()
          await sleep(100)

          setSelectedFw(fw.id)
        }}
      >
        <div className="w-[18px]">{fw.logo}</div>
        <span>{fw.name}</span>
      </button>
    )
  }

  const [code, setCode] = useState<string | undefined>()
  const [showCode, setShowCode] = useState(true)
  const [userInput, setUserInput] = useState('')
  const { llm } = useLLM()

  const handleClickShowCode = () => {
    setShowCode(!showCode)
  }

  const { handleSubmit, messages, loading, lastText, initChat } = useChat({
    systemPrompt: prompts.WebsiteGenerator.system[selectedFw],
    modelId: llm.modelId
  })

  const handleRefresh = () => {
    setCode(undefined)
    setUserInput('')
    initChat()
  }

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
      handleSubmit(userInput, messages)
    }
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

        {selectedFw === 'react' ? (
          <ReactSandpack code={code} showCode={showCode} loading={loading} />
        ) : selectedFw === 'vue' ? (
          <VueSandpack code={code} showCode={showCode} loading={loading} />
        ) : (
          <VanillaSandpack code={code} showCode={showCode} loading={loading} />
        )}

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
                <button
                  className="cursor-pointer rounded-full border p-2 text-xs hover:border-gray-300 hover:bg-gray-50"
                  onClick={() => {
                    setUserInput(`以下をウェブサイトでグラフとして可視化してください。

購買データCSVファイル
customer_id,product_id,purchase_date,purchase_amount
C001,P001,2023-04-01,50.00
C002,P002,2023-04-02,75.00
C003,P003,2023-04-03,100.00
C001,P002,2023-04-04,60.00
C002,P001,2023-04-05,40.00
C003,P003,2023-04-06,90.00
C001,P001,2023-04-07,30.00
C002,P002,2023-04-08,80.00
C003,P001,2023-04-09,45.00
C001,P003,2023-04-10,120.00


このCSVファイルには、以下のような情報が含まれています。

- 'customer_id': 顧客ID
- 'product_id': 商品ID
- 'purchase_date': 購買日
- 'purchase_amount': 購買金額`)
                  }}
                >
                  グラフの描画
                </button>
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => alert('TO BE IMPLEMENTED')}
                  className="flex items-center justify-center p-0.5 me-2 overflow-hidden text-xs text-gray-900 rounded-lg group bg-gradient-to-br from-red-200 via-red-300 to-yellow-200 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400"
                >
                  <span className="px-3 py-1.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0 flex gap-2">
                    <div className="h-3 w-3">
                      <FigmaLogo />
                    </div>
                    Connect
                  </span>
                </button>
                <ToggleSwitch
                  checked={showCode}
                  onChange={handleClickShowCode}
                  label="show code"
                  color="gray"
                ></ToggleSwitch>
                <button
                  className="bg-gray-200 cursor-pointer rounded-md border py-1 px-2 hover:border-gray-300 hover:bg-gray-50"
                  onClick={handleRefresh}
                >
                  clear
                </button>
              </div>
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
              <FiSend className="text-xl" />
            </button>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}
