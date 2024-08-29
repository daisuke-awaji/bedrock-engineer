import { autocompletion, completionKeymap } from '@codemirror/autocomplete'
import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider
} from '@codesandbox/sandpack-react'

import React from 'react'
import { FiMaximize } from 'react-icons/fi'
import { SandpackViewerProps } from './Sandpack'
import { Loader } from '@renderer/components/Loader'

const DEFAULT_INDEX_HTML = `<!DOCTYPE html>
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

const VanillaSandpack: React.FC<SandpackViewerProps> = ({
  code = DEFAULT_INDEX_HTML,
  showCode = true,
  loading = false
}) => {
  return (
    <SandpackProvider
      template="static"
      files={{
        'index.html': { code: code }
      }}
      style={{
        height: 'calc(100vh - 16rem)'
      }}
      options={{
        externalResources: ['https://unpkg.com/@tailwindcss/ui/dist/tailwind-ui.min.css'],
        initMode: 'user-visible',
        recompileMode: 'delayed',
        autorun: true,
        autoReload: true,
        activeFile: 'index.html'
      }}
    >
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
          <div className="flex w-[50%] h-[100%] justify-center items-center content-center align-center">
            <Loader />
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
    </SandpackProvider>
  )
}

export default VanillaSandpack
