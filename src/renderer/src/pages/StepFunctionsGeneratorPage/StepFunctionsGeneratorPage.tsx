import { useEffect, useState } from 'react'
import { SAMPLE_ASL_PARALLEL } from './SAMPLE_ASL'

import { BsGear } from 'react-icons/bs'
import StepFunctionLogo from '../../assets/images/aws-icons/Arch_AWS-Step-Functions_32.svg'
import AWSSfnGraph from '@tshepomgaga/aws-sfn-graph'
import '@tshepomgaga/aws-sfn-graph/index.css'
import { ASLEditor } from './ASLEditor'
import { FiSend } from 'react-icons/fi'
import { useChat } from '@renderer/hooks/useChat'
import { Loader } from '../../components/Loader'

const HAIKU_MODEL_ID = 'anthropic.claude-3-haiku-20240307-v1:0'

const systemPrompt = `あなたは AWS Step Functions の ASL (Amazon States Language) を生成するAIアシスタントです。与えられた文章とルールに従い、JSON 形式の ASL を出力してください。
<rules>
* 説明は一切不要です。
* \`\`\`json のような接頭語も一切不要です。
* ASL のテキストだけ生成してください
</rules>
`

function StepFunctionsGeneratorPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_asl, setAsl] = useState(SAMPLE_ASL_PARALLEL)
  const [editorValue, setEditorValue] = useState(JSON.stringify(SAMPLE_ASL_PARALLEL, null, 2))
  const [userInput, setUserInput] = useState('')
  const { messages, handleSubmit, loading, lastText } = useChat({
    systemPrompt,
    modelId: HAIKU_MODEL_ID
  })

  useEffect(() => {
    if (messages !== undefined && messages.length > 0) {
      setEditorValue(lastText)
    }

    if (messages !== undefined && messages.length > 0 && !loading) {
      const lastOne = messages[messages.length - 1]
      const lastMessageText = lastOne?.content[0]?.text
      try {
        const json = JSON.parse(lastMessageText)
        console.log(json)
        setAsl(json)
      } catch (e) {
        console.error(e)
        console.error(lastMessageText)
      }
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
    <div className={'flex flex-col overflow-y-auto'}>
      <div className="flex pb-2 justify-between">
        <span className="font-bold flex gap-2">
          <div className="content-center">
            <StepFunctionLogo />
          </div>
          <h1 className="content-center">AWS Step Functions Generator</h1>
        </span>
        <button className="hover:bg-gray-100 p-3 rounded-full">
          <BsGear />
        </button>
      </div>

      <div className="grid grid-cols-2">
        {/* LEFT */}
        <div className="border h-[80vh] resize-x">
          <div className="border-b p-1">
            <h1 className="text-xs italic">Editor</h1>
          </div>
          <ASLEditor value={editorValue} setValue={setEditorValue} />
        </div>

        {/* RIGHT */}
        <div className="border h-[80vh] flex flex-col resize-x">
          <div className="border-b p-1 flex justify-between">
            <h1 className="text-xs italic">Visualizer</h1>
          </div>
          <div>
            <div className="h-[80vh] w-full flex justify-center items-center">
              {loading ? <Loader /> : <AWSSfnGraph data={editorValue} onError={console.log} />}
            </div>
          </div>
        </div>
      </div>

      {/* Buttom Input Field Block */}
      <div className="flex gap-2 fixed bottom-0 left-20 right-5 bottom-3">
        <div className="relative w-full">
          <div className="flex gap-2 justify-between">
            <div>
              <button
                className="cursor-pointer rounded-full border p-2 text-xs hover:border-gray-300 hover:bg-gray-50"
                onClick={() => {
                  setUserInput(`注文処理のワークフロー`)
                }}
              >
                注文処理のワークフロー
              </button>
              <button
                className="cursor-pointer rounded-full border p-2 text-xs hover:border-gray-300 hover:bg-gray-50"
                onClick={() => {
                  setUserInput(`以下の７種類の State を組み合わせたワークフロー
- Task
- Wait
- Pass
- Succeed
- Fail
- Choice
- Parallel
`)
                }}
              >
                ７種類の State の組み合わせ
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
  )
}

export default StepFunctionsGeneratorPage
