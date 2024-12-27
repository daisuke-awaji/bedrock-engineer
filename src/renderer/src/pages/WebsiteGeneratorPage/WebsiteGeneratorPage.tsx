import React, { useCallback, useEffect, useState } from 'react'
import { Dropdown, ToggleSwitch, Tooltip } from 'flowbite-react'
import { GrClearOption } from 'react-icons/gr'
import { FiSend } from 'react-icons/fi'
import { BsDatabaseCheck, BsDatabase } from 'react-icons/bs'
import prompts from '../../prompts/prompts'
import { AiOutlineReload } from 'react-icons/ai'

import { useChat } from '@renderer/hooks/useChat'
import { retrieveAndGenerate } from '@renderer/lib/api'
import { autocompletion, completionKeymap } from '@codemirror/autocomplete'
import {
  SandpackCodeEditor,
  SandpackLayout,
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

import { converse } from '../../lib/api'
import { motion } from 'framer-motion'
import LoadingDotsLottie from './LoadingDots.lottie'
import LoadingDataBaseLottie from './LoadingDataBase.lottie'
import LazyVisibleMessage from './LazyVisibleMessage'
import { Style, SupportedTemplate, templates, TEMPLATES, supportedStyles } from './templates'
import { useTranslation } from 'react-i18next'
import useSetting from '@renderer/hooks/useSetting'
import toast from 'react-hot-toast'
import useModal from '@renderer/hooks/useModal'
import MD from '@renderer/components/Markdown/MD'

export default function WebsiteGeneratorPage() {
  const [template, setTemplate] = useState<SupportedTemplate['id']>('react-ts')

  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  return (
    <SandpackProvider
      template={template}
      theme={isDark ? 'dark' : 'light'}
      files={templates[template].files}
      style={{
        height: 'calc(100vh - 16rem)'
      }}
      options={{
        externalResources: ['https://unpkg.com/@tailwindcss/ui/dist/tailwind-ui.min.css'],
        initMode: 'user-visible',
        recompileMode: 'delayed',
        autorun: true,
        autoReload: false
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
    dark:bg-gray-800
    dark:text-white
    dark:border-gray-600
    dark:hover:bg-gray-700
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
  const {
    t,
    i18n: { language }
  } = useTranslation()
  const examplePrompts = [
    {
      title: t('ecSiteTitle'),
      value: t('ecSiteValue')
    },
    {
      title: t('ecSiteAdminTitle'),
      value: t('ecSiteAdminValue')
    },
    {
      title: t('healthFitnessSiteTitle'),
      value: t('healthFitnessSiteValue')
    },
    {
      title: t('drawingGraphTitle'),
      value: t('drawingGraphValue')
    },
    {
      title: t('todoAppTitle'),
      value: t('todoAppValue')
    },
    {
      title: t('codeTransformTitle'),
      value: t('codeTransformValue')
    }
  ]
  const [recommendChanges, setRecommendChanges] = useState(examplePrompts)
  const [recommendLoading, setRecommendLoading] = useState(false)

  const [showCode, setShowCode] = useState(true)
  const [ragLoading, setRagLoading] = useState<boolean>(false)
  const [userInput, setUserInput] = useState('')
  const { currentLLM: llm, sendMsgKey } = useSetting()

  const handleClickShowCode = () => {
    setShowCode(!showCode)
  }

  const [styleType, setStyleType] = useState<Style>({
    label: 'Tailwind.css',
    value: 'tailwind'
  })
  const systemPrompt = prompts.WebsiteGenerator.system[template]({
    styleType: styleType.value,
    libraries: Object.keys(templates[template].customSetup.dependencies)
  })
  const { handleSubmit, messages, loading, lastText, initChat, setLoading } = useChat({
    systemPrompt,
    modelId: llm.modelId
  })

  const getRecommendChanges = async (websiteCode: string) => {
    let retry = 0
    if (retry > 3) {
      return
    }
    setRecommendLoading(true)
    const result = await converse({
      modelId: llm.modelId,
      system: [{ text: t(prompts.WebsiteGenerator.recommend.system, { language }) }],
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

  const { kbId, DataSourceConnectModal, openModal, enableKnowledgeBase, modelId } =
    useDataSourceConnectModal()
  const { awsRegion } = useSetting()
  const ragEnabled = !!kbId && enableKnowledgeBase

  const ragSubmit = useCallback(
    async (input: string, messages) => {
      setLoading(true)

      setRagLoading(true)

      const promptTemplate = prompts.WebsiteGenerator.rag.promptTemplate
      const inputText = `Follow these instructions to create a website that conforms to the requirements described in <website-requirements>.

Please provide examples of the React source code needed to create the components that achieve these requirements.
If the data source contains programs written in a language other than React, please extract the source code equivalent for the web styles.

<website-requirements>
${input}
</website-requirements>
`

      try {
        // Knowledge base から関連コードの取得
        const res = await retrieveAndGenerate({
          input: {
            text: inputText
          },
          retrieveAndGenerateConfiguration: {
            type: 'KNOWLEDGE_BASE',
            knowledgeBaseConfiguration: {
              knowledgeBaseId: kbId,
              modelArn: `arn:aws:bedrock:${awsRegion}::foundation-model/${modelId}`,
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

        const response = await res.json()
        if (res.status !== 200) {
          toast.error(response.message)
          return
        }

        console.log(response?.output?.text)

        setRagLoading(false)

        const prompt = `Create a website based on the sample source code below.
Important: The style should follow the sample code as closely as possible. Even if the system prompts you about the style you should use, the style in the sample code should be your first priority. If there is a designated design system, use it.

<code>
${response?.output.text}
</code>

<website-requirements>
${input}
</website-requirements>

<language>
${language}
</language>

!Important rule: Do not import modules with relative paths (e.g. import { Button } from './Button';) If you have required components, put them all in the same file.
`
        await handleSubmit(prompt, messages)
      } catch (error) {
        console.log(error)
      }

      setLoading(false)
    },
    [kbId, language]
  )

  const { refresh } = useSandpackNavigation()

  const handleRefresh = useCallback(async () => {
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
  }, [template, updateCode, initChat, runSandpack])

  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (messages?.length > 0) {
      updateCode(lastText)
      if (!loading) {
        console.log('runSandpack')
        runSandpack()
        setVersion(messages.length)
      }
    }
  }, [loading, lastText])

  const [isComposing, setIsComposing] = useState(false)

  const onkeydown = useCallback(
    (e) => {
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
    },
    [isComposing, sendMsgKey, ragEnabled, userInput, messages]
  )

  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  const Preview = useCallback(
    () => (
      <SandpackPreview
        id="sandpack-preview"
        style={{
          height: '100%',
          borderRadius: '8px',
          border: isDark ? '2px solid black' : '2px solid white'
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
    ),
    [version]
  )

  const { Modal: SystemPromptModal, openModal: openSystemPromptModal } = useModal()

  return (
    <div className={'flex flex-col h-[calc(100vh-11rem)] overflow-y-auto'}>
      <SystemPromptModal header="SYSTEM PROMPT" size="7xl">
        <MD>{systemPrompt}</MD>
      </SystemPromptModal>
      <div className="flex pb-2 justify-between">
        <span className="font-bold flex flex-col gap-2 w-full">
          <div className="flex justify-between">
            <h1 className="content-center">Website Generator</h1>
            <span
              className="text-xs text-gray-400 font-thin cursor-pointer hover:text-gray-700"
              onClick={openSystemPromptModal}
            >
              SYSTEM_PROMPT
            </span>
          </div>
          <div className="flex justify-between w-full">
            <div className="flex gap-2">
              {TEMPLATES.map((fw) => (
                <TemplateButton {...fw} key={fw.id} />
              ))}
              <div className="ml-8 flex gap-2 items-center max-w-[30%] overflow-x-auto">
                {messages.map((m, index) => {
                  if (index % 2 == 0) {
                    return (
                      <motion.span
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        key={index}
                        className="p-2 bg-gray-200 rounded text-gray-500 cursor-pointer hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
                        onClick={async () => {
                          const code = messages[index + 1]?.content[0].text
                          if (code) {
                            setVersion(index + 1)
                            updateCode(code, true)
                            runSandpack()
                          }
                        }}
                      >
                        <Tooltip
                          content={m.content[0].text}
                          placement="bottom"
                          animation="duration-500"
                        >
                          v{index / 2 + 1}
                        </Tooltip>
                      </motion.span>
                    )
                  }
                  return null
                })}
              </div>
            </div>

            <Tooltip content="re:run" placement="bottom" animation="duration-500">
              <button
                className="cursor-pointer rounded-md py-1.5 px-2 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={runSandpack}
              >
                <AiOutlineReload className="text-xl" />
              </button>
            </Tooltip>
          </div>
        </span>
      </div>

      <DataSourceConnectModal />

      <SandpackLayout
        style={{
          display: 'flex',
          gap: '1rem',
          backgroundColor: isDark
            ? 'rgb(17 24 39 / var(--tw-bg-opacity))'
            : 'rgb(243 244 246 / var(--tw-bg-opacity))',
          border: 'none',
          height: '100%',
          zIndex: '0'
        }}
      >
        {showCode && (
          <SandpackCodeEditor
            style={{
              height: '100%',
              borderRadius: '0px 8px 8px 0px',
              overflowX: 'scroll',
              maxWidth: '50vw',
              gridColumn: '2 / 4'
            }}
            showInlineErrors={true}
            showTabs={true}
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
          <Preview />
        )}
      </SandpackLayout>

      {/* Buttom Input Field Block */}
      <div className="flex gap-2 fixed bottom-0 left-20 right-5 bottom-3 z-10">
        <div className="relative w-full">
          <div className="flex gap-2 justify-between">
            <div>
              {recommendLoading ? (
                <div className="flex gap-1 justify-center items-center dark:text-white">
                  <LoadingDotsLottie className="h-[2rem]" />
                  <span className="dark:text-white">{t('addRecommend')}</span>
                </div>
              ) : (
                recommendChanges?.map((a, index) => {
                  return (
                    <motion.button
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.2 }}
                      key={a.title}
                      className="cursor-pointer rounded-full border p-2 text-xs hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 dark:hover:border-gray-600"
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
                  {enableKnowledgeBase ? (
                    <BsDatabaseCheck className="text-sm" />
                  ) : (
                    <BsDatabase className="text-sm" />
                  )}
                  {enableKnowledgeBase ? 'Connected' : 'Connect'}
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
                  color="gray"
                ></ToggleSwitch>
              </Tooltip>

              <Tooltip content="clear" placement="bottom" animation="duration-500">
                <button
                  className="cursor-pointer rounded-md py-1.5 px-2 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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
            className={`block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 mt-2 dark:text-white dark:bg-gray-800 z-9`}
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
            className={`absolute end-2.5 bottom-2.5 rounded-lg hover:bg-gray-200 px-2 py-2 dark:text-white dark:hover:bg-gray-700`}
            disabled={loading}
          >
            <FiSend className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  )
}
