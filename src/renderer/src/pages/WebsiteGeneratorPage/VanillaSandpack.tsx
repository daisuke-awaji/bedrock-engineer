import { autocompletion, completionKeymap } from '@codemirror/autocomplete'
import { SandpackCodeEditor, SandpackPreview, SandpackProvider } from '@codesandbox/sandpack-react'

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
    <div id="app"></div>
  </body>
</html>
`

const VanillaSandpack: React.FC<SandpackViewerProps> = ({
  code,
  showCode = true,
  loading = false
}) => {
  return (
    <SandpackProvider
      template="vanilla"
      files={{
        'index.html': { code: code ?? DEFAULT_INDEX_HTML }
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

        {loading ? (
          <div className="flex w-full h-[80vh] justify-center items-center content-center align-center">
            <Loader />
          </div>
        ) : (
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
        )}
      </div>
    </SandpackProvider>
  )
}

export default VanillaSandpack
