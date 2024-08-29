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
const ReactSandpack: React.FC<SandpackViewerProps> = ({
  code = DEFAULT_APP_TSX,
  showCode = true,
  loading = false
}) => {
  return (
    <SandpackProvider
      template="react-ts"
      files={{
        'App.tsx': { code: code },
        '/public/index.html': {
          code: DEFAULT_INDEX_HTML
        }
      }}
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
        dependencies: {
          recharts: '2.9.0',
          'react-router-dom': 'latest',
          'react-icons': 'latest',
          'date-fns': 'latest'
        }
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

export default ReactSandpack
