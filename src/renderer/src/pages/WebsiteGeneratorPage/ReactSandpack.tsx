import { autocompletion, completionKeymap } from '@codemirror/autocomplete'
import { SandpackCodeEditor, SandpackPreview, SandpackProvider } from '@codesandbox/sandpack-react'

import React from 'react'
import { FiMaximize } from 'react-icons/fi'

type ReactSandpackProps = {
  code?: string
  showCode?: boolean
}

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
const ReactSandpack: React.FC<ReactSandpackProps> = ({ code, showCode = true }) => {
  return (
    <SandpackProvider
      template="react-ts"
      files={{
        'App.tsx': { code: code ?? DEFAULT_APP_TSX },
        '/public/index.html': {
          code: DEFAULT_INDEX_HTML
        }
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
      <div className="flex gap-2">
        {showCode && (
          <SandpackCodeEditor
            style={{
              height: '80vh',
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

        <SandpackPreview
          id="sandpack-preview"
          style={{
            height: '80vh',
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
            >
              <FiMaximize className="text-gray" />
            </button>
          }
        />
      </div>
    </SandpackProvider>
  )
}

export default ReactSandpack
