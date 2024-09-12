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
import useAdvancedSetting from '@renderer/hooks/useAdvancedSetting'
import { useTranslation } from 'react-i18next'

function StepFunctionsGeneratorPage() {
  const {
    t,
    i18n: { language: lng }
  } = useTranslation()

  const systemPrompt = `You are an AI assistant that generates AWS Step Functions ASL (Amazon States Language). Follow the given sentences and rules to output JSON format ASL.

  <rules>
  - No explanation is required.
  - There is no prefix such as * \`\`\` json.
  - Please generate only ASL text
  </rules>

  <language>
  ${lng}
  </language>
  `

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
      handleSubmit(userInput, messages)
    }
  }

  useEffect(() => {
    const wfg = document.getElementsByClassName('workflowgraph')[0]
    wfg.className = 'h-full workflowgraph'
  }, [])

  const examples = [
    {
      title: t('Order processing workflow'),
      value: t('Create order processing workflow')
    },
    {
      title: t('7 types of State'),
      value:
        t('Please implement a workflow that combines the following seven types') +
        `

- Task
- Wait
- Pass
- Succeed
- Fail
- Choice
- Parallel`
    },
    {
      title: t('Nested Workflow'),
      value: t('Create Nested Workflow example')
    },
    {
      title: t('User registration process'),
      value: t('Implement the workflow for user registration processing')
    },
    {
      title: t('Distributed Map to process CSV in S3'),
      value: t('Use the distributed map to repeat the row of the CSV file generated in S3')
    }
  ]

  return (
    <div className={'flex flex-col h-[calc(100vh-11rem)] overflow-y-auto z-10'}>
      <div className="flex pb-2 justify-between">
        <span className="font-bold flex gap-2">
          <div className="content-center">
            <StepFunctionLogo />
          </div>
          <h1 className="content-center dark:text-white">AWS Step Functions Generator</h1>
        </span>
        <button className="hover:bg-gray-100 p-3 rounded-full">
          <BsGear />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* LEFT */}
        <div className="border h-[80vh] flex flex-col resize-x bg-white rounded-md dark:bg-gray-800 dark:border-black">
          <div className="border-b p-1">
            <h1 className="text-xs italic dark:text-gray-200">Editor</h1>
          </div>
          <ASLEditor value={editorValue} setValue={setEditorValue} />
        </div>

        {/* RIGHT */}
        <div className="border h-[80vh] flex flex-col resize-x bg-white rounded-md dark:bg-gray-800 dark:border-black">
          <div className="border-b p-1 flex justify-between">
            <h1 className="text-xs italic dark:text-gray-200">Visualizer</h1>
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
                    className="cursor-pointer rounded-full border p-2 text-xs hover:border-gray-300 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700 "
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
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            className={`block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 mt-2 dark:text-white dark:bg-gray-800`}
            placeholder={t('What kind of step functions will you create?')}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={onkeydown}
            required
            disabled={loading}
            rows={3}
          />
          <button
            onClick={() => handleSubmit(userInput, messages)}
            className="absolute end-2.5 bottom-2.5 rounded-lg hover:bg-gray-200 px-2 py-2 dark:hover:bg-gray-700 dark:text-white"
          >
            <FiSend className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default StepFunctionsGeneratorPage
