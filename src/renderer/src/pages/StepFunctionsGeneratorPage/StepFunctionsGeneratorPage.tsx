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

const systemPrompt = `You are an AI assistant that generates AWS Step Functions ASL (Amazon States Language). Follow the given sentences and rules to output JSON format ASL.

<rules>
- No explanation is required.
- There is no prefix such as * \`\`\` json.
- Please generate only ASL text
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
      title: 'Order processing workflow',
      value: `Create order processing workflow`
    },
    {
      title: '7 types of State',
      value: `Please implement a workflow that combines the following seven types.

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
      value: `Create Nested Workflow example`
    },
    {
      title: 'User registration process',
      value: `Implement the workflow for user registration processing.

First, use Lambda to verify the input contents.

Next, if there is no problem with the input content, save the information to Dynamodb.
Finally, send an email. The email uses AMAAON SNS.

If Lambda's input content fails, dynamodb will not save information and will notify the user by e -mail.

When using dynamodb or SNS, do not use Lambda and weigh AWS native integration.
`
    },
    {
      title: 'Distributed Map to process CSV in S3',
      value: `Use the distributed map to repeat the row of the CSV file generated in S3.
Each line has orders and shipping information.
The distributed map processor repeats the batch of these rows and uses the Lambda function to detect the delayed order.
After that, send a message to the SQS queue for each delayed order.`
    }
  ]

  return (
    <div className={'flex flex-col h-[calc(100vh-11rem)] overflow-y-auto'}>
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
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            className={`block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 mt-2`}
            placeholder="What kind of step functions will you create?"
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
