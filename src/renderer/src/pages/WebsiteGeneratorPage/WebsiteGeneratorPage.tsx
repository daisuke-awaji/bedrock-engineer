import React, { useEffect, useState } from 'react'
import { ToggleSwitch } from 'flowbite-react'
import { FiCpu, FiDatabase, FiSend } from 'react-icons/fi'
import prompts from '../../prompts/prompts'
import ReactLogo from '../../assets/images/icons/react.svg'
import VueLogo from '../../assets/images/icons/vue.svg'
import VanillaLogo from '../../assets/images/icons/vanilla.svg'
import SvelteLogo from '../../assets/images/icons/svelte.svg'
import { useChat } from '@renderer/hooks/useChat'
import ReactSandpack from './Sandpack/ReactSandpack'
import VueSandpack from './Sandpack/VueSandpack'
import VanillaSandpack from './Sandpack/VanillaSandpack'
import useLLM from '@renderer/hooks/useLLM'
import SvelteSandpack from './Sandpack/SvelteSandpack'
import useAdvancedSetting from '@renderer/hooks/useAdvancedSetting'
import { retrieveAndGenerate } from '@renderer/lib/api'
import useModal from '../../hooks/useModal'
import useWebsiteGeneratorSettings from '@renderer/hooks/useWebsiteGeneratorSetting'

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
  },
  {
    id: 'svelte',
    name: 'Svelte',
    logo: <SvelteLogo />
  },
  {
    id: 'vanilla',
    name: 'Vanilla',
    logo: <VanillaLogo />
  }
]

export default function WebsiteGeneratorPage() {
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
  const { kbId, setKnowledgeBaseId } = useWebsiteGeneratorSettings()
  const ragEnabled = !!kbId

  const handleClickShowCode = () => {
    setShowCode(!showCode)
  }

  const { handleSubmit, messages, loading, lastText, initChat, setLoading } = useChat({
    systemPrompt: prompts.WebsiteGenerator.system[selectedFw],
    modelId: llm.modelId
  })

  const RETRIVE_AND_GEN_MODEL_ARN =
    'arn:aws:bedrock:ap-northeast-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0'
  const ragSubmit = async (input: string, messages) => {
    setLoading(true)

    const promptTemplate = prompts.WebsiteGenerator.rag.promptTemplate
    const inputText =
      'Please provide a sample of React source code that is relevant to the following instructions.\n' +
      userInput

    const res = await retrieveAndGenerate({
      input: {
        text: inputText
      },
      retrieveAndGenerateConfiguration: {
        type: 'KNOWLEDGE_BASE',
        knowledgeBaseConfiguration: {
          knowledgeBaseId: kbId,
          modelArn: RETRIVE_AND_GEN_MODEL_ARN,
          generationConfiguration: {
            promptTemplate: {
              textPromptTemplate: promptTemplate
            }
          },
          retrievalConfiguration: {
            vectorSearchConfiguration: {
              numberOfResults: 5
            }
          }
        }
      }
    })

    console.log(res?.output?.text)

    await handleSubmit(
      input +
        '\nCreate website based on the example source code below.\n' +
        '<code>\n' +
        res?.output?.text +
        '</code>\n',
      messages
    )
    setLoading(false)
  }

  const handleRefresh = () => {
    setCode(undefined)
    setUserInput('')
    initChat()
  }

  useEffect(() => {
    if (messages?.length > 0) {
      setCode(lastText)
    }
  }, [lastText])

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
      ragEnabled ? ragSubmit(userInput, messages) : handleSubmit(userInput, messages)
    }
  }

  const { Modal, openModal } = useModal()

  const examples = [
    {
      title: 'E-commerce site for plants',
      value: `Create the basic structure and layout of an e-commerce website that specializes in potted plants, with the following conditions:
<Conditions>
- The layout likes Amazon.com.
- The name of the e-commerce website is "Green Village".
- Use a green color theme.
</Conditions>
Following the previous output, add a section that displays the plants in card format.
Following the previous output, create a function to add to the shopping cart.
Following the previous output, create a function to check what is currently in the shopping cart and calculate the total amount.`
    },
    {
      title: 'Health and fitness site',
      value: `Create the basic structure and layout of a health and fitness website, with the following conditions:
<Conditions>
- The layout likes Amazon.com.
- The name of the website is "FitLife".
- Use a red color theme.
</Conditions>
Following the previous output, add a section that displays the health and fitness blogs.
Following the previous output, create a function to search for health and fitness content based on keywords.
Following the previous output, create a function to add comments to the blog.`
    },
    {
      title: 'Drawing a graph',
      value: `Please visualize the following as a graph on your website.

Purchase data CSV file
customer_id,product_id,purchase_date,purchase_amount
C001,P001,2023-04-01,50.00
C002,P002,2023-04-02,75.00
C003,P003,2023-04-03,100.00
C001,P002,2023-04-04,60.00
C002,P001, 2023-04-05,40.00
C003,P003,2023-04-06,90.00
C001,P001,2023-04-07,30.00
C002,P002,2023-04-08,80.00
C003,P001,2023-04-09,45.00
C001,P003,2023-04-10,120.00

This CSV file contains the following information:

- 'customer_id': Customer ID
- 'product_id': Product ID
- 'purchase_date': Purchase date
- 'purchase_amount': Purchase amount`
    },
    {
      title: 'To-do app',
      value: `Create a simple to-do app website`
    }
  ]

  return (
    <React.Fragment>
      <div className={'flex flex-col h-[calc(100vh-11rem)] overflow-y-auto'}>
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

        <Modal header="Connect Datasource">
          <div className="flex flex-col gap-3">
            <p className="text-gray-700 text-sm pb-2">
              Currently, only support Knowledge base for Amazon Bedrock. <br />
              In advance, store the source code of your design system or existing github projects in
              the knowledge base. If you do not want to connect, leave the field blank.
            </p>
            <div className="grid grid-cols-3 items-center justify-center">
              <label className="flex items-center gap-2 block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                <FiDatabase className="text-lg" />
                Knowledge base ID
              </label>
              <input
                type="string"
                className="col-span-2 bg-white-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="12345ABCDE"
                defaultValue={kbId}
                onChange={(e) => setKnowledgeBaseId(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-3 items-center justify-center">
              <label className="flex items-center gap-2 block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                <FiCpu className="text-lg" />
                Model arn
              </label>
              <div className="col-span-2 flex flex-col">
                <input
                  type="string"
                  className="bg-white-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="12345ABCDE"
                  defaultValue={RETRIVE_AND_GEN_MODEL_ARN}
                  onChange={(e) => setKnowledgeBaseId(e.target.value)}
                  disabled
                />
                <span className="text-gray-500 text-xs pt-0.5">Currently, it is a fixed value</span>
              </div>
            </div>
          </div>
        </Modal>

        {selectedFw === 'react' ? (
          <ReactSandpack code={code} showCode={showCode} loading={loading} />
        ) : selectedFw === 'vue' ? (
          <VueSandpack code={code} showCode={showCode} loading={loading} />
        ) : selectedFw === 'svelte' ? (
          <SvelteSandpack code={code} showCode={showCode} loading={loading} />
        ) : (
          <VanillaSandpack code={code} showCode={showCode} loading={loading} />
        )}

        {/* Buttom Input Field Block */}
        <div className="flex gap-2 fixed bottom-0 left-20 right-5 bottom-3">
          <div className="relative w-full">
            <div className="flex gap-2 justify-between">
              <div>
                {examples.map((a) => {
                  return (
                    <button
                      key={a.title}
                      className="cursor-pointer rounded-full border p-2 text-xs hover:border-gray-300 hover:bg-gray-50"
                      onClick={() => {
                        setUserInput(a.value)
                      }}
                    >
                      {a.title}
                    </button>
                  )
                })}
              </div>

              <div className="flex gap-2 items-center">
                <button
                  onClick={() => openModal()}
                  className="flex items-center justify-center p-0.5 me-2 overflow-hidden text-xs text-gray-900 rounded-lg group bg-gradient-to-br from-red-200 via-red-300 to-yellow-200 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400"
                >
                  <span className="items-center px-3 py-1.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0 flex gap-2">
                    <FiDatabase className="text-sm" />
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
            <textarea
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              className={`block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 mt-2`}
              placeholder="What kind of website will you create?"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={onkeydown}
              required
              disabled={loading}
              rows={3}
            />
            <button
              onClick={() =>
                ragEnabled ? ragSubmit(userInput, messages) : handleSubmit(userInput, messages)
              }
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
