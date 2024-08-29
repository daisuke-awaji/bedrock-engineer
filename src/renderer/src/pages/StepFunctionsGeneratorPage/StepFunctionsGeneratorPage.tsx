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
import useLLM from '@renderer/hooks/useLLM'

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
  const { llm } = useLLM()
  const { messages, handleSubmit, loading, lastText } = useChat({
    systemPrompt,
    modelId: llm.modelId
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

  useEffect(() => {
    const wfg = document.getElementsByClassName('workflowgraph')[0]
    wfg.className = 'h-full workflowgraph'
  }, [])

  const examples = [
    {
      title: '注文処理のワークフロー',
      value: `注文処理のワークフローを実装してください`
    },
    {
      title: '７種類の State',
      value: `以下の７種類の State を組み合わせたワークフローを実装してみてください。
- Task
- Wait
- Pass
- Succeed
- Fail
- Choice
- Parallel`
    },
    {
      title: 'Nested Workflow',
      value: `Nested Workflow を実装してください`
    },
    {
      title: 'ユーザー登録処理',
      value: `ユーザー登録処理のワークフローを実装してください。

まず初めに Lambda を使って、入力内容を検証します。

その次に、入力内容に問題がなければ DynamoDB にその情報を保存します。
最後にメールを送ります。メールは Amaaon SNS を使います。

もし、Lambdaの入力内容の検証に失敗した場合、DynamoDB には情報を保存せず、ユーザにエラーが発生したことをメールで通知します。

DynamoDB や SNS を使用する際には Lambda を使用せず、AWS のネイティブ統合を量してください。
`
    },
    {
      title: 'S3 で CSV を処理する Distributed Map',
      value: `分散マップを使用して、S3 で生成された CSV ファイルの行を反復処理します。
各行には注文と発送情報があります。
分散マップ項目プロセッサは、これらの行のバッチを反復処理し、Lambda 関数を使用して遅延した順序を検出します。
その後、遅延した順序ごとに SQS キューにメッセージを送信します。`
    }
  ]

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

      <div className="grid grid-cols-2 gap-2">
        {/* LEFT */}
        <div className="border h-[80vh] flex flex-col resize-x bg-white rounded-md">
          <div className="border-b p-1">
            <h1 className="text-xs italic">Editor</h1>
          </div>
          <ASLEditor value={editorValue} setValue={setEditorValue} />
        </div>

        {/* RIGHT */}
        <div className="border h-[80vh] flex flex-col resize-x bg-white rounded-md">
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
              {examples.map((e) => {
                return (
                  <button
                    key={e.title}
                    className="cursor-pointer rounded-full border p-2 text-xs hover:border-gray-300 hover:bg-gray-50"
                    onClick={() => {
                      setUserInput(e.value)
                    }}
                  >
                    {e.title}
                  </button>
                )
              })}
            </div>
          </div>

          {/* prompt input form */}
          <textarea
            className={`block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 mt-2`}
            placeholder="What kind of step functions will you create? (Cmd + Enter / Shift + Enter to send message)"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={onkeydown}
            required
            disabled={loading}
            rows={3}
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
