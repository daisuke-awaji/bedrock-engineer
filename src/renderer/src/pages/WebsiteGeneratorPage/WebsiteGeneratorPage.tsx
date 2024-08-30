import React, { useEffect, useState } from 'react'
import { ToggleSwitch } from 'flowbite-react'
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
import useWebsiteGeneratorSettings from '@renderer/hooks/useWebsiteGeneratorSetting'

import { autocompletion, completionKeymap } from '@codemirror/autocomplete'
import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPredefinedTemplate,
  SandpackPreview,
  SandpackProvider
} from '@codesandbox/sandpack-react'

import { FiMaximize } from 'react-icons/fi'
import { Loader } from '@renderer/components/Loader'
import { sleep } from '@renderer/lib/util'
import useDataSourceConnectModal from './useDataSourceConnectModal'

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

const DEFAULT_VUE_INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <title>codesandbox</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <noscript>
      <strong
        >We're sorry but codesandbox doesn't work properly without JavaScript
        enabled. Please enable it to continue.</strong
      >
    </noscript>
    <div id="app"></div>
    <!-- built files will be auto injected -->
  </body>
</html>
`

const DEFAULT_APP_VUE = `<template>
  <div className="m-2">
    <h1>Hello {{ msg }}</h1>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const msg = ref<string>('world');
</script>
`

const DEFAULT_VANILLA_INDEX_HTML = `<!DOCTYPE html>
<html>

<head>
  <title>Parcel Sandbox</title>
  <meta charset="UTF-8" />
  <link rel="stylesheet" href="/styles.css" />
</head>

<body>
  <h1>Hello world</h1>
</body>

</html>
`

const DEFAULT_SVELTE_INDEX_HTML = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf8" />
    <meta name="viewport" content="width=device-width" />
    <script src="https://cdn.tailwindcss.com"></script>
    <title>Svelte app</title>

    <link rel="stylesheet" href="public/bundle.css" />
  </head>

  <body>
    <script src="bundle.js"></script>
  </body>
</html>`

const DEFAULT_SVELTE_APP_SVELTE = `<style>
  h1 {
    font-size: 1.5rem;
  }
</style>

<script>
  let name = 'world';
</script>

<main>
  <h1>Hello {name}</h1>
</main>
`

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

export default function WebsiteGeneratorPage() {
  const [template, setTemplate] = useState<SupportedTemplate['id']>('react-ts')
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
          handleRefresh()
          await sleep(100)
          setTemplate(t.id)
        }}
      >
        <div className="w-[18px]">{t.logo}</div>
        <span>{t.name}</span>
      </button>
    )
  }

  const [code, setCode] = useState<string | undefined>()
  const [showCode, setShowCode] = useState(true)
  const [loadingText, setLoadingText] = useState<string | undefined>()
  const [userInput, setUserInput] = useState('')
  const { llm } = useLLM()
  const { kbId } = useWebsiteGeneratorSettings()
  const ragEnabled = !!kbId

  const handleClickShowCode = () => {
    setShowCode(!showCode)
  }

  const { handleSubmit, messages, loading, lastText, initChat, setLoading } = useChat({
    systemPrompt: prompts.WebsiteGenerator.system[template],
    modelId: llm.modelId
  })

  const RETRIVE_AND_GEN_MODEL_ARN =
    'arn:aws:bedrock:ap-northeast-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0'
  const ragSubmit = async (input: string, messages) => {
    setLoading(true)

    setLoadingText('Quering datasource...')
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

    setLoadingText('Generating code...')
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

  const { DataSourceConnectModal, openModal } = useDataSourceConnectModal()

  const templates = {
    'react-ts': {
      files: {
        '/public/index.html': {
          code: DEFAULT_INDEX_HTML
        },
        'App.tsx': { code: code || DEFAULT_APP_TSX }
      },
      customSetup: {
        dependencies: {
          recharts: '2.9.0',
          'react-router-dom': 'latest',
          'react-icons': 'latest',
          'date-fns': 'latest'
        }
      }
    },
    'vue-ts': {
      files: {
        'src/App.vue': { code: code || DEFAULT_APP_VUE },
        '/public/index.html': {
          code: DEFAULT_VUE_INDEX_HTML
        }
      },
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
        'App.svelte': { code: code || DEFAULT_SVELTE_APP_SVELTE },
        '/public/index.html': {
          code: DEFAULT_SVELTE_INDEX_HTML
        }
      },
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
      }
    }
  }

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
            height: '100%'
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
              <Loader text={loadingText} />
            </div>
          ) : (
            <SandpackPreview
              id="sandpack-preview"
              style={{
                height: '100%',
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
                {examplePrompts.map((a) => {
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
    </SandpackProvider>
  )
}
