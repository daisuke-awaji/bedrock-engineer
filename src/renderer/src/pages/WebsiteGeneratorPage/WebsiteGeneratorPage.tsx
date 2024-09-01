import React, { useEffect, useState } from 'react'
import { Dropdown, ToggleSwitch, Tooltip } from 'flowbite-react'
import { GrClearOption } from 'react-icons/gr'
import { FiDatabase, FiSend } from 'react-icons/fi'
import prompts from '../../prompts/prompts'
import ReactLogo from '../../assets/images/icons/react.svg'
import VueLogo from '../../assets/images/icons/vue.svg'
import VanillaLogo from '../../assets/images/icons/vanilla.svg'
import SvelteLogo from '../../assets/images/icons/svelte.svg'
import { useChat } from '@renderer/hooks/useChat'
import useLLM from '@renderer/hooks/useLLM'
import useAdvancedSetting from '@renderer/hooks/useAdvancedSetting'
import { retrieveAndGenerate } from '@renderer/lib/api'
import { autocompletion, completionKeymap } from '@codemirror/autocomplete'
import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPredefinedTemplate,
  SandpackPreview,
  SandpackProvider,
  useActiveCode,
  useSandpack,
  useSandpackNavigation
} from '@codesandbox/sandpack-react'

import { FiMaximize } from 'react-icons/fi'
import { Loader } from '@renderer/components/Loader'
import { sleep } from '@renderer/lib/util'
import useDataSourceConnectModal from './useDataSourceConnectModal'
import {
  DEFAULT_INDEX_HTML,
  DEFAULT_APP_TSX,
  DEFAULT_APP_VUE,
  DEFAULT_VUE_INDEX_HTML,
  DEFAULT_SVELTE_APP_SVELTE,
  DEFAULT_SVELTE_INDEX_HTML,
  DEFAULT_VANILLA_INDEX_HTML
} from './DEFAULT_CODES'

import { converse } from '../../lib/api'
import { motion } from 'framer-motion'
import LoadingDotsLottie from './LoadingDots.lottie'
import LoadingDataBaseLottie from './LoadingDataBase.lottie'
import LazyVisibleMessage from './LazyVisibleMessage'

type SupportedTemplate = {
  id: SandpackPredefinedTemplate
  name: string
  logo: React.ReactNode
}

const TEMPLATES: SupportedTemplate[] = [
  {
    id: 'react-ts',
    name: 'React',
    logo: <ReactLogo />
  },
  {
    id: 'vue-ts',
    name: 'Vue',
    logo: <VueLogo />
  },
  {
    id: 'svelte',
    name: 'Svelte',
    logo: <SvelteLogo />
  },
  {
    id: 'static',
    name: 'Vanilla',
    logo: <VanillaLogo />
  }
]

const examplePrompts = [
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
const templates = {
  'react-ts': {
    files: {
      '/public/index.html': {
        code: DEFAULT_INDEX_HTML
      },
      'App.tsx': { code: DEFAULT_APP_TSX }
    },
    mainFile: 'App.tsx',
    customSetup: {
      dependencies: {
        recharts: '2.9.0',
        'react-router-dom': 'latest',
        'react-icons': 'latest',
        'date-fns': 'latest',
        '@mui/material': 'latest',
        '@emotion/react': 'latest',
        '@emotion/styled': 'latest',
        '@fontsource/roboto': 'latest',
        '@mui/icons-material': 'latest'
      }
    }
  },
  'vue-ts': {
    files: {
      'src/App.vue': { code: DEFAULT_APP_VUE },
      '/public/index.html': {
        code: DEFAULT_VUE_INDEX_HTML
      }
    },
    mainFile: 'src/App.vue',
    customSetup: {
      dependencies: {
        recharts: '2.9.0',
        'date-fns': 'latest',
        'vue-chartjs': 'latest',
        'chart.js': 'latest',
        'vue-router': 'latest'
      }
    }
  },
  svelte: {
    files: {
      'App.svelte': { code: DEFAULT_SVELTE_APP_SVELTE },
      '/public/index.html': {
        code: DEFAULT_SVELTE_INDEX_HTML
      }
    },
    mainFile: 'App.svelte',
    customSetup: {
      dependencies: {
        d3: 'latest',
        'd3-scale': 'latest',
        'd3-color': 'latest',
        'd3-interpolate': 'latest',
        'd3-fetch': 'latest'
      }
    }
  },
  static: {
    files: {
      'index.html': {
        code: DEFAULT_VANILLA_INDEX_HTML
      }
    },
    mainFile: 'index.html',
    customSetup: {
      dependencies: {}
    }
  }
}

type Style = {
  label: string
  value: string
}

const supportedStyles = {
  'react-ts': [
    {
      label: 'Inline style',
      value: 'inline'
    },
    {
      label: 'Tailwind.css',
      value: 'tailwind'
    },
    {
      label: 'Material UI',
      value: 'mui'
    }
  ],
  'vue-ts': [
    {
      label: 'Inline style',
      value: 'inline'
    },
    {
      label: 'Tailwind.css',
      value: 'tailwind'
    }
  ],
  svelte: [
    {
      label: 'Inline style',
      value: 'inline'
    },
    {
      label: 'Tailwind.css',
      value: 'tailwind'
    }
  ],
  static: [
    {
      label: 'Inline style',
      value: 'inline'
    },
    {
      label: 'Tailwind.css',
      value: 'tailwind'
    }
  ]
}

export default function WebsiteGeneratorPage() {
  const [template, setTemplate] = useState<SupportedTemplate['id']>('react-ts')

  return (
    <SandpackProvider
      template={template}
      files={templates[template].files}
      style={{
        height: 'calc(100vh - 16rem)'
      }}
      options={{
        externalResources: ['https://unpkg.com/@tailwindcss/ui/dist/tailwind-ui.min.css'],
        initMode: 'user-visible',
        recompileMode: 'delayed',
        autorun: true,
        autoReload: true
      }}
      customSetup={{
        dependencies: templates[template].customSetup.dependencies
      }}
    >
      <WebsiteGeneratorPageContents template={template} setTemplate={setTemplate} />
    </SandpackProvider>
  )
}

type WebsiteGeneratorPageContentsProps = {
  template: SupportedTemplate['id']
  setTemplate: (template: SupportedTemplate['id']) => void
}
function WebsiteGeneratorPageContents(props: WebsiteGeneratorPageContentsProps) {
  const { template, setTemplate } = props
  const TemplateButton: React.FC<SupportedTemplate> = (t) => {
    return (
      <button
        type="button"
        className={`
    text-gray-900
    ${template === t.id ? 'bg-green-50' : 'bg-white'}
    hover:bg-green-50
    border
    ${template === t.id ? 'border-green-600' : 'border-gray-200'}
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
          setTemplate(t.id)
          await sleep(100)
          handleRefresh()
        }}
      >
        <div className="w-[18px]">{t.logo}</div>
        <span>{t.name}</span>
      </button>
    )
  }

  const { sandpack } = useSandpack()
  const { runSandpack } = sandpack
  const { updateCode } = useActiveCode()
  const [recommendChanges, setRecommendChanges] = useState(examplePrompts)
  const [recommendLoading, setRecommendLoading] = useState(false)

  const [showCode, setShowCode] = useState(true)
  // const [loadingText, setLoadingText] = useState<string | undefined>()
  const [ragLoading, setRagLoading] = useState<boolean>(false)
  const [userInput, setUserInput] = useState('')
  const { llm } = useLLM()

  const handleClickShowCode = () => {
    setShowCode(!showCode)
  }

  const [styleType, setStyleType] = useState<Style>({
    label: 'Tailwind.css',
    value: 'tailwind'
  })
  const { handleSubmit, messages, loading, lastText, initChat, setLoading } = useChat({
    systemPrompt: prompts.WebsiteGenerator.system[template]({
      styleType: styleType.value
    }),
    modelId: llm.modelId
  })

  const getRecommendChanges = async (websiteCode: string) => {
    let retry = 0
    if (retry > 3) {
      return
    }
    setRecommendLoading(true)
    const result = await converse({
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
      system: [{ text: prompts.WebsiteGenerator.recommend.system }],
      messages: [{ role: 'user', content: [{ text: websiteCode }] }]
    })

    const recommendChanges = result.output.message?.content[0]?.text
    try {
      if (recommendChanges) {
        const json = JSON.parse(recommendChanges)
        console.log({ json })
        setRecommendChanges(json)
        setRecommendLoading(false)
      }
    } catch (e) {
      console.log(e)
      retry += 1
      return getRecommendChanges(websiteCode)
    }
  }

  useEffect(() => {
    if (!loading && messages.length > 0 && lastText) {
      getRecommendChanges(lastText)
    }
  }, [loading, messages])

  const RETRIVE_AND_GEN_MODEL_ARN =
    'arn:aws:bedrock:ap-northeast-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0'
  const ragSubmit = async (input: string, messages) => {
    setLoading(true)

    setRagLoading(true)
    const promptTemplate = prompts.WebsiteGenerator.rag.promptTemplate
    const inputText = `Consider the React component elements required to achieve the following requirements and provide relevant React source code examples.

Examples of React components: button, accordion, breadcrumb list, checkbox, divider, input, error text, label, link, radio button

Requirements: \n`
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

    setRagLoading(false)

    await handleSubmit(
      input +
        '\nCreate website based on the example source code below.\n' +
        '\n!Important: The style should follow the sample code as closely as possible, and exceptions should be avoided wherever possible.\n' +
        '<code>\n' +
        res?.output?.text +
        '</code>\n',
      messages
    )
    setLoading(false)
  }

  const { refresh } = useSandpackNavigation()

  const handleRefresh = async () => {
    refresh()

    const c = templates[template].files[templates[template].mainFile]?.code
    updateCode(c)
    setUserInput('')
    setStyleType({
      label: 'Tailwind.css',
      value: 'tailwind'
    })
    setRecommendChanges(examplePrompts)
    initChat()
    runSandpack()
  }

  useEffect(() => {
    if (messages?.length > 0) {
      updateCode(lastText)
      runSandpack()
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

  const { kbId, DataSourceConnectModal, openModal } = useDataSourceConnectModal()
  const ragEnabled = !!kbId

  return (
    <div className={'flex flex-col h-[calc(100vh-11rem)] overflow-y-auto'}>
      <div className="flex pb-2 justify-between">
        <span className="font-bold flex flex-col gap-2">
          <h1 className="content-center">Website Generator</h1>
          <div className="flex gap-2">
            {TEMPLATES.map((fw) => (
              <TemplateButton {...fw} key={fw.id} />
            ))}
          </div>
        </span>
      </div>

      <DataSourceConnectModal />

      <SandpackLayout
        style={{
          display: 'flex',
          gap: '1rem',
          backgroundColor: 'rgb(243 244 246 / var(--tw-bg-opacity))',
          border: 'none',
          height: '100%',
          zIndex: '0'
        }}
      >
        {showCode && (
          <SandpackCodeEditor
            style={{
              height: '100%',
              borderRadius: '8px',
              overflowX: 'scroll',
              maxWidth: '50vw'
            }}
            showInlineErrors={true}
            showTabs
            showLineNumbers
            showRunButton={true}
            extensions={[autocompletion()]}
            extensionsKeymap={[completionKeymap as any]}
          />
        )}

        {loading ? (
          <div
            className={`flex ${showCode ? 'w-[50%]' : 'w-[100%]'} h-[100%] justify-center items-center content-center align-center`}
          >
            {ragLoading ? (
              <div className="flex flex-col justify-center items-center gap-2">
                <LoadingDataBaseLottie className="w-[6rem]" />
                <span className="text-sm text-gray-400">Connecting datasource...</span>
                <span className="text-xs text-gray-400">
                  <LazyVisibleMessage message="Searching for related source code" />
                </span>
              </div>
            ) : (
              <Loader text={'Generating code...'} />
            )}
          </div>
        ) : (
          <SandpackPreview
            id="sandpack-preview"
            style={{
              height: '100%',
              borderRadius: '8px',
              border: '2px solid white'
            }}
            showRestartButton={true}
            showOpenNewtab={true}
            showSandpackErrorOverlay={true}
            showOpenInCodeSandbox={false}
            showNavigator={true}
            actionsChildren={
              <button
                onClick={() => {
                  const iframe = document.getElementById('sandpack-preview')
                  if (iframe) {
                    iframe?.requestFullscreen()
                  }
                }}
                className="border rounded-full bg-[#EFEFEF] p-2 text-gray-500 hover:text-gray-800"
              >
                <FiMaximize className="text-gray" />
              </button>
            }
          />
        )}
      </SandpackLayout>

      {/* Buttom Input Field Block */}
      <div className="flex gap-2 fixed bottom-0 left-20 right-5 bottom-3">
        <div className="relative w-full">
          <div className="flex gap-2 justify-between">
            <div>
              {recommendLoading ? (
                <LoadingDotsLottie className="h-[2rem]" />
              ) : (
                recommendChanges?.map((a) => {
                  return (
                    <motion.button
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={a.title}
                      className="cursor-pointer rounded-full border p-2 text-xs hover:border-gray-300 hover:bg-gray-50"
                      onClick={() => {
                        setUserInput(a.value)
                      }}
                    >
                      {a.title}
                    </motion.button>
                  )
                })
              )}
            </div>

            <div className="flex gap-3 items-center">
              <button
                onClick={() => openModal()}
                className="flex items-center justify-center p-[2px] overflow-hidden text-xs text-gray-900 rounded-lg group bg-gradient-to-br from-red-200 via-red-300 to-yellow-200 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400"
              >
                <span className="items-center px-3 py-1.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0 flex gap-2">
                  <FiDatabase className="text-sm" />
                  Connect
                </span>
              </button>
              <Dropdown label={styleType.label} dismissOnClick={true} size="xs" color={'indigo'}>
                {supportedStyles[template]?.map((s) => {
                  return (
                    <Dropdown.Item key={s.value} onClick={() => setStyleType(s)}>
                      {s.label}
                    </Dropdown.Item>
                  )
                })}
              </Dropdown>
              <Tooltip content="show code" placement="bottom" animation="duration-500">
                <ToggleSwitch
                  checked={showCode}
                  onChange={handleClickShowCode}
                  // label="show code"
                  color="gray"
                ></ToggleSwitch>
              </Tooltip>

              <Tooltip content="clear" placement="bottom" animation="duration-500">
                <button
                  className="cursor-pointer rounded-md py-1.5 px-2 hover:border-gray-300 hover:bg-gray-50"
                  onClick={handleRefresh}
                >
                  <GrClearOption className="text-xl" />
                </button>
              </Tooltip>
            </div>
          </div>

          {/* prompt input form */}
          <textarea
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            className={`block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 mt-2 z-10`}
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
  )
}
